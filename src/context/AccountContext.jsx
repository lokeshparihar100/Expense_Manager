import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAccounts,
  saveAccounts,
  getActiveAccountId,
  saveActiveAccountId,
  getAccountById,
  generateId,
  getTransactions,
  saveTransactions
} from '../utils/storage';
import { migrateLocalStorageToV2 } from '../utils/backup';

const AccountContext = createContext();

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};

export const AccountProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [activeAccountId, setActiveAccountId] = useState('default');
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount and run migration if needed
  useEffect(() => {
    const loadData = async () => {
      // Run migration first (will only run once for existing users)
      const migrationResult = migrateLocalStorageToV2();
      if (migrationResult.success && !migrationResult.alreadyMigrated) {
        console.log('Data migrated to v2.0:', migrationResult.message);
      }

      // Load accounts and active account
      const savedAccounts = getAccounts();
      const savedActiveAccountId = getActiveAccountId();

      setAccounts(savedAccounts);
      setActiveAccountId(savedActiveAccountId);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Get active account object
  const getActiveAccount = () => {
    return accounts.find(acc => acc.id === activeAccountId);
  };

  // Switch active account
  const switchAccount = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (account) {
      setActiveAccountId(accountId);
      saveActiveAccountId(accountId);
      return true;
    }
    return false;
  };

  // Add new account
  const addAccount = (accountData) => {
    const newAccount = {
      id: generateId(),
      name: accountData.name,
      icon: accountData.icon || '💰',
      color: accountData.color || '#3b82f6',
      isDefault: false,
      createdAt: new Date().toISOString()
    };
    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    saveAccounts(updatedAccounts);
    return newAccount;
  };

  // Update existing account
  const updateAccount = (id, updates) => {
    const updatedAccounts = accounts.map(acc =>
      acc.id === id
        ? { ...acc, ...updates, updatedAt: new Date().toISOString() }
        : acc
    );
    setAccounts(updatedAccounts);
    saveAccounts(updatedAccounts);
  };

  // Delete account (cannot delete default account or active account)
  const deleteAccount = (id) => {
    const account = accounts.find(acc => acc.id === id);

    // Prevent deletion of default account
    if (account?.isDefault) {
      return { success: false, error: 'Cannot delete default account' };
    }

    // Prevent deletion of active account
    if (id === activeAccountId) {
      return { success: false, error: 'Cannot delete active account. Switch to another account first.' };
    }

    // Delete the account
    const updatedAccounts = accounts.filter(acc => acc.id !== id);
    setAccounts(updatedAccounts);
    saveAccounts(updatedAccounts);

    // Also delete all transactions associated with this account
    const allTransactions = getTransactions();
    const filteredTransactions = allTransactions.filter(transaction => transaction.accountId !== id);
    saveTransactions(filteredTransactions);

    return { success: true };
  };

  const value = {
    accounts,
    activeAccountId,
    activeAccount: getActiveAccount(),
    isLoading,
    switchAccount,
    addAccount,
    updateAccount,
    deleteAccount,
    getAccountById: (id) => getAccountById(id)
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
};

export default AccountContext;
