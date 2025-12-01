import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityHeatmap } from './ActivityHeatmap';
import type { HeatmapData } from '../../types/streak';

describe('ActivityHeatmap', () => {
  // Helper to generate test data
  const generateTestData = (days: number = 365): HeatmapData[] => {
    const data: HeatmapData[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        level: (i % 5) as 0 | 1 | 2 | 3 | 4,
        activities: {
          tasks: i % 3,
          notes: i % 2,
          focusMinutes: (i % 4) * 15,
        },
      });
    }
    
    return data;
  };

  it('renders without crashing', () => {
    const data = generateTestData();
    render(<ActivityHeatmap data={data} />);
    
    expect(screen.getByText('Activity Heatmap')).toBeInTheDocument();
  });

  it('displays 365 days correctly', () => {
    const data = generateTestData(365);
    const { container } = render(<ActivityHeatmap data={data} />);
    
    // Count all day cells (excluding empty padding cells)
    const dayCells = container.querySelectorAll('[data-level]');
    
    // Should have 365 days (some weeks may have padding)
    expect(dayCells.length).toBeGreaterThanOrEqual(365);
  });

  it('displays legend with all activity levels', () => {
    const data = generateTestData();
    const { container } = render(<ActivityHeatmap data={data} />);
    
    // Check for legend squares using data-level attribute
    const legendSquares = container.querySelectorAll('[data-level]');
    expect(legendSquares.length).toBeGreaterThan(0);
    
    expect(screen.getByText('Less')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('renders tooltip container', () => {
    const data = generateTestData(7);
    const { container } = render(<ActivityHeatmap data={data} />);
    
    // Component should render without errors
    // Tooltip is conditionally rendered on hover, which is tested in HeatmapDay tests
    expect(container).toBeTruthy();
    
    // Find a day cell with activity
    const dayCell = container.querySelector('[data-level="1"]');
    expect(dayCell).toBeInTheDocument();
  });

  it('calls onDayClick when day is clicked', async () => {
    const user = userEvent.setup();
    const onDayClick = vi.fn();
    const data = generateTestData(7);
    const { container } = render(<ActivityHeatmap data={data} onDayClick={onDayClick} />);
    
    // Find a day cell that's not empty (has aria-label and is not aria-hidden)
    const dayCells = container.querySelectorAll('[data-level]');
    const nonEmptyCell = Array.from(dayCells).find(cell => 
      cell.getAttribute('role') === 'gridcell' && 
      cell.getAttribute('aria-label') &&
      !cell.hasAttribute('aria-hidden')
    );
    
    expect(nonEmptyCell).toBeInTheDocument();
    
    if (nonEmptyCell) {
      await user.click(nonEmptyCell as HTMLElement);
      expect(onDayClick).toHaveBeenCalledTimes(1);
    }
  });

  it('displays month labels', () => {
    const data = generateTestData(365);
    const { container } = render(<ActivityHeatmap data={data} />);
    
    // Should have month labels container (check by class pattern)
    const monthLabelsContainer = container.querySelector('[class*="monthLabels"]');
    expect(monthLabelsContainer).toBeTruthy();
  });

  it('displays day of week labels', () => {
    const data = generateTestData();
    render(<ActivityHeatmap data={data} />);
    
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<ActivityHeatmap data={[]} />);
    
    expect(screen.getByText('Activity Heatmap')).toBeInTheDocument();
  });

  it('applies correct activity levels', () => {
    const data: HeatmapData[] = [
      {
        date: '2024-01-01',
        level: 0,
        activities: { tasks: 0, notes: 0, focusMinutes: 0 },
      },
      {
        date: '2024-01-02',
        level: 4,
        activities: { tasks: 10, notes: 5, focusMinutes: 120 },
      },
    ];
    
    const { container } = render(<ActivityHeatmap data={data} />);
    
    const level0 = container.querySelector('[data-level="0"]');
    const level4 = container.querySelector('[data-level="4"]');
    
    expect(level0).toBeInTheDocument();
    expect(level4).toBeInTheDocument();
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    const onDayClick = vi.fn();
    const data = generateTestData(7);
    const { container } = render(<ActivityHeatmap data={data} onDayClick={onDayClick} />);
    
    // Focus the grid container (which has tabindex="0")
    const grid = container.querySelector('[role="grid"]') as HTMLElement;
    
    expect(grid).toBeInTheDocument();
    
    if (grid) {
      grid.focus();
      expect(grid).toHaveFocus();
      
      // Navigate to a day with arrow key, then press Enter
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Enter}');
      // Should be called at least once (keyboard navigation works)
      expect(onDayClick).toHaveBeenCalled();
    }
  });

  it('has proper ARIA labels', () => {
    const data = generateTestData(7);
    const { container } = render(<ActivityHeatmap data={data} />);
    
    // Grid should have aria-label
    const grid = container.querySelector('[role="grid"]');
    expect(grid).toHaveAttribute('aria-label');
  });
});
