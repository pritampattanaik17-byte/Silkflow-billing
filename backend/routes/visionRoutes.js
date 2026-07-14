import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { scanProductLabel } from '../controllers/visionController.js';

const router = express.Router();

// POST /api/vision/scan — Scan a product label image and extract details
router.post('/scan', authenticate, scanProductLabel);

export default router;
