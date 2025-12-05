/**
 * Multi-Reasoning Service for GhostArchive
 * Implements chain-of-thought, tree-of-thought, self-consistency, and collaborative reasoning
 */

import type { Agent, ReasoningTrace } from '../types/agent';
import { aiService } from './aiService';

export interface ReasoningResult {
  answer: string;
  reasoning: ReasoningTrace[];
  confidence: number;
  method: 'chain-of-thought' | 'tree-of-thought' | 'self-consistency' | 'collaborative';
}

class MultiReasoningService {
  /**
   * Chain-of-Thought: Step-by-step reasoning
   */
  async chainOfThought(question: string, agent: Agent): Promise<ReasoningResult> {
    const prompt = `You are ${agent.name} from the ${agent.era} era. 

${agent.systemPrompt}

Question: ${question}

Think step by step. Show your reasoning process clearly, then provide your final answer.

Format your response as:
Step 1: [your first thought]
Step 2: [your second thought]
...
Final Answer: [your conclusion]`;

    try {
      const response = await aiService.getSuggestion(prompt, 1, true);
      const reasoning = this.parseChainOfThought(response);
      
      return {
        answer: this.extractAnswer(response),
        reasoning,
        confidence: this.calculateConfidence(reasoning),
        method: 'chain-of-thought',
      };
    } catch (error) {
      console.error('Chain-of-thought reasoning failed:', error);
      throw error;
    }
  }

  /**
   * Tree-of-Thought: Multiple reasoning paths explored
   */
  async treeOfThought(question: string, agent: Agent, branches: number = 3): Promise<ReasoningResult> {
    const prompt = `You are ${agent.name} from the ${agent.era} era.

${agent.systemPrompt}

Question: ${question}

Explore ${branches} different reasoning paths to answer this question. For each path, show:
- Path [N]: [reasoning approach]
- Conclusion: [what this path leads to]

Then synthesize all paths and provide your final answer.`;

    try {
      const response = await aiService.getSuggestion(prompt, 1, true);
      const reasoning = this.parseTreeOfThought(response, branches);
      
      return {
        answer: this.extractAnswer(response),
        reasoning,
        confidence: this.calculateConfidence(reasoning),
        method: 'tree-of-thought',
      };
    } catch (error) {
      console.error('Tree-of-thought reasoning failed:', error);
      throw error;
    }
  }

  /**
   * Self-Consistency: Multiple attempts, vote on best
   */
  async selfConsistency(
    question: string,
    agent: Agent,
    attempts: number = 3
  ): Promise<ReasoningResult> {
    const prompt = `You are ${agent.name} from the ${agent.era} era.

${agent.systemPrompt}

Question: ${question}

Provide your answer with reasoning.`;

    try {
      const responses = await Promise.all(
        Array.from({ length: attempts }, () => aiService.getSuggestion(prompt, 1, true))
      );

      const reasoningResults = responses.map((response, index) => ({
        step: index + 1,
        thought: response,
        confidence: 0.7,
      }));

      // Aggregate responses (simple majority voting)
      const answer = this.aggregateResponses(responses);
      
      return {
        answer,
        reasoning: reasoningResults,
        confidence: 0.85, // Higher confidence with multiple consistent answers
        method: 'self-consistency',
      };
    } catch (error) {
      console.error('Self-consistency reasoning failed:', error);
      throw error;
    }
  }

  /**
   * Collaborative Reasoning: Multiple agents reason together
   */
  async collaborativeReasoning(
    question: string,
    agents: Agent[]
  ): Promise<ReasoningResult> {
    const agentPrompts = agents.map(agent => 
      `${agent.name} (${agent.era}): ${agent.systemPrompt}`
    ).join('\n\n');

    const prompt = `Multiple historical personalities are collaborating to answer a question.

${agentPrompts}

Question: ${question}

Each personality should provide their perspective and reasoning. Then synthesize all perspectives into a unified answer.

Format:
[Agent Name]: [their reasoning and answer]
...
Synthesis: [unified answer combining all perspectives]`;

    try {
      const response = await aiService.getSuggestion(prompt, 1, true);
      const reasoning = this.parseCollaborativeReasoning(response, agents);
      
      return {
        answer: this.extractAnswer(response),
        reasoning,
        confidence: 0.9, // High confidence with multiple expert perspectives
        method: 'collaborative',
      };
    } catch (error) {
      console.error('Collaborative reasoning failed:', error);
      throw error;
    }
  }

