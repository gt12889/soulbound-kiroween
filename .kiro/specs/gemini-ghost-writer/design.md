# Design Document: Gemini AI Integration for Ghost Writer

## Overview

This design outlines the integration of Google's Gemini AI as a third provider option for the Ghost Writer feature. The implementation will extend the existing AI Service architecture to support Gemini's API alongside OpenRouter and OpenAI, maintaining consistency in the user experience while leveraging Gemini's unique capabilities for creative text completion.

The design follows the existing pattern established in the codebase, ensuring minimal disruption to current functionality while adding robust support for Gemini's API format, authentication, and response handling.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Ghost Writer Component                  │
│  - Manages UI state and user interactions                   │
│  - Displays suggestions with mystical animations            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                       AI Service Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ OpenRouter  │  │   OpenAI    │  │   Gemini    │        │
│  │  Provider   │  │  Provider   │  │  Provider   │  ◄─ NEW│
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                              │
│  - Provider abstraction and routing                         │
│  - Request debouncing and caching                           │
│  - Error handling and retry logic                           │
│  - Fallback to local suggestions                            │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    External AI APIs                          │
│  - OpenRouter API                                            │
│  - OpenAI API                                                │
│  - Google Gemini API  ◄─ NEW                                │
└─────────────────────────────────────────────────────────────┘
```

### Provider Architecture Pattern

The AI Service uses a provider pattern where each AI service (OpenRouter, OpenAI, Gemini) has:
- Unique endpoint URL
- Provider-specific request format
- Provider-specific response parsing
- Provider-specific headers and authentication

## Components and Interfaces

### 1. AI Service Extension

**File**: `dark-productivity-suite/src/services/aiService.ts`

**Changes Required**:

```typescript
// Add Gemini to provider type union
type AIProvider = 'openai' | 'openrouter' | 'gemini';

// Add Gemini configuration to PROVIDER_DEFAULTS
const PROVIDER_DEFAULTS = {
  openrouter: { /* existing */ },
  openai: { /* existing */ },
  gemini: {
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    model: 'gemini-pro',
  },
} as const;

// Extend buildRequestHeaders() for Gemini
private buildRequestHeaders(): Record<string, string> {
  if (this.config.provider === 'gemini') {
    return {
      'Content-Type': 'application/json',
      // Gemini uses API key in URL query parameter, not header
    };
  }
  // ... existing logic
}

// Extend buildRequestBody() for Gemini format
private buildRequestBody(context: string): Record<string, unknown> {
  if (this.config.provider === 'gemini') {
    return {
      contents: [{
        parts: [{
          text: `You are a creative writing assistant. Provide brief, atmospheric suggestions to continue the user's writing. Keep suggestions under 20 words and match the tone of the text. Be mysterious and evocative.\n\nContinue this text with a brief suggestion:\n\n${context}`
        }]
      }],
      generationConfig: {
        temperature: SUGGESTION_TEMPERATURE,
        maxOutputTokens: MAX_SUGGESTION_TOKENS,
        topP: 0.8,
        topK: 40,
      },
    };
  }
  // ... existing logic
}

