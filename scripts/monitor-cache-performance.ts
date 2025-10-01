#!/usr/bin/env tsx

/**
 * Cache Performance Monitoring Script
 * 
 * This script monitors cache performance, provides statistics,
 * and helps optimize cache configuration.
 */

import { config } from 'dotenv';
import { join } from 'path';
import { initializeCache, getCacheManager } from '../src/server/db/cache-manager';

// Load environment variables
config({ path: join(process.cwd(), ".env") });

interface CacheMonitorConfig {
  interval: number; // milliseconds
  duration: number; // milliseconds
  verbose: boolean;
}

class CacheMonitor {
  private config: CacheMonitorConfig;
  private cache: ReturnType<typeof getCacheManager>;
  private startTime: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private stats: Array<{
    timestamp: number;
    stats: ReturnType<typeof this.cache.getStats>;
    health: Awaited<ReturnType<typeof this.cache.getHealth>>;
  }> = [];

  constructor(config: CacheMonitorConfig) {
    this.config = config;
    this.cache = getCacheManager();
  }

  /**
   * Start monitoring cache performance
   */
  async start(): Promise<void> {
    console.log('🚀 Starting cache performance monitoring...');
    console.log(`📊 Monitoring interval: ${this.config.interval}ms`);
    console.log(`⏱️  Duration: ${this.config.duration}ms`);
    console.log('');

    this.startTime = Date.now();

    // Initial health check
    await this.checkHealth();

    // Start monitoring interval
    this.intervalId = setInterval(async () => {
      await this.collectStats();
    }, this.config.interval);

    // Stop after duration
    setTimeout(() => {
      this.stop();
    }, this.config.duration);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.generateReport();
    console.log('\n✅ Cache monitoring completed');
  }

