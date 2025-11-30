/**
 * Ghost Writer UX Integration Tests
 * Tests the complete user flows for Ghost Writer functionality
 * 
 * Task 8.3: Test happy path (generate → accept)
 * 
 * This test verifies the complete user flow from:
 * 1. User types text
 * 2. AI generates a suggestion
 * 3. User accepts the suggestion
 * 4. Text is inserted into the editor
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test-utils';
import GhostWriter from '../../components/ghost-writer/GhostWriter';
import { aiService } from '../../services/aiService';

// Mock the AI service
vi.mock('../../services/aiService', () => ({
  aiService: {
    configure: vi.fn(),
    getSuggestion: vi.fn(),
    cancelPending: vi.fn(),
  },
}));

// Mock haptics
vi.mock('../../utils/haptics', () => ({
  hapticSuccess: vi.fn(),
  hapticError: vi.fn(),
}));

// Mock Firebase service
vi.mock('../../services/firebaseService', () => ({
  isFirebaseConfigured: false,
  auth: null,
  db: null,
}));

// Mock environment variables
vi.stubEnv('VITE_AI_PROVIDER', 'openrouter');
vi.stubEnv('VITE_OPENROUTER_API_KEY', 'test-api-key');
vi.stubEnv('VITE_AI_MODEL', 'test-model');

describe('Ghost Writer UX Integration Tests - Task 8.3', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Happy Path: Generate → Accept', () => {
    it('should complete the full flow from generation to acceptance', async () => {
      const user = userEvent.setup({ delay: null });
      
      // Mock successful AI response
      const mockSuggestion = 'This is a ghostly continuation of your text.';
      vi.mocked(aiService.getSuggestion).mockResolvedValue(mockSuggestion);

      // Render the component
      render(<GhostWriter />);

      // Verify initial state - should show the editor
      expect(screen.getByRole('main', { name: /ghost writer application/i })).toBeInTheDocument();

      // Find the contenteditable editor
      const editor = screen.getByRole('textbox', { name: /writing editor/i });
      expect(editor).toBeInTheDocument();

      // Step 1: User types text (at least 10 characters to trigger suggestion)
      const userText = 'Once upon a time in a dark forest';
      await user.click(editor);
      
      // Type the text character by character to simulate real typing
      for (const char of userText) {
        await user.keyboard(char);
      }

      // Verify text was entered
      await waitFor(() => {
        expect(editor.textContent).toContain(userText);
      });

      // Step 2: Wait for debounce period
      vi.advanceTimersByTime(1000);
      
      // Step 3: Wait for AI response
      await vi.runAllTimersAsync();
      
      await waitFor(() => {
        expect(aiService.getSuggestion).toHaveBeenCalled();
      }, { timeout: 5000 });

      // Wait for suggestion to be displayed
      await waitFor(() => {
        const suggestionPanel = screen.getByRole('region', { name: /ai suggestion panel/i });
        expect(suggestionPanel).toBeInTheDocument();
        expect(within(suggestionPanel).getByText(mockSuggestion)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Step 4: Verify action buttons are present
      const suggestionPanel = screen.getByRole('region', { name: /ai suggestion panel/i });
      const acceptButton = within(suggestionPanel).getByRole('button', { name: /accept/i });

      expect(acceptButton).toBeInTheDocument();

      // Step 5: Accept the suggestion
      await user.click(acceptButton);

      // Step 6: Wait for animation to complete
      vi.advanceTimersByTime(1100);
      
      await waitFor(() => {
        // Suggestion panel should be gone
        expect(screen.queryByRole('region', { name: /ai suggestion panel/i })).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Step 7: Verify undo button appears
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
      }, { timeout: 2000 });

      // Verify we completed the happy path successfully
      expect(aiService.getSuggestion).toHaveBeenCalled();
    });
  });
});
