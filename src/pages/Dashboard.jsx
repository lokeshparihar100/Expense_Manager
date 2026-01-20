import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useExpense } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import StatCard from '../components/StatCard';
import TransactionCard from '../components/TransactionCard';
import { ConfirmModal } from '../components/Modal';
import ReminderModal from '../components/ReminderModal';
import { getUpcomingReminders, dismissForSession, getReminderSettings } from '../utils/reminders';
import { getUsedCurrencies } from '../utils/currency';

const Dashboard = () => {
  const { transactions, updateTransaction, deleteTransaction, getStats, isLoading } = useExpense();
  const { isDark, nativeCurrency, exchangeRates, currencies } = useSettings();
  const [deleteId, setDeleteId] = useState(null);
  const [period, setPeriod] = useState('month');
  const [showReminders, setShowReminders] = useState(false);
  const [upcomingReminders, setUpcomingReminders] = useState([]);

  // Check if there are multiple currencies in transactions
  const usedCurrencies = useMemo(() => getUsedCurrencies(transactions), [transactions]);
  const hasMultipleCurrencies = usedCurrencies.length > 1;
  
  // Check if conversion is needed (transaction currency differs from home currency)
  const needsConversion = useMemo(() => {
    if (hasMultipleCurrencies) return true;
    if (usedCurrencies.length === 1 && usedCurrencies[0] !== nativeCurrency) return true;
    return false;
  }, [usedCurrencies, hasMultipleCurrencies, nativeCurrency]);

  // Always get stats converted to native currency for consistent display
  // This ensures the dashboard always shows amounts in user's home currency
  const stats = useMemo(() => {
    return getStats(period, nativeCurrency, exchangeRates);
  }, [period, nativeCurrency, exchangeRates, transactions]);

  // Always display totals in native (home) currency
  const displayCurrency = nativeCurrency;
  const recentTransactions = transactions.slice(0, 5);

  // Check for reminders on component mount
  useEffect(() => {
    if (!isLoading && transactions.length > 0) {
      const settings = getReminderSettings();
      if (settings.enabled && settings.showOnStartup) {
        const reminders = getUpcomingReminders(transactions, settings);
        if (reminders.length > 0) {
          setUpcomingReminders(reminders);
          // Small delay to let the page render first
          setTimeout(() => setShowReminders(true), 500);
        }
      }
    }
  }, [isLoading, transactions]);

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteTransaction(deleteId);
      setDeleteId(null);
    }
  };

  // Handle dismissing a reminder
  const handleDismissReminder = (id) => {
    dismissForSession(id);
    setUpcomingReminders(prev => prev.filter(r => r.id !== id));
  };

  // Handle marking transaction as done
  const handleMarkDone = (id) => {
    updateTransaction(id, { status: 'Done' });
    setUpcomingReminders(prev => prev.filter(r => r.id !== id));
  };

  // Get reminder count for badge
  const reminderCount = getUpcomingReminders(transactions).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-2">
      {/* Period Filter */}
      <div className={`flex rounded-xl p-1 mb-6 ${
        isDark ? 'bg-slate-800' : 'bg-gray-100'
      }`}>
        {['today', 'week', 'month', 'all'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              period === p
                ? isDark 
                  ? 'bg-slate-700 shadow text-primary-400' 
                  : 'bg-white shadow text-primary-600'
                : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Currency conversion indicator - show when currency differs or multiple currencies */}
      {needsConversion && (
        <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 ${
          isDark ? 'bg-blue-900/30' : 'bg-blue-50'
        }`}>
          <span className="text-xl">💱</span>
          <div className="flex-1">
            <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              {hasMultipleCurrencies ? 'Multi-currency mode' : 'Currency conversion active'}
            </p>
            <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              Showing totals converted to {currencies[nativeCurrency]?.name} ({nativeCurrency})
            </p>
          </div>
          <div className="flex gap-1">
            {usedCurrencies.slice(0, 4).map(code => (
              <span 
                key={code}
                className={`text-sm ${isDark ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-700'} px-1.5 py-0.5 rounded`}
              >
                {currencies[code]?.flag}
              </span>
            ))}
            {usedCurrencies.length > 4 && (
              <span className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                +{usedCurrencies.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard 
          title="Income" 
          amount={stats.totalIncome} 
          type="income" 
          icon="💰" 
          currency={displayCurrency}
        />
        <StatCard 
          title="Expenses" 
          amount={stats.totalExpenses} 
          type="expense" 
          icon="💸" 
          currency={displayCurrency}
        />
      </div>
      
      <div className="mb-6">
        <StatCard 
          title="Balance" 
          amount={stats.balance} 
          type="balance" 
          icon="📊" 
          currency={displayCurrency}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link
          to="/add/expense"
          className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-medium transition-colors ${
            isDark 
              ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
              : 'bg-red-100 text-red-600 hover:bg-red-200'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Expense
        </Link>
        <Link
          to="/add/income"
          className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-medium transition-colors ${
            isDark 
              ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' 
              : 'bg-green-100 text-green-600 hover:bg-green-200'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Income
        </Link>
      </div>

      {/* Upcoming Reminders Banner */}
      {reminderCount > 0 && (
        <button
          onClick={() => {
            setUpcomingReminders(getUpcomingReminders(transactions));
            setShowReminders(true);
          }}
          className="w-full mb-6 p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl flex items-center justify-between hover:from-orange-600 hover:to-red-600 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div className="text-left">
              <p className="font-semibold">Upcoming Payments</p>
              <p className="text-sm opacity-90">
                {reminderCount} {reminderCount === 1 ? 'payment' : 'payments'} need your attention
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white text-red-500 w-8 h-8 rounded-full flex items-center justify-center font-bold">
              {reminderCount}
            </span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      )}

      {/* Recent Transactions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Recent Transactions
          </h2>
          <Link 
            to="/transactions" 
            className={`text-sm font-medium ${
              isDark ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'
            }`}
          >
            View All
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className={`text-center py-12 rounded-2xl ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="text-4xl mb-4">📝</div>
            <p className={`mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              No transactions yet
            </p>
            <Link
              to="/add"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              Add Your First Transaction
            </Link>
          </div>
        ) : (
          recentTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
      />

      {/* Reminder Modal */}
      {showReminders && upcomingReminders.length > 0 && (
        <ReminderModal
          reminders={upcomingReminders}
          onClose={() => setShowReminders(false)}
          onDismiss={handleDismissReminder}
          onMarkDone={handleMarkDone}
        />
      )}
    </div>
  );
};

export default Dashboard;
