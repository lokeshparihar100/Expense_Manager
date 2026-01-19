# 🔧 Development Guide

This document contains technical documentation for developers working on the Daily Expense Manager project.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Components](#components)
- [State Management](#state-management)
- [Data Storage](#data-storage)
- [API & Health Checks](#api--health-checks)
- [PWA Configuration](#pwa-configuration)
- [Building & Deployment](#building--deployment)

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Library |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| React Router | 6.x | Client-side routing |
| vite-plugin-pwa | 0.19.x | PWA support |
| LocalStorage | - | Data persistence |

---

## Project Structure

```
Expense_Manager/
├── public/                     # Static assets
│   ├── favicon.svg            # App favicon
│   ├── apple-touch-icon.svg   # iOS icon
│   ├── pwa-192x192.svg        # PWA icon (small)
│   ├── pwa-512x512.svg        # PWA icon (large)
│   └── health.json            # Static health check
│
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Calculator.jsx     # Built-in calculator modal
│   │   ├── Charts.jsx         # Chart components (Pie, Bar, Donut, HorizontalBar)
│   │   ├── DateRangePicker.jsx # Date range with presets & multi-year
│   │   ├── IconPicker.jsx     # Emoji/icon selection with search
│   │   ├── ImageUpload.jsx    # Invoice image upload (base64)
│   │   ├── ImageViewer.jsx    # Full-screen image gallery
│   │   ├── InstallPrompt.jsx  # PWA install prompt
│   │   ├── Layout.jsx         # Main layout with navigation
│   │   ├── Modal.jsx          # Modal dialogs (Modal, ConfirmModal)
│   │   ├── ReminderModal.jsx  # Payment reminder notifications
│   │   ├── StatCard.jsx       # Statistics display card
│   │   ├── TransactionCard.jsx # Transaction list item
│   │   └── TransactionForm.jsx # Add/Edit transaction form
│   │
│   ├── context/               # React Context providers
│   │   ├── ExpenseContext.jsx # Transactions, tags state
│   │   └── SettingsContext.jsx # Theme, currency, settings
│   │
│   ├── pages/                 # Route components
│   │   ├── Dashboard.jsx      # Home page with summary
│   │   ├── AddTransaction.jsx # Add new transaction
│   │   ├── EditTransaction.jsx # Edit existing transaction
│   │   ├── TransactionList.jsx # Transaction history with filters
│   │   ├── ManageTags.jsx     # Tag management (CRUD)
│   │   ├── Statistics.jsx     # Quick statistics view
│   │   ├── Reports.jsx        # Full reports with charts
│   │   ├── Settings.jsx       # App settings & backup
│   │   └── Help.jsx           # Help & FAQ page
│   │
│   ├── utils/                 # Utility functions
│   │   ├── storage.js         # LocalStorage helpers
│   │   ├── backup.js          # Backup/restore utilities
│   │   ├── currency.js        # Currency conversion & formatting
│   │   ├── exportReport.js    # PDF/CSV export
│   │   └── reminders.js       # Reminder logic
│   │
│   ├── App.jsx                # Main app with routing
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles & Tailwind
│
├── index.html                 # HTML template
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
└── package.json               # Dependencies & scripts
```

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Development

```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Run on specific port
npm run dev -- --port 3000
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Architecture

### Component Hierarchy

```
App
├── SettingsProvider (theme, currency)
│   └── ExpenseProvider (transactions, tags)
│       └── Layout
│           ├── Header (theme toggle, privacy toggle)
│           ├── Routes
│           │   ├── Dashboard
│           │   ├── AddTransaction → TransactionForm
│           │   ├── EditTransaction → TransactionForm
│           │   ├── TransactionList → TransactionCard[]
│           │   ├── ManageTags
│           │   ├── Statistics
│           │   ├── Reports → Charts, DateRangePicker
│           │   ├── Settings
│           │   └── Help
│           └── BottomNavigation
└── ReminderModal (global overlay)
```

### Data Flow

```
User Action → Component → Context → LocalStorage
                ↓
            State Update
                ↓
            Re-render
```

---

## Components

### Chart Components (Charts.jsx)

All charts accept `isDark` prop for dark mode and `formatValue` for currency formatting.

```jsx
// Pie Chart
<PieChart 
  data={[{ label: 'Food', value: 100 }]} 
  size={180} 
  showLegend={true}
  isDark={false}
/>

// Bar Chart
<BarChart 
  data={[{ label: 'Jan', value: 500 }]} 
  height={150}
  isDark={false}
  formatValue={(val) => `$${val}`}
/>

// Horizontal Bar Chart
<HorizontalBarChart 
  data={data} 
  isDark={false}
  formatValue={formatAmount}
/>

// Donut Chart
<DonutChart 
  data={data} 
  size={200} 
  thickness={40}
  centerText="$1,234"
  isDark={false}
/>
```

### DateRangePicker

Supports presets, custom range, and multi-year selection.

```jsx
<DateRangePicker
  startDate="2024-01-01"
  endDate="2024-12-31"
  onDateChange={(type, value) => {}}
  onPresetSelect={(preset, range) => {}}
/>
```

**Multi-year selection:**
- Click: Select single year
- Ctrl/Cmd + Click: Toggle multi-select

---

## State Management

### ExpenseContext

```jsx
const { 
  transactions,      // Array of transactions
  addTransaction,    // (data) => void
  updateTransaction, // (id, data) => void
  deleteTransaction, // (id) => void
  tags,              // { payees, categories, paymentMethods, statuses }
  addTag,            // (category, name, icon) => void
  updateTag,         // (category, oldName, newName, icon) => void
  deleteTag,         // (category, name) => void
} = useExpense();
```

### SettingsContext

```jsx
const {
  // Theme
  theme,              // 'light' | 'dark' | 'system'
  setTheme,
  isDark,             // Computed boolean
  
  // Privacy
  hideAmounts,
  toggleAmounts,
  
  // Currency
  defaultCurrency,    // Current/travel currency
  setDefaultCurrency,
  nativeCurrency,     // Home currency
  setNativeCurrency,
  currencies,         // All available currencies
  exchangeRates,      // { USD: 1, EUR: 0.92, ... }
  formatAmount,       // (amount, currency) => string
  fetchLiveRates,     // () => Promise
  updateExchangeRate, // (code, rate) => void
} = useSettings();
```

---

## Data Storage

### LocalStorage Keys

| Key | Description |
|-----|-------------|
| `expense_tracker_transactions` | All transactions array |
| `expense_tracker_tags` | Custom tags object |
| `expense_tracker_settings` | App settings |
| `expense_manager_currency_settings` | Currency preferences |
| `expense_manager_exchange_rates` | Exchange rates cache |
| `expense_manager_reminder_settings` | Reminder preferences |

### Transaction Schema

```javascript
{
  id: "unique-id",
  type: "expense" | "income",
  amount: "100.00",
  currency: "USD",
  description: "Grocery shopping",
  date: "2024-01-15",
  payee: "Walmart",
  category: "Food",
  paymentMethod: "Credit Card",
  status: "Done" | "Pending" | "InFuture",
  notes: "Optional notes",
  invoiceImages: ["base64...", "base64..."],
  reminderType: "custom_duration",
  reminderValue: "3",
  reminderUnit: "days",
  createdAt: "2024-01-15T10:30:00.000Z"
}
```

---

## API & Health Checks

### Health Check Endpoint

```bash
# Development server
GET http://localhost:5173/api/health

# Response
{
  "status": "ok",
  "app": "Daily Expense Manager",
  "version": "1.1.0",
  "timestamp": "2024-01-17T10:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### Static Health File

```bash
GET http://localhost:5173/health.json
```

### Browser Console

```javascript
window.healthCheck()
```

---

## PWA Configuration

### vite.config.js

```javascript
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'apple-touch-icon.svg'],
  manifest: {
    name: 'Daily Expense Manager',
    short_name: 'Expenses',
    theme_color: '#4f46e5',
    background_color: '#ffffff',
    display: 'standalone',
    icons: [...],
    shortcuts: [
      { name: 'Add Expense', url: '/add?type=expense' },
      { name: 'Add Income', url: '/add?type=income' },
      { name: 'View Reports', url: '/reports' }
    ]
  }
})
```

### Supported Currencies

50+ currencies including:
- Major: USD, EUR, GBP, JPY, CNY
- Asian: INR, KRW, SGD, THB, MYR, PHP, VND
- Americas: CAD, AUD, BRL, MXN, ARS, COP
- European: CHF, SEK, NOK, PLN, CZK, HUF
- Middle East: AED, SAR, ILS, TRY
- African: ZAR, NGN, EGP, KES
- Others: GEL (Georgian Lari), and more

---

## Building & Deployment

### Build Output

```bash
npm run build
# Output: dist/
```

### Deploy to Static Hosting

Works with any static hosting:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront

### Environment Variables

No environment variables required - all data is client-side.

---

## Code Style

### Conventions

- Functional components with hooks
- Tailwind CSS for styling
- Dark mode: Use `isDark` conditional classes
- Currency: Always pass currency code to `formatAmount()`

### Example Component

```jsx
import { useSettings } from '../context/SettingsContext';

const MyComponent = ({ data }) => {
  const { isDark, formatAmount } = useSettings();
  
  return (
    <div className={`p-4 rounded-xl ${
      isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'
    }`}>
      <p>{formatAmount(data.amount, data.currency)}</p>
    </div>
  );
};
```

---

## Testing

Currently no automated tests. Manual testing recommended for:

1. Transaction CRUD operations
2. Multi-currency conversion
3. Dark mode across all pages
4. PWA installation on iOS/Android
5. Backup/restore functionality
6. Offline functionality

---

## Troubleshooting

### Common Issues

**Build fails with memory error:**
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

**PWA not updating:**
- Clear service worker in DevTools → Application → Service Workers
- Unregister and refresh

**LocalStorage full:**
- Reduce invoice image quality
- Export backup and clear old data

---

## License

MIT License - See [LICENSE](LICENSE) file.
