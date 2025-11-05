import { z } from "zod";
import { and, eq } from "drizzle-orm";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import {
  featurePermissions,
  AVAILABLE_FEATURES,
  type FeatureKey,
  getFeatureDisplayName,
  getFeatureDescription,
} from "@/server/db/schema/feature-permissions-schema";
import { products } from "@/server/db/schema/products-schema";
import { billing } from "@/server/db/schema/billing-schema";

export const featurePermissionsRouter = createTRPCRouter({
  // Get all available features with their metadata
  getAvailableFeatures: protectedProcedure.query(async () => {
    const features = Object.values(AVAILABLE_FEATURES).map((featureKey) => ({
      key: featureKey,
      displayName: getFeatureDisplayName(featureKey as FeatureKey),
      description: getFeatureDescription(featureKey as FeatureKey),
    }));

    return features;
  }),

  // Get feature permissions for a specific product
  getProductFeatures: adminProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
      }),
    )
    .query(async ({ input }) => {
      const permissions = await db
        .select({
          featureKey: featurePermissions.featureKey,
          enabled: featurePermissions.enabled,
        })
        .from(featurePermissions)
        .where(eq(featurePermissions.productId, input.productId));

      // Create a map of all features with their permission status
      const allFeatures = Object.values(AVAILABLE_FEATURES).map(
        (featureKey) => {
          const permission = permissions.find(
            (p) => p.featureKey === featureKey,
          );
          return {
            key: featureKey,
            displayName: getFeatureDisplayName(featureKey as FeatureKey),
            description: getFeatureDescription(featureKey as FeatureKey),
            enabled: permission?.enabled ?? false,
          };
        },
      );

      return allFeatures;
    }),

  // Get features available to the current user based on their subscription
  getUserFeatures: protectedProcedure.query(async ({ ctx }) => {
    // Admin users have access to all features
    if (ctx.session.user.role === "admin") {
      return Object.values(AVAILABLE_FEATURES).map((featureKey) => ({
        key: featureKey,
        displayName: getFeatureDisplayName(featureKey as FeatureKey),
        description: getFeatureDescription(featureKey as FeatureKey),
      }));
    }

    // Get user's current billing/product
    const userBilling = await db
      .select({
        productId: billing.productId,
        status: billing.status,
      })
      .from(billing)
      .where(eq(billing.userId, ctx.session.user.id))
      .limit(1);

    if (!userBilling.length || userBilling[0]?.status !== "active") {
      // User has no active subscription, return empty features
      return [];
    }

    const productId = userBilling[0]!.productId;

    // Get enabled features for this product
    const enabledFeatures = await db
      .select({
        featureKey: featurePermissions.featureKey,
        enabled: featurePermissions.enabled,
      })
      .from(featurePermissions)
      .where(
        and(
          eq(featurePermissions.productId, productId),
          eq(featurePermissions.enabled, true),
        ),
      );

    return enabledFeatures.map((feature) => ({
      key: feature.featureKey,
      displayName: getFeatureDisplayName(feature.featureKey as FeatureKey),
      description: getFeatureDescription(feature.featureKey as FeatureKey),
    }));
  }),

  // Check if user has access to a specific feature
  hasFeatureAccess: protectedProcedure
    .input(
      z.object({
        featureKey: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Admin users have access to all features
      if (ctx.session.user.role === "admin") {
        return true;
      }

      // Get user's current billing/product
      const userBilling = await db
        .select({
          productId: billing.productId,
          status: billing.status,
        })
        .from(billing)
        .where(eq(billing.userId, ctx.session.user.id))
        .limit(1);

      if (!userBilling.length || userBilling[0]?.status !== "active") {
        return false;
      }

      const productId = userBilling[0]!.productId;

      // Check if feature is enabled for this product
      const featureAccess = await db
        .select({
          enabled: featurePermissions.enabled,
        })
        .from(featurePermissions)
        .where(
          and(
            eq(featurePermissions.productId, productId),
            eq(featurePermissions.featureKey, input.featureKey),
          ),
        )
        .limit(1);

      return featureAccess.length > 0 && featureAccess[0]!.enabled;
    }),

  // Update feature permissions for a product (Admin only)
  updateProductFeatures: adminProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        features: z.array(
          z.object({
            featureKey: z.string(),
            enabled: z.boolean(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      // Delete existing permissions for this product
      await db
        .delete(featurePermissions)
        .where(eq(featurePermissions.productId, input.productId));

      // Insert new permissions
      if (input.features.length > 0) {
        await db.insert(featurePermissions).values(
          input.features.map((feature) => ({
            productId: input.productId,
            featureKey: feature.featureKey,
            enabled: feature.enabled,
          })),
        );
      }

      return { success: true };
    }),

  // Get all products with their feature counts (for admin overview)
  getProductsWithFeatureCounts: adminProcedure.query(async () => {
    const productsWithFeatures = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        isFree: products.isFree,
      })
      .from(products);

    // Get feature counts for each product
    const productsWithCounts = await Promise.all(
      productsWithFeatures.map(async (product) => {
        const featureCount = await db
          .select()
          .from(featurePermissions)
          .where(
            and(
              eq(featurePermissions.productId, product.id),
              eq(featurePermissions.enabled, true),
            ),
          );

        return {
          ...product,
          enabledFeatureCount: featureCount.length,
          totalFeatureCount: Object.keys(AVAILABLE_FEATURES).length,
        };
      }),
    );

    return productsWithCounts;
  }),
});
