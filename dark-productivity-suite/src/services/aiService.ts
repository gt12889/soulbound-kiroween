/**
 * AI Service for Ghost Writer suggestions
 * Handles API integration, debouncing, caching, and error handling
 */

interface SuggestionCache {
  context: string;
  suggestion: string;
  timestamp: number;
}

interface AIServiceConfig {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  debounceMs?: number;
  cacheExpiryMs?: number;
  maxRetries?: number;
}

class AIService {
  private config: Required<AIServiceConfig>;
  private cache: Map<string, SuggestionCache>;
  private debounceTimer: number | null;

  constructor(config: AIServiceConfig = {}) {
    this.config = {
      apiKey: config.apiKey || '',
      endpoint: config.endpoint || 'https://api.openai.com/v1/chat/completions',
      model: config.model || 'gpt-3.5-turbo',
      debounceMs: config.debounceMs || 1000,
      cacheExpiryMs: config.cacheExpiryMs || 300000, // 5 minutes
      maxRetries: config.maxRetries || 2,
    };
    this.cache = new Map();
    this.debounceTimer = null;
  }

  /**
   * Configure the AI service with API credentials
   */
  configure(config: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Generate a writing suggestion based on context
   * Implements debouncing to limit API calls
   */
  async getSuggestion(context: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Clear existing debounce timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // Check cache first
      const cached = this.getCachedSuggestion(context);
      if (cached) {
        resolve(cached);
        return;
      }

      // Debounce the API call
      this.debounceTimer = setTimeout(async () => {
        try {
          const suggestion = await this.fetchSuggestion(context);
          this.cacheSuggestion(context, suggestion);
          resolve(suggestion);
        } catch (error) {
          reject(error);
        }
      }, this.config.debounceMs);
    });
  }

  /**
   * Fetch suggestion from API with retry logic
   */
  private async fetchSuggestion(context: string, retryCount = 0): Promise<string> {
    // If no API key configured, use local fallback
    if (!this.config.apiKey) {
      return this.generateLocalSuggestion(context);
    }

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a creative writing assistant. Provide brief, atmospheric suggestions to continue the user\'s writing. Keep suggestions under 20 words and match the tone of the text. Be mysterious and evocative.',
            },
            {
              role: 'user',
              content: `Continue this text with a brief suggestion:\n\n${context}`,
            },
          ],
          max_tokens: 50,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const suggestion = data.choices?.[0]?.message?.content?.trim() || '';
      
      if (!suggestion) {
        throw new Error('Empty suggestion received from API');
      }

      return suggestion;
    } catch (error) {
      // Retry logic with exponential backoff
      if (retryCount < this.config.maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchSuggestion(context, retryCount + 1);
      }

      console.error('AI Service error:', error);
      // Fall back to local suggestions on error
      return this.generateLocalSuggestion(context);
    }
  }

  /**
   * Generate local suggestion when API is unavailable
   * Uses pattern-based suggestions for a fallback experience
   */
  private generateLocalSuggestion(context: string): string {
    const contextLower = context.toLowerCase();
    
    // Pattern-based suggestions
    const patterns = [
      { keywords: ['dark', 'shadow', 'night'], suggestions: ['as shadows lengthened across the floor', 'in the gathering darkness', 'while moonlight filtered through ancient windows'] },
      { keywords: ['write', 'writing', 'pen', 'ink'], suggestions: ['the words flowed like dark ink', 'each letter formed with deliberate care', 'as the quill scratched across parchment'] },
      { keywords: ['time', 'clock', 'hour'], suggestions: ['as the hours slipped away unnoticed', 'while time seemed to stand still', 'in that timeless moment'] },
      { keywords: ['think', 'thought', 'mind'], suggestions: ['thoughts drifted like wisps of smoke', 'the mind wandered to darker places', 'contemplating mysteries yet unsolved'] },
      { keywords: ['feel', 'felt', 'feeling'], suggestions: ['a chill ran down the spine', 'an inexplicable sense of unease', 'emotions swirled like autumn leaves'] },
    ];

    // Find matching pattern
    for (const pattern of patterns) {
      if (pattern.keywords.some(keyword => contextLower.includes(keyword))) {
        const randomIndex = Math.floor(Math.random() * pattern.suggestions.length);
        return pattern.suggestions[randomIndex];
      }
    }

    // Default atmospheric suggestions
    const defaultSuggestions = [
      'in the depths of the unknown',
      'as mysteries unfolded',
      'beneath the veil of twilight',
      'where secrets lay hidden',
      'in whispered tones',
      'through the mist of memory',
      'as fate would have it',
      'in the silence that followed',
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
   * Cache a suggestion
   */
  private cacheSuggestion(context: string, suggestion: string): void {
    this.cache.set(context, {
      context,
      suggestion,
      timestamp: Date.now(),
    });

    // Limit cache size
    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  /**
   * Clear the suggestion cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Cancel any pending debounced requests
   */
  cancelPending(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;
