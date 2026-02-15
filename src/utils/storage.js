// Local Storage Keys
const STORAGE_KEYS = {
  TRANSACTIONS: 'expense_manager_transactions',
  TAGS: 'expense_manager_tags',
  SETTINGS: 'expense_manager_settings',
  ACCOUNTS: 'expense_manager_accounts',
  ACTIVE_ACCOUNT: 'expense_manager_active_account'
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

// Sort transactions by date and time (most recent first)
export const sortTransactionsByDateTime = (transactions) => {
  return [...transactions].sort((a, b) => {
    // Compare dates first
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    if (dateA.getTime() !== dateB.getTime()) {
      return dateB.getTime() - dateA.getTime(); // Most recent date first
    }

    // If dates are the same, compare times
    const timeA = a.time || '00:00';
    const timeB = b.time || '00:00';

    return timeB.localeCompare(timeA); // Most recent time first
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

  // Sort transactions within each date group by time (most recent first)
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => {
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeB.localeCompare(timeA);
    });
  });

  return grouped;
};

// Default accounts for new users
const DEFAULT_ACCOUNTS = [
  {
    id: 'default',
    name: 'Daily Expenses',
    icon: '💰',
    color: '#3b82f6',
    isDefault: true,
    createdAt: new Date().toISOString()
  }
];

// Get all accounts
export const getAccounts = () => {
  const accounts = getFromStorage(STORAGE_KEYS.ACCOUNTS);
  if (!accounts || accounts.length === 0) {
    saveToStorage(STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
    return DEFAULT_ACCOUNTS;
  }
  return accounts;
};

// Save all accounts
export const saveAccounts = (accounts) => {
  return saveToStorage(STORAGE_KEYS.ACCOUNTS, accounts);
};

// Get active account ID
export const getActiveAccountId = () => {
  const activeId = getFromStorage(STORAGE_KEYS.ACTIVE_ACCOUNT);
  if (!activeId) {
    // Set default account as active
    saveToStorage(STORAGE_KEYS.ACTIVE_ACCOUNT, 'default');
    return 'default';
  }
  return activeId;
};

// Save active account ID
export const saveActiveAccountId = (accountId) => {
  return saveToStorage(STORAGE_KEYS.ACTIVE_ACCOUNT, accountId);
};

// Get account by ID
export const getAccountById = (id) => {
  const accounts = getAccounts();
  return accounts.find(acc => acc.id === id);
};

export { STORAGE_KEYS, DEFAULT_TAGS, DEFAULT_ACCOUNTS };
