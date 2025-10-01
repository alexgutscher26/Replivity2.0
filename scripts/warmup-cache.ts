#!/usr/bin/env tsx

/**
 * Cache Warmup Script
 * 
 * This script preloads frequently accessed data into the cache
 * to improve application performance on startup.
 */

import { config } from 'dotenv';
import { join } from 'path';
import { initializeCache, getCacheManager } from '../src/server/db/cache-manager';
import { CacheWarming } from '../src/server/db/cached-queries';

// Load environment variables
config({ path: join(process.cwd(), ".env") });

interface WarmupConfig {
  commonData: boolean;
  userData: string[];
  verbose: boolean;
  batchSize: number;
}

class CacheWarmupManager {
  private config: WarmupConfig;
  private cache: ReturnType<typeof getCacheManager>;

  constructor(config: WarmupConfig) {
    this.config = config;
    this.cache = getCacheManager();
  }

  /**
   * Run cache warmup
   */
  async warmup(): Promise<void> {
    console.log('🔥 Starting cache warmup...');
    console.log(`📊 Configuration:`, {
      commonData: this.config.commonData,
      userCount: this.config.userData.length,
      batchSize: this.config.batchSize,
      verbose: this.config.verbose
    });
    console.log('');

    const startTime = Date.now();

    try {
      // Warm up common data
      if (this.config.commonData) {
        await this.warmupCommonData();
      }

      // Warm up user-specific data
      if (this.config.userData.length > 0) {
        await this.warmupUserData();
      }

      const duration = Date.now() - startTime;
      console.log(`\n✅ Cache warmup completed in ${this.formatDuration(duration)}`);

      // Show cache statistics
      await this.showCacheStats();

    } catch (error) {
      console.error('❌ Cache warmup failed:', error);
      throw error;
    }
  }

  /**
   * Warm up common data
   */
  private async warmupCommonData(): Promise<void> {
    console.log('🌍 Warming up common data...');
    const startTime = Date.now();

    try {
      await CacheWarming.warmupCommonData();
      
      const duration = Date.now() - startTime;
      console.log(`✅ Common data warmup completed in ${this.formatDuration(duration)}`);
    } catch (error) {
      console.error('❌ Common data warmup failed:', error);
      throw error;
    }
  }

  /**
   * Warm up user-specific data
   */
  private async warmupUserData(): Promise<void> {
    console.log(`👥 Warming up data for ${this.config.userData.length} users...`);
    const startTime = Date.now();

    try {
      // Process users in batches
      const batches = this.chunkArray(this.config.userData, this.config.batchSize);
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`   Processing batch ${i + 1}/${batches.length} (${batch.length} users)...`);

        const batchPromises = batch.map(async (userId) => {
          try {
            await CacheWarming.warmupUserData(userId);
            if (this.config.verbose) {
              console.log(`     ✅ User ${userId} warmed up`);
            }
          } catch (error) {
            console.warn(`     ⚠️  Failed to warm up user ${userId}:`, error);
          }
        });

        await Promise.all(batchPromises);
      }

      const duration = Date.now() - startTime;
      console.log(`✅ User data warmup completed in ${this.formatDuration(duration)}`);
    } catch (error) {
      console.error('❌ User data warmup failed:', error);
      throw error;
    }
  }

  /**
   * Show cache statistics
   */
  private async showCacheStats(): Promise<void> {
    try {
      const stats = this.cache.getStats();
      const health = await this.cache.getHealth();

      console.log('\n📊 Cache Statistics:');
      console.log('=' .repeat(40));
      console.log(`🎯 Hit Rate: ${stats.hitRate.toFixed(2)}%`);
      console.log(`📈 Total Hits: ${stats.hits}`);
      console.log(`📉 Total Misses: ${stats.misses}`);
      console.log(`💾 Cache Sets: ${stats.sets}`);
      console.log(`🗑️  Cache Deletes: ${stats.deletes}`);
      console.log(`📦 Memory Entries: ${stats.memoryEntryCount}`);
      console.log(`💽 Memory Usage: ${this.formatBytes(stats.memoryUsage)}`);
      console.log('');
      console.log('🏥 Health Status:');
      console.log(`   Overall: ${health.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
      console.log(`   Redis: ${health.redis ? '✅ Connected' : '❌ Disconnected'}`);
      console.log(`   Memory: ${health.memory ? '✅ Healthy' : '❌ Overloaded'}`);
    } catch (error) {
      console.error('❌ Failed to get cache statistics:', error);
    }
  }

  /**
   * Split array into chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Format duration to human readable format
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
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
}

/**
 * Parse command line arguments
 */
function parseArguments(): WarmupConfig {
  const args = process.argv.slice(2);
  
  const config: WarmupConfig = {
    commonData: true,
    userData: [],
    verbose: false,
    batchSize: 10
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--no-common':
        config.commonData = false;
        break;
      case '--users':
        // Next argument should be comma-separated user IDs
        if (i + 1 < args.length) {
          config.userData = args[i + 1].split(',').map(id => id.trim());
          i++; // Skip next argument
        }
        break;
      case '--verbose':
      case '-v':
        config.verbose = true;
        break;
      case '--batch-size':
        if (i + 1 < args.length) {
          config.batchSize = parseInt(args[i + 1]) || 10;
          i++; // Skip next argument
        }
        break;
      case '--help':
      case '-h':
        console.log(`
Cache Warmup Script

Usage: tsx scripts/warmup-cache.ts [options]

Options:
  --no-common              Skip common data warmup
  --users <ids>            Comma-separated list of user IDs to warm up
  --batch-size <size>      Number of users to process in parallel (default: 10)
  --verbose, -v            Enable verbose output
  --help, -h               Show this help message

Examples:
  tsx scripts/warmup-cache.ts
  tsx scripts/warmup-cache.ts --users "user1,user2,user3"
  tsx scripts/warmup-cache.ts --no-common --verbose
  tsx scripts/warmup-cache.ts --batch-size 5 --users "user1,user2"
        `);
        process.exit(0);
        break;
    }
  }

  return config;
}

/**
 * Main execution function
 */
async function runCacheWarmup(): Promise<void> {
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

    // Parse configuration
    const warmupConfig = parseArguments();

    // Create and run warmup manager
    const warmupManager = new CacheWarmupManager(warmupConfig);
    await warmupManager.warmup();

  } catch (error) {
    console.error('❌ Cache warmup failed:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  runCacheWarmup()
    .then(() => {
      console.log('✅ Cache warmup script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cache warmup script failed:', error);
      process.exit(1);
    });
}
