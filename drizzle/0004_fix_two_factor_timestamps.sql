-- Fix two-factor table timestamp defaults
-- This migration adds default values to created_at and updated_at columns

-- Add default values to existing columns
ALTER TABLE "replier_two_factor" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "replier_two_factor" ALTER COLUMN "updated_at" SET DEFAULT now();

-- Update any existing rows that have null values
UPDATE "replier_two_factor" SET "created_at" = now() WHERE "created_at" IS NULL;
UPDATE "replier_two_factor" SET "updated_at" = now() WHERE "updated_at" IS NULL;