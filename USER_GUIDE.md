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

### 👥 Multi-Account Support

Manage multiple accounts for different purposes (Personal, Business, Family, etc.)!

**Creating Accounts:**
1. Go to **More** → **Manage Accounts**
2. Tap **"+ Add Account"**
3. Enter account name and optional description
4. Choose an icon (emoji) for the account
5. Select a color theme
6. Tap **"Create Account"**

**Switching Accounts:**
- Use the **account selector** in the top navigation bar
- Tap to see all accounts and switch instantly
- Each account shows its own transactions, reports, and statistics

**Managing Accounts:**
- **Edit**: Change name, description, icon, or color
- **Delete**: Remove an account and all its transactions (requires confirmation)
- **Default Account**: The "Default" account is created automatically and cannot be deleted

**How it works:**
- Each account has completely separate transactions
- Reports and statistics are account-specific
- Tags (categories, payees, payment methods) are shared across all accounts
- Currency settings are global (same across all accounts)
- When you add a transaction, it's automatically associated with the active account

### 📊 Dashboard
The main screen shows (for the currently active account):
- **Account selector** to switch between accounts
- **Income/Expense/Balance** summary cards
- **Quick actions** to add expenses or income
- **Payment reminders** banner (if any upcoming)
- **Recent transactions** list

### ➕ Adding Transactions

1. Tap the **"+"** button in the bottom navigation, or use Quick Actions
2. Select **Expense** or **Income**
3. Fill in the details:
   - **Amount** - Use the calculator button for quick math
   - **Description** - Optional, describe what it was for
   - **Date** - Defaults to today, change for past/future dates
   - **Time** - Defaults to current time, helps track sequence
   - **Payee** - Who you paid/received from
     - 💡 **Smart Auto-fill**: When you select a payee, the app automatically fills in category and payment method based on your previous transactions with that payee!
     - For new payees, defaults to "Other" category and payment method
   - **Category** - Food, Transport, etc. (auto-filled for known payees)
   - **Payment Method** - Cash, Card, etc. (auto-filled for known payees)
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
- **Sorted by date and time** - Most recent transactions appear first
- **Pagination** - Shows 20 transactions per page for better performance
  - Navigate between pages using Previous/Next buttons
  - Smart page numbers with ellipsis for large transaction lists
  - Shows current page and total pages
- **Edit**, **Copy**, or **Delete** any transaction
- View attached **invoice images**

### 📋 Copy Transaction Feature

Quickly duplicate any existing transaction with one tap!

**How to Copy:**
1. Find the transaction you want to copy
2. Tap the **"Copy"** button (blue button between Edit and Delete)
3. A new transaction is created instantly with:
   - Same amount and currency
   - Same description
   - Same category, payee, and payment method
   - Same status
   - **Today's date** (automatically updated)
   - Same invoice images (if any)
   - Same notes

**Use Cases:**
- **Recurring expenses**: Copy monthly bills or subscriptions
- **Similar purchases**: Copy grocery or fuel expenses
- **Template transactions**: Create a "template" transaction and copy it when needed
- **Quick entry**: Faster than creating from scratch

**After Copying:**
- The copied transaction appears as a new, regular transaction
- You can edit, delete, or view it like any other transaction
- It's associated with the currently active account

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

**Note:** Reports show data only for the currently active account. Switch accounts to view reports for different accounts.

Features:
- **Date range presets** (This Week, This Month, Last 7/30/90 Days, This Year)
- **Year selection** with multi-year support
- **Custom date range** selection
- **Multiple chart types:**
  - Pie Chart - Category breakdown
  - Donut Chart - Payment method breakdown
  - Bar Chart - Daily/Monthly spending
  - Horizontal Bar - Top categories/payees

**Multi-Year Selection:**
- Click any year to select it (highlights the selected year)
- Hold **Ctrl** (Windows) or **Cmd** (Mac) and click to select multiple years
- When multiple years are selected, reports show combined data
- A message shows which years are included

**Multi-Currency Reports:**
- When transactions span multiple currencies, a conversion toggle appears
- Convert all amounts to your preferred currency for accurate totals
- Search and select any currency for the report
- Or view amounts in original currencies (with warning about mixed totals)

