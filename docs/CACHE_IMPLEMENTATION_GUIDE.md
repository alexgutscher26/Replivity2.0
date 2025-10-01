# Cache Implementation Guide

This guide covers the comprehensive query result caching system implemented in Replivity, including Redis support, intelligent cache management, and performance optimization.

## 🎯 Overview

The caching system provides:
- **Multi-tier caching** with Redis and in-memory options
- **Intelligent TTL management** based on data types
- **Tag-based invalidation** for efficient cache management
- **Performance monitoring** and statistics
- **Cache warming** for improved startup performance
- **Automatic fallback** to in-memory cache when Redis is unavailable

## 🏗️ Architecture

### Core Components

1. **CacheManager** (`src/server/db/cache-manager.ts`)
   - Central cache management with Redis and memory support
   - Intelligent TTL and invalidation handling
   - Performance monitoring and statistics

2. **CachedQueries** (`src/server/db/cached-queries.ts`)
   - Pre-built cached versions of common database queries
   - Organized by data type (User, Generation, Billing, etc.)
   - Automatic cache invalidation

3. **CacheConfig** (`src/server/db/cache-config.ts`)
   - Centralized configuration for all cache settings
   - TTL constants and cache strategies
   - Invalidation patterns

4. **QueryOptimizer** (`src/server/db/query-optimizer.ts`)
   - Enhanced with advanced caching support
   - Backward compatibility with legacy cache
   - Performance monitoring integration

## 🚀 Getting Started

### 1. Environment Setup

Add Redis configuration to your `.env` file:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Cache Configuration
CACHE_MEMORY_MAX_SIZE=10000
CACHE_MEMORY_TTL=300000
CACHE_DEFAULT_TTL=300000
CACHE_KEY_PREFIX=replivity:cache:
```

### 2. Initialize Cache

```typescript
import { initializeCache, getCacheManager } from '@/server/db/cache-manager';

// Initialize cache with configuration
const cache = initializeCache({
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
  keyPrefix: 'replivity:cache:'
});
```

### 3. Use Cached Queries

```typescript
import { CachedUserQueries, CachedGenerationQueries } from '@/server/db/cached-queries';

// Get user data with caching
const user = await CachedUserQueries.getUserById('user123');

// Get generation stats with caching
const stats = await CachedGenerationQueries.getGenerationStats('user123');
```

## 📊 Cache Strategies

### TTL Configuration

Different data types have optimized TTL values:

```typescript
const CACHE_TTL = {
  USER_DATA: 10 * 60 * 1000,        // 10 minutes
  GENERATION_STATS: 5 * 60 * 1000,   // 5 minutes
  BILLING_DATA: 15 * 60 * 1000,      // 15 minutes
  BLOG_POSTS: 2 * 60 * 1000,         // 2 minutes
  ANALYTICS: 1 * 60 * 1000,          // 1 minute
  SETTINGS: 30 * 60 * 1000,          // 30 minutes
  SECURITY_EVENTS: 5 * 60 * 1000,    // 5 minutes
  HASHTAG_DATA: 10 * 60 * 1000       // 10 minutes
};
```

### Cache Tags

Use tags for efficient invalidation:

```typescript
const CACHE_TAGS = {
  USER: 'user',
  GENERATION: 'generation',
  BILLING: 'billing',
  BLOG: 'blog',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  SECURITY: 'security',
  HASHTAG: 'hashtag'
};
```

## 🔧 Usage Examples

### Basic Caching

```typescript
import { getCacheManager } from '@/server/db/cache-manager';

const cache = getCacheManager();

// Cache a query result
const result = await cache.cacheQuery(
  'getUserData',
  async () => {
    return await db.select().from(user).where(eq(user.id, userId));
  },
  { userId },
  ['user'],
  10 * 60 * 1000 // 10 minutes
);
```

### Advanced Caching with QueryCache

```typescript
import { QueryCache } from '@/server/db/cache-manager';

const queryCache = new QueryCache(getCacheManager());

// Cache with automatic key generation
const data = await queryCache.cache(
  'user_dashboard_data',
  async () => {
    // Your query logic here
    return await getUserDashboardData(userId);
  },
  ['user', 'dashboard'],
  5 * 60 * 1000
);
```

### Cache Invalidation

```typescript
import { CacheInvalidation } from '@/server/db/cached-queries';

// Invalidate user-related cache
await CacheInvalidation.invalidateUser('user123');

// Invalidate by event type
await CacheInvalidation.invalidateByEvent('user:updated', 'user123');

// Invalidate all cache
await CacheInvalidation.invalidateAll();
```

## 📈 Performance Monitoring

### Cache Statistics

```typescript
import { getCacheManager } from '@/server/db/cache-manager';

const cache = getCacheManager();
const stats = cache.getStats();

console.log('Hit Rate:', stats.hitRate);
console.log('Memory Usage:', stats.memoryUsage);
console.log('Cache Entries:', stats.memoryEntryCount);
```

### Health Monitoring

```typescript
const health = await cache.getHealth();

console.log('Cache Healthy:', health.healthy);
console.log('Redis Connected:', health.redis);
console.log('Memory Healthy:', health.memory);
```

## 🛠️ Scripts and Tools

### Cache Monitoring

Monitor cache performance in real-time:

```bash
# Monitor for 5 minutes with 2-second intervals
npm run cache:monitor 2000 300000 --verbose

# Monitor for 1 hour with 10-second intervals
npm run cache:monitor 10000 3600000
```

### Cache Warmup

Preload frequently accessed data:

```bash
# Warm up common data
npm run cache:warmup

