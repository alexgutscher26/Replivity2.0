/**
 * Analytics Query Optimizer
 * 
 * This module provides optimized analytics queries with complex joins,
 * materialized views, and intelligent caching for better performance.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { and, count, desc, eq, gte, lte, sql, or, inArray } from "drizzle-orm";
import { user } from "./schema/auth-schema";
import { billing } from "./schema/billing-schema";
import { generations } from "./schema/generation-schema";
import { products } from "./schema/products-schema";
import { usage } from "./schema/usage-schema";
import { blogPosts, blogComments } from "./schema/post-schema";
import { hashtagPerformance } from "./schema/hashtag-schema";

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sqlConnection = postgres(connectionString, { max: 10 });
const db = drizzle(sqlConnection);

// Cache for expensive analytics queries
const analyticsCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

interface DateRange {
  from?: Date;
  to?: Date;
}

interface AnalyticsFilters {
  userId?: string;
  dateRange?: DateRange;
  platform?: string;
  productId?: string;
  isAdmin?: boolean;
}

/**
 * Cache management for analytics queries
 */
class AnalyticsCache {
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly LONG_TTL = 30 * 60 * 1000; // 30 minutes

  static set(key: string, data: any, ttl = this.DEFAULT_TTL) {
    analyticsCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  static get(key: string): any | null {
    const cached = analyticsCache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      analyticsCache.delete(key);
      return null;
    }

    return cached.data;
  }

  static clear(pattern?: string) {
    if (pattern) {
      for (const key of analyticsCache.keys()) {
        if (key.includes(pattern)) {
          analyticsCache.delete(key);
        }
      }
    } else {
      analyticsCache.clear();
    }
  }

  static generateKey(prefix: string, filters: AnalyticsFilters): string {
    const filterStr = Object.entries(filters)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
    return `${prefix}:${filterStr}`;
  }
}

/**
 * Optimized Analytics Queries
 */
