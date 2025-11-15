# Firebase Production Configuration Guide

This guide covers setting up Firebase for production deployment of the Dark Productivity Suite.

## Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase account with billing enabled (Blaze plan for production)
- Completed initial Firebase setup (see FIREBASE_SETUP.md)

## Step 1: Firebase Project Setup

### Create Production Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project: `dark-productivity-suite-prod`
3. Enable Google Analytics (recommended for production)
4. Note your Project ID

### Upgrade to Blaze Plan

1. In Firebase Console, go to **Spark → Blaze** upgrade
2. Set up billing account
3. Configure budget alerts (recommended: $10/month)

## Step 2: Authentication Configuration

### Enable Authentication Providers

1. Go to **Authentication** → **Sign-in method**
2. Enable the following providers:

#### Email/Password
- Enable Email/Password authentication
- Enable Email link (passwordless sign-in) - optional
- Configure email templates:
  - Password reset template
  - Email verification template
  - Customize with your branding

#### Google OAuth
1. Enable Google provider
2. Configure OAuth consent screen:
   - App name: "Dark Productivity Suite"
   - User support email: your-email@domain.com
   - Developer contact: your-email@domain.com
3. Add authorized domains:
   - `localhost` (for development)
   - `your-domain.com` (your production domain)
   - `your-domain.netlify.app` or `your-domain.vercel.app`

#### GitHub OAuth
1. Create GitHub OAuth App:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"
   - Application name: "Dark Productivity Suite"
   - Homepage URL: `https://your-domain.com`
   - Authorization callback URL: Copy from Firebase Console
2. Copy Client ID and Client Secret
3. Paste into Firebase Console
4. Enable GitHub provider

### Configure Authentication Settings

1. Go to **Authentication** → **Settings**
2. Configure authorized domains:
   - Add your production domain
   - Add deployment platform domains (Vercel/Netlify)
3. Set up email verification (recommended)
4. Configure password policy:
   - Minimum length: 8 characters
   - Require uppercase: Yes
   - Require lowercase: Yes
   - Require numbers: Yes
   - Require special characters: Optional

## Step 3: Firestore Database Configuration

### Create Production Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Select **Production mode**
4. Choose location (closest to your users):
   - `us-central1` (Iowa) - Default
   - `europe-west1` (Belgium)
   - `asia-northeast1` (Tokyo)
5. Click "Enable"

### Deploy Security Rules

```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project
cd dark-productivity-suite
firebase init

# Select:
# - Firestore: Configure security rules and indexes
# - Hosting: Configure files for Firebase Hosting (optional)
# - Storage: Configure security rules for Cloud Storage

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Verify Security Rules

Test your security rules:

```bash
# Install Firebase emulator
firebase emulators:start --only firestore

