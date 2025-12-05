import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DayDetailModal } from './DayDetailModal';
import type { HeatmapData } from '../../types/streak';

// Mock the useFocusTrap hook
vi.mock('../../hooks/useFocusTrap', () => ({
  useFocusTrap: () => ({ current: null }),
}));

describe('DayDetailModal', () => {
  const mockDay: HeatmapData = {
    date: '2024-01-15',
    level: 3,
    activities: {
      tasks: 5,
      notes: 3,
      focusMinutes: 90,
    },
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <DayDetailModal isOpen={false} day={mockDay} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should not render when day is null', () => {
    const { container } = render(
      <DayDetailModal isOpen={true} day={null} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render modal when isOpen is true and day is provided', () => {
    render(<DayDetailModal isOpen={true} day={mockDay} onClose={mockOnClose} />);
    
    // Check for formatted date (flexible to handle timezone differences)
    expect(screen.getByText(/January (14|15), 2024/i)).toBeInTheDocument();
  });

  it('should display activity breakdown with correct values', () => {
    render(<DayDetailModal isOpen={true} day={mockDay} onClose={mockOnClose} />);
    
    // Check for activity values
    expect(screen.getByText('5')).toBeInTheDocument(); // tasks
    expect(screen.getByText('3')).toBeInTheDocument(); // notes
    expect(screen.getByText('90 min')).toBeInTheDocument(); // focus time
  });

  it('should display activity level indicator', () => {
    render(<DayDetailModal isOpen={true} day={mockDay} onClose={mockOnClose} />);
    
    // Check for activity level description
    expect(screen.getByText('High activity')).toBeInTheDocument();
  });

  it('should show empty state when no activity', () => {
    const emptyDay: HeatmapData = {
      date: '2024-01-15',
      level: 0,
      activities: {
        tasks: 0,
        notes: 0,
        focusMinutes: 0,
      },
    };

    render(<DayDetailModal isOpen={true} day={emptyDay} onClose={mockOnClose} />);
    
    expect(screen.getByText('No activity recorded for this day')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<DayDetailModal isOpen={true} day={mockDay} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('Close day details');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    const { container } = render(<DayDetailModal isOpen={true} day={mockDay} onClose={mockOnClose} />);
    
    // Find the backdrop element (the outermost div with modalBackdrop class)
    const backdrop = container.querySelector('[class*="modalBackdrop"]');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('should call onClose when secondary close button is clicked', () => {
    render(<DayDetailModal isOpen={true} day={mockDay} onClose={mockOnClose} />);
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when modal content is clicked', () => {
    const { container } = render(<DayDetailModal isOpen={true} day={mockDay} onClose={mockOnClose} />);
    
    // Find the modal content element (not the backdrop)
    const modalContent = container.querySelector('[class*="modalContent"]');
    if (modalContent) {
      fireEvent.click(modalContent);
      expect(mockOnClose).not.toHaveBeenCalled();
    }
  });

  it('should have proper accessibility attributes', () => {
    render(<DayDetailModal isOpen={true} day={mockDay} onClose={mockOnClose} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'day-detail-title');
  });

  it('should display correct activity level descriptions', () => {
    const levels = [
      { level: 0, description: 'No activity' },
      { level: 1, description: 'Light activity' },
      { level: 2, description: 'Moderate activity' },
      { level: 3, description: 'High activity' },
      { level: 4, description: 'Very high activity' },
    ];

    levels.forEach(({ level, description }) => {
      const day: HeatmapData = {
        date: '2024-01-15',
        level: level as 0 | 1 | 2 | 3 | 4,
        activities: {
          tasks: level * 2,
          notes: level,
          focusMinutes: level * 30,
        },
      };

      const { unmount } = render(
        <DayDetailModal isOpen={true} day={day} onClose={mockOnClose} />
      );
      
      expect(screen.getByText(description)).toBeInTheDocument();
      unmount();
    });
  });

  it('should render activity icons', () => {
    render(<DayDetailModal isOpen={true} day={mockDay} onClose={mockOnClose} />);
    
    // Check for activity section labels
    expect(screen.getByText('Tasks Completed')).toBeInTheDocument();
    expect(screen.getByText('Notes Created')).toBeInTheDocument();
    expect(screen.getByText('Focus Time')).toBeInTheDocument();
  });
});
