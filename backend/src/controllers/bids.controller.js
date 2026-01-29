import logger from '#config/logger.js';
import { bidService } from '#services/bid.service.js';

export const bidsController = {
  getUserBids: async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const userId = req.user.id;
      const userBids = await bidService.getUserBids(userId);

      res.status(200).json({
        bids: userBids,
        count: userBids.length,
      });
    } catch (error) {
      logger.error('Error fetching user bids', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch user bids',
      });
    }
  },
};
