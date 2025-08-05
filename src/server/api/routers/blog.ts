/* eslint-disable @typescript-eslint/no-unsafe-return */
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { 
  blogPosts, 
  blogCategories, 
  blogTags, 
  blogPostCategories, 
  blogPostTags,
  blogComments,
  blogCommentLikes
} from "@/server/db/schema/post-schema";
import { eq, desc, asc, and, or, like, sql, count, inArray, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Validation schemas
const createPostSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(500),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  featuredImage: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  publishedAt: z.date().optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  seoKeywords: z.string().optional(),
  readingTime: z.number().optional(),
  categoryIds: z.array(z.number()).optional(),
  tagIds: z.array(z.number()).optional(),
  metadata: z.record(z.any()).optional(),
});

const updatePostSchema = createPostSchema.partial().extend({
  id: z.number(),
});

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.number(),
});

const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

const updateTagSchema = createTagSchema.partial().extend({
  id: z.number(),
});

// Comment validation schemas
const createCommentSchema = z.object({
  postId: z.number(),
  parentId: z.number().optional(),
  authorName: z.string().min(1).max(100),
  authorEmail: z.string().email().max(255),
  authorWebsite: z.string().url().max(500).optional(),
  content: z.string().min(1).max(5000),
});

const updateCommentSchema = z.object({
  id: z.number(),
  content: z.string().min(1).max(5000).optional(),
  status: z.enum(["pending", "approved", "rejected", "spam"]).optional(),
});

