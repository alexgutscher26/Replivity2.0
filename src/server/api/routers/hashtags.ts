import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { 
  hashtagPerformance, 
  hashtagSets, 
  hashtagCompetition, 
  hashtagOptimization,
} from "@/server/db/schema/hashtag-schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "crypto";

// Input schemas
const hashtagSetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  hashtags: z.array(z.string()).min(1, "At least one hashtag is required"),
  platform: z.enum(["twitter", "facebook", "linkedin", "instagram", "all"]),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false),
});

const hashtagCompetitionAnalysisSchema = z.object({
  hashtag: z.string().min(1, "Hashtag is required"),
  platform: z.enum(["twitter", "facebook", "linkedin", "instagram"]),
});

const hashtagPerformanceSchema = z.object({
  hashtag: z.string(),
  platform: z.string(),
  impressions: z.number().optional(),
  engagements: z.number().optional(),
  clicks: z.number().optional(),
  shares: z.number().optional(),
  saves: z.number().optional(),
  engagementRate: z.number().optional(),
  clickThroughRate: z.number().optional(),
  generationId: z.string().optional(),
});

export const hashtagRouter = createTRPCRouter({
  // Hashtag Sets Management
  createHashtagSet: protectedProcedure
    .input(hashtagSetSchema)
    .mutation(async ({ ctx, input }) => {
      const id = randomUUID();
      
      await ctx.db.insert(hashtagSets).values({
        id,
        userId: ctx.session.user.id,
        name: input.name,
        description: input.description,
        hashtags: input.hashtags,
        platform: input.platform,
        category: input.category,
        tags: input.tags ?? [],
        isPublic: input.isPublic,
        usageCount: 0,
        avgEngagementRate: "0.00",
        avgClickThroughRate: "0.00",
      });

      return { id, success: true };
    }),

  getHashtagSets: protectedProcedure
    .input(z.object({
      category: z.string().optional(),
      platform: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const whereConditions = [
        eq(hashtagSets.userId, ctx.session.user.id),
      ];

      if (input.category && input.category !== "all") {
        whereConditions.push(eq(hashtagSets.category, input.category));
      }

      if (input.platform && input.platform !== "all") {
        whereConditions.push(eq(hashtagSets.platform, input.platform));
      }

      const sets = await ctx.db
        .select()
        .from(hashtagSets)
        .where(and(...whereConditions))
        .orderBy(desc(hashtagSets.updatedAt))
        .limit(input.limit)
        .offset(input.offset);

      return sets;
    }),

  updateHashtagSet: protectedProcedure
    .input(z.object({
      id: z.string(),
      ...hashtagSetSchema.shape,
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const existingSet = await ctx.db
        .select()
        .from(hashtagSets)
        .where(and(
          eq(hashtagSets.id, id),
          eq(hashtagSets.userId, ctx.session.user.id)
        ))
        .limit(1);

      if (!existingSet.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hashtag set not found",
        });
      }

      await ctx.db
        .update(hashtagSets)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(hashtagSets.id, id));

      return { success: true };
    }),

  deleteHashtagSet: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({  }) => {

      return { success: true };
    }),

  // Hashtag Performance Tracking
  trackHashtagPerformance: protectedProcedure
    .input(hashtagPerformanceSchema)
    .mutation(async ({ ctx, input }) => {
      const id = randomUUID();
      
      // Analyze hashtag characteristics
      const hashtag = input.hashtag;
      const hasNumbers = /\d/.test(hashtag);
      const hasSpecialChars = /[^a-zA-Z0-9#]/.test(hashtag);
      const length = hashtag.length;

      // Calculate metrics
      const engagementRate = input.impressions && input.engagements 
        ? (input.engagements / input.impressions) * 100 
        : 0;
      const clickThroughRate = input.impressions && input.clicks 
        ? (input.clicks / input.impressions) * 100 
        : 0;

      await ctx.db.insert(hashtagPerformance).values({
        id,
        userId: ctx.session.user.id,
        generationId: input.generationId,
        hashtag,
        platform: input.platform,
        impressions: input.impressions ?? 0,
        engagements: input.engagements ?? 0,
        clicks: input.clicks ?? 0,
        shares: input.shares ?? 0,
        saves: input.saves ?? 0,
        engagementRate: engagementRate.toFixed(2),
        clickThroughRate: clickThroughRate.toFixed(2),
        length,
        hasNumbers,
        hasSpecialChars,
        trendScore: "0.00",
      });

      return { id, success: true };
    }),

  getHashtagPerformance: protectedProcedure
    .input(z.object({
      platform: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const whereConditions = [
        eq(hashtagPerformance.userId, ctx.session.user.id),
      ];

      if (input.platform && input.platform !== "all") {
        whereConditions.push(eq(hashtagPerformance.platform, input.platform));
      }

      const performance = await ctx.db
        .select()
        .from(hashtagPerformance)
        .where(and(...whereConditions))
        .orderBy(desc(hashtagPerformance.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return performance;
    }),

  // Hashtag Competition Analysis
  analyzeHashtagCompetition: protectedProcedure
    .input(hashtagCompetitionAnalysisSchema)
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      
      // Mock competition analysis (in real implementation, this would call external APIs)
      const mockAnalysis = {
        totalPosts: Math.floor(Math.random() * 1000000) + 10000,
        recentPosts: Math.floor(Math.random() * 10000) + 100,
        avgEngagement: parseFloat((Math.random() * 10 + 1).toFixed(2)),
        topPostEngagement: Math.floor(Math.random() * 100000) + 1000,
        competitionScore: Math.floor(Math.random() * 100),
        difficulty: ["easy", "medium", "hard", "very_hard"][Math.floor(Math.random() * 4)],
        opportunity: parseFloat((Math.random() * 100).toFixed(2)),
        trendDirection: ["rising", "falling", "stable"][Math.floor(Math.random() * 3)],
        growthRate: parseFloat((Math.random() * 30 - 15).toFixed(2)),
        bestPostingTimes: [9, 12, 15, 18, 21],
        peakEngagementDay: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][Math.floor(Math.random() * 7)],
        topContentTypes: ["image", "video", "text", "carousel"],
        relatedHashtags: ["#related1", "#related2", "#related3"],
        topRegions: ["US", "UK", "Canada", "Australia"],
      };

      await ctx.db.insert(hashtagCompetition).values({
        id,
        hashtag: input.hashtag,
        platform: input.platform,
        totalPosts: mockAnalysis.totalPosts,
        recentPosts: mockAnalysis.recentPosts,
        avgEngagement: mockAnalysis.avgEngagement.toString(),
        topPostEngagement: mockAnalysis.topPostEngagement.toString(),
        competitionScore: mockAnalysis.competitionScore.toString(),
        difficulty: mockAnalysis.difficulty,
        opportunity: mockAnalysis.opportunity.toString(),
        trendDirection: mockAnalysis.trendDirection,
        growthRate: mockAnalysis.growthRate.toString(),
        bestPostingTimes: mockAnalysis.bestPostingTimes,
        peakEngagementDay: mockAnalysis.peakEngagementDay,
        topContentTypes: mockAnalysis.topContentTypes,
        relatedHashtags: mockAnalysis.relatedHashtags,
        topRegions: mockAnalysis.topRegions,
        lastAnalyzed: new Date(),
      });

      return { id, analysis: mockAnalysis, success: true };
    }),

  getHashtagCompetitionAnalysis: protectedProcedure
    .input(z.object({
      hashtag: z.string().optional(),
      platform: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const whereConditions = [];

      if (input.hashtag) {
        whereConditions.push(eq(hashtagCompetition.hashtag, input.hashtag));
      }

      if (input.platform && input.platform !== "all") {
        whereConditions.push(eq(hashtagCompetition.platform, input.platform));
      }

      const competition = await ctx.db
        .select()
        .from(hashtagCompetition)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(hashtagCompetition.lastAnalyzed))
        .limit(input.limit);

      return competition;
    }),

  // Hashtag Analytics
  getHashtagAnalytics: protectedProcedure
    .input(z.object({
      platform: z.string().optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const whereConditions = [
        eq(hashtagPerformance.userId, ctx.session.user.id),
      ];

      if (input.platform && input.platform !== "all") {
        whereConditions.push(eq(hashtagPerformance.platform, input.platform));
      }

      if (input.dateFrom) {
        whereConditions.push(gte(hashtagPerformance.createdAt, input.dateFrom));
      }

      if (input.dateTo) {
        whereConditions.push(lte(hashtagPerformance.createdAt, input.dateTo));
      }

      // Get top performing hashtags
      const topHashtags = await ctx.db
        .select({
          hashtag: hashtagPerformance.hashtag,
          platform: hashtagPerformance.platform,
          avgEngagement: sql<number>`AVG(${hashtagPerformance.engagementRate})`,
          totalImpressions: sql<number>`SUM(${hashtagPerformance.impressions})`,
          totalEngagements: sql<number>`SUM(${hashtagPerformance.engagements})`,
          usageCount: sql<number>`COUNT(*)`,
        })
        .from(hashtagPerformance)
        .where(and(...whereConditions))
        .groupBy(hashtagPerformance.hashtag, hashtagPerformance.platform)
        .orderBy(desc(sql<number>`AVG(${hashtagPerformance.engagementRate})`))
        .limit(10);

      // Get platform distribution
      const platformStats = await ctx.db
        .select({
          platform: hashtagPerformance.platform,
          count: sql<number>`COUNT(*)`,
          avgEngagement: sql<number>`AVG(${hashtagPerformance.engagementRate})`,
        })
        .from(hashtagPerformance)
        .where(and(...whereConditions))
        .groupBy(hashtagPerformance.platform);

      // Get total metrics
      const totalMetrics = await ctx.db
        .select({
          totalHashtags: sql<number>`COUNT(DISTINCT ${hashtagPerformance.hashtag})`,
          totalImpressions: sql<number>`SUM(${hashtagPerformance.impressions})`,
          totalEngagements: sql<number>`SUM(${hashtagPerformance.engagements})`,
          avgEngagementRate: sql<number>`AVG(${hashtagPerformance.engagementRate})`,
        })
        .from(hashtagPerformance)
        .where(and(...whereConditions));

      return {
        topHashtags,
        platformStats,
        totalMetrics: totalMetrics[0] ?? {
          totalHashtags: 0,
          totalImpressions: 0,
          totalEngagements: 0,
          avgEngagementRate: 0,
        },
      };
    }),

  // User Optimization Settings
  getUserOptimizationSettings: protectedProcedure
    .input(z.object({
      platform: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const whereConditions = [
        eq(hashtagOptimization.userId, ctx.session.user.id),
      ];

      if (input.platform && input.platform !== "all") {
        whereConditions.push(eq(hashtagOptimization.platform, input.platform));
      }

      const settings = await ctx.db
        .select()
        .from(hashtagOptimization)
        .where(and(...whereConditions))
        .limit(1);

      return settings[0] ?? null;
    }),

  updateOptimizationSettings: protectedProcedure
    .input(z.object({
      platform: z.string(),
      preferredCategories: z.array(z.string()).optional(),
      avoidCategories: z.array(z.string()).optional(),
      minEngagementRate: z.number().min(0).max(100).default(2),
      maxCompetitionLevel: z.enum(["low", "medium", "high"]).default("medium"),
      autoOptimize: z.boolean().default(true),
      learningEnabled: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const existingSettings = await ctx.db
        .select()
        .from(hashtagOptimization)
        .where(and(
          eq(hashtagOptimization.userId, ctx.session.user.id),
          eq(hashtagOptimization.platform, input.platform)
        ))
        .limit(1);

      if (existingSettings.length > 0) {
        await ctx.db
          .update(hashtagOptimization)
          .set({
            preferredCategories: input.preferredCategories ?? [],
            avoidCategories: input.avoidCategories ?? [],
            minEngagementRate: input.minEngagementRate.toString(),
            maxCompetitionLevel: input.maxCompetitionLevel,
            autoOptimize: input.autoOptimize,
            learningEnabled: input.learningEnabled,
            updatedAt: new Date(),
          })
          .where(eq(hashtagOptimization.id, existingSettings[0]?.id ?? ''));
      } else {
        const id = crypto.randomUUID();
        await ctx.db.insert(hashtagOptimization).values({
          id,
          userId: ctx.session.user.id,
          platform: input.platform,
          preferredCategories: input.preferredCategories ?? [],
          avoidCategories: input.avoidCategories ?? [],
          minEngagementRate: input.minEngagementRate.toString(),
          maxCompetitionLevel: input.maxCompetitionLevel,
          autoOptimize: input.autoOptimize,
          learningEnabled: input.learningEnabled,
        });
      }

      return { success: true };
    }),
});
