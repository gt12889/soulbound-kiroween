/**
 * Streak Notifications Hook
 * Manages streak-related notifications including warnings, milestones, and summaries
 * Requirements: Task 3.4 - Notification System
 */

import { useEffect, useCallback, useRef } from 'react';
import { useStreak } from '../contexts/StreakContext';
import { useToast } from '../contexts/ToastContext';
import { useCompanion } from '../contexts/CompanionContext';
import { companionDialogueService } from '../services/companionDialogueService';
import type { StreakType, WeeklyStats, MilestoneDay } from '../types/streak';
import { MILESTONE_CONFIGS } from '../types/streak';

/**
 * Notification settings interface
 */
interface NotificationSettings {
  enabled: boolean;
  warningTime: string; // 24-hour format, e.g., "20:00"
  weeklySummaryDay: number; // 0-6 (Sunday-Saturday)
  weeklySummaryTime: string; // 24-hour format, e.g., "18:00"
}

/**
 * Default notification settings
 */
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  warningTime: '20:00',
  weeklySummaryDay: 0, // Sunday
  weeklySummaryTime: '18:00',
};

/**
 * Hook for managing streak notifications
 * 
 * Features:
 * - Warning notifications when streak at risk (8pm local time)
 * - Milestone celebration notifications
 * - Broken streak notifications with recovery options
 * - Weekly summary notifications
 * - Integration with companion dialogue
 * 
 * Requirements: Task 3.4 - Notification System
 */
