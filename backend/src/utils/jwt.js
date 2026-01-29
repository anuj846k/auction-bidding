import logger from '#config/logger.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPRESS_IN = process.env.JWT_EXPRESS_IN || '1d';

export const jwtToken = {
  sign: payload => {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPRESS_IN });
    } catch (error) {
      logger.error('failed to authenticate token', error);
      throw new Error('Failed to authenticate token ');
    }
  },

  verify: token => {
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.error('failed to authenticate token', error);
      throw new Error('failed to authenticate token');
    }
  },
};
