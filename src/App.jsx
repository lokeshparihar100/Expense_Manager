import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ExpenseProvider } from './context/ExpenseContext';
import { SettingsProvider } from './context/SettingsContext';
import Layout from './components/Layout';
import InstallPrompt from './components/InstallPrompt';
import ScheduledBackupManager from './components/ScheduledBackupManager';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import EditTransaction from './pages/EditTransaction';
import TransactionList from './pages/TransactionList';
import ManageTags from './pages/ManageTags';
import Statistics from './pages/Statistics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Help from './pages/Help';

function App() {
  return (
    <SettingsProvider>
      <ExpenseProvider>
        <Router>
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
    </SettingsProvider>
  );
}

export default App;
