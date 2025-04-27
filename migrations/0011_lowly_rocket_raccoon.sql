ALTER TABLE "event" ALTER COLUMN "department" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."Department";--> statement-breakpoint
CREATE TYPE "public"."Department" AS ENUM('CSE', 'ISE', 'AIML', 'ECE', 'EEE', 'MECH', 'CIVIL', 'PHY', 'CHEM', 'CHTY', 'HUM', 'MATH');--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "department" SET DATA TYPE "public"."Department" USING "department"::"public"."Department";