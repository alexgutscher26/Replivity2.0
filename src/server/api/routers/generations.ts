/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { billing } from "@/server/db/schema/billing-schema";
import { generations } from "@/server/db/schema/generations-schema";
import { usage } from "@/server/db/schema/usage-schema";
import { getAIInstance } from "@/server/utils";
import { generationsSchema } from "@/utils/schema/generations";
import { TRPCError } from "@trpc/server";
import { generateText } from "ai";
import { and, count, eq, gte, lte, or } from "drizzle-orm";
import { ai } from "node_modules/better-auth/dist/shared/better-auth.6BOIvSei";
import { z } from "zod";

export const generationRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(generationsSchema)
    .mutation(async ({ ctx, input }) => {
      // Get active subscription
      const activeBilling = await ctx.db.query.billing.findFirst({
        where: and(
          eq(billing.userId, ctx.session.user.id),
          or(eq(billing.status, "active"), eq(billing.status, "APPROVED")),
        ),
        with: {
          product: true,
        },
      });

      if (!activeBilling?.product) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No active subscription found",
        });
      }

      // Get current usage
      const currentUsage = await ctx.db.query.usage.findFirst({
        where: and(
          eq(usage.userId, ctx.session.user.id),
          eq(usage.productId, activeBilling.productId),
        ),
      });

      const usageCount = currentUsage?.used ?? 0;
      const usageLimit = (activeBilling.product as { limit?: number })?.limit ?? 0;

      // Check if user has exceeded their limit (skip for admins)
      if (ctx.session.user.role !== "admin" && usageCount >= usageLimit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Usage limit exceeded for current billing period",
        });
      }

      // Get AI settings
      const settings = await ctx.db.query.settings.findFirst();
      const ai = settings?.general?.ai;
      const enabledModels = (ai?.enabledModels ?? []) as any[];
      const customPrompt = ai?.systemPrompt ?? "";

      // Enhanced context analysis and response generation
      const enhancedResponse = await generateEnhancedResponse({
        input,
        ai,
        enabledModels,
        customPrompt,
      });

      // Store the generation data
      await ctx.db.insert(generations).values({
        userId: ctx.session.user.id,
        productId: activeBilling.productId,
        source: input.source,
        link: input.link,
        post: input.post,
        reply: enhancedResponse.text,
        author: input.author,
      });

      // Increment usage (skip for tweet generation from web form only)
      // Extension calls don't have author parameter, so they should still count
      const isTweetGenerationFromWebForm = input.source === "twitter" && input.type === "status" && input.author === "Tweet Generator";
      
      if (!isTweetGenerationFromWebForm) {
        if (currentUsage) {
          await ctx.db
            .update(usage)
            .set({
              used: currentUsage.used + 1,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(usage.userId, ctx.session.user.id),
                eq(usage.productId, activeBilling.productId),
              ),
            );
        } else {
          await ctx.db.insert(usage).values({
            userId: ctx.session.user.id,
            productId: activeBilling.productId,
            used: 1,
          });
        }
      }

      return {
        text: enhancedResponse.text,
        remainingUsage: usageLimit - (usageCount + 1),
        confidence: enhancedResponse.confidence,
        contextAnalysis: enhancedResponse.contextAnalysis,
      };
    }),

  getFacebookStats: protectedProcedure
    .input(
      z
        .object({
          from: z.date().optional(),
          to: z.date().optional(),
          isSiteWide: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const baseQuery = ctx.db
        .select({
          id: generations.id,
          createdAt: generations.createdAt,
        })
        .from(generations)
        .where(
          and(
            eq(generations.source, "facebook"),
            input?.isSiteWide
              ? undefined
              : eq(generations.userId, ctx.session.user.id),
            input?.from && input?.to
              ? and(
                  gte(generations.createdAt, input.from),
                  lte(generations.createdAt, input.to),
                )
              : undefined,
          ),
        );

      const results = await baseQuery;

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Calculate totals
      const total = results.length;

      const previousTotal = results.filter(
        (row) => (row.createdAt ?? new Date()) < oneMonthAgo,
      ).length;

      const percentageChange =
        total === 0 && previousTotal === 0
          ? 0
          : previousTotal === 0
            ? 100
            : ((total - previousTotal) / previousTotal) * 100;

      return {
        total,
        percentageChange,
      };
    }),

  getTwitterStats: protectedProcedure
    .input(
      z
        .object({
          from: z.date().optional(),
          to: z.date().optional(),
          isSiteWide: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const baseQuery = ctx.db
        .select({
          id: generations.id,
          createdAt: generations.createdAt,
        })
        .from(generations)
        .where(
          and(
            eq(generations.source, "twitter"),
            input?.isSiteWide
              ? undefined
              : eq(generations.userId, ctx.session.user.id),
            input?.from && input?.to
              ? and(
                  gte(generations.createdAt, input.from),
                  lte(generations.createdAt, input.to),
                )
              : undefined,
          ),
        );

      const results = await baseQuery;

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const total = results.length;
      const previousTotal = results.filter(
        (row) => (row.createdAt ?? new Date()) < oneMonthAgo,
      ).length;

      const percentageChange =
        total === 0 && previousTotal === 0
          ? 0
          : previousTotal === 0
            ? 100
            : ((total - previousTotal) / previousTotal) * 100;

      return {
        total,
        percentageChange,
      };
    }),

  getLinkedinStats: protectedProcedure
    .input(
      z
        .object({
          from: z.date().optional(),
          to: z.date().optional(),
          isSiteWide: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const baseQuery = ctx.db
        .select({
          id: generations.id,
          createdAt: generations.createdAt,
        })
        .from(generations)
        .where(
          and(
            eq(generations.source, "linkedin"),
            input?.isSiteWide
              ? undefined
              : eq(generations.userId, ctx.session.user.id),
            input?.from && input?.to
              ? and(
                  gte(generations.createdAt, input.from),
                  lte(generations.createdAt, input.to),
                )
              : undefined,
          ),
        );

      const results = await baseQuery;

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const total = results.length;
      const previousTotal = results.filter(
        (row) => (row.createdAt ?? new Date()) < oneMonthAgo,
      ).length;

      const percentageChange =
        total === 0 && previousTotal === 0
          ? 0
          : previousTotal === 0
            ? 100
            : ((total - previousTotal) / previousTotal) * 100;

      return {
        total,
        percentageChange,
      };
    }),

  getSourcesOverview: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1); // January 1st of current year

    const results = await ctx.db
      .select({
        source: generations.source,
        createdAt: generations.createdAt,
      })
      .from(generations)
      .where(
        and(
          eq(generations.userId, ctx.session.user.id),
          gte(generations.createdAt, startOfYear),
        ),
      );

    // Initialize all months with 0 for each source
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      name: new Date(0, i).toLocaleString("default", { month: "short" }),
      facebook: 0,
      twitter: 0,
      linkedin: 0,
      total: 0,
    }));

    // Aggregate results by month and source
    results.forEach((row) => {
      if (row.createdAt) {
        const month = row.createdAt.getMonth();
        if (monthlyData[month]) {
          if (row.source === "facebook") monthlyData[month].facebook++;
          if (row.source === "twitter") monthlyData[month].twitter++;
          if (row.source === "linkedin") monthlyData[month].linkedin++;
          monthlyData[month].total++;
        }
      }
    });

    return monthlyData;
  }),

  getDailyStats: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(30),
        isSiteWide: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const results = await ctx.db
        .select({
          source: generations.source,
          createdAt: generations.createdAt,
        })
        .from(generations)
        .where(
          and(
            input?.isSiteWide
              ? undefined
              : eq(generations.userId, ctx.session.user.id),
            gte(generations.createdAt, startDate),
          ),
        );

      interface DailyStats {
        date: string;
        facebook: number;
        twitter: number;
        linkedin: number;
        total: number;
      }

      // Create a map of dates
      const dateMap = new Map<string, DailyStats>();
      for (let i = 0; i < input.days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0]!;
        dateMap.set(dateStr, {
          date: dateStr,
          facebook: 0,
          twitter: 0,
          linkedin: 0,
          total: 0,
        });
      }

      // Aggregate results by date and source
      results.forEach((row) => {
        if (row.createdAt) {
          const dateStr = row.createdAt.toISOString().split("T")[0] ?? "";
          const data = dateMap.get(dateStr);
          if (data) {
            if (row.source === "facebook") data.facebook++;
            if (row.source === "twitter") data.twitter++;
            if (row.source === "linkedin") data.linkedin++;
            data.total++;
          }
        }
      });

      return Array.from(dateMap.values()).reverse();
    }),

  getSourceTotals: protectedProcedure
    .input(
      z.object({
        isSiteWide: z.boolean().optional(),
        userId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = input?.userId ?? ctx.session.user.id;

      // Get active subscription to determine the limit
      const activeBilling = input.isSiteWide
        ? null
        : await ctx.db.query.billing.findFirst({
            where: and(
              eq(billing.userId, userId),
              or(eq(billing.status, "active"), eq(billing.status, "APPROVED")),
            ),
            with: {
              product: true,
            },
          });

      // Get current month's usage for calendar month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const monthlyUsage = await ctx.db
        .select({
          count: count(),
        })
        .from(generations)
        .where(
          and(
            input?.isSiteWide ? undefined : eq(generations.userId, userId),
            gte(generations.createdAt, startOfMonth),
            lte(generations.createdAt, endOfMonth),
          ),
        );

      const currentMonthTotal = Number(monthlyUsage[0]?.count ?? 0);

      // Get all entries grouped by source with counts
      const results = await ctx.db
        .select({
          source: generations.source,
          total: count(),
        })
        .from(generations)
        .where(input?.isSiteWide ? undefined : eq(generations.userId, userId))
        .groupBy(generations.source);

      return {
        sources: results.map((result) => ({
          source: result.source,
          total: Number(result.total ?? 0),
        })),
        planLimit: (activeBilling?.product as { limit?: number } | undefined)?.limit ?? 0,
        currentMonthTotal,
        currentMonth: now.toLocaleString("default", { month: "long" }),
      };
    }),

  getHashtagStats: protectedProcedure
    .input(
      z
        .object({
          from: z.date().optional(),
          to: z.date().optional(),
          isSiteWide: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const baseQuery = ctx.db
        .select({
          id: generations.id,
          createdAt: generations.createdAt,
        })
        .from(generations)
        .where(
          and(
            eq(generations.author, "AI Hashtag Generator"),
            input?.isSiteWide
              ? undefined
              : eq(generations.userId, ctx.session.user.id),
            input?.from && input?.to
              ? and(
                  gte(generations.createdAt, input.from),
                  lte(generations.createdAt, input.to),
                )
              : undefined,
          ),
        );

      const results = await baseQuery;

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Calculate totals
      const total = results.length;

      const previousTotal = results.filter(
        (row) => (row.createdAt ?? new Date()) < oneMonthAgo,
      ).length;

      const percentageChange =
        total === 0 && previousTotal === 0
          ? 0
          : previousTotal === 0
            ? 100
            : ((total - previousTotal) / previousTotal) * 100;

      return {
        total,
        percentageChange,
      };
    }),

  // TODO: Implement quality tracking features after creating responseRatings schema
  // rateResponse: protectedProcedure
  //   .input(z.object({
  //     generationId: z.string(),
  //     rating: z.number().min(1).max(5),
  //     feedback: z.string().optional(),
  //   }))
  //   .mutation(async ({ ctx, input }) => {
  //     // Store user feedback for continuous improvement
  //     await ctx.db.insert(responseRatings).values({
  //       generationId: input.generationId,
  //       userId: ctx.session.user.id,
  //       rating: input.rating,
  //       feedback: input.feedback,
  //       createdAt: new Date(),
  //     });
  //     
  //     return { success: true };
  //   }),
    
  // getQualityMetrics: protectedProcedure
  //   .query(async ({ ctx }) => {
  //     // Return quality metrics for admin dashboard
  //     const metrics = await ctx.db
  //       .select({
  //         avgRating: avg(responseRatings.rating),
  //         totalRatings: count(responseRatings.id),
  //         platform: generations.source,
  //       })
  //       .from(responseRatings)
  //       .innerJoin(generations, eq(responseRatings.generationId, generations.id))
  //       .groupBy(generations.source);
  //       
  //     return metrics;
  //   }),
});

