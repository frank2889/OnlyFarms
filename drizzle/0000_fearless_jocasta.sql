CREATE TYPE "public"."farm_status" AS ENUM('actief', 'seizoen', 'gestopt', 'onbevestigd');--> statement-breakpoint
CREATE TABLE "farms" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"address" text,
	"postcode" text,
	"city" text,
	"province" text,
	"lat" double precision,
	"lng" double precision,
	"products" text[] DEFAULT '{}' NOT NULL,
	"opening_hours" text,
	"phone" text,
	"website" text,
	"organic" boolean,
	"vending_machine" boolean,
	"payment_methods" text,
	"description" text,
	"status" "farm_status" DEFAULT 'onbevestigd' NOT NULL,
	"source" text DEFAULT 'sheet-import' NOT NULL,
	"last_verified_at" timestamp with time zone,
	"claimed_by_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "farms_source_id_unique" UNIQUE("source_id"),
	CONSTRAINT "farms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"message" text NOT NULL,
	"reporter_email" text,
	"resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "farms_province_idx" ON "farms" USING btree ("province");--> statement-breakpoint
CREATE INDEX "farms_status_idx" ON "farms" USING btree ("status");--> statement-breakpoint
CREATE INDEX "farms_lat_lng_idx" ON "farms" USING btree ("lat","lng");