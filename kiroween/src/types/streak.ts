/**
 * Streak & Habit Tracking Type Definitions
 * 
 * This module defines all types for the streak tracking system including:
 * - Streak data structures
 * - Activity records
 * - Token system
 * - Milestone configurations
 */

/**
 * Types of activities that can be tracked for streaks
 */
export type ActivityType = 'login' | 'task' | 'note' | 'focus';

/**
 * Types of streaks that can be maintained
 */
export type StreakType = 'login' | 'task' | 'note' | 'focus';

/**
 * Activity intensity levels for heatmap visualization (0-4)
 * 0 = no activity, 4 = very high activity
 */
export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

/**
 * Individual streak configuration and state
 */
export interface StreakInfo {
  /** Current consecutive days */
  current: number;
  /** Longest streak ever achieved */
  longest: number;
  /** ISO date string of last activity (YYYY-MM-DD) */
  lastActivityDate: string;
  /** ISO date string when current streak started */
  startDate: string;
}

/**
 * Task-specific streak with custom goal support
 */
export interface TaskStreakInfo extends StreakInfo {
  /** Minimum tasks per day to maintain streak */
  customGoal: number;
}

/**
 * Focus-specific streak with minimum duration requirement
 */
export interface FocusStreakInfo extends StreakInfo {
  /** Minimum focus minutes per day to maintain streak */
  minimumMinutes: number;
}

/**
 * Token system for streak recovery
 */
export interface TokenData {
  /** Number of tokens currently available to use */
  available: number;
  /** Total tokens earned throughout history */
  earned: number;
  /** Total tokens used throughout history */
  used: number;
}

/**
 * Milestone achievement record
 */
export interface MilestoneData {
  /** Whether this milestone has been achieved */
  achieved: boolean;
  /** ISO date string when milestone was achieved */
  date?: string;
  /** Whether the reward for this milestone has been claimed */
  rewardClaimed: boolean;
}

/**
 * Daily activity record for a specific date
 */
export interface ActivityRecord {
  /** Number of tasks completed */
  tasks: number;
  /** Number of notes created/edited */
  notes: number;
  /** Total focus minutes */
  focusMinutes: number;
  /** Whether user logged in this day */
  login: boolean;
}

/**
 * Complete streak data structure
 */
export interface StreakData {
  /** Login streak tracking */
  loginStreak: StreakInfo;
  /** Task completion streak tracking */
  taskStreak: TaskStreakInfo;
  /** Note creation streak tracking */
  noteStreak: StreakInfo;
  /** Focus session streak tracking */
  focusStreak: FocusStreakInfo;
  /** Streak recovery token system */
  tokens: TokenData;
  /** Milestone achievements (keyed by day count) */
  milestones: {
    [key: number]: MilestoneData;
  };
  /** Historical activity data (keyed by ISO date string YYYY-MM-DD) */
  activityHistory: {
    [date: string]: ActivityRecord;
  };
}

/**
 * Heatmap data for a single day
 */
export interface HeatmapData {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Activity intensity level (0-4) */
  level: ActivityLevel;
  /** Detailed activity breakdown */
  activities: {
    tasks: number;
    notes: number;
    focusMinutes: number;
  };
}

/**
 * Streak notification types
 */
export type StreakNotification =
  | {
      type: 'warning';
      streak: StreakType;
      hoursLeft: number;
    }
  | {
      type: 'milestone';
      streak: StreakType;
      days: number;
    }
  | {
      type: 'broken';
      streak: StreakType;
      canRecover: boolean;
    }
  | {
      type: 'recovered';
      streak: StreakType;
      tokensLeft: number;
    }
  | {
      type: 'weekly-summary';
      stats: WeeklyStats;
    };

/**
 * Weekly statistics summary
 */
export interface WeeklyStats {
  /** Total tasks completed this week */
  totalTasks: number;
  /** Total notes created this week */
  totalNotes: number;
  /** Total focus minutes this week */
  totalFocusMinutes: number;
  /** Days active this week */
  daysActive: number;
  /** Active streaks count */
  activeStreaks: number;
}

/**
 * Streak goals configuration
 */
