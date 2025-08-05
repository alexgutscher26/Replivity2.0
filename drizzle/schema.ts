import { pgTable, text, timestamp, uuid, jsonb, foreignKey, unique, index, numeric, boolean, integer, varchar, primaryKey } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"




export const replierVerification = pgTable("replier_verification", {
	id: text("id").primaryKey().notNull(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const replierSettings = pgTable("replier_settings", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	general: jsonb("general").default({}),
	account: jsonb("account").default({"brandName":"","brandTone":"professional","customTone":"","brandValues":"","customPrompt":"","avoidKeywords":"","brandKeywords":"","targetAudience":"","brandPersonality":""}),
	billing: jsonb("billing").default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const replierAccount = pgTable("replier_account", {
	id: text("id").primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		replierAccountUserIdReplierUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [replierUser.id],
			name: "replier_account_user_id_replier_user_id_fk"
		}),
	}
});

export const replierSession = pgTable("replier_session", {
	id: text("id").primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text("token").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
	impersonatedBy: text("impersonated_by"),
},
(table) => {
	return {
		replierSessionUserIdReplierUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [replierUser.id],
			name: "replier_session_user_id_replier_user_id_fk"
		}),
		replierSessionTokenUnique: unique("replier_session_token_unique").on(table.token),
	}
});

export const replierBilling = pgTable("replier_billing", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	productId: uuid("product_id").notNull(),
	status: text("status").default('pending').notNull(),
	provider: text("provider").notNull(),
	providerTransactionId: text("provider_transaction_id"),
	providerId: text("provider_id").notNull(),
	customerId: text("customer_id").notNull(),
	amount: numeric("amount").notNull(),
	currency: text("currency").notNull(),
	interval: text("interval"),
	currentPeriodStart: timestamp("current_period_start", { mode: 'string' }),
	currentPeriodEnd: timestamp("current_period_end", { mode: 'string' }),
	cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
	canceledAt: timestamp("canceled_at", { mode: 'string' }),
	endedAt: timestamp("ended_at", { mode: 'string' }),
	metadata: jsonb("metadata").default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		activeSubIdx: index("active_sub_idx").using("btree", table.userId.asc().nullsLast(), table.productId.asc().nullsLast(), table.status.asc().nullsLast()),
		productIdIdx: index("product_id_idx").using("btree", table.productId.asc().nullsLast()),
		statusIdx: index("status_idx").using("btree", table.status.asc().nullsLast()),
		userIdIdx: index("user_id_idx").using("btree", table.userId.asc().nullsLast()),
		replierBillingUserIdReplierUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [replierUser.id],
			name: "replier_billing_user_id_replier_user_id_fk"
		}),
		replierBillingProductIdReplierProductsIdFk: foreignKey({
			columns: [table.productId],
			foreignColumns: [replierProducts.id],
			name: "replier_billing_product_id_replier_products_id_fk"
		}),
	}
});

export const replierProducts = pgTable("replier_products", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: text("name").notNull(),
	description: text("description"),
	price: numeric("price").notNull(),
	type: text("type").notNull(),
	mode: text("mode").notNull(),
	limit: integer("limit"),
	hasTrial: boolean("has_trial").default(false),
	trialDuration: integer("trial_duration"),
	trialUsageLimit: integer("trial_usage_limit"),
	marketingTaglines: jsonb("marketing_taglines").array(),
	status: text("status").default('active').notNull(),
	priceId: text("price_id"),
	isFree: boolean("is_free").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const replierGeneration = pgTable("replier_generation", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	productId: uuid("product_id").notNull(),
	source: text("source").notNull(),
	link: text("link"),
	post: text("post").notNull(),
	reply: text("reply").notNull(),
	author: text("author"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		generationProductIdIdx: index("generation_product_id_idx").using("btree", table.productId.asc().nullsLast()),
		generationSourceIdx: index("generation_source_idx").using("btree", table.source.asc().nullsLast()),
		generationUserIdIdx: index("generation_user_id_idx").using("btree", table.userId.asc().nullsLast()),
		generationUserProductIdx: index("generation_user_product_idx").using("btree", table.userId.asc().nullsLast(), table.productId.asc().nullsLast()),
		replierGenerationUserIdReplierUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [replierUser.id],
			name: "replier_generation_user_id_replier_user_id_fk"
		}),
		replierGenerationProductIdReplierProductsIdFk: foreignKey({
			columns: [table.productId],
			foreignColumns: [replierProducts.id],
			name: "replier_generation_product_id_replier_products_id_fk"
		}),
	}
});

