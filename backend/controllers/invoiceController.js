import prisma from '../lib/prisma.js';
import { createInvoiceSchema } from '../validators/invoiceValidator.js';


const getFinancialYear = () => {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed (0 = Jan, 3 = Apr)
  const year = now.getFullYear();
  
  // Indian FY: April (month 3) to March (month 2)
  // If current month is Jan-Mar (0-2), FY started previous year
  const fyStartYear = month >= 3 ? year : year - 1;
  const fyEndYear = fyStartYear + 1;
  
  // Short form: 2026-2027 → "2627"
  const startShort = String(fyStartYear).slice(2);
  const endShort = String(fyEndYear).slice(2);
  
  return {
    label: `FY${startShort}${endShort}`,       // "FY2627"
    prefix: `SF/FY${startShort}${endShort}/`,   // "SF/FY2627/"
  };
};

const generateInvoiceNumber = async () => {
  const fy = getFinancialYear();
  
  // Find the latest invoice in this financial year
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: { startsWith: fy.prefix }
    },
    orderBy: { invoiceNumber: 'desc' },
    select: { invoiceNumber: true }
  });
  
  let nextSeq = 1;
  
  if (lastInvoice) {
    // Extract the sequence number from "SF/FY2627/0042" → 42
    const parts = lastInvoice.invoiceNumber.split('/');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }
  
  // Zero-pad to 4 digits (supports up to 9999 invoices per FY)
  const seqStr = String(nextSeq).padStart(4, '0');
  
  return `${fy.prefix}${seqStr}`;
};

export const createInvoice = async (req, res) => {
  try {
    const validationResult = createInvoiceSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ message: errorMessages });
    }

    const { customerName, date, dueDate, items, subtotal, tax, finalTotal } = validationResult.data;

    // User identity comes from the verified JWT token, not the request body
    const createdById = req.user.id;

    // Use a serializable transaction to prevent race conditions on invoice number generation
    const MAX_RETRIES = 3;
    let attempt = 0;
    let invoice;

    while (attempt < MAX_RETRIES) {
      try {
        invoice = await prisma.$transaction(async (tx) => {
          // Generate sequential invoice number inside the transaction
          const fy = getFinancialYear();
          const lastInvoice = await tx.invoice.findFirst({
            where: { invoiceNumber: { startsWith: fy.prefix } },
            orderBy: { invoiceNumber: 'desc' },
            select: { invoiceNumber: true }
          });

          let nextSeq = 1;
          if (lastInvoice) {
            const parts = lastInvoice.invoiceNumber.split('/');
            const lastSeq = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(lastSeq)) {
              nextSeq = lastSeq + 1;
            }
          }

          const invoiceNumber = `${fy.prefix}${String(nextSeq).padStart(4, '0')}`;

          return tx.invoice.create({
            data: {
              invoiceNumber,
              customerName,
              date: new Date(date),
              dueDate: new Date(dueDate),
              subtotal: parseFloat(subtotal),
              tax: parseFloat(tax),
              finalTotal: parseFloat(finalTotal),
              status: 'paid',
              createdById,
              items: {
                create: items.map(item => ({
                  name: item.name,
                  quantity: parseInt(item.quantity) || 1,
                  mrp: parseFloat(item.mrp) || 0,
                  fixedPrice: parseFloat(item.fixedPrice) || 0,
                  discount: parseFloat(item.discount) || 0,
                  discountType: item.discountType || '%',
                  total: parseFloat(item.total) || 0
                }))
              }
            },
            include: {
              items: true,
              createdBy: {
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
        // P2002 = unique constraint violation (race condition on invoiceNumber)
        if (txError.code === 'P2002' && attempt < MAX_RETRIES) {
          continue; // Retry with next sequence number
        }
        throw txError; // Rethrow if not retryable or max retries exceeded
      }
    }

    res.status(201).json({ message: 'Invoice created successfully', invoice });
  } catch (error) {
    console.error('Create invoice error:', process.env.NODE_ENV === 'production' ? error.message : error);
    res.status(500).json({ message: 'Internal server error while creating invoice' });
  }
};

export const getInvoices = async (req, res) => {
  try {
    // Force no caching at the server level
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });

    // V3: Scope invoices by role — employees see only their own
    const filter = {};
    if (req.user.role === 'employee') {
      filter.createdById = req.user.id;
    }

    const invoices = await prisma.invoice.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { name: true, role: true }
        }
      }
    });
    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', process.env.NODE_ENV === 'production' ? error.message : error);
    res.status(500).json({ message: 'Internal server error while fetching invoices' });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // V7: Wrap all deletions in a transaction for atomicity
    await prisma.$transaction(async (tx) => {
      // First delete related invoice items
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: id }
      });

      // Delete return items linked to returns of this invoice
      const linkedReturns = await tx.return.findMany({
        where: { originalInvoiceId: id },
        select: { id: true }
      });

      for (const ret of linkedReturns) {
        await tx.returnItem.deleteMany({ where: { returnId: ret.id } });
      }
      await tx.return.deleteMany({ where: { originalInvoiceId: id } });

      // Finally delete the invoice itself
      await tx.invoice.delete({
        where: { id }
      });
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', process.env.NODE_ENV === 'production' ? error.message : error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.status(500).json({ message: 'Internal server error while deleting invoice' });
  }
};
