# How to Update Your Gemini API Key

## Step 1: Get a NEW API Key from Google

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. **Create a NEW API key** (the old one is leaked and disabled)
4. Copy the new key

## Step 2: Update Your .env File

Open your `.env` file in the project root and replace the old key:

```env
VITE_GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
VITE_AI_PROVIDER=gemini
```

**Important:** Replace `YOUR_NEW_API_KEY_HERE` with the actual new key you just created.

## Step 3: Rebuild and Deploy

After updating the `.env` file, run these commands:

```bash
npm run build
firebase deploy --only hosting
```

## Step 4: Clear Browser Cache

After deployment, clear your browser cache or do a hard refresh (Ctrl+Shift+R) to ensure you're loading the new version.

## Verification

After deployment, check the browser console. You should no longer see the "API key was reported as leaked" error.