export const replierPost = pgTable("replier_post", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity({ name: "replier_post_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar("name", { length: 256 }),
	createdBy: varchar("created_by", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
},
(table) => {
	return {
		createdByIdx: index("created_by_idx").using("btree", table.createdBy.asc().nullsLast()),
		nameIdx: index("name_idx").using("btree", table.name.asc().nullsLast()),
		replierPostCreatedByReplierUserIdFk: foreignKey({
			columns: [table.createdBy],
			foreignColumns: [replierUser.id],
			name: "replier_post_created_by_replier_user_id_fk"
		}),
	}
});

export const replierUsage = pgTable("replier_usage", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	productId: uuid("product_id").notNull(),
	used: integer("used").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		usageProductIdIdx: index("usage_product_id_idx").using("btree", table.productId.asc().nullsLast()),
		usageUserIdIdx: index("usage_user_id_idx").using("btree", table.userId.asc().nullsLast()),
		usageUserProductIdx: index("usage_user_product_idx").using("btree", table.userId.asc().nullsLast(), table.productId.asc().nullsLast()),
		replierUsageUserIdReplierUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [replierUser.id],
			name: "replier_usage_user_id_replier_user_id_fk"
		}),
		replierUsageProductIdReplierProductsIdFk: foreignKey({
			columns: [table.productId],
			foreignColumns: [replierProducts.id],
			name: "replier_usage_product_id_replier_products_id_fk"
		}),
	}
});

export const replierTwoFactor = pgTable("replier_two_factor", {
	id: text("id").primaryKey().notNull(),
	secret: text("secret").notNull(),
	backupCodes: text("backup_codes").notNull(),
	userId: text("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		replierTwoFactorUserIdReplierUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [replierUser.id],
			name: "replier_two_factor_user_id_replier_user_id_fk"
		}),
	}
});

export const replierUser = pgTable("replier_user", {
	id: text("id").primaryKey().notNull(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	role: text("role"),
	banned: boolean("banned"),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires", { mode: 'string' }),
	twoFactorEnabled: boolean("two_factor_enabled"),
	passwordResetRequired: boolean("password_reset_required").default(false),
	passwordResetReason: text("password_reset_reason"),
	passwordResetRequiredAt: timestamp("password_reset_required_at", { mode: 'string' }),
	lastPasswordChange: timestamp("last_password_change", { mode: 'string' }),
	passwordExpiresAt: timestamp("password_expires_at", { mode: 'string' }),
},
(table) => {
	return {
		replierUserEmailUnique: unique("replier_user_email_unique").on(table.email),
	}
});

export const replierSecurityEvent = pgTable("replier_security_event", {
	id: text("id").primaryKey().notNull(),
	userId: text("user_id").notNull(),
	eventType: text("event_type").notNull(),
	severity: text("severity").notNull(),
	description: text("description").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	metadata: text("metadata"),
	actionTaken: text("action_taken"),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		replierSecurityEventUserIdReplierUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [replierUser.id],
			name: "replier_security_event_user_id_replier_user_id_fk"
		}),
	}
});

