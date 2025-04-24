ALTER TABLE "event" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."EventCategory";--> statement-breakpoint
CREATE TYPE "public"."EventCategory" AS ENUM('CENTRALIZED', 'TECHNICA:', 'CULTURAL', 'FINEARTS', 'LITERARY');--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "category" SET DATA TYPE "public"."EventCategory" USING "category"::"public"."EventCategory";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "accommodation" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "emailVerified";