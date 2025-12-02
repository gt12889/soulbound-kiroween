# GitHub Connection Fix Guide

## Issue 1: Firestore Permission Denied

The Firestore security rules need to be deployed to Firebase.

### Quick Fix:

**Option A: Deploy via Firebase CLI**
```bash
# Make sure you're in the project root directory
cd kiroween

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

**Option B: Deploy via Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Copy the contents of `firestore.rules` file
5. Paste into the rules editor
6. Click **Publish**

## Issue 2: Invalid GitHub Username

The stored username `t.dinh43204` doesn't exist on GitHub. You need to reconnect with the correct username.

### Steps to Fix:

1. **Disconnect GitHub**:
   - Go to Achievements page → "Eternal Flames" tab
   - Click "Disconnect" on the GitHub connection button

2. **Reconnect GitHub**:
   - Click "Connect GitHub"
   - Complete the OAuth flow
   - The app will now fetch your actual GitHub username from GitHub's API

3. **Verify Connection**:
   - Check the browser console for logs:
     - `[GitHubConnectButton] Got username from GitHub API: [your-username]`
     - `[GitHubService] Verified GitHub user: [your-username]`
   - The commit heatmap should appear automatically

## Troubleshooting

### If you still see permission errors after deploying rules:

1. **Check you're authenticated**:
   - Make sure you're logged in to the app
   - Check that your user ID matches in the console logs

2. **Verify rules were deployed**:
   - Go to Firebase Console → Firestore → Rules
   - Check the timestamp shows recent deployment
   - Verify the rules match `firestore.rules` file

3. **Clear browser cache**:
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear cache and reload

### If GitHub username is still wrong:

1. **Check your actual GitHub username**:
   - Go to https://github.com/settings/profile
   - Your username is shown at the top

2. **Manually verify**:
   - Try visiting: `https://api.github.com/users/[your-username]`
   - Should return JSON with your user info (not 404)

3. **Reconnect**:
   - Disconnect and reconnect GitHub
   - The app will fetch the correct username automatically

## Expected Console Logs (After Fix)

When everything works, you should see:
```
[GitHubConnectButton] Got username from GitHub API: [your-actual-username]
[GitHubService] Saving connection data: { userId: '...', username: '[your-username]' }
[GitHubService] Successfully saved GitHub connection
[GitHubService] Verified connection saved: { connected: true, username: '[your-username]' }
[GitHubCommitHeatmap] Connected with username: [your-username]
[GitHubService] Verified GitHub user: [your-username] (ID: ...)
[GitHubService] Found X commits in [repo-name]
[GitHubService] Total commits found: X
[GitHubCommitHeatmap] Converted to heatmap data: 365 days
```


