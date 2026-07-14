import prisma from '../lib/prisma.js';

export const getReportsData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    // V6: Strict date validation
    const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
    if (!ISO_DATE_RE.test(startDate) || !ISO_DATE_RE.test(endDate)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date values.' });
    }

    if (start > end) {
      return res.status(400).json({ message: 'startDate must be before or equal to endDate.' });
    }

    // Cap maximum range to 1 year (366 days) to prevent DoS
    const MAX_RANGE_MS = 366 * 24 * 60 * 60 * 1000;
    if (end.getTime() - start.getTime() > MAX_RANGE_MS) {
      return res.status(400).json({ message: 'Date range cannot exceed 1 year.' });
    }

    const dateFilter = { gte: start, lte: end };

    // 1. Gross Sales (Total of paid invoices in range)
    const salesResult = await prisma.invoice.aggregate({
      _sum: { finalTotal: true },
      where: { status: 'paid', date: dateFilter }
    });
    const grossSales = salesResult._sum.finalTotal || 0;

    // 2. Total Refunds (Total refunds in range)
    const refundResult = await prisma.return.aggregate({
      _sum: { totalRefund: true },
      where: { date: dateFilter }
    });
    const totalRefunds = refundResult._sum.totalRefund || 0;

    // 3. Net Revenue
    const netRevenue = grossSales - totalRefunds;

    // 4. Detailed Report Data (Invoices)
    const invoices = await prisma.invoice.findMany({
      where: { date: dateFilter },
      orderBy: { date: 'desc' },
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

    // Helper to get local date string YYYY-MM-DD
    const getLocalDayStr = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // 5. Chart Data (Aggregate by Day or Week)
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isWeekly = diffDays > 14;

    const chartDataArray = [];
    
    if (isWeekly) {
      let currentDate = new Date(start);
      while (currentDate <= end) {
        let weekEnd = new Date(currentDate);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        if (weekEnd > end) weekEnd = new Date(end);
        
        chartDataArray.push({
          day: `${currentDate.getDate()} ${currentDate.toLocaleString('en-US', {month: 'short'})}`,
          startDate: new Date(currentDate),
          endDate: new Date(weekEnd),
          sales: 0
        });
        currentDate.setDate(currentDate.getDate() + 7);
      }
    } else {
      let currentDate = new Date(start);
      while (currentDate <= end) {
        const shortDay = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
        let dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        chartDataArray.push({
          day: shortDay,
          startDate: new Date(currentDate),
          endDate: dayEnd,
          sales: 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    const paidInvoicesForChart = await prisma.invoice.findMany({
      where: { status: 'paid', date: dateFilter },
      select: { date: true, finalTotal: true }
    });

    paidInvoicesForChart.forEach(inv => {
      const bucket = chartDataArray.find(b => inv.date >= b.startDate && inv.date <= b.endDate);
      if (bucket) {
        bucket.sales += inv.finalTotal;
      }
    });

    // Calculate heights for the chart (relative to max sales)
    const maxSales = Math.max(...chartDataArray.map(d => d.sales), 1); // avoid division by zero
    
    const chartData = chartDataArray.map(d => ({
      day: d.day,
      sales: d.sales,
      height: `${Math.max(10, Math.round((d.sales / maxSales) * 100))}%` // min height 10% for visibility
    }));

    // Previous Period for vs comparison (Optional, simple implementation)
    const duration = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - duration);
    const prevEnd = new Date(end.getTime() - duration);

    const prevSalesResult = await prisma.invoice.aggregate({
      _sum: { finalTotal: true },
      where: { status: 'paid', date: { gte: prevStart, lte: prevEnd } }
    });
    const prevGrossSales = prevSalesResult._sum.finalTotal || 0;

    let salesGrowth = 0;
    if (prevGrossSales === 0) {
      salesGrowth = grossSales > 0 ? 100 : 0;
    } else {
      salesGrowth = (((grossSales - prevGrossSales) / prevGrossSales) * 100).toFixed(1);
    }

    res.json({
      grossSales,
      totalRefunds,
      netRevenue,
      salesGrowth,
      chartData,
      reportData
    });
  } catch (error) {
    console.error('Get reports error:', process.env.NODE_ENV === 'production' ? error.message : error);
    res.status(500).json({ message: 'Internal server error while fetching reports' });
  }
};
