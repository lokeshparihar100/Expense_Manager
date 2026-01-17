import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExpense } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import TransactionForm from '../components/TransactionForm';

const AddTransaction = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const { addTransaction } = useExpense();
  const { isDark } = useSettings();

  const transactionType = type === 'income' ? 'income' : 'expense';

  const handleSubmit = (formData) => {
    addTransaction(formData);
    navigate('/');
  };

  return (
    <div className="p-4 pt-2">
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
          Add Transaction
        </h1>
      </div>

      {/* Form */}
      <div className={`rounded-2xl p-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <TransactionForm
          type={transactionType}
          onSubmit={handleSubmit}
          submitLabel="Add Transaction"
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default AddTransaction;
