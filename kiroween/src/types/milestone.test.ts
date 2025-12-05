/**
 * Tests for milestone configuration types
 */
import { describe, it, expect } from 'vitest';
import {
  MILESTONE_DAYS,
  MILESTONE_CONFIGS,
  MilestoneDay,
  MilestoneConfig,
  MilestoneProgress,
  MilestoneReward,
} from './streak';

describe('Milestone Configuration Types', () => {
  it('should have all milestone days defined', () => {
    expect(MILESTONE_DAYS).toEqual([3, 7, 14, 30, 60, 100, 365]);
  });

  it('should have configurations for all milestone days', () => {
    MILESTONE_DAYS.forEach((day) => {
      expect(MILESTONE_CONFIGS[day]).toBeDefined();
      expect(MILESTONE_CONFIGS[day].days).toBe(day);
    });
  });

  it('should have valid milestone config structure', () => {
    const config = MILESTONE_CONFIGS[30];
    expect(config).toHaveProperty('days');
    expect(config).toHaveProperty('name');
    expect(config).toHaveProperty('description');
    expect(config).toHaveProperty('rewards');
    expect(config).toHaveProperty('awardsToken');
    expect(config).toHaveProperty('xpBonus');
    expect(config).toHaveProperty('icon');
  });

  it('should award tokens at correct milestones', () => {
    expect(MILESTONE_CONFIGS[3].awardsToken).toBe(false);
    expect(MILESTONE_CONFIGS[7].awardsToken).toBe(false);
    expect(MILESTONE_CONFIGS[14].awardsToken).toBe(false);
    expect(MILESTONE_CONFIGS[30].awardsToken).toBe(true);
    expect(MILESTONE_CONFIGS[60].awardsToken).toBe(false);
    expect(MILESTONE_CONFIGS[100].awardsToken).toBe(true);
    expect(MILESTONE_CONFIGS[365].awardsToken).toBe(true);
  });

  it('should have increasing XP bonuses', () => {
    const xpValues = MILESTONE_DAYS.map((day) => MILESTONE_CONFIGS[day].xpBonus);
    for (let i = 1; i < xpValues.length; i++) {
      expect(xpValues[i]).toBeGreaterThan(xpValues[i - 1]);
    }
  });

  it('should have rewards array for each milestone', () => {
    MILESTONE_DAYS.forEach((day) => {
      const config = MILESTONE_CONFIGS[day];
      expect(Array.isArray(config.rewards)).toBe(true);
      expect(config.rewards.length).toBeGreaterThan(0);
    });
  });

  it('should have valid reward types', () => {
    const validTypes = ['xp', 'token', 'accessory', 'achievement', 'dialogue'];
    MILESTONE_DAYS.forEach((day) => {
      const config = MILESTONE_CONFIGS[day];
      config.rewards.forEach((reward) => {
        expect(validTypes).toContain(reward.type);
        expect(reward).toHaveProperty('value');
        expect(reward).toHaveProperty('name');
      });
    });
  });

  it('should have dialogue keys for all milestones', () => {
    MILESTONE_DAYS.forEach((day) => {
      const config = MILESTONE_CONFIGS[day];
      expect(config.dialogueKey).toBeDefined();
      expect(config.dialogueKey).toMatch(/^milestone_\d+_days$/);
    });
  });

  it('should have unique icons for each milestone', () => {
    const icons = MILESTONE_DAYS.map((day) => MILESTONE_CONFIGS[day].icon);
    const uniqueIcons = new Set(icons);
    expect(uniqueIcons.size).toBe(icons.length);
  });

  it('should type-check milestone progress', () => {
    const progress: MilestoneProgress = {
      currentDays: 25,
      nextMilestone: 30,
      daysRemaining: 5,
      progressPercentage: 83.33,
      achievedMilestones: [3, 7, 14],
    };

    expect(progress.currentDays).toBe(25);
    expect(progress.nextMilestone).toBe(30);
    expect(progress.achievedMilestones).toContain(7);
  });

  it('should type-check milestone rewards', () => {
    const reward: MilestoneReward = {
      type: 'xp',
      value: 100,
      name: 'XP Bonus',
      description: 'Extra experience points',
    };

    expect(reward.type).toBe('xp');
    expect(reward.value).toBe(100);
  });

  it('should have token rewards at 30, 100, and 365 day milestones', () => {
    const milestone30 = MILESTONE_CONFIGS[30];
    const tokenReward30 = milestone30.rewards.find((r) => r.type === 'token');
    expect(tokenReward30).toBeDefined();
    expect(tokenReward30?.value).toBe(1);

    const milestone100 = MILESTONE_CONFIGS[100];
    const tokenReward100 = milestone100.rewards.find((r) => r.type === 'token');
    expect(tokenReward100).toBeDefined();
    expect(tokenReward100?.value).toBe(2);

    const milestone365 = MILESTONE_CONFIGS[365];
    const tokenReward365 = milestone365.rewards.find((r) => r.type === 'token');
    expect(tokenReward365).toBeDefined();
    expect(tokenReward365?.value).toBe(3);
  });
});
