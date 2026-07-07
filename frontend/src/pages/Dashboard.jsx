import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import { ArrowUpRight, ArrowDownRight, IndianRupee, Users, Package, RefreshCcw, TrendingUp, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const location = useLocation();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');

  useEffect(() => {
    if (successMessage) {
      // Clear the state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const recentInvoices = [
    { id: 'INV-2023-001', customer: 'Shree Silk Palace', date: '2023-10-24', amount: '₹45,000', status: 'paid' },
    { id: 'INV-2023-002', customer: 'Kanjivaram House', date: '2023-10-23', amount: '₹1,20,000', status: 'pending' },
    { id: 'INV-2023-003', customer: 'Mahalaxmi Textiles', date: '2023-10-22', amount: '₹35,500', status: 'overdue' },
    { id: 'INV-2023-004', customer: 'Sari Sansar', date: '2023-10-21', amount: '₹88,000', status: 'paid' },
    { id: 'INV-2023-005', customer: 'Priya Creations', date: '2023-10-20', amount: '₹12,400', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading dark:text-white">Dashboard</h1>
          <p className="text-sm text-text dark:text-white/70 mt-1">Welcome back, here's what's happening today.</p>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border-l-4 border-emerald-500 p-4 rounded-md flex items-start mb-6">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-400">Success</h3>
            <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80 mt-1">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        
        {/* Total Revenue */}
        <Card className="border-t-4 border-t-primary bg-gradient-to-br from-white to-primary/5 dark:from-white/5 dark:to-primary/10 relative overflow-hidden group hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-sm font-semibold text-text dark:text-white/70 uppercase tracking-wider">Total Revenue</CardTitle>
            <input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-8 text-xs py-1 px-2 bg-white/80 dark:bg-black/20 backdrop-blur-sm border border-white/60 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-text dark:text-white font-medium cursor-pointer"
            />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-center space-x-3 mt-2">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-bold text-heading dark:text-white number-font">
                  ₹24,50,000
                </div>
                <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> +12.5% from previous period
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Refund */}
        <Card className="border-t-4 border-t-danger bg-gradient-to-br from-white to-danger/5 dark:from-white/5 dark:to-danger/10 relative overflow-hidden group hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-sm font-semibold text-text dark:text-white/70 uppercase tracking-wider">Total Refund</CardTitle>
            <input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-8 text-xs py-1 px-2 bg-white/80 dark:bg-black/20 backdrop-blur-sm border border-white/60 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-danger/50 text-text dark:text-white font-medium cursor-pointer"
            />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-center space-x-3 mt-2">
              <div className="p-3 bg-danger/10 rounded-xl text-danger">
                <RefreshCcw className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-bold text-heading dark:text-white number-font">
                  ₹4,30,000
                </div>
                <p className="text-xs font-semibold text-danger/80 mt-1 flex items-center">
                  <ArrowDownRight className="w-3 h-3 mr-1" /> -2.4% from previous period
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Customers */}
        <Card className="border-t-4 border-t-secondary bg-gradient-to-br from-white to-secondary/5 dark:from-white/5 dark:to-secondary/10 relative overflow-hidden group hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-sm font-semibold text-text dark:text-white/70 uppercase tracking-wider">Active Customers</CardTitle>
            <input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-8 text-xs py-1 px-2 bg-white/80 dark:bg-black/20 backdrop-blur-sm border border-white/60 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 text-text dark:text-white font-medium cursor-pointer"
            />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-center space-x-3 mt-2">
              <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-bold text-heading dark:text-white number-font">
                  142
                </div>
                <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> +4.1% from previous period
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium number-font text-primary dark:text-white">{invoice.id}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell className="number-font dark:text-white/70">{invoice.date}</TableCell>
                    <TableCell className="text-right number-font font-medium">{invoice.amount}</TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
