import React from 'react';

// Color palette for charts
const CHART_COLORS = [
  '#4F46E5', // Primary/Indigo
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#6366F1', // Indigo light
];

// Pie Chart Component
export const PieChart = ({ data, size = 200, showLegend = true, isDark = false }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-4xl mb-2">📊</div>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No data available</p>
      </div>
    );
  }

  let currentAngle = 0;
  const radius = size / 2;
  const center = size / 2;

  const createSlicePath = (startAngle, endAngle) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...item,
      path: createSlicePath(startAngle, endAngle),
      color: CHART_COLORS[index % CHART_COLORS.length],
      percentage: percentage.toFixed(1)
    };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {slices.map((slice, index) => (
          <path
            key={index}
            d={slice.path}
            fill={slice.color}
            stroke={isDark ? '#1e293b' : 'white'}
            strokeWidth="2"
            className="transition-all duration-300 hover:opacity-80"
          />
        ))}
      </svg>
      
      {showLegend && (
        <div className="mt-4 grid grid-cols-2 gap-2 w-full max-w-xs">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className={`truncate ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{slice.label}</span>
              <span className={`ml-auto ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>{slice.percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Bar Chart Component
export const BarChart = ({ data, height = 200, showValues = true, isDark = false, formatValue = null }) => {
  const maxValue = Math.max(...data.map(item => item.value), 1);
  
  if (data.length === 0 || maxValue === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-4xl mb-2">📊</div>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No data available</p>
      </div>
    );
  }

  const displayValue = (val) => {
    if (formatValue) return formatValue(val);
    return val.toFixed(0);
  };

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-1" style={{ height }}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center justify-end"
            >
              {showValues && item.value > 0 && (
                <span className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {displayValue(item.value)}
                </span>
              )}
              <div
                className="w-full rounded-t-md transition-all duration-500 hover:opacity-80"
                style={{
                  height: `${Math.max(barHeight, 2)}%`,
                  backgroundColor: item.color || CHART_COLORS[index % CHART_COLORS.length],
                  minHeight: item.value > 0 ? '8px' : '0'
                }}
              />
            </div>
          );
        })}
      </div>
      <div className={`flex justify-between gap-1 mt-2 border-t pt-2 ${isDark ? 'border-slate-600' : 'border-gray-200'}`}>
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center">
            <span className={`text-xs truncate block ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Horizontal Bar Chart Component
export const HorizontalBarChart = ({ data, showValues = true, isDark = false, formatValue = null }) => {
  const maxValue = Math.max(...data.map(item => item.value), 1);
  
  if (data.length === 0 || maxValue === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-4xl mb-2">📊</div>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No data available</p>
      </div>
    );
  }

  const displayValue = (val) => {
    if (formatValue) return formatValue(val);
    return val.toFixed(2);
  };

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const barWidth = (item.value / maxValue) * 100;
        return (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm truncate flex-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{item.label}</span>
              {showValues && (
                <span className={`text-sm font-medium ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {displayValue(item.value)}
                </span>
              )}
            </div>
            <div className={`h-4 rounded-full overflow-hidden ${isDark ? 'bg-slate-600' : 'bg-gray-100'}`}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: item.color || CHART_COLORS[index % CHART_COLORS.length]
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Donut Chart Component
export const DonutChart = ({ data, size = 200, thickness = 40, centerText = '', isDark = false }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-4xl mb-2">📊</div>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No data available</p>
      </div>
    );
  }

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {data.map((item, index) => {
            const percentage = item.value / total;
            const strokeDasharray = `${percentage * circumference} ${circumference}`;
            const strokeDashoffset = -offset;
            offset += percentage * circumference;

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color || CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={thickness}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        {centerText && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{centerText}</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Total</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Line Trend Indicator
export const TrendLine = ({ data, height = 60, color = '#4F46E5' }) => {
  if (data.length < 2) return null;

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  
  const width = 100;
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - minValue) / range) * (height - 10);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default { PieChart, BarChart, HorizontalBarChart, DonutChart, TrendLine };
