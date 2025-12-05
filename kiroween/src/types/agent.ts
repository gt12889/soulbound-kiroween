/**
 * Agent type definitions for GhostArchive multi-agent system
 */

export type ReasoningType = 'chain-of-thought' | 'tree-of-thought' | 'self-consistency' | 'collaborative';

export interface TerminalTheme {
  backgroundColor: string;
  textColor: string;
  glowColor: string;
  scanlineOpacity: number;
  cursorStyle: string;
}

export interface Agent {
  id: string;
  name: string;
  era: string;
  capabilities: string[];
  reasoningType: ReasoningType;
  systemPrompt: string;
  greeting: string;
  theme: TerminalTheme;
  fragmentTypes: FragmentType[];
}

export interface AgentResponse {
  agentId: string;
  agentName: string;
  response: string;
  reasoning?: ReasoningTrace[];
  confidence: number;
  timestamp: number;
}

export interface ReasoningTrace {
  step: number;
  thought: string;
  confidence: number;
  alternatives?: string[];
}

export interface OrchestrationRequest {
  task: string;
  context?: any;
  preferredAgents?: string[];
  workflow?: string;
  reasoningMode?: 'single' | 'multi' | 'collaborative';
}

export type FragmentType = 'letter' | 'manuscript' | 'speech' | 'poetry' | 'formula' | 'research';

