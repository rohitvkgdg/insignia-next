ALTER TABLE "registration" ADD PRIMARY KEY ("registrationId");--> statement-breakpoint
ALTER TABLE "registration" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "emailVerified";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "department";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "semester";