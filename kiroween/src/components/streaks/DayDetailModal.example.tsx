/**
 * DayDetailModal Example Usage
 * 
 * This file demonstrates how to use the DayDetailModal component
 * with the ActivityHeatmap component.
 */

import React, { useState } from 'react';
import { ActivityHeatmap } from './ActivityHeatmap';
import type { HeatmapData } from '../../types/streak';

/**
 * Example: Basic Usage
 * 
 * The ActivityHeatmap component automatically handles the modal.
 * Just provide the data and it works out of the box!
 */
export const BasicExample: React.FC = () => {
  // Generate sample data for the last 90 days
  const generateSampleData = (): HeatmapData[] => {
    const data: HeatmapData[] = [];
    const today = new Date();
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Random activity levels
      const level = Math.floor(Math.random() * 5) as 0 | 1 | 2 | 3 | 4;
      
      data.push({
        date: date.toISOString().split('T')[0],
        level,
        activities: {
          tasks: level * 2,
          notes: level,
          focusMinutes: level * 30,
        },
      });
    }
    
    return data;
  };

  const [data] = useState(generateSampleData);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Activity Heatmap with Day Details</h2>
      <p>Click any day to see detailed activity breakdown</p>
      <ActivityHeatmap data={data} />
    </div>
  );
};

/**
 * Example: With Custom Click Handler
 * 
 * You can also provide a custom click handler to perform
 * additional actions when a day is clicked.
 */
export const WithCustomHandlerExample: React.FC = () => {
  const [data] = useState<HeatmapData[]>([
    {
      date: '2024-01-15',
      level: 3,
      activities: { tasks: 5, notes: 3, focusMinutes: 90 },
    },
    {
      date: '2024-01-16',
      level: 2,
      activities: { tasks: 3, notes: 2, focusMinutes: 45 },
    },
    {
      date: '2024-01-17',
      level: 4,
      activities: { tasks: 8, notes: 5, focusMinutes: 120 },
    },
  ]);

  const handleDayClick = (day: HeatmapData) => {
    console.log('Day clicked:', day);
    // You could:
    // - Track analytics
    // - Navigate to a detailed view
    // - Show additional UI
    // - Update other components
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>With Custom Click Handler</h2>
      <p>Check the console when you click a day</p>
      <ActivityHeatmap data={data} onDayClick={handleDayClick} />
    </div>
  );
};

/**
 * Example: Different Activity Patterns
 * 
 * The modal adapts to different activity levels and patterns.
 */
export const ActivityPatternsExample: React.FC = () => {
  const patterns: HeatmapData[] = [
    // No activity
    {
      date: '2024-01-01',
      level: 0,
      activities: { tasks: 0, notes: 0, focusMinutes: 0 },
    },
    // Light activity
    {
      date: '2024-01-02',
      level: 1,
      activities: { tasks: 1, notes: 1, focusMinutes: 15 },
    },
    // Moderate activity
    {
      date: '2024-01-03',
      level: 2,
      activities: { tasks: 3, notes: 2, focusMinutes: 45 },
    },
    // High activity
    {
      date: '2024-01-04',
      level: 3,
      activities: { tasks: 6, notes: 4, focusMinutes: 90 },
    },
    // Very high activity
    {
      date: '2024-01-05',
      level: 4,
      activities: { tasks: 10, notes: 7, focusMinutes: 150 },
    },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Different Activity Patterns</h2>
      <p>Click each day to see how the modal adapts to different activity levels</p>
      <ActivityHeatmap data={patterns} />
    </div>
  );
};

/**
 * Example: Keyboard Navigation
 * 
 * The modal is fully keyboard accessible.
 */
export const KeyboardNavigationExample: React.FC = () => {
  const data: HeatmapData[] = [
    {
      date: '2024-01-15',
      level: 3,
      activities: { tasks: 5, notes: 3, focusMinutes: 90 },
    },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Keyboard Navigation</h2>
      <div style={{ marginBottom: '1rem' }}>
        <h3>Try these keyboard shortcuts:</h3>
        <ul>
          <li><kbd>Tab</kbd> - Navigate to day cells</li>
          <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Open day details</li>
          <li><kbd>Escape</kbd> - Close modal</li>
          <li><kbd>Tab</kbd> (in modal) - Navigate modal elements</li>
        </ul>
      </div>
      <ActivityHeatmap data={data} />
    </div>
  );
};

/**
 * Example: Mobile Responsive
 * 
 * The modal adapts to mobile screens with optimized layout.
 */
export const MobileResponsiveExample: React.FC = () => {
  const data: HeatmapData[] = Array.from({ length: 90 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (89 - i));
    
    return {
      date: date.toISOString().split('T')[0],
      level: (i % 5) as 0 | 1 | 2 | 3 | 4,
      activities: {
        tasks: (i % 5) * 2,
        notes: i % 5,
        focusMinutes: (i % 5) * 30,
      },
    };
  });

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Mobile Responsive</h2>
      <p>Resize your browser to see mobile optimizations</p>
      <p style={{ fontSize: '0.875rem', color: '#808080' }}>
        On mobile: Shows last 90 days, modal slides from bottom
      </p>
      <ActivityHeatmap data={data} />
    </div>
  );
};

export default BasicExample;
