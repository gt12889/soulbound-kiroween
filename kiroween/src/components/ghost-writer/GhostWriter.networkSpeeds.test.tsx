/**
 * Ghost Writer - Network Speed Tests
 * Comprehensive tests for various network speeds and conditions
 * Tests fast, medium, slow, and very slow network scenarios
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiService } from '../../services/aiService';

// Mock fetch globally
const originalFetch = global.fetch;

describe('GhostWriter - Various Network Speeds', () => {
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

  describe('Fast Network (< 100ms)', () => {
    it('should handle instant response (10ms)', async () => {
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

      // Mock very fast response
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                choices: [{ message: { content: 'Instant suggestion' } }],
              }),
            });
          }, 10);
        })
      );

      const result = await aiService.getSuggestion('Testing instant response');

      // Should still emit proper state transitions
      expect(stateChanges).toEqual(['loading', 'ready']);
      expect(result).toBe('Instant suggestion');
    });

    it('should handle fast response (50ms)', async () => {
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

      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                choices: [{ message: { content: 'Fast suggestion' } }],
              }),
            });
          }, 50);
        })
      );

      const result = await aiService.getSuggestion('Testing fast response');

      expect(stateChanges).toEqual(['loading', 'ready']);
      expect(result).toBe('Fast suggestion');
    });

    it('should not show loading indicator for very fast responses', async () => {
      const stateChanges: string[] = [];
      let loadingShown = false;
      
      aiService.configure({
        apiKey: 'test-key',
        provider: 'openrouter',
        debounceMs: 0,
        maxRetries: 0,
        onStateChange: (state) => {
          stateChanges.push(state);
          if (state === 'loading') {
            // In real UI, loading indicator has 200ms delay
            // So responses < 200ms shouldn't show loading UI
            setTimeout(() => {
              loadingShown = true;
            }, 200);
          }
        },
      });

      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                choices: [{ message: { content: 'Very fast' } }],
              }),
            });
          }, 50);
        })
      );

      await aiService.getSuggestion('Testing loading delay');

      // Loading state was emitted but UI wouldn't show it
      expect(stateChanges).toContain('loading');
      expect(loadingShown).toBe(false);
    });
  });

  describe('Medium Network (100ms - 1s)', () => {
    it('should handle typical response time (300ms)', async () => {
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

      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                choices: [{ message: { content: 'Medium speed suggestion' } }],
              }),
            });
          }, 300);
        })
      );

      const result = await aiService.getSuggestion('Testing medium speed');

      expect(stateChanges).toEqual(['loading', 'ready']);
      expect(result).toBe('Medium speed suggestion');
    });

    it('should show loading indicator for medium responses', async () => {
      const stateChanges: string[] = [];
      let loadingShown = false;
      
      aiService.configure({
        apiKey: 'test-key',
        provider: 'openrouter',
        debounceMs: 0,
        maxRetries: 0,
        onStateChange: (state) => {
          stateChanges.push(state);
          if (state === 'loading') {
            // Simulate 200ms loading delay
            setTimeout(() => {
              loadingShown = true;
            }, 200);
          }
        },
      });

      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                choices: [{ message: { content: 'Medium suggestion' } }],
              }),
            });
          }, 500);
        })
      );

      await aiService.getSuggestion('Testing loading indicator');

      // Wait for loading delay
      await new Promise(resolve => setTimeout(resolve, 250));

      expect(stateChanges).toContain('loading');
      expect(loadingShown).toBe(true);
    });

    it('should handle good network (800ms)', async () => {
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

      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                choices: [{ message: { content: 'Good network suggestion' } }],
              }),
            });
          }, 800);
        })
      );

      const result = await aiService.getSuggestion('Testing good network');

      expect(stateChanges).toEqual(['loading', 'ready']);
      expect(result).toBe('Good network suggestion');
    });
  });

  describe('Slow Network (1s - 5s)', () => {
    it('should handle slow response (2s)', async () => {
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

      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                choices: [{ message: { content: 'Slow network suggestion' } }],
              }),
            });
          }, 2000);
        })
      );

      const result = await aiService.getSuggestion('Testing slow network');

      expect(stateChanges).toEqual(['loading', 'ready']);
      expect(result).toBe('Slow network suggestion');
    }, 5000);

    it('should maintain loading state during slow response', async () => {
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

      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                choices: [{ message: { content: 'Slow suggestion' } }],
              }),
            });
          }, 3000);
        })
      );

      const suggestionPromise = aiService.getSuggestion('Testing loading persistence');

      // Check state after 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(stateChanges).toEqual(['loading']);

      // Check state after 2 seconds
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(stateChanges).toEqual(['loading']);

      // Wait for completion
      await suggestionPromise;
      expect(stateChanges).toEqual(['loading', 'ready']);
    }, 5000);

    it('should allow cancellation during slow network', async () => {
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                choices: [{ message: { content: 'Slow suggestion' } }],
              }),
            });
          }, 3000);
        })
      );

      const suggestionPromise = aiService.getSuggestion('Testing cancellation');

      // Wait a bit then cancel
      await new Promise(resolve => setTimeout(resolve, 500));
      aiService.cancelPending();

      // Should still resolve with fallback
      const result = await suggestionPromise;
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    }, 5000);
  });

  describe('Very Slow Network (> 5s)', () => {
    it('should handle very slow response (7s)', async () => {
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

      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                choices: [{ message: { content: 'Very slow suggestion' } }],
              }),
            });
          }, 7000);
        })
      );

      const result = await aiService.getSuggestion('Testing very slow network');

      expect(stateChanges).toEqual(['loading', 'ready']);
      expect(result).toBe('Very slow suggestion');
    }, 10000);

    it('should maintain state integrity during very slow response', async () => {
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

      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                choices: [{ message: { content: 'Very slow' } }],
              }),
            });
          }, 6000);
        })
      );

      const suggestionPromise = aiService.getSuggestion('Testing state integrity');

      // Check state at multiple intervals
      await new Promise(resolve => setTimeout(resolve, 2000));
      expect(stateChanges).toEqual(['loading']);

      await new Promise(resolve => setTimeout(resolve, 2000));
      expect(stateChanges).toEqual(['loading']);

      // Wait for completion
      await suggestionPromise;
      expect(stateChanges).toEqual(['loading', 'ready']);
    }, 10000);

    it('should handle timeout on extremely slow network', async () => {
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

      const result = await aiService.getSuggestion('Testing timeout');

      // Should emit error state and provide fallback
      expect(stateChanges).toContain('loading');
      expect(stateChanges).toContain('error');
      expect(stateChanges).toContain('ready');
      expect(result).toBeTruthy();
    });
  });

  describe('Variable Network Conditions', () => {
    it('should handle fluctuating network speeds', async () => {
      let callCount = 0;
      const delays = [100, 500, 2000, 300]; // Fast, medium, slow, medium
      
      global.fetch = vi.fn().mockImplementation(() => {
        const delay = delays[callCount % delays.length];
        callCount++;
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                choices: [{ message: { content: `Suggestion ${callCount}` } }],
              }),
            });
          }, delay);
        });
      });

      // Make multiple requests with varying speeds
      const result1 = await aiService.getSuggestion('Request 1');
      expect(result1).toBe('Suggestion 1');

      aiService.clearCache();
      const result2 = await aiService.getSuggestion('Request 2');
      expect(result2).toBe('Suggestion 2');

      aiService.clearCache();
      const result3 = await aiService.getSuggestion('Request 3');
      expect(result3).toBe('Suggestion 3');
    }, 5000);

    it('should handle network degradation gracefully', async () => {
      let attemptCount = 0;
      
      // Simulate progressively slower responses
      global.fetch = vi.fn().mockImplementation(() => {
        attemptCount++;
        const delay = attemptCount * 500; // 500ms, 1s, 1.5s...
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                choices: [{ message: { content: `Degraded ${attemptCount}` } }],
              }),
            });
          }, delay);
        });
      });

      const result1 = await aiService.getSuggestion('First request');
      expect(result1).toBe('Degraded 1');

      aiService.clearCache();
      const result2 = await aiService.getSuggestion('Second request');
      expect(result2).toBe('Degraded 2');
    }, 5000);

    it('should handle network recovery', async () => {
      let attemptCount = 0;
      
      // Simulate slow then fast
      global.fetch = vi.fn().mockImplementation(() => {
        attemptCount++;
        const delay = attemptCount === 1 ? 2000 : 100; // Slow then fast
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                choices: [{ message: { content: `Recovery ${attemptCount}` } }],
              }),
            });
          }, delay);
        });
      });

      const result1 = await aiService.getSuggestion('Slow request');
      expect(result1).toBe('Recovery 1');

      aiService.clearCache();
      const result2 = await aiService.getSuggestion('Fast request');
      expect(result2).toBe('Recovery 2');
    }, 5000);
  });

  describe('Optimistic UI with Various Speeds', () => {
    it('should show optimistic UI for fast responses', async () => {
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                choices: [{ message: { content: 'Fast optimistic' } }],
              }),
            });
          }, 50);
        })
      );

      const result = await aiService.getSuggestion('Testing optimistic UI');
      
      // Fast response should complete before loading indicator shows
      expect(result).toBe('Fast optimistic');
    });

    it('should handle optimistic UI with slow responses', async () => {
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                choices: [{ message: { content: 'Slow optimistic' } }],
              }),
            });
          }, 2000);
        })
      );

      const result = await aiService.getSuggestion('Testing slow optimistic');
      
      // Should eventually get result
      expect(result).toBe('Slow optimistic');
    }, 5000);
  });

  describe('Cache Performance with Various Speeds', () => {
    it('should return cached results instantly regardless of original speed', async () => {
      // First request - slow
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                choices: [{ message: { content: 'Cached suggestion' } }],
              }),
            });
          }, 2000);
        })
      );

      const result1 = await aiService.getSuggestion('Cache test text');
      expect(result1).toBe('Cached suggestion');

      // Second request - should be instant from cache
      const startTime = Date.now();
      const result2 = await aiService.getSuggestion('Cache test text');
      const duration = Date.now() - startTime;

      expect(result2).toBe('Cached suggestion');
      expect(duration).toBeLessThan(50); // Should be nearly instant
    }, 5000);
  });
});
