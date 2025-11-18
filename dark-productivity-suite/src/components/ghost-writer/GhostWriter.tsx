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
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const suggestionIdCounter = useRef(0);

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
      return;
    }

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

  // Test Gemini API connection
  const handleTestAPI = useCallback(async () => {
    setIsTesting(true);
    setTestResult('Testing Gemini API...');
    
    try {
      const provider = import.meta.env.VITE_AI_PROVIDER || 'openrouter';
      const apiKey = provider === 'gemini' 
        ? import.meta.env.VITE_GEMINI_API_KEY 
        : import.meta.env.VITE_OPENROUTER_API_KEY;
      
      setTestResult(`Provider: ${provider}\nAPI Key: ${apiKey ? '✓ Configured' : '✗ Missing'}\n\nTesting connection...`);
      
      const testContext = 'Once upon a time in a dark and mysterious forest';
      const suggestion = await aiService.getSuggestion(testContext);
      
      setTestResult(
        `✓ SUCCESS!\n\n` +
        `Provider: ${provider}\n` +
        `Model: ${import.meta.env.VITE_AI_MODEL || 'default'}\n` +
        `API Key: Configured\n\n` +
        `Test prompt: "${testContext}"\n\n` +
        `Response: "${suggestion}"\n\n` +
        `Gemini is working correctly!`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult(
        `✗ ERROR\n\n` +
        `${errorMessage}\n\n` +
        `Check:\n` +
        `1. VITE_GEMINI_API_KEY in .env\n` +
        `2. VITE_AI_PROVIDER=gemini in .env\n` +
        `3. Dev server restarted\n` +
        `4. API key is valid\n\n` +
        `See browser console for details.`
      );
      console.error('Gemini test failed:', error);
    } finally {
      setIsTesting(false);
    }
  }, []);

  return (
    <div className={styles.ghostWriter}>
      {/* Ambient fog layers - Requirement 3.4 */}
      <div className={`${styles.fogLayer} ambient-fog-layer ambient-fog-slow`} />
      <div className={`${styles.fogLayer} ambient-fog-layer ambient-fog-medium`} />
      <div className={`${styles.fogLayer} ambient-fog-layer ambient-fog-fast`} />
      
      <div className={styles.header}>
        <h1 className={styles.title}>Ghost Writer</h1>
        <p className={styles.subtitle}>Let spectral whispers guide your words...</p>
      </div>
      
      <div className={styles.editorWrapper} ref={editorRef}>
        <WritingEditor
          onTextChange={handleTextChange}
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
