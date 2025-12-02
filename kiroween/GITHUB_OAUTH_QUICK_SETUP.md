# GitHub OAuth Quick Setup Guide

Follow these steps to configure GitHub OAuth for Firebase Authentication.

## Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** in the left sidebar
3. Click **New OAuth App** button

## Step 2: Fill in Application Details

Fill in the following information:

- **Application name**: `Dark Productivity Suite` (or your app name)
- **Homepage URL**: 
  - For development: `http://localhost:5173`
  - For production: `https://your-domain.com`
- **Application description**: 
  ```
  A dark-themed productivity suite with mystical aesthetics, featuring note-taking, task management, tarot readings, and AI-assisted writing.
  ```
- **Authorization callback URL**: 
  - **IMPORTANT**: First, go to Firebase Console to get this URL (see Step 3)
  - Format: `https://your-project-id.firebaseapp.com/__/auth/handler`

4. Click **Register application**

## Step 3: Get Firebase Callback URL

1. Open a new tab and go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Sign-in method**
4. Click on **GitHub** provider
5. **Copy the Authorization callback URL** shown at the bottom
   - It looks like: `https://your-project-id.firebaseapp.com/__/auth/handler`
6. Go back to GitHub and paste this URL into the **Authorization callback URL** field
7. Click **Update application** in GitHub

## Step 4: Generate Client Secret

1. After registering, you'll see your **Client ID** on the GitHub OAuth App page
2. Click **Generate a new client secret** button
3. **IMPORTANT**: Copy the client secret immediately - you won't be able to see it again!
4. Save it somewhere secure temporarily (you'll paste it into Firebase next)

## Step 5: Configure Firebase

1. Go back to Firebase Console → **Authentication** → **Sign-in method**
2. Click on **GitHub** provider
3. Click **Enable** toggle
4. Fill in the fields:
   - **Client ID**: Paste the Client ID from GitHub (Step 4)
   - **Client Secret**: Paste the Client Secret from GitHub (Step 4)
5. Verify the **Authorization callback URL** matches what you set in GitHub
6. Click **Save**

## Step 6: Verify Setup

1. The GitHub provider should now show as **Enabled** in Firebase
2. You should see a green checkmark or "Enabled" status
3. The callback URL should be displayed correctly

## Step 7: Test the Connection

1. In your app, try to sign in with GitHub
2. You should be redirected to GitHub authorization page
3. After authorizing, you should be redirected back to your app
4. Check Firebase Console → Authentication → Users to see if the user was created

## Troubleshooting

### "Client ID is required" / "Client secret is required"
- Make sure you've filled in both fields in Firebase
- Verify you copied the values correctly from GitHub
- Check for any extra spaces before/after the values

### "The redirect_uri MUST match the registered callback URL"
- Verify the callback URL in GitHub exactly matches Firebase
- Check for trailing slashes (should NOT have one)
- Ensure both use `https://` (not `http://`)
- The URL should end with `/__/auth/handler`

### "Bad verification code"
- Regenerate the client secret in GitHub
- Update the new secret in Firebase
- Clear browser cache and try again

### Callback URL Not Showing in Firebase
- Make sure you've clicked "Enable" on the GitHub provider
- Refresh the Firebase Console page
- The callback URL appears after enabling the provider

## Important Notes

- **Never commit** the Client Secret to git
- The Client Secret can only be viewed once when generated
- If you lose the secret, generate a new one
- For production, create a separate GitHub OAuth App
- Update the callback URL in GitHub if you change Firebase projects

## Next Steps

After completing this setup:
1. Test GitHub sign-in in your app
2. Verify users can connect their GitHub accounts
3. Check that commit activity is being fetched correctly
4. Monitor Firebase Authentication logs for any issues


