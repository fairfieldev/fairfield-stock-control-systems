# Netlify Deployment Guide

Your Fairfield Stock Control System is now ready for deployment to Netlify!

## Prerequisites
- A GitHub repository with your project
- A Netlify account (free at netlify.com)

## Deployment Steps

### 1. Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Fairfield Stock Control System - Ready for Netlify"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Connect to Netlify
1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Select GitHub and authorize Netlify
4. Select your repository
5. Netlify will auto-detect the build configuration from `netlify.toml`

### 3. Configure Environment Variables
In Netlify dashboard, go to **Site Settings → Build & Deploy → Environment**

Add the following environment variables:

#### Required Variables
- `SESSION_SECRET` - A random string for session encryption (generate one)

#### Firebase Variables (if using Firebase sync)
- `VITE_FIREBASE_API_KEY` - Your Firebase API key
- `VITE_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `VITE_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
- `VITE_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Your Firebase app ID

### 4. Deploy
Click "Deploy" - Netlify will automatically:
1. Run `npm run build` to build React frontend and backend
2. Run `npm start` to start the Express server
3. Serve your app from the built frontend

## What Gets Deployed

### Frontend
- React application compiled to static files
- Served from the `dist` folder
- All pages, components, and styling included

### Backend
- Express.js API server
- All routes and business logic
- In-memory data storage (data resets on server restart)

## Database Persistence
The current deployment uses in-memory storage, which means data is lost when the server restarts. For production use, consider:

1. **Upgrade to PostgreSQL**
   - Netlify supports PostgreSQL via third-party services
   - Modify `server/storage.ts` to use PostgreSQL instead of MemStorage

2. **Use Firebase/Firestore**
   - Data syncs automatically on login
   - Persistent across server restarts
   - Requires Firebase environment variables

## Configuration Files

### `netlify.toml`
- Specifies build command: `npm run build`
- Sets Node.js version to 20
- Configures redirects for SPA routing
- Sets production environment variables

### `index.js` (Root Entry Point)
- Imports and starts the production server
- Used by Netlify to run `npm start`

### `package.json` Scripts
- `npm run build` - Builds React frontend and bundles Express server
- `npm start` - Starts the production server (runs `dist/index.js`)

## Testing Before Deployment

### Build Locally
```bash
npm run build
npm start
```

Then visit http://localhost:3000 (or the configured port)

### Test All Features
1. ✅ Login with test credentials
2. ✅ Create/edit/delete items (admin only)
3. ✅ View transfers and reports
4. ✅ Use barcode scanner on transfers page
5. ✅ Print documents from transfers/reports
6. ✅ Firebase data syncs on login

## Troubleshooting

### Build Fails
- Check logs in Netlify dashboard
- Ensure all environment variables are set
- Verify `npm run build` works locally first

### Server Won't Start
- Check `npm start` works locally
- Verify SESSION_SECRET is set
- Check Node.js version compatibility (target: Node 20)

### Firebase Data Not Syncing
- Verify Firebase environment variables are correct
- Check Firebase credentials have proper permissions
- Enable Firestore REST API in Firebase console

### Data Resets on Deploy
- This is normal with in-memory storage
- Consider migrating to PostgreSQL or Firestore
- Use Firebase migration feature to preserve data

## Support

For issues:
1. Check Netlify deployment logs
2. Test locally with `npm run build && npm start`
3. Verify all environment variables are set correctly
4. Review Firebase permissions if using Firebase features

## Production Checklist

Before going live in production:
- [ ] Set strong SESSION_SECRET
- [ ] Configure proper database (PostgreSQL or Firestore)
- [ ] Enable HTTPS (automatic with Netlify)
- [ ] Set up custom domain
- [ ] Configure email notifications (Integration Settings)
- [ ] Test all user roles and permissions
- [ ] Review security settings
- [ ] Set up backups (if using PostgreSQL/Firestore)
