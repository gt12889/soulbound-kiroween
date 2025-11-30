/**
 * AI Service Cache Tests
 * Tests for suggestion caching functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiService } from './aiService';

describe('AIService - Caching', () => {
  beforeEach(() => {
    aiService.configure({
      apiKey: 'test-key',
      provider: 'openrouter',
      debounceMs: 0, // Disable debounce for testing
      cacheExpiryMs: 5000, // 5 seconds for testing
    });
    aiService.clearCache();
  });

  afterEach(() => {
    aiService.cancelPending();
    aiService.clearCache();
    vi.restoreAllMocks();
  });

  it('should cache suggestions after first request', async () => {
    const mockResponse = { ok: true, json: async () => ({ choices: [{ message: { content: 'Cached suggestion' } }] }) };
    const fetchSpy = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal('fetch', fetchSpy);

    // First call - should hit API
    const result1 = await aiService.getSuggestion('test context');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result1).toBe('Cached suggestion');

    // Second call with same context - should use cache
    const result2 = await aiService.getSuggestion('test context');
    expect(fetchSpy).toHaveBeenCalledTimes(1); // Still only 1 call
    expect(result2).toBe('Cached suggestion');
  });

  it('should cache multiple suggestions', async () => {
    const mockResponse = { 
      ok: true, 
      json: async () => ({ 
        choices: [
          { message: { content: 'Suggestion 1' } },
          { message: { content: 'Suggestion 2' } },
          { message: { content: 'Suggestion 3' } }
        ] 
      }) 
    };
    const fetchSpy = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal('fetch', fetchSpy);

    // First call - should hit API
    const results1 = await aiService.getSuggestions('test context', 3);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(results1).toHaveLength(3);

    // Second call with same context - should use cache
    const results2 = await aiService.getSuggestions('test context', 3);
    expect(fetchSpy).toHaveBeenCalledTimes(1); // Still only 1 call
    expect(results2).toEqual(results1);
  });

  it('should return null for non-existent cache entries', () => {
    const alternatives = aiService.getAlternatives('non-existent context');
    expect(alternatives).toBeNull();
  });

  it('should return cached alternatives', async () => {
    const mockResponse = { 
      ok: true, 
      json: async () => ({ 
        choices: [
          { message: { content: 'Alt 1' } },
          { message: { content: 'Alt 2' } }
        ] 
      }) 
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    await aiService.getSuggestions('test context', 2);
    
    const alternatives = aiService.getAlternatives('test context');
    expect(alternatives).toEqual(['Alt 1', 'Alt 2']);
  });

  it('should select specific suggestion by index', async () => {
    const mockResponse = { 
      ok: true, 
      json: async () => ({ 
        choices: [
          { message: { content: 'First' } },
          { message: { content: 'Second' } },
          { message: { content: 'Third' } }
        ] 
      }) 
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    await aiService.getSuggestions('test context', 3);
    
    expect(aiService.selectSuggestion('test context', 0)).toBe('First');
    expect(aiService.selectSuggestion('test context', 1)).toBe('Second');
    expect(aiService.selectSuggestion('test context', 2)).toBe('Third');
  });

  it('should return null for invalid suggestion index', async () => {
    const mockResponse = { 
      ok: true, 
      json: async () => ({ 
        choices: [{ message: { content: 'Only one' } }] 
      }) 
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    await aiService.getSuggestions('test context', 1);
    
    expect(aiService.selectSuggestion('test context', -1)).toBeNull();
    expect(aiService.selectSuggestion('test context', 5)).toBeNull();
  });

  it('should return alternatives count', async () => {
    const mockResponse = { 
      ok: true, 
      json: async () => ({ 
        choices: [
          { message: { content: 'One' } },
          { message: { content: 'Two' } }
        ] 
      }) 
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    expect(aiService.getAlternativesCount('test context')).toBe(0);
    
    await aiService.getSuggestions('test context', 2);
    
    expect(aiService.getAlternativesCount('test context')).toBe(2);
  });

  it('should clear cache on demand', async () => {
    const mockResponse = { ok: true, json: async () => ({ choices: [{ message: { content: 'Test' } }] }) };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    await aiService.getSuggestion('test context');
    expect(aiService.getCacheStats().size).toBe(1);

    aiService.clearCache();
    expect(aiService.getCacheStats().size).toBe(0);
  });

  it('should respect cache size limit', async () => {
    const mockResponse = { ok: true, json: async () => ({ choices: [{ message: { content: 'Test' } }] }) };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    // Add 51 entries (max is 50)
    for (let i = 0; i < 51; i++) {
      await aiService.getSuggestion(`context ${i}`);
    }

    const stats = aiService.getCacheStats();
    expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
    expect(stats.size).toBe(50);
  });

  it('should expire old cache entries', async () => {
    // Configure with very short expiry
    aiService.configure({
      apiKey: 'test-key',
      provider: 'openrouter',
      debounceMs: 0,
      cacheExpiryMs: 100, // 100ms expiry
    });

    const mockResponse = { ok: true, json: async () => ({ choices: [{ message: { content: 'Test' } }] }) };
    const fetchSpy = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal('fetch', fetchSpy);

    // First call
    await aiService.getSuggestion('test context');
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Wait for cache to expire
    await new Promise(resolve => setTimeout(resolve, 150));

    // Second call - should hit API again due to expiry
    await aiService.getSuggestion('test context');
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('should provide cache statistics', () => {
    const stats = aiService.getCacheStats();
    expect(stats).toHaveProperty('size');
    expect(stats).toHaveProperty('maxSize');
    expect(stats.maxSize).toBe(50);
  });
});
