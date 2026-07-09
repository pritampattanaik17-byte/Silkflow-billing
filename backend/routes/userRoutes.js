import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { getEmployees, toggleEmployeeStatus } from '../controllers/userController.js';

const router = express.Router();

// Only owners can view the employee list and toggle their status
router.get('/', authenticate, requireRole('owner'), getEmployees);
router.patch('/:id/status', authenticate, requireRole('owner'), toggleEmployeeStatus);

export default router;
