/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, and, or, gte, lte, desc, count } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { pooledDb, queryMonitor, withRetry } from "./pool";
import { usage } from "./schema/usage-schema";
import { generations } from "./schema/generations-schema";
import { billing } from "./schema/billing-schema";
import { user } from "./schema/auth-schema";

/**
 * Query optimization utilities and caching layer
 */

// Simple in-memory cache for frequently accessed data
class QueryCache {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: unknown, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): unknown | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const queryCache = new QueryCache();

/**
 * Cached query executor
 */
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = queryCache.get(key);
  if (cached) {
    return cached as T;
  }

  const endTimer = queryMonitor.startQuery(key);
  try {
    const result = await withRetry(queryFn);
    queryCache.set(key, result, ttl);
    return result;
  } finally {
    endTimer();
  }
}

/**
 * Optimized pagination helper
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Simplified type to avoid deep instantiation
type QueryWithExecute<T> = {
  execute(): Promise<T>;
  limit(limit: number): QueryWithExecute<T>;
  offset(offset: number): QueryWithExecute<T>;
};

export async function paginatedQuery<T>(
  baseQuery: QueryWithExecute<T[]>,
  countQuery: QueryWithExecute<Array<{ count: number }>>,
  options: PaginationOptions = {}
): Promise<PaginationResult<T>> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(options.limit ?? 20, options.maxLimit ?? 100);
  const offset = (page - 1) * limit;

  // Execute count and data queries in parallel
  const [totalResult, data] = await Promise.all([
    countQuery.execute(),
    baseQuery.limit(limit).offset(offset).execute(),
  ]);

  const total = (totalResult[0] as { count: number } | undefined)?.count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return {
    data: data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Date range query helper
 */
// Simplified column type to avoid deep instantiation
type DrizzleColumn = PgColumn<any, any, any>;

export interface DateRangeOptions {
  from?: Date;
  to?: Date;
  column: DrizzleColumn;
}

export function buildDateRangeCondition({ from, to, column }: DateRangeOptions) {
  const conditions = [];
  
  if (from) {
    conditions.push(gte(column, from));
  }
  
  if (to) {
    conditions.push(lte(column, to));
  }
  
  return conditions.length > 0 ? and(...conditions) : undefined;
}

/**
 * Optimized user data queries
 */
