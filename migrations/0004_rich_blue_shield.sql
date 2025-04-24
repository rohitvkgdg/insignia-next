CREATE TYPE "public"."Department" AS ENUM('CSE', 'ISE', 'AIML', 'ECE', 'EEE', 'MECHANICAL', 'CIVIL');--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."EventCategory";--> statement-breakpoint
CREATE TYPE "public"."EventCategory" AS ENUM('CENTRALIZED', 'TECHNICAL', 'CULTURAL', 'FINEARTS', 'LITERARY');--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "category" SET DATA TYPE "public"."EventCategory" USING "category"::"public"."EventCategory";--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "department" "Department";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "address";