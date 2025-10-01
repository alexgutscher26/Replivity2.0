#!/usr/bin/env tsx
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Database Optimization Script
 * 
 * This script runs the enhanced database optimization migration
 * and provides performance monitoring and testing capabilities.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

// Load environment variables
config({ path: join(process.cwd(), ".env") });

// Debug environment loading
console.log("🔍 Checking environment variables...");
console.log("📁 Current working directory:", process.cwd());
console.log("📄 Looking for .env files...");

// Check if .env.local exists
const fs = await import('fs');
const envPath = join(process.cwd(), ".env");

if (fs.existsSync(envPath)) {
  console.log("✅ Found .env file");
} else {
  console.log("❌ .env file not found");
}

// Database connection
const connectionString = process.env.DATABASE_URL;
console.log("🔗 DATABASE_URL found:", connectionString ? "Yes" : "No");

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is required");
  console.error("💡 Make sure your .env.local or .env file contains DATABASE_URL=your_database_url");
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

async function runOptimization() {
  console.log("🚀 Starting Database Optimization...\n");

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), "drizzle", "0006_enhanced_query_optimization_indexes.sql");
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    console.log("📄 Reading migration file...");
    console.log(`📁 Migration file: ${migrationPath}`);
    console.log(`📊 Migration size: ${(migrationSQL.length / 1024).toFixed(2)} KB\n`);

    // Split the migration into individual statements
    const statements = migrationSQL
      .split(";")
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`🔧 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip if statement is undefined or empty
      if (!statement || statement.startsWith("--") || statement.length === 0) {
        console.log("⏭️  Skipping comment/empty statement");
        continue;
      }
      
      try {
        console.log(`[${i + 1}/${statements.length}] Executing statement...`);

        await sql.unsafe(statement);
        successCount++;
        console.log("✅ Statement executed successfully");
        
        // Add a small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        errorCount++;
        const errorMsg = `Statement ${i + 1}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        console.log(`❌ Error executing statement: ${errorMsg}`);
        
        // Continue with other statements even if one fails
        continue;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 OPTIMIZATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    console.log(`📈 Success rate: ${((successCount / (successCount + errorCount)) * 100).toFixed(2)}%`);

    if (errors.length > 0) {
      console.log("\n❌ ERRORS ENCOUNTERED:");
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    // Run performance analysis
    console.log("\n🔍 Running Performance Analysis...");
    await analyzePerformance();

    console.log("\n🎉 Database optimization completed!");
    
  } catch (error) {
    console.error("❌ Fatal error during optimization:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

async function analyzePerformance() {
  try {
    console.log("📊 Analyzing database performance...\n");

    // Check index usage
    const indexUsage = await sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch,
        CASE 
          WHEN idx_scan = 0 THEN 'UNUSED'
          WHEN idx_scan < 100 THEN 'LOW_USAGE'
          WHEN idx_scan < 1000 THEN 'MEDIUM_USAGE'
          ELSE 'HIGH_USAGE'
        END as usage_level
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      ORDER BY idx_scan DESC
      LIMIT 20;
    `;

    console.log("📈 Top 20 Most Used Indexes:");
    console.log("─".repeat(80));
    console.log("Table Name".padEnd(20) + "Index Name".padEnd(30) + "Scans".padEnd(10) + "Usage Level");
    console.log("─".repeat(80));
    
    indexUsage.forEach((row: any) => {
      const tableName = (row.tablename || "").substring(0, 19);
      const indexName = (row.indexname || "").substring(0, 29);
      const scans = (row.idx_scan || 0).toString().padEnd(9);
      const usage = (row.usage_level || "UNKNOWN").padEnd(10);
      
      console.log(`${tableName.padEnd(20)}${indexName.padEnd(30)}${scans}${usage}`);
    });

    // Check for unused indexes
    const unusedIndexes = await sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public' 
        AND idx_scan = 0
        AND indexname NOT LIKE '%_pkey'
      ORDER BY tablename, indexname;
    `;

    if (unusedIndexes.length > 0) {
      console.log(`\n⚠️  Found ${unusedIndexes.length} unused indexes:`);
      unusedIndexes.forEach((row: any) => {
        console.log(`   - ${row.tablename}.${row.indexname}`);
      });
    } else {
      console.log("\n✅ No unused indexes found!");
    }

    // Check table sizes
    const tableSizes = await sql`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10;
    `;

    console.log("\n📊 Largest Tables by Size:");
    console.log("─".repeat(50));
    console.log("Table Name".padEnd(25) + "Size");
    console.log("─".repeat(50));
    
    tableSizes.forEach((row: any) => {
      const tableName = (row.tablename || "").substring(0, 24);
      const size = row.size || "Unknown";
      console.log(`${tableName.padEnd(25)}${size}`);
    });

    // Check for slow queries (if pg_stat_statements is available)
    try {
      const slowQueries = await sql`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          rows,
          100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
        FROM pg_stat_statements
        WHERE mean_time > 100
        ORDER BY mean_time DESC
        LIMIT 5;
      `;

      if (slowQueries.length > 0) {
        console.log("\n🐌 Slowest Queries (avg > 100ms):");
        console.log("─".repeat(80));
        slowQueries.forEach((row: any, index: number) => {
          console.log(`${index + 1}. Mean time: ${row.mean_time?.toFixed(2)}ms, Calls: ${row.calls}, Hit%: ${row.hit_percent?.toFixed(2)}%`);
          console.log(`   Query: ${(row.query || "").substring(0, 100)}...`);
          console.log("");
        });
      }
    } catch (error) {
      console.log("\nℹ️  pg_stat_statements extension not available - skipping slow query analysis");
    }

  } catch (error) {
    console.error("❌ Error during performance analysis:", error);
  }
}

async function testQueryPerformance() {
  console.log("\n🧪 Testing Query Performance...");
  
  try {
    // Test common queries
    const testQueries = [
      {
        name: "User by email lookup",
        query: "SELECT * FROM replier_user WHERE email = 'test@example.com' LIMIT 1;"
      },
      {
        name: "Active sessions count",
        query: "SELECT COUNT(*) FROM replier_session WHERE expires_at > NOW();"
      },
      {
        name: "Recent generations",
        query: "SELECT COUNT(*) FROM replier_generation WHERE created_at > NOW() - INTERVAL '7 days';"
      },
      {
        name: "Active subscriptions",
        query: "SELECT COUNT(*) FROM replier_billing WHERE status IN ('active', 'APPROVED');"
      }
    ];

    for (const test of testQueries) {
      const start = Date.now();
      try {
        await sql.unsafe(test.query);
        const duration = Date.now() - start;
        console.log(`✅ ${test.name}: ${duration}ms`);
      } catch (error) {
        console.log(`❌ ${test.name}: Error - ${error instanceof Error ? error.message : String(error)}`);
      }
    }

  } catch (error) {
    console.error("❌ Error during query performance testing:", error);
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runOptimization()
    .then(() => {
      console.log("\n🎉 Database optimization script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Database optimization script failed:", error);
      process.exit(1);
    });
}

export { runOptimization, analyzePerformance, testQueryPerformance };