const getCommentsSchema = z.object({
  postId: z.number().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  status: z.enum(["pending", "approved", "rejected", "spam"]).optional(),
  sortBy: z.enum(["createdAt", "likeCount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Helper function to calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export const blogRouter = createTRPCRouter({
  // Blog Posts CRUD
  createPost: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      const { categoryIds, tagIds, ...postData } = input;
      
      // Auto-generate slug if not provided
      if (!postData.slug) {
        postData.slug = generateSlug(postData.title);
      }
      
      // Calculate reading time
      const readingTime = calculateReadingTime(postData.content);
      
      // Check if slug already exists
      const existingPost = await ctx.db.query.blogPosts.findFirst({
        where: eq(blogPosts.slug, postData.slug),
      });
      
      if (existingPost) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A post with this slug already exists",
        });
      }
      
      // Create the post
      const [newPost] = await ctx.db.insert(blogPosts).values({
        ...postData,
        readingTime,
        createdById: ctx.session.user.id,
      }).returning();
      
      if (!newPost) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create post",
        });
      }
      
      // Add categories
      if (categoryIds && categoryIds.length > 0) {
        await ctx.db.insert(blogPostCategories).values(
          categoryIds.map(categoryId => ({
            postId: newPost.id,
            categoryId,
          }))
        );
      }
      
      // Add tags
      if (tagIds && tagIds.length > 0) {
        await ctx.db.insert(blogPostTags).values(
          tagIds.map(tagId => ({
            postId: newPost.id,
            tagId,
          }))
        );
      }
      
      return newPost;
    }),

  updatePost: protectedProcedure
    .input(updatePostSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, categoryIds, tagIds, ...updateData } = input;
      
      // Check if post exists and user owns it
      const existingPost = await ctx.db.query.blogPosts.findFirst({
        where: eq(blogPosts.id, id),
      });
      
      if (!existingPost) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }
      
      if (existingPost.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own posts",
        });
      }
      
      // Update reading time if content changed
      if (updateData.content) {
        updateData.readingTime = calculateReadingTime(updateData.content);
      }
      
      // Update the post
      const [updatedPost] = await ctx.db
        .update(blogPosts)
        .set(updateData)
        .where(eq(blogPosts.id, id))
        .returning();
      
      // Update categories if provided
      if (categoryIds !== undefined) {
        await ctx.db.delete(blogPostCategories).where(eq(blogPostCategories.postId, id));
        if (categoryIds.length > 0) {
          await ctx.db.insert(blogPostCategories).values(
            categoryIds.map(categoryId => ({
              postId: id,
              categoryId,
            }))
          );
        }
      }
      
      // Update tags if provided
      if (tagIds !== undefined) {
        await ctx.db.delete(blogPostTags).where(eq(blogPostTags.postId, id));
        if (tagIds.length > 0) {
          await ctx.db.insert(blogPostTags).values(
            tagIds.map(tagId => ({
              postId: id,
              tagId,
            }))
          );
        }
      }
      
      return updatedPost;
    }),

  deletePost: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existingPost = await ctx.db.query.blogPosts.findFirst({
        where: eq(blogPosts.id, input.id),
      });
      
      if (!existingPost) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }
      
      if (existingPost.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own posts",
        });
      }
      
      await ctx.db.delete(blogPosts).where(eq(blogPosts.id, input.id));
      return { success: true };
    }),

  getPost: publicProcedure
    .input(z.object({ 
      slug: z.string().optional(),
      id: z.number().optional(),
      incrementView: z.boolean().default(false)
    }))
    .query(async ({ ctx, input }) => {
      if (!input.slug && !input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Either slug or id must be provided",
        });
      }
      
      const whereCondition = input.slug 
        ? eq(blogPosts.slug, input.slug)
        : eq(blogPosts.id, input.id!);
      
      const post = await ctx.db.query.blogPosts.findFirst({
        where: whereCondition,
        with: {
          author: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
          categories: {
            with: {
              category: true,
            },
          },
          tags: {
            with: {
              tag: true,
            },
          },
        },
      });
      
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }
      
      // Increment view count if requested
      if (input.incrementView) {
        await ctx.db
          .update(blogPosts)
          .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
          .where(eq(blogPosts.id, post.id));
      }
      
      return post;
    }),

  getPosts: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      offset: z.number().min(0).default(0),
      status: z.enum(["draft", "published", "archived"]).optional(),
      categoryId: z.number().optional(),
      tagId: z.number().optional(),
      search: z.string().optional(),
      sortBy: z.enum(["createdAt", "publishedAt", "title", "viewCount"]).default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, offset, status, search, sortBy, sortOrder } = input;
      
      const whereConditions = [];
      
      // Filter by status
      if (status) {
        whereConditions.push(eq(blogPosts.status, status));
      }
      
      // Search functionality
      if (search) {
        whereConditions.push(
          or(
            like(blogPosts.title, `%${search}%`),
            like(blogPosts.excerpt, `%${search}%`),
            like(blogPosts.content, `%${search}%`)
          )
        );
      }
      
      // Create orderBy mapping
      const orderByColumn = {
        createdAt: blogPosts.createdAt,
        publishedAt: blogPosts.publishedAt,
        title: blogPosts.title,
        viewCount: blogPosts.viewCount,
      }[sortBy] ?? blogPosts.createdAt;

      // Build the base query
      const query = ctx.db.query.blogPosts.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        with: {
          author: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
          categories: {
            with: {
              category: true,
            },
          },
          tags: {
            with: {
              tag: true,
            },
          },
        },
        limit,
        offset,
        orderBy: sortOrder === "desc" ? desc(orderByColumn) : asc(orderByColumn),
      });
      
      const posts = await query;
      
      // Get total count for pagination
      const countResult = await ctx.db
        .select({ count: count() })
        .from(blogPosts)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
      
      const totalCount = countResult[0]?.count ?? 0;
      
      return {
        posts,
        totalCount,
        hasMore: offset + limit < totalCount,
      };
    }),

  // Categories CRUD
  createCategory: protectedProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const existingCategory = await ctx.db.query.blogCategories.findFirst({
        where: eq(blogCategories.slug, input.slug),
      });
      
      if (existingCategory) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A category with this slug already exists",
        });
      }
      
      const [newCategory] = await ctx.db.insert(blogCategories).values(input).returning();
      return newCategory;
    }),

  updateCategory: protectedProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      
      const [updatedCategory] = await ctx.db
        .update(blogCategories)
        .set(updateData)
        .where(eq(blogCategories.id, id))
        .returning();
      
      if (!updatedCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }
      
      return updatedCategory;
    }),

  deleteCategory: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(blogCategories).where(eq(blogCategories.id, input.id));
      return { success: true };
    }),

  getCategories: publicProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.query.blogCategories.findMany({
        where: eq(blogCategories.isActive, true),
        orderBy: asc(blogCategories.name),
      });
    }),

  // Tags CRUD
  createTag: protectedProcedure
    .input(createTagSchema)
    .mutation(async ({ ctx, input }) => {
      const existingTag = await ctx.db.query.blogTags.findFirst({
        where: eq(blogTags.slug, input.slug),
      });
      
      if (existingTag) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A tag with this slug already exists",
        });
      }
      
      const [newTag] = await ctx.db.insert(blogTags).values(input).returning();
      return newTag;
    }),

  updateTag: protectedProcedure
    .input(updateTagSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      
      const [updatedTag] = await ctx.db
        .update(blogTags)
        .set(updateData)
        .where(eq(blogTags.id, id))
        .returning();
      
      if (!updatedTag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });
      }
      
      return updatedTag;
    }),

  // Comment CRUD operations
  createComment: publicProcedure
    .input(createCommentSchema)
    .mutation(async ({ ctx, input }) => {
      const { postId, parentId, authorName, authorEmail, authorWebsite, content } = input;
      
      // Check if post exists
      const post = await ctx.db.query.blogPosts.findFirst({
        where: eq(blogPosts.id, postId),
      });
      
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blog post not found",
        });
      }
      
      // If parentId is provided, check if parent comment exists
      if (parentId) {
        const parentComment = await ctx.db.query.blogComments.findFirst({
          where: eq(blogComments.id, parentId),
        });
        
        if (!parentComment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent comment not found",
          });
        }
      }
      
      const [newComment] = await ctx.db
        .insert(blogComments)
        .values({
          postId,
          parentId,
          authorId: ctx.session?.user?.id,
          authorName,
          authorEmail,
          authorWebsite,
          content,
          status: "pending", // Default to pending for moderation
        })
        .returning();
      
      return newComment;
    }),

  getComments: publicProcedure
    .input(getCommentsSchema)
    .query(async ({ ctx, input }) => {
      const { postId, limit, offset, status, sortBy, sortOrder } = input;
      
      const whereConditions = [];
      
      // Filter by postId if provided
      if (postId) {
        whereConditions.push(eq(blogComments.postId, postId));
      }
      
      // Only fetch top-level comments (parentId is null) for proper nested structure
      whereConditions.push(isNull(blogComments.parentId));
      
      // Filter by status if provided
      if (status) {
        whereConditions.push(eq(blogComments.status, status));
      } else if (postId) {
        // Default to approved comments for public view when viewing specific post
        whereConditions.push(eq(blogComments.status, "approved"));
      }
      // For admin view (no postId), show all statuses if no status filter is provided
      
      const orderByColumn = sortBy === "likeCount" ? blogComments.likeCount : blogComments.createdAt;
      
      const comments = await ctx.db.query.blogComments.findMany({
        where: and(...whereConditions),
        with: {
          author: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
          replies: {
            with: {
              author: {
                columns: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              replies: {
                with: {
                  author: {
                    columns: {
                      id: true,
                      name: true,
                      image: true,
                    },
                  },
                  replies: {
                    with: {
                      author: {
                        columns: {
                          id: true,
                          name: true,
                          image: true,
                        },
                      },
                    },
                    orderBy: asc(blogComments.createdAt),
                  },
                },
                orderBy: asc(blogComments.createdAt),
              },
            },
            orderBy: asc(blogComments.createdAt),
          },
          likes: true,
        },
        limit,
        offset,
        orderBy: sortOrder === "desc" ? desc(orderByColumn) : asc(orderByColumn),
      });
      
      // Get total count for pagination (only top-level comments)
      const countResult = await ctx.db
        .select({ count: count() })
        .from(blogComments)
        .where(and(...whereConditions));
      
      const totalCount = countResult[0]?.count ?? 0;
      
      return {
        comments,
        totalCount,
        hasMore: offset + limit < totalCount,
      };
    }),

  updateComment: protectedProcedure
    .input(updateCommentSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      
      // Check if comment exists and user has permission
      const comment = await ctx.db.query.blogComments.findFirst({
        where: eq(blogComments.id, id),
      });
      
      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }
      
      // Only allow comment author or admin to update
      if (comment.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own comments",
        });
      }
      
      const [updatedComment] = await ctx.db
        .update(blogComments)
        .set({
          ...updateData,
          isEdited: true,
          editedAt: new Date(),
        })
        .where(eq(blogComments.id, id))
        .returning();
      
      return updatedComment;
    }),

  deleteComment: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.query.blogComments.findFirst({
        where: eq(blogComments.id, input.id),
      });
      
      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }
      
      // Only allow comment author or admin to delete
      if (comment.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own comments",
        });
      }
      
      await ctx.db.delete(blogComments).where(eq(blogComments.id, input.id));
      
      return { success: true };
    }),

  likeComment: protectedProcedure
    .input(z.object({ commentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;
      const userId = ctx.session.user.id;
      
      // Check if comment exists
      const comment = await ctx.db.query.blogComments.findFirst({
        where: eq(blogComments.id, commentId),
      });
      
      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }
      
      // Check if user already liked this comment
      const existingLike = await ctx.db.query.blogCommentLikes.findFirst({
        where: and(
          eq(blogCommentLikes.commentId, commentId),
          eq(blogCommentLikes.userId, userId)
        ),
      });
      
      if (existingLike) {
        // Unlike the comment
        await ctx.db.delete(blogCommentLikes).where(
          and(
            eq(blogCommentLikes.commentId, commentId),
            eq(blogCommentLikes.userId, userId)
          )
        );
        
        // Decrement like count
        await ctx.db
          .update(blogComments)
          .set({ likeCount: sql`${blogComments.likeCount} - 1` })
          .where(eq(blogComments.id, commentId));
        
        return { liked: false };
      } else {
        // Like the comment
        await ctx.db.insert(blogCommentLikes).values({
          commentId,
          userId,
        });
        
        // Increment like count
        await ctx.db
          .update(blogComments)
          .set({ likeCount: sql`${blogComments.likeCount} + 1` })
          .where(eq(blogComments.id, commentId));
        
        return { liked: true };
      }
    }),

  moderateComment: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["approved", "rejected", "spam"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can moderate comments",
        });
      }
      
      const { id, status } = input;
      
      const [updatedComment] = await ctx.db
        .update(blogComments)
        .set({ status })
        .where(eq(blogComments.id, id))
        .returning();
      
      if (!updatedComment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }
      
      return updatedComment;
    }),

  bulkModerateComments: protectedProcedure
    .input(z.object({
      ids: z.array(z.number()),
      status: z.enum(["approved", "rejected", "spam"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can moderate comments",
        });
      }
      
      const { ids, status } = input;
      
      const updatedComments = await ctx.db
        .update(blogComments)
        .set({ status })
        .where(inArray(blogComments.id, ids))
        .returning();
      
      return updatedComments;
    }),

  bulkDeleteComments: protectedProcedure
    .input(z.object({
      ids: z.array(z.number()),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete comments",
        });
      }
      
      const { ids } = input;
      
      await ctx.db.delete(blogComments).where(inArray(blogComments.id, ids));
      
      return { success: true, deletedCount: ids.length };
    }),

  deleteTag: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(blogTags).where(eq(blogTags.id, input.id));
      return { success: true };
    }),

  getTags: publicProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.query.blogTags.findMany({
        where: eq(blogTags.isActive, true),
        orderBy: asc(blogTags.name),
      });
    }),

  // Analytics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [postsCount] = await ctx.db
        .select({ count: count() })
        .from(blogPosts)
        .where(eq(blogPosts.createdById, ctx.session.user.id));
      
      const [publishedCount] = await ctx.db
        .select({ count: count() })
        .from(blogPosts)
        .where(
          and(
            eq(blogPosts.createdById, ctx.session.user.id),
            eq(blogPosts.status, "published")
          )
        );
      
      const [totalViews] = await ctx.db
        .select({ total: sql<number>`sum(${blogPosts.viewCount})` })
        .from(blogPosts)
        .where(eq(blogPosts.createdById, ctx.session.user.id));
      
      return {
        totalPosts: postsCount?.count ?? 0,
        publishedPosts: publishedCount?.count ?? 0,
        totalViews: totalViews?.total ?? 0,
      };
    }),
});