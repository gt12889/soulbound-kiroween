/**
 * Command Input Component
 * Handles command input with history navigation
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAudio } from '../../../hooks/useAudio';
import { useGhostArchive } from '../../../contexts/GhostArchiveContext';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { playTerminalType } = useAudio();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { getOptionByNumber, setAvailableOptions } = useGhostArchive();

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

  const executeCommand = useCallback(() => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isProcessing) return;

    setIsProcessing(true);

    // Check if input is a number and map it to an option
    const numberInput = parseInt(trimmedInput, 10);
    if (!isNaN(numberInput) && numberInput > 0) {
      const option = getOptionByNumber(numberInput);
      if (option) {
        playTerminalType();
        setAvailableOptions([]);
        onExecute(option.command);
        setInput('');
        setHistoryIndex(-1);
        setIsProcessing(false);
        return;
      }
    }

    // Regular command execution
    if (trimmedInput) {
      playTerminalType();
      if (isNaN(numberInput)) {
        setAvailableOptions([]);
      }
      onExecute(trimmedInput);
      setInput('');
      setHistoryIndex(-1);
    }
    
    setIsProcessing(false);
  }, [input, isProcessing, onExecute, playTerminalType, getOptionByNumber, setAvailableOptions]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    executeCommand();
  }, [executeCommand]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter creates new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand();
    } else if (e.key === 'ArrowUp' && !e.shiftKey && input === '') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown' && !e.shiftKey && input === '') {
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
  }, [executeCommand, history, historyIndex, input]);

  return (
    <div className={styles.commandInputWrapper}>
      <form onSubmit={handleSubmit} className={styles.commandInputForm}>
        <div className={styles.inputContainer}>
          <span className={styles.prompt} style={{ color: theme?.textColor || '#00ff88' }}>
            {prompt}
          </span>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setHistoryIndex(-1);
              
              // Auto-resize textarea
              if (inputRef.current) {
                inputRef.current.style.height = 'auto';
                inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
              }
              
              // Play typing sound with debounce
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }
              typingTimeoutRef.current = setTimeout(() => {
                if (e.target.value.length > 0) {
                  playTerminalType();
                }
              }, 150);
            }}
            onKeyDown={handleKeyDown}
            className={styles.textarea}
            style={{
              color: theme?.textColor || '#00ff00',
              textShadow: theme?.glowColor ? `0 0 8px ${theme.glowColor}` : undefined,
            }}
            placeholder="Type your incantation here..."
            autoComplete="off"
            spellCheck={false}
            rows={1}
            aria-label="Terminal command input"
          />
        </div>
        <button
          type="submit"
          className={styles.sendButton}
          disabled={!input.trim() || isProcessing}
          style={{
            borderColor: theme?.glowColor || '#00ff88',
            color: theme?.textColor || '#00ff00',
          }}
          aria-label="Send command"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </form>
    </div>
  );
};

