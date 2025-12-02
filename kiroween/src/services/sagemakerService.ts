/**
 * AWS SageMaker Service
 * Handles serverless inference for fine-tuned historical personality models
 */

import { createScopedLogger } from '../utils/logger';

const logger = createScopedLogger('[SageMaker]');

interface SageMakerConfig {
  region: string;
  endpoints: Record<string, string>;
  accessKeyId?: string;
  secretAccessKey?: string;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface InferencePayload {
  inputs: string;
  parameters?: {
    temperature?: number;
    max_new_tokens?: number;
    top_p?: number;
    do_sample?: boolean;
  };
}

class SageMakerService {
  private config: SageMakerConfig;
  private initialized = false;

  constructor() {
    this.config = {
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      endpoints: {
        shakespeare: import.meta.env.VITE_SAGEMAKER_ENDPOINT_SHAKESPEARE || '',
        einstein: import.meta.env.VITE_SAGEMAKER_ENDPOINT_EINSTEIN || '',
        cleopatra: import.meta.env.VITE_SAGEMAKER_ENDPOINT_CLEOPATRA || '',
        tesla: import.meta.env.VITE_SAGEMAKER_ENDPOINT_TESLA || '',
        curie: import.meta.env.VITE_SAGEMAKER_ENDPOINT_CURIE || '',
      },
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    };
  }

  /**
   * Initialize the SageMaker service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Validate configuration
    if (!this.config.accessKeyId || !this.config.secretAccessKey) {
      logger.warn('AWS credentials not configured. SageMaker features disabled.');
      logger.info('To enable SageMaker, add AWS credentials to .env file');
      return;
    }

    // Check if any endpoints are configured
    const hasEndpoints = Object.values(this.config.endpoints).some(endpoint => endpoint !== '');
    if (!hasEndpoints) {
      logger.warn('No SageMaker endpoints configured. Using fallback AI service.');
      return;
    }

    this.initialized = true;
    logger.info('SageMaker service initialized successfully');
  }

  /**
   * Check if SageMaker is available for a personality
   */
  isAvailable(personalityId: string): boolean {
    return this.initialized && !!this.config.endpoints[personalityId];
  }

  /**
   * Invoke a personality model on SageMaker serverless endpoint
   */
  async invokePersonality(
    personalityId: string,
    prompt: string,
    conversationHistory: Message[] = [],
    temperature: number = 0.8
  ): Promise<string> {
    if (!this.initialized) {
      throw new Error('SageMaker service not initialized');
    }

    const endpointName = this.config.endpoints[personalityId];
    if (!endpointName) {
      throw new Error(`No SageMaker endpoint configured for ${personalityId}`);
    }

    try {
      // Build conversation context
      const context = this.buildConversationContext(conversationHistory, prompt);
      
      // Prepare inference payload
      const payload: InferencePayload = {
        inputs: context,
        parameters: {
          temperature,
          max_new_tokens: 500,
          top_p: 0.9,
          do_sample: true,
        },
      };

      // Invoke serverless endpoint
      const response = await this.invokeServerlessEndpoint(endpointName, payload);
      
      return this.extractResponse(response);
    } catch (error) {
      logger.error(`SageMaker inference failed for ${personalityId}:`, error);
      throw error;
    }
  }

  /**
   * Check endpoint health
   */
  async checkEndpointHealth(personalityId: string): Promise<boolean> {
    if (!this.initialized) return false;
    
    const endpointName = this.config.endpoints[personalityId];
    if (!endpointName) return false;

    try {
      // Simple health check with minimal payload
      await this.invokeServerlessEndpoint(endpointName, {
        inputs: 'Hello',
        parameters: { max_new_tokens: 10 },
      });
      return true;
    } catch (error) {
      logger.warn(`Endpoint ${endpointName} health check failed:`, error);
      return false;
    }
  }

  /**
   * Invoke SageMaker serverless inference endpoint
   * Uses AWS Signature V4 authentication
   */
  private async invokeServerlessEndpoint(endpointName: string, payload: InferencePayload): Promise<any> {
    const url = `https://runtime.sagemaker.${this.config.region}.amazonaws.com/endpoints/${endpointName}/invocations`;
    
    // Sign request with AWS Signature V4
    const signedRequest = await this.signRequest(url, payload);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: signedRequest.headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`SageMaker request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Sign AWS request with Signature V4
   * Simplified implementation - in production, use @aws-sdk/signature-v4
   */
  private async signRequest(url: string, payload: any): Promise<{ headers: Record<string, string> }> {
    // For now, return basic headers
    // TODO: Implement full AWS Signature V4 or use AWS SDK
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Amz-Date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, ''),
    };

    // In production, add Authorization header with AWS Signature V4
    if (this.config.accessKeyId) {
      // Placeholder for AWS Signature V4
      // Use @aws-sdk/client-sagemaker-runtime for production
      logger.warn('Using placeholder authentication. Implement AWS SDK for production.');
    }

    return { headers };
  }

  /**
   * Build conversation context from history
   */
  private buildConversationContext(history: Message[], currentPrompt: string): string {
    let context = '';
    
    // Add recent conversation history (last 5 messages)
    const recentHistory = history.slice(-5);
    for (const msg of recentHistory) {
      if (msg.role === 'user') {
        context += `Human: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        context += `Assistant: ${msg.content}\n`;
      }
    }
    
    // Add current prompt
    context += `Human: ${currentPrompt}\nAssistant:`;
    
    return context;
  }

  /**
   * Extract response from SageMaker output
   */
  private extractResponse(response: any): string {
    // Handle different response formats
    if (typeof response === 'string') {
      return response;
    }
    
    if (Array.isArray(response) && response.length > 0) {
      return response[0].generated_text || response[0];
    }
    
    if (response.generated_text) {
      return response.generated_text;
    }
    
    if (response[0]?.generated_text) {
      return response[0].generated_text;
    }
    
    logger.warn('Unexpected SageMaker response format:', response);
    return JSON.stringify(response);
  }
}

export const sagemakerService = new SageMakerService();

