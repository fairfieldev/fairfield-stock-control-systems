# Deploy to Netlify - Complete Steps (No Drag & Drop)

## Your Session Secret Key
```
38ca0962f6b4dbe6ba307f31af8c08dff568fb0ca7f6cdacd75871e84c4ae3b5
```
**Save this key - you'll need it in Step 7 below**

---

## Deployment Steps

### Step 1: Create a GitHub Repository
1. Go to https://github.com/new
2. Create a new repository (name it `fairfield-stock-control` or similar)
3. **Do NOT add README, .gitignore, or license** (add them yourself)

### Step 2: Download Your Project
Download this entire project folder from Replit and extract it to your computer.

### Step 3: Push Project to GitHub (Using Git Command Line)

Open Command Prompt or Terminal in your project folder and run:

```bash
git init
git add .
git commit -m "Initial commit: Fairfield Stock Control System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fairfield-stock-control.git
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username**

### Step 4: Go to Netlify
1. Go to https://app.netlify.com
2. Sign in (create account if needed - FREE)
3. Click "Add new site" → "Import an existing project"

### Step 5: Connect GitHub
1. Click "GitHub"
2. Authorize Netlify to access your GitHub account
3. Select your `fairfield-stock-control` repository

### Step 6: Build Configuration
Netlify will auto-detect settings from `netlify.toml`:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- These are already configured - just click "Deploy site"

### Step 7: Add Environment Variables (IMPORTANT!)
After clicking "Deploy site", go to your site dashboard:

1. Click "Site settings" (top menu)
2. Go to **Build & Deploy** → **Environment**
3. Click "Edit variables"
4. Add the following:

**Variable Name**: `SESSION_SECRET`  
**Variable Value**: `38ca0962f6b4dbe6ba307f31af8c08dff568fb0ca7f6cdacd75871e84c4ae3b5`

5. Click "Save"

### Step 8: Trigger a New Deploy
1. Go back to your site
2. Click **"Deploys"** in the top menu
3. Click **"Trigger deploy"** → **"Deploy site"**
4. Wait for build to complete (2-3 minutes)

### Step 9: Your App is Live!
Once the build completes, Netlify will give you a URL like:
```
https://your-site-name.netlify.app
```

Visit that URL and you're done! 🎉

---

## If Build Fails

### Check the Build Logs
1. In Netlify, go to **Deploys**
2. Click the failed deploy
3. Click **"Deploy log"** to see what went wrong

### Common Issues:

**"Environment variable not set"**
- Go back to Step 7 and make sure SESSION_SECRET is added
- Redeploy after adding it

**"npm install failed"**
- Make sure `package.json` is in the root directory
- All node_modules dependencies are listed

**"Build command failed"**
- Ensure `npm run build` works locally first:
  ```bash
  npm install
  npm run build
  ```

---

## Test Your Live App

Once deployed, test with these accounts:
- **Email**: `admin@fairfield.com`
- **Password**: `Password123`

All 4 test accounts work (admin, dispatch, receiver, viewer-only)

---

## Updating Your App

To make changes and deploy them:

1. Edit files locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your change description"
   git push origin main
   ```
3. Netlify automatically redeploys!

---

## Firebase Integration (Optional)

If you want Firebase data synchronization, add these in Netlify Environment Variables (Step 7):

```
VITE_FIREBASE_API_KEY = your_key
VITE_FIREBASE_PROJECT_ID = your_project_id
VITE_FIREBASE_AUTH_DOMAIN = your_domain
VITE_FIREBASE_STORAGE_BUCKET = your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
VITE_FIREBASE_APP_ID = your_app_id
```

Without these, the app works fine but won't sync with Firebase automatically on login.

---

## Support

**Need help with Git?**
- Use GitHub Desktop (https://desktop.github.com) - easier than command line

**Netlify issues?**
- Check their docs: https://docs.netlify.com/
- Start a chat from https://app.netlify.com (bottom right)

**App not working?**
- Test locally first: `npm install && npm run build && npm start`
- Check browser console for errors (F12)

---

## Production Checklist

Before sharing with team:
- [ ] Session secret is set (done!)
- [ ] App deploys without errors
- [ ] Can login with test accounts
- [ ] All features work (transfers, reports, etc.)
- [ ] Dark mode works
- [ ] Mobile view works
- [ ] Print functionality works

**You're all set!** 🚀
