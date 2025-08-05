import { createTable } from "@/server/db/config";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { products } from "./products-schema";

// Define available features/tools in the system
export const AVAILABLE_FEATURES = {
  // Core AI Tools
  AI_CAPTION_GENERATOR: "ai_caption_generator",
  TWEET_GENERATOR: "tweet_generator", 
  BIO_OPTIMIZER: "bio_optimizer",
  
  // Browser Extension
  BROWSER_EXTENSION: "browser_extension",
  
  // Future Tools (commented out in sidebar)
  LINK_IN_BIO_CREATOR: "link_in_bio_creator",
  PROFILE_AUDIT: "profile_audit",
  AB_TESTING: "ab_testing",
  HASHTAG_GENERATOR: "hashtag_generator",
  
  // Admin Features
  BLOG_MANAGEMENT: "blog_management",
  COMMENT_MODERATION: "comment_moderation",
  REPORTS: "reports",
  ANALYTICS: "analytics",
  PRODUCTS_MANAGEMENT: "products_management",
  USERS_MANAGEMENT: "users_management",
} as const;

export type FeatureKey = typeof AVAILABLE_FEATURES[keyof typeof AVAILABLE_FEATURES];

// Feature permissions table - links products to features they can access
export const featurePermissions = createTable(
  "feature_permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    featureKey: text("feature_key").notNull(), // One of AVAILABLE_FEATURES values
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    // Composite unique index to prevent duplicate feature permissions per product
    productFeatureIdx: index("product_feature_idx").on(
      table.productId,
      table.featureKey,
    ),
    // Index for quick feature lookups
    featureKeyIdx: index("feature_key_idx").on(table.featureKey),
  }),
);

// Relations
export const featurePermissionsRelations = relations(
  featurePermissions,
  ({ one }) => ({
    product: one(products, {
      fields: [featurePermissions.productId],
      references: [products.id],
    }),
  }),
);

export const productFeaturePermissionsRelations = relations(
  products,
  ({ many }) => ({
    featurePermissions: many(featurePermissions),
  }),
);

export type SelectFeaturePermission = typeof featurePermissions.$inferSelect;
export type CreateFeaturePermission = typeof featurePermissions.$inferInsert;

// Helper function to get feature display names
export const getFeatureDisplayName = (featureKey: FeatureKey): string => {
  const displayNames: Record<FeatureKey, string> = {
    [AVAILABLE_FEATURES.AI_CAPTION_GENERATOR]: "AI Caption Generator",
    [AVAILABLE_FEATURES.TWEET_GENERATOR]: "Tweet Generator",
    [AVAILABLE_FEATURES.BIO_OPTIMIZER]: "Bio & Profile Optimizer",
    [AVAILABLE_FEATURES.BROWSER_EXTENSION]: "Browser Extension",
    [AVAILABLE_FEATURES.LINK_IN_BIO_CREATOR]: "Link-in-Bio Creator",
    [AVAILABLE_FEATURES.PROFILE_AUDIT]: "Profile Audit & Suggestions",
    [AVAILABLE_FEATURES.AB_TESTING]: "A/B Testing for Profiles",
    [AVAILABLE_FEATURES.HASHTAG_GENERATOR]: "Hashtag Generator",
    [AVAILABLE_FEATURES.BLOG_MANAGEMENT]: "Blog Management",
    [AVAILABLE_FEATURES.COMMENT_MODERATION]: "Comment Moderation",
    [AVAILABLE_FEATURES.REPORTS]: "Reports",
    [AVAILABLE_FEATURES.ANALYTICS]: "Analytics",
    [AVAILABLE_FEATURES.PRODUCTS_MANAGEMENT]: "Products Management",
    [AVAILABLE_FEATURES.USERS_MANAGEMENT]: "Users Management",
  };
  
  return displayNames[featureKey] ?? featureKey;
};

// Helper function to get feature descriptions
export const getFeatureDescription = (featureKey: FeatureKey): string => {
  const descriptions: Record<FeatureKey, string> = {
    [AVAILABLE_FEATURES.AI_CAPTION_GENERATOR]: "Generate engaging social media captions from images using AI",
    [AVAILABLE_FEATURES.TWEET_GENERATOR]: "Create human-like tweets that pass AI detection",
    [AVAILABLE_FEATURES.BIO_OPTIMIZER]: "Optimize social media bios and profiles for better engagement",
    [AVAILABLE_FEATURES.BROWSER_EXTENSION]: "Real-time social media response generation via browser extension",
    [AVAILABLE_FEATURES.LINK_IN_BIO_CREATOR]: "Create custom link-in-bio pages for social media profiles",
    [AVAILABLE_FEATURES.PROFILE_AUDIT]: "Comprehensive analysis and suggestions for social media profiles",
    [AVAILABLE_FEATURES.AB_TESTING]: "Test different profile variations to optimize performance",
    [AVAILABLE_FEATURES.HASHTAG_GENERATOR]: "Generate relevant hashtags for social media posts",
    [AVAILABLE_FEATURES.BLOG_MANAGEMENT]: "Manage and publish blog content (Admin only)",
    [AVAILABLE_FEATURES.COMMENT_MODERATION]: "Moderate and manage user comments (Admin only)",
    [AVAILABLE_FEATURES.REPORTS]: "Access detailed reports and insights (Admin only)",
    [AVAILABLE_FEATURES.ANALYTICS]: "View comprehensive analytics dashboard (Admin only)",
    [AVAILABLE_FEATURES.PRODUCTS_MANAGEMENT]: "Manage products and pricing plans (Admin only)",
    [AVAILABLE_FEATURES.USERS_MANAGEMENT]: "Manage user accounts and permissions (Admin only)",
  };
  
  return descriptions[featureKey] ?? "Feature description not available";
};