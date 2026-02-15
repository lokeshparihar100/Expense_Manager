import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getTransactions, 
  saveTransactions, 
  getTags, 
  saveTags, 
  generateId 
} from '../utils/storage';

const ExpenseContext = createContext();

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [tags, setTags] = useState({
    payees: [],
    categories: [],
    paymentMethods: [],
    statuses: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = () => {
      const savedTransactions = getTransactions();
      const savedTags = getTags();
      setTransactions(savedTransactions);
      setTags(savedTags);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Add new transaction
  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
    return newTransaction;
  };

  // Update existing transaction
  const updateTransaction = (id, updates) => {
    const updatedTransactions = transactions.map(t => 
      t.id === id 
        ? { ...t, ...updates, updatedAt: new Date().toISOString() }
        : t
    );
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
  };

  // Delete transaction
  const deleteTransaction = (id) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
  };

  // Get transaction by ID
  const getTransactionById = (id) => {
    return transactions.find(t => t.id === id);
  };

  // Get transactions filtered by account
  const getTransactionsByAccount = (accountId) => {
    if (!accountId) return transactions;
    return transactions.filter(t => t.accountId === accountId);
  };

  // Add new tag to a category (with icon support)
  const addTag = (category, tagName, icon = '📦') => {
    const tagExists = tags[category].some(t => t.name === tagName);
    if (!tagExists) {
      const newTag = { name: tagName, icon };
      const updatedTags = {
        ...tags,
        [category]: [...tags[category], newTag]
      };
      setTags(updatedTags);
      saveTags(updatedTags);
    }
  };

  // Update tag in a category (with icon support)
  const updateTag = (category, oldTagName, newTagName, newIcon = null) => {
    const updatedTags = {
      ...tags,
      [category]: tags[category].map(t => {
        if (t.name === oldTagName) {
          return { 
            name: newTagName, 
            icon: newIcon !== null ? newIcon : t.icon 
          };
        }
        return t;
      })
    };
    setTags(updatedTags);
    saveTags(updatedTags);

    // Also update all transactions using this tag
    const fieldMap = {
      payees: 'payee',
      categories: 'category',
      paymentMethods: 'paymentMethod',
      statuses: 'status'
    };
    const field = fieldMap[category];
    const updatedTransactions = transactions.map(t => 
      t[field] === oldTagName ? { ...t, [field]: newTagName } : t
    );
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
  };

  // Delete tag from a category
  const deleteTag = (category, tagName) => {
    const updatedTags = {
      ...tags,
      [category]: tags[category].filter(t => t.name !== tagName)
    };
    setTags(updatedTags);
    saveTags(updatedTags);
  };

  // Get tag icon by name
  const getTagIcon = (category, tagName) => {
    const tag = tags[category]?.find(t => t.name === tagName);
    return tag?.icon || '📦';
  };

  // Get statistics with optional currency conversion and account filtering
  const getStats = (period = 'all', targetCurrency = null, exchangeRates = null, accountId = null) => {
    let filteredTransactions = [...transactions];

    // Filter by account if specified
    if (accountId) {
      filteredTransactions = filteredTransactions.filter(t => t.accountId === accountId);
    }

    const now = new Date();
    if (period === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filteredTransactions = filteredTransactions.filter(t => t.date === today);
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= weekAgo);
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= monthAgo);
    }

    // Helper to convert amount if needed
    const convertAmount = (amount, fromCurrency) => {
      if (!targetCurrency || !exchangeRates || fromCurrency === targetCurrency) {
        return parseFloat(amount) || 0;
      }
      const fromRate = exchangeRates[fromCurrency] || 1;
      const toRate = exchangeRates[targetCurrency] || 1;
      const amountInUSD = (parseFloat(amount) || 0) / fromRate;
      return amountInUSD * toRate;
    };

    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + convertAmount(t.amount, t.currency || 'USD'), 0);

    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + convertAmount(t.amount, t.currency || 'USD'), 0);

    const byCategory = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + convertAmount(t.amount, t.currency || 'USD');
        return acc;
      }, {});

    const byPaymentMethod = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + convertAmount(t.amount, t.currency || 'USD');
        return acc;
      }, {});

    // Get unique currencies used
    const currenciesUsed = [...new Set(filteredTransactions.map(t => t.currency || 'USD'))];

    return {
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses,
      byCategory,
      byPaymentMethod,
      transactionCount: filteredTransactions.length,
      currenciesUsed,
      displayCurrency: targetCurrency
    };
  };

  const value = {
    transactions,
    tags,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    getTransactionsByAccount,
    addTag,
    updateTag,
    deleteTag,
    getTagIcon,
    getStats
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

export default ExpenseContext;
