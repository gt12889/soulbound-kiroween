# Deploy Firestore Rules - Quick Guide

## Why This Is Needed

The GitHub connection is failing to save because Firestore security rules haven't been deployed yet. The updated rules allow saving GitHub connection data to `users/{userId}/settings/github`.

## Quick Deploy Command

Run this command in your terminal from the `kiroween` directory:

```bash
firebase deploy --only firestore:rules
```

## Step-by-Step Instructions

### Option 1: Using Firebase CLI (Recommended)

1. **Open Terminal/PowerShell** in your project directory:
   ```bash
   cd "C:\Program Files\Misc\APCS\gitrepos\kiroween\kiroween"
   ```

2. **Make sure you're logged in to Firebase**:
   ```bash
   firebase login
   ```

3. **Select your Firebase project** (if not already selected):
   ```bash
   firebase use --add
   ```
   - Select your project from the list

4. **Deploy the rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Verify deployment**:
   - You should see: `✔ Deploy complete!`
   - Go to Firebase Console → Firestore → Rules
   - Check the timestamp shows recent deployment

### Option 2: Using Firebase Console (Manual)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Open `firestore.rules` file in your project
5. Copy the entire contents
6. Paste into the Firebase Console rules editor
7. Click **Publish**

## After Deploying

1. **Refresh your browser** (hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`)
2. **Try connecting GitHub again**:
   - Go to Achievements → "Eternal Flames" tab
   - Click "Connect GitHub"
   - Complete OAuth flow
3. **Check console** - you should see:
   - `[GitHubService] Successfully saved GitHub connection`
   - `[GitHubService] Verified connection saved`
   - No more permission errors

## Troubleshooting

### "Firebase CLI not found"
Install Firebase CLI:
```bash
npm install -g firebase-tools
```

### "No project selected"
Select your project:
```bash
firebase use --add
```

### "Permission denied" after deploying
- Make sure you're logged in: `firebase login`
- Verify you have access to the project
- Check that the rules file matches what's in Firebase Console

### Still seeing permission errors
1. Clear browser cache
2. Hard refresh the page
3. Check Firebase Console → Firestore → Rules shows your updated rules
4. Verify the timestamp is recent

## What the Rules Do

The updated rules allow:
- ✅ Reading/writing to `users/{userId}/settings/github` (for GitHub connection)
- ✅ Reading/writing companion data
- ✅ Reading/writing streak data
- ✅ All other existing functionality

All operations require the user to be authenticated and can only access their own data.


