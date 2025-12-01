/**
 * GhostArchive Context
 * Manages state for the GhostArchive terminal interface
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { TerminalOutput, Fragment, LoreEvent } from '../types/ghostArchive';
import type { Agent } from '../types/agent';
import type { WorkflowResult } from '../types/workflow';
import { ghostArchiveService } from '../services/ghostArchiveService';
import { workflowEngine } from '../services/workflowEngine';
import { loreEventService } from '../services/loreEventService';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface GhostArchiveContextType {
  // State
  activeAgents: string[];
  connectedAgent?: string;
  terminalOutput: TerminalOutput[];
  fragments: Fragment[];
  activeFragment?: string;
  loreEvents: LoreEvent[];
  workflows: Record<string, WorkflowResult>;
  commandHistory: string[];
  
  // Actions
  connectAgent: (agentId: string) => Promise<void>;
  disconnectAgent: () => void;
  addOutput: (output: Omit<TerminalOutput, 'id' | 'timestamp'>) => void;
  executeCommand: (command: string) => Promise<void>;
  startFragmentRestoration: (fragmentId: string) => Promise<void>;
  clearTerminal: () => void;
  getPersonalities: () => Agent[];
  getPersonality: (id: string) => Agent | undefined;
}

const GhostArchiveContext = createContext<GhostArchiveContextType | undefined>(undefined);

export const useGhostArchive = () => {
  const context = useContext(GhostArchiveContext);
  if (!context) {
    throw new Error('useGhostArchive must be used within GhostArchiveProvider');
  }
  return context;
};

interface GhostArchiveProviderProps {
  children: ReactNode;
}

export const GhostArchiveProvider: React.FC<GhostArchiveProviderProps> = ({ children }) => {
  // Initialize service
  useEffect(() => {
    ghostArchiveService.initialize();
    
    // Load workflows
    import('../data/workflows.json').then(module => {
      module.default.forEach((workflow: any) => {
        workflowEngine.registerWorkflow(workflow);
      });
    });
  }, []);

  // State
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [connectedAgent, setConnectedAgent] = useState<string | undefined>();
  const [terminalOutput, setTerminalOutput] = useLocalStorage<TerminalOutput[]>('ghost-archive-output', []);
  const [fragments, setFragments] = useLocalStorage<Fragment[]>('ghost-archive-fragments', []);
  const [activeFragment, setActiveFragment] = useState<string | undefined>();
  const [loreEvents, setLoreEvents] = useState<LoreEvent[]>([]);
  const [workflows, setWorkflows] = useState<Record<string, WorkflowResult>>({});
  const [commandHistory, setCommandHistory] = useLocalStorage<string[]>('ghost-archive-history', []);

  // Load fragments on mount
  useEffect(() => {
    import('../data/fragments.json').then(module => {
      const fragmentsData = (module.default || []) as Fragment[];
      setFragments(fragmentsData);
    }).catch(err => {
      console.error('Failed to load fragments:', err);
    });
  }, [setFragments]);

  // Random lore events
  useEffect(() => {
    const interval = setInterval(() => {
      const event = loreEventService.generateEvent(activeAgents);
      if (event) {
        setLoreEvents(prev => [...prev, event]);
        addOutput({
          type: 'agent',
          content: event.message,
          agentId: event.agentId,
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [activeAgents]);

  const addOutput = useCallback((output: Omit<TerminalOutput, 'id' | 'timestamp'>) => {
    const newOutput: TerminalOutput = {
      ...output,
      id: `output-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setTerminalOutput(prev => [...prev, newOutput]);
  }, [setTerminalOutput]);

  const connectAgent = useCallback(async (agentId: string) => {
    try {
      const greeting = await ghostArchiveService.connect(agentId);
      setConnectedAgent(agentId);
      setActiveAgents(prev => [...new Set([...prev, agentId])]);
      
      const agent = ghostArchiveService.getPersonality(agentId);
      addOutput({
        type: 'output',
        content: greeting,
        agentId,
        agentName: agent?.name,
      });
    } catch (error) {
      addOutput({
        type: 'error',
        content: `Failed to connect to ${agentId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }, [addOutput]);

  const disconnectAgent = useCallback(() => {
    if (connectedAgent) {
      addOutput({
        type: 'output',
        content: `Disconnected from ${connectedAgent}`,
      });
      setConnectedAgent(undefined);
    }
  }, [connectedAgent, addOutput]);

  const executeCommand = useCallback(async (command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;

    // Add to command history
    setCommandHistory(prev => {
      const newHistory = [...prev, trimmed];
      return newHistory.slice(-100); // Keep last 100 commands
    });

    // Add command to output
    addOutput({
      type: 'command',
      content: trimmed,
    });

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    try {
      switch (cmd) {
        case 'connect':
          if (args.length === 0) {
            addOutput({ type: 'error', content: 'Usage: connect <personality>' });
            return;
          }
          await connectAgent(args[0]);
          break;

        case 'disconnect':
          disconnectAgent();
          break;

        case 'list':
          const personalities = ghostArchiveService.getPersonalities();
          addOutput({
            type: 'output',
            content: `Available personalities:\n${personalities.map(p => `  - ${p.id}: ${p.name} (${p.era})`).join('\n')}`,
          });
          break;

        case 'help':
          addOutput({
            type: 'output',
            content: `Available commands:
  connect <personality>  - Connect to a historical personality
  disconnect             - Disconnect from current personality
  list                   - List available personalities
  ask <question>         - Ask question to orchestrator
  reason <question>      - Get multi-reasoning analysis
  collaborate <task>     - Engage multiple agents on a task
  workflow <name>       - Execute a predefined workflow
  workflows              - List available workflows
  restore                - Start fragment restoration workflow
  agents                 - Show active agents and their status
  clear                  - Clear terminal
  history                - Show command history
  help                   - Show this help message`,
          });
          break;

        case 'ask':
          if (args.length === 0) {
            addOutput({ type: 'error', content: 'Usage: ask <question>' });
            return;
          }
          const question = args.join(' ');
          addOutput({ type: 'output', content: 'Thinking...' });
          const answer = await ghostArchiveService.ask(question);
          addOutput({ type: 'output', content: answer });
          break;

        case 'reason':
          if (args.length === 0) {
            addOutput({ type: 'error', content: 'Usage: reason <question>' });
            return;
          }
          const reasonQuestion = args.join(' ');
          addOutput({ type: 'output', content: 'Reasoning...' });
          const reasonedAnswer = await ghostArchiveService.ask(reasonQuestion, undefined, 'multi');
          addOutput({ type: 'output', content: reasonedAnswer });
          break;

        case 'collaborate':
          if (args.length === 0) {
            addOutput({ type: 'error', content: 'Usage: collaborate <task>' });
            return;
          }
          const task = args.join(' ');
          addOutput({ type: 'output', content: 'Collaborating...' });
          const collaboration = await ghostArchiveService.ask(task, undefined, 'collaborative');
          addOutput({ type: 'output', content: collaboration });
          break;

        case 'workflow':
          if (args.length === 0) {
            addOutput({ type: 'error', content: 'Usage: workflow <name>' });
            return;
          }
          const workflowName = args[0];
          addOutput({ type: 'output', content: `Executing workflow: ${workflowName}...` });
          const result = await workflowEngine.executeWorkflow(workflowName, {});
          setWorkflows(prev => ({ ...prev, [workflowName]: result }));
          addOutput({
            type: 'workflow',
            content: result.success ? `Workflow completed: ${JSON.stringify(result.result)}` : `Workflow failed: ${result.error}`,
          });
          break;

        case 'workflows':
          const availableWorkflows = workflowEngine.getWorkflows();
          addOutput({
            type: 'output',
            content: `Available workflows:\n${availableWorkflows.map(w => `  - ${w.id}: ${w.name} - ${w.description}`).join('\n')}`,
          });
          break;

        case 'restore':
          if (fragments.length === 0) {
            addOutput({ type: 'error', content: 'No fragments available' });
            return;
          }
          const firstFragment = fragments[0];
          await startFragmentRestoration(firstFragment.id);
          break;

        case 'agents':
          const statuses = ghostArchiveService.getAgentStatuses();
          addOutput({
            type: 'output',
            content: `Active agents:\n${Object.entries(statuses).map(([id, status]) => `  - ${id}: ${status}`).join('\n')}`,
          });
          break;

        case 'clear':
          clearTerminal();
          break;

        case 'history':
          addOutput({
            type: 'output',
            content: `Command history:\n${commandHistory.slice(-20).map((cmd, i) => `  ${i + 1}. ${cmd}`).join('\n')}`,
          });
          break;

        default:
          addOutput({ type: 'error', content: `Unknown command: ${cmd}. Type 'help' for available commands.` });
      }
    } catch (error) {
      addOutput({
        type: 'error',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }, [addOutput, connectAgent, disconnectAgent, commandHistory, fragments, setCommandHistory]);

  const startFragmentRestoration = useCallback(async (fragmentId: string) => {
    const fragment = fragments.find(f => f.id === fragmentId);
    if (!fragment) {
      addOutput({ type: 'error', content: `Fragment ${fragmentId} not found` });
      return;
    }

    setActiveFragment(fragmentId);
    addOutput({
      type: 'output',
      content: `Starting restoration of: ${fragment.title}\n\n${fragment.corruptedText}`,
    });

    try {
      const result = await workflowEngine.executeWorkflow('fragment-restoration', { fragment });
      setWorkflows(prev => ({ ...prev, [fragmentId]: result }));
      
      if (result.success) {
        addOutput({
          type: 'output',
          content: `Restoration suggestions:\n${JSON.stringify(result.result, null, 2)}`,
        });
      } else {
        addOutput({
          type: 'error',
          content: `Restoration failed: ${result.error}`,
        });
      }
    } catch (error) {
      addOutput({
        type: 'error',
        content: `Restoration error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }, [fragments, addOutput]);

  const clearTerminal = useCallback(() => {
    setTerminalOutput([]);
  }, [setTerminalOutput]);

  const getPersonalities = useCallback(() => {
    return ghostArchiveService.getPersonalities();
  }, []);

  const getPersonality = useCallback((id: string) => {
    return ghostArchiveService.getPersonality(id);
  }, []);

  return (
    <GhostArchiveContext.Provider
      value={{
        activeAgents,
        connectedAgent,
        terminalOutput,
        fragments,
        activeFragment,
        loreEvents,
        workflows,
        commandHistory,
        connectAgent,
        disconnectAgent,
        addOutput,
        executeCommand,
        startFragmentRestoration,
        clearTerminal,
        getPersonalities,
        getPersonality,
      }}
    >
      {children}
    </GhostArchiveContext.Provider>
  );
};

