import { createTable } from "@/server/db/config";
import { boolean, index, text, timestamp } from "drizzle-orm/pg-core";

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
}, (table) => ({
  // Critical indexes for user queries
  emailIdx: index("user_email_idx").on(table.email),
  roleIdx: index("user_role_idx").on(table.role),
  bannedIdx: index("user_banned_idx").on(table.banned),
  createdAtIdx: index("user_created_at_idx").on(table.createdAt),
  updatedAtIdx: index("user_updated_at_idx").on(table.updatedAt),
  emailVerifiedIdx: index("user_email_verified_idx").on(table.emailVerified),
  twoFactorIdx: index("user_two_factor_idx").on(table.twoFactorEnabled),
  passwordResetIdx: index("user_password_reset_idx").on(table.passwordResetRequired),
  
  // Composite indexes for common queries
  roleBannedIdx: index("user_role_banned_idx").on(table.role, table.banned),
  emailVerifiedRoleIdx: index("user_email_verified_role_idx").on(table.emailVerified, table.role),
  
  // Covering index for dashboard queries
  dashboardCoveringIdx: index("user_dashboard_covering_idx").on(table.id, table.role, table.banned)
    .include(table.name, table.email, table.emailVerified, table.createdAt, table.updatedAt),
}));

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
}, (table) => ({
  // Critical indexes for session queries
  userIdIdx: index("session_user_id_idx").on(table.userId),
  expiresAtIdx: index("session_expires_at_idx").on(table.expiresAt),
  tokenIdx: index("session_token_idx").on(table.token),
  createdAtIdx: index("session_created_at_idx").on(table.createdAt),
  ipAddressIdx: index("session_ip_address_idx").on(table.ipAddress),
  userAgentIdx: index("session_user_agent_idx").on(table.userAgent),
  
  // Composite indexes for common queries
  userExpiresIdx: index("session_user_expires_idx").on(table.userId, table.expiresAt),
}));

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
}, (table) => ({
  // Critical indexes for account queries
  userIdIdx: index("account_user_id_idx").on(table.userId),
  providerIdIdx: index("account_provider_id_idx").on(table.providerId),
  createdAtIdx: index("account_created_at_idx").on(table.createdAt),
  accessTokenExpiresIdx: index("account_access_token_expires_idx").on(table.accessTokenExpiresAt),
  
  // Composite indexes for common queries
  userProviderIdx: index("account_user_provider_idx").on(table.userId, table.providerId),
}));

export const verification = createTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
}, (table) => ({
  // Critical indexes for verification queries
  identifierIdx: index("verification_identifier_idx").on(table.identifier),
  expiresAtIdx: index("verification_expires_at_idx").on(table.expiresAt),
  createdAtIdx: index("verification_created_at_idx").on(table.createdAt),
  
  // Composite indexes for common queries
  identifierExpiresIdx: index("verification_identifier_expires_idx").on(table.identifier, table.expiresAt),
}));

export const twoFactor = createTable("two_factor", {
  id: text("id").primaryKey(),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  // Critical indexes for two factor queries
  userIdIdx: index("two_factor_user_id_idx").on(table.userId),
  createdAtIdx: index("two_factor_created_at_idx").on(table.createdAt),
  updatedAtIdx: index("two_factor_updated_at_idx").on(table.updatedAt),
}));

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
}, (table) => ({
  // Critical indexes for security event queries
  userIdIdx: index("security_event_user_id_idx").on(table.userId),
  eventTypeIdx: index("security_event_event_type_idx").on(table.eventType),
  severityIdx: index("security_event_severity_idx").on(table.severity),
  createdAtIdx: index("security_event_created_at_idx").on(table.createdAt),
  resolvedAtIdx: index("security_event_resolved_at_idx").on(table.resolvedAt),
  
  // Composite indexes for common queries
  userTypeIdx: index("security_event_user_type_idx").on(table.userId, table.eventType),
  severityCreatedAtIdx: index("security_event_severity_created_at_idx").on(table.severity, table.createdAt),
  userCreatedAtIdx: index("security_event_user_created_at_idx").on(table.userId, table.createdAt),
}));
