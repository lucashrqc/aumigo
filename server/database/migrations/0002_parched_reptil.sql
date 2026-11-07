CREATE TABLE "state" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ibge_id" integer NOT NULL,
	"name" text NOT NULL,
	"uf" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "state_ibge_id_unique" UNIQUE("ibge_id"),
	CONSTRAINT "state_uf_unique" UNIQUE("uf")
);
--> statement-breakpoint
ALTER TABLE "city" ADD COLUMN "state_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "city" ADD COLUMN "ibge_id" integer;--> statement-breakpoint
ALTER TABLE "city" ADD CONSTRAINT "city_state_id_state_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."state"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "city_state_id_idx" ON "city" USING btree ("state_id");--> statement-breakpoint
ALTER TABLE "city" DROP COLUMN "state";--> statement-breakpoint
ALTER TABLE "city" DROP COLUMN "ibge_code";--> statement-breakpoint
ALTER TABLE "city" ADD CONSTRAINT "city_ibge_id_unique" UNIQUE("ibge_id");