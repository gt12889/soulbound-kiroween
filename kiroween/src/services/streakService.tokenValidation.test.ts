/**
 * Comprehensive Token Usage Validation Tests
 * 
 * Tests all validation rules and edge cases for token usage
 * Validates: Requirements AC5 - Streak Recovery System
 */

import { describe, it, expect } from 'vitest';
import {
  validateTokenUsage,
  validateTokenUsageDetailed,
  canUseRecoveryToken,
  useRecoveryToken,
  parseISODateString,
} from './streakService';
import type { StreakData } from '../types/streak';

// Helper to create mock streak data
function createMockStreakData(overrides?: Partial<StreakData>): StreakData {
  return {
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
    ...overrides,
  };
}

describe('Token Usage Validation - Comprehensive', () => {
  describe('Rule 1: Token Availability Check', () => {
    it('should reject when user has 0 tokens', () => {
      const streakData = createMockStreakData({
        tokens: { available: 0, earned: 0, used: 0 },
        loginStreak: {
          current: 0,
          longest: 10,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
      });

      const result = validateTokenUsage(streakData, 'login', '2024-01-02');

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('no_tokens');
    });

    it('should allow when user has 1 or more tokens', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        loginStreak: {
          current: 0,
          longest: 10,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
      });

      const currentDate = new Date('2024-01-02T12:00:00');
      const result = validateTokenUsageDetailed(streakData, 'login', '2024-01-02', currentDate);

      expect(result.allowed).toBe(true);
    });

    it('should work with multiple tokens available', () => {
      const streakData = createMockStreakData({
        tokens: { available: 3, earned: 3, used: 0 },
        loginStreak: {
          current: 0,
          longest: 10,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
      });

      const currentDate = new Date('2024-01-02T12:00:00');
      const result = validateTokenUsageDetailed(streakData, 'login', '2024-01-02', currentDate);

      expect(result.allowed).toBe(true);
    });
  });

  describe('Rule 2: Streak Must Be Broken', () => {
    it('should reject when streak is still active (current > 0)', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        loginStreak: {
          current: 5,
          longest: 10,
          lastActivityDate: '2024-01-05',
          startDate: '2024-01-01',
        },
      });

      const result = validateTokenUsage(streakData, 'login', '2024-01-02');

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('already_active');
    });

    it('should allow when streak is broken (current = 0)', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        loginStreak: {
          current: 0,
          longest: 10,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
      });

      const currentDate = new Date('2024-01-02T12:00:00');
      const result = validateTokenUsageDetailed(streakData, 'login', '2024-01-02', currentDate);

      expect(result.allowed).toBe(true);
    });
  });

  describe('Rule 3: 48-Hour Recovery Window', () => {
    it('should allow within 48 hours (1 hour after)', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        loginStreak: {
          current: 0,
          longest: 10,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
      });

      const missedDate = '2024-01-02';
      const currentDate = new Date('2024-01-02T01:00:00');

      const result = validateTokenUsageDetailed(streakData, 'login', missedDate, currentDate);

      expect(result.allowed).toBe(true);
    });

    it('should allow within 48 hours (24 hours after)', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        loginStreak: {
          current: 0,
          longest: 10,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
      });

      const missedDate = '2024-01-02';
      const currentDate = new Date('2024-01-03T00:00:00');

      const result = validateTokenUsageDetailed(streakData, 'login', missedDate, currentDate);

      expect(result.allowed).toBe(true);
    });

    it('should allow at exactly 48 hours', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        loginStreak: {
          current: 0,
          longest: 10,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
      });

      const missedDate = '2024-01-01';
      const currentDate = new Date('2024-01-03T00:00:00'); // Exactly 48 hours

      const result = validateTokenUsageDetailed(streakData, 'login', missedDate, currentDate);

      expect(result.allowed).toBe(true);
    });

    it('should reject after 48 hours (49 hours)', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        loginStreak: {
          current: 0,
          longest: 10,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
      });

      const missedDate = '2024-01-01';
      const currentDate = new Date('2024-01-03T01:00:00'); // 49 hours

      const result = validateTokenUsageDetailed(streakData, 'login', missedDate, currentDate);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('too_late');
    });

    it('should reject after 48 hours (72 hours)', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        loginStreak: {
          current: 0,
          longest: 10,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
      });

      const missedDate = '2024-01-01';
      const currentDate = new Date('2024-01-04T00:00:00'); // 72 hours

      const result = validateTokenUsageDetailed(streakData, 'login', missedDate, currentDate);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('too_late');
    });
  });

  describe('All Validation Rules Combined', () => {
    it('should pass all checks when conditions are met', () => {
      const streakData = createMockStreakData({
        tokens: { available: 2, earned: 2, used: 0 },
        taskStreak: {
          current: 0,
          longest: 15,
          lastActivityDate: '2024-01-10',
          startDate: '2024-01-01',
          customGoal: 3,
        },
      });

      const missedDate = '2024-01-11';
      const currentDate = new Date('2024-01-12T10:00:00'); // 34 hours later

      const result = validateTokenUsageDetailed(streakData, 'task', missedDate, currentDate);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should fail if any single rule is violated (no tokens)', () => {
      const streakData = createMockStreakData({
        tokens: { available: 0, earned: 0, used: 0 }, // FAIL: no tokens
        taskStreak: {
          current: 0, // PASS: streak broken
          longest: 15,
          lastActivityDate: '2024-01-10',
          startDate: '2024-01-01',
          customGoal: 3,
        },
      });

      const missedDate = '2024-01-11';
      const currentDate = new Date('2024-01-12T10:00:00'); // PASS: within 48 hours

      const result = validateTokenUsageDetailed(streakData, 'task', missedDate, currentDate);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('no_tokens');
    });

    it('should fail if any single rule is violated (streak active)', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 }, // PASS: has tokens
        taskStreak: {
          current: 5, // FAIL: streak still active
          longest: 15,
          lastActivityDate: '2024-01-12',
          startDate: '2024-01-01',
          customGoal: 3,
        },
      });

      const missedDate = '2024-01-11';
      const currentDate = new Date('2024-01-12T10:00:00'); // PASS: within 48 hours

      const result = validateTokenUsageDetailed(streakData, 'task', missedDate, currentDate);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('already_active');
    });

    it('should fail if any single rule is violated (too late)', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 }, // PASS: has tokens
        taskStreak: {
          current: 0, // PASS: streak broken
          longest: 15,
          lastActivityDate: '2024-01-10',
          startDate: '2024-01-01',
          customGoal: 3,
        },
      });

      const missedDate = '2024-01-11';
      const currentDate = new Date('2024-01-15T10:00:00'); // FAIL: > 48 hours

      const result = validateTokenUsageDetailed(streakData, 'task', missedDate, currentDate);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('too_late');
    });
  });

  describe('Different Streak Types', () => {
    it('should validate login streak correctly', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        loginStreak: {
          current: 0,
          longest: 20,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
      });

      const currentDate = new Date('2024-01-02T12:00:00');
      const result = validateTokenUsageDetailed(streakData, 'login', '2024-01-02', currentDate);

      expect(result.allowed).toBe(true);
    });

    it('should validate task streak correctly', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        taskStreak: {
          current: 0,
          longest: 20,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
          customGoal: 3,
        },
      });

      const currentDate = new Date('2024-01-02T12:00:00');
      const result = validateTokenUsageDetailed(streakData, 'task', '2024-01-02', currentDate);

      expect(result.allowed).toBe(true);
    });

    it('should validate note streak correctly', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        noteStreak: {
          current: 0,
          longest: 20,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
      });

      const currentDate = new Date('2024-01-02T12:00:00');
      const result = validateTokenUsageDetailed(streakData, 'note', '2024-01-02', currentDate);

      expect(result.allowed).toBe(true);
    });

    it('should validate focus streak correctly', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        focusStreak: {
          current: 0,
          longest: 20,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
          minimumMinutes: 25,
        },
      });

      const currentDate = new Date('2024-01-02T12:00:00');
      const result = validateTokenUsageDetailed(streakData, 'focus', '2024-01-02', currentDate);

      expect(result.allowed).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle validation at midnight boundary', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        loginStreak: {
          current: 0,
          longest: 10,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
      });

      const missedDate = '2024-01-02';
      const currentDate = new Date('2024-01-04T00:00:00'); // Exactly at midnight, 48 hours

      const result = validateTokenUsageDetailed(streakData, 'login', missedDate, currentDate);

      expect(result.allowed).toBe(true);
    });

    it('should handle validation with fractional hours', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        loginStreak: {
          current: 0,
          longest: 10,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
      });

      const missedDate = '2024-01-02';
      const currentDate = new Date('2024-01-03T23:59:59'); // 47 hours, 59 minutes, 59 seconds

      const result = validateTokenUsageDetailed(streakData, 'login', missedDate, currentDate);

      expect(result.allowed).toBe(true);
    });

    it('should handle validation just after 48-hour window', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        loginStreak: {
          current: 0,
          longest: 10,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
      });

      const missedDate = '2024-01-02';
      const currentDate = new Date('2024-01-04T00:00:01'); // 48 hours and 1 second

      const result = validateTokenUsageDetailed(streakData, 'login', missedDate, currentDate);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('too_late');
    });

    it('should handle empty lastActivityDate gracefully', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        loginStreak: {
          current: 0,
          longest: 0,
          lastActivityDate: '', // Empty date
          startDate: '',
        },
      });

      const missedDate = '2024-01-02';
      const currentDate = new Date('2024-01-03T12:00:00');

      const result = validateTokenUsageDetailed(streakData, 'login', missedDate, currentDate);

      // Should still validate based on the missed date provided
      expect(result.allowed).toBe(true);
    });
  });

  describe('Integration with useRecoveryToken', () => {
    it('should successfully use token when validation passes', () => {
      const streakData = createMockStreakData({
        tokens: { available: 2, earned: 2, used: 0 },
        loginStreak: {
          current: 0,
          longest: 10,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
        activityHistory: {
          '2024-01-01': { tasks: 1, notes: 0, focusMinutes: 0, login: true },
          '2024-01-02': { tasks: 0, notes: 0, focusMinutes: 0, login: false },
        },
      });

      const currentDate = new Date('2024-01-03T12:00:00');
      const result = useRecoveryToken(streakData, 'login', '2024-01-02', currentDate);

      expect(result).not.toBeNull();
      expect(result!.tokens.available).toBe(1);
      expect(result!.tokens.used).toBe(1);
    });

    it('should return null when validation fails', () => {
      const streakData = createMockStreakData({
        tokens: { available: 0, earned: 0, used: 0 }, // No tokens
        loginStreak: {
          current: 0,
          longest: 10,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
      });

      const currentDate = new Date('2024-01-03T12:00:00');
      const result = useRecoveryToken(streakData, 'login', '2024-01-02', currentDate);

      expect(result).toBeNull();
    });
  });
});
