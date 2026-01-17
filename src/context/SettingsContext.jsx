import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCurrencySettings,
  saveCurrencySettings,
  getExchangeRates,
  saveExchangeRates,
  convertCurrency,
  formatCurrencyAmount,
  getCurrency,
  CURRENCIES
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

  // Update default currency
  const setDefaultCurrency = (code) => {
    const newSettings = { ...currencySettings, defaultCurrency: code };
    setCurrencySettings(newSettings);
    saveCurrencySettings(newSettings);
  };

  // Update report currency
  const setReportCurrency = (code) => {
    const newSettings = { ...currencySettings, reportCurrency: code };
    setCurrencySettings(newSettings);
    saveCurrencySettings(newSettings);
  };

  // Update exchange rate for a currency
  const updateExchangeRate = (code, rate) => {
    const newRates = { ...exchangeRates, [code]: parseFloat(rate) };
    setExchangeRates(newRates);
    saveExchangeRates(newRates, 'manual');
  };

  // Update multiple exchange rates
  const updateExchangeRates = (rates) => {
    const newRates = { ...exchangeRates, ...rates };
    setExchangeRates(newRates);
    saveExchangeRates(newRates, 'manual');
  };

  // Get currency info
  const getCurrencyInfo = (code) => {
    return getCurrency(code);
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
    reportCurrency: currencySettings.reportCurrency || currencySettings.defaultCurrency || 'USD',
    exchangeRates,
    setDefaultCurrency,
    setReportCurrency,
    updateExchangeRate,
    updateExchangeRates,
    getCurrencyInfo,
    
    // Formatting
    formatAmount,
    formatConvertedAmount,
    convert,
    
    // All currencies
    currencies: CURRENCIES
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;