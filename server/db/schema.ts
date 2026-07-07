import { pgTable, text, timestamp, numeric, uuid, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const appRoles = pgTable('app_roles', {
  email: text('email').primaryKey(),
  role: text('role').notNull(),
});

export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  monthYear: text('month_year').notNull(),
  targetPatients: integer('target_patients').notNull(),
  costPerPatient: numeric('cost_per_patient', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const dailyLogs = pgTable('daily_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  goalId: uuid('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  count: integer('count').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(), // 'Ingreso' o 'Gasto'
  category: text('category').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  date: text('date').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Relations
export const goalsRelations = relations(goals, ({ one, many }) => ({
  client: one(clients, {
    fields: [goals.clientId],
    references: [clients.id],
  }),
  dailyLogs: many(dailyLogs),
}));

export const dailyLogsRelations = relations(dailyLogs, ({ one }) => ({
  goal: one(goals, {
    fields: [dailyLogs.goalId],
    references: [goals.id],
  }),
}));