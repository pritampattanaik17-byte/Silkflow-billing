import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, RefreshCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';

const ProcessReturn = () => {
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState('');
  const [origInvoice, setOrigInvoice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [refundMethod, setRefundMethod] = useState('credit_note');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState([
    { id: 1, name: '', quantity: 1, returnRate: 0, reason: 'defective' }
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now(), name: '', quantity: 1, returnRate: 0, reason: 'defective' }
    ]);
  };

  const handleRemoveItem = (id) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateItemTotal = (item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.returnRate) || 0;
    return qty * rate;
  };

  const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const finalTotal = subtotal; // No tax on returns for this demo unless specified

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/returns')}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-text" />
          </button>
          <h1 className="text-2xl font-bold text-heading dark:text-white">Process Return</h1>
        </div>
        <Button variant="danger" leftIcon={RefreshCcw} onClick={() => {
          alert('Return Processed!');
          navigate('/returns');
        }}>
          Complete Return
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Return Details</CardTitle>
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
              <label className="block text-sm font-medium text-heading dark:text-white mb-1.5">Original Invoice #</label>
              <Input 
                placeholder="e.g. INV-2023-006" 
                value={origInvoice}
                onChange={(e) => setOrigInvoice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-heading dark:text-white mb-1.5">Return Date</label>
              <Input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Returned Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          <div className="p-4 md:p-6">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-border dark:border-white/10 text-sm font-semibold text-heading dark:text-white/70">
              <div className="col-span-3">Item Details</div>
              <div className="col-span-2">Reason</div>
              <div className="col-span-2">Return Qty</div>
              <div className="col-span-3">Return Rate (₹)</div>
              <div className="col-span-2 text-right pr-8">Total (₹)</div>
            </div>

            <div className="space-y-4 md:space-y-0 mt-4 md:mt-0">
              {items.map((item, index) => (
                <div key={item.id} className="relative grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-0 border border-border dark:border-white/10 md:border-0 md:border-b md:border-border/50 dark:md:border-white/10 rounded-2xl md:rounded-none bg-white dark:bg-transparent md:bg-transparent md:py-4">
                  
                  {/* Mobile Header (Item # and Delete) */}
                  <div className="flex justify-between items-center md:hidden mb-2 border-b border-border/50 pb-2">
                    <span className="font-semibold text-sm text-danger">Return Item #{index + 1}</span>
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

                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-text dark:text-white/70 md:hidden mb-1.5 block">Reason</label>
                    <Select
                      value={item.reason}
                      onChange={(e) => updateItem(item.id, 'reason', e.target.value)}
                      options={[
                        { label: 'Defective', value: 'defective' },
                        { label: 'Unsold', value: 'unsold' },
                        { label: 'Wrong Item', value: 'wrong_item' },
                        { label: 'Other', value: 'other' }
                      ]}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 md:col-span-5 md:grid-cols-5 md:gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <label className="text-xs font-medium text-text dark:text-white/70 md:hidden mb-1.5 block">Return Qty</label>
                      <Input 
                        type="number" 
                        min="1" 
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-3">
                      <label className="text-xs font-medium text-text dark:text-white/70 md:hidden mb-1.5 block">Return Rate</label>
                      <Input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={item.returnRate}
                        onChange={(e) => updateItem(item.id, 'returnRate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center md:col-span-2 md:justify-end md:pr-2 pt-2 md:pt-0 mt-2 md:mt-0 border-t border-border/50 md:border-0">
                    <span className="text-sm font-semibold text-heading dark:text-white md:hidden">Row Total:</span>
                    <div className="flex items-center">
                      <span className="font-semibold text-danger text-lg md:text-base number-font">
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
            <Button variant="ghost" leftIcon={Plus} onClick={handleAddItem} size="sm" className="text-danger hover:bg-danger/10">
              Add New Row
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row justify-end gap-6 mt-6">
        <Card className="w-full md:w-1/3 order-2 md:order-1 self-start">
           <CardHeader>
             <CardTitle className="text-sm">Refund Settings</CardTitle>
           </CardHeader>
           <CardContent>
              <label className="block text-sm font-medium text-heading dark:text-white mb-1.5">Method</label>
              <Select
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value)}
                options={[
                  { label: 'Issue Credit Note', value: 'credit_note' },
                  { label: 'Cash Refund', value: 'cash' },
                  { label: 'UPI / Bank Transfer', value: 'upi' },
                ]}
              />
              <div className="mt-4">
                <label className="block text-sm font-medium text-heading dark:text-white mb-1.5">Internal Notes</label>
                <textarea 
                  className="w-full bg-white border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-danger/50 text-text placeholder-text/50 min-h-[80px]"
                  placeholder="Reason for return..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
           </CardContent>
        </Card>

        <Card className="w-full md:w-1/3 order-1 md:order-2 border-danger/20 bg-danger/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between text-sm text-text dark:text-white/70">
              <span>Total Items Returned</span>
              <span className="font-medium text-heading dark:text-white">{items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0)}</span>
            </div>
            <div className="border-t border-danger/20 pt-4 flex justify-between text-lg font-bold text-danger">
              <span>Total Refund</span>
              <span className="number-font">₹{finalTotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProcessReturn;
