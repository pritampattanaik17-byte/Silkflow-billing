import prisma from '../lib/prisma.js';
import { createReturnSchema } from '../validators/returnValidator.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getFinancialYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 4) {
    return `${year}-${String(year + 1).slice(-2)}`;
  } else {
    return `${year - 1}-${String(year).slice(-2)}`;
  }
};

export const createReturn = async (req, res) => {
  try {
    const validationResult = createReturnSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ message: errorMessages });
    }

    const { customerName, originalInvoiceId, date, items, refundMethod, notes } = validationResult.data;

    const recalculatedItems = items.map(item => ({
      ...item,
      total: Math.max(0, Math.round(((parseInt(item.quantity, 10) || 1) * (parseFloat(item.returnRate) || 0)) * 100) / 100),
    }));
    const recalculatedTotalRefund = recalculatedItems.reduce((sum, item) => sum + item.total, 0);

    const processedById = req.user.id;

    let resolvedInvoiceId = null;
    if (originalInvoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { invoiceNumber: originalInvoiceId }
      });
      if (invoice) {
        resolvedInvoiceId = invoice.id;
      }
    }

    const financialYear = getFinancialYear();
    const returnPrefix = `RET-${financialYear}-`;

    const returnRecord = await prisma.$transaction(async (tx) => {
      let nextSeq = 1;
      const lastReturn = await tx.return.findFirst({
        where: { returnNumber: { startsWith: returnPrefix } },
        orderBy: { returnNumber: 'desc' },
      });

      if (lastReturn) {
        const lastSeq = parseInt(lastReturn.returnNumber.replace(returnPrefix, ''), 10);
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
          totalRefund: recalculatedTotalRefund,
          processedById,
          items: {
            create: recalculatedItems.map(item => ({
              name: item.name,
              reason: item.reason,
              quantity: parseInt(item.quantity, 10) || 1,
              returnRate: parseFloat(item.returnRate) || 0,
              total: item.total
            }))
          }
        },
        include: { items: true, processedBy: { select: { name: true } } }
      });
    }, {
      isolationLevel: 'Serializable',
      maxWait: 5000,
      timeout: 10000
    });

    res.status(201).json({ message: 'Return processed successfully', return: returnRecord });
  } catch (error) {
    console.error('Create return error:', process.env.NODE_ENV === 'production' ? error.message : error);
    res.status(500).json({ message: 'Failed to process return' });
  }
};

export const getReturns = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'employee') {
      filter.processedById = req.user.id;
    }

    const returns = await prisma.return.findMany({
      where: filter,
      include: {
        processedBy: { select: { name: true } },
        originalInvoice: { select: { invoiceNumber: true } }
      },
      orderBy: { date: 'desc' }
    });

    res.json(returns);
  } catch (error) {
    console.error('Get returns error:', process.env.NODE_ENV === 'production' ? error.message : error);
    res.status(500).json({ message: 'Failed to fetch returns' });
  }
};
