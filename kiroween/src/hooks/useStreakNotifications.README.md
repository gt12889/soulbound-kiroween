# useStreakNotifications Hook

A comprehensive notification system for streak tracking that provides timely warnings, milestone celebrations, and weekly summaries with companion dialogue integration.

## Features

- 🚨 **Warning Notifications**: Alert users when streaks are at risk (default: 8pm)
- 🎉 **Milestone Celebrations**: Celebrate streak achievements with XP bonuses
- 📊 **Weekly Summaries**: Comprehensive activity reports (default: Sunday 6pm)
- 💬 **Companion Integration**: Personalized dialogue from spirit companions
- ⚙️ **Configurable Settings**: Customize timing and enable/disable notifications
- 🛡️ **Anti-Spam**: Intelligent cooldowns prevent notification fatigue

## Basic Usage

```typescript
import { useStreakNotifications } from '../hooks/useStreakNotifications';

function MyComponent() {
  // Auto-setup with default settings
  useStreakNotifications();
  
  return <div>Your app content</div>;
}
```

That's it! The hook will automatically:
- Check for at-risk streaks at 8pm
- Celebrate milestone achievements
- Show weekly summaries on Sunday at 6pm

## Custom Settings

```typescript
useStreakNotifications({
  enabled: true,
  warningTime: '19:00', // 7pm instead of 8pm
  weeklySummaryDay: 6, // Saturday (0=Sunday, 6=Saturday)
  weeklySummaryTime: '17:00', // 5pm
});
```

## Manual Notifications

```typescript
const {
  showWarningNotification,
  showMilestoneNotification,
  showBrokenStreakNotification,
  showRecoveredNotification,
  showWeeklySummary,
  calculateWeeklyStats,
} = useStreakNotifications();

// Trigger notifications manually
showWarningNotification('task', 4); // 4 hours left
showMilestoneNotification('task', 7); // 7-day milestone
showBrokenStreakNotification('note', true); // Can recover
showRecoveredNotification('focus', 2); // 2 tokens left
showWeeklySummary();

// Get weekly statistics
const stats = calculateWeeklyStats();
console.log(stats.totalTasks, stats.daysActive);
```

## Notification Types

### Warning Notifications
Shown when a streak is at risk of breaking:
- Default time: 8pm (configurable)
- Shows hours remaining until midnight
- Includes companion encouragement
- Max 1 per streak type per day

### Milestone Notifications
Celebrate streak achievements:
- Triggers on milestone days: 3, 7, 14, 30, 60, 100, 365
- Awards XP bonus automatically
- Shows companion celebration dialogue
- Includes milestone icon and name

### Broken Streak Notifications
Alert when a streak breaks:
- Shows if recovery token is available
- Provides action button to recover
- Encourages user to continue

### Recovery Success Notifications
Confirm successful streak recovery:
- Shows remaining token count
- Celebrates the recovery

### Weekly Summary
Comprehensive activity report:
- Total tasks, notes, focus minutes
- Days active this week
- Active streak count
- Default: Sunday at 6pm

## Settings Integration

The hook respects settings from `StreakContext`:

```typescript
const { streakGoals, toggleNotifications } = useStreak();

// Enable/disable all notifications
toggleNotifications(false);

// Check current state
console.log(streakGoals.notificationsEnabled);
console.log(streakGoals.notificationTime);
```

## Companion Dialogue

Notifications include personalized dialogue based on:
- Active companion type (shadow, forest, ember)
- Notification context (warning, celebration, etc.)
- Companion personality traits

Examples:
- **Shadow**: "The shadows miss your presence..."
- **Forest**: "Even the mightiest trees need water..."
- **Ember**: "The flames grow dim without you..."

## Anti-Spam Features

### 24-Hour Cooldown
- Each streak type can only trigger 1 warning per day
- Prevents repeated notifications for same issue

### Milestone Deduplication
- Tracks which milestones have been notified
- Prevents duplicate celebrations

### Time Windows
- Notifications only fire within 5-minute window of scheduled time
- Reduces check frequency and battery usage

## Weekly Statistics

The `calculateWeeklyStats()` function returns:

