import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getReportsData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

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

    // 5. Chart Data (Aggregate by Day)
    const chartDataMap = {};
    let currentDate = new Date(start);
    while (currentDate <= end) {
      const dayStr = getLocalDayStr(currentDate);
      const shortDay = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
      chartDataMap[dayStr] = {
        day: shortDay,
        date: dayStr,
        sales: 0
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const paidInvoicesForChart = await prisma.invoice.findMany({
      where: { status: 'paid', date: dateFilter },
      select: { date: true, finalTotal: true }
    });

    paidInvoicesForChart.forEach(inv => {
      const dayStr = getLocalDayStr(inv.date);
      if (chartDataMap[dayStr]) {
        chartDataMap[dayStr].sales += inv.finalTotal;
      }
    });

    const chartDataArray = Object.values(chartDataMap);

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
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Internal server error while fetching reports' });
  }
};
