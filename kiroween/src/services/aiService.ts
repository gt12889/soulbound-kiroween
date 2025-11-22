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
  alternatives?: string[]; // Multiple suggestions for the same context
  timestamp: number;
}

/**
 * State change callback type for AI service
 */
export type AIServiceState = 'loading' | 'ready' | 'error';

export type AIServiceStateCallback = (
  state: AIServiceState,
  error?: Error
) => void;

interface AIServiceConfig {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  provider?: 'openai' | 'openrouter' | 'gemini';
  debounceMs?: number;
  cacheExpiryMs?: number;
  maxRetries?: number;
  refererUrl?: string; // For OpenRouter, defaults to window.location.origin
  onStateChange?: AIServiceStateCallback; // Callback for state changes
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
  private config: Required<Omit<AIServiceConfig, 'onStateChange'>> & { onStateChange?: AIServiceStateCallback };
  private cache: Map<string, SuggestionCache>;
  private debounceTimer: ReturnType<typeof setTimeout> | null;
  private pendingRequests: Map<string, Promise<string>>;
  private abortController: AbortController | null;

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
      onStateChange: config.onStateChange,
    };
    this.cache = new Map();
    this.debounceTimer = null;
    this.pendingRequests = new Map();
    this.abortController = null;
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
    
    // Update config (handle onStateChange separately since it's optional)
    const { onStateChange, ...restConfig } = config;
    this.config = { 
      ...this.config, 
      ...restConfig as Required<Omit<AIServiceConfig, 'onStateChange'>>,
      onStateChange: onStateChange ?? this.config.onStateChange,
    };
    
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
   * @param count - Number of alternative suggestions to generate (1-3, default: 1)
   * @returns Promise resolving to the suggestion text
   * @throws Error if context is invalid or API fails after retries
   */
  async getSuggestion(context: string, count: number = 1): Promise<string> {
    // Validate input
    if (!context || typeof context !== 'string') {
      throw new Error('Invalid context: must be a non-empty string');
    }

    // Clamp count to valid range
    const requestCount = Math.max(1, Math.min(3, count));

    // Truncate context if too long to prevent excessive API costs
    const truncatedContext = context.slice(-MAX_CONTEXT_LENGTH);

    // Check cache first (synchronous)
    const cached = this.getCachedSuggestion(truncatedContext);
    if (cached) {
      // Emit ready state immediately for cached results
      this.emitStateChange('ready');
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
          // Emit loading state when request starts
          this.emitStateChange('loading');
          
          const suggestion = await this.fetchSuggestion(truncatedContext, requestCount);
          this.cacheSuggestion(truncatedContext, suggestion);
          this.pendingRequests.delete(truncatedContext);
          
          // Emit ready state when response received
          this.emitStateChange('ready');
          
          resolve(suggestion);
        } catch (error) {
          this.pendingRequests.delete(truncatedContext);
          
          // Emit error state on failures
          this.emitStateChange('error', error instanceof Error ? error : new Error(String(error)));
          
          reject(error);
        }
      }, this.config.debounceMs);
    });

    // Store pending request for deduplication
    this.pendingRequests.set(truncatedContext, requestPromise);
    
    return requestPromise;
  }

  /**
   * Generate multiple writing suggestions based on context
   * Returns an array of alternative suggestions
   * 
   * @param context - The text context to generate suggestions from
   * @param count - Number of alternatives to generate (2-3)
   * @returns Promise resolving to an array of suggestion texts
   * @throws Error if context is invalid or API fails after retries
   */
  async getSuggestions(context: string, count: number = 3): Promise<string[]> {
    // Validate input
    if (!context || typeof context !== 'string') {
      throw new Error('Invalid context: must be a non-empty string');
    }

    // Clamp count to valid range (2-3 alternatives)
    const requestCount = Math.max(2, Math.min(3, count));

    // Truncate context if too long to prevent excessive API costs
    const truncatedContext = context.slice(-MAX_CONTEXT_LENGTH);

    // Check cache first (synchronous)
    const cached = this.getCachedSuggestions(truncatedContext, requestCount);
    if (cached) {
      // Emit ready state immediately for cached results
      this.emitStateChange('ready');
      return cached;
    }

    // Check if there's already a pending request for this context (deduplication)
    const cacheKey = `${truncatedContext}:${requestCount}`;
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      // Return as array
      return [await pending];
    }

    // Create debounced request
    const requestPromise = new Promise<string[]>((resolve, reject) => {
      // Clear existing debounce timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // Debounce the API call
      this.debounceTimer = setTimeout(async () => {
        try {
          // Emit loading state when request starts
          this.emitStateChange('loading');
          
          const suggestions = await this.fetchSuggestions(truncatedContext, requestCount);
          this.cacheSuggestions(truncatedContext, suggestions);
          this.pendingRequests.delete(cacheKey);
          
          // Emit ready state when response received
          this.emitStateChange('ready');
          
          resolve(suggestions);
        } catch (error) {
          this.pendingRequests.delete(cacheKey);
          
          // Emit error state on failures
          this.emitStateChange('error', error instanceof Error ? error : new Error(String(error)));
          
          reject(error);
        }
      }, this.config.debounceMs);
    });

    // Store pending request for deduplication (store as single string promise for compatibility)
    this.pendingRequests.set(cacheKey, requestPromise.then(arr => arr[0]));
    
    return requestPromise;
  }

  /**
   * Fetch suggestion from API with retry logic
   * @private
   */
  private async fetchSuggestion(context: string, count: number = 1, retryCount = 0): Promise<string> {
    // If no API key configured, use local fallback
    if (!this.config.apiKey) {
      return this.generateLocalSuggestion(context);
    }

    try {
      const suggestion = await this.makeAPIRequest(context, count);
      
      if (!suggestion || suggestion.trim().length === 0) {
        throw new Error('Empty suggestion received from API');
      }

      return suggestion.trim();
    } catch (error) {
      // Retry logic with exponential backoff
      if (retryCount < this.config.maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        await this.delay(delay);
        return this.fetchSuggestion(context, count, retryCount + 1);
      }

      console.error('AI Service error after retries:', error);
      
      // Emit error state before falling back to local suggestions
      this.emitStateChange('error', error instanceof Error ? error : new Error(String(error)));
      
      // Fall back to local suggestions on error
      return this.generateLocalSuggestion(context);
    }
  }

  /**
   * Fetch multiple suggestions from API with retry logic
   * @private
   */
  private async fetchSuggestions(context: string, count: number, retryCount = 0): Promise<string[]> {
    // If no API key configured, use local fallback
    if (!this.config.apiKey) {
      return Array.from({ length: count }, () => this.generateLocalSuggestion(context));
    }

    try {
      const suggestions = await this.makeAPIRequestMultiple(context, count);
      
      if (!suggestions || suggestions.length === 0) {
        throw new Error('Empty suggestions received from API');
      }

      return suggestions.map(s => s.trim());
    } catch (error) {
      // Retry logic with exponential backoff
      if (retryCount < this.config.maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        await this.delay(delay);
        return this.fetchSuggestions(context, count, retryCount + 1);
      }

      console.error('AI Service error after retries:', error);
      
      // Emit error state before falling back to local suggestions
      this.emitStateChange('error', error instanceof Error ? error : new Error(String(error)));
      
      // Fall back to local suggestions on error
      return Array.from({ length: count }, () => this.generateLocalSuggestion(context));
    }
  }

  /**
   * Make the actual API request
   * Separated for better testability and maintainability
   * @private
   */
  private async makeAPIRequest(context: string, count: number = 1): Promise<string> {
    const headers = this.buildRequestHeaders();
    const body = this.buildRequestBody(context, count);

    // Create new AbortController for this request
    this.abortController = new AbortController();

    // Gemini uses API key in header and model in URL
    let endpoint = this.config.endpoint;
    if (this.config.provider === 'gemini') {
      // Build Gemini endpoint with the configured model
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent`;
    }

    console.log('[AI Service] Making request to:', this.config.provider);
    console.log('[AI Service] Endpoint:', endpoint.replace(this.config.apiKey, 'API_KEY_HIDDEN'));
    console.log('[AI Service] Request body:', JSON.stringify(body, null, 2));

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: this.abortController.signal,
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
    } catch (error) {
      // Handle abort errors specifically
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[AI Service] Request was cancelled');
        throw new Error('Request cancelled by user');
      }
      throw error;
    }
  }

  /**
   * Make API request for multiple suggestions
   * @private
   */
  private async makeAPIRequestMultiple(context: string, count: number): Promise<string[]> {
    const headers = this.buildRequestHeaders();
    const body = this.buildRequestBody(context, count);

    // Create new AbortController for this request
    this.abortController = new AbortController();

    // Gemini uses API key in header and model in URL
    let endpoint = this.config.endpoint;
    if (this.config.provider === 'gemini') {
      // Build Gemini endpoint with the configured model
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent`;
    }

    console.log('[AI Service] Making multiple suggestions request to:', this.config.provider);
    console.log('[AI Service] Endpoint:', endpoint.replace(this.config.apiKey, 'API_KEY_HIDDEN'));
    console.log('[AI Service] Request count:', count);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: this.abortController.signal,
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
      
      // Parse Gemini response format - Gemini returns multiple candidates
      if (this.config.provider === 'gemini') {
        const candidates = data.candidates || [];
        const results = candidates
          .slice(0, count)
          .map((candidate: any) => candidate?.content?.parts?.[0]?.text || '')
          .filter((text: string) => text.length > 0);
        
        console.log('[AI Service] Extracted Gemini results:', results);
        
        // If we got fewer results than requested, pad with the first result
        while (results.length < count && results.length > 0) {
          results.push(results[0]);
        }
        
        return results;
      }
      
      // OpenAI and OpenRouter - use n parameter to get multiple choices
      const choices = data.choices || [];
      const results = choices
        .slice(0, count)
        .map((choice: any) => choice?.message?.content || '')
        .filter((text: string) => text.length > 0);
      
      console.log('[AI Service] Extracted results:', results);
      
      // If we got fewer results than requested, pad with the first result
      while (results.length < count && results.length > 0) {
        results.push(results[0]);
      }
      
      return results;
    } catch (error) {
      // Handle abort errors specifically
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[AI Service] Request was cancelled');
        throw new Error('Request cancelled by user');
      }
      throw error;
    }
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
  private buildRequestBody(context: string, count: number = 1): Record<string, unknown> {
    // Gemini uses a different request format
    if (this.config.provider === 'gemini') {
      const prompt = `Analyze the tone of this text and continue it with exactly 5 sentences that match PERFECTLY.

TONE MATCHING (critical):
- Funny/Sarcastic → Keep the humor, wit, and sarcasm going, use natural vocabular
- Dark/Intense → Stay dark and intense
- Professional → Stay professional
- Casual → Stay casual and conversational
- Dramatic → Stay dramatic
- Technical → Stay technical

RULES:
- Match the exact voice, tense, and vocabulary
- If there's humor, be funny
- If there's sarcasm, be sarcastic
- Continue naturally - don't repeat or restart
- No explanations, just the continuation
- continue on top of the text, don't repeat it, if needed add punctuation to incomplete text
- to the best of ability, sound natural in tone, imitating a human with teh given context

Text:
${context}

Your continuation (5 sentences matching the tone):`;
      
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
          candidateCount: count, // Request multiple candidates for Gemini
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
          content: `You are a writing continuation assistant. Your job: analyze the text and continue it with exactly 5 sentences that match the EXACT tone, style, and intensity. If it's dark and intense, be dark and intense. If it's professional, be professional. Mirror the voice, tense, vocabulary, and pacing perfectly. Never tone down or change the style.`,
        },
        {
          role: 'user',
          content: `Continue this text with 5 sentences (match tone and intensity exactly):\n\n${context}`,
        },
      ],
      max_tokens: MAX_SUGGESTION_TOKENS,
      temperature: SUGGESTION_TEMPERATURE,
      n: count, // Request multiple completions for OpenAI/OpenRouter
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
   * Emit state change to callback if configured
   * @private
   */
  private emitStateChange(state: AIServiceState, error?: Error): void {
    if (this.config.onStateChange) {
      this.config.onStateChange(state, error);
    }
  }

  /**
   * Generate local suggestion when API is unavailable
   * Uses pattern-based suggestions with ghostly wit and humor
   */
  private generateLocalSuggestion(context: string): string {
    const contextLower = context.toLowerCase();
    
    // Pattern-based 5-sentence continuations with ghostly humor
    const patterns = [
      { 
        keywords: ['dark', 'shadow', 'night'], 
        suggestions: [
          'The shadows lengthened dramatically, as if auditioning for a role in a Gothic novel. I should know—I\'ve been haunting libraries long enough to recognize good atmosphere when I see it. The darkness crept forward with all the subtlety of a cat burglar wearing tap shoes. A chill settled over the room, though that might just be me passing through. Being dead does have its perks when it comes to setting the mood.',
          'Night descended with the enthusiasm of a theater curtain on opening night. The world transformed into my favorite color palette: various shades of "I can\'t see anything." Familiar shapes became menacing, which is hilarious considering I\'m literally a ghost and still find them spooky. Every sound echoed with supernatural significance, or maybe just good acoustics. Either way, this is my kind of ambiance.',
        ]
      },
      { 
        keywords: ['write', 'writing', 'pen', 'ink'], 
        suggestions: [
          'The words flowed across the page like ink with a mind of its own—trust me, I\'ve seen stranger things in this study. The pen scratched rhythmically, a sound I\'ve been listening to for two centuries and still find oddly soothing. Ideas crystallized faster than you can say "ectoplasm," which is a word I use more often than you\'d think. The story took on a life of its own, unlike yours truly. There was no stopping now, much like my eternal existence in this dusty old room.',
          'Writing became a meditation, though I prefer "séance with yourself" as a term. Each letter formed with the care of a ghost trying not to knock over the inkwell—again. The blank page transformed into possibility, much like how I transformed into a transparent nuisance. Hours passed unnoticed, which is basically my entire afterlife in a nutshell. This was where true magic happened, and I\'m not just saying that because I\'m literally supernatural.',
        ]
      },
      { 
        keywords: ['time', 'clock', 'hour'], 
        suggestions: [
          'Time seemed to slow, which is rich coming from someone who\'s been dead since 1823. The clock on the wall ticked with maddening regularity, mocking my timeless existence. Minutes blurred together like pages in a water-damaged manuscript—I\'ve seen plenty of those. Reality felt fluid, much like my current corporeal state. The present moment was all that existed, though I\'ve been stuck in it for quite a while now.',
          'Hours slipped away unnoticed, consumed by focus deeper than my grave. The passage of time became irrelevant, a luxury of the living that I no longer enjoy—or suffer from, depending on your perspective. Day turned to night and back again, like a cosmic game of peek-a-boo. The world outside marched forward relentlessly, while I remained here, alphabetizing the same dusty books. But here, in this space, time stood still—just like me, really.',
        ]
      },
      { 
        keywords: ['book', 'read', 'page', 'library'], 
        suggestions: [
          'The book\'s pages whispered secrets only the dead could truly appreciate—and boy, do I have stories. Dust motes danced in the lamplight like tiny ghosts, though they\'re amateurs compared to me. Each word carried weight, unlike my spectral form which weighs precisely nothing. The leather binding creaked with age, a sound I find oddly relatable these days. Knowledge accumulated here like cobwebs in corners, and I should know—I\'ve watched both grow for centuries.',
          'Reading became an obsession, which is convenient when you\'re trapped in a study for eternity. The pages turned themselves—okay fine, that was me, showing off my poltergeist skills. Ancient wisdom flowed from yellowed paper, much like how I flow through walls. The library held secrets darker than my sense of humor, and that\'s saying something. This collection had witnessed more drama than a Victorian novel, and I\'d been there for most of it.',
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

    // Default witty ghostly 5-sentence continuations
    const defaultSuggestions = [
      'The atmosphere shifted subtly, like when someone walks through me—always awkward. Something fundamental had changed, though change is relative when you\'ve been dead for two hundred years. A sense of anticipation hung in the air like morning mist, or possibly just me being dramatic. The ordinary became extraordinary, which is my specialty as a supernatural being. Everything that followed would be different, unlike my daily routine of haunting this study.',
      'Mysteries unfolded slowly, much like my understanding of modern technology—still working on that one. Each discovery led to more questions, which is basically the story of my afterlife. The truth remained elusive, dancing just beyond reach like that one book I can never quite materialize. Patience would be required, and I\'ve got nothing but time—literally, an eternity of it. The journey had only just begun, though mine started in 1823 and shows no signs of ending.',
      'Silence descended like a heavy blanket, the kind I wish I could still feel. In that quietness, thoughts became clearer than my transparent form. The mind wandered to places long forgotten, much like how people forget I\'m still here watching them. Memories surfaced unbidden, demanding attention like a poltergeist at a dinner party. The past and present merged into one, which is basically my entire existence in a nutshell.',
      'A strange feeling took hold, though "strange" is relative when you\'re a ghost in a study. It was neither pleasant nor unpleasant, just there—like me, really. The sensation grew stronger with each passing moment, unlike my ability to interact with physical objects. Resistance seemed futile, a lesson I learned when I tried to prevent my own death. Acceptance was the only path forward, though I\'m still working on accepting my eternal book-sorting duties.',
      'The world transformed before watchful eyes—and trust me, I\'ve been watching for centuries. Familiar landmarks took on alien qualities, much like how quill pens became ballpoint pens became computers. Perception shifted, revealing hidden depths I hadn\'t noticed in my first two hundred years here. Nothing would ever look quite the same again, except this study which looks exactly the same. This was a moment of awakening, though I\'m still waiting for mine to end.',
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
   * Check cache for recent suggestions (multiple alternatives)
   */
  private getCachedSuggestions(context: string, count: number): string[] | null {
    const cached = this.cache.get(context);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.config.cacheExpiryMs) {
      this.cache.delete(context);
      return null;
    }

    // Return alternatives if available and count matches
    if (cached.alternatives && cached.alternatives.length >= count) {
      return cached.alternatives.slice(0, count);
    }

    return null;
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
   * Cache multiple suggestions with LRU eviction
   * @private
   */
  private cacheSuggestions(context: string, suggestions: string[]): void {
    // Clean expired entries before adding new one
    this.cleanExpiredCache();

    this.cache.set(context, {
      context,
      suggestion: suggestions[0], // Store first as primary
      alternatives: suggestions,
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
    
    // Abort any in-flight requests
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
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

  /**
   * Select a specific suggestion from cached alternatives
   * Useful for navigating between multiple suggestions
   * 
   * @param context - The context used to generate suggestions
   * @param index - The index of the suggestion to select (0-based)
   * @returns The selected suggestion or null if not found
   */
  selectSuggestion(context: string, index: number): string | null {
    const truncatedContext = context.slice(-MAX_CONTEXT_LENGTH);
    const cached = this.cache.get(truncatedContext);
    
    if (!cached || !cached.alternatives) {
      return null;
    }

    // Validate index
    if (index < 0 || index >= cached.alternatives.length) {
      return null;
    }

    return cached.alternatives[index];
  }

  /**
   * Get all cached alternatives for a context
   * 
   * @param context - The context used to generate suggestions
   * @returns Array of all cached suggestions or null if not found
   */
  getAlternatives(context: string): string[] | null {
    const truncatedContext = context.slice(-MAX_CONTEXT_LENGTH);
    const cached = this.cache.get(truncatedContext);
    
    if (!cached || !cached.alternatives) {
      return null;
    }

    return [...cached.alternatives]; // Return a copy to prevent mutation
  }

  /**
   * Get the count of available alternatives for a context
   * 
   * @param context - The context used to generate suggestions
   * @returns Number of available alternatives or 0 if none
   */
  getAlternativesCount(context: string): number {
    const alternatives = this.getAlternatives(context);
    return alternatives ? alternatives.length : 0;
  }
}

// Export singleton instance
export const aiService = new AIService();



/**
 * Ghost Writer Hook Functions
 * Extended AI service functions for the three agent hooks
 */

/**
 * Generate sentence completions for typing hook
 */
export const generateCompletion = async (currentSentence: string, previousContext: string): Promise<string[]> => {
  const prompt = `Complete this sentence naturally, matching the EXACT tone and style of the text.

Previous context: ${previousContext}

Current sentence: ${currentSentence}

Analyze the tone (professional, casual, creative, technical, academic, etc.) and provide 3 natural completions that seamlessly continue in the same style. Return as JSON array of strings.`;

  try {
    const response = await aiService.getSuggestion(prompt + previousContext);
    
    // Try to parse as JSON array, fallback to single suggestion
    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : [response];
    } catch {
      return [response];
    }
  } catch (error) {
    console.error('Completion generation failed:', error);
    return [];
  }
};

/**
 * Generate creative inspirations for pause hook
 */
export const generateInspiration = async (fullText: string): Promise<string[]> => {
  const prompt = `Analyze this text and provide 5 contextually appropriate suggestions for continuing or developing it.

${fullText.slice(-1000)} 

Based on the genre, tone, and style above, provide 5 suggestions that fit the context:
- If it's creative fiction: plot twists, character moments, thematic elements
- If it's professional writing: key points, arguments, examples
- If it's technical: implementation details, edge cases, optimizations
- If it's academic: analysis, evidence, counterarguments

Format each as: **[Type]**: Brief, relevant suggestion`;

  try {
    const response = await aiService.getSuggestion(prompt + fullText.slice(-500));
    
    // Split by lines and filter empty
    const suggestions = response.split('\n').filter((line: string) => line.trim().length > 0);
    return suggestions.length > 0 ? suggestions : [response];
  } catch (error) {
    console.error('Inspiration generation failed:', error);
    return [];
  }
};

/**
 * Analyze tone and style for button click hook
 */
export const analyzeTone = async (fullText: string): Promise<{
  tone: string;
  style: string;
  pacing: string;
  voice: string;
  clarity: number;
  engagement: number;
  suggestions: string[];
  examples: string[];
}> => {
  const prompt = `Analyze this writing objectively and provide constructive feedback:

${fullText}

First, identify the genre/type (creative fiction, professional, technical, academic, casual, etc.).

Then provide detailed analysis covering:
- Tone (emotional quality and appropriateness for the genre)
- Style (writing characteristics)
- Pacing (flow and rhythm)
- Voice (perspective and consistency)
- Clarity (1-10 score - how clear and understandable)
- Engagement (1-10 score - how compelling for its intended purpose)
- 3-5 specific, actionable improvement suggestions appropriate for this type of writing
- 2-3 concrete example improvements

Be constructive, specific, and respect the writer's chosen genre and style.`;

  try {
    const response = await aiService.getSuggestion(prompt + '');
    
    // Parse structured response
    const lines = response.split('\n');
    const analysis = {
      tone: extractField(lines, 'tone') || 'Neutral',
      style: extractField(lines, 'style') || 'Descriptive',
      pacing: extractField(lines, 'pacing') || 'Moderate',
      voice: extractField(lines, 'voice') || 'Third person',
      clarity: extractScore(lines, 'clarity') || 7,
      engagement: extractScore(lines, 'engagement') || 7,
      suggestions: extractList(lines, 'suggestion') || ['Continue developing your unique voice'],
      examples: extractList(lines, 'example') || [],
    };
    
    return analysis;
  } catch (error) {
    console.error('Tone analysis failed:', error);
    return {
      tone: 'Unable to analyze',
      style: 'Unable to analyze',
      pacing: 'Unable to analyze',
      voice: 'Unable to analyze',
      clarity: 5,
      engagement: 5,
      suggestions: ['Analysis failed. Please try again.'],
      examples: [],
    };
  }
};

/**
 * Helper: Extract field from response lines
 */
function extractField(lines: string[], fieldName: string): string | null {
  const line = lines.find((l: string) => l.toLowerCase().includes(fieldName.toLowerCase()));
  if (!line) return null;
  
  const parts = line.split(':');
  return parts.length > 1 ? parts.slice(1).join(':').trim() : null;
}

/**
 * Helper: Extract numeric score from response
 */
function extractScore(lines: string[], fieldName: string): number | null {
  const line = lines.find((l: string) => l.toLowerCase().includes(fieldName.toLowerCase()));
  if (!line) return null;
  
  const match = line.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Helper: Extract list items from response
 */
function extractList(lines: string[], keyword: string): string[] {
  const items: string[] = [];
  let inList = false;
  
  for (const line of lines) {
    if (line.toLowerCase().includes(keyword.toLowerCase())) {
      inList = true;
      const parts = line.split(':');
      if (parts.length > 1) {
        items.push(parts.slice(1).join(':').trim());
      }
    } else if (inList && (line.startsWith('-') || line.startsWith('•') || /^\d+\./.test(line))) {
      items.push(line.replace(/^[-•\d.]\s*/, '').trim());
    } else if (inList && line.trim() === '') {
      break;
    }
  }
  
  return items;
}
