/**
 * Ghost Writer State Machine Hook
 * Manages the state transitions for Ghost Writer UX improvements
 * 
 * State Flow:
 * IDLE → GENERATING → READY → ACCEPTING → IDLE
 *   ↓         ↓          ↓         ↓
 * ERROR ← ─ ─ ┴ ─ ─ ─ ─ ┴ ─ ─ ─ ─ ┘
 */

import { useState, useCallback, useRef } from 'react';

/**
 * Ghost Writer state machine states
 */
export type GhostWriterState = 
  | 'IDLE'        // No suggestion, waiting for user input
  | 'GENERATING'  // AI is generating a suggestion
  | 'READY'       // Suggestion is ready to be reviewed
  | 'ACCEPTING'   // User accepted, playing animation
  | 'ERROR';      // Error occurred during generation

/**
 * Error types for better error handling
 */
export type GhostWriterErrorType = 
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'TIMEOUT_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'INVALID_KEY_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Error information
 */
export interface GhostWriterError {
  type: GhostWriterErrorType;
  message: string;
  retryable: boolean;
}

/**
 * State change callback type
 */
export type StateChangeCallback = (
  newState: GhostWriterState,
  previousState: GhostWriterState,
  error?: GhostWriterError
) => void;

/**
 * Hook configuration
 */
export interface UseGhostWriterStateConfig {
  onStateChange?: StateChangeCallback;
  acceptAnimationDuration?: number; // Duration of accepting animation in ms
}

/**
 * Hook return type
 */
export interface UseGhostWriterStateReturn {
  // Current state
  state: GhostWriterState;
  error: GhostWriterError | null;
  
  // State transition functions
  startGenerating: () => void;
  setReady: () => void;
  startAccepting: () => void;
  setError: (error: GhostWriterError) => void;
  reset: () => void;
  
  // State checks
  isIdle: boolean;
  isGenerating: boolean;
  isReady: boolean;
  isAccepting: boolean;
  hasError: boolean;
}

/**
 * Custom hook for managing Ghost Writer state machine
 */
export function useGhostWriterState(
  config: UseGhostWriterStateConfig = {}
): UseGhostWriterStateReturn {
  const { 
    onStateChange,
    acceptAnimationDuration = 500 
  } = config;

  const [state, setState] = useState<GhostWriterState>('IDLE');
  const [error, setErrorState] = useState<GhostWriterError | null>(null);
  const previousStateRef = useRef<GhostWriterState>('IDLE');
  const acceptTimeoutRef = useRef<number | null>(null);

  /**
   * Internal state transition handler
   */
  const transitionTo = useCallback((
    newState: GhostWriterState,
    errorInfo?: GhostWriterError
  ) => {
    const previousState = previousStateRef.current;
    
    // Validate state transition
    if (!isValidTransition(previousState, newState)) {
      console.warn(
        `[Ghost Writer State] Invalid transition from ${previousState} to ${newState}`
      );
      return;
    }

    // Update state
    setState(newState);
    previousStateRef.current = newState;

    // Update error state
    if (newState === 'ERROR' && errorInfo) {
      setErrorState(errorInfo);
    } else if (newState !== 'ERROR') {
      setErrorState(null);
    }

    // Notify callback
    if (onStateChange) {
      onStateChange(newState, previousState, errorInfo);
    }
  }, [onStateChange]);

  /**
   * Start generating a suggestion
   */
  const startGenerating = useCallback(() => {
    transitionTo('GENERATING');
  }, [transitionTo]);

  /**
   * Mark suggestion as ready
   */
  const setReady = useCallback(() => {
    transitionTo('READY');
  }, [transitionTo]);

  /**
   * Start accepting animation
   */
  const startAccepting = useCallback(() => {
    transitionTo('ACCEPTING');
    
    // Auto-transition back to IDLE after animation completes
    if (acceptTimeoutRef.current) {
      clearTimeout(acceptTimeoutRef.current);
    }
    
    acceptTimeoutRef.current = window.setTimeout(() => {
      transitionTo('IDLE');
    }, acceptAnimationDuration);
  }, [transitionTo, acceptAnimationDuration]);

  /**
   * Set error state
   */
  const setError = useCallback((errorInfo: GhostWriterError) => {
    transitionTo('ERROR', errorInfo);
  }, [transitionTo]);

  /**
   * Reset to idle state
   */
  const reset = useCallback(() => {
    // Clear any pending timeouts
    if (acceptTimeoutRef.current) {
      clearTimeout(acceptTimeoutRef.current);
      acceptTimeoutRef.current = null;
    }
    
    transitionTo('IDLE');
  }, [transitionTo]);

  return {
    // Current state
    state,
    error,
    
    // State transition functions
    startGenerating,
    setReady,
    startAccepting,
    setError,
    reset,
    
    // State checks (computed)
    isIdle: state === 'IDLE',
    isGenerating: state === 'GENERATING',
    isReady: state === 'READY',
    isAccepting: state === 'ACCEPTING',
    hasError: state === 'ERROR',
  };
}

/**
 * Validate state transitions according to the state machine
 */
function isValidTransition(
  from: GhostWriterState,
  to: GhostWriterState
): boolean {
  // Define valid transitions
  const validTransitions: Record<GhostWriterState, GhostWriterState[]> = {
    IDLE: ['GENERATING', 'ERROR'],
    GENERATING: ['READY', 'ERROR', 'IDLE'],
    READY: ['ACCEPTING', 'GENERATING', 'IDLE', 'ERROR'],
    ACCEPTING: ['IDLE', 'ERROR'],
    ERROR: ['IDLE', 'GENERATING'],
  };

  return validTransitions[from]?.includes(to) ?? false;
}

/**
 * Helper function to create error objects
 */
export function createGhostWriterError(
  type: GhostWriterErrorType,
  message?: string
): GhostWriterError {
  const defaultMessages: Record<GhostWriterErrorType, string> = {
    NETWORK_ERROR: 'Connection to the ethereal realm lost',
    API_ERROR: 'The spirits are silent... Try again?',
    TIMEOUT_ERROR: 'The ghost writer took too long to respond',
    RATE_LIMIT_ERROR: 'The ghost writer needs rest (rate limited)',
    INVALID_KEY_ERROR: 'API key missing - check your settings',
    UNKNOWN_ERROR: 'An unknown error occurred',
  };

  const retryableErrors: GhostWriterErrorType[] = [
    'NETWORK_ERROR',
    'API_ERROR',
    'TIMEOUT_ERROR',
  ];

  return {
    type,
    message: message || defaultMessages[type],
    retryable: retryableErrors.includes(type),
  };
}
