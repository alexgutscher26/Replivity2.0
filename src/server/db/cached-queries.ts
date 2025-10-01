/**
 * Cached Database Queries
 * 
 * This module provides cached versions of frequently used database queries
 * with intelligent cache invalidation and performance optimization.
 */

import { db } from './index';
import { getCacheManager, QueryCache } from './cache-manager';
import { CACHE_TTL, CACHE_TAGS, getCacheStrategy } from './cache-config';
import { 
  user, 
  generation, 
  billing, 
  usage, 
  blogPosts, 
  hashtagSets, 
  hashtagPerformance,
  settings,
  securityEvent
} from './schema';
import { eq, and, gte, lte, desc, asc, sql, count, sum, avg } from 'drizzle-orm';

// Initialize query cache with error handling
let cache: QueryCache;
try {
  cache = new QueryCache(getCacheManager());
} catch (error) {
  console.warn('⚠️ Cache manager not initialized, using fallback cache');
  // Create a fallback cache that uses the legacy system
  cache = {
    cacheQuery: async (query: string, queryFn: () => Promise<any>, params: any = {}, tags: string[] = [], ttl?: number) => {
      // Simple fallback - just execute the query without caching
      return await queryFn();
    },
    cache: async (key: string, queryFn: () => Promise<any>, tags: string[] = [], ttl?: number) => {
      return await queryFn();
    },
    invalidate: async (tags: string[]) => {
      // No-op for fallback
    },
    clear: async () => {
      // No-op for fallback
    }
  } as QueryCache;
}

/**
 * User-related cached queries
 */
export class CachedUserQueries {
  /**
   * Get user by ID with caching
   */
  static async getUserById(userId: string) {
    return cache.cacheQuery(
      'getUserById',
      async () => {
        const result = await db
          .select()
          .from(user)
          .where(eq(user.id, userId))
          .limit(1);
        
        return result[0] || null;
      },
      { userId },
      [CACHE_TAGS.USER],
      CACHE_TTL.USER_DATA
    );
  }

  /**
   * Get user by email with caching
   */
  static async getUserByEmail(email: string) {
    return cache.cacheQuery(
      'getUserByEmail',
      async () => {
        const result = await db
          .select()
          .from(user)
          .where(eq(user.email, email))
          .limit(1);
        
        return result[0] || null;
      },
      { email },
      [CACHE_TAGS.USER],
      CACHE_TTL.USER_DATA
    );
  }

  /**
   * Get user dashboard data with caching
   */
  static async getUserDashboardData(userId: string) {
    return cache.cacheQuery(
      'getUserDashboardData',
      async () => {
        const [userData, generationCount, recentGenerations] = await Promise.all([
          db.select().from(user).where(eq(user.id, userId)).limit(1),
          db.select({ count: count() }).from(generation).where(eq(generation.userId, userId)),
          db
            .select()
            .from(generation)
            .where(eq(generation.userId, userId))
            .orderBy(desc(generation.createdAt))
            .limit(5)
        ]);

        return {
          user: userData[0] || null,
          generationCount: generationCount[0]?.count || 0,
          recentGenerations
        };
      },
      { userId },
      [CACHE_TAGS.USER, CACHE_TAGS.GENERATION],
      CACHE_TTL.USER_DATA
    );
  }

  /**
   * Get total user count with caching
   */
  static async getTotalUsers(dateFrom?: Date, dateTo?: Date) {
    return cache.cacheQuery(
      'getTotalUsers',
      async () => {
        let query = db.select({ count: count() }).from(user);
        
        if (dateFrom) {
          query = query.where(gte(user.createdAt, dateFrom));
        }
        if (dateTo) {
          query = query.where(lte(user.createdAt, dateTo));
        }

        const result = await query;
        return result[0]?.count || 0;
      },
      { dateFrom, dateTo },
      [CACHE_TAGS.USER, CACHE_TAGS.ANALYTICS],
      CACHE_TTL.ANALYTICS
    );
  }
}

/**
 * Generation-related cached queries
 */
export class CachedGenerationQueries {
  /**
   * Get user generations with pagination and caching
   */
  static async getUserGenerations(
    userId: string, 
    limit: number = 20, 
    offset: number = 0,
    platform?: string
  ) {
    return cache.cacheQuery(
      'getUserGenerations',
      async () => {
        let query = db
          .select()
          .from(generation)
          .where(eq(generation.userId, userId))
          .orderBy(desc(generation.createdAt))
          .limit(limit)
          .offset(offset);

        if (platform) {
          query = query.where(eq(generation.platform, platform));
        }

        return await query;
      },
      { userId, limit, offset, platform },
      [CACHE_TAGS.GENERATION],
      CACHE_TTL.GENERATION_STATS
    );
  }

