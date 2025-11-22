/**
 * Ghost Writer - Slow Network Tests
 * Tests for handling slow network conditions, timeouts, and delays
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiService } from '../../services/aiService';
import { useGhostWriterState } from '../../hooks/useGhostWriterState';
import { renderHook, waitFor } from '@testing-library/react';

// Mock fetch globally
const originalFetch = global.fetch;

describe('GhostWriter - Slow Network Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Configure AI service for testing
    aiService.configure({
      apiKey: 'test-key',
      provider: 'openrouter',
      debounceMs: 0, // Disable debounce for testing
      maxRetries: 0, // Disable retries for predictable testing
    });
  });

  afterEach(() => {
    aiService.cancelPending();
    aiService.clearCache();
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it('should emit loading state during slow API response (2 seconds)', async () => {
    const stateChanges: string[] = [];
    
    // Configure with state callback
    aiService.configure({
      apiKey: 'test-key',
      provider: 'openrouter',
      debounceMs: 0,
      maxRetries: 0,
      onStateChange: (state) => {
        stateChanges.push(state);
      },
    });

    // Mock slow API response (2 seconds)
    global.fetch = vi.fn().mockImplementation(() => 
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({
              choices: [{ message: { content: 'Slow suggestion text' } }],
            }),
          });
        }, 2000);
      })
    );

    // Start request
    const suggestionPromise = aiService.getSuggestion('This is a test with enough context');

    // Should emit loading state immediately
    await waitFor(() => {
      expect(stateChanges).toContain('loading');
    }, { timeout: 100 });

    // Wait for response
    await suggestionPromise;

    // Should eventually emit ready state
    expect(stateChanges).toContain('ready');
    expect(stateChanges).toEqual(['loading', 'ready']);
  });

  it('should handle very slow network (5+ seconds)', async () => {
    const stateChanges: string[] = [];
    
    aiService.configure({
      apiKey: 'test-key',
      provider: 'openrouter',
      debounceMs: 0,
      maxRetries: 0,
      onStateChange: (state) => {
        stateChanges.push(state);
      },
    });

    // Mock very slow API response (5 seconds)
    global.fetch = vi.fn().mockImplementation(() => 
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({
              choices: [{ message: { content: 'Very slow suggestion' } }],
            }),
          });
        }, 5000);
      })
    );

    // Start request
    const suggestionPromise = aiService.getSuggestion('Testing very slow network conditions');

    // Should emit loading state
    await waitFor(() => {
      expect(stateChanges).toContain('loading');
    }, { timeout: 100 });

    // Should still be in loading state after 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    expect(stateChanges).toEqual(['loading']);

    // Wait for completion
    await suggestionPromise;

    // Should eventually complete
    expect(stateChanges).toContain('ready');
  }, 10000); // Increase timeout for this test

  it('should allow cancellation during slow network request', async () => {
    // Mock slow API response that takes a long time
    global.fetch = vi.fn().mockImplementation(() => 
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({
              choices: [{ message: { content: 'Slow suggestion' } }],
            }),
          });
        }, 2000); // 2 seconds
      })
    );

    // Start request
    const suggestionPromise = aiService.getSuggestion('Testing cancellation during slow request');

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));

    // Cancel the request
    aiService.cancelPending();

    // The promise should still resolve (with fallback)
    const result = await suggestionPromise;
    
    // Should get a result (either from cache or fallback)
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  }, 10000);

  it('should handle network timeout gracefully', async () => {
    const stateChanges: string[] = [];
    
    aiService.configure({
      apiKey: 'test-key',
      provider: 'openrouter',
      debounceMs: 0,
      maxRetries: 0,
      onStateChange: (state) => {
        stateChanges.push(state);
      },
    });

    // Mock timeout error
    global.fetch = vi.fn().mockRejectedValue(
      new Error('Request timeout after 30 seconds')
    );

    // Request should fail but return fallback
    const result = await aiService.getSuggestion('Testing timeout handling');

    // Should emit loading, error, then ready (for fallback)
    expect(stateChanges).toContain('loading');
    expect(stateChanges).toContain('error');
    expect(stateChanges).toContain('ready');
    
    // Should still get a result (fallback)
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should handle intermittent network failures', async () => {
    let callCount = 0;
    
    // First call fails, second succeeds
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Success after retry' } }],
        }),
      });
    });

    // First attempt - should fail but return fallback
    const result1 = await aiService.getSuggestion('Testing intermittent network');
    expect(result1).toBeTruthy();

    // Clear cache for second attempt
    aiService.clearCache();

    // Second attempt - should succeed
    const result2 = await aiService.getSuggestion('Second attempt after network failure');
    expect(result2).toBe('Success after retry');
  });

  it('should emit states correctly even with fast response', async () => {
    const stateChanges: string[] = [];
    
    aiService.configure({
      apiKey: 'test-key',
      provider: 'openrouter',
      debounceMs: 0,
      maxRetries: 0,
      onStateChange: (state) => {
        stateChanges.push(state);
      },
    });

    // Mock very fast response (10ms)
    global.fetch = vi.fn().mockImplementation(() => 
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({
              choices: [{ message: { content: 'Fast suggestion' } }],
            }),
          });
        }, 10);
      })
    );

    await aiService.getSuggestion('Testing fast response');

    // Should still emit both loading and ready states
    expect(stateChanges).toEqual(['loading', 'ready']);
  });

  it('should handle multiple rapid requests with slow network', async () => {
    let callCount = 0;
    
    // Mock slow responses
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({
              choices: [{ message: { content: `Suggestion ${callCount}` } }],
            }),
          });
        }, 500); // Reduced to 500ms for faster test
      });
    });

    // Make multiple rapid requests
    const promise1 = aiService.getSuggestion('First text');
    const promise2 = aiService.getSuggestion('First text more text');
    const promise3 = aiService.getSuggestion('First text more text even more');

    // All should complete
    const results = await Promise.all([promise1, promise2, promise3]);
    
    expect(results).toHaveLength(3);
    results.forEach(result => {
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  }, 10000);

  it('should maintain state machine integrity during slow network', async () => {
    const { result } = renderHook(() => useGhostWriterState());

    // Start generating - need to use act for state updates
    await waitFor(() => {
      result.current.startGenerating();
    });
    
    expect(result.current.state).toBe('GENERATING');
    expect(result.current.isGenerating).toBe(true);

    // Simulate slow network - state should remain GENERATING
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(result.current.state).toBe('GENERATING');

    // Eventually mark as ready
    await waitFor(() => {
      result.current.setReady();
    });
    
    expect(result.current.state).toBe('READY');
    expect(result.current.isReady).toBe(true);
  });

  it('should handle network error during slow request', async () => {
    const stateChanges: string[] = [];
    
    aiService.configure({
      apiKey: 'test-key',
      provider: 'openrouter',
      debounceMs: 0,
      maxRetries: 0,
      onStateChange: (state) => {
        stateChanges.push(state);
      },
    });

    // Mock slow request that eventually fails
    global.fetch = vi.fn().mockImplementation(() => 
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Network error after delay')), 1500);
      })
    );

    // Should handle error gracefully
    const result = await aiService.getSuggestion('Testing delayed network error');

    // Should emit loading, error, then ready (for fallback)
    expect(stateChanges).toContain('loading');
    expect(stateChanges).toContain('error');
    expect(stateChanges).toContain('ready');
    
    // Should still return fallback
    expect(result).toBeTruthy();
  });

  it('should handle progressive network degradation', async () => {
    let attemptCount = 0;
    
    // Simulate progressively slower responses
    global.fetch = vi.fn().mockImplementation(() => {
      attemptCount++;
      const delay = attemptCount * 1000; // 1s, 2s, 3s...
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({
              choices: [{ message: { content: `Suggestion ${attemptCount}` } }],
            }),
          });
        }, delay);
      });
    });

    // First request (1s delay)
    const result1 = await aiService.getSuggestion('First request');
    expect(result1).toBe('Suggestion 1');

    // Clear cache for second request
    aiService.clearCache();

    // Second request (2s delay)
    const result2 = await aiService.getSuggestion('Second request slower');
    expect(result2).toBe('Suggestion 2');
  }, 10000); // Increase timeout for this test

  it('should handle AbortController cancellation during slow network', async () => {
    // Mock slow response
    global.fetch = vi.fn().mockImplementation(() => 
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({
              choices: [{ message: { content: 'Slow suggestion' } }],
            }),
          });
        }, 2000); // Reduced to 2 seconds
      })
    );

    // Start request
    const suggestionPromise = aiService.getSuggestion('Testing abort');

    // Cancel immediately
    aiService.cancelPending();

    // Should still resolve (with fallback or cached result)
    const result = await suggestionPromise;
    expect(result).toBeTruthy();
  }, 10000);
});
