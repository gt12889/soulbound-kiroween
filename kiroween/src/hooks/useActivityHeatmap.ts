/**
 * Activity Heatmap Hook
 * 
 * Processes streak activity data into heatmap visualization format.
 * Generates 365-day activity data with intensity levels (0-4).
 * 
 * Requirements: Task 2.1 - Heatmap Data Processing
 */

import { useMemo, useCallback } from 'react';
import type { HeatmapData, ActivityRecord, ActivityLevel } from '../types/streak';
import { toISODateString, createEmptyActivityRecord } from '../services/streakService';

/**
 * Configuration for activity level calculation
 */
const ACTIVITY_LEVEL_CONFIG = {
  // Weight for each activity type in scoring
  weights: {
    tasks: 2,
    notes: 1,
    focusMinutesPerUnit: 15, // 15 minutes = 1 point
  },
  // Thresholds for activity levels
  thresholds: {
    level1: 2,  // 1-2 points
    level2: 5,  // 3-5 points
    level3: 10, // 6-10 points
    level4: 11, // 11+ points
  },
} as const;

/**
 * Calculate activity level (0-4) based on activity record
 * 
 * Scoring formula:
 * - Each task = 2 points
 * - Each note = 1 point
 * - Every 15 minutes of focus = 1 point
 * 
 * Level mapping:
 * - 0: No activity
 * - 1: 1-2 points (light activity)
 * - 2: 3-5 points (moderate activity)
 * - 3: 6-10 points (high activity)
 * - 4: 11+ points (very high activity)
 * 
 * @param activity - Activity record for a day
 * @returns Activity level (0-4)
 */
export function calculateActivityLevel(activity: ActivityRecord): ActivityLevel {
  const score =
    activity.tasks * ACTIVITY_LEVEL_CONFIG.weights.tasks +
    activity.notes * ACTIVITY_LEVEL_CONFIG.weights.notes +
    Math.floor(activity.focusMinutes / ACTIVITY_LEVEL_CONFIG.weights.focusMinutesPerUnit);

  if (score === 0) return 0;
  if (score <= ACTIVITY_LEVEL_CONFIG.thresholds.level1) return 1;
  if (score <= ACTIVITY_LEVEL_CONFIG.thresholds.level2) return 2;
  if (score <= ACTIVITY_LEVEL_CONFIG.thresholds.level3) return 3;
  return 4;
}

/**
 * Generate heatmap data for a date range
 * 
 * Handles missing data gracefully:
 * - Null/undefined activity history → empty records for all days
 * - Missing dates in history → empty records for those days
 * - Invalid/malformed activity records → sanitized to valid values
 * - Invalid date ranges → returns empty array
 * 
 * @param activityHistory - Historical activity data (can be null/undefined)
 * @param days - Number of days to generate (default 365, must be positive)
 * @param endDate - End date for the range (default today)
 * @returns Array of heatmap data points
 */
export function generateHeatmapData(
  activityHistory: { [date: string]: ActivityRecord } | null | undefined,
  days: number = 365,
  endDate: Date = new Date()
): HeatmapData[] {
  // Handle invalid inputs gracefully
  if (days <= 0 || !Number.isFinite(days)) {
    console.warn('generateHeatmapData: Invalid days parameter, returning empty array');
    return [];
  }

  if (!endDate || !(endDate instanceof Date) || isNaN(endDate.getTime())) {
    console.warn('generateHeatmapData: Invalid endDate parameter, using current date');
    endDate = new Date();
  }

  const data: HeatmapData[] = [];
  const safeActivityHistory = activityHistory || {};

  // Generate data for each day in the range
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);
    const dateString = toISODateString(date);

    // Get activity for this day, or use empty record
    const rawActivity = safeActivityHistory[dateString];
    const activity = sanitizeActivityRecord(rawActivity);

    // Calculate activity level
    const level = calculateActivityLevel(activity);

    data.push({
      date: dateString,
      level,
      activities: {
        tasks: activity.tasks,
        notes: activity.notes,
        focusMinutes: activity.focusMinutes,
      },
    });
  }

  return data;
}

/**
 * Sanitize activity record to ensure all values are valid numbers
 * Handles malformed or incomplete activity records gracefully
 * 
 * @param activity - Raw activity record (may be incomplete or invalid)
 * @returns Sanitized activity record with valid values
 */
function sanitizeActivityRecord(activity: ActivityRecord | null | undefined): ActivityRecord {
  if (!activity) {
    return createEmptyActivityRecord();
  }

  return {
    tasks: sanitizeNumber(activity.tasks),
    notes: sanitizeNumber(activity.notes),
    focusMinutes: sanitizeNumber(activity.focusMinutes),
    login: Boolean(activity.login),
  };
}

/**
 * Sanitize a number value to ensure it's a valid non-negative number
 * 
 * @param value - Value to sanitize
 * @returns Valid non-negative number
 */
