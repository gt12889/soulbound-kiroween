/**
 * ActivityHeatmap Filter Tests
 * 
 * Tests the activity type filter functionality
 * Requirements: Task 2.4 - Add filter by activity type
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityHeatmap } from './ActivityHeatmap';
import type { HeatmapData } from '../../types/streak';

// Mock the HeatmapDay component
vi.mock('./HeatmapDay', () => ({
  HeatmapDay: ({ data, onClick }: { data: HeatmapData; onClick: (day: HeatmapData) => void }) => (
    <div
      data-testid={`heatmap-day-${data.date}`}
      data-level={data.level}
      onClick={() => onClick(data)}
    >
      {data.date}
    </div>
  ),
}));

// Mock the DayDetailModal component
vi.mock('./DayDetailModal', () => ({
  DayDetailModal: () => <div data-testid="day-detail-modal">Modal</div>,
}));

describe('ActivityHeatmap - Filter Functionality', () => {
  const mockData: HeatmapData[] = [
    {
      date: '2024-01-01',
      level: 3,
      activities: { tasks: 5, notes: 2, focusMinutes: 60 },
    },
    {
      date: '2024-01-02',
      level: 2,
      activities: { tasks: 3, notes: 0, focusMinutes: 30 },
    },
    {
      date: '2024-01-03',
      level: 1,
      activities: { tasks: 0, notes: 3, focusMinutes: 0 },
    },
    {
      date: '2024-01-04',
      level: 2,
      activities: { tasks: 0, notes: 0, focusMinutes: 45 },
    },
    {
      date: '2024-01-05',
      level: 0,
      activities: { tasks: 0, notes: 0, focusMinutes: 0 },
    },
  ];

  it('should render filter buttons by default', () => {
    render(<ActivityHeatmap data={mockData} />);

    expect(screen.getByRole('button', { name: /show all activities/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show only tasks/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show only notes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show only focus sessions/i })).toBeInTheDocument();
  });

  it('should have "All" filter active by default', () => {
    render(<ActivityHeatmap data={mockData} />);

    const allButton = screen.getByRole('button', { name: /show all activities/i });
    expect(allButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should change active filter when clicking filter buttons', () => {
    render(<ActivityHeatmap data={mockData} />);

    const tasksButton = screen.getByRole('button', { name: /show only tasks/i });
    const allButton = screen.getByRole('button', { name: /show all activities/i });

    // Initially "All" is active
    expect(allButton).toHaveAttribute('aria-pressed', 'true');
    expect(tasksButton).toHaveAttribute('aria-pressed', 'false');

    // Click "Tasks" button
    fireEvent.click(tasksButton);

    // Now "Tasks" should be active
    expect(tasksButton).toHaveAttribute('aria-pressed', 'true');
    expect(allButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('should filter data when selecting "Tasks" filter', () => {
    render(<ActivityHeatmap data={mockData} />);

    const tasksButton = screen.getByRole('button', { name: /show only tasks/i });
    fireEvent.click(tasksButton);

    // Days with tasks should have higher levels
    const day1 = screen.getByTestId('heatmap-day-2024-01-01');
    const day2 = screen.getByTestId('heatmap-day-2024-01-02');
    const day3 = screen.getByTestId('heatmap-day-2024-01-03'); // No tasks
    const day4 = screen.getByTestId('heatmap-day-2024-01-04'); // No tasks

    // Days with tasks should have non-zero levels
    expect(day1).toHaveAttribute('data-level', expect.not.stringMatching('0'));
    expect(day2).toHaveAttribute('data-level', expect.not.stringMatching('0'));
    
    // Days without tasks should have level 0
    expect(day3).toHaveAttribute('data-level', '0');
    expect(day4).toHaveAttribute('data-level', '0');
  });

  it('should filter data when selecting "Notes" filter', () => {
    render(<ActivityHeatmap data={mockData} />);

    const notesButton = screen.getByRole('button', { name: /show only notes/i });
    fireEvent.click(notesButton);

    const day1 = screen.getByTestId('heatmap-day-2024-01-01'); // Has notes
    const day2 = screen.getByTestId('heatmap-day-2024-01-02'); // No notes
    const day3 = screen.getByTestId('heatmap-day-2024-01-03'); // Has notes

    // Days with notes should have non-zero levels
    expect(day1).toHaveAttribute('data-level', expect.not.stringMatching('0'));
    expect(day3).toHaveAttribute('data-level', expect.not.stringMatching('0'));
    
    // Days without notes should have level 0
    expect(day2).toHaveAttribute('data-level', '0');
  });

  it('should filter data when selecting "Focus" filter', () => {
    render(<ActivityHeatmap data={mockData} />);

    const focusButton = screen.getByRole('button', { name: /show only focus sessions/i });
    fireEvent.click(focusButton);

    const day1 = screen.getByTestId('heatmap-day-2024-01-01'); // Has focus
    const day3 = screen.getByTestId('heatmap-day-2024-01-03'); // No focus
    const day4 = screen.getByTestId('heatmap-day-2024-01-04'); // Has focus

    // Days with focus should have non-zero levels
    expect(day1).toHaveAttribute('data-level', expect.not.stringMatching('0'));
    expect(day4).toHaveAttribute('data-level', expect.not.stringMatching('0'));
    
    // Days without focus should have level 0
    expect(day3).toHaveAttribute('data-level', '0');
  });

  it('should show all data when selecting "All" filter after filtering', () => {
    render(<ActivityHeatmap data={mockData} />);

    // First filter by tasks
    const tasksButton = screen.getByRole('button', { name: /show only tasks/i });
    fireEvent.click(tasksButton);

    // Then switch back to "All"
    const allButton = screen.getByRole('button', { name: /show all activities/i });
    fireEvent.click(allButton);

    // All days should show their original levels
    const day1 = screen.getByTestId('heatmap-day-2024-01-01');
    const day2 = screen.getByTestId('heatmap-day-2024-01-02');
    const day3 = screen.getByTestId('heatmap-day-2024-01-03');

    expect(day1).toHaveAttribute('data-level', '3');
    expect(day2).toHaveAttribute('data-level', '2');
    expect(day3).toHaveAttribute('data-level', '1');
  });

  it('should not render filter buttons when external filterType is provided', () => {
    render(<ActivityHeatmap data={mockData} filterType="tasks" />);

    // Filter buttons should not be present
    expect(screen.queryByRole('button', { name: /show all activities/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /show only tasks/i })).not.toBeInTheDocument();
  });

  it('should use external filterType when provided', () => {
    render(<ActivityHeatmap data={mockData} filterType="notes" />);

    // Should filter by notes even without buttons
    const day1 = screen.getByTestId('heatmap-day-2024-01-01'); // Has notes
    const day2 = screen.getByTestId('heatmap-day-2024-01-02'); // No notes

    expect(day1).toHaveAttribute('data-level', expect.not.stringMatching('0'));
    expect(day2).toHaveAttribute('data-level', '0');
  });

  it('should have proper ARIA attributes for accessibility', () => {
    render(<ActivityHeatmap data={mockData} />);

    const filterGroup = screen.getByRole('group', { name: /activity type filter/i });
    expect(filterGroup).toBeInTheDocument();

    const allButton = screen.getByRole('button', { name: /show all activities/i });
    expect(allButton).toHaveAttribute('aria-pressed');
  });

  it('should maintain filter state across re-renders', () => {
    const { rerender } = render(<ActivityHeatmap data={mockData} />);

    // Select tasks filter
    const tasksButton = screen.getByRole('button', { name: /show only tasks/i });
    fireEvent.click(tasksButton);

    expect(tasksButton).toHaveAttribute('aria-pressed', 'true');

    // Re-render with same data
    rerender(<ActivityHeatmap data={mockData} />);

    // Filter should still be active
    const tasksButtonAfterRerender = screen.getByRole('button', { name: /show only tasks/i });
    expect(tasksButtonAfterRerender).toHaveAttribute('aria-pressed', 'true');
  });

  it('should handle empty data gracefully', () => {
    render(<ActivityHeatmap data={[]} />);

    // Filter buttons should still render
    expect(screen.getByRole('button', { name: /show all activities/i })).toBeInTheDocument();
    
    // Should not crash when filtering empty data
    const tasksButton = screen.getByRole('button', { name: /show only tasks/i });
    expect(() => fireEvent.click(tasksButton)).not.toThrow();
  });

  it('should recalculate levels correctly when filtering', () => {
    const dataWithMixedActivities: HeatmapData[] = [
      {
        date: '2024-01-01',
        level: 4, // High level with all activities
        activities: { tasks: 10, notes: 5, focusMinutes: 120 },
      },
    ];

    render(<ActivityHeatmap data={dataWithMixedActivities} />);

    // Filter by notes only (which has lower weight)
    const notesButton = screen.getByRole('button', { name: /show only notes/i });
    fireEvent.click(notesButton);

    const day = screen.getByTestId('heatmap-day-2024-01-01');
    
    // Level should be recalculated based only on notes
    // 5 notes = 5 points = level 2 (threshold is 3-5 points)
    expect(day).toHaveAttribute('data-level', '2');
  });
});