export class AnalyticsOptimizer {
  /**
   * Get comprehensive dashboard analytics with optimized joins
   */
  static async getDashboardAnalytics(filters: AnalyticsFilters = {}) {
    const cacheKey = AnalyticsCache.generateKey('dashboard', filters);
    const cached = AnalyticsCache.get(cacheKey);
    if (cached) return cached;

    const { userId, dateRange, isAdmin = false } = filters;

    // Build base conditions
    const conditions = [];
    if (userId && !isAdmin) {
      conditions.push(eq(generations.userId, userId));
    }

    if (dateRange?.from) {
      conditions.push(gte(generations.createdAt, dateRange.from));
    }
    if (dateRange?.to) {
      conditions.push(lte(generations.createdAt, dateRange.to));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Execute all analytics queries in parallel
    const [
      totalGenerations,
      platformStats,
      recentActivity,
      userStats,
      revenueStats
    ] = await Promise.all([
      // Total generations count
      db.select({ count: count() })
        .from(generations)
        .where(whereClause),

      // Platform distribution with optimized aggregation
      db.select({
        platform: generations.source,
        count: count(),
        avgLength: sql<number>`AVG(LENGTH(${generations.post}))`,
        lastUsed: sql<Date>`MAX(${generations.createdAt})`
      })
        .from(generations)
        .where(whereClause)
        .groupBy(generations.source)
        .orderBy(desc(count())),

      // Recent activity (last 7 days)
      db.select({
        date: sql<Date>`DATE(${generations.createdAt})`,
        count: count(),
        platforms: sql<string>`ARRAY_AGG(DISTINCT ${generations.source})`
      })
        .from(generations)
        .where(
          and(
            whereClause,
            gte(generations.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          )
        )
        .groupBy(sql`DATE(${generations.createdAt})`)
        .orderBy(sql`DATE(${generations.createdAt})`),

      // User statistics (if admin)
      isAdmin ? db.select({
        totalUsers: count(),
        activeUsers: sql<number>`COUNT(DISTINCT CASE WHEN ${user.createdAt} > NOW() - INTERVAL '30 days' THEN ${user.id} END)`,
        newUsers: sql<number>`COUNT(CASE WHEN ${user.createdAt} > NOW() - INTERVAL '7 days' THEN 1 END)`
      }).from(user) : Promise.resolve([{ totalUsers: 0, activeUsers: 0, newUsers: 0 }]),

      // Revenue statistics (if admin)
      isAdmin ? db.select({
        totalRevenue: sql<number>`SUM(${billing.amount})`,
        activeSubscriptions: sql<number>`COUNT(CASE WHEN ${billing.status} IN ('active', 'APPROVED') THEN 1 END)`,
        monthlyRevenue: sql<number>`SUM(CASE WHEN ${billing.createdAt} > NOW() - INTERVAL '30 days' THEN ${billing.amount} ELSE 0 END)`
      })
        .from(billing)
        .where(
          dateRange?.from ? gte(billing.createdAt, dateRange.from) : undefined
        ) : Promise.resolve([{ totalRevenue: 0, activeSubscriptions: 0, monthlyRevenue: 0 }])
    ]);

    const result = {
      totalGenerations: totalGenerations[0]?.count ?? 0,
      platformStats: platformStats,
      recentActivity: recentActivity,
      userStats: userStats[0],
      revenueStats: revenueStats[0]
    };

    AnalyticsCache.set(cacheKey, result, AnalyticsCache.LONG_TTL);
    return result;
  }

  /**
   * Get user analytics with optimized joins
   */
  static async getUserAnalytics(userId: string, filters: AnalyticsFilters = {}) {
    const cacheKey = AnalyticsCache.generateKey('user_analytics', { ...filters, userId });
    const cached = AnalyticsCache.get(cacheKey);
    if (cached) return cached;

    const { dateRange, platform } = filters;

    // Build conditions
    const conditions = [eq(generations.userId, userId)];
    if (platform) {
      conditions.push(eq(generations.source, platform));
    }
    if (dateRange?.from) {
      conditions.push(gte(generations.createdAt, dateRange.from));
    }
    if (dateRange?.to) {
      conditions.push(lte(generations.createdAt, dateRange.to));
    }

    const whereClause = and(...conditions);

    // Get user's active subscription and usage
    const [userData, usageData, generationStats] = await Promise.all([
      // User subscription data
      db.query.billing.findFirst({
        where: and(
          eq(billing.userId, userId),
          or(eq(billing.status, "active"), eq(billing.status, "APPROVED"))
        ),
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              limit: true,
              type: true
            }
          }
        }
      }),

      // Current usage
      db.query.usage.findFirst({
        where: eq(usage.userId, userId)
      }),

      // Generation statistics with optimized aggregation
      db.select({
        totalGenerations: count(),
        platformBreakdown: sql<Array<{platform: string, count: number}>>`
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'platform', ${generations.source},
              'count', platform_count
            )
          )
        `,
        avgPostLength: sql<number>`AVG(LENGTH(${generations.post}))`,
        mostUsedPlatform: sql<string>`MODE() WITHIN GROUP (ORDER BY ${generations.source})`,
        lastActivity: sql<Date>`MAX(${generations.createdAt})`
      })
        .from(
          db.select({
            source: generations.source,
            post: generations.post,
            createdAt: generations.createdAt,
            platform_count: count().as('platform_count')
          })
            .from(generations)
            .where(whereClause)
            .groupBy(generations.source, generations.post, generations.createdAt)
            .as('platform_stats')
        )
    ]);

    const result = {
      user: userData,
      usage: usageData,
      stats: generationStats[0],
      usagePercentage: userData?.product?.limit 
        ? ((usageData?.used ?? 0) / userData.product.limit) * 100 
        : 0
    };