  /**
   * Get generation statistics with caching
   */
  static async getGenerationStats(userId?: string, dateFrom?: Date, dateTo?: Date) {
    return cache.cacheQuery(
      'getGenerationStats',
      async () => {
        let query = db
          .select({
            total: count(),
            totalTokens: sum(generation.tokensUsed),
            avgTokens: avg(generation.tokensUsed),
            platforms: sql<string[]>`array_agg(DISTINCT ${generation.platform})`
          })
          .from(generation);

        const conditions = [];
        if (userId) conditions.push(eq(generation.userId, userId));
        if (dateFrom) conditions.push(gte(generation.createdAt, dateFrom));
        if (dateTo) conditions.push(lte(generation.createdAt, dateTo));

        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }

        const result = await query;
        return result[0] || {
          total: 0,
          totalTokens: 0,
          avgTokens: 0,
          platforms: []
        };
      },
      { userId, dateFrom, dateTo },
      [CACHE_TAGS.GENERATION, CACHE_TAGS.ANALYTICS],
      CACHE_TTL.ANALYTICS
    );
  }

  /**
   * Get platform-specific generation counts with caching
   */
  static async getPlatformStats(dateFrom?: Date, dateTo?: Date) {
    return cache.cacheQuery(
      'getPlatformStats',
      async () => {
        let query = db
          .select({
            platform: generation.platform,
            count: count(),
            totalTokens: sum(generation.tokensUsed)
          })
          .from(generation)
          .groupBy(generation.platform);

        const conditions = [];
        if (dateFrom) conditions.push(gte(generation.createdAt, dateFrom));
        if (dateTo) conditions.push(lte(generation.createdAt, dateTo));

        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }

        return await query;
      },
      { dateFrom, dateTo },
      [CACHE_TAGS.GENERATION, CACHE_TAGS.ANALYTICS],
      CACHE_TTL.ANALYTICS
    );
  }
}

/**
 * Billing-related cached queries
 */
export class CachedBillingQueries {
  /**
   * Get user billing information with caching
   */
  static async getUserBilling(userId: string) {
    return cache.cacheQuery(
      'getUserBilling',
      async () => {
        const result = await db
          .select()
          .from(billing)
          .where(eq(billing.userId, userId))
          .orderBy(desc(billing.createdAt))
          .limit(1);

        return result[0] || null;
      },
      { userId },
      [CACHE_TAGS.BILLING],
      CACHE_TTL.BILLING_DATA
    );
  }

  /**
   * Get active subscriptions with caching
   */
  static async getActiveSubscriptions() {
    return cache.cacheQuery(
      'getActiveSubscriptions',
      async () => {
        return await db
          .select()
          .from(billing)
          .where(eq(billing.status, 'active'))
          .orderBy(desc(billing.createdAt));
      },
      {},
      [CACHE_TAGS.BILLING],
      CACHE_TTL.BILLING_DATA
    );
  }

  /**
   * Get revenue statistics with caching
   */
  static async getRevenueStats(dateFrom?: Date, dateTo?: Date) {
    return cache.cacheQuery(
      'getRevenueStats',
      async () => {
        let query = db
          .select({
            totalRevenue: sum(billing.amount),
            totalTransactions: count(),
            avgTransaction: avg(billing.amount)
          })
          .from(billing)
          .where(eq(billing.status, 'active'));

        const conditions = [eq(billing.status, 'active')];
        if (dateFrom) conditions.push(gte(billing.createdAt, dateFrom));
        if (dateTo) conditions.push(lte(billing.createdAt, dateTo));

        query = query.where(and(...conditions));

        const result = await query;
        return result[0] || {
          totalRevenue: 0,
          totalTransactions: 0,
          avgTransaction: 0
        };
      },
      { dateFrom, dateTo },
      [CACHE_TAGS.BILLING, CACHE_TAGS.ANALYTICS],
      CACHE_TTL.ANALYTICS
    );
  }
}

/**
 * Blog-related cached queries
 */
export class CachedBlogQueries {
  /**
   * Get published blog posts with caching
   */
  static async getPublishedPosts(limit: number = 10, offset: number = 0) {
    return cache.cacheQuery(
      'getPublishedPosts',
      async () => {
        return await db
          .select()
          .from(blogPosts)
          .where(eq(blogPosts.status, 'published'))
          .orderBy(desc(blogPosts.publishedAt))
          .limit(limit)
          .offset(offset);
      },
      { limit, offset },
      [CACHE_TAGS.BLOG],
      CACHE_TTL.BLOG_POSTS
    );
  }