**Export options:**
- 📄 **Export PDF** - Full report with charts and transaction list
- 📊 **Export CSV** - Spreadsheet-compatible data (includes currency column)
- ☁️ **Upload to Google Drive** - When connected, upload reports directly to Drive

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
- **Export Backup**: Download all your data as a JSON file (includes all accounts and transactions)
- **Import Backup**: Restore from a backup file (restores all accounts)
- **Clear All Data**: Reset the app and delete all accounts (irreversible!)

#### ⏰ Scheduled Backup (Backup Reminders)
Protect your data with scheduled backup reminders that prompt you to download backups!

**Why Download-Based Backups?**
Your app data is stored in browser storage. If browser data is cleared (cache, cookies, etc.), 
you lose everything. Downloaded backup files are saved to your device permanently, keeping your data safe.

**Features:**
- **Enable/Disable**: Toggle backup reminders on or off
- **Backup Time**: Choose when to be reminded (default: 9:00 AM)
- **Frequency**: Daily or weekly backup reminders
- **Backup Status**: See when you last downloaded a backup
- **Download Now**: Manually download a backup anytime

**When Does the Backup Popup Appear?**
The backup reminder popup appears when ALL of these conditions are met:
1. **Scheduled time has passed** - Current time is AFTER your set backup time
2. **No backup downloaded recently** - You haven't downloaded a backup today (daily) or this week (weekly)
3. **Not dismissed this session** - You haven't clicked "Remind Later" since opening the browser
4. **Has data** - You have at least one transaction to backup

