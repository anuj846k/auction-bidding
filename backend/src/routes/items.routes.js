import { itemsController } from '#src/controllers/items.controller.js';
import express from 'express';

const router = express.Router();

router.get('/', itemsController.getAllItems);
router.get('/server-time', itemsController.getServerTime);

export default router;
