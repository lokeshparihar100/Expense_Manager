# Daily Expense Manager 💰

A modern, mobile-first Progressive Web App (PWA) for tracking your daily expenses and income. Built with React, Vite, and Tailwind CSS.

## Features

### 📊 Transaction Management
- **Track Expenses**: Record all your daily spending with bank or credit card
- **Add Income**: Track salary, deposits, and other income sources
- **Manual Entry**: Easily add transactions manually
- **Built-in Calculator**: Calculate amounts before adding (supports +, -, ×, ÷, %)
- **Edit Transactions**: Update any previously added transaction
- **Backdate Entries**: Add expenses with past dates
- **Delete Transactions**: Remove unwanted entries
- **Invoice Images**: Attach up to 5 invoice/receipt images per transaction

### 📸 Invoice Image Management
- Upload multiple images per transaction (up to 5)
- Take photos directly from mobile camera
- View images in full-screen gallery mode
- Navigate between images with swipe/click
- Images stored locally as base64
- Supported formats: PNG, JPG (max 5MB each)

### 🏷️ Smart Tagging System
Each transaction can be tagged with:
- **Payee**: Shopkeeper, Mart, Amazon, Uber, or custom
- **Category**: Shopping, Food, Healthcare, Insurance, Loan, Utilities, Entertainment, Transport, Salary, etc.
- **Payment Method**: Cash, Visa Credit Card, Master Credit Card, UPI, Bank Transfer, Debit Card, etc.
- **Status**: Done, Pending, InFuture

### ✏️ Customizable Tags
- Add new tags for any category
- Update existing tags (automatically updates all related transactions)
- Delete unused tags

### 📈 Statistics & Insights
- View spending by time period (Today, Week, Month, All)
- Category breakdown with visual charts
- Payment method analysis
- Income vs Expense balance
- Spending insights and tips

### 🔔 Payment Reminders
- **Automatic Reminders**: Get notified about upcoming payments when you open the app
- **Reminder Frequencies**:
  - Every time I visit the app
  - 1 hour before
  - 1 day before
  - 3 days before
  - 1 week before
  - No reminder
- **Per-Transaction Settings**: Set custom reminder frequency for each transaction
- **Smart Display**:
  - Shows urgency level (overdue, due today, due tomorrow, etc.)
  - Color-coded based on urgency
  - Displays all relevant transaction details
- **Quick Actions**:
  - Mark as Done (changes status to Done)
  - Edit transaction
  - Remind Later (dismiss for this session)
- **Global Settings**:
  - Enable/disable reminders
  - Show reminders on app open
  - Set default reminder frequency

### 💾 Backup & Restore
- **Complete Backup**: Export all data to JSON file
  - All transactions (highest priority)
  - Tags with custom icons
  - App settings
  - Invoice images (base64 encoded)
- **Import Options**:
  - Replace all existing data
  - Merge with existing (skip duplicates)
- **Backup Includes**:
  - Metadata (version, date, device info)
  - Statistics for verification
  - Date range of transactions
- **Clear Data**: Option to reset app completely

### 📊 Advanced Reports & Charts
- **Interactive Charts**: Pie charts, Donut charts, Bar charts, Horizontal bar charts
- **Date Range Filters**:
  - Quick presets: Today, Yesterday, This Week, Last Week, This Month, Last Month
  - Extended presets: Last 3 Months, Last 6 Months, This Year, Last Year
  - Year selection: 2020-2028 (and beyond)
  - Custom date range picker
- **Multiple Visualizations**:
  - Spending by Category (Pie/Donut/Bar)
  - Spending by Payment Method
  - Monthly Spending Trend
  - Top Payees analysis
  - Transaction Status breakdown
- **Detailed Tables**: Category breakdown with amounts and percentages

### 🎨 Appearance & Privacy
- **Theme Options**: Light, Dark, or System (auto-detect)
- **Dark Mode**: Full dark theme for comfortable night-time use
- **Hide Amounts**: Privacy mode - blur all monetary values
- Quick toggle buttons in the header bar

### 📱 Mobile-First Design
- Responsive design that works on all devices
- **PWA support** - installable on mobile devices (iOS, Android, Desktop)
- **Offline capable** with local storage
- Touch-friendly interface
- Bottom navigation for easy thumb access
- **App shortcuts**: Quick access to Add Expense, Add Income, View Reports

## Tech Stack

- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **LocalStorage** - Data persistence
- **PWA** - Progressive Web App capabilities

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository or navigate to the project folder:
```bash
cd Expense_Manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder, ready to be deployed to any static hosting service.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
Expense_Manager/
├── public/              # Static assets
│   ├── favicon.svg      # App favicon
│   └── health.json      # Static health check
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Calculator.jsx       # Built-in calculator
│   │   ├── Charts.jsx           # Chart components (Pie, Bar, Donut)
│   │   ├── DateRangePicker.jsx  # Date range selection
│   │   ├── IconPicker.jsx       # Icon selection with search
│   │   ├── ImageUpload.jsx      # Invoice image upload
│   │   ├── ImageViewer.jsx      # Full-screen image gallery
│   │   ├── Layout.jsx           # Main layout with navigation
│   │   ├── Modal.jsx            # Modal dialogs
│   │   ├── ReminderModal.jsx    # Payment reminder notifications
│   │   ├── StatCard.jsx         # Statistics card
│   │   ├── TransactionCard.jsx  # Transaction display
│   │   └── TransactionForm.jsx  # Add/Edit form with calculator
│   ├── context/         # React Context for state management
│   │   └── ExpenseContext.jsx   # Global state
│   ├── pages/           # Page components
│   │   ├── Dashboard.jsx        # Home page
│   │   ├── AddTransaction.jsx   # Add new transaction
│   │   ├── EditTransaction.jsx  # Edit transaction
│   │   ├── TransactionList.jsx  # All transactions
│   │   ├── ManageTags.jsx       # Tag management with icons
│   │   ├── Statistics.jsx       # Quick stats
│   │   ├── Reports.jsx          # Full reports with charts
│   │   └── Settings.jsx         # Backup/Restore & settings
│   ├── utils/           # Utility functions
│   │   ├── storage.js   # LocalStorage helpers
│   │   ├── backup.js    # Backup/Restore utilities
│   │   ├── exportReport.js  # PDF/CSV export
│   │   └── reminders.js # Reminder utilities
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite + PWA + Health check config
├── tailwind.config.js   # Tailwind CSS config
├── postcss.config.js    # PostCSS config
└── package.json         # Dependencies
```

## Usage Guide

### Adding a Transaction
1. Tap the "+" button in the bottom navigation
2. Select transaction type (Expense/Income)
3. Enter amount and description
4. Select date (defaults to today)
5. Choose payee, category, payment method, and status
6. Tap "Add Transaction"

### Editing a Transaction
1. Find the transaction in Dashboard or History
2. Tap "Edit" button
3. Modify any fields
4. Tap "Update Transaction"

### Managing Tags
1. Go to Tags page from bottom navigation
2. Select category (Payees, Categories, Payment Methods, Statuses)
3. Add, edit, or delete tags as needed

### Viewing Statistics
1. Go to Stats page from bottom navigation
2. Select time period filter
3. View spending breakdown by category and payment method

## 📲 Mobile Installation (PWA)

The app can be installed on your device for quick access, even when offline!

### 🍎 iOS (iPhone/iPad)
> **Important**: You must use Safari on iOS

1. Open the app URL in **Safari**
2. Tap the **Share button** (⬆️) at the bottom
3. Scroll down and tap **"Add to Home Screen"**
4. Enter a name (or keep "Expenses") and tap **"Add"**
5. The app icon will appear on your home screen!

### 🤖 Android
1. Open the app URL in **Chrome**
2. You'll see an "Install" prompt at the bottom - tap it!
3. Or tap the **menu (⋮)** → **"Install app"** or **"Add to Home Screen"**
4. Tap **"Install"** to confirm
5. The app will be in your app drawer and home screen!

### 💻 Desktop (Windows/Mac/Linux)

**Chrome:**
1. Look for the **install icon** (⊕) in the address bar
2. Click it and select **"Install"**

**Edge:**
1. Click the **menu (⋯)** → **"Apps"** → **"Install this site as an app"**

### ✨ Installed App Features
- Launch from home screen like a native app
- Works offline
- No browser address bar (fullscreen experience)
- App shortcuts for quick actions (long-press the app icon)

> 📖 See [USER_GUIDE.md](USER_GUIDE.md) for detailed installation instructions and feature documentation.

## Health Check

The app includes health check endpoints for monitoring:

```bash
# API health check (development server)
curl http://localhost:5173/api/health

# Response:
{
  "status": "ok",
  "app": "Daily Expense Manager",
  "version": "1.0.0",
  "timestamp": "2024-01-17T10:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}

# Static health file
curl http://localhost:5173/health.json

# Browser console
window.healthCheck()
```

## Data Storage

All data is stored locally in your browser's localStorage. This means:
- ✅ Your data stays on your device
- ✅ No account required
- ✅ Works offline
- ⚠️ Clearing browser data will delete your transactions
- 💡 Consider exporting your data regularly (feature coming soon)

## License

MIT License - feel free to use and modify for your needs.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
