// Timer Type Definitions for Focused Timer Feature

export type SessionType = 'focus' | 'break' | 'long-break';

export interface TimerSession {
  id: string;
  type: SessionType;
  duration: number; // in minutes
  startTime: number; // timestamp
  endTime: number | null; // timestamp
  completed: boolean;
  interrupted: boolean;
}

export interface TimerSettings {
  focusDuration: number; // default 25 minutes
  shortBreakDuration: number; // default 5 minutes
  longBreakDuration: number; // default 15 minutes
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  sessionsUntilLongBreak: number; // default 4
}

export interface TimerStats {
  totalSessions: number;
  completedSessions: number;
  totalFocusTime: number; // in minutes
  currentStreak: number; // consecutive days
  longestStreak: number;
  todaySessions: number;
}

export enum TimerErrorCode {
  PERSISTENCE_FAILED = 'PERSISTENCE_FAILED',
  INVALID_DURATION = 'INVALID_DURATION',
  NOTIFICATION_DENIED = 'NOTIFICATION_DENIED',
  SYNC_FAILED = 'SYNC_FAILED',
}

export class TimerError extends Error {
  constructor(
    message: string,
    public code: TimerErrorCode,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'TimerError';
  }
}

// Default settings
export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true,
  notificationsEnabled: true,
  sessionsUntilLongBreak: 4,
};
