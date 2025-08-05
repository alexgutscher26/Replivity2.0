-- Migration for hashtag tracking system
-- Created: 2025-01-09

-- Hashtag Performance Tracking Table
CREATE TABLE "hashtag_performance" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "generation_id" uuid,
  "hashtag" text NOT NULL,
  "platform" text NOT NULL,
  "impressions" integer DEFAULT 0,
  "engagements" integer DEFAULT 0,
  "clicks" integer DEFAULT 0,
  "shares" integer DEFAULT 0,
  "saves" integer DEFAULT 0,
  "engagement_rate" numeric(5,2) DEFAULT 0.00,
  "click_through_rate" numeric(5,2) DEFAULT 0.00,
  "length" integer NOT NULL,
  "has_numbers" boolean DEFAULT false,
  "has_special_chars" boolean DEFAULT false,
  "category" text,
  "platform_data" jsonb,
  "trend_score" numeric(5,2) DEFAULT 0.00,
  "competition_level" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Hashtag Trends Table
CREATE TABLE "hashtag_trends" (
  "id" text PRIMARY KEY NOT NULL,
  "hashtag" text NOT NULL,
  "platform" text NOT NULL,
  "volume" integer DEFAULT 0,
  "growth_rate" numeric(5,2) DEFAULT 0.00,
  "peak_date" timestamp,
  "status" text DEFAULT 'stable',
  "category" text,
  "region" text,
  "hourly_data" jsonb,
  "daily_data" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Hashtag Sets Table
CREATE TABLE "hashtag_sets" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "hashtags" jsonb NOT NULL,
  "platform" text NOT NULL,
  "category" text,
  "is_template" boolean DEFAULT false,
  "is_public" boolean DEFAULT false,
  "usage_count" integer DEFAULT 0,
  "last_used" timestamp,
  "avg_engagement_rate" numeric(5,2) DEFAULT 0.00,
  "avg_click_through_rate" numeric(5,2) DEFAULT 0.00,
  "tags" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Hashtag Competition Table
CREATE TABLE "hashtag_competition" (
  "id" text PRIMARY KEY NOT NULL,
  "hashtag" text NOT NULL,
  "platform" text NOT NULL,
  "total_posts" integer DEFAULT 0,
  "recent_posts" integer DEFAULT 0,
  "avg_engagement" numeric(10,2) DEFAULT 0.00,
  "top_post_engagement" numeric(10,2) DEFAULT 0.00,
  "competition_score" numeric(5,2) DEFAULT 0.00,
  "difficulty" text,
  "opportunity" numeric(5,2) DEFAULT 0.00,
  "trend_direction" text,
  "growth_rate" numeric(5,2) DEFAULT 0.00,
  "best_posting_times" jsonb,
  "peak_engagement_day" text,
  "top_content_types" jsonb,
  "related_hashtags" jsonb,
  "top_regions" jsonb,
  "last_analyzed" timestamp DEFAULT now() NOT NULL,
  "data_source" text DEFAULT 'api',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Hashtag Optimization Table
CREATE TABLE "hashtag_optimization" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "platform" text NOT NULL,
  "preferred_categories" jsonb,
  "avoid_categories" jsonb,
  "min_engagement_rate" numeric(5,2) DEFAULT 2.00,
  "max_competition_level" text DEFAULT 'medium',
  "platform_settings" jsonb,
  "auto_optimize" boolean DEFAULT true,
  "learning_enabled" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Hashtag Templates Table
CREATE TABLE "hashtag_templates" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text,
  "name" text NOT NULL,
  "description" text,
  "template" jsonb NOT NULL,
  "variables" jsonb,
  "category" text NOT NULL,
  "industry" text,
  "platforms" jsonb,
  "is_built_in" boolean DEFAULT false,
  "is_public" boolean DEFAULT false,
  "usage_count" integer DEFAULT 0,
  "rating" numeric(3,2) DEFAULT 0.00,
  "avg_performance" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "hashtag_performance" ADD CONSTRAINT "hashtag_performance_generation_id_replier_generation_id_fk" FOREIGN KEY ("generation_id") REFERENCES "replier_generation"("id") ON DELETE cascade ON UPDATE no action;

-- Create indexes for performance
CREATE INDEX "hashtag_performance_user_id_idx" ON "hashtag_performance" ("user_id");
CREATE INDEX "hashtag_performance_hashtag_idx" ON "hashtag_performance" ("hashtag");
CREATE INDEX "hashtag_performance_platform_idx" ON "hashtag_performance" ("platform");
CREATE INDEX "hashtag_performance_created_at_idx" ON "hashtag_performance" ("created_at");

CREATE INDEX "hashtag_trends_hashtag_idx" ON "hashtag_trends" ("hashtag");
CREATE INDEX "hashtag_trends_platform_idx" ON "hashtag_trends" ("platform");
CREATE INDEX "hashtag_trends_status_idx" ON "hashtag_trends" ("status");

CREATE INDEX "hashtag_sets_user_id_idx" ON "hashtag_sets" ("user_id");
CREATE INDEX "hashtag_sets_platform_idx" ON "hashtag_sets" ("platform");
CREATE INDEX "hashtag_sets_category_idx" ON "hashtag_sets" ("category");
CREATE INDEX "hashtag_sets_is_public_idx" ON "hashtag_sets" ("is_public");

CREATE INDEX "hashtag_competition_hashtag_idx" ON "hashtag_competition" ("hashtag");
CREATE INDEX "hashtag_competition_platform_idx" ON "hashtag_competition" ("platform");
CREATE INDEX "hashtag_competition_difficulty_idx" ON "hashtag_competition" ("difficulty");
CREATE INDEX "hashtag_competition_last_analyzed_idx" ON "hashtag_competition" ("last_analyzed");

CREATE INDEX "hashtag_optimization_user_id_idx" ON "hashtag_optimization" ("user_id");
CREATE INDEX "hashtag_optimization_platform_idx" ON "hashtag_optimization" ("platform");

CREATE INDEX "hashtag_templates_user_id_idx" ON "hashtag_templates" ("user_id");
CREATE INDEX "hashtag_templates_category_idx" ON "hashtag_templates" ("category");
CREATE INDEX "hashtag_templates_is_public_idx" ON "hashtag_templates" ("is_public");
