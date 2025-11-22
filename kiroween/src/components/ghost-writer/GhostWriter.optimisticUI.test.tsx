/**
 * Tests for Optimistic UI functionality in Ghost Writer
 * 
 * Verifies that:
 * 1. Optimistic suggestions appear immediately when user pauses typing
 * 2. Optimistic suggestions are replaced with real suggestions from API
 * 3. Optimistic suggestions are cleared on error
 * 4. Visual indicators show when suggestion is optimistic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, act, fireEvent } from '@testing-library/react';
import { renderWithProviders as render } from '../../test/test-utils';
import GhostWriter from './GhostWriter';
import { aiService } from '../../services/aiService';

// Mock Firebase service
vi.mock('../../services/firebaseService', () => ({
  auth: null,
  db: null,
  isFirebaseConfigured: false,
  googleProvider: null,
  githubProvider: null,
}));

// Mock the AI service
vi.mock('../../services/aiService', () => ({
  aiService: {
    configure: vi.fn(),
    getSuggestion: vi.fn(),
    cancelPending: vi.fn(),
  },
}));

// Mock hooks
vi.mock('../../hooks/useDoubleTab', () => ({
  useDoubleTab: () => ({ isDoubleTap: false }),
}));

vi.mock('../../hooks/useScreenReaderAnnouncement', () => ({
  useScreenReaderAnnouncement: () => ({ announce: vi.fn() }),
}));

vi.mock('../../utils/haptics', () => ({
  hapticSuccess: vi.fn(),
  hapticError: vi.fn(),
}));

describe('GhostWriter - Optimistic UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variables
    import.meta.env.VITE_AI_PROVIDER = 'openrouter';
    import.meta.env.VITE_OPENROUTER_API_KEY = 'test-key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show optimistic suggestion immediately when user types', async () => {
    // Mock slow API response
    vi.mocked(aiService.getSuggestion).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve('Real AI suggestion from API'), 1000))
    );

    const { container } = render(<GhostWriter />);

    // Find the contentEditable div
    const editor = container.querySelector('[contenteditable="true"]');
    expect(editor).toBeTruthy();
    
    if (editor) {
      // Type enough text to trigger suggestion
      editor.textContent = 'This is a test sentence with enough context to trigger';
      fireEvent.input(editor);

      // Wait for debounce and optimistic suggestion
      await waitFor(() => {
        const suggestionRegion = screen.queryByRole('region', { name: /generating/i });
        expect(suggestionRegion).toBeTruthy();
      }, { timeout: 1500 });

      // Wait for real API response
      await waitFor(() => {
        const realSuggestion = screen.queryByText(/Real AI suggestion from API/i);
        expect(realSuggestion).toBeTruthy();
      }, { timeout: 2000 });
    }
  });

  it('should replace optimistic suggestion with real suggestion from API', async () => {
    vi.mocked(aiService.getSuggestion).mockResolvedValue('Real suggestion from the AI service');

    const { container } = render(<GhostWriter />);

    const editor = container.querySelector('[contenteditable="true"]');
    expect(editor).toBeTruthy();
    
    if (editor) {
      editor.textContent = 'Type some text here to trigger suggestion';
      fireEvent.input(editor);

      // Wait for debounce and optimistic suggestion
      await waitFor(() => {
        expect(screen.queryByRole('region', { name: /generating/i })).toBeTruthy();
      }, { timeout: 1500 });

      // Real suggestion should replace optimistic one
      await waitFor(() => {
        expect(screen.queryByText(/Real suggestion from the AI service/i)).toBeTruthy();
      }, { timeout: 2000 });

      // Optimistic indicator should be gone
      expect(screen.queryByRole('region', { name: /generating/i })).toBeFalsy();
    }
  });

  it('should clear optimistic suggestion on API error', async () => {
    vi.mocked(aiService.getSuggestion).mockRejectedValue(new Error('API Error'));

    const { container } = render(<GhostWriter />);

    const editor = container.querySelector('[contenteditable="true"]');
    expect(editor).toBeTruthy();
    
    if (editor) {
      editor.textContent = 'Type text to trigger error';
      fireEvent.input(editor);

      // Wait for debounce and optimistic suggestion
      await waitFor(() => {
        expect(screen.queryByRole('region', { name: /generating/i })).toBeTruthy();
      }, { timeout: 1500 });

      // Error should clear the optimistic suggestion
      await waitFor(() => {
        expect(screen.queryByRole('region', { name: /generating/i })).toBeFalsy();
      }, { timeout: 2000 });

      // Error message should be shown
      await waitFor(() => {
        expect(screen.queryByRole('alert')).toBeTruthy();
      }, { timeout: 2000 });
    }
  });

  it('should show "Generating..." label on optimistic suggestions', async () => {
    // Mock slow API
    vi.mocked(aiService.getSuggestion).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve('Final suggestion'), 2000))
    );

    const { container } = render(<GhostWriter />);

    const editor = container.querySelector('[contenteditable="true"]');
    expect(editor).toBeTruthy();
    
    if (editor) {
      editor.textContent = 'Enough text to trigger suggestion generation';
      fireEvent.input(editor);

      // Should show "Generating" label
      await waitFor(() => {
        expect(screen.queryByText(/generating/i)).toBeTruthy();
      }, { timeout: 1500 });

      // Label should disappear when real suggestion arrives
      await waitFor(() => {
        expect(screen.queryByText(/generating/i)).toBeFalsy();
      }, { timeout: 3000 });
    }
  });

  it('should not show optimistic suggestion for very short context', async () => {
    const mockGetSuggestion = vi.fn();
    vi.mocked(aiService.getSuggestion).mockImplementation(mockGetSuggestion);

    const { container } = render(<GhostWriter />);

    const editor = container.querySelector('[contenteditable="true"]');
    expect(editor).toBeTruthy();
    
    if (editor) {
      editor.textContent = 'Short'; // Less than MIN_CONTEXT_LENGTH
      fireEvent.input(editor);

      // Wait for debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1100));
      });

      // No suggestion should appear
      expect(screen.queryByRole('region', { name: /suggestion/i })).toBeFalsy();
      expect(mockGetSuggestion).not.toHaveBeenCalled();
    }
  });

  it('should handle rapid typing by cancelling previous optimistic suggestions', async () => {
    const mockGetSuggestion = vi.fn().mockResolvedValue('Suggestion text');
    vi.mocked(aiService.getSuggestion).mockImplementation(mockGetSuggestion);

    const { container } = render(<GhostWriter />);

    const editor = container.querySelector('[contenteditable="true"]');
    expect(editor).toBeTruthy();
    
    if (editor) {
      // Type rapidly
      editor.textContent = 'First text';
      fireEvent.input(editor);
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
      });
      
      editor.textContent = 'First text more text';
      fireEvent.input(editor);
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
      });
      
      editor.textContent = 'First text more text even more';
      fireEvent.input(editor);

      // Wait for final debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1100));
      });

      // Should only call API once (after debounce settles)
      await waitFor(() => {
        expect(mockGetSuggestion).toHaveBeenCalledTimes(1);
      });
    }
  });
});
