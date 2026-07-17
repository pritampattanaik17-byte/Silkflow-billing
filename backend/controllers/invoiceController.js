import prisma from '../lib/prisma.js';
import { createInvoiceSchema } from '../validators/invoiceValidator.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const calculateItemTotal = (item) => {
  const qty = parseInt(item.quantity, 10) || 1;
  const fixed = parseFloat(item.fixedPrice) || 0;
  const mrp = parseFloat(item.mrp) || 0;
  const rate = fixed > 0 ? fixed : mrp;
  const discount = parseFloat(item.discount) || 0;

  let total = qty * rate;
  if (item.discountType === '%') {
    total = total - (total * (discount / 100));
  } else {
    total = total - discount;
  }
  return Math.max(0, Math.round(total * 100) / 100);
};

const getFinancialYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 4) {
    return `${String(year).slice(-2)}${String(year + 1).slice(-2)}`;
  } else {
    return `${String(year - 1).slice(-2)}${String(year).slice(-2)}`;
  }
};

export const createInvoice = async (req, res) => {
  try {
    const validationResult = createInvoiceSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ message: errorMessages });
    }

    const { customerName, date, dueDate, items, tax } = validationResult.data;

    const recalculatedItems = items.map(item => ({
      ...item,
      total: calculateItemTotal(item),
    }));
    const recalculatedSubtotal = recalculatedItems.reduce((sum, item) => sum + item.total, 0);
    const recalculatedTax = parseFloat(tax) || 0;
    const recalculatedFinalTotal = Math.round((recalculatedSubtotal + recalculatedTax) * 100) / 100;

    const createdById = req.user.id;
    const financialYear = getFinancialYear();
    const invoicePrefix = `SF/FY${financialYear}/`;

    const invoice = await prisma.$transaction(async (tx) => {
      let nextSeq = 1;
      const lastInvoice = await tx.invoice.findFirst({
        where: { invoiceNumber: { startsWith: invoicePrefix } },
        orderBy: { invoiceNumber: 'desc' },
      });

      if (lastInvoice) {
        const lastSeq = parseInt(lastInvoice.invoiceNumber.replace(invoicePrefix, ''), 10);
        if (!isNaN(lastSeq)) {
          nextSeq = lastSeq + 1;
        }
      }

      const invoiceNumber = `${invoicePrefix}${String(nextSeq).padStart(4, '0')}`;

      return tx.invoice.create({
        data: {
          invoiceNumber,
          customerName,
          date: new Date(date),
          dueDate: new Date(dueDate),
          subtotal: recalculatedSubtotal,
          tax: recalculatedTax,
          finalTotal: recalculatedFinalTotal,
          status: 'paid',
          createdById,
          items: {
            create: recalculatedItems.map(item => ({
              name: item.name,
              quantity: parseInt(item.quantity) || 1,
              mrp: parseFloat(item.mrp) || 0,
              fixedPrice: parseFloat(item.fixedPrice) || 0,
              discount: parseFloat(item.discount) || 0,
              discountType: item.discountType || '%',
              total: item.total
            }))
          }
        },
        include: { items: true, createdBy: { select: { name: true } } }
      });
    }, {
      isolationLevel: 'Serializable',
      maxWait: 5000,
      timeout: 10000
    });

    res.status(201).json({ message: 'Invoice created successfully', invoice });
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('invoiceNumber')) {
      return res.status(409).json({ message: 'A concurrent transaction created the same invoice number. Please try again.' });
    }
    console.error('Create invoice error:', process.env.NODE_ENV === 'production' ? error.message : error);
    res.status(500).json({ message: 'Failed to create invoice' });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'employee') {
      filter.createdById = req.user.id;
    }

    const invoices = await prisma.invoice.findMany({
      where: filter,
      include: {
        createdBy: {
          select: { name: true, role: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', process.env.NODE_ENV === 'production' ? error.message : error);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!UUID_RE.test(id)) {
      return res.status(400).json({ message: 'Invalid invoice ID format.' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
      await tx.return.deleteMany({ where: { originalInvoiceId: id } });
      await tx.invoice.delete({ where: { id } });
    });

    res.json({ message: 'Invoice deleted successfully.' });
  } catch (error) {
    console.error('Delete invoice error:', process.env.NODE_ENV === 'production' ? error.message : error);
    res.status(500).json({ message: 'Failed to delete invoice' });
  }
};
