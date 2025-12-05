# ⚡ Quick Start - 5 Minute Setup

Fastest way to get Einstein API running.

## 🎯 Prerequisites (2 minutes)

1. **Hugging Face Token:**
   - Go to https://huggingface.co/settings/tokens
   - Click **New token**
   - Name: `Einstein API`, Type: **Read**
   - Copy token (starts with `hf_...`)

2. **GitHub Repository:**
   - Your code must be on GitHub
   - If not: Push it!

## 🚀 Deploy to Render (3 minutes)

1. **Go to Render:** https://dashboard.render.com

2. **New Web Service:**
   - Click **New +** → **Web Service**
   - Connect GitHub → Select your repo

3. **Settings:**
   ```
   Name: einstein-ai-api
   Root Directory: backend/einstein_api
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: python app.py
   Plan: Free
   ```

4. **Environment Variables:**
   - Add: `HUGGINGFACE_API_KEY` = `your_token_here`

5. **Deploy:**
   - Click **Create Web Service**
   - Wait 5-10 minutes
   - Copy your URL (e.g., `https://einstein-ai-api.onrender.com`)

## ✅ Update Frontend

Add to `.env`:
```env
VITE_EINSTEIN_API_URL=https://einstein-ai-api.onrender.com
```

Restart: `npm run dev`

## 🎉 Done!

Test in Ghost Archive → Connect to Einstein → Ask a question!

---

**That's it!** For detailed instructions, see `DEPLOYMENT_GUIDE.md`

