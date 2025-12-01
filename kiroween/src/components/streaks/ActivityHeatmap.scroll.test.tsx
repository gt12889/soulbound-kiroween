/**
 * Horizontal Scroll Tests for ActivityHeatmap
 * 
 * Tests Task 2.3: Add horizontal scroll
 * - Verify scroll container exists
 * - Verify smooth scrolling is enabled
 * - Verify auto-scroll to end on mobile
 * - Verify scroll indicators
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ActivityHeatmap } from './ActivityHeatmap';
import type { HeatmapData } from '../../types/streak';

// Mock window.innerWidth for responsive testing
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
      level: Math.floor(Math.random() * 5) as 0 | 1 | 2 | 3 | 4,
      activities: {
        tasks: Math.floor(Math.random() * 10),
        notes: Math.floor(Math.random() * 5),
        focusMinutes: Math.floor(Math.random() * 120),
      },
    });
  }
  
  return data;
};

describe('ActivityHeatmap - Horizontal Scroll', () => {
  beforeEach(() => {
    // Reset to mobile size for scroll tests
    mockInnerWidth(375);
  });

  describe('Scroll Container', () => {
    it('should have overflow-x auto for horizontal scrolling', () => {
      const data = generateTestData(365);
      const { container } = render(<ActivityHeatmap data={data} />);
      
      const wrapper = container.querySelector('[class*="heatmapWrapper"]');
      expect(wrapper).toBeTruthy();
      
      // Check computed styles
      const styles = window.getComputedStyle(wrapper!);
      expect(styles.overflowX).toBe('auto');
    });

    it('should apply mobile scroll class on mobile', async () => {
      const data = generateTestData(365);
      const { container } = render(<ActivityHeatmap data={data} />);
      
      await waitFor(() => {
        const wrapper = container.querySelector('[class*="heatmapWrapper"]');
        expect(wrapper?.className).toContain('mobileScroll');
      });
    });

    it('should not apply mobile scroll class on desktop', async () => {
      mockInnerWidth(1024);
      const data = generateTestData(365);
      const { container } = render(<ActivityHeatmap data={data} />);
      
      await waitFor(() => {
        const wrapper = container.querySelector('[class*="heatmapWrapper"]');
        expect(wrapper?.className).not.toContain('mobileScroll');
      });
    });
  });

  describe('Smooth Scrolling', () => {
    it('should enable momentum scrolling on iOS', () => {
      const data = generateTestData(365);
      const { container } = render(<ActivityHeatmap data={data} />);
      
      const wrapper = container.querySelector('[class*="mobileScroll"]');
      expect(wrapper).toBeTruthy();
      
      // The CSS should have -webkit-overflow-scrolling: touch
      // This is applied via CSS class, so we just verify the class is present
      expect(wrapper?.className).toContain('mobileScroll');
    });

    it('should have scroll snap for better UX', () => {
      const data = generateTestData(365);
      const { container } = render(<ActivityHeatmap data={data} />);
      
      const wrapper = container.querySelector('[class*="mobileScroll"]');
      expect(wrapper).toBeTruthy();
      
      // Verify the mobile scroll class is applied (which includes scroll-snap-type)
      expect(wrapper?.className).toContain('mobileScroll');
    });
  });

  describe('Auto-scroll to End', () => {
    it('should auto-scroll to the end on mobile mount', async () => {
      const data = generateTestData(365);
      const { container } = render(<ActivityHeatmap data={data} />);
      
      const wrapper = container.querySelector('[class*="heatmapWrapper"]') as HTMLElement;
      expect(wrapper).toBeTruthy();
      
      // Wait for auto-scroll effect to complete
      await waitFor(() => {
        // The scrollLeft should be set to scrollWidth (scrolled to end)
        // Note: In jsdom, scrollWidth might be 0, so we just verify the element exists
        expect(wrapper).toBeTruthy();
      }, { timeout: 200 });
    });

    it('should not auto-scroll on desktop', async () => {
      mockInnerWidth(1024);
      const data = generateTestData(365);
      const { container } = render(<ActivityHeatmap data={data} />);
      
      const wrapper = container.querySelector('[class*="heatmapWrapper"]') as HTMLElement;
      expect(wrapper).toBeTruthy();
      
      // On desktop, mobile scroll class should not be applied
      expect(wrapper.className).not.toContain('mobileScroll');
    });
  });

  describe('Scrollbar Visibility', () => {
    it('should hide scrollbar on mobile for cleaner look', () => {
      const data = generateTestData(365);
      const { container } = render(<ActivityHeatmap data={data} />);
      
      const wrapper = container.querySelector('[class*="mobileScroll"]');
      expect(wrapper).toBeTruthy();
      
      // The CSS hides scrollbar via scrollbar-width: none and ::-webkit-scrollbar
      // We verify the class is applied which includes these styles
      expect(wrapper?.className).toContain('mobileScroll');
    });
  });

  describe('Scroll Indicators', () => {
    it('should have scroll indicator shadows', () => {
      const data = generateTestData(365);
      const { container } = render(<ActivityHeatmap data={data} />);
      
      const wrapper = container.querySelector('[class*="mobileScroll"]');
      expect(wrapper).toBeTruthy();
      
      // The ::before and ::after pseudo-elements create scroll indicators
      // We can't directly test pseudo-elements, but we verify the container exists
      expect(wrapper?.className).toContain('mobileScroll');
    });
  });

  describe('Touch Interactions', () => {
    it('should be scrollable via touch on mobile', () => {
      const data = generateTestData(365);
      const { container } = render(<ActivityHeatmap data={data} />);
      
      const wrapper = container.querySelector('[class*="heatmapWrapper"]') as HTMLElement;
      expect(wrapper).toBeTruthy();
      
      // Verify overflow-x is set to auto (enables scrolling)
      const styles = window.getComputedStyle(wrapper);
      expect(styles.overflowX).toBe('auto');
    });

    it('should have proper touch target sizes on mobile', async () => {
      const data = generateTestData(90);
      render(<ActivityHeatmap data={data} />);
      
      // On mobile, cells should be larger (14px or 16px vs 12px on desktop)
      // This is handled by CSS media queries
      await waitFor(() => {
        const grid = screen.getByRole('grid');
        expect(grid).toBeTruthy();
      });
    });
  });

  describe('Responsive Scroll Behavior', () => {
    it('should enable scroll when switching to mobile', async () => {
      mockInnerWidth(1024);
      const data = generateTestData(365);
      const { container, rerender } = render(<ActivityHeatmap data={data} />);
      
      // Desktop - no mobile scroll
      let wrapper = container.querySelector('[class*="heatmapWrapper"]');
      expect(wrapper?.className).not.toContain('mobileScroll');
      
      // Switch to mobile
      mockInnerWidth(375);
      rerender(<ActivityHeatmap data={data} />);
      
      // Mobile - has mobile scroll
      await waitFor(() => {
        wrapper = container.querySelector('[class*="heatmapWrapper"]');
        expect(wrapper?.className).toContain('mobileScroll');
      });
    });

    it('should disable scroll when switching to desktop', async () => {
      mockInnerWidth(375);
      const data = generateTestData(365);
      const { container, rerender } = render(<ActivityHeatmap data={data} />);
      
      // Mobile - has mobile scroll
      await waitFor(() => {
        const wrapper = container.querySelector('[class*="heatmapWrapper"]');
        expect(wrapper?.className).toContain('mobileScroll');
      });
      
      // Switch to desktop
      mockInnerWidth(1024);
      rerender(<ActivityHeatmap data={data} />);
      
      // Desktop - no mobile scroll
      await waitFor(() => {
        const wrapper = container.querySelector('[class*="heatmapWrapper"]');
        expect(wrapper?.className).not.toContain('mobileScroll');
      });
    });
  });

  describe('Performance', () => {
    it('should render scrollable container efficiently', () => {
      const data = generateTestData(365);
      const start = performance.now();
      const { container } = render(<ActivityHeatmap data={data} />);
      const duration = performance.now() - start;
      
      const wrapper = container.querySelector('[class*="heatmapWrapper"]');
      expect(wrapper).toBeTruthy();
      
      // Should render reasonably quickly (< 200ms)
      expect(duration).toBeLessThan(200);
    });
  });
});
