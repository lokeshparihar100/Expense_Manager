// Backup and Restore utilities for Expense Manager

import { STORAGE_KEYS } from './storage';

// Current backup version - increment when backup format changes
const BACKUP_VERSION = '1.1';

// Currency storage keys
const CURRENCY_STORAGE_KEY = 'expense_manager_currency_settings';
const EXCHANGE_RATES_KEY = 'expense_manager_exchange_rates';

/**
 * Create a complete backup of all app data
 * @returns {Object} Backup data object
 */
export const createBackup = () => {
  const now = new Date();
  
  // Get all data from localStorage
  const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
  const tags = JSON.parse(localStorage.getItem(STORAGE_KEYS.TAGS) || '{}');
  const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
  const currencySettings = JSON.parse(localStorage.getItem(CURRENCY_STORAGE_KEY) || '{}');
  const exchangeRates = JSON.parse(localStorage.getItem(EXCHANGE_RATES_KEY) || '{}');

  // Get currencies used in transactions
  const currenciesUsed = [...new Set(transactions.map(t => t.currency || 'USD'))];

  // Create backup object
  const backup = {
    // Metadata
    meta: {
      version: BACKUP_VERSION,
      appName: 'Daily Expense Manager',
      createdAt: now.toISOString(),
      createdAtFormatted: now.toLocaleString(),
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      }
    },
    
    // Statistics for verification
    stats: {
      totalTransactions: transactions.length,
      totalExpenses: transactions.filter(t => t.type === 'expense').length,
      totalIncome: transactions.filter(t => t.type === 'income').length,
      transactionsWithInvoices: transactions.filter(t => t.invoiceImages && t.invoiceImages.length > 0).length,
      totalInvoiceImages: transactions.reduce((sum, t) => sum + (t.invoiceImages?.length || 0), 0),
      tagsCount: {
        payees: tags.payees?.length || 0,
        categories: tags.categories?.length || 0,
        paymentMethods: tags.paymentMethods?.length || 0,
        statuses: tags.statuses?.length || 0
      },
      currenciesUsed: currenciesUsed,
      dateRange: transactions.length > 0 ? {
        oldest: transactions.reduce((min, t) => t.date < min ? t.date : min, transactions[0]?.date),
        newest: transactions.reduce((max, t) => t.date > max ? t.date : max, transactions[0]?.date)
      } : null
    },

    // Primary data - Transactions (highest priority)
    transactions: transactions,

    // Secondary data - Tags with icons
    tags: tags,

    // Optional - Settings
    settings: settings,

    // Currency settings
    currencySettings: currencySettings,
    exchangeRates: exchangeRates
  };

  return backup;
};

/**
 * Export backup as JSON file download
 */
