import React, { useState, useEffect } from 'react';
import { verifyPin } from '../utils/pin';
import { useSettings } from '../context/SettingsContext';

const PinEntry = ({ onSuccess }) => {
  const { isDark } = useSettings();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Auto-verify when 4 digits are entered
    if (pin.length === 4) {
      handleVerify();
    }
  }, [pin]);

  const handleVerify = () => {
    const result = verifyPin(pin);
    if (result.success) {
      onSuccess();
    } else {
      setError('Incorrect PIN');
      setAttempts(prev => prev + 1);
      setPin('');

      // Shake animation
      const input = document.getElementById('pin-input');
      if (input) {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
      }
    }
  };

  const handlePinInput = (value) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setPin(numericValue);
    setError('');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDark ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
          }
          .shake {
            animation: shake 0.5s;
          }
        `}
      </style>

      <div className={`max-w-md w-full rounded-2xl shadow-lg p-8 ${
        isDark ? 'bg-slate-800' : 'bg-white'
      }`}>
        <div className="text-center">
          <div className="mb-6">
            <span className="text-6xl">🔐</span>
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Enter Your PIN
          </h2>
          <p className={`mb-6 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            Enter your 4-digit PIN to access the app
          </p>

          <div className="mb-6">
            <input
              id="pin-input"
              type="password"
              inputMode="numeric"
              maxLength="4"
              value={pin}
              onChange={(e) => handlePinInput(e.target.value)}
              placeholder="****"
              autoFocus
              className={`w-full text-center text-4xl font-bold tracking-widest py-4 px-4 rounded-xl border-2 transition-colors ${
                error
                  ? 'border-red-500'
                  : isDark
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:border-primary-500`}
            />
          </div>

          {error && (
            <div className="mb-4">
              <p className="text-red-500 text-sm font-medium">{error}</p>
              {attempts >= 3 && (
                <p className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Too many failed attempts? You can clear app data from browser settings to reset.
                </p>
              )}
            </div>
          )}

          {/* PIN dots indicator */}
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all ${
                  pin.length > index
                    ? 'bg-primary-600 scale-110'
                    : isDark
                      ? 'bg-slate-600'
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={pin.length !== 4}
            className="w-full py-3 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinEntry;
