/**
 * Command Input Component
 * Handles command input with history navigation
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './CommandInput.module.css';

interface CommandInputProps {
  onExecute: (command: string) => void;
  history: string[];
  prompt?: string;
  theme?: {
    textColor: string;
    glowColor: string;
  };
}

export const CommandInput: React.FC<CommandInputProps> = ({
  onExecute,
  history,
  prompt = 'ghost@archive:~$ ',
  theme,
}) => {
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onExecute(input);
      setInput('');
      setHistoryIndex(-1);
    }
  }, [input, onExecute]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // TODO: Implement tab completion
    }
  }, [history, historyIndex]);

  return (
    <form onSubmit={handleSubmit} className={styles.commandInputForm}>
      <span className={styles.prompt} style={{ color: theme?.textColor || '#00ff88' }}>
        {prompt}
      </span>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setHistoryIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        className={styles.input}
        style={{
          color: theme?.textColor || '#00ff00',
          textShadow: theme?.glowColor ? `0 0 8px ${theme.glowColor}` : undefined,
        }}
        autoComplete="off"
        spellCheck={false}
        aria-label="Terminal command input"
      />
      <span className={styles.cursor} style={{ backgroundColor: theme?.textColor || '#00ff00' }}>
        ▋
      </span>
    </form>
  );
};

