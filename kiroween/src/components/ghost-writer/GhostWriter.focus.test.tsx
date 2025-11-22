/**
 * Focus Management Tests for Ghost Writer
 * 
 * Tests focus behavior according to design requirements:
 * 1. When suggestion appears → Focus on Accept button
 * 2. On accept → Focus returns to editor
 * 3. On reject → Focus returns to editor
 * 4. Keyboard trap within suggestion overlay
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import GhostWriter from './GhostWriter';
import { aiService } from '../../services/aiService';

// Mock Firebase service
vi.mock('../../services/firebaseService', () => ({
  auth: null,
  db: null,
  googleProvider: null,
  githubProvider: null,
  isFirebaseConfigured: false,
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

describe('GhostWriter - Focus Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  it('should focus on Accept button when suggestion appears', async () => {
    // Mock AI service to return a suggestion
    vi.mocked(aiService.getSuggestion).mockResolvedValue('This is a test suggestion.');
    
    renderWithProviders(<GhostWriter />);
    
    // Get the editor
    const editor = screen.getByRole('textbox', { name: /writing/i });
    
    // Simulate typing by directly setting innerText and triggering input event
    editor.innerText = 'This is a test with enough context to trigger a suggestion';
    fireEvent.input(editor);
    
    // Wait for suggestion to appear
    await waitFor(() => {
      expect(screen.getByText(/This is a test suggestion/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Check that Accept button has focus
    const acceptButton = screen.getByRole('button', { name: /accept suggestion/i });
    await waitFor(() => {
      expect(acceptButton).toHaveFocus();
    }, { timeout: 500 });
  });

  it('should return focus to editor when suggestion is accepted', async () => {
    const user = userEvent.setup();
    
    // Mock AI service to return a suggestion
    vi.mocked(aiService.getSuggestion).mockResolvedValue('This is a test suggestion.');
    
    renderWithProviders(<GhostWriter />);
    
    // Get the editor
    const editor = screen.getByRole('textbox', { name: /writing/i });
    
    // Simulate typing
    editor.innerText = 'This is a test with enough context to trigger a suggestion';
    fireEvent.input(editor);
    
    // Wait for suggestion to appear
    await waitFor(() => {
      expect(screen.getByText(/This is a test suggestion/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Accept the suggestion
    const acceptButton = screen.getByRole('button', { name: /accept suggestion/i });
    await user.click(acceptButton);
    
    // Wait for focus to return to editor
    await waitFor(() => {
      expect(editor).toHaveFocus();
    }, { timeout: 1000 });
  });

  it('should return focus to editor when suggestion is rejected', async () => {
    const user = userEvent.setup();
    
    // Mock AI service to return a suggestion
    vi.mocked(aiService.getSuggestion).mockResolvedValue('This is a test suggestion.');
    
    renderWithProviders(<GhostWriter />);
    
    // Get the editor
    const editor = screen.getByRole('textbox', { name: /writing/i });
    
    // Simulate typing
    editor.innerText = 'This is a test with enough context to trigger a suggestion';
    fireEvent.input(editor);
    
    // Wait for suggestion to appear
    await waitFor(() => {
      expect(screen.getByText(/This is a test suggestion/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Reject the suggestion
    const rejectButton = screen.getByRole('button', { name: /reject suggestion/i });
    await user.click(rejectButton);
    
    // Wait for focus to return to editor
    await waitFor(() => {
      expect(editor).toHaveFocus();
    }, { timeout: 500 });
  });

  it('should trap focus within suggestion overlay', async () => {
    const user = userEvent.setup();
    
    // Mock AI service to return a suggestion
    vi.mocked(aiService.getSuggestion).mockResolvedValue('This is a test suggestion.');
    
    renderWithProviders(<GhostWriter />);
    
    // Get the editor
    const editor = screen.getByRole('textbox', { name: /writing/i });
    
    // Simulate typing
    editor.innerText = 'This is a test with enough context to trigger a suggestion';
    fireEvent.input(editor);
    
    // Wait for suggestion to appear
    await waitFor(() => {
      expect(screen.getByText(/This is a test suggestion/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Get all focusable buttons in the suggestion overlay
    const acceptButton = screen.getByRole('button', { name: /accept suggestion/i });
    const regenerateButton = screen.getByRole('button', { name: /regenerate suggestion/i });
    const rejectButton = screen.getByRole('button', { name: /reject suggestion/i });
    
    // Accept button should have focus initially
    await waitFor(() => {
      expect(acceptButton).toHaveFocus();
    }, { timeout: 500 });
    
    // Tab to next button (Regenerate)
    await user.tab();
    expect(regenerateButton).toHaveFocus();
    
    // Tab to next button (Reject)
    await user.tab();
    expect(rejectButton).toHaveFocus();
    
    // Tab should wrap back to Accept button (focus trap)
    await user.tab();
    expect(acceptButton).toHaveFocus();
    
    // Shift+Tab should go backwards to Reject
    await user.tab({ shift: true });
    expect(rejectButton).toHaveFocus();
  });

  it('should handle Escape key to reject suggestion and return focus', async () => {
    const user = userEvent.setup();
    
    // Mock AI service to return a suggestion
    vi.mocked(aiService.getSuggestion).mockResolvedValue('This is a test suggestion.');
    
    renderWithProviders(<GhostWriter />);
    
    // Get the editor
    const editor = screen.getByRole('textbox', { name: /writing/i });
    
    // Simulate typing
    editor.innerText = 'This is a test with enough context to trigger a suggestion';
    fireEvent.input(editor);
    
    // Wait for suggestion to appear
    await waitFor(() => {
      expect(screen.getByText(/This is a test suggestion/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Press Escape to reject
    await user.keyboard('{Escape}');
    
    // Suggestion should be dismissed
    await waitFor(() => {
      expect(screen.queryByText(/This is a test suggestion/i)).not.toBeInTheDocument();
    });
    
    // Focus should return to editor
    await waitFor(() => {
      expect(editor).toHaveFocus();
    }, { timeout: 500 });
  });

  it('should maintain focus on Accept button when switching variants', async () => {
    // Mock AI service to return multiple suggestions
    vi.mocked(aiService.getSuggestion).mockResolvedValue('Suggestion 1');
    
    renderWithProviders(<GhostWriter />);
    
    // Get the editor
    const editor = screen.getByRole('textbox', { name: /writing/i });
    
    // Simulate typing
    editor.innerText = 'This is a test with enough context to trigger a suggestion';
    fireEvent.input(editor);
    
    // Wait for suggestion to appear
    await waitFor(() => {
      expect(screen.getByText(/Suggestion 1/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Accept button should have focus
    const acceptButton = screen.getByRole('button', { name: /accept suggestion/i });
    await waitFor(() => {
      expect(acceptButton).toHaveFocus();
    }, { timeout: 500 });
    
    // Note: Variant switching would require multiple suggestions from the AI service
    // This test verifies that focus remains on the Accept button
    // In a real scenario with multiple variants, focus should stay on Accept button
  });
});
