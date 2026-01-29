import logger from '#config/logger.js';
import { optionalAuthenticate } from '#middleware/auth.middleware.js';
import authRoutes from '#routes/auth.routes.js';
import bidsRoutes from '#routes/bids.routes.js';
import itemsRoutes from '#routes/items.routes.js';
import userRoutes from '#routes/user.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(optionalAuthenticate);

app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);

app.get('/', (req, res) => {
  logger.info('Hello from Levich auctions backend!');
  res.status(200).json('Hello from Levich auctions backend!');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Server is healthy',
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Levich auctions backend is running!!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/bids', bidsRoutes);
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
