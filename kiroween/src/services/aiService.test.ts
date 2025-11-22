/**
 * AI Service Tests - State Callback Integration
 * Tests for the onStateChange callback functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiService, type AIServiceStateCallback } from './aiService';

describe('AIService - State Callbacks', () => {
  let stateChangeSpy: ReturnType<typeof vi.fn<AIServiceStateCallback>>;

  beforeEach(() => {
    stateChangeSpy = vi.fn<AIServiceStateCallback>();
    aiService.configure({
      apiKey: 'test-key',
      provider: 'openrouter',
      onStateChange: stateChangeSpy,
      debounceMs: 0, // Disable debounce for testing
    });
  });

  afterEach(() => {
    aiService.cancelPending();
    aiService.clearCache();
    vi.restoreAllMocks();
  });

  it('should emit loading state when request starts', async () => {
    // Mock fetch to simulate API call
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Test suggestion' } }],
      }),
    }));

    await aiService.getSuggestion('test context');

    // Should have called with loading state
    expect(stateChangeSpy).toHaveBeenCalledWith('loading', undefined);
  });

  it('should emit ready state when response received', async () => {
    // Mock fetch to simulate API call
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Test suggestion' } }],
      }),
    }));

    await aiService.getSuggestion('test context');

    // Should have called with ready state
    expect(stateChangeSpy).toHaveBeenCalledWith('ready', undefined);
  });

  it('should emit error state on API failures before falling back', async () => {
    // Mock fetch to simulate API error
    const testError = new Error('API Error');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(testError));

    // Configure with maxRetries: 0 to fail immediately
    aiService.configure({
      apiKey: 'test-key',
      provider: 'openrouter',
      onStateChange: stateChangeSpy,
      debounceMs: 0,
      maxRetries: 0, // Fail immediately without retries
    });

    const result = await aiService.getSuggestion('test context');

    // Should have emitted loading state first
    expect(stateChangeSpy).toHaveBeenCalledWith('loading', undefined);
    
    // Should have emitted error state after API failure
    expect(stateChangeSpy).toHaveBeenCalledWith('error', expect.any(Error));
    
    // Should have returned a local fallback suggestion
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    
    // Should emit ready state after local fallback
    expect(stateChangeSpy).toHaveBeenCalledWith('ready', undefined);
    
    // Verify the call order: loading -> error -> ready
    expect(stateChangeSpy).toHaveBeenNthCalledWith(1, 'loading', undefined);
    expect(stateChangeSpy).toHaveBeenNthCalledWith(2, 'error', expect.any(Error));
    expect(stateChangeSpy).toHaveBeenNthCalledWith(3, 'ready', undefined);
  });

  it('should emit ready state immediately for cached results', async () => {
    // Mock fetch for first call
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Cached suggestion' } }],
      }),
    }));

    // First call - should go through API
    await aiService.getSuggestion('cached context');
    
    // Clear spy to check only second call
    stateChangeSpy.mockClear();

    // Second call - should use cache
    await aiService.getSuggestion('cached context');

    // Should emit ready immediately for cached result
    expect(stateChangeSpy).toHaveBeenCalledWith('ready', undefined);
    expect(stateChangeSpy).toHaveBeenCalledTimes(1);
  });

  it('should support request cancellation', () => {
    // Start a request
    aiService.getSuggestion('test context').catch(() => {
      // Ignore cancellation error
    });

    // Cancel it
    expect(() => aiService.cancelPending()).not.toThrow();
  });

  it('should clear debounce timer when cancelled', () => {
    // Start a request (debounce is disabled in beforeEach, but timer still exists)
    aiService.getSuggestion('test context for cancel').catch(() => {
      // Ignore any errors
    });

    // Cancel should not throw
    expect(() => aiService.cancelPending()).not.toThrow();
    
    // Calling cancel again should also not throw
    expect(() => aiService.cancelPending()).not.toThrow();
  });

  it('should clear pending requests when cancelled', () => {
    // Start multiple requests
    aiService.getSuggestion('context 1').catch(() => {});
    aiService.getSuggestion('context 2').catch(() => {});

    // Cancel all
    aiService.cancelPending();

    // Verify cache stats are still accessible after cancel
    const stats = aiService.getCacheStats();
    expect(stats).toBeDefined();
    expect(stats.maxSize).toBe(50);
  });

  it('should handle AbortError gracefully', async () => {
    // Mock fetch to throw AbortError
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

    // Configure with no retries to fail immediately
    aiService.configure({
      apiKey: 'test-key',
      provider: 'openrouter',
      onStateChange: stateChangeSpy,
      debounceMs: 0,
      maxRetries: 0,
    });

    // Should return fallback suggestion instead of throwing
    const result = await aiService.getSuggestion('test context');
    
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});