# Warm up specific users
npm run cache:warmup --users "user1,user2,user3"

# Warm up with custom batch size
npm run cache:warmup --batch-size 5 --users "user1,user2,user3,user4,user5"
```

## 🔄 Cache Invalidation Patterns

### Event-Based Invalidation

```typescript
// User events
await CacheInvalidation.invalidateByEvent('user:created');
await CacheInvalidation.invalidateByEvent('user:updated', userId);
await CacheInvalidation.invalidateByEvent('user:deleted', userId);

// Generation events
await CacheInvalidation.invalidateByEvent('generation:created');
await CacheInvalidation.invalidateByEvent('generation:updated', userId);

// Billing events
await CacheInvalidation.invalidateByEvent('billing:created');
await CacheInvalidation.invalidateByEvent('billing:updated', userId);
```

### Manual Invalidation

```typescript
// Invalidate by tags
await cache.invalidateByTags(['user', 'analytics']);

// Invalidate by pattern
await cache.delete('user:*');
await cache.delete('generation:*');

// Clear all cache
await cache.clear();
```

## 🎛️ Configuration Options

### Redis Configuration

```typescript
const redisConfig = {
  host: 'localhost',
  port: 6379,
  password: 'your_password',
  db: 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true
};
```

### Memory Configuration

```typescript
const memoryConfig = {
  maxSize: 10000,        // Maximum number of entries
  ttl: 5 * 60 * 1000     // Default TTL in milliseconds
};
```

### Cache Strategies

```typescript
const strategy = {
  ttl: 10 * 60 * 1000,
  tags: ['user', 'profile'],
  invalidationPatterns: ['user:*', 'profile:*'],
  warmup: true,
  priority: 'high'
};
```

## 🚨 Error Handling

### Redis Connection Issues

The cache system automatically falls back to in-memory caching when Redis is unavailable:

```typescript
try {
  const cache = getCacheManager();
  // Cache operations will work with in-memory fallback
} catch (error) {
  console.warn('Redis unavailable, using in-memory cache');
}
```

### Cache Errors

```typescript
try {
  const result = await cache.cacheQuery('query', queryFn, params, tags, ttl);
} catch (error) {
  console.error('Cache operation failed:', error);
  // Fallback to direct database query
  const result = await queryFn();
}
```

## 📊 Performance Optimization

### Best Practices

1. **Use appropriate TTL values** based on data freshness requirements
2. **Implement cache warming** for frequently accessed data
3. **Monitor cache hit rates** and adjust TTL accordingly
4. **Use cache tags** for efficient invalidation
5. **Implement cache fallbacks** for critical operations

### Monitoring Metrics

- **Hit Rate**: Percentage of cache hits vs misses
- **Memory Usage**: Current memory consumption
- **Redis Uptime**: Redis connection stability
- **Cache Entries**: Number of cached items
- **Query Performance**: Average query execution time

## 🔧 Troubleshooting

### Common Issues

1. **Low Hit Rate**
   - Increase TTL for frequently accessed data
   - Review cache key generation strategy
   - Check for excessive cache invalidation

2. **High Memory Usage**
   - Reduce cache TTL
   - Implement cache size limits
   - Review data being cached

3. **Redis Connection Issues**
   - Check Redis server status
   - Verify network connectivity
   - Review Redis configuration

4. **Cache Inconsistency**
   - Implement proper invalidation patterns
   - Use cache tags effectively
   - Monitor invalidation events

### Debug Mode

Enable verbose logging:

```bash
npm run cache:monitor --verbose
```

## 🚀 Advanced Features

### Cache Decorators

```typescript
import { cached } from '@/server/db/cache-manager';

class UserService {
  @cached(5 * 60 * 1000, ['user'], (args) => `user:${args[0]}`)
  async getUserById(userId: string) {
    return await db.select().from(user).where(eq(user.id, userId));
  }
}
```

### Custom Cache Strategies

```typescript
const customStrategy = {
  ttl: 15 * 60 * 1000,
  tags: ['custom', 'data'],
  invalidationPatterns: ['custom:*'],
  warmup: false,
  priority: 'medium'
};
```

### Cache Warming

```typescript
import { CacheWarming } from '@/server/db/cached-queries';

// Warm up common data
await CacheWarming.warmupCommonData();

// Warm up user-specific data
await CacheWarming.warmupUserData('user123');
```

## 📚 API Reference

### CacheManager

- `get(key, params, tags)`: Get cached data
- `set(key, data, params, tags, ttl)`: Set cached data
- `delete(pattern, tags)`: Delete cached data
- `invalidateByTags(tags)`: Invalidate by tags
- `clear()`: Clear all cache
- `getStats()`: Get cache statistics
- `getHealth()`: Get cache health status

### QueryCache

- `cacheQuery(query, queryFn, params, tags, ttl)`: Cache query result
- `cache(key, queryFn, tags, ttl)`: Cache with key
- `invalidate(tags)`: Invalidate by tags
- `clear()`: Clear all cache

### CacheInvalidation

- `invalidateUser(userId)`: Invalidate user cache
- `invalidateGeneration(userId)`: Invalidate generation cache
- `invalidateBilling(userId)`: Invalidate billing cache
- `invalidateByEvent(event, userId)`: Invalidate by event
- `invalidateAll()`: Invalidate all cache

This comprehensive caching system provides significant performance improvements while maintaining data consistency and providing excellent monitoring capabilities.
