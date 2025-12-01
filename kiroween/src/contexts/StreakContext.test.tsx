import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { StreakProvider, useStreak } from './StreakContext';
import type { ReactNode } from 'react';

// Mock dependencies
vi.mock('./AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
  }),
}));

vi.mock('../services/streakStorageService', () => ({
  streakStorageService: {
    loadStreakData: vi.fn().mockResolvedValue(null),
    saveStreakData: vi.fn(),
    forceSync: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('StreakContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <StreakProvider>{children}</StreakProvider>
  );

  it('should initialize with default streak data', async () => {
    const { result } = renderHook(() => useStreak(), { wrapper });

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check that streaks are initialized
    expect(result.current.streaks).toBeDefined();
    // Login streak will be 1 because login activity is recorded on mount
    expect(result.current.streaks?.loginStreak.current).toBeGreaterThanOrEqual(0);
    expect(result.current.streaks?.taskStreak.current).toBe(0);
    expect(result.current.streaks?.noteStreak.current).toBe(0);
    expect(result.current.streaks?.focusStreak.current).toBe(0);
  });

  it('should provide all required functions', async () => {
    const { result } = renderHook(() => useStreak(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check that all functions are available
    expect(typeof result.current.checkStreaks).toBe('function');
    expect(typeof result.current.recordActivity).toBe('function');
    expect(typeof result.current.useRecoveryToken).toBe('function');
    expect(typeof result.current.isStreakAtRisk).toBe('function');
    expect(typeof result.current.nextMilestone).toBe('function');
    expect(typeof result.current.updateStreakGoals).toBe('function');
    expect(typeof result.current.toggleNotifications).toBe('function');
  });

  it('should provide heatmap data', async () => {
    const { result } = renderHook(() => useStreak(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check that heatmap data is an array
    expect(Array.isArray(result.current.heatmapData)).toBe(true);
    // Should have 365 days of data
    expect(result.current.heatmapData.length).toBe(365);
  });

  it('should provide default streak goals', async () => {
    const { result } = renderHook(() => useStreak(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check default goals
    expect(result.current.streakGoals).toBeDefined();
    expect(result.current.streakGoals.taskGoal).toBe(1);
    expect(result.current.streakGoals.focusGoal).toBe(25);
    expect(result.current.streakGoals.notificationsEnabled).toBe(true);
    expect(result.current.streakGoals.notificationTime).toBe('20:00');
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useStreak());
    }).toThrow('useStreak must be used within a StreakProvider');

    consoleSpy.mockRestore();
  });

  it('should record login activity on mount', async () => {
    const { result } = renderHook(() => useStreak(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // After loading, login activity should be recorded
    // Use the same date format as the context (YYYY-MM-DD)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
    const todayActivity = result.current.streaks?.activityHistory[todayString];
    
    expect(todayActivity).toBeDefined();
    expect(todayActivity?.login).toBe(true);
  });
});
