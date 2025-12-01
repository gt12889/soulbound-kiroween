/**
 * Tests for useActivityHeatmap hook
 * 
 * Requirements: Task 2.1 - Heatmap Data Processing
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  useActivityHeatmap,
  useActivityHeatmapWithUtils,
  calculateActivityLevel,
  generateHeatmapData,
  getActivityStats,
  filterHeatmapByActivity,
  getDayOfWeekDistribution,
  getMostProductiveDayOfWeek,
  getCurrentStreakFromHeatmap,
  getLongestStreakFromHeatmap,
} from './useActivityHeatmap';
import type { ActivityRecord } from '../types/streak';
import { toISODateString } from '../services/streakService';

describe('useActivityHeatmap', () => {
  describe('calculateActivityLevel', () => {
    it('should return 0 for no activity', () => {
      const activity: ActivityRecord = {
        tasks: 0,
        notes: 0,
        focusMinutes: 0,
        login: false,
      };
      expect(calculateActivityLevel(activity)).toBe(0);
    });

    it('should return 1 for light activity (1-2 points)', () => {
      const activity: ActivityRecord = {
        tasks: 1, // 2 points
        notes: 0,
        focusMinutes: 0,
        login: false,
      };
      expect(calculateActivityLevel(activity)).toBe(1);
    });

    it('should return 2 for moderate activity (3-5 points)', () => {
      const activity: ActivityRecord = {
        tasks: 1, // 2 points
        notes: 2, // 2 points
        focusMinutes: 0,
        login: false,
      };
      expect(calculateActivityLevel(activity)).toBe(2);
    });

    it('should return 3 for high activity (6-10 points)', () => {
      const activity: ActivityRecord = {
        tasks: 2, // 4 points
        notes: 1, // 1 point
        focusMinutes: 30, // 2 points (30/15)
        login: false,
      };
      expect(calculateActivityLevel(activity)).toBe(3);
    });

    it('should return 4 for very high activity (11+ points)', () => {
      const activity: ActivityRecord = {
        tasks: 3, // 6 points
        notes: 2, // 2 points
        focusMinutes: 60, // 4 points (60/15)
        login: false,
      };
      expect(calculateActivityLevel(activity)).toBe(4);
    });

    it('should handle focus minutes correctly', () => {
      const activity: ActivityRecord = {
        tasks: 0,
        notes: 0,
        focusMinutes: 14, // Should be 0 points (less than 15)
        login: false,
      };
      expect(calculateActivityLevel(activity)).toBe(0);

      const activity2: ActivityRecord = {
        tasks: 0,
        notes: 0,
        focusMinutes: 15, // Should be 1 point
        login: false,
      };
      expect(calculateActivityLevel(activity2)).toBe(1);
    });
  });

  describe('generateHeatmapData', () => {
    it('should generate data for specified number of days', () => {
      const activityHistory = {};
      const data = generateHeatmapData(activityHistory, 7);
      expect(data).toHaveLength(7);
    });

    it('should generate 365 days by default', () => {
      const activityHistory = {};
      const data = generateHeatmapData(activityHistory);
      expect(data).toHaveLength(365);
    });

    it('should handle missing activity data gracefully', () => {
      const activityHistory = {};
      const data = generateHeatmapData(activityHistory, 7);

      // All days should have level 0 and empty activities
      data.forEach((day) => {
        expect(day.level).toBe(0);
        expect(day.activities.tasks).toBe(0);
        expect(day.activities.notes).toBe(0);
        expect(day.activities.focusMinutes).toBe(0);
      });
    });

    it('should handle null activity history', () => {
      const data = generateHeatmapData(null, 7);
      expect(data).toHaveLength(7);
      expect(data.every((d) => d.level === 0)).toBe(true);
    });

    it('should handle undefined activity history', () => {
      const data = generateHeatmapData(undefined, 7);
      expect(data).toHaveLength(7);
      expect(data.every((d) => d.level === 0)).toBe(true);
    });

    it('should handle invalid days parameter', () => {
      const activityHistory = {};
      
      // Negative days
      const data1 = generateHeatmapData(activityHistory, -5);
      expect(data1).toHaveLength(0);

      // Zero days
      const data2 = generateHeatmapData(activityHistory, 0);
      expect(data2).toHaveLength(0);

      // NaN days
      const data3 = generateHeatmapData(activityHistory, NaN);
      expect(data3).toHaveLength(0);

      // Infinity
      const data4 = generateHeatmapData(activityHistory, Infinity);
      expect(data4).toHaveLength(0);
    });

    it('should handle invalid endDate parameter', () => {
      const activityHistory = {};
      
      // Invalid date should use current date as fallback
      const data = generateHeatmapData(activityHistory, 7, new Date('invalid'));
      expect(data).toHaveLength(7);
      
      // Should have valid dates
      data.forEach((day) => {
        expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('should sanitize malformed activity records', () => {
      const today = new Date();
      const todayString = toISODateString(today);

      const activityHistory = {
        [todayString]: {
          tasks: -5, // Negative number
          notes: NaN, // NaN
          focusMinutes: Infinity, // Infinity
          login: true,
        } as any,
      };

      const data = generateHeatmapData(activityHistory, 7);
      const todayData = data.find((d) => d.date === todayString);

      // All values should be sanitized to 0
      expect(todayData?.activities.tasks).toBe(0);
      expect(todayData?.activities.notes).toBe(0);
      expect(todayData?.activities.focusMinutes).toBe(0);
      expect(todayData?.level).toBe(0);
    });

    it('should handle incomplete activity records', () => {
      const today = new Date();
      const todayString = toISODateString(today);

      const activityHistory = {
        [todayString]: {
          tasks: 2,
          // Missing notes and focusMinutes
        } as any,
      };

      const data = generateHeatmapData(activityHistory, 7);
      const todayData = data.find((d) => d.date === todayString);

      // Should fill in missing values with 0
      expect(todayData?.activities.tasks).toBe(2);
      expect(todayData?.activities.notes).toBe(0);
      expect(todayData?.activities.focusMinutes).toBe(0);
    });

    it('should handle non-integer activity values', () => {
      const today = new Date();
      const todayString = toISODateString(today);

      const activityHistory = {
        [todayString]: {
          tasks: 2.7, // Float
          notes: 1.3, // Float
          focusMinutes: 45.9, // Float
          login: true,
        } as any,
      };

      const data = generateHeatmapData(activityHistory, 7);
      const todayData = data.find((d) => d.date === todayString);

      // Should floor to integers
      expect(todayData?.activities.tasks).toBe(2);
      expect(todayData?.activities.notes).toBe(1);
      expect(todayData?.activities.focusMinutes).toBe(45);
    });

    it('should include existing activity data', () => {
      const today = new Date();
      const todayString = toISODateString(today);

      const activityHistory = {
        [todayString]: {
          tasks: 3,
          notes: 2,
          focusMinutes: 60,
          login: true,
        },
      };

      const data = generateHeatmapData(activityHistory, 7);

      // Find today's data
      const todayData = data.find((d) => d.date === todayString);
      expect(todayData).toBeDefined();
      expect(todayData?.activities.tasks).toBe(3);
      expect(todayData?.activities.notes).toBe(2);
      expect(todayData?.activities.focusMinutes).toBe(60);
      expect(todayData?.level).toBe(4); // 6 + 2 + 4 = 12 points
    });

    it('should generate dates in chronological order', () => {
      const activityHistory = {};
      const data = generateHeatmapData(activityHistory, 7);

      for (let i = 1; i < data.length; i++) {
        const prevDate = new Date(data[i - 1].date);
        const currDate = new Date(data[i].date);
        expect(currDate.getTime()).toBeGreaterThan(prevDate.getTime());
      }
    });
  });

  describe('useActivityHeatmap hook', () => {
    it('should return empty array for undefined activity history', () => {
      const { result } = renderHook(() => useActivityHeatmap(undefined, 7));
      expect(result.current).toHaveLength(7);
      expect(result.current.every((d) => d.level === 0)).toBe(true);
    });

    it('should return empty array for null activity history', () => {
      const { result } = renderHook(() => useActivityHeatmap(null, 7));
      expect(result.current).toHaveLength(7);
      expect(result.current.every((d) => d.level === 0)).toBe(true);
    });

    it('should handle invalid days parameter gracefully', () => {
      const activityHistory = {};

      // Negative days - should use default
      const { result: result1 } = renderHook(() => useActivityHeatmap(activityHistory, -5));
      expect(result1.current).toHaveLength(365);

      // Zero days - should use default
      const { result: result2 } = renderHook(() => useActivityHeatmap(activityHistory, 0));
      expect(result2.current).toHaveLength(365);

      // NaN days - should use default
      const { result: result3 } = renderHook(() => useActivityHeatmap(activityHistory, NaN));
      expect(result3.current).toHaveLength(365);
    });

    it('should handle non-object activity history', () => {
      // String instead of object
      const { result: result1 } = renderHook(() => useActivityHeatmap('invalid' as any, 7));
      expect(result1.current).toHaveLength(7);
      expect(result1.current.every((d) => d.level === 0)).toBe(true);

      // Number instead of object
      const { result: result2 } = renderHook(() => useActivityHeatmap(123 as any, 7));
      expect(result2.current).toHaveLength(7);
      expect(result2.current.every((d) => d.level === 0)).toBe(true);
    });

    it('should handle circular reference in activity history', () => {
      const circular: any = { tasks: 1 };
      circular.self = circular; // Create circular reference

      // Should not crash, should return empty data
      const { result } = renderHook(() => useActivityHeatmap(circular, 7));
      expect(result.current).toHaveLength(7);
    });

    it('should return heatmap data for valid activity history', () => {
      const today = new Date();
      const todayString = toISODateString(today);

      const activityHistory = {
        [todayString]: {
          tasks: 2,
          notes: 1,
          focusMinutes: 30,
          login: true,
        },
      };

      const { result } = renderHook(() => useActivityHeatmap(activityHistory, 7));
      expect(result.current).toHaveLength(7);

      const todayData = result.current.find((d) => d.date === todayString);
      expect(todayData?.level).toBeGreaterThan(0);
    });

    it('should memoize results', () => {
      const activityHistory = {};

      const { result, rerender } = renderHook(
        ({ history, days }) => useActivityHeatmap(history, days),
        {
          initialProps: { history: activityHistory, days: 7 },
        }
      );

      const firstResult = result.current;

      // Rerender with same props
      rerender({ history: activityHistory, days: 7 });

      // Should return same reference (memoized)
      expect(result.current).toBe(firstResult);
    });

    it('should recalculate when activity history changes', () => {
      const activityHistory1 = {};
      const today = new Date();
      const todayString = toISODateString(today);

      const { result, rerender } = renderHook(
        ({ history }) => useActivityHeatmap(history, 7),
        {
          initialProps: { history: activityHistory1 },
        }
      );

      const firstResult = result.current;

      // Update activity history
      const activityHistory2 = {
        [todayString]: {
          tasks: 5,
          notes: 3,
          focusMinutes: 90,
          login: true,
        },
      };

      rerender({ history: activityHistory2 });

      // Should return different reference
      expect(result.current).not.toBe(firstResult);

      // Should have updated data
      const todayData = result.current.find((d) => d.date === todayString);
      expect(todayData?.level).toBe(4);
    });

    it('should not recalculate when activity history reference changes but content is same', () => {
      const today = new Date();
      const todayString = toISODateString(today);

      const activityData = {
        [todayString]: {
          tasks: 2,
          notes: 1,
          focusMinutes: 30,
          login: true,
        },
      };

      const { result, rerender } = renderHook(
        ({ history }) => useActivityHeatmap(history, 7),
        {
          initialProps: { history: activityData },
        }
      );

      const firstResult = result.current;

      // Create a new object with same content
      const activityData2 = {
        [todayString]: {
          tasks: 2,
          notes: 1,
          focusMinutes: 30,
          login: true,
        },
      };

      rerender({ history: activityData2 });

      // Should return same reference (memoized) because content is identical
      expect(result.current).toBe(firstResult);
    });
  });

  describe('useActivityHeatmapWithUtils hook', () => {
    it('should provide memoized utility functions', () => {
      const today = new Date();
      const todayString = toISODateString(today);

      const activityHistory = {
        [todayString]: {
          tasks: 3,
          notes: 2,
          focusMinutes: 60,
          login: true,
        },
      };

      const { result } = renderHook(() =>
        useActivityHeatmapWithUtils(activityHistory, 7)
      );

      // Check that all utilities are provided
      expect(result.current.heatmapData).toBeDefined();
      expect(result.current.stats).toBeDefined();
      expect(result.current.dayOfWeekDistribution).toBeDefined();
      expect(result.current.mostProductiveDayOfWeek).toBeDefined();
      expect(result.current.currentStreak).toBeDefined();
      expect(result.current.longestStreak).toBeDefined();
      expect(result.current.filterByActivity).toBeDefined();

      // Verify stats are calculated correctly
      expect(result.current.stats.activeDays).toBe(1);
      expect(result.current.stats.totalTasks).toBe(3);
      expect(result.current.stats.totalNotes).toBe(2);
      expect(result.current.stats.totalFocusMinutes).toBe(60);
    });

    it('should memoize utility results', () => {
      const activityHistory = {};

      const { result, rerender } = renderHook(
        ({ history, days }) => useActivityHeatmapWithUtils(history, days),
        {
          initialProps: { history: activityHistory, days: 7 },
        }
      );

      const firstStats = result.current.stats;
      const firstDistribution = result.current.dayOfWeekDistribution;
      const firstFilterFn = result.current.filterByActivity;

      // Rerender with same props
      rerender({ history: activityHistory, days: 7 });

      // All memoized values should have same reference
      expect(result.current.stats).toBe(firstStats);
      expect(result.current.dayOfWeekDistribution).toBe(firstDistribution);
      expect(result.current.filterByActivity).toBe(firstFilterFn);
    });

    it('should recalculate utilities when data changes', () => {
      const today = new Date();
      const todayString = toISODateString(today);

      const activityHistory1 = {};

      const { result, rerender } = renderHook(
        ({ history }) => useActivityHeatmapWithUtils(history, 7),
        {
          initialProps: { history: activityHistory1 },
        }
      );

      const firstStats = result.current.stats;

      // Update activity history
      const activityHistory2 = {
        [todayString]: {
          tasks: 5,
          notes: 3,
          focusMinutes: 90,
          login: true,
        },
      };

      rerender({ history: activityHistory2 });

      // Stats should be recalculated
      expect(result.current.stats).not.toBe(firstStats);
      expect(result.current.stats.activeDays).toBe(1);
      expect(result.current.stats.totalTasks).toBe(5);
    });

    it('should provide working filter function', () => {
      const today = new Date();
      const todayString = toISODateString(today);

      const activityHistory = {
        [todayString]: {
          tasks: 3,
          notes: 2,
          focusMinutes: 60,
          login: true,
        },
      };

      const { result } = renderHook(() =>
        useActivityHeatmapWithUtils(activityHistory, 7)
      );

      // Test filter function
      const tasksOnly = result.current.filterByActivity('tasks');
      const todayData = tasksOnly.find((d) => d.date === todayString);
      
      expect(todayData?.level).toBe(3); // 3 tasks * 2 = 6 points = level 3
    });
  });

  describe('getActivityStats', () => {
    it('should return zero stats for empty data', () => {
      const stats = getActivityStats([]);
      expect(stats.totalDays).toBe(0);
      expect(stats.activeDays).toBe(0);
      expect(stats.totalTasks).toBe(0);
      expect(stats.totalNotes).toBe(0);
      expect(stats.totalFocusMinutes).toBe(0);
      expect(stats.averageActivityLevel).toBe(0);
      expect(stats.mostActiveDay).toBeNull();
    });

    it('should calculate correct statistics', () => {
      const activityHistory = {};
      const today = new Date();

      // Add 3 days of activity
      for (let i = 0; i < 3; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = toISODateString(date);

        activityHistory[dateString] = {
          tasks: i + 1,
          notes: i,
          focusMinutes: i * 15,
          login: true,
        };
      }

      const data = generateHeatmapData(activityHistory, 7);
      const stats = getActivityStats(data);

      expect(stats.totalDays).toBe(7);
      expect(stats.activeDays).toBe(3);
      expect(stats.totalTasks).toBe(6); // 1 + 2 + 3
      expect(stats.totalNotes).toBe(3); // 0 + 1 + 2
      expect(stats.totalFocusMinutes).toBe(45); // 0 + 15 + 30
      expect(stats.mostActiveDay).toBeDefined();
    });
  });

  describe('filterHeatmapByActivity', () => {
    it('should return original data for "all" filter', () => {
      const data = generateHeatmapData({}, 7);
      const filtered = filterHeatmapByActivity(data, 'all');
      expect(filtered).toEqual(data);
    });

    it('should filter by tasks only', () => {
      const today = new Date();
      const todayString = toISODateString(today);

      const activityHistory = {
        [todayString]: {
          tasks: 3,
          notes: 2,
          focusMinutes: 60,
          login: true,
        },
      };

      const data = generateHeatmapData(activityHistory, 7);
      const filtered = filterHeatmapByActivity(data, 'tasks');

      const todayData = filtered.find((d) => d.date === todayString);
      expect(todayData?.level).toBe(3); // 3 tasks * 2 = 6 points = level 3
    });

    it('should filter by notes only', () => {
      const today = new Date();
      const todayString = toISODateString(today);

      const activityHistory = {
        [todayString]: {
          tasks: 3,
          notes: 2,
          focusMinutes: 60,
          login: true,
        },
      };

      const data = generateHeatmapData(activityHistory, 7);
      const filtered = filterHeatmapByActivity(data, 'notes');

      const todayData = filtered.find((d) => d.date === todayString);
      expect(todayData?.level).toBe(1); // 2 notes = 2 points = level 1
    });

    it('should filter by focus only', () => {
      const today = new Date();
      const todayString = toISODateString(today);

      const activityHistory = {
        [todayString]: {
          tasks: 3,
          notes: 2,
          focusMinutes: 60,
          login: true,
        },
      };

      const data = generateHeatmapData(activityHistory, 7);
      const filtered = filterHeatmapByActivity(data, 'focus');

      const todayData = filtered.find((d) => d.date === todayString);
      expect(todayData?.level).toBe(2); // 60/15 = 4 points = level 2
    });
  });

  describe('getDayOfWeekDistribution', () => {
    it('should initialize all days of week', () => {
      const data = generateHeatmapData({}, 7);
      const distribution = getDayOfWeekDistribution(data);

      for (let i = 0; i < 7; i++) {
        expect(distribution[i]).toBeDefined();
        expect(distribution[i].count).toBeGreaterThanOrEqual(0);
      }
    });

    it('should calculate correct averages', () => {
      const activityHistory = {};
      const today = new Date();

      // Add activity for a full week
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = toISODateString(date);

        activityHistory[dateString] = {
          tasks: 2,
          notes: 1,
          focusMinutes: 30,
          login: true,
        };
      }

      const data = generateHeatmapData(activityHistory, 7);
      const distribution = getDayOfWeekDistribution(data);

      // Each day should have count of 1 and same activity level
      Object.values(distribution).forEach((day) => {
        expect(day.count).toBe(1);
        expect(day.averageActivityLevel).toBeGreaterThan(0);
      });
    });
  });

  describe('getMostProductiveDayOfWeek', () => {
    it('should return day with highest average activity', () => {
      const activityHistory = {};
      
      // Create a simple pattern where we know which day should win
      // Generate 4 weeks of data
      const endDate = new Date('2024-02-04'); // Sunday
      
      for (let i = 0; i < 28; i++) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        const dateString = toISODateString(date);
        const dayOfWeek = date.getDay();

        // Make Wednesdays (3) the most productive
        const isWednesday = dayOfWeek === 3;

        activityHistory[dateString] = {
          tasks: isWednesday ? 5 : 1,
          notes: isWednesday ? 3 : 1,
          focusMinutes: isWednesday ? 90 : 15,
          login: true,
        };
      }

      const data = generateHeatmapData(activityHistory, 28, endDate);
      const distribution = getDayOfWeekDistribution(data);
      const mostProductiveDay = getMostProductiveDayOfWeek(data);

      // The function should return a valid day of week (0-6)
      expect(mostProductiveDay).toBeGreaterThanOrEqual(0);
      expect(mostProductiveDay).toBeLessThanOrEqual(6);
      
      // The returned day should have the highest average
      const maxAverage = Math.max(...Object.values(distribution).map(d => d.averageActivityLevel));
      expect(distribution[mostProductiveDay].averageActivityLevel).toBe(maxAverage);
    });
  });

  describe('getCurrentStreakFromHeatmap', () => {
    it('should return 0 for no activity', () => {
      const data = generateHeatmapData({}, 7);
      const streak = getCurrentStreakFromHeatmap(data);
      expect(streak).toBe(0);
    });

    it('should count consecutive days from the end', () => {
      const activityHistory = {};
      const today = new Date();

      // Add 3 consecutive days of activity
      for (let i = 0; i < 3; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = toISODateString(date);

        activityHistory[dateString] = {
          tasks: 2,
          notes: 1,
          focusMinutes: 30,
          login: true,
        };
      }

      const data = generateHeatmapData(activityHistory, 7);
      const streak = getCurrentStreakFromHeatmap(data);
      expect(streak).toBe(3);
    });

    it('should stop at first gap', () => {
      const activityHistory = {};
      const today = new Date();

      // Add activity for days 0, 1, 3, 4 (gap at day 2)
      [0, 1, 3, 4].forEach((i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = toISODateString(date);

        activityHistory[dateString] = {
          tasks: 2,
          notes: 1,
          focusMinutes: 30,
          login: true,
        };
      });

      const data = generateHeatmapData(activityHistory, 7);
      const streak = getCurrentStreakFromHeatmap(data);
      expect(streak).toBe(2); // Only counts days 0 and 1
    });
  });

  describe('getLongestStreakFromHeatmap', () => {
    it('should return 0 for no activity', () => {
      const data = generateHeatmapData({}, 7);
      const streak = getLongestStreakFromHeatmap(data);
      expect(streak).toBe(0);
    });

    it('should find longest consecutive streak', () => {
      const activityHistory = {};
      const today = new Date();

      // Create pattern: 3 days, gap, 5 days, gap, 2 days
      const pattern = [0, 1, 2, 4, 5, 6, 7, 8, 10, 11];

      pattern.forEach((i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = toISODateString(date);

        activityHistory[dateString] = {
          tasks: 2,
          notes: 1,
          focusMinutes: 30,
          login: true,
        };
      });

      const data = generateHeatmapData(activityHistory, 15);
      const streak = getLongestStreakFromHeatmap(data);
      expect(streak).toBe(5); // Longest consecutive streak
    });

    it('should handle single day activity', () => {
      const activityHistory = {};
      const today = new Date();
      const todayString = toISODateString(today);

      activityHistory[todayString] = {
        tasks: 2,
        notes: 1,
        focusMinutes: 30,
        login: true,
      };

      const data = generateHeatmapData(activityHistory, 7);
      const streak = getLongestStreakFromHeatmap(data);
      expect(streak).toBe(1);
    });
  });
});
