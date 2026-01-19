import React from 'react';
import { useSettings } from '../context/SettingsContext';

const StatCard = ({ title, amount, type = 'neutral', icon, currency = null, subtitle = null }) => {
  const { formatAmount, hideAmounts } = useSettings();
  
  const getColorClasses = () => {
    switch (type) {
      case 'income':
        return 'bg-green-500 text-white';
      case 'expense':
        return 'bg-red-500 text-white';
      case 'balance':
        return amount >= 0 ? 'bg-primary-600 text-white' : 'bg-orange-500 text-white';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  return (
    <div className={`rounded-2xl p-4 ${getColorClasses()} shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm opacity-90">{title}</span>
          {subtitle && (
            <span className="text-xs opacity-75 ml-1">({subtitle})</span>
          )}
        </div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className={`text-2xl font-bold ${hideAmounts ? 'blur-md select-none' : ''}`}>
        {type === 'expense' && amount > 0 && '-'}
        {formatAmount(Math.abs(amount), currency)}
      </p>
    </div>
  );
};

export default StatCard;
