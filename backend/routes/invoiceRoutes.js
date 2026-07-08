import express from 'express';
import { createInvoice, getInvoices, deleteInvoice } from '../controllers/invoiceController.js';

const router = express.Router();

router.post('/', createInvoice);
router.get('/', getInvoices);
router.delete('/:id', deleteInvoice);

export default router;
