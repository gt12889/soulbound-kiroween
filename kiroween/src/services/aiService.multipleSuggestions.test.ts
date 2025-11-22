/**
 * Tests for multiple suggestions functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { aiService } from './aiService';

describe('AIService - Multiple Suggestions', () => {
  beforeEach(() => {
    aiService.configure({
      apiKey: 'test-key',
      provider: 'openrouter',
    });
    aiService.clearCache();
  });

  it('should request multiple suggestions with getSuggestions', async () => {
    // Mock fetch to return multiple choices
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        choices: [
          { message: { content: 'Suggestion 1' } },
          { message: { content: 'Suggestion 2' } },
          { message: { content: 'Suggestion 3' } },
        ],
      }),
    });

    const suggestions = await aiService.getSuggestions('test context', 3);

    expect(suggestions).toHaveLength(3);
    expect(suggestions[0]).toBe('Suggestion 1');
    expect(suggestions[1]).toBe('Suggestion 2');
    expect(suggestions[2]).toBe('Suggestion 3');
  });

  it('should clamp count to valid range (2-3)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        choices: [
          { message: { content: 'Suggestion 1' } },
          { message: { content: 'Suggestion 2' } },
          { message: { content: 'Suggestion 3' } },
        ],
      }),
    });

    // Request 5 suggestions, should clamp to 3
    const suggestions = await aiService.getSuggestions('test context', 5);
    expect(suggestions).toHaveLength(3);

    // Request 1 suggestion, should clamp to 2
    const suggestions2 = await aiService.getSuggestions('test context 2', 1);
    expect(suggestions2).toHaveLength(2);
  });

  it('should cache multiple suggestions', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        choices: [
          { message: { content: 'Cached 1' } },
          { message: { content: 'Cached 2' } },
          { message: { content: 'Cached 3' } },
        ],
      }),
    });

    // First call should hit API
    const suggestions1 = await aiService.getSuggestions('cached context', 3);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Second call should use cache
    const suggestions2 = await aiService.getSuggestions('cached context', 3);
    expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1, no new call
    expect(suggestions2).toEqual(suggestions1);
  });

  it('should pad results if API returns fewer suggestions than requested', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        choices: [
          { message: { content: 'Only one suggestion' } },
        ],
      }),
    });

    const suggestions = await aiService.getSuggestions('test context', 3);

    // Should pad with the first result
    expect(suggestions).toHaveLength(3);
    expect(suggestions[0]).toBe('Only one suggestion');
    expect(suggestions[1]).toBe('Only one suggestion');
    expect(suggestions[2]).toBe('Only one suggestion');
  });

  it('should generate multiple local suggestions when no API key', async () => {
    aiService.configure({
      apiKey: '',
      provider: 'openrouter',
    });

    const suggestions = await aiService.getSuggestions('test context', 3);

    expect(suggestions).toHaveLength(3);
    expect(suggestions[0]).toBeTruthy();
    expect(suggestions[1]).toBeTruthy();
    expect(suggestions[2]).toBeTruthy();
    // Each should be different (or at least have content)
    expect(suggestions[0].length).toBeGreaterThan(0);
  });

  it('should support Gemini provider with candidateCount', async () => {
    aiService.configure({
      apiKey: 'test-key',
      provider: 'gemini',
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        candidates: [
          { content: { parts: [{ text: 'Gemini suggestion 1' }] } },
          { content: { parts: [{ text: 'Gemini suggestion 2' }] } },
          { content: { parts: [{ text: 'Gemini suggestion 3' }] } },
        ],
      }),
    });

    const suggestions = await aiService.getSuggestions('test context', 3);

    expect(suggestions).toHaveLength(3);
    expect(suggestions[0]).toBe('Gemini suggestion 1');
    expect(suggestions[1]).toBe('Gemini suggestion 2');
    expect(suggestions[2]).toBe('Gemini suggestion 3');
  });

  it('should include n parameter in OpenAI/OpenRouter requests', async () => {
    aiService.configure({
      apiKey: 'test-key',
      provider: 'openrouter',
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        choices: [
          { message: { content: 'Suggestion 1' } },
          { message: { content: 'Suggestion 2' } },
        ],
      }),
    });

    await aiService.getSuggestions('test context', 2);

    const fetchCall = (global.fetch as any).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    
    expect(requestBody.n).toBe(2);
  });

  it('should include candidateCount in Gemini requests', async () => {
    aiService.configure({
      apiKey: 'test-key',
      provider: 'gemini',
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        candidates: [
          { content: { parts: [{ text: 'Suggestion 1' }] } },
          { content: { parts: [{ text: 'Suggestion 2' }] } },
        ],
      }),
    });

    await aiService.getSuggestions('test context', 2);

    const fetchCall = (global.fetch as any).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    
    expect(requestBody.generationConfig.candidateCount).toBe(2);
  });
});

describe('AIService - Selection Logic', () => {
  beforeEach(() => {
    aiService.configure({
      apiKey: 'test-key',
      provider: 'openrouter',
    });
    aiService.clearCache();
  });

  it('should select a specific suggestion by index', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        choices: [
          { message: { content: 'First suggestion' } },
          { message: { content: 'Second suggestion' } },
          { message: { content: 'Third suggestion' } },
        ],
      }),
    });

    // Generate suggestions first
    await aiService.getSuggestions('test context', 3);

    // Select each suggestion
    const first = aiService.selectSuggestion('test context', 0);
    const second = aiService.selectSuggestion('test context', 1);
    const third = aiService.selectSuggestion('test context', 2);

    expect(first).toBe('First suggestion');
    expect(second).toBe('Second suggestion');
    expect(third).toBe('Third suggestion');
  });

  it('should return null for invalid index', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        choices: [
          { message: { content: 'First suggestion' } },
          { message: { content: 'Second suggestion' } },
        ],
      }),
    });

    await aiService.getSuggestions('test context', 2);

    // Out of bounds indices
    expect(aiService.selectSuggestion('test context', -1)).toBeNull();
    expect(aiService.selectSuggestion('test context', 2)).toBeNull();
    expect(aiService.selectSuggestion('test context', 10)).toBeNull();
  });

  it('should return null when no suggestions cached', () => {
    const result = aiService.selectSuggestion('non-existent context', 0);
    expect(result).toBeNull();
  });

  it('should get all alternatives for a context', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        choices: [
          { message: { content: 'Alt 1' } },
          { message: { content: 'Alt 2' } },
          { message: { content: 'Alt 3' } },
        ],
      }),
    });

    await aiService.getSuggestions('test context', 3);

    const alternatives = aiService.getAlternatives('test context');

    expect(alternatives).toHaveLength(3);
    expect(alternatives).toEqual(['Alt 1', 'Alt 2', 'Alt 3']);
  });

  it('should return null when no alternatives exist', () => {
    const alternatives = aiService.getAlternatives('non-existent context');
    expect(alternatives).toBeNull();
  });

  it('should return a copy of alternatives to prevent mutation', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        choices: [
          { message: { content: 'Alt 1' } },
          { message: { content: 'Alt 2' } },
        ],
      }),
    });

    await aiService.getSuggestions('test context', 2);

    const alternatives1 = aiService.getAlternatives('test context');
    const alternatives2 = aiService.getAlternatives('test context');

    // Should be equal but not the same reference
    expect(alternatives1).toEqual(alternatives2);
    expect(alternatives1).not.toBe(alternatives2);

    // Mutating one shouldn't affect the other
    alternatives1?.push('Modified');
    expect(alternatives2).toHaveLength(2);
  });

  it('should get count of available alternatives', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        choices: [
          { message: { content: 'Alt 1' } },
          { message: { content: 'Alt 2' } },
          { message: { content: 'Alt 3' } },
        ],
      }),
    });

    await aiService.getSuggestions('test context', 3);

    const count = aiService.getAlternativesCount('test context');
    expect(count).toBe(3);
  });

  it('should return 0 count when no alternatives exist', () => {
    const count = aiService.getAlternativesCount('non-existent context');
    expect(count).toBe(0);
  });

  it('should handle context truncation in selection', async () => {
    // Create a very long context
    const longContext = 'a'.repeat(2000);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        choices: [
          { message: { content: 'Suggestion 1' } },
          { message: { content: 'Suggestion 2' } },
        ],
      }),
    });

    await aiService.getSuggestions(longContext, 2);

    // Should be able to select using the same long context
    const selected = aiService.selectSuggestion(longContext, 0);
    expect(selected).toBe('Suggestion 1');

    // Should also work with alternatives
    const alternatives = aiService.getAlternatives(longContext);
    expect(alternatives).toHaveLength(2);
  });
});
