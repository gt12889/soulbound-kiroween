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
  createdAt: Date;
  completedAt?: Date;
}

export interface Note {
  id: string;
  userId?: string;
  title: string;
  content: string;
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