// Enhanced response generation function
/**
 * Generates an enhanced response based on the input and AI configuration.
 *
 * This function orchestrates a multi-step process to generate a high-quality response.
 * It first analyzes the context using the provided input and custom prompt.
 * Then, it generates a contextual response using the analyzed context.
 * Finally, it enhances the quality of the generated response before returning it.
 *
 * @param {any} input - The input data for generating the response.
 * @param {any} ai - Configuration object containing AI-related settings like apiKey.
 * @param {any[]} enabledModels - Array of models that are enabled for use.
 * @param {string} customPrompt - A custom prompt string to guide the response generation.
 */
async function generateEnhancedResponse({
  input,
  ai,
  enabledModels,
  customPrompt,
}: {
  input: any;
  ai: any;
  enabledModels: any[];
  customPrompt: string;
}) {
  const { instance } = await getAIInstance({
    apiKey: ai?.apiKey ?? "",
    enabledModels,
  });

  // Step 1: Context Analysis
  const contextAnalysis = await analyzeContext({
    instance,
    input,
    customPrompt,
  });

  // Step 2: Generate Response with Enhanced Prompting
  const response = await generateContextualResponse({
    instance,
    input,
    contextAnalysis,
    customPrompt,
  });

  // Step 3: Quality Enhancement
  const enhancedResponse = await enhanceResponseQuality({
    instance,
    originalResponse: response,
    input,
    contextAnalysis,
  });

  return {
    text: enhancedResponse.text,
    confidence: enhancedResponse.confidence,
    contextAnalysis,
  };
}

