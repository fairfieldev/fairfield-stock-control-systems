# Login Credentials - Fairfield Stock Control System

## Default User Accounts

The system comes with pre-configured users for testing. All users use the password: **`Password123`** or **`password`**

### Admin Account
- **Email:** admin@fairfield.com
- **Password:** Password123
- **Role:** Administrator
- **Permissions:** Full access to all features

### Dispatch Account
- **Email:** dispatch@fairfield.com
- **Password:** Password123
- **Role:** Dispatch
- **Permissions:** Can create and dispatch transfers

### Receiver Account
- **Email:** receiver@fairfield.com
- **Password:** Password123
- **Role:** Receiver
- **Permissions:** Can receive transfers and report shortages/damages

### View-Only Account
- **Email:** viewer@fairfield.com
- **Password:** Password123
- **Role:** View Only
- **Permissions:** Can only view data, no editing capabilities

## First-Time Setup

### 1. Configure Firebase Environment Variables (Required for Migration)
Before migrating your Firebase data, set these environment variables in Replit Secrets:
- `VITE_FIREBASE_API_KEY` - Your Firebase API key
- `VITE_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `VITE_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain (e.g., your-project.firebaseapp.com)
- `VITE_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Your messaging sender ID
- `VITE_FIREBASE_APP_ID` - Your Firebase app ID

These can be found in your Firebase Console under Project Settings.

### 2. Login
Use any of the accounts above to log into the system.

### 3. Configure Email Notifications (Optional)
1. Navigate to **Integration Settings** in the sidebar
2. Select your email provider (Gmail, SendGrid, or Resend)
3. Enter the recipient email address (default: shabsm4@gmail.com)
4. For Gmail:
   - The system uses Gmail SMTP
   - You'll need to configure Gmail App Password in environment variables
   - Set `GMAIL_USER` and `GMAIL_PASSWORD` in Replit Secrets
5. Save the configuration
6. Click "Send Test Email" to verify

### 4. Migrate Firebase Data
If you have existing data in Firebase:
1. Make sure you've configured the Firebase environment variables (see Step 1)
2. Go to **Integration Settings** page
3. Scroll to the "Firebase Data Migration" section
4. Click **"Migrate Firebase Data"** button
5. The system will automatically:
   - Connect to your Firebase project using the environment variables
   - Import all products, locations, transfers, and users
   - Skip duplicates (idempotent - safe to run multiple times)
   - Preserve all historical data and relationships
6. Check the success message for migration statistics

**Note:** Migration is idempotent. Running it multiple times will only import new data, skipping existing records based on product codes, location names, and user emails.

## Role Permissions

### Admin
- Full access to all pages
- User management capabilities
- Can configure email settings
- Can migrate data from Firebase

### Dispatch
- Create new transfers
- Dispatch pending transfers
- View all products and locations
- Cannot receive transfers or manage users

### Receiver
- Receive dispatched transfers
- Report shortages and damages
- View transfer history
- Cannot create or dispatch transfers

### View Only
- Read-only access to dashboard
- Can view all transfers and products
- Cannot create, edit, or delete anything

## Email Notifications

Once email settings are configured, the system automatically sends notifications when:
- A transfer is marked as "Received"
- The email includes:
  - Transfer details (ID, from/to locations, driver, vehicle)
  - Complete list of products transferred
  - Any reported shortages
  - Any reported damages
  - Timestamp of receipt

## Production Deployment Notes

### Security
- **IMPORTANT:** Change default passwords before production use
- Currently uses simple password validation for demo purposes
- In production, implement proper password hashing (bcrypt/argon2)
- Add session management with secure cookies
- Enable HTTPS for all communications

### Email Configuration
For Gmail in production:
1. Create a Google App Password: https://myaccount.google.com/apppasswords
2. Set environment variables in Replit:
   - `GMAIL_USER`: Your Gmail address
   - `GMAIL_PASSWORD`: The App Password (not your regular password)
3. Configure sender email in Integration Settings

For SendGrid/Resend:
1. Get API key from your provider
2. Set in Replit Secrets: `SENDGRID_API_KEY` or `RESEND_API_KEY`
3. Configure in Integration Settings

## Support

For issues or questions, contact the development team or refer to the main documentation.