    AnalyticsCache.set(cacheKey, result, AnalyticsCache.DEFAULT_TTL);
    return result;
  }

  /**
   * Get platform-specific analytics with optimized joins
   */
  static async getPlatformAnalytics(platform: string, filters: AnalyticsFilters = {}) {
    const cacheKey = AnalyticsCache.generateKey('platform_analytics', { ...filters, platform });
    const cached = AnalyticsCache.get(cacheKey);
    if (cached) return cached;

    const { userId, dateRange, isAdmin = false } = filters;

    const conditions = [eq(generations.source, platform)];
    if (userId && !isAdmin) {
      conditions.push(eq(generations.userId, userId));
    }
    if (dateRange?.from) {
      conditions.push(gte(generations.createdAt, dateRange.from));
    }
    if (dateRange?.to) {
      conditions.push(lte(generations.createdAt, dateRange.to));
    }

    const whereClause = and(...conditions);

    // Get platform analytics with optimized queries
    const [platformStats, userBreakdown, timeSeriesData] = await Promise.all([
      // Platform statistics
      db.select({
        totalGenerations: count(),
        uniqueUsers: sql<number>`COUNT(DISTINCT ${generations.userId})`,
        avgPostLength: sql<number>`AVG(LENGTH(${generations.post}))`,
        avgReplyLength: sql<number>`AVG(LENGTH(${generations.reply}))`,
        mostActiveHour: sql<number>`EXTRACT(HOUR FROM ${generations.createdAt})`,
        lastActivity: sql<Date>`MAX(${generations.createdAt})`
      })
        .from(generations)
        .where(whereClause),

      // User breakdown (top users for this platform)
      db.select({
        userId: generations.userId,
        userName: user.name,
        userEmail: user.email,
        generationCount: count(),
        lastActivity: sql<Date>`MAX(${generations.createdAt})`
      })
        .from(generations)
        .leftJoin(user, eq(generations.userId, user.id))
        .where(whereClause)
        .groupBy(generations.userId, user.name, user.email)
        .orderBy(desc(count()))
        .limit(10),

      // Time series data (daily activity)
      db.select({
        date: sql<Date>`DATE(${generations.createdAt})`,
        count: count(),
        uniqueUsers: sql<number>`COUNT(DISTINCT ${generations.userId})`
      })
        .from(generations)
        .where(whereClause)
        .groupBy(sql`DATE(${generations.createdAt})`)
        .orderBy(sql`DATE(${generations.createdAt})`)
    ]);

    const result = {
      platform,
      stats: platformStats[0],
      topUsers: userBreakdown,
      timeSeries: timeSeriesData
    };

    AnalyticsCache.set(cacheKey, result, AnalyticsCache.DEFAULT_TTL);
    return result;
  }

  /**
   * Get revenue analytics with optimized joins
   */
  static async getRevenueAnalytics(filters: AnalyticsFilters = {}) {
    const cacheKey = AnalyticsCache.generateKey('revenue_analytics', filters);
    const cached = AnalyticsCache.get(cacheKey);
    if (cached) return cached;

    const { dateRange, isAdmin = false } = filters;

    if (!isAdmin) {
      throw new Error("Revenue analytics require admin access");
    }

    const conditions = [];
    if (dateRange?.from) {
      conditions.push(gte(billing.createdAt, dateRange.from));
    }
    if (dateRange?.to) {
      conditions.push(lte(billing.createdAt, dateRange.to));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get comprehensive revenue analytics
    const [
      revenueStats,
      monthlyRevenue,
      productRevenue,
      customerStats
    ] = await Promise.all([
      // Overall revenue statistics
      db.select({
        totalRevenue: sql<number>`SUM(${billing.amount})`,
        totalTransactions: count(),
        avgTransactionValue: sql<number>`AVG(${billing.amount})`,
        activeSubscriptions: sql<number>`COUNT(CASE WHEN ${billing.status} IN ('active', 'APPROVED') THEN 1 END)`,
        cancelledSubscriptions: sql<number>`COUNT(CASE WHEN ${billing.status} = 'canceled' THEN 1 END)`
      })
        .from(billing)
        .where(whereClause),

      // Monthly revenue breakdown
      db.select({
        month: sql<string>`TO_CHAR(${billing.createdAt}, 'YYYY-MM')`,
        revenue: sql<number>`SUM(${billing.amount})`,
        transactions: count(),
        newCustomers: sql<number>`COUNT(DISTINCT ${billing.userId})`
      })
        .from(billing)
        .where(whereClause)
        .groupBy(sql`TO_CHAR(${billing.createdAt}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${billing.createdAt}, 'YYYY-MM')`),

      // Revenue by product
      db.select({
        productId: billing.productId,
        productName: products.name,
        productType: products.type,
        revenue: sql<number>`SUM(${billing.amount})`,
        subscriptions: count(),
        avgValue: sql<number>`AVG(${billing.amount})`
      })
        .from(billing)
        .leftJoin(products, eq(billing.productId, products.id))
        .where(whereClause)
        .groupBy(billing.productId, products.name, products.type)
        .orderBy(desc(sql<number>`SUM(${billing.amount})`)),

      // Customer statistics
      db.select({
        totalCustomers: sql<number>`COUNT(DISTINCT ${billing.userId})`,
        newCustomers: sql<number>`COUNT(DISTINCT CASE WHEN ${billing.createdAt} > NOW() - INTERVAL '30 days' THEN ${billing.userId} END)`,
        avgCustomerValue: sql<number>`AVG(customer_totals.total_value)`
      })
        .from(
          db.select({
            userId: billing.userId,
            createdAt: billing.createdAt,
            total_value: sql<number>`SUM(${billing.amount})`
          })
            .from(billing)
            .where(whereClause)
            .groupBy(billing.userId, billing.createdAt)
            .as('customer_totals')
        )
    ]);

    const result = {
      stats: revenueStats[0],
      monthlyBreakdown: monthlyRevenue,
      productBreakdown: productRevenue,
      customerStats: customerStats[0]
    };

    AnalyticsCache.set(cacheKey, result, AnalyticsCache.LONG_TTL);
    return result;
  }

  /**
   * Get blog analytics with optimized queries
   */
  static async getBlogAnalytics(filters: AnalyticsFilters = {}) {
    const cacheKey = AnalyticsCache.generateKey('blog_analytics', filters);
    const cached = AnalyticsCache.get(cacheKey);
    if (cached) return cached;

    const { userId, dateRange } = filters;

    const conditions = [];
    if (userId) {
      conditions.push(eq(blogPosts.createdBy, userId));
    }
    if (dateRange?.from) {
      conditions.push(gte(blogPosts.createdAt, dateRange.from));
    }
    if (dateRange?.to) {
      conditions.push(lte(blogPosts.createdAt, dateRange.to));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get blog analytics
    const [postStats, commentStats, topPosts] = await Promise.all([
      // Post statistics
      db.select({
        totalPosts: count(),
        publishedPosts: sql<number>`COUNT(CASE WHEN ${blogPosts.status} = 'published' THEN 1 END)`,
        draftPosts: sql<number>`COUNT(CASE WHEN ${blogPosts.status} = 'draft' THEN 1 END)`,
        totalViews: sql<number>`SUM(${blogPosts.viewCount})`,
        avgReadingTime: sql<number>`AVG(${blogPosts.readingTime})`
      })
        .from(blogPosts)
        .where(whereClause),

      // Comment statistics
      db.select({
        totalComments: count(),
        approvedComments: sql<number>`COUNT(CASE WHEN ${blogComments.status} = 'approved' THEN 1 END)`,
        pendingComments: sql<number>`COUNT(CASE WHEN ${blogComments.status} = 'pending' THEN 1 END)`,
        avgCommentsPerPost: sql<number>`AVG(comment_counts.comment_count)`
      })
        .from(blogComments)
        .leftJoin(blogPosts, eq(blogComments.postId, blogPosts.id))
        .where(whereClause)
        .groupBy(blogComments.id),

      // Top performing posts
      db.select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        viewCount: blogPosts.viewCount,
        commentCount: sql<number>`COUNT(${blogComments.id})`,
        publishedAt: blogPosts.publishedAt,
        readingTime: blogPosts.readingTime
      })
        .from(blogPosts)
        .leftJoin(blogComments, eq(blogPosts.id, blogComments.postId))
        .where(and(whereClause, eq(blogPosts.status, 'published')))
        .groupBy(blogPosts.id, blogPosts.title, blogPosts.slug, blogPosts.viewCount, blogPosts.publishedAt, blogPosts.readingTime)
        .orderBy(desc(blogPosts.viewCount))
        .limit(10)
    ]);

    const result = {
      posts: postStats[0],
      comments: commentStats[0],
      topPosts: topPosts
    };

    AnalyticsCache.set(cacheKey, result, AnalyticsCache.DEFAULT_TTL);
    return result;
  }

  /**
   * Clear analytics cache
   */
  static clearCache(pattern?: string) {
    AnalyticsCache.clear(pattern);
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return {
      size: analyticsCache.size,
      keys: Array.from(analyticsCache.keys())
    };
  }
}

