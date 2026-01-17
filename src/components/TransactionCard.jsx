import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/storage';
import { useExpense } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import ImageViewer from './ImageViewer';

const TransactionCard = ({ transaction, onDelete }) => {
  const navigate = useNavigate();
  const { getTagIcon } = useExpense();
  const { formatAmount, hideAmounts, isDark } = useSettings();
  const isExpense = transaction.type === 'expense';
  const [showImageViewer, setShowImageViewer] = useState(false);
  const hasImages = transaction.invoiceImages && transaction.invoiceImages.length > 0;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'done':
        return isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800';
      case 'pending':
        return isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
      case 'infuture':
        return isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800';
      default:
        return isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-800';
    }
  };

  // Get icons from context (dynamic based on user's tags)
  const categoryIcon = getTagIcon('categories', transaction.category);
  const payeeIcon = getTagIcon('payees', transaction.payee);
  const paymentIcon = getTagIcon('paymentMethods', transaction.paymentMethod);
  const statusIcon = getTagIcon('statuses', transaction.status);

  return (
    <div className={`rounded-xl shadow-sm p-4 mb-3 fade-in transition-colors ${
      isDark ? 'bg-slate-800' : 'bg-white'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`text-2xl w-10 h-10 flex items-center justify-center rounded-full ${
            isDark ? 'bg-slate-700' : 'bg-gray-100'
          }`}>
            {categoryIcon}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {transaction.description}
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {payeeIcon} {transaction.payee}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {categoryIcon} {transaction.category}
              </span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {paymentIcon} {transaction.paymentMethod}
              </span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                {statusIcon} {transaction.status}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-bold text-lg ${isExpense ? 'text-red-500' : 'text-green-500'} ${
            hideAmounts ? 'blur-md select-none' : ''
          }`}>
            {isExpense ? '-' : '+'}{formatAmount(transaction.amount)}
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            {formatDate(transaction.date)}
          </p>
        </div>
      </div>
      
      {/* Invoice Images Preview */}
      {hasImages && (
        <div className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <svg className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {transaction.invoiceImages.length} invoice{transaction.invoiceImages.length > 1 ? 's' : ''} attached
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {transaction.invoiceImages.slice(0, 4).map((image, index) => (
              <button
                key={image.id || index}
                onClick={() => setShowImageViewer(true)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border transition-colors ${
                  isDark 
                    ? 'border-slate-600 hover:border-primary-400' 
                    : 'border-gray-200 hover:border-primary-400'
                }`}
              >
                <img
                  src={image.data}
                  alt={`Invoice ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 3 && transaction.invoiceImages.length > 4 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      +{transaction.invoiceImages.length - 4}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className={`flex justify-end space-x-2 mt-3 pt-3 border-t ${
        isDark ? 'border-slate-700' : 'border-gray-100'
      }`}>
        {hasImages && (
          <button
            onClick={() => setShowImageViewer(true)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              isDark 
                ? 'text-slate-300 hover:bg-slate-700' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            View Invoices
          </button>
        )}
        <button
          onClick={() => navigate(`/edit/${transaction.id}`)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            isDark 
              ? 'text-primary-400 hover:bg-slate-700' 
              : 'text-primary-600 hover:bg-primary-50'
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete && onDelete(transaction.id)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            isDark 
              ? 'text-red-400 hover:bg-slate-700' 
              : 'text-red-600 hover:bg-red-50'
          }`}
        >
          Delete
        </button>
      </div>

      {/* Image Viewer Modal */}
      {showImageViewer && (
        <ImageViewer
          images={transaction.invoiceImages}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </div>
  );
};

export default TransactionCard;
