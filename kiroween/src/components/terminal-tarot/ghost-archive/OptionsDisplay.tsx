/**
 * Options Display Component
 * Shows numbered suggestions below the terminal
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
    <div className={styles.optionsPanel}>
      <div className={styles.optionsHeader} style={{ color: theme?.textColor || '#00ff88' }}>
        💡 Quick Options:
      </div>
      <div className={styles.optionsGrid}>
        {options.map((option) => (
          <div
            key={option.number}
            className={styles.optionItem}
            style={{
              borderColor: theme?.textColor || '#00ff00',
              color: theme?.textColor || '#00ff00',
            }}
          >
            <span className={styles.optionNumber} style={{ color: theme?.glowColor || '#00ff88' }}>
              {option.number}
            </span>
            <span className={styles.optionDescription}>{option.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
