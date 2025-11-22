# Authentication Guide

Complete guide to authentication and account management in the Dark Productivity Suite.

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Registration](#registration)
4. [Login](#login)
5. [Social Authentication](#social-authentication)
6. [Password Management](#password-management)
7. [Session Management](#session-management)
8. [Account Settings](#account-settings)
9. [Security Best Practices](#security-best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Dark Productivity Suite uses Firebase Authentication to provide secure access to your data and enable cloud synchronization across devices.

### Authentication Features

- **Email/Password Authentication**: Traditional account creation
- **Social Authentication**: Sign in with Google or GitHub
- **Password Reset**: Email-based account recovery
- **Session Management**: Secure 30-day sessions
- **Multi-device Support**: Access from any device
- **Offline Mode**: Full functionality without authentication

### Why Authenticate?

**Without Authentication:**
- ✓ Full app functionality
- ✓ Local data storage
- ✗ No cloud sync
- ✗ No multi-device access
- ✗ Data lost if browser storage cleared

**With Authentication:**
- ✓ Full app functionality
- ✓ Local data storage
- ✓ Cloud synchronization
- ✓ Multi-device access
- ✓ Data backup and recovery
- ✓ Secure data encryption

---

## Getting Started

### First Time Users

1. Visit the Dark Productivity Suite
2. Click "Get Started" or "Sign Up"
3. Choose authentication method:
   - Email/Password
   - Google
   - GitHub
4. Complete registration
5. Start using the app with cloud sync enabled

### Existing Users

1. Visit the Dark Productivity Suite
2. Click "Sign In"
3. Enter credentials or use social auth
4. Access your synced data

---

## Registration

### Email/Password Registration

#### Step-by-Step

1. **Navigate to Registration**
   - Click "Sign Up" on landing page
   - Or click "Create Account" on login page

2. **Enter Email Address**
   - Use a valid email address
   - This will be your username
   - Verification email may be sent

3. **Create Password**
   - Minimum 8 characters
   - At least one uppercase letter (A-Z)
   - At least one lowercase letter (a-z)
   - At least one number (0-9)

4. **Password Strength Indicator**
   - Styled as a mystical meter
   - Shows strength: Weak, Fair, Good, Strong
   - Aim for "Good" or "Strong"

5. **Accept Terms**
   - Read terms of service
   - Check acceptance box
   - Required to create account

6. **Create Account**
   - Click "Create Account" button
   - Wait for confirmation
   - Automatically logged in

#### Password Requirements

**Minimum Requirements:**
- Length: 8+ characters
- Uppercase: At least 1 letter
- Lowercase: At least 1 letter
- Number: At least 1 digit

**Recommended:**
- Length: 12+ characters
- Include special characters (!@#$%^&*)
- Avoid common words or patterns
- Use unique password (not reused)

**Examples:**

✗ Bad: `password123` (too common)
✗ Bad: `Password` (too short, no number)
✗ Bad: `12345678` (no letters)
✓ Good: `MyDark2024!` (meets all requirements)
✓ Good: `Mystical$Prod99` (strong password)

### Registration Errors

**Email Already Exists**
- Error: "Email already in use"
- Solution: Use different email or sign in
- Alternative: Use password reset if you forgot

**Invalid Email Format**
- Error: "Invalid email address"
- Solution: Check for typos
- Format: `user@example.com`

**Weak Password**
- Error: "Password does not meet requirements"
- Solution: Follow password requirements above
- Use password strength indicator

**Network Error**
- Error: "Unable to create account"
- Solution: Check internet connection
- Try again in a few moments

---

## Login

### Email/Password Login

#### Step-by-Step

1. **Navigate to Login**
   - Click "Sign In" on landing page
   - Or visit `/login` directly

2. **Enter Credentials**
   - Email address
   - Password

3. **Sign In**
   - Click "Sign In" button
   - Wait for authentication
   - Redirected to app

4. **Remember Me** (Optional)
   - Check "Remember Me" box
   - Extends session duration
   - Convenient for personal devices

#### Login Errors

**Invalid Credentials**
- Error: "Invalid email or password"
- Solution: Check for typos
- Try password reset if forgotten

**Account Not Found**
- Error: "No account found with this email"
- Solution: Check email spelling
- Create new account if needed

**Too Many Attempts**
- Error: "Too many failed login attempts"
- Solution: Wait 15 minutes
- Try password reset

**Network Error**
- Error: "Unable to sign in"
- Solution: Check internet connection
- Try again in a few moments

### Offline Access

If you're already logged in:
- App works fully offline
- Changes queue for sync
- Sync when connection restored
- No re-authentication needed

---

## Social Authentication

Sign in quickly using your existing Google or GitHub account.

### Google Authentication

#### Setup

1. **Click "Sign in with Google"**
   - On login or registration page
   - Redirects to Google

2. **Select Google Account**
   - Choose account to use
   - Or sign in to Google

3. **Grant Permissions**
   - Review requested permissions
   - Click "Allow"

4. **Complete**
   - Redirected back to app
   - Automatically logged in

#### Permissions Requested

- **Email Address**: For account identification
- **Basic Profile**: Name and profile picture
- **No Access**: To your Google data or services

### GitHub Authentication

#### Setup

1. **Click "Sign in with GitHub"**
   - On login or registration page
   - Redirects to GitHub

2. **Authorize Application**
   - Review requested permissions
   - Click "Authorize"

3. **Complete**
   - Redirected back to app
   - Automatically logged in

#### Permissions Requested

- **Email Address**: For account identification
- **Basic Profile**: Username and avatar
- **No Access**: To your repositories or code

### Social Auth Benefits

- **Quick Setup**: No password to remember
- **Secure**: Leverages existing account security
- **Easy Recovery**: Use social account to recover access
- **Profile Info**: Automatic name and avatar

### Social Auth Considerations

- **Account Dependency**: Requires social account access
- **Privacy**: Shares basic profile information
- **Revocation**: Can revoke access anytime from social account settings

### Linking Accounts

**Add Social Auth to Existing Account:**
1. Sign in with email/password
2. Go to Settings → Account
3. Click "Link Google Account" or "Link GitHub Account"
4. Complete authorization
5. Now you can sign in with either method

**Add Email/Password to Social Account:**
1. Sign in with social auth
2. Go to Settings → Account
3. Click "Add Password"
4. Create password following requirements
5. Now you can sign in with either method

---

## Password Management

### Changing Password

#### For Logged-In Users

1. **Navigate to Settings**
   - Click settings icon
   - Select "Account" tab

2. **Change Password Section**
   - Enter current password
   - Enter new password
   - Confirm new password

3. **Save Changes**
   - Click "Update Password"
   - Confirmation message appears
   - Session remains active

### Password Reset (Forgot Password)

#### Step-by-Step

1. **Navigate to Password Reset**
   - Click "Forgot Password?" on login page
   - Or visit `/password-reset`

2. **Enter Email Address**
   - Type your account email
   - Click "Send Reset Code"

3. **Check Email**
   - Open email from Dark Productivity Suite
   - Find verification code
   - Code valid for 1 hour

4. **Enter Verification Code**
   - Return to app
   - Enter code (styled as rune entry)
   - Click "Verify Code"

5. **Create New Password**
   - Enter new password
   - Confirm new password
   - Follow password requirements

6. **Complete Reset**
   - Click "Reset Password"
   - Confirmation message appears
   - Automatically logged in

#### Reset Errors

**Email Not Found**
- Error: "No account with this email"
- Solution: Check email spelling
- Create new account if needed

**Invalid Code**
- Error: "Invalid or expired code"
- Solution: Request new code
- Check for typos in code

**Code Expired**
- Error: "Verification code expired"
- Solution: Request new code
- Codes valid for 1 hour

**Network Error**
- Error: "Unable to send reset email"
- Solution: Check internet connection
- Try again in a few moments

### Password Best Practices

1. **Use Strong Passwords**
   - 12+ characters
   - Mix of letters, numbers, symbols
   - Avoid common words

2. **Unique Passwords**
   - Don't reuse passwords
   - Use password manager
   - Different for each service

3. **Regular Updates**
   - Change password periodically
   - Update if compromised
   - Update after security alerts

4. **Secure Storage**
   - Use password manager
   - Don't write down passwords
   - Don't share passwords

---

## Session Management

### Session Duration

- **Default**: 30 days
- **With "Remember Me"**: 90 days
- **Automatic Renewal**: On activity
- **Manual Logout**: Immediate invalidation

### Session Security

**Secure Tokens:**
- Encrypted session tokens
- Stored securely in browser
- Transmitted over HTTPS only
- Automatic expiration

**Session Renewal:**
- Automatic on app activity
- Extends session duration
- No re-authentication needed
- Seamless experience

### Multiple Devices

**Simultaneous Sessions:**
- Sign in on multiple devices
- Each device has own session
- Changes sync in real-time
- Independent session management

**Session Management:**
- View active sessions in settings
- See last activity per device
- Revoke specific sessions
- Sign out all devices option

### Logout

#### Single Device Logout

1. Click user menu (top right)
2. Select "Sign Out"
3. Confirm logout
4. Session invalidated
5. Redirected to landing page

#### All Devices Logout

1. Go to Settings → Account
2. Click "Sign Out All Devices"
3. Confirm action
4. All sessions invalidated
5. Must sign in again on all devices

### Session Expiration

**When Session Expires:**
1. Automatic redirect to login
2. Message: "Session expired, please sign in"
3. Sign in to continue
4. Return to previous location
5. Unsaved changes may be lost

**Preventing Expiration:**
- Use app regularly
- Enable "Remember Me"
- Check "Keep me signed in"
- Activity extends session

---

## Account Settings

### Profile Information

**Editable Fields:**
- Display name
- Profile picture (from social auth)
- Email address (requires verification)
- Password

**Update Profile:**
1. Settings → Account tab
2. Edit desired fields
3. Click "Save Changes"
4. Confirmation message

### Email Verification

**Why Verify:**
- Enables password reset
- Confirms account ownership
- Required for some features

**Verification Process:**
1. Settings → Account
2. Click "Verify Email"
3. Check email for link
4. Click verification link
5. Email verified

### Account Deletion

**Warning**: This action cannot be undone!

**What Gets Deleted:**
- Your account
- All cloud-synced data
- All sessions
- Profile information

**What Remains:**
- Local data (until browser storage cleared)
- Exported backups (if created)

**Deletion Process:**
1. Settings → Account
2. Scroll to "Danger Zone"
3. Click "Delete Account"
4. Enter password to confirm
5. Type "DELETE" to confirm
6. Click "Permanently Delete Account"
7. Account deleted immediately

**Before Deleting:**
- Export your data
- Download backups
- Consider deactivation instead
- No recovery possible

---

## Security Best Practices

### Account Security

1. **Strong Password**
   - Use password manager
   - 12+ characters
   - Unique to this service

2. **Two-Factor Authentication** (Coming Soon)
   - Enable when available
   - Use authenticator app
   - Backup codes stored securely

3. **Regular Password Updates**
   - Change every 6-12 months
   - Update if compromised
   - Use different passwords

4. **Secure Email**
   - Use secure email provider
   - Enable 2FA on email
   - Monitor for suspicious activity

### Device Security

1. **Trusted Devices Only**
   - Don't sign in on public computers
   - Use private browsing if necessary
   - Always sign out when done

2. **Device Protection**
   - Use device password/PIN
   - Enable device encryption
   - Keep OS updated

3. **Network Security**
   - Use secure WiFi networks
   - Avoid public WiFi for sensitive actions
   - Use VPN on untrusted networks

### Data Security

1. **Regular Backups**
   - Export data monthly
   - Store backups securely
   - Test backup restoration

2. **Encryption**
   - Enable export encryption
   - Use strong encryption passwords
   - Store encryption keys securely

3. **Access Control**
   - Don't share account credentials
   - Use separate accounts for others
   - Review active sessions regularly

### Monitoring

1. **Check Active Sessions**
   - Review regularly in settings
   - Revoke unknown sessions
   - Sign out all if suspicious

2. **Monitor Activity**
   - Check for unexpected changes
   - Review sync activity
   - Report suspicious behavior

3. **Security Alerts**
   - Enable email notifications
   - Act on security warnings
   - Update password if alerted

---

## Troubleshooting

### Can't Sign In

**Check:**
1. Email spelling
2. Password (case-sensitive)
3. Caps Lock key
4. Internet connection
5. Browser cookies enabled

**Try:**
1. Password reset
2. Different browser
3. Clear browser cache
4. Disable browser extensions
5. Contact support

### Can't Receive Reset Email

**Check:**
1. Spam/junk folder
2. Email spelling
3. Email provider issues
4. Firewall blocking emails

**Try:**
1. Wait 5-10 minutes
2. Request new code
3. Check email filters
4. Try different email
5. Contact support

### Session Keeps Expiring

**Causes:**
- Browser clearing cookies
- Privacy mode/incognito
- Short session setting
- Browser extension interference

**Solutions:**
1. Enable "Remember Me"
2. Allow cookies for site
3. Disable privacy extensions
4. Use regular browser mode
5. Check browser settings

### Social Auth Not Working

**Check:**
1. Social account access
2. Popup blockers
3. Browser permissions
4. Third-party cookies enabled

**Try:**
1. Allow popups for site
2. Enable third-party cookies
3. Try different browser
4. Check social account status
5. Use email/password instead

### Data Not Syncing

**Check:**
1. Signed in status
2. Internet connection
3. Sync status indicator
4. Browser console for errors

**Try:**
1. Manual sync (click sync icon)
2. Sign out and sign in
3. Check Firebase status
4. Clear browser cache
5. Contact support

### Account Locked

**Causes:**
- Too many failed login attempts
- Suspicious activity detected
- Security policy violation

**Solutions:**
1. Wait 15-30 minutes
2. Try password reset
3. Contact support
4. Verify account ownership

---

## Support

### Getting Help

**Documentation:**
- [FEATURES.md](./FEATURES.md) - Feature guides
- [README.md](./README.md) - General information
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Technical setup

**Community:**
- GitHub Issues - Bug reports
- GitHub Discussions - Questions and ideas
- Discord - Community chat (coming soon)

**Contact:**
- Email: support@darkproductivity.app
- Response time: 24-48 hours
- Include account email (not password!)

### Reporting Security Issues

**Do Not:**
- Post security issues publicly
- Share exploit details
- Test on production

**Do:**
- Email security@darkproductivity.app
- Include detailed description
- Wait for response before disclosure
- Responsible disclosure appreciated

---

## Privacy

### Data Collection

**We Collect:**
- Email address
- Password (hashed)
- Profile information (if provided)
- Usage statistics (anonymous)

**We Don't Collect:**
- Note/task content (encrypted)
- Browsing history
- Personal information beyond profile
- Data from other services

### Data Usage

**Your Data:**
- Stored encrypted in cloud
- Used only for app functionality
- Never sold or shared
- You control and own it

**Analytics:**
- Anonymous usage statistics
- Performance monitoring
- Error tracking
- No personal identification

### Your Rights

- **Access**: View your data anytime
- **Export**: Download all your data
- **Delete**: Remove your account and data
- **Portability**: Take your data elsewhere

---

**May your account be secure and your data mystical.** 🔐🌙
