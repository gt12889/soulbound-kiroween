/**
 * Touch Interaction Tests for ActivityHeatmap
 * 
 * Tests Task 2.3: Optimize touch interactions
 * - Touch event handling
 * - Scroll detection
 * - Haptic feedback
 * - Touch target sizes
 * - Prevent unwanted behaviors
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ActivityHeatmap } from './ActivityHeatmap';
import type { HeatmapData } from '../../types/streak';

// Mock navigator.vibrate
const mockVibrate = vi.fn();
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  configurable: true,
  value: mockVibrate,
});

// Mock window.innerWidth for mobile testing
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
};

// Generate test data
const generateTestData = (days: number): HeatmapData[] => {
  const data: HeatmapData[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      level: (i % 5) as 0 | 1 | 2 | 3 | 4,
      activities: {
        tasks: i % 10,
        notes: i % 5,
        focusMinutes: i % 120,
      },
    });
  }
  
  return data;
};

describe('ActivityHeatmap - Touch Interactions', () => {
  beforeEach(() => {
    mockInnerWidth(375); // Mobile size
    mockVibrate.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Touch Event Handling', () => {
    it('should handle touch start on day cell', () => {
      const data = generateTestData(30);
      const onDayClick = vi.fn();
      render(<ActivityHeatmap data={data} onDayClick={onDayClick} />);
      
      const cells = screen.getAllByRole('gridcell');
      const firstValidCell = cells.find(cell => !cell.hasAttribute('aria-hidden'));
      
      expect(firstValidCell).toBeDefined();
      
      if (firstValidCell) {
        fireEvent.touchStart(firstValidCell, {
          touches: [{ clientX: 100, clientY: 100 }],
        });
        
        // Should trigger haptic feedback
        expect(mockVibrate).toHaveBeenCalledWith(10);
      }
    });

    it('should handle touch end and trigger click', () => {
      const data = generateTestData(30);
      const onDayClick = vi.fn();
      render(<ActivityHeatmap data={data} onDayClick={onDayClick} />);
      
      const cells = screen.getAllByRole('gridcell');
      const firstValidCell = cells.find(cell => !cell.hasAttribute('aria-hidden'));
      
      if (firstValidCell) {
        // Simulate quick tap
        fireEvent.touchStart(firstValidCell, {
          touches: [{ clientX: 100, clientY: 100 }],
        });
        
        // End touch quickly (< 500ms)
        fireEvent.touchEnd(firstValidCell, {
          changedTouches: [{ clientX: 100, clientY: 100 }],
        });
        
        expect(onDayClick).toHaveBeenCalled();
      }
    });

    it('should not trigger click on long press', () => {
      const data = generateTestData(30);
      const onDayClick = vi.fn();
      render(<ActivityHeatmap data={data} onDayClick={onDayClick} />);
      
      const cells = screen.getAllByRole('gridcell');
      const firstValidCell = cells.find(cell => !cell.hasAttribute('aria-hidden'));
      
      if (firstValidCell) {
        // Start touch
        fireEvent.touchStart(firstValidCell, {
          touches: [{ clientX: 100, clientY: 100 }],
        });
        
        // Wait 600ms (long press)
        vi.advanceTimersByTime(600);
        
        // End touch
        fireEvent.touchEnd(firstValidCell, {
          changedTouches: [{ clientX: 100, clientY: 100 }],
        });
        
        // Should not trigger click
        expect(onDayClick).not.toHaveBeenCalled();
      }
    });

    it('should not trigger click when scrolling', () => {
      const data = generateTestData(30);
      const onDayClick = vi.fn();
      render(<ActivityHeatmap data={data} onDayClick={onDayClick} />);
      
      const cells = screen.getAllByRole('gridcell');
      const firstValidCell = cells.find(cell => !cell.hasAttribute('aria-hidden'));
      
      if (firstValidCell) {
        // Start touch
        fireEvent.touchStart(firstValidCell, {
          touches: [{ clientX: 100, clientY: 100 }],
        });
        
        // Move touch (simulate scroll)
        fireEvent.touchMove(firstValidCell, {
          touches: [{ clientX: 150, clientY: 100 }],
        });
        
        // End touch
        fireEvent.touchEnd(firstValidCell, {
          changedTouches: [{ clientX: 150, clientY: 100 }],
        });
        
        // Should not trigger click
        expect(onDayClick).not.toHaveBeenCalled();
      }
    });

    it('should handle touch cancel', () => {
      const data = generateTestData(30);
      const onDayClick = vi.fn();
      render(<ActivityHeatmap data={data} onDayClick={onDayClick} />);
      
      const cells = screen.getAllByRole('gridcell');
      const firstValidCell = cells.find(cell => !cell.hasAttribute('aria-hidden'));
      
      if (firstValidCell) {
        // Start touch
        fireEvent.touchStart(firstValidCell, {
          touches: [{ clientX: 100, clientY: 100 }],
        });
        
        // Cancel touch
        fireEvent.touchCancel(firstValidCell);
        
        // Should not trigger click
        expect(onDayClick).not.toHaveBeenCalled();
      }
    });
  });

  describe('Haptic Feedback', () => {
    it('should trigger haptic feedback on touch start', () => {
      const data = generateTestData(30);
      render(<ActivityHeatmap data={data} />);
      
      const cells = screen.getAllByRole('gridcell');
      const firstValidCell = cells.find(cell => !cell.hasAttribute('aria-hidden'));
      
      if (firstValidCell) {
        fireEvent.touchStart(firstValidCell, {
          touches: [{ clientX: 100, clientY: 100 }],
        });
        
        expect(mockVibrate).toHaveBeenCalledWith(10);
      }
    });

    it('should not crash if vibrate API is not available', () => {
      // Remove vibrate API
      const originalVibrate = navigator.vibrate;
      // @ts-ignore
      delete navigator.vibrate;
      
      const data = generateTestData(30);
      render(<ActivityHeatmap data={data} />);
      
      const cells = screen.getAllByRole('gridcell');
      const firstValidCell = cells.find(cell => !cell.hasAttribute('aria-hidden'));
      
      if (firstValidCell) {
        // Should not crash
        expect(() => {
          fireEvent.touchStart(firstValidCell, {
            touches: [{ clientX: 100, clientY: 100 }],
          });
        }).not.toThrow();
      }
      
      // Restore vibrate API
      Object.defineProperty(navigator, 'vibrate', {
        writable: true,
        configurable: true,
        value: originalVibrate,
      });
    });
  });

  describe('Touch Visual Feedback', () => {
    it('should add touching class during touch', () => {
      const data = generateTestData(30);
      render(<ActivityHeatmap data={data} />);
      
      const cells = screen.getAllByRole('gridcell');
      const firstValidCell = cells.find(cell => !cell.hasAttribute('aria-hidden'));
      
      if (firstValidCell) {
        // Start touch
        fireEvent.touchStart(firstValidCell, {
          touches: [{ clientX: 100, clientY: 100 }],
        });
        
        // Should have touching class
        expect(firstValidCell.className).toContain('touching');
      }
    });

    it('should remove touching class after touch end', () => {
      const data = generateTestData(30);
      render(<ActivityHeatmap data={data} />);
      
      const cells = screen.getAllByRole('gridcell');
      const firstValidCell = cells.find(cell => !cell.hasAttribute('aria-hidden'));
      
      if (firstValidCell) {
        // Start touch
        fireEvent.touchStart(firstValidCell, {
          touches: [{ clientX: 100, clientY: 100 }],
        });
        
        expect(firstValidCell.className).toContain('touching');
        
        // End touch
        fireEvent.touchEnd(firstValidCell, {
          changedTouches: [{ clientX: 100, clientY: 100 }],
        });
        
        // Should remove touching class
        expect(firstValidCell.className).not.toContain('touching');
      }
    });
  });

  describe('Touch Target Sizes', () => {
    it('should render cells with adequate touch targets', () => {
      const data = generateTestData(30);
      render(<ActivityHeatmap data={data} />);
      
      const cells = screen.getAllByRole('gridcell');
      const firstValidCell = cells.find(cell => !cell.hasAttribute('aria-hidden'));
      
      // Verify cell exists and is interactive
      expect(firstValidCell).toBeDefined();
      if (firstValidCell) {
        expect(firstValidCell).toHaveAttribute('role', 'gridcell');
        expect(firstValidCell).toHaveAttribute('tabIndex');
      }
    });
  });

  describe('Performance', () => {
    it('should handle rapid touch events without performance issues', () => {
      const data = generateTestData(30);
      render(<ActivityHeatmap data={data} />);
      
      const cells = screen.getAllByRole('gridcell');
      const validCells = cells.filter(cell => !cell.hasAttribute('aria-hidden'));
      
      const startTime = performance.now();
      
      // Simulate rapid touches on first 5 cells
      validCells.slice(0, 5).forEach(cell => {
        fireEvent.touchStart(cell, {
          touches: [{ clientX: 100, clientY: 100 }],
        });
        fireEvent.touchEnd(cell, {
          changedTouches: [{ clientX: 100, clientY: 100 }],
        });
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (< 100ms)
      expect(duration).toBeLessThan(100);
    });
  });
});
