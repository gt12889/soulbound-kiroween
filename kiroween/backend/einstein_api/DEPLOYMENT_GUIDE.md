# 🚀 Render.com + Flask Deployment Guide

Complete step-by-step instructions to deploy your Einstein AI API to Render.com.

## 📋 Prerequisites Checklist

Before you start, make sure you have:

- [ ] **GitHub Account** (FREE) - https://github.com
- [ ] **Hugging Face Account** (FREE) - https://huggingface.co
- [ ] **Render.com Account** (FREE) - https://render.com
- [ ] Your code pushed to a GitHub repository

---

## Step 1: Get Hugging Face API Key (5 minutes)

1. **Go to Hugging Face:**
   - Visit https://huggingface.co/join
   - Sign up for a FREE account (or log in)

2. **Create Access Token:**
   - Click your profile icon (top right)
   - Go to **Settings** → **Access Tokens**
   - Click **New token** button
   - **Name:** `Einstein API`
   - **Type:** Read (this is enough for most models)
   - Click **Generate token**

3. **Copy Your Token:**
   - Copy the token (starts with `hf_...`)
   - ⚠️ **SAVE IT** - you won't see it again!
   - Example: `hf_abc123xyz789...`

---

## Step 2: Test Flask Locally (Optional but Recommended)

### Install Python (if not installed)

**Windows:**
- Download from https://www.python.org/downloads/
- Check "Add Python to PATH" during installation
- Verify: Open PowerShell, type `python --version`

**Mac/Linux:**
- Usually pre-installed
- Verify: `python3 --version`

### Test the Flask App

1. **Open Terminal/PowerShell:**
   ```bash
   cd "C:\Program Files\Misc\APCS\gitrepos\kiroween\backend\einstein_api"
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   
   If that doesn't work, try:
   ```bash
   python -m pip install -r requirements.txt
   ```

3. **Set Environment Variable:**
   
   **Windows PowerShell:**
   ```powershell
   $env:HUGGINGFACE_API_KEY="your_token_here"
   ```
   
   **Windows CMD:**
   ```cmd
   set HUGGINGFACE_API_KEY=your_token_here
   ```
   
   **Mac/Linux:**
   ```bash
   export HUGGINGFACE_API_KEY="your_token_here"
   ```

4. **Run the Server:**
   ```bash
   python app.py
   ```
   
   You should see:
   ```
   Loading Einstein model...
   Model microsoft/DialoGPT-medium loaded successfully
   * Running on http://0.0.0.0:5000
   ```

5. **Test It:**
   - Open browser: http://localhost:5000/health
   - Should show: `{"status": "healthy", "model_loaded": true}`
   - Press `Ctrl+C` to stop

---

## Step 3: Push Code to GitHub

If your code isn't on GitHub yet:

1. **Create GitHub Repository:**
   - Go to https://github.com/new
   - Name it (e.g., `kiroween`)
   - Make it **Public** or **Private** (your choice)
   - Click **Create repository**

2. **Push Your Code:**
   ```bash
   cd "C:\Program Files\Misc\APCS\gitrepos\kiroween"
   git add .
   git commit -m "Add Einstein Flask API"
   git remote add origin https://github.com/yourusername/kiroween.git
   git push -u origin main
   ```

---

## Step 4: Deploy to Render.com

### 4.1 Create Render Account

1. **Sign Up:**
   - Go to https://render.com
   - Click **Get Started for Free**
   - Sign up with GitHub (recommended) or email

2. **Verify Email:**
   - Check your email
   - Click verification link

### 4.2 Create New Web Service

1. **Go to Dashboard:**
   - Click **New +** button (top right)
   - Select **Web Service**

2. **Connect Repository:**
   - If using GitHub: Click **Connect GitHub**
   - Authorize Render to access your repos
   - Select your repository (`kiroween`)
   - Click **Connect**

3. **Configure Service:**

   **Basic Settings:**
   - **Name:** `einstein-ai-api` (or any name you like)
   - **Region:** Choose closest to you (e.g., `Oregon (US West)`)
   - **Branch:** `main` (or `master`)
   - **Root Directory:** `backend/einstein_api` ⚠️ **IMPORTANT!**
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python app_simple.py` ⚠️ **Use simple version (recommended)**
   - **Plan:** Select **Free** (512MB RAM, 0.1 CPU)
   
   **💡 Tip:** Use `app_simple.py` (Inference API) instead of `app.py` (local models) for faster startup and less memory usage!

