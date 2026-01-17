import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/storage';
import { PieChart, BarChart, HorizontalBarChart, DonutChart } from '../components/Charts';
import DateRangePicker from '../components/DateRangePicker';
import { exportToCSV, exportSummaryToCSV, generatePDFReport } from '../utils/exportReport';

// Helper function to format date as YYYY-MM-DD in local timezone
const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Reports = () => {
  const navigate = useNavigate();
  const { transactions } = useExpense();
  
  // Date range state
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      start: formatDateLocal(firstDayOfMonth),
      end: formatDateLocal(today),
      preset: 'thisMonth'
    };
  });

  // Chart type toggles
  const [categoryChartType, setCategoryChartType] = useState('pie');
  const [paymentChartType, setPaymentChartType] = useState('bar');

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Compare dates as strings (YYYY-MM-DD format) to avoid timezone issues
      const txDate = t.date; // Already in YYYY-MM-DD format
      return txDate >= dateRange.start && txDate <= dateRange.end;
    });
  }, [transactions, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    const income = filteredTransactions.filter(t => t.type === 'income');

    const totalExpenses = expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalIncome = income.reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // By Category
    const byCategory = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
      return acc;
    }, {});

    // By Payment Method
    const byPaymentMethod = expenses.reduce((acc, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + parseFloat(t.amount);
      return acc;
    }, {});

    // By Payee
    const byPayee = expenses.reduce((acc, t) => {
      acc[t.payee] = (acc[t.payee] || 0) + parseFloat(t.amount);
      return acc;
    }, {});

    // By Status
    const byStatus = filteredTransactions.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    // Daily spending (for bar chart)
    const dailySpending = {};
    expenses.forEach(t => {
      const date = t.date;
      dailySpending[date] = (dailySpending[date] || 0) + parseFloat(t.amount);
    });

    // Weekly spending
    const weeklySpending = {};
    expenses.forEach(t => {
      const date = new Date(t.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      weeklySpending[weekKey] = (weeklySpending[weekKey] || 0) + parseFloat(t.amount);
    });

    // Monthly spending
    const monthlySpending = {};
    expenses.forEach(t => {
      const date = new Date(t.date + 'T12:00:00');
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + parseFloat(t.amount);
    });

    // Monthly income
    const monthlyIncome = {};
    income.forEach(t => {
      const date = new Date(t.date + 'T12:00:00');
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyIncome[monthKey] = (monthlyIncome[monthKey] || 0) + parseFloat(t.amount);
    });

    // Yearly spending
    const yearlySpending = {};
    expenses.forEach(t => {
      const year = t.date.substring(0, 4);
      yearlySpending[year] = (yearlySpending[year] || 0) + parseFloat(t.amount);
    });

    // Yearly income
    const yearlyIncome = {};
    income.forEach(t => {
      const year = t.date.substring(0, 4);
      yearlyIncome[year] = (yearlyIncome[year] || 0) + parseFloat(t.amount);
    });

    return {
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses,
      byCategory,
      byPaymentMethod,
      byPayee,
      byStatus,
      dailySpending,
      weeklySpending,
      monthlySpending,
      monthlyIncome,
      yearlySpending,
      yearlyIncome,
      transactionCount: filteredTransactions.length,
      expenseCount: expenses.length,
      incomeCount: income.length
    };
  }, [filteredTransactions]);

  // Prepare chart data
  const categoryChartData = Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));

  const paymentChartData = Object.entries(stats.byPaymentMethod)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));

  const payeeChartData = Object.entries(stats.byPayee)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, value]) => ({ label, value }));

  const statusChartData = Object.entries(stats.byStatus)
    .map(([label, value]) => ({ label, value }));

  // Monthly trend data
  const monthlyChartData = Object.entries(stats.monthlySpending)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({
      label: new Date(date + '-01T12:00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      value
    }));

  // Yearly chart data
  const yearlyExpenseData = Object.entries(stats.yearlySpending)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([year, value]) => ({ label: year, value, color: '#EF4444' }));

  const yearlyIncomeData = Object.entries(stats.yearlyIncome)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([year, value]) => ({ label: year, value, color: '#10B981' }));

  // Combined yearly data for comparison
  const allYears = [...new Set([
    ...Object.keys(stats.yearlySpending),
    ...Object.keys(stats.yearlyIncome)
  ])].sort();

  const yearlyComparisonData = allYears.map(year => ({
    year,
    expenses: stats.yearlySpending[year] || 0,
    income: stats.yearlyIncome[year] || 0,
    balance: (stats.yearlyIncome[year] || 0) - (stats.yearlySpending[year] || 0)
  }));

  // Count transactions with invoices
  const transactionsWithInvoices = filteredTransactions.filter(
    t => t.invoiceImages && t.invoiceImages.length > 0
  ).length;

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(filteredTransactions, 'transactions');
  };

  const handleExportSummary = () => {
    exportSummaryToCSV(stats, dateRange, 'expense_summary');
  };

  const handleExportPDF = (includeInvoices = true) => {
    generatePDFReport(stats, dateRange, filteredTransactions, includeInvoices);
  };

  // Handle date range changes
  const handleDateChange = (type, value) => {
    setDateRange(prev => ({
      ...prev,
      [type === 'start' ? 'start' : 'end']: value,
      preset: 'custom'
    }));
  };

  const handlePresetSelect = (preset, range) => {
    setDateRange({
      start: range.start,
      end: range.end,
      preset
    });
  };

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2">Reports & Charts</h1>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker
        startDate={dateRange.start}
        endDate={dateRange.end}
        onDateChange={handleDateChange}
        onPresetSelect={handlePresetSelect}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-500 text-white rounded-2xl p-3 text-center">
          <p className="text-xs opacity-90 mb-1">Income</p>
          <p className="text-lg font-bold">{formatCurrency(stats.totalIncome)}</p>
          <p className="text-xs opacity-75">{stats.incomeCount} txns</p>
        </div>
        <div className="bg-red-500 text-white rounded-2xl p-3 text-center">
          <p className="text-xs opacity-90 mb-1">Expenses</p>
          <p className="text-lg font-bold">{formatCurrency(stats.totalExpenses)}</p>
          <p className="text-xs opacity-75">{stats.expenseCount} txns</p>
        </div>
        <div className={`${stats.balance >= 0 ? 'bg-primary-600' : 'bg-orange-500'} text-white rounded-2xl p-3 text-center`}>
          <p className="text-xs opacity-90 mb-1">Balance</p>
          <p className="text-lg font-bold">{formatCurrency(stats.balance)}</p>
          <p className="text-xs opacity-75">{stats.transactionCount} total</p>
        </div>
      </div>

      {/* Spending by Category */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Spending by Category</h2>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setCategoryChartType('pie')}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                categoryChartType === 'pie' ? 'bg-white shadow text-primary-600' : 'text-gray-600'
              }`}
            >
              Pie
            </button>
            <button
              onClick={() => setCategoryChartType('donut')}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                categoryChartType === 'donut' ? 'bg-white shadow text-primary-600' : 'text-gray-600'
              }`}
            >
              Donut
            </button>
            <button
              onClick={() => setCategoryChartType('bar')}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                categoryChartType === 'bar' ? 'bg-white shadow text-primary-600' : 'text-gray-600'
              }`}
            >
              Bar
            </button>
          </div>
        </div>
        
        {categoryChartType === 'pie' && (
          <PieChart data={categoryChartData} size={180} />
        )}
        {categoryChartType === 'donut' && (
          <DonutChart 
            data={categoryChartData} 
            size={180} 
            thickness={35}
            centerText={formatCurrency(stats.totalExpenses)}
          />
        )}
        {categoryChartType === 'bar' && (
          <HorizontalBarChart data={categoryChartData} />
        )}
      </div>

      {/* Spending by Payment Method */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">By Payment Method</h2>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setPaymentChartType('bar')}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                paymentChartType === 'bar' ? 'bg-white shadow text-primary-600' : 'text-gray-600'
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setPaymentChartType('pie')}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                paymentChartType === 'pie' ? 'bg-white shadow text-primary-600' : 'text-gray-600'
              }`}
            >
              Pie
            </button>
          </div>
        </div>
        
        {paymentChartType === 'bar' && (
          <HorizontalBarChart data={paymentChartData} />
        )}
        {paymentChartType === 'pie' && (
          <PieChart data={paymentChartData} size={180} />
        )}
      </div>

      {/* Monthly Trend */}
      {monthlyChartData.length > 0 && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Monthly Spending Trend</h2>
          <BarChart data={monthlyChartData} height={150} />
        </div>
      )}

      {/* Top Payees */}
      {payeeChartData.length > 0 && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Top Payees</h2>
          <HorizontalBarChart data={payeeChartData} />
        </div>
      )}

      {/* Transaction Status */}
      {statusChartData.length > 0 && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Transaction Status</h2>
          <div className="flex justify-center">
            <DonutChart data={statusChartData} size={150} thickness={30} />
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {statusChartData.map((item, index) => (
              <div key={item.label} className="text-center">
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Breakdown Table */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Category Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-500 font-medium">Category</th>
                <th className="text-right py-2 text-gray-500 font-medium">Amount</th>
                <th className="text-right py-2 text-gray-500 font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {categoryChartData.map((item, index) => (
                <tr key={item.label} className="border-b border-gray-100">
                  <td className="py-2 text-gray-900">{item.label}</td>
                  <td className="py-2 text-right text-gray-900 font-medium">
                    {formatCurrency(item.value)}
                  </td>
                  <td className="py-2 text-right text-gray-500">
                    {stats.totalExpenses > 0 
                      ? ((item.value / stats.totalExpenses) * 100).toFixed(1) 
                      : 0}%
                  </td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-2 text-gray-900">Total</td>
                <td className="py-2 text-right text-gray-900">
                  {formatCurrency(stats.totalExpenses)}
                </td>
                <td className="py-2 text-right text-gray-500">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Yearly Comparison */}
      {yearlyComparisonData.length > 0 && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">📅 Year-wise Report</h2>
          
          {/* Yearly Bar Chart */}
          <div className="mb-6">
            <h3 className="text-sm text-gray-500 mb-3">Yearly Expenses</h3>
            <BarChart data={yearlyExpenseData} height={120} />
          </div>

          {/* Yearly Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-500 font-medium">Year</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Income</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Expenses</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {yearlyComparisonData.map((item) => (
                  <tr key={item.year} className="border-b border-gray-100">
                    <td className="py-2 text-gray-900 font-medium">{item.year}</td>
                    <td className="py-2 text-right text-green-600">
                      {formatCurrency(item.income)}
                    </td>
                    <td className="py-2 text-right text-red-600">
                      {formatCurrency(item.expenses)}
                    </td>
                    <td className={`py-2 text-right font-medium ${item.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(item.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">📥 Export Report</h2>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl font-medium hover:bg-green-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Transactions (CSV)
          </button>
          
          <button
            onClick={handleExportSummary}
            className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Summary (CSV)
          </button>
          
          {/* PDF Export Options */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => handleExportPDF(false)}
              className="flex items-center justify-center gap-2 p-3 bg-red-50 text-red-700 font-medium hover:bg-red-100 transition-colors w-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Print / Save as PDF
            </button>
            
            {transactionsWithInvoices > 0 && (
              <button
                onClick={() => handleExportPDF(true)}
                className="flex items-center justify-center gap-2 p-3 bg-purple-50 text-purple-700 font-medium hover:bg-purple-100 transition-colors w-full border-t border-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                PDF with Invoices ({transactionsWithInvoices} attached)
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          CSV files can be opened in Excel, Google Sheets, or any spreadsheet app
        </p>
      </div>

      {/* Report Summary */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="font-semibold mb-1">Report Summary</h3>
            <p className="text-sm opacity-90">
              Viewing data from {new Date(dateRange.start + 'T12:00:00').toLocaleDateString()} to {new Date(dateRange.end + 'T12:00:00').toLocaleDateString()}.
              {stats.transactionCount === 0 
                ? ' No transactions found in this period.'
                : ` Found ${stats.transactionCount} transactions.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
