-- AppSumo License Integration Migration
-- This migration adds the appsumo_license table for managing AppSumo lifetime deal licenses

CREATE TABLE IF NOT EXISTS "replier_appsumo_license" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_key" varchar(255) NOT NULL,
	"user_id" uuid,
	"product_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"appsumo_user_id" varchar(255) NOT NULL,
	"appsumo_email" varchar(255) NOT NULL,
	"appsumo_order_id" varchar(255) NOT NULL,
	"appsumo_product_id" varchar(255) NOT NULL,
	"appsumo_variant_id" varchar(255),
	"activated_at" timestamp,
	"deactivated_at" timestamp,
	"last_used_at" timestamp,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "replier_appsumo_license_license_key_unique" UNIQUE("license_key")
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "replier_appsumo_license" ADD CONSTRAINT "replier_appsumo_license_user_id_replier_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "replier_user"("id") ON DELETE set null;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "replier_appsumo_license" ADD CONSTRAINT "replier_appsumo_license_product_id_replier_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "replier_products"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_appsumo_license_user_id" ON "replier_appsumo_license" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_appsumo_license_status" ON "replier_appsumo_license" ("status");
CREATE INDEX IF NOT EXISTS "idx_appsumo_license_product_id" ON "replier_appsumo_license" ("product_id");
CREATE INDEX IF NOT EXISTS "idx_appsumo_license_appsumo_user_id" ON "replier_appsumo_license" ("appsumo_user_id");
CREATE INDEX IF NOT EXISTS "idx_appsumo_license_appsumo_order_id" ON "replier_appsumo_license" ("appsumo_order_id");
CREATE INDEX IF NOT EXISTS "idx_appsumo_license_created_at" ON "replier_appsumo_license" ("created_at");

-- Create composite index for active user licenses
CREATE INDEX IF NOT EXISTS "idx_appsumo_license_user_status_active" ON "replier_appsumo_license" ("user_id", "status") WHERE "status" = 'active';

-- Add check constraint for status values
DO $$ BEGIN
 ALTER TABLE "replier_appsumo_license" ADD CONSTRAINT "chk_appsumo_license_status" CHECK ("status" IN ('pending', 'active', 'deactivated', 'expired'));
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Insert default AppSumo product if it doesn't exist
INSERT INTO "replier_products" ("id", "name", "description", "price", "currency", "interval", "is_free", "is_popular", "features", "created_at", "updated_at")
SELECT 
    gen_random_uuid(),
    'AppSumo Lifetime Deal',
    'Lifetime access to premium features through AppSumo partnership',
    0,
    'USD',
    'lifetime',
    false,
    true,
    '["Unlimited AI responses", "Premium templates", "Advanced analytics", "Priority support", "Lifetime updates"]'::jsonb,
    now(),
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM "replier_products" WHERE "name" = 'AppSumo Lifetime Deal'
);