# OpenRouter AI Setup Guide

This guide explains how to set up OpenRouter with NVIDIA AI models for the Ghost Writer feature.

## What is OpenRouter?

OpenRouter is a unified API that provides access to multiple AI models including NVIDIA, Anthropic, Meta, and more. It offers:

- **Single API Key**: Access multiple AI providers with one key
- **Pay-as-you-go**: Only pay for what you use
- **NVIDIA Models**: Access to powerful NVIDIA Nemotron models
- **Fallback Options**: Automatically switch between models if one is unavailable

## Setup Steps

### 1. Create an OpenRouter Account

1. Visit [https://openrouter.ai](https://openrouter.ai)
2. Click "Sign Up" and create an account
3. Verify your email address

### 2. Get Your API Key

1. Log in to OpenRouter
2. Navigate to [https://openrouter.ai/keys](https://openrouter.ai/keys)
3. Click "Create Key"
4. Give your key a name (e.g., "Dark Productivity Suite")
5. Copy the generated API key

### 3. Add Credits (Optional)

OpenRouter offers free credits for testing:
- New accounts get $1 in free credits
- NVIDIA models are very affordable (~$0.001 per request)
- Add more credits at [https://openrouter.ai/credits](https://openrouter.ai/credits)

### 4. Configure Your Application

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your OpenRouter API key to `.env`:
   ```env
   VITE_OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
   ```

3. (Optional) Configure the AI provider and model:
   ```env
   VITE_AI_PROVIDER=openrouter
   VITE_AI_MODEL=nvidia/llama-3.1-nemotron-70b-instruct
   ```

### 5. Restart Your Development Server

```bash
npm run dev
```

## Available NVIDIA Models

### Recommended Models

1. **nvidia/llama-3.1-nemotron-70b-instruct** (Default)
   - Best quality for creative writing
   - Cost: ~$0.001 per request
   - Context: 128K tokens

2. **nvidia/llama-3.1-nemotron-51b-instruct**
   - Faster responses
   - Good quality
   - Cost: ~$0.0008 per request
   - Context: 128K tokens

### Alternative Models

If you want to try other providers through OpenRouter:

- **anthropic/claude-3.5-sonnet**: Premium quality, higher cost
- **meta-llama/llama-3.1-70b-instruct**: Open source alternative
- **google/gemini-pro**: Google's model
- **openai/gpt-3.5-turbo**: OpenAI's model

To use a different model, update your `.env`:
```env
VITE_AI_MODEL=anthropic/claude-3.5-sonnet
```

## Testing the Integration

1. Navigate to the Ghost Writer feature in your app
2. Start typing in the editor
3. After a brief pause, you should see AI-generated suggestions appear
4. Press Tab to accept a suggestion

## Troubleshooting

### No Suggestions Appearing

1. **Check API Key**: Ensure your API key is correctly set in `.env`
2. **Check Credits**: Verify you have credits at [https://openrouter.ai/credits](https://openrouter.ai/credits)
3. **Check Console**: Open browser DevTools and look for error messages
4. **Restart Server**: Stop and restart your development server

### Fallback Mode

If the API is unavailable or not configured, the app will use local pattern-based suggestions. These are simpler but don't require an API key.

### Rate Limits

OpenRouter has generous rate limits:
- Free tier: 200 requests per minute
- Paid tier: Higher limits available

## Cost Estimation

For typical usage:
- **Light use** (10 suggestions/day): ~$0.01/month
- **Moderate use** (100 suggestions/day): ~$0.10/month
- **Heavy use** (1000 suggestions/day): ~$1.00/month

NVIDIA models are very cost-effective for this use case.

## Security Best Practices

1. **Never commit `.env`**: The `.env` file is in `.gitignore`
2. **Use environment variables**: Always use `VITE_` prefix for client-side variables
3. **Rotate keys**: Periodically rotate your API keys
4. **Monitor usage**: Check your OpenRouter dashboard regularly

## Additional Resources

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [OpenRouter Models](https://openrouter.ai/models)
- [NVIDIA AI Models](https://openrouter.ai/models?q=nvidia)
- [Pricing Calculator](https://openrouter.ai/models)

## Support

If you encounter issues:
1. Check the [OpenRouter Discord](https://discord.gg/openrouter)
2. Review the [OpenRouter Status Page](https://status.openrouter.ai)
3. Contact OpenRouter support at support@openrouter.ai
