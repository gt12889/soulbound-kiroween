# Hugging Face Einstein API Setup Guide

This guide shows you how to set up a FREE Hugging Face-based Flask API for the Albert Einstein personality in Ghost Archive.

## 🎯 What You'll Build

- Flask backend API using Hugging Face models
- Deployed on Render.com (FREE tier)
- Replaces Gemini for Einstein personality
- Zero cost solution

## 📋 Prerequisites

1. **Hugging Face Account** (FREE)
   - Sign up at https://huggingface.co/
   - Get API token from Settings → Access Tokens

2. **Render.com Account** (FREE)
   - Sign up at https://render.com/
   - Connect your GitHub account

3. **GitHub Repository**
   - Your code should be in a GitHub repo

## 🚀 Step-by-Step Setup

### Step 1: Get Hugging Face API Key

1. Go to https://huggingface.co/join
2. Create a free account
3. Navigate to **Settings** → **Access Tokens**
4. Click **New token**
5. Name it "Einstein API" with **Read** permissions
6. Copy the token (starts with `hf_...`)

### Step 2: Test Locally (Optional)

```bash
# Navigate to backend folder
cd backend/einstein_api

# Install dependencies
pip install -r requirements.txt

# Set environment variable
export HUGGINGFACE_API_KEY=your_token_here

# Run the server
python app.py
```

Test it:
```bash
curl http://localhost:5000/health
```

### Step 3: Deploy to Render.com

1. **Go to Render Dashboard:**
   - Visit https://dashboard.render.com
   - Click **New +** → **Web Service**

2. **Connect Repository:**
   - Connect your GitHub account
   - Select your repository
   - Choose the `backend/einstein_api` directory

3. **Configure Service:**
   - **Name:** `einstein-ai-api` (or any name)
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python app.py`
   - **Plan:** Free

4. **Set Environment Variables:**
   - Click **Environment** tab
   - Add:
     - `HUGGINGFACE_API_KEY`: Your token from Step 1
     - `HUGGINGFACE_MODEL`: `microsoft/DialoGPT-medium` (optional)

5. **Deploy:**
   - Click **Create Web Service**
   - Wait 5-10 minutes for first deployment (model download)
   - Copy your service URL (e.g., `https://einstein-ai-api.onrender.com`)

### Step 4: Update Frontend

1. **Add to `.env` file:**
```env
VITE_EINSTEIN_API_URL=https://your-app-name.onrender.com
```

2. **Restart your dev server:**
```bash
npm run dev
```

## ✅ Testing

1. Open Ghost Archive in your app
2. Connect to Albert Einstein
3. Ask a question like "What is relativity?"
4. You should get an Einstein-style response from Hugging Face!

## 🔧 Troubleshooting

### Model Loading Slow
- First request takes time (model download)
- Use smaller model: Set `HUGGINGFACE_MODEL=gpt2`

### Memory Issues
- Render free tier has 512MB RAM
- Use `gpt2` instead of larger models

### CORS Errors
- Already handled in Flask with `flask-cors`
- If issues persist, check Render logs

### Timeout Errors
- Render free tier has 30s timeout
- Keep `max_length` under 150 tokens

## 💰 Cost Breakdown

- **Hugging Face:** FREE (most models)
- **Render.com:** FREE tier (512MB RAM, 0.1 CPU)
- **Total:** $0/month

## 🎨 Model Options

You can use different models by setting `HUGGINGFACE_MODEL`:

| Model | Size | Speed | Quality |
|-------|------|-------|---------|
| `gpt2` | Small | Fast | Good |
| `microsoft/DialoGPT-medium` | Medium | Medium | Better |
| `microsoft/DialoGPT-large` | Large | Slow | Best |

## 📚 Next Steps

- Fine-tune a model on Einstein's writings for better responses
- Add more historical figures (Newton, Tesla, etc.)
- Cache responses to reduce API calls

## 🆘 Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Test health endpoint: `https://your-app.onrender.com/health`
3. Verify environment variables are set correctly

