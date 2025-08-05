import { relations } from "drizzle-orm/relations";
import { replierUser, replierAccount, replierSession, replierBilling, replierProducts, replierGeneration, replierPost, replierUsage, replierTwoFactor, replierSecurityEvent, replierBlogPost, replierBlogComment, replierBlogPostCategory, replierBlogCategory, replierBlogPostTag, replierBlogTag, replierBlogCommentLike } from "./schema";

export const replierAccountRelations = relations(replierAccount, ({one}) => ({
	replierUser: one(replierUser, {
		fields: [replierAccount.userId],
		references: [replierUser.id]
	}),
}));

export const replierUserRelations = relations(replierUser, ({many}) => ({
	replierAccounts: many(replierAccount),
	replierSessions: many(replierSession),
	replierBillings: many(replierBilling),
	replierGenerations: many(replierGeneration),
	replierPosts: many(replierPost),
	replierUsages: many(replierUsage),
	replierTwoFactors: many(replierTwoFactor),
	replierSecurityEvents: many(replierSecurityEvent),
	replierBlogPosts: many(replierBlogPost),
	replierBlogComments: many(replierBlogComment),
	replierBlogCommentLikes: many(replierBlogCommentLike),
}));

export const replierSessionRelations = relations(replierSession, ({one}) => ({
	replierUser: one(replierUser, {
		fields: [replierSession.userId],
		references: [replierUser.id]
	}),
}));

export const replierBillingRelations = relations(replierBilling, ({one}) => ({
	replierUser: one(replierUser, {
		fields: [replierBilling.userId],
		references: [replierUser.id]
	}),
	replierProduct: one(replierProducts, {
		fields: [replierBilling.productId],
		references: [replierProducts.id]
	}),
}));

export const replierProductsRelations = relations(replierProducts, ({many}) => ({
	replierBillings: many(replierBilling),
	replierGenerations: many(replierGeneration),
	replierUsages: many(replierUsage),
}));

export const replierGenerationRelations = relations(replierGeneration, ({one}) => ({
	replierUser: one(replierUser, {
		fields: [replierGeneration.userId],
		references: [replierUser.id]
	}),
	replierProduct: one(replierProducts, {
		fields: [replierGeneration.productId],
		references: [replierProducts.id]
	}),
}));

export const replierPostRelations = relations(replierPost, ({one}) => ({
	replierUser: one(replierUser, {
		fields: [replierPost.createdBy],
		references: [replierUser.id]
	}),
}));

export const replierUsageRelations = relations(replierUsage, ({one}) => ({
	replierUser: one(replierUser, {
		fields: [replierUsage.userId],
		references: [replierUser.id]
	}),
	replierProduct: one(replierProducts, {
		fields: [replierUsage.productId],
		references: [replierProducts.id]
	}),
}));

export const replierTwoFactorRelations = relations(replierTwoFactor, ({one}) => ({
	replierUser: one(replierUser, {
		fields: [replierTwoFactor.userId],
		references: [replierUser.id]
	}),
}));

export const replierSecurityEventRelations = relations(replierSecurityEvent, ({one}) => ({
	replierUser: one(replierUser, {
		fields: [replierSecurityEvent.userId],
		references: [replierUser.id]
	}),
}));

export const replierBlogPostRelations = relations(replierBlogPost, ({one, many}) => ({
	replierUser: one(replierUser, {
		fields: [replierBlogPost.createdBy],
		references: [replierUser.id]
	}),
	replierBlogComments: many(replierBlogComment),
	replierBlogPostCategories: many(replierBlogPostCategory),
	replierBlogPostTags: many(replierBlogPostTag),
}));

export const replierBlogCommentRelations = relations(replierBlogComment, ({one, many}) => ({
	replierBlogPost: one(replierBlogPost, {
		fields: [replierBlogComment.postId],
		references: [replierBlogPost.id]
	}),
	replierBlogComment: one(replierBlogComment, {
		fields: [replierBlogComment.parentId],
		references: [replierBlogComment.id],
		relationName: "replierBlogComment_parentId_replierBlogComment_id"
	}),
	replierBlogComments: many(replierBlogComment, {
		relationName: "replierBlogComment_parentId_replierBlogComment_id"
	}),
	replierUser: one(replierUser, {
		fields: [replierBlogComment.authorId],
		references: [replierUser.id]
	}),
	replierBlogCommentLikes: many(replierBlogCommentLike),
}));

export const replierBlogPostCategoryRelations = relations(replierBlogPostCategory, ({one}) => ({
	replierBlogPost: one(replierBlogPost, {
		fields: [replierBlogPostCategory.postId],
		references: [replierBlogPost.id]
	}),
	replierBlogCategory: one(replierBlogCategory, {
		fields: [replierBlogPostCategory.categoryId],
		references: [replierBlogCategory.id]
	}),
}));

export const replierBlogCategoryRelations = relations(replierBlogCategory, ({many}) => ({
	replierBlogPostCategories: many(replierBlogPostCategory),
}));

export const replierBlogPostTagRelations = relations(replierBlogPostTag, ({one}) => ({
	replierBlogPost: one(replierBlogPost, {
		fields: [replierBlogPostTag.postId],
		references: [replierBlogPost.id]
	}),
	replierBlogTag: one(replierBlogTag, {
		fields: [replierBlogPostTag.tagId],
		references: [replierBlogTag.id]
	}),
}));

export const replierBlogTagRelations = relations(replierBlogTag, ({many}) => ({
	replierBlogPostTags: many(replierBlogPostTag),
}));

export const replierBlogCommentLikeRelations = relations(replierBlogCommentLike, ({one}) => ({
	replierBlogComment: one(replierBlogComment, {
		fields: [replierBlogCommentLike.commentId],
		references: [replierBlogComment.id]
	}),
	replierUser: one(replierUser, {
		fields: [replierBlogCommentLike.userId],
		references: [replierUser.id]
	}),
}));