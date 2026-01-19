import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCurrencySettings,
  saveCurrencySettings,
  getExchangeRates,
  saveExchangeRates,
  getExchangeRatesMeta,
  convertCurrency,
  formatCurrencyAmount,
  getCurrency,
  getCurrencyList,
  fetchExchangeRates,
  resetExchangeRatesToDefaults,
  CURRENCIES,
  DEFAULT_EXCHANGE_RATES
} from '../utils/currency';

const SettingsContext = createContext();

const SETTINGS_STORAGE_KEY = 'expense_manager_app_settings';

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Get system preference
const getSystemTheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// Load settings from localStorage
const loadSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return {
    theme: 'system',
    hideAmounts: false
  };
};

// Save settings to localStorage
const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(loadSettings);
  const [effectiveTheme, setEffectiveTheme] = useState('light');
  const [currencySettings, setCurrencySettings] = useState(getCurrencySettings);
  const [exchangeRates, setExchangeRates] = useState(getExchangeRates);
  const [exchangeRatesMeta, setExchangeRatesMeta] = useState(getExchangeRatesMeta);
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  // Determine effective theme based on settings and system preference
  useEffect(() => {
    const updateEffectiveTheme = () => {
      if (settings.theme === 'system') {
        setEffectiveTheme(getSystemTheme());
      } else {
        setEffectiveTheme(settings.theme);
      }
    };

    updateEffectiveTheme();

    // Listen for system theme changes
    if (settings.theme === 'system' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) => {
        setEffectiveTheme(e.matches ? 'dark' : 'light');
      };
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      }
      // Older browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handler);
        return () => mediaQuery.removeListener(handler);
      }
    }
  }, [settings.theme]);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [effectiveTheme]);

  // Update a setting
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Toggle amounts visibility
  const toggleAmounts = () => {
    updateSetting('hideAmounts', !settings.hideAmounts);
  };

  // Cycle through themes: light -> dark -> system -> light
  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(settings.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    updateSetting('theme', themes[nextIndex]);
  };

  // Set specific theme
  const setTheme = (theme) => {
    updateSetting('theme', theme);
  };

  // Format amount (hide if needed, with currency support)
  const formatAmount = (amount, currency = null, options = {}) => {
    if (settings.hideAmounts) {
      return '••••••';
    }
    const currencyCode = currency || currencySettings.defaultCurrency || 'USD';
    return formatCurrencyAmount(parseFloat(amount) || 0, currencyCode, options);
  };

  // Format amount converted to report currency
  const formatConvertedAmount = (amount, fromCurrency, toCurrency = null, options = {}) => {
    if (settings.hideAmounts) {
      return '••••••';
    }
    const targetCurrency = toCurrency || currencySettings.reportCurrency || currencySettings.defaultCurrency || 'USD';
    const converted = convertCurrency(parseFloat(amount) || 0, fromCurrency || 'USD', targetCurrency, exchangeRates);
    return formatCurrencyAmount(converted, targetCurrency, options);
  };

  // Convert amount between currencies
  const convert = (amount, fromCurrency, toCurrency) => {
    return convertCurrency(parseFloat(amount) || 0, fromCurrency, toCurrency, exchangeRates);
  };

  // Update default currency (current currency for new transactions)
  const setDefaultCurrency = (code) => {
    setCurrencySettings(prev => {
      const newSettings = { ...prev, defaultCurrency: code };
      saveCurrencySettings(newSettings);
      return newSettings;
    });
  };

  // Update report currency
  const setReportCurrency = (code) => {
    setCurrencySettings(prev => {
      const newSettings = { ...prev, reportCurrency: code };
      saveCurrencySettings(newSettings);
      return newSettings;
    });
  };

  // Update native currency (home country currency for conversion)
  const setNativeCurrency = (code) => {
    setCurrencySettings(prev => {
      const newSettings = { ...prev, nativeCurrency: code, reportCurrency: code };
      saveCurrencySettings(newSettings);
      return newSettings;
    });
  };

  // Update exchange rate for a currency
  const updateExchangeRate = (code, rate) => {
    const newRates = { ...exchangeRates, [code]: parseFloat(rate) };
    setExchangeRates(newRates);
    saveExchangeRates(newRates, 'manual');
    setExchangeRatesMeta({ lastUpdated: new Date().toISOString(), source: 'manual' });
  };

  // Update multiple exchange rates
  const updateExchangeRates = (rates) => {
    const newRates = { ...exchangeRates, ...rates };
    setExchangeRates(newRates);
    saveExchangeRates(newRates, 'manual');
    setExchangeRatesMeta({ lastUpdated: new Date().toISOString(), source: 'manual' });
  };

  // Fetch live exchange rates from internet
  const fetchLiveRates = useCallback(async () => {
    setIsLoadingRates(true);
    try {
      const result = await fetchExchangeRates('USD');
      if (result.success) {
        setExchangeRates(result.rates);
        setExchangeRatesMeta({ 
          lastUpdated: result.lastUpdated, 
          source: result.source || 'api' 
        });
      }
      return result;
    } finally {
      setIsLoadingRates(false);
    }
  }, []);

  // Reset exchange rates to defaults
  const resetRatesToDefaults = () => {
    const defaultRates = resetExchangeRatesToDefaults();
    setExchangeRates(defaultRates);
    setExchangeRatesMeta({ lastUpdated: new Date().toISOString(), source: 'default' });
  };

  // Get currency info
  const getCurrencyInfo = (code) => {
    return getCurrency(code);
  };

  // Get list of all currencies
  const getAllCurrencies = () => {
    return getCurrencyList();
  };

  const value = {
    // Theme
    theme: settings.theme,
    effectiveTheme,
    isDark: effectiveTheme === 'dark',
    cycleTheme,
    setTheme,
    
    // Privacy
    hideAmounts: settings.hideAmounts,
    toggleAmounts,
    
    // Currency
    defaultCurrency: currencySettings.defaultCurrency || 'USD',
    reportCurrency: currencySettings.reportCurrency || currencySettings.nativeCurrency || 'USD',
    nativeCurrency: currencySettings.nativeCurrency || 'USD',
    exchangeRates,
    exchangeRatesMeta,
    isLoadingRates,
    setDefaultCurrency,
    setReportCurrency,
    setNativeCurrency,
    updateExchangeRate,
    updateExchangeRates,
    fetchLiveRates,
    resetRatesToDefaults,
    getCurrencyInfo,
    getAllCurrencies,
    
    // Formatting
    formatAmount,
    formatConvertedAmount,
    convert,
    
    // All currencies
    currencies: CURRENCIES,
    defaultRates: DEFAULT_EXCHANGE_RATES
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;