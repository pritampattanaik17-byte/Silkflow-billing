import prisma from '../lib/prisma.js';

const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return (((current - previous) / previous) * 100).toFixed(1);
};

export const getDashboardStats = async (req, res) => {
  try {
    const { date, employeeId } = req.query;

    // --- V5: Validate query parameters ---
    const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (date && !ISO_DATE_RE.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }
    if (employeeId && !UUID_RE.test(employeeId)) {
      return res.status(400).json({ message: 'Invalid employeeId format.' });
    }

    // --- V2: Role-based access control for employeeId ---
    // Employees can ONLY view their own data; owners may view any employee or all.
    let resolvedEmployeeId = employeeId || null;
    if (req.user.role === 'employee') {
      // Force employee to their own ID regardless of what they pass
      resolvedEmployeeId = req.user.id;
    }

    const revenueFilter = { status: 'paid' };
    const refundFilter = {};
    const customersFilter = {};

    if (resolvedEmployeeId) {
      revenueFilter.createdById = resolvedEmployeeId;
      refundFilter.processedById = resolvedEmployeeId;
      customersFilter.createdById = resolvedEmployeeId;
    }

    let previousRevenue = 0;
    let previousRefund = 0;
    let previousCustomersCount = 0;

    if (date) {
      // Current Period Filter (Selected Date)
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      const dateRange = { gte: startDate, lte: endDate };
      revenueFilter.date = dateRange;
      refundFilter.date = dateRange;
      customersFilter.date = dateRange;

      // Previous Period Filter (Selected Date - 1 day)
      const prevStartDate = new Date(date);
      prevStartDate.setDate(prevStartDate.getDate() - 1);
      prevStartDate.setHours(0, 0, 0, 0);
      
      const prevEndDate = new Date(date);
      prevEndDate.setDate(prevEndDate.getDate() - 1);
      prevEndDate.setHours(23, 59, 59, 999);
      
      const prevDateRange = { gte: prevStartDate, lte: prevEndDate };

      const prevRevFilter = { status: 'paid', date: prevDateRange };
      if (resolvedEmployeeId) prevRevFilter.createdById = resolvedEmployeeId;

      const prevRevResult = await prisma.invoice.aggregate({
        _sum: { finalTotal: true },
        where: prevRevFilter
      });
      previousRevenue = prevRevResult._sum.finalTotal || 0;

      const prevRefFilter = { date: prevDateRange };
      if (resolvedEmployeeId) prevRefFilter.processedById = resolvedEmployeeId;

      const prevRefResult = await prisma.return.aggregate({
        _sum: { totalRefund: true },
        where: prevRefFilter
      });
      previousRefund = prevRefResult._sum.totalRefund || 0;

      const prevCustFilter = { date: prevDateRange };
      if (resolvedEmployeeId) prevCustFilter.createdById = resolvedEmployeeId;

      const prevCust = await prisma.invoice.findMany({
        where: prevCustFilter,
        select: { customerName: true },
        distinct: ['customerName']
      });
      previousCustomersCount = prevCust.length;
    }

    // 1. Total Revenue
    const revenueResult = await prisma.invoice.aggregate({
      _sum: { finalTotal: true },
      where: revenueFilter
    });
    const totalRevenue = revenueResult._sum.finalTotal || 0;

    // 2. Total Refund
    const refundResult = await prisma.return.aggregate({
      _sum: { totalRefund: true },
      where: refundFilter
    });
    const totalRefund = refundResult._sum.totalRefund || 0;

    // 3. Active Customers (Filtered by Date)
    const customers = await prisma.invoice.findMany({
      where: customersFilter,
      select: { customerName: true },
      distinct: ['customerName']
    });
    const activeCustomers = customers.length;

    // 3b. Total Customers (All time)
    const totalCustomersFilter = {};
    if (resolvedEmployeeId) {
      totalCustomersFilter.createdById = resolvedEmployeeId;
    }
    const allCustomers = await prisma.invoice.findMany({
      where: totalCustomersFilter,
      select: { customerName: true },
      distinct: ['customerName']
    });
    const totalCustomersCount = allCustomers.length;

    // 4. Recent Transactions (Invoices + Returns)
    const recentInvoicesFilter = {};
    const recentReturnsFilter = {};
    if (resolvedEmployeeId) {
      recentInvoicesFilter.createdById = resolvedEmployeeId;
      recentReturnsFilter.processedById = resolvedEmployeeId;
    }

    const recentInvoices = await prisma.invoice.findMany({
      where: recentInvoicesFilter,
      orderBy: { date: 'desc' },
      take: 5,
      select: {
        invoiceNumber: true,
        customerName: true,
        date: true,
        finalTotal: true,
        status: true
      }
    });

    const recentReturns = await prisma.return.findMany({
      where: recentReturnsFilter,
      orderBy: { date: 'desc' },
      take: 5,
      select: {
        returnNumber: true,
        customerName: true,
        date: true,
        totalRefund: true,
        refundMethod: true
      }
    });

    // Format and combine
    const formattedInvoices = recentInvoices.map(inv => ({
      id: inv.invoiceNumber,
      customer: inv.customerName,
      date: inv.date,
      dateStr: inv.date.toISOString().split('T')[0],
      amount: `₹${inv.finalTotal.toLocaleString('en-IN')}`,
      status: inv.status,
      type: 'invoice'
    }));

    const formattedReturns = recentReturns.map(ret => ({
      id: ret.returnNumber,
      customer: ret.customerName || 'N/A',
      date: ret.date,
      dateStr: ret.date.toISOString().split('T')[0],
      amount: `₹${ret.totalRefund.toLocaleString('en-IN')}`,
      status: 'refunded',
      type: 'return'
    }));

    const combinedTransactions = [...formattedInvoices, ...formattedReturns]
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);

    // 5. Chart Data (Last 7 days ending on selected date)
    const endDateForChart = date ? new Date(date) : new Date();
    endDateForChart.setHours(23, 59, 59, 999);
    
    const startDateForChart = new Date(endDateForChart);
    startDateForChart.setDate(startDateForChart.getDate() - 6);
    startDateForChart.setHours(0, 0, 0, 0);

    // Helper to get local date string YYYY-MM-DD
    const getLocalDayStr = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const chartFilter = { gte: startDateForChart, lte: endDateForChart };

    const chartDataMap = {};
    let currentDateForChart = new Date(startDateForChart);
    while (currentDateForChart <= endDateForChart) {
      const dayStr = getLocalDayStr(currentDateForChart);
      const shortDay = currentDateForChart.toLocaleDateString('en-US', { weekday: 'short' });
      chartDataMap[dayStr] = { day: shortDay, date: dayStr, sales: 0 };
      currentDateForChart.setDate(currentDateForChart.getDate() + 1);
    }

    const chartInvoicesFilter = { status: 'paid', date: chartFilter };
    if (resolvedEmployeeId) chartInvoicesFilter.createdById = resolvedEmployeeId;

    const paidInvoicesForChart = await prisma.invoice.findMany({
      where: chartInvoicesFilter,
      select: { date: true, finalTotal: true }
    });

    paidInvoicesForChart.forEach(inv => {
      const dayStr = getLocalDayStr(inv.date);
      if (chartDataMap[dayStr]) {
        chartDataMap[dayStr].sales += inv.finalTotal;
      }
    });

    const chartDataArray = Object.values(chartDataMap);
    const maxSales = Math.max(...chartDataArray.map(d => d.sales), 1);
    const chartData = chartDataArray.map(d => ({
      day: d.day,
      sales: d.sales,
      height: `${Math.max(10, Math.round((d.sales / maxSales) * 100))}%`
    }));

    res.json({
      totalRevenue,
      revenueChange: calculatePercentageChange(totalRevenue, previousRevenue),
      totalRefund,
      refundChange: calculatePercentageChange(totalRefund, previousRefund),
      activeCustomers,
      customersChange: calculatePercentageChange(activeCustomers, previousCustomersCount),
      totalCustomers: totalCustomersCount,
      chartData,
      recentTransactions: combinedTransactions.map(t => ({
        id: t.id,
        customer: t.customer,
        date: t.dateStr,
        amount: t.amount,
        status: t.status,
        type: t.type
      }))
    });
  } catch (error) {
    console.error('Get dashboard stats error:', process.env.NODE_ENV === 'production' ? error.message : error);
    res.status(500).json({ message: 'Internal server error while fetching dashboard stats' });
  }
};
