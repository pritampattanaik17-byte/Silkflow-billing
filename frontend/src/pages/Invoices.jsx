import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import SearchBox from '../components/SearchBox';
import Button from '../components/Button';
import { Filter, Download, Plus, Trash2, Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authFetch } from '../authFetch';

const Invoices = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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
      const response = await authFetch(`/invoices?t=${Date.now()}`, {
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
      const response = await authFetch(`/invoices/${invoice.id}`, {
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

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const exportToCSV = () => {
    if (!filteredInvoices || filteredInvoices.length === 0) {
      alert("No invoices available to export.");
      return;
    }

    const headers = ['Invoice Number', 'Customer', 'Date', 'Due Date', 'Status', 'Amount (INR)'];
    const csvRows = [];
    csvRows.push(headers.join(','));

    filteredInvoices.forEach(invoice => {
      const csvRow = [
        `"${invoice.invoiceNumber}"`,
        `"${invoice.customerName}"`,
        `"${new Date(invoice.date).toLocaleDateString()}"`,
        `"${new Date(invoice.dueDate).toLocaleDateString()}"`,
        `"${invoice.status}"`,
        `${invoice.finalTotal.toFixed(2)}`
      ];
      csvRows.push(csvRow.join(','));
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading dark:text-white">Invoices</h1>
          <p className="text-sm text-text dark:text-white/70 mt-1">Manage and track your wholesale billing.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3 w-full sm:w-auto">
          <Button variant="outline" leftIcon={Download} className="w-1/2 sm:w-auto justify-center" onClick={exportToCSV}>
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
              ) : paginatedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="7" className="text-center py-8 text-text">No invoices found.</TableCell>
                </TableRow>
              ) : (
                paginatedInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium number-font text-primary dark:text-white">
                      <div className="flex items-center gap-2">
                        {invoice.invoiceNumber}
                        {invoice.createdBy?.role === 'owner' && (
                          <ShieldCheck className="h-4 w-4 text-emerald-500" title="Created by Admin" />
                        )}
                      </div>
                    </TableCell>
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
            <p className="text-sm text-text dark:text-white/70 text-center sm:text-left">
              Showing <span className="font-medium text-heading dark:text-white">{filteredInvoices.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium text-heading dark:text-white">{Math.min(startIndex + itemsPerPage, filteredInvoices.length)}</span> of <span className="font-medium text-heading dark:text-white">{filteredInvoices.length}</span> results
            </p>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
