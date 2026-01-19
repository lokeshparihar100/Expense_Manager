import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/storage';

const Statistics = () => {
  const navigate = useNavigate();
  const { transactions, getStats } = useExpense();
  const [period, setPeriod] = useState('month');

  const stats = getStats(period);

  // Get top categories
  const topCategories = useMemo(() => {
    return Object.entries(stats.byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [stats.byCategory]);

  // Get top payment methods
  const topPaymentMethods = useMemo(() => {
    return Object.entries(stats.byPaymentMethod)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [stats.byPaymentMethod]);

  // Calculate percentages for visualization
  const maxCategoryAmount = Math.max(...topCategories.map(([, amount]) => amount), 1);
  const maxPaymentAmount = Math.max(...topPaymentMethods.map(([, amount]) => amount), 1);

  // Colors for categories
  const categoryColors = [
    'bg-primary-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500'
  ];

  const paymentColors = [
    'bg-blue-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500'
  ];

  return (
    <div className="p-4">
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
        <h1 className="text-xl font-bold text-gray-900 ml-2">Statistics</h1>
      </div>

      {/* Period Filter */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        {['today', 'week', 'month', 'all'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              period === p
                ? 'bg-white shadow text-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-500 text-white rounded-2xl p-3 text-center">
          <p className="text-xs opacity-90 mb-1">Income</p>
          <p className="text-lg font-bold">{formatCurrency(stats.totalIncome)}</p>
        </div>
        <div className="bg-red-500 text-white rounded-2xl p-3 text-center">
          <p className="text-xs opacity-90 mb-1">Expenses</p>
          <p className="text-lg font-bold">{formatCurrency(stats.totalExpenses)}</p>
        </div>
        <div className={`${stats.balance >= 0 ? 'bg-primary-600' : 'bg-orange-500'} text-white rounded-2xl p-3 text-center`}>
          <p className="text-xs opacity-90 mb-1">Balance</p>
          <p className="text-lg font-bold">{formatCurrency(stats.balance)}</p>
        </div>
      </div>

      {/* Transaction Count */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{stats.transactionCount}</p>
          </div>
          <div className="text-4xl">📊</div>
        </div>
      </div>

      {/* Spending by Category */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Spending by Category</h2>
        {topCategories.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No expense data</p>
        ) : (
          <div className="space-y-3">
            {topCategories.map(([category, amount], index) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{category}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${categoryColors[index]} rounded-full transition-all duration-500`}
                    style={{ width: `${(amount / maxCategoryAmount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spending by Payment Method */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Spending by Payment Method</h2>
        {topPaymentMethods.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No expense data</p>
        ) : (
          <div className="space-y-3">
            {topPaymentMethods.map(([method, amount], index) => (
              <div key={method}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{method}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${paymentColors[index]} rounded-full transition-all duration-500`}
                    style={{ width: `${(amount / maxPaymentAmount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Breakdown (Pie Chart Style) */}
      {topCategories.length > 0 && (
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Category Breakdown</h2>
          <div className="flex flex-wrap gap-2">
            {topCategories.map(([category, amount], index) => {
              const percentage = ((amount / stats.totalExpenses) * 100).toFixed(1);
              return (
                <div
                  key={category}
                  className={`${categoryColors[index]} text-white px-3 py-2 rounded-xl text-sm`}
                >
                  <span className="font-medium">{category}</span>
                  <span className="ml-2 opacity-90">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Link to Full Reports */}
      <Link
        to="/reports"
        className="block bg-white rounded-2xl p-4 mb-6 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Full Reports</h3>
              <p className="text-sm text-gray-500">Detailed charts with date range filters</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>

      {/* Tips */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold mb-1">Spending Insights</h3>
            {stats.totalExpenses > stats.totalIncome ? (
              <p className="text-sm opacity-90">
                Your expenses exceed your income this period. Consider reviewing your spending habits.
              </p>
            ) : stats.totalExpenses > 0 ? (
              <p className="text-sm opacity-90">
                Great job! You're spending less than you earn. Keep up the good work!
              </p>
            ) : (
              <p className="text-sm opacity-90">
                Start tracking your expenses to get personalized insights.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
