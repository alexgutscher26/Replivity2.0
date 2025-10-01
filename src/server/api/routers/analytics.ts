/**
 * Optimized Analytics Router
 * 
 * This router provides high-performance analytics endpoints
 * with optimized queries and intelligent caching.
 */

import { createTRPCRouter, adminProcedure, protectedProcedure } from "@/server/api/trpc";
import { AnalyticsOptimizer, MaterializedViews } from "@/server/db/analytics-optimizer";
import { z } from "zod";

export const analyticsRouter = createTRPCRouter({
  /**
   * Get comprehensive dashboard analytics
   */
  getDashboardAnalytics: protectedProcedure
    .input(z.object({
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
      platform: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return AnalyticsOptimizer.getDashboardAnalytics({
        userId: ctx.session.user.id,
        dateRange: {
          from: input.dateFrom,
          to: input.dateTo
        },
        platform: input.platform,
        isAdmin: ctx.session.user.role === "admin"
      });
    }),

  /**
   * Get user-specific analytics
   */
  getUserAnalytics: protectedProcedure
    .input(z.object({
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
      platform: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return AnalyticsOptimizer.getUserAnalytics(ctx.session.user.id, {
        dateRange: {
          from: input.dateFrom,
          to: input.dateTo
        },
        platform: input.platform
      });
    }),

  /**
   * Get platform-specific analytics
   */
  getPlatformAnalytics: protectedProcedure
    .input(z.object({
      platform: z.string(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return AnalyticsOptimizer.getPlatformAnalytics(input.platform, {
        userId: ctx.session.user.id,
        dateRange: {
          from: input.dateFrom,
          to: input.dateTo
        },
        isAdmin: ctx.session.user.role === "admin"
      });
    }),

  /**
   * Get revenue analytics (admin only)
   */
  getRevenueAnalytics: adminProcedure
    .input(z.object({
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
    }))
    .query(async ({ input }) => {
      return AnalyticsOptimizer.getRevenueAnalytics({
        dateRange: {
          from: input.dateFrom,
          to: input.dateTo
        },
        isAdmin: true
      });
    }),

  /**
   * Get blog analytics
   */
  getBlogAnalytics: protectedProcedure
    .input(z.object({
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return AnalyticsOptimizer.getBlogAnalytics({
        userId: ctx.session.user.id,
        dateRange: {
          from: input.dateFrom,
          to: input.dateTo
        }
      });
    }),

  /**
   * Get real-time analytics (last 24 hours)
   */
  getRealTimeAnalytics: protectedProcedure
    .query(async ({ ctx }) => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      return AnalyticsOptimizer.getDashboardAnalytics({
        userId: ctx.session.user.id,
        dateRange: {
          from: yesterday,
          to: new Date()
        },
        isAdmin: ctx.session.user.role === "admin"
      });
    }),

  /**
   * Get performance metrics
   */
  getPerformanceMetrics: protectedProcedure
    .input(z.object({
      timeRange: z.enum(["1h", "24h", "7d", "30d"]).default("24h"),
    }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      let from: Date;

      switch (input.timeRange) {
        case "1h":
          from = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case "24h":
          from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      return AnalyticsOptimizer.getDashboardAnalytics({
        userId: ctx.session.user.id,
        dateRange: {
          from,
          to: now
        },
        isAdmin: ctx.session.user.role === "admin"
      });
    }),

  /**
   * Clear analytics cache (admin only)
   */
  clearCache: adminProcedure
    .input(z.object({
      pattern: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      AnalyticsOptimizer.clearCache(input.pattern);
      return { success: true, message: "Cache cleared successfully" };
    }),

  /**
   * Get cache statistics (admin only)
   */
  getCacheStats: adminProcedure
    .query(async () => {
      return AnalyticsOptimizer.getCacheStats();
    }),

  /**
   * Refresh materialized views (admin only)
   */
  refreshMaterializedViews: adminProcedure
    .mutation(async () => {
      await MaterializedViews.refreshAllViews();
      return { success: true, message: "Materialized views refreshed successfully" };
    }),

  /**
   * Create materialized views (admin only)
   */
  createMaterializedViews: adminProcedure
    .mutation(async () => {
      await MaterializedViews.createDailyAnalyticsView();
      await MaterializedViews.createUserAnalyticsView();
      return { success: true, message: "Materialized views created successfully" };
    }),

  /**
   * Get analytics export data
   */
  exportAnalytics: protectedProcedure
    .input(z.object({
      type: z.enum(["generations", "users", "revenue", "blog"]),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
      format: z.enum(["json", "csv"]).default("json"),
    }))
    .query(async ({ ctx, input }) => {
      const { type, dateFrom, dateTo, format } = input;
      const isAdmin = ctx.session.user.role === "admin";

      let data: any;

      switch (type) {
        case "generations":
          data = await AnalyticsOptimizer.getDashboardAnalytics({
            userId: ctx.session.user.id,
            dateRange: { from: dateFrom, to: dateTo },
            isAdmin
          });
          break;
        case "users":
          if (!isAdmin) {
            throw new Error("User analytics export requires admin access");
          }
          data = await AnalyticsOptimizer.getDashboardAnalytics({
            dateRange: { from: dateFrom, to: dateTo },
            isAdmin: true
          });
          break;
        case "revenue":
          if (!isAdmin) {
            throw new Error("Revenue analytics export requires admin access");
          }
          data = await AnalyticsOptimizer.getRevenueAnalytics({
            dateRange: { from: dateFrom, to: dateTo },
            isAdmin: true
          });
          break;
        case "blog":
          data = await AnalyticsOptimizer.getBlogAnalytics({
            userId: ctx.session.user.id,
            dateRange: { from: dateFrom, to: dateTo }
          });
          break;
        default:
          throw new Error("Invalid export type");
      }

      if (format === "csv") {
        // Convert to CSV format
        return {
          data: convertToCSV(data),
          format: "csv",
          filename: `${type}_analytics_${new Date().toISOString().split('T')[0]}.csv`
        };
      }

      return {
        data,
        format: "json",
        filename: `${type}_analytics_${new Date().toISOString().split('T')[0]}.json`
      };
    }),
});

/**
 * Convert analytics data to CSV format
 */
function convertToCSV(data: any): string {
  if (!data || typeof data !== 'object') {
    return '';
  }

  const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
    const flattened: Record<string, any> = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          Object.assign(flattened, flattenObject(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  };

  const flattened = flattenObject(data);
  const headers = Object.keys(flattened);
  const values = headers.map(header => flattened[header]);

  return [headers.join(','), values.join(',')].join('\n');
}
