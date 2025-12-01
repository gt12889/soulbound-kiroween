import React, { useState, useCallback, useRef, useEffect } from 'react';
import WritingEditor, { type WritingEditorHandle } from './WritingEditor';
import GhostSuggestion from './GhostSuggestion';
import GhostLoadingIndicator from './GhostLoadingIndicator';
import GhostErrorDisplay from './GhostErrorDisplay';
import SuggestionDisplay from './SuggestionDisplay';
import SuggestionActions from './SuggestionActions';
import type { GhostSuggestion as GhostSuggestionType } from '../../types';
import { aiService } from '../../services/aiService';
import { useDoubleTab } from '../../hooks/useDoubleTab';
import { useGhostWriterState, createGhostWriterError } from '../../hooks/useGhostWriterState';
import { useScreenReaderAnnouncement } from '../../hooks/useScreenReaderAnnouncement';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { hapticSuccess, hapticError } from '../../utils/haptics';
import { createScopedLogger } from '../../utils/logger';
import styles from './GhostWriter.module.css';

// Constants
const MIN_CONTEXT_LENGTH = 10;

// Debug logging helper using logger utility
const log = createScopedLogger('[Ghost Writer]');

const GhostWriter: React.FC = React.memo(() => {
  const [suggestions, setSuggestions] = useState<GhostSuggestionType[]>([]);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | undefined>();
  const [showHint, setShowHint] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const [lastAcceptedSuggestion, setLastAcceptedSuggestion] = useState<string | null>(null);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [isOptimistic, setIsOptimistic] = useState(false); // Track if current suggestion is optimistic
  const [autoAcceptNext, setAutoAcceptNext] = useState(false); // Track if next suggestion should auto-accept
  const editorRef = useRef<WritingEditorHandle>(null);
  const suggestionIdCounter = useRef(0);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingDelayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  // Error recovery state
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [retryDelaySeconds, setRetryDelaySeconds] = useState(0);
  const lastContextRef = useRef<{ context: string; position: number } | null>(null);

  // Initialize screen reader announcements
  const { announce } = useScreenReaderAnnouncement();
  
  // Track online/offline status
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize state machine
  const ghostState = useGhostWriterState({
    acceptAnimationDuration: 1000, // Match the CSS animation duration
    onStateChange: (newState, previousState) => {
      log.log('State transition:', previousState, '→', newState);
      
      // Announce state changes to screen readers
      switch (newState) {
        case 'GENERATING':
          announce('Generating AI suggestion');
          break;
        case 'ERROR':
          // Error message will be announced when error is set
          break;
        default:
          break;
      }
    },
  });
  
  // Initialize focus trap for suggestion overlay (after ghostState is initialized)
  const suggestionContainerRef = useFocusTrap({
    isActive: ghostState.isReady,
    onEscape: () => {
      if (suggestions.length > 0) {
        handleSuggestionDismiss(suggestions[0].id);
      }
    },
    restoreFocus: false, // We handle focus restoration manually
  });

  // Generate optimistic suggestion based on context
  const generateOptimisticSuggestion = useCallback((context: string, isManual: boolean = false): string => {
    // Extract the last sentence or phrase
    const lastSentence = context.split(/[.!?]/).filter(s => s.trim()).pop() || context;
    const words = lastSentence.trim().split(/\s+/);
    
    // Different patterns for manual vs automatic
    const autoPatterns = [
      'The story continues to unfold...',
      'Each moment brings new possibilities...',
      'The journey ahead promises...',
      'Time moves forward...',
      'The path ahead remains...',
    ];
    
    const manualPatterns = [
      'The story continues to unfold in unexpected ways, revealing deeper truths with each passing moment.',
      'Each moment brings new possibilities and discoveries, transforming the landscape of what seemed certain.',
      'The journey ahead promises both challenges and rewards, testing resolve while offering growth.',
      'Time moves forward relentlessly, carrying us toward new horizons we can barely imagine.',
      'The path ahead remains uncertain but full of potential, waiting for those brave enough to explore.',
    ];
    
    const patterns = isManual ? manualPatterns : autoPatterns;
    
    // Select a phrase based on the last word's length (pseudo-random but deterministic)
    const lastWord = words[words.length - 1] || '';
    const index = lastWord.length % patterns.length;
    
    // Check if context ends mid-sentence (no punctuation)
    const needsPunctuation = !context.match(/[.!?]\s*$/);
    const selectedPattern = patterns[index];
    
    if (needsPunctuation && isManual) {
      // For manual generation, complete the sentence first
      return '. ' + selectedPattern;
    }
    
    return ' ' + selectedPattern;
  }, []);

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
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      log.log('Network connection restored');
      setIsOnline(true);
      announce('Network connection restored');
      
      // If we're in an error state due to network issues, suggest retry
      if (ghostState.hasError && ghostState.error?.type === 'NETWORK_ERROR') {
        announce('You can now retry your request');
      }
    };
    
    const handleOffline = () => {
      log.log('Network connection lost');
      setIsOnline(false);
      announce('Network connection lost');
      
      // If we're currently generating, show network error
      if (ghostState.isGenerating) {
        const errorObj = createGhostWriterError('NETWORK_ERROR', 'You are currently offline');
        ghostState.setError(errorObj);
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [ghostState, announce]);

  // Handle text changes and generate suggestions
  const handleTextChange = useCallback(async (_text: string, context: string, position: number, isManual: boolean = false) => {
    log.log('Text changed, context length:', context.trim().length, 'manual:', isManual);
    
    // Store context for retry
    lastContextRef.current = { context, position };
    
    // Only generate suggestions if there's meaningful context
    if (context.trim().length < MIN_CONTEXT_LENGTH) {
      log.log('Context too short, skipping suggestion');
      setSuggestions([]);
      ghostState.reset();
      
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
    
    // Reset retry count on new user input (not a retry)
    if (!ghostState.hasError) {
      retryCountRef.current = 0;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      log.log('Aborting previous request');
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // Start generating state
      ghostState.startGenerating();
      
      // Show optimistic suggestion immediately for better perceived performance
      const optimisticText = generateOptimisticSuggestion(context, isManual);
      const optimisticSuggestion: GhostSuggestionType = {
        id: `optimistic-${++suggestionIdCounter.current}`,
        text: optimisticText,
        position,
        confidence: 0.5, // Lower confidence for optimistic suggestions
      };
      
      // Get cursor position for suggestion placement
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setCursorPosition({ x: rect.left, y: rect.bottom });
      }
      
      // Show optimistic suggestion immediately
      setSuggestions([optimisticSuggestion]);
      setIsOptimistic(true);
      setCurrentSuggestionIndex(0);
      log.log('Showing optimistic suggestion:', optimisticText);
      
      // Only show loading indicator for manual generation (not automatic background suggestions)
      // Delay showing loading indicator by 200ms to avoid flash for fast responses
      if (isManual) {
        loadingDelayTimeoutRef.current = setTimeout(() => {
          setShowLoadingIndicator(true);
        }, 200);
      }
      
      log.log('Requesting suggestion for context:', context.substring(0, 50) + '...', 'isManual:', isManual);
      const suggestionText = await aiService.getSuggestion(context, 1, isManual);
      
      // Check if this request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        log.log('Request was cancelled, ignoring result');
        // Clear loading delay timeout
        if (loadingDelayTimeoutRef.current) {
          clearTimeout(loadingDelayTimeoutRef.current);
          loadingDelayTimeoutRef.current = null;
        }
        setShowLoadingIndicator(false);
        return;
      }
      
      // Clear loading delay timeout and hide loading indicator
      if (loadingDelayTimeoutRef.current) {
        clearTimeout(loadingDelayTimeoutRef.current);
        loadingDelayTimeoutRef.current = null;
      }
      setShowLoadingIndicator(false);
      
      log.log('Received suggestion:', suggestionText);
      
      // Create new suggestion
      const newSuggestion: GhostSuggestionType = {
        id: `suggestion-${++suggestionIdCounter.current}`,
        text: suggestionText,
        position,
        confidence: 0.8,
      };

      // Replace optimistic suggestion with real one
      log.log('Replacing optimistic suggestion with real one:', newSuggestion);
      setSuggestions([newSuggestion]);
      setIsOptimistic(false);
      
      // Reset suggestion index
      setCurrentSuggestionIndex(0);
      
      // Mark as ready
      ghostState.setReady();
      
      // Announce suggestion to screen readers (first 50 chars)
      const preview = suggestionText.length > 50 
        ? suggestionText.substring(0, 50) + '...' 
        : suggestionText;
      announce(`Suggestion ready: ${preview}`);
      
      // Auto-accept if this was triggered by double-Tab
      if (autoAcceptNext && isManual) {
        log.log('Auto-accepting suggestion from double-Tab');
        setAutoAcceptNext(false);
        // Accept the suggestion immediately
        setTimeout(() => {
          handleSuggestionAccept(newSuggestion);
        }, 100); // Small delay to ensure state is updated
        return;
      }
      
      // Store current focus before moving to suggestion
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus on Accept button when suggestion appears (after a brief delay for rendering)
      setTimeout(() => {
        if (acceptButtonRef.current) {
          acceptButtonRef.current.focus();
        }
      }, 100);
    } catch (error) {
      // Check if error is due to cancellation
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('cancel') || errorMessage.includes('abort')) {
        log.log('Request was cancelled');
        // Clear loading delay timeout and hide loading indicator
        if (loadingDelayTimeoutRef.current) {
          clearTimeout(loadingDelayTimeoutRef.current);
          loadingDelayTimeoutRef.current = null;
        }
        setShowLoadingIndicator(false);
        // Don't set error state for user-initiated cancellations
        return;
      }
      
      // Clear loading delay timeout and hide loading indicator
      if (loadingDelayTimeoutRef.current) {
        clearTimeout(loadingDelayTimeoutRef.current);
        loadingDelayTimeoutRef.current = null;
      }
      setShowLoadingIndicator(false);
      
      console.error('[Ghost Writer] Error generating suggestion:', error);
      setSuggestions([]);
      setIsOptimistic(false); // Clear optimistic flag on error
      
      // Determine error type
      let errorObj;
      if (errorMessage.includes('network') || errorMessage.includes('fetch') || !navigator.onLine) {
        errorObj = createGhostWriterError('NETWORK_ERROR');
      } else if (errorMessage.includes('timeout')) {
        errorObj = createGhostWriterError('TIMEOUT_ERROR');
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        errorObj = createGhostWriterError('RATE_LIMIT_ERROR');
      } else if (errorMessage.includes('API key') || errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
        errorObj = createGhostWriterError('INVALID_KEY_ERROR');
      } else {
        errorObj = createGhostWriterError('API_ERROR');
      }
      
      // Implement progressive retry strategy
      const retryCount = retryCountRef.current;
      log.log('Error occurred, retry count:', retryCount);
      
      if (retryCount === 0) {
        // First failure: Show immediate retry button
        log.log('First failure - showing immediate retry');
        hapticError(); // Trigger error vibration
        ghostState.setError(errorObj);
        announce(`Error: ${errorObj.message}`);
      } else if (retryCount === 1) {
        // Second failure: Wait 5s before allowing retry
        log.log('Second failure - waiting 5s before retry');
        hapticError(); // Trigger error vibration
        ghostState.setError({
          ...errorObj,
          message: `${errorObj.message}. Waiting 5 seconds before retry...`,
        });
        announce(`Error: ${errorObj.message}. Waiting 5 seconds before retry`);
        
        // Start countdown
        setRetryDelaySeconds(5);
        let countdown = 5;
        const countdownInterval = setInterval(() => {
          countdown -= 1;
          setRetryDelaySeconds(countdown);
          if (countdown <= 0) {
            clearInterval(countdownInterval);
          }
        }, 1000);
        
        // Schedule automatic retry after 5s
        retryTimeoutRef.current = setTimeout(() => {
          log.log('Auto-retrying after 5s delay');
          handleRetry();
        }, 5000);
      } else if (retryCount >= 2) {
        // Third+ failure: Suggest checking settings
        log.log('Third+ failure - suggesting settings check');
        hapticError(); // Trigger error vibration
        const settingsMessage = errorObj.type === 'INVALID_KEY_ERROR'
          ? 'Please check your API key in settings'
          : errorObj.type === 'NETWORK_ERROR'
          ? 'Please check your internet connection'
          : errorObj.type === 'RATE_LIMIT_ERROR'
          ? 'Rate limit exceeded. Please wait a few minutes'
          : 'Multiple failures detected. Please check your settings';
        
        ghostState.setError({
          ...errorObj,
          message: `${errorObj.message}. ${settingsMessage}`,
          retryable: errorObj.type !== 'INVALID_KEY_ERROR', // Don't allow retry for invalid key
        });
        announce(`Error: ${errorObj.message}. ${settingsMessage}`);
      }
    }
  }, [ghostState]);

  // Handle suggestion acceptance
  const handleSuggestionAccept = useCallback((suggestion: GhostSuggestionType) => {
    log.log('Accepting suggestion');
    
    // Trigger haptic feedback on mobile devices
    hapticSuccess();
    
    // Start accepting animation
    ghostState.startAccepting();
    
    // Announce acceptance to screen readers
    announce('Suggestion accepted');
    
    // Store the suggestion for undo
    setLastAcceptedSuggestion(suggestion.text);
    
    // Insert suggestion into editor immediately
    if (editorRef.current) {
      editorRef.current.insertSuggestion(suggestion.text);
    }
    
    // Clear suggestions
    setSuggestions([]);
    setCurrentSuggestionIndex(0);
    
    // Show undo button briefly
    setShowUndo(true);
    
    // Hide undo button after 3 seconds
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
    undoTimeoutRef.current = setTimeout(() => {
      setShowUndo(false);
      setLastAcceptedSuggestion(null);
    }, 3000);
    
    // Return focus to editor after a brief delay
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
      } else if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }, 100);
    
    // State will auto-reset to IDLE after animation completes (handled by state machine)
  }, [ghostState, announce]);

  // Handle suggestion dismissal
  const handleSuggestionDismiss = useCallback((suggestionId: string) => {
    // Announce rejection to screen readers
    announce('Suggestion rejected');
    
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    setCurrentSuggestionIndex(0);
    ghostState.reset();
    
    // Return focus to editor after a brief delay
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
      } else if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }, 100);
  }, [ghostState, announce]);

  // Handle undo of last accepted suggestion
  const handleUndo = useCallback(() => {
    if (!lastAcceptedSuggestion) return;
    
    log.log('Undoing last accepted suggestion');
    
    // Get current text from editor
    if (editorRef.current) {
      const currentText = editorRef.current.getText();
      
      // Remove the last accepted suggestion from the end of the text
      if (currentText.endsWith(lastAcceptedSuggestion)) {
        const newText = currentText.slice(0, -lastAcceptedSuggestion.length);
        editorRef.current.setText(newText);
        editorRef.current.focus();
      }
    }
    
    // Hide undo button
    setShowUndo(false);
    setLastAcceptedSuggestion(null);
    
    // Clear timeout
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    
    // Announce to screen readers
    announce('Suggestion undone');
  }, [lastAcceptedSuggestion, announce]);

  // Handle suggestion regeneration
  const handleSuggestionRegenerate = useCallback(() => {
    log.log('Regenerating suggestion');
    
    // Announce to screen readers
    announce('Regenerating suggestion');
    
    // Get current context and regenerate
    if (editorRef.current) {
      const context = editorRef.current.getCurrentContext();
      const position = editorRef.current.getCursorPosition();
      
      if (context && context.trim().length >= MIN_CONTEXT_LENGTH) {
        // Clear current suggestions
        setSuggestions([]);
        // Trigger new generation (manual request)
        handleTextChange('', context, position, true);
      }
    }
  }, [handleTextChange, announce]);

  // Handle cancel during generation
  const handleCancelGeneration = useCallback(() => {
    log.log('Cancelling suggestion generation');
    
    // Abort the request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Cancel any pending AI service requests
    aiService.cancelPending();
    
    // Clear loading delay timeout and hide loading indicator
    if (loadingDelayTimeoutRef.current) {
      clearTimeout(loadingDelayTimeoutRef.current);
      loadingDelayTimeoutRef.current = null;
    }
    setShowLoadingIndicator(false);
    
    // Reset state
    ghostState.reset();
    setSuggestions([]);
  }, [ghostState]);

  // Handle retry after error with progressive backoff
  const handleRetry = useCallback(() => {
    log.log('Retrying suggestion generation, attempt:', retryCountRef.current + 1);
    
    // Increment retry count
    retryCountRef.current += 1;
    
    // Announce to screen readers
    announce('Retrying suggestion generation');
    
    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setRetryDelaySeconds(0);
    
    // Get context from last attempt or current editor
    let context = lastContextRef.current?.context || '';
    let position = lastContextRef.current?.position || 0;
    
    if (!context && editorRef.current) {
      context = editorRef.current.getCurrentContext();
      position = editorRef.current.getCursorPosition();
    }
    
    if (context && context.trim().length >= MIN_CONTEXT_LENGTH) {
      // Reset error state
      ghostState.reset();
      // Trigger new generation (manual retry)
      handleTextChange('', context, position, true);
    }
  }, [ghostState, handleTextChange, announce]);

  // Handle error dismissal
  const handleDismissError = useCallback(() => {
    log.log('Dismissing error');
    ghostState.reset();
  }, [ghostState]);

  // Accept first suggestion (for double-tab shortcut)
  const acceptFirstSuggestion = useCallback(() => {
    if (suggestions.length > 0) {
      log.log('Accepting first suggestion via double-tab');
      handleSuggestionAccept(suggestions[0]);
      return true;
    }
    return false;
  }, [suggestions, handleSuggestionAccept]);

  // Set up double-Tab shortcut to summon Ghost Writer
  useDoubleTab({
    onDoubleTab: () => {
      log.log('Double-Tab detected - summoning Ghost Writer');
      
      // If there are suggestions, accept the first one
      if (acceptFirstSuggestion()) {
        return;
      }
      
      // Otherwise, trigger a new suggestion generation and auto-accept it
      if (editorRef.current) {
        const context = editorRef.current.getCurrentContext();
        const position = editorRef.current.getCursorPosition();
        
        if (context && context.trim().length >= MIN_CONTEXT_LENGTH) {
          log.log('Generating new suggestion via double-Tab (manual) - will auto-accept');
          setAutoAcceptNext(true); // Flag to auto-accept when suggestion arrives
          handleTextChange('', context, position, true); // Manual generation
        } else {
          log.log('Context too short for suggestion');
          setShowHint(true);
          if (hintTimeoutRef.current) {
            clearTimeout(hintTimeoutRef.current);
          }
          hintTimeoutRef.current = setTimeout(() => {
            setShowHint(false);
          }, 3000);
        }
      }
    },
    timeWindow: 500, // 500ms window for double-Tab
    enabled: true,
  });

  // Track current suggestion index for Alt+1/2/3 navigation
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);

  // Keyboard shortcuts for suggestion actions
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when suggestions are visible and ready
      if (suggestions.length === 0 || !ghostState.isReady) {
        return;
      }

      // Check if focus is within the suggestion container
      const suggestionContainer = suggestionContainerRef.current;
      const focusInSuggestion = suggestionContainer && suggestionContainer.contains(document.activeElement);
      
      // Enter: Accept suggestion
      if (event.key === 'Enter') {
        if (focusInSuggestion) {
          event.preventDefault();
          event.stopPropagation();
          log.log('Keyboard shortcut: Accept (Enter)');
          handleSuggestionAccept(suggestions[currentSuggestionIndex]);
        }
      }
      
      // Escape: Reject suggestion
      else if (event.key === 'Escape') {
        if (focusInSuggestion) {
          event.preventDefault();
          event.stopPropagation();
          log.log('Keyboard shortcut: Reject (Esc)');
          handleSuggestionDismiss(suggestions[0].id);
        }
      }
      
      // Ctrl+R: Regenerate suggestion
      else if (event.ctrlKey && event.key === 'r') {
        if (focusInSuggestion) {
          event.preventDefault();
          event.stopPropagation();
          log.log('Keyboard shortcut: Regenerate (Ctrl+R)');
          handleSuggestionRegenerate();
        }
      }
      
      // Alt+1/2/3: Select suggestion variant
      else if (event.altKey && ['1', '2', '3'].includes(event.key)) {
        if (suggestions.length > 1 && focusInSuggestion) {
          event.preventDefault();
          event.stopPropagation();
          const index = parseInt(event.key, 10) - 1;
          if (index < suggestions.length) {
            log.log(`Keyboard shortcut: Select variant ${index + 1} (Alt+${event.key})`);
            setCurrentSuggestionIndex(index);
            announce(`Switched to suggestion ${index + 1} of ${suggestions.length}`);
          }
        }
      }
    };

    // Don't use capture phase - let focus trap handle Tab navigation first
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [suggestions, currentSuggestionIndex, ghostState.isReady, handleSuggestionAccept, handleSuggestionDismiss, handleSuggestionRegenerate, announce]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      aiService.cancelPending();
      
      // Clear any pending timeouts
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (loadingDelayTimeoutRef.current) {
        clearTimeout(loadingDelayTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.ghostWriter} role="main" aria-label="Ghost Writer application">
      {/* Ambient fog layers - Requirement 3.4 */}
      <div className={`${styles.fogLayer} ambient-fog-layer ambient-fog-slow`} aria-hidden="true" />
      <div className={`${styles.fogLayer} ambient-fog-layer ambient-fog-medium`} aria-hidden="true" />
      <div className={`${styles.fogLayer} ambient-fog-layer ambient-fog-fast`} aria-hidden="true" />
      
      <div className={styles.header} role="banner">
        <h1 className={styles.title}>Ghost Writer</h1>
        <p className={styles.subtitle} aria-label="Application tagline">Let spectral whispers guide your words...</p>
        <div className={styles.shortcuts} role="complementary" aria-label="Keyboard shortcuts">
          <span className={styles.shortcutHint} aria-label="Primary shortcut">
            Press <kbd>Tab</kbd> <kbd>Tab</kbd> to summon Ghost Writer
          </span>
          {suggestions.length > 0 && ghostState.isReady && (
            <span className={styles.shortcutHint} aria-label="Suggestion shortcuts">
              <kbd>Tab</kbd>/<kbd>Enter</kbd> Accept • <kbd>Esc</kbd> Reject • <kbd>Ctrl+R</kbd> Regenerate
              {suggestions.length > 1 && (
                <> • <kbd>Alt+1/2/3</kbd> Switch variants</>
              )}
            </span>
          )}
        </div>
        {!isOnline && (
          <div className={styles.offlineWarning} role="alert" aria-live="assertive">
            📡 You are currently offline. Ghost Writer requires an internet connection.
          </div>
        )}
        {showHint && (
          <div className={styles.hint} role="status" aria-live="polite">
            💀 Write at least {MIN_CONTEXT_LENGTH} characters to summon suggestions...
          </div>
        )}
      </div>
      
      <div className={styles.editorWrapper} role="region" aria-label="Writing area">
        <WritingEditor
          ref={editorRef}
          onTextChange={handleTextChange}
        />
        
        {/* Show loading indicator when generating (with 200ms delay) */}
        {ghostState.isGenerating && showLoadingIndicator && (
          <GhostLoadingIndicator
            message="Summoning spirits from beyond..."
            onCancel={handleCancelGeneration}
            showCancel={true}
          />
        )}
        
        {/* Show error display when error occurs */}
        {ghostState.hasError && ghostState.error && (
          <GhostErrorDisplay
            error={ghostState.error.message}
            errorType={ghostState.error.type}
            onRetry={handleRetry}
            onDismiss={handleDismissError}
            showRetry={ghostState.error.retryable && retryDelaySeconds === 0}
            showDismiss={true}
            retryDelaySeconds={retryDelaySeconds}
            retryCount={retryCountRef.current}
          />
        )}
        
        {/* Show suggestion display when ready */}
        {ghostState.isReady && suggestions.length > 0 && (
          <div 
            ref={suggestionContainerRef}
            className={styles.suggestionContainer} 
            role="region" 
            aria-label="AI suggestion panel"
          >
            <SuggestionDisplay
              suggestion={suggestions[currentSuggestionIndex]}
              isAccepting={false}
              isOptimistic={isOptimistic}
            />
            {suggestions.length > 1 && (
              <div className={styles.variantIndicator} role="status" aria-live="polite" aria-atomic="true">
                Suggestion {currentSuggestionIndex + 1} of {suggestions.length}
              </div>
            )}
            <SuggestionActions
              onAccept={() => handleSuggestionAccept(suggestions[currentSuggestionIndex])}
              onReject={() => handleSuggestionDismiss(suggestions[0].id)}
              onRegenerate={handleSuggestionRegenerate}
              disabled={false}
              showShortcuts={true}
              acceptButtonRef={acceptButtonRef}
            />
          </div>
        )}
        
        {/* Show accepting animation overlay */}
        {ghostState.isAccepting && suggestions.length > 0 && (
          <div className={styles.acceptingOverlay} role="status" aria-live="polite">
            <SuggestionDisplay
              suggestion={suggestions[currentSuggestionIndex]}
              isAccepting={true}
              isOptimistic={false}
            />
          </div>
        )}
        
        {/* Show undo button briefly after accepting */}
        {showUndo && (
          <div className={styles.undoContainer} role="complementary" aria-label="Undo action">
            <button
              className={styles.undoButton}
              onClick={handleUndo}
              aria-label="Undo last accepted suggestion"
            >
              ↶ Undo
            </button>
          </div>
        )}
        
        {/* Fallback to old component for backward compatibility during transition */}
        {!ghostState.isReady && suggestions.map(suggestion => (
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
});

GhostWriter.displayName = 'GhostWriter';

export default GhostWriter;
