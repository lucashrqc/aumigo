ALTER TABLE "vaccine" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX "vaccine_active_idx" ON "vaccine" USING btree ("active");