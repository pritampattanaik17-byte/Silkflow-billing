import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getReturns, createReturn } from '../controllers/returnController.js';

const router = express.Router();

// All return routes require authentication
router.get('/', authenticate, getReturns);
router.post('/', authenticate, createReturn);

export default router;
