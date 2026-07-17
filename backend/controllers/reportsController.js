import prisma from '../lib/prisma.js';

export const getReports = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;

    const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
    if (!startDate || !ISO_DATE_RE.test(startDate) || !endDate || !ISO_DATE_RE.test(endDate)) {
      return res.status(400).json({ message: 'Valid startDate and endDate in YYYY-MM-DD format are required.' });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (end < start) {
      return res.status(400).json({ message: 'endDate cannot be before startDate.' });
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays > 365) {
      return res.status(400).json({ message: 'Date range cannot exceed 1 year.' });
    }

    // Fix H-5: Enforce employee scoping
    let resolvedEmployeeId = employeeId || null;
    if (req.user.role === 'employee') {
      resolvedEmployeeId = req.user.id;
    }

    const dateFilter = { gte: start, lte: end };
    
    const invoiceFilter = { status: 'paid', date: dateFilter };
    if (resolvedEmployeeId) invoiceFilter.createdById = resolvedEmployeeId;
    
    const returnFilter = { date: dateFilter };
    if (resolvedEmployeeId) returnFilter.processedById = resolvedEmployeeId;

    const grossResult = await prisma.invoice.aggregate({
      _sum: { finalTotal: true },
      where: invoiceFilter
    });
    const grossSales = grossResult._sum.finalTotal || 0;

    const refundResult = await prisma.return.aggregate({
      _sum: { totalRefund: true },
      where: returnFilter
    });
    const totalRefunds = refundResult._sum.totalRefund || 0;

    const netRevenue = grossSales - totalRefunds;

    // Fix H-5: Pagination/Limits on reports
    const REPORT_DATA_LIMIT = 500;
    const invoices = await prisma.invoice.findMany({
      where: invoiceFilter,
      orderBy: { date: 'desc' },
      take: REPORT_DATA_LIMIT,
      select: {
        invoiceNumber: true,
        date: true,
        finalTotal: true
      }
    });

    const reportData = invoices.map(inv => ({
      id: inv.invoiceNumber,
      date: inv.date.toISOString().split('T')[0],
      gross: inv.finalTotal
    }));

    // chart data
    const chartDataMap = {};
    let current = new Date(start);
    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      const dayStr = `${year}-${month}-${day}`;
      const shortDay = current.toLocaleDateString('en-US', { weekday: 'short' });
      chartDataMap[dayStr] = { day: shortDay, date: dayStr, sales: 0 };
      current.setDate(current.getDate() + 1);
    }

    const paidInvoicesForChart = await prisma.invoice.findMany({
      where: invoiceFilter,
      select: { date: true, finalTotal: true }
    });

    paidInvoicesForChart.forEach(inv => {
      const year = inv.date.getFullYear();
      const month = String(inv.date.getMonth() + 1).padStart(2, '0');
      const day = String(inv.date.getDate()).padStart(2, '0');
      const dayStr = `${year}-${month}-${day}`;
      if (chartDataMap[dayStr]) {
        chartDataMap[dayStr].sales += inv.finalTotal;
      }
    });

    const chartData = Object.values(chartDataMap);

    res.json({
      grossSales,
      totalRefunds,
      netRevenue,
      salesGrowth: 0, 
      chartData,
      reportData
    });
  } catch (error) {
    console.error('Get reports error:', process.env.NODE_ENV === 'production' ? error.message : error);
    res.status(500).json({ message: 'Internal server error while fetching reports' });
  }
};
