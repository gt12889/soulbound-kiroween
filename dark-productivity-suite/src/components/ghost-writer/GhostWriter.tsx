import React, { useState, useCallback, useRef } from 'react';
import WritingEditor from './WritingEditor';
import GhostSuggestion from './GhostSuggestion';
import type { GhostSuggestion as GhostSuggestionType } from '../../types';
import aiService from '../../services/aiService';
import styles from './GhostWriter.module.css';

const GhostWriter: React.FC = () => {
  const [suggestions, setSuggestions] = useState<GhostSuggestionType[]>([]);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | undefined>();
  const editorRef = useRef<HTMLDivElement>(null);
  const suggestionIdCounter = useRef(0);

  // Handle text changes and generate suggestions
  const handleTextChange = useCallback(async (_text: string, context: string, position: number) => {
    // Only generate suggestions if there's meaningful context
    if (context.trim().length < 10) {
      setSuggestions([]);
      return;
    }

    try {
      const suggestionText = await aiService.getSuggestion(context);
      
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
      }

      // Replace existing suggestions with new one
      setSuggestions([newSuggestion]);
    } catch (error) {
      console.error('Error generating suggestion:', error);
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
