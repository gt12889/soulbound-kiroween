import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeatmapDay } from './HeatmapDay';
import type { HeatmapData } from '../../types/streak';

describe('HeatmapDay', () => {
  const mockData: HeatmapData = {
    date: '2024-01-15',
    level: 2,
    activities: {
      tasks: 3,
      notes: 2,
      focusMinutes: 45,
    },
  };

  it('renders without crashing', () => {
    const { container } = render(<HeatmapDay data={mockData} />);
    const dayCell = container.querySelector('[data-level="2"]');
    expect(dayCell).toBeInTheDocument();
  });

  it('applies correct activity level', () => {
    const { container } = render(<HeatmapDay data={mockData} />);
    const dayCell = container.querySelector('[data-level="2"]');
    expect(dayCell).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(<HeatmapDay data={mockData} onClick={onClick} />);
    
    const dayCell = container.querySelector('[data-level]') as HTMLElement;
    await user.click(dayCell);
    
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(mockData);
  });

  it('calls onHover when mouse enters and leaves', async () => {
    const user = userEvent.setup();
    const onHover = vi.fn();
    const { container } = render(<HeatmapDay data={mockData} onHover={onHover} />);
    
    const dayCell = container.querySelector('[data-level]') as HTMLElement;
    
    await user.hover(dayCell);
    expect(onHover).toHaveBeenCalledWith(mockData);
    
    await user.unhover(dayCell);
    expect(onHover).toHaveBeenCalledWith(null);
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(<HeatmapDay data={mockData} onClick={onClick} />);
    
    const dayCell = container.querySelector('[data-level]') as HTMLElement;
    dayCell.focus();
    
    // Press Enter
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    
    // Press Space
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('renders empty cell when isEmpty is true', () => {
    const { container } = render(<HeatmapDay data={mockData} isEmpty={true} />);
    const emptyCell = container.querySelector('[class*="empty"]');
    expect(emptyCell).toBeTruthy();
  });

  it('renders empty cell when date is empty', () => {
    const emptyData: HeatmapData = {
      date: '',
      level: 0,
      activities: { tasks: 0, notes: 0, focusMinutes: 0 },
    };
    
    const { container } = render(<HeatmapDay data={emptyData} />);
    const emptyCell = container.querySelector('[class*="empty"]');
    expect(emptyCell).toBeTruthy();
  });

  it('has proper ARIA label', () => {
    const { container } = render(<HeatmapDay data={mockData} />);
    const dayCell = container.querySelector('[role="gridcell"]');
    
    expect(dayCell).toHaveAttribute('aria-label');
    const ariaLabel = dayCell?.getAttribute('aria-label');
    expect(ariaLabel).toContain('3 tasks');
    expect(ariaLabel).toContain('2 notes');
    expect(ariaLabel).toContain('45 minutes');
  });

  it('has proper title attribute for tooltip', () => {
    const { container } = render(<HeatmapDay data={mockData} />);
    const dayCell = container.querySelector('[data-level]');
    
    expect(dayCell).toHaveAttribute('title');
    const title = dayCell?.getAttribute('title');
    expect(title).toContain('3 tasks');
  });

  it('is focusable when onClick is provided', () => {
    const onClick = vi.fn();
    const { container } = render(<HeatmapDay data={mockData} onClick={onClick} />);
    
    const dayCell = container.querySelector('[data-level]');
    expect(dayCell).toHaveAttribute('tabIndex', '0');
  });

  it('is not focusable when onClick is not provided', () => {
    const { container } = render(<HeatmapDay data={mockData} />);
    
    const dayCell = container.querySelector('[data-level]');
    expect(dayCell).toHaveAttribute('tabIndex', '-1');
  });

  it('displays correct activity summary for no activity', () => {
    const noActivityData: HeatmapData = {
      date: '2024-01-15',
      level: 0,
      activities: { tasks: 0, notes: 0, focusMinutes: 0 },
    };
    
    const { container } = render(<HeatmapDay data={noActivityData} />);
    const dayCell = container.querySelector('[role="gridcell"]');
    
    const ariaLabel = dayCell?.getAttribute('aria-label');
    expect(ariaLabel).toContain('No activity');
  });

  it('renders all activity levels correctly', () => {
    const levels: Array<0 | 1 | 2 | 3 | 4> = [0, 1, 2, 3, 4];
    
    levels.forEach((level) => {
      const data: HeatmapData = {
        date: '2024-01-15',
        level,
        activities: { tasks: level, notes: level, focusMinutes: level * 15 },
      };
      
      const { container } = render(<HeatmapDay data={data} />);
      const dayCell = container.querySelector(`[data-level="${level}"]`);
      expect(dayCell).toBeInTheDocument();
    });
  });
});
