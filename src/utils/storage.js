// Local Storage Keys
const STORAGE_KEYS = {
  TRANSACTIONS: 'expense_manager_transactions',
  TAGS: 'expense_manager_tags',
  SETTINGS: 'expense_manager_settings'
};

// Default tags with icons
const DEFAULT_TAGS = {
  payees: [
    { name: 'Shopkeeper', icon: '🏪' },
    { name: 'Mart', icon: '🛒' },
    { name: 'Amazon', icon: '📦' },
    { name: 'Uber', icon: '🚗' },
    { name: 'Other', icon: '👤' }
  ],
  categories: [
    { name: 'Shopping', icon: '🛍️' },
    { name: 'Food', icon: '🍔' },
    { name: 'Healthcare', icon: '🏥' },
    { name: 'Insurance', icon: '🛡️' },
    { name: 'Loan', icon: '💰' },
    { name: 'Utilities', icon: '💡' },
    { name: 'Entertainment', icon: '🎬' },
    { name: 'Transport', icon: '🚗' },
    { name: 'Salary', icon: '💵' },
    { name: 'Other', icon: '📦' }
  ],
  paymentMethods: [
    { name: 'Cash', icon: '💵' },
    { name: 'Visa Credit Card', icon: '💳' },
    { name: 'Master Credit Card', icon: '💳' },
    { name: 'UPI', icon: '📱' },
    { name: 'Bank Transfer', icon: '🏦' },
    { name: 'Debit Card', icon: '💳' },
    { name: 'Other', icon: '💰' }
  ],
  statuses: [
    { name: 'Done', icon: '✅' },
    { name: 'Pending', icon: '⏳' },
    { name: 'InFuture', icon: '📅' }
  ]
};

// Helper to normalize tags (convert old string format to new object format)
export const normalizeTag = (tag) => {
  if (typeof tag === 'string') {
    return { name: tag, icon: '📦' };
  }
  return tag;
};

// Helper to normalize all tags in a category
export const normalizeTags = (tags) => {
  const normalized = {};
  for (const [category, tagList] of Object.entries(tags)) {
    normalized[category] = tagList.map(normalizeTag);
  }
  return normalized;
};

// Get data from localStorage
export const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

// Save data to localStorage
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// Get all transactions
export const getTransactions = () => {
  return getFromStorage(STORAGE_KEYS.TRANSACTIONS) || [];
};

// Save all transactions
export const saveTransactions = (transactions) => {
  return saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
};

// Get tags (with migration from old format)
export const getTags = () => {
  const tags = getFromStorage(STORAGE_KEYS.TAGS);
  if (!tags) {
    saveToStorage(STORAGE_KEYS.TAGS, DEFAULT_TAGS);
    return DEFAULT_TAGS;
  }
  // Migrate old format to new format if needed
  const normalized = normalizeTags(tags);
  // Save normalized version if it was migrated
  if (JSON.stringify(tags) !== JSON.stringify(normalized)) {
    saveToStorage(STORAGE_KEYS.TAGS, normalized);
  }
  return normalized;
};

// Save tags
export const saveTags = (tags) => {
  return saveToStorage(STORAGE_KEYS.TAGS, tags);
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format date for display (handles YYYY-MM-DD strings correctly)
export const formatDate = (dateString) => {
  // Add time component to prevent timezone shift
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format date for input (YYYY-MM-DD in local timezone)
export const formatDateForInput = (dateString) => {
  const date = new Date(dateString + 'T12:00:00');
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get today's date formatted for input (YYYY-MM-DD in local timezone)
export const getTodayForInput = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get current time formatted for input (HH:MM in local timezone)
export const getCurrentTimeForInput = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Calculate totals
export const calculateTotals = (transactions) => {
  return transactions.reduce((acc, t) => {
    if (t.type === 'expense') {
      acc.totalExpenses += parseFloat(t.amount);
    } else {
      acc.totalIncome += parseFloat(t.amount);
    }
    return acc;
  }, { totalExpenses: 0, totalIncome: 0 });
};

// Filter transactions by date range
export const filterByDateRange = (transactions, startDate, endDate) => {
  return transactions.filter(t => {
    const date = new Date(t.date);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });
};

// Group transactions by date
export const groupByDate = (transactions) => {
  const grouped = {};
  transactions.forEach(t => {
    const date = formatDate(t.date);
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(t);
  });
  return grouped;
};

export { STORAGE_KEYS, DEFAULT_TAGS };
