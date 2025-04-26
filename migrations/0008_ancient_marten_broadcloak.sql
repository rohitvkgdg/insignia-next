ALTER TABLE "registration" DROP CONSTRAINT "registration_id_unique";--> statement-breakpoint
ALTER TABLE "registration" ADD COLUMN "registrationId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "registration" ADD CONSTRAINT "registration_registrationId_unique" UNIQUE("registrationId");