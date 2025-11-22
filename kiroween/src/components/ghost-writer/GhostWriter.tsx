import React, { useState, useCallback, useRef, useEffect } from 'react';
import WritingEditor from './WritingEditor';
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
  const [showUndo, setShowUndo] = useState(false);
  const [lastAcceptedSuggestion, setLastAcceptedSuggestion] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const suggestionIdCounter = useRef(0);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
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
      log('State transition:', previousState, '→', newState);
      
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
      log('Network connection restored');
      setIsOnline(true);
      announce('Network connection restored');
      
      // If we're in an error state due to network issues, suggest retry
      if (ghostState.hasError && ghostState.error?.type === 'NETWORK_ERROR') {
        announce('You can now retry your request');
      }
    };
    
    const handleOffline = () => {
      log('Network connection lost');
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
  const handleTextChange = useCallback(async (_text: string, context: string, position: number) => {
    log('Text changed, context length:', context.trim().length);
    
    // Store context for retry
    lastContextRef.current = { context, position };
    
    // Only generate suggestions if there's meaningful context
    if (context.trim().length < MIN_CONTEXT_LENGTH) {
      log('Context too short, skipping suggestion');
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
      log('Aborting previous request');
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // Start generating state
      ghostState.startGenerating();
      
      log('Requesting suggestion for context:', context.substring(0, 50) + '...');
      const suggestionText = await aiService.getSuggestion(context);
      
      // Check if this request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        log('Request was cancelled, ignoring result');
        return;
      }
      
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
      
      // Reset suggestion index
      setCurrentSuggestionIndex(0);
      
      // Mark as ready
      ghostState.setReady();
      
      // Announce suggestion to screen readers (first 50 chars)
      const preview = suggestionText.length > 50 
        ? suggestionText.substring(0, 50) + '...' 
        : suggestionText;
      announce(`Suggestion ready: ${preview}`);
    } catch (error) {
      // Check if error is due to cancellation
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('cancel') || errorMessage.includes('abort')) {
        log('Request was cancelled');
        // Don't set error state for user-initiated cancellations
        return;
      }
      
      console.error('[Ghost Writer] Error generating suggestion:', error);
      setSuggestions([]);
      
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
      log('Error occurred, retry count:', retryCount);
      
      if (retryCount === 0) {
        // First failure: Show immediate retry button
        log('First failure - showing immediate retry');
        ghostState.setError(errorObj);
        announce(`Error: ${errorObj.message}`);
      } else if (retryCount === 1) {
        // Second failure: Wait 5s before allowing retry
        log('Second failure - waiting 5s before retry');
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
          log('Auto-retrying after 5s delay');
          handleRetry();
        }, 5000);
      } else if (retryCount >= 2) {
        // Third+ failure: Suggest checking settings
        log('Third+ failure - suggesting settings check');
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
    log('Accepting suggestion');
    
    // Start accepting animation
    ghostState.startAccepting();
    
    // Announce acceptance to screen readers
    announce('Suggestion accepted');
    
    // Store the suggestion for undo
    setLastAcceptedSuggestion(suggestion.text);
    
    // Insert suggestion into editor after a brief delay for animation
    setTimeout(() => {
      if (editorRef.current && (editorRef.current as any).insertSuggestion) {
        (editorRef.current as any).insertSuggestion(suggestion.text);
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
    }, 200);
    
    // State will auto-reset to IDLE after animation completes (handled by state machine)
  }, [ghostState, announce]);

  // Handle suggestion dismissal
  const handleSuggestionDismiss = useCallback((suggestionId: string) => {
    // Announce rejection to screen readers
    announce('Suggestion rejected');
    
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    setCurrentSuggestionIndex(0);
    ghostState.reset();
  }, [ghostState, announce]);

  // Handle undo of last accepted suggestion
  const handleUndo = useCallback(() => {
    if (!lastAcceptedSuggestion) return;
    
    log('Undoing last accepted suggestion');
    
    // Get current text from editor
    if (editorRef.current) {
      const currentText = editorRef.current.innerText || '';
      
      // Remove the last accepted suggestion from the end of the text
      if (currentText.endsWith(lastAcceptedSuggestion)) {
        const newText = currentText.slice(0, -lastAcceptedSuggestion.length);
        editorRef.current.innerText = newText;
        
        // Move cursor to end
        const range = document.createRange();
        const selection = window.getSelection();
        if (selection && editorRef.current.lastChild) {
          range.selectNodeContents(editorRef.current);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        
        // Trigger input event to update state
        if ((editorRef.current as any).handleInput) {
          (editorRef.current as any).handleInput();
        }
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
    log('Regenerating suggestion');
    
    // Announce to screen readers
    announce('Regenerating suggestion');
    
    // Get current context and regenerate
    if (editorRef.current && (editorRef.current as any).getCurrentContext) {
      const context = (editorRef.current as any).getCurrentContext();
      const position = (editorRef.current as any).getCursorPosition?.() || 0;
      
      if (context && context.trim().length >= MIN_CONTEXT_LENGTH) {
        // Clear current suggestions
        setSuggestions([]);
        // Trigger new generation
        handleTextChange('', context, position);
      }
    }
  }, [handleTextChange, announce]);

  // Handle cancel during generation
  const handleCancelGeneration = useCallback(() => {
    log('Cancelling suggestion generation');
    
    // Abort the request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Cancel any pending AI service requests
    aiService.cancelPending();
    
    // Reset state
    ghostState.reset();
    setSuggestions([]);
  }, [ghostState]);

  // Handle retry after error with progressive backoff
  const handleRetry = useCallback(() => {
    log('Retrying suggestion generation, attempt:', retryCountRef.current + 1);
    
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
    
    if (!context && editorRef.current && (editorRef.current as any).getCurrentContext) {
      context = (editorRef.current as any).getCurrentContext();
      position = (editorRef.current as any).getCursorPosition?.() || 0;
    }
    
    if (context && context.trim().length >= MIN_CONTEXT_LENGTH) {
      // Reset error state
      ghostState.reset();
      // Trigger new generation
      handleTextChange('', context, position);
    }
  }, [ghostState, handleTextChange, announce]);

  // Handle error dismissal
  const handleDismissError = useCallback(() => {
    log('Dismissing error');
    ghostState.reset();
  }, [ghostState]);

  // Accept first suggestion (for double-tab shortcut)
  const acceptFirstSuggestion = useCallback(() => {
    if (suggestions.length > 0) {
      log('Accepting first suggestion via double-tab');
      handleSuggestionAccept(suggestions[0]);
      return true;
    }
    return false;
  }, [suggestions, handleSuggestionAccept]);

  // Set up double-Tab shortcut to summon Ghost Writer
  useDoubleTab({
    onDoubleTab: () => {
      log('Double-Tab detected - summoning Ghost Writer');
      
      // If there are suggestions, accept the first one
      if (acceptFirstSuggestion()) {
        return;
      }
      
      // Otherwise, trigger a new suggestion generation
      if (editorRef.current && (editorRef.current as any).getCurrentContext) {
        const context = (editorRef.current as any).getCurrentContext();
        const position = (editorRef.current as any).getCursorPosition?.() || 0;
        
        if (context && context.trim().length >= MIN_CONTEXT_LENGTH) {
          log('Generating new suggestion via double-Tab');
          handleTextChange('', context, position);
        } else {
          log('Context too short for suggestion');
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
      if (suggestions.length === 0 || ghostState.isGenerating) {
        return;
      }

      // Tab or Enter: Accept suggestion
      if (event.key === 'Tab' || event.key === 'Enter') {
        // Only handle if we're in the suggestion state (not during normal typing)
        if (ghostState.isReady && suggestions.length > 0) {
          event.preventDefault();
          event.stopPropagation();
          log('Keyboard shortcut: Accept (Tab/Enter)');
          handleSuggestionAccept(suggestions[currentSuggestionIndex]);
        }
      }
      
      // Escape: Reject suggestion
      else if (event.key === 'Escape') {
        if ((ghostState.isReady || ghostState.isAccepting) && suggestions.length > 0) {
          event.preventDefault();
          event.stopPropagation();
          log('Keyboard shortcut: Reject (Esc)');
          handleSuggestionDismiss(suggestions[0].id);
        }
      }
      
      // Ctrl+R: Regenerate suggestion
      else if (event.ctrlKey && event.key === 'r') {
        if (ghostState.isReady && suggestions.length > 0) {
          event.preventDefault();
          event.stopPropagation();
          log('Keyboard shortcut: Regenerate (Ctrl+R)');
          handleSuggestionRegenerate();
        }
      }
      
      // Alt+1/2/3: Select suggestion variant
      else if (event.altKey && ['1', '2', '3'].includes(event.key)) {
        if (ghostState.isReady && suggestions.length > 1) {
          event.preventDefault();
          event.stopPropagation();
          const index = parseInt(event.key, 10) - 1;
          if (index < suggestions.length) {
            log(`Keyboard shortcut: Select variant ${index + 1} (Alt+${event.key})`);
            setCurrentSuggestionIndex(index);
            announce(`Switched to suggestion ${index + 1} of ${suggestions.length}`);
          }
        }
      }
    };

    // Add event listener with capture phase to intercept before other handlers
    window.addEventListener('keydown', handleKeyDown, true);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [suggestions, currentSuggestionIndex, ghostState.isReady, ghostState.isGenerating, ghostState.isAccepting, handleSuggestionAccept, handleSuggestionDismiss, handleSuggestionRegenerate, announce]);

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
    };
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
        <div className={styles.shortcuts}>
          <span className={styles.shortcutHint}>
            Press <kbd>Tab</kbd> <kbd>Tab</kbd> to summon Ghost Writer
          </span>
          {suggestions.length > 0 && ghostState.isReady && (
            <span className={styles.shortcutHint}>
              <kbd>Tab</kbd>/<kbd>Enter</kbd> Accept • <kbd>Esc</kbd> Reject • <kbd>Ctrl+R</kbd> Regenerate
              {suggestions.length > 1 && (
                <> • <kbd>Alt+1/2/3</kbd> Switch variants</>
              )}
            </span>
          )}
        </div>
        {!isOnline && (
          <div className={styles.offlineWarning}>
            📡 You are currently offline. Ghost Writer requires an internet connection.
          </div>
        )}
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
        
        {/* Show loading indicator when generating */}
        {ghostState.isGenerating && (
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
        
        {/* Show suggestion display when ready or accepting */}
        {(ghostState.isReady || ghostState.isAccepting) && suggestions.length > 0 && (
          <div className={styles.suggestionContainer}>
            <SuggestionDisplay
              suggestion={suggestions[currentSuggestionIndex]}
              isAccepting={ghostState.isAccepting}
            />
            {suggestions.length > 1 && (
              <div className={styles.variantIndicator}>
                Suggestion {currentSuggestionIndex + 1} of {suggestions.length}
              </div>
            )}
            <SuggestionActions
              onAccept={() => handleSuggestionAccept(suggestions[currentSuggestionIndex])}
              onReject={() => handleSuggestionDismiss(suggestions[0].id)}
              onRegenerate={handleSuggestionRegenerate}
              disabled={ghostState.isAccepting}
              showShortcuts={true}
            />
          </div>
        )}
        
        {/* Show undo button briefly after accepting */}
        {showUndo && (
          <div className={styles.undoContainer}>
            <button
              className={styles.undoButton}
              onClick={handleUndo}
              aria-label="Undo last suggestion"
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
};

export default GhostWriter;