// Extend makeAPIRequest() for Gemini endpoint
private async makeAPIRequest(context: string): Promise<string> {
  const headers = this.buildRequestHeaders();
  const body = this.buildRequestBody(context);
  
  // Gemini uses API key as query parameter
  let endpoint = this.config.endpoint;
  if (this.config.provider === 'gemini') {
    endpoint = `${endpoint}?key=${this.config.apiKey}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  
  // Parse Gemini response format
  if (this.config.provider === 'gemini') {
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
  
  // ... existing logic for other providers
}
```

### 2. Environment Configuration

**File**: `dark-productivity-suite/.env.example`

**Changes Required**:

Add Gemini configuration variables:

```bash
# AI Service Configuration (Ghost Writer Feature)
# ... existing OpenRouter config ...

# Google Gemini API Key - Get from https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# AI Provider: 'openrouter' (default), 'openai', or 'gemini'
VITE_AI_PROVIDER=openrouter

# AI Model Selection
# ... existing models ...
# Google Gemini models:
#   - gemini-pro (default, balanced performance)
#   - gemini-pro-vision (multimodal, future enhancement)
VITE_AI_MODEL=nvidia/llama-3.1-nemotron-70b-instruct
```

### 3. Settings Modal Enhancement

**File**: `dark-productivity-suite/src/components/common/SettingsModal.tsx`

**Changes Required**:

Add Gemini to the AI provider selection dropdown:

```typescript
// Add to provider options
const aiProviders = [
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Google Gemini' }, // NEW
];

// Add validation warning for Gemini
{selectedProvider === 'gemini' && !import.meta.env.VITE_GEMINI_API_KEY && (
  <div className={styles.warning}>
    ⚠️ Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.
  </div>
)}
```

### 4. Ghost Writer Component

**File**: `dark-productivity-suite/src/components/ghost-writer/GhostWriter.tsx`

**Changes Required**:

Update initialization to support Gemini:

```typescript
useEffect(() => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 
                 import.meta.env.VITE_OPENROUTER_API_KEY || '';
  const provider = (import.meta.env.VITE_AI_PROVIDER || 'openrouter') as 'openai' | 'openrouter' | 'gemini';
  const model = import.meta.env.VITE_AI_MODEL || 
                (provider === 'gemini' ? 'gemini-pro' : 'nvidia/llama-3.1-nemotron-70b-instruct');

  aiService.configure({
    apiKey,
    provider,
    model,
  });
}, []);
```

## Data Models

### AIServiceConfig Interface Extension

```typescript
interface AIServiceConfig {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  provider?: 'openai' | 'openrouter' | 'gemini'; // Extended
  debounceMs?: number;
  cacheExpiryMs?: number;
  maxRetries?: number;
  refererUrl?: string; // Only used by OpenRouter
}
```

### Gemini API Request Format

```typescript
interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
    topP: number;
    topK: number;
  };
}
```

### Gemini API Response Format

```typescript
interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  promptFeedback?: {
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  };
}
```

## Error Handling

### Gemini-Specific Error Scenarios

1. **Invalid API Key**
   - Status: 400 Bad Request
   - Handling: Log error, fall back to local suggestions
   - User Message: "Gemini authentication failed. Using local suggestions."

2. **Rate Limiting**
   - Status: 429 Too Many Requests
   - Handling: Exponential backoff retry (up to 2 retries)
   - User Message: "Gemini rate limit reached. Please wait a moment."

3. **Content Safety Filters**
   - Response: `finishReason: "SAFETY"`
   - Handling: Fall back to local suggestions
   - User Message: None (seamless fallback)

4. **Model Not Found**
   - Status: 404 Not Found
   - Handling: Log error, fall back to local suggestions
   - User Message: "Gemini model unavailable. Using local suggestions."

5. **Network Timeout**
   - Timeout: 10 seconds
   - Handling: Cancel request, fall back to local suggestions
   - User Message: None (seamless fallback)

### Error Handling Flow

```
API Request
    │
    ├─ Success → Parse Response → Display Suggestion
    │
    ├─ 4xx/5xx Error → Log Error → Retry (up to 2 times)
    │                                  │
    │                                  ├─ Success → Display
    │                                  │
    │                                  └─ Failure → Local Fallback
    │
    └─ Network Error → Local Fallback
```

## Testing Strategy

### Unit Tests

1. **AI Service Gemini Provider Tests**
   - Test Gemini request format generation
   - Test Gemini response parsing
   - Test API key in URL query parameter
   - Test error handling for Gemini-specific errors
   - Test fallback to local suggestions

2. **Configuration Tests**
   - Test Gemini provider selection
   - Test environment variable loading
   - Test provider switching and cache clearing

### Integration Tests

1. **Ghost Writer with Gemini**
   - Test suggestion generation with Gemini
   - Test debouncing with Gemini provider
   - Test caching with Gemini responses
   - Test provider switching during runtime

2. **Settings Modal Integration**
   - Test Gemini selection in dropdown
   - Test warning display when API key missing
   - Test provider preference persistence

### Manual Testing Checklist

- [ ] Configure Gemini API key in .env
- [ ] Select Gemini in Settings Modal
- [ ] Type in Ghost Writer and verify suggestions appear
- [ ] Verify suggestions match mystical tone
- [ ] Test with missing API key (should show warning)
- [ ] Test with invalid API key (should fall back)
- [ ] Test rapid typing (debouncing)
- [ ] Test identical context (caching)
- [ ] Switch between providers
- [ ] Verify provider preference persists after reload

## Performance Considerations

### Gemini API Performance

- **Latency**: Gemini typically responds in 500-1500ms
- **Rate Limits**: 60 requests per minute (free tier)
- **Token Limits**: 30,000 tokens per minute
- **Context Window**: 30,720 tokens (much larger than needed)

### Optimization Strategies

1. **Debouncing**: 1000ms delay prevents excessive API calls
2. **Caching**: Identical context returns cached response
3. **Request Deduplication**: Multiple requests for same context share single API call
4. **Context Truncation**: Limit to last 1000 characters
5. **Token Limiting**: Max 50 tokens per suggestion

### Expected Performance Metrics

- Time to first suggestion: < 2 seconds
- Cache hit rate: > 30% for typical usage
- API calls per minute: < 10 for active typing
- Memory usage: < 5MB for cache

## Security Considerations

### API Key Management

- API keys stored in environment variables only
- Never exposed in client-side code or logs
- Validated before making requests
- Separate keys for development and production

### Content Safety

- Gemini includes built-in safety filters
- Responses blocked by safety filters fall back to local suggestions
- No user content stored on Gemini servers beyond request processing
- All requests use HTTPS encryption

### Rate Limiting Protection

- Client-side debouncing prevents abuse
- Exponential backoff on rate limit errors
- Graceful degradation to local suggestions
- No sensitive data in error messages

## Deployment Considerations

### Environment Setup

1. Obtain Gemini API key from Google AI Studio
2. Add `VITE_GEMINI_API_KEY` to `.env` file
3. Set `VITE_AI_PROVIDER=gemini` if desired as default
4. Rebuild application to include new environment variables

### Rollout Strategy

1. **Phase 1**: Deploy with Gemini as optional provider
2. **Phase 2**: Monitor error rates and performance
3. **Phase 3**: Gather user feedback on suggestion quality
4. **Phase 4**: Consider making Gemini default if performance is superior

### Monitoring

- Log Gemini API errors to console
- Track cache hit rates
- Monitor average response times
- Track fallback frequency

## Future Enhancements

### Potential Improvements

1. **Multimodal Support**: Use `gemini-pro-vision` for image-based writing prompts
2. **Streaming Responses**: Implement streaming for real-time suggestion updates
3. **Fine-tuning**: Custom model training for mystical writing style
4. **Context Enhancement**: Include previous suggestions in context
5. **User Feedback Loop**: Allow users to rate suggestions for quality improvement

### API Evolution

- Monitor Gemini API updates and new models
- Evaluate Gemini 1.5 Pro when available
- Consider Gemini Ultra for premium tier
- Explore function calling for structured outputs
