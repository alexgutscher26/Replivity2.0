# Database Optimization and Indexing

This document outlines the comprehensive database optimization and indexing implementation for the AI Social Replier SaaS application.

## Overview

The optimization implementation includes:
- **Strategic Index Creation**: Optimized indexes for common query patterns
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Caching layer and query optimization utilities
- **Performance Monitoring**: Health checks and performance analytics
- **Automated Optimization**: Scripts for ongoing database maintenance

## Files Created/Modified

### 1. Database Migration
- **File**: `src/server/db/migrations/0003_query_optimization_indexes.sql`
- **Purpose**: Adds strategic indexes across all tables based on query patterns
- **Indexes Added**:
  - User table: email, role, created_at, updated_at
  - Session table: user_id, expires_at
  - Account table: user_id, provider, provider_account_id
  - Generation table: created_at, user_id + created_at composite
  - Billing table: current_period_end, user_id + status composite
  - Usage table: user_id + product_id composite
  - Products table: status, category
  - Hashtag tables: user_id, platform, category
  - Settings table: user_id
  - Verification table: identifier, token

### 2. Connection Pool Configuration
- **File**: `src/server/db/pool.ts`
- **Features**:
  - Optimized connection pool settings
  - Health check functionality
  - Query performance monitoring
  - Retry logic for failed operations
  - Batch operation support

### 3. Query Optimization Layer
- **File**: `src/server/db/query-optimizer.ts`
- **Components**:
  - `QueryCache`: In-memory caching with TTL
  - `cachedQuery`: Wrapper for cached query execution
  - `paginatedQuery`: Optimized pagination
  - `UserQueryOptimizer`: User-specific query optimizations
  - `GenerationQueryOptimizer`: Generation statistics optimization
  - `BillingQueryOptimizer`: Billing and subscription optimizations
  - `QueryAnalyzer`: Performance monitoring and analysis
  - `CacheManager`: Cache invalidation management

### 4. Database Index Integration
- **File**: `src/server/db/index.ts` (updated)
- **Changes**:
  - Integrated optimized connection pool
  - Added query optimization utilities
  - Maintained backward compatibility
  - Added health check exports

### 5. Admin Health Monitoring API
- **File**: `src/app/api/admin/database/health/route.ts`
- **Endpoints**:
  - `GET`: Database health status and performance analytics
  - `DELETE`: Clear all database caches
- **Features**:
  - Admin-only access
  - Performance summaries
  - Slow query identification
  - Cache statistics
  - Optimization recommendations

### 6. Database Optimization Script
- **File**: `scripts/optimize-database.ts`
- **Functionality**:
  - Automated database health checks
  - Migration execution
  - Table statistics analysis
  - Missing index detection
  - Storage optimization
  - Comprehensive reporting

## Usage

### Running Database Optimization

```bash
# Run the complete optimization process
bun run db:optimize

# Or run individual steps
bun run db:push  # Apply migrations
bun run db:studio  # Open Drizzle Studio
```

### Using Query Optimization in Code

```typescript
import { 
  UserQueryOptimizer, 
  GenerationQueryOptimizer,
  cachedQuery,
  optimizedDb 
} from "~/server/db";

// Use cached queries
const user = await cachedQuery(
  'user_by_id',
  () => optimizedDb.query.user.findFirst({ where: eq(user.id, userId) }),
  300 // 5 minute cache
);

// Use optimized user queries
const activeSubscriptions = await UserQueryOptimizer.getActiveSubscriptions(userId);

// Use optimized generation queries
const stats = await GenerationQueryOptimizer.getGenerationStats(userId, 'facebook');
```

### Monitoring Database Health

```bash
# Check database health via API (admin only)
curl -X GET /api/admin/database/health

# Clear all caches
curl -X DELETE /api/admin/database/health
```

## Performance Improvements

