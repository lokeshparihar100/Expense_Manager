import React, { useState, useEffect, useRef } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import { getTodayForInput } from '../utils/storage';
import ImageUpload from './ImageUpload';
import { suggestIconForText } from './IconPicker';
import Calculator from './Calculator';
import { REMINDER_TYPES, DURATION_UNITS, DURATION_UNIT_LABELS, durationToDays } from '../utils/reminders';

// Helper to format date for display
const formatDateForDisplay = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

const TransactionForm = ({
  initialData = null,
  type = 'expense',
  onSubmit,
  submitLabel = 'Save',
  onCancel
}) => {
  const { tags, addTag, transactions } = useExpense();
  const { isDark, defaultCurrency, currencies } = useSettings();
  
  const [formData, setFormData] = useState({
    type: type,
    amount: '',
    currency: defaultCurrency,
    description: '',
    payee: '',
    category: '',
    paymentMethod: '',
    status: 'Done',
    date: getTodayForInput(),
    notes: '',
    invoiceImages: [],
    // Reminder fields
    reminderType: REMINDER_TYPES.CUSTOM_DURATION,
    reminderValue: '1',
    reminderUnit: DURATION_UNITS.DAYS,
    reminderDate: ''
  });

  const [showCustomInput, setShowCustomInput] = useState({
    payee: false,
    category: false,
    paymentMethod: false
  });

  const [customValues, setCustomValues] = useState({
    payee: '',
    category: '',
    paymentMethod: ''
  });

  const [errors, setErrors] = useState({});
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Currency picker state
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const currencyPickerRef = useRef(null);
  
  // Close currency picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyPickerRef.current && !currencyPickerRef.current.contains(event.target)) {
        setShowCurrencyPicker(false);
        setCurrencySearch('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: initialData.date || getTodayForInput(),
        currency: initialData.currency || defaultCurrency,
        invoiceImages: initialData.invoiceImages || [],
        // Handle both old and new reminder format
        reminderType: initialData.reminderType || REMINDER_TYPES.CUSTOM_DURATION,
        reminderValue: initialData.reminderValue || '1',
        reminderUnit: initialData.reminderUnit || DURATION_UNITS.DAYS,
        reminderDate: initialData.reminderDate || ''
      });
    }
  }, [initialData, defaultCurrency]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, type }));
  }, [type]);

  // Function to find the most recent transaction for a given payee
  const findLastTransactionForPayee = (payeeName) => {
    if (!payeeName || !transactions || transactions.length === 0) return null;

    // Filter transactions by payee and sort by date (most recent first)
    const payeeTransactions = transactions
      .filter(t => t.payee === payeeName)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return payeeTransactions.length > 0 ? payeeTransactions[0] : null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (value === 'custom') {
      setShowCustomInput(prev => ({ ...prev, [name]: true }));
      return;
    }

    // Auto-fill category and payment method when payee is selected
    if (name === 'payee' && value && !initialData) {
      const lastTransaction = findLastTransactionForPayee(value);

      if (lastTransaction) {
        // Auto-fill from previous transaction
        setFormData(prev => ({
          ...prev,
          [name]: value,
          category: lastTransaction.category || '',
          paymentMethod: lastTransaction.paymentMethod || ''
        }));
      } else {
        // No previous transaction, set to "Other" if it exists in tags
        const otherCategory = tags.categories.find(c => c.name.toLowerCase() === 'other');
        const otherPaymentMethod = tags.paymentMethods.find(p => p.name.toLowerCase() === 'other');

        setFormData(prev => ({
          ...prev,
          [name]: value,
          category: otherCategory ? otherCategory.name : '',
          paymentMethod: otherPaymentMethod ? otherPaymentMethod.name : ''
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCustomChange = (field, value) => {
    setCustomValues(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCustom = (field) => {
    const value = customValues[field].trim();
    if (value) {
      const tagCategory = field === 'payee' ? 'payees' : 
                         field === 'category' ? 'categories' : 'paymentMethods';
      // Use smart icon suggestion based on the tag name
      const suggestedIcon = suggestIconForText(value);
      addTag(tagCategory, value, suggestedIcon);
      setFormData(prev => ({ ...prev, [field]: value }));
      setShowCustomInput(prev => ({ ...prev, [field]: false }));
      setCustomValues(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    // Description is now optional - removed validation
    if (!formData.payee) {
      newErrors.payee = 'Please select a payee';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }
    // Validate reminder date is required when specific date is selected
    if (formData.reminderType === REMINDER_TYPES.SPECIFIC_DATE &&
        (formData.status === 'InFuture' || formData.status === 'Pending') &&
        !formData.reminderDate) {
      newErrors.reminderDate = 'Please select a reminder date';
    }
    // Validate reminder value when custom duration is selected
    if (formData.reminderType === REMINDER_TYPES.CUSTOM_DURATION &&
        (formData.status === 'InFuture' || formData.status === 'Pending') &&
        (!formData.reminderValue || parseInt(formData.reminderValue) < 1)) {
      newErrors.reminderValue = 'Please enter a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const inputClasses = `w-full px-4 py-3 rounded-xl border focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all ${
    isDark 
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
      : 'bg-white border-gray-200 text-gray-900'
  }`;
  const labelClasses = `block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`;
  const errorClasses = "text-red-500 text-xs mt-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Transaction Type Toggle */}
      <div className={`flex rounded-xl p-1 ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
          className={`flex-1 py-3 rounded-lg font-medium transition-all ${
            formData.type === 'expense'
              ? 'bg-red-500 text-white shadow'
              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
          className={`flex-1 py-3 rounded-lg font-medium transition-all ${
            formData.type === 'income'
              ? 'bg-green-500 text-white shadow'
              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Income
        </button>
      </div>

      {/* Amount and Currency */}
      <div>
        <label className={labelClasses}>Amount *</label>
        <div className="flex gap-2">
          {/* Currency Selector with Search */}
          <div className="relative flex-shrink-0" ref={currencyPickerRef}>
            <button
              type="button"
              onClick={() => {
                setShowCurrencyPicker(!showCurrencyPicker);
                setCurrencySearch('');
              }}
              className={`${inputClasses} w-24 pr-7 text-sm flex items-center gap-1.5 cursor-pointer`}
            >
              <span>{currencies[formData.currency]?.flag}</span>
              <span>{formData.currency}</span>
            </button>
            <div className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {/* Currency Dropdown with Search */}
            {showCurrencyPicker && (
              <div className={`absolute left-0 top-full mt-1 w-64 rounded-xl shadow-lg z-50 overflow-hidden ${
                isDark ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-gray-200'
              }`}>
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search currency..."
                    value={currencySearch}
                    onChange={(e) => setCurrencySearch(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${
                      isDark 
                        ? 'bg-slate-600 text-white placeholder-slate-400 border-slate-500' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {Object.values(currencies)
                    .filter(c => 
                      c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
                      c.code.toLowerCase().includes(currencySearch.toLowerCase())
                    )
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(curr => (
                      <button
                        key={curr.code}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, currency: curr.code }));
                          setShowCurrencyPicker(false);
                          setCurrencySearch('');
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                          curr.code === formData.currency
                            ? isDark ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-700'
                            : isDark ? 'hover:bg-slate-600 text-white' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{curr.flag}</span>
                        <span className="font-medium">{curr.code}</span>
                        <span className={`text-xs truncate ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>{curr.name}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Amount Input */}
          <div className="relative flex-1">
            {/* Currency symbol with dynamic width */}
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {currencies[formData.currency]?.symbol || '$'}
            </span>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`${inputClasses}`}
              style={{ 
                paddingLeft: `${Math.max(2.5, 1 + (currencies[formData.currency]?.symbol?.length || 1) * 0.6)}rem` 
              }}
            />
          </div>
          
          {/* Calculator Button */}
          <button
            type="button"
            onClick={() => setShowCalculator(true)}
            className={`px-4 py-3 rounded-xl transition-colors flex items-center gap-2 ${
              isDark 
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="Open Calculator"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        {errors.amount && <p className={errorClasses}>{errors.amount}</p>}
        
        {/* Currency info hint */}
        {formData.currency !== defaultCurrency && (
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            💡 Recording in {currencies[formData.currency]?.name}. Default currency is {currencies[defaultCurrency]?.name}.
          </p>
        )}
      </div>

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <Calculator
            initialValue={formData.amount}
            onConfirm={(value) => {
              setFormData(prev => ({ ...prev, amount: value }));
              setErrors(prev => ({ ...prev, amount: '' }));
              setShowCalculator(false);
            }}
            onClose={() => setShowCalculator(false)}
          />
        </div>
      )}

      {/* Description */}
      <div>
        <label className={labelClasses}>Description (Optional)</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="What was this for?"
          className={inputClasses}
        />
        {errors.description && <p className={errorClasses}>{errors.description}</p>}
      </div>

      {/* Date */}
      <div>
        <label className={labelClasses}>Date *</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={inputClasses}
        />
        {errors.date && <p className={errorClasses}>{errors.date}</p>}
      </div>

      {/* Payee */}
      <div>
        <label className={labelClasses}>Payee *</label>
        {showCustomInput.payee ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={customValues.payee}
              onChange={(e) => handleCustomChange('payee', e.target.value)}
              placeholder="Enter custom payee"
              className={`${inputClasses} flex-1`}
            />
            <button
              type="button"
              onClick={() => handleAddCustom('payee')}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowCustomInput(prev => ({ ...prev, payee: false }))}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <select
            name="payee"
            value={formData.payee}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">Select payee</option>
            {tags.payees.map(payee => (
              <option key={payee.name} value={payee.name}>{payee.icon} {payee.name}</option>
            ))}
            <option value="custom">+ Add Custom</option>
          </select>
        )}
        {errors.payee && <p className={errorClasses}>{errors.payee}</p>}
      </div>

      {/* Category */}
      <div>
        <label className={labelClasses}>Category *</label>
        {showCustomInput.category ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={customValues.category}
              onChange={(e) => handleCustomChange('category', e.target.value)}
              placeholder="Enter custom category"
              className={`${inputClasses} flex-1`}
            />
            <button
              type="button"
              onClick={() => handleAddCustom('category')}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowCustomInput(prev => ({ ...prev, category: false }))}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">Select category</option>
            {tags.categories.map(category => (
              <option key={category.name} value={category.name}>{category.icon} {category.name}</option>
            ))}
            <option value="custom">+ Add Custom</option>
          </select>
        )}
        {errors.category && <p className={errorClasses}>{errors.category}</p>}
      </div>

      {/* Payment Method */}
      <div>
        <label className={labelClasses}>Payment Method *</label>
        {showCustomInput.paymentMethod ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={customValues.paymentMethod}
              onChange={(e) => handleCustomChange('paymentMethod', e.target.value)}
              placeholder="Enter custom payment method"
              className={`${inputClasses} flex-1`}
            />
            <button
              type="button"
              onClick={() => handleAddCustom('paymentMethod')}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowCustomInput(prev => ({ ...prev, paymentMethod: false }))}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">Select payment method</option>
            {tags.paymentMethods.map(method => (
              <option key={method.name} value={method.name}>{method.icon} {method.name}</option>
            ))}
            <option value="custom">+ Add Custom</option>
          </select>
        )}
        {errors.paymentMethod && <p className={errorClasses}>{errors.paymentMethod}</p>}
      </div>

      {/* Status */}
      <div>
        <label className={labelClasses}>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={inputClasses}
        >
          {tags.statuses.map(status => (
            <option key={status.name} value={status.name}>{status.icon} {status.name}</option>
          ))}
        </select>
      </div>

      {/* Reminder Settings - Only show for future/pending transactions */}
      {(formData.status === 'InFuture' || formData.status === 'Pending') && (
        <div className={`p-4 rounded-xl border ${
          isDark 
            ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-800' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
        }`}>
          <label className={labelClasses}>
            <span className="flex items-center gap-2">
              🔔 Reminder
            </span>
          </label>

          {/* Reminder Type Selection - Simple Radio-style Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { type: REMINDER_TYPES.NONE, label: 'No reminder', icon: '🔕' },
              { type: REMINDER_TYPES.ALWAYS, label: 'Every visit', icon: '🔄' },
              { type: REMINDER_TYPES.CUSTOM_DURATION, label: 'Before due', icon: '⏰' },
              { type: REMINDER_TYPES.SPECIFIC_DATE, label: 'Specific date', icon: '📅' }
            ].map(option => (
              <button
                key={option.type}
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, reminderType: option.type }));
                  setErrors(prev => ({ ...prev, reminderDate: '', reminderValue: '' }));
                }}
                className={`p-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 justify-center ${
                  formData.reminderType === option.type
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                }`}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          {/* Custom Duration Input */}
          {formData.reminderType === REMINDER_TYPES.CUSTOM_DURATION && (
            <div className="fade-in bg-white p-3 rounded-xl border border-blue-200">
              <p className="text-xs text-gray-500 mb-2">Remind me this many days/weeks/months before:</p>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  name="reminderValue"
                  value={formData.reminderValue}
                  onChange={handleChange}
                  min="1"
                  max="365"
                  className={`w-20 px-3 py-2 rounded-lg border text-center font-medium ${
                    errors.reminderValue ? 'border-red-500' : 'border-gray-200'
                  } focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                />
                <select
                  name="reminderUnit"
                  value={formData.reminderUnit}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {Object.entries(DURATION_UNIT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <span className="text-gray-600 font-medium">before</span>
              </div>
              {errors.reminderValue && <p className={errorClasses}>{errors.reminderValue}</p>}
              {formData.date && formData.reminderValue && (
                <p className="text-xs text-blue-600 mt-2">
                  📆 Will remind on {(() => {
                    const days = durationToDays(formData.reminderValue, formData.reminderUnit);
                    const dueDate = new Date(formData.date + 'T12:00:00');
                    const reminderDate = new Date(dueDate);
                    reminderDate.setDate(reminderDate.getDate() - days);
                    return formatDateForDisplay(reminderDate.toISOString().split('T')[0]);
                  })()}
                </p>
              )}
            </div>
          )}

          {/* Specific Date Picker */}
          {formData.reminderType === REMINDER_TYPES.SPECIFIC_DATE && (
            <div className="fade-in bg-white p-3 rounded-xl border border-blue-200">
              <p className="text-xs text-gray-500 mb-2">Select the date you want to be reminded:</p>
              <input
                type="date"
                name="reminderDate"
                value={formData.reminderDate}
                onChange={handleChange}
                min={getTodayForInput()}
                max={formData.date}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.reminderDate ? 'border-red-500' : 'border-gray-200'
                } focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
              />
              {errors.reminderDate && <p className={errorClasses}>{errors.reminderDate}</p>}
              {formData.reminderDate && (
                <p className="text-xs text-blue-600 mt-2">
                  📆 Will remind on {formatDateForDisplay(formData.reminderDate)}
                </p>
              )}
            </div>
          )}

          {/* Info text based on selection */}
          {formData.reminderType === REMINDER_TYPES.ALWAYS && (
            <p className="text-xs text-gray-500 mt-2">
              💡 You'll see a reminder every time you open the app
            </p>
          )}
          {formData.reminderType === REMINDER_TYPES.NONE && (
            <p className="text-xs text-gray-500 mt-2">
              💡 No reminder will be shown for this {formData.type === 'expense' ? 'payment' : 'income'}
            </p>
          )}
        </div>
      )}

      {/* Invoice Images */}
      <div>
        <label className={labelClasses}>Invoice Images (Optional)</label>
        <ImageUpload
          images={formData.invoiceImages}
          onChange={(images) => setFormData(prev => ({ ...prev, invoiceImages: images }))}
          maxImages={5}
        />
      </div>

      {/* Notes */}
      <div>
        <label className={labelClasses}>Notes (Optional)</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any additional notes..."
          rows={3}
          className={inputClasses}
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-colors ${
              isDark 
                ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={`flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-colors ${
            formData.type === 'expense'
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
