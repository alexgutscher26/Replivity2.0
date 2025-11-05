import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  appsumoLicense,
  type CreateAppsumoLicense,
} from "@/server/db/schema/appsumo-license-schema";
import { products } from "@/server/db/schema/products-schema";
import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

const activateLicenseSchema = z.object({
  licenseKey: z.string().min(1),
  appsumoUserId: z.string().min(1),
  appsumoEmail: z.string().email(),
  appsumoOrderId: z.string().min(1),
  appsumoProductId: z.string().min(1),
  appsumoVariantId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const updateLicenseStatusSchema = z.object({
  licenseKey: z.string().min(1),
  status: z.enum(["pending", "active", "deactivated", "expired"]),
  metadata: z.record(z.unknown()).optional(),
});

const updateLicenseProductSchema = z.object({
  licenseKey: z.string().min(1),
  appsumoProductId: z.string().min(1),
  appsumoVariantId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const linkLicenseToUserSchema = z.object({
  licenseKey: z.string().min(1),
});

const adminLinkLicenseToUserSchema = z.object({
  licenseKey: z.string().min(1),
  userId: z.string().min(1),
});

const validateLicenseSchema = z.object({
  licenseKey: z.string().min(1),
});

export const appsumoLicenseRouter = createTRPCRouter({
  /**
   * Activate a new AppSumo license
   */
  activateLicense: publicProcedure
    .input(activateLicenseSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if license already exists
      const existingLicense = await ctx.db.query.appsumoLicense.findFirst({
        where: eq(appsumoLicense.licenseKey, input.licenseKey),
      });

      if (existingLicense) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "License already exists",
        });
      }

      // Find the corresponding product based on AppSumo product ID
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.name, "AppSumo Lifetime Deal"), // Default AppSumo product
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "AppSumo product not found",
        });
      }

      // Create new license
      const newLicense: CreateAppsumoLicense = {
        licenseKey: input.licenseKey,
        productId: product.id,
        status: "active",
        appsumoUserId: input.appsumoUserId,
        appsumoEmail: input.appsumoEmail,
        appsumoOrderId: input.appsumoOrderId,
        appsumoProductId: input.appsumoProductId,
        appsumoVariantId: input.appsumoVariantId,
        activatedAt: new Date(),
        metadata: input.metadata ?? {},
      };

      const [license] = await ctx.db
        .insert(appsumoLicense)
        .values(newLicense)
        .returning();

      return license;
    }),

  /**
   * Update license status (activate, deactivate, expire)
   */
  updateLicenseStatus: publicProcedure
    .input(updateLicenseStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const license = await ctx.db.query.appsumoLicense.findFirst({
        where: eq(appsumoLicense.licenseKey, input.licenseKey),
      });

      if (!license) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "License not found",
        });
      }

      const updateData: Partial<CreateAppsumoLicense> = {
        status: input.status,
        updatedAt: new Date(),
        metadata: input.metadata ?? license.metadata,
      };

      // Set specific timestamps based on status
      if (input.status === "active") {
        updateData.activatedAt = new Date();
        updateData.deactivatedAt = null;
      } else if (input.status === "deactivated" || input.status === "expired") {
        updateData.deactivatedAt = new Date();
      }

      const [updatedLicense] = await ctx.db
        .update(appsumoLicense)
        .set(updateData)
        .where(eq(appsumoLicense.licenseKey, input.licenseKey))
        .returning();

      return updatedLicense;
    }),

  /**
   * Update license product (for upgrades/downgrades)
   */
  updateLicenseProduct: publicProcedure
    .input(updateLicenseProductSchema)
    .mutation(async ({ ctx, input }) => {
      const license = await ctx.db.query.appsumoLicense.findFirst({
        where: eq(appsumoLicense.licenseKey, input.licenseKey),
      });

      if (!license) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "License not found",
        });
      }

      // Find the corresponding product based on AppSumo product ID
      // In a real implementation, you'd have a mapping between AppSumo product IDs and your products
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.name, "AppSumo Lifetime Deal"),
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      const [updatedLicense] = await ctx.db
        .update(appsumoLicense)
        .set({
          productId: product.id,
          appsumoProductId: input.appsumoProductId,
          appsumoVariantId: input.appsumoVariantId,
          metadata: input.metadata ?? license.metadata,
          updatedAt: new Date(),
        })
        .where(eq(appsumoLicense.licenseKey, input.licenseKey))
        .returning();

      return updatedLicense;
    }),

  /**
   * Link a license to a user account
   */
  linkLicenseToUser: protectedProcedure
    .input(linkLicenseToUserSchema)
    .mutation(async ({ ctx, input }) => {
      const license = await ctx.db.query.appsumoLicense.findFirst({
        where: and(
          eq(appsumoLicense.licenseKey, input.licenseKey),
          eq(appsumoLicense.status, "active"),
        ),
      });

      if (!license) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Active license not found",
        });
      }

      // Check if license is already linked to another user
      if (license.userId && license.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "License is already linked to another user",
        });
      }

      const [updatedLicense] = await ctx.db
        .update(appsumoLicense)
        .set({
          userId: ctx.session.user.id,
          lastUsedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(appsumoLicense.licenseKey, input.licenseKey))
        .returning();

      return updatedLicense;
    }),

  /**
   * Validate a license key
   */
  validateLicense: publicProcedure
    .input(validateLicenseSchema)
    .query(async ({ ctx, input }) => {
      const license = await ctx.db.query.appsumoLicense.findFirst({
        where: eq(appsumoLicense.licenseKey, input.licenseKey),
        with: {
          product: true,
          user: {
            columns: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      if (!license) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "License not found",
        });
      }

      return {
        license,
        isValid: license.status === "active",
        isLinked: !!license.userId,
      };
    }),

  /**
   * Get user's AppSumo licenses
   */
  getUserLicenses: protectedProcedure.query(async ({ ctx }) => {
    const licenses = await ctx.db.query.appsumoLicense.findMany({
      where: eq(appsumoLicense.userId, ctx.session.user.id),
      with: {
        product: true,
      },
      orderBy: (license, { desc }) => [desc(license.createdAt)],
    });

    return licenses;
  }),

  /**
   * Get all licenses (admin only)
   */
  getAllLicenses: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z
          .enum(["pending", "active", "deactivated", "expired"])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const whereConditions = [];

      if (input.status) {
        whereConditions.push(eq(appsumoLicense.status, input.status));
      }

      const licenses = await ctx.db.query.appsumoLicense.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        with: {
          product: true,
          user: {
            columns: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        limit: input.limit,
        offset: input.offset,
        orderBy: (license, { desc }) => [desc(license.createdAt)],
      });

      return licenses;
    }),

  /**
   * Get license statistics (admin only)
   */
  getLicenseStats: adminProcedure.query(async ({ ctx }) => {
    const [totalLicenses, activeLicenses, linkedLicenses, unlinkedLicenses] =
      await Promise.all([
        ctx.db.query.appsumoLicense
          .findMany()
          .then((licenses) => licenses.length),
        ctx.db.query.appsumoLicense
          .findMany({
            where: eq(appsumoLicense.status, "active"),
          })
          .then((licenses) => licenses.length),
        ctx.db.query.appsumoLicense
          .findMany({
            where: and(
              eq(appsumoLicense.status, "active"),
              isNull(appsumoLicense.userId),
            ),
          })
          .then((licenses) => licenses.length),
        ctx.db.query.appsumoLicense
          .findMany({
            where: and(
              eq(appsumoLicense.status, "active"),
              isNull(appsumoLicense.userId),
            ),
          })
          .then((licenses) => licenses.length),
      ]);

    return {
      totalLicenses,
      activeLicenses,
      linkedLicenses,
      unlinkedLicenses,
    };
  }),

  /**
   * Admin procedure to link a license to a specific user (for OAuth callback)
   */
  adminLinkLicenseToUser: publicProcedure
    .input(adminLinkLicenseToUserSchema)
    .mutation(async ({ ctx, input }) => {
      const license = await ctx.db.query.appsumoLicense.findFirst({
        where: and(
          eq(appsumoLicense.licenseKey, input.licenseKey),
          eq(appsumoLicense.status, "active"),
        ),
      });

      if (!license) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Active license not found",
        });
      }

      // Check if license is already linked to another user
      if (license.userId && license.userId !== input.userId) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "License is already linked to another user",
        });
      }

      const [updatedLicense] = await ctx.db
        .update(appsumoLicense)
        .set({
          userId: input.userId,
          lastUsedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(appsumoLicense.licenseKey, input.licenseKey))
        .returning();

      return updatedLicense;
    }),
});
