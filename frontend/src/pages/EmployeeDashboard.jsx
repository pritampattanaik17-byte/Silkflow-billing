import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import { FileText, Plus, Users, Package, RefreshCcw, IndianRupee, TrendingUp, CheckCircle2 } from 'lucide-react';
import Button from '../components/Button';
import Select from '../components/Select';
import { useNavigate, useLocation } from 'react-router-dom';
import { authFetch } from '../authFetch';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip as RechartsTooltip, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(payload[0].value);
    return (
      <div className="bg-gray-900 dark:bg-slate-800 text-white shadow-2xl border border-gray-800 dark:border-slate-700 py-1.5 px-3 rounded-lg font-bold number-font z-50 flex flex-col items-center">
        <span className="text-[9px] text-gray-400 font-medium tracking-wider uppercase mb-0.5">{label}</span>
        <span className="text-sm">{formattedAmount}</span>
      </div>
    );
  }
  return null;
};

const EmployeeDashboard = () => {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userName = user?.name ? user.name.split(' ')[0] : '';

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
        // User is already parsed at component level
        

        
        let queryParams = billingFilter ? `?date=${billingFilter}` : '';
        if (user && user.id) {
          queryParams += queryParams ? `&employeeId=${user.id}` : `?employeeId=${user.id}`;
        }

        const response = await authFetch(`/dashboard${queryParams}`, {
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
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading dark:text-white">Employee Dashboard</h1>
          <p className="text-sm text-text dark:text-white/70 mt-1">Welcome back{userName ? `, ${userName}` : ''}, here's what's happening today.</p>
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
            <CardTitle>My Sales Trend</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-64 w-full pb-4">
              {loading ? (
                <div className="w-full flex justify-center items-center h-full text-text dark:text-white/50">Loading chart...</div>
              ) : !stats.chartData || stats.chartData.length === 0 ? (
                <div className="w-full flex justify-center items-center h-full text-text dark:text-white/50">No data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSalesEmployee" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                      dy={10}
                    />
                    <RechartsTooltip 
                      content={<CustomTooltip />}
                      cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} 
                    />
                    <Bar 
                      dataKey="sales" 
                      radius={[6, 6, 0, 0]} 
                      barSize={30}
                      fill="url(#colorSalesEmployee)"
                    >
                      {stats.chartData.map((entry, index) => (
                         <Cell key={`cell-${index}`} className="hover:opacity-80 transition-opacity duration-300 cursor-pointer" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
