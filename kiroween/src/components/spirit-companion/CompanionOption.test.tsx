import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompanionOption } from './CompanionOption';
import { COMPANION_TYPES } from '../../types/companion';

describe('CompanionOption', () => {
  const mockOnSelect = vi.fn();
  const shadowCompanion = COMPANION_TYPES.shadow;

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders companion information correctly', () => {
    render(
      <CompanionOption
        companion={shadowCompanion}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    // Check name is displayed
    expect(screen.getByText('Shadow Spirit')).toBeInTheDocument();

    // Check theme is displayed
    expect(screen.getByText('Ethereal Shadows')).toBeInTheDocument();

    // Check personality is displayed
    expect(
      screen.getByText(/Mysterious and wise, dwelling in the spaces between light and dark/)
    ).toBeInTheDocument();

    // Check egg emoji is displayed (appears in both main display and evolution preview)
    const eggEmojis = screen.getAllByText('🥚');
    expect(eggEmojis.length).toBeGreaterThan(0);
  });

  it('displays evolution preview with all stages', () => {
    render(
      <CompanionOption
        companion={shadowCompanion}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    // Check evolution label
    expect(screen.getByText('Evolution Path:')).toBeInTheDocument();

    // Check all stage emojis are present
    shadowCompanion.stages.forEach((stage) => {
      const emojis = screen.getAllByText(stage.emoji);
      expect(emojis.length).toBeGreaterThan(0);
    });
  });

  it('calls onSelect when clicked', async () => {
    const user = userEvent.setup();
    render(
      <CompanionOption
        companion={shadowCompanion}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const button = screen.getByRole('radio');
    await user.click(button);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('shows selection indicator when selected', () => {
    const { rerender } = render(
      <CompanionOption
        companion={shadowCompanion}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    // Should not show checkmark when not selected
    expect(screen.queryByText('✓')).not.toBeInTheDocument();

    // Rerender with selected state
    rerender(
      <CompanionOption
        companion={shadowCompanion}
        isSelected={true}
        onSelect={mockOnSelect}
      />
    );

    // Should show checkmark when selected
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(
      <CompanionOption
        companion={shadowCompanion}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const button = screen.getByRole('radio');
    expect(button).toHaveAttribute('aria-checked', 'false');
    expect(button).toHaveAttribute(
      'aria-label',
      'Shadow Spirit: Mysterious and wise, dwelling in the spaces between light and dark'
    );
  });

  it('updates aria-checked when selected', () => {
    const { rerender } = render(
      <CompanionOption
        companion={shadowCompanion}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const button = screen.getByRole('radio');
    expect(button).toHaveAttribute('aria-checked', 'false');

    rerender(
      <CompanionOption
        companion={shadowCompanion}
        isSelected={true}
        onSelect={mockOnSelect}
      />
    );

    expect(button).toHaveAttribute('aria-checked', 'true');
  });

  it('renders all three companion types correctly', () => {
    const companions = [
      COMPANION_TYPES.shadow,
      COMPANION_TYPES.forest,
      COMPANION_TYPES.ember,
    ];

    companions.forEach((companion) => {
      const { unmount } = render(
        <CompanionOption
          companion={companion}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText(companion.name)).toBeInTheDocument();
      expect(screen.getByText(companion.theme)).toBeInTheDocument();
      expect(screen.getByText(companion.personality)).toBeInTheDocument();

      unmount();
    });
  });

  it('applies custom CSS variables for companion colors', () => {
    render(
      <CompanionOption
        companion={shadowCompanion}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const button = screen.getByRole('radio');
    const style = button.style;

    expect(style.getPropertyValue('--companion-primary')).toBe(
      shadowCompanion.colorPrimary
    );
    expect(style.getPropertyValue('--companion-secondary')).toBe(
      shadowCompanion.colorSecondary
    );
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(
      <CompanionOption
        companion={shadowCompanion}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const button = screen.getByRole('radio');

    // Tab to focus
    await user.tab();
    expect(button).toHaveFocus();

    // Press Enter to select
    await user.keyboard('{Enter}');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);

    // Press Space to select
    mockOnSelect.mockClear();
    await user.keyboard(' ');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });
});
