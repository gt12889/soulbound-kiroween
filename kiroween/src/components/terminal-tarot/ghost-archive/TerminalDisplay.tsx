/**
 * Terminal Display Component
 * Shows terminal output with typewriter animation
 */

import React, { useEffect, useRef, memo } from 'react';
import type { TerminalOutput } from '../../../types/ghostArchive';
import styles from './TerminalDisplay.module.css';

interface TerminalDisplayProps {
  outputs: TerminalOutput[];
  theme?: {
    backgroundColor: string;
    textColor: string;
    glowColor: string;
  };
}

export const TerminalDisplay: React.FC<TerminalDisplayProps> = memo(({ outputs, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const lastOutputCount = useRef(outputs.length);

  // On initial mount with existing history, scroll to bottom
  // But don't auto-scroll if user manually scrolls up
  useEffect(() => {
    if (containerRef.current && isInitialMount.current && outputs.length > 0) {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
        isInitialMount.current = false;
      }, 100);
    }
  }, []); // Only run on mount

  // Auto-scroll to bottom on new output, but only if user is near bottom
  useEffect(() => {
    if (containerRef.current && !isInitialMount.current) {
      const container = containerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      // Only auto-scroll if user is near the bottom (within 100px) and new output was added
      if (isNearBottom && outputs.length > lastOutputCount.current) {
        container.scrollTop = container.scrollHeight;
      }
      
      lastOutputCount.current = outputs.length;
    }
  }, [outputs]);

  const getOutputClassName = (output: TerminalOutput): string => {
    const base = styles.outputLine;
    switch (output.type) {
      case 'command':
        return `${base} ${styles.command}`;
      case 'error':
        return `${base} ${styles.error}`;
      case 'agent':
        return `${base} ${styles.agent}`;
      case 'reasoning':
        return `${base} ${styles.reasoning}`;
      case 'workflow':
        return `${base} ${styles.workflow}`;
      default:
        return `${base} ${styles.output}`;
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div
      ref={containerRef}
      className={styles.terminalDisplay}
      style={{
        backgroundColor: theme?.backgroundColor || '#0a2e0a',
        color: theme?.textColor || '#00ff00',
      }}
    >
      {outputs.length === 0 && (
        <div className={styles.welcomeMessage}>
          <div className={styles.welcomeTitle}>Ghost Archive Terminal</div>
          <div className={styles.welcomeText}>
            Connecting to the digital realm of historical personalities...
          </div>
          <div className={styles.welcomeHint}>
            Type 'help' for available commands
          </div>
        </div>
      )}
      
      {outputs.map((output) => (
        <div
          key={output.id}
          className={getOutputClassName(output)}
          style={{
            textShadow: theme?.glowColor ? `0 0 8px ${theme.glowColor}` : undefined,
          }}
        >
          {output.type === 'command' && (
            <span className={styles.prompt}>ghost@archive:~$ </span>
          )}
          
          {output.type === 'agent' && output.agentName && (
            <span className={styles.agentTag}>[{output.agentName}] </span>
          )}
          
          {output.type === 'reasoning' && (
            <span className={styles.reasoningTag}>[REASONING] </span>
          )}
          
          {output.type === 'workflow' && (
            <span className={styles.workflowTag}>[WORKFLOW] </span>
          )}
          
          <span className={styles.outputContent}>{output.content}</span>
          
          {output.reasoning && output.reasoning.length > 0 && (
            <div className={styles.reasoningSteps}>
              {output.reasoning.map((step, idx) => (
                <div key={idx} className={styles.reasoningStep}>
                  <span className={styles.stepNumber}>Step {step.step}:</span>
                  <span className={styles.stepThought}>{step.thought}</span>
                  {step.alternatives && step.alternatives.length > 0 && (
                    <div className={styles.alternatives}>
                      {step.alternatives.map((alt, altIdx) => (
                        <div key={altIdx} className={styles.alternative}>
                          • {alt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <span className={styles.timestamp}>{formatTimestamp(output.timestamp)}</span>
        </div>
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memoization
  return (
    prevProps.outputs.length === nextProps.outputs.length &&
    prevProps.outputs.every((output, idx) => output.id === nextProps.outputs[idx]?.id) &&
    prevProps.theme?.textColor === nextProps.theme?.textColor &&
    prevProps.theme?.glowColor === nextProps.theme?.glowColor &&
    prevProps.theme?.backgroundColor === nextProps.theme?.backgroundColor
  );
});

TerminalDisplay.displayName = 'TerminalDisplay';