export class UserQueryOptimizer {
  /**
   * Get user with active subscription (cached)
   */
  static async getUserWithActiveSubscription(userId: string) {
    return cachedQuery(
      `user_active_sub_${userId}`,
      async () => {
        const result = await pooledDb.query.user.findFirst({
          where: eq(user.id, userId),
          with: {
            billings: {
              where: or(
                eq(billing.status, "active"),
                eq(billing.status, "APPROVED")
              ),
              with: {
                product: true,
              },
              limit: 1,
            },
          },
        });
        return result;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  /**
   * Get user usage statistics (cached)
   */
  static async getUserUsageStats(userId: string, productId: string) {
    return cachedQuery(
      `user_usage_${userId}_${productId}`,
      async () => {
        const result = await pooledDb.query.usage.findFirst({
          where: and(
            eq(usage.userId, userId),
            eq(usage.productId, productId)
          ),
        });
        return result;
      },
      1 * 60 * 1000 // 1 minute cache
    );
  }
}

/**
 * Optimized generation queries
 */
export class GenerationQueryOptimizer {
  /**
   * Get platform statistics with optimized query
   */
  static async getPlatformStats(
    platform: string,
    userId?: string,
    dateRange?: { from?: Date; to?: Date }
  ) {
    const cacheKey = `platform_stats_${platform}_${userId ?? 'all'}_${dateRange?.from?.getTime() ?? 'no_from'}_${dateRange?.to?.getTime() ?? 'no_to'}`;
    
    return cachedQuery(
      cacheKey,
      async () => {
        const conditions = [eq(generations.source, platform)];
        
        if (userId) {
          conditions.push(eq(generations.userId, userId));
        }
        
        const dateCondition = buildDateRangeCondition({
          from: dateRange?.from,
          to: dateRange?.to,
          column: generations.createdAt,
        });
        
        if (dateCondition) {
          conditions.push(dateCondition);
        }
        
        // Use optimized count query
        const [totalResult, recentResult] = await Promise.all([
          pooledDb
            .select({ count: count() })
            .from(generations)
            .where(and(...conditions)),
          pooledDb
            .select({ count: count() })
            .from(generations)
            .where(
              and(
                ...conditions,
                gte(
                  generations.createdAt,
                  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
                )
              )
            ),
        ]);
        
        const total = totalResult[0]?.count ?? 0;
        const recent = recentResult[0]?.count ?? 0;
        const previousTotal = total - recent;
        
        const percentageChange =
          total === 0 && previousTotal === 0
            ? 0
            : previousTotal === 0
            ? 100
            : ((recent - previousTotal) / previousTotal) * 100;
        
        return {
          total,
          recent,
          percentageChange,
        };
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  /**
   * Get user generations with optimized pagination
   */
  static async getUserGenerations(
    userId: string,
    options: PaginationOptions & { source?: string }
  ) {
    const conditions = [eq(generations.userId, userId)];
    
    if (options.source) {
      conditions.push(eq(generations.source, options.source));
    }
    
    const baseQuery = pooledDb
      .select()
      .from(generations)
      .where(and(...conditions))
      .orderBy(desc(generations.createdAt));
    
    const countQuery = pooledDb
      .select({ count: count() })
      .from(generations)
      .where(and(...conditions));
    
    return paginatedQuery(
      baseQuery as unknown as QueryWithExecute<Array<{
        id: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        userId: string;
        productId: string;
        link: string | null;
        source: string;
        post: string;
        reply: string;
        author: string | null;
      }>>,
      countQuery as unknown as QueryWithExecute<Array<{ count: number }>>,
      options
    );
  }
}

/**
 * Optimized billing queries
 */
export class BillingQueryOptimizer {
  /**
   * Get active subscriptions with caching
   */
  static async getActiveSubscriptions(userId?: string) {
    const cacheKey = `active_subs_${userId ?? 'all'}`;
    
    return cachedQuery(
      cacheKey,
      async () => {
        const conditions = [
          or(
            eq(billing.status, "active"),
            eq(billing.status, "APPROVED")
          ),
        ];
        
        if (userId) {
          conditions.push(eq(billing.userId, userId));
        }
        
        return pooledDb.query.billing.findMany({
          where: and(...conditions),
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
            product: true,
          },
          orderBy: desc(billing.createdAt),
        });
      },
      3 * 60 * 1000 // 3 minutes cache
    );
  }

  /**
   * Get subscription renewal candidates
   */
  static async getSubscriptionRenewals(daysAhead = 7) {
    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + daysAhead);
    
    return pooledDb.query.billing.findMany({
      where: and(
        eq(billing.status, "active"),
        lte(billing.currentPeriodEnd, renewalDate)
      ),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: true,
      },
    });
  }
}

/**
 * Query performance analyzer
 */
export class QueryAnalyzer {
  /**
   * Analyze slow queries
   */
  static getSlowQueries(threshold = 1000) {
    const stats = queryMonitor.getAllStats();
    const slowQueries = [];
    
    for (const [queryId, stat] of Object.entries(stats)) {
      if (stat && stat.avg > threshold) {
        slowQueries.push({
          queryId,
          ...stat,
        });
      }
    }
    
    return slowQueries.sort((a, b) => b.avg - a.avg);
  }

  /**
   * Get query performance summary
   */
  static getPerformanceSummary() {
    const stats = queryMonitor.getAllStats();
    const cacheStats = queryCache.getStats();
    
    return {
      totalQueries: Object.keys(stats).length,
      slowQueries: this.getSlowQueries().length,
      cacheSize: cacheStats.size,
      cacheKeys: cacheStats.keys,
      queryStats: stats,
    };
  }
}

/**
 * Cache invalidation helpers
 */
export class CacheManager {
  /**
   * Invalidate user-related caches
   */
  static invalidateUserCache(userId: string) {
    queryCache.invalidate(`user_${userId}`);
    queryCache.invalidate(`user_active_sub_${userId}`);
    queryCache.invalidate(`user_usage_${userId}`);
  }

  /**
   * Invalidate platform statistics cache
   */
  static invalidatePlatformCache(platform?: string) {
    if (platform) {
      queryCache.invalidate(`platform_stats_${platform}`);
    } else {
      queryCache.invalidate('platform_stats');
    }
  }

  /**
   * Invalidate billing caches
   */
  static invalidateBillingCache(userId?: string) {
    if (userId) {
      queryCache.invalidate(`active_subs_${userId}`);
    } else {
      queryCache.invalidate('active_subs');
    }
  }

  /**
   * Clear all caches
   */
  static clearAll() {
    queryCache.invalidate();
  }
}