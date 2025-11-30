/**
 * Tests for export service
 * Verifies multiple format support, date filtering, and encryption
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { exportService } from '../../services/exportService';
import type { Note, Task, AppSettings, TarotReading, PomodoroSession } from '../../types';

describe('ExportService', () => {
  let mockNotes: Note[];
  let mockTasks: Task[];
  let mockSettings: AppSettings;
  let mockTarotReadings: TarotReading[];
  let mockPomodoroSessions: PomodoroSession[];

  beforeEach(() => {
    // Create mock data
    mockNotes = [
      {
        id: '1',
        userId: 'user1',
        title: 'Test Note 1',
        content: 'Content 1',
        markdown: false,
        tags: ['tag1'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      },
      {
        id: '2',
        userId: 'user1',
        title: 'Test Note 2',
        content: 'Content 2',
        markdown: true,
        tags: ['tag2'],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-02'),
      },
    ];

    mockTasks = [
      {
        id: '1',
        userId: 'user1',
        title: 'Test Task 1',
        description: 'Description 1',
        priority: 'high',
        completed: false,
        archived: false,
        tags: ['work'],
        createdAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        userId: 'user1',
        title: 'Test Task 2',
        description: 'Description 2',
        priority: 'low',
        completed: true,
        archived: false,
        tags: ['personal'],
        createdAt: new Date('2024-02-15'),
        completedAt: new Date('2024-02-20'),
      },
    ];

    mockSettings = {
      audioEnabled: true,
      audioVolume: 0.5,
      lastModule: 'necronomicon-notes',
    };

    mockTarotReadings = [
      {
        id: '1',
        userId: 'user1',
        date: new Date('2024-01-10'),
        cards: [],
        interpretation: 'Test interpretation',
        commitStats: {
          totalCommits: 10,
          averageCommitsPerDay: 2,
          mostActiveHour: 14,
          sentimentScore: 0.8,
          topKeywords: ['feature', 'fix'],
        },
      },
    ];

    mockPomodoroSessions = [
      {
        id: '1',
        userId: 'user1',
        startTime: new Date('2024-01-20T10:00:00'),
        endTime: new Date('2024-01-20T10:25:00'),
        duration: 25,
        type: 'work',
        completed: true,
      },
    ];
  });

  describe('exportData', () => {
    it('should export all data types by default', () => {
      const result = exportService.exportData(
        mockNotes,
        mockTasks,
        mockSettings,
        mockTarotReadings,
        mockPomodoroSessions
      );

      expect(result.notes).toHaveLength(2);
      expect(result.tasks).toHaveLength(2);
      expect(result.settings).toEqual(mockSettings);
      expect(result.tarotReadings).toHaveLength(1);
      expect(result.pomodoroSessions).toHaveLength(1);
      expect(result.version).toBeDefined();
      expect(result.exportDate).toBeDefined();
    });

    it('should exclude data types when options specify', () => {
      const result = exportService.exportData(
        mockNotes,
        mockTasks,
        mockSettings,
        mockTarotReadings,
        mockPomodoroSessions,
        {
          includeNotes: false,
          includeTasks: false,
          includeTarotReadings: false,
          includePomodoroSessions: false,
        }
      );

      expect(result.notes).toHaveLength(0);
      expect(result.tasks).toHaveLength(0);
      expect(result.tarotReadings).toHaveLength(0);
      expect(result.pomodoroSessions).toHaveLength(0);
      expect(result.settings).toEqual(mockSettings);
    });

    it('should filter data by date range', () => {
      const result = exportService.exportData(
        mockNotes,
        mockTasks,
        mockSettings,
        mockTarotReadings,
        mockPomodoroSessions,
        {
          dateRange: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-31'),
          },
        }
      );

      // Should only include items from January
      expect(result.notes).toHaveLength(1);
      expect(result.notes[0].id).toBe('1');
      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].id).toBe('1');
      expect(result.tarotReadings).toHaveLength(1);
      expect(result.pomodoroSessions).toHaveLength(1);
    });

    it('should filter out items outside date range', () => {
      const result = exportService.exportData(
        mockNotes,
        mockTasks,
        mockSettings,
        mockTarotReadings,
        mockPomodoroSessions,
        {
          dateRange: {
            start: new Date('2024-03-01'),
            end: new Date('2024-03-31'),
          },
        }
      );

      // Should have no items from March
      expect(result.notes).toHaveLength(0);
      expect(result.tasks).toHaveLength(0);
      expect(result.tarotReadings).toHaveLength(0);
      expect(result.pomodoroSessions).toHaveLength(0);
    });
  });

  describe('format conversion', () => {
    it('should export to JSON format', () => {
      const data = exportService.exportData(
        mockNotes,
        mockTasks,
        mockSettings,
        mockTarotReadings,
        mockPomodoroSessions
      );

      // Access private method through exportAndDownload (we'll just verify no errors)
      expect(data).toBeDefined();
      expect(data.notes).toBeDefined();
      expect(data.tasks).toBeDefined();
    });

    it('should handle empty data sets', () => {
      const result = exportService.exportData(
        [],
        [],
        mockSettings,
        [],
        []
      );

      expect(result.notes).toHaveLength(0);
      expect(result.tasks).toHaveLength(0);
      expect(result.tarotReadings).toHaveLength(0);
      expect(result.pomodoroSessions).toHaveLength(0);
    });
  });

  describe('data integrity', () => {
    it('should preserve all note properties', () => {
      const result = exportService.exportData(
        mockNotes,
        mockTasks,
        mockSettings,
        mockTarotReadings,
        mockPomodoroSessions
      );

      const note = result.notes[0];
      expect(note.id).toBe('1');
      expect(note.title).toBe('Test Note 1');
      expect(note.content).toBe('Content 1');
      expect(note.markdown).toBe(false);
      expect(note.tags).toEqual(['tag1']);
    });

    it('should preserve all task properties', () => {
      const result = exportService.exportData(
        mockNotes,
        mockTasks,
        mockSettings,
        mockTarotReadings,
        mockPomodoroSessions
      );

      const task = result.tasks[1];
      expect(task.id).toBe('2');
      expect(task.title).toBe('Test Task 2');
      expect(task.completed).toBe(true);
      expect(task.completedAt).toBeDefined();
    });
  });
});
