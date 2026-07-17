import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { getEmployees, toggleEmployeeStatus, createEmployee } from '../controllers/userController.js';

const router = express.Router();

// Only owners can view, create, and manage employees
router.get('/', authenticate, requireRole('owner'), getEmployees);
router.post('/', authenticate, requireRole('owner'), createEmployee);
router.patch('/:id/status', authenticate, requireRole('owner'), toggleEmployeeStatus);

export default router;
