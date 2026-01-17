// Currency utilities for multi-currency support

const CURRENCY_STORAGE_KEY = 'expense_manager_currency_settings';
const EXCHANGE_RATES_KEY = 'expense_manager_exchange_rates';

// Popular currencies with symbols and names
export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  CHF: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', flag: '🇨🇭' },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', flag: '🇳🇿' },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', flag: '🇸🇪' },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', flag: '🇳🇴' },
  MXN: { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', flag: '🇲🇽' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷' },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', flag: '🇷🇺' },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  SAR: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: '🇸🇦' },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: '🇹🇭' },
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', flag: '🇲🇾' },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', flag: '🇮🇩' },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', flag: '🇵🇭' },
  VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', flag: '🇻🇳' },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷' },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', flag: '🇵🇱' },
  CZK: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', flag: '🇨🇿' },
  HUF: { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', flag: '🇭🇺' },
  ILS: { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', flag: '🇮🇱' },
  PKR: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', flag: '🇵🇰' },
  BDT: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', flag: '🇧🇩' },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
  EGP: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', flag: '🇪🇬' },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪' },
};

// Default exchange rates (relative to USD) - approximate values
// Users should update these for accuracy
export const DEFAULT_EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CNY: 7.24,
  INR: 83.12,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  KRW: 1320,
  SGD: 1.34,
  HKD: 7.82,
  NZD: 1.64,
  SEK: 10.42,
  NOK: 10.65,
  MXN: 17.15,
  BRL: 4.97,
  RUB: 89.50,
  ZAR: 18.65,
  AED: 3.67,
  SAR: 3.75,
  THB: 35.50,
  MYR: 4.72,
  IDR: 15650,
  PHP: 56.20,
  VND: 24500,
  TRY: 32.50,
  PLN: 4.02,
  CZK: 22.85,
  HUF: 355,
  ILS: 3.72,
  PKR: 278,
  BDT: 110,
  NGN: 1550,
  EGP: 30.90,
  KES: 153,
};

// Get currency settings
export const getCurrencySettings = () => {
  try {
    const settings = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (settings) {
      return JSON.parse(settings);
    }
  } catch (e) {
    console.error('Failed to load currency settings:', e);
  }
  return {
    defaultCurrency: 'USD',
    reportCurrency: 'USD',
    lastUpdated: null
  };
};

// Save currency settings
export const saveCurrencySettings = (settings) => {
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save currency settings:', e);
  }
};

// Get exchange rates
export const getExchangeRates = () => {
  try {
    const rates = localStorage.getItem(EXCHANGE_RATES_KEY);
    if (rates) {
      const parsed = JSON.parse(rates);
      // Merge with defaults to ensure all currencies have rates
      return { ...DEFAULT_EXCHANGE_RATES, ...parsed.rates };
    }
  } catch (e) {
    console.error('Failed to load exchange rates:', e);
  }
  return { ...DEFAULT_EXCHANGE_RATES };
};

// Save exchange rates
export const saveExchangeRates = (rates, source = 'manual') => {
  try {
    localStorage.setItem(EXCHANGE_RATES_KEY, JSON.stringify({
      rates,
      lastUpdated: new Date().toISOString(),
      source
    }));
  } catch (e) {
    console.error('Failed to save exchange rates:', e);
  }
};

// Get exchange rate metadata
export const getExchangeRatesMeta = () => {
  try {
    const data = localStorage.getItem(EXCHANGE_RATES_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        lastUpdated: parsed.lastUpdated,
        source: parsed.source || 'default'
      };
    }
  } catch (e) {
    console.error('Failed to get exchange rates meta:', e);
  }
  return { lastUpdated: null, source: 'default' };
};

// Convert amount between currencies
export const convertCurrency = (amount, fromCurrency, toCurrency, rates = null) => {
  if (fromCurrency === toCurrency) return amount;
  
  const exchangeRates = rates || getExchangeRates();
  const fromRate = exchangeRates[fromCurrency] || 1;
  const toRate = exchangeRates[toCurrency] || 1;
  
  // Convert to USD first, then to target currency
  const amountInUSD = amount / fromRate;
  const convertedAmount = amountInUSD * toRate;
  
  return convertedAmount;
};

// Format amount with currency
export const formatCurrencyAmount = (amount, currencyCode, options = {}) => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const { showCode = false, decimals = 2 } = options;
  
  // Handle currencies that typically don't use decimals
  const noDecimalCurrencies = ['JPY', 'KRW', 'VND', 'IDR', 'HUF'];
  const actualDecimals = noDecimalCurrencies.includes(currencyCode) ? 0 : decimals;
  
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: actualDecimals,
    maximumFractionDigits: actualDecimals
  });
  
  const prefix = amount < 0 ? '-' : '';
  
  if (showCode) {
    return `${prefix}${currency.symbol}${formatted} ${currencyCode}`;
  }
  return `${prefix}${currency.symbol}${formatted}`;
};

// Get currency by code
export const getCurrency = (code) => {
  return CURRENCIES[code] || CURRENCIES.USD;
};

// Get list of all currencies as array
export const getCurrencyList = () => {
  return Object.values(CURRENCIES).sort((a, b) => a.name.localeCompare(b.name));
};

// Get currencies used in transactions
export const getUsedCurrencies = (transactions) => {
  const used = new Set();
  transactions.forEach(t => {
    if (t.currency) {
      used.add(t.currency);
    }
  });
  return Array.from(used);
};

// Fetch exchange rates from API (free API)
export const fetchExchangeRates = async (baseCurrency = 'USD') => {
  try {
    // Using exchangerate-api.com free tier or similar
    // Note: This may not work if internet is disabled
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
      { timeout: 5000 }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch rates');
    }
    
    const data = await response.json();
    
    // Filter to only our supported currencies
    const rates = {};
    Object.keys(CURRENCIES).forEach(code => {
      if (data.rates[code]) {
        rates[code] = data.rates[code];
      }
    });
    
    // Save the fetched rates
    saveExchangeRates(rates, 'api');
    
    return {
      success: true,
      rates,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return {
      success: false,
      error: error.message,
      rates: getExchangeRates()
    };
  }
};

// Calculate totals by currency
export const calculateTotalsByCurrency = (transactions, targetCurrency, rates = null) => {
  const exchangeRates = rates || getExchangeRates();
  
  let totalExpenses = 0;
  let totalIncome = 0;
  
  transactions.forEach(t => {
    const currency = t.currency || 'USD';
    const amount = parseFloat(t.amount) || 0;
    const converted = convertCurrency(amount, currency, targetCurrency, exchangeRates);
    
    if (t.type === 'expense') {
      totalExpenses += converted;
    } else {
      totalIncome += converted;
    }
  });
  
  return {
    totalExpenses,
    totalIncome,
    balance: totalIncome - totalExpenses,
    currency: targetCurrency
  };
};

export default {
  CURRENCIES,
  DEFAULT_EXCHANGE_RATES,
  getCurrencySettings,
  saveCurrencySettings,
  getExchangeRates,
  saveExchangeRates,
  getExchangeRatesMeta,
  convertCurrency,
  formatCurrencyAmount,
  getCurrency,
  getCurrencyList,
  getUsedCurrencies,
  fetchExchangeRates,
  calculateTotalsByCurrency
};