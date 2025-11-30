/**
 * Ghost Writer Hooks Integration
 * Manages three agent hooks: Sentence Completion, Creative Catalyst, Tone Analyzer
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { aiService } from '../services/aiService';

interface GhostWriterHooksConfig {
  enabled: boolean;
  textContent: string;
  cursorPosition: number;
  onSuggestion: (suggestion: AgentSuggestion) => void;
  onAnalysis: (analysis: ToneAnalysis) => void;
  onError: (error: Error) => void;
}

interface AgentSuggestion {
  id: string;
  type: 'completion' | 'inspiration' | 'analysis';
  content: string | string[];
  metadata?: Record<string, any>;
}

interface ToneAnalysis {
  tone: string;
  style: string;
  pacing: string;
  voice: string;
  clarity: number;
  engagement: number;
  suggestions: string[];
  examples: string[];
}

export const useGhostWriterHooks = ({
  enabled,
  textContent,
  cursorPosition,
  onSuggestion,
  onAnalysis,
  onError,
}: GhostWriterHooksConfig) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeHook, setActiveHook] = useState<string | null>(null);
  
  const lastTextRef = useRef(textContent);
  const pauseTimerRef = useRef<number | null>(null); // Changed NodeJS.Timeout to number
  const typingTimerRef = useRef<number | null>(null); // Changed NodeJS.Timeout to number
  const completionCacheRef = useRef<Map<string, AgentSuggestion>>(new Map());

  /**
   * Hook 1: Sentence Completion (on typing)
   */
  const handleSentenceCompletion = useCallback(async (text: string, position: number) => {
    if (!enabled || text.length < 2) return;

    const cacheKey = text.slice(Math.max(0, position - 50), position);
    const cached = completionCacheRef.current.get(cacheKey);
    if (cached) {
      onSuggestion(cached);
      return;
    }

    setIsProcessing(true);
    setActiveHook('sentence-completion');

    try {
      const currentSentence = text.slice(Math.max(0, position - 100), position);
      const previousContext = text.slice(Math.max(0, position - 500), Math.max(0, position - 100));
      
      const completions = await aiService.getSuggestion(currentSentence + previousContext); // Use aiService.getSuggestion
      
      const suggestion: AgentSuggestion = {
        id: `completion-${Date.now()}`,
        type: 'completion',
        content: completions,
        metadata: { position, timestamp: Date.now() },
      };
      
      completionCacheRef.current.set(cacheKey, suggestion);
      onSuggestion(suggestion);
    } catch (error) {
      onError(error as Error);
    } finally {
      setIsProcessing(false);
      setActiveHook(null);
    }
  }, [enabled, onSuggestion, onError]);

  /**
   * Hook 2: Creative Catalyst (on 3-second pause)
   */
  const handleCreativeCatalyst = useCallback(async (text: string) => {
    if (!enabled || text.length < 50) return;

    setIsProcessing(true);
    setActiveHook('creative-catalyst');

    try {
      // Placeholder for generateInspiration - aiService does not have this method
      console.warn('generateInspiration is not implemented in aiService. Using a placeholder.');
      const inspirations = 'This is an inspirational placeholder suggestion from the Ghost Writer.';
      
      const suggestion: AgentSuggestion = {
        id: `inspiration-${Date.now()}`,
        type: 'inspiration',
        content: inspirations,
        metadata: { textLength: text.length, timestamp: Date.now() },
      };
      
      onSuggestion(suggestion);
    } catch (error) {
      onError(error as Error);
    } finally {
      setIsProcessing(false);
      setActiveHook(null);
    }
  }, [enabled, onSuggestion, onError]);

  /**
   * Hook 3: Tone Analyzer (on button click)
   */
  const handleToneAnalysis = useCallback(async (text: string) => {
    if (!enabled || text.length < 100) {
      onError(new Error('Minimum 100 characters required for tone analysis'));
      return;
    }

    setIsProcessing(true);
    setActiveHook('tone-analyzer');

    try {
      // Placeholder for analyzeTone - aiService does not have this method
      console.warn('analyzeTone is not implemented in aiService. Using a placeholder.');
      const analysis: ToneAnalysis = {
        tone: 'mysterious',
        style: 'gothic',
        pacing: 'slow',
        voice: 'spectral',
        clarity: 0.7,
        engagement: 0.6,
        suggestions: ['Consider more archaic vocabulary.', 'Add a touch more existential dread.'],
        examples: [],
      };
      onAnalysis(analysis);
    } catch (error) {
      onError(error as Error);
    } finally {
      setIsProcessing(false);
      setActiveHook(null);
    }
  }, [enabled, onAnalysis, onError]);

  /**
   * Typing trigger with debounce
   */
  useEffect(() => {
    if (!enabled) return;

    const hasTextChanged = textContent !== lastTextRef.current;
    lastTextRef.current = textContent;

    if (hasTextChanged && textContent.length >= 2) {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      
      typingTimerRef.current = setTimeout(() => {
        handleSentenceCompletion(textContent, cursorPosition);
      }, 300);
    }

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [textContent, cursorPosition, enabled, handleSentenceCompletion]);

  /**
   * Pause trigger (3 seconds)
   */
  useEffect(() => {
    if (!enabled) return;

    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }

    pauseTimerRef.current = setTimeout(() => {
      if (textContent.length >= 50) {
        handleCreativeCatalyst(textContent);
      }
    }, 3000);

    return () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    };
  }, [textContent, enabled, handleCreativeCatalyst]);

  /**
   * Cleanup
   */
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      completionCacheRef.current.clear();
    };
  }, []);

  return {
    isProcessing,
    activeHook,
    triggerToneAnalysis: () => handleToneAnalysis(textContent),
    clearCache: () => completionCacheRef.current.clear(),
  };
};
