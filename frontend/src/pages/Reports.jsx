import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, IndianRupee, RefreshCcw, FileText, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import Button from '../components/Button';
import API_BASE_URL from '../config';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip as RechartsTooltip, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Format currency properly using Indian locale
    const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(payload[0].value);
    return (
      <div className="bg-gray-900 dark:bg-slate-800 text-white shadow-2xl border border-gray-800 dark:border-slate-700 py-1.5 px-3 rounded-lg font-bold number-font z-50 flex flex-col items-center">
        <span className="text-[9px] text-gray-400 font-medium tracking-wider uppercase mb-0.5">{label} Sales</span>
        <span className="text-sm">{formattedAmount}</span>
      </div>
    );
  }
  return null;
};

const Reports = () => {
  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [data, setData] = useState({
    grossSales: 0,
    totalRefunds: 0,
    netRevenue: 0,
    salesGrowth: 0,
    chartData: [],
    reportData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const queryParams = `?startDate=${startDate}&endDate=${endDate}&t=${Date.now()}`;
        const response = await fetch(`${API_BASE_URL}/reports${queryParams}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch reports');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (startDate && endDate) {
      fetchReports();
    }
  }, [startDate, endDate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
  };

  const exportToCSV = () => {
    if (!data.reportData || data.reportData.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ['Invoice Number', 'Date', 'Gross Amount (INR)'];
    const csvRows = [];
    csvRows.push(headers.join(','));

    data.reportData.forEach(row => {
      const csvRow = [
        `${row.id}`,
        `${row.date}`,
        `${row.gross}`
      ];
      csvRows.push(csvRow.join(','));
    });

    // Append summary rows
    csvRows.push(''); // Blank row
    csvRows.push(`TOTAL SALES,,${data.grossSales}`);
    csvRows.push(`TOTAL REFUNDS,,${data.totalRefunds}`);
    csvRows.push(`NET REVENUE,,${data.netRevenue}`);

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sales_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header and Date Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading dark:text-white flex items-center">
            <BarChart3 className="mr-2 h-6 w-6 text-primary" />
            Sales & Analytics
          </h1>
          <p className="text-sm text-text dark:text-white/70 mt-1">Deep dive into your wholesale performance.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-3 bg-white dark:bg-[#152842]/80 p-3 sm:p-2 rounded-lg shadow-sm border border-border dark:border-white/10 w-full sm:w-auto">
          <div className="flex items-center justify-between sm:justify-start flex-1 sm:flex-none">
            <div className="flex flex-col flex-1">
              <span className="text-[10px] uppercase font-bold text-text/70 dark:text-white/50 px-2">From</span>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="min-h-[44px] md:min-h-0 text-base md:text-sm border-none bg-transparent focus:ring-0 text-heading dark:text-white cursor-pointer w-full"
              />
            </div>
            <span className="text-border dark:text-white/20 px-2">|</span>
            <div className="flex flex-col flex-1">
              <span className="text-[10px] uppercase font-bold text-text/70 dark:text-white/50 px-2">To</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="min-h-[44px] md:min-h-0 text-base md:text-sm border-none bg-transparent focus:ring-0 text-heading dark:text-white cursor-pointer w-full"
              />
            </div>
          </div>
          <Button variant="primary" className="w-full sm:w-auto justify-center" leftIcon={Download} onClick={exportToCSV}>
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        <Card className="border-t-4 border-t-primary bg-gradient-to-br from-white to-primary/5 dark:from-white/5 dark:to-primary/10 transition-all sticky top-0 z-10 md:static md:top-auto md:z-auto">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-text dark:text-white/70 uppercase tracking-wider mb-2">Gross Sales</p>
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-heading dark:text-white number-font">
                {loading ? '...' : formatCurrency(data.grossSales)}
              </h2>
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>
            <p className={`text-xs font-semibold mt-4 flex items-center ${Number(data.salesGrowth) >= 0 ? 'text-emerald-600' : 'text-danger/80'}`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${Number(data.salesGrowth) < 0 ? 'rotate-180' : ''}`} /> 
              {Number(data.salesGrowth) > 0 ? '+' : ''}{data.salesGrowth}% vs previous period
            </p>
          </CardContent>
        </Card>


        <Card className="border-t-4 border-t-danger bg-gradient-to-br from-white to-danger/5 dark:from-white/5 dark:to-danger/10 transition-all sticky top-4 z-20 md:static md:top-auto md:z-auto shadow-md md:shadow-none">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-text dark:text-white/70 uppercase tracking-wider mb-2">Total Refunds</p>
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-heading dark:text-white number-font">
                {loading ? '...' : formatCurrency(data.totalRefunds)}
              </h2>
              <div className="p-3 bg-danger/10 rounded-xl text-danger">
                <RefreshCcw className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-semibold text-danger/80 mt-4 flex items-center">
              Based on date range
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-success bg-gradient-to-br from-white to-success/5 dark:from-white/5 dark:to-success/10 transition-all sticky top-8 z-30 md:static md:top-auto md:z-auto shadow-lg md:shadow-none">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-text dark:text-white/70 uppercase tracking-wider mb-2">Net Revenue</p>
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-heading dark:text-white number-font">
                {loading ? '...' : formatCurrency(data.netRevenue)}
              </h2>
              <div className="p-3 bg-success/10 rounded-xl text-success">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-semibold text-success mt-4 flex items-center">
              (Gross - Refunds)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visualization and Top Products */}
      <div className="mt-6">
        
        {/* Sales Chart Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-72 w-full pb-4">
              {loading ? (
                <div className="w-full flex justify-center items-center h-full text-text dark:text-white/50">Loading chart...</div>
              ) : data.chartData.length === 0 ? (
                <div className="w-full flex justify-center items-center h-full text-text dark:text-white/50">No data available for this range.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
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
                      barSize={40}
                      fill="url(#colorSales)"
                    >
                      {data.chartData.map((entry, index) => (
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

      {/* Detailed Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Sales Report</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">Loading...</TableCell>
                  </TableRow>
                ) : data.reportData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-text dark:text-white/70">No invoices found for this range.</TableCell>
                  </TableRow>
                ) : (
                  data.reportData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium text-primary dark:text-white number-font">{row.id}</TableCell>
                      <TableCell className="number-font text-text dark:text-white/70">{row.date}</TableCell>
                      <TableCell className="text-right font-medium number-font text-heading dark:text-white">{formatCurrency(row.gross)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
