/**
 * Tests for useGhostWriterState hook
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  useGhostWriterState, 
  createGhostWriterError
} from './useGhostWriterState';

describe('useGhostWriterState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should start in IDLE state', () => {
      const { result } = renderHook(() => useGhostWriterState());
      
      expect(result.current.state).toBe('IDLE');
      expect(result.current.isIdle).toBe(true);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.isReady).toBe(false);
      expect(result.current.isAccepting).toBe(false);
      expect(result.current.hasError).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('State Transitions', () => {
    it('should transition from IDLE to GENERATING', () => {
      const { result } = renderHook(() => useGhostWriterState());
      
      act(() => {
        result.current.startGenerating();
      });
      
      expect(result.current.state).toBe('GENERATING');
      expect(result.current.isGenerating).toBe(true);
      expect(result.current.isIdle).toBe(false);
    });

    it('should transition from GENERATING to READY', () => {
      const { result } = renderHook(() => useGhostWriterState());
      
      act(() => {
        result.current.startGenerating();
      });
      
      act(() => {
        result.current.setReady();
      });
      
      expect(result.current.state).toBe('READY');
      expect(result.current.isReady).toBe(true);
      expect(result.current.isGenerating).toBe(false);
    });

    it('should transition from READY to ACCEPTING', () => {
      const { result } = renderHook(() => useGhostWriterState());
      
      act(() => {
        result.current.startGenerating();
      });
      
      act(() => {
        result.current.setReady();
      });
      
      act(() => {
        result.current.startAccepting();
      });
      
      expect(result.current.state).toBe('ACCEPTING');
      expect(result.current.isAccepting).toBe(true);
      expect(result.current.isReady).toBe(false);
    });

    it('should auto-transition from ACCEPTING to IDLE after animation duration', () => {
      const { result } = renderHook(() => 
        useGhostWriterState({ acceptAnimationDuration: 500 })
      );
      
      act(() => {
        result.current.startGenerating();
      });
      
      act(() => {
        result.current.setReady();
      });
      
      act(() => {
        result.current.startAccepting();
      });
      
      expect(result.current.state).toBe('ACCEPTING');
      
      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(500);
      });
      
      expect(result.current.state).toBe('IDLE');
      expect(result.current.isIdle).toBe(true);
    });

    it('should transition to ERROR from any state', () => {
      const { result } = renderHook(() => useGhostWriterState());
      const error = createGhostWriterError('NETWORK_ERROR');
      
      act(() => {
        result.current.startGenerating();
      });
      
      act(() => {
        result.current.setError(error);
      });
      
      expect(result.current.state).toBe('ERROR');
      expect(result.current.hasError).toBe(true);
      expect(result.current.error).toEqual(error);
    });

    it('should reset to IDLE from any state', () => {
      const { result } = renderHook(() => useGhostWriterState());
      
      act(() => {
        result.current.startGenerating();
      });
      
      act(() => {
        result.current.setReady();
      });
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.state).toBe('IDLE');
      expect(result.current.isIdle).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  describe('State Change Callbacks', () => {
    it('should call onStateChange callback on transitions', () => {
      const onStateChange = vi.fn();
      const { result } = renderHook(() => 
        useGhostWriterState({ onStateChange })
      );
      
      act(() => {
        result.current.startGenerating();
      });
      
      expect(onStateChange).toHaveBeenCalledWith('GENERATING', 'IDLE', undefined);
      
      act(() => {
        result.current.setReady();
      });
      
      expect(onStateChange).toHaveBeenCalledWith('READY', 'GENERATING', undefined);
    });

    it('should pass error info to callback on error transition', () => {
      const onStateChange = vi.fn();
      const { result } = renderHook(() => 
        useGhostWriterState({ onStateChange })
      );
      const error = createGhostWriterError('API_ERROR');
      
      act(() => {
        result.current.setError(error);
      });
      
      expect(onStateChange).toHaveBeenCalledWith('ERROR', 'IDLE', error);
    });
  });

  describe('Error Handling', () => {
    it('should clear error when transitioning away from ERROR state', () => {
      const { result } = renderHook(() => useGhostWriterState());
      const error = createGhostWriterError('NETWORK_ERROR');
      
      act(() => {
        result.current.setError(error);
      });
      
      expect(result.current.error).toEqual(error);
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.error).toBeNull();
    });

    it('should handle multiple error types correctly', () => {
      const { result } = renderHook(() => useGhostWriterState());
      
      const errorTypes = [
        'NETWORK_ERROR',
        'API_ERROR',
        'TIMEOUT_ERROR',
        'RATE_LIMIT_ERROR',
        'INVALID_KEY_ERROR',
        'UNKNOWN_ERROR',
      ] as const;
      
      errorTypes.forEach(type => {
        const error = createGhostWriterError(type);
        
        act(() => {
          result.current.setError(error);
        });
        
        expect(result.current.error?.type).toBe(type);
        expect(result.current.error?.message).toBeTruthy();
        
        act(() => {
          result.current.reset();
        });
      });
    });
  });

  describe('Invalid Transitions', () => {
    it('should not allow invalid state transitions', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { result } = renderHook(() => useGhostWriterState());
      
      // Try to go from IDLE to ACCEPTING (invalid)
      act(() => {
        result.current.startAccepting();
      });
      
      expect(result.current.state).toBe('IDLE'); // Should remain in IDLE
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    it('should clear timeout when reset is called during ACCEPTING', () => {
      const { result } = renderHook(() => 
        useGhostWriterState({ acceptAnimationDuration: 1000 })
      );
      
      act(() => {
        result.current.startGenerating();
      });
      
      act(() => {
        result.current.setReady();
      });
      
      act(() => {
        result.current.startAccepting();
      });
      
      // Reset before timeout completes
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.state).toBe('IDLE');
      
      // Advance time to ensure timeout was cleared
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      // Should still be IDLE, not transition again
      expect(result.current.state).toBe('IDLE');
    });
  });

  describe('createGhostWriterError helper', () => {
    it('should create error with default message', () => {
      const error = createGhostWriterError('NETWORK_ERROR');
      
      expect(error.type).toBe('NETWORK_ERROR');
      expect(error.message).toBe('Connection to the ethereal realm lost');
      expect(error.retryable).toBe(true);
    });

    it('should create error with custom message', () => {
      const customMessage = 'Custom error message';
      const error = createGhostWriterError('API_ERROR', customMessage);
      
      expect(error.type).toBe('API_ERROR');
      expect(error.message).toBe(customMessage);
      expect(error.retryable).toBe(true);
    });

    it('should mark non-retryable errors correctly', () => {
      const rateLimitError = createGhostWriterError('RATE_LIMIT_ERROR');
      const invalidKeyError = createGhostWriterError('INVALID_KEY_ERROR');
      
      expect(rateLimitError.retryable).toBe(false);
      expect(invalidKeyError.retryable).toBe(false);
    });

    it('should mark retryable errors correctly', () => {
      const networkError = createGhostWriterError('NETWORK_ERROR');
      const apiError = createGhostWriterError('API_ERROR');
      const timeoutError = createGhostWriterError('TIMEOUT_ERROR');
      
      expect(networkError.retryable).toBe(true);
      expect(apiError.retryable).toBe(true);
      expect(timeoutError.retryable).toBe(true);
    });
  });

  describe('Complete Flow', () => {
    it('should handle complete happy path flow', () => {
      const onStateChange = vi.fn();
      const { result } = renderHook(() => 
        useGhostWriterState({ 
          onStateChange,
          acceptAnimationDuration: 500 
        })
      );
      
      // Start in IDLE
      expect(result.current.state).toBe('IDLE');
      
      // User triggers generation
      act(() => {
        result.current.startGenerating();
      });
      expect(result.current.state).toBe('GENERATING');
      
      // AI returns suggestion
      act(() => {
        result.current.setReady();
      });
      expect(result.current.state).toBe('READY');
      
      // User accepts suggestion
      act(() => {
        result.current.startAccepting();
      });
      expect(result.current.state).toBe('ACCEPTING');
      
      // Animation completes
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(result.current.state).toBe('IDLE');
      
      // Verify all callbacks were called
      expect(onStateChange).toHaveBeenCalledTimes(4);
    });

    it('should handle error recovery flow', () => {
      const { result } = renderHook(() => useGhostWriterState());
      
      // Start generation
      act(() => {
        result.current.startGenerating();
      });
      
      // Error occurs
      const error = createGhostWriterError('NETWORK_ERROR');
      act(() => {
        result.current.setError(error);
      });
      expect(result.current.state).toBe('ERROR');
      expect(result.current.error).toEqual(error);
      
      // User retries
      act(() => {
        result.current.startGenerating();
      });
      expect(result.current.state).toBe('GENERATING');
      expect(result.current.error).toBeNull();
      
      // Success this time
      act(() => {
        result.current.setReady();
      });
      expect(result.current.state).toBe('READY');
    });
  });
});
