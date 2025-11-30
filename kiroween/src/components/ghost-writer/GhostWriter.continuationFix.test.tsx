import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiService } from '../../services/aiService';

/**
 * Test: Ghost Writer continuation and dialogue box fixes
 * 
 * Requirements:
 * 1. Passive generation dialogue boxes should be properly sized
 * 2. Active generation should properly continue from current text without repetition
 * 3. Manual generation should handle incomplete sentences
 * 4. Text cleaning should remove repetition
 */
describe('GhostWriter - Continuation and Dialogue Box Fixes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    aiService.clearCache();
  });

  describe('Manual vs Automatic Generation', () => {
    it('should pass isManual flag correctly for manual generation', async () => {
      // Configure with a test API key
      aiService.configure({
        apiKey: 'test-key',
        provider: 'gemini',
      });

      // Mock fetch to capture the request
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: ' and discovered something amazing. The journey continued with new revelations.'
              }]
            }
          }]
        })
      });
      global.fetch = mockFetch;

      // Test manual generation
      await aiService.getSuggestion('The explorer walked through the forest', 1, true);

      // Verify the request was made with manual generation prompt
      expect(mockFetch).toHaveBeenCalled();
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.contents[0].parts[0].text).toContain('incomplete sentence');
      expect(requestBody.generationConfig.maxOutputTokens).toBe(300); // Manual uses more tokens
    });

    it('should use shorter prompt for automatic generation', async () => {
      aiService.configure({
        apiKey: 'test-key',
        provider: 'gemini',
      });

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: ' quietly, listening for sounds'
              }]
            }
          }]
        })
      });
      global.fetch = mockFetch;

      // Test automatic generation
      await aiService.getSuggestion('She moved through the shadows', 1, false);

      // Verify the request was made with automatic generation prompt
      expect(mockFetch).toHaveBeenCalled();
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.contents[0].parts[0].text).toContain('2-3 sentences');
      expect(requestBody.generationConfig.maxOutputTokens).toBe(150); // Automatic uses fewer tokens
    });
  });

  describe('Text Cleaning', () => {
    it('should clean suggestions to avoid repetition', async () => {
      aiService.configure({
        apiKey: 'test-key',
        provider: 'gemini',
      });

      // Mock a response that includes repetition (common AI behavior)
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: 'walked through the forest and found a hidden path leading to adventure'
              }]
            }
          }]
        })
      });
      global.fetch = mockFetch;

      const result = await aiService.getSuggestion('She walked through the forest', 1, true);

      // The result should not include the repeated "walked through the forest"
      expect(result).not.toContain('walked through the forest and');
      // It should start with the continuation
      expect(result.trim()).toMatch(/^(and found|found)/i);
    });

    it('should handle spacing correctly for incomplete sentences', async () => {
      aiService.configure({
        apiKey: 'test-key',
        provider: 'gemini',
      });

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: 'carefully, noting every detail'
              }]
            }
          }]
        })
      });
      global.fetch = mockFetch;

      const result = await aiService.getSuggestion('She examined the artifact', 1, true);

      // Should add proper spacing
      expect(result).toMatch(/^\s/); // Starts with space
      expect(result.trim()).toBe('carefully, noting every detail');
    });
  });

  describe('Caching', () => {
    it('should cache manual and automatic generations separately', async () => {
      aiService.configure({
        apiKey: 'test-key',
        provider: 'gemini',
      });

      let callCount = 0;
      const mockFetch = vi.fn().mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: true,
          json: async () => ({
            candidates: [{
              content: {
                parts: [{
                  text: callCount === 1 ? 'automatic response' : 'manual response'
                }]
              }]
            }]
          })
        });
      });
      global.fetch = mockFetch;

      const context = 'The story begins';

      // First call - automatic
      const result1 = await aiService.getSuggestion(context, 1, false);
      expect(result1).toContain('automatic');

      // Second call - manual (should not use cache from automatic)
      const result2 = await aiService.getSuggestion(context, 1, true);
      expect(result2).toContain('manual');

      // Should have made 2 API calls (not reusing cache)
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Third call - automatic again (should use cache)
      const result3 = await aiService.getSuggestion(context, 1, false);
      expect(result3).toContain('automatic');

      // Should still be 2 calls (third used cache)
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Sentence Completion', () => {
    it('should handle incomplete sentences in manual mode', async () => {
      aiService.configure({
        apiKey: 'test-key',
        provider: 'gemini',
      });

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: '. The mystery deepened as she explored further.'
              }]
            }
          }]
        })
      });
      global.fetch = mockFetch;

      const result = await aiService.getSuggestion('She examined the ancient artifact', 1, true);

      // Should start with period to complete the sentence
      expect(result.trim()).toMatch(/^\./);
    });
  });

  describe('Error Handling', () => {
    it('should fall back to local suggestions on API error', async () => {
      aiService.configure({
        apiKey: 'test-key',
        provider: 'gemini',
      });

      const mockFetch = vi.fn().mockRejectedValue(new Error('API Error'));
      global.fetch = mockFetch;

      const result = await aiService.getSuggestion('The story begins', 1, true);

      // Should return a local suggestion (not throw error)
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