export const exportBackup = () => {
  try {
    const backup = createBackup();
    const backupJson = JSON.stringify(backup, null, 2);
    
    // Create filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `expense_manager_backup_${date}.json`;
    
    // Create blob and download
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, stats: backup.stats, filename };
  } catch (error) {
    console.error('Backup export failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Validate backup file structure
 * @param {Object} data - Parsed backup data
 * @returns {Object} Validation result
 */
export const validateBackup = (data) => {
  const errors = [];
  const warnings = [];

  // Check if it's a valid object
  if (!data || typeof data !== 'object') {
    errors.push('Invalid backup file format');
    return { valid: false, errors, warnings };
  }

  // Check for required fields
  if (!data.transactions) {
    errors.push('Missing transactions data');
  } else if (!Array.isArray(data.transactions)) {
    errors.push('Transactions data is not an array');
  }

  // Check meta information
  if (!data.meta) {
    warnings.push('Missing metadata - backup might be from an older version');
  } else {
    if (data.meta.version !== BACKUP_VERSION) {
      warnings.push(`Backup version (${data.meta.version}) differs from current (${BACKUP_VERSION})`);
    }
  }

  // Check tags
  if (!data.tags) {
    warnings.push('Missing tags data - default tags will be used');
  }

  // Validate transaction structure (sample check)
  if (data.transactions && data.transactions.length > 0) {
    const sample = data.transactions[0];
    const requiredFields = ['id', 'type', 'amount', 'date'];
    const missingFields = requiredFields.filter(f => !(f in sample));
    if (missingFields.length > 0) {
      warnings.push(`Some transactions may be missing fields: ${missingFields.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: data.stats || null
  };
};

/**
 * Import backup data
 * @param {Object} data - Backup data to import
 * @param {Object} options - Import options
 * @returns {Object} Import result
 */
export const importBackup = (data, options = {}) => {
  const {
    replaceAll = true,        // Replace all existing data
    mergeTransactions = false, // Merge with existing (if replaceAll is false)
    importTags = true,         // Import tags
    importSettings = true      // Import settings
  } = options;

  try {
    // Validate backup first
    const validation = validateBackup(data);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const results = {
      transactionsImported: 0,
      transactionsSkipped: 0,
      tagsImported: false,
      settingsImported: false,
      currencySettingsImported: false,
      exchangeRatesImported: false
    };

    // Import transactions
    if (data.transactions && Array.isArray(data.transactions)) {
      if (replaceAll) {
        // Replace all transactions
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
        results.transactionsImported = data.transactions.length;
      } else if (mergeTransactions) {
        // Merge with existing
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
        const existingIds = new Set(existing.map(t => t.id));
        
        const newTransactions = data.transactions.filter(t => !existingIds.has(t.id));
        const merged = [...existing, ...newTransactions];
        
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(merged));
        results.transactionsImported = newTransactions.length;
        results.transactionsSkipped = data.transactions.length - newTransactions.length;
      }
    }

    // Import tags
    if (importTags && data.tags) {
      if (replaceAll) {
        localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(data.tags));
        results.tagsImported = true;
      } else {
        // Merge tags
        const existingTags = JSON.parse(localStorage.getItem(STORAGE_KEYS.TAGS) || '{}');
        const mergedTags = { ...existingTags };
        
        for (const [category, tagList] of Object.entries(data.tags)) {
          if (!mergedTags[category]) {
            mergedTags[category] = tagList;
          } else {
            // Merge tag lists, avoiding duplicates by name
            const existingNames = new Set(mergedTags[category].map(t => t.name || t));
            const newTags = tagList.filter(t => !existingNames.has(t.name || t));
            mergedTags[category] = [...mergedTags[category], ...newTags];
          }
        }
        
        localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(mergedTags));
        results.tagsImported = true;
      }
    }

    // Import settings
    if (importSettings && data.settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      results.settingsImported = true;
    }

    // Import currency settings
    if (importSettings && data.currencySettings) {
      localStorage.setItem(CURRENCY_STORAGE_KEY, JSON.stringify(data.currencySettings));
      results.currencySettingsImported = true;
    }

    // Import exchange rates
    if (importSettings && data.exchangeRates) {
      localStorage.setItem(EXCHANGE_RATES_KEY, JSON.stringify(data.exchangeRates));
      results.exchangeRatesImported = true;
    }

    return {
      success: true,
      results,
      warnings: validation.warnings
    };
  } catch (error) {
    console.error('Backup import failed:', error);
    return { success: false, errors: [error.message] };
  }
};

/**
 * Read and parse backup file
 * @param {File} file - File object from input
 * @returns {Promise<Object>} Parsed backup data
 */
export const readBackupFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (!file.name.endsWith('.json')) {
      reject(new Error('Please select a JSON backup file'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file - could not parse backup'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Get current data statistics (without creating full backup)
 */
export const getCurrentStats = () => {
  const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
  const tags = JSON.parse(localStorage.getItem(STORAGE_KEYS.TAGS) || '{}');

  return {
    totalTransactions: transactions.length,
    totalExpenses: transactions.filter(t => t.type === 'expense').length,
    totalIncome: transactions.filter(t => t.type === 'income').length,
    transactionsWithInvoices: transactions.filter(t => t.invoiceImages && t.invoiceImages.length > 0).length,
    tagsCount: {
      payees: tags.payees?.length || 0,
      categories: tags.categories?.length || 0,
      paymentMethods: tags.paymentMethods?.length || 0,
      statuses: tags.statuses?.length || 0
    }
  };
};

/**
 * Clear all app data (use with caution)
 */
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.TAGS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(CURRENCY_STORAGE_KEY);
  localStorage.removeItem(EXCHANGE_RATES_KEY);
};

export default {
  createBackup,
  exportBackup,
  validateBackup,
  importBackup,
  readBackupFile,
  getCurrentStats,
  clearAllData,
  BACKUP_VERSION
};
