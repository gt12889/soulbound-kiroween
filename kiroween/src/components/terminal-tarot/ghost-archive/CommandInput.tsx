/**
 * Command Input Component
 * Handles command input with history navigation
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAudio } from '../../../hooks/useAudio';
import styles from './CommandInput.module.css';

interface CommandInputProps {
  onExecute: (command: string) => void;
  history: string[];
  prompt?: string;
  theme?: {
    textColor: string;
    glowColor: string;
    cursorStyle?: 'block' | 'underline' | 'none';
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
  const { playTerminalType } = useAudio();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      playTerminalType(); // Play typing sound on command execution
      onExecute(input);
      setInput('');
      setHistoryIndex(-1);
    }
  }, [input, onExecute, playTerminalType]);

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
          
          // Play typing sound with debounce
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            if (e.target.value.length > 0) {
              playTerminalType();
            }
          }, 150); // Debounce typing sounds
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
      {theme?.cursorStyle !== 'none' && (
        <span
          className={`${styles.cursor} ${
            theme?.cursorStyle === 'underline' ? styles.cursorUnderline : styles.cursorBlock
          }`}
          style={{ backgroundColor: theme?.textColor || '#00ff00' }}
        >
          {theme?.cursorStyle === 'underline' ? '▁' : '▋'}
        </span>
      )}
    </form>
  );
};

