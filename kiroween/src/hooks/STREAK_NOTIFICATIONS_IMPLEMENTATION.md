# Streak Notifications Implementation

## Overview
Implemented comprehensive notification system for streak tracking with warning notifications, milestone celebrations, weekly summaries, and companion dialogue integration.

## Implementation Details

### File Created
- `src/hooks/useStreakNotifications.ts` - Main notification hook

### Features Implemented

#### 1. Warning Notifications (8pm)
- **Requirement**: AC6 - Warning notification if streak at risk
- **Implementation**: 
  - Checks all streak types at configured warning time (default 8pm)
  - Calculates hours remaining until midnight
  - Integrates with companion dialogue for personalized encouragement
  - Prevents spam with 24-hour cooldown per streak type
  - Shows toast notification with warning icon

#### 2. Milestone Notifications
- **Requirement**: AC6 - Celebration notification on milestone achievements
- **Implementation**:
  - Detects when streak reaches milestone days (3, 7, 14, 30, 60, 100, 365)
  - Awards XP bonus from milestone configuration
  - Shows celebration with companion-specific dialogue
  - Uses milestone icons and names from configuration
  - Tracks notified milestones to prevent duplicates

#### 3. Broken Streak Notifications
- **Requirement**: AC6 - Notification when streak breaks
- **Implementation**:
  - Shows notification when streak is broken
  - Indicates if recovery token is available
  - Provides action button to trigger recovery modal
  - Uses error toast type with appropriate messaging

#### 4. Recovery Success Notifications
- **Requirement**: AC6 - Notification after successful recovery
- **Implementation**:
  - Confirms successful streak recovery
  - Shows remaining token count
  - Uses success toast type with celebration

#### 5. Weekly Summary
- **Requirement**: AC6 - Weekly summary of all active streaks
- **Implementation**:
  - Calculates statistics for last 7 days
  - Shows total tasks, notes, focus minutes
  - Displays active streak count
  - Configurable day and time (default: Sunday 6pm)
  - Comprehensive summary in single notification

#### 6. Companion Dialogue Integration
- **Requirement**: AC6 - Companion shows relevant dialogue
- **Implementation**:
  - Uses `companionDialogueService` for personalized messages
  - Different dialogue for each companion type (shadow, forest, ember)
  - Context-aware encouragement for warnings
  - Celebration dialogue for milestones
  - Maintains companion personality throughout notifications

#### 7. Notification Settings
- **Requirement**: AC6 - Opt-in/opt-out for notifications
- **Implementation**:
  - Respects `streakGoals.notificationsEnabled` setting
  - Configurable warning time (default: 20:00)
  - Configurable weekly summary day and time
  - All notifications can be disabled globally

### Anti-Spam Measures
- **Max 1 warning per streak type per day**: Tracks last warning time with 24-hour cooldown
- **Milestone deduplication**: Tracks notified milestones to prevent duplicate celebrations
- **Time-based checks**: Only fires notifications within 5-minute window of scheduled time

### Integration Points

#### Toast Context
- Uses `useToast()` for all notification display
- Supports different toast types: warning, success, error, info
- Configurable durations (6-10 seconds based on content)
- Action buttons for recovery options

#### Streak Context
- Uses `useStreak()` for streak data and risk checking
- Accesses `isStreakAtRisk()` for warning detection
- Uses `nextMilestone()` for milestone tracking
- Reads `streakGoals` for notification settings

#### Companion Context
- Uses `useCompanion()` for XP awards and dialogue
- Calls `addExperience()` for milestone XP bonuses
- Accesses `activeCompanion` for personalized dialogue

### Timing System

#### Warning Notifications
- Default time: 20:00 (8pm)
- Checks every minute via interval
- 5-minute window for triggering
- Calculates hours until midnight for display

#### Weekly Summary
- Default: Sunday at 18:00 (6pm)
- Checks every minute via interval
- 5-minute window for triggering
- Calculates last 7 days of activity

#### Milestone Checks
- Runs every minute
- Detects when current streak equals milestone day
- Immediate notification on achievement

### Return API
The hook returns functions for manual notification triggering:

