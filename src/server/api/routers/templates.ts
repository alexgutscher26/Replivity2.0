/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { randomUUID } from "crypto";
import { eq, and, count } from "drizzle-orm";
import { hashtagTemplates } from "@/server/db/schema/hashtag-schema";
import { usage } from "@/server/db/schema/usage-schema";

export const templatesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        hashtags: z.array(z.string()).min(1).max(30),
        category: z.string().optional(),
        platform: z.enum(["instagram", "twitter", "facebook", "linkedin", "all"]).default("all"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if user has an active billing subscription
      const userSubscription = await ctx.db.query.billing.findFirst({
        where: (billing, { eq, and }) => and(
          eq(billing.userId, userId),
          eq(billing.status, "active")
        ),
        with: {
          product: true,
        },
      });

      if (!userSubscription) {
        throw new Error("Active subscription required to create templates");
      }

      // Check usage limits
      const currentUsage = await ctx.db.query.usage.findFirst({
        where: (usage, { eq, and }) => and(
          eq(usage.userId, userId)
        ),
      });

      const usageLimit = (userSubscription.product as { name?: string })?.name?.toLowerCase().includes("pro") ? 100 : 20; // Example limits
      const currentCount = currentUsage?.used ?? 0;

      if (currentCount >= usageLimit) {
        throw new Error(`Template creation limit reached (${usageLimit})`);
      }

      // Create the template
      const template = await ctx.db.insert(hashtagTemplates).values({
        id: randomUUID(),
        name: input.name,
        description: input.description,
        template: input.hashtags, // Note: using template field as per schema
        category: input.category ?? "general", // category is required, default to "general"
        platforms: [input.platform], // Note: platforms is jsonb array
        userId,
      }).returning();

      // Update usage count
      if (currentUsage) {
        await ctx.db.update(usage)
          .set({ used: currentCount + 1 })
          .where(eq(usage.userId, userId));
      } else {
        await ctx.db.insert(usage).values({
          userId,
          productId: userSubscription.productId,
          used: 1,
        });
      }

      return template[0];
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        platform: z.enum(["instagram", "twitter", "facebook", "linkedin", "all"]).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const templates = await ctx.db.query.hashtagTemplates.findMany({
        where: (hashtagTemplates, { eq, and }) => {
          const conditions = [eq(hashtagTemplates.userId, userId)];
          if (input.category) {
            conditions.push(eq(hashtagTemplates.category, input.category));
          }
          return and(...conditions);
        },
        orderBy: (hashtagTemplates, { desc }) => [desc(hashtagTemplates.createdAt)],
        limit: input.limit,
        offset: input.offset,
      });

      const totalCountResult = await ctx.db.select({ count: count() })
        .from(hashtagTemplates)
        .where(and(
          eq(hashtagTemplates.userId, userId),
          ...(input.category ? [eq(hashtagTemplates.category, input.category)] : [])
        ));
      const totalCount = totalCountResult[0]?.count ?? 0;

      return {
        templates,
        totalCount,
        hasMore: input.offset + input.limit < totalCount,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const template = await ctx.db.query.hashtagTemplates.findFirst({
        where: (hashtagTemplates, { eq, and }) => and(
          eq(hashtagTemplates.id, input.id),
          eq(hashtagTemplates.userId, userId)
        ),
      });

      if (!template) {
        throw new Error("Template not found");
      }

      return template;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        hashtags: z.array(z.string()).min(1).max(30).optional(),
        category: z.string().optional(),
        platform: z.enum(["instagram", "twitter", "facebook", "linkedin", "all"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const template = await ctx.db.query.hashtagTemplates.findFirst({
        where: (hashtagTemplates, { eq, and }) => and(
          eq(hashtagTemplates.id, input.id),
          eq(hashtagTemplates.userId, userId)
        ),
      });

      if (!template) {
        throw new Error("Template not found");
      }

      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.hashtags) updateData.template = input.hashtags;
      if (input.category !== undefined) updateData.category = input.category || "general";
      if (input.platform) updateData.platforms = [input.platform];
      updateData.updatedAt = new Date();

      const updatedTemplate = await ctx.db.update(hashtagTemplates)
        .set(updateData)
        .where(eq(hashtagTemplates.id, input.id))
        .returning();

      return updatedTemplate[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const template = await ctx.db.query.hashtagTemplates.findFirst({
        where: (hashtagTemplates, { eq, and }) => and(
          eq(hashtagTemplates.id, input.id),
          eq(hashtagTemplates.userId, userId)
        ),
      });

      if (!template) {
        throw new Error("Template not found");
      }

      await ctx.db.delete(hashtagTemplates)
        .where(eq(hashtagTemplates.id, input.id));

      return { success: true };
    }),

  duplicate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if user has an active billing subscription
      const userSubscription = await ctx.db.query.billing.findFirst({
        where: (billing, { eq, and }) => and(
          eq(billing.userId, userId),
          eq(billing.status, "active")
        ),
        with: {
          product: true,
        },
      });

      if (!userSubscription) {
        throw new Error("Active subscription required to duplicate templates");
      }

      // Check usage limits
      const currentUsage = await ctx.db.query.usage.findFirst({
        where: (usage, { eq }) => eq(usage.userId, userId),
      });

      const usageLimit = (userSubscription.product as { name?: string })?.name?.toLowerCase().includes("pro") ? 100 : 20;
      const currentCount = currentUsage?.used ?? 0;

      if (currentCount >= usageLimit) {
        throw new Error(`Template creation limit reached (${usageLimit})`);
      }

      const originalTemplate = await ctx.db.query.hashtagTemplates.findFirst({
        where: (hashtagTemplates, { eq, and }) => and(
          eq(hashtagTemplates.id, input.id),
          eq(hashtagTemplates.userId, userId)
        ),
      });

      if (!originalTemplate) {
        throw new Error("Template not found");
      }

      const duplicatedTemplate = await ctx.db.insert(hashtagTemplates).values({
        id: randomUUID(),
        name: `${originalTemplate.name} (Copy)`,
        description: originalTemplate.description,
        template: originalTemplate.template,
        category: originalTemplate.category,
        platforms: originalTemplate.platforms,
        userId,
      }).returning();

      // Update usage count
      if (currentUsage) {
        await ctx.db.update(usage)
          .set({ used: currentCount + 1 })
          .where(eq(usage.userId, userId));
      } else {
        await ctx.db.insert(usage).values({
          userId,
          productId: userSubscription.productId,
          used: 1,
        });
      }

      return duplicatedTemplate[0];
    }),

  getCategories: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      const categories = await ctx.db.selectDistinct({ category: hashtagTemplates.category })
        .from(hashtagTemplates)
        .where(and(
          eq(hashtagTemplates.userId, userId),
          // Note: Drizzle doesn't have a direct "not null" operator in this context
          // We'll filter out nulls in the result
        ));

      return categories.map(c => c.category).filter(Boolean);
    }),

  getUsageStats: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      const userSubscription = await ctx.db.query.billing.findFirst({
        where: (billing, { eq, and }) => and(
          eq(billing.userId, userId),
          eq(billing.status, "active")
        ),
        with: {
          product: true,
        },
      });

      const currentUsage = await ctx.db.query.usage.findFirst({
        where: (usage, { eq }) => eq(usage.userId, userId),
      });

      const usageLimit = (userSubscription?.product as { name?: string } | undefined)?.name?.toLowerCase().includes("pro") ? 100 : 20;
      const currentCount = currentUsage?.used ?? 0;

      return {
        current: currentCount,
        limit: usageLimit,
        percentage: Math.round((currentCount / usageLimit) * 100),
        hasActiveSubscription: Boolean(userSubscription),
      };
    }),
});