function sanitizeNumber(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.floor(value); // Ensure integer
}

/**
 * Hook for processing activity heatmap data with comprehensive memoization
 * 
 * Features:
 * - Generates 365-day activity data
 * - Calculates activity levels (0-4)
 * - Memoized for performance (prevents unnecessary recalculations)
 * - Handles missing data gracefully (null, undefined, empty, malformed)
 * - Provides memoized utility functions
 * 
 * Missing data handling:
 * - Null/undefined activity history → generates empty heatmap
 * - Missing dates → fills with empty activity records
 * - Invalid activity values → sanitizes to valid numbers
 * - Invalid days parameter → uses default (365)
 * 
 * Performance optimizations:
 * - Primary data generation is memoized based on activityHistory and days
 * - Utility functions are memoized to prevent recreation on every render
 * - Deep comparison of activityHistory object to prevent unnecessary updates
 * 
 * @param activityHistory - Historical activity data from StreakContext (can be null/undefined)
 * @param days - Number of days to display (default 365)
 * @returns Memoized heatmap data array
 */
export function useActivityHeatmap(
  activityHistory: { [date: string]: ActivityRecord } | null | undefined,
  days: number = 365
): HeatmapData[] {
  // Sanitize days parameter
  const safeDays = useMemo(() => {
    if (!days || days <= 0 || !Number.isFinite(days)) {
      console.warn('useActivityHeatmap: Invalid days parameter, using default (365)');
      return 365;
    }
    return Math.floor(days); // Ensure integer
  }, [days]);

  // Create a stable reference for the activity history to prevent unnecessary recalculations
  // This uses JSON.stringify as a simple deep comparison mechanism
  // Handles null/undefined gracefully
  const activityHistoryKey = useMemo(() => {
    if (!activityHistory || typeof activityHistory !== 'object') {
      return 'empty';
    }
    try {
      return JSON.stringify(activityHistory);
    } catch (error) {
      console.warn('useActivityHeatmap: Failed to stringify activity history', error);
      return 'error';
    }
  }, [activityHistory]);

  // Memoize heatmap data generation
  // This is the primary expensive operation - generating 365 days of data
  const heatmapData = useMemo(() => {
    try {
      return generateHeatmapData(activityHistory, safeDays);
    } catch (error) {
      console.error('useActivityHeatmap: Error generating heatmap data', error);
      // Return empty array as fallback
      return [];
    }
  }, [activityHistoryKey, safeDays]); // Use the stringified key for deep comparison

  return heatmapData;
}

/**
 * Extended hook that provides memoized utility functions along with heatmap data
 * 
 * This hook is useful when you need to perform multiple operations on the heatmap data
 * without recalculating them on every render.
 * 
 * @param activityHistory - Historical activity data from StreakContext
 * @param days - Number of days to display (default 365)
 * @returns Object containing heatmap data and memoized utility functions
 */
export function useActivityHeatmapWithUtils(
  activityHistory: { [date: string]: ActivityRecord } | undefined,
  days: number = 365
) {
  // Get the base heatmap data (already memoized)
  const heatmapData = useActivityHeatmap(activityHistory, days);

  // Memoize statistics calculation
  const stats = useMemo(() => {
    return getActivityStats(heatmapData);
  }, [heatmapData]);

  // Memoize day of week distribution
  const dayOfWeekDistribution = useMemo(() => {
    return getDayOfWeekDistribution(heatmapData);
  }, [heatmapData]);

  // Memoize most productive day calculation
  const mostProductiveDayOfWeek = useMemo(() => {
    return getMostProductiveDayOfWeek(heatmapData);
  }, [heatmapData]);

  // Memoize current streak calculation
  const currentStreak = useMemo(() => {
    return getCurrentStreakFromHeatmap(heatmapData);
  }, [heatmapData]);

  // Memoize longest streak calculation
  const longestStreak = useMemo(() => {
    return getLongestStreakFromHeatmap(heatmapData);
  }, [heatmapData]);

  // Memoize filter function to prevent recreation
  const filterByActivity = useCallback(
    (activityType: 'tasks' | 'notes' | 'focus' | 'all') => {
      return filterHeatmapByActivity(heatmapData, activityType);
    },
    [heatmapData]
  );

  return {
    heatmapData,
    stats,
    dayOfWeekDistribution,
    mostProductiveDayOfWeek,
    currentStreak,
    longestStreak,
    filterByActivity,
  };
}

/**
 * Get activity statistics from heatmap data
 * 
 * @param heatmapData - Heatmap data array
 * @returns Activity statistics
 */
