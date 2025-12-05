# Einstein AI API - Hugging Face Flask Backend

A Flask API that uses Hugging Face models to generate Albert Einstein-style responses for the Ghost Archive feature.

## 🎯 Two Options

### Option 1: Inference API (Recommended - Faster, Less Memory)
Use `app_simple.py` - calls Hugging Face's hosted API (no model download)

### Option 2: Local Models
Use `app.py` - downloads and runs models locally (more control, slower startup)

**For Render.com free tier, we recommend Option 1 (app_simple.py)**

## Setup

### 1. Get Hugging Face API Key (FREE)

1. Go to https://huggingface.co/
2. Sign up for a free account
3. Go to Settings → Access Tokens
4. Create a new token with "Read" permissions
5. Copy the token

### 2. Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export HUGGINGFACE_API_KEY=your_token_here
export HUGGINGFACE_MODEL=microsoft/DialoGPT-medium  # Optional, defaults to this

# Run the server (choose one)

# Option 1: Simple Inference API (recommended)
python app_simple.py

# Option 2: Local models (slower, more memory)
python app.py
```

The API will run on `http://localhost:5000`

### 3. Deploy to Render.com (FREE)

1. **Create a new Web Service on Render:**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend/einstein_api` folder

2. **Configure Build Settings:**
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python app.py`

3. **Set Environment Variables:**
   - `HUGGINGFACE_API_KEY`: Your Hugging Face token
   - `HUGGINGFACE_MODEL`: (Optional) Model name, defaults to `microsoft/DialoGPT-medium`
   - `PORT`: (Auto-set by Render)

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (first time takes ~5-10 minutes to download model)

## API Endpoints

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### `POST /generate`
Generate Einstein-style response.

**Request Body:**
```json
{
  "question": "What is relativity?",
  "history": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Greetings!"}
  ],
  "max_length": 150,
  "temperature": 0.7
}
```

**Response:**
```json
{
  "response": "Relativity is a beautiful theory that shows us how space and time are intertwined...",
  "model": "microsoft/DialoGPT-medium"
}
```

## Model Options

You can use different Hugging Face models by setting `HUGGINGFACE_MODEL`:

- `microsoft/DialoGPT-medium` (Default) - Good for conversations
- `gpt2` - Smaller, faster fallback
- `microsoft/DialoGPT-large` - Better quality, slower
- Any other compatible text-generation model

## Frontend Integration

Update your frontend `.env` file:
```env
VITE_EINSTEIN_API_URL=https://your-app.onrender.com
```

## Cost

- **Hugging Face:** FREE (for most models)
- **Render.com:** FREE tier available (512MB RAM, 0.1 CPU)
- **Total Cost:** $0/month

## Troubleshooting

1. **Model loading slow:** First request takes time. Consider using a smaller model.
2. **Memory issues:** Use `gpt2` instead of larger models on free tier
3. **CORS errors:** Already handled with `flask-cors`
4. **Timeout:** Render free tier has 30s timeout - keep responses short

