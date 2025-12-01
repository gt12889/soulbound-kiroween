/**
 * Agent Status Panel Component
 * Shows active agents and their status
 */

import React from 'react';
import { useGhostArchive } from '../../../contexts/GhostArchiveContext';
import { ghostArchiveService } from '../../../services/ghostArchiveService';
import styles from './AgentStatusPanel.module.css';

export const AgentStatusPanel: React.FC = () => {
  const { activeAgents, connectedAgent } = useGhostArchive();
  const statuses = ghostArchiveService.getAgentStatuses();
  const personalities = ghostArchiveService.getPersonalities();

  if (activeAgents.length === 0) {
    return null;
  }

  return (
    <div className={styles.agentStatusPanel}>
      <div className={styles.panelTitle}>Active Agents</div>
      <div className={styles.agentList}>
        {activeAgents.map(agentId => {
          const agent = personalities.find(p => p.id === agentId);
          const status = statuses[agentId] || 'idle';
          
          if (!agent) return null;

          return (
            <div
              key={agentId}
              className={`${styles.agentItem} ${connectedAgent === agentId ? styles.connected : ''}`}
            >
              <div className={styles.agentName}>{agent.name}</div>
              <div className={styles.agentEra}>{agent.era}</div>
              <div className={`${styles.agentStatus} ${styles[status]}`}>
                <span className={styles.statusDot}></span>
                {status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

