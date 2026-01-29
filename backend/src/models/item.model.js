import {
  pgTable,
  serial,
  timestamp,
  varchar,
  decimal,
} from 'drizzle-orm/pg-core';

export const items = pgTable('items', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  startingPrice: decimal('starting_price', {
    precision: 10,
    scale: 2,
  }).notNull(),
  currentBid: decimal('current_bid', { precision: 10, scale: 2 }).notNull(),
  auctionEndTime: timestamp('auction_end_time').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
