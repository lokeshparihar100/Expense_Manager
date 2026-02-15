import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  exportBackup, 
  readBackupFile, 
  validateBackup, 
  importBackup,
  getCurrentStats,
  clearAllData 
} from '../utils/backup';
import {
  getReminderSettings,
  saveReminderSettings,
  REMINDER_TYPES,
  DURATION_UNITS
} from '../utils/reminders';
import {
  getScheduledBackupSettings,
  saveScheduledBackupSettings,
  formatBackupTime,
  getBackupStatus,
  downloadBackupNow,
  getDaysSinceLastBackup,
  uploadBackupToDriveNow
} from '../utils/scheduledBackup';
import {
  getDriveSettings,
  saveDriveSettings,
  signInWithGoogle,
  getStoredToken,
  clearToken,
  loadGoogleApi,
  listDriveBackups,
  getOrCreateBackupFolder
} from '../utils/googleDrive';
import { useSettings } from '../context/SettingsContext';
import { useExpense } from '../context/ExpenseContext';
import Modal, { ConfirmModal } from '../components/Modal';
import { getUsedCurrencies } from '../utils/currency';

const Settings = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { 
    theme, setTheme, hideAmounts, toggleAmounts, isDark,
    defaultCurrency, setDefaultCurrency,
    nativeCurrency, setNativeCurrency,
    reportCurrency, setReportCurrency,
    exchangeRates, exchangeRatesMeta, isLoadingRates,
    updateExchangeRate, fetchLiveRates, resetRatesToDefaults,
    currencies, getAllCurrencies, getCurrencyInfo
  } = useSettings();
  const { transactions, updateTransaction } = useExpense();
  
  const [stats, setStats] = useState(null);
  const [showExchangeRatesModal, setShowExchangeRatesModal] = useState(false);
  const [showHomeCurrencyPicker, setShowHomeCurrencyPicker] = useState(false);
  const [showCurrentCurrencyPicker, setShowCurrentCurrencyPicker] = useState(false);
  const [homeCurrencySearch, setHomeCurrencySearch] = useState('');
  const [currentCurrencySearch, setCurrentCurrencySearch] = useState('');
  const [currencySearch, setCurrencySearch] = useState('');
  const [editingRate, setEditingRate] = useState({ code: '', rate: '' });
  const [rateUpdateResult, setRateUpdateResult] = useState(null);
  const homeCurrencyRef = useRef(null);
  const currentCurrencyRef = useRef(null);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (homeCurrencyRef.current && !homeCurrencyRef.current.contains(event.target)) {
        setShowHomeCurrencyPicker(false);
      }
      if (currentCurrencyRef.current && !currentCurrencyRef.current.contains(event.target)) {
        setShowCurrentCurrencyPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [exportResult, setExportResult] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importOptions, setImportOptions] = useState({
    replaceAll: true,
    mergeTransactions: false,
    importTags: true,
    importSettings: true
  });
  const [importResult, setImportResult] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Reminder settings
  const [reminderSettings, setReminderSettings] = useState({
    enabled: true,
    defaultReminderType: REMINDER_TYPES.CUSTOM_DURATION,
    defaultReminderValue: 1,
    defaultReminderUnit: DURATION_UNITS.DAYS,
    showOnStartup: true
  });

  // Scheduled backup settings
  const [scheduledBackupSettings, setScheduledBackupSettings] = useState(getScheduledBackupSettings);
  const [backupStatus, setBackupStatus] = useState(null);
  const [isDownloadingScheduledBackup, setIsDownloadingScheduledBackup] = useState(false);
  const [scheduledBackupResult, setScheduledBackupResult] = useState(null);

  // Google Drive settings
  const [driveSettings, setDriveSettings] = useState(getDriveSettings);
  const [driveConnected, setDriveConnected] = useState(false);
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);
  const [driveResult, setDriveResult] = useState(null);
  const [driveBackups, setDriveBackups] = useState([]);
  const [isLoadingDriveBackups, setIsLoadingDriveBackups] = useState(false);
  const [showDriveBackupsModal, setShowDriveBackupsModal] = useState(false);
  
  // Collapsible sections
  const [expandedSection, setExpandedSection] = useState(null); // 'backup', 'scheduled', 'drive', null

  // Privacy Policy Modal
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Load current stats and reminder settings on mount
  useEffect(() => {
    setStats(getCurrentStats());
    setReminderSettings(getReminderSettings());
    setBackupStatus(getBackupStatus());
    
    // Check if Drive is connected
    const token = getStoredToken();
    setDriveConnected(token !== null && driveSettings.enabled && driveSettings.clientId);
  }, []);

  // Handle reminder settings change
  const handleReminderSettingChange = (key, value) => {
    const newSettings = { ...reminderSettings, [key]: value };
    setReminderSettings(newSettings);
    saveReminderSettings(newSettings);
  };

  // Handle scheduled backup settings change
  const handleScheduledBackupSettingChange = (key, value) => {
    const newSettings = { ...scheduledBackupSettings, [key]: value };
    setScheduledBackupSettings(newSettings);
    saveScheduledBackupSettings(newSettings);
    setBackupStatus(getBackupStatus());
  };

  // Download backup now (from scheduled backup section)
  const handleDownloadScheduledBackup = () => {
    setIsDownloadingScheduledBackup(true);
    setScheduledBackupResult(null);
    
    setTimeout(() => {
      const result = downloadBackupNow();
      if (result.success) {
        setScheduledBackupResult({
          success: true,
          message: `Backup downloaded: ${result.filename}`
        });
        setBackupStatus(getBackupStatus());
      } else {
        setScheduledBackupResult({
          success: false,
          message: result.error || 'Failed to download backup'
        });
      }
      setIsDownloadingScheduledBackup(false);
      
      // Clear result after 3 seconds
      setTimeout(() => setScheduledBackupResult(null), 3000);
    }, 500);
  };

  // Handle Google Drive settings change
  const handleDriveSettingChange = (key, value) => {
    const newSettings = { ...driveSettings, [key]: value };
    setDriveSettings(newSettings);
    saveDriveSettings(newSettings);
    
    // Update connected status
    const token = getStoredToken();
    setDriveConnected(token !== null && newSettings.enabled && newSettings.clientId);
  };

  // Connect to Google Drive
  const handleConnectDrive = async () => {
    if (!driveSettings.clientId) {
      setDriveResult({
        success: false,
        message: 'Please enter your Google Client ID first'
      });
      setTimeout(() => setDriveResult(null), 3000);
      return;
    }

    setIsConnectingDrive(true);
    setDriveResult(null);

    try {
      await loadGoogleApi();
      const result = await signInWithGoogle(driveSettings.clientId);
      
      // Get or create backup folder
      const folder = await getOrCreateBackupFolder(result.accessToken);
      
      // Save folder info
      const newSettings = { 
        ...driveSettings, 
        enabled: true,
        folderId: folder.id, 
        folderName: folder.name 
      };
      setDriveSettings(newSettings);
      saveDriveSettings(newSettings);
      setDriveConnected(true);
      
      setDriveResult({
        success: true,
        message: `Connected! Backups will be saved to "${folder.name}" folder`
      });
    } catch (error) {
      setDriveResult({
        success: false,
        message: error.message || 'Failed to connect to Google Drive'
      });
    } finally {
      setIsConnectingDrive(false);
      setTimeout(() => setDriveResult(null), 5000);
    }
  };

  // Disconnect from Google Drive
  const handleDisconnectDrive = () => {
    clearToken();
    const newSettings = { ...driveSettings, enabled: false, folderId: null, folderName: null };
    setDriveSettings(newSettings);
    saveDriveSettings(newSettings);
    setDriveConnected(false);
    setDriveBackups([]);
    setDriveResult({
      success: true,
      message: 'Disconnected from Google Drive'
    });
    setTimeout(() => setDriveResult(null), 3000);
  };

  // Upload backup to Drive now
  const handleUploadToDrive = async () => {
    setIsDownloadingScheduledBackup(true);
    setScheduledBackupResult(null);

    try {
      const result = await uploadBackupToDriveNow();
      if (result.success) {
        setScheduledBackupResult({
          success: true,
          message: `Uploaded to Google Drive: ${result.fileName}`
        });
        setBackupStatus(getBackupStatus());
      } else {
        setScheduledBackupResult({
          success: false,
          message: result.error || 'Failed to upload to Drive'
        });
      }
    } catch (error) {
      setScheduledBackupResult({
        success: false,
        message: error.message || 'Failed to upload to Drive'
      });
    } finally {
      setIsDownloadingScheduledBackup(false);
      setTimeout(() => setScheduledBackupResult(null), 3000);
    }
  };

  // Load Drive backups list
  const handleLoadDriveBackups = async () => {
    if (!driveConnected) return;
    
    setIsLoadingDriveBackups(true);
    const token = getStoredToken();
    
    if (token && driveSettings.folderId) {
      const result = await listDriveBackups(token.accessToken, driveSettings.folderId);
      if (result.success) {
        setDriveBackups(result.files);
      }
    }
    
    setIsLoadingDriveBackups(false);
    setShowDriveBackupsModal(true);
  };

  // Handle export
  const handleExport = () => {
    setIsProcessing(true);
    setExportResult(null);
    
    setTimeout(() => {
      const result = exportBackup();
      setExportResult(result);
      setIsProcessing(false);
    }, 500);
  };

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFile(file);
    setImportResult(null);
    setIsProcessing(true);

    try {
      const data = await readBackupFile(file);
      const validation = validateBackup(data);
      setImportPreview({
        data,
        validation,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(2) + ' KB'
      });
      setShowImportModal(true);
    } catch (error) {
      setImportPreview({
        error: error.message
      });
      setShowImportModal(true);
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle import confirmation
  const handleImportConfirm = () => {
    if (!importPreview?.data) return;

    setIsProcessing(true);
    
    setTimeout(() => {
      const result = importBackup(importPreview.data, importOptions);
      setImportResult(result);
      
      if (result.success) {
        // Refresh stats
        setStats(getCurrentStats());
        // Reload the page to refresh all data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
      
      setIsProcessing(false);
    }, 500);
  };

  // Handle clear all data
  const handleClearData = () => {
    clearAllData();
    setStats(getCurrentStats());
    setShowClearModal(false);
    // Reload to reset app state
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="p-4 pb-24 pt-2">
      {/* Appearance Settings */}
      <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <h2 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-xl">🎨</span>
          Appearance
        </h2>
        
        {/* Theme Selection */}
        <div className={`p-3 rounded-xl mb-3 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
          <p className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'light', label: 'Light', icon: '☀️' },
              { value: 'dark', label: 'Dark', icon: '🌙' },
              { value: 'system', label: 'System', icon: '💻' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`p-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                  theme === option.value
                    ? 'bg-primary-500 text-white shadow-md'
                    : isDark
                      ? 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300'
                }`}
              >
                <span className="text-lg">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hide Amounts Toggle */}
        <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
          <div>
            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Hide Amounts</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Privacy mode - blur all monetary values
            </p>
          </div>
          <button
            onClick={toggleAmounts}
            className={`w-12 h-7 rounded-full transition-colors relative ${
              hideAmounts ? 'bg-primary-600' : isDark ? 'bg-slate-500' : 'bg-gray-300'
            }`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
              hideAmounts ? 'right-1' : 'left-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Currency Settings */}
      <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <h2 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-xl">💱</span>
          Currency Settings
        </h2>
        
        {/* Native/Home Currency */}
        <div className={`p-3 rounded-xl mb-3 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>🏠 Home Currency</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Your native currency for reports
              </p>
            </div>
            <div className="relative" ref={homeCurrencyRef}>
              <button
                type="button"
                onClick={() => {
                  setShowHomeCurrencyPicker(!showHomeCurrencyPicker);
                  setShowCurrentCurrencyPicker(false);
                  setHomeCurrencySearch('');
                }}
                className={`flex items-center gap-2 pl-3 pr-8 py-2 rounded-lg font-medium cursor-pointer ${
                  isDark 
                    ? 'bg-slate-600 text-white border-slate-500' 
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <span className="text-lg">{currencies[nativeCurrency]?.flag}</span>
                <span>{nativeCurrency}</span>
              </button>
              <svg className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-slate-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              
              {/* Dropdown */}
              {showHomeCurrencyPicker && (
                <div className={`absolute right-0 top-full mt-1 w-64 rounded-xl shadow-lg z-50 overflow-hidden ${
                  isDark ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-gray-200'
                }`}>
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Search currency..."
                      value={homeCurrencySearch}
                      onChange={(e) => setHomeCurrencySearch(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${
                        isDark 
                          ? 'bg-slate-600 text-white placeholder-slate-400 border-slate-500' 
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {Object.values(currencies)
                      .filter(c => 
                        c.name.toLowerCase().includes(homeCurrencySearch.toLowerCase()) ||
                        c.code.toLowerCase().includes(homeCurrencySearch.toLowerCase())
                      )
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(curr => (
                        <button
                          key={curr.code}
                          type="button"
                          onClick={() => {
                            setNativeCurrency(curr.code);
                            setShowHomeCurrencyPicker(false);
                            setHomeCurrencySearch('');
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                            curr.code === nativeCurrency
                              ? isDark ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-700'
                              : isDark ? 'hover:bg-slate-600 text-white' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <span className="text-lg">{curr.flag}</span>
                          <span className="font-medium">{curr.code}</span>
                          <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>{curr.name}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Default Currency for New Transactions */}
        <div className={`p-3 rounded-xl mb-3 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>✈️ Current Currency</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Default for new transactions (travel mode)
              </p>
            </div>
            <div className="relative" ref={currentCurrencyRef}>
              <button
                type="button"
                onClick={() => {
                  setShowCurrentCurrencyPicker(!showCurrentCurrencyPicker);
                  setShowHomeCurrencyPicker(false);
                  setCurrentCurrencySearch('');
                }}
                className={`flex items-center gap-2 pl-3 pr-8 py-2 rounded-lg font-medium cursor-pointer ${
                  isDark 
                    ? 'bg-slate-600 text-white border-slate-500' 
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <span className="text-lg">{currencies[defaultCurrency]?.flag}</span>
                <span>{defaultCurrency}</span>
              </button>
              <svg className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-slate-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              
              {/* Dropdown */}
              {showCurrentCurrencyPicker && (
                <div className={`absolute right-0 top-full mt-1 w-64 rounded-xl shadow-lg z-50 overflow-hidden ${
                  isDark ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-gray-200'
                }`}>
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Search currency..."
                      value={currentCurrencySearch}
                      onChange={(e) => setCurrentCurrencySearch(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${
                        isDark 
                          ? 'bg-slate-600 text-white placeholder-slate-400 border-slate-500' 
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {Object.values(currencies)
                      .filter(c => 
                        c.name.toLowerCase().includes(currentCurrencySearch.toLowerCase()) ||
                        c.code.toLowerCase().includes(currentCurrencySearch.toLowerCase())
                      )
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(curr => (
                        <button
                          key={curr.code}
                          type="button"
                          onClick={() => {
                            setDefaultCurrency(curr.code);
                            setShowCurrentCurrencyPicker(false);
                            setCurrentCurrencySearch('');
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                            curr.code === defaultCurrency
                              ? isDark ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-700'
                              : isDark ? 'hover:bg-slate-600 text-white' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <span className="text-lg">{curr.flag}</span>
                          <span className="font-medium">{curr.code}</span>
                          <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>{curr.name}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {defaultCurrency !== nativeCurrency && (
            <p className={`text-xs mt-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              ✨ Traveling? New transactions will use {currencies[defaultCurrency]?.name}
            </p>
          )}
        </div>

        {/* Exchange Rates */}
        <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>📊 Exchange Rates</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {exchangeRatesMeta?.lastUpdated 
                  ? `Last updated: ${new Date(exchangeRatesMeta.lastUpdated).toLocaleDateString()}`
                  : 'Using default rates'
                }
                {exchangeRatesMeta?.source && ` (${exchangeRatesMeta.source})`}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={async () => {
                const result = await fetchLiveRates();
                setRateUpdateResult(result);
                setTimeout(() => setRateUpdateResult(null), 3000);
              }}
              disabled={isLoadingRates}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors ${
                isDark 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } disabled:opacity-50`}
            >
              {isLoadingRates ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Fetching...
                </>
              ) : (
                <>
                  🌐 Fetch Live Rates
                </>
              )}
            </button>
            <button
              onClick={() => setShowExchangeRatesModal(true)}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors ${
                isDark 
                  ? 'bg-slate-600 hover:bg-slate-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              ✏️ Edit
            </button>
          </div>

          {rateUpdateResult && (
            <div className={`mt-3 p-2 rounded-lg text-sm ${
              rateUpdateResult.success 
                ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'
                : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700'
            }`}>
              {rateUpdateResult.success 
                ? `✅ Rates updated from ${rateUpdateResult.source || 'API'}`
                : `❌ Failed: ${rateUpdateResult.error}. Using cached rates.`
              }
            </div>
          )}
        </div>

        {/* Currencies Used Summary */}
        {transactions.length > 0 && (
          <div className={`mt-3 p-3 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <p className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              💰 Currencies in Use
            </p>
            <div className="flex flex-wrap gap-2">
              {getUsedCurrencies(transactions).map(code => (
                <span 
                  key={code}
                  className={`px-2 py-1 rounded-lg text-sm ${
                    isDark ? 'bg-slate-600 text-slate-200' : 'bg-white border border-gray-200 text-gray-700'
                  }`}
                >
                  {currencies[code]?.flag} {code}
                </span>
              ))}
              {getUsedCurrencies(transactions).length === 0 && (
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  No transactions yet
                </span>
              )}
            </div>
          </div>
        )}

        <p className={`text-xs mt-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          💡 Tip: When traveling to a new country, change the "Current Currency" to record expenses in local currency.
        </p>
      </div>

      {/* Current Data Stats */}
      <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <h2 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-xl">📊</span>
          Current Data
        </h2>
        
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-xl p-3 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalTransactions}
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Transactions</p>
            </div>
            <div className={`rounded-xl p-3 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.transactionsWithInvoices}
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>With Invoices</p>
            </div>
            <div className={`rounded-xl p-3 ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
              <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                {stats.totalIncome}
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Income Records</p>
            </div>
            <div className={`rounded-xl p-3 ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
              <p className={`text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                {stats.totalExpenses}
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Expense Records</p>
            </div>
          </div>
        )}

        {stats && (
          <div className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Tags: {stats.tagsCount.payees} payees, {stats.tagsCount.categories} categories, 
              {stats.tagsCount.paymentMethods} payment methods
            </p>
          </div>
        )}
      </div>

      {/* Reminder Settings */}
      <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <h2 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-xl">🔔</span>
          Reminder Settings
        </h2>
        
        {/* Enable Reminders Toggle */}
        <div className={`flex items-center justify-between p-3 rounded-xl mb-3 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
          <div>
            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Enable Reminders</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Get notified about upcoming payments</p>
          </div>
          <button
            onClick={() => handleReminderSettingChange('enabled', !reminderSettings.enabled)}
            className={`w-12 h-7 rounded-full transition-colors relative ${
              reminderSettings.enabled ? 'bg-primary-600' : isDark ? 'bg-slate-500' : 'bg-gray-300'
            }`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
              reminderSettings.enabled ? 'right-1' : 'left-1'
            }`} />
          </button>
        </div>

        {/* Show on Startup Toggle */}
        <div className={`flex items-center justify-between p-3 rounded-xl mb-3 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
          <div>
            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Show on App Open</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Display reminders when you open the app</p>
          </div>
          <button
            onClick={() => handleReminderSettingChange('showOnStartup', !reminderSettings.showOnStartup)}
            disabled={!reminderSettings.enabled}
            className={`w-12 h-7 rounded-full transition-colors relative ${
              reminderSettings.showOnStartup && reminderSettings.enabled ? 'bg-primary-600' : isDark ? 'bg-slate-500' : 'bg-gray-300'
            } ${!reminderSettings.enabled ? 'opacity-50' : ''}`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
              reminderSettings.showOnStartup && reminderSettings.enabled ? 'right-1' : 'left-1'
            }`} />
          </button>
        </div>

        {/* Default Reminder Time */}
        <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
          <p className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Default Reminder Time</p>
          <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Default setting for new transactions</p>
          
          <div className={`flex items-center gap-2 ${!reminderSettings.enabled ? 'opacity-50' : ''}`}>
            <input
              type="number"
              value={reminderSettings.defaultReminderValue || 1}
              onChange={(e) => handleReminderSettingChange('defaultReminderValue', parseInt(e.target.value) || 1)}
              disabled={!reminderSettings.enabled}
              min="1"
              max="365"
              className={`w-20 px-3 py-2 rounded-xl border text-center font-medium ${
                isDark ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
            <select
              value={reminderSettings.defaultReminderUnit || DURATION_UNITS.DAYS}
              onChange={(e) => handleReminderSettingChange('defaultReminderUnit', e.target.value)}
              disabled={!reminderSettings.enabled}
              className={`flex-1 px-3 py-2 rounded-xl border ${
                isDark ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-gray-200'
              }`}
            >
              <option value={DURATION_UNITS.DAYS}>Day(s)</option>
              <option value={DURATION_UNITS.WEEKS}>Week(s)</option>
              <option value={DURATION_UNITS.MONTHS}>Month(s)</option>
            </select>
            <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>before</span>
          </div>
        </div>

        <p className={`text-xs mt-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          💡 Tip: You can customize the reminder for each transaction individually.
        </p>
      </div>

      {/* Backup & Data - Collapsible Section */}
      <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <h2 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-xl">💾</span>
          Backup & Data
        </h2>
        
        {/* Backup Status Summary */}
        <div className={`p-3 rounded-xl mb-3 ${
          backupStatus?.daysSinceBackup === null || backupStatus?.daysSinceBackup > 7
            ? isDark ? 'bg-amber-900/30' : 'bg-amber-50'
            : isDark ? 'bg-green-900/30' : 'bg-green-50'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {backupStatus?.daysSinceBackup === null || backupStatus?.daysSinceBackup > 7 ? '⚠️' : '✅'}
            </span>
            <div className="flex-1">
              <p className={`font-medium ${
                backupStatus?.daysSinceBackup === null || backupStatus?.daysSinceBackup > 7
                  ? isDark ? 'text-amber-300' : 'text-amber-700'
                  : isDark ? 'text-green-300' : 'text-green-700'
              }`}>
                {backupStatus?.lastDownload
                  ? backupStatus.daysSinceBackup === 0
                    ? 'Backup up to date'
                    : backupStatus.daysSinceBackup === 1
                      ? 'Last backup: Yesterday'
                      : `Last backup: ${backupStatus.daysSinceBackup} days ago`
                  : 'No backup yet'
                }
              </p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {driveConnected ? '☁️ Google Drive connected' : 'Local backups only'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={handleExport}
            disabled={isProcessing || (stats && stats.totalTransactions === 0)}
            className={`flex items-center gap-2 p-3 rounded-xl transition-colors ${
              isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'
            } disabled:opacity-50`}
          >
            <span className="text-xl">📥</span>
            <div className="text-left">
              <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Export</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Download backup</p>
            </div>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className={`flex items-center gap-2 p-3 rounded-xl transition-colors ${
              isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'
            } disabled:opacity-50`}
          >
            <span className="text-xl">📤</span>
            <div className="text-left">
              <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Import</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Restore backup</p>
            </div>
          </button>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Export/Import Results */}
        {(exportResult || importResult) && (
          <div className={`p-3 rounded-xl mb-3 ${
            (exportResult?.success || importResult?.success)
              ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'
              : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700'
          }`}>
            {exportResult?.success && <p className="text-sm">✅ Backup downloaded: {exportResult.filename}</p>}
            {exportResult && !exportResult.success && <p className="text-sm">❌ Export failed: {exportResult.error}</p>}
            {importResult?.success && <p className="text-sm">✅ Imported {importResult.results.transactionsImported} transactions</p>}
            {importResult && !importResult.success && <p className="text-sm">❌ Import failed</p>}
          </div>
        )}

        {/* Collapsible Subsections */}
        <div className="space-y-2">
          {/* Scheduled Backup */}
          <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <button
              onClick={() => setExpandedSection(expandedSection === 'scheduled' ? null : 'scheduled')}
              className={`w-full p-3 flex items-center justify-between ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">⏰</span>
                <div className="text-left">
                  <p className="font-medium text-sm">Scheduled Backup</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {scheduledBackupSettings.enabled 
                      ? `${formatBackupTime(scheduledBackupSettings.backupTime)} ${scheduledBackupSettings.frequency}`
                      : 'Disabled'}
                  </p>
                </div>
              </div>
              <svg className={`w-5 h-5 transition-transform ${expandedSection === 'scheduled' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSection === 'scheduled' && (
              <div className={`px-3 pb-3 space-y-3 border-t ${isDark ? 'border-slate-600' : 'border-gray-200'}`}>
                {/* Enable Toggle */}
                <div className="flex items-center justify-between pt-3">
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Enable Reminders</p>
                  <button
                    onClick={() => handleScheduledBackupSettingChange('enabled', !scheduledBackupSettings.enabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      scheduledBackupSettings.enabled ? 'bg-primary-600' : isDark ? 'bg-slate-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                      scheduledBackupSettings.enabled ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
                
                {/* Time & Frequency */}
                <div className={`flex gap-2 ${!scheduledBackupSettings.enabled ? 'opacity-50' : ''}`}>
                  <input
                    type="time"
                    value={scheduledBackupSettings.backupTime || '09:00'}
                    onChange={(e) => handleScheduledBackupSettingChange('backupTime', e.target.value)}
                    disabled={!scheduledBackupSettings.enabled}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                      isDark ? 'bg-slate-600 text-white border-slate-500' : 'bg-white border border-gray-200'
                    }`}
                  />
                  <select
                    value={scheduledBackupSettings.frequency || 'daily'}
                    onChange={(e) => handleScheduledBackupSettingChange('frequency', e.target.value)}
                    disabled={!scheduledBackupSettings.enabled}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                      isDark ? 'bg-slate-600 text-white border-slate-500' : 'bg-white border border-gray-200'
                    }`}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                
                {/* Download Now */}
                <button
                  onClick={handleDownloadScheduledBackup}
                  disabled={isDownloadingScheduledBackup}
                  className="w-full py-2 px-3 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDownloadingScheduledBackup ? 'Downloading...' : '📥 Download Backup Now'}
                </button>
                
                {scheduledBackupResult && (
                  <p className={`text-xs ${scheduledBackupResult.success ? 'text-green-500' : 'text-red-500'}`}>
                    {scheduledBackupResult.success ? '✅' : '❌'} {scheduledBackupResult.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Google Drive */}
          <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <button
              onClick={() => setExpandedSection(expandedSection === 'drive' ? null : 'drive')}
              className={`w-full p-3 flex items-center justify-between ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">☁️</span>
                <div className="text-left">
                  <p className="font-medium text-sm">Google Drive</p>
                  <p className={`text-xs ${driveConnected ? 'text-green-500' : isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {driveConnected ? `Connected • ${driveSettings.folderName}` : 'Not connected'}
                  </p>
                </div>
              </div>
              <svg className={`w-5 h-5 transition-transform ${expandedSection === 'drive' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSection === 'drive' && (
              <div className={`px-3 pb-3 space-y-3 border-t ${isDark ? 'border-slate-600' : 'border-gray-200'}`}>
                {/* Client ID */}
                <div className="pt-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Google Client ID</p>
                    {!driveConnected && (
                      <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Get ID →
                      </a>
                    )}
                  </div>
                  {driveConnected ? (
                    // Show masked Client ID when connected
                    <div className={`w-full px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between ${
                      isDark ? 'bg-slate-600 text-slate-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span>
                        {driveSettings.clientId 
                          ? `${driveSettings.clientId.substring(0, 8)}••••••••${driveSettings.clientId.slice(-20)}`
                          : '••••••••'
                        }
                      </span>
                      <span className="text-green-500 text-xs">✓ Connected</span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={driveSettings.clientId || ''}
                      onChange={(e) => handleDriveSettingChange('clientId', e.target.value)}
                      placeholder="xxxxx.apps.googleusercontent.com"
                      className={`w-full px-3 py-2 rounded-lg text-xs font-mono ${
                        isDark ? 'bg-slate-600 text-white placeholder-slate-400' : 'bg-white border border-gray-200'
                      }`}
                    />
                  )}
                </div>
                
                {/* Connect/Disconnect */}
                {driveSettings.clientId && (
                  <div className="flex gap-2">
                    {driveConnected ? (
                      <>
                        <button
                          onClick={handleLoadDriveBackups}
                          disabled={isLoadingDriveBackups}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                            isDark ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-white border hover:bg-gray-50'
                          }`}
                        >
                          {isLoadingDriveBackups ? '...' : '📁 View Backups'}
                        </button>
                        <button
                          onClick={handleDisconnectDrive}
                          className={`py-2 px-3 rounded-lg text-sm font-medium ${
                            isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-50 text-red-600'
                          }`}
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleConnectDrive}
                        disabled={isConnectingDrive}
                        className="w-full py-2 px-3 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isConnectingDrive ? 'Connecting...' : '🔗 Connect Google Drive'}
                      </button>
                    )}
                  </div>
                )}
                
                {/* Auto Upload Toggle */}
                {driveConnected && (
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Auto Upload</p>
                    <button
                      onClick={() => handleDriveSettingChange('autoUpload', !driveSettings.autoUpload)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        driveSettings.autoUpload ? 'bg-primary-600' : isDark ? 'bg-slate-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                        driveSettings.autoUpload ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                )}
                
                {/* Upload Now */}
                {driveConnected && (
                  <button
                    onClick={handleUploadToDrive}
                    disabled={isDownloadingScheduledBackup}
                    className="w-full py-2 px-3 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDownloadingScheduledBackup ? 'Uploading...' : '☁️ Upload to Drive Now'}
                  </button>
                )}
                
                {driveResult && (
                  <p className={`text-xs ${driveResult.success ? 'text-green-500' : 'text-red-500'}`}>
                    {driveResult.success ? '✅' : '❌'} {driveResult.message}
                  </p>
                )}
                
                {!driveSettings.clientId && (
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    💡 See USER_GUIDE.md for setup instructions
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className={`rounded-2xl p-4 mb-4 shadow-sm border-2 ${
        isDark ? 'bg-slate-800 border-red-900' : 'bg-white border-red-100'
      }`}>
        <h2 className={`font-semibold mb-3 flex items-center gap-2 ${
          isDark ? 'text-red-400' : 'text-red-600'
        }`}>
          <span className="text-xl">⚠️</span>
          Danger Zone
        </h2>
        <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Clear all data from the app. This action cannot be undone. Make sure to export a backup first!
        </p>
        
        <button
          onClick={() => setShowClearModal(true)}
          className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-colors ${
            isDark 
              ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
              : 'bg-red-50 text-red-600 hover:bg-red-100'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All Data
        </button>
      </div>

      {/* Quick Links */}
      <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <h2 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-xl">🔗</span>
          Quick Links
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/tags')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
              isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">🏷️</span>
            <div className="text-left">
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Manage Tags</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Edit categories & icons</p>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/stats')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
              isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">📊</span>
            <div className="text-left">
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Statistics</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Quick overview</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/help')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors col-span-2 ${
              isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">❓</span>
            <div className="text-left">
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Help & About</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>FAQ, features, and installation guide</p>
            </div>
          </button>
        </div>
      </div>

      {/* Contact Us */}
      <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <h2 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-xl">📧</span>
          Contact Us
        </h2>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
          <p className={`text-sm mb-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            Have questions, feedback, or suggestions? We'd love to hear from you!
          </p>

          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDark ? 'bg-primary-900/50' : 'bg-primary-100'
            }`}>
              <svg className={`w-5 h-5 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Email us at
              </p>
              <a
                href="mailto:lokeshparihar00009@gmail.com"
                className={`font-medium ${isDark ? 'text-primary-400' : 'text-primary-600'} hover:underline`}
              >
                lokeshparihar00009@gmail.com
              </a>
            </div>
          </div>

          <p className={`text-xs mt-3 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            💡 We typically respond within 24-48 hours
          </p>
        </div>
      </div>

      {/* About */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💰</span>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Daily Expense Manager</h3>
            <p className="text-sm opacity-90">
              Version 1.6.0 - Multi-Account Support & Copy Transactions<br />
              Your data is stored locally on this device.
              Regular backups are recommended.
            </p>

            {/* Creator Info */}
            <div className="mt-4 pt-3 border-t border-white/20">
              <p className="text-xs opacity-75 mb-2">Created by Lokesh Parihar</p>
              <div className="flex flex-wrap gap-3 text-xs">
                <a
                  href="https://www.linkedin.com/in/lokeshparihar100/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 opacity-90 hover:opacity-100 hover:underline transition-opacity"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </a>
                <a
                  href="https://lokeshparihar100.github.io/lokeshparihar100/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 opacity-90 hover:opacity-100 hover:underline transition-opacity"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Portfolio
                </a>
              </div>
            </div>

            {/* Copyright & Privacy */}
            <div className="mt-3 pt-2 border-t border-white/20 flex flex-wrap items-center gap-2 text-xs opacity-75">
              <span>&copy; 2026 Lokesh Parihar</span>
              <span>•</span>
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="hover:underline hover:opacity-100 transition-opacity"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Import Preview Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportPreview(null);
          setImportResult(null);
        }}
        title="Import Backup"
      >
        {importPreview?.error ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-red-600 font-medium">{importPreview.error}</p>
          </div>
        ) : importPreview?.validation ? (
          <div className="space-y-4">
            {/* File Info */}
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm text-gray-500">File: {importPreview.fileName}</p>
              <p className="text-sm text-gray-500">Size: {importPreview.fileSize}</p>
              {importPreview.data?.meta?.createdAtFormatted && (
                <p className="text-sm text-gray-500">
                  Created: {importPreview.data.meta.createdAtFormatted}
                </p>
              )}
            </div>

            {/* Validation Status */}
            {!importPreview.validation.valid ? (
              <div className="bg-red-50 rounded-xl p-3">
                <p className="font-medium text-red-700">❌ Invalid backup file</p>
                {importPreview.validation.errors.map((err, i) => (
                  <p key={i} className="text-sm text-red-600">{err}</p>
                ))}
              </div>
            ) : (
              <>
                {/* Backup Stats */}
                {importPreview.data?.stats && (
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="font-medium text-blue-700 mb-2">📊 Backup Contents</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>Transactions: <strong>{importPreview.data.stats.totalTransactions}</strong></p>
                      <p>With Invoices: <strong>{importPreview.data.stats.transactionsWithInvoices}</strong></p>
                      <p>Income: <strong>{importPreview.data.stats.totalIncome}</strong></p>
                      <p>Expenses: <strong>{importPreview.data.stats.totalExpenses}</strong></p>
                    </div>
                    {importPreview.data.stats.dateRange && (
                      <p className="text-sm mt-2 text-blue-600">
                        Date range: {importPreview.data.stats.dateRange.oldest} to {importPreview.data.stats.dateRange.newest}
                      </p>
                    )}
                  </div>
                )}

                {/* Warnings */}
                {importPreview.validation.warnings.length > 0 && (
                  <div className="bg-yellow-50 rounded-xl p-3">
                    <p className="font-medium text-yellow-700">⚠️ Warnings</p>
                    {importPreview.validation.warnings.map((warn, i) => (
                      <p key={i} className="text-sm text-yellow-600">{warn}</p>
                    ))}
                  </div>
                )}

                {/* Import Options */}
                <div className="space-y-3">
                  <p className="font-medium text-gray-700">Import Options</p>
                  
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importOptions.replaceAll}
                      onChange={() => setImportOptions(prev => ({ ...prev, replaceAll: true, mergeTransactions: false }))}
                      className="w-4 h-4 text-primary-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Replace All</p>
                      <p className="text-sm text-gray-500">Replace all existing data with backup</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={!importOptions.replaceAll}
                      onChange={() => setImportOptions(prev => ({ ...prev, replaceAll: false, mergeTransactions: true }))}
                      className="w-4 h-4 text-primary-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Merge</p>
                      <p className="text-sm text-gray-500">Add new transactions, skip duplicates</p>
                    </div>
                  </label>
                </div>

                {/* Import Button */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportPreview(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportConfirm}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Importing...' : 'Import Backup'}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Clear Data Confirmation */}
      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearData}
        title="Clear All Data"
        message="Are you sure you want to delete all transactions, tags, and settings? This action cannot be undone. Make sure you have a backup!"
      />

      {/* Google Drive Backups Modal */}
      <Modal
        isOpen={showDriveBackupsModal}
        onClose={() => setShowDriveBackupsModal(false)}
        title="Google Drive Backups"
      >
        <div className="space-y-4">
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Backups stored in your Google Drive "{driveSettings.folderName}" folder.
          </p>

          {driveBackups.length === 0 ? (
            <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              <span className="text-4xl block mb-2">📭</span>
              <p>No backups in Google Drive yet</p>
              <p className="text-sm">Upload a backup to see it here</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {driveBackups.map((file) => {
                const fileDate = new Date(file.createdTime);
                return (
                  <div 
                    key={file.id}
                    className={`p-3 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">☁️</span>
                        <div>
                          <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {file.name}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                            {fileDate.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-slate-600 text-blue-400' : 'hover:bg-gray-200 text-blue-600'
                          }`}
                          title="Open in Drive"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            💡 The 7 most recent backups are kept. Older backups are automatically deleted.
          </p>
        </div>
      </Modal>

      {/* Exchange Rates Modal */}
      <Modal
        isOpen={showExchangeRatesModal}
        onClose={() => {
          setShowExchangeRatesModal(false);
          setEditingRate({ code: '', rate: '' });
          setCurrencySearch('');
        }}
        title="Manage Exchange Rates"
      >
        <div className="space-y-4">
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Exchange rates are relative to USD (1 USD = X currency).
            {exchangeRatesMeta?.lastUpdated && (
              <> Last updated: {new Date(exchangeRatesMeta.lastUpdated).toLocaleString()}</>
            )}
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={async () => {
                const result = await fetchLiveRates();
                if (result.success) {
                  setRateUpdateResult(result);
                }
              }}
              disabled={isLoadingRates}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                isDark 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } disabled:opacity-50`}
            >
              {isLoadingRates ? 'Fetching...' : '🌐 Fetch Live'}
            </button>
            <button
              onClick={() => {
                resetRatesToDefaults();
                setRateUpdateResult({ success: true, message: 'Reset to defaults' });
              }}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                isDark 
                  ? 'bg-slate-600 hover:bg-slate-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              🔄 Reset Defaults
            </button>
          </div>
          
          {/* Search */}
          <input
            type="text"
            placeholder="Search currencies..."
            value={currencySearch}
            onChange={(e) => setCurrencySearch(e.target.value)}
            className={`w-full px-4 py-2 rounded-xl border focus:border-primary-500 focus:ring-2 focus:ring-primary-200 ${
              isDark 
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                : 'bg-white border-gray-200'
            }`}
          />
          
          {/* Rates List */}
          <div className="max-h-64 overflow-y-auto space-y-1">
            {Object.values(currencies)
              .filter(c => 
                c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
                c.code.toLowerCase().includes(currencySearch.toLowerCase())
              )
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(currency => {
                const rate = exchangeRates[currency.code] || 1;
                const isEditing = editingRate.code === currency.code;
                
                return (
                  <div 
                    key={currency.code}
                    className={`flex items-center gap-2 p-2 rounded-xl ${
                      isDark ? 'bg-slate-700' : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{currency.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {currency.code}
                      </p>
                    </div>
                    
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editingRate.rate}
                          onChange={(e) => setEditingRate({ ...editingRate, rate: e.target.value })}
                          step="0.0001"
                          min="0"
                          className={`w-24 px-2 py-1 rounded-lg border text-sm text-right ${
                            isDark 
                              ? 'bg-slate-600 border-slate-500 text-white' 
                              : 'bg-white border-gray-300'
                          }`}
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            if (editingRate.rate && parseFloat(editingRate.rate) > 0) {
                              updateExchangeRate(currency.code, editingRate.rate);
                            }
                            setEditingRate({ code: '', rate: '' });
                          }}
                          className="p-1 text-green-500 hover:bg-green-50 rounded"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingRate({ code: '', rate: '' })}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingRate({ code: currency.code, rate: rate.toString() })}
                        className={`text-sm font-mono px-2 py-1 rounded-lg ${
                          isDark 
                            ? 'bg-slate-600 hover:bg-slate-500 text-slate-200' 
                            : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {rate.toFixed(4)}
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
          
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            💡 Click on a rate to edit it manually. These rates are used to convert transactions to your home currency in reports.
          </p>
        </div>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Privacy Policy"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-blue-50'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Your privacy is important to us. This application is designed with privacy as a core principle.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className="text-lg">🔒</span>
                Local Storage
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                All your data is stored locally on your device. We do not have access to your transactions,
                expenses, or any personal information.
              </p>
            </div>

            <div>
              <h3 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className="text-lg">🚫</span>
                No Data Collection
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                We do not collect, transmit, or store any personal information on external servers.
                Your financial data remains completely private.
              </p>
            </div>

            <div>
              <h3 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className="text-lg">☁️</span>
                Optional Cloud Integration
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Google Drive integration is completely optional and requires your explicit consent.
                When enabled, backups are stored in your personal Google Drive account, which you control.
              </p>
            </div>

            <div>
              <h3 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className="text-lg">💾</span>
                Full Data Control
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                You have complete control over your data through export and import features.
                You can backup, restore, or delete all your data at any time.
              </p>
            </div>

            <div>
              <h3 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className="text-lg">📊</span>
                No Analytics or Tracking
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                We do not use any third-party analytics, tracking tools, or advertising services.
                Your usage patterns and behavior are not monitored or recorded.
              </p>
            </div>

            <div>
              <h3 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className="text-lg">🔐</span>
                Security
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Since your data is stored locally in your browser, it's protected by your device's
                security measures. We recommend regular backups to prevent data loss.
              </p>
            </div>

            <div>
              <h3 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className="text-lg">📧</span>
                Contact
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                For questions or concerns about privacy, please contact us at{' '}
                <a
                  href="mailto:lokeshparihar00009@gmail.com"
                  className={`font-medium ${isDark ? 'text-primary-400' : 'text-primary-600'} hover:underline`}
                >
                  lokeshparihar00009@gmail.com
                </a>
              </p>
            </div>
          </div>

          <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'}`}>
            <p className="text-sm">
              <strong>Last Updated:</strong> February 2026
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
