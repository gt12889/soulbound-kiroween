# 🧪 Testing Your Einstein API

## Quick Test Methods

### Method 1: Browser Test Page (Easiest)

1. **Open the test page:**
   - Open `test.html` in your browser
   - Or visit: `file:///path/to/backend/einstein_api/test.html`

2. **Enter your Render URL:**
   - Paste your Render service URL (e.g., `https://einstein-ai-api.onrender.com`)

3. **Click "Test Health"**
   - Should show: `{"status": "healthy"}`

4. **Click "Generate Response"**
   - Ask: "What is relativity?"
   - Wait 10-30 seconds (first request wakes the service)
   - Should get Einstein-style response!

---

### Method 2: Command Line (Python)

```bash
# Install requests if needed
pip install requests

# Test your Render URL
python test_api.py https://your-app.onrender.com
```

---

### Method 3: Browser Direct Test

**Health Check:**
```
https://your-app.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "model": "microsoft/DialoGPT-medium",
  "api_type": "inference_api"
}
```

**Generate Test:**
Open browser console (F12) and run:
```javascript
fetch('https://your-app.onrender.com/generate', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    question: "What is relativity?",
    history: [],
    max_length: 100
  })
})
.then(r => r.json())
.then(console.log)
```

---

### Method 4: Test from Frontend

1. **Update `.env`:**
   ```env
   VITE_EINSTEIN_API_URL=https://your-app.onrender.com
   ```

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Test in app:**
   - Open Ghost Archive
   - Connect to Albert Einstein
   - Ask: "What is relativity?"
   - Should get response!

---

## ✅ Success Indicators

- **Health endpoint** returns `{"status": "healthy"}`
- **Generate endpoint** returns Einstein-style text
- **No CORS errors** in browser console
- **Response time** 10-30 seconds (first request after sleep)

---

## ❌ Common Issues

### "Connection refused" or timeout
- Service might be sleeping (free tier)
- First request takes 30 seconds to wake up
- Wait and try again

### "Model loading" error
- First request downloads model
- Wait 1-2 minutes and retry
- Check Render logs for progress

### CORS errors
- Already handled in Flask with `flask-cors`
- If issues persist, check Render logs

### 500 Internal Server Error
- Check `HUGGINGFACE_API_KEY` is set in Render
- Verify token starts with `hf_`
- Check Render logs for details

---

## 📊 Expected Response Format

**Health:**
```json
{
  "status": "healthy",
  "model": "microsoft/DialoGPT-medium",
  "api_type": "inference_api"
}
```

**Generate:**
```json
{
  "response": "Relativity is a beautiful theory that shows us...",
  "model": "microsoft/DialoGPT-medium"
}
```

---

## 🎯 Test Questions

Try these to verify Einstein personality:

1. "What is relativity?"
2. "Explain E=mc²"
3. "What is your view on quantum mechanics?"
4. "Tell me about time and space"

---

**Once tests pass, your API is ready!** 🎉

