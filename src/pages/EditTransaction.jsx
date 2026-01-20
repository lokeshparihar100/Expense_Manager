import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExpense } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import TransactionForm from '../components/TransactionForm';

const EditTransaction = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getTransactionById, updateTransaction } = useExpense();
  const { isDark } = useSettings();

  const transaction = getTransactionById(id);

  const handleSubmit = (formData) => {
    updateTransaction(id, formData);
    navigate('/');
  };

  if (!transaction) {
    return (
      <div className="p-4">
        <div className={`text-center py-12 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="text-4xl mb-4">🔍</div>
          <p className={`mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Transaction not found</p>
          <button
            onClick={() => navigate('/')}
            className="inline-block px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className={`p-2 -ml-2 rounded-full transition-colors ${
            isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
          }`}
        >
          <svg className={`w-6 h-6 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className={`text-xl font-bold ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit Transaction</h1>
      </div>

      {/* Form */}
      <div className={`rounded-2xl p-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <TransactionForm
          initialData={transaction}
          type={transaction.type}
          onSubmit={handleSubmit}
          submitLabel="Update Transaction"
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default EditTransaction;
