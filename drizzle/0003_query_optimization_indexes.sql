-- Query Optimization and Indexing Migration
-- This migration adds missing indexes and optimizes existing ones based on query patterns

-- Auth Schema Optimizations
-- Add index for user email lookups (frequently used in authentication)
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "replier_user" USING btree ("email");

-- Add index for user role filtering (used in admin queries)
CREATE INDEX IF NOT EXISTS "user_role_idx" ON "replier_user" USING btree ("role");

-- Add index for banned users filtering
CREATE INDEX IF NOT EXISTS "user_banned_idx" ON "replier_user" USING btree ("banned");

-- Add composite index for active sessions
CREATE INDEX IF NOT EXISTS "session_user_expires_idx" ON "replier_session" USING btree ("user_id", "expires_at");

-- Add index for session token lookups (already unique but explicit index for performance)
CREATE INDEX IF NOT EXISTS "session_token_lookup_idx" ON "replier_session" USING btree ("token");

-- Account schema optimization
CREATE INDEX IF NOT EXISTS "account_user_provider_idx" ON "replier_account" USING btree ("user_id", "provider_id");

-- Generation Schema Optimizations
-- Add index for date range queries (frequently used in stats)
CREATE INDEX IF NOT EXISTS "generation_created_at_idx" ON "replier_generation" USING btree ("created_at");

-- Add composite index for user + source + date queries (used in platform-specific stats)
CREATE INDEX IF NOT EXISTS "generation_user_source_date_idx" ON "replier_generation" USING btree ("user_id", "source", "created_at");

-- Add index for author filtering
CREATE INDEX IF NOT EXISTS "generation_author_idx" ON "replier_generation" USING btree ("author");

-- Billing Schema Optimizations
-- Add index for provider queries
CREATE INDEX IF NOT EXISTS "billing_provider_idx" ON "replier_billing" USING btree ("provider");

-- Add index for customer ID lookups
CREATE INDEX IF NOT EXISTS "billing_customer_id_idx" ON "replier_billing" USING btree ("customer_id");

-- Add index for period end date (used for subscription renewals)
CREATE INDEX IF NOT EXISTS "billing_period_end_idx" ON "replier_billing" USING btree ("current_period_end");

-- Add composite index for active subscriptions with period
CREATE INDEX IF NOT EXISTS "billing_active_period_idx" ON "replier_billing" USING btree ("status", "current_period_end") WHERE "status" IN ('active', 'APPROVED');

-- Usage Schema Optimizations
-- Add index for usage tracking by date
CREATE INDEX IF NOT EXISTS "usage_created_at_idx" ON "replier_usage" USING btree ("created_at");

-- Add index for usage amount filtering
CREATE INDEX IF NOT EXISTS "usage_used_idx" ON "replier_usage" USING btree ("used");

-- Products Schema Optimizations
-- Add index for product status filtering
CREATE INDEX IF NOT EXISTS "products_status_idx" ON "replier_products" USING btree ("status");

-- Add index for product type filtering
CREATE INDEX IF NOT EXISTS "products_type_idx" ON "replier_products" USING btree ("type");

-- Add index for free products filtering
CREATE INDEX IF NOT EXISTS "products_is_free_idx" ON "replier_products" USING btree ("is_free");

-- Add composite index for active products by type
CREATE INDEX IF NOT EXISTS "products_status_type_idx" ON "replier_products" USING btree ("status", "type");

-- Hashtag Schema Optimizations (if tables exist)
-- These indexes are conditional since hashtag tables might not exist in all environments

-- Hashtag Sets optimizations
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hashtag_sets') THEN
        -- Add index for public hashtag sets
        CREATE INDEX IF NOT EXISTS "hashtag_sets_public_idx" ON "hashtag_sets" USING btree ("is_public") WHERE "is_public" = true;
        
        -- Add index for template hashtag sets
        CREATE INDEX IF NOT EXISTS "hashtag_sets_template_idx" ON "hashtag_sets" USING btree ("is_template") WHERE "is_template" = true;
        
        -- Add index for last used date
        CREATE INDEX IF NOT EXISTS "hashtag_sets_last_used_idx" ON "hashtag_sets" USING btree ("last_used");
        
        -- Add composite index for user + platform + category queries
        CREATE INDEX IF NOT EXISTS "hashtag_sets_user_platform_category_idx" ON "hashtag_sets" USING btree ("user_id", "platform", "category");
    END IF;
