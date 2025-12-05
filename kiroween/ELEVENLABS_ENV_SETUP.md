# ElevenLabs API Key Setup via Environment Variables

## Quick Setup

Add your ElevenLabs API key to your `.env` file:

```env
VITE_ELEVENLABS_API_KEY=your_api_key_here
```

## Steps

1. **Get your API key:**
   - Go to [elevenlabs.io](https://elevenlabs.io)
   - Sign up or log in
   - Navigate to Profile → API Keys
   - Copy your API key

2. **Create/Update `.env` file:**
   - In your project root (`kiroween/`), create or edit `.env`
   - Add the line:
     ```env
     VITE_ELEVENLABS_API_KEY=your_actual_api_key_here
     ```
   - Replace `your_actual_api_key_here` with your actual key

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

4. **Verify it works:**
   - Open Ghost Archive terminal
   - Click voice settings (⚙️)
   - You should see: "✅ API key loaded from environment variable"

## For Deployment

### Vercel/Netlify

Add the environment variable in your deployment platform:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - **Key:** `VITE_ELEVENLABS_API_KEY`
   - **Value:** Your API key
4. Redeploy

### Other Platforms

Set the environment variable in your deployment configuration:
- **Key:** `VITE_ELEVENLABS_API_KEY`
- **Value:** Your ElevenLabs API key

## Priority Order

The app checks for API key in this order:

1. **Environment Variable** (`VITE_ELEVENLABS_API_KEY`) - Highest priority
2. Firebase Settings (if logged in)
3. Local Settings
4. localStorage (backup)

## Security Notes

- ✅ `.env` is in `.gitignore` - your key won't be committed
- ✅ Environment variables are secure in deployment platforms
- ⚠️ Never commit your `.env` file to git
- ⚠️ Don't share your API key publicly

## Example `.env` File

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# ElevenLabs API Key (for high-quality text-to-speech)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Einstein AI API (Hugging Face backend)
VITE_EINSTEIN_API_URL=https://your-einstein-api.onrender.com
```

## Troubleshooting

**Key not working?**
- Make sure variable name is exactly `VITE_ELEVENLABS_API_KEY`
- Restart dev server after adding to `.env`
- Check for typos in the key
- Verify key is valid on ElevenLabs dashboard

**Still seeing "API key required"?**
- Check browser console for errors
- Verify `.env` file is in project root
- Make sure you restarted the dev server

