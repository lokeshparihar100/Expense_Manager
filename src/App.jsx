import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ExpenseProvider } from './context/ExpenseContext';
import { SettingsProvider } from './context/SettingsContext';
import { AccountProvider } from './context/AccountContext';
import Layout from './components/Layout';
import InstallPrompt from './components/InstallPrompt';
import ScheduledBackupManager from './components/ScheduledBackupManager';
import PinSetup from './components/PinSetup';
import PinEntry from './components/PinEntry';
import { isPinSetupCompleted, isPinEnabled } from './utils/pin';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import EditTransaction from './pages/EditTransaction';
import TransactionList from './pages/TransactionList';
import ManageTags from './pages/ManageTags';
import Statistics from './pages/Statistics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Help from './pages/Help';

// Get base path from Vite (for GitHub Pages deployment)
const basePath = import.meta.env.BASE_URL || '/';

function App() {
  const [pinSetupDone, setPinSetupDone] = useState(isPinSetupCompleted());
  const [pinVerified, setPinVerified] = useState(!isPinEnabled());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check PIN status on mount
    const setupDone = isPinSetupCompleted();
    const pinActive = isPinEnabled();

    setPinSetupDone(setupDone);
    setPinVerified(!pinActive);
    setIsLoading(false);
  }, []);

  const handlePinSetupComplete = () => {
    setPinSetupDone(true);
    setPinVerified(true);
  };

  const handlePinVerifySuccess = () => {
    setPinVerified(true);
  };

  // Show loading state briefly
  if (isLoading) {
    return null;
  }

  // First time: Show PIN setup
  if (!pinSetupDone) {
    return (
      <SettingsProvider>
        <PinSetup onComplete={handlePinSetupComplete} />
      </SettingsProvider>
    );
  }

  // PIN enabled but not verified: Show PIN entry
  if (!pinVerified) {
    return (
      <SettingsProvider>
        <PinEntry onSuccess={handlePinVerifySuccess} />
      </SettingsProvider>
    );
  }

  // Normal app flow
  return (
    <SettingsProvider>
      <AccountProvider>
        <ExpenseProvider>
          <Router basename={basePath}>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add" element={<AddTransaction />} />
                <Route path="/add/:type" element={<AddTransaction />} />
                <Route path="/edit/:id" element={<EditTransaction />} />
                <Route path="/transactions" element={<TransactionList />} />
                <Route path="/tags" element={<ManageTags />} />
                <Route path="/stats" element={<Statistics />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/help" element={<Help />} />
              </Routes>
              <InstallPrompt />
              <ScheduledBackupManager />
            </Layout>
          </Router>
        </ExpenseProvider>
      </AccountProvider>
    </SettingsProvider>
  );
}

export default App;
