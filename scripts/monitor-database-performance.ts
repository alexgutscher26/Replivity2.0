#!/usr/bin/env tsx

/**
 * Database Performance Monitoring Script
 * 
 * This script provides comprehensive database performance monitoring
 * and optimization recommendations.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { writeFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

// Load environment variables
config({ path: join(process.cwd(), ".env.local") });
config({ path: join(process.cwd(), ".env") });

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

interface PerformanceReport {
  timestamp: string;
  indexUsage: any[];
  tableSizes: any[];
  slowQueries: any[];
  unusedIndexes: any[];
  recommendations: string[];
}

/**
 * Generate a comprehensive database performance report.
 *
 * This function analyzes index usage, table sizes, and slow queries, and identifies unused indexes in the database.
 * It compiles the results into a PerformanceReport object, which includes recommendations for optimization.
 * If any errors occur during the analysis, they are logged, and the error is thrown to the caller.
 *
 * @returns A Promise that resolves to a PerformanceReport object containing the analysis results.
 * @throws Error If an error occurs during the report generation process.
 */
async function generatePerformanceReport(): Promise<PerformanceReport> {
  console.log("📊 Generating comprehensive database performance report...\n");

  const report: PerformanceReport = {
    timestamp: new Date().toISOString(),
    indexUsage: [],
    tableSizes: [],
    slowQueries: [],
    unusedIndexes: [],
    recommendations: []
  };

  try {
    // 1. Index Usage Analysis
    console.log("🔍 Analyzing index usage...");
    const indexUsage = await sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch,
        pg_relation_size(indexrelid) as index_size,
        CASE 
          WHEN idx_scan = 0 THEN 'UNUSED'
          WHEN idx_scan < 100 THEN 'LOW_USAGE'
          WHEN idx_scan < 1000 THEN 'MEDIUM_USAGE'
          ELSE 'HIGH_USAGE'
        END as usage_level
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      ORDER BY idx_scan DESC;
    `;
    report.indexUsage = indexUsage;

    // 2. Table Size Analysis
    console.log("📏 Analyzing table sizes...");
    const tableSizes = await sql`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes,
        pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    `;
    report.tableSizes = tableSizes;

    // 3. Slow Query Analysis
    console.log("🐌 Analyzing slow queries...");
    try {
      const slowQueries = await sql`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          rows,
          100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent,
          shared_blks_hit,
          shared_blks_read
        FROM pg_stat_statements
        WHERE mean_time > 50
        ORDER BY mean_time DESC
        LIMIT 20;
      `;
      report.slowQueries = slowQueries;
    } catch (error) {
      console.log("ℹ️  pg_stat_statements extension not available - skipping slow query analysis");
    }

    // 4. Unused Index Analysis
    console.log("⚠️  Identifying unused indexes...");
    const unusedIndexes = await sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        pg_relation_size(indexrelid) as index_size,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size_pretty
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public' 
        AND idx_scan = 0
        AND indexname NOT LIKE '%_pkey'
        AND indexname NOT LIKE '%_unique'
      ORDER BY pg_relation_size(indexrelid) DESC;
    `;
    report.unusedIndexes = unusedIndexes;

    // 5. Generate Recommendations
    console.log("💡 Generating optimization recommendations...");
    report.recommendations = generateRecommendations(report);

    return report;

  } catch (error) {
    console.error("❌ Error generating performance report:", error);
    throw error;
  }
}

/**
 * Generate performance recommendations based on a performance report.
 *
 * This function analyzes various aspects of the performance report, including unused indexes, slow queries,
 * table sizes, and index usage patterns. It compiles a list of recommendations aimed at optimizing database
 * performance, such as dropping unused indexes, optimizing slow queries, and adding indexes for frequently
 * queried columns.
 *
 * @param report - A PerformanceReport object containing data on unused indexes, slow queries, table sizes,
 *                 and index usage patterns.
 * @returns An array of strings containing performance improvement recommendations.
 */
