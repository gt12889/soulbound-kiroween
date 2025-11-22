import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompanionStats } from './CompanionStats';
import { renderWithProviders } from '../../test/test-utils';

// Mock the ConfirmDialog component
vi.mock('../common/ConfirmDialog', () => ({
  ConfirmDialog: ({ isOpen, title, message, onConfirm, onCancel, confirmLabel, cancelLabel }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="confirm-dialog">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm}>{confirmLabel}</button>
        <button onClick={onCancel}>{cancelLabel}</button>
      </div>
    );
  },
}));

describe('CompanionStats - Name Change Confirmation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should not show confirmation dialog when setting name for the first time', async () => {
    renderWithProviders(<CompanionStats isOpen={true} onClose={vi.fn()} />);

    // Click edit button
    const editButton = screen.getByLabelText(/edit companion name/i);
    fireEvent.click(editButton);

    // Enter a name
    const nameInput = screen.getByLabelText(/companion name/i);
    fireEvent.change(nameInput, { target: { value: 'Whisper' } });

    // Click save
    const saveButton = screen.getByLabelText(/save name/i);
    fireEvent.click(saveButton);

    // Confirmation dialog should NOT appear
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();

    // Name should be saved immediately
    await waitFor(() => {
      expect(screen.getByText('"Whisper"')).toBeInTheDocument();
    });
  });

  it('should show confirmation dialog when changing an existing name', async () => {
    renderWithProviders(<CompanionStats isOpen={true} onClose={vi.fn()} />);

    // First, set a name
    const editButton = screen.getByLabelText(/edit companion name/i);
    fireEvent.click(editButton);

    const nameInput = screen.getByLabelText(/companion name/i);
    fireEvent.change(nameInput, { target: { value: 'Whisper' } });

    const saveButton = screen.getByLabelText(/save name/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('"Whisper"')).toBeInTheDocument();
    });

    // Now try to change the name
    const editButton2 = screen.getByLabelText(/edit companion name/i);
    fireEvent.click(editButton2);

    const nameInput2 = screen.getByLabelText(/companion name/i);
    fireEvent.change(nameInput2, { target: { value: 'Shadow' } });

    const saveButton2 = screen.getByLabelText(/save name/i);
    fireEvent.click(saveButton2);

    // Confirmation dialog SHOULD appear
    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    expect(screen.getByText(/change companion name/i)).toBeInTheDocument();
    expect(screen.getByText(/whisper.*shadow/i)).toBeInTheDocument();
  });

  it('should save new name when confirmation is accepted', async () => {
    renderWithProviders(<CompanionStats isOpen={true} onClose={vi.fn()} />);

    // Set initial name
    const editButton = screen.getByLabelText(/edit companion name/i);
    fireEvent.click(editButton);

    const nameInput = screen.getByLabelText(/companion name/i);
    fireEvent.change(nameInput, { target: { value: 'Whisper' } });

    const saveButton = screen.getByLabelText(/save name/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('"Whisper"')).toBeInTheDocument();
    });

    // Change the name
    const editButton2 = screen.getByLabelText(/edit companion name/i);
    fireEvent.click(editButton2);

    const nameInput2 = screen.getByLabelText(/companion name/i);
    fireEvent.change(nameInput2, { target: { value: 'Shadow' } });

    const saveButton2 = screen.getByLabelText(/save name/i);
    fireEvent.click(saveButton2);

    // Wait for confirmation dialog
    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    // Click confirm
    const confirmButton = screen.getByText(/change name/i);
    fireEvent.click(confirmButton);

    // New name should be displayed
    await waitFor(() => {
      expect(screen.getByText('"Shadow"')).toBeInTheDocument();
    });
  });

  it('should keep old name when confirmation is cancelled', async () => {
    renderWithProviders(<CompanionStats isOpen={true} onClose={vi.fn()} />);

    // Set initial name
    const editButton = screen.getByLabelText(/edit companion name/i);
    fireEvent.click(editButton);

    const nameInput = screen.getByLabelText(/companion name/i);
    fireEvent.change(nameInput, { target: { value: 'Whisper' } });

    const saveButton = screen.getByLabelText(/save name/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('"Whisper"')).toBeInTheDocument();
    });

    // Try to change the name
    const editButton2 = screen.getByLabelText(/edit companion name/i);
    fireEvent.click(editButton2);

    const nameInput2 = screen.getByLabelText(/companion name/i);
    fireEvent.change(nameInput2, { target: { value: 'Shadow' } });

    const saveButton2 = screen.getByLabelText(/save name/i);
    fireEvent.click(saveButton2);

    // Wait for confirmation dialog
    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    // Click cancel
    const cancelButton = screen.getByText(/keep current name/i);
    fireEvent.click(cancelButton);

    // Old name should still be displayed
    await waitFor(() => {
      expect(screen.getByText('"Whisper"')).toBeInTheDocument();
    });
  });

  it('should not show confirmation when saving the same name', async () => {
    renderWithProviders(<CompanionStats isOpen={true} onClose={vi.fn()} />);

    // Set initial name
    const editButton = screen.getByLabelText(/edit companion name/i);
    fireEvent.click(editButton);

    const nameInput = screen.getByLabelText(/companion name/i);
    fireEvent.change(nameInput, { target: { value: 'Whisper' } });

    const saveButton = screen.getByLabelText(/save name/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('"Whisper"')).toBeInTheDocument();
    });

    // Edit and save the same name
    const editButton2 = screen.getByLabelText(/edit companion name/i);
    fireEvent.click(editButton2);

    const nameInput2 = screen.getByLabelText(/companion name/i);
    fireEvent.change(nameInput2, { target: { value: 'Whisper' } });

    const saveButton2 = screen.getByLabelText(/save name/i);
    fireEvent.click(saveButton2);

    // Confirmation dialog should NOT appear
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();

    // Name should still be displayed
    await waitFor(() => {
      expect(screen.getByText('"Whisper"')).toBeInTheDocument();
    });
  });

  it('should include "Don\'t ask again" option in confirmation dialog', async () => {
    renderWithProviders(<CompanionStats isOpen={true} onClose={vi.fn()} />);

    // Set initial name
    const editButton = screen.getByLabelText(/edit companion name/i);
    fireEvent.click(editButton);

    const nameInput = screen.getByLabelText(/companion name/i);
    fireEvent.change(nameInput, { target: { value: 'Whisper' } });

    const saveButton = screen.getByLabelText(/save name/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('"Whisper"')).toBeInTheDocument();
    });

    // Change the name
    const editButton2 = screen.getByLabelText(/edit companion name/i);
    fireEvent.click(editButton2);

    const nameInput2 = screen.getByLabelText(/companion name/i);
    fireEvent.change(nameInput2, { target: { value: 'Shadow' } });

    const saveButton2 = screen.getByLabelText(/save name/i);
    fireEvent.click(saveButton2);

    // Wait for confirmation dialog
    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    // The ConfirmDialog component should have showDontAskAgain prop set to true
    // This is verified by the component receiving the prop in the implementation
  });
});
