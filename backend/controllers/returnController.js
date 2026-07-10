import prisma from '../lib/prisma.js';
import { createReturnSchema } from '../validators/returnValidator.js';

export const getReturns = async (req, res) => {
  try {
    const returns = await prisma.return.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        processedBy: {
          select: { name: true }
        },
        originalInvoice: {
          select: { invoiceNumber: true }
        }
      }
    });
    res.json(returns);
  } catch (error) {
    console.error('Get returns error:', error);
    res.status(500).json({ message: 'Internal server error while fetching returns' });
  }
};

export const createReturn = async (req, res) => {
  try {
    const validationResult = createReturnSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ message: errorMessages });
    }

    const {
      customerName,
      originalInvoiceId,
      date,
      refundMethod,
      notes,
      items,
      totalRefund
    } = validationResult.data;

    // User identity comes from the verified JWT token, not the request body
    const processedById = req.user.id;

    let resolvedInvoiceId = null;
    if (originalInvoiceId && originalInvoiceId.trim() !== '') {
      // The frontend sends the invoiceNumber (e.g. SF/FY2627/0001) in the originalInvoiceId field.
      // We need to look it up to get the actual UUID. Use findFirst to avoid unique index crash if DB is not fully migrated.
      const invoice = await prisma.invoice.findFirst({
        where: { invoiceNumber: originalInvoiceId.trim() }
      });

      if (!invoice) {
        return res.status(400).json({ message: `Invoice ${originalInvoiceId} not found.` });
      }
      resolvedInvoiceId = invoice.id;
    }

    // Generate returnNumber
    const returnCount = await prisma.return.count();
    const returnNumber = `RET-${new Date().getFullYear()}-${String(returnCount + 1).padStart(3, '0')}`;

    const newReturn = await prisma.return.create({
      data: {
        returnNumber,
        customerName: customerName || null,
        originalInvoiceId: resolvedInvoiceId,
        date: new Date(date),
        refundMethod,
        notes: notes || null,
        totalRefund: parseFloat(totalRefund) || 0,
        processedById,
        items: {
          create: items.map(item => ({
            name: item.name,
            reason: item.reason,
            quantity: parseInt(item.quantity, 10) || 1,
            returnRate: parseFloat(item.returnRate) || 0,
            total: parseFloat(item.total) || 0
          }))
        }
      },
      include: {
        items: true,
        processedBy: {
          select: { name: true }
        }
      }
    });

    res.status(201).json({ message: 'Return processed successfully', return: newReturn });
  } catch (error) {
    console.error('Create return error:', error);
    res.status(500).json({ message: 'Internal server error while creating return' });
  }
};
