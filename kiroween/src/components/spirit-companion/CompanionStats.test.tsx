import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompanionStats } from './CompanionStats';
import { CompanionProvider } from '../../contexts/CompanionContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AppProvider } from '../../contexts/AppContext';

// Mock the services
vi.mock('../../services/cloudSyncService', () => ({
  cloudSyncService: {
    syncCompanionData: vi.fn(),
    fetchCompanionData: vi.fn(),
    subscribeToCompanionData: vi.fn(() => vi.fn()),
  },
}));

vi.mock('../../services/moonPhaseService', () => ({
  calculateMoonPhase: vi.fn(() => ({ name: 'full' })),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AuthProvider>
      <ThemeProvider>
        <AppProvider>
          <CompanionProvider>{ui}</CompanionProvider>
        </AppProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

describe('CompanionStats - Name Input Field', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Name Display', () => {
    it('should display default companion name when no custom name is set', () => {
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('"Shadow Spirit"')).toBeInTheDocument();
    });

    it('should display custom name when set', () => {
      // Set a custom name in localStorage
      localStorage.setItem(
        'companionCustomNames',
        JSON.stringify({ shadow: 'Whisper', forest: undefined, ember: undefined })
      );

      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('"Whisper"')).toBeInTheDocument();
    });

    it('should show edit button next to companion name', () => {
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const editButton = screen.getByRole('button', { name: /edit companion name/i });
      expect(editButton).toBeInTheDocument();
    });
  });

  describe('Name Editing', () => {
    it('should show name input field when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const editButton = screen.getByRole('button', { name: /edit companion name/i });
      await user.click(editButton);

      const nameInput = screen.getByRole('textbox', { name: /companion name/i });
      expect(nameInput).toBeInTheDocument();
    });

    it('should show save and cancel buttons when editing', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const editButton = screen.getByRole('button', { name: /edit companion name/i });
      await user.click(editButton);

      expect(screen.getByRole('button', { name: /save name/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel editing/i })).toBeInTheDocument();
    });

    it('should populate input with current custom name', async () => {
      const user = userEvent.setup();
      localStorage.setItem(
        'companionCustomNames',
        JSON.stringify({ shadow: 'Whisper', forest: undefined, ember: undefined })
      );

      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const editButton = screen.getByRole('button', { name: /edit companion name/i });
      await user.click(editButton);

      const nameInput = screen.getByRole('textbox', { name: /companion name/i }) as HTMLInputElement;
      expect(nameInput.value).toBe('Whisper');
    });
  });

  describe('Name Validation', () => {
    it('should show error when name is empty', async () => {
      const user = userEvent.setup();
      // Start with a custom name so we can clear it
      localStorage.setItem(
        'companionCustomNames',
        JSON.stringify({ shadow: 'Whisper', forest: undefined, ember: undefined })
      );
      
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const editButton = screen.getByRole('button', { name: /edit companion name/i });
      await user.click(editButton);

      const nameInput = screen.getByRole('textbox', { name: /companion name/i }) as HTMLInputElement;
      // Manually set value and trigger change event
      fireEvent.change(nameInput, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 1 character/i)).toBeInTheDocument();
      });
    });

    it('should show error when name exceeds 20 characters', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const editButton = screen.getByRole('button', { name: /edit companion name/i });
      await user.click(editButton);

      const nameInput = screen.getByRole('textbox', { name: /companion name/i });
      await user.clear(nameInput);
      // Type a string that's exactly 21 characters
      await user.type(nameInput, 'ThisNameIsTooLongFor20');

      await waitFor(() => {
        expect(screen.getByText(/name must be 20 characters or less/i)).toBeInTheDocument();
      });
    });

    it('should disable save button when name is invalid', async () => {
      const user = userEvent.setup();
      // Start with a custom name so we can clear it
      localStorage.setItem(
        'companionCustomNames',
        JSON.stringify({ shadow: 'Whisper', forest: undefined, ember: undefined })
      );
      
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const editButton = screen.getByRole('button', { name: /edit companion name/i });
      await user.click(editButton);

      const nameInput = screen.getByRole('textbox', { name: /companion name/i }) as HTMLInputElement;
      // Manually set value and trigger change event
      fireEvent.change(nameInput, { target: { value: '' } });

      const saveButton = screen.getByRole('button', { name: /save name/i });
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when name is valid', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const editButton = screen.getByRole('button', { name: /edit companion name/i });
      await user.click(editButton);

      const nameInput = screen.getByRole('textbox', { name: /companion name/i });
      await user.clear(nameInput);
      await user.type(nameInput, 'Whisper');

      const saveButton = screen.getByRole('button', { name: /save name/i });
      expect(saveButton).not.toBeDisabled();
    });

    it('should show character count', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const editButton = screen.getByRole('button', { name: /edit companion name/i });
      await user.click(editButton);

      const nameInput = screen.getByRole('textbox', { name: /companion name/i });
      await user.clear(nameInput);
      await user.type(nameInput, 'Whisper');

      expect(screen.getByText('7/20')).toBeInTheDocument();
    });
  });

  describe('Name Saving', () => {
    it('should save custom name when save button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const editButton = screen.getByRole('button', { name: /edit companion name/i });
      await user.click(editButton);

      const nameInput = screen.getByRole('textbox', { name: /companion name/i });
      await user.clear(nameInput);
      await user.type(nameInput, 'Whisper');

      const saveButton = screen.getByRole('button', { name: /save name/i });
      await user.click(saveButton);

      // Should exit edit mode and display new name
      await waitFor(() => {
        expect(screen.getByText('"Whisper"')).toBeInTheDocument();
      });
    });

    it('should persist custom name to localStorage', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const editButton = screen.getByRole('button', { name: /edit companion name/i });
      await user.click(editButton);

      const nameInput = screen.getByRole('textbox', { name: /companion name/i });
      await user.clear(nameInput);
      await user.type(nameInput, 'Whisper');

      const saveButton = screen.getByRole('button', { name: /save name/i });
      await user.click(saveButton);

      // Wait for the UI to update showing the new name
      await waitFor(() => {
        expect(screen.getByText('"Whisper"')).toBeInTheDocument();
      });
      
      // Verify localStorage was updated (the context handles this)
      const stored = JSON.parse(localStorage.getItem('companionCustomNames') || '{}');
      expect(stored.shadow).toBe('Whisper');
    });

    it('should save name when Enter key is pressed', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const editButton = screen.getByRole('button', { name: /edit companion name/i });
      await user.click(editButton);

      const nameInput = screen.getByRole('textbox', { name: /companion name/i });
      await user.clear(nameInput);
      await user.type(nameInput, 'Whisper{Enter}');

      await waitFor(() => {
        expect(screen.getByText('"Whisper"')).toBeInTheDocument();
      });
    });
  });

  describe('Name Editing Cancellation', () => {
    it('should cancel editing when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const editButton = screen.getByRole('button', { name: /edit companion name/i });
      await user.click(editButton);

      const nameInput = screen.getByRole('textbox', { name: /companion name/i });
      await user.clear(nameInput);
      await user.type(nameInput, 'NewName');

      const cancelButton = screen.getByRole('button', { name: /cancel editing/i });
      await user.click(cancelButton);

      // Should exit edit mode without saving
      await waitFor(() => {
        expect(screen.queryByRole('textbox', { name: /companion name/i })).not.toBeInTheDocument();
      });
    });

    it('should restore original name when cancelled', async () => {
      const user = userEvent.setup();
      localStorage.setItem(
        'companionCustomNames',
        JSON.stringify({ shadow: 'Whisper', forest: undefined, ember: undefined })
      );

      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      // Wait for the component to load with the custom name
      await waitFor(() => {
        expect(screen.getByText('"Whisper"')).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit companion name/i });
      await user.click(editButton);

      const nameInput = screen.getByRole('textbox', { name: /companion name/i });
      await user.clear(nameInput);
      await user.type(nameInput, 'NewName');

      const cancelButton = screen.getByRole('button', { name: /cancel editing/i });
      await user.click(cancelButton);

      // Should show original name again
      await waitFor(() => {
        expect(screen.getByText('"Whisper"')).toBeInTheDocument();
      });
    });

    it('should cancel editing when Escape key is pressed', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const editButton = screen.getByRole('button', { name: /edit companion name/i });
      await user.click(editButton);

      const nameInput = screen.getByRole('textbox', { name: /companion name/i });
      await user.type(nameInput, '{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('textbox', { name: /companion name/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const editButton = screen.getByRole('button', { name: /edit companion name/i });
      await user.click(editButton);

      const nameInput = screen.getByRole('textbox', { name: /companion name/i });
      expect(nameInput).toHaveAttribute('aria-label', 'Companion name');
    });

    it('should mark input as invalid when there is an error', async () => {
      const user = userEvent.setup();
      // Start with a custom name so we can clear it
      localStorage.setItem(
        'companionCustomNames',
        JSON.stringify({ shadow: 'Whisper', forest: undefined, ember: undefined })
      );
      
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const editButton = screen.getByRole('button', { name: /edit companion name/i });
      await user.click(editButton);

      const nameInput = screen.getByRole('textbox', { name: /companion name/i }) as HTMLInputElement;
      // Manually set value and trigger change event
      fireEvent.change(nameInput, { target: { value: '' } });
      
      // Wait for error message to appear first
      await waitFor(() => {
        expect(screen.getByText(/name must be at least 1 character/i)).toBeInTheDocument();
      });

      // Then check aria-invalid
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('should associate error message with input', async () => {
      const user = userEvent.setup();
      // Start with a custom name so we can clear it
      localStorage.setItem(
        'companionCustomNames',
        JSON.stringify({ shadow: 'Whisper', forest: undefined, ember: undefined })
      );
      
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const editButton = screen.getByRole('button', { name: /edit companion name/i });
      await user.click(editButton);

      const nameInput = screen.getByRole('textbox', { name: /companion name/i }) as HTMLInputElement;
      // Manually set value and trigger change event
      fireEvent.change(nameInput, { target: { value: '' } });

      // Wait for error message to appear first
      await waitFor(() => {
        expect(screen.getByText(/name must be at least 1 character/i)).toBeInTheDocument();
      });

      // Then check aria-describedby
      expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
    });

    it('should auto-focus name input when entering edit mode', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const editButton = screen.getByRole('button', { name: /edit companion name/i });
      await user.click(editButton);

      const nameInput = screen.getByRole('textbox', { name: /companion name/i });
      expect(nameInput).toHaveFocus();
    });
  });

  describe('Modal Behavior', () => {
    it('should not render when isOpen is false', () => {
      renderWithProviders(<CompanionStats isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /close stats modal/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should close modal when Escape is pressed (not in edit mode)', async () => {
      renderWithProviders(<CompanionStats isOpen={true} onClose={mockOnClose} />);

      const modal = screen.getByRole('dialog');
      fireEvent.keyDown(modal, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
