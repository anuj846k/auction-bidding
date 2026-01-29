import logger from '#src/config/logger.js';
import { itemService } from '#src/services/items.service.js';

export const itemsController = {
  getAllItems: async (req, res) => {
    try {
      const activeItems = await itemService.getActiveItems();
      const formattedItems = activeItems.map(item => ({
        id: item.id,
        title: item.title,
        startingPrice: item.startingPrice,
        currentBid: item.currentBid,
        auctionEndTime: item.auctionEndTime,
        lastBidderId: item.lastBidderId ? Number(item.lastBidderId) : null,
      }));
      res.status(200).json(formattedItems);
    } catch (error) {
      logger.error('Error getting active items', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getServerTime: async (req, res) => {
    res.status(200).json({
      serverTime: new Date().toISOString(),
      timestamp: Date.now(),
    });
  },
};
