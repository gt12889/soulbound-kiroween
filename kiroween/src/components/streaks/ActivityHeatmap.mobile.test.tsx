/**
 * Mobile Optimization Tests for ActivityHeatmap
 * 
 * Tests Task 2.3: Heatmap Mobile Optimization
 * - Show last 90 days on small screens
 * - Add horizontal scroll
 * - Optimize touch interactions
 * - Test on various screen sizes
 */

import { render, screen, waitFor } from '@testing-library/react';
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

describe('ActivityHeatmap - Mobile Optimization', () => {
  beforeEach(() => {
    // Reset to desktop size before each test
    mockInnerWidth(1024);
  });

  describe('Desktop View (>768px)', () => {
    it('should display all 365 days on desktop', () => {
      const data = generateTestData(365);
      render(<ActivityHeatmap data={data} />);
      
      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute('aria-label', 'Activity heatmap showing 365 days of activity');
    });

    it('should not show mobile note in title on desktop', () => {
      const data = generateTestData(365);
      render(<ActivityHeatmap data={data} />);
      
      const title = screen.getByText('Activity Heatmap');
      expect(title).toBeInTheDocument();
      expect(screen.queryByText(/Last 90 days/i)).not.toBeInTheDocument();
    });
  });

  describe('Mobile View (<768px)', () => {
    beforeEach(() => {
      mockInnerWidth(375); // iPhone size
    });

    it('should display only last 90 days on mobile', async () => {
      const data = generateTestData(365);
      render(<ActivityHeatmap data={data} />);
      
      // Wait for resize effect to trigger
      await waitFor(() => {
        const grid = screen.getByRole('grid');
        expect(grid).toHaveAttribute('aria-label', 'Activity heatmap showing 90 days of activity');
      });
    });

    it('should show mobile note in title', async () => {
      const data = generateTestData(365);
      render(<ActivityHeatmap data={data} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Last 90 days/i)).toBeInTheDocument();
      });
    });

    it('should apply mobile scroll class', async () => {
      const data = generateTestData(365);
      const { container } = render(<ActivityHeatmap data={data} />);
      
      await waitFor(() => {
        const wrapper = container.querySelector('[class*="heatmapWrapper"]');
        expect(wrapper).toBeTruthy();
        expect(wrapper?.className).toContain('mobileScroll');
      });
    });
  });

  describe('Tablet View (768px)', () => {
    beforeEach(() => {
      mockInnerWidth(768);
    });

    it('should display all days at exactly 768px (boundary)', async () => {
      const data = generateTestData(365);
      render(<ActivityHeatmap data={data} />);
      
      // At exactly 768px, should still show all days (mobile is <768)
      await waitFor(() => {
        const grid = screen.getByRole('grid');
        expect(grid).toHaveAttribute('aria-label', 'Activity heatmap showing 365 days of activity');
      });
    });
  });

  describe('Small Mobile View (<480px)', () => {
    beforeEach(() => {
      mockInnerWidth(320); // Small phone
    });

    it('should still display 90 days on very small screens', async () => {
      const data = generateTestData(365);
      render(<ActivityHeatmap data={data} />);
      
      await waitFor(() => {
        const grid = screen.getByRole('grid');
        expect(grid).toHaveAttribute('aria-label', 'Activity heatmap showing 90 days of activity');
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should update display when resizing from desktop to mobile', async () => {
      const data = generateTestData(365);
      const { rerender } = render(<ActivityHeatmap data={data} />);
      
      // Start on desktop
      expect(screen.getByRole('grid')).toHaveAttribute(
        'aria-label',
        'Activity heatmap showing 365 days of activity'
      );
      
      // Resize to mobile
      mockInnerWidth(375);
      rerender(<ActivityHeatmap data={data} />);
      
      await waitFor(() => {
        expect(screen.getByRole('grid')).toHaveAttribute(
          'aria-label',
          'Activity heatmap showing 90 days of activity'
        );
      });
    });

    it('should update display when resizing from mobile to desktop', async () => {
      mockInnerWidth(375);
      const data = generateTestData(365);
      const { rerender } = render(<ActivityHeatmap data={data} />);
      
      // Start on mobile
      await waitFor(() => {
        expect(screen.getByRole('grid')).toHaveAttribute(
          'aria-label',
          'Activity heatmap showing 90 days of activity'
        );
      });
      
      // Resize to desktop
      mockInnerWidth(1024);
      rerender(<ActivityHeatmap data={data} />);
      
      await waitFor(() => {
        expect(screen.getByRole('grid')).toHaveAttribute(
          'aria-label',
          'Activity heatmap showing 365 days of activity'
        );
      });
    });
  });

  describe('Data Handling', () => {
    it('should handle data with less than 90 days on mobile', async () => {
      mockInnerWidth(375);
      const data = generateTestData(30);
      render(<ActivityHeatmap data={data} />);
      
      await waitFor(() => {
        const grid = screen.getByRole('grid');
        expect(grid).toHaveAttribute('aria-label', 'Activity heatmap showing 30 days of activity');
      });
    });

    it('should handle exactly 90 days of data on mobile', async () => {
      mockInnerWidth(375);
      const data = generateTestData(90);
      render(<ActivityHeatmap data={data} />);
      
      await waitFor(() => {
        const grid = screen.getByRole('grid');
        expect(grid).toHaveAttribute('aria-label', 'Activity heatmap showing 90 days of activity');
      });
    });

    it('should handle empty data gracefully', () => {
      const data: HeatmapData[] = [];
      render(<ActivityHeatmap data={data} />);
      
      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Accessibility on Mobile', () => {
    beforeEach(() => {
      mockInnerWidth(375);
    });

    it('should maintain grid role on mobile', async () => {
      const data = generateTestData(365);
      render(<ActivityHeatmap data={data} />);
      
      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });
    });

    it('should have descriptive aria-label on mobile', async () => {
      const data = generateTestData(365);
      render(<ActivityHeatmap data={data} />);
      
      await waitFor(() => {
        const grid = screen.getByRole('grid');
        expect(grid).toHaveAttribute('aria-label', expect.stringContaining('90 days'));
      });
    });
  });

  describe('Performance', () => {
    it('should render mobile view faster than desktop view', async () => {
      const data = generateTestData(365);
      
      // Desktop render
      mockInnerWidth(1024);
      const desktopStart = performance.now();
      const { unmount: unmountDesktop } = render(<ActivityHeatmap data={data} />);
      const desktopTime = performance.now() - desktopStart;
      unmountDesktop();
      
      // Mobile render
      mockInnerWidth(375);
      const mobileStart = performance.now();
      const { unmount: unmountMobile } = render(<ActivityHeatmap data={data} />);
      await waitFor(() => {
        expect(screen.getByRole('grid')).toHaveAttribute(
          'aria-label',
          'Activity heatmap showing 90 days of activity'
        );
      });
      const mobileTime = performance.now() - mobileStart;
      unmountMobile();
      
      // Mobile should be faster or similar (rendering fewer cells)
      // This is a soft assertion - just checking it doesn't take significantly longer
      expect(mobileTime).toBeLessThan(desktopTime * 2);
    });
  });
});
