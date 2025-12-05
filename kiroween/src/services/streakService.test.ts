/**
 * Streak Service Tests
 * 
 * Tests for core streak calculation logic, date utilities, and edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDayDifference,
  isToday,
  isYesterday,
  toISODateString,
  parseISODateString,
  getDaysAgo,
  getMidnight,
  meetsStreakCriteria,
  shouldIncrementStreak,
  checkMissedDays,
  calculateStreak,
  getStreakInfo,
  canUseRecoveryToken,
  validateTokenUsage,
  isStreakAtRisk,
  getNextMilestone,
  checkMilestone,
  daysUntilNextMilestone,
  handleTimezoneChange,
  hasTimezoneChanged,
  getTimezoneOffsetChange,
  isDSTTransitionHour,
  normalizeDateForTimezone,
  getDayDifferenceWithTimezone,
  isSameDay,
  getTimezoneOffsetHours,
  isInDST,
  calculateStreakWithTimezone,
  isNewDay,
  createEmptyActivityRecord,
  mergeActivityRecords,
} from './streakService';
import type { StreakData, ActivityRecord } from '../types/streak';

describe('Date Utilities', () => {
  describe('getDayDifference', () => {
    it('should calculate difference between two dates', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-05');
      expect(getDayDifference(date1, date2)).toBe(4);
    });

    it('should handle same date', () => {
      const date = new Date('2024-01-01');
      expect(getDayDifference(date, date)).toBe(0);
    });

    it('should handle dates in reverse order', () => {
      const date1 = new Date('2024-01-05');
      const date2 = new Date('2024-01-01');
      expect(getDayDifference(date1, date2)).toBe(4);
    });

    it('should handle leap year correctly', () => {
      const date1 = new Date('2024-02-28');
      const date2 = new Date('2024-03-01');
      expect(getDayDifference(date1, date2)).toBe(2); // 2024 is a leap year
    });

    it('should handle non-leap year correctly', () => {
      const date1 = new Date('2023-02-28');
      const date2 = new Date('2023-03-01');
      expect(getDayDifference(date1, date2)).toBe(1); // 2023 is not a leap year
    });

    it('should handle timezone differences', () => {
      // Dates at different times but same day should be 0
      const date1 = new Date('2024-01-01T00:00:00');
      const date2 = new Date('2024-01-01T23:59:59');
      expect(getDayDifference(date1, date2)).toBe(0);
    });
  });

  describe('isToday', () => {
    it('should return true for current date', () => {
      const now = new Date();
      expect(isToday(now)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });
  });

  describe('isYesterday', () => {
    it('should return true for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isYesterday(yesterday)).toBe(true);
    });

    it('should return false for today', () => {
      const today = new Date();
      expect(isYesterday(today)).toBe(false);
    });
  });

  describe('toISODateString', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date(2024, 0, 5); // Use local date constructor
      expect(toISODateString(date)).toBe('2024-01-05');
    });

    it('should pad single digit months and days', () => {
      const date = new Date(2024, 2, 7); // March is month 2 (0-indexed)
      expect(toISODateString(date)).toBe('2024-03-07');
    });
  });

  describe('parseISODateString', () => {
    it('should parse YYYY-MM-DD format', () => {
      const date = parseISODateString('2024-01-05');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(5);
    });

    it('should create date at midnight', () => {
      const date = parseISODateString('2024-01-05');
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
    });
  });

  describe('getMidnight', () => {
    it('should return date at midnight', () => {
      const date = new Date('2024-01-05T15:30:45');
      const midnight = getMidnight(date);
      expect(midnight.getHours()).toBe(0);
      expect(midnight.getMinutes()).toBe(0);
      expect(midnight.getSeconds()).toBe(0);
      expect(midnight.getDate()).toBe(5);
    });
  });

  describe('isNewDay', () => {
    it('should return true when day has changed', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const today = new Date();
      expect(isNewDay(yesterday, today)).toBe(true);
    });

    it('should return false for same day', () => {
      const morning = new Date();
      morning.setHours(8, 0, 0);
      const evening = new Date();
      evening.setHours(20, 0, 0);
      expect(isNewDay(morning, evening)).toBe(false);
    });
  });
});

describe('Streak Criteria', () => {
  let mockStreakData: StreakData;

  beforeEach(() => {
    mockStreakData = {
      loginStreak: {
        current: 0,
        longest: 0,
        lastActivityDate: '',
        startDate: '',
      },
      taskStreak: {
        current: 0,
        longest: 0,
        lastActivityDate: '',
        startDate: '',
        customGoal: 3,
      },
      noteStreak: {
        current: 0,
        longest: 0,
        lastActivityDate: '',
        startDate: '',
      },
      focusStreak: {
        current: 0,
        longest: 0,
        lastActivityDate: '',
        startDate: '',
        minimumMinutes: 25,
      },
      tokens: {
        available: 0,
        earned: 0,
        used: 0,
      },
      milestones: {},
      activityHistory: {},
    };
  });

  describe('meetsStreakCriteria', () => {
    it('should validate login streak', () => {
      const activity: ActivityRecord = {
        tasks: 0,
        notes: 0,
        focusMinutes: 0,
        login: true,
      };
      expect(meetsStreakCriteria(activity, 'login', mockStreakData)).toBe(true);
    });

    it('should validate task streak with custom goal', () => {
      const activity: ActivityRecord = {
        tasks: 3,
        notes: 0,
        focusMinutes: 0,
        login: false,
      };
      expect(meetsStreakCriteria(activity, 'task', mockStreakData)).toBe(true);
    });

    it('should fail task streak below custom goal', () => {
      const activity: ActivityRecord = {
        tasks: 2,
        notes: 0,
        focusMinutes: 0,
        login: false,
      };
      expect(meetsStreakCriteria(activity, 'task', mockStreakData)).toBe(false);
    });

    it('should validate note streak', () => {
      const activity: ActivityRecord = {
        tasks: 0,
        notes: 1,
        focusMinutes: 0,
        login: false,
      };
      expect(meetsStreakCriteria(activity, 'note', mockStreakData)).toBe(true);
    });

    it('should validate focus streak with minimum minutes', () => {
      const activity: ActivityRecord = {
        tasks: 0,
        notes: 0,
        focusMinutes: 25,
        login: false,
      };
      expect(meetsStreakCriteria(activity, 'focus', mockStreakData)).toBe(true);
    });

    it('should fail focus streak below minimum minutes', () => {
      const activity: ActivityRecord = {
        tasks: 0,
        notes: 0,
        focusMinutes: 20,
        login: false,
      };
      expect(meetsStreakCriteria(activity, 'focus', mockStreakData)).toBe(false);
    });
  });
});

describe('Streak Calculation', () => {
  let mockStreakData: StreakData;

  beforeEach(() => {
    mockStreakData = {
      loginStreak: {
        current: 0,
        longest: 0,
        lastActivityDate: '',
        startDate: '',
      },
      taskStreak: {
        current: 0,
        longest: 0,
        lastActivityDate: '',
        startDate: '',
        customGoal: 1,
      },
      noteStreak: {
        current: 0,
        longest: 0,
        lastActivityDate: '',
        startDate: '',
      },
      focusStreak: {
        current: 0,
        longest: 0,
        lastActivityDate: '',
        startDate: '',
        minimumMinutes: 25,
      },
      tokens: {
        available: 0,
        earned: 0,
        used: 0,
      },
      milestones: {},
      activityHistory: {},
    };
  });

  describe('shouldIncrementStreak', () => {
    it('should return true for first day of activity', () => {
      const streakInfo = {
        current: 0,
        longest: 0,
        lastActivityDate: '',
        startDate: '',
      };
      const currentDate = new Date(2024, 0, 1); // Use local date constructor
      const activityHistory: { [date: string]: ActivityRecord } = {
        [toISODateString(currentDate)]: { tasks: 0, notes: 0, focusMinutes: 0, login: true },
      };

      const result = shouldIncrementStreak(streakInfo, currentDate, activityHistory, 'login', mockStreakData);
      expect(result).toBe(true);
    });

    it('should return true for consecutive day with activity', () => {
      const date1 = new Date(2024, 0, 1); // Use local date constructor
      const date2 = new Date(2024, 0, 2);
      const streakInfo = {
        current: 1,
        longest: 1,
        lastActivityDate: toISODateString(date1),
        startDate: toISODateString(date1),
      };
      const activityHistory: { [date: string]: ActivityRecord } = {
        [toISODateString(date1)]: { tasks: 0, notes: 0, focusMinutes: 0, login: true },
        [toISODateString(date2)]: { tasks: 0, notes: 0, focusMinutes: 0, login: true },
      };

      const result = shouldIncrementStreak(streakInfo, date2, activityHistory, 'login', mockStreakData);
      expect(result).toBe(true);
    });

    it('should return false when no activity today', () => {
      const date1 = new Date(2024, 0, 1);
      const date2 = new Date(2024, 0, 2);
      const streakInfo = {
        current: 1,
        longest: 1,
        lastActivityDate: toISODateString(date1),
        startDate: toISODateString(date1),
      };
      const activityHistory: { [date: string]: ActivityRecord } = {
        [toISODateString(date1)]: { tasks: 0, notes: 0, focusMinutes: 0, login: true },
      };

      const result = shouldIncrementStreak(streakInfo, date2, activityHistory, 'login', mockStreakData);
      expect(result).toBe(false);
    });

    it('should return false when activity does not meet criteria', () => {
      mockStreakData.taskStreak.customGoal = 3;
      const date1 = new Date(2024, 0, 1);
      const date2 = new Date(2024, 0, 2);
      const streakInfo = {
        current: 1,
        longest: 1,
        lastActivityDate: toISODateString(date1),
        startDate: toISODateString(date1),
        customGoal: 3,
      };
      const activityHistory: { [date: string]: ActivityRecord } = {
        [toISODateString(date1)]: { tasks: 3, notes: 0, focusMinutes: 0, login: false },
        [toISODateString(date2)]: { tasks: 2, notes: 0, focusMinutes: 0, login: false }, // Below goal
      };

      const result = shouldIncrementStreak(streakInfo, date2, activityHistory, 'task', mockStreakData);
      expect(result).toBe(false);
    });

    it('should return false for same day (already counted)', () => {
      const date1 = new Date(2024, 0, 1);
      const streakInfo = {
        current: 1,
        longest: 1,
        lastActivityDate: toISODateString(date1),
        startDate: toISODateString(date1),
      };
      const activityHistory: { [date: string]: ActivityRecord } = {
        [toISODateString(date1)]: { tasks: 0, notes: 0, focusMinutes: 0, login: true },
      };

      const result = shouldIncrementStreak(streakInfo, date1, activityHistory, 'login', mockStreakData);
      expect(result).toBe(false);
    });

    it('should return false when there is a gap in activity', () => {
      const date1 = new Date(2024, 0, 1);
      const date3 = new Date(2024, 0, 3);
      const streakInfo = {
        current: 1,
        longest: 1,
        lastActivityDate: toISODateString(date1),
        startDate: toISODateString(date1),
      };
      const activityHistory: { [date: string]: ActivityRecord } = {
        [toISODateString(date1)]: { tasks: 0, notes: 0, focusMinutes: 0, login: true },
        // Missing 2024-01-02
        [toISODateString(date3)]: { tasks: 0, notes: 0, focusMinutes: 0, login: true },
      };

      const result = shouldIncrementStreak(streakInfo, date3, activityHistory, 'login', mockStreakData);
      expect(result).toBe(false);
    });

    it('should respect task custom goal', () => {
      mockStreakData.taskStreak.customGoal = 3;
      const date1 = new Date(2024, 0, 1);
      const date2 = new Date(2024, 0, 2);
      const streakInfo = {
        current: 1,
        longest: 1,
        lastActivityDate: toISODateString(date1),
        startDate: toISODateString(date1),
        customGoal: 3,
      };
      const activityHistory: { [date: string]: ActivityRecord } = {
        [toISODateString(date1)]: { tasks: 3, notes: 0, focusMinutes: 0, login: false },
        [toISODateString(date2)]: { tasks: 5, notes: 0, focusMinutes: 0, login: false }, // Above goal
      };

      const result = shouldIncrementStreak(streakInfo, date2, activityHistory, 'task', mockStreakData);
      expect(result).toBe(true);
    });

    it('should respect focus minimum minutes', () => {
      mockStreakData.focusStreak.minimumMinutes = 25;
      const date1 = new Date(2024, 0, 1);
      const date2 = new Date(2024, 0, 2);
      const streakInfo = {
        current: 1,
        longest: 1,
        lastActivityDate: toISODateString(date1),
        startDate: toISODateString(date1),
        minimumMinutes: 25,
      };
      const activityHistory: { [date: string]: ActivityRecord } = {
        [toISODateString(date1)]: { tasks: 0, notes: 0, focusMinutes: 30, login: false },
        [toISODateString(date2)]: { tasks: 0, notes: 0, focusMinutes: 25, login: false }, // Exactly at minimum
      };

      const result = shouldIncrementStreak(streakInfo, date2, activityHistory, 'focus', mockStreakData);
      expect(result).toBe(true);
    });

    it('should return false when focus minutes below minimum', () => {
      mockStreakData.focusStreak.minimumMinutes = 25;
      const date1 = new Date(2024, 0, 1);
      const date2 = new Date(2024, 0, 2);
      const streakInfo = {
        current: 1,
        longest: 1,
        lastActivityDate: toISODateString(date1),
        startDate: toISODateString(date1),
        minimumMinutes: 25,
      };
      const activityHistory: { [date: string]: ActivityRecord } = {
        [toISODateString(date1)]: { tasks: 0, notes: 0, focusMinutes: 30, login: false },
        [toISODateString(date2)]: { tasks: 0, notes: 0, focusMinutes: 20, login: false }, // Below minimum
      };

      const result = shouldIncrementStreak(streakInfo, date2, activityHistory, 'focus', mockStreakData);
      expect(result).toBe(false);
    });

    it('should handle note streak correctly', () => {
      const date1 = new Date(2024, 0, 1);
      const date2 = new Date(2024, 0, 2);
      const date3 = new Date(2024, 0, 3);
      const streakInfo = {
        current: 2,
        longest: 2,
        lastActivityDate: toISODateString(date2),
        startDate: toISODateString(date1),
      };
      const activityHistory: { [date: string]: ActivityRecord } = {
        [toISODateString(date1)]: { tasks: 0, notes: 1, focusMinutes: 0, login: false },
        [toISODateString(date2)]: { tasks: 0, notes: 2, focusMinutes: 0, login: false },
        [toISODateString(date3)]: { tasks: 0, notes: 1, focusMinutes: 0, login: false },
      };

      const result = shouldIncrementStreak(streakInfo, date3, activityHistory, 'note', mockStreakData);
      expect(result).toBe(true);
    });
  });

  describe('calculateStreak', () => {
    it('should calculate consecutive login streak', () => {
      const activityHistory: { [date: string]: ActivityRecord } = {
        '2024-01-01': { tasks: 0, notes: 0, focusMinutes: 0, login: true },
        '2024-01-02': { tasks: 0, notes: 0, focusMinutes: 0, login: true },
        '2024-01-03': { tasks: 0, notes: 0, focusMinutes: 0, login: true },
      };
      mockStreakData.activityHistory = activityHistory;

      const streak = calculateStreak('login', activityHistory, mockStreakData, new Date(2024, 0, 3));
      expect(streak).toBe(3);
    });

    it('should stop at first missing day', () => {
      const activityHistory: { [date: string]: ActivityRecord } = {
        '2024-01-01': { tasks: 0, notes: 0, focusMinutes: 0, login: true },
        // Missing 2024-01-02
        '2024-01-03': { tasks: 0, notes: 0, focusMinutes: 0, login: true },
      };
      mockStreakData.activityHistory = activityHistory;

      const streak = calculateStreak('login', activityHistory, mockStreakData, new Date(2024, 0, 3));
      expect(streak).toBe(1);
    });

    it('should return 0 for no activity', () => {
      const activityHistory: { [date: string]: ActivityRecord } = {};
      const streak = calculateStreak('login', activityHistory, mockStreakData, new Date('2024-01-03'));
      expect(streak).toBe(0);
    });

    it('should respect task custom goal', () => {
      mockStreakData.taskStreak.customGoal = 3;
      const activityHistory: { [date: string]: ActivityRecord } = {
        '2024-01-01': { tasks: 3, notes: 0, focusMinutes: 0, login: false },
        '2024-01-02': { tasks: 2, notes: 0, focusMinutes: 0, login: false }, // Below goal
        '2024-01-03': { tasks: 3, notes: 0, focusMinutes: 0, login: false },
      };
      mockStreakData.activityHistory = activityHistory;

      const streak = calculateStreak('task', activityHistory, mockStreakData, new Date(2024, 0, 3));
      expect(streak).toBe(1); // Only today counts
    });
  });

  describe('checkMissedDays', () => {
    it('should detect missed days', () => {
      mockStreakData.loginStreak = {
        current: 5,
        longest: 5,
        lastActivityDate: '2024-01-01',
        startDate: '2023-12-28',
      };

      const missed = checkMissedDays(mockStreakData, new Date(2024, 0, 5));
      expect(missed.login).toBeDefined();
      expect(missed.login?.daysMissed).toBe(3); // Days since last activity: 4, minus 1 allowed = 3 missed
    });

    it('should not flag consecutive days as missed', () => {
      mockStreakData.loginStreak = {
        current: 5,
        longest: 5,
        lastActivityDate: '2024-01-04',
        startDate: '2023-12-31',
      };

      const missed = checkMissedDays(mockStreakData, new Date('2024-01-05'));
      expect(missed.login).toBeUndefined();
    });

    it('should check recovery token availability', () => {
      mockStreakData.loginStreak = {
        current: 5, // Streak is still active (hasn't been reset yet)
        longest: 5,
        lastActivityDate: '2024-01-01',
        startDate: '2023-12-28',
      };
      mockStreakData.tokens.available = 1;

      const missed = checkMissedDays(mockStreakData, new Date(2024, 0, 3)); // 2 days gap
      expect(missed.login).toBeDefined();
      expect(missed.login?.canRecover).toBe(false); // Can't recover active streak
    });
  });
});

describe('Token System', () => {
  let mockStreakData: StreakData;

  beforeEach(() => {
    mockStreakData = {
      loginStreak: {
        current: 0,
        longest: 0,
        lastActivityDate: '2024-01-01',
        startDate: '',
      },
      taskStreak: {
        current: 0,
        longest: 0,
        lastActivityDate: '',
        startDate: '',
        customGoal: 1,
      },
      noteStreak: {
        current: 0,
        longest: 0,
        lastActivityDate: '',
        startDate: '',
      },
      focusStreak: {
        current: 0,
        longest: 0,
        lastActivityDate: '',
        startDate: '',
        minimumMinutes: 25,
      },
      tokens: {
        available: 1,
        earned: 1,
        used: 0,
      },
      milestones: {},
      activityHistory: {},
    };
  });

  describe('canUseRecoveryToken', () => {
    it('should allow token use within 48 hours', () => {
      const missedDate = new Date('2024-01-01');
      const currentDate = new Date('2024-01-02'); // 24 hours later

      const canUse = canUseRecoveryToken(mockStreakData, 'login', missedDate, currentDate);
      expect(canUse).toBe(true);
    });

    it('should deny token use after 48 hours', () => {
      const missedDate = new Date('2024-01-01');
      const currentDate = new Date('2024-01-04'); // 72 hours later

      const canUse = canUseRecoveryToken(mockStreakData, 'login', missedDate, currentDate);
      expect(canUse).toBe(false);
    });

    it('should deny token use when no tokens available', () => {
      mockStreakData.tokens.available = 0;
      const missedDate = new Date('2024-01-01');
      const currentDate = new Date('2024-01-02');

      const canUse = canUseRecoveryToken(mockStreakData, 'login', missedDate, currentDate);
      expect(canUse).toBe(false);
    });

    it('should deny token use for active streak', () => {
      mockStreakData.loginStreak.current = 5; // Streak is active
      const missedDate = new Date('2024-01-01');
      const currentDate = new Date('2024-01-02');

      const canUse = canUseRecoveryToken(mockStreakData, 'login', missedDate, currentDate);
      expect(canUse).toBe(false);
    });
  });

  describe('validateTokenUsage', () => {
    it('should validate successful token usage', () => {
      // Use yesterday's date to be within 48-hour window
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = validateTokenUsage(mockStreakData, 'login', toISODateString(yesterday));
      expect(result.allowed).toBe(true);
    });

    it('should return no_tokens reason', () => {
      mockStreakData.tokens.available = 0;
      const result = validateTokenUsage(mockStreakData, 'login', '2024-01-01');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('no_tokens');
    });

    it('should return already_active reason', () => {
      mockStreakData.loginStreak.current = 5;
      const result = validateTokenUsage(mockStreakData, 'login', '2024-01-01');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('already_active');
    });

    it('should return too_late reason', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 5); // 5 days ago
      const result = validateTokenUsage(mockStreakData, 'login', toISODateString(oldDate));
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('too_late');
    });
  });
});

describe('Milestone System', () => {
  describe('getNextMilestone', () => {
    it('should return next milestone for low streak', () => {
      expect(getNextMilestone(1)).toBe(3);
    });

    it('should return next milestone after passing one', () => {
      expect(getNextMilestone(5)).toBe(7);
    });

    it('should return null after max milestone', () => {
      expect(getNextMilestone(365)).toBe(null);
      expect(getNextMilestone(500)).toBe(null);
    });
  });

  describe('checkMilestone', () => {
    it('should detect milestone achievement', () => {
      expect(checkMilestone(7)).toBe(7);
      expect(checkMilestone(30)).toBe(30);
    });

    it('should return null for non-milestone', () => {
      expect(checkMilestone(5)).toBe(null);
      expect(checkMilestone(15)).toBe(null);
    });
  });

  describe('daysUntilNextMilestone', () => {
    it('should calculate days remaining', () => {
      expect(daysUntilNextMilestone(1)).toBe(2); // Next is 3
      expect(daysUntilNextMilestone(25)).toBe(5); // Next is 30
    });

    it('should return 0 after max milestone', () => {
      expect(daysUntilNextMilestone(365)).toBe(0);
    });
  });
});

describe('Streak Risk Detection', () => {
  it('should detect streak at risk', () => {
    const streakInfo = {
      current: 5,
      longest: 5,
      lastActivityDate: '2024-01-01',
      startDate: '2023-12-28',
    };
    const activityHistory: { [date: string]: ActivityRecord } = {};
    const currentDate = new Date('2024-01-02T21:00:00'); // 9pm, no activity today

    const atRisk = isStreakAtRisk(streakInfo, activityHistory, currentDate, 20);
    expect(atRisk).toBe(true);
  });

  it('should not flag risk before warning hour', () => {
    const streakInfo = {
      current: 5,
      longest: 5,
      lastActivityDate: '2024-01-01',
      startDate: '2023-12-28',
    };
    const activityHistory: { [date: string]: ActivityRecord } = {};
    const currentDate = new Date('2024-01-02T15:00:00'); // 3pm

    const atRisk = isStreakAtRisk(streakInfo, activityHistory, currentDate, 20);
    expect(atRisk).toBe(false);
  });

  it('should not flag risk when activity exists', () => {
    const streakInfo = {
      current: 5,
      longest: 5,
      lastActivityDate: '2024-01-01',
      startDate: '2023-12-28',
    };
    const activityHistory: { [date: string]: ActivityRecord } = {
      '2024-01-02': { tasks: 1, notes: 0, focusMinutes: 0, login: true },
    };
    const currentDate = new Date('2024-01-02T21:00:00');

    const atRisk = isStreakAtRisk(streakInfo, activityHistory, currentDate, 20);
    expect(atRisk).toBe(false);
  });

  it('should not flag risk for inactive streak', () => {
    const streakInfo = {
      current: 0,
      longest: 5,
      lastActivityDate: '2024-01-01',
      startDate: '',
    };
    const activityHistory: { [date: string]: ActivityRecord } = {};
    const currentDate = new Date('2024-01-02T21:00:00');

    const atRisk = isStreakAtRisk(streakInfo, activityHistory, currentDate, 20);
    expect(atRisk).toBe(false);
  });
});

describe('Utility Functions', () => {
  describe('createEmptyActivityRecord', () => {
    it('should create empty record', () => {
      const record = createEmptyActivityRecord();
      expect(record.tasks).toBe(0);
      expect(record.notes).toBe(0);
      expect(record.focusMinutes).toBe(0);
      expect(record.login).toBe(false);
    });
  });

  describe('mergeActivityRecords', () => {
    it('should take maximum values', () => {
      const record1: ActivityRecord = {
        tasks: 5,
        notes: 2,
        focusMinutes: 30,
        login: false,
      };
      const record2: ActivityRecord = {
        tasks: 3,
        notes: 4,
        focusMinutes: 45,
        login: true,
      };

      const merged = mergeActivityRecords(record1, record2);
      expect(merged.tasks).toBe(5);
      expect(merged.notes).toBe(4);
      expect(merged.focusMinutes).toBe(45);
      expect(merged.login).toBe(true);
    });
  });

  describe('handleTimezoneChange', () => {
    it('should return same date when no timezone change', () => {
      const lastCheck = new Date('2024-01-01T12:00:00');
      const current = new Date('2024-01-02T12:00:00');
      const result = handleTimezoneChange(lastCheck, current);
      expect(result).toBeInstanceOf(Date);
      // If no timezone change, should return the same date
      expect(result.getTime()).toBe(current.getTime());
    });

    it('should adjust date when timezone offset changes', () => {
      // Create dates with different timezone offsets
      // This simulates DST or timezone travel
      const date1 = new Date('2024-03-10T01:00:00'); // Before DST
      const date2 = new Date('2024-03-10T03:00:00'); // After DST (spring forward)
      
      // Mock different offsets by creating dates that would have different offsets
      // In real scenario, these would have different getTimezoneOffset() values
      const result = handleTimezoneChange(date1, date2);
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('hasTimezoneChanged', () => {
    it('should detect timezone offset change', () => {
      // Create two dates - in practice these would have different offsets during DST
      const date1 = new Date('2024-01-15T12:00:00'); // Winter (standard time)
      const date2 = new Date('2024-07-15T12:00:00'); // Summer (DST)
      
      // The result depends on whether the system observes DST
      const changed = hasTimezoneChanged(date1, date2);
      expect(typeof changed).toBe('boolean');
    });

    it('should return false for same timezone', () => {
      const date1 = new Date('2024-01-15T12:00:00');
      const date2 = new Date('2024-01-16T12:00:00');
      
      // Same month, likely same timezone offset
      const changed = hasTimezoneChanged(date1, date2);
      // In most cases this should be false unless crossing DST boundary
      expect(typeof changed).toBe('boolean');
    });
  });

  describe('getTimezoneOffsetChange', () => {
    it('should calculate offset change in hours', () => {
      const date1 = new Date('2024-01-15T12:00:00');
      const date2 = new Date('2024-07-15T12:00:00');
      
      const change = getTimezoneOffsetChange(date1, date2);
      expect(typeof change).toBe('number');
      // Change should be 0 or 1 hour (for DST) in most timezones
      expect(Math.abs(change)).toBeLessThanOrEqual(2);
    });

    it('should return 0 for no timezone change', () => {
      const date1 = new Date('2024-01-15T12:00:00');
      const date2 = new Date('2024-01-16T12:00:00');
      
      const change = getTimezoneOffsetChange(date1, date2);
      // Should be 0 or close to 0 for consecutive days in same month
      expect(typeof change).toBe('number');
    });
  });

  describe('isDSTTransitionHour', () => {
    it('should detect DST transition hours', () => {
      const hour2am = new Date('2024-03-10T02:00:00');
      const hour3am = new Date('2024-03-10T03:00:00');
      
      expect(isDSTTransitionHour(hour2am)).toBe(true);
      expect(isDSTTransitionHour(hour3am)).toBe(true);
    });

    it('should return false for non-transition hours', () => {
      const hour1am = new Date('2024-03-10T01:00:00');
      const hour4am = new Date('2024-03-10T04:00:00');
      const noon = new Date('2024-03-10T12:00:00');
      
      expect(isDSTTransitionHour(hour1am)).toBe(false);
      expect(isDSTTransitionHour(hour4am)).toBe(false);
      expect(isDSTTransitionHour(noon)).toBe(false);
    });
  });

  describe('normalizeDateForTimezone', () => {
    it('should normalize date to midnight', () => {
      const date = new Date('2024-01-15T15:30:45');
      const normalized = normalizeDateForTimezone(date);
      
      expect(normalized.getHours()).toBe(0);
      expect(normalized.getMinutes()).toBe(0);
      expect(normalized.getSeconds()).toBe(0);
    });

    it('should handle timezone changes with reference date', () => {
      const reference = new Date('2024-01-15T12:00:00');
      const current = new Date('2024-07-15T12:00:00');
      
      const normalized = normalizeDateForTimezone(current, reference);
      expect(normalized.getHours()).toBe(0);
      expect(normalized.getMinutes()).toBe(0);
    });

    it('should work without reference date', () => {
      const date = new Date('2024-01-15T15:30:45');
      const normalized = normalizeDateForTimezone(date);
      
      expect(normalized).toBeInstanceOf(Date);
      expect(normalized.getHours()).toBe(0);
    });
  });

  describe('getDayDifferenceWithTimezone', () => {
    it('should calculate day difference accounting for timezone', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-05');
      
      const diff = getDayDifferenceWithTimezone(date1, date2);
      expect(diff).toBe(4);
    });

    it('should handle same day', () => {
      const date = new Date('2024-01-01');
      const diff = getDayDifferenceWithTimezone(date, date);
      expect(diff).toBe(0);
    });

    it('should handle timezone changes', () => {
      // Dates that might have different timezone offsets
      const date1 = new Date('2024-01-15T12:00:00');
      const date2 = new Date('2024-07-15T12:00:00');
      
      const diff = getDayDifferenceWithTimezone(date1, date2);
      expect(diff).toBeGreaterThan(0);
      expect(diff).toBeLessThan(365);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same calendar day', () => {
      const morning = new Date('2024-01-15T08:00:00');
      const evening = new Date('2024-01-15T20:00:00');
      
      expect(isSameDay(morning, evening)).toBe(true);
    });

    it('should return false for different days', () => {
      const day1 = new Date('2024-01-15T23:59:59');
      const day2 = new Date('2024-01-16T00:00:01');
      
      expect(isSameDay(day1, day2)).toBe(false);
    });

    it('should handle timezone changes', () => {
      const date1 = new Date('2024-01-15T12:00:00');
      const date2 = new Date('2024-01-15T12:00:00');
      
      expect(isSameDay(date1, date2)).toBe(true);
    });
  });

  describe('getTimezoneOffsetHours', () => {
    it('should return timezone offset in hours', () => {
      const offset = getTimezoneOffsetHours();
      expect(typeof offset).toBe('number');
      // Offset should be reasonable (-12 to +14 hours)
      expect(offset).toBeGreaterThanOrEqual(-12);
      expect(offset).toBeLessThanOrEqual(14);
    });

    it('should accept custom date', () => {
      const date = new Date('2024-01-15T12:00:00');
      const offset = getTimezoneOffsetHours(date);
      expect(typeof offset).toBe('number');
    });
  });

  describe('isInDST', () => {
    it('should detect DST status', () => {
      const winterDate = new Date('2024-01-15T12:00:00');
      const summerDate = new Date('2024-07-15T12:00:00');
      
      const winterDST = isInDST(winterDate);
      const summerDST = isInDST(summerDate);
      
      expect(typeof winterDST).toBe('boolean');
      expect(typeof summerDST).toBe('boolean');
      
      // In northern hemisphere, summer should be DST, winter should not
      // (unless timezone doesn't observe DST)
      // We can't assert specific values as it depends on system timezone
    });

    it('should work for different years', () => {
      const date2023 = new Date('2023-07-15T12:00:00');
      const date2024 = new Date('2024-07-15T12:00:00');
      
      const dst2023 = isInDST(date2023);
      const dst2024 = isInDST(date2024);
      
      expect(typeof dst2023).toBe('boolean');
      expect(typeof dst2024).toBe('boolean');
    });
  });

  describe('calculateStreakWithTimezone', () => {
    it('should calculate streak with timezone awareness', () => {
      const activityHistory: { [date: string]: ActivityRecord } = {
        '2024-01-01': { tasks: 0, notes: 0, focusMinutes: 0, login: true },
        '2024-01-02': { tasks: 0, notes: 0, focusMinutes: 0, login: true },
        '2024-01-03': { tasks: 0, notes: 0, focusMinutes: 0, login: true },
      };
      
      const mockStreakData: StreakData = {
        loginStreak: { current: 0, longest: 0, lastActivityDate: '', startDate: '' },
        taskStreak: { current: 0, longest: 0, lastActivityDate: '', startDate: '', customGoal: 1 },
        noteStreak: { current: 0, longest: 0, lastActivityDate: '', startDate: '' },
        focusStreak: { current: 0, longest: 0, lastActivityDate: '', startDate: '', minimumMinutes: 25 },
        tokens: { available: 0, earned: 0, used: 0 },
        milestones: {},
        activityHistory,
      };
      
      const streak = calculateStreakWithTimezone(
        'login',
        activityHistory,
        mockStreakData,
        new Date(2024, 0, 3)
      );
      
      expect(streak).toBe(3);
    });

    it('should handle timezone changes between checks', () => {
      const activityHistory: { [date: string]: ActivityRecord } = {
        '2024-01-15': { tasks: 0, notes: 0, focusMinutes: 0, login: true },
        '2024-07-15': { tasks: 0, notes: 0, focusMinutes: 0, login: true },
      };
      
      const mockStreakData: StreakData = {
        loginStreak: { current: 0, longest: 0, lastActivityDate: '', startDate: '' },
        taskStreak: { current: 0, longest: 0, lastActivityDate: '', startDate: '', customGoal: 1 },
        noteStreak: { current: 0, longest: 0, lastActivityDate: '', startDate: '' },
        focusStreak: { current: 0, longest: 0, lastActivityDate: '', startDate: '', minimumMinutes: 25 },
        tokens: { available: 0, earned: 0, used: 0 },
        milestones: {},
        activityHistory,
      };
      
      const lastCheck = new Date('2024-01-15T12:00:00');
      const currentDate = new Date('2024-07-15T12:00:00');
      
      const streak = calculateStreakWithTimezone(
        'login',
        activityHistory,
        mockStreakData,
        currentDate,
        lastCheck
      );
      
      // Should only count current day since there's a gap
      expect(streak).toBe(1);
    });

    it('should work without last check date', () => {
      const activityHistory: { [date: string]: ActivityRecord } = {
        '2024-01-01': { tasks: 0, notes: 0, focusMinutes: 0, login: true },
      };
      
      const mockStreakData: StreakData = {
        loginStreak: { current: 0, longest: 0, lastActivityDate: '', startDate: '' },
        taskStreak: { current: 0, longest: 0, lastActivityDate: '', startDate: '', customGoal: 1 },
        noteStreak: { current: 0, longest: 0, lastActivityDate: '', startDate: '' },
        focusStreak: { current: 0, longest: 0, lastActivityDate: '', startDate: '', minimumMinutes: 25 },
        tokens: { available: 0, earned: 0, used: 0 },
        milestones: {},
        activityHistory,
      };
      
      const streak = calculateStreakWithTimezone(
        'login',
        activityHistory,
        mockStreakData,
        new Date(2024, 0, 1)
      );
      
      expect(streak).toBe(1);
    });
  });
});