# Run security rules tests (create tests in firestore.test.js)
npm run test:firestore
```

### Configure Firestore Settings

1. In Firestore Console, go to **Settings**
2. Enable **Delete protection** (prevents accidental deletion)
3. Configure **App Check** (recommended for production):
   - Go to **App Check** in Firebase Console
   - Register your web app
   - Enable reCAPTCHA v3
   - Add your domain

## Step 4: Cloud Storage Configuration

### Enable Cloud Storage

1. Go to **Storage** in Firebase Console
2. Click "Get started"
3. Start in **Production mode**
4. Choose same location as Firestore
5. Click "Done"

### Deploy Storage Rules

```bash
# Deploy storage security rules
firebase deploy --only storage
```

### Configure CORS

Create `cors.json`:

```json
[
  {
    "origin": ["https://your-domain.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

Apply CORS configuration:

```bash
# Install gsutil (Google Cloud SDK)
# Then apply CORS
gsutil cors set cors.json gs://your-project-id.appspot.com
```

## Step 5: Environment Variables

### Production Environment Variables

Create production environment variables for your deployment platform:

#### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Set environment variables
vercel env add VITE_FIREBASE_API_KEY production
vercel env add VITE_FIREBASE_AUTH_DOMAIN production
vercel env add VITE_FIREBASE_PROJECT_ID production
vercel env add VITE_FIREBASE_STORAGE_BUCKET production
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
vercel env add VITE_FIREBASE_APP_ID production
```

Or via Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable with "Production" scope
3. Redeploy

#### Netlify

Via Netlify CLI:

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Set environment variables
netlify env:set VITE_FIREBASE_API_KEY "your-value"
netlify env:set VITE_FIREBASE_AUTH_DOMAIN "your-value"
netlify env:set VITE_FIREBASE_PROJECT_ID "your-value"
netlify env:set VITE_FIREBASE_STORAGE_BUCKET "your-value"
netlify env:set VITE_FIREBASE_MESSAGING_SENDER_ID "your-value"
netlify env:set VITE_FIREBASE_APP_ID "your-value"
```

Or via Netlify Dashboard:
1. Go to Site Settings → Environment Variables
2. Add each variable
3. Trigger new deploy

#### GitHub Actions

Add secrets to your repository:

1. Go to Repository Settings → Secrets and Variables → Actions
2. Add each variable as a repository secret:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

## Step 6: Performance Optimization

### Enable Firestore Caching

Update `firebaseService.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support persistence.');
  }
});

export { auth, db };
```

### Configure Firestore Indexes

The `firestore.indexes.json` file includes optimized indexes for:
- Notes by user and update time
- Notes by user, tags, and update time
- Tasks by user, completion status, and creation time
- Tasks by user, archive status, and completion time
- Tasks by user, tags, and creation time
- Pomodoro sessions by user and start time
- Tarot readings by user and date

Deploy indexes:

```bash
firebase deploy --only firestore:indexes
```

### Enable Compression

Ensure your hosting platform enables compression:

**Vercel**: Automatic compression enabled

**Netlify**: Add to `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Encoding = "gzip"
```

## Step 7: Monitoring and Analytics

### Enable Firebase Analytics

1. Go to **Analytics** in Firebase Console
2. Enable Google Analytics
3. Configure events:
   - User sign-ups
   - Note creations
   - Task completions
   - Tarot readings
   - Pomodoro sessions

### Set Up Performance Monitoring

```bash
npm install firebase/performance
```

Add to `firebaseService.ts`:

```typescript
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);
export { perf };
```

### Configure Error Tracking

Install Sentry (optional):

```bash
npm install @sentry/react
```

Configure in `main.tsx`:

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production',
  tracesSampleRate: 0.1,
});
```

### Set Up Budget Alerts

1. Go to Firebase Console → Usage and billing
2. Click "Set budget alert"
3. Set monthly budget (e.g., $10)
4. Configure alert thresholds: 50%, 75%, 90%, 100%
5. Add notification email

## Step 8: Security Hardening

### Enable App Check

1. Go to **App Check** in Firebase Console
2. Click "Register app"
3. Select reCAPTCHA v3
4. Add your domain
5. Copy site key

Add to your app:

```bash
npm install firebase/app-check
```

Update `firebaseService.ts`:

```typescript
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('your-recaptcha-site-key'),
  isTokenAutoRefreshEnabled: true,
});
```

### Configure Security Headers

Add to your hosting configuration:

**Vercel** (`vercel.json`):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

**Netlify** (`netlify.toml`):

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```

### Implement Rate Limiting

Firebase automatically rate limits authentication attempts. For additional protection:

1. Enable **Identity Platform** (Firebase Auth upgrade)
2. Configure rate limiting rules
3. Set up CAPTCHA for suspicious activity

## Step 9: Backup and Disaster Recovery

### Enable Firestore Backups

```bash
# Install gcloud CLI
# Then enable automated backups

gcloud firestore backups schedules create \
  --database='(default)' \
  --recurrence=daily \
  --retention=7d
```

### Export Data Regularly

