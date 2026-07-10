import { z } from 'zod';

const returnItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(200, 'Item name must be under 200 characters'),
  reason: z.string().min(1, 'Reason is required').max(200, 'Reason must be under 200 characters'),
  quantity: z.union([z.number(), z.string()]).transform(v => parseInt(v, 10) || 1).pipe(z.number().int().min(1, 'Quantity must be at least 1')),
  returnRate: z.union([z.number(), z.string()]).transform(v => parseFloat(v) || 0).pipe(z.number().min(0, 'Return rate cannot be negative')),
  total: z.union([z.number(), z.string()]).transform(v => parseFloat(v) || 0).pipe(z.number().min(0)),
});

export const createReturnSchema = z.object({
  customerName: z.string().max(200, 'Customer name must be under 200 characters').optional().nullable(),
  originalInvoiceId: z.string().max(200).optional().nullable(),
  date: z.string().min(1, 'Return date is required'),
  refundMethod: z.enum(['credit_note', 'cash', 'upi', 'item_exchange'], {
    errorMap: () => ({ message: "Refund method must be one of: credit_note, cash, upi, item_exchange" }),
  }),
  notes: z.string().max(1000, 'Notes must be under 1000 characters').optional().nullable(),
  items: z.array(returnItemSchema).min(1, 'At least one item is required').max(100, 'Maximum 100 items per return'),
  totalRefund: z.union([z.number(), z.string()]).transform(v => parseFloat(v) || 0).pipe(z.number().min(0)),
});
