# Streak & Habit Tracking - Design

## Architecture Overview

### Component Structure
```
src/
├── contexts/
│   └── StreakContext.tsx              # Central streak state management
├── services/
│   ├── streakService.ts               # Streak calculation logic
│   └── streakStorageService.ts        # Firebase sync
├── components/
│   ├── streaks/
│   │   ├── StreakDashboard.tsx        # Main streak overview
│   │   ├── StreakCard.tsx             # Individual streak display
│   │   ├── ActivityHeatmap.tsx        # Calendar heatmap
│   │   ├── HeatmapDay.tsx             # Single day cell
│   │   ├── StreakMilestones.tsx       # Milestone progress
│   │   ├── StreakTokens.tsx           # Token management UI
│   │   ├── StreakRecoveryModal.tsx    # Token usage modal
│   │   └── StreakStats.tsx            # Detailed statistics
│   └── common/
│       └── StreakIndicator.tsx        # Mini streak display (nav bar)
└── hooks/
    ├── useStreakTracking.ts           # Main streak hook
    ├── useActivityHeatmap.ts          # Heatmap data processing
    └── useStreakNotifications.ts      # Notification logic
```

## Core Systems

### 1. Streak Calculation System

**Daily Check Logic:**
```typescript
// Run on app mount and at midnight
function checkAndUpdateStreaks(currentDate: Date, lastCheckDate: Date) {
  const daysSinceLastCheck = getDayDifference(lastCheckDate, currentDate);
  
  if (daysSinceLastCheck === 0) {
    // Same day, no update needed
    return;
  }
  
  if (daysSinceLastCheck === 1) {
    // Consecutive day - increment streaks if criteria met
    updateStreaksIfActive(currentDate);
  } else {
    // Missed day(s) - check for token usage or reset
    handleMissedDays(daysSinceLastCheck);
  }
}
```

**Streak Types:**
- **Login Streak**: Increments on any app activity
- **Task Streak**: Requires ≥1 completed task (or custom goal)
- **Note Streak**: Requires ≥1 note created/edited
- **Focus Streak**: Requires ≥X minutes of focus time

### 2. Activity Heatmap System

**Data Structure:**
```typescript
interface HeatmapData {
  date: string; // YYYY-MM-DD
  level: 0 | 1 | 2 | 3 | 4; // Activity intensity
  activities: {
    tasks: number;
    notes: number;
    focusMinutes: number;
  };
}

// Calculate intensity level
function getActivityLevel(activities: Activities): number {
  const score = 
    activities.tasks * 2 +
    activities.notes * 1 +
    Math.floor(activities.focusMinutes / 15);
  
  if (score === 0) return 0;
  if (score <= 2) return 1;
  if (score <= 5) return 2;
  if (score <= 10) return 3;
  return 4;
}
```

**Rendering Strategy:**
- Use CSS Grid for layout (7 rows × 53 columns)
- Virtualize for mobile (show last 90 days)
- Memoize calculations to prevent re-renders
- Use CSS variables for theme-aware colors

### 3. Streak Recovery System

**Token Economy:**
```typescript
interface TokenSystem {
  // Earning tokens
  earnToken: (reason: 'milestone' | 'achievement') => void;
  
  // Using tokens
  useToken: (streakType: StreakType, missedDate: string) => boolean;
  
  // Validation
  canUseToken: (streakType: StreakType) => {
    allowed: boolean;
    reason?: string; // "no tokens" | "too late" | "not broken"
  };
}

// Token earning rules
const TOKEN_RULES = {
  milestone30Days: 1,
  milestone100Days: 2,
  achievementUnlock: 1,
  maxTokens: 3,
  recoveryWindow: 48 * 60 * 60 * 1000, // 48 hours in ms
};
```

### 4. Notification System

**Notification Types:**
```typescript
type StreakNotification = 
  | { type: 'warning'; streak: StreakType; hoursLeft: number }
  | { type: 'milestone'; streak: StreakType; days: number }
  | { type: 'broken'; streak: StreakType; canRecover: boolean }
  | { type: 'recovered'; streak: StreakType; tokensLeft: number }
  | { type: 'weekly-summary'; stats: WeeklyStats };
```

**Timing:**
- Warning: 8pm local time if no activity
- Milestone: Immediately on achievement
- Broken: Next app open after missed day
- Weekly: Sunday 6pm

## UI/UX Design

### Dashboard Layout
```
┌─────────────────────────────────────────┐
│  🔥 Your Streaks                        │
├─────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ Login    │ │ Tasks    │ │ Focus    ││
│  │ 🔥 23    │ │ ⚡ 15    │ │ ⏱️ 8     ││
│  │ days     │ │ days     │ │ days     ││
│  └──────────┘ └──────────┘ └──────────┘│
├─────────────────────────────────────────┤
│  🎟️ Streak Tokens: ●●○ (2/3)           │
├─────────────────────────────────────────┤
│  📅 Activity Heatmap                    │
│  [365-day calendar grid]                │
├─────────────────────────────────────────┤
│  🏆 Next Milestone: 30 days (7 to go)  │
└─────────────────────────────────────────┘
```

