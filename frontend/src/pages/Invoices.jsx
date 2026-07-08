import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import SearchBox from '../components/SearchBox';
import Button from '../components/Button';
import { Filter, Download, Plus, Trash2, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config';

const Invoices = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [invoicesList, setInvoicesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');

  useEffect(() => {
    fetchInvoices();
    
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/invoices?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoicesList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (invoice) => {
    const confirmed = window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?\n\nThis action cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeletingId(invoice.id);
      setError('');
      const response = await fetch(`${API_BASE_URL}/invoices/${invoice.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to delete invoice');
      }

      // Remove from local state immediately
      setInvoicesList(prev => prev.filter(inv => inv.id !== invoice.id));
      setSuccessMessage(`Invoice ${invoice.invoiceNumber} deleted successfully.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredInvoices = invoicesList.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading dark:text-white">Invoices</h1>
          <p className="text-sm text-text dark:text-white/70 mt-1">Manage and track your wholesale billing.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3 w-full sm:w-auto">
          <Button variant="outline" leftIcon={Download} className="w-1/2 sm:w-auto justify-center">
            Export
          </Button>
          <Button variant="primary" leftIcon={Plus} onClick={() => navigate('/invoices/new')} className="w-1/2 sm:w-auto justify-center">
            New
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan="7" className="text-center py-8 text-text">Loading invoices...</TableCell>
                </TableRow>
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="7" className="text-center py-8 text-text">No invoices found.</TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium number-font text-primary dark:text-white">{invoice.invoiceNumber}</TableCell>
                    <TableCell className="font-medium text-heading dark:text-white/90">{invoice.customerName}</TableCell>
                    <TableCell className="text-text dark:text-white/70 number-font">{new Date(invoice.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-text dark:text-white/70 number-font">{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium number-font">₹{invoice.finalTotal.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleDelete(invoice)}
                        disabled={deletingId === invoice.id}
                        className="p-2 md:p-1.5 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center text-danger/60 hover:text-danger hover:bg-danger/10 rounded-md transition-colors disabled:opacity-50 inline-flex"
                        title="Delete Invoice"
                      >
                        {deletingId === invoice.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          <div className="p-4 border-t border-border dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-text dark:text-white/70 text-center sm:text-left">Showing <span className="font-medium text-heading dark:text-white">1</span> to <span className="font-medium text-heading dark:text-white">{filteredInvoices.length}</span> of <span className="font-medium text-heading dark:text-white">{invoicesList.length}</span> results</p>
            <Pagination currentPage={1} totalPages={Math.ceil(filteredInvoices.length / 10) || 1} onPageChange={() => {}} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
