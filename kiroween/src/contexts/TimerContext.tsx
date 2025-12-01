import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { SessionType, TimerSettings, TimerStats } from '../types/timer';
import { DEFAULT_TIMER_SETTINGS } from '../types/timer';
import { useStreak } from './StreakContext';

interface TimerState {
  isActive: boolean;
  startTime: number | null;
  duration: number; // in minutes
  remainingTime: number; // in seconds
  isPaused: boolean;
  pausedAt: number | null;
  sessionType: SessionType;
}

interface TimerContextValue {
  timer: TimerState;
  settings: TimerSettings;
  stats: TimerStats;
  startTimer: (duration: number, type: SessionType) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  updateSettings: (newSettings: Partial<TimerSettings>) => void;
}

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

const STORAGE_KEY = 'kiroween_timer';
const SETTINGS_KEY = 'kiroween_timer_settings';
const STATS_KEY = 'kiroween_timer_stats';

const initialTimerState: TimerState = {
  isActive: false,
  startTime: null,
  duration: 25,
  remainingTime: 0,
  isPaused: false,
  pausedAt: null,
  sessionType: 'focus',
};

const initialStats: TimerStats = {
  totalSessions: 0,
  completedSessions: 0,
  totalFocusTime: 0,
  currentStreak: 0,
  longestStreak: 0,
  todaySessions: 0,
};

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timer, setTimer] = useState<TimerState>(initialTimerState);
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_TIMER_SETTINGS);
  const [stats, setStats] = useState<TimerStats>(initialStats);
  const intervalRef = useRef<number | null>(null);
  const { recordActivity } = useStreak();

  // Load persisted state on mount
  useEffect(() => {
    try {
      const savedTimer = localStorage.getItem(STORAGE_KEY);
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      const savedStats = localStorage.getItem(STATS_KEY);

      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }

      if (savedTimer) {
        const parsed = JSON.parse(savedTimer);
        
        // Calculate remaining time if timer was active
        if (parsed.isActive && parsed.startTime) {
          const now = Date.now();
          const elapsed = parsed.isPaused
            ? (parsed.pausedAt - parsed.startTime) / 1000
            : (now - parsed.startTime) / 1000;
          const remaining = Math.max(0, parsed.duration * 60 - elapsed);

          if (remaining > 0) {
            setTimer({
              ...parsed,
              remainingTime: Math.floor(remaining),
            });
          } else {
            // Timer expired while away
            setTimer(initialTimerState);
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load timer state:', error);
      // Fall back to memory-only mode
    }
  }, []);

  // Persist timer state
  useEffect(() => {
    if (timer.isActive) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(timer));
      } catch (error) {
        console.error('Failed to persist timer state:', error);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [timer]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to persist timer settings:', error);
    }
  }, [settings]);

  // Persist stats
  useEffect(() => {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to persist timer stats:', error);
    }
  }, [stats]);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const updatedTimer = JSON.parse(e.newValue);
          setTimer(updatedTimer);
        } catch (error) {
          console.error('Failed to sync timer from other tab:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Timer tick logic
  useEffect(() => {
    if (timer.isActive && !timer.isPaused) {
      intervalRef.current = window.setInterval(() => {
        setTimer((prev) => {
          if (!prev.startTime) return prev;

          const now = Date.now();
          const elapsed = (now - prev.startTime) / 1000;
          const remaining = Math.max(0, prev.duration * 60 - elapsed);

          if (remaining === 0) {
            // Timer completed
            handleTimerComplete(prev.sessionType);
            return initialTimerState;
          }

          return {
            ...prev,
            remainingTime: Math.floor(remaining),
          };
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [timer.isActive, timer.isPaused, timer.startTime]);

  const handleTimerComplete = useCallback((sessionType: SessionType) => {
    // Update stats
    setStats((prev) => ({
      ...prev,
      totalSessions: prev.totalSessions + 1,
      completedSessions: prev.completedSessions + 1,
      totalFocusTime: sessionType === 'focus' ? prev.totalFocusTime + timer.duration : prev.totalFocusTime,
      todaySessions: prev.todaySessions + 1,
    }));

    // Record focus activity for streak tracking
    // Requirements: Task 1.6 - Integration with Existing Contexts
    if (sessionType === 'focus') {
      recordActivity('focus', { minutes: timer.duration });
    }

    // Trigger notifications (handled by useTimerNotifications hook)
    window.dispatchEvent(new CustomEvent('timer-complete', { detail: { sessionType } }));
  }, [timer.duration, recordActivity]);

  const startTimer = useCallback((duration: number, type: SessionType) => {
    if (duration <= 0) {
      console.error('Invalid timer duration');
      return;
    }

    const now = Date.now();
    setTimer({
      isActive: true,
      startTime: now,
      duration,
      remainingTime: duration * 60,
      isPaused: false,
      pausedAt: null,
      sessionType: type,
    });
  }, []);

  const pauseTimer = useCallback(() => {
    setTimer((prev) => ({
      ...prev,
      isPaused: true,
      pausedAt: Date.now(),
    }));
  }, []);

  const resumeTimer = useCallback(() => {
    setTimer((prev) => {
      if (!prev.pausedAt || !prev.startTime) return prev;

      const pauseDuration = Date.now() - prev.pausedAt;
      return {
        ...prev,
        isPaused: false,
        startTime: prev.startTime + pauseDuration,
        pausedAt: null,
      };
    });
  }, []);

  const stopTimer = useCallback(() => {
    setTimer(initialTimerState);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const resetTimer = useCallback(() => {
    setTimer((prev) => ({
      ...prev,
      startTime: Date.now(),
      remainingTime: prev.duration * 60,
      isPaused: false,
      pausedAt: null,
    }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const value: TimerContextValue = {
    timer,
    settings,
    stats,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    updateSettings,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
