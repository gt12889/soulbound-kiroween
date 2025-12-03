/**
 * Options Display Component
 * Shows numbered options for user to select
 */

import React from 'react';
import type { TerminalOption } from '../../../contexts/GhostArchiveContext';
import styles from './OptionsDisplay.module.css';

interface OptionsDisplayProps {
  options: TerminalOption[];
  theme?: {
    textColor: string;
    glowColor: string;
  };
}

export const OptionsDisplay: React.FC<OptionsDisplayProps> = ({ options, theme }) => {
  if (options.length === 0) return null;

  return (
    <div className={styles.optionsDisplay}>
      <div className={styles.optionsTitle} style={{ color: theme?.textColor }}>
        Available Options:
      </div>
      {options.map((option) => (
        <div
          key={option.number}
          className={styles.optionItem}
          style={{ 
            color: theme?.textColor,
            textShadow: theme?.glowColor ? `0 0 5px ${theme.glowColor}` : undefined,
          }}
        >
          <span className={styles.optionNumber}>[{option.number}]</span>
          <span className={styles.optionDescription}>{option.description}</span>
        </div>
      ))}
      <div className={styles.optionsHint} style={{ color: theme?.textColor, opacity: 0.7 }}>
        Type a number (1-{options.length}) to select, or type your own input
      </div>
    </div>
  );
};