  /**
   * Get blog post by slug with caching
   */
  static async getBlogPostBySlug(slug: string) {
    return cache.cacheQuery(
      'getBlogPostBySlug',
      async () => {
        const result = await db
          .select()
          .from(blogPosts)
          .where(eq(blogPosts.slug, slug))
          .limit(1);

        return result[0] || null;
      },
      { slug },
      [CACHE_TAGS.BLOG],
      CACHE_TTL.BLOG_POSTS
    );
  }

  /**
   * Get blog statistics with caching
   */
  static async getBlogStats() {
    return cache.cacheQuery(
      'getBlogStats',
      async () => {
        const [totalPosts, publishedPosts, draftPosts] = await Promise.all([
          db.select({ count: count() }).from(blogPosts),
          db.select({ count: count() }).from(blogPosts).where(eq(blogPosts.status, 'published')),
          db.select({ count: count() }).from(blogPosts).where(eq(blogPosts.status, 'draft'))
        ]);

        return {
          total: totalPosts[0]?.count || 0,
          published: publishedPosts[0]?.count || 0,
          drafts: draftPosts[0]?.count || 0
        };
      },
      {},
      [CACHE_TAGS.BLOG, CACHE_TAGS.ANALYTICS],
      CACHE_TTL.ANALYTICS
    );
  }
}

/**
 * Settings-related cached queries
 */
export class CachedSettingsQueries {
  /**
   * Get user settings with caching
   */
  static async getUserSettings(userId: string) {
    return cache.cacheQuery(
      'getUserSettings',
      async () => {
        const result = await db
          .select()
          .from(settings)
          .where(eq(settings.userId, userId))
          .limit(1);

        return result[0] || null;
      },
      { userId },
      [CACHE_TAGS.SETTINGS],
      CACHE_TTL.SETTINGS
    );
  }

  /**
   * Get all settings with caching
   */
  static async getAllSettings() {
    return cache.cacheQuery(
      'getAllSettings',
      async () => {
        return await db.select().from(settings);
      },
      {},
      [CACHE_TAGS.SETTINGS],
      CACHE_TTL.SETTINGS
    );
  }
}

/**
 * Security-related cached queries
 */
export class CachedSecurityQueries {
  /**
   * Get recent security events with caching
   */
  static async getRecentSecurityEvents(limit: number = 50) {
    return cache.cacheQuery(
      'getRecentSecurityEvents',
      async () => {
        return await db
          .select()
          .from(securityEvent)
          .orderBy(desc(securityEvent.createdAt))
          .limit(limit);
      },
      { limit },
      [CACHE_TAGS.SECURITY],
      CACHE_TTL.SECURITY_EVENTS
    );
  }

  /**
   * Get security event statistics with caching
   */
  static async getSecurityStats(dateFrom?: Date, dateTo?: Date) {
    return cache.cacheQuery(
      'getSecurityStats',
      async () => {
        let query = db
          .select({
            total: count(),
            highSeverity: sql<number>`count(*) filter (where ${securityEvent.severity} = 'high')`,
            mediumSeverity: sql<number>`count(*) filter (where ${securityEvent.severity} = 'medium')`,
            lowSeverity: sql<number>`count(*) filter (where ${securityEvent.severity} = 'low')`
          })
          .from(securityEvent);

        const conditions = [];
        if (dateFrom) conditions.push(gte(securityEvent.createdAt, dateFrom));
        if (dateTo) conditions.push(lte(securityEvent.createdAt, dateTo));

        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }

        const result = await query;
        return result[0] || {
          total: 0,
          highSeverity: 0,
          mediumSeverity: 0,
          lowSeverity: 0
        };
      },
      { dateFrom, dateTo },
      [CACHE_TAGS.SECURITY, CACHE_TAGS.ANALYTICS],
      CACHE_TTL.ANALYTICS
    );
  }
}

/**
 * Hashtag-related cached queries
 */
export class CachedHashtagQueries {
  /**
   * Get hashtag sets with caching
   */
  static async getHashtagSets(userId?: string) {
    return cache.cacheQuery(
      'getHashtagSets',
      async () => {
        let query = db.select().from(hashtagSets);
        
        if (userId) {
          query = query.where(eq(hashtagSets.userId, userId));
        }

        return await query;
      },
      { userId },
      [CACHE_TAGS.HASHTAG],
      CACHE_TTL.HASHTAG_DATA
    );
  }