4. **Set Environment Variables:**
   
   Click **Advanced** → **Add Environment Variable**
   
   Add these variables:
   
   | Key | Value |
   |-----|-------|
   | `HUGGINGFACE_API_KEY` | Your token from Step 1 (starts with `hf_...`) |
   | `HUGGINGFACE_MODEL` | `microsoft/DialoGPT-medium` (optional) |
   | `PORT` | Leave empty (Render sets this automatically) |

5. **Deploy:**
   - Click **Create Web Service** at the bottom
   - Wait 5-10 minutes for first deployment
   - Watch the logs as it builds

### 4.3 Get Your API URL

Once deployed:

1. **Copy Your URL:**
   - Look at the top of the service page
   - URL format: `https://einstein-ai-api.onrender.com`
   - Copy this URL!

2. **Test It:**
   - Visit: `https://your-app-name.onrender.com/health`
   - Should show: `{"status": "healthy", "model_loaded": true}`

---

## Step 5: Update Frontend

1. **Add to `.env` file:**
   
   Create or edit `.env` in your project root:
   ```env
   VITE_EINSTEIN_API_URL=https://your-app-name.onrender.com
   ```
   
   Replace `your-app-name` with your actual Render service name.

2. **Restart Dev Server:**
   ```bash
   npm run dev
   ```

---

## ✅ Testing

1. **Open your app**
2. **Go to Ghost Archive**
3. **Connect to Albert Einstein**
4. **Ask:** "What is relativity?"
5. **You should get a response from Hugging Face!**

---

## 🔧 Troubleshooting

### Build Fails on Render

**Error: "Module not found"**
- Check `requirements.txt` has all dependencies
- Verify Root Directory is `backend/einstein_api`

**Error: "Port already in use"**
- Render sets PORT automatically - don't hardcode it
- Make sure `app.py` uses: `port = int(os.getenv('PORT', 5000))`

### Model Loading Issues

**Error: "Out of memory"**
- Use smaller model: Set `HUGGINGFACE_MODEL=gpt2`
- Free tier has 512MB RAM limit

**Error: "Timeout"**
- First request takes time (model download)
- Keep `max_length` under 150 tokens
- Render free tier has 30s timeout

### API Not Responding

**Check Health Endpoint:**
```bash
curl https://your-app.onrender.com/health
```

**Check Render Logs:**
- Go to Render Dashboard
- Click your service
- Click **Logs** tab
- Look for errors

**Common Issues:**
- Missing `HUGGINGFACE_API_KEY` → Add it in Environment Variables
- Wrong Root Directory → Should be `backend/einstein_api`
- Model too large → Use `gpt2` instead

---

## 📊 Render.com Free Tier Limits

- **RAM:** 512MB
- **CPU:** 0.1 CPU
- **Timeout:** 30 seconds per request
- **Sleep:** Service sleeps after 15 min inactivity (wakes on next request)
- **Bandwidth:** 100GB/month

**First request after sleep takes ~30 seconds** (cold start)

---

## 🎯 Quick Reference

### Render Dashboard URLs
- **Dashboard:** https://dashboard.render.com
- **Your Service:** https://dashboard.render.com/web/your-service-name

### API Endpoints
- **Health:** `GET https://your-app.onrender.com/health`
- **Generate:** `POST https://your-app.onrender.com/generate`

### Environment Variables Needed
```env
HUGGINGFACE_API_KEY=hf_your_token_here
HUGGINGFACE_MODEL=microsoft/DialoGPT-medium  # Optional
```

### Frontend `.env` Variable
```env
VITE_EINSTEIN_API_URL=https://your-app.onrender.com
```

---

## 🆘 Need Help?

1. **Check Render Logs:** Dashboard → Your Service → Logs
2. **Test Health Endpoint:** Visit `/health` in browser
3. **Verify Environment Variables:** Dashboard → Environment tab
4. **Check Root Directory:** Should be `backend/einstein_api`

---

## 🎉 Success Checklist

- [ ] Hugging Face token created
- [ ] Flask app tested locally
- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Environment variables set
- [ ] Service deployed successfully
- [ ] Health endpoint returns `{"status": "healthy"}`
- [ ] Frontend `.env` updated
- [ ] Einstein responds in Ghost Archive!

---

**You're all set!** 🚀 Your Einstein API is now running on Render.com for FREE!

