/**
 * Example usage of useStreakNotifications hook
 * Demonstrates how to integrate streak notifications into components
 */

import React from 'react';
import { useStreakNotifications } from './useStreakNotifications';
import { useStreak } from '../contexts/StreakContext';

/**
 * Example 1: Auto-setup with default settings
 * Notifications will automatically fire at scheduled times
 */
export function BasicNotificationExample() {
  // Simply call the hook - notifications are automatic
  useStreakNotifications();
  
  return (
    <div>
      <h2>Notifications Active</h2>
      <p>Streak notifications are running in the background.</p>
      <ul>
        <li>Warning notifications at 8pm</li>
        <li>Milestone celebrations on achievement</li>
        <li>Weekly summary on Sunday at 6pm</li>
      </ul>
    </div>
  );
}

/**
 * Example 2: Custom notification settings
 * Override default times and days
 */
export function CustomSettingsExample() {
  useStreakNotifications({
    enabled: true,
    warningTime: '19:00', // 7pm instead of 8pm
    weeklySummaryDay: 6, // Saturday instead of Sunday
    weeklySummaryTime: '17:00', // 5pm instead of 6pm
  });
  
  return (
    <div>
      <h2>Custom Notification Schedule</h2>
      <p>Notifications with custom timing:</p>
      <ul>
        <li>Warnings at 7pm</li>
        <li>Weekly summary on Saturday at 5pm</li>
      </ul>
    </div>
  );
}

/**
 * Example 3: Manual notification triggering
 * Use returned functions to show notifications programmatically
 */
export function ManualNotificationExample() {
  const { streaks } = useStreak();
  const {
    showWarningNotification,
    showMilestoneNotification,
    showBrokenStreakNotification,
    showRecoveredNotification,
    showWeeklySummary,
  } = useStreakNotifications();
  
  return (
    <div>
      <h2>Manual Notification Controls</h2>
      
      <button onClick={() => showWarningNotification('task', 4)}>
        Test Warning (4 hours left)
      </button>
      
      <button onClick={() => showMilestoneNotification('task', 7)}>
        Test Milestone (7 days)
      </button>
      
      <button onClick={() => showBrokenStreakNotification('task', true)}>
        Test Broken Streak (can recover)
      </button>
      
      <button onClick={() => showRecoveredNotification('task', 2)}>
        Test Recovery Success (2 tokens left)
      </button>
      
      <button onClick={() => showWeeklySummary()}>
        Show Weekly Summary
      </button>
      
      {streaks && (
        <div>
          <h3>Current Streaks</h3>
          <p>Login: {streaks.loginStreak.current} days</p>
          <p>Tasks: {streaks.taskStreak.current} days</p>
          <p>Notes: {streaks.noteStreak.current} days</p>
          <p>Focus: {streaks.focusStreak.current} days</p>
        </div>
      )}
    </div>
  );
}

/**
 * Example 4: Integration with settings page
 * Allow users to configure notification preferences
 */
export function NotificationSettingsExample() {
  const { streakGoals, updateStreakGoals, toggleNotifications } = useStreak();
  const [warningTime, setWarningTime] = React.useState(streakGoals.notificationTime);
  
  // Hook respects settings from StreakContext
  useStreakNotifications();
  
  const handleToggle = () => {
    toggleNotifications(!streakGoals.notificationsEnabled);
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setWarningTime(newTime);
    updateStreakGoals({ notificationTime: newTime });
  };
  
  return (
    <div>
      <h2>Notification Settings</h2>
      
      <label>
        <input
          type="checkbox"
          checked={streakGoals.notificationsEnabled}
          onChange={handleToggle}
        />
        Enable Notifications
      </label>
      
      <label>
        Warning Time:
        <input
          type="time"
          value={warningTime}
          onChange={handleTimeChange}
          disabled={!streakGoals.notificationsEnabled}
        />
      </label>
      
      <p>
        {streakGoals.notificationsEnabled
          ? `Notifications enabled. Warnings at ${warningTime}.`
          : 'Notifications disabled.'}
      </p>
    </div>
  );
}

/**
 * Example 5: Weekly stats display
 * Show calculated weekly statistics
 */
export function WeeklyStatsExample() {
  const { calculateWeeklyStats } = useStreakNotifications();
  const [stats, setStats] = React.useState(calculateWeeklyStats());
  
  React.useEffect(() => {
    // Update stats every hour
    const interval = setInterval(() => {
      setStats(calculateWeeklyStats());
    }, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [calculateWeeklyStats]);
  
  return (
    <div>
      <h2>This Week's Activity</h2>
      <div>
        <p>📋 Tasks Completed: {stats.totalTasks}</p>
        <p>📝 Notes Created: {stats.totalNotes}</p>
        <p>⏱️ Focus Minutes: {stats.totalFocusMinutes}</p>
        <p>📅 Days Active: {stats.daysActive}/7</p>
        <p>🔥 Active Streaks: {stats.activeStreaks}</p>
      </div>
    </div>
  );
}

/**
 * Example 6: App-level integration
 * Typical usage in main App component
 */
export function AppLevelExample() {
  // Simply include the hook at app level
  // It will handle all notifications automatically
  useStreakNotifications();
  
  return (
    <div className="app">
      {/* Rest of your app */}
      <h1>My Productivity App</h1>
      {/* Notifications work in the background */}
    </div>
  );
}

/**
 * Example 7: Conditional notifications
 * Only enable notifications for authenticated users
 */
export function ConditionalNotificationsExample() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  
  // Only enable notifications when authenticated
  useStreakNotifications({
    enabled: isAuthenticated,
  });
  
  return (
    <div>
      <h2>Conditional Notifications</h2>
      <button onClick={() => setIsAuthenticated(!isAuthenticated)}>
        {isAuthenticated ? 'Sign Out' : 'Sign In'}
      </button>
      <p>
        Notifications: {isAuthenticated ? 'Enabled' : 'Disabled'}
      </p>
    </div>
  );
}

/**
 * Example 8: Testing notifications
 * Component for testing notification timing
 */
export function NotificationTestingExample() {
  const notifications = useStreakNotifications();
  const [lastTest, setLastTest] = React.useState<string>('');
  
  const testAllNotifications = () => {
    // Test each notification type
    notifications.showWarningNotification('task', 3);
    setTimeout(() => notifications.showMilestoneNotification('task', 7), 1000);
    setTimeout(() => notifications.showBrokenStreakNotification('note', true), 2000);
    setTimeout(() => notifications.showRecoveredNotification('focus', 1), 3000);
    setTimeout(() => notifications.showWeeklySummary(), 4000);
    
    setLastTest(new Date().toLocaleTimeString());
  };
  
  return (
    <div>
      <h2>Notification Testing</h2>
      <button onClick={testAllNotifications}>
        Test All Notifications
      </button>
      {lastTest && <p>Last test: {lastTest}</p>}
      <p>
        This will show all notification types in sequence.
        Check your toast notifications!
      </p>
    </div>
  );
}
