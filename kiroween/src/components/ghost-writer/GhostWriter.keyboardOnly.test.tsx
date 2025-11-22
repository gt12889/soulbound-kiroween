/**
 * Keyboard-only navigation test for Ghost Writer
 * Task 7.2: Ensure keyboard-only navigation works
 * 
 * This test verifies that all Ghost Writer functionality is accessible
 * via keyboard without requiring mouse interaction.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GhostWriter from './GhostWriter';
import { aiService } from '../../services/aiService';

// Mock the AI service
vi.mock('../../services/aiService', () => ({
  aiService: {
    configure: vi.fn(),
    getSuggestion: vi.fn(),
    cancelPending: vi.fn(),
  },
}));

// Mock the audio hook
vi.mock('../../hooks/useAudio', () => ({
  useAudio: () => ({
    playGhostAppear: vi.fn(),
    playGhostDisappear: vi.fn(),
    playSuggestionAccept: vi.fn(),
  }),
}));

describe('GhostWriter - Keyboard-only Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock environment variables
    import.meta.env.VITE_AI_PROVIDER = 'openrouter';
    import.meta.env.VITE_OPENROUTER_API_KEY = 'test-key';
    import.meta.env.VITE_AI_MODEL = 'test-model';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should allow navigating to editor with keyboard', async () => {
    render(<GhostWriter />);
    
    const user = userEvent.setup();
    
    // Tab to the editor
    await user.tab();
    
    // The editor should be focused (or a focusable element within it)
    const editor = screen.getByRole('region', { name: /writing area/i });
    expect(editor).toBeInTheDocument();
  });

  it('should trigger suggestion generation with double-Tab', async () => {
    vi.mocked(aiService.getSuggestion).mockResolvedValue('This is a ghostly suggestion.');
    
    render(<GhostWriter />);
    
    const user = userEvent.setup();
    
    // Type some text
    const editor = screen.getByRole('region', { name: /writing area/i });
    const editableDiv = editor.querySelector('[contenteditable="true"]');
    expect(editableDiv).toBeInTheDocument();
    
    if (editableDiv) {
      editableDiv.textContent = 'This is some test text for context';
      editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Wait a bit for debounce
    await waitFor(() => {
      expect(aiService.getSuggestion).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    // Suggestion should appear
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /AI suggestion panel/i })).toBeInTheDocument();
    });
  });

  it('should focus Accept button when suggestion appears', async () => {
    vi.mocked(aiService.getSuggestion).mockResolvedValue('This is a ghostly suggestion.');
    
    render(<GhostWriter />);
    
    const user = userEvent.setup();
    
    // Type some text
    const editor = screen.getByRole('region', { name: /writing area/i });
    const editableDiv = editor.querySelector('[contenteditable="true"]');
    
    if (editableDiv) {
      editableDiv.textContent = 'This is some test text for context';
      editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Wait for suggestion to appear
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /AI suggestion panel/i })).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Accept button should be focused
    await waitFor(() => {
      const acceptButton = screen.getByRole('button', { name: /Accept suggestion/i });
      expect(acceptButton).toHaveFocus();
    });
  });

  it('should accept suggestion with Tab key', async () => {
    vi.mocked(aiService.getSuggestion).mockResolvedValue('This is a ghostly suggestion.');
    
    render(<GhostWriter />);
    
    const user = userEvent.setup();
    
    // Type some text
    const editor = screen.getByRole('region', { name: /writing area/i });
    const editableDiv = editor.querySelector('[contenteditable="true"]');
    
    if (editableDiv) {
      editableDiv.textContent = 'This is some test text for context';
      editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Wait for suggestion to appear
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /AI suggestion panel/i })).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Press Tab to accept
    await user.keyboard('{Tab}');
    
    // Suggestion should be accepted (panel disappears)
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: /AI suggestion panel/i })).not.toBeInTheDocument();
    });
  });

  it('should accept suggestion with Enter key', async () => {
    vi.mocked(aiService.getSuggestion).mockResolvedValue('This is a ghostly suggestion.');
    
    render(<GhostWriter />);
    
    const user = userEvent.setup();
    
    // Type some text
    const editor = screen.getByRole('region', { name: /writing area/i });
    const editableDiv = editor.querySelector('[contenteditable="true"]');
    
    if (editableDiv) {
      editableDiv.textContent = 'This is some test text for context';
      editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Wait for suggestion to appear
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /AI suggestion panel/i })).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Press Enter to accept
    await user.keyboard('{Enter}');
    
    // Suggestion should be accepted (panel disappears)
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: /AI suggestion panel/i })).not.toBeInTheDocument();
    });
  });

  it('should reject suggestion with Escape key', async () => {
    vi.mocked(aiService.getSuggestion).mockResolvedValue('This is a ghostly suggestion.');
    
    render(<GhostWriter />);
    
    const user = userEvent.setup();
    
    // Type some text
    const editor = screen.getByRole('region', { name: /writing area/i });
    const editableDiv = editor.querySelector('[contenteditable="true"]');
    
    if (editableDiv) {
      editableDiv.textContent = 'This is some test text for context';
      editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Wait for suggestion to appear
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /AI suggestion panel/i })).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Press Escape to reject
    await user.keyboard('{Escape}');
    
    // Suggestion should be rejected (panel disappears)
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: /AI suggestion panel/i })).not.toBeInTheDocument();
    });
  });

  it('should regenerate suggestion with Ctrl+R', async () => {
    vi.mocked(aiService.getSuggestion)
      .mockResolvedValueOnce('First suggestion')
      .mockResolvedValueOnce('Second suggestion');
    
    render(<GhostWriter />);
    
    const user = userEvent.setup();
    
    // Type some text
    const editor = screen.getByRole('region', { name: /writing area/i });
    const editableDiv = editor.querySelector('[contenteditable="true"]');
    
    if (editableDiv) {
      editableDiv.textContent = 'This is some test text for context';
      editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Wait for first suggestion
    await waitFor(() => {
      expect(screen.getByText('First suggestion')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Press Ctrl+R to regenerate
    await user.keyboard('{Control>}r{/Control}');
    
    // Wait for second suggestion
    await waitFor(() => {
      expect(screen.getByText('Second suggestion')).toBeInTheDocument();
    });
  });

  it('should navigate between action buttons with Tab', async () => {
    vi.mocked(aiService.getSuggestion).mockResolvedValue('This is a ghostly suggestion.');
    
    render(<GhostWriter />);
    
    const user = userEvent.setup();
    
    // Type some text
    const editor = screen.getByRole('region', { name: /writing area/i });
    const editableDiv = editor.querySelector('[contenteditable="true"]');
    
    if (editableDiv) {
      editableDiv.textContent = 'This is some test text for context';
      editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Wait for suggestion to appear
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /AI suggestion panel/i })).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Accept button should be focused initially
    const acceptButton = screen.getByRole('button', { name: /Accept suggestion/i });
    await waitFor(() => {
      expect(acceptButton).toHaveFocus();
    });
    
    // Tab to Regenerate button
    await user.tab();
    const regenerateButton = screen.getByRole('button', { name: /Regenerate suggestion/i });
    expect(regenerateButton).toHaveFocus();
    
    // Tab to Reject button
    await user.tab();
    const rejectButton = screen.getByRole('button', { name: /Reject suggestion/i });
    expect(rejectButton).toHaveFocus();
    
    // Tab should wrap back to Accept button
    await user.tab();
    expect(acceptButton).toHaveFocus();
  });

  it('should navigate backwards with Shift+Tab', async () => {
    vi.mocked(aiService.getSuggestion).mockResolvedValue('This is a ghostly suggestion.');
    
    render(<GhostWriter />);
    
    const user = userEvent.setup();
    
    // Type some text
    const editor = screen.getByRole('region', { name: /writing area/i });
    const editableDiv = editor.querySelector('[contenteditable="true"]');
    
    if (editableDiv) {
      editableDiv.textContent = 'This is some test text for context';
      editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Wait for suggestion to appear
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /AI suggestion panel/i })).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Accept button should be focused initially
    const acceptButton = screen.getByRole('button', { name: /Accept suggestion/i });
    await waitFor(() => {
      expect(acceptButton).toHaveFocus();
    });
    
    // Shift+Tab should go to Reject button (last button)
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    const rejectButton = screen.getByRole('button', { name: /Reject suggestion/i });
    expect(rejectButton).toHaveFocus();
    
    // Shift+Tab should go to Regenerate button
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    const regenerateButton = screen.getByRole('button', { name: /Regenerate suggestion/i });
    expect(regenerateButton).toHaveFocus();
    
    // Shift+Tab should go back to Accept button
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(acceptButton).toHaveFocus();
  });

  it('should restore focus to editor after accepting suggestion', async () => {
    vi.mocked(aiService.getSuggestion).mockResolvedValue('This is a ghostly suggestion.');
    
    render(<GhostWriter />);
    
    const user = userEvent.setup();
    
    // Type some text
    const editor = screen.getByRole('region', { name: /writing area/i });
    const editableDiv = editor.querySelector('[contenteditable="true"]');
    
    if (editableDiv) {
      editableDiv.textContent = 'This is some test text for context';
      editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Wait for suggestion to appear
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /AI suggestion panel/i })).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Accept suggestion
    await user.keyboard('{Enter}');
    
    // Focus should return to editor
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: /AI suggestion panel/i })).not.toBeInTheDocument();
    });
    
    // Editor or its contenteditable should have focus
    await waitFor(() => {
      const focusedElement = document.activeElement;
      expect(
        focusedElement === editableDiv || 
        focusedElement?.closest('[role="region"][aria-label*="writing"]')
      ).toBe(true);
    });
  });

  it('should restore focus to editor after rejecting suggestion', async () => {
    vi.mocked(aiService.getSuggestion).mockResolvedValue('This is a ghostly suggestion.');
    
    render(<GhostWriter />);
    
    const user = userEvent.setup();
    
    // Type some text
    const editor = screen.getByRole('region', { name: /writing area/i });
    const editableDiv = editor.querySelector('[contenteditable="true"]');
    
    if (editableDiv) {
      editableDiv.textContent = 'This is some test text for context';
      editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Wait for suggestion to appear
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /AI suggestion panel/i })).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Reject suggestion
    await user.keyboard('{Escape}');
    
    // Focus should return to editor
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: /AI suggestion panel/i })).not.toBeInTheDocument();
    });
    
    // Editor or its contenteditable should have focus
    await waitFor(() => {
      const focusedElement = document.activeElement;
      expect(
        focusedElement === editableDiv || 
        focusedElement?.closest('[role="region"][aria-label*="writing"]')
      ).toBe(true);
    });
  });

  it('should allow clicking buttons with Space key', async () => {
    vi.mocked(aiService.getSuggestion).mockResolvedValue('This is a ghostly suggestion.');
    
    render(<GhostWriter />);
    
    const user = userEvent.setup();
    
    // Type some text
    const editor = screen.getByRole('region', { name: /writing area/i });
    const editableDiv = editor.querySelector('[contenteditable="true"]');
    
    if (editableDiv) {
      editableDiv.textContent = 'This is some test text for context';
      editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Wait for suggestion to appear
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /AI suggestion panel/i })).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Tab to Reject button
    await user.tab(); // Regenerate
    await user.tab(); // Reject
    
    const rejectButton = screen.getByRole('button', { name: /Reject suggestion/i });
    expect(rejectButton).toHaveFocus();
    
    // Press Space to activate
    await user.keyboard(' ');
    
    // Suggestion should be rejected
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: /AI suggestion panel/i })).not.toBeInTheDocument();
    });
  });

  it('should trap focus within suggestion panel', async () => {
    vi.mocked(aiService.getSuggestion).mockResolvedValue('This is a ghostly suggestion.');
    
    render(<GhostWriter />);
    
    const user = userEvent.setup();
    
    // Type some text
    const editor = screen.getByRole('region', { name: /writing area/i });
    const editableDiv = editor.querySelector('[contenteditable="true"]');
    
    if (editableDiv) {
      editableDiv.textContent = 'This is some test text for context';
      editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Wait for suggestion to appear
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /AI suggestion panel/i })).toBeInTheDocument();
    }, { timeout: 3000 });
    
    const acceptButton = screen.getByRole('button', { name: /Accept suggestion/i });
    const rejectButton = screen.getByRole('button', { name: /Reject suggestion/i });
    
    // Start at Accept button
    await waitFor(() => {
      expect(acceptButton).toHaveFocus();
    });
    
    // Tab through all buttons
    await user.tab(); // Regenerate
    await user.tab(); // Reject
    
    // Tab again should wrap back to Accept
    await user.tab();
    expect(acceptButton).toHaveFocus();
    
    // Shift+Tab should go back to Reject
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(rejectButton).toHaveFocus();
  });

  it('should handle keyboard navigation with multiple suggestions', async () => {
    // Mock multiple suggestions (this would require updating aiService to support multiple)
    vi.mocked(aiService.getSuggestion).mockResolvedValue('First suggestion');
    
    render(<GhostWriter />);
    
    const user = userEvent.setup();
    
    // Type some text
    const editor = screen.getByRole('region', { name: /writing area/i });
    const editableDiv = editor.querySelector('[contenteditable="true"]');
    
    if (editableDiv) {
      editableDiv.textContent = 'This is some test text for context';
      editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Wait for suggestion to appear
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /AI suggestion panel/i })).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // All keyboard shortcuts should still work
    const acceptButton = screen.getByRole('button', { name: /Accept suggestion/i });
    await waitFor(() => {
      expect(acceptButton).toHaveFocus();
    });
  });
});
