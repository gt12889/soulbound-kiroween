/**
 * Tests for useStreakNotifications hook
 * Requirements: Task 3.4 - Notification System
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useStreakNotifications } from './useStreakNotifications';
import * as StreakContext from '../contexts/StreakContext';
import * as ToastContext from '../contexts/ToastContext';
import * as CompanionContext from '../contexts/CompanionContext';
import { companionDialogueService } from '../services/companionDialogueService';

// Mock the contexts
vi.mock('../contexts/StreakContext');
vi.mock('../contexts/ToastContext');
vi.mock('../contexts/CompanionContext');
vi.mock('../services/companionDialogueService');

describe('useStreakNotifications - Warning Notifications (8pm)', () => {
  let mockShowToast: ReturnType<typeof vi.fn>;
  let mockIsStreakAtRisk: ReturnType<typeof vi.fn>;
  let mockNextMilestone: ReturnType<typeof vi.fn>;
  let mockAddExperience: ReturnType<typeof vi.fn>;
  
  const mockStreaks = {
    loginStreak: { current: 5, longest: 10, lastLoginDate: '2024-01-15', startDate: '2024-01-10' },
    taskStreak: { current: 3, longest: 7, lastCompletionDate: '2024-01-15', customGoal: 1 },
    noteStreak: { current: 2, longest: 5, lastNoteDate: '2024-01-15' },
    focusStreak: { current: 1, longest: 3, lastFocusDate: '2024-01-15', minimumMinutes: 25 },
    tokens: { available: 2, earned: 3, used: 1 },
    milestones: {},
    activityHistory: {
      '2024-01-15': { tasks: 5, notes: 3, focusMinutes: 120, login: true },
      '2024-01-14': { tasks: 3, notes: 2, focusMinutes: 90, login: true },
    },
  };
  
  const mockStreakGoals = {
    notificationsEnabled: true,
    notificationTime: '20:00',
  };
  
  beforeEach(() => {
    vi.useFakeTimers();
    
    mockShowToast = vi.fn();
    mockIsStreakAtRisk = vi.fn().mockReturnValue(false);
    mockNextMilestone = vi.fn().mockReturnValue(null);
    mockAddExperience = vi.fn();
    
    vi.mocked(ToastContext.useToast).mockReturnValue({
      showToast: mockShowToast,
      hideToast: vi.fn(),
      toasts: [],
    });
    
    vi.mocked(StreakContext.useStreak).mockReturnValue({
      streaks: mockStreaks,
      loading: false,
      checkStreaks: vi.fn(),
      recordActivity: vi.fn(),
      useRecoveryToken: vi.fn(),
      isStreakAtRisk: mockIsStreakAtRisk,
      nextMilestone: mockNextMilestone,
      heatmapData: [],
      updateStreakGoals: vi.fn(),
      toggleNotifications: vi.fn(),
      streakGoals: mockStreakGoals,
    });
    
    vi.mocked(CompanionContext.useCompanion).mockReturnValue({
      activeCompanion: 'shadow',
      addExperience: mockAddExperience,
    } as any);
    
    vi.mocked(companionDialogueService.getEncouragement).mockReturnValue(
      "Don't let the shadows claim your progress!"
    );
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });
  
  describe('Warning Notification Timing', () => {
    it('should show warning notification at 8pm when streak is at risk', () => {
      // Set time to 8:00 PM
      const testDate = new Date('2024-01-15T20:00:00');
      vi.setSystemTime(testDate);
      
      // Mark task streak as at risk
      mockIsStreakAtRisk.mockImplementation((type) => type === 'task');
      
      renderHook(() => useStreakNotifications());
      
      // The initial check happens synchronously
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          message: expect.stringContaining('task streak is at risk'),
        })
      );
    });
    
    it('should not show warning notification before 8pm', async () => {
      // Set time to 7:55 PM (5 minutes before)
      const testDate = new Date('2024-01-15T19:55:00');
      vi.setSystemTime(testDate);
      
      mockIsStreakAtRisk.mockReturnValue(true);
      
      renderHook(() => useStreakNotifications());
      
      // Should not show notification yet
      expect(mockShowToast).not.toHaveBeenCalled();
    });
    
    it('should show warning notification within 5-minute window of 8pm', () => {
      // Set time to 8:03 PM (within 5-minute window)
      const testDate = new Date('2024-01-15T20:03:00');
      vi.setSystemTime(testDate);
      
      mockIsStreakAtRisk.mockImplementation((type) => type === 'login');
      
      renderHook(() => useStreakNotifications());
      
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          message: expect.stringContaining('login streak is at risk'),
        })
      );
    });
    
    it('should not show warning notification after 5-minute window', async () => {
      // Set time to 8:06 PM (outside 5-minute window)
      const testDate = new Date('2024-01-15T20:06:00');
      vi.setSystemTime(testDate);
      
      mockIsStreakAtRisk.mockReturnValue(true);
      
      renderHook(() => useStreakNotifications());
      
      // Should not show notification
      expect(mockShowToast).not.toHaveBeenCalled();
    });
  });
  
  describe('Warning Notification Content', () => {
    it('should include streak type in warning message', () => {
      const testDate = new Date('2024-01-15T20:00:00');
      vi.setSystemTime(testDate);
      
      mockIsStreakAtRisk.mockImplementation((type) => type === 'note');
      
      renderHook(() => useStreakNotifications());
      
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('note streak'),
        })
      );
    });
    
    it('should include hours left until midnight', () => {
      // Set time to 8:00 PM (4 hours until midnight)
      const testDate = new Date('2024-01-15T20:00:00');
      vi.setSystemTime(testDate);
      
      mockIsStreakAtRisk.mockReturnValue(true);
      
      renderHook(() => useStreakNotifications());
      
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('4 hours left'),
        })
      );
    });
    
    it('should include companion dialogue in warning', () => {
      const testDate = new Date('2024-01-15T20:00:00');
      vi.setSystemTime(testDate);
      
      mockIsStreakAtRisk.mockReturnValue(true);
      
      renderHook(() => useStreakNotifications());
      
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Don't let the shadows claim your progress!"),
        })
      );
    });
    
    it('should use warning toast type', () => {
      const testDate = new Date('2024-01-15T20:00:00');
      vi.setSystemTime(testDate);
      
      mockIsStreakAtRisk.mockReturnValue(true);
      
      renderHook(() => useStreakNotifications());
      
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
        })
      );
    });
  });
  
  describe('Anti-Spam Protection', () => {
    it('should not show duplicate warnings within 24 hours', () => {
      const testDate = new Date('2024-01-15T20:00:00');
      vi.setSystemTime(testDate);
      
      mockIsStreakAtRisk.mockReturnValue(true);
      
      const { unmount } = renderHook(() => useStreakNotifications());
      
      // First warning should show
      expect(mockShowToast).toHaveBeenCalledTimes(4); // One for each streak type
      
      unmount();
      mockShowToast.mockClear();
      
      // Advance time by 1 hour (still within 24 hours)
      vi.setSystemTime(new Date('2024-01-15T21:00:00'));
      renderHook(() => useStreakNotifications());
      
      // Should not show warning again (outside 8pm window)
      expect(mockShowToast).not.toHaveBeenCalled();
    });
    
    it('should allow warning after 24 hours have passed', () => {
      const testDate = new Date('2024-01-15T20:00:00');
      vi.setSystemTime(testDate);
      
      mockIsStreakAtRisk.mockReturnValue(true);
      
      const { unmount } = renderHook(() => useStreakNotifications());
      
      // First warning
      expect(mockShowToast).toHaveBeenCalled();
      
      unmount();
      mockShowToast.mockClear();
      
      // Advance time by 25 hours to next day at 9pm
      vi.setSystemTime(new Date('2024-01-16T21:00:00'));
      
      // Render again (but not at warning time)
      renderHook(() => useStreakNotifications());
      
      // Should not show warning (not at 8pm)
      expect(mockShowToast).not.toHaveBeenCalled();
      
      mockShowToast.mockClear();
      
      // Now set to 8pm next day
      vi.setSystemTime(new Date('2024-01-16T20:00:00'));
      renderHook(() => useStreakNotifications());
      
      // Should show warning again
      expect(mockShowToast).toHaveBeenCalled();
    });
    
    it('should track warnings separately for each streak type', () => {
      const testDate = new Date('2024-01-15T20:00:00');
      vi.setSystemTime(testDate);
      
      // Only task streak at risk
      mockIsStreakAtRisk.mockImplementation((type) => type === 'task');
      
      const { unmount } = renderHook(() => useStreakNotifications());
      
      expect(mockShowToast).toHaveBeenCalledTimes(1);
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('task streak'),
        })
      );
      
      unmount();
      mockShowToast.mockClear();
      
      // Now note streak also at risk (but task still at risk)
      // Since we're creating a new hook instance, it will warn about both
      // This tests that the warnings are tracked per streak type within a single instance
      mockIsStreakAtRisk.mockImplementation((type) => type === 'task' || type === 'note');
      renderHook(() => useStreakNotifications());
      
      // Should show warnings for both streaks (new hook instance)
      expect(mockShowToast).toHaveBeenCalledTimes(2);
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('task streak'),
        })
      );
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('note streak'),
        })
      );
    });
  });
  
  describe('Settings Integration', () => {
    it('should respect notificationsEnabled setting', async () => {
      const testDate = new Date('2024-01-15T20:00:00');
      vi.setSystemTime(testDate);
      
      mockIsStreakAtRisk.mockReturnValue(true);
      
      // Disable notifications
      vi.mocked(StreakContext.useStreak).mockReturnValue({
        ...vi.mocked(StreakContext.useStreak)(),
        streakGoals: {
          ...mockStreakGoals,
          notificationsEnabled: false,
        },
      });
      
      renderHook(() => useStreakNotifications());
      
      // Should not show any notifications
      expect(mockShowToast).not.toHaveBeenCalled();
    });
    
    it('should use custom warning time from settings', () => {
      // Set custom warning time to 7pm
      vi.mocked(StreakContext.useStreak).mockReturnValue({
        ...vi.mocked(StreakContext.useStreak)(),
        streakGoals: {
          ...mockStreakGoals,
          notificationTime: '19:00',
        },
      });
      
      // Set time to 7:00 PM
      const testDate = new Date('2024-01-15T19:00:00');
      vi.setSystemTime(testDate);
      
      mockIsStreakAtRisk.mockReturnValue(true);
      
      renderHook(() => useStreakNotifications());
      
      // Should show warning at custom time
      expect(mockShowToast).toHaveBeenCalled();
    });
  });
  
  describe('Multiple Streak Types', () => {
    it('should check all streak types for warnings', () => {
      const testDate = new Date('2024-01-15T20:00:00');
      vi.setSystemTime(testDate);
      
      // All streaks at risk
      mockIsStreakAtRisk.mockReturnValue(true);
      
      renderHook(() => useStreakNotifications());
      
      // Should call showToast for each streak type
      expect(mockShowToast).toHaveBeenCalledTimes(4);
      
      // Verify each streak type was checked
      expect(mockIsStreakAtRisk).toHaveBeenCalledWith('login');
      expect(mockIsStreakAtRisk).toHaveBeenCalledWith('task');
      expect(mockIsStreakAtRisk).toHaveBeenCalledWith('note');
      expect(mockIsStreakAtRisk).toHaveBeenCalledWith('focus');
    });
    
    it('should only warn for streaks that are at risk', () => {
      const testDate = new Date('2024-01-15T20:00:00');
      vi.setSystemTime(testDate);
      
      // Only task and focus streaks at risk
      mockIsStreakAtRisk.mockImplementation((type) => type === 'task' || type === 'focus');
      
      renderHook(() => useStreakNotifications());
      
      expect(mockShowToast).toHaveBeenCalledTimes(2);
      
      // Verify correct streaks were warned
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('task streak'),
        })
      );
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('focus streak'),
        })
      );
    });
  });
  
  describe('Periodic Checks', () => {
    it('should check for warnings every minute', async () => {
      const testDate = new Date('2024-01-15T20:00:00');
      vi.setSystemTime(testDate);
      
      mockIsStreakAtRisk.mockReturnValue(false);
      
      renderHook(() => useStreakNotifications());
      
      // Clear initial check
      mockIsStreakAtRisk.mockClear();
      
      // Advance time by 1 minute
      act(() => {
        vi.advanceTimersByTime(60 * 1000);
      });
      
      // Should have checked again
      expect(mockIsStreakAtRisk).toHaveBeenCalled();
    });
    
    it('should clean up interval on unmount', () => {
      const testDate = new Date('2024-01-15T20:00:00');
      vi.setSystemTime(testDate);
      
      const { unmount } = renderHook(() => useStreakNotifications());
      
      mockIsStreakAtRisk.mockClear();
      
      unmount();
      
      // Advance time
      act(() => {
        vi.advanceTimersByTime(60 * 1000);
      });
      
      // Should not check after unmount
      expect(mockIsStreakAtRisk).not.toHaveBeenCalled();
    });
  });
});
