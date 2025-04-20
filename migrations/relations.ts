import { relations } from "drizzle-orm/relations";
import { user, account, session, registration, event } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	registrations: many(registration),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const registrationRelations = relations(registration, ({one}) => ({
	user: one(user, {
		fields: [registration.userId],
		references: [user.id]
	}),
	event: one(event, {
		fields: [registration.eventId],
		references: [event.id]
	}),
}));

export const eventRelations = relations(event, ({many}) => ({
	registrations: many(registration),
}));