END $$;

-- Hashtag Performance optimizations
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hashtag_performance') THEN
        -- Add index for engagement rate filtering
        CREATE INDEX IF NOT EXISTS "hashtag_performance_engagement_idx" ON "hashtag_performance" USING btree ("engagement_rate");
        
        -- Add index for trend score filtering
        CREATE INDEX IF NOT EXISTS "hashtag_performance_trend_idx" ON "hashtag_performance" USING btree ("trend_score");
        
        -- Add composite index for user + platform + date range queries
        CREATE INDEX IF NOT EXISTS "hashtag_performance_user_platform_date_idx" ON "hashtag_performance" USING btree ("user_id", "platform", "created_at");
    END IF;
END $$;

-- Settings Schema Optimizations
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'replier_settings') THEN
        -- Add index for settings lookup by creation date
        CREATE INDEX IF NOT EXISTS "settings_created_at_idx" ON "replier_settings" USING btree ("created_at");
    END IF;
END $$;

-- Verification Schema Optimizations
-- Add index for identifier lookups
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "replier_verification" USING btree ("identifier");

-- Add index for expiration cleanup
CREATE INDEX IF NOT EXISTS "verification_expires_at_idx" ON "replier_verification" USING btree ("expires_at");

-- Add composite index for identifier + expiration queries
CREATE INDEX IF NOT EXISTS "verification_identifier_expires_idx" ON "replier_verification" USING btree ("identifier", "expires_at");

-- Performance Monitoring Indexes
-- These indexes help with monitoring and analytics queries

-- Add partial indexes for recent data (last 30 days) for faster analytics
CREATE INDEX IF NOT EXISTS "generation_recent_idx" ON "replier_generation" USING btree ("created_at", "user_id") 
WHERE "created_at" >= (CURRENT_DATE - INTERVAL '30 days');

CREATE INDEX IF NOT EXISTS "billing_recent_idx" ON "replier_billing" USING btree ("created_at", "status") 
WHERE "created_at" >= (CURRENT_DATE - INTERVAL '30 days');

-- Add indexes for common aggregate queries
CREATE INDEX IF NOT EXISTS "generation_source_count_idx" ON "replier_generation" USING btree ("source", "created_at");

-- Add covering indexes for frequently accessed columns together
CREATE INDEX IF NOT EXISTS "billing_user_status_amount_idx" ON "replier_billing" USING btree ("user_id", "status") 
INCLUDE ("amount", "currency", "current_period_end");

CREATE INDEX IF NOT EXISTS "generation_user_source_covering_idx" ON "replier_generation" USING btree ("user_id", "source") 
INCLUDE ("created_at", "post", "reply");

-- Add GIN indexes for JSONB columns if they exist
DO $$ 
BEGIN
    -- Settings JSONB indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'replier_settings' AND column_name = 'general') THEN
        CREATE INDEX IF NOT EXISTS "settings_general_gin_idx" ON "replier_settings" USING gin ("general");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'replier_settings' AND column_name = 'account') THEN
        CREATE INDEX IF NOT EXISTS "settings_account_gin_idx" ON "replier_settings" USING gin ("account");
    END IF;
    
    -- Billing metadata index
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'replier_billing' AND column_name = 'metadata') THEN
        CREATE INDEX IF NOT EXISTS "billing_metadata_gin_idx" ON "replier_billing" USING gin ("metadata");
    END IF;
    
    -- Hashtag sets JSONB indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hashtag_sets' AND column_name = 'hashtags') THEN
        CREATE INDEX IF NOT EXISTS "hashtag_sets_hashtags_gin_idx" ON "hashtag_sets" USING gin ("hashtags");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hashtag_sets' AND column_name = 'tags') THEN
        CREATE INDEX IF NOT EXISTS "hashtag_sets_tags_gin_idx" ON "hashtag_sets" USING gin ("tags");
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON INDEX "user_email_idx" IS 'Optimizes user authentication and email lookups';
COMMENT ON INDEX "generation_user_source_date_idx" IS 'Optimizes platform-specific statistics queries';
COMMENT ON INDEX "billing_active_period_idx" IS 'Optimizes active subscription queries with period filtering';
COMMENT ON INDEX "generation_recent_idx" IS 'Optimizes recent activity analytics (last 30 days)';
COMMENT ON INDEX "billing_user_status_amount_idx" IS 'Covering index for billing dashboard queries';