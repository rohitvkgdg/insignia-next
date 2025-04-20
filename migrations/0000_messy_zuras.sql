-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

CREATE TYPE "public"."EventCategory" AS ENUM('CENTRALIZED', 'DEPARTMENT', 'CULTURAL');
--> statement-breakpoint
CREATE TYPE "public"."PaymentStatus" AS ENUM('PAID', 'UNPAID');
--> statement-breakpoint
CREATE TYPE "public"."Role" AS ENUM('USER', 'COORDINATOR', 'ADMIN');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp(3),
	"image" text,
	"address" text,
	"phone" text,
	"college" text,
	"usn" text,
	"semester" integer,
	"role" "Role" DEFAULT 'USER' NOT NULL,
	"department" text,
	"profileCompleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Session" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionToken" text NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Registration" (
	"id" text PRIMARY KEY NOT NULL,
	"registrationId" text NOT NULL,
	"userId" text NOT NULL,
	"eventId" text NOT NULL,
	"paymentStatus" "PaymentStatus" DEFAULT 'UNPAID' NOT NULL,
	"paymentMethod" text,
	"paymentDate" timestamp(3),
	"paymentReceiptNo" text,
	"attendedEvent" boolean DEFAULT false NOT NULL,
	"emailSent" boolean DEFAULT false NOT NULL,
	"notes" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Event" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" "EventCategory" NOT NULL,
	"date" timestamp(3) NOT NULL,
	"time" text NOT NULL,
	"location" text NOT NULL,
	"capacity" integer NOT NULL,
	"image" text,
	"fee" double precision DEFAULT 0 NOT NULL,
	"details" text,
	"registrationOpen" boolean DEFAULT true NOT NULL,
	"departmentCode" text
);
--> statement-breakpoint
ALTER TABLE IF EXISTS "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE cascade;
--> statement-breakpoint
ALTER TABLE IF EXISTS "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE cascade;
--> statement-breakpoint
ALTER TABLE IF EXISTS "Registration" ADD CONSTRAINT "Registration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE cascade;
--> statement-breakpoint
ALTER TABLE IF EXISTS "Registration" ADD CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE cascade ON UPDATE cascade;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User" USING btree ("email");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "User_usn_key" ON "User" USING btree ("usn");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account" USING btree ("provider", "providerAccountId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session" USING btree ("sessionToken");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Registration_paymentStatus_idx" ON "Registration" USING btree ("paymentStatus");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Registration_registrationId_idx" ON "Registration" USING btree ("registrationId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Registration_registrationId_key" ON "Registration" USING btree ("registrationId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Registration_userId_eventId_key" ON "Registration" USING btree ("userId", "eventId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Event_category_idx" ON "Event" USING btree ("category");