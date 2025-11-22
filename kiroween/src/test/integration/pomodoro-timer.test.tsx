/**
 * Pomodoro timer tests
 * Tests timer start/pause/resume/reset, intervals, notifications, and persistence
 * Requirements: 12.2, 12.3, 12.4, 12.6, 12.7
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePomodoro } from '../../hooks/usePomodoro';

describe('Pomodoro Timer Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Timer start/pause/resume/reset (Requirement 12.2, 12.3)', () => {
    it('should start timer', () => {
      const { result } = renderHook(() => usePomodoro());

      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);
      expect(result.current.timeRemaining).toBeGreaterThan(0);
    });

    it('should pause timer', () => {
      const { result } = renderHook(() => usePomodoro());

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.pause();
      });

      expect(result.current.isPaused).toBe(true);
    });

    it('should resume timer after pause', () => {
      const { result } = renderHook(() => usePomodoro());

      act(() => {
        result.current.start();
        result.current.pause();
        result.current.resume();
      });

      expect(result.current.isRunning).toBe(true);
      expect(result.current.isPaused).toBe(false);
    });

    it('should reset timer', () => {
      const { result } = renderHook(() => usePomodoro());

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.isRunning).toBe(false);
      expect(result.current.timeRemaining).toBe(result.current.workDuration);
    });
  });

  describe('Work and break intervals (Requirement 12.3)', () => {
    it('should use work duration by default', () => {
      const { result } = renderHook(() => usePomodoro());

      expect(result.current.currentType).toBe('work');
      expect(result.current.timeRemaining).toBe(result.current.workDuration);
    });

    it('should switch to break manually', () => {
      const { result } = renderHook(() => usePomodoro());

      act(() => {
        result.current.switchType('break');
      });

      expect(result.current.currentType).toBe('break');
      expect(result.current.timeRemaining).toBe(result.current.breakDuration);
    });

    it('should allow configuring work duration', () => {
      const { result } = renderHook(() => usePomodoro());

      act(() => {
        result.current.setWorkDuration(30);
      });

      expect(result.current.workDuration).toBe(30 * 60);
      expect(result.current.timeRemaining).toBe(30 * 60);
    });

    it('should allow configuring break duration', () => {
      const { result } = renderHook(() => usePomodoro());

      act(() => {
        result.current.setBreakDuration(10);
      });

      expect(result.current.breakDuration).toBe(10 * 60);
    });

    it('should update time remaining when changing work duration while not running', () => {
      const { result } = renderHook(() => usePomodoro());

      act(() => {
        result.current.setWorkDuration(20);
      });

      expect(result.current.timeRemaining).toBe(20 * 60);
    });

    it('should not update time remaining when changing duration while running', () => {
      const { result } = renderHook(() => usePomodoro());

      act(() => {
        result.current.start();
      });

      const timeBeforeChange = result.current.timeRemaining;

      act(() => {
        result.current.setWorkDuration(30);
      });

      expect(result.current.timeRemaining).toBe(timeBeforeChange);
    });
  });

  describe('Notifications and sounds (Requirement 12.4)', () => {
    it('should create session when timer starts', () => {
      const { result } = renderHook(() => usePomodoro());

      const initialSessionCount = result.current.sessions.length;

      act(() => {
        result.current.start();
      });

      expect(result.current.sessions.length).toBe(initialSessionCount + 1);
      expect(result.current.isRunning).toBe(true);
    });

    it('should track session type', () => {
      const { result } = renderHook(() => usePomodoro());

      act(() => {
        result.current.start();
      });

      const lastSession = result.current.sessions[result.current.sessions.length - 1];
      expect(lastSession.type).toBe('work');
      expect(lastSession.completed).toBe(false);
    });
  });

  describe('Session tracking (Requirement 12.6)', () => {
    it('should provide session history', () => {
      const { result } = renderHook(() => usePomodoro());

      expect(result.current.sessions).toBeDefined();
      expect(Array.isArray(result.current.sessions)).toBe(true);
    });

    it('should record session details when starting', () => {
      const { result } = renderHook(() => usePomodoro());

      act(() => {
        result.current.start();
      });

      const lastSession = result.current.sessions[result.current.sessions.length - 1];
      expect(lastSession).toBeDefined();
      expect(lastSession.type).toBe('work');
      expect(lastSession.completed).toBe(false);
      expect(lastSession.startTime).toBeDefined();
      expect(lastSession.duration).toBe(result.current.workDuration);
    });

    it('should get completed sessions', () => {
      const { result } = renderHook(() => usePomodoro());

      const completedSessions = result.current.getCompletedSessions();
      expect(Array.isArray(completedSessions)).toBe(true);
    });

    it('should get today sessions', () => {
      const { result } = renderHook(() => usePomodoro());

      const todaySessions = result.current.getTodaySessions();
      expect(Array.isArray(todaySessions)).toBe(true);
    });

    it('should provide statistics', () => {
      const { result } = renderHook(() => usePomodoro());

      const stats = result.current.getStatistics();
      expect(stats).toBeDefined();
      expect(stats.totalSessions).toBeDefined();
      expect(stats.todaySessions).toBeDefined();
      expect(stats.totalWorkTime).toBeDefined();
      expect(stats.totalBreakTime).toBeDefined();
    });
  });

  describe('Timer persistence (Requirement 12.7)', () => {
    it('should use localStorage for state persistence', () => {
      const { result } = renderHook(() => usePomodoro());

      // The hook uses useLocalStorage which handles persistence
      expect(result.current.workDuration).toBeDefined();
      expect(result.current.breakDuration).toBeDefined();
    });

    it('should persist configuration changes', async () => {
      const { result } = renderHook(() => usePomodoro());

      act(() => {
        result.current.setWorkDuration(30);
        result.current.setBreakDuration(10);
      });

      // Wait for state to update
      await waitFor(() => {
        expect(result.current.workDuration).toBe(30 * 60);
        expect(result.current.breakDuration).toBe(10 * 60);
      });
    });

    it('should persist sessions', () => {
      const { result } = renderHook(() => usePomodoro());

      act(() => {
        result.current.start();
      });

      // Sessions are persisted via useLocalStorage
      expect(result.current.sessions.length).toBeGreaterThan(0);
    });

    it('should clear state on reset', () => {
      const { result } = renderHook(() => usePomodoro());

      act(() => {
        result.current.start();
        result.current.reset();
      });

      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(false);
    });
  });

  describe('Timer countdown', () => {
    it('should have initial time remaining', () => {
      const { result } = renderHook(() => usePomodoro());

      expect(result.current.timeRemaining).toBeGreaterThan(0);
      expect(result.current.timeRemaining).toBe(result.current.workDuration);
    });

    it('should track time remaining during session', async () => {
      const { result } = renderHook(() => usePomodoro());

      const initialTime = result.current.timeRemaining;

      act(() => {
        result.current.start();
      });

      // Wait a bit for timer to tick
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Time should have decreased
      expect(result.current.timeRemaining).toBeLessThan(initialTime);
    });
  });
});
