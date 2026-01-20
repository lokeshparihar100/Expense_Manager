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
- **Export Backup**: Download all your data as a JSON file
- **Import Backup**: Restore from a backup file
- **Clear All Data**: Reset the app (irreversible!)

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