/**
 * Materialized Views for Complex Analytics
 */
export class MaterializedViews {
  /**
   * Create materialized view for daily analytics
   */
  static async createDailyAnalyticsView() {
    await sqlConnection`
      CREATE MATERIALIZED VIEW IF NOT EXISTS daily_analytics AS
      SELECT 
        DATE(created_at) as date,
        source as platform,
        COUNT(*) as generation_count,
        COUNT(DISTINCT user_id) as unique_users,
        AVG(LENGTH(post)) as avg_post_length,
        AVG(LENGTH(reply)) as avg_reply_length
      FROM replier_generation
      GROUP BY DATE(created_at), source
      ORDER BY date DESC, generation_count DESC;
    `;

    // Create index on materialized view
    await sqlConnection`
      CREATE INDEX IF NOT EXISTS daily_analytics_date_platform_idx 
      ON daily_analytics (date, platform);
    `;
  }

  /**
   * Create materialized view for user analytics
   */
  static async createUserAnalyticsView() {
    await sqlConnection`
      CREATE MATERIALIZED VIEW IF NOT EXISTS user_analytics AS
      SELECT 
        g.user_id,
        u.name as user_name,
        u.email as user_email,
        u.created_at as user_created_at,
        COUNT(g.id) as total_generations,
        COUNT(DISTINCT g.source) as platforms_used,
        MAX(g.created_at) as last_activity,
        AVG(LENGTH(g.post)) as avg_post_length,
        COUNT(CASE WHEN g.created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_generations
      FROM replier_generation g
      LEFT JOIN replier_user u ON g.user_id = u.id
      GROUP BY g.user_id, u.name, u.email, u.created_at
      ORDER BY total_generations DESC;
    `;

    // Create index on materialized view
    await sqlConnection`
      CREATE INDEX IF NOT EXISTS user_analytics_user_id_idx 
      ON user_analytics (user_id);
    `;
  }

  /**
   * Refresh all materialized views
   */
  static async refreshAllViews() {
    await Promise.all([
      sqlConnection`REFRESH MATERIALIZED VIEW daily_analytics;`,
      sqlConnection`REFRESH MATERIALIZED VIEW user_analytics;`
    ]);
  }

  /**
   * Drop all materialized views
   */
  static async dropAllViews() {
    await Promise.all([
      sqlConnection`DROP MATERIALIZED VIEW IF EXISTS daily_analytics;`,
      sqlConnection`DROP MATERIALIZED VIEW IF EXISTS user_analytics;`
    ]);
  }
}

export { AnalyticsCache };
