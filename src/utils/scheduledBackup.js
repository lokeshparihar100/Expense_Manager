// Scheduled Backup utilities for Expense Manager
// Handles automatic scheduled backups - prompts user to download backup files
// Optionally uploads to Google Drive if configured

import { createBackup, exportBackup } from './backup';
import { backupToDrive, isDriveConnected, getDriveSettings } from './googleDrive';

// Storage keys for scheduled backup
const SCHEDULED_BACKUP_SETTINGS_KEY = 'expense_manager_scheduled_backup_settings';
const LAST_BACKUP_DOWNLOAD_KEY = 'expense_manager_last_backup_download';
const BACKUP_DISMISSED_KEY = 'expense_manager_backup_dismissed_session';

// Default settings
const DEFAULT_SCHEDULED_BACKUP_SETTINGS = {
  enabled: true,
  backupTime: '09:00', // Default backup time (9:00 AM - more reasonable for user interaction)
  frequency: 'daily',  // daily, weekly
  lastDownloadDate: null
};

/**
 * Get scheduled backup settings
 * @returns {Object} Scheduled backup settings
 */
export const getScheduledBackupSettings = () => {
  try {
    const saved = localStorage.getItem(SCHEDULED_BACKUP_SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SCHEDULED_BACKUP_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load scheduled backup settings:', e);
  }
  return { ...DEFAULT_SCHEDULED_BACKUP_SETTINGS };
};

/**
 * Save scheduled backup settings
 * @param {Object} settings - Settings to save
 */
export const saveScheduledBackupSettings = (settings) => {
  try {
    localStorage.setItem(SCHEDULED_BACKUP_SETTINGS_KEY, JSON.stringify(settings));
    // Clear dismissed state when settings change so user can see the prompt again
    clearDismissedState();
    return true;
  } catch (e) {
    console.error('Failed to save scheduled backup settings:', e);
    return false;
  }
};

/**
 * Clear the dismissed state (for when settings change)
 */
export const clearDismissedState = () => {
  try {
    sessionStorage.removeItem(BACKUP_DISMISSED_KEY);
  } catch (e) {
    // Ignore errors
  }
};

/**
 * Get the last backup download date
 * @returns {string|null} Date string (YYYY-MM-DD) or null
 */
export const getLastBackupDownloadDate = () => {
  try {
    const saved = localStorage.getItem(LAST_BACKUP_DOWNLOAD_KEY);
    return saved || null;
  } catch (e) {
    return null;
  }
};

/**
 * Record that a backup was downloaded
 */
export const recordBackupDownload = () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(LAST_BACKUP_DOWNLOAD_KEY, today);
    // Clear any dismissed state
    sessionStorage.removeItem(BACKUP_DISMISSED_KEY);
    return true;
  } catch (e) {
    console.error('Failed to record backup download:', e);
    return false;
  }
};

/**
 * Check if backup prompt was dismissed this session
 * @returns {boolean}
 */
export const isBackupDismissedThisSession = () => {
  try {
    return sessionStorage.getItem(BACKUP_DISMISSED_KEY) === 'true';
  } catch (e) {
    return false;
  }
};

/**
 * Dismiss backup prompt for this session
 */
export const dismissBackupForSession = () => {
  try {
    sessionStorage.setItem(BACKUP_DISMISSED_KEY, 'true');
  } catch (e) {
    console.error('Failed to dismiss backup:', e);
  }
};

/**
 * Check if a backup download is due
 * This checks if the scheduled time has passed and no backup was downloaded today
 * @returns {Object} { isDue: boolean, reason: string }
 */
