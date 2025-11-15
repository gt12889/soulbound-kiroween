# Production Deployment Checklist

Use this checklist to ensure all backend services are properly configured before deploying to production.

## Firebase Project Setup

### Project Creation
- [ ] Created Firebase production project
- [ ] Enabled Google Analytics
- [ ] Upgraded to Blaze (pay-as-you-go) plan
- [ ] Configured budget alerts ($10/month recommended)
- [ ] Noted Project ID: `_________________`

### Firebase CLI Setup
- [ ] Installed Firebase CLI: `npm install -g firebase-tools`
- [ ] Logged in: `firebase login`
- [ ] Initialized project: `firebase init`
- [ ] Selected Firestore, Hosting, and Storage

## Authentication Configuration

### Email/Password Authentication
- [ ] Enabled Email/Password provider
- [ ] Configured password policy (8+ chars, uppercase, lowercase, number)
- [ ] Customized email templates (password reset, verification)
- [ ] Tested registration flow
- [ ] Tested login flow
- [ ] Tested password reset flow
- [ ] Tested email verification

### Google OAuth
- [ ] Enabled Google provider in Firebase Console
- [ ] Configured OAuth consent screen
- [ ] Added authorized domains:
  - [ ] Production domain: `_________________`
  - [ ] Deployment platform domain: `_________________`
- [ ] Tested Google sign-in flow
- [ ] Verified user profile data

### GitHub OAuth
- [ ] Created GitHub OAuth App
- [ ] Copied Client ID and Secret to Firebase
- [ ] Enabled GitHub provider
- [ ] Added authorization callback URL
- [ ] Tested GitHub sign-in flow
- [ ] Verified user profile data

### Authentication Settings
- [ ] Added all authorized domains
- [ ] Enabled email verification (recommended)
- [ ] Configured session duration (30 days)
- [ ] Tested session persistence
- [ ] Tested logout functionality

## Firestore Database Configuration

### Database Setup
- [ ] Created Firestore database in production mode
- [ ] Selected location: `_________________`
- [ ] Enabled delete protection

### Security Rules
- [ ] Deployed security rules: `firebase deploy --only firestore:rules`
- [ ] Verified rules in Firebase Console
- [ ] Tested read permissions (authenticated users only)
- [ ] Tested write permissions (owner only)
- [ ] Tested data validation rules
- [ ] Tested unauthorized access (should be denied)

### Indexes
- [ ] Deployed Firestore indexes: `firebase deploy --only firestore:indexes`
- [ ] Verified indexes in Firebase Console
- [ ] Tested queries with indexes:
  - [ ] Notes by user and update time
  - [ ] Notes by user and tags
  - [ ] Tasks by user and completion status
  - [ ] Tasks by user and archive status
  - [ ] Tasks by user and tags
  - [ ] Pomodoro sessions by user and time
  - [ ] Tarot readings by user and date

### Performance Optimization
- [ ] Enabled offline persistence in code
- [ ] Configured cache settings
- [ ] Tested offline functionality
- [ ] Tested sync on reconnection

## Cloud Storage Configuration

### Storage Setup
- [ ] Enabled Cloud Storage
- [ ] Selected same location as Firestore
- [ ] Deployed storage rules: `firebase deploy --only storage`
- [ ] Configured CORS for production domain

### Storage Rules
- [ ] Tested profile image upload (authenticated users)
- [ ] Tested file size limits (10MB max)
- [ ] Tested file type validation (images only for profiles)
- [ ] Tested unauthorized access (should be denied)
- [ ] Tested export file storage

## Environment Variables

**See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed configuration instructions**

### Development Environment
- [ ] Copied `.env.example` to `.env`
- [ ] Added all Firebase config variables
- [ ] Added OAuth client IDs (if using)
- [ ] Added development URLs
- [ ] Verified `.env` is in `.gitignore`
- [ ] Tested local development with Firebase

### Production Environment

