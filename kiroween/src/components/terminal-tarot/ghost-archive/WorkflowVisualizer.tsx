/**
 * Workflow Visualizer Component
 * Shows workflow execution progress
 */

import React from 'react';
import { useGhostArchive } from '../../../contexts/GhostArchiveContext';
import { workflowEngine } from '../../../services/workflowEngine';
import styles from './WorkflowVisualizer.module.css';

export const WorkflowVisualizer: React.FC = () => {
  const { workflows } = useGhostArchive();
  const activeWorkflows = Object.entries(workflows).filter(([_, result]) => 
    workflowEngine.getWorkflowStatus(_)?.status === 'running'
  );

  if (activeWorkflows.length === 0) {
    return null;
  }

  return (
    <div className={styles.workflowVisualizer}>
      <div className={styles.visualizerTitle}>Active Workflows</div>
      {activeWorkflows.map(([workflowId, result]) => {
        const status = workflowEngine.getWorkflowStatus(workflowId);
        if (!status) return null;

        return (
          <div key={workflowId} className={styles.workflowItem}>
            <div className={styles.workflowHeader}>
              <span className={styles.workflowName}>{workflowId}</span>
              <span className={styles.workflowStatus}>{status.status}</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${status.progress}%` }}
              />
            </div>
            {status.currentStep && (
              <div className={styles.currentStep}>
                Current step: {status.currentStep}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