```typescript
{
  showWarningNotification: (streakType, hoursLeft) => void
  showMilestoneNotification: (streakType, days) => void
  showBrokenStreakNotification: (streakType, canRecover) => void
  showRecoveredNotification: (streakType, tokensLeft) => void
  showWeeklySummary: () => void
  calculateWeeklyStats: () => WeeklyStats
}
```

## Usage Example

```typescript
import { useStreakNotifications } from '../hooks/useStreakNotifications';

function MyComponent() {
  // Auto-setup with default settings
  const notifications = useStreakNotifications();
  
  // Or with custom settings
  const customNotifications = useStreakNotifications({
    enabled: true,
    warningTime: '19:00', // 7pm instead of 8pm
    weeklySummaryDay: 6, // Saturday instead of Sunday
    weeklySummaryTime: '17:00', // 5pm instead of 6pm
  });
  
  // Manual notification triggering
  const handleRecovery = () => {
    notifications.showRecoveredNotification('task', 2);
  };
  
  return <div>...</div>;
}
```

## Testing Considerations

### Unit Tests Needed
- Warning notification timing logic
- Milestone detection and deduplication
- Weekly stats calculation
- Spam prevention (24-hour cooldown)
- Settings integration

### Integration Tests Needed
- Toast display on notifications
- Companion dialogue integration
- XP award on milestones
- Settings toggle behavior

### Manual Testing
- Set system time to 8pm to test warnings
- Complete tasks to reach milestones
- Break streaks to test recovery notifications
- Wait for Sunday 6pm for weekly summary
- Toggle notification settings

## Acceptance Criteria Status

✅ **Notifications fire at correct times**
- Warning at 8pm (configurable)
- Weekly summary on Sunday 6pm (configurable)
- Milestones immediately on achievement

✅ **Can be disabled in settings**
- Respects `streakGoals.notificationsEnabled`
- All notifications check enabled flag

✅ **Companion shows relevant dialogue**
- Uses `companionDialogueService` for all messages
- Personalized for each companion type
- Context-aware encouragement and celebration

✅ **No spam (max 1 per type per day)**
- 24-hour cooldown on warnings per streak type
- Milestone deduplication tracking
- Time-window based triggering (5-minute window)

## Future Enhancements

### Potential Improvements
1. **Browser Notifications**: Add support for native browser notifications
2. **Sound Effects**: Optional audio alerts for milestones
3. **Custom Schedules**: Per-streak-type warning times
4. **Notification History**: Log of past notifications
5. **Smart Timing**: ML-based optimal notification times
6. **Batch Notifications**: Group multiple warnings into one
7. **Priority System**: Different urgency levels for notifications
8. **Snooze Feature**: Delay notifications temporarily

### Performance Optimizations
1. **Debouncing**: Reduce check frequency when no streaks active
2. **Web Workers**: Move timing checks to background thread
3. **Lazy Loading**: Only load notification system when needed
4. **Caching**: Cache weekly stats calculation

## Dependencies
- `react` - Hooks (useEffect, useCallback, useRef)
- `../contexts/StreakContext` - Streak data and functions
- `../contexts/ToastContext` - Toast notifications
- `../contexts/CompanionContext` - XP and dialogue
- `../services/companionDialogueService` - Personalized messages
- `../types/streak` - Type definitions

## Related Files
- `src/contexts/StreakContext.tsx` - Streak state management
- `src/contexts/ToastContext.tsx` - Toast notification system
- `src/contexts/CompanionContext.tsx` - Companion state
- `src/services/companionDialogueService.ts` - Dialogue generation
- `src/types/streak.ts` - Type definitions

## Task Completion
✅ Task 3.4: Notification System - COMPLETE

All sub-tasks completed:
- ✅ Create `src/hooks/useStreakNotifications.ts`
- ✅ Implement warning notifications (8pm)
- ✅ Add milestone notifications
- ✅ Add weekly summary
- ✅ Integrate with companion dialogue
- ✅ Add notification settings

## Notes
- Notification system is fully integrated with existing contexts
- All timing is configurable through settings
- Companion dialogue adds personality to notifications
- Anti-spam measures prevent notification fatigue
- Ready for integration into main app flow
