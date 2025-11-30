/**
 * Comprehensive error scenario tests for Ghost Writer
 * Tests various error conditions and recovery mechanisms
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import GhostWriter from './GhostWriter';
import { aiService } from '../../services/aiService';

// Mock Firebase service
vi.mock('../../services/firebaseService', () => ({
  isFirebaseConfigured: false,
  auth: null,
  db: null,
}));

// Mock the AI service
vi.mock('../../services/aiService', () => ({
  aiService: {
    configure: vi.fn(),
    getSuggestion: vi.fn(),
    cancelPending: vi.fn(),
  },
}));

// Mock the hooks
vi.mock('../../hooks/useDoubleTab', () => ({
  useDoubleTab: vi.fn(),
}));

vi.mock('../../hooks/useScreenReaderAnnouncement', () => ({
  useScreenReaderAnnouncement: () => ({
    announce: vi.fn(),
  }),
}));

describe('GhostWriter - Error Scenarios', () => {
  // Helper to get the editor element
  const getEditor = () => {
    const editor = document.querySelector('[contenteditable="true"]') as HTMLElement;
    expect(editor).toBeTruthy();
    return editor;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset online status
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Network Errors', () => {
    it('handles network fetch failures', async () => {
      vi.mocked(aiService.getSuggestion).mockRejectedValueOnce(
        new Error('Network request failed')
      );

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      await userEvent.type(editor, 'This is a test with enough context');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeDefined();
      });

      expect(screen.getByText(/connection to the ethereal realm lost/i)).toBeDefined();
    });

    it('handles offline state', async () => {
      // Simulate offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      vi.mocked(aiService.getSuggestion).mockRejectedValueOnce(
        new Error('You are offline')
      );

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      await userEvent.type(editor, 'This is a test with enough context');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeDefined();
      });

      // Should show network error message for offline state
      expect(screen.getByText(/connection to the ethereal realm lost/i)).toBeDefined();
    });

    it('detects when going offline during generation', async () => {
      // Start online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      // Mock a slow request
      vi.mocked(aiService.getSuggestion).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('suggestion'), 5000))
      );

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      await userEvent.type(editor, 'This is a test with enough context');

      // Wait for loading state
      await waitFor(() => {
        expect(screen.getByText(/summoning spirits/i)).toBeDefined();
      });

      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));

      // Should show offline warning
      await waitFor(() => {
        expect(screen.getByText(/you are currently offline/i)).toBeDefined();
      });
    });
  });

  describe('Timeout Errors', () => {
    it('handles request timeout', async () => {
      vi.mocked(aiService.getSuggestion).mockRejectedValueOnce(
        new Error('Request timeout exceeded')
      );

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      await userEvent.type(editor, 'This is a test with enough context');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeDefined();
      });

      expect(screen.getByText(/spirits are taking too long to respond/i)).toBeDefined();
    });

    it('shows retry button for timeout errors', async () => {
      vi.mocked(aiService.getSuggestion).mockRejectedValueOnce(
        new Error('Request timeout exceeded')
      );

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      await userEvent.type(editor, 'This is a test with enough context');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeDefined();
      });
    });
  });

  describe('Rate Limit Errors', () => {
    it('handles rate limit errors (429)', async () => {
      vi.mocked(aiService.getSuggestion).mockRejectedValueOnce(
        new Error('Rate limit exceeded (429)')
      );

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      await userEvent.type(editor, 'This is a test with enough context');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeDefined();
      });

      expect(screen.getByText(/ghost writer needs rest \(rate limited\)/i)).toBeDefined();
    });

    it('shows retry button for rate limit errors', async () => {
      vi.mocked(aiService.getSuggestion).mockRejectedValueOnce(
        new Error('rate limit exceeded')
      );

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      await userEvent.type(editor, 'This is a test with enough context');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeDefined();
      });
    });
  });

  describe('API Key Errors', () => {
    it('handles missing API key', async () => {
      vi.mocked(aiService.getSuggestion).mockRejectedValueOnce(
        new Error('API key missing')
      );

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      await userEvent.type(editor, 'This is a test with enough context');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeDefined();
      });

      expect(screen.getByText(/api key missing - check your settings/i)).toBeDefined();
    });

    it('handles unauthorized errors (401)', async () => {
      vi.mocked(aiService.getSuggestion).mockRejectedValueOnce(
        new Error('Unauthorized: Invalid API key (401)')
      );

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      await userEvent.type(editor, 'This is a test with enough context');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeDefined();
      });

      expect(screen.getByText(/api key missing - check your settings/i)).toBeDefined();
    });

    it('does not show retry button for API key errors', async () => {
      vi.mocked(aiService.getSuggestion).mockRejectedValueOnce(
        new Error('API key missing')
      );

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      await userEvent.type(editor, 'This is a test with enough context');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeDefined();
      });

      // API key errors should not be retryable
      expect(screen.queryByRole('button', { name: /retry/i })).toBeNull();
    });
  });

  describe('Empty and Malformed Responses', () => {
    it('handles empty suggestion responses', async () => {
      vi.mocked(aiService.getSuggestion).mockResolvedValueOnce('');

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      await userEvent.type(editor, 'This is a test with enough context');

      // Empty responses should either show error or fallback
      await waitFor(() => {
        // Check if error is shown or if it falls back gracefully
        const hasError = screen.queryByRole('alert');
        const hasSuggestion = screen.queryByText(/suggestion/i);
        expect(hasError || hasSuggestion).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('handles whitespace-only responses', async () => {
      vi.mocked(aiService.getSuggestion).mockResolvedValueOnce('   \n\n   ');

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      await userEvent.type(editor, 'This is a test with enough context');

      await waitFor(() => {
        const hasError = screen.queryByRole('alert');
        const hasSuggestion = screen.queryByText(/suggestion/i);
        expect(hasError || hasSuggestion).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('Cancellation and Abort', () => {
    it('handles request cancellation gracefully', async () => {
      vi.mocked(aiService.getSuggestion).mockRejectedValueOnce(
        new Error('Request cancelled by user')
      );

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      await userEvent.type(editor, 'This is a test with enough context');

      // Wait a bit to ensure no error is shown for cancellation
      await new Promise(resolve => setTimeout(resolve, 500));

      // Cancellation should not show error
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('handles abort errors without showing error UI', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      
      vi.mocked(aiService.getSuggestion).mockRejectedValueOnce(abortError);

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      await userEvent.type(editor, 'This is a test with enough context');

      await new Promise(resolve => setTimeout(resolve, 500));

      // Abort should not show error
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });

  describe('Progressive Retry Strategy', () => {
    it('shows immediate retry on first failure', async () => {
      vi.mocked(aiService.getSuggestion).mockRejectedValueOnce(
        new Error('Network error')
      );

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      await userEvent.type(editor, 'This is a test with enough context');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeDefined();
      });

      // Should not show delay message on first failure
      expect(screen.queryByText(/waiting.*seconds/i)).toBeNull();
    });

    it('implements 5-second delay on second failure', async () => {
      vi.mocked(aiService.getSuggestion)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      // First attempt
      await userEvent.type(editor, 'This is a test with enough context');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeDefined();
      });

      // Retry
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await userEvent.click(retryButton);

      // Second failure should show delay message
      await waitFor(() => {
        expect(screen.getByText(/waiting.*seconds/i)).toBeDefined();
      });
    });

    it('suggests checking settings after third failure', async () => {
      vi.mocked(aiService.getSuggestion)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      // First attempt
      await userEvent.type(editor, 'This is a test with enough context');
      await waitFor(() => screen.getByRole('button', { name: /retry/i }));

      // Second attempt
      await userEvent.click(screen.getByRole('button', { name: /retry/i }));
      await waitFor(() => screen.getByText(/waiting.*seconds/i));

      // Wait for auto-retry or click retry again
      await new Promise(resolve => setTimeout(resolve, 5100));

      // Third failure should suggest checking settings
      await waitFor(() => {
        expect(screen.getByText(/check your internet connection/i)).toBeDefined();
      });
    });
  });

  describe('Error Recovery', () => {
    it('clears error state on successful retry', async () => {
      vi.mocked(aiService.getSuggestion)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('Successful suggestion');

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      await userEvent.type(editor, 'This is a test with enough context');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeDefined();
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await userEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).toBeNull();
      });

      expect(screen.getByText(/successful suggestion/i)).toBeDefined();
    });

    it('resets retry count on new user input', async () => {
      vi.mocked(aiService.getSuggestion)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('New suggestion');

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      // First attempt fails
      await userEvent.type(editor, 'This is a test with enough context');
      await waitFor(() => screen.getByRole('alert'));

      // Clear and type new text (simulating new user input)
      await userEvent.clear(editor);
      await userEvent.type(editor, 'Completely new text with enough context');

      // Should succeed without showing delay (retry count reset)
      await waitFor(() => {
        expect(screen.getByText(/new suggestion/i)).toBeDefined();
      });
    });

    it('allows dismissing errors', async () => {
      vi.mocked(aiService.getSuggestion).mockRejectedValueOnce(
        new Error('Network error')
      );

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      await userEvent.type(editor, 'This is a test with enough context');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeDefined();
      });

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      await userEvent.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).toBeNull();
      });
    });
  });

  describe('Multiple Rapid Failures', () => {
    it('handles rapid consecutive failures', async () => {
      vi.mocked(aiService.getSuggestion).mockRejectedValue(
        new Error('Network error')
      );

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      // Trigger multiple rapid requests
      await userEvent.type(editor, 'First attempt');
      await userEvent.type(editor, ' more text');
      await userEvent.type(editor, ' even more');

      // Should handle gracefully without crashing
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeDefined();
      });
    });

    it('cancels previous request when new one starts', async () => {
      let requestCount = 0;
      vi.mocked(aiService.getSuggestion).mockImplementation(() => {
        requestCount++;
        return new Promise((resolve) => setTimeout(() => resolve(`Suggestion ${requestCount}`), 1000));
      });

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      // Type quickly to trigger multiple requests
      await userEvent.type(editor, 'First text with context');
      await new Promise(resolve => setTimeout(resolve, 100));
      await userEvent.type(editor, ' more');

      // Should only show the latest suggestion
      await waitFor(() => {
        const suggestions = screen.queryAllByText(/suggestion/i);
        expect(suggestions.length).toBeLessThanOrEqual(1);
      }, { timeout: 3000 });
    });
  });

  describe('Unknown and Generic Errors', () => {
    it('handles unknown error types with default message', async () => {
      vi.mocked(aiService.getSuggestion).mockRejectedValueOnce(
        new Error('Something completely unexpected happened')
      );

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      await userEvent.type(editor, 'This is a test with enough context');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeDefined();
      });

      expect(screen.getByText(/spirits are silent/i)).toBeDefined();
    });

    it('handles non-Error objects thrown', async () => {
      vi.mocked(aiService.getSuggestion).mockRejectedValueOnce(
        'String error instead of Error object'
      );

      renderWithProviders(<GhostWriter />);
      const editor = getEditor();

      await userEvent.type(editor, 'This is a test with enough context');

      // Should handle gracefully
      await waitFor(() => {
        const hasError = screen.queryByRole('alert');
        expect(hasError).toBeTruthy();
      });
    });
  });
});

