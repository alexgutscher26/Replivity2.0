import { env } from "@/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as auth from "./schema/auth-schema";
import * as billing from "./schema/billing-schema";
import * as generations from "./schema/generations-schema";
import * as hashtags from "./schema/hashtag-schema";
import * as products from "./schema/products-schema";
import * as settings from "./schema/settings-schema";
import * as usage from "./schema/usage-schema";

/**
 * Database connection pool configuration for optimal performance
 */
const connectionConfig = {
  // Connection pool settings
  max: env.NODE_ENV === "production" ? 20 : 5, // Maximum connections in pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds

  // Performance optimizations
  prepare: true, // Use prepared statements for better performance
  transform: {
    undefined: null, // Transform undefined to null for PostgreSQL
  },

  // Connection settings
  connection: {
    application_name: "ai-social-replier",
    statement_timeout: 30000, // 30 seconds
    query_timeout: 25000, // 25 seconds
    idle_in_transaction_session_timeout: 60000, // 1 minute
  },

  // SSL configuration for production
  ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,

  // Debug mode for development
  debug: env.NODE_ENV === "development" ? console.log : false,
};

/**
 * Create PostgreSQL connection with optimized pool settings
 */
const sql = postgres(env.DATABASE_URL, connectionConfig);

/**
 * Drizzle database instance with connection pooling
 */
export const pooledDb = drizzle(sql, {
  schema: {
    ...auth,
    ...billing,
    ...generations,
    ...hashtags,
    ...products,
    ...settings,
    ...usage,
  },
  logger: env.NODE_ENV === "development",
});

/**
 * Database health check function
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency: number;
  connections: {
    active: number;
    idle: number;
    total: number;
  };
}> {
  const startTime = Date.now();

  try {
    // Simple health check query
    await sql`SELECT 1 as health_check`;

    const latency = Date.now() - startTime;

    // Note: postgres-js doesn't expose runtime connection pool statistics
    // We can only provide the configured maximum connections
    const stats = {
      active: 0, // Runtime stats not available in postgres-js
      idle: 0, // Runtime stats not available in postgres-js
      total: connectionConfig.max, // Use configured max connections
    };

    return {
      healthy: true,
      latency,
      connections: stats,
    };
  } catch (error) {
    console.error("Database health check failed:", error);
    return {
      healthy: false,
      latency: Date.now() - startTime,
      connections: {
        active: 0,
        idle: 0,
        total: 0,
      },
    };
  }
}

/**
 * Graceful database connection cleanup
 */
export async function closeDatabaseConnections(): Promise<void> {
  try {
    await sql.end();
    console.log("Database connections closed gracefully");
  } catch (error) {
    console.error("Error closing database connections:", error);
  }
}

/**
 * Database query performance monitoring
 */
export function createQueryMonitor() {
  const queryTimes = new Map<string, number[]>();

  const monitor = {
    startQuery: (queryId: string) => {
      const startTime = Date.now();
      return () => {
        const duration = Date.now() - startTime;

        if (!queryTimes.has(queryId)) {
          queryTimes.set(queryId, []);
        }

        const times = queryTimes.get(queryId)!;
        times.push(duration);

        // Keep only last 100 measurements
        if (times.length > 100) {
          times.shift();
        }

        // Log slow queries (> 1 second)
        if (duration > 1000) {
          console.warn(`Slow query detected: ${queryId} took ${duration}ms`);
        }
      };
    },

    getStats: (queryId: string) => {
      const times = queryTimes.get(queryId) ?? [];
      if (times.length === 0) return null;

      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);

      return { avg, min, max, count: times.length };
    },

    getAllStats: () => {
      const stats: Record<
        string,
        { avg: number; min: number; max: number; count: number } | null
      > = {};
      for (const [queryId] of queryTimes) {
        stats[queryId] = monitor.getStats(queryId);
      }
      return stats;
    },
  };

  return monitor;
}

/**
 * Global query monitor instance
 */
export const queryMonitor = createQueryMonitor();

/**
 * Database transaction helper with retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain errors
      if (
        error instanceof Error &&
        (error.message.includes("unique constraint") ||
          error.message.includes("foreign key constraint"))
      ) {
        throw error;
      }

      if (attempt === maxRetries) {
        break;
      }

      console.warn(
        `Database operation failed (attempt ${attempt}/${maxRetries}):`,
        error,
      );

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, attempt - 1)),
      );
    }
  }

  throw lastError!;
}

/**
 * Batch operation helper for bulk inserts/updates
 */
export async function batchOperation<T>(
  items: T[],
  operation: (batch: T[]) => Promise<void>,
  batchSize = 100,
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await operation(batch);
  }
}

export type PooledDatabase = typeof pooledDb;
