# OAuth Provider Setup Guide

This guide covers setting up Google and GitHub OAuth authentication for the Dark Productivity Suite.

## Prerequisites

- Firebase project created and configured
- Firebase Authentication enabled
- Production domain URL ready

## Google OAuth Setup

### Step 1: Enable Google Provider in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. Click **Enable**
6. Note the **Web SDK configuration** (you'll need this for OAuth consent screen)

### Step 2: Configure OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project (same project ID)
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Choose **External** user type (unless you have Google Workspace)
5. Click **Create**

### Step 3: Fill OAuth Consent Screen Information

**App Information**:
- App name: `Dark Productivity Suite`
- User support email: `your-email@domain.com`
- App logo: Upload your app logo (120x120px minimum)

**App Domain**:
- Application home page: `https://your-domain.com`
- Application privacy policy link: `https://your-domain.com/privacy`
- Application terms of service link: `https://your-domain.com/terms`

**Authorized Domains**:
Add all domains where your app will be hosted:
- `your-domain.com`
- `your-domain.vercel.app` (if using Vercel)
- `your-domain.netlify.app` (if using Netlify)
- `firebaseapp.com` (for Firebase hosting)

**Developer Contact Information**:
- Email addresses: `your-email@domain.com`

Click **Save and Continue**

### Step 4: Configure Scopes

1. Click **Add or Remove Scopes**
2. Select the following scopes:
   - `openid`
   - `email`
   - `profile`
3. Click **Update**
4. Click **Save and Continue**

### Step 5: Add Test Users (Development)

For development/testing before verification:
1. Click **Add Users**
2. Add email addresses of test users
3. Click **Save and Continue**

### Step 6: Review and Submit

1. Review all information
2. Click **Back to Dashboard**
3. For production, click **Publish App** (requires verification for >100 users)

### Step 7: Configure Authorized Redirect URIs

1. Go to **APIs & Services** → **Credentials**
2. Find the OAuth 2.0 Client ID created by Firebase (starts with your project ID)
3. Click to edit
4. Under **Authorized JavaScript origins**, add:
   - `https://your-domain.com`
   - `https://your-domain.vercel.app`
   - `https://your-domain.netlify.app`
   - `http://localhost:5173` (for development)
5. Under **Authorized redirect URIs**, add:
   - `https://your-project-id.firebaseapp.com/__/auth/handler`
   - `https://your-domain.com/__/auth/handler`
6. Click **Save**

### Step 8: Test Google Sign-In

1. Deploy your app or run locally
2. Click "Sign in with Google"
3. Select a test user account
4. Grant permissions
5. Verify successful authentication

### Troubleshooting Google OAuth

**"Error 400: redirect_uri_mismatch"**:
- Verify redirect URI in Google Cloud Console matches Firebase
- Ensure domain is added to authorized domains
- Clear browser cache and try again

**"Access blocked: This app's request is invalid"**:
- Verify OAuth consent screen is configured
- Check that all required fields are filled
- Ensure app is published or user is added as test user

**"This app isn't verified"**:
- Normal for apps in development
- Click "Advanced" → "Go to [App Name] (unsafe)" for testing
- Submit for verification for production use

## GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** in the left sidebar
3. Click **New OAuth App**

### Step 2: Register Application

Fill in the application details:

**Application name**: `Dark Productivity Suite`

**Homepage URL**: `https://your-domain.com`

**Application description**: 
```
A dark-themed productivity suite with mystical aesthetics, featuring note-taking, task management, tarot readings, and AI-assisted writing.
```

**Authorization callback URL**: 
Get this from Firebase Console:
1. Go to Firebase Console → Authentication → Sign-in method
2. Click on GitHub provider
3. Copy the callback URL (format: `https://your-project-id.firebaseapp.com/__/auth/handler`)

**Enable Device Flow**: Leave unchecked

Click **Register application**

### Step 3: Generate Client Secret

1. After registration, you'll see your **Client ID**
2. Click **Generate a new client secret**
3. Copy the client secret immediately (you won't be able to see it again)

### Step 4: Configure Firebase

1. Go to Firebase Console → Authentication → Sign-in method
2. Click on **GitHub** provider
3. Click **Enable**
4. Paste the **Client ID** from GitHub
5. Paste the **Client Secret** from GitHub
6. Copy the **Authorization callback URL** (if you haven't already)
7. Click **Save**

### Step 5: Update GitHub OAuth App (if needed)

If you need to add additional callback URLs:

1. Go back to GitHub OAuth App settings
2. Update **Authorization callback URL** to include:
   - Firebase callback URL (required)
   - Your custom domain callback (if using custom domain)

### Step 6: Configure App Logo and Branding

1. In GitHub OAuth App settings, upload your app logo
2. Set application URL to your production domain
3. Add application description

### Step 7: Test GitHub Sign-In

1. Deploy your app or run locally
2. Click "Sign in with GitHub"
3. Authorize the application
4. Grant requested permissions:
   - Read user profile
   - Read user email
5. Verify successful authentication

### Troubleshooting GitHub OAuth

**"The redirect_uri MUST match the registered callback URL"**:
- Verify callback URL in GitHub matches Firebase exactly
- Check for trailing slashes or http vs https
- Ensure callback URL is copied correctly from Firebase

**"Application suspended"**:
- Check GitHub account status
- Verify OAuth app is not suspended
- Contact GitHub support if needed

**"Bad verification code"**:
- Clear browser cache and cookies
- Try incognito/private browsing mode
- Regenerate client secret and update in Firebase

**User email not returned**:
- GitHub user must have a verified email
- User must grant email permission
- Check Firebase user object for email field

## Multiple Environments

### Development Environment

For local development:

**Google**:
- Add `http://localhost:5173` to authorized JavaScript origins
- Add `http://localhost:5173/__/auth/handler` to redirect URIs

**GitHub**:
- Create a separate OAuth app for development
- Use `http://localhost:5173` as homepage URL
- Use Firebase development project callback URL

### Staging Environment

For staging/preview deployments:

**Google**:
- Add staging domain to authorized domains
- Add staging redirect URIs

**GitHub**:
- Update callback URL to include staging domain
- Or create separate OAuth app for staging

### Production Environment

Use separate Firebase projects and OAuth apps for production:

1. Create production Firebase project
2. Create production Google OAuth consent screen
3. Create production GitHub OAuth app
4. Use production domains and callback URLs
5. Keep credentials separate from development

## Security Best Practices

### Credential Management

1. **Never commit credentials to git**:
   - Add `.env` to `.gitignore`
   - Use environment variables for all secrets
   - Use platform-specific secret management

2. **Rotate credentials regularly**:
   - Regenerate client secrets every 90 days
   - Update in Firebase and deployment platform
   - Test after rotation

3. **Limit scope permissions**:
   - Only request necessary OAuth scopes
   - Explain why each permission is needed
   - Allow users to review permissions

### Domain Security

1. **Use HTTPS only**:
   - Never use HTTP in production
   - Enforce HTTPS redirects
   - Use HSTS headers

2. **Validate redirect URIs**:
   - Only add trusted domains
   - Use exact matches, not wildcards
   - Remove unused redirect URIs

3. **Monitor OAuth usage**:
   - Check Firebase Authentication logs
   - Monitor for suspicious activity
   - Set up alerts for unusual patterns

## User Privacy

### Data Collection

Inform users what data you collect:
- Email address (required for authentication)
- Display name (from OAuth provider)
- Profile photo (from OAuth provider)
- OAuth provider ID (for account linking)

### Privacy Policy

Create a privacy policy that covers:
- What data is collected
- How data is used
- How data is stored
- How users can delete their data
- Third-party services used (Firebase, OAuth providers)

### Terms of Service

Create terms of service that cover:
- Acceptable use policy
- User responsibilities
- Service limitations
- Account termination
- Liability disclaimers

## Compliance

### GDPR (European Users)

- Provide clear consent mechanisms
- Allow users to export their data
- Allow users to delete their data
- Maintain data processing records

### CCPA (California Users)

- Disclose data collection practices
- Allow users to opt-out of data sale
- Provide data access and deletion

### OAuth Provider Terms

- Comply with Google API Terms of Service
- Comply with GitHub Terms of Service
- Display required attribution
- Follow branding guidelines

## Testing Checklist

- [ ] Google OAuth works in development
- [ ] Google OAuth works in production
- [ ] GitHub OAuth works in development
- [ ] GitHub OAuth works in production
- [ ] User profile data is retrieved correctly
- [ ] Email address is retrieved correctly
- [ ] Profile photo is retrieved correctly
- [ ] Account linking works (same email, different providers)
- [ ] Error messages are user-friendly
- [ ] OAuth consent screen displays correctly
- [ ] Redirect after authentication works
- [ ] Session persistence works
- [ ] Logout works correctly

## Resources

### Google OAuth
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth Consent Screen Guide](https://support.google.com/cloud/answer/10311615)
- [Google API Terms of Service](https://developers.google.com/terms)

### GitHub OAuth
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [GitHub OAuth Best Practices](https://docs.github.com/en/developers/apps/building-oauth-apps/best-practices-for-oauth-apps)
- [GitHub Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service)

### Firebase Authentication
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firebase OAuth Providers](https://firebase.google.com/docs/auth/web/google-signin)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)

## Support

For OAuth-related issues:
- Google OAuth: [Google Cloud Support](https://cloud.google.com/support)
- GitHub OAuth: [GitHub Support](https://support.github.com)
- Firebase Auth: [Firebase Support](https://firebase.google.com/support)

