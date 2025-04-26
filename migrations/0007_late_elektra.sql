ALTER TABLE "registration" RENAME COLUMN "registrationId" TO "id";--> statement-breakpoint
ALTER TABLE "registration" DROP CONSTRAINT "registration_registrationId_unique";--> statement-breakpoint
ALTER TABLE "event" DROP COLUMN "capacity";--> statement-breakpoint
ALTER TABLE "registration" ADD CONSTRAINT "registration_id_unique" UNIQUE("id");