export function useStreakNotifications(settings: Partial<NotificationSettings> = {}) {
  const { streaks, isStreakAtRisk, nextMilestone, streakGoals } = useStreak();
  const { showToast } = useToast();
  const { activeCompanion, addExperience } = useCompanion();
  
  // Merge settings with defaults
  const notificationSettings: NotificationSettings = {
    ...DEFAULT_SETTINGS,
    ...settings,
    enabled: streakGoals.notificationsEnabled ?? DEFAULT_SETTINGS.enabled,
    warningTime: streakGoals.notificationTime ?? DEFAULT_SETTINGS.warningTime,
  };
  
  // Track which milestones we've already notified about
  const notifiedMilestones = useRef<Set<string>>(new Set());
  
  // Track last warning notification time to prevent spam
  const lastWarningTime = useRef<Record<StreakType, number>>({
    login: 0,
    task: 0,
    note: 0,
    focus: 0,
  });
  
  /**
   * Show warning notification for streak at risk
   * Requirements: AC6 - Warning notification if streak at risk
   */
  const showWarningNotification = useCallback((streakType: StreakType, hoursLeft: number) => {
    if (!notificationSettings.enabled) return;
    
    // Prevent duplicate warnings (max 1 per type per day)
    const now = Date.now();
    const lastWarning = lastWarningTime.current[streakType];
    const hoursSinceLastWarning = (now - lastWarning) / (1000 * 60 * 60);
    
    if (hoursSinceLastWarning < 24) {
      return; // Already warned today
    }
    
    lastWarningTime.current[streakType] = now;
    
    // Get companion dialogue for encouragement
    const dialogue = companionDialogueService.getEncouragement(activeCompanion, 0);
    
    // Show toast notification
    showToast({
      type: 'warning',
      message: `⚠️ Your ${streakType} streak is at risk! ${hoursLeft} hours left. ${dialogue}`,
      duration: 6000,
    });
  }, [notificationSettings.enabled, activeCompanion, showToast]);
  
  /**
   * Show milestone celebration notification
   * Requirements: AC6 - Celebration notification on milestone achievements
   */
  const showMilestoneNotification = useCallback((streakType: StreakType, days: MilestoneDay) => {
    if (!notificationSettings.enabled) return;
    
    // Check if we've already notified about this milestone
    const milestoneKey = `${streakType}-${days}`;
    if (notifiedMilestones.current.has(milestoneKey)) {
      return;
    }
    
    notifiedMilestones.current.add(milestoneKey);
    
    // Get milestone config
    const milestoneConfig = MILESTONE_CONFIGS[days];
    
    // Get companion celebration dialogue
    const celebration = companionDialogueService.getCelebration(
      activeCompanion,
      `${days}-day ${streakType} streak`
    );
    
    // Award XP bonus
    addExperience(milestoneConfig.xpBonus);
    
    // Show toast notification with celebration
    showToast({
      type: 'success',
      message: `${milestoneConfig.icon} ${milestoneConfig.name}! ${celebration}`,
      duration: 8000,
    });
  }, [notificationSettings.enabled, activeCompanion, showToast, addExperience]);
  
  /**
   * Show broken streak notification
   * Requirements: AC6 - Notification when streak breaks
   */
  const showBrokenStreakNotification = useCallback((streakType: StreakType, canRecover: boolean) => {
    if (!notificationSettings.enabled) return;
    
    const message = canRecover
      ? `💔 Your ${streakType} streak was broken. You can use a recovery token to restore it!`
      : `💔 Your ${streakType} streak was broken. Keep going - you can start fresh!`;
    
    showToast({
      type: 'error',
      message,
      duration: 7000,
      action: canRecover ? {
        label: 'Recover',
        onClick: () => {
          // This would trigger the recovery modal
          // The actual recovery logic is handled by the modal component
          console.log('Recovery action triggered for', streakType);
        },
      } : undefined,
    });
  }, [notificationSettings.enabled, showToast]);
  
  /**
   * Show streak recovered notification
   * Requirements: AC6 - Notification after successful recovery
   */
  const showRecoveredNotification = useCallback((streakType: StreakType, tokensLeft: number) => {
    if (!notificationSettings.enabled) return;
    
    showToast({
      type: 'success',
      message: `✨ Your ${streakType} streak has been recovered! ${tokensLeft} token${tokensLeft !== 1 ? 's' : ''} remaining.`,
      duration: 6000,
    });
  }, [notificationSettings.enabled, showToast]);
  
  /**
   * Calculate weekly statistics
   */
  const calculateWeeklyStats = useCallback((): WeeklyStats => {
    if (!streaks) {
      return {
        totalTasks: 0,
        totalNotes: 0,
        totalFocusMinutes: 0,
        daysActive: 0,
        activeStreaks: 0,
      };
    }
    
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    let totalTasks = 0;
    let totalNotes = 0;
    let totalFocusMinutes = 0;
    let daysActive = 0;
    
    // Iterate through last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const activity = streaks.activityHistory[dateString];
      if (activity) {
        totalTasks += activity.tasks;
        totalNotes += activity.notes;
        totalFocusMinutes += activity.focusMinutes;
        
        if (activity.login || activity.tasks > 0 || activity.notes > 0 || activity.focusMinutes > 0) {
          daysActive++;
        }
      }
    }
    
    // Count active streaks (current > 0)
    const activeStreaks = [
      streaks.loginStreak.current > 0,
      streaks.taskStreak.current > 0,
      streaks.noteStreak.current > 0,
      streaks.focusStreak.current > 0,
    ].filter(Boolean).length;
    
    return {
      totalTasks,
      totalNotes,
      totalFocusMinutes,
      daysActive,
      activeStreaks,
    };
  }, [streaks]);
  
  /**
   * Show weekly summary notification
   * Requirements: AC6 - Weekly summary of all active streaks
   */
  const showWeeklySummary = useCallback(() => {
    if (!notificationSettings.enabled) return;
    
    const stats = calculateWeeklyStats();
    
    const summary = [
      `📊 Weekly Summary:`,
      `✅ ${stats.totalTasks} tasks completed`,
      `📝 ${stats.totalNotes} notes created`,
      `⏱️ ${stats.totalFocusMinutes} focus minutes`,
      `🔥 ${stats.activeStreaks} active streaks`,
    ].join('\n');
    
    showToast({
      type: 'info',
      message: summary,
      duration: 10000,
    });
  }, [notificationSettings.enabled, calculateWeeklyStats, showToast]);
  
  /**
   * Check if it's time to show warning notifications
   */
  const checkWarningTime = useCallback(() => {
    if (!notificationSettings.enabled || !streaks) return;
    
    const now = new Date();
    const [warningHour, warningMinute] = notificationSettings.warningTime.split(':').map(Number);
    
    // Check if current time matches warning time (within 5 minute window)
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const isWarningTime = 
      currentHour === warningHour && 
      Math.abs(currentMinute - warningMinute) < 5;
    
    if (!isWarningTime) return;
    
    // Check each streak type
    const streakTypes: StreakType[] = ['login', 'task', 'note', 'focus'];
    
    for (const streakType of streakTypes) {
      if (isStreakAtRisk(streakType)) {
        // Calculate hours left until midnight
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        const hoursLeft = Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60 * 60));
        
        showWarningNotification(streakType, hoursLeft);
      }
    }
  }, [notificationSettings, streaks, isStreakAtRisk, showWarningNotification]);
  
  /**
   * Check if it's time to show weekly summary
   */
  const checkWeeklySummaryTime = useCallback(() => {
    if (!notificationSettings.enabled) return;
    
    const now = new Date();
    const currentDay = now.getDay();
    const [summaryHour, summaryMinute] = notificationSettings.weeklySummaryTime.split(':').map(Number);
    
    // Check if current day and time match summary schedule
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const isSummaryTime = 
      currentDay === notificationSettings.weeklySummaryDay &&
      currentHour === summaryHour && 
      Math.abs(currentMinute - summaryMinute) < 5;
    
    if (isSummaryTime) {
      showWeeklySummary();
    }
  }, [notificationSettings, showWeeklySummary]);
  
  /**
   * Check for milestone achievements
   */
  const checkMilestones = useCallback(() => {
    if (!streaks) return;
    
    const streakTypes: StreakType[] = ['login', 'task', 'note', 'focus'];
    
    for (const streakType of streakTypes) {
      const milestone = nextMilestone(streakType);
      
      if (milestone) {
        const streakInfo = streaks[`${streakType}Streak` as keyof typeof streaks] as any;
        
        // Check if we just reached this milestone
        if (streakInfo.current === milestone) {
          showMilestoneNotification(streakType, milestone);
        }
      }
    }
  }, [streaks, nextMilestone, showMilestoneNotification]);
  
  /**
   * Set up periodic checks for notifications
   * Requirements: AC6 - Notification timing
   */
  useEffect(() => {
    if (!notificationSettings.enabled) return;
    
    // Check immediately on mount
    checkWarningTime();
    checkWeeklySummaryTime();
    checkMilestones();
    
    // Set up interval to check every minute
    const interval = setInterval(() => {
      checkWarningTime();
      checkWeeklySummaryTime();
      checkMilestones();
    }, 60 * 1000); // Check every minute
    
    return () => clearInterval(interval);
  }, [notificationSettings.enabled, checkWarningTime, checkWeeklySummaryTime, checkMilestones]);
  
  /**
   * Return notification functions for manual triggering
   */
  return {
    showWarningNotification,
    showMilestoneNotification,
    showBrokenStreakNotification,
    showRecoveredNotification,
    showWeeklySummary,
    calculateWeeklyStats,
  };
}

export default useStreakNotifications;
