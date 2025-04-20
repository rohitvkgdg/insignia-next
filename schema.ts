import { pgTable, text, timestamp, integer, unique, boolean, real, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('Role', ['USER', 'COORDINATOR', 'ADMIN']);
export const eventCategoryEnum = pgEnum('EventCategory', ['CENTRALIZED', 'DEPARTMENT', 'CULTURAL']);
export const paymentStatusEnum = pgEnum('PaymentStatus', ['PAID', 'UNPAID']);

// Tables
export const user = pgTable('User', {
  id: text('id').primaryKey().notNull(),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  address: text('address'),
  phone: text('phone'),
  college: text('college'),
  usn: text('usn').unique(),
  semester: integer('semester'),
  role: roleEnum('role').default('USER').notNull(),
  department: text('department'),
  profileCompleted: boolean('profileCompleted').default(false).notNull(),
});

export const account = pgTable('Account', {
  id: text('id').primaryKey().notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
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
  providerProviderAccountIdIdx: unique().on(table.provider, table.providerAccountId),
}));

export const session = pgTable('Session', {
  id: text('id').primaryKey().notNull(),
  sessionToken: text('sessionToken').notNull().unique(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const event = pgTable('Event', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: eventCategoryEnum('category').notNull(),
  date: timestamp('date', { mode: 'date' }).notNull(),
  time: text('time').notNull(),
  location: text('location').notNull(),
  capacity: integer('capacity').notNull(),
  image: text('image'),
  fee: real('fee').default(0).notNull(),
  details: text('details'),
  registrationOpen: boolean('registrationOpen').default(true).notNull(),
  departmentCode: text('departmentCode'),
});

export const registration = pgTable('Registration', {
  id: text('id').primaryKey().notNull(),
  registrationId: text('registrationId').notNull().unique(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  eventId: text('eventId').notNull().references(() => event.id, { onDelete: 'cascade' }),
  paymentStatus: paymentStatusEnum('paymentStatus').default('UNPAID').notNull(),
  paymentMethod: text('paymentMethod'),
  paymentDate: timestamp('paymentDate', { mode: 'date' }),
  paymentReceiptNo: text('paymentReceiptNo'),
  attendedEvent: boolean('attendedEvent').default(false).notNull(),
  emailSent: boolean('emailSent').default(false).notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull(),
}, (table) => ({
  userEventIdx: unique().on(table.userId, table.eventId),
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

// Verification token is required for NextAuth.js
export const verificationToken = pgTable("VerificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires").notNull(),
}, (table) => {
  return {
    compoundKey: unique().on(table.identifier, table.token),
  };
});

// Add verificationToken to relations export
export const verificationTokenRelations = relations(verificationToken, ({ }) => ({}));