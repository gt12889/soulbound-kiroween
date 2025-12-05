# Fix Einstein API "API_NOT_CONFIGURED" Error

## Problem
The Einstein API backend is returning `500 Internal Server Error` with message "API_NOT_CONFIGURED" because the Hugging Face API key is missing.

## Solution: Add Hugging Face API Key to Render.com

### Step 1: Get a FREE Hugging Face API Key

1. Go to https://huggingface.co/
2. Sign up for a free account (if you don't have one)
3. Go to **Settings** → **Access Tokens**
4. Click **"New token"**
5. Give it a name (e.g., "Einstein API")
6. Select **"Read"** permissions
7. Click **"Generate token"**
8. **Copy the token** (you won't see it again!)

### Step 2: Add to Render.com Environment Variables

1. Go to https://render.com
2. Log in and find your **kiroween-dk87** service
3. Click on the service to open settings
4. Go to **"Environment"** tab
5. Click **"Add Environment Variable"**
6. Add:
   - **Key:** `HUGGINGFACE_API_KEY`
   - **Value:** Your Hugging Face token (paste it here)
7. Click **"Save Changes"**
8. Render will automatically redeploy the service

### Step 3: Verify It Works

After Render redeploys (usually takes 1-2 minutes):

1. Check the Render logs to confirm no errors
2. Test the health endpoint: https://kiroween-dk87.onrender.com/health
3. Try using the Einstein personality in Ghost Archive
4. Check browser console - should no longer see "API_NOT_CONFIGURED" error

## Alternative: Use Local Model (Not Recommended)

If you prefer not to use Hugging Face API, you can switch to `app.py` which downloads models locally, but this:
- Uses more memory
- Takes longer to start
- May exceed Render free tier limits

To switch:
1. In Render.com, change **Start Command** from `python app_simple.py` to `python app.py`
2. Remove the `HUGGINGFACE_API_KEY` environment variable
3. Redeploy

## Troubleshooting

### Still Getting Errors?

1. **Check Render Logs:**
   - Go to Render.com → Your Service → Logs
   - Look for error messages

2. **Verify API Key:**
   - Make sure the key is correct (no extra spaces)
   - Ensure it has "Read" permissions

3. **Check Model Name:**
   - Default model is `microsoft/DialoGPT-medium`
   - You can change it by setting `HUGGINGFACE_MODEL` environment variable

4. **Test API Key Locally:**
   ```bash
   curl -X POST https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"inputs": "Hello"}'
   ```

