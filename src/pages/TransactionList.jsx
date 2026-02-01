import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpense } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import TransactionCard from '../components/TransactionCard';
import { ConfirmModal } from '../components/Modal';
import { formatDate, sortTransactionsByDateTime } from '../utils/storage';
import { getUsedCurrencies } from '../utils/currency';

const TransactionList = () => {
  const navigate = useNavigate();
  const { transactions, tags, deleteTransaction } = useExpense();
  const { isDark, currencies } = useSettings();
  const [deleteId, setDeleteId] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    paymentMethod: 'all',
    status: 'all',
    currency: 'all',
    search: '',
    startDate: '',
    endDate: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  // Get currencies used in transactions
  const usedCurrencies = useMemo(() => getUsedCurrencies(transactions), [transactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    const filtered = transactions.filter(t => {
      if (filters.type !== 'all' && t.type !== filters.type) return false;
      if (filters.category !== 'all' && t.category !== filters.category) return false;
      if (filters.paymentMethod !== 'all' && t.paymentMethod !== filters.paymentMethod) return false;
      if (filters.status !== 'all' && t.status !== filters.status) return false;
      if (filters.currency !== 'all' && (t.currency || 'USD') !== filters.currency) return false;
      if (filters.search && !t.description.toLowerCase().includes(filters.search.toLowerCase()) &&
          !t.payee.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.startDate && new Date(t.date) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(t.date) > new Date(filters.endDate)) return false;
      return true;
    });
    // Sort by date and time (most recent first)
    return sortTransactionsByDateTime(filtered);
  }, [transactions, filters]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach(t => {
      const date = formatDate(t.date);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteTransaction(deleteId);
      setDeleteId(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      category: 'all',
      paymentMethod: 'all',
      status: 'all',
      currency: 'all',
      search: '',
      startDate: '',
      endDate: ''
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'search') return value !== '';
    if (key === 'startDate' || key === 'endDate') return value !== '';
    return value !== 'all';
  });

  return (
    <div className="p-4 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          All Transactions
        </h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-xl transition-colors ${
            showFilters || hasActiveFilters 
              ? 'bg-primary-100 text-primary-600' 
              : isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
            isDark ? 'text-slate-400' : 'text-gray-400'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:border-primary-500 focus:ring-2 focus:ring-primary-200 ${
              isDark 
                ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400' 
                : 'bg-white border-gray-200'
            }`}
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className={`rounded-2xl p-4 mb-4 shadow-sm fade-in ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className={`text-sm font-medium ${isDark ? 'text-primary-400' : 'text-primary-600'}`}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Type */}
            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-200'
                }`}
              >
                <option value="all">All</option>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-200'
                }`}
              >
                <option value="all">All</option>
                {tags.categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Payment</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-200'
                }`}
              >
                <option value="all">All</option>
                {tags.paymentMethods.map(method => (
                  <option key={method.name} value={method.name}>{method.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-200'
                }`}
              >
                <option value="all">All</option>
                {tags.statuses.map(status => (
                  <option key={status.name} value={status.name}>{status.name}</option>
                ))}
              </select>
            </div>

            {/* Currency */}
            {usedCurrencies.length > 1 && (
              <div className="col-span-2">
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Currency</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterChange('currency', 'all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filters.currency === 'all'
                        ? 'bg-primary-500 text-white'
                        : isDark ? 'bg-slate-600 text-slate-200 hover:bg-slate-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {usedCurrencies.map(code => (
                    <button
                      key={code}
                      onClick={() => handleFilterChange('currency', code)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                        filters.currency === code
                          ? 'bg-primary-500 text-white'
                          : isDark ? 'bg-slate-600 text-slate-200 hover:bg-slate-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{currencies[code]?.flag}</span>
                      <span>{code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Range */}
            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>From</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-200'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>To</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-200'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className={`mb-4 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
        {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div className={`text-center py-12 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="text-4xl mb-4">🔍</div>
          <p className={`mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No transactions found</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                isDark 
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        Object.entries(groupedTransactions).map(([date, txns]) => (
          <div key={date} className="mb-4">
            <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{date}</h3>
            {txns.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ))
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
      />
    </div>
  );
};

export default TransactionList;
