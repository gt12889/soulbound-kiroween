/**
 * Multi-Agent Orchestrator for GhostArchive
 * Coordinates multiple AI agents with routing, aggregation, and conflict resolution
 */

import type { Agent, AgentResponse, OrchestrationRequest } from '../types/agent';
import { multiReasoningService } from './multiReasoningService';
import { workflowEngine } from './workflowEngine';
import { aiService } from './aiService';

class AgentOrchestrator {
  private agents: Map<string, Agent> = new Map();
  private agentStatus: Map<string, 'idle' | 'busy' | 'error'> = new Map();

  /**
   * Register an agent
   */
  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
    this.agentStatus.set(agent.id, 'idle');
  }

  /**
   * Route a request to appropriate agents
   */
  routeRequest(request: OrchestrationRequest): Agent[] {
    if (request.preferredAgents && request.preferredAgents.length > 0) {
      return request.preferredAgents
        .map(id => this.agents.get(id))
        .filter((agent): agent is Agent => agent !== undefined);
    }

    // Simple routing based on capabilities
    const taskLower = request.task.toLowerCase();
    const matchedAgents: Agent[] = [];

    for (const agent of this.agents.values()) {
      if (agent.capabilities.some(cap => taskLower.includes(cap.toLowerCase()))) {
        matchedAgents.push(agent);
      }
    }

    // If no matches, return all agents for broadcast
    return matchedAgents.length > 0 ? matchedAgents : Array.from(this.agents.values());
  }

  /**
   * Route and execute a request
   */
  async routeAndExecute(request: OrchestrationRequest): Promise<string> {
    // Check if this is a workflow request
    if (request.workflow) {
      const result = await workflowEngine.executeWorkflow(request.workflow, request.context || {});
      return result.success ? JSON.stringify(result.result) : result.error || 'Workflow failed';
    }

    const agents = this.routeRequest(request);
    
    if (agents.length === 0) {
      throw new Error('No agents available');
    }

    // Execute based on reasoning mode
    if (request.reasoningMode === 'collaborative' && agents.length > 1) {
      const result = await multiReasoningService.collaborativeReasoning(request.task, agents);
      return result.answer;
    }

    if (request.reasoningMode === 'multi' && agents.length > 0) {
      const agent = agents[0];
      const result = await this.executeWithReasoning(request.task, agent);
      return result.answer;
    }

    // Single agent execution
    if (agents.length === 1) {
      return await this.executeAgent(agents[0], request.task, request.context);
    }

    // Multiple agents - parallel execution
    const responses = await Promise.all(
      agents.map(agent => this.executeAgent(agent, request.task, request.context))
    );

    // Aggregate responses
    const agentResponses: AgentResponse[] = responses.map((response, index) => ({
      agentId: agents[index].id,
      agentName: agents[index].name,
      response,
      confidence: 0.8,
      timestamp: Date.now(),
    }));

    return this.aggregateResponses(agentResponses);
  }

  /**
   * Execute an agent with appropriate reasoning
   */
  private async executeWithReasoning(task: string, agent: Agent): Promise<{ answer: string; reasoning?: any[] }> {
    switch (agent.reasoningType) {
      case 'chain-of-thought':
        return await multiReasoningService.chainOfThought(task, agent);
      
      case 'tree-of-thought':
        return await multiReasoningService.treeOfThought(task, agent);
      
      case 'self-consistency':
        return await multiReasoningService.selfConsistency(task, agent);
      
      default:
        const answer = await this.executeAgent(agent, task);
        return { answer };
    }
  }

  /**
   * Execute a single agent
   */
  private async executeAgent(agent: Agent, task: string, context?: any): Promise<string> {
    this.agentStatus.set(agent.id, 'busy');

    try {
      const prompt = `${agent.systemPrompt}

User request: ${task}
${context ? `\nContext: ${JSON.stringify(context)}` : ''}

Respond as ${agent.name} would, staying true to your era (${agent.era}) and personality.`;

      const response = await aiService.getSuggestion(prompt, 1, true);
      this.agentStatus.set(agent.id, 'idle');
      return response;
    } catch (error) {
      this.agentStatus.set(agent.id, 'error');
      throw error;
    }
  }

  /**
   * Aggregate multiple agent responses
   */
  aggregateResponses(responses: AgentResponse[]): string {
    if (responses.length === 0) return '';
    if (responses.length === 1) return responses[0].response;

    // Simple aggregation: combine responses with agent attribution
    const aggregated = responses.map(r => 
      `[${r.agentName}]: ${r.response}`
    ).join('\n\n');

    return aggregated;
  }

  /**
   * Resolve conflicts when agents disagree
   */
  resolveConflicts(responses: AgentResponse[]): string {
    if (responses.length === 0) return '';
    if (responses.length === 1) return responses[0].response;

    // Find highest confidence response
    const bestResponse = responses.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );

    // If multiple high-confidence responses, synthesize
    const highConfidence = responses.filter(r => r.confidence >= 0.8);
    if (highConfidence.length > 1) {
      return this.aggregateResponses(highConfidence);
    }

    return bestResponse.response;
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent status
   */
  getAgentStatus(agentId: string): 'idle' | 'busy' | 'error' | undefined {
    return this.agentStatus.get(agentId);
  }

  /**
   * Get all agent statuses
   */
  getAllAgentStatuses(): Record<string, 'idle' | 'busy' | 'error'> {
    const statuses: Record<string, 'idle' | 'busy' | 'error'> = {};
    for (const [id, status] of this.agentStatus.entries()) {
      statuses[id] = status;
    }
    return statuses;
  }
}

export const agentOrchestrator = new AgentOrchestrator();

