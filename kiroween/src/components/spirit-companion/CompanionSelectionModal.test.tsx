import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CompanionSelectionModal } from './CompanionSelectionModal';

describe('CompanionSelectionModal', () => {
  it('should not render when isOpen is false', () => {
    const mockOnSelect = vi.fn();
    const { container } = render(
      <CompanionSelectionModal isOpen={false} onSelect={mockOnSelect} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should render modal with title and subtitle when open', () => {
    const mockOnSelect = vi.fn();
    render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
    
    expect(screen.getByText('Choose Your Spirit Companion')).toBeInTheDocument();
    expect(screen.getByText('This choice is permanent and will shape your journey')).toBeInTheDocument();
  });

  it('should render all three companion options', () => {
    const mockOnSelect = vi.fn();
    render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
    
    expect(screen.getByText('Shadow Spirit')).toBeInTheDocument();
    expect(screen.getByText('Forest Familiar')).toBeInTheDocument();
    expect(screen.getByText('Ember Phoenix')).toBeInTheDocument();
  });

  it('should have confirm button disabled when no companion selected', () => {
    const mockOnSelect = vi.fn();
    render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
    
    const confirmButton = screen.getByRole('button', { name: /choose a companion to continue/i });
    expect(confirmButton).toBeDisabled();
  });

  it('should enable confirm button when companion is selected', async () => {
    const mockOnSelect = vi.fn();
    render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
    
    // Click on Shadow Spirit option
    const shadowOption = screen.getByRole('radio', { name: /shadow spirit/i });
    fireEvent.click(shadowOption);
    
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /confirm selection of shadow spirit/i });
      expect(confirmButton).not.toBeDisabled();
    });
  });

  it('should call onSelect with correct companion type when confirmed', async () => {
    const mockOnSelect = vi.fn().mockResolvedValue(undefined);
    render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
    
    // Select Forest Familiar
    const forestOption = screen.getByRole('radio', { name: /forest familiar/i });
    fireEvent.click(forestOption);
    
    // Click confirm button
    const confirmButton = screen.getByRole('button', { name: /confirm selection of forest familiar/i });
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith('forest');
    });
  });

  it('should show loading state during confirmation', async () => {
    const mockOnSelect = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
    
    // Select Ember Phoenix
    const emberOption = screen.getByRole('radio', { name: /ember phoenix/i });
    fireEvent.click(emberOption);
    
    // Click confirm button
    const confirmButton = screen.getByRole('button', { name: /confirm selection of ember phoenix/i });
    fireEvent.click(confirmButton);
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Bonding...')).toBeInTheDocument();
    });
  });

  it('should show error message and retry button on failure', async () => {
    const mockOnSelect = vi.fn().mockRejectedValue(new Error('Save failed'));
    render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
    
    // Select Shadow Spirit
    const shadowOption = screen.getByRole('radio', { name: /shadow spirit/i });
    fireEvent.click(shadowOption);
    
    // Click confirm button
    const confirmButton = screen.getByRole('button', { name: /confirm selection of shadow spirit/i });
    fireEvent.click(confirmButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Failed to save your companion choice. Please try again.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('should allow retry after error', async () => {
    const mockOnSelect = vi.fn()
      .mockRejectedValueOnce(new Error('Save failed'))
      .mockResolvedValueOnce(undefined);
    
    render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
    
    // Select Shadow Spirit
    const shadowOption = screen.getByRole('radio', { name: /shadow spirit/i });
    fireEvent.click(shadowOption);
    
    // Click confirm button (will fail)
    const confirmButton = screen.getByRole('button', { name: /confirm selection of shadow spirit/i });
    fireEvent.click(confirmButton);
    
    // Wait for error
    await waitFor(() => {
      expect(screen.getByText('Failed to save your companion choice. Please try again.')).toBeInTheDocument();
    });
    
    // Click retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    
    // Should call onSelect again
    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledTimes(2);
    });
  });

  it('should have proper ARIA attributes for accessibility', () => {
    const mockOnSelect = vi.fn();
    render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');
    
    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toHaveAttribute('aria-label', 'Companion selection');
  });

  it('should update selection when different companion is clicked', async () => {
    const mockOnSelect = vi.fn();
    render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
    
    // Select Shadow Spirit
    const shadowOption = screen.getByRole('radio', { name: /shadow spirit/i });
    fireEvent.click(shadowOption);
    
    await waitFor(() => {
      expect(shadowOption).toHaveAttribute('aria-checked', 'true');
    });
    
    // Select Forest Familiar instead
    const forestOption = screen.getByRole('radio', { name: /forest familiar/i });
    fireEvent.click(forestOption);
    
    await waitFor(() => {
      expect(forestOption).toHaveAttribute('aria-checked', 'true');
      expect(shadowOption).toHaveAttribute('aria-checked', 'false');
    });
  });

  it('should trap focus within modal', async () => {
    const mockOnSelect = vi.fn();
    const { container } = render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
    
    // Get all focusable elements
    const shadowOption = screen.getByRole('radio', { name: /shadow spirit/i });
    const forestOption = screen.getByRole('radio', { name: /forest familiar/i });
    const emberOption = screen.getByRole('radio', { name: /ember phoenix/i });
    
    // Focus should start on first companion option after modal opens
    await waitFor(() => {
      expect(shadowOption).toHaveFocus();
    }, { timeout: 200 });
    
    // Select a companion to enable confirm button
    fireEvent.click(emberOption);
    
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /confirm selection of ember phoenix/i });
      expect(confirmButton).not.toBeDisabled();
    });
    
    // Verify all focusable elements are within the modal
    const focusableElements = container.querySelectorAll('button:not([disabled])');
    expect(focusableElements.length).toBeGreaterThan(0);
    
    // Verify modal has proper ARIA attributes for focus trap
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    
    // Test that Tab key event is handled (focus trap prevents default behavior)
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(tabEvent, 'preventDefault');
    
    // Focus on last element (confirm button)
    const confirmButton = screen.getByRole('button', { name: /confirm selection of ember phoenix/i });
    confirmButton.focus();
    expect(confirmButton).toHaveFocus();
    
    // Dispatch Tab event - should be intercepted by focus trap
    document.dispatchEvent(tabEvent);
    
    // Verify the event was handled (preventDefault called means focus trap is working)
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should navigate companions with arrow keys', async () => {
    const mockOnSelect = vi.fn();
    render(<CompanionSelectionModal isOpen={true} onSelect={mockOnSelect} />);
    
    // Initially no selection
    const shadowOption = screen.getByRole('radio', { name: /shadow spirit/i });
    const forestOption = screen.getByRole('radio', { name: /forest familiar/i });
    const emberOption = screen.getByRole('radio', { name: /ember phoenix/i });
    
    // Press ArrowRight to select first companion
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    
    await waitFor(() => {
      expect(shadowOption).toHaveAttribute('aria-checked', 'true');
    });
    
    // Press ArrowRight to move to next companion
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    
    await waitFor(() => {
      expect(forestOption).toHaveAttribute('aria-checked', 'true');
      expect(shadowOption).toHaveAttribute('aria-checked', 'false');
    });
    
    // Press ArrowRight again
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    
    await waitFor(() => {
      expect(emberOption).toHaveAttribute('aria-checked', 'true');
      expect(forestOption).toHaveAttribute('aria-checked', 'false');
    });
    
    // Press ArrowRight to wrap around to first
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    
    await waitFor(() => {
      expect(shadowOption).toHaveAttribute('aria-checked', 'true');
      expect(emberOption).toHaveAttribute('aria-checked', 'false');
    });
    
    // Press ArrowLeft to go backwards
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    
    await waitFor(() => {
      expect(emberOption).toHaveAttribute('aria-checked', 'true');
      expect(shadowOption).toHaveAttribute('aria-checked', 'false');
    });
  });
});
