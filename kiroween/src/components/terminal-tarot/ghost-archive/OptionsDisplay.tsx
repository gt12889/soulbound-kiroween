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
  onOptionClick?: (command: string) => void;
}

export const OptionsDisplay: React.FC<OptionsDisplayProps> = ({ options, theme, onOptionClick }) => {
  if (options.length === 0) return null;

  const handleOptionClick = (option: TerminalOption) => {
    if (onOptionClick && option.command) {
      onOptionClick(option.command);
    }
  };

  return (
    <div className={styles.optionsPanel}>
      <div className={styles.optionsHeader} style={{ color: theme?.textColor || '#00ff88' }}>
        💡 Quick Options:
      </div>
      <div className={styles.optionsGrid}>
        {options.map((option) => (
          <button
            key={option.number}
            type="button"
            className={styles.optionItem}
            onClick={() => handleOptionClick(option)}
            style={{
              borderColor: theme?.textColor || '#00ff00',
              color: theme?.textColor || '#00ff00',
            }}
            title={`Click to execute: ${option.command}`}
          >
            <span className={styles.optionNumber} style={{ color: theme?.glowColor || '#00ff88' }}>
              {option.number}
            </span>
            <span className={styles.optionDescription}>{option.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
