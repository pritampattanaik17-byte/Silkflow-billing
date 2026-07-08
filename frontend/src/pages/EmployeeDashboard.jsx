import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import { FileText, Plus, Users, Package, RefreshCcw, IndianRupee, TrendingUp, CheckCircle2 } from 'lucide-react';
import Button from '../components/Button';
import Select from '../components/Select';
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [billingFilter, setBillingFilter] = useState(new Date().toISOString().split('T')[0]);
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');

  const [stats, setStats] = useState({
    totalRevenue: 0,
    revenueChange: 0,
    totalRefund: 0,
    refundChange: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (successMessage) {
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    const fetchEmployeeStats = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        
        let queryParams = billingFilter ? `?date=${billingFilter}` : '';
        if (user && user.id) {
          queryParams += queryParams ? `&employeeId=${user.id}` : `?employeeId=${user.id}`;
        }

        const response = await fetch(`${API_BASE_URL}/dashboard${queryParams}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching employee dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeStats();
  }, [billingFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading dark:text-white">Employee Dashboard</h1>
          <p className="text-sm text-text dark:text-white/70 mt-1">Manage your billing and day-to-day operations.</p>
        </div>
        <div className="mt-4 sm:mt-0 w-full sm:w-auto">
          <Button className="w-full sm:w-auto" variant="primary" leftIcon={Plus} onClick={() => navigate('/invoices/new')}>
            Quick Bill
          </Button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-primary bg-gradient-to-br from-white to-primary/5 dark:from-white/5 dark:to-primary/10 relative overflow-hidden group hover:shadow-md transition-all sticky top-0 z-10 md:static md:top-auto md:z-auto">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-sm font-semibold text-text dark:text-white/70 uppercase tracking-wider">My Total Billing</CardTitle>
            <input 
              type="date"
              value={billingFilter}
              onChange={(e) => setBillingFilter(e.target.value)}
              className="h-11 md:h-8 text-base md:text-xs py-1 px-3 md:px-2 bg-white/80 dark:bg-black/20 backdrop-blur-sm border border-white/60 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-text dark:text-white font-medium cursor-pointer"
            />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-center space-x-3 mt-2">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-bold text-heading dark:text-white number-font">
                  {loading ? '...' : `₹${stats.totalRevenue.toLocaleString('en-IN')}`}
                </div>
                <p className={`text-xs font-semibold mt-1 flex items-center ${Number(stats.revenueChange) >= 0 ? 'text-emerald-600' : 'text-danger/80'}`}>
                  {Number(stats.revenueChange) >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1 rotate-180" />}
                  {Number(stats.revenueChange) > 0 ? '+' : ''}{stats.revenueChange}% from previous period
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-danger bg-gradient-to-br from-white to-danger/5 dark:from-white/5 dark:to-danger/10 relative overflow-hidden group hover:shadow-md transition-all sticky top-4 z-20 md:static md:top-auto md:z-auto shadow-md md:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-sm font-semibold text-text dark:text-white/70 uppercase tracking-wider">Total Return Money</CardTitle>
            <input 
              type="date"
              value={billingFilter}
              onChange={(e) => setBillingFilter(e.target.value)}
              className="h-11 md:h-8 text-base md:text-xs py-1 px-3 md:px-2 bg-white/80 dark:bg-black/20 backdrop-blur-sm border border-white/60 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-danger/50 text-text dark:text-white font-medium cursor-pointer"
            />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-center space-x-3 mt-2">
              <div className="p-3 bg-danger/10 rounded-xl text-danger">
                <RefreshCcw className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-bold text-heading dark:text-white number-font">
                  {loading ? '...' : `₹${stats.totalRefund.toLocaleString('en-IN')}`}
                </div>
                <p className={`text-xs font-semibold mt-1 flex items-center ${Number(stats.refundChange) <= 0 ? 'text-emerald-600' : 'text-danger/80'}`}>
                  {Number(stats.refundChange) <= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1 rotate-180" />}
                  {Number(stats.refundChange) > 0 ? '+' : ''}{stats.refundChange}% from previous period
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">Loading...</TableCell>
                  </TableRow>
                ) : stats.recentTransactions && stats.recentTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-text dark:text-white/70">No recent transactions found.</TableCell>
                  </TableRow>
                ) : (
                  stats.recentTransactions && stats.recentTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium number-font text-primary dark:text-white">{tx.id}</TableCell>
                      <TableCell>{tx.customer}</TableCell>
                      <TableCell className="number-font text-text dark:text-white/70 text-sm">{tx.date}</TableCell>
                      <TableCell className="text-right number-font font-medium">
                        <span className={tx.type === 'return' ? 'text-danger' : 'text-emerald-600'}>
                          {tx.type === 'return' ? '-' : ''}{tx.amount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={tx.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tasks & Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-warning/5 dark:bg-warning/10 rounded-md border border-warning/20">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-warning"></div>
                <div>
                  <p className="text-sm font-medium text-heading dark:text-white">Follow up with Mahalaxmi Textiles</p>
                  <p className="text-xs text-text dark:text-white/60 mt-1">Pending payment for INV-2023-003</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
