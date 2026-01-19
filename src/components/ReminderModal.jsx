import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const ReminderModal = ({ reminders, onClose, onDismiss, onMarkDone }) => {
  const navigate = useNavigate();
  const { formatAmount, hideAmounts, isDark } = useSettings();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!reminders || reminders.length === 0) return null;

  const currentReminder = reminders[currentIndex];
  const isExpense = currentReminder.type === 'expense';
  const totalReminders = reminders.length;

  const handleNext = () => {
    if (currentIndex < totalReminders - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handleDismiss = () => {
    onDismiss(currentReminder.id);
    handleNext();
  };

  const handleMarkDone = () => {
    onMarkDone(currentReminder.id);
    handleNext();
  };

  const getDaysUntil = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date + 'T12:00:00');
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntil(currentReminder.date);
  
  const getUrgencyColor = () => {
    if (daysUntil <= 0) return 'bg-red-500';
    if (daysUntil <= 1) return 'bg-orange-500';
    if (daysUntil <= 3) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getUrgencyText = () => {
    if (daysUntil < 0) return `${Math.abs(daysUntil)} day(s) overdue!`;
    if (daysUntil === 0) return 'Due today!';
    if (daysUntil === 1) return 'Due tomorrow';
    return `Due in ${daysUntil} days`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`rounded-2xl shadow-xl w-full max-w-md overflow-hidden slide-up ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className={`${getUrgencyColor()} text-white p-4`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔔</span>
              <span className="font-semibold">Payment Reminder</span>
            </div>
            <span className="text-sm opacity-90">
              {currentIndex + 1} of {totalReminders}
            </span>
          </div>
          <p className="text-sm opacity-90">{getUrgencyText()}</p>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Transaction Type Badge */}
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isExpense 
                ? isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
                : isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
            }`}>
              {isExpense ? '💸 Upcoming Expense' : '💰 Expected Income'}
            </span>
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {new Date(currentReminder.date + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>

          {/* Amount */}
          <div className={`text-center py-4 rounded-xl mb-4 ${
            isExpense 
              ? isDark ? 'bg-red-900/30' : 'bg-red-50'
              : isDark ? 'bg-green-900/30' : 'bg-green-50'
          }`}>
            <p className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Amount {currentReminder.currency && `(${currentReminder.currency})`}
            </p>
            <p className={`text-3xl font-bold ${
              isExpense 
                ? isDark ? 'text-red-400' : 'text-red-600'
                : isDark ? 'text-green-400' : 'text-green-600'
            } ${hideAmounts ? 'blur-md select-none' : ''}`}>
              {isExpense ? '-' : '+'}{formatAmount(currentReminder.amount, currentReminder.currency)}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <span className={`w-6 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>📝</span>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Description</p>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentReminder.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`w-6 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>📁</span>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Category</p>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentReminder.category}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`w-6 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>👤</span>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Payee</p>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentReminder.payee}</p>
              </div>
            </div>

            {currentReminder.notes && (
              <div className="flex items-center gap-3">
                <span className={`w-6 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>💬</span>
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Notes</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentReminder.notes}</p>
                </div>
              </div>
            )}

            {currentReminder.reminderType === 'specific_date' && currentReminder.reminderDate && (
              <div className="flex items-center gap-3">
                <span className={`w-6 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>🔔</span>
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Reminder Set For</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(currentReminder.reminderDate + 'T12:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={handleMarkDone}
              className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mark as Done
            </button>
            <button
              onClick={() => navigate(`/edit/${currentReminder.id}`)}
              className="flex items-center justify-center gap-2 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDismiss}
              className={`py-3 rounded-xl font-medium transition-colors ${
                isDark 
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Remind Later
            </button>
            <button
              onClick={handleNext}
              className={`py-3 rounded-xl font-medium transition-colors ${
                isDark 
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {currentIndex < totalReminders - 1 ? 'Next →' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
