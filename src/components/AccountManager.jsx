import React, { useState } from 'react';
import { useAccount } from '../context/AccountContext';
import { useSettings } from '../context/SettingsContext';

const AccountManager = ({ onClose }) => {
  const { accounts, addAccount, updateAccount, deleteAccount, activeAccountId } = useAccount();
  const { isDark } = useSettings();

  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '💰',
    color: '#3b82f6'
  });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  // Predefined icons for accounts
  const accountIcons = [
    '💰', '💵', '💳', '🏦', '💼', '👜', '🎒',
    '✈️', '🏠', '🚗', '🛒', '🎓', '💊', '🎮',
    '📱', '💡', '🍔', '☕', '🎬', '🏋️', '📚'
  ];

  // Predefined colors
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
  ];

  const resetForm = () => {
    setFormData({ name: '', icon: '💰', color: '#3b82f6' });
    setEditingAccount(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      icon: account.icon,
      color: account.color
    });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Account name is required');
      return;
    }

    if (editingAccount) {
      // Update existing account
      updateAccount(editingAccount.id, formData);
    } else {
      // Add new account
      addAccount(formData);
    }

    resetForm();
  };

  const handleDelete = (accountId) => {
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      const result = deleteAccount(accountId);
      if (!result.success) {
        setError(result.error);
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[101] flex items-start justify-center pt-16 pb-4 px-4 overflow-y-auto pointer-events-none">
        {/* Modal */}
        <div
          className={`relative w-full max-w-2xl rounded-2xl shadow-2xl my-8 flex flex-col max-h-[calc(100vh-8rem)] pointer-events-auto ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}
        >
        {/* Header */}
        <div className={`flex-shrink-0 p-4 border-b flex items-center justify-between rounded-t-2xl ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Manage Accounts
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto min-h-0">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Add Account Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed transition-colors mb-4 ${
                isDark
                  ? 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50 text-slate-300'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-medium">Add New Account</span>
            </button>
          )}

          {/* Add/Edit Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className={`p-4 rounded-xl border mb-4 ${
              isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingAccount ? 'Edit Account' : 'New Account'}
              </h3>

              {/* Account Name */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Account Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Trip to Paris, Emergency Fund"
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500 focus:border-primary-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
                  required
                />
              </div>

              {/* Icon Selection */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Icon
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {accountIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`p-3 text-2xl rounded-lg transition-all ${
                        formData.icon === icon
                          ? 'bg-primary-500 scale-110 shadow-md'
                          : isDark
                          ? 'bg-slate-600 hover:bg-slate-500'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`h-10 rounded-lg transition-all ${
                        formData.color === color ? 'ring-4 ring-offset-2 ring-offset-slate-800 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'bg-slate-600 hover:bg-slate-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingAccount ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          )}

          {/* Existing Accounts List */}
          <div className="space-y-3">
            <h3 className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              YOUR ACCOUNTS ({accounts.length})
            </h3>
            {accounts.map((account) => {
              const isActive = account.id === activeAccountId;
              return (
                <div
                  key={account.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    isDark
                      ? 'bg-slate-700/50 border-slate-600'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: account.color + '40' }}
                    >
                      {account.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {account.name}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {account.isDefault && 'Default account'}
                        {isActive && !account.isDefault && 'Active account'}
                        {!isActive && !account.isDefault && ' '}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(account)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark
                            ? 'hover:bg-slate-600 text-slate-300'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title="Edit account"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {!account.isDefault && (
                        <button
                          onClick={() => handleDelete(account.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark
                              ? 'hover:bg-red-900/30 text-red-400'
                              : 'hover:bg-red-50 text-red-600'
                          }`}
                          title="Delete account"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default AccountManager;
