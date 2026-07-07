import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { clients } from './schema'; // Asumiendo que ya existe

// ... mantener tablas existentes ...

export const partners = pgTable('partners', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  phone: text('phone'),
  status: text('status').default('Activo'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  partnerId: uuid('partner_id').references(() => partners.id, { onDelete: 'set null' }),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  status: text('status').default('Pendiente'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});