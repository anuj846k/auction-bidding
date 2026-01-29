import { db } from '#config/database.js';
import logger from '#config/logger.js';
import { bids } from '#models/bid.model.js';
import { items } from '#models/item.model.js';
import { desc, eq } from 'drizzle-orm';

export const bidService = {
  getUserBids: async userId => {
    const userBids = await db
      .select({
        bidId: bids.id,
        bidAmount: bids.amount,
        bidCreatedAt: bids.createdAt,
        itemId: items.id,
        itemTitle: items.title,
        itemCurrentBid: items.currentBid,
        itemStartingPrice: items.startingPrice,
        itemAuctionEndTime: items.auctionEndTime,
      })
      .from(bids)
      .innerJoin(items, eq(bids.itemId, items.id))
      .where(eq(bids.userId, userId))
      .orderBy(desc(bids.createdAt));

    return userBids.map(bid => ({
      id: bid.bidId,
      amount: parseFloat(bid.bidAmount),
      createdAt: bid.bidCreatedAt,
      item: {
        id: bid.itemId,
        title: bid.itemTitle,
        currentBid: parseFloat(bid.itemCurrentBid),
        startingPrice: parseFloat(bid.itemStartingPrice),
        auctionEndTime: bid.itemAuctionEndTime,
      },
    }));
  },

  placeBid: async (itemId, userId, bidAmount) => {
    return await db.transaction(async tx => {
      const [item] = await tx
        .select()
        .from(items)
        .where(eq(items.id, itemId))
        .for('update')
        .limit(1);

      if (!item) {
        throw new Error('Item not found');
      }

      const now = new Date();
      if (new Date(item.auctionEndTime) <= now) {
        throw new Error('Auction has ended');
      }

      const currentBid = parseFloat(item.currentBid);
      if (bidAmount <= currentBid) {
        throw new Error(
          `Bid must be higher than current bid of $${currentBid}`
        );
      }

      await tx
        .update(items)
        .set({
          currentBid: bidAmount.toString(),
          updatedAt: new Date(),
        })
        .where(eq(items.id, itemId));

      await tx.insert(bids).values({
        itemId,
        userId,
        amount: bidAmount.toString(),
      });

      const [updatedItem] = await tx
        .select()
        .from(items)
        .where(eq(items.id, itemId))
        .limit(1);

      logger.info(
        `Bid placed: Item ${itemId}, User ${userId}, Amount $${bidAmount}`
      );

      return {
        success: true,
        item: {
          id: updatedItem.id,
          title: updatedItem.title,
          currentBid: parseFloat(updatedItem.currentBid),
          auctionEndTime: updatedItem.auctionEndTime.toISOString(),
        },
        bidderId: userId,
      };
    });
  },
};
