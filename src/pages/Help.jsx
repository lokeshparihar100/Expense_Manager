import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

// GitHub repository info
const GITHUB_REPO_OWNER = 'lokeshparihar100';
const GITHUB_REPO_NAME = 'Expense_Manager';

// Get device/browser info for bug reports
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';
  
  // Detect browser
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  
  // Detect OS
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  return {
    browser,
    os,
    isStandalone,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    appVersion: '1.5.0'
  };
};

const Help = () => {
  const navigate = useNavigate();
  const { isDark } = useSettings();
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  // Bug report form state
  const [showBugReport, setShowBugReport] = useState(false);
  const [bugReport, setBugReport] = useState({
    title: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    severity: 'medium',
    category: 'bug'
  });

  useEffect(() => {
    // Check if installed
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);
    // Check if iOS
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
  }, []);
  
  // Handle bug report form changes
  const handleBugReportChange = (field, value) => {
    setBugReport(prev => ({ ...prev, [field]: value }));
  };
  
  // Generate GitHub issue URL
  const generateGitHubIssueUrl = () => {
    const deviceInfo = getDeviceInfo();
    
    const title = encodeURIComponent(`[${bugReport.category.toUpperCase()}] ${bugReport.title}`);
    
    const body = encodeURIComponent(`## Description
${bugReport.description}

## Steps to Reproduce
${bugReport.stepsToReproduce || 'N/A'}

## Expected Behavior
${bugReport.expectedBehavior || 'N/A'}

## Actual Behavior
${bugReport.actualBehavior || 'N/A'}

## Severity
${bugReport.severity}

## Environment
- **App Version**: ${deviceInfo.appVersion}
- **Browser**: ${deviceInfo.browser}
- **OS**: ${deviceInfo.os}
- **Screen Size**: ${deviceInfo.screenSize}
- **Installed as PWA**: ${deviceInfo.isStandalone ? 'Yes' : 'No'}

---
*This issue was generated from the in-app bug report form.*`);

    const labels = encodeURIComponent(bugReport.category === 'bug' ? 'bug' : 'enhancement');
    
    return `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues/new?title=${title}&body=${body}&labels=${labels}`;
  };
  
  // Submit bug report (opens GitHub issue page)
  const handleSubmitBugReport = () => {
    if (!bugReport.title.trim()) {
      alert('Please enter a title for your report');
      return;
    }
    if (!bugReport.description.trim()) {
      alert('Please describe the issue');
      return;
    }
    
    const url = generateGitHubIssueUrl();
    window.open(url, '_blank');
    
    // Reset form
    setBugReport({
      title: '',
      description: '',
      stepsToReproduce: '',
      expectedBehavior: '',
      actualBehavior: '',
      severity: 'medium',
      category: 'bug'
    });
    setShowBugReport(false);
  };

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
      a: 'Go to Settings → Export Backup for a manual backup. The app also has Scheduled Backup feature that automatically backs up your data daily at a configurable time.'
    },
    {
      q: 'What is Scheduled Backup?',
      a: 'Scheduled Backup reminds you to download a backup file at a set time (default: 9:00 AM daily). When you open or refresh the app AFTER the scheduled time passes, a popup asks you to download your backup. The backup file is saved to your device, keeping your data safe even if browser data is cleared. Check the User Guide for detailed trigger conditions.'
    },
    {
      q: 'How do I use Google Drive backup?',
      a: 'Go to Settings → Google Drive Backup. Enter your Google Client ID (requires one-time setup in Google Cloud Console), then connect your account. Once connected, enable "Auto Upload" and scheduled backups will automatically upload to Drive - no download popup needed! Your backups are stored in a dedicated folder in your Google Drive.'
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
    },
    {
      q: 'How do I report a bug or request a feature?',
      a: 'Scroll down to the "Report an Issue" section below. Click "Report Bug" or "Request Feature", fill in the details, and click "Submit on GitHub". This opens a pre-filled issue on GitHub. Device info is automatically included to help debug.'
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
            { icon: '☁️', label: 'Google Drive Sync' },
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

      {/* Report Issue / Bug Report */}
      <div className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <h2 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-xl">🐛</span>
          Report an Issue
        </h2>
        
        {!showBugReport ? (
          <div>
            <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Found a bug or have a feature request? Let us know! Your report will be submitted as a GitHub issue.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setBugReport(prev => ({ ...prev, category: 'bug' }));
                  setShowBugReport(true);
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-colors ${
                  isDark 
                    ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                <span>🐛</span>
                Report Bug
              </button>
              <button
                onClick={() => {
                  setBugReport(prev => ({ ...prev, category: 'feature' }));
                  setShowBugReport(true);
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-colors ${
                  isDark 
                    ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' 
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <span>💡</span>
                Request Feature
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Category Toggle */}
            <div className={`flex rounded-xl p-1 ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <button
                type="button"
                onClick={() => handleBugReportChange('category', 'bug')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  bugReport.category === 'bug'
                    ? 'bg-red-500 text-white shadow'
                    : isDark ? 'text-slate-400' : 'text-gray-600'
                }`}
              >
                <span>🐛</span> Bug Report
              </button>
              <button
                type="button"
                onClick={() => handleBugReportChange('category', 'feature')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  bugReport.category === 'feature'
                    ? 'bg-blue-500 text-white shadow'
                    : isDark ? 'text-slate-400' : 'text-gray-600'
                }`}
              >
                <span>💡</span> Feature Request
              </button>
            </div>

            {/* Title */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bugReport.title}
                onChange={(e) => handleBugReportChange('title', e.target.value)}
                placeholder={bugReport.category === 'bug' ? 'Brief description of the bug' : 'Feature you would like'}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-200 ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={bugReport.description}
                onChange={(e) => handleBugReportChange('description', e.target.value)}
                placeholder={bugReport.category === 'bug' 
                  ? 'Describe the issue in detail. What did you expect to happen? What actually happened?' 
                  : 'Describe the feature you would like. How would it help you?'
                }
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-200 ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
            </div>

            {/* Steps to Reproduce - Only for bugs */}
            {bugReport.category === 'bug' && (
              <>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    Steps to Reproduce
                  </label>
                  <textarea
                    value={bugReport.stepsToReproduce}
                    onChange={(e) => handleBugReportChange('stepsToReproduce', e.target.value)}
                    placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-200 ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      Expected Behavior
                    </label>
                    <textarea
                      value={bugReport.expectedBehavior}
                      onChange={(e) => handleBugReportChange('expectedBehavior', e.target.value)}
                      placeholder="What should happen"
                      rows={2}
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-200 text-sm ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      Actual Behavior
                    </label>
                    <textarea
                      value={bugReport.actualBehavior}
                      onChange={(e) => handleBugReportChange('actualBehavior', e.target.value)}
                      placeholder="What actually happens"
                      rows={2}
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-200 text-sm ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Severity */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    Severity
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'low', label: 'Low', color: 'green' },
                      { value: 'medium', label: 'Medium', color: 'yellow' },
                      { value: 'high', label: 'High', color: 'orange' },
                      { value: 'critical', label: 'Critical', color: 'red' }
                    ].map(sev => (
                      <button
                        key={sev.value}
                        type="button"
                        onClick={() => handleBugReportChange('severity', sev.value)}
                        className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                          bugReport.severity === sev.value
                            ? sev.color === 'green' ? 'bg-green-500 text-white'
                              : sev.color === 'yellow' ? 'bg-yellow-500 text-white'
                              : sev.color === 'orange' ? 'bg-orange-500 text-white'
                              : 'bg-red-500 text-white'
                            : isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {sev.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Device Info Preview */}
            <div className={`p-3 rounded-xl text-xs ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <p className={`font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                📱 Device info will be included:
              </p>
              <p className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {(() => {
                  const info = getDeviceInfo();
                  return `${info.browser} on ${info.os}, Screen: ${info.screenSize}, PWA: ${info.isStandalone ? 'Yes' : 'No'}`;
                })()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowBugReport(false)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                  isDark 
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitBugReport}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-white transition-colors flex items-center justify-center gap-2 ${
                  bugReport.category === 'bug'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Submit on GitHub
              </button>
            </div>

            <p className={`text-xs text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              This will open GitHub in a new tab with your report pre-filled. 
              You may need a GitHub account to submit.
            </p>
          </div>
        )}
      </div>

      {/* About */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
            💰
          </div>
          <div>
            <h3 className="font-bold">Daily Expense Manager</h3>
            <p className="text-sm opacity-90">Version 1.5.0</p>
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