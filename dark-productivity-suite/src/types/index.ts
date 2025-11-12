/**
 * Core data models for Dark Productivity Suite
 */

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface Note {
  id: string;
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

export type ModuleName = 'terminal-tarot' | 'ghost-writer' | 'necronomicon-notes' | 'graveyard-dashboard';
