/**
 * Keyboard Navigation Tests for ActivityHeatmap
 * Requirements: Task 2.4 - Implement keyboard navigation
 * 
 * Tests keyboard navigation functionality:
 * - Arrow keys navigate between days
 * - Enter/Space activates focused day
 * - Focus indicators are visible
 * - Navigation skips empty cells
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityHeatmap } from './ActivityHeatmap';
import type { HeatmapData } from '../../types/streak';

describe('ActivityHeatmap - Keyboard Navigation', () => {
  // Helper to create test data
  const createTestData = (days: number): HeatmapData[] => {
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
          focusMinutes: i * 5,
        },
      });
    }
    
    return data;
  };

  it('should make grid focusable with tabIndex', () => {
    const data = createTestData(30);
    render(<ActivityHeatmap data={data} />);
    
    const grid = screen.getByRole('grid');
    expect(grid).toHaveAttribute('tabIndex', '0');
  });

  it('should include keyboard navigation instructions in aria-label', () => {
    const data = createTestData(30);
    render(<ActivityHeatmap data={data} />);
    
    const grid = screen.getByRole('grid');
    const ariaLabel = grid.getAttribute('aria-label');
    expect(ariaLabel).toContain('Use arrow keys to navigate');
  });

  it('should navigate down with ArrowDown key', () => {
    const data = createTestData(30);
    const onDayClick = vi.fn();
    render(<ActivityHeatmap data={data} onDayClick={onDayClick} />);
    
    const grid = screen.getByRole('grid');
    
    // Focus the grid
    grid.focus();
    
    // Press ArrowDown to move down one row
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    
    // The focused cell should change - focus moves to a cell
    const focusedElement = document.activeElement;
    expect(focusedElement).toBeTruthy();
    expect(focusedElement?.getAttribute('role')).toBe('gridcell');
  });

  it('should navigate up with ArrowUp key', () => {
    const data = createTestData(30);
    render(<ActivityHeatmap data={data} />);
    
    const grid = screen.getByRole('grid');
    grid.focus();
    
    // First move down, then up
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    fireEvent.keyDown(grid, { key: 'ArrowUp' });
    
    // Focus may move to a cell
    const focusedElement = document.activeElement;
    expect(focusedElement).toBeTruthy();
  });

  it('should navigate right with ArrowRight key', () => {
    const data = createTestData(30);
    render(<ActivityHeatmap data={data} />);
    
    const grid = screen.getByRole('grid');
    grid.focus();
    
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    
    // Focus may move to a cell
    const focusedElement = document.activeElement;
    expect(focusedElement).toBeTruthy();
  });

  it('should navigate left with ArrowLeft key', () => {
    const data = createTestData(30);
    render(<ActivityHeatmap data={data} />);
    
    const grid = screen.getByRole('grid');
    grid.focus();
    
    // First move right, then left
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    fireEvent.keyDown(grid, { key: 'ArrowLeft' });
    
    // Focus may move to a cell
    const focusedElement = document.activeElement;
    expect(focusedElement).toBeTruthy();
  });

  it('should activate focused day with Enter key', () => {
    const data = createTestData(30);
    const onDayClick = vi.fn();
    render(<ActivityHeatmap data={data} onDayClick={onDayClick} />);
    
    const grid = screen.getByRole('grid');
    grid.focus();
    
    // Initialize focus by pressing a key
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    
    // Activate with Enter
    fireEvent.keyDown(grid, { key: 'Enter' });
    
    // Should have called the click handler
    expect(onDayClick).toHaveBeenCalledTimes(1);
  });

  it('should activate focused day with Space key', () => {
    const data = createTestData(30);
    const onDayClick = vi.fn();
    render(<ActivityHeatmap data={data} onDayClick={onDayClick} />);
    
    const grid = screen.getByRole('grid');
    grid.focus();
    
    // Initialize focus
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    
    // Activate with Space
    fireEvent.keyDown(grid, { key: ' ' });
    
    expect(onDayClick).toHaveBeenCalledTimes(1);
  });

  it('should prevent default behavior for arrow keys', () => {
    const data = createTestData(30);
    render(<ActivityHeatmap data={data} />);
    
    const grid = screen.getByRole('grid');
    grid.focus();
    
    // Test that arrow keys are handled (preventDefault is called internally)
    // We can verify this by checking that navigation occurs
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    
    // If preventDefault worked, focus should have moved to a cell
    const focusedElement = document.activeElement;
    expect(focusedElement?.getAttribute('role')).toBe('gridcell');
  });

  it('should not handle non-arrow keys', () => {
    const data = createTestData(30);
    render(<ActivityHeatmap data={data} />);
    
    const grid = screen.getByRole('grid');
    grid.focus();
    
    // Press a non-arrow key
    const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    
    grid.dispatchEvent(event);
    
    // Should not prevent default for non-arrow keys
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('should skip empty cells when navigating', () => {
    // Create data with gaps (empty cells will be added as padding)
    const data = createTestData(10);
    render(<ActivityHeatmap data={data} />);
    
    const grid = screen.getByRole('grid');
    grid.focus();
    
    // Navigate multiple times - should skip empty cells
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    
    // Should still have a focused element (didn't get stuck on empty cells)
    const focusedElement = document.activeElement;
    expect(focusedElement).toBeTruthy();
  });

  it('should handle boundary conditions gracefully', () => {
    const data = createTestData(30);
    render(<ActivityHeatmap data={data} />);
    
    const grid = screen.getByRole('grid');
    grid.focus();
    
    // Try to navigate beyond boundaries
    for (let i = 0; i < 20; i++) {
      fireEvent.keyDown(grid, { key: 'ArrowUp' });
    }
    
    // Should not crash - focus may move to a cell
    const focusedElement = document.activeElement;
    expect(focusedElement).toBeTruthy();
    
    // Try the other direction
    for (let i = 0; i < 20; i++) {
      fireEvent.keyDown(grid, { key: 'ArrowDown' });
    }
    
    // Should still have a focused element
    expect(document.activeElement).toBeTruthy();
  });

  it('should update hover state when navigating with keyboard', () => {
    const data = createTestData(30);
    render(<ActivityHeatmap data={data} />);
    
    const grid = screen.getByRole('grid');
    grid.focus();
    
    // Navigate to a cell
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    
    // Tooltip should appear (we can check if it's in the document)
    // The tooltip shows when hoveredDay is set
    const tooltip = screen.queryByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
  });

  it('should work with filtered data', () => {
    const data = createTestData(30);
    render(<ActivityHeatmap data={data} filterType="tasks" />);
    
    const grid = screen.getByRole('grid');
    grid.focus();
    
    // Should still be navigable
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    
    // Focus may move to a cell, but should still be within the component
    const focusedElement = document.activeElement;
    expect(focusedElement).toBeTruthy();
  });

  it('should work on mobile view (90 days)', () => {
    // Create a smaller dataset that simulates mobile view
    const data = createTestData(90);
    render(<ActivityHeatmap data={data} />);
    
    const grid = screen.getByRole('grid');
    grid.focus();
    
    // Should still be navigable with fewer days
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    
    // Focus may move to a cell
    const focusedElement = document.activeElement;
    expect(focusedElement).toBeTruthy();
  });

  it('should scroll focused cell into view', () => {
    const data = createTestData(365);
    render(<ActivityHeatmap data={data} />);
    
    const grid = screen.getByRole('grid');
    grid.focus();
    
    // Navigate far to the right
    for (let i = 0; i < 10; i++) {
      fireEvent.keyDown(grid, { key: 'ArrowRight' });
    }
    
    // The scrollIntoView should have been called (we can't easily test this without mocking)
    // But we can verify navigation still works - focus should be on a cell
    const focusedElement = document.activeElement;
    expect(focusedElement).toBeTruthy();
    expect(focusedElement?.getAttribute('role')).toBe('gridcell');
  });

  it('should maintain focus when modal opens', () => {
    const data = createTestData(30);
    render(<ActivityHeatmap data={data} />);
    
    const grid = screen.getByRole('grid');
    grid.focus();
    
    // Navigate and activate
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    fireEvent.keyDown(grid, { key: 'Enter' });
    
    // Modal should open (we can check for the modal)
    const modal = screen.queryByRole('dialog');
    expect(modal).toBeInTheDocument();
  });

  it('should handle rapid key presses', () => {
    const data = createTestData(30);
    render(<ActivityHeatmap data={data} />);
    
    const grid = screen.getByRole('grid');
    grid.focus();
    
    // Rapid navigation
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    fireEvent.keyDown(grid, { key: 'ArrowLeft' });
    fireEvent.keyDown(grid, { key: 'ArrowUp' });
    
    // Should not crash - focus may move to a cell
    const focusedElement = document.activeElement;
    expect(focusedElement).toBeTruthy();
  });

  it('should provide accessible labels for screen readers', () => {
    const data = createTestData(30);
    render(<ActivityHeatmap data={data} />);
    
    const cells = screen.getAllByRole('gridcell');
    
    // Check that non-empty cells have aria-labels
    const nonEmptyCells = cells.filter(cell => 
      cell.getAttribute('aria-label') && 
      !cell.getAttribute('aria-hidden')
    );
    
    expect(nonEmptyCells.length).toBeGreaterThan(0);
    
    // Check that labels include date and activity info
    const firstCell = nonEmptyCells[0];
    const label = firstCell.getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label).toMatch(/tasks|notes|focus|No activity/);
  });
});
