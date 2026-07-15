import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { createInvoice, getInvoices, deleteInvoice } from '../controllers/invoiceController.js';

const router = express.Router();

// All invoice routes require authentication
router.post('/', authenticate, createInvoice);
router.get('/', authenticate, getInvoices);
// Only owners can delete invoices
router.delete('/:id', authenticate, requireRole('owner'), deleteInvoice);


export default router;
