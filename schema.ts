import { pgTable, text, timestamp, boolean, unique, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define enums
export const roleEnum = pgEnum('Role', ['USER', 'ADMIN']);
export const eventCategoryEnum = pgEnum('EventCategory', ['CENTRALIZED', 'DEPARTMENT', 'CULTURAL']);
export const paymentStatusEnum = pgEnum('PaymentStatus', ['PAID', 'UNPAID', 'REFUNDED']);

// User table
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  role: roleEnum('role').default('USER').notNull(),
  phone: text('phone'),
  address: text('address'),
  department: text('department'),
  semester: integer('semester'),
  college: text('college'),
  usn: text('usn').unique(),
  profileCompleted: boolean('profileCompleted').default(false).notNull(),
});

// Account table (for OAuth)
export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (table) => ({
  providerProviderAccountIdKey: unique().on(table.provider, table.providerAccountId),
}));

// Session table
export const session = pgTable('session', {
  id: text('id').primaryKey(),
  sessionToken: text('sessionToken').unique().notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

// Event table
export const event = pgTable('event', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  date: timestamp('date', { mode: 'date' }).notNull(),
  time: text('time').notNull(),
  duration: integer('duration'),
  location: text('location').notNull(),
  category: eventCategoryEnum('category').notNull(),
  capacity: integer('capacity'),
  fee: integer('fee').default(0).notNull(),
  details: text('details').notNull(),
  registrationOpen: boolean('registrationOpen').default(true).notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// Registration table
export const registration = pgTable('registration', {
  id: text('id').primaryKey(),
  registrationId: text('registrationId').unique().notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  eventId: text('eventId')
    .notNull()
    .references(() => event.id, { onDelete: 'cascade' }),
  paymentStatus: paymentStatusEnum('paymentStatus').default('UNPAID').notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (table) => ({
  userEventUnique: unique().on(table.userId, table.eventId),
}));

// Relations
export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
  registrations: many(registration),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const eventRelations = relations(event, ({ many }) => ({
  registrations: many(registration),
}));

export const registrationRelations = relations(registration, ({ one }) => ({
  user: one(user, {
    fields: [registration.userId],
    references: [user.id],
  }),
  event: one(event, {
    fields: [registration.eventId],
    references: [event.id],
  }),
}));