  /**
   * Get hashtag performance with caching
   */
  static async getHashtagPerformance(hashtagSetId: string, dateFrom?: Date, dateTo?: Date) {
    return cache.cacheQuery(
      'getHashtagPerformance',
      async () => {
        let query = db
          .select()
          .from(hashtagPerformance)
          .where(eq(hashtagPerformance.hashtagSetId, hashtagSetId))
          .orderBy(desc(hashtagPerformance.createdAt));

        const conditions = [eq(hashtagPerformance.hashtagSetId, hashtagSetId)];
        if (dateFrom) conditions.push(gte(hashtagPerformance.createdAt, dateFrom));
        if (dateTo) conditions.push(lte(hashtagPerformance.createdAt, dateTo));

        query = query.where(and(...conditions));

        return await query;
      },
      { hashtagSetId, dateFrom, dateTo },
      [CACHE_TAGS.HASHTAG],
      CACHE_TTL.HASHTAG_DATA
    );
  }
}

/**
 * Cache invalidation utilities
 */
export class CacheInvalidation {
  /**
   * Invalidate user-related cache
   */
  static async invalidateUser(userId: string) {
    const cache = getCacheManager();
    await cache.invalidateByTags([CACHE_TAGS.USER]);
    await cache.delete(`*${userId}*`);
  }

  /**
   * Invalidate generation-related cache
   */
  static async invalidateGeneration(userId?: string) {
    const cache = getCacheManager();
    await cache.invalidateByTags([CACHE_TAGS.GENERATION]);
    if (userId) {
      await cache.delete(`*${userId}*`);
    }
  }

  /**
   * Invalidate billing-related cache
   */
  static async invalidateBilling(userId?: string) {
    const cache = getCacheManager();
    await cache.invalidateByTags([CACHE_TAGS.BILLING]);
    if (userId) {
      await cache.delete(`*${userId}*`);
    }
  }

  /**
   * Invalidate blog-related cache
   */
  static async invalidateBlog() {
    const cache = getCacheManager();
    await cache.invalidateByTags([CACHE_TAGS.BLOG]);
  }

  /**
   * Invalidate analytics cache
   */
  static async invalidateAnalytics() {
    const cache = getCacheManager();
    await cache.invalidateByTags([CACHE_TAGS.ANALYTICS]);
  }

  /**
   * Invalidate cache by event type
   */
  static async invalidateByEvent(event: string, userId?: string) {
    const cache = getCacheManager();
    const strategy = getCacheStrategy(event);
    
    if (strategy) {
      await cache.invalidateByTags(strategy.tags);
      
      // Invalidate user-specific patterns
      if (userId) {
        for (const pattern of strategy.invalidationPatterns) {
          await cache.delete(pattern.replace('*', userId));
        }
      }
    }
  }

  /**
   * Invalidate all cache
   */
  static async invalidateAll() {
    const cache = getCacheManager();
    await cache.clear();
  }
}

/**
 * Cache warming utilities
 */
export class CacheWarming {
  /**
   * Warm up frequently accessed data
   */
  static async warmupCommonData() {
    const cache = getCacheManager();
    
    console.log('🔥 Warming up common cache data...');

    try {
      // Warm up user counts
      await CachedUserQueries.getTotalUsers();
      
      // Warm up generation stats
      await CachedGenerationQueries.getGenerationStats();
      
      // Warm up platform stats
      await CachedGenerationQueries.getPlatformStats();
      
      // Warm up blog stats
      await CachedBlogQueries.getBlogStats();
      
      // Warm up published posts
      await CachedBlogQueries.getPublishedPosts(10, 0);
      
      console.log('✅ Cache warmup completed');
    } catch (error) {
      console.error('❌ Cache warmup failed:', error);
    }
  }

  /**
   * Warm up user-specific data
   */
  static async warmupUserData(userId: string) {
    console.log(`🔥 Warming up cache for user ${userId}...`);

    try {
      await Promise.all([
        CachedUserQueries.getUserById(userId),
        CachedUserQueries.getUserDashboardData(userId),
        CachedBillingQueries.getUserBilling(userId),
        CachedSettingsQueries.getUserSettings(userId)
      ]);
      
      console.log(`✅ User cache warmup completed for ${userId}`);
    } catch (error) {
      console.error(`❌ User cache warmup failed for ${userId}:`, error);
    }
  }
}

export {
  CACHE_TTL,
  CACHE_TAGS,
  cache
};
