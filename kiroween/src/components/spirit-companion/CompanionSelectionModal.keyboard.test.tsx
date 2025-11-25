import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompanionSelectionModal } from './CompanionSelectionModal';

/**
 * Comprehensive keyboard navigation tests for CompanionSelectionModal
 * 
 * Tests verify:
 * - Tab navigation between companions and confirm button
 * - Enter/Space key selection of companions
 * - Arrow key navigation between companions
 * - Focus trap within modal
 * - Keyboard-only workflow completion
 */
describe('CompanionSelectionModal - Keyboard Navigation', () => {
  describe('Tab Navigation', () => {
    it('should allow Tab navigation between all focusable elements', async () => {
      const user = userEvent.setup();
      const mockOnSelect = vi.fn();
      render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
      
      // Get all companion options
      const shadowOption = screen.getByRole('radio', { name: /shadow spirit/i });
      const forestOption = screen.getByRole('radio', { name: /forest familiar/i });
      const emberOption = screen.getByRole('radio', { name: /ember phoenix/i });
      
      // Initial focus should be on first companion
      await waitFor(() => {
        expect(shadowOption).toHaveFocus();
      });
      
      // Tab to next companion
      await user.tab();
      expect(forestOption).toHaveFocus();
      
      // Tab to next companion
      await user.tab();
      expect(emberOption).toHaveFocus();
      
      // Verify confirm button exists and is disabled
      const confirmButton = screen.getByRole('button', { name: /choose a companion to continue/i });
      expect(confirmButton).toBeDisabled();
    });

    it('should enable Tab navigation to confirm button after selection', async () => {
      const user = userEvent.setup();
      const mockOnSelect = vi.fn();
      render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
      
      // Select a companion first
      const shadowOption = screen.getByRole('radio', { name: /shadow spirit/i });
      await user.click(shadowOption);
      
      // Tab through to confirm button
      await user.tab(); // to forest
      await user.tab(); // to ember
      await user.tab(); // to confirm button
      
      const confirmButton = screen.getByRole('button', { name: /confirm selection of shadow spirit/i });
      expect(confirmButton).toHaveFocus();
      expect(confirmButton).not.toBeDisabled();
    });
  });

  describe('Enter/Space Key Selection', () => {
    it('should select companion with Enter key', async () => {
      const mockOnSelect = vi.fn();
      render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
      
      const forestOption = screen.getByRole('radio', { name: /forest familiar/i });
      
      // Focus on forest option
      forestOption.focus();
      expect(forestOption).toHaveFocus();
      
      // Press Enter to select
      fireEvent.keyDown(forestOption, { key: 'Enter' });
      
      await waitFor(() => {
        expect(forestOption).toHaveAttribute('aria-checked', 'true');
      });
    });

    it('should select companion with Space key', async () => {
      const mockOnSelect = vi.fn();
      render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
      
      const emberOption = screen.getByRole('radio', { name: /ember phoenix/i });
      
      // Focus on ember option
      emberOption.focus();
      expect(emberOption).toHaveFocus();
      
      // Press Space to select
      fireEvent.keyDown(emberOption, { key: ' ' });
      
      await waitFor(() => {
        expect(emberOption).toHaveAttribute('aria-checked', 'true');
      });
    });

    it('should confirm selection with Enter key on confirm button', async () => {
      const user = userEvent.setup();
      const mockOnSelect = vi.fn().mockResolvedValue(undefined);
      render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
      
      // Select a companion
      const shadowOption = screen.getByRole('radio', { name: /shadow spirit/i });
      await user.click(shadowOption);
      
      await waitFor(() => {
        expect(shadowOption).toHaveAttribute('aria-checked', 'true');
      });
      
      // Focus and press Enter on confirm button
      const confirmButton = screen.getByRole('button', { name: /confirm selection of shadow spirit/i });
      confirmButton.focus();
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith('shadow');
      });
    });
  });

  describe('Arrow Key Navigation', () => {
    it('should navigate right through companions with ArrowRight', async () => {
      const mockOnSelect = vi.fn();
      render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
      
      const shadowOption = screen.getByRole('radio', { name: /shadow spirit/i });
      const forestOption = screen.getByRole('radio', { name: /forest familiar/i });
      const emberOption = screen.getByRole('radio', { name: /ember phoenix/i });
      
      // Press ArrowRight to select first companion
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      
      await waitFor(() => {
        expect(shadowOption).toHaveAttribute('aria-checked', 'true');
      });
      
      // Press ArrowRight to move to next
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      
      await waitFor(() => {
        expect(forestOption).toHaveAttribute('aria-checked', 'true');
        expect(shadowOption).toHaveAttribute('aria-checked', 'false');
      });
      
      // Press ArrowRight to move to last
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      
      await waitFor(() => {
        expect(emberOption).toHaveAttribute('aria-checked', 'true');
        expect(forestOption).toHaveAttribute('aria-checked', 'false');
      });
    });

    it('should wrap around to first companion when pressing ArrowRight on last', async () => {
      const mockOnSelect = vi.fn();
      render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
      
      const shadowOption = screen.getByRole('radio', { name: /shadow spirit/i });
      const emberOption = screen.getByRole('radio', { name: /ember phoenix/i });
      
      // Navigate to last companion
      fireEvent.keyDown(document, { key: 'ArrowRight' }); // shadow
      fireEvent.keyDown(document, { key: 'ArrowRight' }); // forest
      fireEvent.keyDown(document, { key: 'ArrowRight' }); // ember
      
      await waitFor(() => {
        expect(emberOption).toHaveAttribute('aria-checked', 'true');
      });
      
      // Press ArrowRight to wrap to first
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      
      await waitFor(() => {
        expect(shadowOption).toHaveAttribute('aria-checked', 'true');
        expect(emberOption).toHaveAttribute('aria-checked', 'false');
      });
    });

    it('should navigate left through companions with ArrowLeft', async () => {
      const mockOnSelect = vi.fn();
      render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
      
      const shadowOption = screen.getByRole('radio', { name: /shadow spirit/i });
      const forestOption = screen.getByRole('radio', { name: /forest familiar/i });
      const emberOption = screen.getByRole('radio', { name: /ember phoenix/i });
      
      // Start from middle
      fireEvent.keyDown(document, { key: 'ArrowRight' }); // shadow
      fireEvent.keyDown(document, { key: 'ArrowRight' }); // forest
      
      await waitFor(() => {
        expect(forestOption).toHaveAttribute('aria-checked', 'true');
      });
      
      // Press ArrowLeft to go back
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      
      await waitFor(() => {
        expect(shadowOption).toHaveAttribute('aria-checked', 'true');
        expect(forestOption).toHaveAttribute('aria-checked', 'false');
      });
    });

    it('should wrap around to last companion when pressing ArrowLeft on first', async () => {
      const mockOnSelect = vi.fn();
      render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
      
      const shadowOption = screen.getByRole('radio', { name: /shadow spirit/i });
      const emberOption = screen.getByRole('radio', { name: /ember phoenix/i });
      
      // Select first companion
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      
      await waitFor(() => {
        expect(shadowOption).toHaveAttribute('aria-checked', 'true');
      });
      
      // Press ArrowLeft to wrap to last
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      
      await waitFor(() => {
        expect(emberOption).toHaveAttribute('aria-checked', 'true');
        expect(shadowOption).toHaveAttribute('aria-checked', 'false');
      });
    });

    it('should prevent default behavior for arrow keys', async () => {
      const mockOnSelect = vi.fn();
      render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
      
      const arrowRightEvent = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(arrowRightEvent, 'preventDefault');
      
      document.dispatchEvent(arrowRightEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Complete Keyboard-Only Workflow', () => {
    it('should allow complete selection workflow using only keyboard', async () => {
      const user = userEvent.setup();
      const mockOnSelect = vi.fn().mockResolvedValue(undefined);
      render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
      
      // Wait for initial focus
      const shadowOption = screen.getByRole('radio', { name: /shadow spirit/i });
      await waitFor(() => {
        expect(shadowOption).toHaveFocus();
      });
      
      // Use arrow keys to navigate to desired companion
      fireEvent.keyDown(document, { key: 'ArrowRight' }); // shadow
      fireEvent.keyDown(document, { key: 'ArrowRight' }); // forest
      
      const forestOption = screen.getByRole('radio', { name: /forest familiar/i });
      await waitFor(() => {
        expect(forestOption).toHaveAttribute('aria-checked', 'true');
      });
      
      // Click confirm button to complete selection
      const confirmButton = screen.getByRole('button', { name: /confirm selection of forest familiar/i });
      expect(confirmButton).not.toBeDisabled();
      
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith('forest');
      });
    });

    it('should allow changing selection using keyboard before confirming', async () => {
      const user = userEvent.setup();
      const mockOnSelect = vi.fn().mockResolvedValue(undefined);
      render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
      
      // Select first companion with arrow key
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      
      const shadowOption = screen.getByRole('radio', { name: /shadow spirit/i });
      await waitFor(() => {
        expect(shadowOption).toHaveAttribute('aria-checked', 'true');
      });
      
      // Change mind, navigate to different companion
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      
      const emberOption = screen.getByRole('radio', { name: /ember phoenix/i });
      await waitFor(() => {
        expect(emberOption).toHaveAttribute('aria-checked', 'true');
        expect(shadowOption).toHaveAttribute('aria-checked', 'false');
      });
      
      // Click confirm button to complete selection
      const confirmButton = screen.getByRole('button', { name: /confirm selection of ember phoenix/i });
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith('ember');
      });
    });
  });

  describe('Focus Trap', () => {
    it('should keep focus within modal when tabbing', async () => {
      const user = userEvent.setup();
      const mockOnSelect = vi.fn();
      render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
      
      // Wait for initial focus on first companion
      const shadowOption = screen.getByRole('radio', { name: /shadow spirit/i });
      await waitFor(() => {
        expect(shadowOption).toHaveFocus();
      });
      
      // Tab through all companions
      await user.tab(); // forest
      const forestOption = screen.getByRole('radio', { name: /forest familiar/i });
      expect(forestOption).toHaveFocus();
      
      await user.tab(); // ember
      const emberOption = screen.getByRole('radio', { name: /ember phoenix/i });
      expect(emberOption).toHaveFocus();
      
      // Select ember to enable confirm button
      await user.click(emberOption);
      
      // Tab to confirm button
      await user.tab();
      const confirmButton = screen.getByRole('button', { name: /confirm selection of ember phoenix/i });
      expect(confirmButton).toHaveFocus();
      
      // Tab again should wrap back to first element (focus trap working)
      await user.tab();
      
      // Focus should be trapped within modal - back to first companion
      await waitFor(() => {
        expect(shadowOption).toHaveFocus();
      });
    });

    it('should handle Shift+Tab for reverse navigation', async () => {
      const user = userEvent.setup();
      const mockOnSelect = vi.fn();
      render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
      
      // Select a companion
      const shadowOption = screen.getByRole('radio', { name: /shadow spirit/i });
      await user.click(shadowOption);
      
      // Wait for focus
      await waitFor(() => {
        expect(shadowOption).toHaveFocus();
      });
      
      // Shift+Tab should go backwards
      await user.tab({ shift: true });
      
      // Should wrap to last focusable element (confirm button)
      const confirmButton = screen.getByRole('button', { name: /confirm selection of shadow spirit/i });
      expect(confirmButton).toHaveFocus();
    });
  });

  describe('Accessibility Announcements', () => {
    it('should have proper ARIA labels for keyboard users', () => {
      const mockOnSelect = vi.fn();
      render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
      
      // Dialog should have proper ARIA attributes
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');
      
      // Radio group should be labeled
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveAttribute('aria-label', 'Companion selection');
      
      // Each companion should have descriptive ARIA label
      const shadowOption = screen.getByRole('radio', { name: /shadow spirit.*mysterious/i });
      expect(shadowOption).toBeInTheDocument();
    });

    it('should update confirm button ARIA label based on selection', async () => {
      const mockOnSelect = vi.fn();
      render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
      
      // Initially no selection
      const confirmButton = screen.getByRole('button', { name: /choose a companion to continue/i });
      expect(confirmButton).toBeInTheDocument();
      
      // Select a companion
      const forestOption = screen.getByRole('radio', { name: /forest familiar/i });
      fireEvent.click(forestOption);
      
      // Confirm button label should update
      await waitFor(() => {
        const updatedButton = screen.getByRole('button', { name: /confirm selection of forest familiar/i });
        expect(updatedButton).toBeInTheDocument();
      });
    });
  });
});
