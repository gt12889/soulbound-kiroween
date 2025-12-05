# Activity Heatmap Filter Implementation

## Overview

The Activity Heatmap now supports filtering by activity type, allowing users to focus on specific types of activities (tasks, notes, or focus sessions) or view all activities combined.

## Features

- **Filter Buttons**: Four filter options - All, Tasks, Notes, Focus
- **Dynamic Recalculation**: Activity levels are recalculated based on the selected filter
- **Responsive Design**: Filter buttons adapt to mobile screens
- **Accessibility**: Full keyboard navigation and ARIA attributes
- **Controlled/Uncontrolled**: Can be used with internal state or external control

## Usage

### Basic Usage (Internal State)

```tsx
import { ActivityHeatmap } from './components/streaks/ActivityHeatmap';
import { useActivityHeatmap } from './hooks/useActivityHeatmap';

function MyComponent() {
  const { activityHistory } = useStreak();
  const heatmapData = useActivityHeatmap(activityHistory);

  return <ActivityHeatmap data={heatmapData} />;
}
```

The component will render filter buttons and manage the filter state internally.

### Controlled Usage (External State)

```tsx
import { ActivityHeatmap } from './components/streaks/ActivityHeatmap';
import { useActivityHeatmap } from './hooks/useActivityHeatmap';
import { useState } from 'react';

function MyComponent() {
  const { activityHistory } = useStreak();
  const heatmapData = useActivityHeatmap(activityHistory);
  const [filterType, setFilterType] = useState<'all' | 'tasks' | 'notes' | 'focus'>('all');

  return (
    <div>
      {/* Custom filter controls */}
      <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
        <option value="all">All Activities</option>
        <option value="tasks">Tasks Only</option>
        <option value="notes">Notes Only</option>
        <option value="focus">Focus Only</option>
      </select>
      
      {/* Heatmap with external filter - no built-in buttons */}
      <ActivityHeatmap data={heatmapData} filterType={filterType} />
    </div>
  );
}
```

When `filterType` prop is provided, the component will not render its own filter buttons.

## Filter Logic

The filter recalculates activity levels based only on the selected activity type:

### Scoring Formula

- **Tasks**: 2 points each
- **Notes**: 1 point each
- **Focus**: 1 point per 15 minutes

### Level Thresholds

- **Level 0**: 0 points (no activity)
- **Level 1**: 1-2 points (light activity)
- **Level 2**: 3-5 points (moderate activity)
- **Level 3**: 6-10 points (high activity)
- **Level 4**: 11+ points (very high activity)

### Examples

**Original Day Data:**
- Tasks: 5 (10 points)
- Notes: 2 (2 points)
- Focus: 60 minutes (4 points)
- **Total**: 16 points → Level 4

**Filtered by Tasks:**
- Tasks: 5 (10 points)
- **Total**: 10 points → Level 3

**Filtered by Notes:**
- Notes: 2 (2 points)
- **Total**: 2 points → Level 1

**Filtered by Focus:**
- Focus: 60 minutes (4 points)
- **Total**: 4 points → Level 2

## Styling

Filter buttons use theme-aware CSS variables:

```css
.filterButton {
  background: var(--bg-tertiary);
  border: 2px solid var(--border-secondary);
  color: var(--text-secondary);
}

.filterButton.active {
  background: var(--accent-purple);
  border-color: var(--accent-purple-light);
  color: var(--text-primary);
  box-shadow: 0 0 12px rgba(107, 70, 193, 0.4);
}
```

## Accessibility

- **Keyboard Navigation**: All filter buttons are keyboard accessible
- **ARIA Attributes**: 
  - `role="group"` on filter container
  - `aria-label` on each button
  - `aria-pressed` to indicate active state
- **Focus Indicators**: Visible focus outline on keyboard navigation
- **Screen Reader**: Announces filter changes and current selection

## Mobile Optimization

On mobile screens (< 768px):
- Filter buttons expand to fill available width
- Buttons are sized for touch targets (minimum 44px)
- Font size adjusts for readability
- Buttons wrap to multiple rows if needed

## Performance

- **Memoization**: Filter calculation is memoized using `useMemo`
- **Efficient Recalculation**: Only recalculates when data or filter changes
- **No Re-renders**: Filter state changes don't cause unnecessary re-renders of other components

## Testing

Comprehensive test coverage includes:
- Filter button rendering
- Filter state management
- Data filtering accuracy
- Level recalculation
- Accessibility attributes
- Controlled/uncontrolled modes
- Edge cases (empty data, etc.)

Run tests:
```bash
npx vitest run ActivityHeatmap.filter.test.tsx
```

## Requirements Satisfied

✅ **Task 2.4**: Add filter by activity type
- Filter buttons render correctly
- Data filters by selected activity type
- Levels recalculate based on filtered data
- Accessible keyboard navigation
- Responsive mobile design

## Future Enhancements

Potential improvements for future iterations:
- Save filter preference to localStorage
- Animate transitions between filters
- Show filter statistics (e.g., "15 days with tasks")
- Multi-select filters (e.g., "Tasks + Notes")
- Custom filter presets
