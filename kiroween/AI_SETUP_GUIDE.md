# AI Setup Guide - Ghost Writer Feature

## Quick Start (5 minutes)

The Ghost Writer feature needs an AI provider to generate writing suggestions. We recommend **Google Gemini** because it offers a generous free tier.

## New: Agent Hooks System

The Ghost Writer now supports **Agent Hooks** - automated AI assistance that triggers based on your actions. The Sentence Completion Assistant hook provides intelligent completions as you type, similar to GitHub Copilot but for creative writing.

### Sentence Completion Hook

Located at `.kiro/hooks/ghost-writer-hooks/sentence-completion.hook.json`, this hook:
- Triggers automatically as you type (after 2+ characters)
- Provides 1-3 contextual sentence completions
- Matches your writing style and tone
- Accepts completions with Tab or Arrow Right
- Dismisses with Escape

**Configuration:**
- **Model**: gemini-pro (configurable)
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 100 (short completions)
- **Debounce**: 300ms (responsive but not overwhelming)
- **Cache**: 5 minutes (performance optimization)

### Step 1: Get a Free Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### Step 2: Configure Your Project

1. In your project root, copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Open `.env` and add your API key:
   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   VITE_AI_PROVIDER=gemini
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

### Step 3: Test It Out

1. Navigate to the Ghost Writer section
2. Start typing some text
3. Click the "👻 Summon Ghost Writer" button (or press `Ctrl+G`)
4. Watch as the AI suggests a continuation of your writing!

## Alternative Providers

### OpenRouter (Multiple Models)

OpenRouter gives you access to many AI models through a single API:

1. Get API key: [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Configure in `.env`:
   ```env
   VITE_OPENROUTER_API_KEY=your_api_key_here
   VITE_AI_PROVIDER=openrouter
   VITE_AI_MODEL=nvidia/llama-3.1-nemotron-70b-instruct
   ```

**Popular Models:**
- `nvidia/llama-3.1-nemotron-70b-instruct` - High quality (default)
- `meta-llama/llama-3.1-70b-instruct` - Open source
- `anthropic/claude-3.5-sonnet` - Premium quality

### OpenAI (GPT Models)

If you have an OpenAI account:

1. Get API key: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Configure in `.env`:
   ```env
   VITE_OPENROUTER_API_KEY=your_openai_api_key_here
   VITE_AI_PROVIDER=openai
   VITE_AI_MODEL=gpt-3.5-turbo
   ```

**Available Models:**
- `gpt-3.5-turbo` - Fast and affordable
- `gpt-4` - Highest quality (more expensive)

## In-App Help

You can also access setup instructions directly in the app:

1. Click the Settings icon (⚙️) in the navigation bar
2. Go to the **AI** tab
3. View provider information with direct links to get API keys

## Troubleshooting

### "Failed to generate suggestion" Error

**Check your API key:**
- Make sure you copied the entire key without extra spaces
- Verify the key is active in your provider's dashboard
- Ensure you're using the correct environment variable name

**Check your .env file:**
- File must be named exactly `.env` (not `.env.txt`)
- Must be in the project root directory
- Restart the dev server after making changes

**Check provider status:**
- Gemini: [https://status.cloud.google.com/](https://status.cloud.google.com/)
- OpenRouter: [https://openrouter.ai/status](https://openrouter.ai/statu