function generateRecommendations(report: PerformanceReport): string[] {
  const recommendations: string[] = [];

  // Analyze unused indexes
  const totalUnusedIndexSize = report.unusedIndexes.reduce((sum, idx) => sum + (idx.index_size || 0), 0);
  if (totalUnusedIndexSize > 0) {
    recommendations.push(
      `Consider dropping ${report.unusedIndexes.length} unused indexes to save ${(totalUnusedIndexSize / 1024 / 1024).toFixed(2)} MB of storage space`
    );
  }

  // Analyze slow queries
  if (report.slowQueries.length > 0) {
    const avgSlowQueryTime = report.slowQueries.reduce((sum, q) => sum + (q.mean_time || 0), 0) / report.slowQueries.length;
    recommendations.push(
      `Found ${report.slowQueries.length} slow queries with average execution time of ${avgSlowQueryTime.toFixed(2)}ms. Consider adding indexes or optimizing queries.`
    );
  }

  // Analyze table sizes
  const largestTable = report.tableSizes[0];
  if (largestTable && largestTable.size_bytes > 100 * 1024 * 1024) { // 100MB
    recommendations.push(
      `Table '${largestTable.tablename}' is ${largestTable.size} and may benefit from partitioning or archiving old data`
    );
  }

  // Analyze index usage patterns
  const lowUsageIndexes = report.indexUsage.filter(idx => idx.usage_level === 'LOW_USAGE' && idx.idx_scan > 0);
  if (lowUsageIndexes.length > 0) {
    recommendations.push(
      `Found ${lowUsageIndexes.length} indexes with low usage. Consider reviewing if they're still needed.`
    );
  }

  // Check for missing indexes on frequently queried columns
  const frequentlyScannedTables = report.indexUsage
    .filter(idx => idx.idx_scan > 1000)
    .reduce((acc, idx) => {
      if (!acc[idx.tablename]) acc[idx.tablename] = 0;
      acc[idx.tablename] += idx.idx_scan;
      return acc;
    }, {} as Record<string, number>);

  if (Object.keys(frequentlyScannedTables).length > 0) {
    recommendations.push(
      `Tables with high scan activity: ${Object.entries(frequentlyScannedTables)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([table, scans]) => `${table} (${scans} scans)`)
        .join(', ')}. Consider adding covering indexes.`
    );
  }

  return recommendations;
}

/**
 * Print a detailed performance report for database indexes and queries.
 *
 * This function generates a comprehensive report that includes index usage statistics,
 * the top 10 most used indexes, unused indexes, table sizes, slow queries, and optimization
 * recommendations. It formats the output for readability and provides visual indicators for
 * index usage levels. The report is derived from the provided PerformanceReport object.
 *
 * @param report - The PerformanceReport object containing data for the report.
 */