### Index Optimizations
1. **Email Lookups**: Added unique index on `replier_user.email`
2. **Session Management**: Optimized `replier_session.expires_at` queries
3. **Date Range Queries**: Added indexes for `created_at` fields
4. **Foreign Key Lookups**: Optimized all foreign key relationships
5. **Status Filtering**: Added indexes for status-based queries
6. **JSONB Optimization**: GIN indexes for JSON column searches

### Query Optimizations
1. **Caching Layer**: In-memory caching with configurable TTL
2. **Connection Pooling**: Optimized connection management
3. **Batch Operations**: Efficient bulk data operations
4. **Pagination**: Optimized offset-based pagination
5. **Prepared Statements**: Enabled for better performance

### Monitoring Features
1. **Health Checks**: Real-time database connectivity monitoring
2. **Performance Analytics**: Query execution time tracking
3. **Slow Query Detection**: Automatic identification of performance issues
4. **Cache Statistics**: Hit/miss ratios and cache effectiveness
5. **Optimization Recommendations**: Automated suggestions for improvements

## Best Practices

### Query Optimization
1. **Use Indexes**: Ensure queries utilize appropriate indexes
2. **Limit Results**: Always use pagination for large datasets
3. **Cache Frequently Accessed Data**: Implement caching for repeated queries
4. **Monitor Performance**: Regularly check query execution times
5. **Batch Operations**: Use batch inserts/updates when possible

### Index Management
1. **Monitor Index Usage**: Regularly check index utilization
2. **Remove Unused Indexes**: Clean up indexes that aren't being used
3. **Composite Indexes**: Use multi-column indexes for complex queries
4. **Partial Indexes**: Consider partial indexes for filtered queries

### Cache Management
1. **Set Appropriate TTL**: Balance freshness with performance
2. **Invalidate Strategically**: Clear caches when data changes
3. **Monitor Cache Hit Rates**: Ensure caches are effective
4. **Size Management**: Monitor memory usage of caches

## Maintenance

### Regular Tasks
1. **Run Optimization Script**: Weekly execution recommended
2. **Monitor Health Endpoint**: Daily health checks
3. **Review Slow Queries**: Weekly analysis of performance issues
4. **Update Statistics**: Regular table statistics updates
5. **Cache Cleanup**: Periodic cache clearing if needed

### Performance Monitoring
1. **Database Health**: Monitor via `/api/admin/database/health`
2. **Query Performance**: Track execution times and identify bottlenecks
3. **Index Effectiveness**: Monitor index usage and hit rates
4. **Cache Performance**: Track cache hit/miss ratios
5. **Connection Pool**: Monitor connection utilization

## Troubleshooting

### Common Issues
1. **Slow Queries**: Check index usage and consider adding missing indexes
2. **High Memory Usage**: Review cache sizes and TTL settings
3. **Connection Pool Exhaustion**: Increase pool size or optimize query patterns
4. **Cache Misses**: Review cache invalidation strategy
5. **Migration Failures**: Check database permissions and constraints

### Debug Commands
```bash
# Check database health
bun run db:optimize

# View database schema
bun run db:studio

# Generate new migration
bun run db:generate

# Apply migrations
bun run db:push
```

## Future Enhancements

1. **Redis Integration**: External caching layer for better scalability
2. **Read Replicas**: Separate read/write database connections
3. **Query Plan Analysis**: Automated EXPLAIN plan analysis
4. **Automated Index Recommendations**: ML-based index suggestions
5. **Real-time Monitoring**: Dashboard for database performance metrics
6. **Backup Optimization**: Automated backup and recovery procedures

## Security Considerations

1. **Admin Access**: Health monitoring endpoint requires admin privileges
2. **Connection Security**: SSL/TLS encryption for database connections
3. **Query Logging**: Sensitive data excluded from performance logs
4. **Cache Security**: No sensitive data stored in caches
5. **Access Control**: Proper database user permissions

This optimization implementation provides a solid foundation for high-performance database operations while maintaining security and scalability.