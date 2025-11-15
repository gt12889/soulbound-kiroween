# Firebase Web Configuration Guide

## Important Note

The file `portfolio-13181-firebase-adminsdk-fbsvc-db401d891c.json` you have is an **Admin SDK service account key** for server-side operations. This is NOT what you need for your React web app.

For your web app, you need the **Web App Configuration**.

## Steps to Get Web App Configuration

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/project/portfolio-13181/settings/general

2. **Navigate to Project Settings**
   - Click the gear icon ⚙️ in the left sidebar
   - Select "Project settings"

3. **Find Your Web App**
   - Scroll down to "Your apps" section
   - Look for a web app (icon: `</>`)
   
4. **If No Web App Exists:**
   - Click "Add app"
   - Select the web platform icon `</>`
   - Give it a nickname (e.g., "Dark Productivity Suite")
   - Click "Register app"

5. **Copy the Configuration**
   You'll see something like this:
   
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "portfolio-13181.firebaseapp.com",
     projectId: "portfolio-13181",
     storageBucket: "portfolio-13181.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456"
   };
   ```

6. **Update Your .env File**
   
   Open `dark-productivity-suite/.env` and replace the placeholder values:
   
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=portfolio-13181.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=portfolio-13181
   VITE_FIREBASE_STORAGE_BUCKET=portfolio-13181.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

7. **Restart the Dev Server**
   
   The dev server should automatically reload, but if not:
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again

## Security Notes

- ✅ The web API key is safe to expose in client-side code
- ✅ Firebase security rules protect your data, not the API key
- ❌ NEVER commit the Admin SDK key (`.json` file) to version control
- ❌ The Admin SDK key should only be used on secure servers

## Current Status

Your app is currently running in **offline mode** without Firebase authentication. Once you add the correct configuration:

- ✅ User authentication will work
- ✅ Cloud sync will be enabled
- ✅ Data will persist across devices

## Need Help?

If you can't find the web app configuration:
1. Make sure you're logged into the correct Google account
2. Verify you have access to the `portfolio-13181` project
3. Check if a web app has been created for this project
