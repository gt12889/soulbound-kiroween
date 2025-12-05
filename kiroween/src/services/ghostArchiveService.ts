/**
 * GhostArchive Service
 * Manages personalities, conversations, and agent interactions
 * Hybrid AI: Uses SageMaker for personality models, fallback to current service
 */

import type { Agent } from '../types/agent';
import { agentOrchestrator } from './agentOrchestrator';
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
   * Ask a question - uses hybrid SageMaker + Hugging Face + fallback approach
   */
  async ask(question: string, preferredAgents?: string[], reasoningMode?: 'single' | 'multi' | 'collaborative'): Promise<string> {
    // If connected to a single personality, check for specialized services
    if (preferredAgents && preferredAgents.length === 1) {
      const agentId = preferredAgents[0];
      
      // Check for Einstein using Hugging Face API
      if (agentId === 'einstein' || agentId.toLowerCase().includes('einstein')) {
        try {
          const available = await huggingFaceEinsteinService.isAvailable();
          if (available) {
            logger.info(`Routing to Hugging Face Einstein API for ${agentId}`);
            
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
            
            return response;
          }
        } catch (error) {
          logger.warn(`Hugging Face Einstein API failed for ${agentId}, using fallback:`, error);
          // Fall through to orchestrator fallback
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
          
          return response;
        } catch (error) {
          logger.warn(`SageMaker failed for ${agentId}, using fallback:`, error);
          // Fall through to orchestrator fallback
        }
      }
    }

    // Fallback to current orchestrator service
    const request = {
      task: question,
      preferredAgents,
      reasoningMode: reasoningMode || 'single',
    };

    return await agentOrchestrator.routeAndExecute(request);
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

