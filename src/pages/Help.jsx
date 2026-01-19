import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const Help = () => {
  const navigate = useNavigate();
  const { isDark } = useSettings();
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if installed
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);
    // Check if iOS
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
  }, []);

  const faqs = [
    {
      q: 'How do I add a transaction?',
      a: 'Tap the "+" button in the bottom navigation, fill in the details (amount, description, category, etc.), and tap "Add Transaction".'
    },
    {
      q: 'How do I use multiple currencies?',
      a: 'When adding a transaction, select the currency from the dropdown. Go to Settings → Currency Settings to set your home currency and current travel currency. Reports can convert all currencies to your home currency.'
    },
    {
      q: 'How do I update exchange rates?',
      a: 'Go to Settings → Currency Settings → Exchange Rates. Tap "Fetch Live Rates" for internet rates, or "Edit" to manually enter rates. Rates are used for converting reports to your home currency.'
    },
    {
      q: 'How do I set up reminders?',
      a: 'When adding a transaction, set the status to "InFuture" or "Pending". Then choose a reminder option: before due date or specific date.'
    },
    {
      q: 'How do I backup my data?',
      a: 'Go to Settings → Export Backup. This downloads a JSON file with all your data including transactions and images.'
    },
    {
      q: 'Can I use the app offline?',
      a: 'Yes! Once installed, the app works completely offline. All data is stored on your device.'
    },
    {
      q: 'How do I hide my amounts?',
      a: 'Tap the eye icon (👁️) in the top header bar. This blurs all amounts for privacy.'
    },
    {
      q: 'How do I change the theme?',
      a: 'Tap the theme icon in the top header bar to cycle through Light → Dark → System. Or go to Settings → Appearance.'
    },
    {
      q: 'Where is my data stored?',
      a: 'All data is stored locally on your device in browser storage. No data is sent to any server.'
    },
    {
      q: 'How do I add custom categories?',
      a: 'Go to Settings → Manage Tags. You can add, edit, or delete categories, payees, and payment methods with custom icons.'
    }
  ];

  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <div className="p-4 pt-2 pb-24">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className={`p-2 -ml-2 rounded-full transition-colors ${
            isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
          }`}
        >
          <svg className={`w-6 h-6 ${isDark ? 'text-slate-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className={`text-xl font-bold ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Help & About
        </h1>
      </div>

      {/* Install Section - Only show if not installed */}
      {!isInstalled && (
        <div className={`rounded-2xl p-4 mb-4 shadow-sm ${
          isDark ? 'bg-gradient-to-r from-primary-900/50 to-purple-900/50 border border-primary-800' : 'bg-gradient-to-r from-primary-50 to-purple-50'
        }`}>
          <h2 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <span className="text-xl">📲</span>
            Install the App
          </h2>
          <p className={`text-sm mb-3 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            Install for quick access from your home screen, even offline!
          </p>
          
          {isIOS ? (
            <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              <p className="font-medium mb-2">On iPhone/iPad:</p>
              <ol className="space-y-1 ml-4 list-decimal">
                <li>Tap the <strong>Share button</strong> (⬆️) below</li>
                <li>Tap <strong>"Add to Home Screen"</strong></li>
                <li>Tap <strong>"Add"</strong></li>
              </ol>
            </div>
          ) : (
            <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              <p className="font-medium mb-2">On Android/Desktop:</p>
              <ol className="space-y-1 ml-4 list-decimal">
                <li>Look for the <strong>Install</strong> prompt or button</li>
                <li>Or tap <strong>Menu (⋮)</strong> → <strong>"Install app"</strong></li>
                <li>Tap <strong>"Install"</strong></li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Quick Start */}
      <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <h2 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-xl">🚀</span>
          Quick Start
        </h2>
        
        <div className="space-y-3">
          {[
            { icon: '➕', title: 'Add Transaction', desc: 'Tap + button to add expense or income' },
            { icon: '📋', title: 'View History', desc: 'See all transactions with filters' },
            { icon: '📊', title: 'Reports', desc: 'Charts and analytics of your spending' },
            { icon: '⚙️', title: 'Settings', desc: 'Theme, backup, reminders, and more' }
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${
              isDark ? 'bg-slate-700' : 'bg-gray-50'
            }`}>
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <h2 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-xl">✨</span>
          Key Features
        </h2>
        
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: '💰', label: 'Track Expenses' },
            { icon: '📈', label: 'Income Tracking' },
            { icon: '🏷️', label: 'Custom Tags' },
            { icon: '🔔', label: 'Reminders' },
            { icon: '📸', label: 'Receipt Images' },
            { icon: '📊', label: 'Charts & Reports' },
            { icon: '💾', label: 'Backup & Restore' },
            { icon: '🧮', label: 'Calculator' },
            { icon: '🌙', label: 'Dark Mode' },
            { icon: '👁️', label: 'Privacy Mode' },
            { icon: '📱', label: 'Works Offline' },
            { icon: '🔒', label: 'Local Storage' }
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${
              isDark ? 'bg-slate-700' : 'bg-gray-50'
            }`}>
              <span>{item.icon}</span>
              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <h2 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-xl">❓</span>
          FAQ
        </h2>
        
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div 
              key={i}
              className={`rounded-xl overflow-hidden ${
                isDark ? 'bg-slate-700' : 'bg-gray-50'
              }`}
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className={`w-full p-3 text-left flex items-center justify-between ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                <span className="font-medium text-sm">{faq.q}</span>
                <svg 
                  className={`w-5 h-5 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedFaq === i && (
                <div className={`px-3 pb-3 text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
            💰
          </div>
          <div>
            <h3 className="font-bold">Daily Expense Manager</h3>
            <p className="text-sm opacity-90">Version 1.0.0</p>
          </div>
        </div>
        <p className="text-sm opacity-90 mb-3">
          A simple, powerful expense tracker that works entirely on your device. 
          No account needed, no data sent to servers, completely private.
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 bg-white/20 rounded-full">React</span>
          <span className="px-2 py-1 bg-white/20 rounded-full">Tailwind CSS</span>
          <span className="px-2 py-1 bg-white/20 rounded-full">PWA</span>
          <span className="px-2 py-1 bg-white/20 rounded-full">LocalStorage</span>
        </div>
      </div>
    </div>
  );
};

export default Help;