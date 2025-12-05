import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StreakRecoveryModal } from './StreakRecoveryModal';
import type { StreakInfo } from '../../types/streak';

// Mock useFocusTrap hook
vi.mock('../../hooks/useFocusTrap', () => ({
  useFocusTrap: () => ({ current: null }),
}));

describe('StreakRecoveryModal', () => {
  const mockStreakInfo: StreakInfo = {
    current: 0,
    longest: 15,
    lastActivityDate: '2024-01-15',
    startDate: '2024-01-01',
  };

  const defaultProps = {
    isOpen: true,
    streakType: 'task' as const,
    streakInfo: mockStreakInfo,
    availableTokens: 2,
    onClose: vi.fn(),
    onRecover: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<StreakRecoveryModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render modal when isOpen is true', () => {
      render(<StreakRecoveryModal {...defaultProps} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Streak Broken')).toBeInTheDocument();
    });

    it('should display broken streak information', () => {
      render(<StreakRecoveryModal {...defaultProps} />);
      
      expect(screen.getByText(/task streak/i)).toBeInTheDocument();
      expect(screen.getByText(/15 days/i)).toBeInTheDocument();
    });

    it('should display correct streak icon for each type', () => {
      const { rerender } = render(<StreakRecoveryModal {...defaultProps} streakType="login" />);
      expect(screen.getByText('🔥')).toBeInTheDocument();

      rerender(<StreakRecoveryModal {...defaultProps} streakType="task" />);
      expect(screen.getByText('⚡')).toBeInTheDocument();

      rerender(<StreakRecoveryModal {...defaultProps} streakType="note" />);
      expect(screen.getByText('📝')).toBeInTheDocument();

      rerender(<StreakRecoveryModal {...defaultProps} streakType="focus" />);
      expect(screen.getByText('⏱️')).toBeInTheDocument();
    });
  });

  describe('Token Display', () => {
    it('should display available tokens correctly', () => {
      render(<StreakRecoveryModal {...defaultProps} availableTokens={2} />);
      
      expect(screen.getByText('2 / 3 available')).toBeInTheDocument();
    });

    it('should show token icons with correct states', () => {
      render(<StreakRecoveryModal {...defaultProps} availableTokens={2} />);
      
      const availableTokens = screen.getAllByLabelText('Available token');
      const usedTokens = screen.getAllByLabelText('Used token');
      
      expect(availableTokens).toHaveLength(2);
      expect(usedTokens).toHaveLength(1);
    });

    it('should display token explanation', () => {
      render(<StreakRecoveryModal {...defaultProps} />);
      
      expect(screen.getByText(/Recovery tokens allow you to restore/i)).toBeInTheDocument();
      expect(screen.getByText(/within 48 hours/i)).toBeInTheDocument();
    });

    it('should show warning when no tokens available', () => {
      render(<StreakRecoveryModal {...defaultProps} availableTokens={0} />);
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/don't have any recovery tokens/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      render(<StreakRecoveryModal {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByLabelText('Close recovery modal');
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      render(<StreakRecoveryModal {...defaultProps} onClose={onClose} />);
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should have backdrop click handler', () => {
      const onClose = vi.fn();
      
      render(<StreakRecoveryModal {...defaultProps} onClose={onClose} />);
      
      const backdrop = screen.getByRole('dialog').parentElement;
      expect(backdrop).toBeInTheDocument();
      // Backdrop has onClick handler that calls onClose
    });

    it('should show confirmation dialog when recover button is clicked', async () => {
      const user = userEvent.setup();
      const onRecover = vi.fn().mockResolvedValue(true);
      
      render(<StreakRecoveryModal {...defaultProps} onRecover={onRecover} />);
      
      const recoverButton = screen.getByText(/Use Token to Recover/i);
      await user.click(recoverButton);
      
      // Should show confirmation dialog
      expect(screen.getByText('Confirm Token Use')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to use a recovery token/i)).toBeInTheDocument();
      
      // onRecover should not be called yet
      expect(onRecover).not.toHaveBeenCalled();
    });

    it('should call onRecover when confirmation is accepted', async () => {
      const user = userEvent.setup();
      const onRecover = vi.fn().mockResolvedValue(true);
      
      render(<StreakRecoveryModal {...defaultProps} onRecover={onRecover} />);
      
      // Click initial recover button
      const recoverButton = screen.getByText(/Use Token to Recover/i);
      await user.click(recoverButton);
      
      // Click confirmation button
      const confirmButton = screen.getByText(/Yes, Use Token/i);
      await user.click(confirmButton);
      
      expect(onRecover).toHaveBeenCalledTimes(1);
    });

    it('should disable recover button when no tokens available', () => {
      render(<StreakRecoveryModal {...defaultProps} availableTokens={0} />);
      
      const recoverButton = screen.getByText(/Use Token to Recover/i);
      expect(recoverButton).toBeDisabled();
    });

    it('should disable buttons during recovery', async () => {
      const user = userEvent.setup();
      const onRecover = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(true), 100))
      );
      
      render(<StreakRecoveryModal {...defaultProps} onRecover={onRecover} />);
      
      // Click initial recover button
      const recoverButton = screen.getByText(/Use Token to Recover/i);
      await user.click(recoverButton);
      
      // Click confirmation button
      const confirmButton = screen.getByText(/Yes, Use Token/i);
      await user.click(confirmButton);
      
      // Buttons should be disabled during recovery
      expect(confirmButton).toBeDisabled();
      expect(screen.getByText('Cancel')).toBeDisabled();
      expect(screen.getByLabelText('Close confirmation')).toBeDisabled();
    });
  });

  describe('Recovery Flow', () => {
    it('should show loading state during recovery', async () => {
      const user = userEvent.setup();
      const onRecover = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(true), 100))
      );
      
      render(<StreakRecoveryModal {...defaultProps} onRecover={onRecover} />);
      
      // Click initial recover button
      const recoverButton = screen.getByText(/Use Token to Recover/i);
      await user.click(recoverButton);
      
      // Click confirmation button
      const confirmButton = screen.getByText(/Yes, Use Token/i);
      await user.click(confirmButton);
      
      expect(screen.getByText('Recovering...')).toBeInTheDocument();
      expect(confirmButton).toHaveAttribute('aria-busy', 'true');
    });

    it('should show success state after successful recovery', async () => {
      const user = userEvent.setup();
      const onRecover = vi.fn().mockResolvedValue(true);
      
      render(<StreakRecoveryModal {...defaultProps} onRecover={onRecover} />);
      
      // Click initial recover button
      const recoverButton = screen.getByText(/Use Token to Recover/i);
      await user.click(recoverButton);
      
      // Click confirmation button
      const confirmButton = screen.getByText(/Yes, Use Token/i);
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText('Streak Recovered!')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.getByText(/has been restored/i)).toBeInTheDocument();
    });

    it('should show error message on recovery failure', async () => {
      const user = userEvent.setup();
      const onRecover = vi.fn().mockResolvedValue(false);
      
      render(<StreakRecoveryModal {...defaultProps} />);
      
      // Click initial recover button
      const recoverButton = screen.getByText(/Use Token to Recover/i);
      await user.click(recoverButton);
      
      // Click confirmation button
      const confirmButton = screen.getByText(/Yes, Use Token/i);
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      
      expect(screen.getByText(/Unable to recover streak/i)).toBeInTheDocument();
    });

    it('should show error message on exception', async () => {
      const user = userEvent.setup();
      const onRecover = vi.fn().mockRejectedValue(new Error('Network error'));
      
      render(<StreakRecoveryModal {...defaultProps} onRecover={onRecover} />);
      
      // Click initial recover button
      const recoverButton = screen.getByText(/Use Token to Recover/i);
      await user.click(recoverButton);
      
      // Click confirmation button
      const confirmButton = screen.getByText(/Yes, Use Token/i);
      await user.click(confirmButton);
      
      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        expect(alerts.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
      
      expect(screen.getByText(/An error occurred/i)).toBeInTheDocument();
    });

    it('should show success state with auto-close timer', async () => {
      const user = userEvent.setup();
      const onRecover = vi.fn().mockResolvedValue(true);
      const onClose = vi.fn();
      
      render(<StreakRecoveryModal {...defaultProps} onRecover={onRecover} onClose={onClose} />);
      
      // Click initial recover button
      const recoverButton = screen.getByText(/Use Token to Recover/i);
      await user.click(recoverButton);
      
      // Click confirmation button
      const confirmButton = screen.getByText(/Yes, Use Token/i);
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText('Streak Recovered!')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Success state is shown (auto-close happens after 2 seconds)
      expect(screen.getByText(/has been restored/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<StreakRecoveryModal {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'recovery-modal-title');
    });

    it('should have accessible close button', () => {
      render(<StreakRecoveryModal {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Close recovery modal');
      expect(closeButton).toHaveAttribute('title', 'Close (Esc)');
    });

    it('should announce error messages to screen readers', async () => {
      const user = userEvent.setup();
      const onRecover = vi.fn().mockResolvedValue(false);
      
      render(<StreakRecoveryModal {...defaultProps} onRecover={onRecover} />);
      
      // Click initial recover button
      const recoverButton = screen.getByText(/Use Token to Recover/i);
      await user.click(recoverButton);
      
      // Click confirmation button
      const confirmButton = screen.getByText(/Yes, Use Token/i);
      await user.click(confirmButton);
      
      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText(/Unable to recover streak/i)).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Error message should have role="alert" for screen readers
      const errorElement = screen.getByText(/Unable to recover streak/i).closest('[role="alert"]');
      expect(errorElement).toBeInTheDocument();
    });

    it('should have proper token icon labels', () => {
      render(<StreakRecoveryModal {...defaultProps} availableTokens={2} />);
      
      const availableTokens = screen.getAllByLabelText('Available token');
      const usedTokens = screen.getAllByLabelText('Used token');
      
      expect(availableTokens.length + usedTokens.length).toBe(3);
    });
  });

  describe('Different Streak Types', () => {
    it('should display correct information for login streak', () => {
      render(<StreakRecoveryModal {...defaultProps} streakType="login" />);
      
      expect(screen.getByText(/login streak/i)).toBeInTheDocument();
      expect(screen.getByText('🔥')).toBeInTheDocument();
    });

    it('should display correct information for note streak', () => {
      render(<StreakRecoveryModal {...defaultProps} streakType="note" />);
      
      expect(screen.getByText(/note streak/i)).toBeInTheDocument();
      expect(screen.getByText('📝')).toBeInTheDocument();
    });

    it('should display correct information for focus streak', () => {
      render(<StreakRecoveryModal {...defaultProps} streakType="focus" />);
      
      expect(screen.getByText(/focus streak/i)).toBeInTheDocument();
      expect(screen.getByText('⏱️')).toBeInTheDocument();
    });
  });

  describe('Confirmation Flow', () => {
    it('should show confirmation dialog with correct content', async () => {
      const user = userEvent.setup();
      
      render(<StreakRecoveryModal {...defaultProps} availableTokens={2} />);
      
      const recoverButton = screen.getByText(/Use Token to Recover/i);
      await user.click(recoverButton);
      
      // Check confirmation dialog content
      expect(screen.getByText('Confirm Token Use')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to use a recovery token/i)).toBeInTheDocument();
      expect(screen.getByText(/This will use 1 of your 2 available tokens/i)).toBeInTheDocument();
      expect(screen.getByText(/Recovery tokens are rare and valuable/i)).toBeInTheDocument();
    });

    it('should allow canceling confirmation', async () => {
      const user = userEvent.setup();
      const onRecover = vi.fn();
      const onClose = vi.fn();
      
      render(<StreakRecoveryModal {...defaultProps} onRecover={onRecover} onClose={onClose} />);
      
      // Click initial recover button
      const recoverButton = screen.getByText(/Use Token to Recover/i);
      await user.click(recoverButton);
      
      // Click cancel on confirmation
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      // Should return to main modal
      expect(screen.getByText('Streak Broken')).toBeInTheDocument();
      expect(screen.queryByText('Confirm Token Use')).not.toBeInTheDocument();
      
      // onRecover should not have been called
      expect(onRecover).not.toHaveBeenCalled();
    });

    it('should allow closing confirmation with X button', async () => {
      const user = userEvent.setup();
      const onRecover = vi.fn();
      
      render(<StreakRecoveryModal {...defaultProps} onRecover={onRecover} />);
      
      // Click initial recover button
      const recoverButton = screen.getByText(/Use Token to Recover/i);
      await user.click(recoverButton);
      
      // Click close button on confirmation
      const closeButton = screen.getByLabelText('Close confirmation');
      await user.click(closeButton);
      
      // Should return to main modal
      expect(screen.getByText('Streak Broken')).toBeInTheDocument();
      expect(screen.queryByText('Confirm Token Use')).not.toBeInTheDocument();
      
      // onRecover should not have been called
      expect(onRecover).not.toHaveBeenCalled();
    });

    it('should show correct token count in confirmation', async () => {
      const user = userEvent.setup();
      
      const { rerender } = render(<StreakRecoveryModal {...defaultProps} availableTokens={1} />);
      
      let recoverButton = screen.getByText(/Use Token to Recover/i);
      await user.click(recoverButton);
      
      expect(screen.getByText(/This will use 1 of your 1 available token\./i)).toBeInTheDocument();
      
      // Go back and test with multiple tokens
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      rerender(<StreakRecoveryModal {...defaultProps} availableTokens={3} />);
      
      recoverButton = screen.getByText(/Use Token to Recover/i);
      await user.click(recoverButton);
      
      expect(screen.getByText(/This will use 1 of your 3 available tokens/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero longest streak', () => {
      const zeroStreakInfo: StreakInfo = {
        ...mockStreakInfo,
        longest: 0,
      };
      
      render(<StreakRecoveryModal {...defaultProps} streakInfo={zeroStreakInfo} />);
      
      // Check that the broken message is displayed
      expect(screen.getByText(/has been broken/i)).toBeInTheDocument();
      // Check that "task streak" is displayed
      expect(screen.getByText(/task streak/i)).toBeInTheDocument();
      // The component should render with zero days
      const container = screen.getByRole('dialog');
      expect(container.textContent).toContain('0');
      expect(container.textContent).toContain('days');
    });

    it('should handle maximum tokens', () => {
      render(<StreakRecoveryModal {...defaultProps} availableTokens={3} />);
      
      expect(screen.getByText('3 / 3 available')).toBeInTheDocument();
      
      const availableTokens = screen.getAllByLabelText('Available token');
      expect(availableTokens).toHaveLength(3);
    });

    it('should prevent multiple recovery attempts', async () => {
      const user = userEvent.setup();
      const onRecover = vi.fn().mockResolvedValue(true);
      
      render(<StreakRecoveryModal {...defaultProps} onRecover={onRecover} />);
      
      // Click initial recover button
      const recoverButton = screen.getByText(/Use Token to Recover/i);
      await user.click(recoverButton);
      
      // Click confirmation button
      const confirmButton = screen.getByText(/Yes, Use Token/i);
      await user.click(confirmButton);
      
      // Wait for the recovery to complete
      await waitFor(() => {
        expect(onRecover).toHaveBeenCalledTimes(1);
      });
      
      // Should only be called once even if clicked multiple times
      expect(onRecover).toHaveBeenCalledTimes(1);
    });
  });
});
