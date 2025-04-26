ALTER TABLE "user" ADD COLUMN "numeric_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_numeric_id_unique" UNIQUE("numeric_id");