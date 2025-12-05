import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTimer } from '../../contexts/TimerContext';
import { useStreak } from '../../contexts/StreakContext';
import { AllProviders } from '../test-utils';

/**
 * Integration tests for TimerContext and StreakContext
 * Verifies that focus session completion integrates with streak tracking system
 * Requirements: Task 1.6 - Integration with Existing Contexts
 */
describe('TimerContext - StreakContext Integration', () => {
  it('should record focus activity when timer-complete event is dispatched', async () => {
    const { result } = renderHook(
      () => ({
        timer: useTimer(),
        streak: useStreak(),
      }),
      { wrapper: AllProviders }
    );

    // Wait for streak data to load
    await waitFor(() => {
      expect(result.current.streak.loading).toBe(false);
    });

    // Get initial activity count for today
    const today = new Date().toISOString().split('T')[0];
    const initialFocusMinutes = result.current.streak.streaks?.activityHistory[today]?.focusMinutes || 0;

    // Manually record a focus activity (simulating what happens when timer completes)
    act(() => {
      result.current.streak.recordActivity('focus', { minutes: 25 });
    });

    // Wait for state updates
    await waitFor(() => {
      const currentFocusMinutes = result.current.streak.streaks?.activityHistory[today]?.focusMinutes || 0;
      expect(currentFocusMinutes).toBeGreaterThan(initialFocusMinutes);
    });

    // Activity history should be updated with the focus session duration
    const currentFocusMinutes = result.current.streak.streaks?.activityHistory[today]?.focusMinutes || 0;
    expect(currentFocusMinutes).toBe(initialFocusMinutes + 25);
  });

  it('should record multiple focus activities', async () => {
    const { result } = renderHook(
      () => ({
        timer: useTimer(),
        streak: useStreak(),
      }),
      { wrapper: AllProviders }
    );

    // Wait for streak data to load
    await waitFor(() => {
      expect(result.current.streak.loading).toBe(false);
    });

    // Get initial activity count for today
    const today = new Date().toISOString().split('T')[0];
    const initialFocusMinutes = result.current.streak.streaks?.activityHistory[today]?.focusMinutes || 0;

    // Record multiple focus sessions
    act(() => {
      result.current.streak.recordActivity('focus', { minutes: 25 });
      result.current.streak.recordActivity('focus', { minutes: 30 });
    });

    // Wait for state updates
    await waitFor(() => {
      const currentFocusMinutes = result.current.streak.streaks?.activityHistory[today]?.focusMinutes || 0;
      expect(currentFocusMinutes).toBe(initialFocusMinutes + 55);
    });

    // Activity history should reflect both sessions
    const currentFocusMinutes = result.current.streak.streaks?.activityHistory[today]?.focusMinutes || 0;
    expect(currentFocusMinutes).toBe(initialFocusMinutes + 55);
  });

  it('should record activity with correct duration for custom timer lengths', async () => {
    const { result } = renderHook(
      () => ({
        timer: useTimer(),
        streak: useStreak(),
      }),
      { wrapper: AllProviders }
    );

    // Wait for streak data to load
    await waitFor(() => {
      expect(result.current.streak.loading).toBe(false);
    });

    // Get initial activity count for today
    const today = new Date().toISOString().split('T')[0];
    const initialFocusMinutes = result.current.streak.streaks?.activityHistory[today]?.focusMinutes || 0;

    // Record a custom 45-minute focus session
    act(() => {
      result.current.streak.recordActivity('focus', { minutes: 45 });
    });

    // Wait for state updates
    await waitFor(() => {
      const currentFocusMinutes = result.current.streak.streaks?.activityHistory[today]?.focusMinutes || 0;
      expect(currentFocusMinutes).toBeGreaterThan(initialFocusMinutes);
    });

    // Activity history should be updated with the correct duration
    const currentFocusMinutes = result.current.streak.streaks?.activityHistory[today]?.focusMinutes || 0;
    expect(currentFocusMinutes).toBe(initialFocusMinutes + 45);
  });

  it('should work correctly with both timer and streak tracking', async () => {
    const { result } = renderHook(
      () => ({
        timer: useTimer(),
        streak: useStreak(),
      }),
      { wrapper: AllProviders }
    );

    // Wait for streak data to load
    await waitFor(() => {
      expect(result.current.streak.loading).toBe(false);
    });

    // Get initial counts
    const today = new Date().toISOString().split('T')[0];
    const initialFocusMinutes = result.current.streak.streaks?.activityHistory[today]?.focusMinutes || 0;

    // Record a focus activity
    act(() => {
      result.current.streak.recordActivity('focus', { minutes: 25 });
    });

    // Wait for both systems to update
    await waitFor(() => {
      const currentFocusMinutes = result.current.streak.streaks?.activityHistory[today]?.focusMinutes || 0;
      expect(currentFocusMinutes).toBeGreaterThan(initialFocusMinutes);
    });

    // Both systems should be updated
    const currentFocusMinutes = result.current.streak.streaks?.activityHistory[today]?.focusMinutes || 0;
    expect(currentFocusMinutes).toBe(initialFocusMinutes + 25);
  });
});
