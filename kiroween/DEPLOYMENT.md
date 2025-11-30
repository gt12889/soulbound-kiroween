# Deployment Guide

This guide covers deploying the Dark Productivity Suite to various hosting platforms.

## Prerequisites

- Node.js 20+ installed
- Project built successfully (`npm run build`)
- Git repository initialized

## Option 1: Vercel (Recommended)

### Quick Deploy

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd dark-productivity-suite
   vercel
   ```

3. Follow the prompts to link your project

### Configuration

The `vercel.json` file is already configured with:
- Build command: `npm run build`
- Output directory: `dist`
- Caching headers for assets
- Security headers
- SPA routing support

### Manual Setup

1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Vercel will auto-detect the configuration
4. Click "Deploy"

## Option 2: Netlify

### Quick Deploy

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   cd dark-productivity-suite
   netlify deploy --prod
   ```

### Configuration

The `netlify.toml` file is already configured with:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirects
- Caching headers for assets
- Security headers

### Manual Setup

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Netlify will auto-detect the configuration
5. Click "Deploy site"

## Option 3: Firebase Hosting

### Prerequisites

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

### Initial Setup

1. Initialize Firebase in your project (if not already done):
   ```bash
   cd dark-productivity-suite
   firebase init
   ```

2. Select the following features:
   - Firestore (if using cloud sync)
   - Hosting
   - Storage (if using cloud sync)

3. Use existing configuration files:
   - Firestore rules: `firestore.rules`
   - Firestore indexes: `firestore.indexes.json`
   - Storage rules: `storage.rules`
   - Hosting config: Already configured in `firebase.json`

### Deploy

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

   Or deploy specific services:
   ```bash
   # Deploy hosting only
   firebase deploy --only hosting

   # Deploy Firestore rules and indexes
   firebase deploy --only firestore

   # Deploy storage rules
   firebase deploy --only storage
   ```

### Configuration

The `firebase.json` file is already configured with:
- **Hosting**:
  - Public directory: `dist` (Vite build output)
  - SPA routing (all routes redirect to `/index.html`)
  - Optimized caching headers:
    - Static assets (JS, CSS, fonts, images): 1 year cache
    - HTML files: No cache (always fresh)
- **Firestore**: Rules and indexes configured
- **Storage**: Security rules configured

### Custom Domain

1. In Firebase Console, go to Hosting
2. Click "Add custom domain"
3. Follow the DNS configuration instructions
4. Firebase will automatically provision SSL certificate

## Option 4: GitHub Pages

### Setup

1. Enable GitHub Pages in your repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions

2. Push to main branch:
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

3. The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:
   - Build the project
   - Deploy to GitHub Pages

### Configuration

If deploying to a subdirectory (e.g., `username.github.io/repo-name`), update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/repo-name/',
  // ... rest of config
})
```

## Testing Production Build Locally

Before deploying, test the production build:

```bash
npm run build
npm run preview
```

Visit `http://localhost:4173` to verify everything works.

## Post-Deployment Checklist

- [ ] Verify site loads correctly
- [ ] Test all navigation routes
- [ ] Verify LocalStorage persistence works
- [ ] Test note creation and editing
- [ ] Test task management
- [ ] Verify moon phase calendar displays
- [ ] Test data export functionality
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Verify all assets load (CSS, fonts, etc.)

## Troubleshooting

### 404 on Page Refresh

If you get 404 errors when refreshing on routes other than home:
- **Vercel/Netlify**: Already configured with SPA redirects
- **GitHub Pages**: Ensure base path is set correctly in `vite.config.ts`

### Assets Not Loading

Check that `base: './'` is set in `vite.config.ts` for relative paths.

### Build Fails

1. Ensure all dependencies are installed: `npm ci`
2. Check TypeScript errors: `npm run build`
3. Verify Node.js version: `node --version` (should be 20+)

## Environment Variables

### Basic Deployment (LocalStorage Only)

This project doesn't require environment variables for basic functionality. All data is stored locally in the browser.

### Firebase Integration (Required for Production)

For production deployment with authentication and cloud sync, you must configure Firebase backend services and environment variables.

**See detailed guides**:
- **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Complete environment variables configuration guide
- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Initial Firebase project setup
- **[OAUTH_SETUP.md](./OAUTH_SETUP.md)** - Google and GitHub OAuth configuration
- **[FIREBASE_PRODUCTION.md](./FIREBASE_PRODUCTION.md)** - Production configuration guide
- **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** - Complete deployment checklist

#### Quick Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

2. Enable Authentication (Email/Password, Google, GitHub) and Firestore

3. Deploy security rules and indexes:
   ```bash
   firebase login
   firebase init
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```

4. Create a `.env` file in the project root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

5. Fill in your Firebase credentials and OAuth configuration:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # OAuth Configuration (optional)
   VITE_GITHUB_OAUTH_CLIENT_ID=your_github_client_id

   # Production URLs
   VITE_APP_URL=https://your-domain.com
   VITE_API_URL=https://your-domain.com/api

   # Security (optional, recommended for production)
   VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   ```

6. Configure environment variables in your hosting platform:
   - **Vercel**: Project Settings → Environment Variables
   - **Netlify**: Site Settings → Environment Variables
   - **GitHub Pages**: Repository Settings → Secrets and Variables → Actions

For detailed instructions on configuring each environment variable, see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)

#### Production Configuration Files

The following files are included for Firebase production setup:

- **`firebase.json`** - Firebase project configuration
- **`firestore.rules`** - Firestore security rules (user data protection)
- **`firestore.indexes.json`** - Optimized database indexes
- **`storage.rules`** - Cloud Storage security rules

These files ensure:
- Users can only access their own data
- Data validation on all writes
- Optimized query performance
- Secure file uploads

**Note**: The app works fully offline with LocalStorage. Firebase is only needed for authentication and cloud sync across devices.

## Custom Domain

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Netlify
1. Go to Site Settings → Domain management
2. Add custom domain
3. Follow DNS configuration instructions

### GitHub Pages
1. Add a `CNAME` file to the `public` folder with your domain
2. Configure DNS with your domain provider
3. Enable HTTPS in repository settings

## Performance Optimization

The build is already optimized with:
- Code splitting (React, Git vendors separated)
- Minification (esbuild)
- Asset optimization
- Long-term caching headers

## Security Headers

All platforms are configured with:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Monitoring

Consider adding:
- Analytics (Google Analytics, Plausible, etc.)
- Error tracking (Sentry, LogRocket, etc.)
- Performance monitoring (Web Vitals)

## Continuous Deployment

All platforms support automatic deployments:
- **Vercel/Netlify**: Auto-deploy on git push
- **Firebase Hosting**: Use GitHub Actions or Firebase CLI
- **GitHub Pages**: Auto-deploy via GitHub Actions

### Firebase CI/CD with GitHub Actions

Create `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

## Support

For platform-specific issues:
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Netlify: [docs.netlify.com](https://docs.netlify.com)
- Firebase: [firebase.google.com/docs/hosting](https://firebase.google.com/docs/hosting)
- GitHub Pages: [docs.github.com/pages](https://docs.github.com/pages)
