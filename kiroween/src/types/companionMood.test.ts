/**
 * Unit tests for Companion Mood System
 */

import { describe, it, expect } from 'vitest';
import type { MoodState } from './companionMood';
import {
  calculateMood,
  createMoodHistoryEntry,
  initializeCompanionMood,
  updateCompanionMood,
  getRecentMoodHistory,
  getMoodTransitionAnimation
} from './companionMood';

describe('calculateMood', () => {
  it('should return "concerned" when user has been inactive for more than 3 days', () => {
    const mood = calculateMood(0, 0, 4, 0);
    expect(mood).toBe('concerned');
  });

  it('should return "excited" when user has a streak of 7+ days', () => {
    const mood = calculateMood(2, 7, 0, 5);
    expect(mood).toBe('excited');
  });

  it('should return "happy" when user completes 5+ tasks today', () => {
    const mood = calculateMood(5, 3, 0, 2);
    expect(mood).toBe('happy');
  });

  it('should return "energized" when user completes their first task of the day', () => {
    const mood = calculateMood(1, 2, 0, 1);
    expect(mood).toBe('energized');
  });

  it('should return "playful" when user has 10+ interactions today', () => {
    const mood = calculateMood(0, 0, 0, 11);
    expect(mood).toBe('playful');
  });

  it('should return "neutral" as default when no special conditions are met', () => {
    const mood = calculateMood(0, 0, 0, 0);
    expect(mood).toBe('neutral');
  });

  it('should prioritize "concerned" over other moods', () => {
    // Even with high interactions, concerned takes priority
    const mood = calculateMood(0, 0, 5, 15);
    expect(mood).toBe('concerned');
  });

  it('should prioritize "excited" over "happy"', () => {
    // With both streak and tasks, excited takes priority
    const mood = calculateMood(6, 8, 0, 2);
    expect(mood).toBe('excited');
  });
});

describe('createMoodHistoryEntry', () => {
  it('should create a mood history entry with current timestamp', () => {
    const before = Date.now();
    const entry = createMoodHistoryEntry('happy', 'Task completed');
    const after = Date.now();

    expect(entry.mood).toBe('happy');
    expect(entry.trigger).toBe('Task completed');
    expect(entry.timestamp).toBeGreaterThanOrEqual(before);
    expect(entry.timestamp).toBeLessThanOrEqual(after);
  });
});

describe('initializeCompanionMood', () => {
  it('should initialize with neutral mood by default', () => {
    const mood = initializeCompanionMood();

    expect(mood.current).toBe('neutral');
    expect(mood.history).toHaveLength(1);
    expect(mood.history[0].mood).toBe('neutral');
    expect(mood.history[0].trigger).toBe('Initial mood');
  });

  it('should initialize with specified mood', () => {
    const mood = initializeCompanionMood('happy');

    expect(mood.current).toBe('happy');
    expect(mood.history).toHaveLength(1);
    expect(mood.history[0].mood).toBe('happy');
  });

  it('should set lastUpdated to current time', () => {
    const before = Date.now();
    const mood = initializeCompanionMood();
    const after = Date.now();

    expect(mood.lastUpdated).toBeGreaterThanOrEqual(before);
    expect(mood.lastUpdated).toBeLessThanOrEqual(after);
  });
});

describe('updateCompanionMood', () => {
  it('should update mood and add to history', () => {
    const initialMood = initializeCompanionMood('neutral');
    const updatedMood = updateCompanionMood(
      initialMood,
      'happy',
      'Completed 5 tasks'
    );

    expect(updatedMood.current).toBe('happy');
    expect(updatedMood.history).toHaveLength(2);
    expect(updatedMood.history[1].mood).toBe('happy');
    expect(updatedMood.history[1].trigger).toBe('Completed 5 tasks');
  });

  it('should not update if mood is the same', () => {
    const initialMood = initializeCompanionMood('neutral');
    const updatedMood = updateCompanionMood(
      initialMood,
      'neutral',
      'Still neutral'
    );

    expect(updatedMood).toBe(initialMood);
    expect(updatedMood.history).toHaveLength(1);
  });

  it('should trim history when exceeding max length', () => {
    let mood = initializeCompanionMood('neutral');

    // Add 10 mood changes
    for (let i = 0; i < 10; i++) {
      const newMood: MoodState = i % 2 === 0 ? 'happy' : 'neutral';
      mood = updateCompanionMood(mood, newMood, `Change ${i}`, 5);
    }

    // Should only keep last 5 entries
    expect(mood.history.length).toBeLessThanOrEqual(5);
  });

  it('should update lastUpdated timestamp', () => {
    const initialMood = initializeCompanionMood('neutral');
    const before = Date.now();
    const updatedMood = updateCompanionMood(
      initialMood,
      'happy',
      'Task completed'
    );
    const after = Date.now();

    expect(updatedMood.lastUpdated).toBeGreaterThanOrEqual(before);
    expect(updatedMood.lastUpdated).toBeLessThanOrEqual(after);
    expect(updatedMood.lastUpdated).toBeGreaterThanOrEqual(initialMood.lastUpdated);
  });
});

describe('getRecentMoodHistory', () => {
  it('should return the most recent mood entries', () => {
    let mood = initializeCompanionMood('neutral');

    // Add several mood changes
    mood = updateCompanionMood(mood, 'happy', 'Change 1');
    mood = updateCompanionMood(mood, 'excited', 'Change 2');
    mood = updateCompanionMood(mood, 'neutral', 'Change 3');

    const recent = getRecentMoodHistory(mood, 2);

    expect(recent).toHaveLength(2);
    expect(recent[0].mood).toBe('excited');
    expect(recent[1].mood).toBe('neutral');
  });

  it('should return all entries if count exceeds history length', () => {
    const mood = initializeCompanionMood('neutral');
    const recent = getRecentMoodHistory(mood, 10);

    expect(recent).toHaveLength(1);
  });

  it('should default to 10 entries', () => {
    let mood = initializeCompanionMood('neutral');

    // Add 15 mood changes
    for (let i = 0; i < 15; i++) {
      const newMood: MoodState = i % 2 === 0 ? 'happy' : 'neutral';
      mood = updateCompanionMood(mood, newMood, `Change ${i}`);
    }

    const recent = getRecentMoodHistory(mood);

    expect(recent.length).toBeLessThanOrEqual(10);
  });
});

describe('getMoodTransitionAnimation', () => {
  it('should return special animation for concerned to happy transition', () => {
    const animation = getMoodTransitionAnimation('concerned', 'happy');
    expect(animation).toBe('relief-celebration');
  });

  it('should return special animation for neutral to excited transition', () => {
    const animation = getMoodTransitionAnimation('neutral', 'excited');
    expect(animation).toBe('energize');
  });

  it('should return fade animation when transitioning to concerned', () => {
    const animation = getMoodTransitionAnimation('happy', 'concerned');
    expect(animation).toBe('fade-worried');
  });

  it('should return bounce animation when transitioning to excited', () => {
    const animation = getMoodTransitionAnimation('neutral', 'excited');
    expect(animation).toBe('energize');
  });

  it('should return wiggle animation when transitioning to playful', () => {
    const animation = getMoodTransitionAnimation('neutral', 'playful');
    expect(animation).toBe('wiggle-playful');
  });

  it('should return default animation for standard transitions', () => {
    const animation = getMoodTransitionAnimation('neutral', 'happy');
    expect(animation).toBe('smooth-transition');
  });
});
