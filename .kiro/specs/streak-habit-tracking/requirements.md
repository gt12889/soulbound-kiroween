# Streak & Habit Tracking - Requirements

## Overview
Add comprehensive streak and habit tracking to encourage daily engagement and build productive habits. Users earn rewards for consistency, visualize their activity patterns, and can recover from missed days with special tokens.

## User Stories

### Daily Login Streaks
- As a user, I want to see my current login streak so I feel motivated to return daily
- As a user, I want to earn rewards for milestone streaks (7, 30, 100 days) so I feel accomplished
- As a user, I want my companion to celebrate my streak milestones so the experience feels personal
- As a user, I want to see my longest streak ever so I have a goal to beat

### Task Completion Streaks
- As a user, I want to track consecutive days completing tasks so I build a habit
- As a user, I want to see different streak types (tasks, notes, focus sessions) so I can track multiple habits
- As a user, I want streak notifications when I'm close to losing one so I stay engaged
- As a user, I want to set custom streak goals (e.g., "complete 3 tasks daily") so I can personalize my targets

### Activity Heatmap
- As a user, I want to see a GitHub-style heatmap of my activity so I can visualize patterns
- As a user, I want to hover over days to see detailed stats so I understand my productivity
- As a user, I want to filter the heatmap by activity type (tasks, notes, focus time) so I can analyze specific habits
- As a user, I want to see my most/least productive days of the week so I can optimize my schedule

### Streak Recovery Tokens
- As a user, I want to earn streak freeze tokens so I don't lose progress on busy days
- As a user, I want to use tokens to recover a broken streak so I feel less discouraged
- As a user, I want to see how many tokens I have so I can plan their use strategically
- As a user, I want to earn tokens through achievements so there's a reward system

## Acceptance Criteria

### AC1: Login Streak Tracking
- System tracks consecutive days user opens the app
- Streak increments at midnight local time if user was active that day
- Streak resets to 0 if a day is missed (unless token used)
- Display current streak prominently on dashboard
- Show "longest streak" personal record

### AC2: Task Completion Streaks
- Track consecutive days with at least 1 completed task
- Track consecutive days meeting custom goal (e.g., 3+ tasks)
- Display multiple streak types simultaneously
- Each streak type has independent counter and rewards

### AC3: Activity Heatmap
- Display 365-day calendar grid (GitHub-style)
- Color intensity based on activity level (0-4+ activities)
- Hover tooltip shows: date, task count, note count, focus minutes
- Click day to see detailed breakdown
- Responsive design for mobile (show fewer days)

### AC4: Streak Rewards
- Milestone rewards at: 3, 7, 14, 30, 60, 100, 365 days
- Rewards include: XP bonus, companion accessories, streak tokens, special achievements
- Companion dialogue changes based on streak status
- Visual celebration animation on milestone days

### AC5: Streak Recovery System
- Users earn 1 token per 30-day streak
- Tokens can be used within 48 hours of breaking streak
- Maximum 3 tokens can be held at once
- Token usage shows in streak history with special indicator

### AC6: Streak Notifications
- Warning notification if streak at risk (no activity by 8pm local time)
- Celebration notification on milestone achievements
- Weekly summary of all active streaks
- Opt-in/opt-out for notifications in settings

### AC7: Data Persistence
- All streak data syncs with Firebase
- Local storage backup for offline access
- Streak history preserved (don't lose data on reset)
- Export streak data as JSON/CSV

## Technical Requirements

### Data Structure
```typescript
interface StreakData {
  loginStreak: {
    current: number;
    longest: number;
    lastLoginDate: string;
    startDate: string;
  };
  taskStreak: {
    current: number;
    longest: number;
    lastCompletionDate: string;
    customGoal: number; // tasks per day
  };
  noteStreak: {
    current: number;
    longest: number;
    lastNoteDate: string;
  };
  focusStreak: {
    current: number;
    longest: number;
    lastFocusDate: string;
    minimumMinutes: number;
  };
  tokens: {
    available: number;
    earned: number;
    used: number;
  };
  milestones: {
    [key: number]: {
      achieved: boolean;
      date?: string;
      rewardClaimed: boolean;
    };
  };
  activityHistory: {
    [date: string]: {
      tasks: number;
      notes: number;
      focusMinutes: number;
      login: boolean;
    };
  };
}
```

### Performance
- Heatmap renders efficiently for 365 days
- Activity calculations cached daily
- Lazy load detailed history data
- Optimize Firebase queries (index by date)

### Accessibility
- Heatmap keyboard navigable
- Screen reader announces streak status
- High contrast mode for heatmap colors
- Focus indicators on interactive elements

## Out of Scope (Future Enhancements)
- Social features (compare streaks with friends)
- Custom habit tracking beyond built-in types
- Streak challenges/competitions
- Advanced analytics and predictions
- Streak sharing on social media

## Dependencies
- Existing CompanionContext for XP/rewards
- TasksContext for task completion data
- TimerContext for focus session data
- NotesContext for note creation data
- Firebase for cloud sync

## Success Metrics
- 40%+ increase in daily active users
- 25%+ increase in task completion rate
- Average streak length > 7 days
- 60%+ of users engage with heatmap feature
- Token usage rate indicates feature value
