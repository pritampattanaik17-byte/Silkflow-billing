import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { createInvoice, getInvoices, deleteInvoice } from '../controllers/invoiceController.js';

const router = express.Router();

// All invoice routes require authentication
router.post('/', authenticate, createInvoice);
router.get('/', authenticate, getInvoices);
router.delete('/:id', authenticate, deleteInvoice);

export default router;