// Context analysis function
/**
 * Analyzes social media content and provides insights in JSON format.
 *
 * This function constructs a prompt based on the provided input and sends it to a text generation model.
 * It then attempts to parse the model's response as JSON. If parsing fails, it returns a fallback analysis.
 *
 * @param instance - The model instance used for generating text.
 * @param input - The social media content data including source, type, post, author, and tone.
 */
async function analyzeContext({
  instance,
  input,
}: {
  instance: any;
  input: any;
  customPrompt: string;
}) {
  const contextPrompt = `Analyze the following social media content and provide insights:

Platform: ${input.source}
Type: ${input.type}
Content: ${input.post}
Author: ${input.author ?? "Unknown"}
Tone Requested: ${input.tone}

Provide analysis in this JSON format:
{
  "sentiment": "positive|negative|neutral",
  "topics": ["topic1", "topic2"],
  "engagement_potential": "high|medium|low",
  "content_type": "informational|promotional|conversational|humorous",
  "target_audience": "description",
  "key_points": ["point1", "point2"],
  "cultural_context": "description",
  "trending_elements": ["element1", "element2"]
}`;

  const result = await generateText({
    model: instance,
    prompt: contextPrompt,
    temperature: 0.3, // Lower temperature for analysis
  });

  try {
    return JSON.parse(result.text);
  } catch {
    // Fallback analysis
    return {
      sentiment: "neutral",
      topics: ["general"],
      engagement_potential: "medium",
      content_type: "conversational",
      target_audience: "general audience",
      key_points: ["engagement"],
      cultural_context: "general",
      trending_elements: [],
    };
  }
}

