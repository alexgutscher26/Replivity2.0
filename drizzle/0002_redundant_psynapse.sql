CREATE TABLE IF NOT EXISTS "replier_security_event" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"event_type" text NOT NULL,
	"severity" text NOT NULL,
	"description" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"metadata" text,
	"action_taken" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "replier_two_factor" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "replier_two_factor" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "replier_user" ADD COLUMN "password_reset_required" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "replier_user" ADD COLUMN "password_reset_reason" text;--> statement-breakpoint
ALTER TABLE "replier_user" ADD COLUMN "password_reset_required_at" timestamp;--> statement-breakpoint
ALTER TABLE "replier_user" ADD COLUMN "last_password_change" timestamp;--> statement-breakpoint
ALTER TABLE "replier_user" ADD COLUMN "password_expires_at" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "replier_security_event" ADD CONSTRAINT "replier_security_event_user_id_replier_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."replier_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
