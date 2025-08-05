import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, integer, decimal, boolean, jsonb, uuid } from "drizzle-orm/pg-core";
import { generations } from "./generations-schema";

export const hashtagPerformance = pgTable("hashtag_performance", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id").notNull(),
  generationId: uuid("generation_id"),
  hashtag: text("hashtag").notNull(),
  platform: text("platform").notNull(), // twitter, facebook, linkedin, instagram
  
  // Performance metrics
  impressions: integer("impressions").default(0),
  engagements: integer("engagements").default(0),
  clicks: integer("clicks").default(0),
  shares: integer("shares").default(0),
  saves: integer("saves").default(0),
  
  // Calculated metrics
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }).default("0.00"),
  clickThroughRate: decimal("click_through_rate", { precision: 5, scale: 2 }).default("0.00"),
  
  // Hashtag characteristics
  length: integer("length").notNull(),
  hasNumbers: boolean("has_numbers").default(false),
  hasSpecialChars: boolean("has_special_chars").default(false),
  category: text("category"), // trending, niche, branded, etc.
  
  // Platform-specific data
  platformData: jsonb("platform_data"), // Store platform-specific metrics
  
  // Trend data
  trendScore: decimal("trend_score", { precision: 5, scale: 2 }).default("0.00"),
  competitionLevel: text("competition_level"), // low, medium, high
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hashtagTrends = pgTable("hashtag_trends", {
  id: text("id").primaryKey().notNull(),
  hashtag: text("hashtag").notNull(),
  platform: text("platform").notNull(),
  
  // Trend metrics
  volume: integer("volume").default(0), // How many times used
  growthRate: decimal("growth_rate", { precision: 5, scale: 2 }).default("0.00"),
  peakDate: timestamp("peak_date"),
  
  // Trend status
  status: text("status").default("stable"), // rising, falling, stable, viral
  category: text("category"), // technology, lifestyle, business, etc.
  
  // Geographic data
  region: text("region"),
  
  // Time-based data
  hourlyData: jsonb("hourly_data"), // Usage by hour
  dailyData: jsonb("daily_data"), // Usage by day
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hashtagOptimization = pgTable("hashtag_optimization", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id").notNull(),
  platform: text("platform").notNull(),
  
  // Optimization settings
  preferredCategories: jsonb("preferred_categories"), // Array of preferred categories
  avoidCategories: jsonb("avoid_categories"), // Array of categories to avoid
  
  // Performance preferences
  minEngagementRate: decimal("min_engagement_rate", { precision: 5, scale: 2 }).default("2.00"),
  maxCompetitionLevel: text("max_competition_level").default("medium"),
  
  // Platform-specific optimizations
  platformSettings: jsonb("platform_settings"),
  
  // Auto-optimization
  autoOptimize: boolean("auto_optimize").default(true),
  learningEnabled: boolean("learning_enabled").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hashtagSets = pgTable("hashtag_sets", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  
  // Hashtag data
  hashtags: jsonb("hashtags").notNull(), // Array of hashtag objects
  platform: text("platform").notNull(),
  category: text("category"), // business, lifestyle, technology, etc.
  
  // Template settings
  isTemplate: boolean("is_template").default(false),
  isPublic: boolean("is_public").default(false),
  
  // Usage stats
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used"),
  
  // Performance data
  avgEngagementRate: decimal("avg_engagement_rate", { precision: 5, scale: 2 }).default("0.00"),
  avgClickThroughRate: decimal("avg_click_through_rate", { precision: 5, scale: 2 }).default("0.00"),
  
  // Metadata
  tags: jsonb("tags"), // Array of tags for categorization
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hashtagCompetition = pgTable("hashtag_competition", {
  id: text("id").primaryKey().notNull(),
  hashtag: text("hashtag").notNull(),
  platform: text("platform").notNull(),
  
  // Competition metrics
  totalPosts: integer("total_posts").default(0),
  recentPosts: integer("recent_posts").default(0), // Last 24 hours
  avgEngagement: decimal("avg_engagement", { precision: 10, scale: 2 }).default("0.00"),
  topPostEngagement: decimal("top_post_engagement", { precision: 10, scale: 2 }).default("0.00"),
  
  // Competition analysis
  competitionScore: decimal("competition_score", { precision: 5, scale: 2 }).default("0.00"), // 0-100
  difficulty: text("difficulty"), // easy, medium, hard, very_hard
  opportunity: decimal("opportunity", { precision: 5, scale: 2 }).default("0.00"), // 0-100
  
  // Trend data
  trendDirection: text("trend_direction"), // rising, falling, stable
  growthRate: decimal("growth_rate", { precision: 5, scale: 2 }).default("0.00"),
  
  // Time-based analysis
  bestPostingTimes: jsonb("best_posting_times"), // Array of optimal hours
  peakEngagementDay: text("peak_engagement_day"),
  
  // Content analysis
  topContentTypes: jsonb("top_content_types"), // Array of performing content types
  relatedHashtags: jsonb("related_hashtags"), // Array of related hashtags
  
  // Geographic data
  topRegions: jsonb("top_regions"),
  
  // Last analysis
  lastAnalyzed: timestamp("last_analyzed").defaultNow().notNull(),
  dataSource: text("data_source").default("api"), // api, scraping, manual
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hashtagTemplates = pgTable("hashtag_templates", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id"),
  name: text("name").notNull(),
  description: text("description"),
  
  // Template structure
  template: jsonb("template").notNull(), // Template with placeholders
  variables: jsonb("variables"), // Available variables
  
  // Category and targeting
  category: text("category").notNull(),
  industry: text("industry"),
  platforms: jsonb("platforms"), // Array of supported platforms
  
  // Template settings
  isBuiltIn: boolean("is_built_in").default(false),
  isPublic: boolean("is_public").default(false),
  
  // Usage and performance
  usageCount: integer("usage_count").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  
  // Optimization data
  avgPerformance: jsonb("avg_performance"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const hashtagPerformanceRelations = relations(hashtagPerformance, ({ one }) => ({
  generation: one(generations, {
    fields: [hashtagPerformance.generationId],
    references: [generations.id],
  }),
}));

export const hashtagSetsRelations = relations(hashtagSets, () => ({
  // Add relations if needed
}));

export const hashtagCompetitionRelations = relations(hashtagCompetition, () => ({
  // Add relations if needed
}));

export const hashtagTemplatesRelations = relations(hashtagTemplates, () => ({
  // Add relations if needed
}));
