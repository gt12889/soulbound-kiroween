/**
 * AI Service for Ghost Writer suggestions
 * Handles API integration, debouncing, caching, and error handling
 */

// Constants
const DEFAULT_DEBOUNCE_MS = 1000;
const DEFAULT_CACHE_EXPIRY_MS = 300000; // 5 minutes
const DEFAULT_MAX_RETRIES = 2;
const MAX_CACHE_SIZE = 50;
const MAX_SUGGESTION_TOKENS = 500; // Increased for 5 sentences with thinking models
const SUGGESTION_TEMPERATURE = 0.8;
const MAX_CONTEXT_LENGTH = 1000; // Prevent excessive API costs

interface SuggestionCache {
  context: string;
  suggestion: string;
  timestamp: number;
}

interface AIServiceConfig {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  provider?: 'openai' | 'openrouter' | 'gemini';
  debounceMs?: number;
  cacheExpiryMs?: number;
  maxRetries?: number;
  refererUrl?: string; // For OpenRouter, defaults to window.location.origin
}

/**
 * Provider-specific configuration
 */
const PROVIDER_DEFAULTS = {
  openrouter: {
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'nvidia/llama-3.1-nemotron-70b-instruct',
  },
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
  },
  gemini: {
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    model: 'gemini-2.5-flash',
  },
} as const;

class AIService {
  private config: Required<AIServiceConfig>;
  private cache: Map<string, SuggestionCache>;
  private debounceTimer: ReturnType<typeof setTimeout> | null;
  private pendingRequests: Map<string, Promise<string>>;

  constructor(config: AIServiceConfig = {}) {
    const provider = config.provider || 'openrouter';
    const defaults = PROVIDER_DEFAULTS[provider];

    this.config = {
      apiKey: config.apiKey || '',
      endpoint: config.endpoint || defaults.endpoint,
      model: config.model || defaults.model,
      provider,
      debounceMs: config.debounceMs ?? DEFAULT_DEBOUNCE_MS,
      cacheExpiryMs: config.cacheExpiryMs ?? DEFAULT_CACHE_EXPIRY_MS,
      maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
      refererUrl: config.refererUrl || (typeof window !== 'undefined' ? window.location.origin : ''),
    };
    this.cache = new Map();
    this.debounceTimer = null;
    this.pendingRequests = new Map();
  }

  /**
   * Configure the AI service with API credentials
   * Note: Changing provider after initialization may cause inconsistent state
   */
  configure(config: Partial<AIServiceConfig>): void {
    // If provider is changing, update endpoint and model defaults
    if (config.provider && config.provider !== this.config.provider) {
      const defaults = PROVIDER_DEFAULTS[config.provider];
      this.config.endpoint = defaults.endpoint;
      if (!config.model) {
        this.config.model = defaults.model;
      }
    }
    
    // Update config
    this.config = { ...this.config, ...config as Required<AIServiceConfig> };
    
    console.log('[AI Service] Configured with provider:', this.config.provider);
    console.log('[AI Service] API key present:', !!this.config.apiKey);
    console.log('[AI Service] Model:', this.config.model);
    console.log('[AI Service] Endpoint:', this.config.endpoint);
    
    // Clear cache when configuration changes significantly
    if (config.provider || config.model || config.apiKey) {
      this.clearCache();
    }
  }

  /**
   * Generate a writing suggestion based on context
   * Implements debouncing to limit API calls and request deduplication
   * 
   * @param context - The text context to generate suggestions from
   * @returns Promise resolving to the suggestion text
   * @throws Error if context is invalid or API fails after retries
   */
  async getSuggestion(context: string): Promise<string> {
    // Validate input
    if (!context || typeof context !== 'string') {
      throw new Error('Invalid context: must be a non-empty string');
    }

    // Truncate context if too long to prevent excessive API costs
    const truncatedContext = context.slice(-MAX_CONTEXT_LENGTH);

    // Check cache first (synchronous)
    const cached = this.getCachedSuggestion(truncatedContext);
    if (cached) {
      return cached;
    }

    // Check if there's already a pending request for this context (deduplication)
    const pending = this.pendingRequests.get(truncatedContext);
    if (pending) {
      return pending;
    }

    // Create debounced request
    const requestPromise = new Promise<string>((resolve, reject) => {
      // Clear existing debounce timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // Debounce the API call
      this.debounceTimer = setTimeout(async () => {
        try {
          const suggestion = await this.fetchSuggestion(truncatedContext);
          this.cacheSuggestion(truncatedContext, suggestion);
          this.pendingRequests.delete(truncatedContext);
          resolve(suggestion);
        } catch (error) {
          this.pendingRequests.delete(truncatedContext);
          reject(error);
        }
      }, this.config.debounceMs);
    });

    // Store pending request for deduplication
    this.pendingRequests.set(truncatedContext, requestPromise);
    
    return requestPromise;
  }

