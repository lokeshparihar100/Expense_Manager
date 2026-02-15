import React, { useState } from 'react';
import { setPin, markPinSetupCompleted } from '../utils/pin';
import { useSettings } from '../context/SettingsContext';

const PinSetup = ({ onComplete }) => {
  const { isDark } = useSettings();
  const [step, setStep] = useState('intro'); // intro, set, confirm
  const [pin, setLocalPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleSkip = () => {
    markPinSetupCompleted();
    onComplete();
  };

  const handleSetPin = () => {
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }
    setError('');
    setStep('confirm');
  };

  const handleConfirmPin = () => {
    if (confirmPin !== pin) {
      setError('PINs do not match');
      setConfirmPin('');
      return;
    }

    const result = setPin(pin);
    if (result.success) {
      markPinSetupCompleted();
      onComplete();
    } else {
      setError(result.error);
    }
  };

  const handlePinInput = (value, isConfirm = false) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    if (isConfirm) {
      setConfirmPin(numericValue);
    } else {
      setLocalPin(numericValue);
    }
    setError('');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDark ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      <div className={`max-w-md w-full rounded-2xl shadow-lg p-8 ${
        isDark ? 'bg-slate-800' : 'bg-white'
      }`}>
        {step === 'intro' && (
          <div className="text-center">
            <div className="mb-6">
              <span className="text-6xl">🔒</span>
            </div>
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Secure Your Data
            </h2>
            <p className={`mb-6 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Add an extra layer of security to your expense manager by setting up a 4-digit PIN.
            </p>
            <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-blue-50'}`}>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                <strong>Optional Feature:</strong> You can always enable or disable PIN protection from Settings later.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setStep('set')}
                className="w-full py-3 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
              >
                Set Up PIN
              </button>
              <button
                onClick={handleSkip}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
                  isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Skip for Now
              </button>
            </div>
          </div>
        )}

        {step === 'set' && (
          <div className="text-center">
            <div className="mb-6">
              <span className="text-6xl">🔢</span>
            </div>
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Create Your PIN
            </h2>
            <p className={`mb-6 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Enter a 4-digit PIN that you'll remember
            </p>

            <div className="mb-6">
              <input
                type="password"
                inputMode="numeric"
                maxLength="4"
                value={pin}
                onChange={(e) => handlePinInput(e.target.value)}
                placeholder="****"
                autoFocus
                className={`w-full text-center text-4xl font-bold tracking-widest py-4 px-4 rounded-xl border-2 ${
                  error
                    ? 'border-red-500'
                    : isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:border-primary-500`}
              />
            </div>

            {error && (
              <p className="mb-4 text-red-500 text-sm">{error}</p>
            )}

            <div className="space-y-3">
              <button
                onClick={handleSetPin}
                disabled={pin.length !== 4}
                className="w-full py-3 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
              <button
                onClick={() => {
                  setStep('intro');
                  setLocalPin('');
                  setError('');
                }}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
                  isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="text-center">
            <div className="mb-6">
              <span className="text-6xl">✅</span>
            </div>
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Confirm Your PIN
            </h2>
            <p className={`mb-6 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Enter your PIN again to confirm
            </p>

            <div className="mb-6">
              <input
                type="password"
                inputMode="numeric"
                maxLength="4"
                value={confirmPin}
                onChange={(e) => handlePinInput(e.target.value, true)}
                placeholder="****"
                autoFocus
                className={`w-full text-center text-4xl font-bold tracking-widest py-4 px-4 rounded-xl border-2 ${
                  error
                    ? 'border-red-500'
                    : isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:border-primary-500`}
              />
            </div>

            {error && (
              <p className="mb-4 text-red-500 text-sm">{error}</p>
            )}

            <div className="space-y-3">
              <button
                onClick={handleConfirmPin}
                disabled={confirmPin.length !== 4}
                className="w-full py-3 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm & Continue
              </button>
              <button
                onClick={() => {
                  setStep('set');
                  setConfirmPin('');
                  setError('');
                }}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
                  isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PinSetup;
