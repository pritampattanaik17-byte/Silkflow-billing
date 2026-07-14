import prisma from '../lib/prisma.js';
import { createReturnSchema } from '../validators/returnValidator.js';

export const getReturns = async (req, res) => {
  try {
    // V3: Scope returns by role — employees see only their own
    const whereFilter = {};
    if (req.user.role === 'employee') {
      whereFilter.processedById = req.user.id;
    }

    const returns = await prisma.return.findMany({
      where: whereFilter,
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
    console.error('Get returns error:', process.env.NODE_ENV === 'production' ? error.message : error);
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

    // V4: Use a serializable transaction with retry to prevent duplicate return numbers
    const MAX_RETRIES = 3;
    let attempt = 0;
    let newReturn;

    while (attempt < MAX_RETRIES) {
      try {
        newReturn = await prisma.$transaction(async (tx) => {
          // Generate returnNumber inside the transaction using findFirst (race-safe)
          const currentYear = new Date().getFullYear();
          const returnPrefix = `RET-${currentYear}-`;

          const lastReturn = await tx.return.findFirst({
            where: { returnNumber: { startsWith: returnPrefix } },
            orderBy: { returnNumber: 'desc' },
            select: { returnNumber: true }
          });

          let nextSeq = 1;
          if (lastReturn) {
            const parts = lastReturn.returnNumber.split('-');
            const lastSeq = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(lastSeq)) {
              nextSeq = lastSeq + 1;
            }
          }

          const returnNumber = `${returnPrefix}${String(nextSeq).padStart(3, '0')}`;

          return tx.return.create({
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
        }, {
          isolationLevel: 'Serializable'
        });

        break; // Success — exit retry loop
      } catch (txError) {
        attempt++;
        // P2002 = unique constraint violation (race condition on returnNumber)
        if (txError.code === 'P2002' && attempt < MAX_RETRIES) {
          continue; // Retry with next sequence number
        }
        throw txError; // Rethrow if not retryable or max retries exceeded
      }
    }

    res.status(201).json({ message: 'Return processed successfully', return: newReturn });
  } catch (error) {
    console.error('Create return error:', process.env.NODE_ENV === 'production' ? error.message : error);
    res.status(500).json({ message: 'Internal server error while creating return' });
  }
};
