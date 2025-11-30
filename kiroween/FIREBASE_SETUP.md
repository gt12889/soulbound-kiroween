# Firebase Setup Guide

This guide covers setting up Firebase for authentication and cloud sync in the Dark Productivity Suite.

## Overview

Firebase integration is **optional**. The app works fully offline with Loc
alStorage. Firebase adds:
- User authentication (email/password, Google, GitHub)
- Cloud sync across devices
- Real-time data synchronization
- Backup and restore capabilities

## Prerequisites

- Firebase account (free tier is sufficient)
- Node.js 20+ installed
- Firebase dependency installed (`npm install firebase`)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `dark-productivity-suite`
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Register Web App

1. In your Firebase project, click the web icon (`</>`)
2. Register app name: `Dark Productivity Suite`
3. Don't enable Firebase Hosting (we use Vercel/Netlify)
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 3: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable sign-in methods:
   - **Email/Password**: Enable
   - **Google**: Enable (optional)
   - **GitHub**: Enable (optional)

## Step 4: Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Start in **test mode** (for development)
4. Choose a location (closest to your users)
5. Click "Enable"

### Security Rules (Production)

Replace test mode rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 5: Firebase Configuration Files

The project includes pre-configured Firebase files:

- **`firebase.json`** - Main Firebase configuration
  - Hosting setup (serves from `dist/` folder)
  - SPA routing configuration
  - Optimized caching headers
  - Firestore and Storage rules references

- **`firestore.rules`** - Database security rules
- **`firestore.indexes.json`** - Database indexes for query optimization
- **`storage.rules`** - Cloud Storage security rules

These files are ready to use. When you run `firebase init`, select "use existing file" for these configurations.

## Step 6: Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Important**: Add `.env` to `.gitignore` to keep credentials secure.

## Step 7: Create Firebase Service

Create `src/services/firebaseService.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## Step 8: Deploy Firebase Configuration

Deploy your Firestore rules, indexes, and storage rules:

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Deploy rules and indexes
firebase deploy --only firestore:rules,firestore:indexes,storage
```

The `firebase.json` configuration will automatically:
- Reference the correct rules files
- Set up hosting configuration
- Configure caching headers for optimal performance

## Step 9: Deploy to Hosting (Optional)

If you want to host on Firebase Hosting:

```bash
# Build the project
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Your app will be available at `https://your-project-id.web.app`

## Step 10: Configure Environment Variables for Deployment

### Vercel

1. Go to Project Settings → Environment Variables
2. Add each `VITE_FIREBASE_*` variable
3. Redeploy

### Netlify

1. Go to Site Settings → Environment Variables
2. Add each `VITE_FIREBASE_*` variable
3. Trigger new deploy

### GitHub Pages

1. Go to Repository Settings → Secrets and Variables → Actions
2. Add each variable as a secret
3. Update `.github/workflows/deploy.yml` to pass env vars

## Testing

1. Start dev server: `npm run dev`
2. Check browser console for Firebase initialization
3. Test authentication flow
4. Verify Firestore read/write operations

## Data Structure

### Firestore Collections

```
users/
  {userId}/
    notes/
      {noteId}/
        - id: string
        - title: string
        - content: string
        - tags: string[]
        - createdAt: timestamp
        - updatedAt: timestamp
    tasks/
      {taskId}/
        - id: string
        - title: string
        - description: string
        - completed: boolean
        - priority: string
        - createdAt: timestamp
        - completedAt: timestamp | null
```

## Migration from LocalStorage

To migrate existing LocalStorage data to Firebase:

1. User signs in
2. Check if Firestore is empty for user
3. If empty, import from LocalStorage
4. Sync LocalStorage → Firestore
5. Enable real-time sync

## Troubleshooting

### "Firebase not initialized"
- Check `.env` file exists and has correct values
- Restart dev server after adding `.env`

### "Permission denied" errors
- Update Firestore security rules
- Ensure user is authenticated

### "Quota exceeded"
- Firebase free tier limits:
  - 50K reads/day
  - 20K writes/day
  - 1GB storage
- Optimize queries or upgrade plan

## Cost Estimation

**Free Tier (Spark Plan)**:
- Authentication: Unlimited
- Firestore: 50K reads, 20K writes, 1GB storage per day
- Sufficient for personal use and small teams

**Paid Tier (Blaze Plan)**:
- Pay-as-you-go pricing
- Estimated $0-5/month for typical usage

## Security Best Practices

1. Never commit `.env` to git
2. Use Firestore security rules
3. Enable App Check (optional, for production)
4. Rotate API keys if exposed
5. Monitor usage in Firebase Console

## Next Steps

After Firebase is configured:
1. Implement authentication UI
2. Add cloud sync toggle in settings
3. Create sync service for notes and tasks
4. Add conflict resolution for offline edits
5. Implement real-time listeners

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
