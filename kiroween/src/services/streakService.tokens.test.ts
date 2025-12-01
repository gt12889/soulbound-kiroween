/**
 * Token Economy System Tests
 * 
 * Tests for token earning, usage validation, and recovery window logic
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTokensForMilestone,
  awardTokensForMilestone,
  detectMilestoneReached,
  validateTokenUsageDetailed,
  useRecoveryToken,
  isWithinRecoveryWindow,
  getRecoveryWindowHoursRemaining,
  enforceTokenMaximum,
  canEarnMoreTokens,
  getNextTokenMilestone,
  daysUntilNextToken,
} from './streakService';
import type { StreakData, TokenData } from '../types/streak';

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

describe('Token Earning Rules', () => {
  describe('calculateTokensForMilestone', () => {
    it('should award 1 token for 30-day milestone', () => {
      expect(calculateTokensForMilestone(30)).toBe(1);
    });

    it('should award 2 tokens for 100-day milestone', () => {
      expect(calculateTokensForMilestone(100)).toBe(2);
    });

    it('should award 3 tokens for 365-day milestone', () => {
      expect(calculateTokensForMilestone(365)).toBe(3);
    });

    it('should award 0 tokens for non-token milestones', () => {
      expect(calculateTokensForMilestone(3)).toBe(0);
      expect(calculateTokensForMilestone(7)).toBe(0);
      expect(calculateTokensForMilestone(14)).toBe(0);
      expect(calculateTokensForMilestone(60)).toBe(0);
    });
  });

  describe('awardTokensForMilestone', () => {
    it('should add tokens when below maximum', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
      });

      const result = awardTokensForMilestone(streakData, 30);

      expect(result.available).toBe(2);
      expect(result.earned).toBe(2);
      expect(result.used).toBe(0);
    });

    it('should enforce 3-token maximum', () => {
      const streakData = createMockStreakData({
        tokens: { available: 2, earned: 2, used: 0 },
      });

      const result = awardTokensForMilestone(streakData, 100); // Would award 2 tokens

      expect(result.available).toBe(3); // Capped at 3
      expect(result.earned).toBe(3); // Only 1 actually awarded
    });

    it('should not exceed maximum even with large token award', () => {
      const streakData = createMockStreakData({
        tokens: { available: 3, earned: 3, used: 0 },
      });

      const result = awardTokensForMilestone(streakData, 365); // Would award 3 tokens

      expect(result.available).toBe(3); // Still capped at 3
      expect(result.earned).toBe(3); // No tokens actually awarded
    });

    it('should not change tokens for non-token milestones', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
      });

      const result = awardTokensForMilestone(streakData, 7);

      expect(result.available).toBe(1);
      expect(result.earned).toBe(1);
      expect(result.used).toBe(0);
    });
  });

  describe('detectMilestoneReached', () => {
    it('should detect when crossing a milestone threshold', () => {
      expect(detectMilestoneReached(2, 3)).toBe(3);
      expect(detectMilestoneReached(6, 7)).toBe(7);
      expect(detectMilestoneReached(29, 30)).toBe(30);
    });

    it('should return null when no milestone crossed', () => {
      expect(detectMilestoneReached(5, 6)).toBeNull();
      expect(detectMilestoneReached(10, 12)).toBeNull();
      expect(detectMilestoneReached(50, 55)).toBeNull();
    });

    it('should detect first milestone crossed when multiple passed', () => {
      // If somehow jumping from 2 to 10, should detect 3 first
      expect(detectMilestoneReached(2, 10)).toBe(3);
    });

    it('should return null when streak decreases', () => {
      expect(detectMilestoneReached(10, 5)).toBeNull();
    });

    it('should return null when already at milestone', () => {
      expect(detectMilestoneReached(7, 7)).toBeNull();
    });
  });
});

describe('Token Usage Validation', () => {
  describe('validateTokenUsageDetailed', () => {
    it('should allow token use when all conditions met', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        loginStreak: {
          current: 0, // Broken streak
          longest: 5,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
      });

      const missedDate = '2024-01-02';
      const currentDate = new Date('2024-01-03T12:00:00'); // 36 hours later

      const result = validateTokenUsageDetailed(streakData, 'login', missedDate, currentDate);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject when no tokens available', () => {
      const streakData = createMockStreakData({
        tokens: { available: 0, earned: 0, used: 0 },
        loginStreak: {
          current: 0,
          longest: 5,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
      });

      const result = validateTokenUsageDetailed(streakData, 'login', '2024-01-02');

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('no_tokens');
    });

    it('should reject when streak is still active', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        loginStreak: {
          current: 5, // Active streak
          longest: 5,
          lastActivityDate: '2024-01-05',
          startDate: '2024-01-01',
        },
      });

      const result = validateTokenUsageDetailed(streakData, 'login', '2024-01-02');

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('already_active');
    });

    it('should reject when outside 48-hour window', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        loginStreak: {
          current: 0,
          longest: 5,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
      });

      const missedDate = '2024-01-01';
      const currentDate = new Date('2024-01-04T12:00:00'); // 84 hours later (> 48)

      const result = validateTokenUsageDetailed(streakData, 'login', missedDate, currentDate);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('too_late');
    });

    it('should allow at exactly 48 hours', () => {
      const streakData = createMockStreakData({
        tokens: { available: 1, earned: 1, used: 0 },
        loginStreak: {
          current: 0,
          longest: 5,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
      });

      const missedDate = '2024-01-01';
      const currentDate = new Date('2024-01-03T00:00:00'); // Exactly 48 hours

      const result = validateTokenUsageDetailed(streakData, 'login', missedDate, currentDate);

      expect(result.allowed).toBe(true);
    });
  });

  describe('useRecoveryToken', () => {
    it('should use token and restore streak when valid', () => {
      const streakData = createMockStreakData({
        tokens: { available: 2, earned: 2, used: 0 },
        loginStreak: {
          current: 0,
          longest: 5,
          lastActivityDate: '2024-01-01',
          startDate: '2024-01-01',
        },
        activityHistory: {
          '2024-01-01': { tasks: 1, notes: 0, focusMinutes: 0, login: true },
          '2024-01-02': { tasks: 0, notes: 0, focusMinutes: 0, login: false },
        },
      });

      const currentDate = new Date('2024-01-03T12:00:00'); // 36 hours after missed date
      const result = useRecoveryToken(streakData, 'login', '2024-01-02', currentDate);

      expect(result).not.toBeNull();
      expect(result!.tokens.available).toBe(1);
      expect(result!.tokens.used).toBe(1);
      expect(result!.activityHistory['2024-01-02'].login).toBe(true);
      expect(result!.activityHistory['2024-01-02'].tasks).toBeGreaterThanOrEqual(1);
    });

    it('should return null when validation fails', () => {
      const streakData = createMockStreakData({
        tokens: { available: 0, earned: 0, used: 0 }, // No tokens
        loginStreak: {
          current: 0,
          longest: 5,
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

describe('Recovery Window', () => {
  describe('isWithinRecoveryWindow', () => {
    it('should return true within 48 hours', () => {
      const missedDate = new Date('2024-01-01T00:00:00');
      const currentDate = new Date('2024-01-02T12:00:00'); // 36 hours later

      expect(isWithinRecoveryWindow(missedDate, currentDate)).toBe(true);
    });

    it('should return false after 48 hours', () => {
      const missedDate = new Date('2024-01-01T00:00:00');
      const currentDate = new Date('2024-01-03T12:00:00'); // 60 hours later

      expect(isWithinRecoveryWindow(missedDate, currentDate)).toBe(false);
    });

    it('should return true at exactly 48 hours', () => {
      const missedDate = new Date('2024-01-01T00:00:00');
      const currentDate = new Date('2024-01-03T00:00:00'); // Exactly 48 hours

      expect(isWithinRecoveryWindow(missedDate, currentDate)).toBe(true);
    });
  });

  describe('getRecoveryWindowHoursRemaining', () => {
    it('should calculate remaining hours correctly', () => {
      const missedDate = new Date('2024-01-01T00:00:00');
      const currentDate = new Date('2024-01-02T00:00:00'); // 24 hours later

      expect(getRecoveryWindowHoursRemaining(missedDate, currentDate)).toBe(24);
    });

    it('should return 0 when window expired', () => {
      const missedDate = new Date('2024-01-01T00:00:00');
      const currentDate = new Date('2024-01-05T00:00:00'); // 96 hours later

      expect(getRecoveryWindowHoursRemaining(missedDate, currentDate)).toBe(0);
    });

    it('should handle fractional hours', () => {
      const missedDate = new Date('2024-01-01T00:00:00');
      const currentDate = new Date('2024-01-01T12:00:00'); // 12 hours later

      expect(getRecoveryWindowHoursRemaining(missedDate, currentDate)).toBe(36);
    });
  });
});

describe('Token Maximum Enforcement', () => {
  describe('enforceTokenMaximum', () => {
    it('should cap tokens at 3', () => {
      const tokenData: TokenData = {
        available: 5,
        earned: 5,
        used: 0,
      };

      const result = enforceTokenMaximum(tokenData);

      expect(result.available).toBe(3);
      expect(result.earned).toBe(5); // Earned count unchanged
    });

    it('should not change tokens when below maximum', () => {
      const tokenData: TokenData = {
        available: 2,
        earned: 2,
        used: 0,
      };

      const result = enforceTokenMaximum(tokenData);

      expect(result.available).toBe(2);
    });

    it('should not change tokens when at maximum', () => {
      const tokenData: TokenData = {
        available: 3,
        earned: 3,
        used: 0,
      };

      const result = enforceTokenMaximum(tokenData);

      expect(result.available).toBe(3);
    });
  });

  describe('canEarnMoreTokens', () => {
    it('should return true when below maximum', () => {
      const streakData = createMockStreakData({
        tokens: { available: 2, earned: 2, used: 0 },
      });

      expect(canEarnMoreTokens(streakData)).toBe(true);
    });

    it('should return false when at maximum', () => {
      const streakData = createMockStreakData({
        tokens: { available: 3, earned: 3, used: 0 },
      });

      expect(canEarnMoreTokens(streakData)).toBe(false);
    });

    it('should return true when at 0 tokens', () => {
      const streakData = createMockStreakData({
        tokens: { available: 0, earned: 0, used: 0 },
      });

      expect(canEarnMoreTokens(streakData)).toBe(true);
    });
  });
});

describe('Token Milestone Tracking', () => {
  describe('getNextTokenMilestone', () => {
    it('should return 30 for streaks below 30', () => {
      expect(getNextTokenMilestone(0)).toBe(30);
      expect(getNextTokenMilestone(15)).toBe(30);
      expect(getNextTokenMilestone(29)).toBe(30);
    });

    it('should return 100 for streaks between 30 and 100', () => {
      expect(getNextTokenMilestone(30)).toBe(100);
      expect(getNextTokenMilestone(50)).toBe(100);
      expect(getNextTokenMilestone(99)).toBe(100);
    });

    it('should return 365 for streaks between 100 and 365', () => {
      expect(getNextTokenMilestone(100)).toBe(365);
      expect(getNextTokenMilestone(200)).toBe(365);
      expect(getNextTokenMilestone(364)).toBe(365);
    });

    it('should return null for streaks at or above 365', () => {
      expect(getNextTokenMilestone(365)).toBeNull();
      expect(getNextTokenMilestone(500)).toBeNull();
    });
  });

  describe('daysUntilNextToken', () => {
    it('should calculate days correctly', () => {
      expect(daysUntilNextToken(25)).toBe(5); // 30 - 25
      expect(daysUntilNextToken(90)).toBe(10); // 100 - 90
      expect(daysUntilNextToken(300)).toBe(65); // 365 - 300
    });

    it('should return 0 when no more token milestones', () => {
      expect(daysUntilNextToken(365)).toBe(0);
      expect(daysUntilNextToken(500)).toBe(0);
    });

    it('should handle exact milestone values', () => {
      expect(daysUntilNextToken(30)).toBe(70); // Next is 100
      expect(daysUntilNextToken(100)).toBe(265); // Next is 365
    });
  });
});
