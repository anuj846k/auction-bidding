import {
  fetchAllUsers,
  fetchUserById,
  modifyUser,
  removeUser,
} from '#controllers/users.controller.js';
import { authenticate } from '#middleware/auth.middleware.js';
import express from 'express';
const router = express.Router();

router.get('/', fetchAllUsers);
router.get('/:id', authenticate, fetchUserById);
router.put('/:id', authenticate, modifyUser);
router.delete('/:id', authenticate, removeUser);

export default router;
