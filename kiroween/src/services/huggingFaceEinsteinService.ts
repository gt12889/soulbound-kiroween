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
    this.apiUrl = import.meta.env.VITE_EINSTEIN_API_URL || 'https://kiroween-dk87.onrender.com';
    
    // Remove trailing slash
    this.apiUrl = this.apiUrl.replace(/\/$/, '');
    
    console.log('[Einstein API] Initialized with URL:', this.apiUrl);
    console.log('[Einstein API] VITE_EINSTEIN_API_URL from env:', import.meta.env.VITE_EINSTEIN_API_URL);
  }

  /**
   * Check if the service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      console.log('[Einstein API] Checking health at:', `${this.apiUrl}/health`);
      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('[Einstein API] Health check response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Einstein API] Health check data:', data);
        return data.status === 'healthy';
      }
      console.warn('[Einstein API] Health check failed - response not OK:', response.status);
      return false;
    } catch (error) {
      console.warn('[Einstein API] Health check failed with error:', error);
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
        const errorMessage = errorData.error || errorData.message || `API error: ${response.status}`;
        
        // Don't throw for missing API key - let it fall through gracefully
        if (errorMessage.includes('HUGGINGFACE_API_KEY') || response.status === 500) {
          throw new Error('API_NOT_CONFIGURED');
        }
        
        throw new Error(errorMessage);
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

