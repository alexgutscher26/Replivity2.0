-- Analytics Query Optimization Migration
-- This migration adds materialized views and additional indexes for complex analytics queries

-- =============================================
-- MATERIALIZED VIEWS FOR COMPLEX ANALYTICS
-- =============================================

-- Daily Analytics Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_analytics AS
SELECT 
  DATE(created_at) as date,
  source as platform,
  COUNT(*) as generation_count,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(LENGTH(post)) as avg_post_length,
  AVG(LENGTH(reply)) as avg_reply_length,
  MAX(created_at) as last_activity
FROM replier_generation
GROUP BY DATE(created_at), source
ORDER BY date DESC, generation_count DESC;

-- User Analytics Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS user_analytics AS
SELECT 
  g.user_id,
  u.name as user_name,
  u.email as user_email,
  u.created_at as user_created_at,
  u.role as user_role,
  COUNT(g.id) as total_generations,
  COUNT(DISTINCT g.source) as platforms_used,
  MAX(g.created_at) as last_activity,
  AVG(LENGTH(g.post)) as avg_post_length,
  COUNT(CASE WHEN g.created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_generations,
  COUNT(CASE WHEN g.created_at > NOW() - INTERVAL '7 days' THEN 1 END) as weekly_generations
FROM replier_generation g
LEFT JOIN replier_user u ON g.user_id = u.id
GROUP BY g.user_id, u.name, u.email, u.created_at, u.role
ORDER BY total_generations DESC;

-- Platform Performance Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS platform_performance AS
SELECT 
  source as platform,
  COUNT(*) as total_generations,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(LENGTH(post)) as avg_post_length,
  AVG(LENGTH(reply)) as avg_reply_length,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_generations,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as weekly_generations,
  MAX(created_at) as last_activity,
  MIN(created_at) as first_activity
FROM replier_generation
GROUP BY source
ORDER BY total_generations DESC;

-- Revenue Analytics Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS revenue_analytics AS
SELECT 
  DATE(created_at) as date,
  provider,
  status,
  COUNT(*) as transaction_count,
  SUM(amount::numeric) as total_revenue,
  AVG(amount::numeric) as avg_transaction_value,
  COUNT(DISTINCT user_id) as unique_customers
FROM replier_billing
GROUP BY DATE(created_at), provider, status
ORDER BY date DESC, total_revenue DESC;

-- Blog Analytics Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS blog_analytics AS
SELECT 
  DATE(created_at) as date,
  status,
  COUNT(*) as post_count,
  SUM(view_count) as total_views,
  AVG(reading_time) as avg_reading_time,
  COUNT(CASE WHEN status = 'published' THEN 1 END) as published_posts,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_posts
FROM replier_blog_post
GROUP BY DATE(created_at), status
ORDER BY date DESC;

-- =============================================
-- INDEXES FOR MATERIALIZED VIEWS
-- =============================================

-- Daily Analytics Indexes
CREATE INDEX IF NOT EXISTS daily_analytics_date_platform_idx 
ON daily_analytics (date, platform);

CREATE INDEX IF NOT EXISTS daily_analytics_date_idx 
ON daily_analytics (date);

CREATE INDEX IF NOT EXISTS daily_analytics_platform_idx 
ON daily_analytics (platform);

-- User Analytics Indexes
CREATE INDEX IF NOT EXISTS user_analytics_user_id_idx 
ON user_analytics (user_id);

CREATE INDEX IF NOT EXISTS user_analytics_total_generations_idx 
ON user_analytics (total_generations);

CREATE INDEX IF NOT EXISTS user_analytics_last_activity_idx 
ON user_analytics (last_activity);

-- Platform Performance Indexes
CREATE INDEX IF NOT EXISTS platform_performance_platform_idx 
ON platform_performance (platform);

CREATE INDEX IF NOT EXISTS platform_performance_total_generations_idx 
ON platform_performance (total_generations);

-- Revenue Analytics Indexes
CREATE INDEX IF NOT EXISTS revenue_analytics_date_idx 
ON revenue_analytics (date);

CREATE INDEX IF NOT EXISTS revenue_analytics_provider_idx 
ON revenue_analytics (provider);

CREATE INDEX IF NOT EXISTS revenue_analytics_status_idx 
ON revenue_analytics (status);

-- Blog Analytics Indexes
CREATE INDEX IF NOT EXISTS blog_analytics_date_idx 
ON blog_analytics (date);

CREATE INDEX IF NOT EXISTS blog_analytics_status_idx 
ON blog_analytics (status);

-- =============================================
-- ADDITIONAL ANALYTICS INDEXES
-- =============================================

-- Generation table analytics indexes
CREATE INDEX IF NOT EXISTS generation_user_created_at_covering_idx 
ON replier_generation (user_id, created_at) 
INCLUDE (source, post, reply, author);

CREATE INDEX IF NOT EXISTS generation_source_created_at_covering_idx 
ON replier_generation (source, created_at) 
INCLUDE (user_id, post, reply);

CREATE INDEX IF NOT EXISTS generation_author_created_at_idx 
ON replier_generation (author, created_at);

-- Billing table analytics indexes
CREATE INDEX IF NOT EXISTS billing_user_created_at_covering_idx 
ON replier_billing (user_id, created_at) 
INCLUDE (amount, status, provider, product_id);

CREATE INDEX IF NOT EXISTS billing_provider_created_at_idx 
ON replier_billing (provider, created_at);

CREATE INDEX IF NOT EXISTS billing_status_created_at_idx 
ON replier_billing (status, created_at);

-- Blog table analytics indexes
CREATE INDEX IF NOT EXISTS blog_post_created_by_created_at_covering_idx 
ON replier_blog_post (created_by, created_at) 
INCLUDE (status, view_count, reading_time, title);

CREATE INDEX IF NOT EXISTS blog_post_status_created_at_idx 
ON replier_blog_post (status, created_at);

CREATE INDEX IF NOT EXISTS blog_post_view_count_idx 
ON replier_blog_post (view_count);

-- User table analytics indexes
CREATE INDEX IF NOT EXISTS user_created_at_role_idx 
ON replier_user (created_at, role);

CREATE INDEX IF NOT EXISTS user_role_created_at_idx 
ON replier_user (role, created_at);

-- =============================================
-- PARTIAL INDEXES FOR RECENT DATA
-- =============================================

-- Recent generations (last 30 days)
CREATE INDEX IF NOT EXISTS generation_recent_30d_idx 
ON replier_generation (user_id, source, created_at) 
WHERE created_at >= (CURRENT_DATE - INTERVAL '30 days');

-- Recent billings (last 30 days)
CREATE INDEX IF NOT EXISTS billing_recent_30d_idx 
ON replier_billing (user_id, status, created_at) 
WHERE created_at >= (CURRENT_DATE - INTERVAL '30 days');

-- Recent blog posts (last 30 days)
CREATE INDEX IF NOT EXISTS blog_post_recent_30d_idx 
ON replier_blog_post (created_by, status, created_at) 
WHERE created_at >= (CURRENT_DATE - INTERVAL '30 days');

-- =============================================
-- FUNCTION TO REFRESH MATERIALIZED VIEWS
-- =============================================

CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW daily_analytics;
  REFRESH MATERIALIZED VIEW user_analytics;
  REFRESH MATERIALIZED VIEW platform_performance;
  REFRESH MATERIALIZED VIEW revenue_analytics;
  REFRESH MATERIALIZED VIEW blog_analytics;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- AUTOMATED REFRESH SCHEDULE (if pg_cron is available)
-- =============================================

-- Note: This requires the pg_cron extension to be installed
-- Uncomment the following lines if pg_cron is available:

-- SELECT cron.schedule('refresh-analytics-hourly', '0 * * * *', 'SELECT refresh_analytics_views();');
-- SELECT cron.schedule('refresh-analytics-daily', '0 2 * * *', 'SELECT refresh_analytics_views();');

-- =============================================
-- ANALYTICS QUERY OPTIMIZATION FUNCTIONS
-- =============================================

-- Function to get user analytics with caching
CREATE OR REPLACE FUNCTION get_user_analytics(p_user_id text, p_date_from timestamp DEFAULT NULL, p_date_to timestamp DEFAULT NULL)
RETURNS TABLE (
  user_id text,
  total_generations bigint,
  platforms_used bigint,
  last_activity timestamp,
  avg_post_length numeric,
  recent_generations bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.user_id,
    ua.total_generations,
    ua.platforms_used,
    ua.last_activity,
    ua.avg_post_length,
    ua.recent_generations
  FROM user_analytics ua
  WHERE ua.user_id = p_user_id
    AND (p_date_from IS NULL OR ua.last_activity >= p_date_from)
    AND (p_date_to IS NULL OR ua.last_activity <= p_date_to);
END;
$$ LANGUAGE plpgsql;

-- Function to get platform analytics with caching
CREATE OR REPLACE FUNCTION get_platform_analytics(p_platform text, p_date_from timestamp DEFAULT NULL, p_date_to timestamp DEFAULT NULL)
RETURNS TABLE (
  platform text,
  total_generations bigint,
  unique_users bigint,
  avg_post_length numeric,
  recent_generations bigint,
  weekly_generations bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.platform,
    pp.total_generations,
    pp.unique_users,
    pp.avg_post_length,
    pp.recent_generations,
    pp.weekly_generations
  FROM platform_performance pp
  WHERE pp.platform = p_platform
    AND (p_date_from IS NULL OR pp.last_activity >= p_date_from)
    AND (p_date_to IS NULL OR pp.last_activity <= p_date_to);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PERFORMANCE MONITORING VIEWS
-- =============================================

-- View for monitoring materialized view freshness
CREATE OR REPLACE VIEW materialized_view_stats AS
SELECT 
  schemaname,
  matviewname,
  matviewowner,
  hasindexes,
  ispopulated,
  definition
FROM pg_matviews
WHERE schemaname = 'public'
ORDER BY matviewname;

-- View for monitoring index usage on materialized views
CREATE OR REPLACE VIEW materialized_view_index_usage AS
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
  AND tablename IN ('daily_analytics', 'user_analytics', 'platform_performance', 'revenue_analytics', 'blog_analytics')
ORDER BY idx_scan DESC;

-- =============================================
-- INITIAL DATA POPULATION
-- =============================================

-- Populate materialized views with existing data
REFRESH MATERIALIZED VIEW daily_analytics;
REFRESH MATERIALIZED VIEW user_analytics;
REFRESH MATERIALIZED VIEW platform_performance;
REFRESH MATERIALIZED VIEW revenue_analytics;
REFRESH MATERIALIZED VIEW blog_analytics;

-- =============================================
-- COMMENTS AND DOCUMENTATION
-- =============================================

COMMENT ON MATERIALIZED VIEW daily_analytics IS 'Daily analytics aggregated by platform for fast dashboard queries';
COMMENT ON MATERIALIZED VIEW user_analytics IS 'User analytics with generation counts and activity metrics';
COMMENT ON MATERIALIZED VIEW platform_performance IS 'Platform performance metrics for analytics dashboards';
COMMENT ON MATERIALIZED VIEW revenue_analytics IS 'Revenue analytics aggregated by date and provider';
COMMENT ON MATERIALIZED VIEW blog_analytics IS 'Blog analytics aggregated by date and status';

COMMENT ON FUNCTION refresh_analytics_views() IS 'Refreshes all analytics materialized views';
COMMENT ON FUNCTION get_user_analytics(text, timestamp, timestamp) IS 'Gets user analytics with optional date filtering';
COMMENT ON FUNCTION get_platform_analytics(text, timestamp, timestamp) IS 'Gets platform analytics with optional date filtering';

-- =============================================
-- MIGRATION COMPLETION
-- =============================================

-- Update settings to track analytics optimization
INSERT INTO replier_settings (general) 
VALUES ('{"analytics_optimization": "' || CURRENT_TIMESTAMP || '", "materialized_views_created": true}')
ON CONFLICT (id) DO UPDATE SET 
    general = replier_settings.general || '{"analytics_optimization": "' || CURRENT_TIMESTAMP || '", "materialized_views_created": true}'::jsonb,
    updated_at = CURRENT_TIMESTAMP;
