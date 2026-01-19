// Export utilities for reports
import { CURRENCIES } from './currency';

// Format currency for export
const formatCurrency = (amount, currencyCode = 'USD') => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  return `${currency.symbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Format date for export
const formatDate = (dateString) => {
  return new Date(dateString + 'T12:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Export transactions to CSV
export const exportToCSV = (transactions, filename = 'expense_report') => {
  if (transactions.length === 0) {
    alert('No transactions to export');
    return;
  }

  // CSV headers
  const headers = [
    'Date',
    'Type',
    'Description',
    'Amount',
    'Currency',
    'Category',
    'Payee',
    'Payment Method',
    'Status',
    'Notes'
  ];

  // Convert transactions to CSV rows
  const rows = transactions.map(t => [
    t.date,
    t.type,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.amount,
    t.currency || 'USD',
    t.category,
    t.payee,
    t.paymentMethod,
    t.status,
    `"${(t.notes || '').replace(/"/g, '""')}"`
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export summary report to CSV
export const exportSummaryToCSV = (stats, dateRange, filename = 'expense_summary', reportCurrency = null) => {
  const currencyCode = reportCurrency || stats.currency || 'USD';
  const currencyNote = reportCurrency ? ` (converted to ${currencyCode})` : '';
  
  const lines = [
    'Expense Manager Report',
    `Generated: ${new Date().toLocaleString()}`,
    `Period: ${formatDate(dateRange.start)} to ${formatDate(dateRange.end)}`,
    reportCurrency ? `Currency: All amounts converted to ${currencyCode}` : '',
    '',
    'SUMMARY',
    `Total Income,${formatCurrency(stats.totalIncome, currencyCode)}`,
    `Total Expenses,${formatCurrency(stats.totalExpenses, currencyCode)}`,
    `Balance,${formatCurrency(stats.balance, currencyCode)}`,
    `Total Transactions,${stats.transactionCount}`,
    '',
    'EXPENSES BY CATEGORY' + currencyNote,
    'Category,Amount,Percentage'
  ];

  // Add category breakdown
  const categoryTotal = Object.values(stats.byCategory).reduce((sum, val) => sum + val, 0);
  Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, amount]) => {
      const percentage = categoryTotal > 0 ? ((amount / categoryTotal) * 100).toFixed(1) : 0;
      lines.push(`${category},${formatCurrency(amount, currencyCode)},${percentage}%`);
    });

  lines.push('');
  lines.push('EXPENSES BY PAYMENT METHOD' + currencyNote);
  lines.push('Payment Method,Amount,Percentage');

  // Add payment method breakdown
  const paymentTotal = Object.values(stats.byPaymentMethod).reduce((sum, val) => sum + val, 0);
  Object.entries(stats.byPaymentMethod)
    .sort((a, b) => b[1] - a[1])
    .forEach(([method, amount]) => {
      const percentage = paymentTotal > 0 ? ((amount / paymentTotal) * 100).toFixed(1) : 0;
      lines.push(`${method},${formatCurrency(amount, currencyCode)},${percentage}%`);
    });

  const csvContent = lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate HTML report for PDF printing
