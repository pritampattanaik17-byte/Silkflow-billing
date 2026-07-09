import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import { authFetch } from '../authFetch';

// ── Helpers ──────────────────────────────────────────────────────────
const formatCurrency = (n) => {
  const num = parseFloat(n) || 0;
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const PrintInvoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const invoice = location.state?.invoice;
  const [isCanceling, setIsCanceling] = useState(false);

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">No Invoice Data</h2>
        <Button variant="primary" leftIcon={ArrowLeft} onClick={() => navigate('/invoices/new')}>
          Create Invoice
        </Button>
      </div>
    );
  }

  const items = invoice.items || [];

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel and delete this invoice?")) return;
    
    setIsCanceling(true);
    try {
      const response = await authFetch(`/invoices/${invoice.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to cancel invoice');
      }
      navigate('/invoices/new', { state: { successMessage: 'Invoice cancelled successfully' } });
    } catch (error) {
      alert(error.message);
      setIsCanceling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-2 sm:p-4 flex flex-col items-center print:p-0 print:bg-white">
      <div className="w-full max-w-[148mm] mb-4 flex justify-between print:hidden">
        <div className="flex space-x-2">
          <Button variant="ghost" leftIcon={ArrowLeft} onClick={() => navigate('/invoices')} size="sm">
            Back
          </Button>
          <Button variant="danger" onClick={handleCancel} disabled={isCanceling} size="sm">
            {isCanceling ? 'Canceling...' : 'Cancel Invoice'}
          </Button>
        </div>
        <Button variant="primary" leftIcon={Printer} onClick={() => window.print()} size="sm">
          Print Invoice
        </Button>
      </div>
      
      {/* A5 size wrapper: 148mm wide. Tightly packed. */}
      <div className="w-full max-w-[148mm] bg-white p-4 sm:p-6 shadow-sm border border-border rounded-none print:shadow-none print:border-none print:p-0">
        
        {/* Header - Compressed vertically */}
        <div className="flex justify-between items-start border-b border-border pb-2">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-6 h-6 bg-accent rounded flex items-center justify-center font-bold text-primary text-sm">
                S
              </div>
              <span className="font-heading font-bold text-lg tracking-wide text-primary">SilkFlow</span>
            </div>
            <div className="text-[9px] text-text leading-tight">
              <p>Katargam, Surat, Gujarat 395004</p>
              <p>GSTIN: 24AAACC1206D1Z1</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-xl font-heading font-bold text-primary mb-0.5 tracking-tight">TAX INVOICE</h1>
            <p className="text-heading font-medium text-[10px]">Invoice No: <span className="number-font">{invoice.invoiceNumber}</span></p>
            <p className="text-text text-[9px]">Date: <span className="number-font">{formatDate(invoice.date)}</span></p>
          </div>
        </div>

        {/* Bill To & Payment Info - Compressed */}
        <div className="flex justify-between items-start py-2 border-b border-border">
          <div className="w-1/2">
            <h3 className="text-[8px] font-semibold text-text uppercase tracking-wider mb-0.5">Billed To:</h3>
            <p className="text-[11px] font-bold text-heading leading-tight">{invoice.customerName}</p>
          </div>
          <div className="w-1/2 text-right">
            <h3 className="text-[8px] font-semibold text-text uppercase tracking-wider mb-0.5">Payment Details:</h3>
            <p className="text-[9px] text-text flex justify-end gap-2">
              <span className="font-medium">Total Due:</span> 
              <span className="number-font font-bold text-heading">₹ {formatCurrency(invoice.finalTotal)}</span>
            </p>
            <p className="text-[9px] text-text flex justify-end gap-2 mt-0.5">
              <span className="font-medium">Return Till:</span> 
              <span className="number-font">{formatDate(invoice.dueDate)}</span>
            </p>
          </div>
        </div>

        {/* Items Table - Ultra compact for 10-15 items */}
        <div className="mt-2">
          <table className="w-full text-[9px] text-left">
            <thead className="bg-background text-heading font-semibold uppercase border-b border-border" style={{ fontSize: '8px' }}>
              <tr>
                <th className="py-1 px-1">Item Details</th>
                <th className="py-1 px-1 text-center">Qty</th>
                <th className="py-1 px-1 text-right">MRP</th>
                <th className="py-1 px-1 text-right">Fixed</th>
                <th className="py-1 px-1 text-center">Disc.</th>
                <th className="py-1 px-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {items.map((item, index) => {
                const mrpVal = parseFloat(item.mrp) || 0;
                const fixedVal = parseFloat(item.fixedPrice) || 0;
                const discountVal = parseFloat(item.discount) || 0;

                return (
                  <tr key={item.id || index}>
                    <td className="py-1 px-1">
                      <span className="font-medium text-heading truncate block max-w-[50mm]">{item.name || 'N/A'}</span>
                    </td>
                    <td className="py-1 px-1 text-center number-font text-heading">{item.quantity || 'N/A'}</td>
                    <td className="py-1 px-1 text-right number-font text-text">
                      {mrpVal > 0 ? formatCurrency(mrpVal) : 'N/A'}
                    </td>
                    <td className="py-1 px-1 text-right number-font text-text">
                      {fixedVal > 0 ? formatCurrency(fixedVal) : 'N/A'}
                    </td>
                    <td className="py-1 px-1 text-center number-font text-text">
                      {discountVal > 0
                        ? `${item.discount}${item.discountType === '%' ? '%' : ' ₹'}`
                        : 'N/A'}
                    </td>
                    <td className="py-1 px-1 text-right number-font font-medium text-heading">₹ {formatCurrency(item.total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals - Compressed */}
        <div className="flex justify-end mt-2 border-t border-border pt-2">
          <div className="w-1/2 space-y-1">
            <div className="flex justify-between text-[10px] text-text">
              <span>Subtotal</span>
              <span className="number-font font-medium text-heading">₹ {formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex justify-between text-[10px] text-text">
                <span>Tax / Extra Charges</span>
                <span className="number-font font-medium text-heading">₹ {formatCurrency(invoice.tax)}</span>
              </div>
            )}
            <div className="flex justify-between text-[11px] font-bold text-primary border-t border-border/50 pt-1 mt-1">
              <span>Total</span>
              <span className="number-font">₹ {formatCurrency(invoice.finalTotal)}</span>
            </div>
          </div>
        </div>
        
        {/* Footer - Side-by-side to save massive vertical space */}
        <div className="flex justify-between mt-4 pt-2 border-t border-border">
          <div className="text-[7px] text-text max-w-[100mm]">
            <p className="font-semibold text-heading mb-0.5">Terms & Conditions:</p>
            <ul className="list-disc pl-3 space-y-0.5 pr-2">
              <li>Products can only be exchanged within 7 days of purchase for different colors/designs (subject to availability).</li>
              <li>No cash refunds will be issued; exchange/store credit only.</li>
              <li>Damaged or defective products must be reported within 24 hours of delivery.</li>
            </ul>
          </div>
          <div className="text-right flex flex-col justify-end min-w-[80px]">
            <p className="text-heading font-semibold text-[9px] mb-4">For SilkFlow</p>
            <p className="text-text text-[8px] border-t border-border/50 pt-0.5 inline-block">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintInvoice;
