ALTER TYPE "public"."application_status" ADD VALUE 'canceled';--> statement-breakpoint
ALTER TABLE "adoption_application" ADD COLUMN "reject_reason" text;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD COLUMN "rejected_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD COLUMN "rejected_by" text;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD COLUMN "canceled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD COLUMN "canceled_by" text;--> statement-breakpoint
ALTER TABLE "pet" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pet" ADD COLUMN "published_by" text;--> statement-breakpoint
ALTER TABLE "pet" ADD COLUMN "unpublished_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pet" ADD COLUMN "unpublished_by" text;--> statement-breakpoint
ALTER TABLE "pet" ADD COLUMN "adopted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pet" ADD COLUMN "adopted_by" text;--> statement-breakpoint
ALTER TABLE "pet" ADD COLUMN "canceled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pet" ADD COLUMN "canceled_by" text;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD CONSTRAINT "adoption_application_rejected_by_user_id_fk" FOREIGN KEY ("rejected_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD CONSTRAINT "adoption_application_canceled_by_user_id_fk" FOREIGN KEY ("canceled_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pet" ADD CONSTRAINT "pet_published_by_user_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pet" ADD CONSTRAINT "pet_unpublished_by_user_id_fk" FOREIGN KEY ("unpublished_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pet" ADD CONSTRAINT "pet_adopted_by_user_id_fk" FOREIGN KEY ("adopted_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pet" ADD CONSTRAINT "pet_canceled_by_user_id_fk" FOREIGN KEY ("canceled_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;