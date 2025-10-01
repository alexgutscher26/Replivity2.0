#!/usr/bin/env tsx
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Analytics Optimization Script
 * 
 * This script runs the analytics optimization migration
 * and sets up materialized views for complex analytics queries.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

// Load environment variables
config({ path: join(process.cwd(), ".env") });

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

async function runAnalyticsOptimization() {
  console.log("🚀 Starting Analytics Optimization...\n");

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), "drizzle", "0007_analytics_optimization.sql");
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    console.log("📄 Reading analytics optimization migration...");
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
    console.log("📊 ANALYTICS OPTIMIZATION SUMMARY");
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

    // Verify materialized views were created
    console.log("\n🔍 Verifying Materialized Views...");
    await verifyMaterializedViews();

    // Test analytics performance
    console.log("\n🧪 Testing Analytics Performance...");
    await testAnalyticsPerformance();

    console.log("\n🎉 Analytics optimization completed!");
    
  } catch (error) {
    console.error("❌ Fatal error during analytics optimization:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

async function verifyMaterializedViews() {
  try {
    const views = await sql`
      SELECT matviewname, ispopulated, hasindexes
      FROM pg_matviews 
      WHERE schemaname = 'public'
      ORDER BY matviewname;
    `;

    console.log("📊 Materialized Views Status:");
    console.log("─".repeat(60));
    console.log("View Name".padEnd(25) + "Populated".padEnd(12) + "Has Indexes");
    console.log("─".repeat(60));
    
    views.forEach((view: any) => {
      const name = (view.matviewname || "").substring(0, 24);
      const populated = (view.ispopulated ? "Yes" : "No").padEnd(11);
      const hasIndexes = view.hasindexes ? "Yes" : "No";
      
      console.log(`${name.padEnd(25)}${populated}${hasIndexes}`);
    });

    // Check if all expected views exist
    const expectedViews = ['daily_analytics', 'user_analytics', 'platform_performance', 'revenue_analytics', 'blog_analytics'];
    const existingViews = views.map((v: any) => v.matviewname);
    const missingViews = expectedViews.filter(view => !existingViews.includes(view));

    if (missingViews.length > 0) {
      console.log(`\n⚠️  Missing materialized views: ${missingViews.join(', ')}`);
    } else {
      console.log("\n✅ All expected materialized views created successfully!");
    }

  } catch (error) {
    console.error("❌ Error verifying materialized views:", error);
  }
}

async function testAnalyticsPerformance() {
  try {
    const testQueries = [
      {
        name: "Daily Analytics Query",
        query: "SELECT * FROM daily_analytics ORDER BY date DESC LIMIT 10;"
      },
      {
        name: "User Analytics Query",
        query: "SELECT * FROM user_analytics ORDER BY total_generations DESC LIMIT 5;"
      },
      {
        name: "Platform Performance Query",
        query: "SELECT * FROM platform_performance ORDER BY total_generations DESC;"
      },
      {
        name: "Revenue Analytics Query",
        query: "SELECT * FROM revenue_analytics ORDER BY date DESC LIMIT 10;"
      },
      {
        name: "Blog Analytics Query",
        query: "SELECT * FROM blog_analytics ORDER BY date DESC LIMIT 10;"
      }
    ];

    for (const test of testQueries) {
      const start = Date.now();
      try {
        const result = await sql.unsafe(test.query);
        const duration = Date.now() - start;
        const rowCount = Array.isArray(result) ? result.length : 0;
        console.log(`✅ ${test.name}: ${duration}ms (${rowCount} rows)`);
      } catch (error) {
        console.log(`❌ ${test.name}: Error - ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Test analytics functions
    console.log("\n🔧 Testing Analytics Functions...");
    
    const functionTests = [
      {
        name: "get_user_analytics function",
        query: "SELECT * FROM get_user_analytics((SELECT id FROM replier_user LIMIT 1)) LIMIT 1;"
      },
      {
        name: "get_platform_analytics function",
        query: "SELECT * FROM get_platform_analytics('twitter') LIMIT 1;"
      }
    ];

    for (const test of functionTests) {
      const start = Date.now();
      try {
        const result = await sql.unsafe(test.query);
        const duration = Date.now() - start;
        const rowCount = Array.isArray(result) ? result.length : 0;
        console.log(`✅ ${test.name}: ${duration}ms (${rowCount} rows)`);
      } catch (error) {
        console.log(`❌ ${test.name}: Error - ${error instanceof Error ? error.message : String(error)}`);
      }
    }

  } catch (error) {
    console.error("❌ Error during analytics performance testing:", error);
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runAnalyticsOptimization()
    .then(() => {
      console.log("\n🎉 Analytics optimization script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Analytics optimization script failed:", error);
      process.exit(1);
    });
}

export { runAnalyticsOptimization, verifyMaterializedViews, testAnalyticsPerformance };