```typescript
interface WeeklyStats {
  totalTasks: number;        // Tasks completed this week
  totalNotes: number;        // Notes created this week
  totalFocusMinutes: number; // Focus time this week
  daysActive: number;        // Days with any activity
  activeStreaks: number;     // Current active streaks
}
```

## Timing System

### Check Frequency
- Runs every 60 seconds
- Checks warning time, summary time, and milestones
- Minimal performance impact

### Time Matching
- 5-minute window for scheduled notifications
- Accounts for system clock variations
- Handles timezone changes gracefully

## Integration Points

### Required Contexts
- `StreakContext` - Streak data and settings
- `ToastContext` - Toast notification display
- `CompanionContext` - XP awards and dialogue

### Required Services
- `companionDialogueService` - Personalized messages

## Examples

See `useStreakNotifications.example.tsx` for:
1. Basic auto-setup
2. Custom settings
3. Manual triggering
4. Settings integration
5. Weekly stats display
6. App-level integration
7. Conditional notifications
8. Testing utilities

## Testing

### Manual Testing
```typescript
// Test all notification types
const notifications = useStreakNotifications();

notifications.showWarningNotification('task', 3);
notifications.showMilestoneNotification('task', 7);
notifications.showBrokenStreakNotification('note', true);
notifications.showRecoveredNotification('focus', 1);
notifications.showWeeklySummary();
```

### Time-Based Testing
- Set system time to 8pm to test warnings
- Set to Sunday 6pm to test weekly summary
- Complete tasks to reach milestones naturally

## Performance

- Lightweight: ~5KB minified
- Efficient: Checks run every 60 seconds
- Optimized: Memoized calculations
- Battery-friendly: Minimal background activity

## Accessibility

- Toast notifications are screen-reader friendly
- Companion dialogue provides context
- Visual and text-based notifications
- Configurable timing for different schedules

## Browser Support

- Modern browsers with ES6+ support
- Requires `setInterval` support
- Works offline (local notifications only)

## Dependencies

```json
{
  "react": "^18.0.0",
  "contexts": ["StreakContext", "ToastContext", "CompanionContext"],
  "services": ["companionDialogueService"],
  "types": ["streak types"]
}
```

## API Reference

### Hook Signature
```typescript
function useStreakNotifications(
  settings?: Partial<NotificationSettings>
): NotificationFunctions
```

### Settings Type
```typescript
interface NotificationSettings {
  enabled: boolean;
  warningTime: string; // "HH:MM" format
  weeklySummaryDay: number; // 0-6 (Sunday-Saturday)
  weeklySummaryTime: string; // "HH:MM" format
}
```

### Return Type
```typescript
interface NotificationFunctions {
  showWarningNotification: (type: StreakType, hoursLeft: number) => void;
  showMilestoneNotification: (type: StreakType, days: MilestoneDay) => void;
  showBrokenStreakNotification: (type: StreakType, canRecover: boolean) => void;
  showRecoveredNotification: (type: StreakType, tokensLeft: number) => void;
  showWeeklySummary: () => void;
  calculateWeeklyStats: () => WeeklyStats;
}
```

## Best Practices

1. **App-Level Integration**: Call once at app root level
2. **Settings Respect**: Always check `notificationsEnabled` setting
3. **Manual Triggers**: Use sparingly, prefer automatic notifications
4. **Testing**: Use example components for development
5. **Performance**: Don't call in loops or frequently re-rendering components

## Troubleshooting

### Notifications Not Showing
- Check `streakGoals.notificationsEnabled` is true
- Verify toast context is properly set up
- Check browser console for errors

### Wrong Timing
- Verify time format is "HH:MM" (24-hour)
- Check system time is correct
- Ensure timezone is properly set

### Duplicate Notifications
- Should not happen due to anti-spam measures
- If occurring, check for multiple hook instances
- Verify milestone tracking is working

## Future Enhancements

- Browser push notifications
- Sound effects for milestones
- Custom notification templates
- Notification history log
- Smart timing based on user activity
- Batch notifications

## Related Documentation

- [Streak Context](../contexts/StreakContext.tsx)
- [Toast Context](../contexts/ToastContext.tsx)
- [Companion Context](../contexts/CompanionContext.tsx)
- [Companion Dialogue Service](../services/companionDialogueService.ts)
- [Streak Types](../types/streak.ts)

## License

Part of the Kiroween productivity app.
