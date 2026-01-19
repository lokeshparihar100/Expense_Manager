import React, { useState, useMemo } from 'react';
import { useSettings } from '../context/SettingsContext';

// Helper function to format date as YYYY-MM-DD in local timezone
const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DateRangePicker = ({ startDate, endDate, onDateChange, onPresetSelect }) => {
  const { isDark } = useSettings();
  const [showCustom, setShowCustom] = useState(false);
  const [selectedYears, setSelectedYears] = useState([]);

  const currentYear = new Date().getFullYear();
  
  // Generate year options (last 5 years + next 2 years)
  const years = [];
  for (let y = currentYear - 5; y <= currentYear + 2; y++) {
    years.push(y);
  }

  // Determine which years are currently selected based on the date range
  const activeYears = useMemo(() => {
    if (!startDate || !endDate) return [];
    const startYear = parseInt(startDate.substring(0, 4));
    const endYear = parseInt(endDate.substring(0, 4));
    const yearsInRange = [];
    for (let y = startYear; y <= endYear; y++) {
      yearsInRange.push(y);
    }
    return yearsInRange;
  }, [startDate, endDate]);

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

  // Get date range for multiple years
  const getMultiYearRange = (yearsArray) => {
    if (yearsArray.length === 0) return null;
    
    const sortedYears = [...yearsArray].sort((a, b) => a - b);
    const minYear = sortedYears[0];
    const maxYear = sortedYears[sortedYears.length - 1];
    
    const start = new Date(minYear, 0, 1, 12, 0, 0);
    const end = new Date(maxYear, 11, 31, 12, 0, 0);
    
    return {
      start: formatDateLocal(start),
      end: formatDateLocal(end)
    };
  };

  const handlePresetClick = (presetKey) => {
    const range = getDateRange(presetKey);
    onPresetSelect(presetKey, range);
    setSelectedYears([]); // Clear year selection when using presets
    setShowCustom(false);
  };

  // Toggle year selection (multi-select)
  const handleYearToggle = (year) => {
    setSelectedYears(prev => {
      let newSelection;
      if (prev.includes(year)) {
        // Remove year
        newSelection = prev.filter(y => y !== year);
      } else {
        // Add year
        newSelection = [...prev, year];
      }
      
      // Apply the new selection
      if (newSelection.length > 0) {
        const range = getMultiYearRange(newSelection);
        onPresetSelect(`years-${newSelection.sort().join('-')}`, range);
      }
      
      return newSelection;
    });
    setShowCustom(false);
  };

  // Single click for quick single year selection
  const handleYearClick = (year) => {
    const range = getDateRange(year.toString());
    onPresetSelect(`year-${year}`, range);
    setSelectedYears([year]);
    setShowCustom(false);
  };

  // Check if a year is selected (either via multi-select or within current date range)
  const isYearSelected = (year) => {
    if (selectedYears.length > 0) {
      return selectedYears.includes(year);
    }
    return activeYears.includes(year);
  };

  // Clear year selection
  const clearYearSelection = () => {
    setSelectedYears([]);
  };

  return (
    <div className={`rounded-2xl shadow-sm p-4 mb-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
      <h3 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <svg className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              isDark 
                ? 'bg-slate-700 text-slate-300 hover:bg-primary-600 hover:text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Year Selection - Multi-select */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Select Year(s): 
            <span className={`ml-1 text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              (click to select, hold Ctrl/Cmd for multi-select)
            </span>
          </p>
          {selectedYears.length > 1 && (
            <button
              onClick={clearYearSelection}
              className={`text-xs px-2 py-0.5 rounded ${
                isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {years.map((year) => {
            const isSelected = isYearSelected(year);
            return (
              <button
                key={year}
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    // Multi-select with Ctrl/Cmd
                    handleYearToggle(year);
                  } else {
                    // Single select
                    handleYearClick(year);
                  }
                }}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  isSelected
                    ? 'bg-primary-500 text-white font-medium shadow-md'
                    : isDark
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {year}
                {isSelected && selectedYears.length > 1 && (
                  <span className="ml-1 text-xs opacity-75">✓</span>
                )}
              </button>
            );
          })}
        </div>
        {selectedYears.length > 1 && (
          <p className={`text-xs mt-2 ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>
            📅 Showing data for {selectedYears.length} years: {selectedYears.sort((a, b) => a - b).join(', ')}
          </p>
        )}
      </div>

      {/* Custom Range Toggle */}
      <button
        onClick={() => setShowCustom(!showCustom)}
        className={`flex items-center gap-2 text-sm font-medium mb-3 ${isDark ? 'text-primary-400' : 'text-primary-600'}`}
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
            <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onDateChange('start', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onDateChange('end', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
        </div>
      )}

      {/* Selected Range Display */}
      {(startDate || endDate) && (
        <div className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
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
