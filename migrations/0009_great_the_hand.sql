CREATE TABLE "teamMember" (
	"id" text PRIMARY KEY NOT NULL,
	"registrationId" text NOT NULL,
	"name" text NOT NULL,
	"usn" text NOT NULL,
	"phone" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "isTeamEvent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "minTeamSize" integer;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "maxTeamSize" integer;--> statement-breakpoint
ALTER TABLE "teamMember" ADD CONSTRAINT "teamMember_registrationId_registration_registrationId_fk" FOREIGN KEY ("registrationId") REFERENCES "public"."registration"("registrationId") ON DELETE cascade ON UPDATE no action;