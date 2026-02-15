// PIN Security Utilities

const PIN_KEY = 'expense_manager_pin';
const PIN_ENABLED_KEY = 'expense_manager_pin_enabled';
const PIN_SETUP_COMPLETED_KEY = 'expense_manager_pin_setup_completed';

/**
 * Simple hash function for PIN (not cryptographically secure, but sufficient for local app)
 */
const hashPin = (pin) => {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

/**
 * Check if PIN setup has been completed
 */
export const isPinSetupCompleted = () => {
  return localStorage.getItem(PIN_SETUP_COMPLETED_KEY) === 'true';
};

/**
 * Mark PIN setup as completed
 */
export const markPinSetupCompleted = () => {
  localStorage.setItem(PIN_SETUP_COMPLETED_KEY, 'true');
};

/**
 * Check if PIN is enabled
 */
export const isPinEnabled = () => {
  return localStorage.getItem(PIN_ENABLED_KEY) === 'true';
};

/**
 * Set PIN and enable it
 */
export const setPin = (pin) => {
  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    return { success: false, error: 'PIN must be exactly 4 digits' };
  }

  try {
    const hashedPin = hashPin(pin);
    localStorage.setItem(PIN_KEY, hashedPin);
    localStorage.setItem(PIN_ENABLED_KEY, 'true');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to set PIN' };
  }
};

/**
 * Verify PIN
 */
export const verifyPin = (pin) => {
  if (!isPinEnabled()) {
    return { success: true }; // PIN not enabled, allow access
  }

  const storedHash = localStorage.getItem(PIN_KEY);
  if (!storedHash) {
    return { success: false, error: 'No PIN set' };
  }

  const inputHash = hashPin(pin);
  if (inputHash === storedHash) {
    return { success: true };
  }

  return { success: false, error: 'Incorrect PIN' };
};

/**
 * Change PIN (requires old PIN verification)
 */
export const changePin = (oldPin, newPin) => {
  // Verify old PIN
  const verification = verifyPin(oldPin);
  if (!verification.success) {
    return { success: false, error: 'Current PIN is incorrect' };
  }

  // Set new PIN
  return setPin(newPin);
};

/**
 * Remove PIN
 */
export const removePin = (pin) => {
  // Verify PIN before removing
  const verification = verifyPin(pin);
  if (!verification.success) {
    return { success: false, error: 'Incorrect PIN' };
  }

  try {
    localStorage.removeItem(PIN_KEY);
    localStorage.setItem(PIN_ENABLED_KEY, 'false');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to remove PIN' };
  }
};

/**
 * Check if PIN is set
 */
export const hasPinSet = () => {
  return localStorage.getItem(PIN_KEY) !== null;
};
