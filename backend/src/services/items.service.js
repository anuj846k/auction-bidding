import { db } from '#src/config/database.js';
import { items } from '#src/models/item.model.js';
import { bids } from '#src/models/bid.model.js';
import { eq, gt, desc, sql } from 'drizzle-orm';

export const itemService = {
  getAllItems: async () => {
    const allItems = await db.select().from(items);
    return allItems;
  },
  getActiveItems: async () => {
    const now = new Date();

    const activeItems = await db
      .select()
      .from(items)
      .where(gt(items.auctionEndTime, now));

    if (activeItems.length === 0) {
      return activeItems.map(item => ({ ...item, lastBidderId: null }));
    }

    const itemIds = activeItems.map(item => item.id);

    const allBids = await db
      .select({
        itemId: bids.itemId,
        userId: bids.userId,
        createdAt: bids.createdAt,
      })
      .from(bids)
      .where(
        sql`${bids.itemId} IN (${sql.join(
          itemIds.map(id => sql`${id}`),
          sql`, `
        )})`
      )
      .orderBy(desc(bids.createdAt));

    const bidderMap = new Map();
    const seenItems = new Set();

    allBids.forEach(bid => {
      if (!seenItems.has(bid.itemId)) {
        bidderMap.set(bid.itemId, bid.userId);
        seenItems.add(bid.itemId);
      }
    });

    return activeItems.map(item => ({
      ...item,
      lastBidderId: bidderMap.get(item.id) || null,
    }));
  },
  getItemById: async itemId => {
    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.id, itemId))
      .limit(1);
    return item;
  },
};
