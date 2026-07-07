import React, { useState } from 'react';
import { Card, CardContent } from '../components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import SearchBox from '../components/SearchBox';
import Button from '../components/Button';
import { Filter, Download, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Invoices = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const invoicesList = Array.from({ length: 10 }, (_, i) => ({
    id: `INV-2023-${String(100 + i).padStart(3, '0')}`,
    customer: ['Shree Silk Palace', 'Kanjivaram House', 'Mahalaxmi Textiles', 'Sari Sansar', 'Priya Creations'][i % 5],
    date: `2023-10-${24 - i}`,
    dueDate: `2023-11-${24 - i}`,
    amount: `₹${(Math.floor(Math.random() * 100) + 10) * 1000}`,
    status: ['paid', 'pending', 'overdue', 'draft'][i % 4],
  }));

  const filteredInvoices = invoicesList.filter(invoice => 
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading dark:text-white">Invoices</h1>
          <p className="text-sm text-text dark:text-white/70 mt-1">Manage and track your wholesale billing.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Button variant="outline" leftIcon={Download}>
            Export
          </Button>
          <Button variant="primary" leftIcon={Plus} onClick={() => navigate('/invoices/new')}>
            New Invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <SearchBox 
              placeholder="Search by invoice # or customer..." 
              className="w-full sm:max-w-md" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex items-center space-x-2">
              <Button variant="outline" leftIcon={Filter} size="sm">
                Filter
              </Button>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium number-font text-primary dark:text-white">{invoice.id}</TableCell>
                  <TableCell className="font-medium text-heading dark:text-white/90">{invoice.customer}</TableCell>
                  <TableCell className="text-text dark:text-white/70 number-font">{invoice.date}</TableCell>
                  <TableCell className="text-text dark:text-white/70 number-font">{invoice.dueDate}</TableCell>
                  <TableCell>
                    <StatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium number-font">{invoice.amount}</TableCell>
                  <TableCell className="text-right text-secondary hover:underline cursor-pointer text-sm font-medium">
                    View
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="p-4 border-t border-border dark:border-white/10 flex items-center justify-between">
            <p className="text-sm text-text dark:text-white/70">Showing <span className="font-medium text-heading dark:text-white">1</span> to <span className="font-medium text-heading dark:text-white">{filteredInvoices.length}</span> of <span className="font-medium text-heading dark:text-white">{invoicesList.length}</span> results</p>
            <Pagination currentPage={1} totalPages={Math.ceil(filteredInvoices.length / 10) || 1} onPageChange={() => {}} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
