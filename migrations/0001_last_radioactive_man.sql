ALTER TABLE "_prisma_migrations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "_prisma_migrations" CASCADE;--> statement-breakpoint
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";
--> statement-breakpoint
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";
--> statement-breakpoint
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_userId_fkey";
--> statement-breakpoint
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_eventId_fkey";
--> statement-breakpoint
DROP INDEX "User_email_key";--> statement-breakpoint
DROP INDEX "User_usn_key";--> statement-breakpoint
DROP INDEX "Account_provider_providerAccountId_key";--> statement-breakpoint
DROP INDEX "Session_sessionToken_key";--> statement-breakpoint
DROP INDEX "Registration_paymentStatus_idx";--> statement-breakpoint
DROP INDEX "Registration_registrationId_idx";--> statement-breakpoint
DROP INDEX "Registration_registrationId_key";--> statement-breakpoint
DROP INDEX "Registration_userId_eventId_key";--> statement-breakpoint
DROP INDEX "Event_category_idx";--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "emailVerified" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "Session" ALTER COLUMN "expires" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "Registration" ALTER COLUMN "paymentDate" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "Registration" ALTER COLUMN "createdAt" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "Registration" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Registration" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "Event" ALTER COLUMN "date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "Event" ALTER COLUMN "fee" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_eventId_Event_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_usn_unique" UNIQUE("usn");--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_provider_providerAccountId_unique" UNIQUE("provider","providerAccountId");--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_sessionToken_unique" UNIQUE("sessionToken");--> statement-breakpoint
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_registrationId_unique" UNIQUE("registrationId");--> statement-breakpoint
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_userId_eventId_unique" UNIQUE("userId","eventId");