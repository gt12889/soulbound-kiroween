/**
 * Hugging Face Einstein Service
 * Connects to Flask backend API for Albert Einstein personality
 */

interface EinsteinRequest {
  question: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  max_length?: number;
  temperature?: number;
}

interface EinsteinResponse {
  response: string;
  model: string;
}

class HuggingFaceEinsteinService {
  private apiUrl: string;
  private initialized = false;

  constructor() {
    // Get API URL from environment or use default
    this.apiUrl = import.meta.env.VITE_EINSTEIN_API_URL || 'http://localhost:5000';
    
    // Remove trailing slash
    this.apiUrl = this.apiUrl.replace(/\/$/, '');
  }

  /**
   * Check if the service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.status === 'healthy';
      }
      return false;
    } catch (error) {
      console.warn('[Einstein API] Health check failed:', error);
      return false;
    }
  }

  /**
   * Generate Einstein-style response
   */
  async generateResponse(
    question: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    options: { max_length?: number; temperature?: number } = {}
  ): Promise<string> {
    try {
      const request: EinsteinRequest = {
        question,
        history: conversationHistory,
        max_length: options.max_length || 150,
        temperature: options.temperature || 0.7,
      };

      const response = await fetch(`${this.apiUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data: EinsteinResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('[Einstein API] Error generating response:', error);
      throw error;
    }
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const available = await this.isAvailable();
    if (!available) {
      console.warn('[Einstein API] Service not available. Check VITE_EINSTEIN_API_URL');
      return;
    }

    this.initialized = true;
    console.log('[Einstein API] Service initialized:', this.apiUrl);
  }
}

export const huggingFaceEinsteinService = new HuggingFaceEinsteinService();

