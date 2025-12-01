/**
 * GhostArchive Service
 * Manages personalities, conversations, and agent interactions
 */

import type { Agent } from '../types/agent';
import { agentOrchestrator } from './agentOrchestrator';

class GhostArchiveService {
  private initialized = false;

  /**
   * Initialize the service by registering all personalities
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const module = await import('../data/personalities.json');
      const data = module.default || [];
      data.forEach((personality: any) => {
        agentOrchestrator.registerAgent(personality as Agent);
      });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize GhostArchive service:', error);
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
   * Ask a question to the orchestrator
   */
  async ask(question: string, preferredAgents?: string[], reasoningMode?: 'single' | 'multi' | 'collaborative'): Promise<string> {
    const request = {
      task: question,
      preferredAgents,
      reasoningMode: reasoningMode || 'single',
    };

    return await agentOrchestrator.routeAndExecute(request);
  }

  /**
   * Get agent statuses
   */
  getAgentStatuses(): Record<string, 'idle' | 'busy' | 'error'> {
    return agentOrchestrator.getAllAgentStatuses();
  }
}

export const ghostArchiveService = new GhostArchiveService();

