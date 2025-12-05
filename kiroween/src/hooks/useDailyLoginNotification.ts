import { useEffect, useRef } from 'react';
import { useStreak } from '../contexts/StreakContext';
import { useToast } from '../contexts/ToastContext';

/**
 * Hook to show a daily login streak notification
 * Shows a toast notification when the user logs in each day
 * Only shows once per day to avoid spam
 */
export function useDailyLoginNotification() {
  const { streaks } = useStreak();
  const { showToast } = useToast();
  const lastNotificationDateRef = useRef<string | null>(null);
  const lastStreakCountRef = useRef<number>(0);

  useEffect(() => {
    if (!streaks) return;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const loginStreak = streaks.loginStreak.current;
    const todayActivity = streaks.activityHistory[today];
    const hasLoggedInToday = todayActivity?.login === true;

    // Check if streak has increased (new login recorded)
    const streakIncreased = loginStreak > lastStreakCountRef.current;
    const isNewDay = lastNotificationDateRef.current !== today;

    // Show notification if:
    // 1. User has logged in today
    // 2. Streak has increased OR it's a new day with an existing streak
    // 3. We haven't shown a notification today
    if (
      hasLoggedInToday &&
      (streakIncreased || (isNewDay && loginStreak > 0)) &&
      lastNotificationDateRef.current !== today
    ) {
      // Show notification with appropriate message
      const message = loginStreak === 1
        ? 'Welcome back! Your journey begins... 🔥'
        : `Day ${loginStreak} of your streak! Keep the flame burning! 🔥`;

      showToast({
        type: 'success',
        message,
        duration: 5000, // Show for 5 seconds
      });

      // Remember we've shown the notification today
      lastNotificationDateRef.current = today;
    }

    // Update last known streak count
    lastStreakCountRef.current = loginStreak;
  }, [streaks, showToast]);
}

