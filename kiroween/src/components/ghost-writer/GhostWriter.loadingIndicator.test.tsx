import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import GhostWriter from './GhostWriter';
import { aiService } from '../../services/aiService';

// Mock AI service
vi.mock('../../services/aiService', () => ({
  aiService: {
    configure: vi.fn(),
    getSuggestion: vi.fn(),
    cancelPending: vi.fn(),
  },
}));

/**
 * Test: Loading indicator behavior for automatic vs manual generation
 * Requirement: Loading indicator should only show for manual generation, not automatic typing
 */
describe('GhostWriter - Loading Indicator Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock a slow AI response (500ms delay)
    (aiService.getSuggestion as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve('Test suggestion'), 500))
    );
  });

  it('should NOT show loading indicator during automatic typing', async () => {
    const user = userEvent.setup();
    render(<GhostWriter />);

    // Find the editor
    const editor = screen.getByRole('textbox', { name: /write your text here/i });

    // Type enough text to trigger automatic suggestion
    await user.type(editor, 'This is a test sentence for automatic generation.');

    // Wait a bit (more than 200ms delay)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
    });

    // Loading indicator should NOT be visible
    const loadingIndicator = screen.queryByText(/summoning spirits/i);
    expect(loadingIndicator).not.toBeInTheDocument();

    // But optimistic suggestion should be visible
    await waitFor(() => {
      const suggestionDisplay = screen.queryByRole('region', { name: /ai suggestion panel/i });
      expect(suggestionDisplay).toBeInTheDocument();
    });
  });

  it('should show loading indicator for manual generation (double-Tab)', async () => {
    const user = userEvent.setup();
    render(<GhostWriter />);

    const editor = screen.getByRole('textbox', { name: /write your text here/i });

    // Type enough text
    await user.type(editor, 'This is a test sentence.');

    // Clear any automatic suggestions
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    // Manually trigger generation with double-Tab
    await user.keyboard('{Tab}{Tab}');

    // Wait for loading delay (200ms)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 250));
    });

    // Loading indicator SHOULD be visible for manual request
    await waitFor(() => {
      const loadingIndicator = screen.queryByText(/summoning spirits/i);
      expect(loadingIndicator).toBeInTheDocument();
    });
  });

  it('should show loading indicator when clicking regenerate button', async () => {
    const user = userEvent.setup();
    render(<GhostWriter />);

    const editor = screen.getByRole('textbox', { name: /write your text here/i });

    // Type and wait for suggestion
    await user.type(editor, 'This is a test sentence.');
    
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: /ai suggestion panel/i })).toBeInTheDocument();
    }, { timeout: 1000 });

    // Click regenerate button
    const regenerateButton = screen.getByRole('button', { name: /regenerate/i });
    await user.click(regenerateButton);

    // Wait for loading delay (200ms)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 250));
    });

    // Loading indicator SHOULD be visible for manual regenerate
    await waitFor(() => {
      const loadingIndicator = screen.queryByText(/summoning spirits/i);
      expect(loadingIndicator).toBeInTheDocument();
    });
  });

  it('should show loading indicator when clicking retry button after error', async () => {
    // Mock an error response
    (aiService.getSuggestion as any).mockRejectedValueOnce(new Error('API Error'));

    const user = userEvent.setup();
    render(<GhostWriter />);

    const editor = screen.getByRole('textbox', { name: /write your text here/i });

    // Type to trigger error
    await user.type(editor, 'This is a test sentence.');

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.queryByText(/error/i)).toBeInTheDocument();
    }, { timeout: 1000 });

    // Mock successful response for retry
    (aiService.getSuggestion as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve('Test suggestion'), 500))
    );

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);

    // Wait for loading delay (200ms)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 250));
    });

    // Loading indicator SHOULD be visible for manual retry
    await waitFor(() => {
      const loadingIndicator = screen.queryByText(/summoning spirits/i);
      expect(loadingIndicator).toBeInTheDocument();
    });
  });

  it('should hide loading indicator when suggestion arrives', async () => {
    const user = userEvent.setup();
    render(<GhostWriter />);

    const editor = screen.getByRole('textbox', { name: /write your text here/i });

    // Manually trigger with double-Tab
    await user.type(editor, 'This is a test sentence.');
    await user.keyboard('{Tab}{Tab}');

    // Wait for loading indicator to appear
    await waitFor(() => {
      expect(screen.queryByText(/summoning spirits/i)).toBeInTheDocument();
    }, { timeout: 300 });

    // Wait for suggestion to arrive
    await waitFor(() => {
      expect(screen.queryByText(/summoning spirits/i)).not.toBeInTheDocument();
    }, { timeout: 1000 });

    // Suggestion should be visible
    expect(screen.queryByRole('region', { name: /ai suggestion panel/i })).toBeInTheDocument();
  });

  it('should maintain optimistic suggestion during automatic generation without loading indicator', async () => {
    const user = userEvent.setup();
    render(<GhostWriter />);

    const editor = screen.getByRole('textbox', { name: /write your text here/i });

    // Type to trigger automatic generation
    await user.type(editor, 'This is a test sentence for automatic generation.');

    // Optimistic suggestion should appear immediately
    await waitFor(() => {
      const suggestionDisplay = screen.queryByRole('region', { name: /ai suggestion panel/i });
      expect(suggestionDisplay).toBeInTheDocument();
    });

    // Loading indicator should NOT appear
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
    });
    
    expect(screen.queryByText(/summoning spirits/i)).not.toBeInTheDocument();

    // Real suggestion should eventually replace optimistic one
    await waitFor(() => {
      expect(aiService.getSuggestion).toHaveBeenCalled();
    }, { timeout: 1000 });
  });
});
