# Quick Start Guide - No Git Required

## Download & Run Locally

### Step 1: Download the Project
Download this project as a ZIP file and extract it to your computer.

### Step 2: Install Dependencies
Open a terminal/command prompt in the project folder and run:
```bash
npm install
```

### Step 3: Build the App
```bash
npm run build
```

### Step 4: Start the Server
```bash
npm start
```

### Step 5: Open in Browser
Visit: **http://localhost:3000**

## Test Accounts
All accounts use password: **`Password123`**

- **Admin** (full access): `admin@fairfield.com`
- **Dispatch** (read-only): `dispatch@fairfield.com`
- **Receiver** (read-only): `receiver@fairfield.com`
- **View Only** (read-only): `viewer@fairfield.com`

## What's Included

✅ Professional React frontend with Tailwind CSS  
✅ Express.js backend API  
✅ Role-based access control (Admin/Dispatch/Receiver/View-Only)  
✅ Product & Location management  
✅ Transfer order tracking with QR codes  
✅ Print-friendly reports  
✅ Email notifications  
✅ Firebase data synchronization  
✅ Dark mode support  
✅ Barcode scanning support  

## File Structure
```
├── client/              # React frontend source code
├── server/              # Express backend
├── dist/                # Built files (created after npm run build)
├── index.html           # This welcome page
├── index.js             # Production entry point
├── netlify.toml         # Netlify deployment config
├── package.json         # Dependencies and build scripts
└── NETLIFY_DEPLOYMENT.md # Full Netlify deployment guide
```

## Deploy to Netlify (No Git Required)

### Option 1: Direct Upload
1. Run `npm run build` locally
2. Go to https://netlify.com/drop
3. Drag & drop the entire `dist` folder
4. Set environment variables (SESSION_SECRET required)
5. Your app is live!

### Option 2: Git-free Deployment
1. Go to https://netlify.com
2. Click "Add new site" → "Deploy manually"
3. Drag & drop your entire project folder
4. Netlify will run: `npm run build` → `npm start`
5. Set environment variables
6. Your app is live!

## Required Environment Variables

Create a `.env` file in the root directory:

```
SESSION_SECRET=your-random-secret-here
```

Optional (for Firebase features):
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Troubleshooting

**Issue: "npm: command not found"**
- Install Node.js from https://nodejs.org (version 18+)

**Issue: Port 3000 already in use**
- Kill the process using that port or change it in `server/app.ts`

**Issue: Module not found errors**
- Run `npm install` again
- Delete `node_modules` folder and `package-lock.json`, then run `npm install`

**Issue: Build fails**
- Ensure Node.js version is 18 or higher: `node --version`
- Delete `node_modules` and try again
- Check that all dependencies are installed: `npm install`

## Features Overview

### Dashboard
- Real-time overview of transfers
- Inventory statistics
- Quick access to main features

### Products Management
- Create, edit, delete products
- Organize by category
- Track units (boxes, pallets, etc.)

### Locations
- Manage warehouse locations
- Store addresses and details
- Quick location selection

### Transfer Orders
- Create new transfers
- Dispatch with driver details
- Receive and report issues
- **QR codes for barcode scanning**
- Print transfer documents

### Reports
- Transfer history and statistics
- Status filtering
- Print comprehensive reports

### Email Notifications
- Configure email provider (Gmail, SendGrid, Resend)
- Automatic notifications when transfers received
- Includes shortage and damage reports

### User Management
- Create new users
- Assign roles and permissions
- Set passwords

### Integration Settings
- Email provider configuration
- Logo upload
- Firebase data synchronization
- All settings stored with the app

## Permission Levels

**Admin**: Full access - create/edit/delete everything  
**Dispatch**: Read-only - can view and dispatch transfers  
**Receiver**: Read-only - can view and receive transfers  
**View Only**: Read-only - dashboard access only  

## Build Commands

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check

# Database migration (if using PostgreSQL)
npm run db:push
```

## Production Deployment Checklist

- [ ] Change `SESSION_SECRET` to a strong random value
- [ ] Set up proper database (PostgreSQL recommended)
- [ ] Enable HTTPS (automatic on most hosting)
- [ ] Configure email provider
- [ ] Set Firebase credentials (if using)
- [ ] Test all user roles
- [ ] Set up backups
- [ ] Configure monitoring/logging

## Need Help?

1. Check `NETLIFY_DEPLOYMENT.md` for Netlify-specific issues
2. Run locally first with `npm start`
3. Check browser console for errors
4. Verify all environment variables are set

Enjoy your Stock Control System! 🚀
