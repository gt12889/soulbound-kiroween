/**
 * GhostArchive Service
 * Manages personalities, conversations, and agent interactions
 * Hybrid AI: Uses SageMaker for personality models, fallback to current service
 */

import type { Agent } from '../types/agent';
import { agentOrchestrator } from './agentOrchestrator';
import { sagemakerService } from './sagemakerService';
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
   * Ask a question - uses hybrid SageMaker + fallback approach
   */
  async ask(question: string, preferredAgents?: string[], reasoningMode?: 'single' | 'multi' | 'collaborative'): Promise<string> {
    // If connected to a single personality with SageMaker endpoint, use it
    if (preferredAgents && preferredAgents.length === 1) {
      const agentId = preferredAgents[0];
      
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
            { role: 'user', content: question },
            { role: 'assistant', content: response },
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