  /**
   * Check cache health
   */
  private async checkHealth(): Promise<void> {
    try {
      const health = await this.cache.getHealth();
      const stats = this.cache.getStats();

      console.log('🏥 Cache Health Check:');
      console.log(`   Status: ${health.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
      console.log(`   Redis: ${health.redis ? '✅ Connected' : '❌ Disconnected'}`);
      console.log(`   Memory: ${health.memory ? '✅ Healthy' : '❌ Overloaded'}`);
      console.log(`   Hit Rate: ${stats.hitRate.toFixed(2)}%`);
      console.log(`   Memory Entries: ${stats.memoryEntryCount}`);
      console.log(`   Memory Usage: ${this.formatBytes(stats.memoryUsage)}`);
      console.log('');

      if (!health.healthy) {
        console.warn('⚠️  Cache health issues detected!');
        if (!health.redis && process.env.REDIS_HOST) {
          console.warn('   - Redis connection failed');
        }
        if (!health.memory) {
          console.warn('   - Memory cache is overloaded');
        }
        console.log('');
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  }

  /**
   * Collect cache statistics
   */
  private async collectStats(): Promise<void> {
    try {
      const stats = this.cache.getStats();
      const health = await this.cache.getHealth();

      this.stats.push({
        timestamp: Date.now(),
        stats,
        health
      });

      if (this.config.verbose) {
        console.log(`📊 [${new Date().toISOString()}] Hit Rate: ${stats.hitRate.toFixed(2)}%, Entries: ${stats.memoryEntryCount}`);
      }
    } catch (error) {
      console.error('❌ Failed to collect stats:', error);
    }
  }

  /**
   * Generate performance report
   */
  private generateReport(): void {
    if (this.stats.length === 0) {
      console.log('❌ No statistics collected');
      return;
    }

    const duration = Date.now() - this.startTime;
    const avgHitRate = this.stats.reduce((sum, s) => sum + s.stats.hitRate, 0) / this.stats.length;
    const maxHitRate = Math.max(...this.stats.map(s => s.stats.hitRate));
    const minHitRate = Math.min(...this.stats.map(s => s.stats.hitRate));
    
    const avgMemoryUsage = this.stats.reduce((sum, s) => sum + s.stats.memoryUsage, 0) / this.stats.length;
    const maxMemoryUsage = Math.max(...this.stats.map(s => s.stats.memoryUsage));
    
    const avgMemoryEntries = this.stats.reduce((sum, s) => sum + s.stats.memoryEntryCount, 0) / this.stats.length;
    const maxMemoryEntries = Math.max(...this.stats.map(s => s.stats.memoryEntryCount));

    const redisUptime = this.stats.filter(s => s.health.redis).length / this.stats.length * 100;
    const memoryHealth = this.stats.filter(s => s.health.memory).length / this.stats.length * 100;

    console.log('\n📈 Cache Performance Report');
    console.log('=' .repeat(50));
    console.log(`⏱️  Monitoring Duration: ${this.formatDuration(duration)}`);
    console.log(`📊 Data Points Collected: ${this.stats.length}`);
    console.log('');

    console.log('🎯 Hit Rate Performance:');
    console.log(`   Average: ${avgHitRate.toFixed(2)}%`);
    console.log(`   Maximum: ${maxHitRate.toFixed(2)}%`);
    console.log(`   Minimum: ${minHitRate.toFixed(2)}%`);
    console.log('');

    console.log('💾 Memory Performance:');
    console.log(`   Average Usage: ${this.formatBytes(avgMemoryUsage)}`);
    console.log(`   Peak Usage: ${this.formatBytes(maxMemoryUsage)}`);
    console.log(`   Average Entries: ${Math.round(avgMemoryEntries)}`);
    console.log(`   Peak Entries: ${maxMemoryEntries}`);
    console.log('');

    console.log('🏥 Health Metrics:');
    console.log(`   Redis Uptime: ${redisUptime.toFixed(1)}%`);
    console.log(`   Memory Health: ${memoryHealth.toFixed(1)}%`);
    console.log('');

    // Performance recommendations
    this.generateRecommendations(avgHitRate, avgMemoryUsage, redisUptime, memoryHealth);
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    avgHitRate: number,
    avgMemoryUsage: number,
    redisUptime: number,
    memoryHealth: number
  ): void {
    console.log('💡 Performance Recommendations:');
    console.log('=' .repeat(50));

    if (avgHitRate < 50) {
      console.log('⚠️  Low hit rate detected:');
      console.log('   - Consider increasing cache TTL for frequently accessed data');
      console.log('   - Review cache key generation strategy');
      console.log('   - Check for cache invalidation patterns');
    } else if (avgHitRate > 90) {
      console.log('✅ Excellent hit rate! Cache is performing well');
    }

    if (avgMemoryUsage > 100 * 1024 * 1024) { // 100MB
      console.log('⚠️  High memory usage detected:');
      console.log('   - Consider reducing cache TTL');
      console.log('   - Implement cache size limits');
      console.log('   - Review data being cached');
    }

    if (redisUptime < 95) {
      console.log('⚠️  Redis connection issues:');
      console.log('   - Check Redis server status');
      console.log('   - Review network connectivity');
      console.log('   - Consider Redis connection pooling');
    }

    if (memoryHealth < 95) {
      console.log('⚠️  Memory cache health issues:');
      console.log('   - Consider increasing memory limits');
      console.log('   - Implement cache eviction policies');
      console.log('   - Monitor memory usage patterns');
    }

    console.log('');
    console.log('🔧 Configuration Suggestions:');
    console.log('   - Set appropriate TTL values based on data freshness requirements');
    console.log('   - Use cache tags for efficient invalidation');
    console.log('   - Monitor cache hit rates and adjust accordingly');
    console.log('   - Consider Redis for distributed caching');
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Format duration to human readable format
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

/**
 * Main execution function
 */
async function runCacheMonitoring(): Promise<void> {
  try {
    // Initialize cache
    console.log('🔧 Initializing cache manager...');
    initializeCache({
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

    // Parse command line arguments
    const args = process.argv.slice(2);
    const interval = parseInt(args[0]) || 5000; // 5 seconds default
    const duration = parseInt(args[1]) || 60000; // 1 minute default
    const verbose = args.includes('--verbose') || args.includes('-v');

    // Create and start monitor
    const monitor = new CacheMonitor({
      interval,
      duration,
      verbose
    });

    await monitor.start();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Received SIGINT, stopping monitor...');
      monitor.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM, stopping monitor...');
      monitor.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Cache monitoring failed:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  runCacheMonitoring()
    .then(() => {
      console.log('✅ Cache monitoring script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cache monitoring script failed:', error);
      process.exit(1);
    });
}