#### Required Variables
- [ ] `VITE_FIREBASE_API_KEY` - Firebase API key
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- [ ] `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- [ ] `VITE_FIREBASE_APP_ID` - Firebase app ID

#### Optional Variables
- [ ] `VITE_GITHUB_OAUTH_CLIENT_ID` - GitHub OAuth client ID (if using GitHub auth)
- [ ] `VITE_APP_URL` - Production domain URL
- [ ] `VITE_API_URL` - API endpoint URL
- [ ] `VITE_RECAPTCHA_SITE_KEY` - reCAPTCHA site key (recommended for production)

#### Vercel
- [ ] Added all required Firebase variables to Vercel
- [ ] Added optional variables (OAuth, URLs, reCAPTCHA)
- [ ] Set environment scope to "Production"
- [ ] Verified variables in Vercel dashboard
- [ ] Triggered new deployment

#### Netlify
- [ ] Added all required Firebase variables to Netlify
- [ ] Added optional variables (OAuth, URLs, reCAPTCHA)
- [ ] Verified variables in Netlify dashboard
- [ ] Triggered new deployment

#### GitHub Actions
- [ ] Added all Firebase variables as repository secrets
- [ ] Added optional variables as secrets
- [ ] Updated workflow to use secrets
- [ ] Tested deployment workflow

## Security Configuration

### App Check (Recommended)
- [ ] Enabled App Check in Firebase Console
- [ ] Registered web app
- [ ] Configured reCAPTCHA v3
- [ ] Added reCAPTCHA site key to code
- [ ] Tested App Check verification

### Security Headers
- [ ] Configured Content-Security-Policy
- [ ] Configured X-Content-Type-Options
- [ ] Configured X-Frame-Options
- [ ] Configured X-XSS-Protection
- [ ] Configured Referrer-Policy
- [ ] Configured Permissions-Policy
- [ ] Tested headers in production

### Rate Limiting
- [ ] Verified Firebase automatic rate limiting
- [ ] Configured additional rate limits (if needed)
- [ ] Tested rate limiting with multiple requests

## Monitoring and Analytics

### Firebase Analytics
- [ ] Enabled Google Analytics
- [ ] Configured custom events:
  - [ ] User sign-ups
  - [ ] Note creations
  - [ ] Task completions
  - [ ] Tarot readings
  - [ ] Pomodoro sessions
- [ ] Tested event tracking

### Performance Monitoring
- [ ] Installed Firebase Performance SDK
- [ ] Configured performance monitoring
- [ ] Tested performance traces
- [ ] Set up performance alerts

### Error Tracking
- [ ] Configured error logging
- [ ] Set up error alerts
- [ ] Tested error reporting
- [ ] Configured Sentry (optional)

### Budget Alerts
- [ ] Set monthly budget: $`_________________`
- [ ] Configured alert thresholds (50%, 75%, 90%, 100%)
- [ ] Added notification email: `_________________`
- [ ] Tested alert notifications

## Backup and Recovery

### Automated Backups
- [ ] Enabled Firestore automated backups
- [ ] Configured backup schedule (daily recommended)
- [ ] Set retention period (7 days minimum)
- [ ] Tested backup restoration

### Manual Exports
- [ ] Created export Cloud Function (optional)
- [ ] Configured export schedule
- [ ] Tested manual export
- [ ] Verified export data integrity

## Testing

### Authentication Testing
- [ ] Tested email/password registration
- [ ] Tested email/password login
- [ ] Tested password reset
- [ ] Tested Google OAuth
- [ ] Tested GitHub OAuth
- [ ] Tested session persistence
- [ ] Tested logout
- [ ] Tested expired session handling

### Data Operations Testing
- [ ] Created test notes
- [ ] Created test tasks
- [ ] Verified data in Firestore Console
- [ ] Tested real-time sync
- [ ] Tested offline mode
- [ ] Tested conflict resolution
- [ ] Tested data export
- [ ] Tested data import

### Cross-Device Testing
- [ ] Tested sync between desktop and mobile
- [ ] Tested sync between different browsers
- [ ] Tested simultaneous edits
- [ ] Tested offline-to-online sync

### Performance Testing
- [ ] Tested with 100+ notes
- [ ] Tested with 100+ tasks
- [ ] Measured page load times (< 2 seconds)
- [ ] Measured query response times (< 500ms)
- [ ] Tested animation frame rates (60fps)

### Security Testing
- [ ] Tested unauthorized access attempts
- [ ] Tested invalid data submissions
- [ ] Tested XSS prevention
- [ ] Tested CSRF protection
- [ ] Tested SQL injection (N/A for Firestore)

## Deployment

### Pre-deployment
- [ ] Ran all tests: `npm test`
- [ ] Fixed all linting errors: `npm run lint`
- [ ] Built production bundle: `npm run build`
- [ ] Tested production build locally: `npm run preview`
- [ ] Verified bundle size (< 500KB recommended)

### Deployment
- [ ] Deployed to production platform
- [ ] Verified deployment URL: `_________________`
- [ ] Tested production site
- [ ] Verified all features work
- [ ] Checked browser console for errors

### Post-deployment
- [ ] Verified Firebase connection
- [ ] Tested authentication flows
- [ ] Created test data
- [ ] Verified sync across devices
- [ ] Checked Firebase Console for activity
- [ ] Monitored error logs
- [ ] Checked performance metrics

## Documentation

### User Documentation
- [ ] Updated README with production URL
- [ ] Created user guide
- [ ] Documented features
- [ ] Added screenshots/demo video
- [ ] Published documentation

### Developer Documentation
- [ ] Documented Firebase setup
- [ ] Documented environment variables
- [ ] Documented deployment process
- [ ] Documented troubleshooting steps
- [ ] Documented API endpoints (if any)

### Release Notes
- [ ] Created release notes
- [ ] Listed new features
- [ ] Listed bug fixes
- [ ] Listed known issues
- [ ] Published release notes

## Launch

### Soft Launch
- [ ] Announced to beta testers
- [ ] Collected initial feedback
- [ ] Fixed critical issues
- [ ] Monitored usage metrics

### Public Launch
- [ ] Announced on social media
- [ ] Posted on Product Hunt (optional)
- [ ] Posted on Hacker News (optional)
- [ ] Shared with communities
- [ ] Monitored user feedback

### Post-Launch Monitoring
- [ ] Monitored error logs daily
- [ ] Checked Firebase usage metrics daily
- [ ] Reviewed security alerts daily
- [ ] Responded to user feedback
- [ ] Fixed reported bugs

## Maintenance Schedule

### Daily Tasks
- [ ] Monitor error logs
- [ ] Check Firebase usage metrics
- [ ] Review security alerts
- [ ] Respond to user issues

### Weekly Tasks
- [ ] Review performance metrics
- [ ] Check budget usage
- [ ] Update dependencies
- [ ] Review user feedback

### Monthly Tasks
- [ ] Review security rules
- [ ] Optimize Firestore queries
- [ ] Clean up old data
- [ ] Review and optimize costs
- [ ] Update documentation

## Emergency Contacts

- Firebase Support: https://firebase.google.com/support
- Deployment Platform Support: `_________________`
- Team Lead: `_________________`
- DevOps Contact: `_________________`

## Notes

Add any project-specific notes or considerations here:

```
_________________________________________________________________________________

_________________________________________________________________________________

_________________________________________________________________________________
```

## Sign-off

- [ ] All checklist items completed
- [ ] Production environment tested and verified
- [ ] Team notified of deployment
- [ ] Documentation updated
- [ ] Monitoring configured

**Deployed by**: `_________________`  
**Date**: `_________________`  
**Production URL**: `_________________`  
**Firebase Project ID**: `_________________`

