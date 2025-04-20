import { pgTable, varchar, timestamp, text, integer, uniqueIndex, boolean, foreignKey, index, doublePrecision, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const eventCategory = pgEnum("EventCategory", ['CENTRALIZED', 'DEPARTMENT', 'CULTURAL'])
export const paymentStatus = pgEnum("PaymentStatus", ['PAID', 'UNPAID'])
export const role = pgEnum("Role", ['USER', 'COORDINATOR', 'ADMIN'])


export const prismaMigrations = pgTable("_prisma_migrations", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	checksum: varchar({ length: 64 }).notNull(),
	finishedAt: timestamp("finished_at", { withTimezone: true, mode: 'string' }),
	migrationName: varchar("migration_name", { length: 255 }).notNull(),
	logs: text(),
	rolledBackAt: timestamp("rolled_back_at", { withTimezone: true, mode: 'string' }),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const user = pgTable("User", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: text(),
	emailVerified: timestamp({ precision: 3, mode: 'string' }),
	image: text(),
	address: text(),
	phone: text(),
	college: text(),
	usn: text(),
	semester: integer(),
	role: role().default('USER').notNull(),
	department: text(),
	profileCompleted: boolean().default(false).notNull(),
}, (table) => [
	uniqueIndex("User_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
	uniqueIndex("User_usn_key").using("btree", table.usn.asc().nullsLast().op("text_ops")),
]);

export const account = pgTable("Account", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text().notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
}, (table) => [
	uniqueIndex("Account_provider_providerAccountId_key").using("btree", table.provider.asc().nullsLast().op("text_ops"), table.providerAccountId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Account_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const session = pgTable("Session", {
	id: text().primaryKey().notNull(),
	sessionToken: text().notNull(),
	userId: text().notNull(),
	expires: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("Session_sessionToken_key").using("btree", table.sessionToken.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Session_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const registration = pgTable("Registration", {
	id: text().primaryKey().notNull(),
	registrationId: text().notNull(),
	userId: text().notNull(),
	eventId: text().notNull(),
	paymentStatus: paymentStatus().default('UNPAID').notNull(),
	paymentMethod: text(),
	paymentDate: timestamp({ precision: 3, mode: 'string' }),
	paymentReceiptNo: text(),
	attendedEvent: boolean().default(false).notNull(),
	emailSent: boolean().default(false).notNull(),
	notes: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("Registration_paymentStatus_idx").using("btree", table.paymentStatus.asc().nullsLast().op("enum_ops")),
	index("Registration_registrationId_idx").using("btree", table.registrationId.asc().nullsLast().op("text_ops")),
	uniqueIndex("Registration_registrationId_key").using("btree", table.registrationId.asc().nullsLast().op("text_ops")),
	uniqueIndex("Registration_userId_eventId_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.eventId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Registration_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [event.id],
			name: "Registration_eventId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const event = pgTable("Event", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	category: eventCategory().notNull(),
	date: timestamp({ precision: 3, mode: 'string' }).notNull(),
	time: text().notNull(),
	location: text().notNull(),
	capacity: integer().notNull(),
	image: text(),
	fee: doublePrecision().default(0).notNull(),
	details: text(),
	registrationOpen: boolean().default(true).notNull(),
	departmentCode: text(),
}, (table) => [
	index("Event_category_idx").using("btree", table.category.asc().nullsLast().op("enum_ops")),
]);
