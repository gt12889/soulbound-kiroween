/**
 * Activity Heatmap Filter Demo
 * 
 * This example demonstrates the filter functionality of the ActivityHeatmap component.
 * It shows how the heatmap changes when filtering by different activity types.
 */

import React from 'react';
import { ActivityHeatmap } from './ActivityHeatmap';
import type { HeatmapData } from '../../types/streak';

// Sample data with mixed activities
const sampleData: HeatmapData[] = [
  // Week 1: Heavy task focus
  { date: '2024-01-01', level: 4, activities: { tasks: 10, notes: 1, focusMinutes: 30 } },
  { date: '2024-01-02', level: 3, activities: { tasks: 8, notes: 0, focusMinutes: 15 } },
  { date: '2024-01-03', level: 4, activities: { tasks: 12, notes: 2, focusMinutes: 45 } },
  { date: '2024-01-04', level: 2, activities: { tasks: 5, notes: 0, focusMinutes: 0 } },
  { date: '2024-01-05', level: 3, activities: { tasks: 7, notes: 1, focusMinutes: 30 } },
  { date: '2024-01-06', level: 1, activities: { tasks: 2, notes: 0, focusMinutes: 0 } },
  { date: '2024-01-07', level: 0, activities: { tasks: 0, notes: 0, focusMinutes: 0 } },
  
  // Week 2: Note-taking focus
  { date: '2024-01-08', level: 2, activities: { tasks: 1, notes: 5, focusMinutes: 15 } },
  { date: '2024-01-09', level: 3, activities: { tasks: 2, notes: 8, focusMinutes: 30 } },
  { date: '2024-01-10', level: 2, activities: { tasks: 0, notes: 6, focusMinutes: 0 } },
  { date: '2024-01-11', level: 3, activities: { tasks: 1, notes: 10, focusMinutes: 45 } },
  { date: '2024-01-12', level: 2, activities: { tasks: 0, notes: 7, focusMinutes: 15 } },
  { date: '2024-01-13', level: 1, activities: { tasks: 0, notes: 3, focusMinutes: 0 } },
  { date: '2024-01-14', level: 0, activities: { tasks: 0, notes: 0, focusMinutes: 0 } },
  
  // Week 3: Deep focus sessions
  { date: '2024-01-15', level: 3, activities: { tasks: 2, notes: 1, focusMinutes: 120 } },
  { date: '2024-01-16', level: 4, activities: { tasks: 3, notes: 2, focusMinutes: 180 } },
  { date: '2024-01-17', level: 3, activities: { tasks: 1, notes: 0, focusMinutes: 150 } },
  { date: '2024-01-18', level: 4, activities: { tasks: 2, notes: 1, focusMinutes: 200 } },
  { date: '2024-01-19', level: 2, activities: { tasks: 0, notes: 0, focusMinutes: 90 } },
  { date: '2024-01-20', level: 3, activities: { tasks: 1, notes: 1, focusMinutes: 135 } },
  { date: '2024-01-21', level: 0, activities: { tasks: 0, notes: 0, focusMinutes: 0 } },
  
  // Week 4: Balanced activities
  { date: '2024-01-22', level: 3, activities: { tasks: 5, notes: 3, focusMinutes: 60 } },
  { date: '2024-01-23', level: 4, activities: { tasks: 8, notes: 5, focusMinutes: 90 } },
  { date: '2024-01-24', level: 3, activities: { tasks: 6, notes: 4, focusMinutes: 45 } },
  { date: '2024-01-25', level: 4, activities: { tasks: 10, notes: 6, focusMinutes: 120 } },
  { date: '2024-01-26', level: 2, activities: { tasks: 3, notes: 2, focusMinutes: 30 } },
  { date: '2024-01-27', level: 3, activities: { tasks: 7, notes: 3, focusMinutes: 75 } },
  { date: '2024-01-28', level: 1, activities: { tasks: 1, notes: 1, focusMinutes: 15 } },
];

/**
 * FilterDemo Component
 * 
 * Demonstrates the filter functionality with sample data.
 * Shows how different filters affect the heatmap visualization.
 */
export function FilterDemo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--text-primary)', fontFamily: 'Cinzel, serif' }}>
        Activity Heatmap Filter Demo
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>
          Interactive Filter Example
        </h2>
        <p style={{ color: 'var(--text-tertiary)' }}>
          Click the filter buttons below to see how the heatmap changes based on activity type.
          Notice how the intensity levels recalculate for each filter.
        </p>
      </div>
      
      <ActivityHeatmap data={sampleData} />
      
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
          What to Notice:
        </h3>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          <li>
            <strong>All Filter:</strong> Shows combined activity from all sources. 
            Week 4 (Jan 22-28) has the highest overall activity.
          </li>
          <li>
            <strong>Tasks Filter:</strong> Highlights task-heavy days. 
            Week 1 (Jan 1-7) shows strong task completion patterns.
          </li>
          <li>
            <strong>Notes Filter:</strong> Emphasizes note-taking activity. 
            Week 2 (Jan 8-14) shows consistent note creation.
          </li>
          <li>
            <strong>Focus Filter:</strong> Reveals deep work sessions. 
            Week 3 (Jan 15-21) demonstrates extended focus periods.
          </li>
        </ul>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Sample Data Breakdown:
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <h4 style={{ color: 'var(--accent-purple)' }}>Week 1: Task Focus</h4>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
              Heavy task completion with minimal notes. 
              Best viewed with "Tasks" filter.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'var(--accent-purple)' }}>Week 2: Note Taking</h4>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
              Extensive note creation with few tasks. 
              Best viewed with "Notes" filter.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'var(--accent-purple)' }}>Week 3: Deep Work</h4>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
              Long focus sessions (2-3 hours). 
              Best viewed with "Focus" filter.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'var(--accent-purple)' }}>Week 4: Balanced</h4>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
              Mix of all activity types. 
              Best viewed with "All" filter.
            </p>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '2px solid var(--accent-purple)' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
          💡 Pro Tips:
        </h3>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          <li>Use filters to identify patterns in your work habits</li>
          <li>Compare different weeks to see how your focus shifts</li>
          <li>Filter by "Tasks" to track productivity streaks</li>
          <li>Filter by "Focus" to monitor deep work consistency</li>
          <li>Filter by "Notes" to see knowledge capture patterns</li>
          <li>Hover over any day to see detailed activity breakdown</li>
          <li>Click a day to open the detailed modal view</li>
        </ul>
      </div>
    </div>
  );
}

export default FilterDemo;
