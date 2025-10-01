-- Enhanced Query Optimization and Indexing Migration
-- This migration adds comprehensive missing indexes based on actual query patterns analysis
-- Generated: December 2024

-- =============================================
-- CRITICAL MISSING INDEXES FOR FREQUENT QUERIES
-- =============================================

-- User Table Optimizations
-- Add missing indexes for user queries
CREATE INDEX IF NOT EXISTS "user_created_at_idx" ON "replier_user" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "user_updated_at_idx" ON "replier_user" USING btree ("updated_at");
CREATE INDEX IF NOT EXISTS "user_email_verified_idx" ON "replier_user" USING btree ("email_verified");
CREATE INDEX IF NOT EXISTS "user_two_factor_idx" ON "replier_user" USING btree ("two_factor_enabled");
CREATE INDEX IF NOT EXISTS "user_password_reset_idx" ON "replier_user" USING btree ("password_reset_required");

-- Composite indexes for common user queries
CREATE INDEX IF NOT EXISTS "user_role_banned_idx" ON "replier_user" USING btree ("role", "banned");
CREATE INDEX IF NOT EXISTS "user_email_verified_role_idx" ON "replier_user" USING btree ("email_verified", "role");

-- Session Table Optimizations
-- Add missing indexes for session management
CREATE INDEX IF NOT EXISTS "session_created_at_idx" ON "replier_session" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "session_ip_address_idx" ON "replier_session" USING btree ("ip_address");
CREATE INDEX IF NOT EXISTS "session_user_agent_idx" ON "replier_session" USING btree ("user_agent");

-- Account Table Optimizations
-- Add missing indexes for OAuth account queries
CREATE INDEX IF NOT EXISTS "account_provider_id_idx" ON "replier_account" USING btree ("provider_id");
CREATE INDEX IF NOT EXISTS "account_created_at_idx" ON "replier_account" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "account_access_token_expires_idx" ON "replier_account" USING btree ("access_token_expires_at");

-- Generation Table Optimizations
-- Add missing indexes for generation queries
CREATE INDEX IF NOT EXISTS "generation_updated_at_idx" ON "replier_generation" USING btree ("updated_at");
CREATE INDEX IF NOT EXISTS "generation_link_idx" ON "replier_generation" USING btree ("link");

