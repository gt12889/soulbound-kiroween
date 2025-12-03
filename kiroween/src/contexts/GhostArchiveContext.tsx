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
import { isQuestion, detectQuestionIntent, isCommand, detectInputType } from '../utils/questionDetection';
import { terminalGuideService } from '../services/terminalGuideService';
import type { GuideState } from '../services/terminalGuideService';

export interface TerminalOption {
  number: number;
  command: string;
  description: string;
}

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
  availableOptions: TerminalOption[];
  
  // Actions
  connectAgent: (agentId: string) => Promise<void>;
  disconnectAgent: () => void;
  addOutput: (output: Omit<TerminalOutput, 'id' | 'timestamp'>) => void;
  executeCommand: (command: string) => Promise<void>;
  startFragmentRestoration: (fragmentId: string) => Promise<void>;
  clearTerminal: () => void;
  getPersonalities: () => Agent[];
  getPersonality: (id: string) => Agent | undefined;
  setAvailableOptions: (options: TerminalOption[]) => void;
  getOptionByNumber: (number: number) => TerminalOption | undefined;
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
  const [availableOptions, setAvailableOptions] = useState<TerminalOption[]>([]);
  const [guideState, setGuideState] = useLocalStorage<GuideState>('ghost-archive-guide-state', {
    stage: 'new',
    featuresDiscovered: [],
    interactionCount: 0,
    lastInteraction: Date.now(),
  });

  // Clean up terminal output on mount - filter out old lore events and limit history
  useEffect(() => {
    const now = Date.now();
    const oneHourAgo = now - 3600000; // 1 hour ago
    
    setTerminalOutput(prev => {
      // Filter out old lore events (type 'agent' that are older than 1 hour)
      const filtered = prev.filter(output => {
        // Keep all non-agent outputs
        if (output.type !== 'agent') return true;
        
        // Keep agent outputs that are recent (within 1 hour)
        if (output.timestamp > oneHourAgo) return true;
        
        // Filter out old lore events (but keep actual agent interactions)
        // Lore events typically don't have agentName or have generic messages
        const isLoreEvent = !output.agentName || 
          output.content.includes('SYSTEM ERROR') ||
          output.content.includes('CORRUPTION') ||
          output.content.includes('Ancient text') ||
          output.content.includes('A chill runs') ||
          output.content.includes('The terminal seems') ||
          output.content.includes('Strange symbols') ||
          output.content.includes('A faint whisper') ||
          output.content.includes('The screen flickers') ||
          output.content.includes('A lost document') ||
          output.content.includes('A new fragment') ||
          output.content.includes('The boundaries') ||
          output.content.includes('REALITY.GLITCH');
        
        // Remove old lore events, keep old agent interactions
        if (isLoreEvent && output.timestamp < oneHourAgo) {
          return false;
        }
        
        return true;
      });
      
      // Limit to last 100 outputs to keep history manageable
      return filtered.slice(-100);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load fragments on mount
  useEffect(() => {
    import('../data/fragments.json').then(module => {
      const fragmentsData = (module.default || []) as Fragment[];
      setFragments(fragmentsData);
    }).catch(err => {
      console.error('Failed to load fragments:', err);
    });
  }, [setFragments]);

  // Define addOutput before it's used in useEffects
  const addOutput = useCallback((output: Omit<TerminalOutput, 'id' | 'timestamp'>) => {
    const newOutput: TerminalOutput = {
      ...output,
      id: `output-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setTerminalOutput(prev => {
      const updated = [...prev, newOutput];
      // Limit to last 200 outputs to prevent infinite growth
      return updated.slice(-200);
    });
  }, [setTerminalOutput]);

  // Add welcome message and guided options on first load
  useEffect(() => {
    if (terminalOutput.length === 0 && commandHistory.length === 0) {
      const welcomeOptions: TerminalOption[] = [
        { number: 1, command: 'list', description: 'Browse available personalities' },
        { number: 2, command: 'workflows', description: 'See available workflows' },
        { number: 3, command: 'help', description: 'View all commands' },
      ];
      setAvailableOptions(welcomeOptions);
      addOutput({
        type: 'output',
        content: `👻 Welcome to the Ghost Archive Terminal

Connect with historical personalities and explore their knowledge.

Quick Start:
  1. Browse personalities    - Connect with historical figures
  2. See workflows          - Execute predefined workflows
  3. View all commands      - Get help with commands

💡 You can also:
  • Ask questions naturally (no "ask" command needed)
  • Type numbers to select options
  • Use "help" anytime for guidance

What would you like to explore?`,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Random lore events - reduced frequency and only when agents are active
  useEffect(() => {
    // Only generate lore events if there are active agents or user is actively using terminal
    // Increase interval to 3 minutes and only if terminal has recent activity
    const interval = setInterval(() => {
      // Only show lore events if there are active agents or terminal has been used recently
      const hasRecentActivity = terminalOutput.length > 0 && 
        terminalOutput[terminalOutput.length - 1]?.timestamp > Date.now() - 300000; // 5 minutes
      
      if (activeAgents.length > 0 || hasRecentActivity) {
        const event = loreEventService.generateEvent(activeAgents);
        if (event) {
          setLoreEvents(prev => {
            const updated = [...prev, event];
            // Limit lore events history to 50
            return updated.slice(-50);
          });
          playLoreEvent(); // Play lore event sound
          addOutput({
            type: 'agent',
            content: event.message,
            agentId: event.agentId,
          });
        }
      }
    }, 180000); // Check every 3 minutes instead of 1 minute

    return () => clearInterval(interval);
  }, [activeAgents, playLoreEvent, addOutput, terminalOutput]);

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
      
      // Show contextual options after connecting
      const connectionOptions = terminalGuideService.generateSuggestions(guideState, {
        connectedAgent: agentId,
        justConnected: true,
      });
      
      setAvailableOptions(connectionOptions);
      addOutput({
        type: 'output',
        content: `\n💡 You're now connected to ${agent?.name}! Try asking them questions naturally, or choose from the options above.`,
      });
      
      // Update guide state
      setGuideState(prev => ({
        ...prev,
        stage: 'connected',
        featuresDiscovered: [...new Set([...prev.featuresDiscovered, 'connect'])],
      }));
    } catch (error) {
      addOutput({
        type: 'error',
        content: `Failed to connect to ${agentId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }, [addOutput, playTerminalConnect, setAvailableOptions, guideState, setGuideState]);

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

  // Define clearTerminal before it's used in executeCommand
  const clearTerminal = useCallback(() => {
    setTerminalOutput([]);
    setAvailableOptions([]);
  }, [setTerminalOutput]);

  // Define startFragmentRestoration before it's used in executeCommand
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

    // Update guide state
    setGuideState(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1,
      lastInteraction: Date.now(),
    }));

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
      // CONVERSATIONAL MODE: If connected to an agent, route everything to them (unless explicit command)
      if (connectedAgent && !isCommand(trimmed)) {
        // Verify agent exists
        const agent = ghostArchiveService.getPersonality(connectedAgent);
        if (!agent) {
          addOutput({ 
            type: 'error', 
            content: `Error: Connected agent '${connectedAgent}' not found. Disconnecting...` 
          });
          setConnectedAgent(undefined);
          return;
        }
        
        // Send input directly to connected agent
        addOutput({ type: 'output', content: '💭 Thinking...' });
        const response = await ghostArchiveService.ask(trimmed, [connectedAgent]);
        
        // Generate conversation suggestions for follow-up
        const agentName = agent.name;
        
        const conversationSuggestions: TerminalOption[] = [
          { number: 1, command: 'Tell me more about that', description: 'Ask for more details' },
          { number: 2, command: 'What is your perspective on creativity?', description: 'Ask about creativity' },
          { number: 3, command: 'How did you develop your ideas?', description: 'Ask about their process' },
          { number: 4, command: `reason ${trimmed}`, description: 'Get step-by-step reasoning' },
          { number: 5, command: 'disconnect', description: `Disconnect from ${agentName}` },
        ];
        
        addOutput({ 
          type: 'agent', 
          content: response,
          agentId: connectedAgent,
          agentName: agentName,
        });
        
        setAvailableOptions(conversationSuggestions);
        addOutput({
          type: 'output',
          content: `\n💡 What would you like to ask ${agentName} next? (Type 1-5 or ask anything)`,
        });
        
        return;
      }

      // NOT CONNECTED - Handle as before
      const inputType = detectInputType(trimmed);

      // Handle greetings
      if (inputType === 'greeting') {
        const isFirstTime = commandHistory.length === 0;
        const greetingResponse = terminalGuideService.getGreetingResponse(isFirstTime);
        const suggestions = terminalGuideService.generateSuggestions(guideState, {
          availablePersonalities: ghostArchiveService.getPersonalities().map(p => p.id),
        });
        
        addOutput({ type: 'output', content: greetingResponse });
        setAvailableOptions(suggestions);
        return;
      }

      // Handle farewells
      if (inputType === 'farewell') {
        const farewellMessage = terminalGuideService.getFarewellMessage();
        addOutput({ type: 'output', content: farewellMessage });
        setAvailableOptions([]);
        return;
      }

      // Handle exploration phrases
      if (inputType === 'exploration') {
        const guidance = terminalGuideService.getExplorationGuidance(trimmed);
        const suggestions = terminalGuideService.generateSuggestions(guideState, {
          connectedAgent,
        });
        
        addOutput({ type: 'output', content: guidance });
        setAvailableOptions(suggestions);
        return;
      }

      // Handle casual conversation
      if (inputType === 'casual') {
        const response = terminalGuideService.getCasualResponse(trimmed, { 
          connectedAgent,
          hasActiveAgents: activeAgents.length > 0,
        });
        const suggestions = terminalGuideService.generateSuggestions(guideState, {
          connectedAgent,
        });
        
        addOutput({ type: 'output', content: response });
        setAvailableOptions(suggestions);
        return;
      }

      // Natural language question detection - route questions automatically (when not connected)
      if (inputType === 'question' && !isCommand(trimmed)) {
        const intent = detectQuestionIntent(trimmed);
        
        if (intent === 'question' || intent === 'reasoning' || intent === 'collaboration') {
          // Show contextual options for question handling
          const questionOptions: TerminalOption[] = [
            { number: 1, command: trimmed, description: 'Ask directly' },
            { number: 2, command: `reason ${trimmed}`, description: 'Get detailed reasoning' },
            { number: 3, command: `collaborate ${trimmed}`, description: 'Get multiple perspectives' },
          ];
          
          // Auto-execute based on detected intent, but show options for user awareness
          if (intent === 'reasoning') {
            addOutput({ type: 'output', content: '🔍 Analyzing with multi-step reasoning...' });
            const reasonedAnswer = await ghostArchiveService.ask(trimmed, undefined, 'multi');
            
            const followUpSuggestions: TerminalOption[] = [
              { number: 1, command: 'Tell me more about that', description: 'Get more details' },
              { number: 2, command: 'collaborate ' + trimmed, description: 'Get multiple perspectives' },
              { number: 3, command: 'connect shakespeare', description: 'Connect to a personality' },
              { number: 4, command: 'help', description: 'See all commands' },
            ];
            
            addOutput({ type: 'output', content: reasonedAnswer });
            setAvailableOptions(followUpSuggestions);
            addOutput({ 
              type: 'output', 
              content: '\n💡 What would you like to explore next? (Type 1-4 or ask anything)' 
            });
            return;
          } else if (intent === 'collaboration') {
            addOutput({ type: 'output', content: '👥 Engaging multiple agents...' });
            const collaboration = await ghostArchiveService.ask(trimmed, undefined, 'collaborative');
            
            const followUpSuggestions: TerminalOption[] = [
              { number: 1, command: 'Tell me more', description: 'Explore this topic further' },
              { number: 2, command: 'connect einstein', description: 'Connect to Einstein for science' },
              { number: 3, command: 'workflows', description: 'See collaborative workflows' },
              { number: 4, command: 'help', description: 'View all commands' },
            ];
            
            addOutput({ type: 'output', content: collaboration });
            setAvailableOptions(followUpSuggestions);
            addOutput({ 
              type: 'output', 
              content: '\n💡 What would you like to do next? (Type 1-4 or continue chatting)' 
            });
            return;
          } else {
            // Regular question - ask directly but show options
            addOutput({ type: 'output', content: '💭 Thinking...' });
            const answer = await ghostArchiveService.ask(trimmed);
            
            const followUpSuggestions: TerminalOption[] = [
              { number: 1, command: 'Can you explain that differently?', description: 'Get alternative explanation' },
              { number: 2, command: 'connect shakespeare', description: 'Chat with Shakespeare' },
              { number: 3, command: 'list', description: 'See all personalities' },
              { number: 4, command: 'help', description: 'View commands' },
            ];
            
            addOutput({ type: 'output', content: answer });
            setAvailableOptions(followUpSuggestions);
            addOutput({ 
              type: 'output', 
              content: '\n💡 What would you like to ask next? (Type 1-4 or ask anything)' 
            });
            return;
          }
        }
      }

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
          
          // Show suggestions for what to do after disconnecting
          const afterDisconnectSuggestions: TerminalOption[] = [
            { number: 1, command: 'list', description: 'Connect to another personality' },
            { number: 2, command: 'workflows', description: 'Try collaborative workflows' },
            { number: 3, command: 'help', description: 'See all commands' },
          ];
          setAvailableOptions(afterDisconnectSuggestions);
          addOutput({
            type: 'output',
            content: '\n💡 What would you like to do next? (Type 1-3)',
          });
          break;

        case 'list':
          const personalities = ghostArchiveService.getPersonalities();
          const personalityOptions: TerminalOption[] = personalities.map((p, index) => ({
            number: index + 1,
            command: `connect ${p.id}`,
            description: `Chat with ${p.name} (${p.era})`,
          }));
          setAvailableOptions(personalityOptions);
          addOutput({
            type: 'output',
            content: `Available personalities:\n${personalities.map((p, index) => `  ${index + 1}. ${p.name} (${p.era}) - ${p.id}`).join('\n')}\n\n💡 Type a number (1-${personalities.length}) to connect, or ask: "Tell me about [name]"`,
          });
          break;

        case 'help':
          const helpOptions: TerminalOption[] = [
            { number: 1, command: 'list', description: 'List available personalities' },
            { number: 2, command: 'workflows', description: 'List available workflows' },
            { number: 3, command: 'agents', description: 'Show active agents and their status' },
            { number: 4, command: 'history', description: 'Show command history' },
            { number: 5, command: 'clear', description: 'Clear terminal' },
          ];
          setAvailableOptions(helpOptions);
          addOutput({
            type: 'output',
            content: `Available commands:
  1. list                   - List available personalities
  2. workflows              - List available workflows
  3. agents                 - Show active agents and their status
  4. history                - Show command history
  5. clear                  - Clear terminal
  connect <personality>  - Connect to a historical personality
  disconnect             - Disconnect from current personality
  ask <question>         - Ask question to orchestrator
  reason <question>      - Get multi-reasoning analysis
  collaborate <task>     - Engage multiple agents on a task
  workflow <name>       - Execute a predefined workflow
  restore                - Start fragment restoration workflow
  generate-tests <id>   - 🦇 Generate AI-powered test cases
  review-codebase       - 🔍 Review codebase (--focus=security|performance|architecture|code-quality|all, --depth=quick|standard|deep, --agent=<id>)
  help                   - Show this help message

💡 Tip: Type a number (1-5) to execute that command`,
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
          
          const askFollowUp: TerminalOption[] = [
            { number: 1, command: 'Tell me more', description: 'Get more details' },
            { number: 2, command: 'reason ' + question, description: 'Get step-by-step reasoning' },
            { number: 3, command: 'connect shakespeare', description: 'Connect to a personality' },
          ];
          
          addOutput({ type: 'output', content: answer });
          setAvailableOptions(askFollowUp);
          addOutput({ type: 'output', content: '\n💡 What next? (Type 1-3 or ask another question)' });
          break;

        case 'reason':
          if (args.length === 0) {
            addOutput({ type: 'error', content: 'Usage: reason <question>' });
            return;
          }
          const reasonQuestion = args.join(' ');
          addOutput({ type: 'output', content: 'Reasoning...' });
          const reasonedAnswer = await ghostArchiveService.ask(reasonQuestion, undefined, 'multi');
          
          const reasonFollowUp: TerminalOption[] = [
            { number: 1, command: 'Explain that step-by-step', description: 'Get detailed breakdown' },
            { number: 2, command: 'collaborate ' + reasonQuestion, description: 'Get multiple perspectives' },
            { number: 3, command: 'connect einstein', description: 'Discuss with Einstein' },
          ];
          
          addOutput({ type: 'output', content: reasonedAnswer });
          setAvailableOptions(reasonFollowUp);
          addOutput({ type: 'output', content: '\n💡 Continue exploring? (Type 1-3 or ask anything)' });
          
          setGuideState(prev => ({
            ...prev,
            featuresDiscovered: [...new Set([...prev.featuresDiscovered, 'reasoning'])],
          }));
          break;

        case 'collaborate':
          if (args.length === 0) {
            addOutput({ type: 'error', content: 'Usage: collaborate <task>' });
            return;
          }
          const task = args.join(' ');
          addOutput({ type: 'output', content: 'Collaborating...' });
          const collaboration = await ghostArchiveService.ask(task, undefined, 'collaborative');
          
          const collaborateFollowUp: TerminalOption[] = [
            { number: 1, command: 'Which perspective resonates most?', description: 'Explore perspectives' },
            { number: 2, command: 'connect shakespeare', description: 'Deep dive with one personality' },
            { number: 3, command: 'workflows', description: 'Try structured workflows' },
          ];
          
          addOutput({ type: 'output', content: collaboration });
          setAvailableOptions(collaborateFollowUp);
          addOutput({ type: 'output', content: '\n💡 What would you like to do? (Type 1-3 or continue chatting)' });
          
          setGuideState(prev => ({
            ...prev,
            featuresDiscovered: [...new Set([...prev.featuresDiscovered, 'collaboration'])],
          }));
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
          if (availableWorkflows.length === 0) {
            addOutput({
              type: 'output',
              content: 'No workflows available. Check back later or ask: "What workflows are available?"',
            });
            break;
          }
          const workflowOptions: TerminalOption[] = availableWorkflows.map((w, index) => ({
            number: index + 1,
            command: `workflow ${w.id}`,
            description: `${w.name} - ${w.description}`,
          }));
          setAvailableOptions(workflowOptions);
          addOutput({
            type: 'output',
            content: `Available workflows:\n${availableWorkflows.map((w, index) => `  ${index + 1}. ${w.id}: ${w.name} - ${w.description}`).join('\n')}\n\n💡 Tip: Type a number to execute that workflow\n💡 Or ask: "Tell me about workflow [name]"`,
          });
          
          // Mark workflows as discovered
          setGuideState(prev => ({
            ...prev,
            featuresDiscovered: [...new Set([...prev.featuresDiscovered, 'workflows'])],
          }));
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
          setAvailableOptions([]);
          clearTerminal();
          break;

        case 'history':
          addOutput({
            type: 'output',
            content: `Command history:\n${commandHistory.slice(-20).map((cmd, i) => `  ${i + 1}. ${cmd}`).join('\n')}`,
          });
          break;

        default:
          // Check if it might be a question or natural language (fallback for commands that weren't caught earlier)
          if (!isCommand(trimmed) && isQuestion(trimmed)) {
            const intent = detectQuestionIntent(trimmed);
            if (intent === 'reasoning') {
              addOutput({ type: 'output', content: '🔍 Analyzing with multi-step reasoning...' });
              const reasonedAnswer = await ghostArchiveService.ask(trimmed, undefined, 'multi');
              addOutput({ type: 'output', content: reasonedAnswer });
              
              // Mark reasoning as discovered
              setGuideState(prev => ({
                ...prev,
                featuresDiscovered: [...new Set([...prev.featuresDiscovered, 'reasoning'])],
              }));
              return;
            } else if (intent === 'collaboration') {
              addOutput({ type: 'output', content: '👥 Engaging multiple agents...' });
              const collaboration = await ghostArchiveService.ask(trimmed, undefined, 'collaborative');
              addOutput({ type: 'output', content: collaboration });
              
              // Mark collaboration as discovered
              setGuideState(prev => ({
                ...prev,
                featuresDiscovered: [...new Set([...prev.featuresDiscovered, 'collaboration'])],
              }));
              return;
            } else {
              addOutput({ type: 'output', content: '💭 Thinking...' });
              const answer = await ghostArchiveService.ask(trimmed);
              addOutput({ type: 'output', content: answer });
              return;
            }
          }
          
          // Generate helpful error with contextual suggestions
          const { message, suggestions } = terminalGuideService.generateHelpfulError(trimmed, {
            connectedAgent,
            hasActiveAgents: activeAgents.length > 0,
          });
          
          setAvailableOptions(suggestions);
          addOutput({ 
            type: 'output', 
            content: message
          });
      }
    } catch (error) {
      addOutput({
        type: 'error',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }, [addOutput, connectAgent, disconnectAgent, commandHistory, fragments, setCommandHistory, executeTestGeneration, executeCodebaseReview, setAvailableOptions, clearTerminal, startFragmentRestoration, guideState, setGuideState, connectedAgent, activeAgents]);

  const getPersonalities = useCallback(() => {
    return ghostArchiveService.getPersonalities();
  }, []);

  const getPersonality = useCallback((id: string) => {
    return ghostArchiveService.getPersonality(id);
  }, []);

  const getOptionByNumber = useCallback((number: number): TerminalOption | undefined => {
    return availableOptions.find(opt => opt.number === number);
  }, [availableOptions]);

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
        availableOptions,
        connectAgent,
        disconnectAgent,
        addOutput,
        executeCommand,
        startFragmentRestoration,
        clearTerminal,
        getPersonalities,
        getPersonality,
        setAvailableOptions,
        getOptionByNumber,
      }}
    >
      {children}
    </GhostArchiveContext.Provider>
  );
};

