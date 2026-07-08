import React, { useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';

const PrintReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const report = location.state?.reportData;
  const startDate = location.state?.startDate;
  const endDate = location.state?.endDate;

  useEffect(() => {
    if (report) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [report]);

  if (!report) {
    return <Navigate to="/reports" replace />;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount || 0);
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print-text-sm {
            font-size: 12px !important;
            line-height: 1.4 !important;
          }
          .print-text-base {
            font-size: 14px !important;
          }
          .print-table th, .print-table td {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }
          .print-table th {
            font-size: 12px !important;
          }
          .print-table td {
            font-size: 12px !important;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gray-50/50 p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl mb-4 flex justify-between print:hidden">
          <Button 
            variant="outline" 
            leftIcon={ArrowLeft} 
            onClick={() => navigate('/reports')}
          >
            Back to Reports
          </Button>
          <Button 
            variant="primary" 
            leftIcon={Printer} 
            onClick={() => window.print()}
          >
            Print Report
          </Button>
        </div>
        
        <div className="print-container w-full max-w-4xl bg-white p-12 shadow-sm border border-border rounded-none">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-border pb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-accent rounded flex items-center justify-center font-bold text-primary text-xl">
                  S
                </div>
                <span className="font-heading font-bold text-2xl tracking-wide text-primary">SilkFlow</span>
              </div>
              <p className="text-text text-sm print-text-sm">123 Silk Market Road</p>
              <p className="text-text text-sm print-text-sm">Surat, Gujarat 395002</p>
              <p className="text-text text-sm print-text-sm">GSTIN: 24AAACC1206D1Z1</p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-heading font-bold text-primary mb-2 tracking-tight">SALES REPORT</h1>
              <p className="text-text text-sm print-text-sm">From: <span className="number-font font-medium">{new Date(startDate).toLocaleDateString('en-IN')}</span></p>
              <p className="text-text text-sm print-text-sm">To: <span className="number-font font-medium">{new Date(endDate).toLocaleDateString('en-IN')}</span></p>
              <p className="text-text text-sm print-text-sm mt-2">Generated: <span className="number-font">{new Date().toLocaleDateString('en-IN')}</span></p>
            </div>
          </div>

          {/* KPI Summary */}
          <div className="flex justify-between items-start py-8">
            <div className="w-1/3 border p-4 rounded-lg mr-4 bg-gray-50/50">
              <h3 className="text-xs font-semibold text-text uppercase tracking-wider mb-2">Gross Sales</h3>
              <p className="text-2xl font-bold text-heading number-font">{formatCurrency(report.grossSales)}</p>
            </div>
            <div className="w-1/3 border p-4 rounded-lg mr-4 bg-red-50/50">
              <h3 className="text-xs font-semibold text-text uppercase tracking-wider mb-2">Total Refunds</h3>
              <p className="text-2xl font-bold text-danger number-font">{formatCurrency(report.totalRefunds)}</p>
            </div>
            <div className="w-1/3 border p-4 rounded-lg bg-emerald-50/50">
              <h3 className="text-xs font-semibold text-text uppercase tracking-wider mb-2">Net Revenue</h3>
              <p className="text-2xl font-bold text-success number-font">{formatCurrency(report.netRevenue)}</p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="mt-6">
            <h3 className="text-lg font-bold text-heading mb-4 border-b pb-2">Detailed Transactions</h3>
            <table className="print-table w-full text-sm text-left">
              <thead className="bg-background text-heading font-semibold uppercase text-xs">
                <tr>
                  <th className="py-3 px-4 rounded-tl-md">Invoice #</th>
                  <th className="py-3 px-4 text-center">Date</th>
                  <th className="py-3 px-4 text-right rounded-tr-md">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report.reportData && report.reportData.length > 0 ? (
                  report.reportData.map((row) => (
                    <tr key={row.id}>
                      <td className="py-4 px-4 font-medium text-heading number-font">{row.id}</td>
                      <td className="py-4 px-4 text-center number-font text-text">{row.date}</td>
                      <td className="py-4 px-4 text-right number-font font-medium text-heading">
                        {formatCurrency(row.gross)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-6 text-center text-text italic">No transactions in this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-16 pt-8 border-t border-border text-center text-sm text-text">
            <p>This is a system generated report and does not require a physical signature.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintReport;
