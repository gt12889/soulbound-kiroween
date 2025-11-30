/**
 * Integration test for Ghost Writer retry functionality
 * Verifies that the retry button properly triggers a new suggestion generation
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

describe('GhostWriter - Retry Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows retry button when an error occurs', async () => {
    // Mock AI service to fail
    vi.mocked(aiService.getSuggestion).mockRejectedValueOnce(
      new Error('Network error')
    );

    renderWithProviders(<GhostWriter />);

    // Get the editor
    const editor = screen.getByRole('textbox', { name: /write your thoughts/i });

    // Type enough text to trigger suggestion
    await userEvent.type(editor, 'This is a test with enough context');

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Verify retry button is present
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('triggers new suggestion generation when retry is clicked', async () => {
    // Mock AI service to fail first, then succeed
    vi.mocked(aiService.getSuggestion)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce('This is a successful suggestion');

    renderWithProviders(<GhostWriter />);

    // Get the editor
    const editor = screen.getByRole('textbox', { name: /write your thoughts/i });

    // Type enough text to trigger suggestion
    await userEvent.type(editor, 'This is a test with enough context');

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    await userEvent.click(retryButton);

    // Verify AI service was called again
    await waitFor(() => {
      expect(aiService.getSuggestion).toHaveBeenCalledTimes(2);
    });

    // Verify suggestion appears after retry
    await waitFor(() => {
      expect(screen.getByText(/this is a successful suggestion/i)).toBeInTheDocument();
    });
  });

  it('resets error state when retry is clicked', async () => {
    // Mock AI service to fail first, then succeed
    vi.mocked(aiService.getSuggestion)
      .mockRejectedValueOnce(new Error('API error'))
      .mockResolvedValueOnce('Retry worked!');

    renderWithProviders(<GhostWriter />);

    // Get the editor
    const editor = screen.getByRole('textbox', { name: /write your thoughts/i });

    // Type enough text to trigger suggestion
    await userEvent.type(editor, 'This is a test with enough context');

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Verify error message is shown
    expect(screen.getByText(/spirits are silent/i)).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    await userEvent.click(retryButton);

    // Wait for loading state
    await waitFor(() => {
      expect(screen.getByText(/summoning spirits/i)).toBeInTheDocument();
    });

    // Error should be gone
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not show retry button for non-retryable errors', async () => {
    // Mock AI service to fail with invalid key error
    vi.mocked(aiService.getSuggestion).mockRejectedValueOnce(
      new Error('API key missing')
    );

    renderWithProviders(<GhostWriter />);

    // Get the editor
    const editor = screen.getByRole('textbox', { name: /write your thoughts/i });

    // Type enough text to trigger suggestion
    await userEvent.type(editor, 'This is a test with enough context');

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Verify error message is shown
    expect(screen.getByText(/api key missing/i)).toBeInTheDocument();

    // Retry button should not be present (invalid key is not retryable)
    const retryButton = screen.queryByRole('button', { name: /retry/i });
    expect(retryButton).not.toBeInTheDocument();
  });
});