-- Composite indexes for complex generation queries
CREATE INDEX IF NOT EXISTS "generation_user_created_at_idx" ON "replier_generation" USING btree ("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "generation_source_created_at_idx" ON "replier_generation" USING btree ("source", "created_at");
CREATE INDEX IF NOT EXISTS "generation_author_created_at_idx" ON "replier_generation" USING btree ("author", "created_at");

-- Billing Table Optimizations
-- Add missing indexes for billing queries
CREATE INDEX IF NOT EXISTS "billing_created_at_idx" ON "replier_billing" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "billing_updated_at_idx" ON "replier_billing" USING btree ("updated_at");
CREATE INDEX IF NOT EXISTS "billing_provider_id_idx" ON "replier_billing" USING btree ("provider_id");
CREATE INDEX IF NOT EXISTS "billing_canceled_at_idx" ON "replier_billing" USING btree ("canceled_at");
CREATE INDEX IF NOT EXISTS "billing_ended_at_idx" ON "replier_billing" USING btree ("ended_at");

-- Composite indexes for billing analytics
CREATE INDEX IF NOT EXISTS "billing_user_created_at_idx" ON "replier_billing" USING btree ("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "billing_provider_status_idx" ON "replier_billing" USING btree ("provider", "status");
CREATE INDEX IF NOT EXISTS "billing_status_created_at_idx" ON "replier_billing" USING btree ("status", "created_at");

-- Usage Table Optimizations
-- Add missing indexes for usage tracking
CREATE INDEX IF NOT EXISTS "usage_updated_at_idx" ON "replier_usage" USING btree ("updated_at");

-- Products Table Optimizations
-- Add missing indexes for product queries
CREATE INDEX IF NOT EXISTS "products_created_at_idx" ON "replier_products" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "products_updated_at_idx" ON "replier_products" USING btree ("updated_at");
CREATE INDEX IF NOT EXISTS "products_price_id_idx" ON "replier_products" USING btree ("price_id");

-- Composite indexes for product filtering
CREATE INDEX IF NOT EXISTS "products_status_created_at_idx" ON "replier_products" USING btree ("status", "created_at");
CREATE INDEX IF NOT EXISTS "products_type_status_idx" ON "replier_products" USING btree ("type", "status");
CREATE INDEX IF NOT EXISTS "products_is_free_status_idx" ON "replier_products" USING btree ("is_free", "status");

-- =============================================
-- BLOG SYSTEM OPTIMIZATIONS
-- =============================================

-- Blog Post Table Optimizations
-- Add missing indexes for blog queries
CREATE INDEX IF NOT EXISTS "blog_post_created_at_idx" ON "replier_blog_post" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "blog_post_updated_at_idx" ON "replier_blog_post" USING btree ("updated_at");
CREATE INDEX IF NOT EXISTS "blog_post_view_count_idx" ON "replier_blog_post" USING btree ("view_count");
CREATE INDEX IF NOT EXISTS "blog_post_reading_time_idx" ON "replier_blog_post" USING btree ("reading_time");

-- Composite indexes for blog queries
CREATE INDEX IF NOT EXISTS "blog_post_status_published_at_idx" ON "replier_blog_post" USING btree ("status", "published_at");
CREATE INDEX IF NOT EXISTS "blog_post_created_by_status_idx" ON "replier_blog_post" USING btree ("created_by", "status");
CREATE INDEX IF NOT EXISTS "blog_post_status_created_at_idx" ON "replier_blog_post" USING btree ("status", "created_at");

-- Full-text search indexes for blog content
CREATE INDEX IF NOT EXISTS "blog_post_title_gin_idx" ON "replier_blog_post" USING gin (to_tsvector('english', "title"));
CREATE INDEX IF NOT EXISTS "blog_post_content_gin_idx" ON "replier_blog_post" USING gin (to_tsvector('english', "content"));
CREATE INDEX IF NOT EXISTS "blog_post_excerpt_gin_idx" ON "replier_blog_post" USING gin (to_tsvector('english', "excerpt"));

-- Blog Category Table Optimizations
CREATE INDEX IF NOT EXISTS "blog_category_created_at_idx" ON "replier_blog_category" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "blog_category_updated_at_idx" ON "replier_blog_category" USING btree ("updated_at");
CREATE INDEX IF NOT EXISTS "blog_category_is_active_idx" ON "replier_blog_category" USING btree ("is_active");

-- Blog Tag Table Optimizations
CREATE INDEX IF NOT EXISTS "blog_tag_created_at_idx" ON "replier_blog_tag" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "blog_tag_is_active_idx" ON "replier_blog_tag" USING btree ("is_active");

-- Blog Comment Table Optimizations
CREATE INDEX IF NOT EXISTS "blog_comment_updated_at_idx" ON "replier_blog_comment" USING btree ("updated_at");
CREATE INDEX IF NOT EXISTS "blog_comment_like_count_idx" ON "replier_blog_comment" USING btree ("like_count");
CREATE INDEX IF NOT EXISTS "blog_comment_is_edited_idx" ON "replier_blog_comment" USING btree ("is_edited");
CREATE INDEX IF NOT EXISTS "blog_comment_edited_at_idx" ON "replier_blog_comment" USING btree ("edited_at");

-- Composite indexes for comment queries
CREATE INDEX IF NOT EXISTS "blog_comment_post_status_idx" ON "replier_blog_comment" USING btree ("post_id", "status");
CREATE INDEX IF NOT EXISTS "blog_comment_author_status_idx" ON "replier_blog_comment" USING btree ("author_id", "status");
CREATE INDEX IF NOT EXISTS "blog_comment_parent_created_at_idx" ON "replier_blog_comment" USING btree ("parent_id", "created_at");

-- Blog Comment Like Table Optimizations
CREATE INDEX IF NOT EXISTS "blog_comment_like_created_at_idx" ON "replier_blog_comment_like" USING btree ("created_at");

-- =============================================
-- SECURITY AND VERIFICATION OPTIMIZATIONS
-- =============================================

-- Security Event Table Optimizations
CREATE INDEX IF NOT EXISTS "security_event_created_at_idx" ON "replier_security_event" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "security_event_event_type_idx" ON "replier_security_event" USING btree ("event_type");
CREATE INDEX IF NOT EXISTS "security_event_severity_idx" ON "replier_security_event" USING btree ("severity");
CREATE INDEX IF NOT EXISTS "security_event_resolved_at_idx" ON "replier_security_event" USING btree ("resolved_at");

-- Composite indexes for security queries
CREATE INDEX IF NOT EXISTS "security_event_user_type_idx" ON "replier_security_event" USING btree ("user_id", "event_type");
CREATE INDEX IF NOT EXISTS "security_event_severity_created_at_idx" ON "replier_security_event" USING btree ("severity", "created_at");
CREATE INDEX IF NOT EXISTS "security_event_user_created_at_idx" ON "replier_security_event" USING btree ("user_id", "created_at");

-- Two Factor Table Optimizations
CREATE INDEX IF NOT EXISTS "two_factor_created_at_idx" ON "replier_two_factor" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "two_factor_updated_at_idx" ON "replier_two_factor" USING btree ("updated_at");

-- =============================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- =============================================

-- Partial indexes for recent data (last 7 days) - faster analytics
CREATE INDEX IF NOT EXISTS "generation_recent_7d_idx" ON "replier_generation" USING btree ("created_at", "user_id", "source") 
WHERE "created_at" >= (CURRENT_DATE - INTERVAL '7 days');

CREATE INDEX IF NOT EXISTS "billing_recent_7d_idx" ON "replier_billing" USING btree ("created_at", "status", "user_id") 
WHERE "created_at" >= (CURRENT_DATE - INTERVAL '7 days');

CREATE INDEX IF NOT EXISTS "user_recent_7d_idx" ON "replier_user" USING btree ("created_at", "role") 
WHERE "created_at" >= (CURRENT_DATE - INTERVAL '7 days');

-- Partial indexes for active data only
CREATE INDEX IF NOT EXISTS "billing_active_only_idx" ON "replier_billing" USING btree ("user_id", "product_id", "current_period_end") 
WHERE "status" IN ('active', 'APPROVED');

CREATE INDEX IF NOT EXISTS "products_active_only_idx" ON "replier_products" USING btree ("type", "mode", "price") 
WHERE "status" = 'active';

-- =============================================
-- COVERING INDEXES FOR COMMON QUERIES
-- =============================================

-- Covering index for user dashboard queries
CREATE INDEX IF NOT EXISTS "user_dashboard_covering_idx" ON "replier_user" USING btree ("id", "role", "banned") 
INCLUDE ("name", "email", "email_verified", "created_at", "updated_at");

-- Covering index for generation analytics
CREATE INDEX IF NOT EXISTS "generation_analytics_covering_idx" ON "replier_generation" USING btree ("user_id", "source", "created_at") 
INCLUDE ("post", "reply", "author", "product_id");

-- Covering index for billing dashboard
CREATE INDEX IF NOT EXISTS "billing_dashboard_covering_idx" ON "replier_billing" USING btree ("user_id", "status", "created_at") 
INCLUDE ("amount", "currency", "provider", "current_period_end", "product_id");

-- Covering index for blog post listings
CREATE INDEX IF NOT EXISTS "blog_post_listing_covering_idx" ON "replier_blog_post" USING btree ("status", "published_at", "created_at") 
INCLUDE ("id", "title", "slug", "excerpt", "view_count", "reading_time", "created_by");

-- =============================================
-- JSONB COLUMN OPTIMIZATIONS
-- =============================================

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS "settings_general_gin_idx" ON "replier_settings" USING gin ("general");
CREATE INDEX IF NOT EXISTS "settings_account_gin_idx" ON "replier_settings" USING gin ("account");
CREATE INDEX IF NOT EXISTS "settings_billing_gin_idx" ON "replier_settings" USING gin ("billing");
CREATE INDEX IF NOT EXISTS "billing_metadata_gin_idx" ON "replier_billing" USING gin ("metadata");
CREATE INDEX IF NOT EXISTS "blog_post_metadata_gin_idx" ON "replier_blog_post" USING gin ("metadata");
CREATE INDEX IF NOT EXISTS "blog_comment_metadata_gin_idx" ON "replier_blog_comment" USING gin ("metadata");

-- =============================================
-- HASHTAG SYSTEM OPTIMIZATIONS (CONDITIONAL)
-- =============================================

-- Hashtag Sets optimizations (if tables exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hashtag_sets') THEN
        -- Add missing indexes for hashtag sets
        CREATE INDEX IF NOT EXISTS "hashtag_sets_created_at_idx" ON "hashtag_sets" USING btree ("created_at");
        CREATE INDEX IF NOT EXISTS "hashtag_sets_updated_at_idx" ON "hashtag_sets" USING btree ("updated_at");
        CREATE INDEX IF NOT EXISTS "hashtag_sets_platform_idx" ON "hashtag_sets" USING btree ("platform");
        CREATE INDEX IF NOT EXISTS "hashtag_sets_category_idx" ON "hashtag_sets" USING btree ("category");
        
        -- Composite indexes for hashtag queries
        CREATE INDEX IF NOT EXISTS "hashtag_sets_user_platform_idx" ON "hashtag_sets" USING btree ("user_id", "platform");
        CREATE INDEX IF NOT EXISTS "hashtag_sets_platform_category_idx" ON "hashtag_sets" USING btree ("platform", "category");
        CREATE INDEX IF NOT EXISTS "hashtag_sets_user_created_at_idx" ON "hashtag_sets" USING btree ("user_id", "created_at");
        
        -- GIN indexes for JSONB columns
        CREATE INDEX IF NOT EXISTS "hashtag_sets_hashtags_gin_idx" ON "hashtag_sets" USING gin ("hashtags");
        CREATE INDEX IF NOT EXISTS "hashtag_sets_tags_gin_idx" ON "hashtag_sets" USING gin ("tags");
    END IF;
END $$;

-- Hashtag Performance optimizations (if tables exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hashtag_performance') THEN
        -- Add missing indexes for hashtag performance
        CREATE INDEX IF NOT EXISTS "hashtag_performance_created_at_idx" ON "hashtag_performance" USING btree ("created_at");
        CREATE INDEX IF NOT EXISTS "hashtag_performance_updated_at_idx" ON "hashtag_performance" USING btree ("updated_at");
        CREATE INDEX IF NOT EXISTS "hashtag_performance_hashtag_idx" ON "hashtag_performance" USING btree ("hashtag");
        
        -- Composite indexes for performance queries
        CREATE INDEX IF NOT EXISTS "hashtag_performance_user_platform_idx" ON "hashtag_performance" USING btree ("user_id", "platform");
        CREATE INDEX IF NOT EXISTS "hashtag_performance_platform_engagement_idx" ON "hashtag_performance" USING btree ("platform", "engagement_rate");
        CREATE INDEX IF NOT EXISTS "hashtag_performance_user_created_at_idx" ON "hashtag_performance" USING btree ("user_id", "created_at");
    END IF;
END $$;

-- Hashtag Templates optimizations (if tables exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hashtag_templates') THEN
        -- Add missing indexes for hashtag templates
        CREATE INDEX IF NOT EXISTS "hashtag_templates_created_at_idx" ON "hashtag_templates" USING btree ("created_at");
        CREATE INDEX IF NOT EXISTS "hashtag_templates_updated_at_idx" ON "hashtag_templates" USING btree ("updated_at");
        CREATE INDEX IF NOT EXISTS "hashtag_templates_platform_idx" ON "hashtag_templates" USING btree ("platform");
        CREATE INDEX IF NOT EXISTS "hashtag_templates_category_idx" ON "hashtag_templates" USING btree ("category");
        
        -- Composite indexes for template queries
        CREATE INDEX IF NOT EXISTS "hashtag_templates_user_platform_idx" ON "hashtag_templates" USING btree ("user_id", "platform");
        CREATE INDEX IF NOT EXISTS "hashtag_templates_platform_category_idx" ON "hashtag_templates" USING btree ("platform", "category");
        CREATE INDEX IF NOT EXISTS "hashtag_templates_user_created_at_idx" ON "hashtag_templates" USING btree ("user_id", "created_at");
    END IF;
END $$;

-- =============================================
-- FEATURE PERMISSIONS OPTIMIZATIONS (CONDITIONAL)
-- =============================================

-- Feature Permissions optimizations (if tables exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feature_permissions') THEN
        -- Add missing indexes for feature permissions
        CREATE INDEX IF NOT EXISTS "feature_permissions_created_at_idx" ON "feature_permissions" USING btree ("created_at");
        CREATE INDEX IF NOT EXISTS "feature_permissions_updated_at_idx" ON "feature_permissions" USING btree ("updated_at");
        CREATE INDEX IF NOT EXISTS "feature_permissions_feature_key_idx" ON "feature_permissions" USING btree ("feature_key");
        
        -- Composite indexes for permission queries
        CREATE INDEX IF NOT EXISTS "feature_permissions_product_feature_idx" ON "feature_permissions" USING btree ("product_id", "feature_key");
    END IF;
END $$;

-- =============================================
-- APPSUMO LICENSE OPTIMIZATIONS (CONDITIONAL)
-- =============================================

-- AppSumo License optimizations (if tables exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appsumo_licenses') THEN
        -- Add missing indexes for AppSumo licenses
        CREATE INDEX IF NOT EXISTS "appsumo_licenses_created_at_idx" ON "appsumo_licenses" USING btree ("created_at");
        CREATE INDEX IF NOT EXISTS "appsumo_licenses_updated_at_idx" ON "appsumo_licenses" USING btree ("updated_at");
        CREATE INDEX IF NOT EXISTS "appsumo_licenses_license_key_idx" ON "appsumo_licenses" USING btree ("license_key");
        CREATE INDEX IF NOT EXISTS "appsumo_licenses_status_idx" ON "appsumo_licenses" USING btree ("status");
        
        -- Composite indexes for license queries
        CREATE INDEX IF NOT EXISTS "appsumo_licenses_user_status_idx" ON "appsumo_licenses" USING btree ("user_id", "status");
        CREATE INDEX IF NOT EXISTS "appsumo_licenses_license_key_status_idx" ON "appsumo_licenses" USING btree ("license_key", "status");
    END IF;
END $$;

-- =============================================
-- INDEX COMMENTS FOR DOCUMENTATION
-- =============================================

-- User table indexes
COMMENT ON INDEX "user_created_at_idx" IS 'Optimizes user registration date queries and analytics';
COMMENT ON INDEX "user_role_banned_idx" IS 'Optimizes admin queries filtering by role and ban status';
COMMENT ON INDEX "user_dashboard_covering_idx" IS 'Covering index for user dashboard queries';

-- Generation table indexes
COMMENT ON INDEX "generation_user_created_at_idx" IS 'Optimizes user generation history queries';
COMMENT ON INDEX "generation_analytics_covering_idx" IS 'Covering index for generation analytics queries';
COMMENT ON INDEX "generation_recent_7d_idx" IS 'Partial index for recent generation analytics (last 7 days)';

-- Billing table indexes
COMMENT ON INDEX "billing_user_created_at_idx" IS 'Optimizes user billing history queries';
COMMENT ON INDEX "billing_dashboard_covering_idx" IS 'Covering index for billing dashboard queries';
COMMENT ON INDEX "billing_active_only_idx" IS 'Partial index for active subscriptions only';

-- Blog table indexes
COMMENT ON INDEX "blog_post_listing_covering_idx" IS 'Covering index for blog post listing queries';
COMMENT ON INDEX "blog_post_title_gin_idx" IS 'Full-text search index for blog post titles';
COMMENT ON INDEX "blog_post_content_gin_idx" IS 'Full-text search index for blog post content';

-- Security table indexes
COMMENT ON INDEX "security_event_user_type_idx" IS 'Optimizes security event queries by user and event type';
COMMENT ON INDEX "security_event_severity_created_at_idx" IS 'Optimizes security event queries by severity and date';

-- =============================================
-- PERFORMANCE MONITORING QUERIES
-- =============================================

-- Create a view for monitoring index usage
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    CASE 
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 100 THEN 'LOW_USAGE'
        WHEN idx_scan < 1000 THEN 'MEDIUM_USAGE'
        ELSE 'HIGH_USAGE'
    END as usage_level
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Create a view for monitoring slow queries
CREATE OR REPLACE VIEW slow_query_stats AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE mean_time > 100 -- queries taking more than 100ms on average
ORDER BY mean_time DESC;

-- =============================================
-- MAINTENANCE RECOMMENDATIONS
-- =============================================

-- Update table statistics for better query planning
ANALYZE;

-- Vacuum tables to reclaim space and update statistics
VACUUM ANALYZE;

-- =============================================
-- MIGRATION COMPLETION
-- =============================================

-- Log migration completion
INSERT INTO replier_settings (general) 
VALUES ('{"last_index_optimization": "' || CURRENT_TIMESTAMP || '"}')
ON CONFLICT (id) DO UPDATE SET 
    general = replier_settings.general || '{"last_index_optimization": "' || CURRENT_TIMESTAMP || '"}'::jsonb,
    updated_at = CURRENT_TIMESTAMP;
