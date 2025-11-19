import React, { useState, useCallback, useRef, useEffect } from 'react';
import WritingEditor from './WritingEditor';
import GhostSuggestion from './GhostSuggestion';
import type { GhostSuggestion as GhostSuggestionType } from '../../types';
import aiService from '../../services/aiService';
import styles from './GhostWriter.module.css';

// Constants
const MIN_CONTEXT_LENGTH = 10;
const DEBUG = import.meta.env.DEV;

// Debug logging helper
const log = (...args: any[]) => {
  if (DEBUG) console.log('[Ghost Writer]', ...args);
};

const GhostWriter: React.FC = () => {
  const [suggestions, setSuggestions] = useState<GhostSuggestionType[]>([]);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | undefined>();
  const [showHint, setShowHint] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const suggestionIdCounter = useRef(0);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize AI service with environment variables
  useEffect(() => {
    const provider = (import.meta.env.VITE_AI_PROVIDER || 'openrouter') as 'openai' | 'openrouter' | 'gemini';
    
    // Select appropriate API key based on provider
    let apiKey = '';
    if (provider === 'gemini') {
      apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    } else {
      apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    }
    
    // Select appropriate default model based on provider
    let model = import.meta.env.VITE_AI_MODEL || '';
    if (!model) {
      if (provider === 'gemini') {
        model = 'gemini-pro';
      } else {
        model = 'nvidia/llama-3.1-nemotron-70b-instruct';
      }
    }

    aiService.configure({
      apiKey,
      provider,
      model,
    });
  }, []);

  // Handle text changes and generate suggestions
  const handleTextChange = useCallback(async (_text: string, context: string, position: number) => {
    log('Text changed, context length:', context.trim().length);
    
    // Only generate suggestions if there's meaningful context
    if (context.trim().length < MIN_CONTEXT_LENGTH) {
      log('Context too short, skipping suggestion');
      setSuggestions([]);
      
      // Show hint if user has typed something but it's too short
      if (context.trim().length > 0 && context.trim().length < MIN_CONTEXT_LENGTH) {
        setShowHint(true);
        // Auto-hide hint after 3 seconds
        if (hintTimeoutRef.current) {
          clearTimeout(hintTimeoutRef.current);
        }
        hintTimeoutRef.current = setTimeout(() => {
          setShowHint(false);
        }, 3000);
      } else {
        setShowHint(false);
      }
      return;
    }
    
    // Hide hint when context is sufficient
    setShowHint(false);

    try {
      log('Requesting suggestion for context:', context.substring(0, 50) + '...');
      const suggestionText = await aiService.getSuggestion(context);
      log('Received suggestion:', suggestionText);
      
      // Create new suggestion
      const newSuggestion: GhostSuggestionType = {
        id: `suggestion-${++suggestionIdCounter.current}`,
        text: suggestionText,
        position,
        confidence: 0.8,
      };

      // Get cursor position for suggestion placement
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setCursorPosition({ x: rect.left, y: rect.bottom });
        log('Cursor position:', { x: rect.left, y: rect.bottom });
      }

      // Replace existing suggestions with new one
      log('Setting suggestion:', newSuggestion);
      setSuggestions([newSuggestion]);
    } catch (error) {
      console.error('[Ghost Writer] Error generating suggestion:', error);
      setSuggestions([]);
    }
  }, []);

  // Handle suggestion acceptance
  const handleSuggestionAccept = useCallback((suggestion: GhostSuggestionType) => {
    // Insert suggestion into editor
    if (editorRef.current && (editorRef.current as any).insertSuggestion) {
      (editorRef.current as any).insertSuggestion(suggestion.text);
    }

    // Clear suggestions
    setSuggestions([]);
  }, []);

  // Handle suggestion dismissal
  const handleSuggestionDismiss = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  }, []);

  // Accept first suggestion (for double-tab shortcut)
  const acceptFirstSuggestion = useCallback(() => {
    if (suggestions.length > 0) {
      log('Accepting first suggestion via double-tab');
      handleSuggestionAccept(suggestions[0]);
      return true;
    }
    return false;
  }, [suggestions, handleSuggestionAccept]);

  return (
    <div className={styles.ghostWriter}>
      {/* Ambient fog layers - Requirement 3.4 */}
      <div className={`${styles.fogLayer} ambient-fog-layer ambient-fog-slow`} />
      <div className={`${styles.fogLayer} ambient-fog-layer ambient-fog-medium`} />
      <div className={`${styles.fogLayer} ambient-fog-layer ambient-fog-fast`} />
      
      <div className={styles.header}>
        <h1 className={styles.title}>Ghost Writer</h1>
        <p className={styles.subtitle}>Let spectral whispers guide your words...</p>
        {showHint && (
          <div className={styles.hint}>
            💀 Write at least {MIN_CONTEXT_LENGTH} characters to summon suggestions...
          </div>
        )}
      </div>
      
      <div className={styles.editorWrapper} ref={editorRef}>
        <WritingEditor
          onTextChange={handleTextChange}
          onAcceptSuggestion={acceptFirstSuggestion}
          hasSuggestion={suggestions.length > 0}
        />
        
        {suggestions.map(suggestion => (
          <GhostSuggestion
            key={suggestion.id}
            suggestion={suggestion}
            onAccept={handleSuggestionAccept}
            onDismiss={handleSuggestionDismiss}
            cursorPosition={cursorPosition}
          />
        ))}
      </div>
    </div>
  );
};

export default GhostWriter;
