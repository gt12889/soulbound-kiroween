import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SuggestionActions from './SuggestionActions';

describe('SuggestionActions', () => {
  const mockOnAccept = vi.fn();
  const mockOnReject = vi.fn();
  const mockOnRegenerate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all three action buttons', () => {
    render(
      <SuggestionActions
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onRegenerate={mockOnRegenerate}
      />
    );

    expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /regenerate/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
  });

  it('calls onRegenerate when Regenerate button is clicked', () => {
    render(
      <SuggestionActions
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onRegenerate={mockOnRegenerate}
      />
    );

    const regenerateButton = screen.getByRole('button', { name: /regenerate/i });
    fireEvent.click(regenerateButton);

    expect(mockOnRegenerate).toHaveBeenCalledTimes(1);
    expect(mockOnAccept).not.toHaveBeenCalled();
    expect(mockOnReject).not.toHaveBeenCalled();
  });

  it('displays keyboard shortcuts when showShortcuts is true', () => {
    render(
      <SuggestionActions
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onRegenerate={mockOnRegenerate}
        showShortcuts={true}
      />
    );

    // Check for shortcut badges in buttons (using getAllByText since tooltips also contain these)
    expect(screen.getAllByText('Tab').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ctrl+R').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Esc').length).toBeGreaterThan(0);
  });

  it('hides keyboard shortcuts when showShortcuts is false', () => {
    render(
      <SuggestionActions
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onRegenerate={mockOnRegenerate}
        showShortcuts={false}
      />
    );

    expect(screen.queryByText('Tab')).not.toBeInTheDocument();
    expect(screen.queryByText('Ctrl+R')).not.toBeInTheDocument();
    expect(screen.queryByText('Esc')).not.toBeInTheDocument();
  });

  it('disables all buttons when disabled prop is true', () => {
    render(
      <SuggestionActions
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onRegenerate={mockOnRegenerate}
        disabled={true}
      />
    );

    const acceptButton = screen.getByRole('button', { name: /accept/i });
    const regenerateButton = screen.getByRole('button', { name: /regenerate/i });
    const rejectButton = screen.getByRole('button', { name: /reject/i });

    expect(acceptButton).toBeDisabled();
    expect(regenerateButton).toBeDisabled();
    expect(rejectButton).toBeDisabled();
  });

  it('does not call callbacks when buttons are disabled', () => {
    render(
      <SuggestionActions
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onRegenerate={mockOnRegenerate}
        disabled={true}
      />
    );

    const regenerateButton = screen.getByRole('button', { name: /regenerate/i });
    fireEvent.click(regenerateButton);

    expect(mockOnRegenerate).not.toHaveBeenCalled();
  });

  it('has proper ARIA labels for accessibility', () => {
    render(
      <SuggestionActions
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onRegenerate={mockOnRegenerate}
      />
    );

    const toolbar = screen.getByRole('toolbar', { name: /suggestion actions/i });
    expect(toolbar).toBeInTheDocument();

    const regenerateButton = screen.getByRole('button', { name: /regenerate suggestion \(ctrl\+r\)/i });
    expect(regenerateButton).toBeInTheDocument();
  });

  it('displays the correct icon for Regenerate button', () => {
    render(
      <SuggestionActions
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onRegenerate={mockOnRegenerate}
      />
    );

    const regenerateButton = screen.getByRole('button', { name: /regenerate/i });
    expect(regenerateButton.textContent).toContain('↻');
  });

  it('renders tooltips when showShortcuts is true and not disabled', () => {
    const { container } = render(
      <SuggestionActions
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onRegenerate={mockOnRegenerate}
        showShortcuts={true}
        disabled={false}
      />
    );

    // Check for tooltip content (they exist in the DOM even if hidden by CSS)
    expect(screen.getByText('Accept suggestion')).toBeInTheDocument();
    expect(screen.getByText('Generate new suggestion')).toBeInTheDocument();
    expect(screen.getByText('Reject suggestion')).toBeInTheDocument();
    
    // Check for tooltip elements by querying the DOM directly
    const tooltips = container.querySelectorAll('[role="tooltip"]');
    expect(tooltips).toHaveLength(3);
  });

  it('does not render tooltips when disabled', () => {
    const { container } = render(
      <SuggestionActions
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onRegenerate={mockOnRegenerate}
        showShortcuts={true}
        disabled={true}
      />
    );

    // Tooltips should not be rendered when disabled
    const tooltips = container.querySelectorAll('[role="tooltip"]');
    expect(tooltips).toHaveLength(0);
  });

  it('does not render tooltips when showShortcuts is false', () => {
    const { container } = render(
      <SuggestionActions
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onRegenerate={mockOnRegenerate}
        showShortcuts={false}
        disabled={false}
      />
    );

    // Tooltips should not be rendered when showShortcuts is false
    const tooltips = container.querySelectorAll('[role="tooltip"]');
    expect(tooltips).toHaveLength(0);
  });

  it('displays correct keyboard shortcuts in tooltips', () => {
    const { container } = render(
      <SuggestionActions
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onRegenerate={mockOnRegenerate}
        showShortcuts={true}
      />
    );

    // Check that tooltips contain the correct shortcuts
    const tooltips = container.querySelectorAll('[role="tooltip"]');
    
    // Accept tooltip should show "Tab or Enter"
    expect(tooltips[0]).toHaveTextContent('Tab or Enter');
    
    // Regenerate tooltip should show "Ctrl+R"
    expect(tooltips[1]).toHaveTextContent('Ctrl+R');
    
    // Reject tooltip should show "Esc"
    expect(tooltips[2]).toHaveTextContent('Esc');
  });
});