### Streak Card Design
- Large number with fire emoji
- Progress bar to next milestone
- "Best: X days" subtitle
- Pulse animation on active streak
- Grayscale when broken

### Heatmap Color Scheme
```css
/* Theme-aware colors */
--heatmap-empty: var(--bg-secondary);
--heatmap-level-1: rgba(var(--accent-rgb), 0.2);
--heatmap-level-2: rgba(var(--accent-rgb), 0.4);
--heatmap-level-3: rgba(var(--accent-rgb), 0.7);
--heatmap-level-4: rgba(var(--accent-rgb), 1.0);
```

### Companion Integration
- Companion dialogue changes based on streak status
- Special animations on milestone achievements
- Sad/encouraging mood when streak at risk
- Celebration particles on recovery

## State Management

### StreakContext API
```typescript
interface StreakContextValue {
  // State
  streaks: StreakData;
  loading: boolean;
  
  // Actions
  checkStreaks: () => Promise<void>;
  recordActivity: (type: ActivityType) => void;
  useRecoveryToken: (streakType: StreakType) => Promise<boolean>;
  
  // Computed
  isStreakAtRisk: (streakType: StreakType) => boolean;
  nextMilestone: (streakType: StreakType) => number;
  heatmapData: HeatmapData[];
  
  // Settings
  updateStreakGoals: (goals: StreakGoals) => void;
  toggleNotifications: (enabled: boolean) => void;
}
```

### Integration Points

**TasksContext:**
```typescript
// When task completed
const { recordActivity } = useStreak();
recordActivity('task');
```

**NotesContext:**
```typescript
// When note saved
const { recordActivity } = useStreak();
recordActivity('note');
```

**TimerContext:**
```typescript
// When focus session ends
const { recordActivity } = useStreak();
recordActivity('focus', { minutes: sessionDuration });
```

**CompanionContext:**
```typescript
// Award XP on milestones
const { awardXP, showDialogue } = useCompanion();
if (milestone) {
  awardXP(milestoneReward);
  showDialogue(getMilestoneMessage(streakType, days));
}
```

## Data Flow

### Initialization
1. App loads → StreakContext mounts
2. Load streak data from localStorage (instant)
3. Fetch from Firebase (sync)
4. Check if new day → update streaks
5. Check for missed days → handle recovery

### Activity Recording
1. User completes task/note/focus
2. Context records activity → `recordActivity(type)`
3. Update today's activity count
4. Check if streak criteria met
5. Update streak counter if applicable
6. Sync to Firebase (debounced)
7. Update heatmap data

### Midnight Rollover
1. Detect date change (interval check or visibility API)
2. Evaluate yesterday's activity
3. Increment or break streaks
4. Check for milestones
5. Trigger notifications if needed
6. Reset daily activity counters

## Performance Optimizations

### Caching Strategy
- Cache heatmap calculations (365 days)
- Invalidate cache only on new activity
- Use `useMemo` for expensive computations
- Debounce Firebase writes (5 seconds)

### Lazy Loading
- Load full history on demand (not on mount)
- Virtualize heatmap on mobile
- Paginate milestone history

### Offline Support
- All streak logic works offline
- Queue Firebase updates
- Sync on reconnection
- Conflict resolution (server wins for dates, merge activities)

## Testing Strategy

### Unit Tests
- Streak calculation logic
- Token earning/usage rules
- Activity level computation
- Date handling edge cases

### Integration Tests
- Streak updates on task completion
- Midnight rollover behavior
- Token recovery flow
- Firebase sync

### E2E Tests
- Complete task → see streak increment
- Miss day → see warning notification
- Use token → recover streak
- Reach milestone → see celebration

## Accessibility

### Keyboard Navigation
- Tab through streak cards
- Arrow keys navigate heatmap
- Enter to view day details
- Escape to close modals

### Screen Reader
- Announce current streak on focus
- Describe heatmap patterns
- Alert on milestone achievements
- Explain token system

### Visual
- High contrast heatmap colors
- Focus indicators on all interactive elements
- Reduced motion option (disable animations)
- Color-blind friendly palette

## Migration Plan

### Phase 1: Core Tracking (Week 1)
- Implement StreakContext
- Add login streak tracking
- Basic UI components
- Local storage persistence

### Phase 2: Activity Heatmap (Week 2)
- Build heatmap component
- Integrate with existing contexts
- Add hover tooltips
- Mobile responsive design

### Phase 3: Token System (Week 3)
- Implement token economy
- Recovery modal UI
- Notification system
- Firebase sync

### Phase 4: Polish & Integration (Week 4)
- Companion dialogue integration
- Milestone celebrations
- Settings page
- Performance optimization

## Open Questions

1. Should we track "perfect weeks" (7-day streaks)?
2. How to handle timezone changes (travel)?
3. Should tokens expire?
4. Weekly vs daily streak goals?
5. Streak leaderboard (future)?