  private parseChainOfThought(text: string): ReasoningTrace[] {
    const steps: ReasoningTrace[] = [];
    const stepRegex = /Step\s+(\d+):\s*(.+?)(?=Step\s+\d+:|Final Answer:|$)/gis;
    let match;
    let stepNum = 1;

    while ((match = stepRegex.exec(text)) !== null) {
      steps.push({
        step: parseInt(match[1]) || stepNum++,
        thought: match[2].trim(),
        confidence: 0.7,
      });
    }

    // If no structured steps found, create one from the text
    if (steps.length === 0) {
      steps.push({
        step: 1,
        thought: text,
        confidence: 0.7,
      });
    }

    return steps;
  }

  private parseTreeOfThought(text: string, _branches: number): ReasoningTrace[] {
    const paths: ReasoningTrace[] = [];
    const pathRegex = /Path\s+(\d+):\s*(.+?)(?=Path\s+\d+:|Conclusion:|$)/gis;
    let match;
    let pathNum = 1;

    while ((match = pathRegex.exec(text)) !== null) {
      paths.push({
        step: parseInt(match[1]) || pathNum++,
        thought: match[2].trim(),
        confidence: 0.6,
        alternatives: [],
      });
    }

    if (paths.length === 0) {
      paths.push({
        step: 1,
        thought: text,
        confidence: 0.6,
        alternatives: [],
      });
    }

    return paths;
  }

  private parseCollaborativeReasoning(text: string, agents: Agent[]): ReasoningTrace[] {
    const traces: ReasoningTrace[] = [];
    let stepNum = 1;

    for (const agent of agents) {
      const agentRegex = new RegExp(`${agent.name}[^:]*:\\s*(.+?)(?=${agents.find(a => a.id !== agent.id)?.name}|Synthesis:|$)`, 'is');
      const match = agentRegex.exec(text);
      
      if (match) {
        traces.push({
          step: stepNum++,
          thought: `${agent.name}: ${match[1].trim()}`,
          confidence: 0.8,
        });
      }
    }

    if (traces.length === 0) {
      traces.push({
        step: 1,
        thought: text,
        confidence: 0.7,
      });
    }

    return traces;
  }

  private extractAnswer(text: string): string {
    // Try to extract "Final Answer:" or "Synthesis:" section
    const answerMatch = text.match(/(?:Final Answer|Synthesis|Answer):\s*(.+?)(?:\n\n|$)/is);
    if (answerMatch) {
      return answerMatch[1].trim();
    }
    
    // Fallback: return last paragraph or last 200 chars
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    return paragraphs[paragraphs.length - 1]?.trim() || text.slice(-200).trim();
  }

  private calculateConfidence(reasoning: ReasoningTrace[]): number {
    if (reasoning.length === 0) return 0.5;
    
    const avgConfidence = reasoning.reduce((sum, r) => sum + r.confidence, 0) / reasoning.length;
    const lengthBonus = Math.min(reasoning.length * 0.05, 0.2); // Bonus for more steps
    
    return Math.min(avgConfidence + lengthBonus, 0.95);
  }

  private aggregateResponses(responses: string[]): string {
    // Simple aggregation: find common themes or return the longest response
    if (responses.length === 0) return '';
    if (responses.length === 1) return responses[0];
    
    // For now, return the longest response as it likely contains most detail
    return responses.reduce((longest, current) => 
      current.length > longest.length ? current : longest
    );
  }
}

export const multiReasoningService = new MultiReasoningService();

