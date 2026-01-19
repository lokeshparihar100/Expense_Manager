# 📱 Daily Expense Manager - User Guide

Welcome to Daily Expense Manager! This guide will help you install the app on your device and make the most of all its features.

---

## 📥 Installation Guide

### Installing on iPhone/iPad (iOS)

1. **Open Safari** and navigate to the app URL
2. Tap the **Share button** (⬆️) at the bottom of the screen
3. Scroll down and tap **"Add to Home Screen"**
4. Give the app a name (or keep "Expenses") and tap **"Add"**
5. The app icon will appear on your home screen!

> **Note:** On iOS, you must use Safari. Chrome and other browsers don't support installing web apps.

### Installing on Android

1. **Open Chrome** and navigate to the app URL
2. You'll see a prompt at the bottom saying "Add to Home Screen" - tap **Install**
3. Or tap the **three dots menu** (⋮) → **"Install app"** or **"Add to Home Screen"**
4. Tap **"Install"** to confirm
5. The app will be added to your home screen and app drawer!

### Installing on Desktop (Windows/Mac/Linux)

**Chrome:**
1. Look for the **install icon** (⊕) in the address bar
2. Click it and select **"Install"**

**Edge:**
1. Click the **three dots menu** (⋯)
2. Select **"Apps"** → **"Install this site as an app"**

**Firefox:**
1. Firefox doesn't support PWA installation directly
2. You can bookmark the page for quick access

---

## 🎯 Features Overview

### 📊 Dashboard
The main screen shows:
- **Income/Expense/Balance** summary cards
- **Quick actions** to add expenses or income
- **Payment reminders** banner (if any upcoming)
- **Recent transactions** list

### ➕ Adding Transactions

1. Tap the **"+"** button in the bottom navigation, or use Quick Actions
2. Select **Expense** or **Income**
3. Fill in the details:
   - **Amount** - Use the calculator button for quick math
   - **Description** - What was it for?
   - **Date** - Defaults to today, change for past/future dates
   - **Payee** - Who you paid/received from
   - **Category** - Food, Transport, etc.
   - **Payment Method** - Cash, Card, etc.
   - **Status** - Done, Pending, or InFuture

4. **For future payments**, you can set reminders:
   - No reminder
   - Every time I visit
   - Custom duration (X days/weeks/months before)
   - Specific date

5. Optionally attach **invoice images** (up to 5)
6. Tap **"Add Transaction"**

### 📋 Transaction History

Access from the bottom navigation → **"History"**

- **Search** transactions by description or payee
- **Filter** by type, category, payment method, status, or date range
- **Edit** or **Delete** any transaction
- View attached **invoice images**

### 🏷️ Managing Tags

Go to **More** → **Manage Tags**

You can customize:
- **Payees** (who you pay/receive from)
- **Categories** (Food, Transport, Bills, etc.)
- **Payment Methods** (Cash, Credit Card, etc.)
- **Statuses** (Done, Pending, InFuture)

Each tag has an **icon/emoji** you can customize!

**To add a new tag:**
1. Select the tag type
2. Tap **"Add New"**
3. Enter the name and pick an icon
4. Tap **"Add"**

**To edit a tag:**
1. Tap **"Edit"** on any tag
2. Change the name or icon
3. Tap **"Save"** (all transactions using this tag will be updated)

### 📈 Reports

Access from bottom navigation → **"Reports"**

Features:
- **Date range presets** (This Week, This Month, Last 7/30/90 Days, This Year)
- **Custom date range** selection
- **Multiple chart types:**
  - Pie Chart - Category breakdown
  - Donut Chart - Payment method breakdown
  - Bar Chart - Daily spending
  - Horizontal Bar - Top categories/payees

**Export options:**
- 📄 **Export PDF** - Full report with charts and transaction list
- 📊 **Export CSV** - Spreadsheet-compatible data

### ⚙️ Settings

Access from bottom navigation → **"More"**

#### 🎨 Appearance
- **Theme**: Light, Dark, or System (auto)
- **Hide Amounts**: Privacy mode - blurs all monetary values

