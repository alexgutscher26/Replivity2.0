CREATE TABLE IF NOT EXISTS "replier_two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hashtag_competition" (
	"id" text PRIMARY KEY NOT NULL,
	"hashtag" text NOT NULL,
	"platform" text NOT NULL,
	"total_posts" integer DEFAULT 0,
	"recent_posts" integer DEFAULT 0,
	"avg_engagement" numeric(10, 2) DEFAULT '0.00',
	"top_post_engagement" numeric(10, 2) DEFAULT '0.00',
	"competition_score" numeric(5, 2) DEFAULT '0.00',
	"difficulty" text,
	"opportunity" numeric(5, 2) DEFAULT '0.00',
	"trend_direction" text,
	"growth_rate" numeric(5, 2) DEFAULT '0.00',
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
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hashtag_optimization" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"platform" text NOT NULL,
	"preferred_categories" jsonb,
	"avoid_categories" jsonb,
	"min_engagement_rate" numeric(5, 2) DEFAULT '2.00',
	"max_competition_level" text DEFAULT 'medium',
	"platform_settings" jsonb,
	"auto_optimize" boolean DEFAULT true,
	"learning_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hashtag_performance" (
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
	"engagement_rate" numeric(5, 2) DEFAULT '0.00',
	"click_through_rate" numeric(5, 2) DEFAULT '0.00',
	"length" integer NOT NULL,
	"has_numbers" boolean DEFAULT false,
	"has_special_chars" boolean DEFAULT false,
	"category" text,
	"platform_data" jsonb,
	"trend_score" numeric(5, 2) DEFAULT '0.00',
	"competition_level" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hashtag_sets" (
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
	"avg_engagement_rate" numeric(5, 2) DEFAULT '0.00',
	"avg_click_through_rate" numeric(5, 2) DEFAULT '0.00',
	"tags" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hashtag_templates" (
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
	"rating" numeric(3, 2) DEFAULT '0.00',
	"avg_performance" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hashtag_trends" (
	"id" text PRIMARY KEY NOT NULL,
	"hashtag" text NOT NULL,
	"platform" text NOT NULL,
	"volume" integer DEFAULT 0,
	"growth_rate" numeric(5, 2) DEFAULT '0.00',
	"peak_date" timestamp,
	"status" text DEFAULT 'stable',
	"category" text,
	"region" text,
	"hourly_data" jsonb,
	"daily_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "replier_settings" ALTER COLUMN "account" SET DEFAULT '{"customPrompt":"","brandName":"","brandPersonality":"","brandTone":"professional","customTone":"","brandValues":"","targetAudience":"","brandKeywords":"","avoidKeywords":""}'::jsonb;--> statement-breakpoint
ALTER TABLE "replier_user" ADD COLUMN "two_factor_enabled" boolean;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "replier_two_factor" ADD CONSTRAINT "replier_two_factor_user_id_replier_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."replier_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
