/**
 * Screen Reader Accessibility Tests for ActivityHeatmap
 * 
 * Requirements: Task 2.4 - Add screen reader descriptions
 * 
 * Tests verify that:
 * - Live region announces filter changes
 * - Grid has comprehensive aria-label
 * - Navigation announcements work correctly
 * - Legend has proper descriptions
 * - Instructions are available to screen readers
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityHeatmap } from './ActivityHeatmap';
import type { HeatmapData } from '../../types/streak';

describe('ActivityHeatmap - Screen Reader Accessibility', () => {
  // Mock data - smaller set for faster tests
  const mockData: HeatmapData[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      level: (i % 5) as 0 | 1 | 2 | 3 | 4,
      activities: {
        tasks: i % 3,
        notes: i % 2,
        focusMinutes: i % 60,
      },
    };
  });

  describe('Live Region Announcements', () => {
    it('should have a live region for announcements', () => {
      render(<ActivityHeatmap data={mockData} />);
      
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('Grid Accessibility', () => {
    it('should have comprehensive aria-label on grid', () => {
      render(<ActivityHeatmap data={mockData} />);
      
      const grid = screen.getByRole('grid');
      const ariaLabel = grid.getAttribute('aria-label');
      
      expect(ariaLabel).toContain('Activity heatmap');
      expect(ariaLabel).toContain('all activities');
      expect(ariaLabel).toContain('arrow keys to navigate');
      expect(ariaLabel).toContain('Enter or Space');
    });

    it('should have aria-labelledby pointing to title', () => {
      render(<ActivityHeatmap data={mockData} />);
      
      const grid = screen.getByRole('grid');
      const title = screen.getByText(/Activity Heatmap/i);
      
      expect(title).toHaveAttribute('id', 'heatmap-title');
      expect(grid).toHaveAttribute('aria-labelledby', 'heatmap-title');
    });

    it('should have aria-describedby pointing to instructions', () => {
      render(<ActivityHeatmap data={mockData} />);
      
      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute('aria-describedby', 'heatmap-instructions');
      
      const instructions = document.getElementById('heatmap-instructions');
      expect(instructions).toBeInTheDocument();
      expect(instructions).toHaveTextContent(/Navigate the heatmap using arrow keys/i);
      expect(instructions).toHaveTextContent(/Press Enter or Space/i);
    });
  });

  describe('Legend Accessibility', () => {
    it('should have accessible legend with role and label', () => {
      render(<ActivityHeatmap data={mockData} />);
      
      const legend = screen.getByRole('img', { name: /Activity level legend/i });
      expect(legend).toBeInTheDocument();
      
      const ariaLabel = legend.getAttribute('aria-label');
      expect(ariaLabel).toContain('Activity level legend');
      expect(ariaLabel).toContain('no activity');
      expect(ariaLabel).toContain('high activity');
    });

    it('should have aria-labels on legend squares', () => {
      render(<ActivityHeatmap data={mockData} />);
      
      const container = screen.getByRole('img', { name: /Activity level legend/i });
      const squares = container.querySelectorAll('[data-level]');
      
      expect(squares[0]).toHaveAttribute('aria-label', 'No activity');
      expect(squares[1]).toHaveAttribute('aria-label', 'Low activity');
      expect(squares[2]).toHaveAttribute('aria-label', 'Medium activity');
      expect(squares[3]).toHaveAttribute('aria-label', 'High activity');
      expect(squares[4]).toHaveAttribute('aria-label', 'Very high activity');
    });
  });

  describe('Screen Reader Instructions', () => {
    it('should have hidden instructions for screen readers', () => {
      render(<ActivityHeatmap data={mockData} />);
      
      const instructions = document.getElementById('heatmap-instructions');
      expect(instructions).toBeInTheDocument();
      expect(instructions).toHaveTextContent(/Navigate the heatmap using arrow keys/i);
      expect(instructions).toHaveTextContent(/Press Enter or Space to view detailed information/i);
      expect(instructions).toHaveTextContent(/Each cell represents one day/i);
    });
  });

  describe('Filter Button Accessibility', () => {
    it('should have proper aria-pressed states', () => {
      render(<ActivityHeatmap data={mockData} />);
      
      const allButton = screen.getByRole('button', { name: /show all activities/i });
      const tasksButton = screen.getByRole('button', { name: /show only tasks/i });
      
      // Initially "all" should be pressed
      expect(allButton).toHaveAttribute('aria-pressed', 'true');
      expect(tasksButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should have descriptive aria-labels', () => {
      render(<ActivityHeatmap data={mockData} />);
      
      expect(screen.getByRole('button', { name: 'Show all activities' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Show only tasks' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Show only notes' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Show only focus sessions' })).toBeInTheDocument();
    });

    it('should have role group with label', () => {
      render(<ActivityHeatmap data={mockData} />);
      
      const filterGroup = screen.getByRole('group', { name: /activity type filter/i });
      expect(filterGroup).toBeInTheDocument();
    });
  });

  describe('Day Cell Accessibility', () => {
    it('should have comprehensive aria-labels on day cells', () => {
      render(<ActivityHeatmap data={mockData} />);
      
      const gridCells = screen.getAllByRole('gridcell');
      const nonEmptyCells = gridCells.filter(cell => 
        cell.getAttribute('aria-label') && !cell.hasAttribute('aria-hidden')
      );
      
      expect(nonEmptyCells.length).toBeGreaterThan(0);
      
      // Check first non-empty cell
      const firstCell = nonEmptyCells[0];
      const ariaLabel = firstCell.getAttribute('aria-label');
      
      expect(ariaLabel).toBeTruthy();
      // Should contain date
      expect(ariaLabel).toMatch(/\w+day, \w+ \d+, \d{4}/);
      // Should contain activity level
      expect(ariaLabel).toMatch(/(no activity|low activity|medium activity|high activity|very high activity)/i);
      // Should contain instruction
      expect(ariaLabel).toContain('Press Enter or Space to view details');
    });
  });
});
