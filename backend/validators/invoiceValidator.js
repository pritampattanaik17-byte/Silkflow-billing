import { z } from 'zod';

const invoiceItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(200, 'Item name must be under 200 characters'),
  quantity: z.union([z.number(), z.string()]).transform(v => parseInt(v, 10) || 1).pipe(z.number().int().min(1, 'Quantity must be at least 1')),
  mrp: z.union([z.number(), z.string()]).transform(v => parseFloat(v) || 0).pipe(z.number().min(0, 'MRP cannot be negative')),
  fixedPrice: z.union([z.number(), z.string()]).transform(v => parseFloat(v) || 0).pipe(z.number().min(0, 'Fixed price cannot be negative')),
  discount: z.union([z.number(), z.string()]).transform(v => parseFloat(v) || 0).pipe(z.number().min(0, 'Discount cannot be negative')),
  discountType: z.enum(['%', '₹']).optional().default('%'),
  total: z.union([z.number(), z.string()]).transform(v => parseFloat(v) || 0).pipe(z.number().min(0)),
});

export const createInvoiceSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required').max(200, 'Customer name must be under 200 characters'),
  date: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required').max(100, 'Maximum 100 items per invoice'),
  subtotal: z.union([z.number(), z.string()]).transform(v => parseFloat(v) || 0).pipe(z.number().min(0)),
  tax: z.union([z.number(), z.string()]).transform(v => parseFloat(v) || 0).pipe(z.number().min(0)),
  finalTotal: z.union([z.number(), z.string()]).transform(v => parseFloat(v) || 0).pipe(z.number().min(0)),
});
