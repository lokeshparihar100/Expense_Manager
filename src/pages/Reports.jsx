import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpense } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../utils/storage';
import { PieChart, BarChart, HorizontalBarChart, DonutChart } from '../components/Charts';
import DateRangePicker from '../components/DateRangePicker';
import { 
  exportToCSV, 
  exportSummaryToCSV, 
  generatePDFReport,
  generateTransactionsCSV,
  generateSummaryCSV 
} from '../utils/exportReport';
import { calculateStatsByCurrency, getCurrencySummary, getUsedCurrencies } from '../utils/currency';
import { isDriveConnected, uploadFileToDrive } from '../utils/googleDrive';

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
  const { 
    nativeCurrency, reportCurrency, setReportCurrency,
    exchangeRates, currencies, formatAmount, isDark
  } = useSettings();
  
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
  
  // Currency conversion toggle
  const [convertToNative, setConvertToNative] = useState(true);
  const [selectedReportCurrency, setSelectedReportCurrency] = useState(nativeCurrency);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const currencyPickerRef = useRef(null);
  
  // Close currency picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyPickerRef.current && !currencyPickerRef.current.contains(event.target)) {
        setShowCurrencyPicker(false);
        setCurrencySearch('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Compare dates as strings (YYYY-MM-DD format) to avoid timezone issues
      const txDate = t.date; // Already in YYYY-MM-DD format
      return txDate >= dateRange.start && txDate <= dateRange.end;
    });
  }, [transactions, dateRange]);

  // Get used currencies in filtered transactions
  const usedCurrencies = useMemo(() => {
    return getUsedCurrencies(filteredTransactions);
  }, [filteredTransactions]);

  // Get currency summary
  const currencySummary = useMemo(() => {
    return getCurrencySummary(filteredTransactions);
  }, [filteredTransactions]);

  // Check if we have multiple currencies
  const hasMultipleCurrencies = usedCurrencies.length > 1;
  
  // Check if conversion is needed (multiple currencies OR single currency different from report currency)
  const needsConversion = hasMultipleCurrencies || 
    (usedCurrencies.length === 1 && usedCurrencies[0] !== selectedReportCurrency);
  
  // For single currency transactions that differ from report currency, also need conversion display
  const singleCurrencyDiffersFromReport = usedCurrencies.length === 1 && usedCurrencies[0] !== selectedReportCurrency;

  // Calculate statistics with currency conversion
  const stats = useMemo(() => {
    if (convertToNative && needsConversion) {
      // Use currency-aware calculation
      return calculateStatsByCurrency(filteredTransactions, selectedReportCurrency, exchangeRates);
    }
    
    // Original calculation without conversion (only when same currency)
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
      incomeCount: income.length,
      currency: null // No specific currency
    };
  }, [filteredTransactions, convertToNative, needsConversion, selectedReportCurrency, exchangeRates]);

  // Format currency for display
  // When conversion is enabled, always use selected report currency
  // When conversion is disabled with single currency, use that currency
  // This ensures the currency symbol matches the converted amounts
  const displayCurrency = (convertToNative && needsConversion)
    ? selectedReportCurrency 
    : (usedCurrencies.length === 1 ? usedCurrencies[0] : selectedReportCurrency);
  
  const formatReportAmount = (amount) => {
    return formatAmount(amount, displayCurrency);
  };

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
    const reportCurrency = convertToNative && hasMultipleCurrencies ? selectedReportCurrency : null;
    exportSummaryToCSV(stats, dateRange, 'expense_summary', reportCurrency);
  };

  const handleExportPDF = (includeInvoices = true) => {
    const reportCurrency = convertToNative && hasMultipleCurrencies ? selectedReportCurrency : null;
    generatePDFReport(stats, dateRange, filteredTransactions, includeInvoices, reportCurrency);
  };

  // Drive upload state
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [driveUploadResult, setDriveUploadResult] = useState(null);
  const driveConnected = isDriveConnected();

  // Drive upload handlers
  const handleUploadTransactionsToDrive = async () => {
    if (filteredTransactions.length === 0) {
      setDriveUploadResult({ success: false, message: 'No transactions to upload' });
      setTimeout(() => setDriveUploadResult(null), 3000);
      return;
    }

    setIsUploadingToDrive(true);
    setDriveUploadResult(null);

    try {
      const { content, filename } = generateTransactionsCSV(filteredTransactions);
      const result = await uploadFileToDrive(filename, content, 'text/csv');
      
      if (result.success) {
        setDriveUploadResult({ 
          success: true, 
          message: `Uploaded to Drive: ${result.fileName}`,
          link: result.webViewLink 
        });
      } else {
        setDriveUploadResult({ success: false, message: result.error || 'Upload failed' });
      }
    } catch (error) {
      setDriveUploadResult({ success: false, message: error.message });
    }

    setIsUploadingToDrive(false);
    setTimeout(() => setDriveUploadResult(null), 5000);
  };

  const handleUploadSummaryToDrive = async () => {
    setIsUploadingToDrive(true);
    setDriveUploadResult(null);

    try {
      const reportCurrency = convertToNative && hasMultipleCurrencies ? selectedReportCurrency : null;
      const { content, filename } = generateSummaryCSV(stats, dateRange, reportCurrency);
      const result = await uploadFileToDrive(filename, content, 'text/csv');
      
      if (result.success) {
        setDriveUploadResult({ 
          success: true, 
          message: `Uploaded to Drive: ${result.fileName}`,
          link: result.webViewLink 
        });
      } else {
        setDriveUploadResult({ success: false, message: result.error || 'Upload failed' });
      }
    } catch (error) {
      setDriveUploadResult({ success: false, message: error.message });
    }

    setIsUploadingToDrive(false);
    setTimeout(() => setDriveUploadResult(null), 5000);
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
          className={`p-2 -ml-2 rounded-full transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
        >
          <svg className={`w-6 h-6 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className={`text-xl font-bold ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Reports & Charts</h1>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker
        startDate={dateRange.start}
        endDate={dateRange.end}
        onDateChange={handleDateChange}
        onPresetSelect={handlePresetSelect}
      />

      {/* Currency Conversion Toggle - Show if multiple currencies or single currency differs from report currency */}
      {(hasMultipleCurrencies || singleCurrencyDiffersFromReport) && (
        <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">💱</span>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {hasMultipleCurrencies ? 'Multi-Currency Report' : 'Currency Conversion'}
                </p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {hasMultipleCurrencies 
                    ? `${usedCurrencies.length} currencies detected in this period`
                    : `Transactions in ${usedCurrencies[0]} (your home: ${nativeCurrency})`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => setConvertToNative(!convertToNative)}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                convertToNative ? 'bg-primary-600' : isDark ? 'bg-slate-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
                convertToNative ? 'right-1' : 'left-1'
              }`} />
            </button>
          </div>
          
          {convertToNative && (
            <div className={`flex flex-wrap items-center gap-2 p-3 rounded-xl ${
              isDark ? 'bg-slate-700' : 'bg-gray-50'
            }`}>
              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                Convert all to:
              </span>
              <div className="relative" ref={currencyPickerRef}>
                <button
                  onClick={() => {
                    setShowCurrencyPicker(!showCurrencyPicker);
                    setCurrencySearch('');
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                    isDark ? 'bg-slate-600 hover:bg-slate-500' : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span>{currencies[selectedReportCurrency]?.flag}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedReportCurrency}
                  </span>
                  <svg className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showCurrencyPicker && (
                  <div className={`absolute z-10 mt-1 w-64 rounded-xl shadow-lg overflow-hidden ${
                    isDark ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-gray-200'
                  }`}>
                    {/* Search Input */}
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Search currency..."
                        value={currencySearch}
                        onChange={(e) => setCurrencySearch(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg text-sm ${
                          isDark 
                            ? 'bg-slate-600 text-white placeholder-slate-400 border-slate-500' 
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {Object.values(currencies)
                        .filter(c => 
                          c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
                          c.code.toLowerCase().includes(currencySearch.toLowerCase())
                        )
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(curr => (
                          <button
                            key={curr.code}
                            onClick={() => {
                              setSelectedReportCurrency(curr.code);
                              setShowCurrencyPicker(false);
                              setCurrencySearch('');
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                              selectedReportCurrency === curr.code
                                ? 'bg-primary-500 text-white'
                                : isDark 
                                  ? 'hover:bg-slate-600 text-slate-200' 
                                  : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <span className="text-lg">{curr.flag}</span>
                            <span className="font-medium">{curr.code}</span>
                            <span className={`text-xs ${
                              selectedReportCurrency === curr.code 
                                ? 'opacity-75' 
                                : isDark ? 'text-slate-400' : 'text-gray-500'
                            }`}>{curr.name}</span>
                          </button>
                        ))}
                      {Object.values(currencies).filter(c => 
                        c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
                        c.code.toLowerCase().includes(currencySearch.toLowerCase())
                      ).length === 0 && (
                        <p className={`px-3 py-4 text-sm text-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          No currencies found
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1 ml-auto">
                {usedCurrencies.map(code => (
                  <span 
                    key={code}
                    className={`px-2 py-0.5 rounded text-xs ${
                      isDark ? 'bg-slate-600 text-slate-300' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {currencies[code]?.flag} {code}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {!convertToNative && (
            <p className={`text-xs ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              ⚠️ Showing original amounts without conversion. Totals may be inaccurate with mixed currencies.
            </p>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-500 text-white rounded-2xl p-3 text-center">
          <p className="text-xs opacity-90 mb-1">Income</p>
          <p className="text-lg font-bold">{formatReportAmount(stats.totalIncome)}</p>
          <p className="text-xs opacity-75">{stats.incomeCount} txns</p>
        </div>
        <div className="bg-red-500 text-white rounded-2xl p-3 text-center">
          <p className="text-xs opacity-90 mb-1">Expenses</p>
          <p className="text-lg font-bold">{formatReportAmount(stats.totalExpenses)}</p>
          <p className="text-xs opacity-75">{stats.expenseCount} txns</p>
        </div>
        <div className={`${stats.balance >= 0 ? 'bg-primary-600' : 'bg-orange-500'} text-white rounded-2xl p-3 text-center`}>
          <p className="text-xs opacity-90 mb-1">Balance</p>
          <p className="text-lg font-bold">{formatReportAmount(stats.balance)}</p>
          <p className="text-xs opacity-75">{stats.transactionCount} total</p>
        </div>
      </div>

      {/* Currency Breakdown - Show when multiple currencies and not converting */}
      {hasMultipleCurrencies && !convertToNative && (
        <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <h2 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            💰 Spending by Currency
          </h2>
          <div className="space-y-2">
            {Object.entries(currencySummary).map(([code, data]) => (
              <div 
                key={code}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  isDark ? 'bg-slate-700' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currencies[code]?.flag}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {code}
                  </span>
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    ({data.count} txns)
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-red-500 font-medium">
                    -{formatAmount(data.totalExpense, code)}
                  </p>
                  {data.totalIncome > 0 && (
                    <p className="text-green-500 text-sm">
                      +{formatAmount(data.totalIncome, code)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spending by Category */}
      <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Spending by Category</h2>
          <div className={`flex rounded-lg p-0.5 ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
            <button
              onClick={() => setCategoryChartType('pie')}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                categoryChartType === 'pie' 
                  ? isDark ? 'bg-slate-600 shadow text-primary-400' : 'bg-white shadow text-primary-600'
                  : isDark ? 'text-slate-400' : 'text-gray-600'
              }`}
            >
              Pie
            </button>
            <button
              onClick={() => setCategoryChartType('donut')}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                categoryChartType === 'donut' 
                  ? isDark ? 'bg-slate-600 shadow text-primary-400' : 'bg-white shadow text-primary-600'
                  : isDark ? 'text-slate-400' : 'text-gray-600'
              }`}
            >
              Donut
            </button>
            <button
              onClick={() => setCategoryChartType('bar')}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                categoryChartType === 'bar' 
                  ? isDark ? 'bg-slate-600 shadow text-primary-400' : 'bg-white shadow text-primary-600'
                  : isDark ? 'text-slate-400' : 'text-gray-600'
              }`}
            >
              Bar
            </button>
          </div>
        </div>
        
        {categoryChartType === 'pie' && (
          <PieChart data={categoryChartData} size={180} isDark={isDark} />
        )}
        {categoryChartType === 'donut' && (
          <DonutChart 
            data={categoryChartData} 
            size={180} 
            thickness={35}
            centerText={formatReportAmount(stats.totalExpenses)}
            isDark={isDark}
          />
        )}
        {categoryChartType === 'bar' && (
          <HorizontalBarChart data={categoryChartData} isDark={isDark} formatValue={formatReportAmount} />
        )}
      </div>

      {/* Spending by Payment Method */}
      <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>By Payment Method</h2>
          <div className={`flex rounded-lg p-0.5 ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
            <button
              onClick={() => setPaymentChartType('bar')}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                paymentChartType === 'bar' 
                  ? isDark ? 'bg-slate-600 shadow text-primary-400' : 'bg-white shadow text-primary-600'
                  : isDark ? 'text-slate-400' : 'text-gray-600'
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setPaymentChartType('pie')}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                paymentChartType === 'pie' 
                  ? isDark ? 'bg-slate-600 shadow text-primary-400' : 'bg-white shadow text-primary-600'
                  : isDark ? 'text-slate-400' : 'text-gray-600'
              }`}
            >
              Pie
            </button>
          </div>
        </div>
        
        {paymentChartType === 'bar' && (
          <HorizontalBarChart data={paymentChartData} isDark={isDark} formatValue={formatReportAmount} />
        )}
        {paymentChartType === 'pie' && (
          <PieChart data={paymentChartData} size={180} isDark={isDark} />
        )}
      </div>

      {/* Monthly Trend */}
      {monthlyChartData.length > 0 && (
        <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <h2 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Monthly Spending Trend</h2>
          <BarChart data={monthlyChartData} height={150} isDark={isDark} formatValue={formatReportAmount} />
        </div>
      )}

      {/* Top Payees */}
      {payeeChartData.length > 0 && (
        <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <h2 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Top Payees</h2>
          <HorizontalBarChart data={payeeChartData} isDark={isDark} formatValue={formatReportAmount} />
        </div>
      )}

      {/* Transaction Status */}
      {statusChartData.length > 0 && (
        <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <h2 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Transaction Status</h2>
          <div className="flex justify-center">
            <DonutChart data={statusChartData} size={150} thickness={30} isDark={isDark} />
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {statusChartData.map((item, index) => (
              <div key={item.label} className="text-center">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.value}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Breakdown Table */}
      <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <h2 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Category Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-600' : 'border-gray-200'}`}>
                <th className={`text-left py-2 font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Category</th>
                <th className={`text-right py-2 font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Amount</th>
                <th className={`text-right py-2 font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>%</th>
              </tr>
            </thead>
            <tbody>
              {categoryChartData.map((item, index) => (
                <tr key={item.label} className={`border-b ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
                  <td className={`py-2 ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>{item.label}</td>
                  <td className={`py-2 text-right font-medium ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
                    {formatReportAmount(item.value)}
                  </td>
                  <td className={`py-2 text-right ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {stats.totalExpenses > 0 
                      ? ((item.value / stats.totalExpenses) * 100).toFixed(1) 
                      : 0}%
                  </td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className={`py-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Total</td>
                <td className={`py-2 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatReportAmount(stats.totalExpenses)}
                </td>
                <td className={`py-2 text-right ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Yearly Comparison */}
      {yearlyComparisonData.length > 0 && (
        <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <h2 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>📅 Year-wise Report</h2>
          
          {/* Yearly Bar Chart */}
          <div className="mb-6">
            <h3 className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Yearly Expenses</h3>
            <BarChart data={yearlyExpenseData} height={120} isDark={isDark} formatValue={formatReportAmount} />
          </div>

          {/* Yearly Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-slate-600' : 'border-gray-200'}`}>
                  <th className={`text-left py-2 font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Year</th>
                  <th className={`text-right py-2 font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Income</th>
                  <th className={`text-right py-2 font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Expenses</th>
                  <th className={`text-right py-2 font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {yearlyComparisonData.map((item) => (
                  <tr key={item.year} className={`border-b ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
                    <td className={`py-2 font-medium ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>{item.year}</td>
                    <td className={`py-2 text-right ${isDark ? 'text-green-400' : 'text-green-500'}`}>
                      {formatReportAmount(item.income)}
                    </td>
                    <td className={`py-2 text-right ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                      {formatReportAmount(item.expenses)}
                    </td>
                    <td className={`py-2 text-right font-medium ${item.balance >= 0 ? (isDark ? 'text-green-400' : 'text-green-500') : (isDark ? 'text-red-400' : 'text-red-500')}`}>
                      {formatReportAmount(item.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <h2 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>📥 Export Report</h2>
        
        {/* Download Section */}
        <div className="space-y-2 mb-4">
          <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>💾 Download to Device</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportCSV}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl font-medium text-sm transition-colors ${
                isDark 
                  ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' 
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Transactions
            </button>
            
            <button
              onClick={handleExportSummary}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl font-medium text-sm transition-colors ${
                isDark 
                  ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' 
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Summary
            </button>
          </div>
        </div>

        {/* Google Drive Upload Section */}
        {driveConnected && (
          <div className="space-y-2 mb-4">
            <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>☁️ Upload to Google Drive</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleUploadTransactionsToDrive}
                disabled={isUploadingToDrive || filteredTransactions.length === 0}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 ${
                  isDark 
                    ? 'bg-slate-700 text-white hover:bg-slate-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isUploadingToDrive ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
                Transactions
              </button>
              
              <button
                onClick={handleUploadSummaryToDrive}
                disabled={isUploadingToDrive}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 ${
                  isDark 
                    ? 'bg-slate-700 text-white hover:bg-slate-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isUploadingToDrive ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
                Summary
              </button>
            </div>
            
            {/* Drive Upload Result */}
            {driveUploadResult && (
              <div className={`p-2 rounded-lg text-xs ${
                driveUploadResult.success 
                  ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'
                  : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700'
              }`}>
                {driveUploadResult.success ? '✅' : '❌'} {driveUploadResult.message}
              </div>
            )}
          </div>
        )}
        
        {/* PDF Export Options */}
        <div className={`border rounded-xl overflow-hidden ${isDark ? 'border-slate-600' : 'border-gray-200'}`}>
          <button
            onClick={() => handleExportPDF(false)}
            className={`flex items-center justify-center gap-2 p-3 font-medium transition-colors w-full ${
              isDark 
                ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Print / Save as PDF
          </button>
          
          {transactionsWithInvoices > 0 && (
            <button
              onClick={() => handleExportPDF(true)}
              className={`flex items-center justify-center gap-2 p-3 font-medium transition-colors w-full border-t ${
                isDark 
                  ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50 border-slate-600' 
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              PDF with Invoices ({transactionsWithInvoices} attached)
            </button>
          )}
        </div>

        <p className={`text-xs mt-3 text-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          {driveConnected 
            ? 'Reports uploaded to Drive are saved in "Expense_Manager_Reports" folder'
            : 'Connect Google Drive in Settings to upload reports directly'
          }
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
