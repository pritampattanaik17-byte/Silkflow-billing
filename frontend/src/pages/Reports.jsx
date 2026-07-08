import React, { useState } from 'react';
import { BarChart3, TrendingUp, IndianRupee, RefreshCcw, FileText, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import Button from '../components/Button';

const Reports = () => {
  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Dummy Chart Data (Last 7 Days Sales)
  const chartData = [
    { day: 'Mon', sales: 45000, height: '40%' },
    { day: 'Tue', sales: 82000, height: '70%' },
    { day: 'Wed', sales: 35000, height: '30%' },
    { day: 'Thu', sales: 120000, height: '100%' },
    { day: 'Fri', sales: 65000, height: '55%' },
    { day: 'Sat', sales: 95000, height: '80%' },
    { day: 'Sun', sales: 25000, height: '20%' },
  ];

  // Dummy GST Data
  const reportData = [
    { id: 'INV-2023-001', date: '2023-10-24', gross: 45000, gstRate: '5%', cgst: 1125, sgst: 1125, net: 42750 },
    { id: 'INV-2023-002', date: '2023-10-23', gross: 120000, gstRate: '5%', cgst: 3000, sgst: 3000, net: 114000 },
    { id: 'INV-2023-003', date: '2023-10-22', gross: 35500, gstRate: '5%', cgst: 887.5, sgst: 887.5, net: 33725 },
    { id: 'INV-2023-004', date: '2023-10-21', gross: 88000, gstRate: '5%', cgst: 2200, sgst: 2200, net: 83600 },
    { id: 'INV-2023-005', date: '2023-10-20', gross: 12400, gstRate: '5%', cgst: 310, sgst: 310, net: 11780 },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
  };

  const handleExport = () => {
    if (!reportData || reportData.length === 0) {
      alert("No data available to export for this date range.");
      return;
    }

    const headers = ['Invoice Number', 'Date', 'Gross Amount (INR)'];
    const csvData = reportData.map(row => [row.id, row.date, row.gross]);
    
    // Add summary row at the bottom
    csvData.push(['', '', '']);
    csvData.push(['TOTAL SALES', '', 300900]);
    csvData.push(['TOTAL REFUNDS', '', 24500]);
    csvData.push(['NET REVENUE', '', 261355]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
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
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex flex-1 items-center space-x-2 bg-white dark:bg-[#152842]/80 p-2 rounded-lg shadow-sm border border-border dark:border-white/10 overflow-x-auto">
            <div className="flex flex-col flex-1">
              <span className="text-[10px] uppercase font-bold text-text/70 dark:text-white/50 px-2">From</span>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm border-none bg-transparent focus:ring-0 text-heading dark:text-white cursor-pointer h-11 md:h-auto min-w-[120px]"
              />
            </div>
            <span className="text-border dark:text-white/20">|</span>
            <div className="flex flex-col flex-1">
              <span className="text-[10px] uppercase font-bold text-text/70 dark:text-white/50 px-2">To</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm border-none bg-transparent focus:ring-0 text-heading dark:text-white cursor-pointer h-11 md:h-auto min-w-[120px]"
              />
            </div>
          </div>
          <Button variant="primary" leftIcon={Download} className="w-full sm:w-auto" onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        <Card className="border-t-4 border-t-primary bg-gradient-to-br from-white to-primary/5 dark:from-white/5 dark:to-primary/10">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-text dark:text-white/70 uppercase tracking-wider mb-2">Gross Sales</p>
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-heading dark:text-white number-font">₹3,00,900</h2>
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-semibold text-emerald-600 mt-4 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> +15.3% vs previous period
            </p>
          </CardContent>
        </Card>


        <Card className="border-t-4 border-t-danger bg-gradient-to-br from-white to-danger/5 dark:from-white/5 dark:to-danger/10">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-text dark:text-white/70 uppercase tracking-wider mb-2">Total Refunds</p>
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-heading dark:text-white number-font">₹24,500</h2>
              <div className="p-3 bg-danger/10 rounded-xl text-danger">
                <RefreshCcw className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-semibold text-danger/80 mt-4 flex items-center">
              3 Returns Processed
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-success bg-gradient-to-br from-white to-success/5 dark:from-white/5 dark:to-success/10">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-text dark:text-white/70 uppercase tracking-wider mb-2">Net Revenue</p>
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-heading dark:text-white number-font">₹2,61,355</h2>
              <div className="p-3 bg-success/10 rounded-xl text-success">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-semibold text-success mt-4 flex items-center">
              (Gross - GST - Refunds)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visualization and Top Products */}
      <div className="mt-6">
        
        {/* Sales Chart Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2 pt-6">
              {chartData.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1 group">
                  <div className="w-full relative flex justify-center h-48 items-end">
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black dark:bg-white text-white dark:text-black text-xs py-1 px-2 rounded font-bold number-font pointer-events-none whitespace-nowrap z-10">
                      {formatCurrency(data.sales)}
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-full max-w-[40px] bg-primary/80 hover:bg-primary dark:bg-primary/70 dark:hover:bg-primary transition-all rounded-t-sm"
                      style={{ height: data.height }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-text/70 dark:text-white/60 mt-3">{data.day}</span>
                </div>
              ))}
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
                {reportData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-primary dark:text-white number-font">{row.id}</TableCell>
                    <TableCell className="number-font text-text dark:text-white/70">{row.date}</TableCell>
                    <TableCell className="text-right font-medium number-font text-heading dark:text-white">{formatCurrency(row.gross)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