export const generatePDFReport = (stats, dateRange, transactions, includeInvoices = true, reportCurrency = null) => {
  const currencyCode = reportCurrency || stats.currency || 'USD';
  const currencyInfo = CURRENCIES[currencyCode] || CURRENCIES.USD;
  
  const formatDateLocal = (dateString) => {
    return new Date(dateString + 'T12:00:00').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const categoryRows = Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => {
      const percentage = stats.totalExpenses > 0 ? ((amount / stats.totalExpenses) * 100).toFixed(1) : 0;
      return `<tr><td>${category}</td><td style="text-align:right">${formatCurrency(amount, currencyCode)}</td><td style="text-align:right">${percentage}%</td></tr>`;
    }).join('');

  const paymentRows = Object.entries(stats.byPaymentMethod)
    .sort((a, b) => b[1] - a[1])
    .map(([method, amount]) => {
      const percentage = stats.totalExpenses > 0 ? ((amount / stats.totalExpenses) * 100).toFixed(1) : 0;
      return `<tr><td>${method}</td><td style="text-align:right">${formatCurrency(amount, currencyCode)}</td><td style="text-align:right">${percentage}%</td></tr>`;
    }).join('');

  // Check if any transaction has invoices
  const transactionsWithInvoices = transactions.filter(t => t.invoiceImages && t.invoiceImages.length > 0);
  const hasInvoices = transactionsWithInvoices.length > 0;

  const transactionRows = transactions.slice(0, 50).map(t => {
    const hasImages = t.invoiceImages && t.invoiceImages.length > 0;
    const txCurrency = t.currency || 'USD';
    return `
    <tr>
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>${t.description}${hasImages ? ' 📎' : ''}</td>
      <td style="text-align:right;color:${t.type === 'expense' ? '#dc2626' : '#16a34a'}">${t.type === 'expense' ? '-' : '+'}${formatCurrency(t.amount, txCurrency)}</td>
      <td>${txCurrency}</td>
      <td>${t.category}</td>
      <td>${t.paymentMethod}</td>
    </tr>
  `}).join('');

  // Generate invoice section
  const invoiceSection = includeInvoices && hasInvoices ? `
    <div class="page-break"></div>
    <h2>🧾 Attached Invoices & Receipts</h2>
    <p style="color:#6B7280;margin-bottom:20px;">${transactionsWithInvoices.length} transaction(s) with attached invoices</p>
    
    ${transactionsWithInvoices.map(t => {
      const txCurrency = t.currency || 'USD';
      return `
      <div class="invoice-group">
        <div class="invoice-header">
          <div>
            <strong>${t.description}</strong>
            <span style="color:#6B7280;margin-left:10px;">${t.date}</span>
          </div>
          <div style="color:${t.type === 'expense' ? '#dc2626' : '#16a34a'};font-weight:bold;">
            ${t.type === 'expense' ? '-' : '+'}${formatCurrency(t.amount, txCurrency)}
          </div>
        </div>
        <div class="invoice-details">
          <span>📁 ${t.category}</span>
          <span>👤 ${t.payee}</span>
          <span>💳 ${t.paymentMethod}</span>
          <span>💱 ${txCurrency}</span>
        </div>
        <div class="invoice-images">
          ${t.invoiceImages.map((img, idx) => `
            <div class="invoice-image-container">
              <img src="${img.data}" alt="Invoice ${idx + 1}" class="invoice-image" />
              <p class="invoice-image-label">Invoice ${idx + 1}${img.name ? ` - ${img.name}` : ''}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `}).join('')}
  ` : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Expense Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #333; }
        h1 { color: #4F46E5; margin-bottom: 10px; }
        h2 { color: #374151; margin: 30px 0 15px; border-bottom: 2px solid #E5E7EB; padding-bottom: 5px; }
        .meta { color: #6B7280; margin-bottom: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .summary-card { padding: 20px; border-radius: 10px; text-align: center; }
        .summary-card.income { background: #DCFCE7; color: #166534; }
        .summary-card.expense { background: #FEE2E2; color: #991B1B; }
        .summary-card.balance { background: #E0E7FF; color: #3730A3; }
        .summary-card h3 { font-size: 14px; margin-bottom: 5px; opacity: 0.8; }
        .summary-card p { font-size: 24px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #E5E7EB; }
        th { background: #F9FAFB; font-weight: 600; color: #374151; }
        tr:hover { background: #F9FAFB; }
        .footer { margin-top: 40px; text-align: center; color: #9CA3AF; font-size: 12px; }
        
        /* Invoice styles */
        .invoice-group { 
          margin-bottom: 30px; 
          padding: 20px; 
          border: 1px solid #E5E7EB; 
          border-radius: 10px;
          page-break-inside: avoid;
        }
        .invoice-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #E5E7EB;
        }
        .invoice-details {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
          color: #6B7280;
          font-size: 14px;
        }
        .invoice-images {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }
        .invoice-image-container {
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          overflow: hidden;
        }
        .invoice-image {
          width: 100%;
          max-height: 300px;
          object-fit: contain;
          background: #F9FAFB;
        }
        .invoice-image-label {
          padding: 8px;
          font-size: 12px;
          color: #6B7280;
          text-align: center;
          background: #F9FAFB;
          border-top: 1px solid #E5E7EB;
        }
        .page-break { page-break-before: always; }
        
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
          .invoice-group { break-inside: avoid; }
          .invoice-image { max-height: 250px; }
        }
      </style>
    </head>
    <body>
      <h1>💰 Expense Report</h1>
      <p class="meta">
        Period: ${formatDateLocal(dateRange.start)} to ${formatDateLocal(dateRange.end)}<br>
        Generated: ${new Date().toLocaleString()}<br>
        ${reportCurrency ? `<span style="color:#4F46E5">💱 Totals converted to ${currencyInfo.flag} ${currencyCode} (${currencyInfo.name})</span>` : ''}
      </p>

      <div class="summary-grid">
        <div class="summary-card income">
          <h3>Total Income</h3>
          <p>${formatCurrency(stats.totalIncome, currencyCode)}</p>
        </div>
        <div class="summary-card expense">
          <h3>Total Expenses</h3>
          <p>${formatCurrency(stats.totalExpenses, currencyCode)}</p>
        </div>
        <div class="summary-card balance">
          <h3>Balance</h3>
          <p>${formatCurrency(stats.balance, currencyCode)}</p>
        </div>
      </div>

      <h2>📊 Expenses by Category</h2>
      <table>
        <thead>
          <tr><th>Category</th><th style="text-align:right">Amount</th><th style="text-align:right">%</th></tr>
        </thead>
        <tbody>
          ${categoryRows || '<tr><td colspan="3" style="text-align:center;color:#9CA3AF">No data</td></tr>'}
        </tbody>
      </table>

      <h2>💳 Expenses by Payment Method</h2>
      <table>
        <thead>
          <tr><th>Payment Method</th><th style="text-align:right">Amount</th><th style="text-align:right">%</th></tr>
        </thead>
        <tbody>
          ${paymentRows || '<tr><td colspan="3" style="text-align:center;color:#9CA3AF">No data</td></tr>'}
        </tbody>
      </table>

      <h2>📝 Recent Transactions (Last 50)</h2>
      <p style="color:#6B7280;margin-bottom:15px;font-size:14px;">📎 indicates transactions with attached invoices</p>
      <table>
        <thead>
          <tr><th>Date</th><th>Type</th><th>Description</th><th style="text-align:right">Amount</th><th>Currency</th><th>Category</th><th>Payment</th></tr>
        </thead>
        <tbody>
          ${transactionRows || '<tr><td colspan="7" style="text-align:center;color:#9CA3AF">No transactions</td></tr>'}
        </tbody>
      </table>

      ${invoiceSection}

      <div class="footer">
        <p>Generated by Daily Expense Manager</p>
        ${hasInvoices ? `<p style="margin-top:5px;">${transactionsWithInvoices.length} invoice(s) attached</p>` : ''}
      </div>

      <div class="no-print" style="margin-top:30px;text-align:center">
        <button onclick="window.print()" style="padding:12px 30px;background:#4F46E5;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px">
          🖨️ Print / Save as PDF
        </button>
        <button onclick="window.close()" style="padding:12px 30px;background:#E5E7EB;color:#374151;border:none;border-radius:8px;cursor:pointer;font-size:16px;margin-left:10px">
          Close
        </button>
      </div>
    </body>
    </html>
  `;

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
};

export default { exportToCSV, exportSummaryToCSV, generatePDFReport };
