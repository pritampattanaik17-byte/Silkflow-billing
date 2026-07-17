import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { getReports } from '../controllers/reportsController.js';

const router = express.Router();

// Only owners can access reports & analytics
router.get('/', authenticate, requireRole('owner'), getReports);

export default router;
