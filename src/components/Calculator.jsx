import React, { useState } from 'react';

const Calculator = ({ initialValue = '', onConfirm, onClose }) => {
  // Store the full expression for display
  const [expression, setExpression] = useState(initialValue?.toString() || '');
  // Store the current number being entered
  const [currentNumber, setCurrentNumber] = useState(initialValue?.toString() || '');
  // Store the calculated result
  const [result, setResult] = useState(null);
  // Flag to check if we just calculated
  const [justCalculated, setJustCalculated] = useState(false);

  // Evaluate the expression
  const evaluateExpression = (expr) => {
    try {
      if (!expr || expr.trim() === '') return null;
      
      // Replace display operators with JS operators
      let evalExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-');
      
      // Remove trailing operator
      evalExpr = evalExpr.replace(/[+\-*/]$/, '');
      
      if (!evalExpr) return null;

      // Safely evaluate
      const calculated = Function('"use strict"; return (' + evalExpr + ')')();
      
      if (isNaN(calculated) || !isFinite(calculated)) {
        return null;
      }

      return Math.round(calculated * 100) / 100;
    } catch (error) {
      return null;
    }
  };

  // Handle number input
  const handleNumber = (num) => {
    if (justCalculated) {
      // Start fresh after calculation
      setExpression(num);
      setCurrentNumber(num);
      setResult(null);
      setJustCalculated(false);
    } else {
      const newExpr = expression + num;
      setExpression(newExpr);
      setCurrentNumber(currentNumber + num);
      // Update live result
      setResult(evaluateExpression(newExpr));
    }
  };

  // Handle operator input
  const handleOperator = (op) => {
    if (expression === '' && op !== '-') return;
    
    const lastChar = expression.slice(-1);
    let newExpr;
    
    // Replace last operator if clicking another operator
    if (['+', '−', '×', '÷'].includes(lastChar)) {
      newExpr = expression.slice(0, -1) + op;
    } else {
      newExpr = expression + op;
    }
    
    setExpression(newExpr);
    setCurrentNumber('');
    setJustCalculated(false);
    // Update live result
    setResult(evaluateExpression(newExpr));
  };

  // Calculate and show result
  const calculate = () => {
    const calculated = evaluateExpression(expression);
    if (calculated !== null) {
      setResult(calculated);
      setExpression(calculated.toString());
      setCurrentNumber(calculated.toString());
      setJustCalculated(true);
    }
  };

  // Clear all
  const handleClear = () => {
    setExpression('');
    setCurrentNumber('');
    setResult(null);
    setJustCalculated(false);
  };

  // Backspace
  const handleBackspace = () => {
    if (justCalculated) {
      handleClear();
      return;
    }
    
    if (expression.length > 0) {
      const newExpr = expression.slice(0, -1);
      setExpression(newExpr);
      
      // Update current number
      const lastNumMatch = newExpr.match(/[\d.]+$/);
      setCurrentNumber(lastNumMatch ? lastNumMatch[0] : '');
      
      // Update live result
      setResult(evaluateExpression(newExpr));
    }
  };

  // Handle decimal point
  const handleDecimal = () => {
    if (justCalculated) {
      setExpression('0.');
      setCurrentNumber('0.');
      setResult(null);
      setJustCalculated(false);
    } else if (!currentNumber.includes('.')) {
      const newNum = currentNumber === '' ? '0.' : currentNumber + '.';
      const newExpr = currentNumber === '' ? expression + '0.' : expression + '.';
      setExpression(newExpr);
      setCurrentNumber(newNum);
    }
  };

  // Handle percentage
  const handlePercent = () => {
    if (currentNumber && currentNumber !== '') {
      const current = parseFloat(currentNumber);
      if (!isNaN(current)) {
        const percentValue = current / 100;
        const newExpr = expression.slice(0, -currentNumber.length) + percentValue.toString();
        setExpression(newExpr);
        setCurrentNumber(percentValue.toString());
        setResult(evaluateExpression(newExpr));
      }
    }
  };

  // Handle plus/minus toggle
  const handlePlusMinus = () => {
    if (currentNumber && currentNumber !== '') {
      const current = parseFloat(currentNumber);
      if (!isNaN(current)) {
        const negated = (current * -1).toString();
        const newExpr = expression.slice(0, -currentNumber.length) + '(' + negated + ')';
        setExpression(newExpr);
        setCurrentNumber(negated);
        setResult(evaluateExpression(newExpr));
      }
    }
  };

  // Confirm and pass value back
  const handleConfirm = () => {
    let finalValue = result;
    
    // Calculate if not yet calculated
    if (finalValue === null && expression) {
      finalValue = evaluateExpression(expression);
    }
    
    // If still no result, try to parse the expression as a number
    if (finalValue === null && expression) {
      finalValue = parseFloat(expression);
    }
    
    if (finalValue !== null && !isNaN(finalValue) && finalValue > 0) {
      onConfirm(Math.abs(finalValue).toFixed(2));
    } else if (finalValue !== null && !isNaN(finalValue)) {
      onConfirm(Math.abs(finalValue).toFixed(2));
    }
  };

  // Get display value
  const displayValue = result !== null ? result.toString() : (expression || '0');

  // Button component
  const CalcButton = ({ children, onClick, className = '', span = 1 }) => (
    <button
      type="button"
      onClick={onClick}
      className={`h-14 rounded-xl font-semibold text-xl transition-all active:scale-95 ${
        span === 2 ? 'col-span-2' : ''
      } ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-sm">
      {/* Header */}
      <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
        <h3 className="font-semibold">Calculator</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Display */}
      <div className="bg-gray-50 p-4">
        <div className="text-right">
          <p className="text-sm text-gray-400 h-6 overflow-hidden font-mono">
            {expression || '0'}
          </p>
          <p className="text-4xl font-bold text-gray-900 overflow-hidden">
            {result !== null ? result : (expression || '0')}
          </p>
        </div>
      </div>

      {/* Keypad */}
      <div className="p-3 grid grid-cols-4 gap-2">
        {/* Row 1 */}
        <CalcButton onClick={handleClear} className="bg-red-100 text-red-600 hover:bg-red-200">
          C
        </CalcButton>
        <CalcButton onClick={handlePlusMinus} className="bg-gray-100 text-gray-700 hover:bg-gray-200">
          ±
        </CalcButton>
        <CalcButton onClick={handlePercent} className="bg-gray-100 text-gray-700 hover:bg-gray-200">
          %
        </CalcButton>
        <CalcButton onClick={() => handleOperator('÷')} className="bg-primary-100 text-primary-600 hover:bg-primary-200">
          ÷
        </CalcButton>

        {/* Row 2 */}
        <CalcButton onClick={() => handleNumber('7')} className="bg-gray-50 text-gray-900 hover:bg-gray-100">
          7
        </CalcButton>
        <CalcButton onClick={() => handleNumber('8')} className="bg-gray-50 text-gray-900 hover:bg-gray-100">
          8
        </CalcButton>
        <CalcButton onClick={() => handleNumber('9')} className="bg-gray-50 text-gray-900 hover:bg-gray-100">
          9
        </CalcButton>
        <CalcButton onClick={() => handleOperator('×')} className="bg-primary-100 text-primary-600 hover:bg-primary-200">
          ×
        </CalcButton>

        {/* Row 3 */}
        <CalcButton onClick={() => handleNumber('4')} className="bg-gray-50 text-gray-900 hover:bg-gray-100">
          4
        </CalcButton>
        <CalcButton onClick={() => handleNumber('5')} className="bg-gray-50 text-gray-900 hover:bg-gray-100">
          5
        </CalcButton>
        <CalcButton onClick={() => handleNumber('6')} className="bg-gray-50 text-gray-900 hover:bg-gray-100">
          6
        </CalcButton>
        <CalcButton onClick={() => handleOperator('−')} className="bg-primary-100 text-primary-600 hover:bg-primary-200">
          −
        </CalcButton>

        {/* Row 4 */}
        <CalcButton onClick={() => handleNumber('1')} className="bg-gray-50 text-gray-900 hover:bg-gray-100">
          1
        </CalcButton>
        <CalcButton onClick={() => handleNumber('2')} className="bg-gray-50 text-gray-900 hover:bg-gray-100">
          2
        </CalcButton>
        <CalcButton onClick={() => handleNumber('3')} className="bg-gray-50 text-gray-900 hover:bg-gray-100">
          3
        </CalcButton>
        <CalcButton onClick={() => handleOperator('+')} className="bg-primary-100 text-primary-600 hover:bg-primary-200">
          +
        </CalcButton>

        {/* Row 5 */}
        <CalcButton onClick={() => handleNumber('0')} span={2} className="col-span-2 bg-gray-50 text-gray-900 hover:bg-gray-100">
          0
        </CalcButton>
        <CalcButton onClick={handleDecimal} className="bg-gray-50 text-gray-900 hover:bg-gray-100">
          .
        </CalcButton>
        <CalcButton onClick={calculate} className="bg-primary-500 text-white hover:bg-primary-600">
          =
        </CalcButton>
      </div>

      {/* Action Buttons */}
      <div className="p-3 pt-0 grid grid-cols-2 gap-2">
        <CalcButton onClick={handleBackspace} className="bg-gray-200 text-gray-700 hover:bg-gray-300">
          ⌫
        </CalcButton>
        <CalcButton onClick={handleConfirm} className="bg-green-500 text-white hover:bg-green-600">
          OK ✓
        </CalcButton>
      </div>
    </div>
  );
};

export default Calculator;
