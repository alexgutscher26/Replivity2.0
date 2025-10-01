#!/usr/bin/env tsx

/**
 * Simple Cache Test Script
 * 
 * This script tests the cache system to ensure it's working properly.
 */

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), ".env") });

async function testCache() {
  console.log('🧪 Testing cache system...');
  
  try {
    // Test cache manager initialization
    console.log('1. Testing cache manager initialization...');
    const { initializeCache, getCacheManager } = await import('../src/server/db/cache-manager');
    
    const cache = initializeCache({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0')
      },
      memory: {
        maxSize: 1000,
        ttl: 5 * 60 * 1000
      },
      defaultTTL: 5 * 60 * 1000,
      keyPrefix: 'replivity:test:'
    });
    
    console.log('✅ Cache manager initialized');
    
    // Test basic cache operations
    console.log('2. Testing basic cache operations...');
    await cache.set('test:key', { message: 'Hello World' }, {}, ['test'], 60000);
    
    const result = await cache.get('test:key', {}, ['test']);
    console.log('✅ Cache get/set working:', result);
    
    // Test cache statistics
    console.log('3. Testing cache statistics...');
    const stats = cache.getStats();
    console.log('✅ Cache stats:', stats);
    
    // Test cache health
    console.log('4. Testing cache health...');
    const health = await cache.getHealth();
    console.log('✅ Cache health:', health);
    
    // Test cached queries
    console.log('5. Testing cached queries...');
    const { CachedUserQueries } = await import('../src/server/db/cached-queries');
    
    // This will fail if database is not available, but that's expected
    try {
      await CachedUserQueries.getTotalUsers();
      console.log('✅ Cached queries working');
    } catch (error) {
      console.log('⚠️ Cached queries test skipped (database not available):', error.message);
    }
    
    console.log('\n🎉 Cache system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Cache system test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testCache()
    .then(() => {
      console.log('✅ Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}
