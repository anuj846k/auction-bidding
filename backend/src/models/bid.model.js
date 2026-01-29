import {
  decimal,
  integer,
  pgTable,
  serial,
  timestamp,
} from 'drizzle-orm/pg-core';
import { items } from '#models/item.model.js';
import { users } from '#models/user.model.js';

export const bids = pgTable('bids', {
  id: serial('id').primaryKey(),
  itemId: integer('item_id')
    .notNull()
    .references(() => items.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  amount: decimal('amount', {
    precision: 10,
    scale: 2,
  }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
