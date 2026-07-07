import React from 'react';
import { Printer } from 'lucide-react';
import Button from '../components/Button';

const PrintInvoice = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl mb-4 flex justify-end print:hidden">
        <Button 
          variant="primary" 
          leftIcon={Printer} 
          onClick={() => window.print()}
        >
          Print Invoice
        </Button>
      </div>
      
      <div className="w-full max-w-4xl bg-white p-12 shadow-sm border border-border rounded-none print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-border pb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-accent rounded flex items-center justify-center font-bold text-primary text-xl">
                V
              </div>
              <span className="font-heading font-bold text-2xl tracking-wide text-primary">VastraFlow</span>
            </div>
            <p className="text-text text-sm">123 Silk Market Road</p>
            <p className="text-text text-sm">Surat, Gujarat 395002</p>
            <p className="text-text text-sm">GSTIN: 24AAACC1206D1Z1</p>
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-heading font-bold text-primary mb-2 tracking-tight">TAX INVOICE</h1>
            <p className="text-heading font-medium">Invoice No: <span className="number-font">INV-2023-085</span></p>
            <p className="text-text text-sm">Date: <span className="number-font">24 Oct, 2023</span></p>
          </div>
        </div>

        {/* Bill To */}
        <div className="flex justify-between items-start py-8">
          <div className="w-1/2">
            <h3 className="text-xs font-semibold text-text uppercase tracking-wider mb-2">Billed To:</h3>
            <p className="text-lg font-bold text-heading">Shree Silk Palace</p>
            <p className="text-text text-sm mt-1">45 Textile Market, Ring Road</p>
            <p className="text-text text-sm">Surat, Gujarat 395002</p>
            <p className="text-text text-sm font-medium mt-1">GSTIN: 24BBBCB1234D1Z2</p>
          </div>
          <div className="w-1/3">
            <h3 className="text-xs font-semibold text-text uppercase tracking-wider mb-2">Payment Details:</h3>
            <p className="text-sm text-text flex justify-between"><span className="font-medium">Total Due:</span> <span className="number-font font-bold text-heading">₹ 2,15,400</span></p>
            <p className="text-sm text-text flex justify-between mt-1"><span className="font-medium">Due Date:</span> <span className="number-font">10 Nov, 2023</span></p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-4">
          <table className="w-full text-sm text-left">
            <thead className="bg-background text-heading font-semibold uppercase text-xs">
              <tr>
                <th className="py-3 px-4 rounded-tl-md">Item Description</th>
                <th className="py-3 px-4 text-center">HSN/SAC</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Rate</th>
                <th className="py-3 px-4 text-right">Tax (5%)</th>
                <th className="py-3 px-4 text-right rounded-tr-md">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-4 px-4">
                  <p className="font-medium text-heading">Banarasi Pure Silk Saree</p>
                  <p className="text-text text-xs mt-0.5">Color: Red, Gold Zari</p>
                </td>
                <td className="py-4 px-4 text-center number-font text-text">5007</td>
                <td className="py-4 px-4 text-center number-font text-heading">15</td>
                <td className="py-4 px-4 text-right number-font text-text">₹ 8,500</td>
                <td className="py-4 px-4 text-right number-font text-text">₹ 425</td>
                <td className="py-4 px-4 text-right number-font font-medium text-heading">₹ 1,33,875</td>
              </tr>
              <tr>
                <td className="py-4 px-4">
                  <p className="font-medium text-heading">Kanjivaram Bridal Collection</p>
                  <p className="text-text text-xs mt-0.5">Color: Magenta</p>
                </td>
                <td className="py-4 px-4 text-center number-font text-text">5007</td>
                <td className="py-4 px-4 text-center number-font text-heading">5</td>
                <td className="py-4 px-4 text-right number-font text-text">₹ 15,000</td>
                <td className="py-4 px-4 text-right number-font text-text">₹ 750</td>
                <td className="py-4 px-4 text-right number-font font-medium text-heading">₹ 78,750</td>
              </tr>
              <tr>
                <td className="py-4 px-4">
                  <p className="font-medium text-heading">Cotton Silk Party Wear</p>
                  <p className="text-text text-xs mt-0.5">Color: Navy Blue</p>
                </td>
                <td className="py-4 px-4 text-center number-font text-text">5208</td>
                <td className="py-4 px-4 text-center number-font text-heading">10</td>
                <td className="py-4 px-4 text-right number-font text-text">₹ 2,500</td>
                <td className="py-4 px-4 text-right number-font text-text">₹ 125</td>
                <td className="py-4 px-4 text-right number-font font-medium text-heading">₹ 26,250</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mt-8 border-t border-border pt-8">
          <div className="w-1/3 space-y-3">
            <div className="flex justify-between text-sm text-text">
              <span>Subtotal</span>
              <span className="number-font font-medium text-heading">₹ 2,27,500</span>
            </div>
            <div className="flex justify-between text-sm text-text">
              <span>Discount (10%)</span>
              <span className="number-font font-medium text-success">- ₹ 22,750</span>
            </div>
            <div className="flex justify-between text-sm text-text">
              <span>CGST (2.5%)</span>
              <span className="number-font font-medium text-heading">₹ 5,118.75</span>
            </div>
            <div className="flex justify-between text-sm text-text">
              <span>SGST (2.5%)</span>
              <span className="number-font font-medium text-heading">₹ 5,118.75</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-primary border-t border-border pt-3 mt-3">
              <span>Total</span>
              <span className="number-font">₹ 2,15,400</span>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border text-sm text-text">
          <p className="font-semibold text-heading mb-1">Terms & Conditions:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Goods once sold will not be taken back.</li>
            <li>Interest @ 24% p.a. will be charged if payment is delayed beyond 15 days.</li>
            <li>Subject to Surat jurisdiction only.</li>
          </ul>
        </div>
        
        <div className="mt-12 text-right">
          <p className="text-heading font-semibold mb-12">For VastraFlow</p>
          <p className="text-text text-sm">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
};

export default PrintInvoice;
