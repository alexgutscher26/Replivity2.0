/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { checkDatabaseHealth, QueryAnalyzer, CacheManager } from "@/server/db";

/**
 * Database health check and performance monitoring endpoint
 * Only accessible by admin users
 */
export async function GET() {
  try {
    // Check authentication and admin role
    const session = await auth.api.getSession({
      headers: new Headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 },
      );
    }

    // Get database health status
    const healthStatus = await checkDatabaseHealth();

    // Get query performance analytics
    const performanceSummary = QueryAnalyzer.getPerformanceSummary();
    const slowQueries = QueryAnalyzer.getSlowQueries(500); // Queries slower than 500ms

    // Get cache statistics
    const cacheStats = performanceSummary.cacheSize;

    // Calculate performance metrics
    const avgQueryTime =
      Object.values(performanceSummary.queryStats)
        .filter((stat) => stat && typeof stat.avg === "number")
        .reduce((sum, stat) => sum + (stat as { avg: number }).avg, 0) /
        Object.keys(performanceSummary.queryStats).length || 0;

    const response = {
      timestamp: new Date().toISOString(),
      database: {
        healthy: healthStatus.healthy,
        latency: healthStatus.latency,
        connections: healthStatus.connections,
      },
      performance: {
        totalQueries: performanceSummary.totalQueries,
        slowQueries: performanceSummary.slowQueries,
        averageQueryTime: Math.round(avgQueryTime * 100) / 100,
        cacheSize: cacheStats,
      },
      slowQueries: slowQueries.slice(0, 10), // Top 10 slowest queries
      recommendations: generateRecommendations(
        healthStatus,
        performanceSummary,
        slowQueries,
      ),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Database health check failed:", error);
    return NextResponse.json(
      {
        error: "Health check failed",
        timestamp: new Date().toISOString(),
        database: { healthy: false },
      },
      { status: 500 },
    );
  }
}

/**
 * Clear database caches (admin only)
 */
export async function DELETE() {
  try {
    // Check authentication and admin role
    const session = await auth.api.getSession({
      headers: new Headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 },
      );
    }

    // Clear all caches
    CacheManager.clearAll();

    return NextResponse.json({
      success: true,
      message: "All caches cleared successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cache clear failed:", error);
    return NextResponse.json(
      { error: "Failed to clear caches" },
      { status: 500 },
    );
  }
}

/**
 * Generate performance recommendations based on metrics
 */
function generateRecommendations(
  healthStatus: any,
  performanceSummary: any,
  slowQueries: any[],
): string[] {
  const recommendations: string[] = [];

  // Database connection recommendations
  if (healthStatus.latency > 100) {
    recommendations.push(
      "High database latency detected. Consider optimizing network connection or moving closer to database.",
    );
  }

  if (healthStatus.connections.active / healthStatus.connections.total > 0.8) {
    recommendations.push(
      "High connection pool usage. Consider increasing max connections or optimizing query patterns.",
    );
  }

  // Query performance recommendations
  if (slowQueries.length > 5) {
    recommendations.push(
      `${slowQueries.length} slow queries detected. Review and optimize these queries or add missing indexes.`,
    );
  }

  if (performanceSummary.cacheSize > 1000) {
    recommendations.push(
      "Large cache size detected. Consider implementing cache expiration policies.",
    );
  }

  if (performanceSummary.totalQueries > 100) {
    const slowQueryRatio =
      performanceSummary.slowQueries / performanceSummary.totalQueries;
    if (slowQueryRatio > 0.1) {
      recommendations.push(
        `${Math.round(slowQueryRatio * 100)}% of queries are slow. Consider query optimization and indexing.`,
      );
    }
  }

  // Specific query recommendations
  const frequentSlowQueries = slowQueries.filter((q) => q.count > 10);
  if (frequentSlowQueries.length > 0) {
    recommendations.push(
      `Frequently executed slow queries detected: ${frequentSlowQueries.map((q) => q.queryId).join(", ")}`,
    );
  }

  // Cache recommendations
  if (performanceSummary.cacheSize === 0) {
    recommendations.push(
      "No cached queries detected. Consider implementing caching for frequently accessed data.",
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Database performance looks good! No immediate optimizations needed.",
    );
  }

  return recommendations;
}
