import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Filter, RefreshCcw, Loader2 } from 'lucide-react';
import Button from '../components/Button';
import SearchBox from '../components/SearchBox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import API_BASE_URL from '../config';

const ReturnsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [returnsList, setReturnsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');

  useEffect(() => {
    fetchReturns();
    
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchReturns = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/returns?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch returns');
      const data = await response.json();
      setReturnsList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReturns = returnsList.filter(ret => 
    ret.returnNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ret.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ret.originalInvoice?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading dark:text-white">Returns & Credit Notes</h1>
          <p className="text-sm text-text dark:text-white/70 mt-1">Manage sales returns and refunds.</p>
        </div>
        <div className="mt-4 sm:mt-0 w-full sm:w-auto">
          <Button variant="danger" leftIcon={Plus} onClick={() => navigate('/returns/new')} className="w-full sm:w-auto justify-center">
            Process Return
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-sm font-medium">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm font-medium">
          {error}
        </div>
      )}

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

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-text dark:text-white/70">Loading returns...</p>
          </div>
        ) : filteredReturns.length > 0 ? (
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
                    <TableCell className="font-medium number-font text-danger">{ret.returnNumber}</TableCell>
                    <TableCell className="number-font text-primary dark:text-white">{ret.originalInvoice?.invoiceNumber || 'N/A'}</TableCell>
                    <TableCell className="dark:text-white/90">{ret.customerName || 'N/A'}</TableCell>
                    <TableCell className="number-font text-text dark:text-white/70 text-sm">{new Date(ret.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary/10 text-secondary capitalize">
                        {ret.refundMethod?.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right number-font font-medium text-danger">₹{ret.totalRefund?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      <StatusBadge status="paid" />
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