export function getActivityStats(heatmapData: HeatmapData[]): {
  totalDays: number;
  activeDays: number;
  totalTasks: number;
  totalNotes: number;
  totalFocusMinutes: number;
  averageActivityLevel: number;
  mostActiveDay: HeatmapData | null;
} {
  if (heatmapData.length === 0) {
    return {
      totalDays: 0,
      activeDays: 0,
      totalTasks: 0,
      totalNotes: 0,
      totalFocusMinutes: 0,
      averageActivityLevel: 0,
      mostActiveDay: null,
    };
  }

  let activeDays = 0;
  let totalTasks = 0;
  let totalNotes = 0;
  let totalFocusMinutes = 0;
  let totalActivityLevel = 0;
  let mostActiveDay: HeatmapData | null = null;
  let maxActivityLevel = 0;

  for (const day of heatmapData) {
    if (day.level > 0) {
      activeDays++;
    }

    totalTasks += day.activities.tasks;
    totalNotes += day.activities.notes;
    totalFocusMinutes += day.activities.focusMinutes;
    totalActivityLevel += day.level;

    // Track most active day
    if (day.level > maxActivityLevel) {
      maxActivityLevel = day.level;
      mostActiveDay = day;
    }
  }

  return {
    totalDays: heatmapData.length,
    activeDays,
    totalTasks,
    totalNotes,
    totalFocusMinutes,
    averageActivityLevel: activeDays > 0 ? totalActivityLevel / activeDays : 0,
    mostActiveDay,
  };
}

/**
 * Filter heatmap data by activity type
 * Recalculates levels based only on the specified activity type
 * 
 * @param heatmapData - Original heatmap data
 * @param activityType - Type to filter by ('tasks' | 'notes' | 'focus' | 'all')
 * @returns Filtered heatmap data with recalculated levels
 */
export function filterHeatmapByActivity(
  heatmapData: HeatmapData[],
  activityType: 'tasks' | 'notes' | 'focus' | 'all'
): HeatmapData[] {
  if (activityType === 'all') {
    return heatmapData;
  }

  return heatmapData.map((day) => {
    // Create filtered activity record
    const filteredActivity: ActivityRecord = {
      tasks: activityType === 'tasks' ? day.activities.tasks : 0,
      notes: activityType === 'notes' ? day.activities.notes : 0,
      focusMinutes: activityType === 'focus' ? day.activities.focusMinutes : 0,
      login: false,
    };

    // Recalculate level based on filtered activity
    const level = calculateActivityLevel(filteredActivity);

    return {
      ...day,
      level,
    };
  });
}

/**
 * Get day of week distribution from heatmap data
 * Useful for finding most/least productive days
 * 
 * @param heatmapData - Heatmap data array
 * @returns Activity counts by day of week (0=Sunday, 6=Saturday)
 */
export function getDayOfWeekDistribution(heatmapData: HeatmapData[]): {
  [dayOfWeek: number]: {
    count: number;
    totalActivityLevel: number;
    averageActivityLevel: number;
  };
} {
  const distribution: {
    [dayOfWeek: number]: {
      count: number;
      totalActivityLevel: number;
      averageActivityLevel: number;
    };
  } = {};

  // Initialize all days
  for (let i = 0; i < 7; i++) {
    distribution[i] = {
      count: 0,
      totalActivityLevel: 0,
      averageActivityLevel: 0,
    };
  }

  // Process each day
  for (const day of heatmapData) {
    const date = new Date(day.date);
    const dayOfWeek = date.getDay();

    distribution[dayOfWeek].count++;
    distribution[dayOfWeek].totalActivityLevel += day.level;
  }

  // Calculate averages
  for (let i = 0; i < 7; i++) {
    const data = distribution[i];
    data.averageActivityLevel = data.count > 0 ? data.totalActivityLevel / data.count : 0;
  }

  return distribution;
}

/**
 * Get the most productive day of the week
 * 
 * @param heatmapData - Heatmap data array
 * @returns Day of week (0-6) with highest average activity
 */
export function getMostProductiveDayOfWeek(heatmapData: HeatmapData[]): number {
  const distribution = getDayOfWeekDistribution(heatmapData);

  let mostProductiveDay = 0;
  let highestAverage = 0;

  for (let i = 0; i < 7; i++) {
    if (distribution[i].averageActivityLevel > highestAverage) {
      highestAverage = distribution[i].averageActivityLevel;
      mostProductiveDay = i;
    }
  }

  return mostProductiveDay;
}

/**
 * Get current streak from heatmap data
 * Counts consecutive days with activity from the end
 * 
 * @param heatmapData - Heatmap data array (should be sorted chronologically)
 * @returns Current streak count
 */
export function getCurrentStreakFromHeatmap(heatmapData: HeatmapData[]): number {
  let streak = 0;

  // Walk backward from the end (most recent day)
  for (let i = heatmapData.length - 1; i >= 0; i--) {
    if (heatmapData[i].level > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get longest streak from heatmap data
 * 
 * @param heatmapData - Heatmap data array
 * @returns Longest streak count
 */
export function getLongestStreakFromHeatmap(heatmapData: HeatmapData[]): number {
  let longestStreak = 0;
  let currentStreak = 0;

  for (const day of heatmapData) {
    if (day.level > 0) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return longestStreak;
}
