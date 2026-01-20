import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useExpense } from '../context/ExpenseContext';
import {
  getScheduledBackupSettings,
  isBackupDue,
  downloadBackupNow,
  dismissBackupForSession,
  formatBackupTime,
  getDaysSinceLastBackup,
  uploadBackupToDriveNow
} from '../utils/scheduledBackup';
import { isDriveConnected, getDriveSettings } from '../utils/googleDrive';

/**
 * ScheduledBackupManager Component
 * 
 * This component manages scheduled backup prompts.
 * When a backup is due, it either:
 * - Auto-uploads to Google Drive (if connected and enabled), or
 * - Shows a modal prompting the user to download their backup
 * 
 * Trigger conditions:
 * 1. App is opened/refreshed AFTER the scheduled time
 * 2. No backup has been downloaded today (for daily) or this week (for weekly)
 * 3. The prompt wasn't dismissed this browser session
 * 4. There's at least one transaction to backup
 */
const ScheduledBackupManager = () => {
  const { isDark } = useSettings();
  const { transactions } = useExpense();
  const [showBackupPrompt, setShowBackupPrompt] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadResult, setDownloadResult] = useState(null);
  const [driveUploadStatus, setDriveUploadStatus] = useState(null); // 'uploading', 'success', 'error', null
  const [driveUploadError, setDriveUploadError] = useState(null);
  const hasCheckedRef = useRef(false);

  // Perform automatic Drive upload
  const performDriveBackup = useCallback(async () => {
    console.log('[Backup] Starting automatic Drive upload...');
    setDriveUploadStatus('uploading');
    
    try {
      const result = await uploadBackupToDriveNow();
      
      if (result.success) {
        console.log('[Backup] Drive upload successful:', result.fileName);
        setDriveUploadStatus('success');
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setDriveUploadStatus(null);
        }, 5000);
      } else {
        console.error('[Backup] Drive upload failed:', result.error);
        setDriveUploadError(result.error || 'Upload failed');
        setDriveUploadStatus('error');
        // Show manual download option on failure
        setShowBackupPrompt(true);
      }
    } catch (error) {
      console.error('[Backup] Drive upload error:', error);
      setDriveUploadError(error.message || 'Upload failed');
      setDriveUploadStatus('error');
      // Show manual download option on failure
      setShowBackupPrompt(true);
    }
  }, []);

  // Check if backup is due
  const checkBackup = useCallback(() => {
    const settings = getScheduledBackupSettings();
    
    console.log('[Backup] Checking backup status...', {
      enabled: settings.enabled,
      backupTime: settings.backupTime,
      frequency: settings.frequency,
      transactionCount: transactions.length,
      currentTime: new Date().toLocaleTimeString()
    });
    
    if (!settings.enabled) {
      console.log('[Backup] Skipped: Backups disabled');
      return;
    }
    if (transactions.length === 0) {
      console.log('[Backup] Skipped: No transactions to backup');
      return;
    }

    const { isDue, reason } = isBackupDue();
    console.log('[Backup] Result:', { isDue, reason });
    
    if (isDue) {
      // Check if Google Drive auto-upload is enabled
      const driveConnected = isDriveConnected();
      const driveSettings = getDriveSettings();
      
      console.log('[Backup] Drive status:', {
        connected: driveConnected,
        autoUpload: driveSettings.autoUpload
      });
      
      if (driveConnected && driveSettings.autoUpload) {
        // Auto-upload to Drive
        performDriveBackup();
      } else {
        // Show download prompt
        setShowBackupPrompt(true);
      }
    }
  }, [transactions.length, performDriveBackup]);

  // Initial check on mount (with delay to let app load)
  useEffect(() => {
    if (!hasCheckedRef.current && transactions.length > 0) {
      hasCheckedRef.current = true;
      console.log('[Backup] Scheduling initial check in 1.5s...');
      const timeoutId = setTimeout(checkBackup, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [checkBackup, transactions.length]);

  // Also check when tab becomes visible (user returns to app)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[Backup] Tab became visible, checking backup...');
        setTimeout(checkBackup, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkBackup]);

  // Listen for storage changes (in case settings are changed in another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'expense_manager_scheduled_backup_settings') {
        console.log('[Backup] Settings changed, rechecking...');
        setTimeout(checkBackup, 500);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkBackup]);

  // Handle download backup
  const handleDownload = () => {
    setIsDownloading(true);
    setDownloadResult(null);

    // Small delay for UX
    setTimeout(() => {
      const result = downloadBackupNow();
      setDownloadResult(result);
      setIsDownloading(false);

      if (result.success) {
        // Close modal after successful download
        setTimeout(() => {
          setShowBackupPrompt(false);
          setDownloadResult(null);
        }, 2000);
      }
    }, 500);
  };

  // Handle dismiss (remind later)
  const handleDismiss = () => {
    dismissBackupForSession();
    setShowBackupPrompt(false);
    setDownloadResult(null);
  };

  const settings = getScheduledBackupSettings();
  const daysSinceBackup = getDaysSinceLastBackup();

  // Show Drive upload status notification (small toast)
  if (driveUploadStatus === 'uploading' || driveUploadStatus === 'success') {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 flex justify-center animate-fade-in">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
          driveUploadStatus === 'success'
            ? isDark ? 'bg-green-900/90 text-green-300' : 'bg-green-600 text-white'
            : isDark ? 'bg-slate-700/90 text-white' : 'bg-white text-gray-900 shadow-xl'
        }`}>
          {driveUploadStatus === 'uploading' ? (
            <>
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium">Uploading backup to Google Drive...</span>
            </>
          ) : (
            <>
              <span className="text-xl">✅</span>
              <span className="font-medium">Backup uploaded to Google Drive!</span>
            </>
          )}
        </div>
      </div>
    );
  }

  // Don't render if no prompt needed
  if (!showBackupPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
        isDark ? 'bg-slate-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-3xl">💾</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Backup Your Data</h2>
              <p className="text-sm opacity-90">
                {daysSinceBackup === null 
                  ? "You haven't backed up yet"
                  : daysSinceBackup === 0
                    ? "Last backup: Today"
                    : daysSinceBackup === 1
                      ? "Last backup: Yesterday"
                      : `Last backup: ${daysSinceBackup} days ago`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Drive Upload Error Notice */}
          {driveUploadStatus === 'error' && driveUploadError && (
            <div className={`p-4 rounded-xl mb-4 ${
              isDark ? 'bg-red-900/30' : 'bg-red-50'
            }`}>
              <div className="flex gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <p className={`font-medium ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                    Drive Upload Failed
                  </p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {driveUploadError}. Download the backup manually instead.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className={`p-4 rounded-xl mb-4 ${
            isDark ? 'bg-amber-900/30' : 'bg-amber-50'
          }`}>
            <div className="flex gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className={`font-medium ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                  Protect Your Data
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  Your data is stored in the browser. If browser data is cleared, you'll lose everything. 
                  Download a backup to keep your data safe!
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  📊 {transactions.length} Transactions
                </p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Will be saved to a backup file
                </p>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Schedule: {formatBackupTime(settings.backupTime)} {settings.frequency}
              </p>
            </div>
          </div>

          {/* Download Result */}
          {downloadResult && (
            <div className={`p-3 rounded-xl mb-4 ${
              downloadResult.success 
                ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'
                : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700'
            }`}>
              {downloadResult.success ? (
                <p className="font-medium">✅ Backup downloaded successfully!</p>
              ) : (
                <p className="font-medium">❌ Download failed: {downloadResult.error}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                isDark 
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Remind Later
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 py-3 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Downloading...
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
          </div>

          <p className={`text-xs text-center mt-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            Backup file will be saved to your Downloads folder
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScheduledBackupManager;
