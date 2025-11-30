import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils';
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

// Mock the hooks
vi.mock('../../hooks/useDoubleTab', () => ({
  useDoubleTab: vi.fn(),
}));

vi.mock('../../hooks/useScreenReaderAnnouncement', () => ({
  useScreenReaderAnnouncement: () => ({
    announce: vi.fn(),
  }),
}));

describe('GhostWriter Keyboard Shortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should accept suggestion when Tab is pressed', async () => {
    // Mock AI service to return a suggestion
    vi.mocked(aiService.getSuggestion).mockResolvedValue('This is a test suggestion');

    const { container } = renderWithProviders(<GhostWriter />);
    
    // Find the contentEditable div
    const editor = container.querySelector('[contenteditable="true"]');
    expect(editor).toBeTruthy();
    
    if (editor) {
      // Type enough text to trigger suggestion
      editor.textContent = 'Hello world, this is a test';
      fireEvent.input(editor);
      
      // Wait for suggestion to appear
      await waitFor(() => {
        expect(screen.queryByText(/This is a test suggestion/)).toBeTruthy();
      }, { timeout: 3000 });
      
      // Press Tab to accept
      fireEvent.keyDown(window, { key: 'Tab' });
      
      // Suggestion should be accepted and disappear
      await waitFor(() => {
        expect(screen.queryByText(/This is a test suggestion/)).toBeFalsy();
      });
    }
  });

  it('should accept suggestion when Enter is pressed', async () => {
    // Mock AI service to return a suggestion
    vi.mocked(aiService.getSuggestion).mockResolvedValue('Another test suggestion');

    const { container } = renderWithProviders(<GhostWriter />);
    
    const editor = container.querySelector('[contenteditable="true"]');
    expect(editor).toBeTruthy();
    
    if (editor) {
      // Type enough text to trigger suggestion
      editor.textContent = 'Hello world, this is a test';
      fireEvent.input(editor);
      
      // Wait for suggestion to appear
      await waitFor(() => {
        expect(screen.queryByText(/Another test suggestion/)).toBeTruthy();
      }, { timeout: 3000 });
      
      // Press Enter to accept
      fireEvent.keyDown(window, { key: 'Enter' });
      
      // Suggestion should be accepted and disappear
      await waitFor(() => {
        expect(screen.queryByText(/Another test suggestion/)).toBeFalsy();
      });
    }
  });

  it('should reject suggestion when Escape is pressed', async () => {
    // Mock AI service to return a suggestion
    vi.mocked(aiService.getSuggestion).mockResolvedValue('Suggestion to reject');

    const { container } = renderWithProviders(<GhostWriter />);
    
    const editor = container.querySelector('[contenteditable="true"]');
    expect(editor).toBeTruthy();
    
    if (editor) {
      // Type enough text to trigger suggestion
      editor.textContent = 'Hello world, this is a test';
      fireEvent.input(editor);
      
      // Wait for suggestion to appear
      await waitFor(() => {
        expect(screen.queryByText(/Suggestion to reject/)).toBeTruthy();
      }, { timeout: 3000 });
      
      // Press Escape to reject
      fireEvent.keyDown(window, { key: 'Escape' });
      
      // Suggestion should be rejected and disappear
      await waitFor(() => {
        expect(screen.queryByText(/Suggestion to reject/)).toBeFalsy();
      });
    }
  });

  it('should regenerate suggestion when Ctrl+R is pressed', async () => {
    // Mock AI service to return different suggestions
    const getSuggestionMock = vi.mocked(aiService.getSuggestion);
    getSuggestionMock
      .mockResolvedValueOnce('First suggestion')
      .mockResolvedValueOnce('Regenerated suggestion');

    const { container } = renderWithProviders(<GhostWriter />);
    
    const editor = container.querySelector('[contenteditable="true"]');
    expect(editor).toBeTruthy();
    
    if (editor) {
      // Type enough text to trigger suggestion
      editor.textContent = 'Hello world, this is a test';
      fireEvent.input(editor);
      
      // Wait for first suggestion to appear
      await waitFor(() => {
        expect(screen.queryByText('First suggestion')).toBeTruthy();
      }, { timeout: 3000 });
      
      // Verify first call happened
      expect(getSuggestionMock).toHaveBeenCalledTimes(1);
      const firstCallCount = getSuggestionMock.mock.calls.length;
      
      // Press Ctrl+R to regenerate
      fireEvent.keyDown(window, { key: 'r', ctrlKey: true });
      
      // The suggestion should be cleared first
      await waitFor(() => {
        expect(screen.queryByText('First suggestion')).toBeFalsy();
      }, { timeout: 1000 });
      
      // Then a new suggestion should appear
      await waitFor(() => {
        const newCallCount = getSuggestionMock.mock.calls.length;
        // Verify that getSuggestion was called again
        expect(newCallCount).toBeGreaterThan(firstCallCount);
      }, { timeout: 3000 });
    }
  }, 10000); // Increase timeout to 10s

  it('should not trigger shortcuts when no suggestions are visible', async () => {
    const { container } = renderWithProviders(<GhostWriter />);
    
    const editor = container.querySelector('[contenteditable="true"]');
    expect(editor).toBeTruthy();
    
    if (editor) {
      // Type text but not enough to trigger suggestion
      editor.textContent = 'Short';
      fireEvent.input(editor);
      
      // Wait a bit to ensure no suggestion appears
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Press Tab - should not do anything since no suggestions
      fireEvent.keyDown(window, { key: 'Tab' });
      
      // No AI suggestions should appear (check for the suggestion display component)
      expect(container.querySelector('[aria-label="AI writing suggestion"]')).toBeFalsy();
    }
  });

  it('should not trigger shortcuts during generation', async () => {
    let resolvePromise: (value: string) => void;
    const delayedPromise = new Promise<string>((resolve) => {
      resolvePromise = resolve;
    });
    
    // Mock AI service with a manually controlled promise
    vi.mocked(aiService.getSuggestion).mockReturnValue(delayedPromise);

    const { container } = renderWithProviders(<GhostWriter />);
    
    const editor = container.querySelector('[contenteditable="true"]');
    expect(editor).toBeTruthy();
    
    if (editor) {
      // Type enough text to trigger suggestion
      editor.textContent = 'Hello world, this is a test';
      fireEvent.input(editor);
      
      // Wait for loading indicator
      await waitFor(() => {
        const loadingText = screen.queryByText('Summoning spirits from beyond...');
        return loadingText !== null;
      }, { timeout: 1000 });
      
      // Verify loading indicator is present
      expect(screen.queryByText('Summoning spirits from beyond...')).not.toBeNull();
      
      // Try to press Tab during generation - should not do anything
      fireEvent.keyDown(window, { key: 'Tab' });
      
      // Wait a bit to ensure the shortcut didn't trigger
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Loading indicator should still be visible (suggestion not accepted)
      // The key test is that we're still in loading state, not that we accepted
      const stillLoading = screen.queryByText('Summoning spirits from beyond...');
      expect(stillLoading).not.toBeNull();
      
      // Now resolve the promise
      resolvePromise!('Delayed suggestion');
      
      // Wait for the suggestion to complete
      await waitFor(() => {
        expect(screen.queryByText('Delayed suggestion')).toBeTruthy();
      }, { timeout: 3000 });
    }
  });
});
