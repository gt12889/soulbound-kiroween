/**
 * GhostArchive type definitions
 */

import type { ReasoningTrace } from './agent';

export interface TerminalOutput {
  id: string;
  type: 'command' | 'output' | 'error' | 'agent' | 'reasoning' | 'workflow';
  content: string;
  agentId?: string;
  agentName?: string;
  timestamp: number;
  reasoning?: ReasoningTrace[];
}

export interface Fragment {
  id: string;
  type: 'letter' | 'manuscript' | 'speech' | 'poetry' | 'formula' | 'research';
  title: string;
  corruptedText: string;
  restoredText?: string;
  progress: number;
  difficulty: 'easy' | 'medium' | 'hard';
  personalityId?: string;
}

export interface LoreEvent {
  id: string;
  type: 'text' | 'glitch' | 'interruption' | 'discovery' | 'haunting';
  message: string;
  agentId?: string;
  timestamp: number;
  visualEffect?: 'flash' | 'fade' | 'glitch';
}

// GhostArchiveState is defined inline in the context

