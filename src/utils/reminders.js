// Reminder utilities for future payments

const REMINDER_STORAGE_KEY = 'expense_manager_reminders';
const DISMISSED_REMINDERS_KEY = 'expense_manager_dismissed_reminders';

// Simplified reminder types
export const REMINDER_TYPES = {
  NONE: 'none',
  ALWAYS: 'always',
  CUSTOM_DURATION: 'custom_duration',
  SPECIFIC_DATE: 'specific_date'
};

// Duration units
export const DURATION_UNITS = {
  DAYS: 'days',
  WEEKS: 'weeks',
  MONTHS: 'months'
};

export const DURATION_UNIT_LABELS = {
  [DURATION_UNITS.DAYS]: 'Day(s)',
  [DURATION_UNITS.WEEKS]: 'Week(s)',
  [DURATION_UNITS.MONTHS]: 'Month(s)'
};

// Calculate days from duration
export const durationToDays = (value, unit) => {
  const num = parseInt(value) || 0;
  switch (unit) {
    case DURATION_UNITS.WEEKS:
      return num * 7;
    case DURATION_UNITS.MONTHS:
      return num * 30;
    case DURATION_UNITS.DAYS:
    default:
      return num;
  }
};

// Format reminder for display
export const formatReminderDisplay = (transaction) => {
  if (!transaction) return 'No reminder';
  
  const { reminderType, reminderValue, reminderUnit, reminderDate } = transaction;
  
  switch (reminderType) {
    case REMINDER_TYPES.NONE:
      return 'No reminder';
    case REMINDER_TYPES.ALWAYS:
      return 'Every time I visit';
    case REMINDER_TYPES.CUSTOM_DURATION:
      const unit = reminderUnit === DURATION_UNITS.WEEKS ? 'week' : 
                   reminderUnit === DURATION_UNITS.MONTHS ? 'month' : 'day';
      const plural = (parseInt(reminderValue) || 0) !== 1 ? 's' : '';
      return `${reminderValue} ${unit}${plural} before`;
    case REMINDER_TYPES.SPECIFIC_DATE:
      if (reminderDate) {
        return `On ${new Date(reminderDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
      return 'On specific date';
    default:
      return '1 day before';
  }
};

// Get reminder settings
export const getReminderSettings = () => {
  try {
    const settings = localStorage.getItem(REMINDER_STORAGE_KEY);
    const defaultSettings = {
      enabled: true,
      defaultReminderType: REMINDER_TYPES.CUSTOM_DURATION,
      defaultReminderValue: 1,
      defaultReminderUnit: DURATION_UNITS.DAYS,
      showOnStartup: true
    };
    return settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings;
  } catch {
    return {
      enabled: true,
      defaultReminderType: REMINDER_TYPES.CUSTOM_DURATION,
      defaultReminderValue: 1,
      defaultReminderUnit: DURATION_UNITS.DAYS,
      showOnStartup: true
    };
  }
};

// Save reminder settings
export const saveReminderSettings = (settings) => {
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(settings));
};

// Get dismissed reminders (with timestamps)
export const getDismissedReminders = () => {
  try {
    const dismissed = localStorage.getItem(DISMISSED_REMINDERS_KEY);
    return dismissed ? JSON.parse(dismissed) : {};
  } catch {
    return {};
  }
};

// Dismiss a reminder temporarily
export const dismissReminder = (transactionId, duration = 'session') => {
  const dismissed = getDismissedReminders();
  
  let dismissUntil;
  const now = new Date();
  
  switch (duration) {
    case 'hour':
      dismissUntil = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
      break;
    case 'day':
      dismissUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      break;
    case 'session':
    default:
      dismissUntil = 'session';
  }
  
  dismissed[transactionId] = {
    dismissedAt: now.toISOString(),
    dismissUntil
  };
  
  localStorage.setItem(DISMISSED_REMINDERS_KEY, JSON.stringify(dismissed));
};

// Check if reminder is dismissed
export const isReminderDismissed = (transactionId) => {
  const dismissed = getDismissedReminders();
  const dismissInfo = dismissed[transactionId];
  
  if (!dismissInfo) return false;
  
  if (dismissInfo.dismissUntil === 'session') {
    // Session dismissals are cleared on page reload
    // We'll handle this with sessionStorage instead
    return sessionStorage.getItem(`reminder_dismissed_${transactionId}`) === 'true';
  }
  
  const now = new Date();
  const dismissUntil = new Date(dismissInfo.dismissUntil);
  
  return now < dismissUntil;
};

// Dismiss for session only
export const dismissForSession = (transactionId) => {
  sessionStorage.setItem(`reminder_dismissed_${transactionId}`, 'true');
};

// Clear expired dismissals
export const clearExpiredDismissals = () => {
  const dismissed = getDismissedReminders();
  const now = new Date();
  const updated = {};
  
  for (const [id, info] of Object.entries(dismissed)) {
    if (info.dismissUntil === 'session') continue;
    
    const dismissUntil = new Date(info.dismissUntil);
    if (now < dismissUntil) {
      updated[id] = info;
    }
  }
  
  localStorage.setItem(DISMISSED_REMINDERS_KEY, JSON.stringify(updated));
};

// Get upcoming transactions that need reminders
export const getUpcomingReminders = (transactions, settings = null) => {
  const reminderSettings = settings || getReminderSettings();
  
  if (!reminderSettings.enabled) return [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDateLocal(today);
  
  // Filter for future/pending transactions
  const futureTransactions = transactions.filter(t => {
    // Only show InFuture or Pending status
    if (t.status !== 'InFuture' && t.status !== 'Pending') return false;
    
    // Check if dismissed
    if (isReminderDismissed(t.id)) return false;
    if (sessionStorage.getItem(`reminder_dismissed_${t.id}`) === 'true') return false;
    
    const transactionDate = new Date(t.date + 'T12:00:00');
    const daysUntil = Math.ceil((transactionDate - today) / (1000 * 60 * 60 * 24));
    
    // Get reminder type - support both old and new format
    const reminderType = t.reminderType || 
      (t.reminderFrequency === 'never' ? REMINDER_TYPES.NONE :
       t.reminderFrequency === 'always' ? REMINDER_TYPES.ALWAYS :
       t.reminderFrequency === 'custom_date' ? REMINDER_TYPES.SPECIFIC_DATE :
       REMINDER_TYPES.CUSTOM_DURATION);
    
    if (reminderType === REMINDER_TYPES.NONE) return false;
    
    // Check if should show based on reminder type
    switch (reminderType) {
      case REMINDER_TYPES.ALWAYS:
        return daysUntil >= -7 && daysUntil <= 30;
      
      case REMINDER_TYPES.SPECIFIC_DATE:
        if (t.reminderDate) {
          return t.reminderDate <= todayStr;
        }
        return daysUntil <= 1;
      
      case REMINDER_TYPES.CUSTOM_DURATION:
        // Calculate days from duration
        const reminderDays = durationToDays(
          t.reminderValue || 1, 
          t.reminderUnit || DURATION_UNITS.DAYS
        );
        return daysUntil <= reminderDays;
      
      default:
        // Fallback for old format transactions
        if (t.reminderFrequency) {
          switch (t.reminderFrequency) {
            case 'one_day': return daysUntil <= 1;
            case 'three_days': return daysUntil <= 3;
            case 'one_week': return daysUntil <= 7;
            case 'two_weeks': return daysUntil <= 14;
            case 'one_month': return daysUntil <= 30;
            default: return daysUntil <= 1;
          }
        }
        return daysUntil <= 1;
    }
  });
  
  // Sort by date (closest first)
  return futureTransactions.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });
};

// Helper to format date as YYYY-MM-DD
const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get count of upcoming reminders (for badge)
export const getUpcomingReminderCount = (transactions) => {
  return getUpcomingReminders(transactions).length;
};

export default {
  REMINDER_TYPES,
  DURATION_UNITS,
  DURATION_UNIT_LABELS,
  durationToDays,
  formatReminderDisplay,
  getReminderSettings,
  saveReminderSettings,
  getDismissedReminders,
  dismissReminder,
  dismissForSession,
  isReminderDismissed,
  clearExpiredDismissals,
  getUpcomingReminders,
  getUpcomingReminderCount
};
