/**
 * Core data models for Dark Productivity Suite
 */

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider: 'email' | 'google' | 'github';
  createdAt: Date;
  lastLogin: Date;
}

export interface Task {
  id: string;
  userId?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  archived: boolean;
  tags: string[];
  createdAt: Date;
  completedAt?: Date;
  archivedAt?: Date;
}

export interface Note {
  id: string;
  userId?: string;
  title: string;
  content: string;
  markdown: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TarotCard {
  name: string;
  position: 'past' | 'present' | 'future';
  asciiArt: string;
  meaning: string;
}

export interface CommitStats {
  totalCommits: number;
  averageCommitsPerDay: number;
  mostActiveHour: number;
  sentimentScore: number;
  topKeywords: string[];
}

export interface TarotReading {
  id: string;
  userId?: string;
  date: Date;
  cards: TarotCard[];
  interpretation: string;
  commitStats: CommitStats;
}

export interface GhostSuggestion {
  id: string;
  text: string;
  position: number;
  confidence: number;
}

export interface AppSettings {
  audioEnabled: boolean;
  audioVolume: number;
  lastModule: string;
  theme?: string;
  keyboardShortcuts?: KeyboardShortcut[];
}

export interface SyncStatus {
  lastSync: Date | null;
  syncing: boolean;
  error?: string;
  pendingChanges: number;
}

export interface SyncQueueItem {
  id: string;
  type: 'note' | 'task' | 'tarot';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
}

export type ModuleName = 'terminal-tarot' | 'ghost-writer' | 'necronomicon-notes' | 'graveyard-dashboard';

export interface KeyboardShortcut {
  id: string;
  action: string;
  keys: string[];
  description: string;
  category: 'navigation' | 'actions' | 'search' | 'help';
  customizable: boolean;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    bgPrimary: string;
    bgSecondary: string;
    bgTertiary: string;
    accentPurple: string;
    accentPurpleLight: string;
    accentPurpleDark: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textMuted: string;
    highlightBlue: string;
    highlightBlueLight: string;
    highlightGreen: string;
    highlightGreenLight: string;
    warningRed: string;
    warningRedLight: string;
    warningRedDark: string;
    borderPrimary: string;
    borderSecondary: string;
    shadowLight: string;
    shadowMedium: string;
    shadowHeavy: string;
    glowPurple: string;
    glowBlue: string;
    glowRed: string;
  };
}

export interface PomodoroSession {
  id: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  type: 'work' | 'break';
  completed: boolean;
}

export interface PomodoroState {
  isRunning: boolean;
  isPaused: boolean;
  currentType: 'work' | 'break';
  timeRemaining: number;
  workDuration: number;
  breakDuration: number;
  currentSessionId: string | null;
}
