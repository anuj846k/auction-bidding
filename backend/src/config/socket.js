import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '#config/logger.js';
import { bidService } from '#services/bid.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

let io = null;

export const initializeSocket = httpServer => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware for Socket.io
  io.use((socket, next) => {
    try {
      // Get token from handshake auth or cookies
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.cookie?.split('token=')[1]?.split(';')[0];

      if (!token) {
        // Allow connection but mark as unauthenticated
        socket.userId = null;
        return next();
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id; // Store user ID on socket
      socket.user = decoded;
      next();
    } catch (error) {
      // Allow connection but mark as unauthenticated
      socket.userId = null;
      logger.error('Authentication error', error);
      next();
    }
  });

  io.on('connection', socket => {
    socket.on('BID_PLACED', async data => {
      try {
        if (!socket.userId) {
          socket.emit('BID_ERROR', {
            error: 'Authentication required',
            message: 'You must be logged in to place a bid',
          });
          return;
        }

        const { itemId, amount } = data;
        if (!itemId || amount == null) {
          socket.emit('BID_ERROR', {
            error: 'Validation failed/Invalid Input',
            message: 'Item ID and bid amount are required',
          });
          return;
        }
        const bidAmount = parseFloat(amount);
        if (Number.isNaN(bidAmount) || bidAmount <= 0) {
          socket.emit('BID_ERROR', {
            error: 'invalid amount',
            message: 'Bid amount must be a positive number',
          });
          return;
        }
        const result = await bidService.placeBid(
          itemId,
          socket.userId,
          bidAmount
        );

        //broadcast the bid update to all connected clients
        io.emit('UPDATE_BID', {
          itemId: result.item.id,
          currentBid: result.item.currentBid,
          bidderId: result.bidderId,
          auctionEndTime: result.item.auctionEndTime,
          timestamp: new Date().toISOString(),
        });
        socket.emit('BID_SUCCESS', {
          message: 'Your bid has been placed successfully',
          item: result.item,
        });
      } catch (error) {
        logger.error('Error placing bid', error);
        socket.emit('BID_ERROR', {
          error: 'Internal server error',
          message: error.message || 'Your bid could not be processed',
        });
      }
    });
    logger.info(
      `Socket connected: ${socket.id}, User: ${socket.userId || 'anonymous'}`
    );

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket first.');
  }
  return io;
};
