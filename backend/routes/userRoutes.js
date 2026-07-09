import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { getEmployees } from '../controllers/userController.js';

const router = express.Router();

// Only owners can view the employee list
router.get('/', authenticate, requireRole('owner'), getEmployees);

export default router;
