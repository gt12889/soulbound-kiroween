/**
 * Tests for AI Service request cancellation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { aiService } from './aiService';

describe('AIService - Request Cancellation', () => {
  beforeEach(() => {
    // Configure service for testing
    aiService.configure({
      apiKey: 'test-key',
      provider: 'openrouter',
      debounceMs: 0, // Disable debounce for testing
    });
    
    // Clear cache before each test
    aiService.clearCache();
  });

  afterEach(() => {
    // Clean up after each test
    aiService.cancelPending();
    vi.restoreAllMocks();
  });

  it('should cancel pending requests when cancelPending is called', async () => {
    // Mock fetch to simulate a slow request
    const mockFetch = vi.fn(() => 
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({
              choices: [{ message: { content: 'Test suggestion' } }],
            }),
          } as Response);
        }, 1000);
      })
    );
    global.fetch = mockFetch;

    // Start a request
    const requestPromise = aiService.getSuggestion('test context');

    // Cancel immediately (before debounce completes)
    aiService.cancelPending();

    // Verify fetch was not called (debounce was cancelled)
    expect(mockFetch).not.toHaveBeenCalled();
    
    // Note: The promise will hang (not resolve or reject) because the debounce
    // timer was cleared. This is expected behavior - the UI handles this by
    // resetting state when cancel is clicked.
  });

  it('should abort in-flight requests', async () => {
    let abortCalled = false;
    
    // Mock fetch with abort signal tracking
    const mockFetch = vi.fn((url, options) => {
      const signal = options?.signal as AbortSignal;
      if (signal) {
        signal.addEventListener('abort', () => {
          abortCalled = true;
        });
      }
      
      return new Promise((resolve, reject) => {
        // Check if already aborted
        if (signal?.aborted) {
          reject(new DOMException('Aborted', 'AbortError'));
          return;
        }
        
        setTimeout(() => {
          if (signal?.aborted) {
            reject(new DOMException('Aborted', 'AbortError'));
          } else {
            resolve({
              ok: true,
              json: async () => ({
                choices: [{ message: { content: 'Test suggestion' } }],
              }),
            } as Response);
          }
        }, 100);
      });
    });
    global.fetch = mockFetch;

    // Start a request (debounce is 0, so it starts immediately)
    const requestPromise = aiService.getSuggestion('test context');

    // Wait for fetch to be called
    await new Promise(resolve => setTimeout(resolve, 10));

    // Cancel the request
    aiService.cancelPending();

    // Verify abort was called
    expect(abortCalled).toBe(true);

    // The fetch promise will reject, but the outer promise from getSuggestion
    // will catch it and fall back to local suggestions
    const result = await requestPromise;
    
    // Should get a local fallback suggestion
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should clear pending requests map when cancelled', async () => {
    // Mock fetch
    const mockFetch = vi.fn(() => 
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({
              choices: [{ message: { content: 'Test suggestion' } }],
            }),
          } as Response);
        }, 1000);
      })
    );
    global.fetch = mockFetch;

    // Start a request
    const requestPromise = aiService.getSuggestion('test context');

    // Cancel
    aiService.cancelPending();

    // Try to get the same suggestion again - should create a new request
    const secondRequestPromise = aiService.getSuggestion('test context');

    // Both should be different promises
    expect(requestPromise).not.toBe(secondRequestPromise);

    // Clean up
    aiService.cancelPending();
  });

  it('should handle cancellation gracefully when no requests are pending', () => {
    // Should not throw
    expect(() => aiService.cancelPending()).not.toThrow();
  });

  it('should clear debounce timer when cancelled', async () => {
    // Configure service with debounce
    aiService.configure({
      apiKey: 'test-key',
      provider: 'openrouter',
      debounceMs: 500,
    });

    // Mock fetch
    const mockFetch = vi.fn(() => 
      Promise.resolve({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Test suggestion' } }],
        }),
      } as Response)
    );
    global.fetch = mockFetch;

    // Start a request (will be debounced)
    aiService.getSuggestion('test context');

    // Cancel before debounce completes
    aiService.cancelPending();

    // Wait to ensure debounce would have completed
    await new Promise(resolve => setTimeout(resolve, 600));

    // Fetch should not have been called (debounce was cancelled)
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
