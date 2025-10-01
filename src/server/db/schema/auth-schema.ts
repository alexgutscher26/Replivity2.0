import { createTable } from "@/server/db/config";
import { boolean, text, timestamp } from "drizzle-orm/pg-core";

export const user = createTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  twoFactorEnabled: boolean("two_factor_enabled"),
  // Password reset security fields
  passwordResetRequired: boolean("password_reset_required").default(false),
  passwordResetReason: text("password_reset_reason"),
  passwordResetRequiredAt: timestamp("password_reset_required_at"),
  lastPasswordChange: timestamp("last_password_change"),
  passwordExpiresAt: timestamp("password_expires_at"),
});

export const session = createTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  impersonatedBy: text("impersonated_by"),
});

export const account = createTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = createTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const twoFactor = createTable("two_factor", {
  id: text("id").primaryKey(),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const securityEvent = createTable("security_event", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  eventType: text("event_type").notNull(), // 'suspicious_login', 'password_breach', 'multiple_failed_attempts', 'account_compromise', 'admin_forced'
  severity: text("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  description: text("description").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: text("metadata"), // JSON string for additional event data
  actionTaken: text("action_taken"), // 'password_reset_required', 'account_locked', 'session_terminated', 'notification_sent'
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
