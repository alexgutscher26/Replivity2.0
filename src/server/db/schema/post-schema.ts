/* eslint-disable @typescript-eslint/no-unsafe-return */
import { sql, relations } from "drizzle-orm";
import {
  index,
  integer,
  timestamp,
  varchar,
  text,
  boolean,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { createTable } from "../config";
import { user } from "./auth-schema";

/**
 * Blog Posts Table - Enhanced for comprehensive blog functionality
 */
export const blogPosts = createTable(
  "blog_post",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    title: varchar("title", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 500 }).notNull().unique(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    featuredImage: varchar("featured_image", { length: 500 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, published, archived
    publishedAt: timestamp("published_at", { withTimezone: true }),
    seoTitle: varchar("seo_title", { length: 60 }),
    seoDescription: varchar("seo_description", { length: 160 }),
    seoKeywords: text("seo_keywords"),
    readingTime: integer("reading_time"), // in minutes
    viewCount: integer("view_count").default(0),
    metadata: jsonb("metadata"), // for additional custom fields
    createdById: varchar("created_by", { length: 255 })
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      (): Date => new Date(),
    ),
  },
  (table) => ({
    createdByIdIdx: index("blog_post_created_by_idx").on(table.createdById),
    slugIdx: index("blog_post_slug_idx").on(table.slug),
    statusIdx: index("blog_post_status_idx").on(table.status),
    publishedAtIdx: index("blog_post_published_at_idx").on(table.publishedAt),
  }),
);

/**
 * Blog Categories Table
 */
export const blogCategories = createTable(
  "blog_category",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    color: varchar("color", { length: 7 }), // hex color
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      (): Date => new Date(),
    ),
  },
  (table) => ({
    slugIdx: index("blog_category_slug_idx").on(table.slug),
    nameIdx: index("blog_category_name_idx").on(table.name),
  }),
);

/**
 * Blog Tags Table
 */
export const blogTags = createTable(
  "blog_tag",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 50 }).notNull(),
    slug: varchar("slug", { length: 50 }).notNull().unique(),
    color: varchar("color", { length: 7 }), // hex color
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    slugIdx: index("blog_tag_slug_idx").on(table.slug),
    nameIdx: index("blog_tag_name_idx").on(table.name),
  }),
);

/**
 * Blog Post Categories Junction Table
 */
export const blogPostCategories = createTable(
  "blog_post_category",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => blogCategories.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.categoryId] }),
    postIdIdx: index("blog_post_category_post_idx").on(table.postId),
    categoryIdIdx: index("blog_post_category_category_idx").on(
      table.categoryId,
    ),
  }),
);

/**
 * Blog Post Tags Junction Table
 */
export const blogPostTags = createTable(
  "blog_post_tag",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => blogTags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.tagId] }),
    postIdIdx: index("blog_post_tag_post_idx").on(table.postId),
    tagIdIdx: index("blog_post_tag_tag_idx").on(table.tagId),
  }),
);

/**
 * Legacy Posts Table (keeping for backward compatibility)
 */
export const posts = createTable(
  "post",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("created_by", { length: 255 })
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      (): Date => new Date(),
    ),
  },
  (table) => ({
    createdByIdIdx: index("created_by_idx").on(table.createdById),
    nameIndex: index("name_idx").on(table.name),
  }),
);

/**
 * Relations
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  author: one(user, {
    fields: [blogPosts.createdById],
    references: [user.id],
  }),
  categories: many(blogPostCategories),
  tags: many(blogPostTags),
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
export const blogCategoriesRelations = relations(
  blogCategories,
  ({ many }) => ({
    posts: many(blogPostCategories),
  }),
);

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
export const blogTagsRelations = relations(blogTags, ({ many }) => ({
  posts: many(blogPostTags),
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
export const blogPostCategoriesRelations = relations(
  blogPostCategories,
  ({ one }) => ({
    post: one(blogPosts, {
      fields: [blogPostCategories.postId],
      references: [blogPosts.id],
    }),
    category: one(blogCategories, {
      fields: [blogPostCategories.categoryId],
      references: [blogCategories.id],
    }),
  }),
);

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
export const blogPostTagsRelations = relations(blogPostTags, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostTags.postId],
    references: [blogPosts.id],
  }),
  tag: one(blogTags, {
    fields: [blogPostTags.tagId],
    references: [blogTags.id],
  }),
}));

/**
 * Blog Comments Table
 */
export const blogComments: any = createTable(
  "blog_comment",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    postId: integer("post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    parentId: integer("parent_id").references(() => blogComments.id, {
      onDelete: "cascade",
    }),
    authorId: varchar("author_id", { length: 255 }).references(() => user.id, {
      onDelete: "set null",
    }),
    authorName: varchar("author_name", { length: 100 }).notNull(),
    authorEmail: varchar("author_email", { length: 255 }).notNull(),
    authorWebsite: varchar("author_website", { length: 500 }),
    content: text("content").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected, spam
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    isEdited: boolean("is_edited").default(false),
    editedAt: timestamp("edited_at", { withTimezone: true }),
    likeCount: integer("like_count").default(0),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      (): Date => new Date(),
    ),
  },
  (table) => ({
    postIdIdx: index("blog_comment_post_idx").on(table.postId),
    parentIdIdx: index("blog_comment_parent_idx").on(table.parentId),
    authorIdIdx: index("blog_comment_author_idx").on(table.authorId),
    statusIdx: index("blog_comment_status_idx").on(table.status),
    createdAtIdx: index("blog_comment_created_at_idx").on(table.createdAt),
    emailIdx: index("blog_comment_email_idx").on(table.authorEmail),
  }),
);

/**
 * Blog Comment Likes Table
 */
export const blogCommentLikes = createTable(
  "blog_comment_like",
  {
    commentId: integer("comment_id")
      .notNull()
      .references(() => blogComments.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.commentId, table.userId] }),
    commentIdIdx: index("blog_comment_like_comment_idx").on(table.commentId),
    userIdIdx: index("blog_comment_like_user_idx").on(table.userId),
  }),
);

/**
 * Comment Relations
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
export const blogCommentsRelations = relations(
  blogComments,
  ({ one, many }) => ({
    post: one(blogPosts, {
      fields: [blogComments.postId],
      references: [blogPosts.id],
    }),
    author: one(user, {
      fields: [blogComments.authorId],
      references: [user.id],
    }),
    parent: one(blogComments, {
      fields: [blogComments.parentId],
      references: [blogComments.id],
      relationName: "CommentReplies",
    }),
    replies: many(blogComments, {
      relationName: "CommentReplies",
    }),
    likes: many(blogCommentLikes),
  }),
);

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
export const blogCommentLikesRelations = relations(
  blogCommentLikes,
  ({ one }) => ({
    comment: one(blogComments, {
      fields: [blogCommentLikes.commentId],
      references: [blogComments.id],
    }),
    user: one(user, {
      fields: [blogCommentLikes.userId],
      references: [user.id],
    }),
  }),
);

// Update blog posts relations to include comments
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
export const blogPostsRelationsUpdated = relations(
  blogPosts,
  ({ one, many }) => ({
    author: one(user, {
      fields: [blogPosts.createdById],
      references: [user.id],
    }),
    categories: many(blogPostCategories),
    tags: many(blogPostTags),
    comments: many(blogComments),
  }),
);
