import { describe, it, expect } from 'vitest';
import {
  detectMilestoneReached,
  awardTokensForMilestone,
  createEmptyActivityRecord,
  toISODateString,
} from './streakService';
import type { StreakData } from '../types/streak';

/**
 * Integration tests for milestone detection in the streak system
 * Tests that milestone detection and token awarding work together correctly
 * Requirements: Task 3.1 - Milestone detection
 */
describe('Milestone Detection Integration', () => {
  function createTestStreakData(): StreakData {
    const today = toISODateString(new Date());
    
    return {
      loginStreak: {
        current: 0,
        longest: 0,
        lastActivityDate: '',
        startDate: today,
      },
      taskStreak: {
        current: 0,
        longest: 0,
        lastActivityDate: '',
        startDate: today,
        customGoal: 1,
      },
      noteStreak: {
        current: 0,
        longest: 0,
        lastActivityDate: '',
        startDate: today,
      },
      focusStreak: {
        current: 0,
        longest: 0,
        lastActivityDate: '',
        startDate: today,
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
  }

  describe('Milestone detection workflow', () => {
    it('should detect 3-day milestone when streak goes from 2 to 3', () => {
      const milestone = detectMilestoneReached(2, 3);
      expect(milestone).toBe(3);
    });

    it('should detect 7-day milestone when streak goes from 6 to 7', () => {
      const milestone = detectMilestoneReached(6, 7);
      expect(milestone).toBe(7);
    });

    it('should detect 30-day milestone and award 1 token', () => {
      const streakData = createTestStreakData();
      const milestone = detectMilestoneReached(29, 30);
      
      expect(milestone).toBe(30);
      
      const updatedTokens = awardTokensForMilestone(streakData, milestone);
      expect(updatedTokens.available).toBe(1);
      expect(updatedTokens.earned).toBe(1);
    });

    it('should detect 100-day milestone and award 2 tokens', () => {
      const streakData = createTestStreakData();
      const milestone = detectMilestoneReached(99, 100);
      
      expect(milestone).toBe(100);
      
      const updatedTokens = awardTokensForMilestone(streakData, milestone);
      expect(updatedTokens.available).toBe(2);
      expect(updatedTokens.earned).toBe(2);
    });

    it('should detect 365-day milestone and award 3 tokens', () => {
      const streakData = createTestStreakData();
      const milestone = detectMilestoneReached(364, 365);
      
      expect(milestone).toBe(365);
      
      const updatedTokens = awardTokensForMilestone(streakData, milestone);
      expect(updatedTokens.available).toBe(3);
      expect(updatedTokens.earned).toBe(3);
    });

    it('should not detect milestone when no threshold crossed', () => {
      const milestone = detectMilestoneReached(5, 6);
      expect(milestone).toBeNull();
    });

    it('should not award tokens for non-token milestones', () => {
      const streakData = createTestStreakData();
      const milestone = detectMilestoneReached(6, 7);
      
      expect(milestone).toBe(7);
      
      const updatedTokens = awardTokensForMilestone(streakData, milestone);
      expect(updatedTokens.available).toBe(0);
      expect(updatedTokens.earned).toBe(0);
    });
  });

  describe('Token maximum enforcement during milestone awards', () => {
    it('should cap tokens at 3 when awarding would exceed maximum', () => {
      const streakData = createTestStreakData();
      streakData.tokens.available = 2;
      streakData.tokens.earned = 2;
      
      const milestone = detectMilestoneReached(364, 365);
      expect(milestone).toBe(365);
      
      // 365-day milestone awards 3 tokens, but we already have 2
      // Should cap at 3, not go to 5
      const updatedTokens = awardTokensForMilestone(streakData, milestone);
      expect(updatedTokens.available).toBe(3);
      // Earned should only increase by 1 (the amount actually awarded)
      expect(updatedTokens.earned).toBe(3);
    });

    it('should not award tokens if already at maximum', () => {
      const streakData = createTestStreakData();
      streakData.tokens.available = 3;
      streakData.tokens.earned = 3;
      
      const milestone = detectMilestoneReached(29, 30);
      expect(milestone).toBe(30);
      
      const updatedTokens = awardTokensForMilestone(streakData, milestone);
      expect(updatedTokens.available).toBe(3);
      expect(updatedTokens.earned).toBe(3);
    });
  });

  describe('Multiple milestone detection', () => {
    it('should detect first milestone when jumping multiple thresholds', () => {
      // If somehow jumping from 2 to 10, should detect 3 first
      const milestone = detectMilestoneReached(2, 10);
      expect(milestone).toBe(3);
    });

    it('should detect first milestone when jumping from 0 to 7', () => {
      const milestone = detectMilestoneReached(0, 7);
      expect(milestone).toBe(3);
    });

    it('should detect 30-day milestone when jumping from 20 to 35', () => {
      const milestone = detectMilestoneReached(20, 35);
      expect(milestone).toBe(30);
    });
  });

  describe('Edge cases', () => {
    it('should not detect milestone when streak decreases', () => {
      const milestone = detectMilestoneReached(10, 5);
      expect(milestone).toBeNull();
    });

    it('should not detect milestone when already at milestone', () => {
      const milestone = detectMilestoneReached(7, 7);
      expect(milestone).toBeNull();
    });

    it('should not detect milestone when going from milestone to milestone+1', () => {
      const milestone = detectMilestoneReached(7, 8);
      expect(milestone).toBeNull();
    });

    it('should handle streak starting at 0', () => {
      const milestone = detectMilestoneReached(0, 1);
      expect(milestone).toBeNull();
    });

    it('should detect milestone when going from 0 to 3', () => {
      const milestone = detectMilestoneReached(0, 3);
      expect(milestone).toBe(3);
    });
  });

  describe('Complete workflow simulation', () => {
    it('should correctly handle a streak progression with milestones', () => {
      const streakData = createTestStreakData();
      let currentStreak = 0;
      
      // Simulate streak progression
      const progressions = [
        { from: 0, to: 1, expectedMilestone: null, expectedTokens: 0 },
        { from: 1, to: 2, expectedMilestone: null, expectedTokens: 0 },
        { from: 2, to: 3, expectedMilestone: 3, expectedTokens: 0 },
        { from: 3, to: 4, expectedMilestone: null, expectedTokens: 0 },
        { from: 6, to: 7, expectedMilestone: 7, expectedTokens: 0 },
        { from: 13, to: 14, expectedMilestone: 14, expectedTokens: 0 },
        { from: 29, to: 30, expectedMilestone: 30, expectedTokens: 1 },
        { from: 59, to: 60, expectedMilestone: 60, expectedTokens: 0 },
        { from: 99, to: 100, expectedMilestone: 100, expectedTokens: 2 },
        { from: 364, to: 365, expectedMilestone: 365, expectedTokens: 3 },
      ];
      
      for (const { from, to, expectedMilestone, expectedTokens } of progressions) {
        const milestone = detectMilestoneReached(from, to);
        expect(milestone).toBe(expectedMilestone);
        
        if (milestone) {
          streakData.tokens = awardTokensForMilestone(streakData, milestone);
          
          if (expectedTokens > 0) {
            // Check that tokens were awarded correctly
            expect(streakData.tokens.available).toBeLessThanOrEqual(3);
          }
        }
      }
      
      // Final state check
      expect(streakData.tokens.available).toBe(3); // Capped at maximum
    });
  });
});
