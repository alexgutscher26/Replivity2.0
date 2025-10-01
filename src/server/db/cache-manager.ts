/**
 * Advanced Query Result Cache Manager
 * 
 * This module provides comprehensive caching for database queries
 * with Redis support, intelligent TTL management, and cache invalidation.
 */

import { createHash } from 'crypto';

// Redis will be imported dynamically when needed

// Cache configuration
interface CacheConfig {
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  memory?: {
    maxSize: number;
    ttl: number;
  };
  defaultTTL: number;
  keyPrefix: string;
}

// Cache entry interface
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
  version: number;
}

// Cache statistics
interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  memoryUsage: number;
  redisConnected: boolean;
}

class CacheManager {
  private redis?: any;
  private memoryCache = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    memoryUsage: 0,
    redisConnected: false
  };
  private config: CacheConfig;
  private tagIndex = new Map<string, Set<string>>(); // tag -> set of keys

  constructor(config: CacheConfig) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      keyPrefix: 'replivity:cache:',
      ...config
    };

    // Initialize Redis asynchronously
    this.initializeRedis().catch(error => {
      console.warn('⚠️ Redis initialization failed:', error);
    });
    this.startCleanupInterval();
  }

  private async initializeRedis() {
    if (this.config.redis) {
      try {
        const { Redis } = await import('ioredis');
        this.redis = new Redis({
          host: this.config.redis.host,
          port: this.config.redis.port,
          password: this.config.redis.password,
          db: this.config.redis.db || 0,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true
        } as any);

        this.redis.on('connect', () => {
          this.stats.redisConnected = true;
          console.log('✅ Redis cache connected');
        });

        this.redis.on('error', (error) => {
          this.stats.redisConnected = false;
          console.warn('⚠️ Redis cache error:', error.message);
        });

        this.redis.on('close', () => {
          this.stats.redisConnected = false;
          console.warn('⚠️ Redis cache disconnected');
        });
      } catch (error) {
        console.warn('⚠️ Failed to initialize Redis cache:', error);
        this.redis = undefined;
      }
    }
  }

  private startCleanupInterval() {
    // Clean up expired memory cache entries every minute
    setInterval(() => {
      this.cleanupMemoryCache();
    }, 60 * 1000);
  }

  private cleanupMemoryCache() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of Array.from(this.memoryCache.entries())) {
      if (now - entry.timestamp > entry.ttl) {
        this.memoryCache.delete(key);
        this.removeFromTagIndex(key, entry.tags);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
    }
  }

  /**
   * Generate cache key from query and parameters
   */
  private generateKey(query: string, params: any = {}, tags: string[] = []): string {
    const queryHash = createHash('md5')
      .update(JSON.stringify({ query, params, tags }))
      .digest('hex');
    
    return `${this.config.keyPrefix}${queryHash}`;
  }

  /**
   * Get data from cache
   */
  async get<T>(query: string, params: any = {}, tags: string[] = []): Promise<T | null> {
    const key = this.generateKey(query, params, tags);
    
    try {
      // Try Redis first if available
      if (this.redis && this.stats.redisConnected) {
        const redisData = await this.redis.get(key);
        if (redisData) {
          const entry: CacheEntry<T> = JSON.parse(redisData);
          if (this.isEntryValid(entry)) {
            this.stats.hits++;
            return entry.data;
          } else {
            // Entry expired, remove it
            await this.redis.del(key);
          }
        }
      }

      // Try memory cache
      const memoryEntry = this.memoryCache.get(key);
      if (memoryEntry && this.isEntryValid(memoryEntry)) {
        this.stats.hits++;
        return memoryEntry.data as T;
      } else if (memoryEntry) {
        // Entry expired, remove it
        this.memoryCache.delete(key);
        this.removeFromTagIndex(key, memoryEntry.tags);
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      console.error('❌ Cache get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set data in cache
   */
  async set<T>(
    query: string, 
    data: T, 
    params: any = {}, 
    tags: string[] = [], 
    ttl?: number
  ): Promise<void> {
    const key = this.generateKey(query, params, tags);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      tags,
      version: 1
    };

    try {
      // Set in Redis if available
      if (this.redis && this.stats.redisConnected) {
        await this.redis.setex(key, Math.ceil(entry.ttl / 1000), JSON.stringify(entry));
      }

      // Set in memory cache
      this.memoryCache.set(key, entry);
      this.addToTagIndex(key, tags);
      this.stats.sets++;

      // Update memory usage stats
      this.updateMemoryUsage();
    } catch (error) {
      console.error('❌ Cache set error:', error);
    }
  }

  /**
   * Delete cache entries by key pattern or tags
   */
  async delete(pattern: string | string[], tags?: string[]): Promise<number> {
    let deleted = 0;

    try {
      if (this.redis && this.stats.redisConnected) {
        if (Array.isArray(pattern)) {
          // Delete multiple keys
          deleted += await this.redis.del(...pattern);
        } else if (pattern.includes('*')) {
          // Delete by pattern
          const keys = await this.redis.keys(pattern);
          if (keys.length > 0) {
            deleted += await this.redis.del(...keys);
          }
        } else {
          // Delete single key
          deleted += await this.redis.del(pattern);
        }
      }

      // Delete from memory cache
      if (Array.isArray(pattern)) {
        pattern.forEach(key => {
          if (this.memoryCache.delete(key)) {
            deleted++;
          }
        });
      } else if (pattern.includes('*')) {
        // Delete by pattern in memory cache
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        for (const key of Array.from(this.memoryCache.keys())) {
          if (regex.test(key)) {
            const entry = this.memoryCache.get(key);
            if (entry) {
              this.removeFromTagIndex(key, entry.tags);
            }
            if (this.memoryCache.delete(key)) {
              deleted++;
            }
          }
        }
      } else {
        const entry = this.memoryCache.get(pattern);
        if (entry) {
          this.removeFromTagIndex(pattern, entry.tags);
        }
        if (this.memoryCache.delete(pattern)) {
          deleted++;
        }
      }

      // Delete by tags
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          const keys = this.tagIndex.get(tag);
          if (keys) {
            for (const key of Array.from(keys)) {
              if (this.memoryCache.delete(key)) {
                deleted++;
              }
              if (this.redis && this.stats.redisConnected) {
                await this.redis.del(key);
                deleted++;
              }
            }
            this.tagIndex.delete(tag);
          }
        }
      }

      this.stats.deletes += deleted;
      this.updateMemoryUsage();
    } catch (error) {
      console.error('❌ Cache delete error:', error);
    }

    return deleted;
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    return this.delete('*', tags);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      if (this.redis && this.stats.redisConnected) {
        const keys = await this.redis.keys(`${this.config.keyPrefix}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }

      this.memoryCache.clear();
      this.tagIndex.clear();
      this.updateMemoryUsage();
    } catch (error) {
      console.error('❌ Cache clear error:', error);
    }
  }

  /**
   * Check if cache entry is valid
   */
  private isEntryValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Add key to tag index
   */
  private addToTagIndex(key: string, tags: string[]): void {
    tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    });
  }

  /**
   * Remove key from tag index
   */
  private removeFromTagIndex(key: string, tags: string[]): void {
    tags.forEach(tag => {
      const keys = this.tagIndex.get(tag);
      if (keys) {
        keys.delete(key);
        if (keys.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    });
  }

  /**
   * Update memory usage statistics
   */
  private updateMemoryUsage(): void {
    let totalSize = 0;
    for (const [key, entry] of Array.from(this.memoryCache.entries())) {
      totalSize += key.length;
      totalSize += JSON.stringify(entry).length;
    }
    this.stats.memoryUsage = totalSize;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number; memoryEntryCount: number } {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
      memoryEntryCount: this.memoryCache.size
    };
  }

  /**
   * Get cache health status
   */
  async getHealth(): Promise<{
    healthy: boolean;
    redis: boolean;
    memory: boolean;
    stats: ReturnType<typeof this.getStats>;
  }> {
    const stats = this.getStats();
    const memoryHealthy = this.memoryCache.size < (this.config.memory?.maxSize || 10000);
    
    let redisHealthy = false;
    if (this.redis) {
      try {
        await this.redis.ping();
        redisHealthy = true;
      } catch (error) {
        redisHealthy = false;
      }
    }

    return {
      healthy: memoryHealthy && (redisHealthy || !this.redis),
      redis: redisHealthy,
      memory: memoryHealthy,
      stats
    };
  }

  /**
   * Warm up cache with common queries
   */
  async warmup(queries: Array<{
    query: string;
    params: any;
    tags: string[];
    ttl?: number;
    data: any;
  }>): Promise<void> {
    console.log(`🔥 Warming up cache with ${queries.length} queries...`);
    
    for (const { query, params, tags, ttl, data } of queries) {
      await this.set(query, data, params, tags, ttl);
    }
    
    console.log('✅ Cache warmup completed');
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

// Global cache manager instance
let globalCacheManager: CacheManager | null = null;

/**
 * Initialize cache manager
 */
export function initializeCache(config?: Partial<CacheConfig>): CacheManager {
  if (globalCacheManager) {
    return globalCacheManager;
  }

  const defaultConfig: CacheConfig = {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0')
    },
    memory: {
      maxSize: 10000,
      ttl: 5 * 60 * 1000
    },
    defaultTTL: 5 * 60 * 1000,
    keyPrefix: 'replivity:cache:',
    ...config
  };

  globalCacheManager = new CacheManager(defaultConfig);
  return globalCacheManager;
}

/**
 * Get cache manager instance
 */
export function getCacheManager(): CacheManager {
  if (!globalCacheManager) {
    throw new Error('Cache manager not initialized. Call initializeCache() first.');
  }
  return globalCacheManager;
}

/**
 * Cache decorator for functions
 */
export function cached(
  ttl: number = 5 * 60 * 1000,
  tags: string[] = [],
  keyGenerator?: (args: any[]) => string
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cache = getCacheManager();

    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator ? keyGenerator(args) : `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = await cache.get(key, args, tags);
      if (cached !== null) {
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      await cache.set(key, result, args, tags, ttl);
      
      return result;
    };
  };
}

/**
 * Query result caching utility
 */
export class QueryCache {
  private cache: CacheManager;

  constructor(cache: CacheManager) {
    this.cache = cache;
  }

  /**
   * Cache a database query result
   */
  async cacheQuery<T>(
    query: string,
    queryFn: () => Promise<T>,
    params: any = {},
    tags: string[] = [],
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.cache.get<T>(query, params, tags);
    if (cached !== null) {
      return cached;
    }

    // Execute query and cache result
    const result = await queryFn();
    await this.cache.set(query, result, params, tags, ttl);
    
    return result;
  }

  /**
   * Cache with automatic key generation
   */
  async cacheData<T>(
    key: string,
    queryFn: () => Promise<T>,
    tags: string[] = [],
    ttl?: number
  ): Promise<T> {
    return this.cacheQuery(key, queryFn, {}, tags, ttl);
  }

  /**
   * Invalidate cache by tags
   */
  async invalidate(tags: string[]): Promise<number> {
    return this.cache.invalidateByTags(tags);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    return this.cache.clear();
  }
}

export { CacheManager, CacheConfig, CacheStats, CacheEntry };
