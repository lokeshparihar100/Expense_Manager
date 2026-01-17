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

  // Get statistics
  const getStats = (period = 'all') => {
    let filteredTransactions = [...transactions];
    
    const now = new Date();
    if (period === 'today') {
      const today = now.toISOString().split('T')[0];
      filteredTransactions = transactions.filter(t => t.date === today);
    } else if (period === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      filteredTransactions = transactions.filter(t => new Date(t.date) >= weekAgo);
    } else if (period === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      filteredTransactions = transactions.filter(t => new Date(t.date) >= monthAgo);
    }

    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const byCategory = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
        return acc;
      }, {});

    const byPaymentMethod = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + parseFloat(t.amount);
        return acc;
      }, {});

    return {
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses,
      byCategory,
      byPaymentMethod,
      transactionCount: filteredTransactions.length
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