Create a Cloud Function for automated exports:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.scheduledFirestoreExport = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const bucket = 'gs://your-backup-bucket';
    const projectId = process.env.GCP_PROJECT;
    
    await admin.firestore().exportDocuments({
      collectionIds: ['users'],
      outputUriPrefix: bucket,
    });
    
    console.log('Firestore export completed');
  });
```

## Step 10: Testing Production Configuration

### Pre-deployment Checklist

- [ ] Security rules deployed and tested
- [ ] Indexes deployed
- [ ] Authentication providers configured
- [ ] OAuth apps configured (Google, GitHub)
- [ ] Environment variables set
- [ ] App Check enabled
- [ ] Performance monitoring enabled
- [ ] Budget alerts configured
- [ ] Backup strategy implemented
- [ ] CORS configured for storage
- [ ] Security headers configured

### Test Authentication Flow

1. Test email/password registration
2. Test email verification
3. Test password reset
4. Test Google OAuth
5. Test GitHub OAuth
6. Test session persistence
7. Test logout

### Test Data Operations

1. Create notes and tasks
2. Verify data appears in Firestore Console
3. Test real-time sync across devices
4. Test offline functionality
5. Test conflict resolution
6. Test data export
7. Test data import

### Load Testing

Use Firebase Test Lab or custom load testing:

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test config (artillery.yml)
# Run load test
artillery run artillery.yml
```

## Step 11: Go Live

### Final Deployment

```bash
# Build production bundle
npm run build

# Deploy to your platform
vercel --prod
# or
netlify deploy --prod
# or
firebase deploy --only hosting
```

### Post-deployment Verification

1. Visit production URL
2. Test all authentication flows
3. Create test data
4. Verify sync across devices
5. Check Firebase Console for activity
6. Monitor error logs
7. Check performance metrics

### Announce Launch

1. Update README with production URL
2. Create release notes
3. Announce on social media
4. Monitor user feedback
5. Watch Firebase usage metrics

## Maintenance

### Regular Tasks

**Daily**:
- Monitor error logs
- Check Firebase usage metrics
- Review security alerts

**Weekly**:
- Review performance metrics
- Check budget usage
- Update dependencies

**Monthly**:
- Review security rules
- Optimize Firestore queries
- Clean up old data
- Review and optimize costs

### Scaling Considerations

**If you exceed free tier limits**:
1. Review query patterns for optimization
2. Implement caching strategies
3. Consider data archival
4. Upgrade to higher tier if needed

**Performance optimization**:
1. Use Firestore query cursors for pagination
2. Implement lazy loading
3. Optimize bundle size
4. Use CDN for static assets

## Troubleshooting

### Common Issues

**"Permission denied" errors**:
- Verify security rules are deployed
- Check user authentication status
- Verify userId matches in rules

**"Quota exceeded" errors**:
- Check Firebase Console usage
- Optimize queries to reduce reads
- Implement caching
- Consider upgrading plan

**OAuth not working**:
- Verify authorized domains in Firebase Console
- Check OAuth app configuration
- Verify redirect URIs match

**Slow performance**:
- Check Firestore indexes are deployed
- Enable offline persistence
- Optimize bundle size
- Use CDN for assets

## Cost Optimization

### Reduce Firestore Costs

1. **Minimize reads**:
   - Implement client-side caching
   - Use real-time listeners efficiently
   - Batch read operations

2. **Optimize writes**:
   - Batch write operations
   - Avoid unnecessary updates
   - Use transactions wisely

3. **Reduce storage**:
   - Archive old data
   - Compress large text fields
   - Delete unused documents

### Monitor Costs

1. Set up budget alerts
2. Review Firebase usage dashboard weekly
3. Use Firebase Analytics to track feature usage
4. Optimize high-cost operations

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Performance](https://firebase.google.com/docs/perf-mon)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
- [Firebase Pricing](https://firebase.google.com/pricing)

## Support

For issues or questions:
- Firebase Support: https://firebase.google.com/support
- Stack Overflow: Tag `firebase` or `google-cloud-firestore`
- Firebase Community: https://firebase.google.com/community

