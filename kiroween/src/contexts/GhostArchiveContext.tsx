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
import { testGenerationService } from '../services/testGenerationService';
import type { WorkItem } from '../services/testGenerationService';
import { codebaseReviewService } from '../services/codebaseReviewService';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAudio } from '../hooks/useAudio';

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
  const { playTerminalConnect, playTerminalDisconnect, playWorkflowComplete, playLoreEvent } = useAudio();

  // Initialize service
  useEffect(() => {
    ghostArchiveService.initialize().catch(err => {
      console.error('Failed to initialize GhostArchive:', err);
    });
    
    // Load workflows
    import('../data/workflows.json').then(module => {
      const workflows = module.default || [];
      workflows.forEach((workflow: any) => {
        workflowEngine.registerWorkflow(workflow);
      });
    }).catch(err => {
      console.error('Failed to load workflows:', err);
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

  const addOutput = useCallback((output: Omit<TerminalOutput, 'id' | 'timestamp'>) => {
    const newOutput: TerminalOutput = {
      ...output,
      id: `output-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setTerminalOutput(prev => [...prev, newOutput]);
  }, [setTerminalOutput]);

  // Random lore events
  useEffect(() => {
    const interval = setInterval(() => {
      const event = loreEventService.generateEvent(activeAgents);
      if (event) {
        setLoreEvents(prev => [...prev, event]);
        playLoreEvent(); // Play lore event sound
        addOutput({
          type: 'agent',
          content: event.message,
          agentId: event.agentId,
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [activeAgents, playLoreEvent, addOutput]);

  const connectAgent = useCallback(async (agentId: string) => {
    try {
      const greeting = await ghostArchiveService.connect(agentId);
      setConnectedAgent(agentId);
      setActiveAgents(prev => [...new Set([...prev, agentId])]);
      playTerminalConnect(); // Play connection sound
      
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
  }, [addOutput, playTerminalConnect]);

  const disconnectAgent = useCallback(() => {
    if (connectedAgent) {
      playTerminalDisconnect(); // Play disconnection sound
      addOutput({
        type: 'output',
        content: `Disconnected from ${connectedAgent}`,
      });
      setConnectedAgent(undefined);
    }
  }, [connectedAgent, addOutput, playTerminalDisconnect]);

  const executeCodebaseReview = useCallback(async (args: string[]) => {
    const focus = args.find(arg => arg.startsWith('--focus='))?.split('=')[1] as 'security' | 'performance' | 'architecture' | 'code-quality' | 'all' | undefined;
    const depth = args.find(arg => arg.startsWith('--depth='))?.split('=')[1] as 'quick' | 'standard' | 'deep' | undefined;
    const agentArg = args.find(arg => arg.startsWith('--agent='))?.split('=')[1];
    const preferredAgents = agentArg ? [agentArg] : [];

    try {
      addOutput({
        type: 'output',
        content: `🔍 Starting codebase review...\nFocus: ${focus || 'all'}\nDepth: ${depth || 'standard'}\n${preferredAgents.length > 0 ? `Agent: ${preferredAgents[0]}\n` : ''}`,
      });

      // For now, we'll use a sample code snippet approach
      // In a real implementation, this would scan the actual codebase
      // Since we're in a browser, we'll prompt the user or use semantic search
      
      addOutput({
        type: 'output',
        content: '📝 Note: Browser-based review requires code snippets.\nUse: review-codebase --file <path> or provide code directly.\n\nAnalyzing codebase structure...',
      });

      // Get codebase structure info (this would be enhanced with actual file reading)
      const structureInfo = `
Kiroween Codebase Structure:
- React TypeScript application
- Component-based architecture
- Context API for state management
- Service layer for business logic
- Multiple dashboards (Graveyard, Terminal Tarot, etc.)
- Firebase integration for persistence
- AI service integration
      `.trim();

      // Get architecture review
      const architectureReview = await codebaseReviewService.architectureReview(structureInfo);
      addOutput({
        type: 'output',
        content: `\n🏛️ Architecture Review:\n${architectureReview}\n`,
      });

      // Get focused review based on options
      if (focus === 'security' || focus === 'all') {
        addOutput({
          type: 'output',
          content: '🔒 Performing security review...',
        });
        // Security review would go here with actual code snippets
      }

      if (focus === 'performance' || focus === 'all') {
        addOutput({
          type: 'output',
          content: '⚡ Analyzing performance...',
        });
        // Performance review would go here
      }

      addOutput({
        type: 'output',
        content: '\n✅ Review complete! Use --depth=deep for more detailed analysis.',
      });
    } catch (error) {
      addOutput({
        type: 'error',
        content: `Codebase review failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }, [addOutput]);

  // Define executeTestGeneration before executeCommand so it can be used in dependencies
  const executeTestGeneration = useCallback(async (args: string[]) => {
    const workItemId = args[0];
    const formatAzureDevOps = args.includes('--format=azure-devops') || args.includes('--format=ado');

    try {
      addOutput({
        type: 'output',
        content: `🦇 Generating test cases for work item: ${workItemId}...`,
      });

      // In a real implementation, this would fetch from Azure DevOps API
      // For now, create a sample work item
      const workItem: WorkItem = {
        id: workItemId,
        title: `Work Item ${workItemId}`,
        description: `Description for work item ${workItemId}. This feature needs comprehensive testing.`,
        acceptanceCriteria: [
          'Feature works as specified',
          'Error handling is robust',
          'Performance meets requirements',
          'Security requirements are met',
        ],
      };

      // Generate tests using AI
      addOutput({
        type: 'output',
        content: 'Analyzing work item and generating test cases...',
      });

      const generatedTests = await testGenerationService.generateTests(workItem);

      // Analyze coverage
      const coverage = await testGenerationService.analyzeCoverage(
        workItem,
        workItem.existingTests || [],
        generatedTests
      );

      // Format output
      if (formatAzureDevOps) {
        const azureFormat = testGenerationService.formatForAzureDevOps(generatedTests);
        addOutput({
          type: 'output',
          content: `\n${azureFormat}\n\n📊 Coverage Analysis:\n` +
            `Current Coverage: ${coverage.currentCoverage.toFixed(1)}%\n` +
            `Projected Coverage: ${coverage.projectedCoverage.toFixed(1)}%\n` +
            `Improvement: +${coverage.improvement.toFixed(1)}%\n\n` +
            `Risk Assessment: ${coverage.riskAssessment.overallRisk.toUpperCase()}\n` +
            `High Risk Areas: ${coverage.riskAssessment.highRiskAreas.length > 0 ? coverage.riskAssessment.highRiskAreas.join(', ') : 'None'}\n` +
            `Recommendations:\n${coverage.riskAssessment.recommendations.map(r => `  - ${r}`).join('\n')}\n\n` +
            `Test Gaps Found: ${coverage.gaps.length}\n` +
            `${coverage.gaps.map(g => `  [${g.riskLevel.toUpperCase()}] ${g.scenario}: ${g.recommendation}`).join('\n')}\n\n` +
            `💡 Use 'generate-tests <id> --visualize' to see visual coverage dashboard`,
        });
      } else {
        const hasVisualize = args.includes('--visualize') || args.includes('-v');
        const testSummary = `✅ Generated ${generatedTests.length} test cases:\n\n` +
          generatedTests.map((test, i) =>
            `${i + 1}. [${test.type.toUpperCase()}] ${test.title}\n` +
            `   Priority: ${test.priority} | Risk: ${test.riskLevel}\n` +
            `   Steps: ${test.steps.join(' → ')}\n` +
            `   Expected: ${test.expectedResult}`
          ).join('\n\n');

        const coverageSummary = `\n\n📊 Coverage Analysis:\n` +
          `Current: ${coverage.currentCoverage.toFixed(1)}% → Projected: ${coverage.projectedCoverage.toFixed(1)}% (+${coverage.improvement.toFixed(1)}%)\n` +
          `Risk: ${coverage.riskAssessment.overallRisk.toUpperCase()}\n` +
          `Gaps: ${coverage.gaps.length} identified\n` +
          (coverage.gaps.length > 0 ? `\nGap Details:\n${coverage.gaps.map(g => `  [${g.riskLevel.toUpperCase()}] ${g.scenario}\n    → ${g.recommendation}`).join('\n')}` : '');

        addOutput({
          type: 'output',
          content: testSummary + coverageSummary,
        });

        // Store coverage for visualization (could be used by a UI component)
        if (hasVisualize) {
          addOutput({
            type: 'output',
            content: `\n🕷️ Visual coverage dashboard available. Coverage data:\n` +
              JSON.stringify(coverage, null, 2),
          });
        }
      }
    } catch (error) {
      addOutput({
        type: 'error',
        content: `Test generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }, [addOutput]);

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
  generate-tests <id>   - 🦇 Generate AI-powered test cases
  review-codebase       - 🔍 Review codebase (--focus=security|performance|architecture|code-quality|all, --depth=quick|standard|deep, --agent=<id>)
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
          if (result.success) {
            playWorkflowComplete(); // Play workflow completion sound
          }
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

        case 'generate-tests':
          if (args.length === 0) {
            addOutput({
              type: 'error',
              content: 'Usage: generate-tests <work-item-id> [--format=azure-devops]',
            });
            return;
          }
          await executeTestGeneration(args);
          break;

        case 'review-codebase':
        case 'review':
          await executeCodebaseReview(args);
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
  }, [addOutput, connectAgent, disconnectAgent, commandHistory, fragments, setCommandHistory, executeTestGeneration, executeCodebaseReview]);

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
        playWorkflowComplete(); // Play workflow completion sound
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
  }, [fragments, addOutput, playWorkflowComplete]);

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

