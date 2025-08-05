import { db } from "@/server/db";
import { securityEvent, user } from "@/server/db/schema/auth-schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { nanoid } from "nanoid";

export type SecurityEventType = 
  | 'suspicious_login'
  | 'password_breach'
  | 'multiple_failed_attempts'
  | 'account_compromise'
  | 'admin_forced'
  | 'password_expired'
  | 'two_factor_disabled'
  | 'session_hijack';

export type SecurityEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export type SecurityEventAction = 
  | 'password_reset_required'
  | 'account_locked'
  | 'session_terminated'
  | 'notification_sent'
  | 'two_factor_required';

export interface SecurityEventData {
  userId: string;
  eventType: SecurityEventType;
  severity: SecurityEventSeverity;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: string | Record<string, unknown>;
  actionTaken?: SecurityEventAction;
}

export interface PasswordResetConfig {
  reason: string;
  expiresInDays?: number;
  notifyUser?: boolean;
}

/**
 * Security Events Service
 * Handles logging security events and triggering appropriate actions
 */
export class SecurityEventsService {
  /**
   * Log a security event
   */
  static async logSecurityEvent(data: SecurityEventData): Promise<string> {
    const eventId = nanoid();
    
    await db.insert(securityEvent).values({
      id: eventId,
      userId: data.userId,
      eventType: data.eventType,
      severity: data.severity,
      description: data.description,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      metadata: data.metadata ? (typeof data.metadata === 'string' ? data.metadata : JSON.stringify(data.metadata)) : null,
      actionTaken: data.actionTaken,
      createdAt: new Date(),
    });

    // Auto-trigger password reset for high/critical events
    if (data.severity === 'high' || data.severity === 'critical') {
      await this.forcePasswordReset(data.userId, {
        reason: `Security event: ${data.description}`,
        expiresInDays: data.severity === 'critical' ? 1 : 7,
        notifyUser: true,
      });
    }

    return eventId;
  }

  /**
   * Force a password reset for a user
   */
  static async forcePasswordReset(
    userId: string, 
    config: PasswordResetConfig
  ): Promise<void> {
    const expiresAt = config.expiresInDays 
      ? new Date(Date.now() + config.expiresInDays * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days

    await db.update(user)
      .set({
        passwordResetRequired: true,
        passwordResetReason: config.reason,
        passwordResetRequiredAt: new Date(),
        passwordExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    // Log the password reset requirement
    await this.logSecurityEvent({
      userId,
      eventType: 'admin_forced',
      severity: 'medium',
      description: `Password reset required: ${config.reason}`,
      actionTaken: 'password_reset_required',
    });

    // TODO: Send notification email if config.notifyUser is true
    if (config.notifyUser) {
      // Implementation for email notification would go here
      console.log(`Password reset notification should be sent to user ${userId}`);
    }
  }

  /**
   * Check if user needs password reset
   */
  static async checkPasswordResetRequired(userId: string): Promise<{
    required: boolean;
    reason?: string;
    expiresAt?: Date;
  }> {
    const userData = await db.select({
      passwordResetRequired: user.passwordResetRequired,
      passwordResetReason: user.passwordResetReason,
      passwordExpiresAt: user.passwordExpiresAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

    if (!userData[0]) {
      return { required: false };
    }

    const { passwordResetRequired, passwordResetReason, passwordExpiresAt } = userData[0];

    // Check if password has expired
    if (passwordExpiresAt && passwordExpiresAt < new Date()) {
      await this.forcePasswordReset(userId, {
        reason: 'Password has expired',
        expiresInDays: 7,
        notifyUser: true,
      });
      return {
        required: true,
        reason: 'Password has expired',
        expiresAt: passwordExpiresAt,
      };
    }

    return {
      required: passwordResetRequired ?? false,
      reason: passwordResetReason ?? undefined,
      expiresAt: passwordExpiresAt ?? undefined,
    };
  }

  /**
   * Mark password reset as completed
   */
  static async completePasswordReset(userId: string): Promise<void> {
    await db.update(user)
      .set({
        passwordResetRequired: false,
        passwordResetReason: null,
        passwordResetRequiredAt: null,
        lastPasswordChange: new Date(),
        passwordExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    // Log the password reset completion
    await this.logSecurityEvent({
      userId,
      eventType: 'admin_forced',
      severity: 'low',
      description: 'Password reset completed successfully',
    });
  }

  /**
   * Get security events for a user
   */
  static async getUserSecurityEvents(
    userId: string,
    limit = 50
  ): Promise<Array<{
    id: string;
    eventType: string;
    severity: string;
    description: string;
    actionTaken: string | null;
    createdAt: Date;
  }>> {
    return await db.select({
      id: securityEvent.id,
      eventType: securityEvent.eventType,
      severity: securityEvent.severity,
      description: securityEvent.description,
      actionTaken: securityEvent.actionTaken,
      createdAt: securityEvent.createdAt,
    })
    .from(securityEvent)
    .where(eq(securityEvent.userId, userId))
    .orderBy(desc(securityEvent.createdAt))
    .limit(limit);
  }

  /**
   * Detect suspicious login patterns
   */
  static async detectSuspiciousLogin(
    userId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<boolean> {
    // Check for multiple failed attempts in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentFailedAttempts = await db.select()
      .from(securityEvent)
      .where(
        and(
          eq(securityEvent.userId, userId),
          eq(securityEvent.eventType, 'multiple_failed_attempts'),
          gte(securityEvent.createdAt, oneHourAgo)
        )
      );

    if (recentFailedAttempts.length >= 3) {
      await this.logSecurityEvent({
        userId,
        eventType: 'suspicious_login',
        severity: 'high',
        description: 'Multiple failed login attempts detected',
        ipAddress,
        userAgent,
        actionTaken: 'password_reset_required',
      });
      return true;
    }

    return false;
  }

  /**
   * Handle password breach detection
   */
  static async handlePasswordBreach(
    userId: string,
    breachDetails: { source: string; breachCount: number }
  ): Promise<void> {
    await this.logSecurityEvent({
      userId,
      eventType: 'password_breach',
      severity: 'critical',
      description: `Password found in ${breachDetails.breachCount} data breach(es)`,
      metadata: breachDetails,
      actionTaken: 'password_reset_required',
    });
  }

  /**
   * Set password expiry for a user
   */
  static async setPasswordExpiry(
    userId: string,
    expiresInDays = 90
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    
    await db.update(user)
      .set({
        passwordExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));
  }
}