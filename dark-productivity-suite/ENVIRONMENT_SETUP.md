# Environment Variables Setup Guide

This guide explains how to configure environment variables for the Dark Productivity Suite in different environments (development, staging, production).

## Overview

The application uses environment variables to configure:
- Firebase authentication and database
- OAuth providers (Google, GitHub)
- Production URLs
- Security features (reCAPTCHA)

## Quick Start

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase credentials (see [Firebase Setup](#firebase-setup))
3. Configure OAuth providers (see [OAuth Setup](#oauth-setup))
4. Set production URLs (see [Production URLs](#production-urls))

## Environment Variables Reference

### Firebase Configuration (Required)

These variables are required for Firebase authentication and Firestore database:

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | Firebase Console > Project Settings > General |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Firebase Console > Project Settings > General |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Firebase Console > Project Settings > General |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Firebase Console > Project Settings > General |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Firebase Console > Project Settings > General |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Firebase Console > Project Settings > General |

### OAuth Configuration (Optional)

OAuth providers enable social authentication:

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_GITHUB_OAUTH_CLIENT_ID` | GitHub OAuth client ID | GitHub Settings > Developer settings > OAuth Apps |

**Note**: Google OAuth is configured entirely through Firebase Console and doesn't require additional environment variables.

### Production URLs (Required for Production)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_APP_URL` | Your production domain | `https://darkprod.app` |
| `VITE_API_URL` | API endpoint URL | `https://darkprod.app/api` |

### Security Configuration (Optional, Recommended for Production)

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_RECAPTCHA_SITE_KEY` | reCAPTCHA v3 site key for App Check | Firebase Console > App Check |

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or select existing project
3. Enter project name (e.g., `dark-productivity-suite`)
4. Follow the setup wizard

### Step 2: Register Web App

1. In Firebase Console, click the web icon (`</>`)
2. Register app name: `Dark Productivity Suite`
3. Copy the Firebase configuration object
4. Extract values and add to `.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 3: Enable Authentication

1. Go to Authentication > Sign-in method
2. Enable Email/Password
3. Enable Google (optional)
4. Enable GitHub (optional)

For detailed Firebase setup, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

## OAuth Setup

### Google OAuth

Google OAuth is configured entirely through Firebase Console:

1. Go to Firebase Console > Authentication > Sign-in method
2. Click on Google provider
3. Enable and configure
4. Add authorized domains

**No additional environment variables needed** - Firebase handles Google OAuth configuration.

For detailed instructions, see [OAUTH_SETUP.md](./OAUTH_SETUP.md)

### GitHub OAuth

GitHub OAuth requires both GitHub app configuration and Firebase setup:

#### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" > "New OAuth App"
3. Fill in details:
   - **Application name**: Dark Productivity Suite
   - **Homepage URL**: Your production URL
   - **Authorization callback URL**: Get from Firebase Console
4. Click "Register application"
5. Copy the **Client ID**

#### Step 2: Configure Firebase

1. Go to Firebase Console > Authentication > Sign-in method
2. Click on GitHub provider
3. Enable and paste:
   - Client ID (from GitHub)
   - Client Secret (from GitHub)
4. Copy the authorization callback URL
5. Update GitHub OAuth app with this callback URL

#### Step 3: Add to Environment Variables

```env
VITE_GITHUB_OAUTH_CLIENT_ID=your_github_client_id_here
```

**Note**: The Client Secret should only be configured in Firebase Console, never in environment variables.

For detailed instructions, see [OAUTH_SETUP.md](./OAUTH_SETUP.md)

## Production URLs

Set these variables to match your production deployment:

```env
# Your production domain
VITE_APP_URL=https://darkprod.app

# API endpoint (usually same as app URL + /api)
VITE_API_URL=https://darkprod.app/api
```

### Platform-Specific Examples

#### Vercel
```env
VITE_APP_URL=https://your-project.vercel.app
VITE_API_URL=https://your-project.vercel.app/api
```

#### Netlify
```env
VITE_APP_URL=https://your-project.netlify.app
VITE_API_URL=https://your-project.netlify.app/api
```

#### Custom Domain
```env
VITE_APP_URL=https://darkprod.app
VITE_API_URL=https://darkprod.app/api
```

## Security Configuration

### reCAPTCHA (App Check)

App Check protects your Firebase resources from abuse. Recommended for production.

#### Step 1: Enable App Check

1. Go to Firebase Console > App Check
2. Click "Register app"
3. Select "reCAPTCHA v3"
4. Follow the setup wizard

#### Step 2: Get Site Key

1. After registration, copy the reCAPTCHA site key
2. Add to `.env`:

```env
VITE_RECAPTCHA_SITE_KEY=6Lc...
```

For detailed instructions, see [FIREBASE_PRODUCTION.md](./FIREBASE_PRODUCTION.md)

## Environment-Specific Configuration

### Development Environment

For local development:

```env
# Firebase - Use development project
VITE_FIREBASE_API_KEY=your_dev_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-dev-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-dev-project
VITE_FIREBASE_STORAGE_BUCKET=your-dev-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# OAuth - Use development OAuth apps
VITE_GITHUB_OAUTH_CLIENT_ID=your_dev_github_client_id

# URLs - Use localhost
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:5173/api

# Security - Optional for development
# VITE_RECAPTCHA_SITE_KEY=your_dev_recaptcha_key
```

### Staging Environment

For staging/preview deployments:

```env
# Firebase - Use staging project or same as production
VITE_FIREBASE_API_KEY=your_staging_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-staging-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-staging-project
VITE_FIREBASE_STORAGE_BUCKET=your-staging-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# OAuth - Use staging OAuth apps
VITE_GITHUB_OAUTH_CLIENT_ID=your_staging_github_client_id

# URLs - Use staging domain
VITE_APP_URL=https://staging.darkprod.app
VITE_API_URL=https://staging.darkprod.app/api

# Security - Recommended for staging
VITE_RECAPTCHA_SITE_KEY=your_staging_recaptcha_key
```

### Production Environment

For production deployment:

```env
# Firebase - Use production project
VITE_FIREBASE_API_KEY=your_prod_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-prod-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-prod-project
VITE_FIREBASE_STORAGE_BUCKET=your-prod-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# OAuth - Use production OAuth apps
VITE_GITHUB_OAUTH_CLIENT_ID=your_prod_github_client_id

# URLs - Use production domain
VITE_APP_URL=https://darkprod.app
VITE_API_URL=https://darkprod.app/api

# Security - Required for production
VITE_RECAPTCHA_SITE_KEY=your_prod_recaptcha_key
```

## Deployment Platform Configuration

### Vercel

#### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Add environment variables
vercel env add VITE_FIREBASE_API_KEY production
vercel env add VITE_FIREBASE_AUTH_DOMAIN production
vercel env add VITE_FIREBASE_PROJECT_ID production
vercel env add VITE_FIREBASE_STORAGE_BUCKET production
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
vercel env add VITE_FIREBASE_APP_ID production
vercel env add VITE_GITHUB_OAUTH_CLIENT_ID production
vercel env add VITE_APP_URL production
vercel env add VITE_API_URL production
vercel env add VITE_RECAPTCHA_SITE_KEY production
```

#### Via Vercel Dashboard

1. Go to Project Settings > Environment Variables
2. Add each variable with appropriate scope:
   - **Production**: For production deployments
   - **Preview**: For preview deployments
   - **Development**: For local development
3. Redeploy after adding variables

### Netlify

#### Via Netlify CLI

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Add environment variables
netlify env:set VITE_FIREBASE_API_KEY "your_value"
netlify env:set VITE_FIREBASE_AUTH_DOMAIN "your_value"
netlify env:set VITE_FIREBASE_PROJECT_ID "your_value"
netlify env:set VITE_FIREBASE_STORAGE_BUCKET "your_value"
netlify env:set VITE_FIREBASE_MESSAGING_SENDER_ID "your_value"
netlify env:set VITE_FIREBASE_APP_ID "your_value"
netlify env:set VITE_GITHUB_OAUTH_CLIENT_ID "your_value"
netlify env:set VITE_APP_URL "your_value"
netlify env:set VITE_API_URL "your_value"
netlify env:set VITE_RECAPTCHA_SITE_KEY "your_value"
```

#### Via Netlify Dashboard

1. Go to Site Settings > Environment Variables
2. Click "Add a variable"
3. Add each variable
4. Trigger new deploy

### GitHub Actions

Add secrets to your repository:

1. Go to Repository Settings > Secrets and Variables > Actions
2. Click "New repository secret"
3. Add each variable:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_GITHUB_OAUTH_CLIENT_ID`
   - `VITE_APP_URL`
   - `VITE_API_URL`
   - `VITE_RECAPTCHA_SITE_KEY`

Update your workflow file to use these secrets:

```yaml
- name: Build
  env:
    VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
    VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
    VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
    VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
    VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
    VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
    VITE_GITHUB_OAUTH_CLIENT_ID: ${{ secrets.VITE_GITHUB_OAUTH_CLIENT_ID }}
    VITE_APP_URL: ${{ secrets.VITE_APP_URL }}
    VITE_API_URL: ${{ secrets.VITE_API_URL }}
    VITE_RECAPTCHA_SITE_KEY: ${{ secrets.VITE_RECAPTCHA_SITE_KEY }}
  run: npm run build
```

## Validation

### Check Environment Variables

Create a script to validate environment variables:

```typescript
// scripts/validate-env.ts
const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const optionalVars = [
  'VITE_GITHUB_OAUTH_CLIENT_ID',
  'VITE_APP_URL',
  'VITE_API_URL',
  'VITE_RECAPTCHA_SITE_KEY',
];

console.log('Validating environment variables...\n');

let hasErrors = false;

requiredVars.forEach(varName => {
  const value = import.meta.env[varName];
  if (!value || value.includes('your_') || value.includes('here')) {
    console.error(`❌ ${varName} is not configured`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName} is configured`);
  }
});

optionalVars.forEach(varName => {
  const value = import.meta.env[varName];
  if (!value || value.includes('your_') || value.includes('here')) {
    console.warn(`⚠️  ${varName} is not configured (optional)`);
  } else {
    console.log(`✅ ${varName} is configured`);
  }
});

if (hasErrors) {
  console.error('\n❌ Some required environment variables are missing!');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are configured!');
}
```

Run validation:

```bash
npm run validate:env
```

### Test Firebase Connection

```typescript
// Test Firebase initialization
import { auth, db } from './services/firebaseService';

console.log('Firebase Auth:', auth ? '✅ Initialized' : '❌ Failed');
console.log('Firestore:', db ? '✅ Initialized' : '❌ Failed');
```

## Security Best Practices

### 1. Never Commit `.env` Files

Ensure `.env` is in `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.production
.env.development
```

### 2. Use Different Projects for Different Environments

- Development: `dark-prod-dev`
- Staging: `dark-prod-staging`
- Production: `dark-prod-prod`

### 3. Rotate Credentials Regularly

- Rotate Firebase API keys every 90 days
- Regenerate OAuth client secrets periodically
- Update reCAPTCHA keys if compromised

### 4. Limit API Key Restrictions

In Google Cloud Console:
1. Go to APIs & Services > Credentials
2. Click on your API key
3. Add application restrictions:
   - HTTP referrers (websites)
   - Add your production domains
4. Add API restrictions:
   - Only enable required APIs

### 5. Monitor Usage

- Set up Firebase budget alerts
- Monitor authentication logs
- Track API usage in Firebase Console
- Set up error tracking (Sentry)

## Troubleshooting

### "Firebase not initialized"

**Cause**: Environment variables not loaded

**Solution**:
1. Verify `.env` file exists
2. Check variable names match exactly (case-sensitive)
3. Restart dev server after adding `.env`
4. Verify Vite is loading environment variables

### "Invalid API key"

**Cause**: Incorrect or expired API key

**Solution**:
1. Verify API key in Firebase Console
2. Check for extra spaces or quotes
3. Regenerate API key if needed
4. Update `.env` with new key

### "OAuth redirect URI mismatch"

**Cause**: Redirect URI not configured in OAuth provider

**Solution**:
1. Get callback URL from Firebase Console
2. Add to OAuth provider settings:
   - Google: Google Cloud Console > Credentials
   - GitHub: OAuth App settings
3. Ensure exact match (including protocol and path)

### "Permission denied" in Firestore

**Cause**: Security rules not configured or user not authenticated

**Solution**:
1. Deploy Firestore security rules
2. Verify user is authenticated
3. Check rules match your data structure

### Environment variables not updating

**Cause**: Vite caches environment variables

**Solution**:
1. Stop dev server
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Restart dev server: `npm run dev`

## Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [OAuth Setup Guide](./OAUTH_SETUP.md)
- [Production Configuration](./FIREBASE_PRODUCTION.md)
- [Deployment Guide](./DEPLOYMENT.md)

## Support

For issues with environment configuration:
1. Check this guide first
2. Review platform-specific documentation
3. Check Firebase Console for errors
4. Verify OAuth provider configuration
5. Open an issue on GitHub with details
