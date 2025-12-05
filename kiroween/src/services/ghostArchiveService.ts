/**
 * GhostArchive Service
 * Manages personalities, conversations, and agent interactions
 * Hybrid AI: Uses SageMaker for personality models, fallback to current service
 */

import type { Agent } from '../types/agent';
import { agentOrchestrator } from './agentOrchestrator';
// Temporarily disable enhanced orchestrator to prevent hangs
// import { enhancedOrchestrator } from './enhancedOrchestrator';
// import type { CollaborationPattern } from './enhancedOrchestrator';
// import { ragService } from './ragService';
// import { knowledgeBaseService } from './knowledgeBaseService';
import { sagemakerService } from './sagemakerService';
import { huggingFaceEinsteinService } from './huggingFaceEinsteinService';
import { hasSageMakerEndpoint } from '../config/sagemakerPersonalities';
import { createScopedLogger } from '../utils/logger';

const logger = createScopedLogger('[GhostArchive]');

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class GhostArchiveService {
  private initialized = false;
  private conversationHistory: Record<string, Message[]> = {};

  /**
   * Initialize the service by registering all personalities
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize SageMaker service
      await sagemakerService.initialize();
      
      // Initialize Hugging Face Einstein service
      await huggingFaceEinsteinService.initialize();
      
      // Load and register personalities
      const module = await import('../data/personalities.json');
      const data = module.default || [];
      data.forEach((personality: any) => {
        agentOrchestrator.registerAgent(personality as Agent);
      });
      
      this.initialized = true;
      logger.info('GhostArchive service initialized');
    } catch (error) {
      logger.error('Failed to initialize GhostArchive service:', error);
    }
  }

  /**
   * Get all available personalities
   */
  getPersonalities(): Agent[] {
    return agentOrchestrator.getAllAgents();
  }

  /**
   * Get a specific personality
   */
  getPersonality(personalityId: string): Agent | undefined {
    return agentOrchestrator.getAgent(personalityId);
  }

  /**
   * Connect to a personality
   */
  async connect(personalityId: string): Promise<string> {
    const agent = agentOrchestrator.getAgent(personalityId);
    if (!agent) {
      throw new Error(`Personality ${personalityId} not found`);
    }

    return agent.greeting;
  }

  /**
   * Ask a question - uses hybrid SageMaker + Hugging Face + enhanced orchestrator with RAG
   */
  async ask(
    question: string, 
    preferredAgents?: string[], 
    reasoningMode?: 'single' | 'multi' | 'collaborative',
    options?: {
      useRAG?: boolean;
      // collaborationPattern?: CollaborationPattern; // Temporarily disabled
      useKnowledgeBase?: boolean;
    }
  ): Promise<string> {
    // If connected to a single personality, check for specialized services
    if (preferredAgents && preferredAgents.length === 1) {
      const agentId = preferredAgents[0];
      
      // Check for Einstein using Hugging Face API
      if (agentId === 'einstein' || agentId.toLowerCase().includes('einstein')) {
        try {
          logger.info(`[Einstein] Checking Hugging Face API availability for ${agentId}...`);
          const available = await huggingFaceEinsteinService.isAvailable();
          logger.info(`[Einstein] API available: ${available}`);
          if (available) {
            logger.info(`[Einstein] Routing to Hugging Face Einstein API for ${agentId}`);
            
            // Get conversation history for this agent
            const history = this.conversationHistory[agentId] || [];
            
            // Convert history format (filter out system messages)
            const formattedHistory = history
              .filter(msg => msg.role !== 'system')
              .map(msg => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content
              }));
            
            // Invoke Hugging Face Einstein API
            const response = await huggingFaceEinsteinService.generateResponse(
              question,
              formattedHistory
            );
            
            // Update conversation history
            this.conversationHistory[agentId] = [
              ...history,
              { role: 'user' as const, content: question },
              { role: 'assistant' as const, content: response },
            ].slice(-10); // Keep last 10 exchanges
            
            // Store in RAG and knowledge base if enabled (disabled for now to prevent hangs)
            // if (options?.useRAG !== false) {
            //   await ragService.addConversation(agentId, question, response);
            // }
            // if (options?.useKnowledgeBase !== false) {
            //   knowledgeBaseService.addConversationContext(agentId, `Q: ${question}\nA: ${response}`);
            // }
            
            return response;
          }
        } catch (error) {
          // Silently fall through to Gemini fallback if API is not configured
          // Only log if it's an unexpected error (not a configuration issue)
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage !== 'API_NOT_CONFIGURED' && 
              !errorMessage.includes('HUGGINGFACE_API_KEY') && 
              !errorMessage.includes('500')) {
            logger.warn(`Hugging Face Einstein API failed for ${agentId}, trying Gemini fallback:`, error);
          }
          
          // Fallback to Gemini API
          try {
            logger.info(`[Einstein] Falling back to Gemini API for ${agentId}`);
            const geminiResponse = await this.generateEinsteinWithGemini(question, agentId);
            if (geminiResponse) {
              return geminiResponse;
            }
          } catch (geminiError) {
            logger.warn(`Gemini fallback also failed for ${agentId}:`, geminiError);
            // Fall through to orchestrator fallback
          }
        }
      }
      
      // Check for SageMaker endpoint
      if (hasSageMakerEndpoint(agentId) && sagemakerService.isAvailable(agentId)) {
        try {
          logger.info(`Routing to SageMaker for ${agentId}`);
          
          // Get conversation history for this agent
          const history = this.conversationHistory[agentId] || [];
          
          // Invoke SageMaker
          const response = await sagemakerService.invokePersonality(
            agentId,
            question,
            history
          );
          
          // Update conversation history
          this.conversationHistory[agentId] = [
            ...history,
            { role: 'user' as const, content: question },
            { role: 'assistant' as const, content: response },
          ].slice(-10); // Keep last 10 exchanges
          
          // Store in RAG and knowledge base if enabled (disabled for now)
          // if (options?.useRAG !== false) {
          //   await ragService.addConversation(agentId, question, response);
          // }
          // if (options?.useKnowledgeBase !== false) {
          //   knowledgeBaseService.addConversationContext(agentId, `Q: ${question}\nA: ${response}`);
          // }
          
          return response;
        } catch (error) {
          logger.warn(`SageMaker failed for ${agentId}, using fallback:`, error);
          // Fall through to orchestrator fallback
        }
      }
    }

    // Enhanced orchestrator temporarily disabled to prevent hangs
    // Use basic orchestrator for now

    // Fallback to basic orchestrator service
    const request = {
      task: question,
      preferredAgents,
      reasoningMode: reasoningMode || 'single',
    };

    const response = await agentOrchestrator.routeAndExecute(request);

    // Knowledge base storage temporarily disabled
    // if (options?.useKnowledgeBase !== false && preferredAgents) {
    //   for (const agentId of preferredAgents) {
    //     knowledgeBaseService.addConversationContext(agentId, `Q: ${question}\nA: ${response}`);
    //   }
    // }

    return response;
  }

  /**
   * Multi-agent collaboration with different patterns
   * Temporarily disabled to prevent hangs
   */
  // async collaborate(
  //   question: string,
  //   agentIds: string[],
  //   pattern: CollaborationPattern = 'parallel'
  // ): Promise<string> {
  //   const agents = agentIds
  //     .map(id => agentOrchestrator.getAgent(id))
  //     .filter((agent): agent is Agent => agent !== undefined);

  //   if (agents.length === 0) {
  //     throw new Error('No valid agents specified');
  //   }

  //   const result = await enhancedOrchestrator.collaborate(
  //     question,
  //     agents,
  //     pattern
  //   );

  //   // Store collaboration in knowledge base
  //   for (const agent of agents) {
  //     knowledgeBaseService.addConversationContext(
  //       agent.id,
  //       `Collaboration (${pattern}): Q: ${question}\nA: ${result.finalAnswer}`
  //     );
  //   }

  //   return result.finalAnswer;
  // }

  /**
   * Search knowledge base
   * Temporarily disabled
   */
  // async searchKnowledge(query: string, agentId?: string): Promise<any> {
  //   if (agentId) {
  //     return await knowledgeBaseService.retrieveKnowledge(agentId, query);
  //   }
  //   return await knowledgeBaseService.searchGlobalKnowledge(query);
  // }

  /**
   * Store knowledge
   * Temporarily disabled
   */
  // async storeKnowledge(
  //   agentId: string,
  //   content: string,
  //   category: 'fact' | 'concept' | 'procedure' | 'memory' | 'preference' = 'fact',
  //   tags: string[] = []
  // ): Promise<string> {
  //   return await knowledgeBaseService.storeKnowledge(agentId, content, category, tags);
  // }

  /**
   * Get RAG context for a query
   * Temporarily disabled
   */
  // async getContext(query: string, agentId?: string): Promise<any> {
  //   return await ragService.getContext(query, {
  //     limit: 5,
  //     agentId,
  //     summarize: true,
  //   });
  // }
  
  /**
   * Generate Einstein response using Gemini API as fallback
   */
  private async generateEinsteinWithGemini(question: string, agentId: string): Promise<string | null> {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        logger.warn('[Einstein] Gemini API key not configured');
        return null;
      }

      const agent = this.getPersonality(agentId);
      if (!agent) {
        logger.warn(`[Einstein] Personality ${agentId} not found`);
        return null;
      }

      // Get conversation history
      const history = this.conversationHistory[agentId] || [];
      
      // Build conversation context
      const conversationContext = history
        .slice(-5) // Last 5 exchanges
        .map(msg => {
          if (msg.role === 'user') {
            return `Human: ${msg.content}`;
          } else if (msg.role === 'assistant') {
            return `Einstein: ${msg.content}`;
          }
          return '';
        })
        .filter(Boolean)
        .join('\n');

      // Create Einstein-style prompt
      const systemPrompt = agent.systemPrompt || 
        'You are Albert Einstein, the theoretical physicist who revolutionized our understanding of space, time, and energy. You think deeply and explore multiple perspectives. You speak with clarity and wonder, often using thought experiments.';
      
      const prompt = `${systemPrompt}

${conversationContext ? `${conversationContext}\n` : ''}Human: ${question}
Einstein:`;

      // Use Gemini API
      const model = import.meta.env.VITE_AI_MODEL || 'gemini-2.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'x-goog-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 500,
            topP: 0.95,
            topK: 40,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        logger.error(`[Einstein] Gemini API error: ${response.status} ${errorText}`);
        return null;
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!generatedText) {
        logger.warn('[Einstein] No text generated from Gemini');
        return null;
      }

      // Extract only the Einstein response (after "Einstein:")
      let responseText = generatedText;
      if (generatedText.includes('Einstein:')) {
        responseText = generatedText.split('Einstein:').slice(-1)[0].trim();
      } else {
        // Remove the prompt if it's included
        responseText = generatedText.replace(prompt, '').trim();
      }

      // Clean up response
      responseText = responseText.split('\n')[0]; // Take first line
      responseText = responseText.substring(0, 500); // Limit length

      // Update conversation history
      this.conversationHistory[agentId] = [
        ...history,
        { role: 'user' as const, content: question },
        { role: 'assistant' as const, content: responseText },
      ].slice(-10); // Keep last 10 exchanges

      logger.info(`[Einstein] Successfully generated response using Gemini API`);
      return responseText;
    } catch (error) {
      logger.error('[Einstein] Error generating response with Gemini:', error);
      return null;
    }
  }

  /**
   * Clear conversation history for an agent
   */
  clearConversationHistory(agentId: string): void {
    delete this.conversationHistory[agentId];
  }
  
  /**
   * Get conversation history for an agent
   */
  getConversationHistory(agentId: string): Message[] {
    return this.conversationHistory[agentId] || [];
  }

  /**
   * Get agent statuses
   */
  getAgentStatuses(): Record<string, 'idle' | 'busy' | 'error'> {
    return agentOrchestrator.getAllAgentStatuses();
  }
}

export const ghostArchiveService = new GhostArchiveService();

