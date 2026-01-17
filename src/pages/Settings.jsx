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
import { useSettings } from '../context/SettingsContext';
import Modal, { ConfirmModal } from '../components/Modal';

const Settings = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { theme, setTheme, hideAmounts, toggleAmounts, isDark } = useSettings();
  
  const [stats, setStats] = useState(null);
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

  // Load current stats and reminder settings on mount
  useEffect(() => {
    setStats(getCurrentStats());
    setReminderSettings(getReminderSettings());
  }, []);

  // Handle reminder settings change
  const handleReminderSettingChange = (key, value) => {
    const newSettings = { ...reminderSettings, [key]: value };
    setReminderSettings(newSettings);
    saveReminderSettings(newSettings);
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

      {/* Export Backup */}
      <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <h2 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-xl">💾</span>
          Export Backup
        </h2>
        <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Download a complete backup of all your transactions, tags (with icons), and settings. 
          The backup file can be used to restore your data later.
        </p>
        
        <button
          onClick={handleExport}
          disabled={isProcessing || (stats && stats.totalTransactions === 0)}
          className="w-full flex items-center justify-center gap-2 p-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Backup...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Backup
            </>
          )}
        </button>

        {exportResult && (
          <div className={`mt-3 p-3 rounded-xl ${
            exportResult.success 
              ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'
              : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700'
          }`}>
            {exportResult.success ? (
              <div>
                <p className="font-medium">✅ Backup created successfully!</p>
                <p className="text-sm mt-1">
                  File: {exportResult.filename}<br />
                  {exportResult.stats.totalTransactions} transactions exported
                  {exportResult.stats.transactionsWithInvoices > 0 && 
                    ` (${exportResult.stats.totalInvoiceImages} invoice images included)`
                  }
                </p>
              </div>
            ) : (
              <p>❌ Export failed: {exportResult.error}</p>
            )}
          </div>
        )}
      </div>

      {/* Import Backup */}
      <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <h2 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-xl">📂</span>
          Import Backup
        </h2>
        <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Restore your data from a backup file. You can choose to replace all existing data or merge with current data.
        </p>
        
        <input
          type="file"
          ref={fileInputRef}
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-colors disabled:opacity-50 ${
            isDark 
              ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isProcessing ? (
            <>
              <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${
                isDark ? 'border-slate-300' : 'border-gray-600'
              }`}></div>
              Reading File...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Select Backup File
            </>
          )}
        </button>

        {importResult && (
          <div className={`mt-3 p-3 rounded-xl ${
            importResult.success 
              ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'
              : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700'
          }`}>
            {importResult.success ? (
              <div>
                <p className="font-medium">✅ Import successful!</p>
                <p className="text-sm mt-1">
                  {importResult.results.transactionsImported} transactions imported
                  {importResult.results.transactionsSkipped > 0 && 
                    `, ${importResult.results.transactionsSkipped} skipped (duplicates)`
                  }
                </p>
                <p className="text-sm mt-1">Refreshing app...</p>
              </div>
            ) : (
              <div>
                <p className="font-medium">❌ Import failed</p>
                {importResult.errors?.map((err, i) => (
                  <p key={i} className="text-sm">{err}</p>
                ))}
              </div>
            )}
          </div>
        )}
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

      {/* About */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💰</span>
          <div>
            <h3 className="font-semibold mb-1">Daily Expense Manager</h3>
            <p className="text-sm opacity-90">
              Version 1.0.0<br />
              Your data is stored locally on this device.
              Regular backups are recommended.
            </p>
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
    </div>
  );
};

export default Settings;