function printReport(report: PerformanceReport) {
  console.log("\n" + "=".repeat(80));
  console.log("📊 DATABASE PERFORMANCE REPORT");
  console.log("=".repeat(80));
  console.log(`📅 Generated: ${new Date(report.timestamp).toLocaleString()}`);
  console.log("");

  // Index Usage Summary
  console.log("📈 INDEX USAGE SUMMARY");
  console.log("─".repeat(50));
  const usageStats = report.indexUsage.reduce((acc, idx) => {
    acc[idx.usage_level] = (acc[idx.usage_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(usageStats).forEach(([level, count]) => {
    const emoji = level === 'HIGH_USAGE' ? '🔥' : level === 'MEDIUM_USAGE' ? '⚡' : level === 'LOW_USAGE' ? '🐌' : '❌';
    console.log(`${emoji} ${level}: ${count} indexes`);
  });

  // Top 10 Most Used Indexes
  console.log("\n🏆 TOP 10 MOST USED INDEXES");
  console.log("─".repeat(80));
  console.log("Table Name".padEnd(20) + "Index Name".padEnd(30) + "Scans".padEnd(10) + "Size".padEnd(10) + "Usage");
  console.log("─".repeat(80));
  
  report.indexUsage.slice(0, 10).forEach((row: any) => {
    const tableName = (row.tablename || "").substring(0, 19);
    const indexName = (row.indexname || "").substring(0, 29);
    const scans = (row.idx_scan || 0).toString().padEnd(9);
    const size = (row.index_size ? (row.index_size / 1024).toFixed(1) + 'KB' : 'N/A').padEnd(9);
    const usage = (row.usage_level || "UNKNOWN").padEnd(10);
    
    console.log(`${tableName.padEnd(20)}${indexName.padEnd(30)}${scans}${size}${usage}`);
  });

  // Unused Indexes
  if (report.unusedIndexes.length > 0) {
    console.log(`\n⚠️  UNUSED INDEXES (${report.unusedIndexes.length} total)`);
    console.log("─".repeat(60));
    console.log("Table Name".padEnd(20) + "Index Name".padEnd(30) + "Size");
    console.log("─".repeat(60));
    
    report.unusedIndexes.forEach((row: any) => {
      const tableName = (row.tablename || "").substring(0, 19);
      const indexName = (row.indexname || "").substring(0, 29);
      const size = row.index_size_pretty || 'Unknown';
      
      console.log(`${tableName.padEnd(20)}${indexName.padEnd(30)}${size}`);
    });
  }

  // Table Sizes
  console.log("\n📏 TABLE SIZES");
  console.log("─".repeat(70));
  console.log("Table Name".padEnd(25) + "Total Size".padEnd(15) + "Table Size".padEnd(15) + "Index Size");
  console.log("─".repeat(70));
  
  report.tableSizes.slice(0, 10).forEach((row: any) => {
    const tableName = (row.tablename || "").substring(0, 24);
    const totalSize = (row.size || "Unknown").padEnd(14);
    const tableSize = (row.table_size || "Unknown").padEnd(14);
    const indexSize = row.index_size || "Unknown";
    
    console.log(`${tableName.padEnd(25)}${totalSize}${tableSize}${indexSize}`);
  });

  // Slow Queries
  if (report.slowQueries.length > 0) {
    console.log("\n🐌 SLOW QUERIES");
    console.log("─".repeat(80));
    report.slowQueries.slice(0, 5).forEach((row: any, index: number) => {
      console.log(`${index + 1}. Mean time: ${row.mean_time?.toFixed(2)}ms, Calls: ${row.calls}, Hit%: ${row.hit_percent?.toFixed(2)}%`);
      console.log(`   Query: ${(row.query || "").substring(0, 100)}...`);
      console.log("");
    });
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    console.log("\n💡 OPTIMIZATION RECOMMENDATIONS");
    console.log("─".repeat(50));
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }

  console.log("\n" + "=".repeat(80));
}

/**
 * Saves a performance report to a JSON file in the reports directory.
 */
async function saveReport(report: PerformanceReport) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `database-performance-report-${timestamp}.json`;
  const filepath = join(process.cwd(), 'reports', filename);
  
  // Create reports directory if it doesn't exist
  const fs = await import('fs');
  const reportsDir = join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  writeFileSync(filepath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Report saved to: ${filepath}`);
}

/**
 * Executes the main performance monitoring workflow.
 *
 * This function generates a performance report by calling `generatePerformanceReport`,
 * prints the report using `printReport`, and saves it with `saveReport`. It handles
 * any errors that may occur during these operations and ensures that the SQL connection
 * is closed in the `finally` block.
 */
async function main() {
  try {
    const report = await generatePerformanceReport();
    printReport(report);
    await saveReport(report);
    
    console.log("\n🎉 Performance monitoring completed successfully!");
    
  } catch (error) {
    console.error("❌ Performance monitoring failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generatePerformanceReport, printReport, saveReport };
