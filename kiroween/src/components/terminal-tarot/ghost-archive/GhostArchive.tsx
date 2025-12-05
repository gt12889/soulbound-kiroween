/**
 * GhostArchive Main Component
 * Terminal interface for connecting to historical personalities
 */

import React, { useMemo } from 'react';
import { useGhostArchive } from '../../../contexts/GhostArchiveContext';
import { CRTEffects } from './CRTEffects';
import { TerminalDisplay } from './TerminalDisplay';
import { CommandInput } from './CommandInput';
import { AgentStatusPanel } from './AgentStatusPanel';
import { WorkflowVisualizer } from './WorkflowVisualizer';
import { OptionsDisplay } from './OptionsDisplay';
// import CommandHints from './CommandHints';
// import StatusBar from './StatusBar';
import styles from './GhostArchive.module.css';

export const GhostArchive: React.FC = () => {
  const {
    terminalOutput,
    commandHistory,
    connectedAgent,
    activeAgents,
    workflows,
    availableOptions,
    executeCommand,
    getPersonality,
  } = useGhostArchive();

  // Get theme from connected agent
  const theme = useMemo(() => {
    if (connectedAgent) {
      const agent = getPersonality(connectedAgent);
      if (agent?.theme) {
        return {
          backgroundColor: agent.theme.backgroundColor,
          textColor: agent.theme.textColor,
          glowColor: agent.theme.glowColor,
          cursorStyle: agent.theme.cursorStyle as 'block' | 'underline' | 'none' | undefined,
        };
      }
    }
    return {
      backgroundColor: '#0a2e0a',
      textColor: '#00ff00',
      glowColor: '#00ff88',
    };
  }, [connectedAgent, getPersonality]);

  // Check if sidebar should be shown
  const showSidebar = activeAgents.length > 0 || Object.keys(workflows).length > 0;

  // Welcome message is handled by context initialization
  // No need to call help command here

  return (
    <div className={`${styles.ghostArchive} ghostArchive`}>
      <CRTEffects>
        <div className={styles.terminalContainer}>
          <div className={styles.terminalHeader}>
            <h2 className={styles.title}>Ghost Archive Terminal</h2>
            <p className={styles.subtitle}>
              Connect to historical personalities through the digital void
            </p>
          </div>

          <div className={styles.terminalWrapper}>
            {showSidebar && (
              <div className={styles.sidebar}>
                <AgentStatusPanel />
                <WorkflowVisualizer />
              </div>
            )}

            <div className={styles.mainTerminal}>
              <TerminalDisplay outputs={terminalOutput} theme={theme} />
              <CommandInput
                onExecute={executeCommand}
                history={commandHistory}
                theme={theme}
              />
            </div>
          </div>
        </div>
        {availableOptions.length > 0 && (
          <OptionsDisplay 
            options={availableOptions} 
            theme={theme}
            onOptionClick={executeCommand}
          />
        )}
      </CRTEffects>
    </div>
  );
};

