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

## Option 3: GitHub Pages

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

### Firebase Integration (Optional)

If you want to enable cloud sync and authentication, you'll need to configure Firebase:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

2. Enable Authentication and Firestore in your Firebase project

3. Create a `.env` file in the project root:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Configure environment variables in your hosting platform:
   - **Vercel**: Project Settings → Environment Variables
   - **Netlify**: Site Settings → Environment Variables
   - **GitHub Pages**: Repository Settings → Secrets and Variables → Actions

**Note**: The app works fully offline with LocalStorage. Firebase is only needed for cloud sync across devices.

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

All three platforms support automatic deployments:
- **Vercel/Netlify**: Auto-deploy on git push
- **GitHub Pages**: Auto-deploy via GitHub Actions

## Support

For platform-specific issues:
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Netlify: [docs.netlify.com](https://docs.netlify.com)
- GitHub Pages: [docs.github.com/pages](https://docs.github.com/pages)
