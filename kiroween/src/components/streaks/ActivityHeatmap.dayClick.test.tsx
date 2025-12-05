import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActivityHeatmap } from './ActivityHeatmap';
import type { HeatmapData } from '../../types/streak';

// Mock the useFocusTrap hook
vi.mock('../../hooks/useFocusTrap', () => ({
  useFocusTrap: () => ({ current: null }),
}));

describe('ActivityHeatmap - Day Click Integration', () => {
  const mockData: HeatmapData[] = [
    {
      date: '2024-01-01',
      level: 2,
      activities: { tasks: 3, notes: 2, focusMinutes: 45 },
    },
    {
      date: '2024-01-02',
      level: 3,
      activities: { tasks: 5, notes: 3, focusMinutes: 90 },
    },
    {
      date: '2024-01-03',
      level: 0,
      activities: { tasks: 0, notes: 0, focusMinutes: 0 },
    },
  ];

  it('should open modal when day is clicked', async () => {
    render(<ActivityHeatmap data={mockData} />);

    // Find and click a day cell
    const dayCells = screen.getAllByRole('gridcell');
    const firstActiveDay = dayCells.find(
      (cell) => cell.getAttribute('data-level') === '2'
    );

    expect(firstActiveDay).toBeDefined();
    if (firstActiveDay) {
      fireEvent.click(firstActiveDay);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Check modal content
      expect(screen.getByText(/Activity Breakdown/i)).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // tasks
      expect(screen.getByText('2')).toBeInTheDocument(); // notes
    }
  });

  it('should close modal when close button is clicked', async () => {
    render(<ActivityHeatmap data={mockData} />);

    // Click a day to open modal
    const dayCells = screen.getAllByRole('gridcell');
    const firstActiveDay = dayCells.find(
      (cell) => cell.getAttribute('data-level') === '2'
    );

    if (firstActiveDay) {
      fireEvent.click(firstActiveDay);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click close button
      const closeButton = screen.getByLabelText('Close day details');
      fireEvent.click(closeButton);

      // Wait for modal to disappear
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    }
  });

  it('should show empty state in modal for days with no activity', async () => {
    render(<ActivityHeatmap data={mockData} />);

    // Find and click a day with no activity
    const dayCells = screen.getAllByRole('gridcell');
    const emptyDay = dayCells.find(
      (cell) => cell.getAttribute('data-level') === '0'
    );

    if (emptyDay) {
      fireEvent.click(emptyDay);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Check for empty state
      expect(screen.getByText(/No activity recorded for this day/i)).toBeInTheDocument();
    }
  });

  it('should hide tooltip when modal is open', async () => {
    render(<ActivityHeatmap data={mockData} />);

    // Find a day cell
    const dayCells = screen.getAllByRole('gridcell');
    const firstActiveDay = dayCells.find(
      (cell) => cell.getAttribute('data-level') === '2'
    );

    if (firstActiveDay) {
      // Hover to show tooltip
      fireEvent.mouseEnter(firstActiveDay);

      // Tooltip should be visible
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Click to open modal
      fireEvent.click(firstActiveDay);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Tooltip should be hidden
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    }
  });

  it('should call optional onDayClick callback when provided', async () => {
    const mockOnDayClick = vi.fn();
    render(<ActivityHeatmap data={mockData} onDayClick={mockOnDayClick} />);

    // Find and click a day cell
    const dayCells = screen.getAllByRole('gridcell');
    const firstActiveDay = dayCells.find(
      (cell) => cell.getAttribute('data-level') === '2'
    );

    if (firstActiveDay) {
      fireEvent.click(firstActiveDay);

      // Check that callback was called
      expect(mockOnDayClick).toHaveBeenCalledTimes(1);
      expect(mockOnDayClick).toHaveBeenCalledWith(
        expect.objectContaining({
          date: '2024-01-01',
          level: 2,
        })
      );
    }
  });

  it('should support keyboard navigation to open modal', async () => {
    render(<ActivityHeatmap data={mockData} />);

    // Find a day cell
    const dayCells = screen.getAllByRole('gridcell');
    const firstActiveDay = dayCells.find(
      (cell) => cell.getAttribute('data-level') === '2'
    );

    if (firstActiveDay) {
      // Focus the day cell
      firstActiveDay.focus();

      // Press Enter to open modal
      fireEvent.keyDown(firstActiveDay, { key: 'Enter' });

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    }
  });
});
