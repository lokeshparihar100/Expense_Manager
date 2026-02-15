import React, { useState } from 'react';
import { setPin, changePin, removePin, isPinEnabled } from '../utils/pin';
import { useSettings } from '../context/SettingsContext';
import Modal from './Modal';

const PinManager = () => {
  const { isDark } = useSettings();
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [showRemovePinModal, setShowRemovePinModal] = useState(false);
  const [pin, setLocalPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [oldPin, setOldPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const pinEnabled = isPinEnabled();

  const resetForm = () => {
    setLocalPin('');
    setConfirmPin('');
    setOldPin('');
    setError('');
    setSuccess('');
  };

  const handleSetPin = () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    const result = setPin(pin);
    if (result.success) {
      setSuccess('PIN set successfully!');
      setTimeout(() => {
        setShowSetPinModal(false);
        resetForm();
        window.location.reload(); // Refresh to update UI
      }, 1500);
    } else {
      setError(result.error);
    }
  };

  const handleChangePin = () => {
    if (!oldPin || oldPin.length !== 4) {
      setError('Please enter your current PIN');
      return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('New PIN must be exactly 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      setError('New PINs do not match');
      return;
    }

    if (oldPin === pin) {
      setError('New PIN must be different from current PIN');
      return;
    }

    const result = changePin(oldPin, pin);
    if (result.success) {
      setSuccess('PIN changed successfully!');
      setTimeout(() => {
        setShowChangePinModal(false);
        resetForm();
      }, 1500);
    } else {
      setError(result.error);
    }
  };

  const handleRemovePin = () => {
    if (!pin || pin.length !== 4) {
      setError('Please enter your current PIN');
      return;
    }

    const result = removePin(pin);
    if (result.success) {
      setSuccess('PIN removed successfully!');
      setTimeout(() => {
        setShowRemovePinModal(false);
        resetForm();
        window.location.reload(); // Refresh to update UI
      }, 1500);
    } else {
      setError(result.error);
    }
  };

  const handlePinInput = (value, setter) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setter(numericValue);
    setError('');
    setSuccess('');
  };

  return (
    <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            PIN Protection
          </p>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            {pinEnabled ? 'PIN is currently enabled' : 'No PIN set'}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          pinEnabled
            ? isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'
            : isDark ? 'bg-slate-600 text-slate-300' : 'bg-gray-200 text-gray-600'
        }`}>
          {pinEnabled ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="space-y-2">
        {!pinEnabled ? (
          <button
            onClick={() => setShowSetPinModal(true)}
            className="w-full py-2 px-4 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Set PIN
          </button>
        ) : (
          <>
            <button
              onClick={() => setShowChangePinModal(true)}
              className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-slate-600 hover:bg-slate-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Change PIN
            </button>
            <button
              onClick={() => setShowRemovePinModal(true)}
              className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              Remove PIN
            </button>
          </>
        )}
      </div>

      {/* Set PIN Modal */}
      <Modal
        isOpen={showSetPinModal}
        onClose={() => {
          setShowSetPinModal(false);
          resetForm();
        }}
        title="Set PIN"
      >
        <div className="space-y-4">
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            Create a 4-digit PIN to protect your data
          </p>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              New PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength="4"
              value={pin}
              onChange={(e) => handlePinInput(e.target.value, setLocalPin)}
              placeholder="****"
              autoFocus
              className={`w-full text-center text-2xl font-bold tracking-widest py-3 px-4 rounded-xl border ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:border-primary-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Confirm PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength="4"
              value={confirmPin}
              onChange={(e) => handlePinInput(e.target.value, setConfirmPin)}
              placeholder="****"
              className={`w-full text-center text-2xl font-bold tracking-widest py-3 px-4 rounded-xl border ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:border-primary-500`}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <button
            onClick={handleSetPin}
            disabled={pin.length !== 4 || confirmPin.length !== 4}
            className="w-full py-3 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Set PIN
          </button>
        </div>
      </Modal>

      {/* Change PIN Modal */}
      <Modal
        isOpen={showChangePinModal}
        onClose={() => {
          setShowChangePinModal(false);
          resetForm();
        }}
        title="Change PIN"
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Current PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength="4"
              value={oldPin}
              onChange={(e) => handlePinInput(e.target.value, setOldPin)}
              placeholder="****"
              autoFocus
              className={`w-full text-center text-2xl font-bold tracking-widest py-3 px-4 rounded-xl border ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:border-primary-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              New PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength="4"
              value={pin}
              onChange={(e) => handlePinInput(e.target.value, setLocalPin)}
              placeholder="****"
              className={`w-full text-center text-2xl font-bold tracking-widest py-3 px-4 rounded-xl border ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:border-primary-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Confirm New PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength="4"
              value={confirmPin}
              onChange={(e) => handlePinInput(e.target.value, setConfirmPin)}
              placeholder="****"
              className={`w-full text-center text-2xl font-bold tracking-widest py-3 px-4 rounded-xl border ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:border-primary-500`}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <button
            onClick={handleChangePin}
            disabled={oldPin.length !== 4 || pin.length !== 4 || confirmPin.length !== 4}
            className="w-full py-3 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Change PIN
          </button>
        </div>
      </Modal>

      {/* Remove PIN Modal */}
      <Modal
        isOpen={showRemovePinModal}
        onClose={() => {
          setShowRemovePinModal(false);
          resetForm();
        }}
        title="Remove PIN"
      >
        <div className="space-y-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
            <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}>
              ⚠️ Removing PIN will disable security protection. Your data will be accessible without a PIN.
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Enter Current PIN to Confirm
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength="4"
              value={pin}
              onChange={(e) => handlePinInput(e.target.value, setLocalPin)}
              placeholder="****"
              autoFocus
              className={`w-full text-center text-2xl font-bold tracking-widest py-3 px-4 rounded-xl border ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:border-primary-500`}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <button
            onClick={handleRemovePin}
            disabled={pin.length !== 4}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-red-900/50 text-red-400 hover:bg-red-900/70'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            Remove PIN
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PinManager;
