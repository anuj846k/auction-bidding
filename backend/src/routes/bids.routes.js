import express from 'express';
import { authenticate } from '#middleware/auth.middleware.js';
import { bidsController } from '#controllers/bids.controller.js';

const router = express.Router();

// GET /api/bids/my - Get all bids for the authenticated user
router.get('/my', authenticate, bidsController.getUserBids);

export default router;
