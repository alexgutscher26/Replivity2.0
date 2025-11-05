import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import { SecurityEventsService } from "@/server/utils/security-events";
import { TRPCError } from "@trpc/server";

// Helper function to safely convert errors to Error instances
function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === "string") {
    return new Error(error);
  }
  return new Error("Unknown error");
}

const securityEventSchema = z.object({
  eventType: z.enum([
    "suspicious_login",
    "password_breach",
    "multiple_failed_attempts",
    "account_compromise",
    "admin_forced",
    "password_expired",
    "two_factor_disabled",
    "session_hijack",
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().min(1).max(500),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  actionTaken: z
    .enum([
      "password_reset_required",
      "account_locked",
      "session_terminated",
      "notification_sent",
      "two_factor_required",
    ])
    .optional(),
});

const passwordResetSchema = z.object({
  userId: z.string(),
  reason: z.string().min(1).max(200),
  expiresInDays: z.number().min(1).max(365).optional(),
  notifyUser: z.boolean().optional().default(true),
});

export const securityRouter = createTRPCRouter({
  /**
   * Log a security event (admin only)
   */
  logEvent: adminProcedure
    .input(
      z
        .object({
          userId: z.string(),
        })
        .merge(securityEventSchema),
    )
    .mutation(async ({ input }) => {
      try {
        const eventId = await SecurityEventsService.logSecurityEvent({
          userId: input.userId,
          eventType: input.eventType,
          severity: input.severity,
          description: input.description,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          metadata: input.metadata,
          actionTaken: input.actionTaken,
        });

        return { success: true, eventId };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to log security event",
          cause: toError(error),
        });
      }
    }),

  /**
   * Force password reset for a user (admin only)
   */
  forcePasswordReset: adminProcedure
    .input(passwordResetSchema)
    .mutation(async ({ input }) => {
      try {
        await SecurityEventsService.forcePasswordReset(input.userId, {
          reason: input.reason,
          expiresInDays: input.expiresInDays,
          notifyUser: input.notifyUser,
        });

        return { success: true, message: "Password reset required for user" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to force password reset",
          cause: toError(error),
        });
      }
    }),

  /**
   * Check if current user needs password reset
   */
  checkPasswordResetRequired: protectedProcedure.query(async ({ ctx }) => {
    try {
      const result = await SecurityEventsService.checkPasswordResetRequired(
        ctx.session.user.id,
      );
      return result;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to check password reset status",
        cause: toError(error),
      });
    }
  }),

  /**
   * Mark password reset as completed (called after successful password change)
   */
  completePasswordReset: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await SecurityEventsService.completePasswordReset(ctx.session.user.id);
      return { success: true, message: "Password reset completed" };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to complete password reset",
        cause: toError(error),
      });
    }
  }),

  /**
   * Get security events for current user
   */
  getMySecurityEvents: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const events = await SecurityEventsService.getUserSecurityEvents(
          ctx.session.user.id,
          input.limit,
        );
        return events;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch security events",
          cause: toError(error),
        });
      }
    }),

  /**
   * Get security events for any user (admin only)
   */
  getUserSecurityEvents: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).optional().default(50),
      }),
    )
    .query(async ({ input }) => {
      try {
        const events = await SecurityEventsService.getUserSecurityEvents(
          input.userId,
          input.limit,
        );
        return events;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user security events",
          cause: toError(error),
        });
      }
    }),

  /**
   * Handle password breach detection
   */
  handlePasswordBreach: protectedProcedure
    .input(
      z.object({
        breachDetails: z.object({
          source: z.string(),
          breachCount: z.number(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await SecurityEventsService.handlePasswordBreach(
          ctx.session.user.id,
          input.breachDetails,
        );
        return { success: true, message: "Password breach handled" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to handle password breach",
          cause: toError(error),
        });
      }
    }),

  /**
   * Set password expiry for a user (admin only)
   */
  setPasswordExpiry: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        expiresInDays: z.number().min(1).max(365).default(90),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await SecurityEventsService.setPasswordExpiry(
          input.userId,
          input.expiresInDays,
        );
        return { success: true, message: "Password expiry set" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to set password expiry",
          cause: toError(error),
        });
      }
    }),

  /**
   * Detect suspicious login (internal use)
   */
  detectSuspiciousLogin: protectedProcedure
    .input(
      z.object({
        ipAddress: z.string(),
        userAgent: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const isSuspicious = await SecurityEventsService.detectSuspiciousLogin(
          ctx.session.user.id,
          input.ipAddress,
          input.userAgent,
        );
        return { suspicious: isSuspicious };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to detect suspicious login",
          cause: toError(error),
        });
      }
    }),
});