// Enhanced contextual response generation
/**
 * Generates a contextual response based on input and analysis.
 */
async function generateContextualResponse({
  instance,
  input,
  contextAnalysis,
  customPrompt,
}: {
  instance: any;
  input: any;
  contextAnalysis: any;
  customPrompt: string;
}) {
  const platformGuidelines = getPlatformGuidelines(input.source);
  const toneInstructions = getToneInstructions(input.tone, contextAnalysis);
  
  const enhancedSystemPrompt = `You are an expert social media manager with deep understanding of human psychology, cultural nuances, and platform-specific best practices.

${platformGuidelines}

${toneInstructions}

Context Analysis:
- Sentiment: ${contextAnalysis.sentiment}
- Topics: ${contextAnalysis.topics.join(", ")}
- Engagement Potential: ${contextAnalysis.engagement_potential}
- Content Type: ${contextAnalysis.content_type}
- Target Audience: ${contextAnalysis.target_audience}
- Key Points: ${contextAnalysis.key_points.join(", ")}

Custom Instructions: ${customPrompt}

Generate a response that:
1. Matches the analyzed context and sentiment
2. Uses platform-appropriate formatting and style
3. Incorporates relevant trending elements when appropriate
4. Maintains authentic human-like communication
5. Optimizes for engagement while staying genuine
6. Respects cultural context and sensitivities`;

  const userPrompt = buildEnhancedUserPrompt(input, contextAnalysis);

  return await generateText({
    model: instance,
    system: enhancedSystemPrompt,
    prompt: userPrompt,
    temperature: 0.7, // Balanced creativity
  });
}

// Platform-specific guidelines
/**
 * Retrieves platform-specific guidelines based on the given platform name.
 */
function getPlatformGuidelines(platform: string): string {
  const guidelines = {
    x: `Twitter/X Guidelines:
- Keep responses concise (under 280 characters when possible)
- Use relevant hashtags strategically (1-3 max)
- Encourage retweets and replies
- Use threading for longer thoughts
- Leverage trending topics when relevant`,
    
    facebook: `Facebook Guidelines:
- Moderate length posts (1-3 paragraphs)
- Use emojis to enhance emotional connection
- Ask questions to encourage comments
- Share personal insights or experiences
- Use line breaks for readability`,
    
    linkedin: `LinkedIn Guidelines:
- Professional yet personable tone
- Longer-form content (3-5 paragraphs)
- Include industry insights or career advice
- Use professional hashtags
- Encourage meaningful professional discussions
- Share expertise and thought leadership`,
  };
  
  return guidelines[platform as keyof typeof guidelines] || guidelines.x;
}

