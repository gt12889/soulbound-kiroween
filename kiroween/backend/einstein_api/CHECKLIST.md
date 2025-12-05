# ✅ Render.com + Flask Setup Checklist

## Before You Start

- [ ] GitHub account created
- [ ] Code pushed to GitHub repository
- [ ] Python installed on your computer (for local testing)

---

## Step 1: Hugging Face Setup

- [ ] Account created at https://huggingface.co
- [ ] Went to Settings → Access Tokens
- [ ] Created new token named "Einstein API"
- [ ] Token type: **Read**
- [ ] Copied token (starts with `hf_...`)
- [ ] Saved token somewhere safe

**Token Format:** `hf_abc123xyz789...`

---

## Step 2: Render.com Setup

- [ ] Account created at https://render.com
- [ ] Email verified
- [ ] GitHub account connected to Render

---

## Step 3: Create Web Service on Render

- [ ] Clicked "New +" → "Web Service"
- [ ] Connected GitHub repository
- [ ] Selected correct repository

**Service Configuration:**
- [ ] Name: `einstein-ai-api` (or your choice)
- [ ] Root Directory: `backend/einstein_api` ✅
- [ ] Environment: `Python 3`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `python app_simple.py` ✅
- [ ] Plan: **Free**

**Environment Variables:**
- [ ] Added `HUGGINGFACE_API_KEY` = `your_token_here`
- [ ] (Optional) Added `HUGGINGFACE_MODEL` = `microsoft/DialoGPT-medium`

**Deploy:**
- [ ] Clicked "Create Web Service"
- [ ] Waited for deployment (5-10 minutes)
- [ ] Deployment succeeded ✅

---

## Step 4: Get Your API URL

- [ ] Copied service URL from Render dashboard
- [ ] URL format: `https://einstein-ai-api.onrender.com`
- [ ] Tested health endpoint: `https://your-url.onrender.com/health`
- [ ] Got response: `{"status": "healthy"}` ✅

---

## Step 5: Update Frontend

- [ ] Opened `.env` file in project root
- [ ] Added: `VITE_EINSTEIN_API_URL=https://your-url.onrender.com`
- [ ] Saved file
- [ ] Restarted dev server: `npm run dev`

---

## Step 6: Test in App

- [ ] Opened app in browser
- [ ] Navigated to Ghost Archive
- [ ] Connected to Albert Einstein personality
- [ ] Asked a question (e.g., "What is relativity?")
- [ ] Received Einstein-style response ✅

---

## 🎉 Success!

If all checkboxes are checked, you're done!

---

## 🆘 Troubleshooting

**Service won't start:**
- Check Root Directory is `backend/einstein_api`
- Check Start Command is `python app_simple.py`
- Check logs in Render dashboard

**Health check fails:**
- Verify `HUGGINGFACE_API_KEY` is set correctly
- Check token starts with `hf_`
- Wait a few minutes (first deployment is slow)

**No response from Einstein:**
- Check frontend `.env` has correct URL
- Verify URL doesn't have trailing slash
- Check browser console for errors
- Test health endpoint manually

---

## 📝 Quick Reference

**Render Dashboard:** https://dashboard.render.com

**Your Service URL:** `https://your-service-name.onrender.com`

**Health Check:** `https://your-service-name.onrender.com/health`

**Frontend `.env`:**
```env
VITE_EINSTEIN_API_URL=https://your-service-name.onrender.com
```