#### 💱 Currency Settings (Multi-Currency Support)

Perfect for travelers or managing expenses in multiple currencies!

**Home Currency** 🏠
- Set your native/home currency
- Reports will convert all transactions to this currency
- Default currency for displaying totals

**Current Currency** ✈️ (Travel Mode)
- Set when traveling to a new country
- New transactions will use this currency by default
- Each transaction remembers its original currency

**Exchange Rates** 📊
- **Fetch Live Rates**: Get current rates from the internet
- **Manual Entry**: Edit rates manually when offline
- **Reset to Defaults**: Restore approximate default rates

**How it works:**
1. Set your **Home Currency** (e.g., USD) once
2. When traveling, change **Current Currency** (e.g., EUR)
3. Add expenses in local currency
4. Dashboard and Reports show totals converted to your home currency
5. Each transaction keeps its original currency for accuracy

#### 🔔 Reminders
- Enable/disable reminders
- Show reminders on app open
- Set default reminder time for new transactions

#### 💾 Backup & Restore
- **Export Backup**: Download all your data as a JSON file
- **Import Backup**: Restore from a backup file
- **Clear All Data**: Reset the app (irreversible!)

---

## 💡 Tips & Tricks

### Quick Amount Entry
- Tap the **calculator icon** next to the amount field
- Do quick calculations like `150+75+30`
- Result is automatically filled in

### Privacy Mode
- Tap the **eye icon** in the top bar to hide all amounts
- Great for checking your app in public!

### Dark Mode
- Tap the **theme icon** in the top bar to cycle through:
  - ☀️ Light → 🌙 Dark → 💻 System

### Future Transactions
- Set status to **"InFuture"** for upcoming payments
- Add a **reminder** to get notified before it's due
- When done, change status to **"Done"**

### Attach Receipts
- Take photos of receipts when adding expenses
- Access them anytime from the transaction details
- Images are stored locally (included in backups)

### Regular Backups
- Regularly export backups from Settings
- Backups include all transactions, tags, and images
- Store backup files safely (cloud storage, email to yourself)

### Multi-Currency for Travel
- Before traveling, go to Settings → Currency Settings
- Set your **Home Currency** (your native currency)
- When you arrive, change **Current Currency** to local currency
- All expenses will be recorded in local currency
- Reports convert everything to your home currency

---

## 🔒 Privacy & Data

- **All data is stored locally** on your device
- **No account required** - no sign-up, no login
- **No data sent to servers** - fully offline capable
- **You control your data** - export, import, or delete anytime

---

## 📱 Offline Support

Once installed, the app works **completely offline**:
- Add and edit transactions
- View all your data
- Generate reports

Data syncs automatically when you're back online (for PWA updates).

---

## ❓ Troubleshooting

### App not installing?
- **iOS**: Make sure you're using Safari
- **Android**: Try Chrome or Edge
- Clear browser cache and try again

### Data not showing?
- Check if you have localStorage enabled
- Try refreshing the page
- Restore from a backup if needed

### Reminders not showing?
- Make sure reminders are enabled in Settings
- Check that "Show on App Open" is turned on
- Transaction must have status "InFuture" or "Pending"

---

## 🆘 Need Help?

If you encounter any issues:
1. Try refreshing the app
2. Clear browser cache
3. Export a backup before troubleshooting
4. Check that JavaScript and localStorage are enabled

---

## 📝 Version History

**v1.1.0** - Multi-Currency Support
- Multi-currency support for travelers
- Select currency per transaction
- Home currency for reports
- Travel mode - change default currency while traveling
- Live exchange rates from internet
- Manual exchange rate entry
- Currency conversion in reports
- Filter transactions by currency
- Currency info in exports (CSV, PDF)

**v1.0.0** - Initial Release
- Transaction management (add, edit, delete)
- Custom tags with icons
- Invoice image attachments
- Reports with charts
- PDF & CSV export
- Backup & restore
- Payment reminders
- Dark mode support
- Privacy mode (hide amounts)
- PWA support for mobile installation

---

Made with ❤️ for easy expense tracking!