export const replierBlogPost = pgTable("replier_blog_post", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity({ name: "replier_blog_post_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	title: varchar("title", { length: 500 }).notNull(),
	slug: varchar("slug", { length: 500 }).notNull(),
	excerpt: text("excerpt"),
	content: text("content").notNull(),
	featuredImage: varchar("featured_image", { length: 500 }),
	status: varchar("status", { length: 20 }).default('draft').notNull(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	seoTitle: varchar("seo_title", { length: 60 }),
	seoDescription: varchar("seo_description", { length: 160 }),
	seoKeywords: text("seo_keywords"),
	readingTime: integer("reading_time"),
	viewCount: integer("view_count").default(0),
	metadata: jsonb("metadata"),
	createdBy: varchar("created_by", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
},
(table) => {
	return {
		blogPostCreatedByIdx: index("blog_post_created_by_idx").using("btree", table.createdBy.asc().nullsLast()),
		blogPostPublishedAtIdx: index("blog_post_published_at_idx").using("btree", table.publishedAt.asc().nullsLast()),
		blogPostSlugIdx: index("blog_post_slug_idx").using("btree", table.slug.asc().nullsLast()),
		blogPostStatusIdx: index("blog_post_status_idx").using("btree", table.status.asc().nullsLast()),
		replierBlogPostCreatedByReplierUserIdFk: foreignKey({
			columns: [table.createdBy],
			foreignColumns: [replierUser.id],
			name: "replier_blog_post_created_by_replier_user_id_fk"
		}),
		replierBlogPostSlugUnique: unique("replier_blog_post_slug_unique").on(table.slug),
	}
});

export const replierBlogCategory = pgTable("replier_blog_category", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity({ name: "replier_blog_category_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar("name", { length: 100 }).notNull(),
	slug: varchar("slug", { length: 100 }).notNull(),
	description: text("description"),
	color: varchar("color", { length: 7 }),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
},
(table) => {
	return {
		blogCategoryNameIdx: index("blog_category_name_idx").using("btree", table.name.asc().nullsLast()),
		blogCategorySlugIdx: index("blog_category_slug_idx").using("btree", table.slug.asc().nullsLast()),
		replierBlogCategorySlugUnique: unique("replier_blog_category_slug_unique").on(table.slug),
	}
});

export const replierBlogTag = pgTable("replier_blog_tag", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity({ name: "replier_blog_tag_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar("name", { length: 50 }).notNull(),
	slug: varchar("slug", { length: 50 }).notNull(),
	color: varchar("color", { length: 7 }),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => {
	return {
		blogTagNameIdx: index("blog_tag_name_idx").using("btree", table.name.asc().nullsLast()),
		blogTagSlugIdx: index("blog_tag_slug_idx").using("btree", table.slug.asc().nullsLast()),
		replierBlogTagSlugUnique: unique("replier_blog_tag_slug_unique").on(table.slug),
	}
});

export const replierBlogComment = pgTable("replier_blog_comment", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity({ name: "replier_blog_comment_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	postId: integer("post_id").notNull(),
	parentId: integer("parent_id"),
	authorId: varchar("author_id", { length: 255 }),
	authorName: varchar("author_name", { length: 100 }).notNull(),
	authorEmail: varchar("author_email", { length: 255 }).notNull(),
	authorWebsite: varchar("author_website", { length: 500 }),
	content: text("content").notNull(),
	status: varchar("status", { length: 20 }).default('pending').notNull(),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	isEdited: boolean("is_edited").default(false),
	editedAt: timestamp("edited_at", { withTimezone: true, mode: 'string' }),
	likeCount: integer("like_count").default(0),
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
},
(table) => {
	return {
		blogCommentAuthorIdx: index("blog_comment_author_idx").using("btree", table.authorId.asc().nullsLast()),
		blogCommentCreatedAtIdx: index("blog_comment_created_at_idx").using("btree", table.createdAt.asc().nullsLast()),
		blogCommentEmailIdx: index("blog_comment_email_idx").using("btree", table.authorEmail.asc().nullsLast()),
		blogCommentParentIdx: index("blog_comment_parent_idx").using("btree", table.parentId.asc().nullsLast()),
		blogCommentPostIdx: index("blog_comment_post_idx").using("btree", table.postId.asc().nullsLast()),
		blogCommentStatusIdx: index("blog_comment_status_idx").using("btree", table.status.asc().nullsLast()),
		replierBlogCommentPostIdReplierBlogPostIdFk: foreignKey({
			columns: [table.postId],
			foreignColumns: [replierBlogPost.id],
			name: "replier_blog_comment_post_id_replier_blog_post_id_fk"
		}).onDelete("cascade"),
		replierBlogCommentParentIdReplierBlogCommentIdFk: foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "replier_blog_comment_parent_id_replier_blog_comment_id_fk"
		}).onDelete("cascade"),
		replierBlogCommentAuthorIdReplierUserIdFk: foreignKey({
			columns: [table.authorId],
			foreignColumns: [replierUser.id],
			name: "replier_blog_comment_author_id_replier_user_id_fk"
		}).onDelete("set null"),
	}
});

export const replierBlogPostCategory = pgTable("replier_blog_post_category", {
	postId: integer("post_id").notNull(),
	categoryId: integer("category_id").notNull(),
},
(table) => {
	return {
		blogPostCategoryCategoryIdx: index("blog_post_category_category_idx").using("btree", table.categoryId.asc().nullsLast()),
		blogPostCategoryPostIdx: index("blog_post_category_post_idx").using("btree", table.postId.asc().nullsLast()),
		replierBlogPostCategoryPostIdReplierBlogPostIdFk: foreignKey({
			columns: [table.postId],
			foreignColumns: [replierBlogPost.id],
			name: "replier_blog_post_category_post_id_replier_blog_post_id_fk"
		}).onDelete("cascade"),
		replierBlogPostCategoryCategoryIdReplierBlogCategoryId: foreignKey({
			columns: [table.categoryId],
			foreignColumns: [replierBlogCategory.id],
			name: "replier_blog_post_category_category_id_replier_blog_category_id"
		}).onDelete("cascade"),
		replierBlogPostCategoryPostIdCategoryIdPk: primaryKey({ columns: [table.postId, table.categoryId], name: "replier_blog_post_category_post_id_category_id_pk"}),
	}
});

export const replierBlogPostTag = pgTable("replier_blog_post_tag", {
	postId: integer("post_id").notNull(),
	tagId: integer("tag_id").notNull(),
},
(table) => {
	return {
		blogPostTagPostIdx: index("blog_post_tag_post_idx").using("btree", table.postId.asc().nullsLast()),
		blogPostTagTagIdx: index("blog_post_tag_tag_idx").using("btree", table.tagId.asc().nullsLast()),
		replierBlogPostTagPostIdReplierBlogPostIdFk: foreignKey({
			columns: [table.postId],
			foreignColumns: [replierBlogPost.id],
			name: "replier_blog_post_tag_post_id_replier_blog_post_id_fk"
		}).onDelete("cascade"),
		replierBlogPostTagTagIdReplierBlogTagIdFk: foreignKey({
			columns: [table.tagId],
			foreignColumns: [replierBlogTag.id],
			name: "replier_blog_post_tag_tag_id_replier_blog_tag_id_fk"
		}).onDelete("cascade"),
		replierBlogPostTagPostIdTagIdPk: primaryKey({ columns: [table.postId, table.tagId], name: "replier_blog_post_tag_post_id_tag_id_pk"}),
	}
});

export const replierBlogCommentLike = pgTable("replier_blog_comment_like", {
	commentId: integer("comment_id").notNull(),
	userId: varchar("user_id", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => {
	return {
		blogCommentLikeCommentIdx: index("blog_comment_like_comment_idx").using("btree", table.commentId.asc().nullsLast()),
		blogCommentLikeUserIdx: index("blog_comment_like_user_idx").using("btree", table.userId.asc().nullsLast()),
		replierBlogCommentLikeCommentIdReplierBlogCommentIdFk: foreignKey({
			columns: [table.commentId],
			foreignColumns: [replierBlogComment.id],
			name: "replier_blog_comment_like_comment_id_replier_blog_comment_id_fk"
		}).onDelete("cascade"),
		replierBlogCommentLikeUserIdReplierUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [replierUser.id],
			name: "replier_blog_comment_like_user_id_replier_user_id_fk"
		}).onDelete("cascade"),
		replierBlogCommentLikeCommentIdUserIdPk: primaryKey({ columns: [table.commentId, table.userId], name: "replier_blog_comment_like_comment_id_user_id_pk"}),
	}
});