  /**
   * Fetch suggestion from API with retry logic
   * @private
   */
  private async fetchSuggestion(context: string, retryCount = 0): Promise<string> {
    // If no API key configured, use local fallback
    if (!this.config.apiKey) {
      return this.generateLocalSuggestion(context);
    }

    try {
      const suggestion = await this.makeAPIRequest(context);
      
      if (!suggestion || suggestion.trim().length === 0) {
        throw new Error('Empty suggestion received from API');
      }

      return suggestion.trim();
    } catch (error) {
      // Retry logic with exponential backoff
      if (retryCount < this.config.maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        await this.delay(delay);
        return this.fetchSuggestion(context, retryCount + 1);
      }

      console.error('AI Service error after retries:', error);
      // Fall back to local suggestions on error
      return this.generateLocalSuggestion(context);
    }
  }

  /**
   * Make the actual API request
   * Separated for better testability and maintainability
   * @private
   */
  private async makeAPIRequest(context: string): Promise<string> {
    const headers = this.buildRequestHeaders();
    const body = this.buildRequestBody(context);

    // Gemini uses API key in header and model in URL
    let endpoint = this.config.endpoint;
    if (this.config.provider === 'gemini') {
      // Build Gemini endpoint with the configured model
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent`;
    }

    console.log('[AI Service] Making request to:', this.config.provider);
    console.log('[AI Service] Endpoint:', endpoint.replace(this.config.apiKey, 'API_KEY_HIDDEN'));
    console.log('[AI Service] Request body:', JSON.stringify(body, null, 2));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    console.log('[AI Service] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('[AI Service] Error response:', errorText);
      
      // Try to parse error as JSON for better error messages
      try {
        const errorData = JSON.parse(errorText);
        const errorMessage = errorData.error?.message || errorData.message || errorText;
        throw new Error(`API request failed (${response.status}): ${errorMessage}`);
      } catch {
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('[AI Service] Response data:', JSON.stringify(data, null, 2));
    
    // Parse Gemini response format
    if (this.config.provider === 'gemini') {
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('[AI Service] Extracted Gemini result:', result);
      return result;
    }
    
    // OpenAI and OpenRouter use the same response format
    const result = data.choices?.[0]?.message?.content || '';
    console.log('[AI Service] Extracted result:', result);
    return result;
  }

  /**
   * Build request headers based on provider
   * @private
   */
  private buildRequestHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Gemini uses x-goog-api-key header
    if (this.config.provider === 'gemini') {
      headers['x-goog-api-key'] = this.config.apiKey;
    } else {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    // Add provider-specific headers
    if (this.config.provider === 'openrouter' && this.config.refererUrl) {
      headers['HTTP-Referer'] = this.config.refererUrl;
      headers['X-Title'] = 'Dark Productivity Suite - Ghost Writer';
    }

    return headers;
  }

  /**
   * Build request body for API call
   * @private
   */
  private buildRequestBody(context: string): Record<string, unknown> {
    // Gemini uses a different request format
    if (this.config.provider === 'gemini') {
      const prompt = `Analyze the following text and continue it with exactly 5 sentences. Match the exact tone, style, subject matter, and writing style of the original text. Do not introduce new themes or change the subject. If the input was not a full sentnce, complete the sentence first or add punctuation to make it correct.DO NOT REPEAT WHAT THE ORGINAL INPUT WAS, Simply continue what has been started in a natural, coherent way.\n\nText to continue:\n\n${context}\n\nYour continuation (5 sentences):`;
      
      return {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: SUGGESTION_TEMPERATURE,
          maxOutputTokens: MAX_SUGGESTION_TOKENS,
          topP: 0.8,
          topK: 40,
          // Disable thinking for faster, more predictable responses
          thinkingConfig: {
            thinkingBudget: 0
          }
        },
      };
    }

    // OpenAI and OpenRouter use the same format
    return {
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: 'You are a writing assistant. Analyze the user\'s text and continue it with exactly 5 sentences. Match the exact tone, style, subject matter, and writing style of the original text. Do not introduce new themes or change the subject. Simply continue what has been started in a natural, coherent way.',
        },
        {
          role: 'user',
          content: `Continue this text with 5 sentences:\n\n${context}`,
        },
      ],
      max_tokens: MAX_SUGGESTION_TOKENS,
      temperature: SUGGESTION_TEMPERATURE,
    };
  }

  /**
   * Utility method for delays (useful for testing)
   * @private
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate local suggestion when API is unavailable
   * Uses pattern-based suggestions for a fallback experience
   */
  private generateLocalSuggestion(context: string): string {
    const contextLower = context.toLowerCase();
    
    // Pattern-based 5-sentence continuations
    const patterns = [
      { 
        keywords: ['dark', 'shadow', 'night'], 
        suggestions: [
          'The shadows lengthened across the floor, creeping toward the corners like living things. Darkness gathered in the spaces between, thick and palpable. A chill settled over the room, raising goosebumps on exposed skin. The air grew heavy with anticipation. Something was about to change.',
          'Night descended with unusual swiftness, swallowing the last rays of sunlight. The world transformed into shades of gray and black. Familiar shapes became strange and menacing in the gloom. Every sound seemed amplified in the darkness. Fear began to take root in the heart.',
        ]
      },
      { 
        keywords: ['write', 'writing', 'pen', 'ink'], 
        suggestions: [
          'The words flowed like dark ink across the page, each one carefully chosen. The pen scratched rhythmically, a comforting sound in the silence. Ideas crystallized into sentences, then paragraphs. The story took on a life of its own. There was no stopping now.',
          'Writing became a meditation, a way to escape the mundane world. Each letter formed with deliberate care, building toward something greater. The blank page transformed into a canvas of possibility. Hours passed unnoticed in the creative flow. This was where true magic happened.',
        ]
      },
      { 
        keywords: ['time', 'clock', 'hour'], 
        suggestions: [
          'Time seemed to slow, each second stretching into eternity. The clock on the wall ticked with maddening regularity. Minutes blurred together, indistinguishable from one another. Reality felt fluid, uncertain. The present moment was all that existed.',
          'Hours slipped away unnoticed, consumed by deep focus. The passage of time became irrelevant, meaningless. Day turned to night, then back to day again. The world outside continued its relentless march forward. But here, in this space, time stood still.',
        ]
      },
    ];

    // Find matching pattern
    for (const pattern of patterns) {
      if (pattern.keywords.some(keyword => contextLower.includes(keyword))) {
        const randomIndex = Math.floor(Math.random() * pattern.suggestions.length);
        return pattern.suggestions[randomIndex];
      }
    }

    // Default atmospheric 5-sentence continuations
    const defaultSuggestions = [
      'The atmosphere shifted subtly, almost imperceptibly at first. Something fundamental had changed in the fabric of reality. A sense of anticipation hung in the air like morning mist. The ordinary became extraordinary in that moment. Everything that followed would be different.',
      'Mysteries unfolded slowly, revealing themselves layer by layer. Each discovery led to more questions than answers. The truth remained elusive, dancing just beyond reach. Patience would be required to understand it all. The journey had only just begun.',
      'Silence descended like a heavy blanket, muffling all sound. In that quietness, thoughts became clearer, sharper. The mind wandered to places long forgotten. Memories surfaced unbidden, demanding attention. The past and present merged into one.',
      'A strange feeling took hold, impossible to name or describe. It was neither pleasant nor unpleasant, simply there. The sensation grew stronger with each passing moment. Resistance seemed futile, even foolish. Acceptance was the only path forward.',
      'The world transformed before watchful eyes, becoming something new. Familiar landmarks took on alien qualities in the changing light. Perception shifted, revealing hidden depths and meanings. Nothing would ever look quite the same again. This was a moment of awakening.',
    ];

    const randomIndex = Math.floor(Math.random() * defaultSuggestions.length);
    return defaultSuggestions[randomIndex];
  }

  /**
   * Check cache for recent suggestion
   */
  private getCachedSuggestion(context: string): string | null {
    const cached = this.cache.get(context);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.config.cacheExpiryMs) {
      this.cache.delete(context);
      return null;
    }

    return cached.suggestion;
  }

  /**
   * Cache a suggestion with LRU eviction
   * @private
   */
  private cacheSuggestion(context: string, suggestion: string): void {
    // Clean expired entries before adding new one
    this.cleanExpiredCache();

    this.cache.set(context, {
      context,
      suggestion,
      timestamp: Date.now(),
    });

    // Limit cache size with LRU eviction
    if (this.cache.size > MAX_CACHE_SIZE) {
      // Delete oldest entry (first key in Map maintains insertion order)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  /**
   * Clean expired cache entries
   * @private
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.config.cacheExpiryMs) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear the suggestion cache
   * Useful when changing configuration or for testing
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Cancel any pending debounced requests
   * Should be called on component unmount to prevent memory leaks
   */
  cancelPending(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    // Clear pending requests map
    this.pendingRequests.clear();
  }

  /**
   * Get cache statistics for monitoring
   * Useful for debugging and performance optimization
   */
  getCacheStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: MAX_CACHE_SIZE,
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;
