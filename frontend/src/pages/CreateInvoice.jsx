import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';

const CreateInvoice = () => {
  const navigate = useNavigate();
  
  // Basic Info State
  const [customer, setCustomer] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  
  // Line Items State
  const [items, setItems] = useState([
    { id: 1, name: '', quantity: 1, mrp: 0, fixedPrice: 0, discount: 0, discountType: '%' }
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now(), name: '', quantity: 1, mrp: 0, fixedPrice: 0, discount: 0, discountType: '%' }
    ]);
  };

  const handleRemoveItem = (id) => {
    if (items.length === 1) return; // Keep at least one row
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const calculateItemTotal = (item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.fixedPrice) || 0;
    const discount = parseFloat(item.discount) || 0;
    
    let total = qty * rate;
    
    if (item.discountType === '%') {
      total = total - (total * (discount / 100));
    } else {
      total = total - discount; // Flat Rs discount
    }
    
    return Math.max(0, total); // Prevent negative totals
  };

  const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const tax = subtotal * 0.05; // 5% flat tax for demo
  const finalTotal = subtotal + tax;

  const handleSave = () => {
    // Demo save action
    console.log("Saving invoice:", { customer, invoiceDate, dueDate, items, finalTotal });
    alert("Invoice saved successfully!");
    navigate('/invoices');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-text" />
          </button>
          <h1 className="text-2xl font-bold text-heading dark:text-white">New Invoice</h1>
        </div>
        <Button variant="primary" leftIcon={Save} onClick={handleSave}>
          Save Invoice
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-heading dark:text-white mb-1.5">Customer Name</label>
              <Input 
                placeholder="Select or enter customer" 
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-heading dark:text-white mb-1.5">Invoice Date</label>
              <Input 
                type="date" 
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-heading dark:text-white mb-1.5">Due Date</label>
              <Input 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          <div className="p-4 md:p-6">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-border dark:border-white/10 text-sm font-semibold text-heading dark:text-white/70">
              <div className="col-span-3">Item Details</div>
              <div className="col-span-1">Qty</div>
              <div className="col-span-2">MRP (₹)</div>
              <div className="col-span-2">Fixed Price (₹)</div>
              <div className="col-span-2">Discount</div>
              <div className="col-span-2 text-right pr-8">Total (₹)</div>
            </div>

            <div className="space-y-4 md:space-y-0 mt-4 md:mt-0">
              {items.map((item, index) => (
                <div key={item.id} className="relative grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-0 border border-border dark:border-white/10 md:border-0 md:border-b md:border-border/50 dark:md:border-white/10 rounded-2xl md:rounded-none bg-white dark:bg-transparent md:bg-transparent md:py-4">
                  
                  {/* Mobile Header (Item # and Delete) */}
                  <div className="flex justify-between items-center md:hidden mb-2 border-b border-border/50 pb-2">
                    <span className="font-semibold text-sm text-primary">Item #{index + 1}</span>
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={items.length === 1}
                      className="text-danger p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="md:col-span-3">
                    <label className="text-xs font-medium text-text dark:text-white/70 md:hidden mb-1.5 block">Item Name / Description</label>
                    <Input 
                      placeholder="e.g. Banarasi Silk Saree" 
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 md:col-span-5 md:grid-cols-5 md:gap-4">
                    <div className="col-span-1 md:col-span-1">
                      <label className="text-xs font-medium text-text dark:text-white/70 md:hidden mb-1.5 block">Qty</label>
                      <Input 
                        type="number" 
                        min="1" 
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="text-xs font-medium text-text dark:text-white/70 md:hidden mb-1.5 block">MRP</label>
                      <Input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={item.mrp}
                        onChange={(e) => updateItem(item.id, 'mrp', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="text-xs font-medium text-text dark:text-white/70 md:hidden mb-1.5 block">Fixed Price</label>
                      <Input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={item.fixedPrice}
                        onChange={(e) => updateItem(item.id, 'fixedPrice', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-text dark:text-white/70 md:hidden mb-1.5 block">Discount</label>
                    <div className="flex space-x-2">
                      <Input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={item.discount}
                        onChange={(e) => updateItem(item.id, 'discount', e.target.value)}
                      />
                      <Select 
                        options={[
                          { label: '%', value: '%' },
                          { label: '₹', value: '₹' }
                        ]}
                        value={item.discountType}
                        onChange={(e) => updateItem(item.id, 'discountType', e.target.value)}
                        className="w-20 flex-shrink-0"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center md:col-span-2 md:justify-end md:pr-2 pt-2 md:pt-0 mt-2 md:mt-0 border-t border-border/50 md:border-0">
                    <span className="text-sm font-semibold text-heading dark:text-white md:hidden">Row Total:</span>
                    <div className="flex items-center">
                      <span className="font-semibold text-heading dark:text-white text-lg md:text-base number-font">
                        ₹{calculateItemTotal(item).toFixed(2)}
                      </span>
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length === 1}
                        className="flex ml-4 p-3 md:p-2 text-danger/70 hover:text-danger hover:bg-danger/10 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Remove Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-border bg-white/20">
            <Button variant="ghost" leftIcon={Plus} onClick={handleAddItem} size="sm" className="text-primary hover:bg-primary/10">
              Add New Row
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Card className="w-full md:w-1/3">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between text-sm text-text dark:text-white/70">
              <span>Subtotal</span>
              <span className="number-font font-medium text-heading dark:text-white">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-text dark:text-white/70">
              <span>Tax (5% GST)</span>
              <span className="number-font font-medium text-heading dark:text-white">₹{tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between text-lg font-bold text-primary">
              <span>Total Amount</span>
              <span className="number-font">₹{finalTotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateInvoice;
