/**
 * Cache Configuration
 * 
 * Centralized configuration for all caching settings,
 * TTL values, and cache strategies.
 */

export interface CacheConfig {
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
    retryDelayOnFailover?: number;
    maxRetriesPerRequest?: number;
    lazyConnect?: boolean;
  };
  memory?: {
    maxSize: number;
    ttl: number;
  };
  defaultTTL: number;
  keyPrefix: string;
  strategies: {
    [key: string]: CacheStrategy;
  };
}

export interface CacheStrategy {
  ttl: number;
  tags: string[];
  invalidationPatterns: string[];
  warmup: boolean;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Cache TTL constants (in milliseconds)
 */
export const CACHE_TTL = {
  // User data - 10 minutes
  USER_DATA: 10 * 60 * 1000,
  
  // Generation data - 5 minutes
  GENERATION_STATS: 5 * 60 * 1000,
  GENERATION_QUERIES: 3 * 60 * 1000,
  
  // Billing data - 15 minutes
  BILLING_DATA: 15 * 60 * 1000,
  SUBSCRIPTION_DATA: 10 * 60 * 1000,
  
  // Blog data - 2 minutes
  BLOG_POSTS: 2 * 60 * 1000,
  BLOG_STATS: 5 * 60 * 1000,
  
  // Analytics data - 1 minute
  ANALYTICS: 1 * 60 * 1000,
  DASHBOARD_ANALYTICS: 2 * 60 * 1000,
  REAL_TIME_ANALYTICS: 30 * 1000, // 30 seconds
  
  // Settings data - 30 minutes
  SETTINGS: 30 * 60 * 1000,
  USER_SETTINGS: 15 * 60 * 1000,
  
  // Security data - 5 minutes
  SECURITY_EVENTS: 5 * 60 * 1000,
  SECURITY_STATS: 2 * 60 * 1000,
  
  // Hashtag data - 10 minutes
  HASHTAG_DATA: 10 * 60 * 1000,
  HASHTAG_PERFORMANCE: 5 * 60 * 1000,
  
  // Session data - 1 hour
  SESSION_DATA: 60 * 60 * 1000,
  
  // Static data - 1 hour
  STATIC_DATA: 60 * 60 * 1000,
  
  // API responses - 30 seconds
  API_RESPONSES: 30 * 1000,
} as const;

/**
 * Cache tags for invalidation
 */
export const CACHE_TAGS = {
  USER: 'user',
  GENERATION: 'generation',
  BILLING: 'billing',
  BLOG: 'blog',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  SECURITY: 'security',
  HASHTAG: 'hashtag',
  SESSION: 'session',
  API: 'api',
  STATIC: 'static'
} as const;

/**
 * Cache strategies for different data types
 */
export const CACHE_STRATEGIES: { [key: string]: CacheStrategy } = {
  // User strategies
  'user:profile': {
    ttl: CACHE_TTL.USER_DATA,
    tags: [CACHE_TAGS.USER],
    invalidationPatterns: ['user:*', 'user_profile:*'],
    warmup: true,
    priority: 'high'
  },
  
  'user:dashboard': {
    ttl: CACHE_TTL.USER_DATA,
    tags: [CACHE_TAGS.USER, CACHE_TAGS.GENERATION, CACHE_TAGS.BILLING],
    invalidationPatterns: ['user:*', 'generation:*', 'billing:*'],
    warmup: true,
    priority: 'high'
  },
  
  'user:settings': {
    ttl: CACHE_TTL.USER_SETTINGS,
    tags: [CACHE_TAGS.USER, CACHE_TAGS.SETTINGS],
    invalidationPatterns: ['user:*', 'settings:*'],
    warmup: false,
    priority: 'medium'
  },

  // Generation strategies
  'generation:stats': {
    ttl: CACHE_TTL.GENERATION_STATS,
    tags: [CACHE_TAGS.GENERATION, CACHE_TAGS.ANALYTICS],
    invalidationPatterns: ['generation:*', 'analytics:*'],
    warmup: true,
    priority: 'high'
  },
  
  'generation:platform': {
    ttl: CACHE_TTL.GENERATION_STATS,
    tags: [CACHE_TAGS.GENERATION, CACHE_TAGS.ANALYTICS],
    invalidationPatterns: ['generation:*', 'platform:*'],
    warmup: true,
    priority: 'high'
  },
  
  'generation:user': {
    ttl: CACHE_TTL.GENERATION_QUERIES,
    tags: [CACHE_TAGS.GENERATION, CACHE_TAGS.USER],
    invalidationPatterns: ['generation:*', 'user:*'],
    warmup: false,
    priority: 'medium'
  },

  // Billing strategies
  'billing:subscriptions': {
    ttl: CACHE_TTL.BILLING_DATA,
    tags: [CACHE_TAGS.BILLING],
    invalidationPatterns: ['billing:*', 'subscription:*'],
    warmup: true,
    priority: 'high'
  },
  
  'billing:user': {
    ttl: CACHE_TTL.SUBSCRIPTION_DATA,
    tags: [CACHE_TAGS.BILLING, CACHE_TAGS.USER],
    invalidationPatterns: ['billing:*', 'user:*'],
    warmup: false,
    priority: 'medium'
  },

  // Blog strategies
  'blog:posts': {
    ttl: CACHE_TTL.BLOG_POSTS,
    tags: [CACHE_TAGS.BLOG],
    invalidationPatterns: ['blog:*', 'post:*'],
    warmup: true,
    priority: 'medium'
  },
  
  'blog:stats': {
    ttl: CACHE_TTL.BLOG_STATS,
    tags: [CACHE_TAGS.BLOG, CACHE_TAGS.ANALYTICS],
    invalidationPatterns: ['blog:*', 'analytics:*'],
    warmup: true,
    priority: 'medium'
  },

  // Analytics strategies
  'analytics:dashboard': {
    ttl: CACHE_TTL.DASHBOARD_ANALYTICS,
    tags: [CACHE_TAGS.ANALYTICS],
    invalidationPatterns: ['analytics:*', 'dashboard:*'],
    warmup: true,
    priority: 'high'
  },
  
  'analytics:realtime': {
    ttl: CACHE_TTL.REAL_TIME_ANALYTICS,
    tags: [CACHE_TAGS.ANALYTICS],
    invalidationPatterns: ['analytics:*', 'realtime:*'],
    warmup: false,
    priority: 'high'
  },
  
  'analytics:platform': {
    ttl: CACHE_TTL.ANALYTICS,
    tags: [CACHE_TAGS.ANALYTICS, CACHE_TAGS.GENERATION],
    invalidationPatterns: ['analytics:*', 'generation:*', 'platform:*'],
    warmup: true,
    priority: 'high'
  },

  // Settings strategies
  'settings:global': {
    ttl: CACHE_TTL.SETTINGS,
    tags: [CACHE_TAGS.SETTINGS],
    invalidationPatterns: ['settings:*'],
    warmup: true,
    priority: 'low'
  },
  
  'settings:user': {
    ttl: CACHE_TTL.USER_SETTINGS,
    tags: [CACHE_TAGS.SETTINGS, CACHE_TAGS.USER],
    invalidationPatterns: ['settings:*', 'user:*'],
    warmup: false,
    priority: 'medium'
  },

  // Security strategies
  'security:events': {
    ttl: CACHE_TTL.SECURITY_EVENTS,
    tags: [CACHE_TAGS.SECURITY],
    invalidationPatterns: ['security:*', 'event:*'],
    warmup: false,
    priority: 'low'
  },
  
  'security:stats': {
    ttl: CACHE_TTL.SECURITY_STATS,
    tags: [CACHE_TAGS.SECURITY, CACHE_TAGS.ANALYTICS],
    invalidationPatterns: ['security:*', 'analytics:*'],
    warmup: true,
    priority: 'medium'
  },

  // Hashtag strategies
  'hashtag:sets': {
    ttl: CACHE_TTL.HASHTAG_DATA,
    tags: [CACHE_TAGS.HASHTAG],
    invalidationPatterns: ['hashtag:*', 'set:*'],
    warmup: false,
    priority: 'medium'
  },
  
  'hashtag:performance': {
    ttl: CACHE_TTL.HASHTAG_PERFORMANCE,
    tags: [CACHE_TAGS.HASHTAG, CACHE_TAGS.ANALYTICS],
    invalidationPatterns: ['hashtag:*', 'performance:*', 'analytics:*'],
    warmup: false,
    priority: 'medium'
  },

  // Session strategies
  'session:data': {
    ttl: CACHE_TTL.SESSION_DATA,
    tags: [CACHE_TAGS.SESSION, CACHE_TAGS.USER],
    invalidationPatterns: ['session:*', 'user:*'],
    warmup: false,
    priority: 'high'
  },

  // API strategies
  'api:responses': {
    ttl: CACHE_TTL.API_RESPONSES,
    tags: [CACHE_TAGS.API],
    invalidationPatterns: ['api:*'],
    warmup: false,
    priority: 'low'
  },

  // Static strategies
  'static:data': {
    ttl: CACHE_TTL.STATIC_DATA,
    tags: [CACHE_TAGS.STATIC],
    invalidationPatterns: ['static:*'],
    warmup: true,
    priority: 'low'
  }
};

/**
 * Get cache strategy for a specific key
 */
export function getCacheStrategy(key: string): CacheStrategy | null {
  // Try exact match first
  if (CACHE_STRATEGIES[key]) {
    return CACHE_STRATEGIES[key];
  }

  // Try pattern matching
  for (const [pattern, strategy] of Object.entries(CACHE_STRATEGIES)) {
    if (key.startsWith(pattern.replace('*', ''))) {
      return strategy;
    }
  }

  // Return default strategy
  return {
    ttl: CACHE_TTL.API_RESPONSES,
    tags: [CACHE_TAGS.API],
    invalidationPatterns: ['*'],
    warmup: false,
    priority: 'low'
  };
}

/**
 * Get cache configuration from environment
 */
export function getCacheConfig(): CacheConfig {
  return {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    },
    memory: {
      maxSize: parseInt(process.env.CACHE_MEMORY_MAX_SIZE || '10000'),
      ttl: parseInt(process.env.CACHE_MEMORY_TTL || '300000') // 5 minutes
    },
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '300000'), // 5 minutes
    keyPrefix: process.env.CACHE_KEY_PREFIX || 'replivity:cache:',
    strategies: CACHE_STRATEGIES
  };
}

