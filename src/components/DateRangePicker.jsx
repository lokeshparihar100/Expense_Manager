import React, { useState } from 'react';

// Helper function to format date as YYYY-MM-DD in local timezone
const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DateRangePicker = ({ startDate, endDate, onDateChange, onPresetSelect }) => {
  const [showCustom, setShowCustom] = useState(false);

  const currentYear = new Date().getFullYear();
  
  // Generate year options (last 5 years + next 2 years)
  const years = [];
  for (let y = currentYear - 5; y <= currentYear + 2; y++) {
    years.push(y);
  }

  const presets = [
    { label: 'Today', key: 'today' },
    { label: 'Yesterday', key: 'yesterday' },
    { label: 'This Week', key: 'thisWeek' },
    { label: 'Last Week', key: 'lastWeek' },
    { label: 'This Month', key: 'thisMonth' },
    { label: 'Last Month', key: 'lastMonth' },
    { label: 'Last 3 Months', key: 'last3Months' },
    { label: 'Last 6 Months', key: 'last6Months' },
    { label: 'This Year', key: 'thisYear' },
    { label: 'Last Year', key: 'lastYear' },
  ];

  const getDateRange = (preset) => {
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Set to noon to avoid timezone edge cases
    
    let start, end;

    switch (preset) {
      case 'today':
        start = new Date(today);
        end = new Date(today);
        break;
      case 'yesterday':
        start = new Date(today);
        start.setDate(today.getDate() - 1);
        end = new Date(start);
        break;
      case 'thisWeek':
        start = new Date(today);
        start.setDate(today.getDate() - today.getDay());
        end = new Date(today);
        break;
      case 'lastWeek':
        start = new Date(today);
        start.setDate(today.getDate() - today.getDay() - 7);
        end = new Date(start);
        end.setDate(end.getDate() + 6);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1, 12, 0, 0);
        end = new Date(today);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1, 12, 0, 0);
        end = new Date(today.getFullYear(), today.getMonth(), 0, 12, 0, 0);
        break;
      case 'last3Months':
        start = new Date(today);
        start.setMonth(start.getMonth() - 3);
        end = new Date(today);
        break;
      case 'last6Months':
        start = new Date(today);
        start.setMonth(start.getMonth() - 6);
        end = new Date(today);
        break;
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1, 12, 0, 0);
        end = new Date(today);
        break;
      case 'lastYear':
        start = new Date(today.getFullYear() - 1, 0, 1, 12, 0, 0);
        end = new Date(today.getFullYear() - 1, 11, 31, 12, 0, 0);
        break;
      default:
        // Year selection (e.g., "2025", "2026")
        if (/^\d{4}$/.test(preset)) {
          const year = parseInt(preset);
          start = new Date(year, 0, 1, 12, 0, 0);
          end = new Date(year, 11, 31, 12, 0, 0);
        } else {
          start = new Date(today);
          end = new Date(today);
        }
    }

    return {
      start: formatDateLocal(start),
      end: formatDateLocal(end)
    };
  };

  const handlePresetClick = (presetKey) => {
    const range = getDateRange(presetKey);
    onPresetSelect(presetKey, range);
    setShowCustom(false);
  };

  const handleYearClick = (year) => {
    const range = getDateRange(year.toString());
    onPresetSelect(`year-${year}`, range);
    setShowCustom(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Date Range
      </h3>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((preset) => (
          <button
            key={preset.key}
            onClick={() => handlePresetClick(preset.key)}
            className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Year Selection */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">Select Year:</p>
        <div className="flex flex-wrap gap-2">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => handleYearClick(year)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                year === currentYear
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Range Toggle */}
      <button
        onClick={() => setShowCustom(!showCustom)}
        className="flex items-center gap-2 text-sm text-primary-600 font-medium mb-3"
      >
        <svg className={`w-4 h-4 transition-transform ${showCustom ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Custom Date Range
      </button>

      {/* Custom Date Inputs */}
      {showCustom && (
        <div className="grid grid-cols-2 gap-3 fade-in">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onDateChange('start', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onDateChange('end', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
          </div>
        </div>
      )}

      {/* Selected Range Display */}
      {(startDate || endDate) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Selected:</span>{' '}
            {startDate && new Date(startDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {' — '}
            {endDate && new Date(endDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