export interface StreakGoals {
  /** Custom task goal (tasks per day) */
  taskGoal: number;
  /** Minimum focus minutes per day */
  focusGoal: number;
  /** Enable/disable notifications */
  notificationsEnabled: boolean;
  /** Notification time (24-hour format, e.g., "20:00") */
  notificationTime: string;
}

/**
 * Token usage rules and constraints
 */
export const TOKEN_RULES = {
  /** Tokens earned per 30-day milestone */
  milestone30Days: 1,
  /** Tokens earned per 100-day milestone */
  milestone100Days: 2,
  /** Tokens earned per achievement unlock */
  achievementUnlock: 1,
  /** Maximum tokens that can be held */
  maxTokens: 3,
  /** Recovery window in milliseconds (48 hours) */
  recoveryWindow: 48 * 60 * 60 * 1000,
} as const;

/**
 * Milestone day counts and their rewards
 */
export const MILESTONE_DAYS = [3, 7, 14, 30, 60, 100, 365] as const;

/**
 * Type for milestone day values
 */
export type MilestoneDay = typeof MILESTONE_DAYS[number];

/**
 * Reward types that can be earned from milestones
 */
export type MilestoneRewardType = 'xp' | 'token' | 'accessory' | 'achievement' | 'dialogue';

/**
 * Individual milestone reward configuration
 */
export interface MilestoneReward {
  /** Type of reward */
  type: MilestoneRewardType;
  /** Amount or identifier for the reward */
  value: number | string;
  /** Display name for the reward */
  name: string;
  /** Optional description */
  description?: string;
}

/**
 * Complete milestone configuration
 */
export interface MilestoneConfig {
  /** Number of days for this milestone */
  days: MilestoneDay;
  /** Display name for the milestone */
  name: string;
  /** Description of the achievement */
  description: string;
  /** Rewards earned at this milestone */
  rewards: MilestoneReward[];
  /** Whether this milestone awards a token */
  awardsToken: boolean;
  /** XP bonus amount */
  xpBonus: number;
  /** Special companion dialogue key */
  dialogueKey?: string;
  /** Icon or emoji to display */
  icon: string;
}

/**
 * Predefined milestone configurations
 */
