import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), ".env") });

console.log('🚀 Starting simple cache monitoring...');

async function runSimpleCacheMonitor() {
  try {
    // Initialize cache
    console.log('🔧 Initializing cache manager...');
    const { initializeCache, getCacheManager } = await import('../src/server/db/cache-manager');
    
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

    // Initial health check
    console.log('🏥 Cache Health Check:');
    const health = await cache.getHealth();
    const stats = cache.getStats();
    
    console.log(`   Status: ${health.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    console.log(`   Redis: ${health.redis ? '✅ Connected' : '❌ Disconnected'}`);
    console.log(`   Memory: ${health.memory ? '✅ Healthy' : '❌ Overloaded'}`);
    console.log(`   Hit Rate: ${stats.hitRate.toFixed(2)}%`);
    console.log(`   Memory Entries: ${stats.memoryEntryCount}`);
    console.log(`   Memory Usage: ${formatBytes(stats.memoryUsage)}`);
    console.log('');

    // Test some cache operations
    console.log('🧪 Testing cache operations...');
    await cache.set('test:monitor', { timestamp: Date.now() }, {}, ['test'], 30000);
    const testResult = await cache.get('test:monitor', {}, ['test']);
    console.log('✅ Cache operations working:', testResult ? 'Yes' : 'No');

    // Final stats
    console.log('\n📊 Final Statistics:');
    const finalStats = cache.getStats();
    console.log(`   Hit Rate: ${finalStats.hitRate.toFixed(2)}%`);
    console.log(`   Total Hits: ${finalStats.hits}`);
    console.log(`   Total Misses: ${finalStats.misses}`);
    console.log(`   Cache Sets: ${finalStats.sets}`);
    console.log(`   Memory Entries: ${finalStats.memoryEntryCount}`);
    console.log(`   Memory Usage: ${formatBytes(finalStats.memoryUsage)}`);

    console.log('\n✅ Simple cache monitoring completed successfully!');

  } catch (error) {
    console.error('❌ Cache monitoring failed:', error);
    process.exit(1);
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Run the monitoring
runSimpleCacheMonitor()
  .then(() => {
    console.log('✅ Monitoring completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Monitoring failed:', error);
    process.exit(1);
  });