// Tone-specific instructions
/**
 * Generates tone instructions based on the specified tone and context analysis.
 */
function getToneInstructions(tone: string, contextAnalysis: any): string {
  const baseInstructions = {
    professional: "Maintain a polished, authoritative voice while being approachable",
    casual: "Use conversational language, contractions, and relatable expressions",
    humorous: "Incorporate wit, wordplay, or light humor appropriate to the context",
    inspirational: "Use uplifting language that motivates and encourages action",
    educational: "Provide valuable insights while maintaining an accessible teaching tone",
    empathetic: "Show understanding and emotional intelligence in your response",
  };
  
  const sentimentAdjustment = {
    positive: "Match and amplify the positive energy",
    negative: "Acknowledge concerns while offering constructive perspective",
    neutral: "Bring appropriate energy based on the desired tone",
  };
  
  return `Tone: ${tone}
${baseInstructions[tone as keyof typeof baseInstructions] || baseInstructions.casual}
${sentimentAdjustment[contextAnalysis.sentiment as keyof typeof sentimentAdjustment]}`;
}

// Enhanced user prompt builder
/**
 * Constructs an enhanced user prompt based on input type and context.
 *
 * This function generates a detailed prompt for different types of content,
 * such as replies or original posts, incorporating various contextual elements like
 * author, URL, media attachments, and quoted content. The prompt is designed to guide
 * the creation of engaging and relevant responses.
 *
 * @param input - An object containing details about the content to be generated.
 */
function buildEnhancedUserPrompt(input: any, _contextAnalysis: any): string {
  let prompt = `Generate a ${input.type} for ${input.source}:\n\n`;
  
  if (input.type === "reply") {
    prompt += `Original Post: ${input.post}\n`;
    if (input.author) prompt += `Author: ${input.author}\n`;
    if (input.url) prompt += `Link: ${input.url}\n`;
    prompt += `\nCreate an engaging reply that adds value to the conversation.`;
  } else {
    prompt += `Topic/Keywords: ${input.post}\n`;
    prompt += `\nCreate an original post about this topic.`;
  }
  
  // Add media context if available
  if (input.images?.length > 0) {
    prompt += `\n\nImages attached: ${input.images.length} image(s)`;
  }
  
  if (input.video) {
    prompt += `\n\nVideo content included`;
  }
  
  if (input.quotedPost) {
    prompt += `\n\nQuoted content: @${input.quotedPost.handle}: ${input.quotedPost.text}`;
  }
  
  return prompt;
}

// Quality enhancement function
/**
 * Enhances the quality of a social media response by generating an improved version based on provided context and original response.
 *
 * The function constructs a prompt to guide the enhancement process, including details about the original response's platform, tone,
 * and context. It then uses an AI model to generate the enhanced response, which is parsed for further processing. If parsing fails,
 * it returns the original response with a default confidence score and no improvements listed.
 *
 * @param {any} instance - The AI model instance used for generating the enhanced response.
 * @param {any} originalResponse - The original social media response to be enhanced.
 * @param {any} input - The input data containing details about the platform and tone of the original response.
 * @param {any} contextAnalysis - Analysis of the context in which the response was made, including content type.
 */
async function enhanceResponseQuality({
  instance,
  originalResponse,
  input,
  contextAnalysis,
}: {
  instance: any;
  originalResponse: any;
  input: any;
  contextAnalysis: any;
}) {
  const qualityPrompt = `Review and enhance this social media response:

Original Response: ${originalResponse.text}

Platform: ${input.source}
Tone: ${input.tone}
Context: ${contextAnalysis.content_type}

Improve the response by:
1. Enhancing clarity and readability
2. Optimizing engagement potential
3. Ensuring platform-appropriate formatting
4. Adding subtle personality without being artificial
5. Maintaining the core message while improving flow

Provide the enhanced response in this JSON format:
{
  "enhanced_text": "improved response here",
  "confidence_score": 0.85,
  "improvements_made": ["improvement1", "improvement2"]
}`;

  const result = await generateText({
    model: instance,
    prompt: qualityPrompt,
    temperature: 0.4, // Moderate creativity for enhancement
  });

  try {
    const parsed = JSON.parse(result.text);
    return {
      text: parsed.enhanced_text,
      confidence: parsed.confidence_score,
      improvements: parsed.improvements_made,
    };
  } catch {
    // Fallback to original response
    return {
      text: originalResponse.text,
      confidence: 0.7,
      improvements: [],
    };
  }
}
