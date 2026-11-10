CREATE TYPE "public"."enclosure_type" AS ENUM('walled', 'fenced', 'fully_enclosed', 'is_netted');--> statement-breakpoint
CREATE TYPE "public"."home" AS ENUM('house', 'apartment');--> statement-breakpoint
ALTER TABLE "adoption_application" ADD COLUMN "age" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD COLUMN "home" "home" NOT NULL;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD COLUMN "city_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD COLUMN "street" text NOT NULL;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD COLUMN "number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD COLUMN "neighborhood" text NOT NULL;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD COLUMN "complement" text;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD COLUMN "zip_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD COLUMN "is_rental" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD COLUMN "allow_pets" boolean;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD COLUMN "first_pet" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD COLUMN "has_financial_conditions" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD COLUMN "enclosure_type" "enclosure_type"[];--> statement-breakpoint
ALTER TABLE "adoption_application" ADD COLUMN "accepted_terms" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD CONSTRAINT "adoption_application_city_id_city_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."city"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "adoption_application_city_id_idx" ON "adoption_application" USING btree ("city_id");