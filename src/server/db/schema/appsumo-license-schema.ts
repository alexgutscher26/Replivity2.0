import { createTable } from "@/server/db/config";
import { relations } from "drizzle-orm";
import {
	index,
	jsonb,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { products } from "./products-schema";

export const appsumoLicense = createTable(
	"appsumo_license",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		licenseKey: text("license_key").notNull().unique(),
		userId: text("user_id").references(() => user.id),
		productId: uuid("product_id").references(() => products.id),
		status: text("status").notNull().default("pending"), // pending, active, deactivated, expired
		appsumoUserId: text("appsumo_user_id"),
		appsumoEmail: text("appsumo_email"),
		appsumoOrderId: text("appsumo_order_id"),
		appsumoProductId: text("appsumo_product_id"),
		appsumoVariantId: text("appsumo_variant_id"),
		activatedAt: timestamp("activated_at"),
		deactivatedAt: timestamp("deactivated_at"),
		expiresAt: timestamp("expires_at"),
		lastUsedAt: timestamp("last_used_at"),
		metadata: jsonb("metadata").default({}),
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow(),
	},
	(table) => ({
		// Add indexes for common queries
		licenseKeyIdx: index("appsumo_license_key_idx").on(table.licenseKey),
		userIdIdx: index("appsumo_user_id_idx").on(table.userId),
		statusIdx: index("appsumo_status_idx").on(table.status),
		appsumoUserIdIdx: index("appsumo_appsumo_user_id_idx").on(table.appsumoUserId),
		appsumoOrderIdIdx: index("appsumo_order_id_idx").on(table.appsumoOrderId),
		// Composite index for checking active licenses
		activeLicenseIdx: index("appsumo_active_license_idx").on(
			table.userId,
			table.status,
		),
	}),
);

export const appsumoLicenseRelations = relations(appsumoLicense, ({ one }) => ({
	user: one(user, {
		fields: [appsumoLicense.userId],
		references: [user.id],
	}),
	product: one(products, {
		fields: [appsumoLicense.productId],
		references: [products.id],
	}),
}));

export const userAppsumoLicenseRelations = relations(user, ({ many }) => ({
	appsumoLicenses: many(appsumoLicense),
}));

export const productAppsumoLicenseRelations = relations(products, ({ many }) => ({
	appsumoLicenses: many(appsumoLicense),
}));

export type SelectAppsumoLicense = typeof appsumoLicense.$inferSelect;
export type CreateAppsumoLicense = typeof appsumoLicense.$inferInsert;

// AppSumo webhook event types
export type AppsumoWebhookEventType =
	| "license.activated"
	| "license.deactivated"
	| "license.upgraded"
	| "license.downgraded"
	| "license.refunded";

// AppSumo webhook payload structure
export interface AppsumoWebhookPayload {
	event: AppsumoWebhookEventType;
	license_key: string;
	user_id: string;
	email: string;
	order_id: string;
	product_id: string;
	variant_id?: string;
	timestamp: string;
	metadata?: Record<string, unknown>;
}

// AppSumo OAuth user info structure
export interface AppsumoOAuthUserInfo {
	id: string;
	email: string;
	first_name?: string;
	last_name?: string;
	license_key?: string;
	product_id?: string;
	variant_id?: string;
}