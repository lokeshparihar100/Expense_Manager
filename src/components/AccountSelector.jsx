import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAccount } from '../context/AccountContext';
import { useSettings } from '../context/SettingsContext';
import AccountManager from './AccountManager';

// Dropdown Menu Component
const DropdownMenu = ({ isDark, accounts, activeAccountId, onSwitchAccount, onManageAccounts, onClose, buttonRect }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60]"
        onClick={onClose}
      />

      {/* Dropdown Content */}
      <div
        ref={dropdownRef}
        style={{
          position: 'fixed',
          top: `${buttonRect.bottom + 8}px`,
          right: `${window.innerWidth - buttonRect.right}px`,
        }}
        className={`w-64 rounded-xl shadow-xl border z-[70] ${
          isDark
            ? 'bg-slate-800 border-slate-700'
            : 'bg-white border-gray-200'
        }`}
      >
        <div className={`p-2 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <p className={`text-xs font-semibold px-3 py-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            SELECT ACCOUNT
          </p>
        </div>

        {/* Account List */}
        <div className="p-2 max-h-80 overflow-y-auto">
          {accounts.map((account) => {
            const isActive = account.id === activeAccountId;
            return (
              <button
                key={account.id}
                onClick={() => onSwitchAccount(account.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? isDark
                      ? 'bg-primary-600/20 text-primary-400'
                      : 'bg-primary-50 text-primary-600'
                    : isDark
                    ? 'hover:bg-slate-700 text-slate-300'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  style={{
                    backgroundColor: isActive
                      ? account.color + '40'
                      : isDark
                      ? '#334155'
                      : '#f1f5f9'
                  }}
                >
                  {account.icon}
                </span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{account.name}</div>
                  {account.isDefault && (
                    <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                      Default account
                    </div>
                  )}
                </div>
                {isActive && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Manage Accounts Button */}
        <div className={`p-2 border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <button
            onClick={onManageAccounts}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${
              isDark
                ? 'hover:bg-slate-700 text-slate-300'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="font-medium">Manage Accounts</span>
          </button>
        </div>
      </div>
    </>
  );
};

const AccountSelector = () => {
  const { accounts, activeAccountId, activeAccount, switchAccount } = useAccount();
  const { isDark } = useSettings();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [buttonRect, setButtonRect] = useState(null);
  const buttonRef = useRef(null);

  const handleSwitchAccount = (accountId) => {
    switchAccount(accountId);
    setShowDropdown(false);
  };

  const handleManageAccounts = () => {
    setShowDropdown(false);
    setShowManager(true);
  };

  const handleToggleDropdown = () => {
    if (!showDropdown && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
    setShowDropdown(!showDropdown);
  };

  return (
    <>
      {/* Account Selector Button */}
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleToggleDropdown}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
            isDark
              ? 'hover:bg-slate-700 text-slate-300'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Switch account"
        >
          <span className="text-xl">{activeAccount?.icon || '💰'}</span>
          <span className="text-sm font-medium hidden sm:inline">
            {activeAccount?.name || 'Daily Expenses'}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu - Rendered via Portal */}
        {showDropdown && buttonRect && ReactDOM.createPortal(
          <DropdownMenu
            isDark={isDark}
            accounts={accounts}
            activeAccountId={activeAccountId}
            onSwitchAccount={handleSwitchAccount}
            onManageAccounts={handleManageAccounts}
            onClose={() => setShowDropdown(false)}
            buttonRect={buttonRect}
          />,
          document.body
        )}
      </div>

      {/* Account Manager Modal - Rendered via Portal */}
      {showManager && ReactDOM.createPortal(
        <AccountManager onClose={() => setShowManager(false)} />,
        document.body
      )}
    </>
  );
};

export default AccountSelector;