export const isBackupDue = () => {
  const settings = getScheduledBackupSettings();
  
  if (!settings.enabled) {
    return { isDue: false, reason: 'Scheduled backups disabled' };
  }

  // Check if already dismissed this session
  if (isBackupDismissedThisSession()) {
    return { isDue: false, reason: 'Dismissed this session (click Remind Later clears on settings change)' };
  }

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const lastDownload = getLastBackupDownloadDate();
  
  // Parse backup time
  const [hours, minutes] = (settings.backupTime || '09:00').split(':').map(Number);
  const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
  
  // Debug info
  console.log('[Backup] Time check:', {
    currentTime: now.toLocaleTimeString(),
    scheduledTime: scheduledTime.toLocaleTimeString(),
    isPastSchedule: now >= scheduledTime,
    lastDownload,
    today
  });
  
  // Check if current time is past the scheduled backup time
  if (now < scheduledTime) {
    return { isDue: false, reason: `Scheduled time not reached (wait until ${scheduledTime.toLocaleTimeString()})` };
  }

  // Check frequency
  if (settings.frequency === 'daily') {
    // Check if we already downloaded today
    if (lastDownload === today) {
      return { isDue: false, reason: 'Already downloaded backup today' };
    }
    return { isDue: true, reason: 'Daily backup is due' };
  } else if (settings.frequency === 'weekly') {
    // Check if we downloaded within the last 7 days
    if (lastDownload) {
      const lastDownloadDate = new Date(lastDownload + 'T00:00:00');
      const daysSinceLastDownload = Math.floor((now - lastDownloadDate) / (1000 * 60 * 60 * 24));
      if (daysSinceLastDownload < 7) {
        return { isDue: false, reason: `Backup downloaded ${daysSinceLastDownload} days ago` };
      }
    }
    return { isDue: true, reason: 'Weekly backup is due' };
  }

  // First time - no previous backup
  if (!lastDownload) {
    return { isDue: true, reason: 'No previous backup found' };
  }

  return { isDue: false, reason: 'Backup not due yet' };
};

/**
 * Download backup file directly
 * @returns {Object} Result with success status
 */
export const downloadBackupNow = () => {
  try {
    const result = exportBackup();
    if (result.success) {
      recordBackupDownload();
    }
    return result;
  } catch (error) {
    console.error('Failed to download backup:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload backup to Google Drive
 * @returns {Object} Result with success status
 */
export const uploadBackupToDriveNow = async () => {
  try {
    const backup = createBackup();
    const result = await backupToDrive(backup);
    
    if (result.success) {
      recordBackupDownload(); // Count Drive upload as a backup
    }
    
    return result;
  } catch (error) {
    console.error('Failed to upload backup to Drive:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Perform scheduled backup - download and/or upload to Drive
 * @param {boolean} downloadLocal - Whether to download locally
 * @param {boolean} uploadDrive - Whether to upload to Drive
 * @returns {Object} Result with success status
 */
export const performScheduledBackup = async (downloadLocal = true, uploadDrive = false) => {
  const results = {
    localDownload: null,
    driveUpload: null,
    success: false
  };

  // Download locally
  if (downloadLocal) {
    results.localDownload = downloadBackupNow();
  }

  // Upload to Drive if enabled
  if (uploadDrive && isDriveConnected()) {
    const driveSettings = getDriveSettings();
    if (driveSettings.autoUpload) {
      results.driveUpload = await uploadBackupToDriveNow();
    }
  }

  // Consider success if at least one backup method succeeded
  results.success = 
    (results.localDownload?.success === true) || 
    (results.driveUpload?.success === true);

  return results;
};

/**
 * Check if Google Drive backup is available
 * @returns {boolean}
 */
export const isDriveBackupAvailable = () => {
  return isDriveConnected();
};

/**
 * Get backup info for display
 * @returns {Object} Info about backup status
 */
export const getBackupStatus = () => {
  const settings = getScheduledBackupSettings();
  const lastDownload = getLastBackupDownloadDate();
  const { isDue, reason } = isBackupDue();
  
  let daysSinceBackup = null;
  if (lastDownload) {
    const lastDate = new Date(lastDownload + 'T00:00:00');
    const now = new Date();
    daysSinceBackup = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
  }

  return {
    enabled: settings.enabled,
    backupTime: settings.backupTime,
    frequency: settings.frequency,
    lastDownload,
    daysSinceBackup,
    isDue,
    reason
  };
};

/**
 * Format backup time for display
 * @param {string} time24 - Time in 24-hour format (HH:mm)
 * @returns {string} Formatted time string
 */
export const formatBackupTime = (time24) => {
  if (!time24) return '9:00 AM';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Get days since last backup for warning display
 * @returns {number|null} Days since last backup or null if never backed up
 */
export const getDaysSinceLastBackup = () => {
  const lastDownload = getLastBackupDownloadDate();
  if (!lastDownload) return null;
  
  const lastDate = new Date(lastDownload + 'T00:00:00');
  const now = new Date();
  return Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
};

// Export default settings for reference
export { DEFAULT_SCHEDULED_BACKUP_SETTINGS };

export default {
  getScheduledBackupSettings,
  saveScheduledBackupSettings,
  getLastBackupDownloadDate,
  recordBackupDownload,
  isBackupDismissedThisSession,
  dismissBackupForSession,
  isBackupDue,
  downloadBackupNow,
  getBackupStatus,
  formatBackupTime,
  getDaysSinceLastBackup,
  DEFAULT_SCHEDULED_BACKUP_SETTINGS
};