/**
 * Cache invalidation patterns
 */
export const INVALIDATION_PATTERNS = {
  // User invalidation
  USER_CREATED: ['user:*', 'analytics:*'],
  USER_UPDATED: ['user:*', 'user_profile:*', 'user_dashboard:*'],
  USER_DELETED: ['user:*', 'generation:*', 'billing:*', 'analytics:*'],
  
  // Generation invalidation
  GENERATION_CREATED: ['generation:*', 'analytics:*', 'platform:*'],
  GENERATION_UPDATED: ['generation:*', 'analytics:*'],
  GENERATION_DELETED: ['generation:*', 'analytics:*'],
  
  // Billing invalidation
  BILLING_CREATED: ['billing:*', 'subscription:*', 'analytics:*'],
  BILLING_UPDATED: ['billing:*', 'subscription:*', 'user:*'],
  BILLING_DELETED: ['billing:*', 'subscription:*', 'analytics:*'],
  
  // Blog invalidation
  BLOG_CREATED: ['blog:*', 'post:*', 'analytics:*'],
  BLOG_UPDATED: ['blog:*', 'post:*'],
  BLOG_DELETED: ['blog:*', 'post:*', 'analytics:*'],
  
  // Settings invalidation
  SETTINGS_UPDATED: ['settings:*', 'user:*'],
  
  // Security invalidation
  SECURITY_EVENT: ['security:*', 'analytics:*'],
  
  // Hashtag invalidation
  HASHTAG_CREATED: ['hashtag:*', 'set:*'],
  HASHTAG_UPDATED: ['hashtag:*', 'performance:*'],
  HASHTAG_DELETED: ['hashtag:*', 'set:*', 'performance:*']
};

/**
 * Get invalidation patterns for an event
 */
export function getInvalidationPatterns(event: keyof typeof INVALIDATION_PATTERNS): string[] {
  return INVALIDATION_PATTERNS[event] || [];
}

export { CACHE_TTL, CACHE_TAGS };