**Example:**
- You set backup time to 6:02 PM
- At 6:00 PM, you refresh the page → No popup (time hasn't passed yet)
- At 6:03 PM, you refresh the page → Popup appears! (time has passed)
- You click "Remind Later" → Popup dismissed for this browser session
- You close the browser completely and reopen → Popup will appear again
- You download the backup → No popup until tomorrow (for daily frequency)

**Important Notes:**
- The popup only appears when you OPEN or REFRESH the app after the scheduled time
- The app doesn't run in the background - it checks when you use it
- "Remind Later" dismisses only for this browser session (closes when you close the browser)
- Changing any backup setting clears the "Remind Later" status

**How to test:**
1. Go to Settings → Scheduled Backup
2. Set the backup time to a few minutes from now
3. Wait until that time passes
4. Refresh the page or switch to another tab and back
5. The backup popup should appear

**Tips:**
- Store backups in multiple locations (Google Drive, Dropbox, email to yourself)
- The backup file is a JSON file that can be imported back using Settings → Import Backup
- Check browser console (F12 → Console) for "[Backup]" logs if troubleshooting

#### 🔐 PIN Security

Protect your financial data with an optional 4-digit PIN! When enabled, you'll need to enter your PIN every time you open the app.

**Features:**
- **Optional Setup**: Set up during first launch or skip and enable later from Settings
- **4-Digit PIN**: Simple numeric PIN for quick access
- **App Lock**: PIN required on every app launch when enabled
- **PIN Management**: Change or remove your PIN anytime from Settings
- **Mobile-Friendly**: Numeric keyboard optimized for quick entry
- **Security Features**:
  - Auto-verify when 4 digits are entered
  - Shake animation on incorrect PIN
  - Attempt counter with help message after 3 failed attempts
  - PIN is securely hashed before storage

**First-Time Setup:**

When you open the app for the first time, you'll see a PIN setup screen:
1. **Set Up PIN**: Choose this to create a 4-digit PIN
   - Enter your desired 4-digit PIN
   - Confirm by entering it again
   - Your app is now protected!
2. **Skip for Now**: Choose this to use the app without PIN protection
   - You can always enable it later from Settings

**Enabling PIN Later:**

If you skipped initial setup or want to add PIN protection:
1. Go to **More** → **Settings**
2. Scroll to the **Security** section
3. Find **PIN Protection** (shows "Inactive" if no PIN set)
4. Tap **"Set PIN"**
5. Enter a 4-digit PIN
6. Confirm by entering it again
7. PIN is now active!

**Changing Your PIN:**

If you want to change your existing PIN:
1. Go to **More** → **Settings** → **Security**
2. Tap **"Change PIN"**
3. Enter your current PIN
4. Enter your new 4-digit PIN
5. Confirm the new PIN
6. PIN successfully changed!

**Removing PIN:**

To disable PIN protection:
1. Go to **More** → **Settings** → **Security**
2. Tap **"Remove PIN"** (red button)
3. Read the warning: "Removing PIN will disable security protection"
4. Enter your current PIN to confirm
5. PIN protection is now disabled

**How It Works:**

- **On App Launch**: When PIN is enabled, you'll see the lock screen
- **Enter PIN**: Type your 4-digit PIN (or tap the digits)
- **Auto-Unlock**: App automatically unlocks when you enter 4 digits
- **Wrong PIN**: Screen shakes and PIN field clears
- **After 3 Failed Attempts**: Shows help message about clearing browser data to reset

**Important Notes:**

- Your PIN is stored **securely hashed** in browser localStorage
- If you forget your PIN, you'll need to **clear browser data** to reset the app
  - On Chrome: Settings → Privacy → Clear browsing data → Cookies and site data
  - On Safari: Settings → Safari → Clear History and Website Data
  - ⚠️ **Warning**: Clearing data will delete all your transactions! Export a backup first if possible.
- PIN is stored locally - it never leaves your device
- Each browser/device has its own PIN (if you use multiple browsers)
- The PIN feature is designed for basic privacy, not military-grade security

**Security Best Practices:**

- Choose a PIN that's not easily guessable (avoid 1234, 0000, etc.)
- Don't share your PIN with others
- Regularly export backups (Settings → Backup & Restore)
- Store backups securely (Google Drive, Dropbox, or email to yourself)
- If you suspect someone knows your PIN, change it immediately

**Troubleshooting:**

- **Forgot PIN?** You'll need to clear browser data (see Important Notes above)
- **PIN not being asked?** Check Settings → Security to ensure PIN is "Active"
- **Auto-unlock not working?** Make sure you're entering exactly 4 digits
- **PIN setup screen appearing again?** Browser data may have been cleared

#### ☁️ Google Drive Backup (Cloud Storage)

Automatically upload backups directly to your Google Drive! When enabled, scheduled backups 
are uploaded directly to a dedicated folder in your Drive - no manual downloading needed.

**Features:**
- **Automatic Cloud Backup**: Scheduled backups upload directly to Drive (no popup needed)
- **Dedicated Folders**: 
  - Backups stored in "Expense_Manager_Backups" folder
  - Reports stored in "Expense_Manager_Reports" folder
- **7-Day Retention**: Keeps the 7 most recent backups, automatically deletes older ones
- **Manual Upload**: Upload backup to Drive anytime from Settings
- **Report Upload**: Upload CSV reports directly from Reports page
- **View Backups**: Browse all your Drive backups from within the app

**Setup Instructions:**

To use Google Drive backup, you need to create a Google Cloud project with Drive API enabled.
This is a one-time setup:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project** (or use existing)
   - Click "Select a project" → "New Project"
   - Name it (e.g., "Expense Manager Backup")
   - Click "Create"

3. **Enable Google Drive API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click on it and click "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen:
     - User Type: External
     - App name: "Expense Manager Backup"
     - Support email: Your email
     - Save and Continue through all steps
   - For Application type, select "Web application"
   - Name: "Expense Manager Web"
   - Under "Authorized JavaScript origins", add your app URL:
     - For local development: `http://localhost:5173`
     - For production: Your deployed app URL
   - Click "Create"

5. **Copy Client ID**
   - Copy the Client ID (looks like: `xxxxx.apps.googleusercontent.com`)
   - Paste it into the app: Settings → Google Drive Backup → Google Client ID

6. **Connect Your Account**
   - Click "Connect Google Drive"
   - Sign in with your Google account
   - Grant permission to access Google Drive (only for files created by this app)

**How Automatic Backup Works:**
- When Google Drive is connected AND "Auto Upload" is enabled
- Scheduled backups upload directly to Drive (no popup!)
- You'll see a brief notification: "Uploading backup to Google Drive..."
- On success: "Backup uploaded to Google Drive!" (disappears after 5 seconds)
- On failure: Falls back to showing the manual download popup

**Important Notes:**
- Your Google API credentials are stored locally in your browser
- The app can only access files it creates (limited scope for security)
- If tokens expire, you'll need to reconnect (click "Connect Google Drive" again)
- Backups are stored in your personal Google Drive in a folder called "Expense_Manager_Backups"
- Your Client ID is masked after successful connection for security

#### 🔧 Google Drive Troubleshooting

**Error: "Access blocked: App has not completed the Google verification process"**

This error occurs because your Google Cloud project is in "Testing" mode. You need to add yourself as a test user:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"

3. **Add Test Users**
   - Scroll down to the "Test users" section
   - Click "**+ ADD USERS**"
   - Enter your email address (the one you use to sign in)
   - Click "Save"

4. **Try Again**
   - Go back to the Expense Manager app
   - Click "Connect Google Drive" again
   - It should now work!

**Why does this happen?**
- When you create an OAuth app, it starts in "Testing" mode
- Only emails listed as "Test users" can use it
- This is a security feature by Google
- You can add up to 100 test users

**Alternative: Publish the App**
If you want anyone to use the app (not just test users):
1. Go to "OAuth consent screen"
2. Click "PUBLISH APP"
3. Note: Google may require app verification for certain scopes

**Error: "Backup appears on Drive home page instead of folder"**
- The app stores backups in a folder called "Expense_Manager_Backups"
- If you see files in "Recent", that's normal - Google shows all recent files there
- Check the actual folder by:
  1. Open Google Drive
  2. Look for "Expense_Manager_Backups" folder in "My Drive"
  3. Your backups should be inside that folder

**Error: "Token expired" or "Sign-in required"**
- Google access tokens expire after some time
- Simply click "Connect Google Drive" again to refresh the connection
- Your folder and existing backups will be preserved

---

## 💡 Tips & Tricks

### Multi-Account Organization
- Create separate accounts for **Personal**, **Business**, and **Family** expenses
- Use different colored icons to quickly identify accounts
- Keep business expenses separate for tax purposes
- Track shared family expenses in a dedicated family account

### Copy Instead of Re-entering
- Use the **Copy** button for recurring transactions
- Create a "template" transaction and copy it when needed
- Perfect for monthly subscriptions or regular expenses

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

### PIN Protection
- Enable PIN security for an extra layer of protection
- Perfect for shared devices or public spaces
- Remember to export a backup before setting up PIN (in case you forget it)
- Change your PIN regularly for better security

### Regular Backups
- Regularly export backups from Settings
- Backups include all accounts, transactions, tags, and images
- Store backup files safely (cloud storage, email to yourself, or use Google Drive backup)

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

## 🐛 Report a Bug or Request a Feature

Found a bug or have an idea for a new feature? You can report it directly from the app!

### How to Report:

1. Go to **Help & About** (More → Help)
2. Scroll down to **"Report an Issue"**
3. Choose **"Report Bug"** or **"Request Feature"**
4. Fill in the form:
   - **Title**: Brief description of the issue
   - **Description**: Detailed explanation
   - **Steps to Reproduce**: (for bugs) How to recreate the issue
   - **Expected vs Actual Behavior**: (for bugs) What should happen vs what happens
   - **Severity**: Low, Medium, High, or Critical

5. Click **"Submit on GitHub"**
6. This opens GitHub with your report pre-filled
7. Review and submit the issue

### Automatically Included Info:
- App version
- Browser type
- Operating system
- Screen size
- Whether app is installed as PWA

### Note:
- You need a GitHub account to submit issues
- Your device info helps us reproduce and fix bugs faster
- All reports are public on GitHub

---

## 📝 Version History

**v1.7.0** - Optional PIN Security
- 🔐 **PIN Security Feature**: Optional 4-digit PIN protection for your financial data
  - First-time setup screen with option to skip
  - PIN entry required on app launch when enabled
  - Change or remove PIN anytime from Settings
  - Secure PIN hashing for local storage
  - Auto-verify when 4 digits entered
  - Shake animation on incorrect PIN
  - Attempt counter with help after 3 failed attempts
  - Full dark mode support for all PIN screens
  - Mobile-friendly numeric keyboard
- 🎨 **Security Section in Settings**:
  - New dedicated Security section
  - PIN Manager component with status indicator
  - Set/Change/Remove PIN modals
  - Active/Inactive status display
- 🔒 **Enhanced Privacy**:
  - PIN stored as secure hash in localStorage
  - Optional security layer on top of local storage
  - Perfect for shared devices or public use
- 📚 **Documentation Updates**:
  - Comprehensive PIN security guide
  - Security best practices
  - Troubleshooting for forgotten PIN
  - Tips for secure PIN management

**v1.6.0** - Multi-Account Support & Copy Transactions
- 👥 **Multi-Account Support**: Manage separate accounts for different purposes
  - Create multiple accounts (Personal, Business, Family, etc.)
  - Each account has its own independent set of transactions
  - Switch between accounts seamlessly from the navigation bar
  - Account-specific reports and statistics
  - Visual account management interface with edit and delete options
  - Automatic data migration from single account to multi-account structure
- 📋 **Copy Transaction Feature**: Quickly duplicate existing transactions
  - New "Copy" button alongside Edit and Delete actions
  - Copies all transaction details (amount, category, payee, payment method, etc.)
  - Automatically sets date to today
  - Invoice images are also copied
  - Perfect for recurring expenses with similar details
- 🎨 **UI Enhancements**:
  - Account selector in navigation bar
  - Account management page accessible from More section
  - Improved account switching experience
- 📧 **Contact & Privacy**:
  - Added Contact Us section with email support
  - Comprehensive Privacy Policy modal
  - Creator information with LinkedIn and Portfolio links
  - Copyright information

**v1.5.0** - Smart Auto-fill & Enhanced Transaction Management
- 🎯 **Smart Auto-fill**: Category and payment method auto-fill based on previous transactions with the same payee
  - Saves time by remembering your transaction patterns
  - Defaults to "Other" for new payees
- ⏰ **Time Tracking**: Added time field to transactions
  - Defaults to current time when adding
  - Helps track exact sequence of transactions
  - Displays alongside date in transaction cards
- 📋 **Transaction Sorting**: Transactions now sorted by date AND time
  - Most recent transactions appear first
  - Same-day transactions ordered by time
- 📄 **Pagination**: All Transactions page now shows 20 items per page
  - Improved performance for large transaction lists
  - Smart page navigation with Previous/Next buttons
  - Page numbers with ellipsis for easy navigation
- ✏️ **Optional Description**: Description field is now optional when adding transactions

**v1.4.0** - Google Drive Backup Integration
- ☁️ **Google Drive Backup**: Automatically upload backups to Google Drive!
  - Connect your Google account with OAuth authentication
  - Automatic cloud backup when scheduled backup is due (no popup needed)
  - Backups stored in dedicated "Expense_Manager_Backups" folder
  - View and manage Drive backups from within the app
  - 7-day retention: keeps 7 most recent backups, auto-deletes older ones
  - Manual upload anytime from Settings
  - Fallback to download popup if Drive upload fails
- 📊 **Report Upload to Drive**:
  - Upload CSV reports directly to Google Drive from Reports page
  - Reports stored in "Expense_Manager_Reports" folder
  - Upload transactions or summary reports with one click
- 🔒 **Security Improvements**:
  - Client ID is masked when connected (only shows first/last characters)
  - Folder verification before each upload
- 🔧 **Improved Scheduled Backup**:
  - Auto-uploads to Drive when connected and enabled
  - Shows upload progress notification
  - Better error handling with fallback to manual download
- 🎨 **UI Improvements**:
  - Collapsible backup sections in Settings for cleaner UI
  - Searchable currency picker in transaction form
  - Consolidated backup controls

**v1.3.0** - Scheduled Backup & Currency Fixes
- ⏰ **Scheduled Backup Reminders**: Get prompted to download backups at scheduled times
  - Enable/disable backup reminders
  - Set custom backup time (default: 9:00 AM)
  - Choose frequency: daily or weekly
  - Backups download as files to your device (safe from browser data clearing)
  - See backup status and days since last backup
- 💱 **Currency Display Fixes**:
  - Dashboard now always shows totals in home currency
  - Reports properly convert single-currency transactions to report currency
  - Currency conversion indicator shows when conversion is active
- 🔄 **Improved Currency Handling**:
  - Single currency transactions now properly convert to home currency
  - Reports show conversion toggle when transaction currency differs from home currency

**v1.2.0** - UI/UX Improvements
- 🎨 **Full Dark Mode Support** - All components now properly support dark mode:
  - Reports page charts and tables
  - Date range picker
  - Reminder modal
  - All chart components
- 📅 **Multi-Year Selection** - Select multiple years in reports:
  - Click to select single year (properly highlights selection)
  - Ctrl/Cmd + Click for multi-select
  - Shows combined data for selected years
- 💱 **Currency Fixes**:
  - Fixed currency symbol overflow for long symbols (e.g., Mex$)
  - Charts now display correct currency symbols
  - Added Georgian Lari (GEL) currency
- 🔍 **Searchable Currency Picker** - Search currencies by name or code
- 🏠 **Independent Home/Current Currency** - Fixed sync issues

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

<div align="center">
  
  Made with ❤️ by **Lokesh Parihar**
  
  [Report Bug](../../issues) · [Request Feature](../../issues)
  
</div>