export const MILESTONE_CONFIGS: Record<MilestoneDay, MilestoneConfig> = {
  3: {
    days: 3,
    name: 'First Steps',
    description: 'Maintained a streak for 3 consecutive days',
    rewards: [
      { type: 'xp', value: 50, name: 'XP Bonus' },
      { type: 'dialogue', value: 'milestone_3_days', name: 'Special Dialogue' },
    ],
    awardsToken: false,
    xpBonus: 50,
    dialogueKey: 'milestone_3_days',
    icon: '🌱',
  },
  7: {
    days: 7,
    name: 'Week Warrior',
    description: 'Completed a full week streak',
    rewards: [
      { type: 'xp', value: 100, name: 'XP Bonus' },
      { type: 'achievement', value: 'week_warrior', name: 'Week Warrior Badge' },
      { type: 'dialogue', value: 'milestone_7_days', name: 'Special Dialogue' },
    ],
    awardsToken: false,
    xpBonus: 100,
    dialogueKey: 'milestone_7_days',
    icon: '⭐',
  },
  14: {
    days: 14,
    name: 'Fortnight Focus',
    description: 'Two weeks of consistent dedication',
    rewards: [
      { type: 'xp', value: 200, name: 'XP Bonus' },
      { type: 'achievement', value: 'fortnight_focus', name: 'Fortnight Focus Badge' },
      { type: 'dialogue', value: 'milestone_14_days', name: 'Special Dialogue' },
    ],
    awardsToken: false,
    xpBonus: 200,
    dialogueKey: 'milestone_14_days',
    icon: '🔥',
  },
  30: {
    days: 30,
    name: 'Monthly Master',
    description: 'A full month of unwavering commitment',
    rewards: [
      { type: 'xp', value: 500, name: 'XP Bonus' },
      { type: 'token', value: 1, name: 'Streak Recovery Token' },
      { type: 'achievement', value: 'monthly_master', name: 'Monthly Master Badge' },
      { type: 'accessory', value: 'golden_aura', name: 'Golden Aura' },
      { type: 'dialogue', value: 'milestone_30_days', name: 'Special Dialogue' },
    ],
    awardsToken: true,
    xpBonus: 500,
    dialogueKey: 'milestone_30_days',
    icon: '🏆',
  },
  60: {
    days: 60,
    name: 'Dedication Demon',
    description: 'Two months of relentless progress',
    rewards: [
      { type: 'xp', value: 1000, name: 'XP Bonus' },
      { type: 'achievement', value: 'dedication_demon', name: 'Dedication Demon Badge' },
      { type: 'accessory', value: 'flame_crown', name: 'Flame Crown' },
      { type: 'dialogue', value: 'milestone_60_days', name: 'Special Dialogue' },
    ],
    awardsToken: false,
    xpBonus: 1000,
    dialogueKey: 'milestone_60_days',
    icon: '👑',
  },
  100: {
    days: 100,
    name: 'Century Champion',
    description: 'An incredible 100-day streak',
    rewards: [
      { type: 'xp', value: 2000, name: 'XP Bonus' },
      { type: 'token', value: 2, name: 'Streak Recovery Tokens', description: 'Earn 2 tokens' },
      { type: 'achievement', value: 'century_champion', name: 'Century Champion Badge' },
      { type: 'accessory', value: 'legendary_wings', name: 'Legendary Wings' },
      { type: 'dialogue', value: 'milestone_100_days', name: 'Special Dialogue' },
    ],
    awardsToken: true,
    xpBonus: 2000,
    dialogueKey: 'milestone_100_days',
    icon: '💯',
  },
  365: {
    days: 365,
    name: 'Eternal Legend',
    description: 'A full year of perfect dedication',
    rewards: [
      { type: 'xp', value: 10000, name: 'XP Bonus' },
      { type: 'token', value: 3, name: 'Streak Recovery Tokens', description: 'Earn 3 tokens' },
      { type: 'achievement', value: 'eternal_legend', name: 'Eternal Legend Badge' },
      { type: 'accessory', value: 'cosmic_halo', name: 'Cosmic Halo' },
      { type: 'accessory', value: 'time_master_cloak', name: 'Time Master Cloak' },
      { type: 'dialogue', value: 'milestone_365_days', name: 'Special Dialogue' },
    ],
    awardsToken: true,
    xpBonus: 10000,
    dialogueKey: 'milestone_365_days',
    icon: '🌟',
  },
} as const;

/**
 * Milestone progress tracking
 */
export interface MilestoneProgress {
  /** Current streak count */
  currentDays: number;
  /** Next milestone to achieve */
  nextMilestone: MilestoneDay;
  /** Days remaining until next milestone */
  daysRemaining: number;
  /** Progress percentage (0-100) */
  progressPercentage: number;
  /** All achieved milestones */
  achievedMilestones: MilestoneDay[];
}

/**
 * Activity recording metadata
 */
export interface ActivityMetadata {
  /** Type of activity */
  type: ActivityType;
  /** Optional duration in minutes (for focus sessions) */
  minutes?: number;
  /** Timestamp of activity */
  timestamp: Date;
}

/**
 * Token usage validation result
 */
export interface TokenValidation {
  /** Whether token can be used */
  allowed: boolean;
  /** Reason if not allowed */
  reason?: 'no_tokens' | 'too_late' | 'not_broken' | 'already_active';
}

/**
 * Streak recovery request
 */
export interface StreakRecoveryRequest {
  /** Type of streak to recover */
  streakType: StreakType;
  /** Date that was missed (ISO string) */
  missedDate: string;
  /** Token to use for recovery */
  tokenId?: string;
}

/**
 * Streak statistics for display
 */
export interface StreakStatistics {
  /** Total days active across all time */
  totalDaysActive: number;
  /** Average streak length */
  averageStreakLength: number;
  /** Best day of week (0-6, Sunday-Saturday) */
  bestDayOfWeek: number;
  /** Current active streaks count */
  activeStreaksCount: number;
  /** Total milestones achieved */
  totalMilestones: number;
}
