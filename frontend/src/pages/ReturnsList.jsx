import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, RefreshCcw } from 'lucide-react';
import Button from '../components/Button';
import SearchBox from '../components/SearchBox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

const ReturnsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy returns data
  const returns = [
    { id: 'RET-001', origInvoice: 'INV-2023-006', customer: 'Sari Sansar', date: '2023-10-24', amount: '₹12,400', method: 'Credit Note', status: 'completed' },
    { id: 'RET-002', origInvoice: 'INV-2023-002', customer: 'Priya Creations', date: '2023-10-23', amount: '₹4,500', method: 'Cash', status: 'completed' },
    { id: 'RET-003', origInvoice: 'INV-2023-009', customer: 'Kanjivaram House', date: '2023-10-20', amount: '₹18,000', method: 'UPI', status: 'pending' },
  ];

  const filteredReturns = returns.filter(ret => 
    ret.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ret.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ret.origInvoice.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading dark:text-white">Returns & Credit Notes</h1>
          <p className="text-sm text-text dark:text-white/70 mt-1">Manage sales returns and refunds.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button variant="danger" leftIcon={Plus} onClick={() => navigate('/returns/new')}>
            Process Return
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#152842]/80 backdrop-blur-2xl rounded-lg shadow-sm border border-border dark:border-white/10 p-4 transition-colors">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <SearchBox 
              placeholder="Search by Return ID, Customer, or Orig Invoice..." 
              className="w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" leftIcon={Filter}>
            Filter
          </Button>
        </div>

        {filteredReturns.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Return ID</TableHead>
                  <TableHead>Orig Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Refund Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReturns.map((ret) => (
                  <TableRow key={ret.id}>
                    <TableCell className="font-medium number-font text-danger">{ret.id}</TableCell>
                    <TableCell className="number-font text-primary dark:text-white">{ret.origInvoice}</TableCell>
                    <TableCell className="dark:text-white/90">{ret.customer}</TableCell>
                    <TableCell className="number-font text-text dark:text-white/70 text-sm">{ret.date}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary/10 text-secondary">
                        {ret.method}
                      </span>
                    </TableCell>
                    <TableCell className="text-right number-font font-medium text-danger">{ret.amount}</TableCell>
                    <TableCell>
                      <StatusBadge status={ret.status === 'completed' ? 'paid' : 'pending'} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState 
            icon={RefreshCcw}
            title="No returns found"
            description="You haven't processed any returns yet."
            actionText="Process Return"
            onAction={() => navigate('/returns/new')}
          />
        )}
      </div>
    </div>
  );
};

export default ReturnsList;
