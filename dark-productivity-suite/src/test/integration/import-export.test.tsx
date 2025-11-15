/**
 * Comprehensive integration tests for import/export functionality
 * Tests JSON import with valid/invalid data, plain text import, export in multiple formats,
 * and data integrity after import/export
 * Requirements: 11.1, 11.2, 11.5, 7.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { importService } from '../../services/importService';
import { exportService } from '../../services/exportService';
import type { Note, Task, AppSettings, TarotReading, PomodoroSession } from '../../types';

describe('Import/Export Integration Tests', () => {
  let mockNotes: Note[];
  let mockTasks: Task[];
  let mockSettings: AppSettings;
  let mockTarotReadings: TarotReading[];
  let mockPomodoroSessions: PomodoroSession[];

  beforeEach(() => {
    // Create comprehensive mock data
    mockNotes = [
      {
        id: '1',
        userId: 'user1',
        title: 'Test Note 1',
        content: 'This is test content with **markdown**',
        markdown: true,
        tags: ['test', 'important'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      },
      {
        id: '2',
        userId: 'user1',
        title: 'Test Note 2',
        content: 'Plain text content',
        markdown: false,
        tags: ['work'],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-02'),
      },
    ];

    mockTasks = [
      {
        id: '1',
        userId: 'user1',
        title: 'Test Task 1',
        description: 'Task description',
        priority: 'high',
        completed: false,
        archived: false,
        tags: ['urgent', 'work'],
        createdAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        userId: 'user1',
        title: 'Test Task 2',
        description: 'Completed task',
        priority: 'medium',
        completed: true,
        archived: false,
        tags: ['personal'],
        createdAt: new Date('2024-02-15'),
        completedAt: new Date('2024-02-20'),
      },
    ];

    mockSettings = {
      audioEnabled: true,
      audioVolume: 0.7,
      lastModule: 'necronomicon-notes',
    };

    mockTarotReadings = [
      {
        id: '1',
        userId: 'user1',
        date: new Date('2024-01-10'),
        cards: [
          {
            name: 'The Fool',
            position: 'past',
            asciiArt: '...',
            meaning: 'New beginnings',
          },
        ],
        interpretation: 'Test interpretation',
        commitStats: {
          totalCommits: 50,
          averageCommitsPerDay: 5,
          mostActiveHour: 14,
          sentimentScore: 0.8,
          topKeywords: ['feature', 'fix', 'update'],
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

  describe('JSON Import with Valid Data', () => {
    it('should successfully import valid JSON data with all fields', () => {
      const validData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        notes: mockNotes.map(n => ({
          ...n,
          createdAt: n.createdAt.toISOString(),
          updatedAt: n.updatedAt.toISOString(),
        })),
        tasks: mockTasks.map(t => ({
          ...t,
          createdAt: t.createdAt.toISOString(),
          completedAt: t.completedAt?.toISOString(),
        })),
      };

      const result = importService.parseJSON(JSON.stringify(validData));

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.notes).toHaveLength(2);
      expect(result.data!.tasks).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should correctly parse and convert date strings to Date objects', () => {
      const validData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        notes: [
          {
            id: '1',
            userId: 'user1',
            title: 'Test',
            content: 'Content',
            markdown: false,
            tags: [],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-02T00:00:00.000Z',
          },
        ],
        tasks: [],
      };

      const result = importService.parseJSON(JSON.stringify(validData));

      expect(result.success).toBe(true);
      expect(result.data!.notes[0].createdAt).toBeInstanceOf(Date);
      expect(result.data!.notes[0].updatedAt).toBeInstanceOf(Date);
      expect(result.data!.notes[0].createdAt.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should preserve all note properties including markdown and tags', () => {
      const validData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        notes: [
          {
            id: '1',
            userId: 'user1',
            title: 'Markdown Note',
            content: '# Header\n\n**Bold text**',
            markdown: true,
            tags: ['tag1', 'tag2', 'tag3'],
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-02').toISOString(),
          },
        ],
        tasks: [],
      };

      const result = importService.parseJSON(JSON.stringify(validData));

      expect(result.success).toBe(true);
      const note = result.data!.notes[0];
      expect(note.markdown).toBe(true);
      expect(note.tags).toEqual(['tag1', 'tag2', 'tag3']);
      expect(note.content).toContain('# Header');
    });

    it('should preserve all task properties including completion and archive status', () => {
      const validData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        notes: [],
        tasks: [
          {
            id: '1',
            userId: 'user1',
            title: 'Completed Task',
            description: 'Description',
            priority: 'high',
            completed: true,
            archived: true,
            tags: ['work', 'urgent'],
            createdAt: new Date('2024-01-01').toISOString(),
            completedAt: new Date('2024-01-05').toISOString(),
            archivedAt: new Date('2024-02-01').toISOString(),
          },
        ],
      };

      const result = importService.parseJSON(JSON.stringify(validData));

      expect(result.success).toBe(true);
      const task = result.data!.tasks[0];
      expect(task.completed).toBe(true);
      expect(task.archived).toBe(true);
      expect(task.completedAt).toBeInstanceOf(Date);
      expect(task.archivedAt).toBeInstanceOf(Date);
      expect(task.tags).toEqual(['work', 'urgent']);
    });
  });

  describe('JSON Import with Invalid Data', () => {
    it('should reject malformed JSON with parse error', () => {
      const invalidJSON = '{ "notes": [invalid json] }';

      const result = importService.parseJSON(invalidJSON);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('parse');
    });

    it('should filter out notes with missing required fields', () => {
      const invalidData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        notes: [
          {
            id: '1',
            title: 'Incomplete Note',
            // Missing content, createdAt, updatedAt
          },
          {
            id: '2',
            userId: 'user1',
            title: 'Complete Note',
            content: 'Content',
            markdown: false,
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        tasks: [],
      };

      const result = importService.parseJSON(JSON.stringify(invalidData));

      expect(result.success).toBe(true);
      expect(result.data!.notes).toHaveLength(1); // Only valid note
      expect(result.data!.notes[0].title).toBe('Complete Note');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should filter out tasks with invalid priority values', () => {
      const invalidData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        notes: [],
        tasks: [
          {
            id: '1',
            userId: 'user1',
            title: 'Invalid Task',
            description: 'Description',
            priority: 'super-urgent', // Invalid priority
            completed: false,
            archived: false,
            tags: [],
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            userId: 'user1',
            title: 'Valid Task',
            description: 'Description',
            priority: 'high',
            completed: false,
            archived: false,
            tags: [],
            createdAt: new Date().toISOString(),
          },
        ],
      };

      const result = importService.parseJSON(JSON.stringify(invalidData));

      expect(result.success).toBe(true);
      expect(result.data!.tasks).toHaveLength(1); // Only valid task
      expect(result.data!.tasks[0].title).toBe('Valid Task');
    });

    it('should handle empty or null data gracefully', () => {
      const emptyResult = importService.parseJSON('{}');
      const nullResult = importService.parseJSON('null');
      const emptyStringResult = importService.parseJSON('');

      expect(emptyResult.success).toBe(false);
      expect(nullResult.success).toBe(false);
      expect(emptyStringResult.success).toBe(false);
    });

    it('should filter out items with invalid data types', () => {
      const invalidData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        notes: [
          {
            id: 123, // Should be string
            userId: 'user1',
            title: 'Test',
            content: 'Content',
            markdown: 'yes', // Should be boolean
            tags: 'tag1,tag2', // Should be array
            createdAt: 'invalid-date',
            updatedAt: 'invalid-date',
          },
        ],
        tasks: [],
      };

      const result = importService.parseJSON(JSON.stringify(invalidData));

      expect(result.success).toBe(true);
      expect(result.data!.notes).toHaveLength(0); // Invalid note filtered out
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Plain Text Import', () => {
    it('should convert plain text to a single note', () => {
      const plainText = 'This is a plain text note.\nWith multiple lines.\nAnd more content.';

      const notes = importService.convertPlainTextToNotes(plainText);

      expect(notes).toHaveLength(1);
      // First line becomes title, rest becomes content
      expect(notes[0].title).toBe('This is a plain text note.');
      expect(notes[0].content).toBe('With multiple lines.\nAnd more content.');
      expect(notes[0].markdown).toBe(false);
      expect(notes[0].tags).toContain('imported');
    });

    it('should use first line as title for plain text', () => {
      const plainText = 'My Important Note\nThis is the content of the note.\nMore content here.';

      const notes = importService.convertPlainTextToNotes(plainText);

      expect(notes).toHaveLength(1);
      expect(notes[0].title).toBe('My Important Note');
    });

    it('should split multiple sections into separate notes', () => {
      const plainText = 'First Note\nContent 1\n\nSecond Note\nContent 2\n\nThird Note\nContent 3';

      const notes = importService.convertPlainTextToNotes(plainText);

      expect(notes).toHaveLength(3);
      expect(notes[0].title).toBe('First Note');
      expect(notes[1].title).toBe('Second Note');
      expect(notes[2].title).toBe('Third Note');
    });

    it('should handle empty plain text', () => {
      const plainText = '';

      const notes = importService.convertPlainTextToNotes(plainText);

      expect(notes).toHaveLength(0);
    });

    it('should generate valid IDs and timestamps for imported notes', () => {
      const plainText = 'Test Note\nTest content';

      const notes = importService.convertPlainTextToNotes(plainText);

      expect(notes[0].id).toBeDefined();
      expect(notes[0].createdAt).toBeInstanceOf(Date);
      expect(notes[0].updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Export in Multiple Formats', () => {
    it('should export data to JSON format', () => {
      const exportData = exportService.exportData(
        mockNotes,
        mockTasks,
        mockSettings,
        mockTarotReadings,
        mockPomodoroSessions
      );

      expect(exportData.version).toBeDefined();
      expect(exportData.exportDate).toBeDefined();
      expect(exportData.notes).toHaveLength(2);
      expect(exportData.tasks).toHaveLength(2);
      expect(exportData.settings).toEqual(mockSettings);
    });

    it('should export data with date range filtering', () => {
      const exportData = exportService.exportData(
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
      expect(exportData.notes).toHaveLength(1);
      expect(exportData.notes[0].id).toBe('1');
      expect(exportData.tasks).toHaveLength(1);
      expect(exportData.tasks[0].id).toBe('1');
    });

    it('should export data with selective data types', () => {
      const exportData = exportService.exportData(
        mockNotes,
        mockTasks,
        mockSettings,
        mockTarotReadings,
        mockPomodoroSessions,
        {
          includeNotes: true,
          includeTasks: false,
          includeTarotReadings: false,
          includePomodoroSessions: false,
        }
      );

      expect(exportData.notes).toHaveLength(2);
      expect(exportData.tasks).toHaveLength(0);
      expect(exportData.tarotReadings).toHaveLength(0);
      expect(exportData.pomodoroSessions).toHaveLength(0);
    });

    it('should handle empty data sets in export', () => {
      const exportData = exportService.exportData(
        [],
        [],
        mockSettings,
        [],
        []
      );

      expect(exportData.notes).toHaveLength(0);
      expect(exportData.tasks).toHaveLength(0);
      expect(exportData.tarotReadings).toHaveLength(0);
      expect(exportData.pomodoroSessions).toHaveLength(0);
      expect(exportData.settings).toEqual(mockSettings);
    });
  });

  describe('Data Integrity After Import/Export Cycle', () => {
    it('should maintain data integrity through full export/import cycle', () => {
      // Export data
      const exportData = exportService.exportData(
        mockNotes,
        mockTasks,
        mockSettings,
        mockTarotReadings,
        mockPomodoroSessions
      );

      // Convert to JSON string (simulating file save)
      const jsonString = JSON.stringify(exportData);

      // Import data back
      const importResult = importService.parseJSON(jsonString);

      expect(importResult.success).toBe(true);
      expect(importresult.data!.notes).toHaveLength(mockNotes.length);
      expect(importresult.data!.tasks).toHaveLength(mockTasks.length);

      // Verify note data integrity
      const importedNote = importresult.data!.notes[0];
      expect(importedNote.title).toBe(mockNotes[0].title);
      expect(importedNote.content).toBe(mockNotes[0].content);
      expect(importedNote.markdown).toBe(mockNotes[0].markdown);
      expect(importedNote.tags).toEqual(mockNotes[0].tags);

      // Verify task data integrity
      const importedTask = importresult.data!.tasks[0];
      expect(importedTask.title).toBe(mockTasks[0].title);
      expect(importedTask.description).toBe(mockTasks[0].description);
      expect(importedTask.priority).toBe(mockTasks[0].priority);
      expect(importedTask.completed).toBe(mockTasks[0].completed);
      expect(importedTask.tags).toEqual(mockTasks[0].tags);
    });

    it('should preserve special characters and formatting through export/import', () => {
      const specialNote: Note = {
        id: '1',
        userId: 'user1',
        title: 'Special Characters: "quotes", \'apostrophes\', & symbols',
        content: 'Content with\nnewlines\tand\ttabs\nand "quotes"',
        markdown: true,
        tags: ['tag-with-dash', 'tag_with_underscore'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const exportData = exportService.exportData(
        [specialNote],
        [],
        mockSettings,
        [],
        []
      );

      const jsonString = JSON.stringify(exportData);
      const importResult = importService.parseJSON(jsonString);

      expect(importResult.success).toBe(true);
      const importedNote = importresult.data!.notes[0];
      expect(importedNote.title).toBe(specialNote.title);
      expect(importedNote.content).toBe(specialNote.content);
      expect(importedNote.tags).toEqual(specialNote.tags);
    });

    it('should preserve date precision through export/import', () => {
      const preciseDate = new Date('2024-01-15T14:30:45.123Z');
      const noteWithPreciseDate: Note = {
        id: '1',
        userId: 'user1',
        title: 'Test',
        content: 'Content',
        markdown: false,
        tags: [],
        createdAt: preciseDate,
        updatedAt: preciseDate,
      };

      const exportData = exportService.exportData(
        [noteWithPreciseDate],
        [],
        mockSettings,
        [],
        []
      );

      const jsonString = JSON.stringify(exportData);
      const importResult = importService.parseJSON(jsonString);

      expect(importResult.success).toBe(true);
      const importedNote = importresult.data!.notes[0];
      expect(importedNote.createdAt.toISOString()).toBe(preciseDate.toISOString());
      expect(importedNote.updatedAt.toISOString()).toBe(preciseDate.toISOString());
    });

    it('should handle large datasets through export/import cycle', () => {
      // Create large dataset
      const largeNotes: Note[] = Array.from({ length: 500 }, (_, i) => ({
        id: `note-${i}`,
        userId: 'user1',
        title: `Note ${i}`,
        content: `Content for note ${i}`.repeat(10),
        markdown: i % 2 === 0,
        tags: [`tag${i % 10}`, `category${i % 5}`],
        createdAt: new Date(2024, 0, (i % 28) + 1),
        updatedAt: new Date(2024, 0, (i % 28) + 1),
      }));

      const largeTasks: Task[] = Array.from({ length: 500 }, (_, i) => ({
        id: `task-${i}`,
        userId: 'user1',
        title: `Task ${i}`,
        description: `Description for task ${i}`,
        priority: ['low', 'medium', 'high'][i % 3] as 'low' | 'medium' | 'high',
        completed: i % 3 === 0,
        archived: i % 5 === 0,
        tags: [`tag${i % 10}`],
        createdAt: new Date(2024, 0, (i % 28) + 1),
      }));

      // Export
      const exportData = exportService.exportData(
        largeNotes,
        largeTasks,
        mockSettings,
        [],
        []
      );

      // Import
      const jsonString = JSON.stringify(exportData);
      const importResult = importService.parseJSON(jsonString);

      expect(importResult.success).toBe(true);
      expect(importresult.data!.notes).toHaveLength(500);
      expect(importresult.data!.tasks).toHaveLength(500);
    });

    it('should maintain array order through export/import', () => {
      const exportData = exportService.exportData(
        mockNotes,
        mockTasks,
        mockSettings,
        mockTarotReadings,
        mockPomodoroSessions
      );

      const jsonString = JSON.stringify(exportData);
      const importResult = importService.parseJSON(jsonString);

      expect(importResult.success).toBe(true);
      
      // Verify order is maintained
      importresult.data!.notes.forEach((note, index) => {
        expect(note.title).toBe(mockNotes[index].title);
      });

      importresult.data!.tasks.forEach((task, index) => {
        expect(task.title).toBe(mockTasks[index].title);
      });
    });
  });

  describe('Duplicate Detection During Import', () => {
    it('should detect duplicate notes by title and content', () => {
      const existingNotes: Note[] = [
        {
          id: '1',
          userId: 'user1',
          title: 'Existing Note',
          content: 'Existing content',
          markdown: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const importedNotes: Note[] = [
        {
          id: '2',
          userId: 'user1',
          title: 'Existing Note',
          content: 'Existing content',
          markdown: false,
          tags: ['new-tag'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = importService.detectDuplicates(importedNotes, existingNotes, [], []);

      expect(result.duplicateNotes).toHaveLength(1);
      expect(result.uniqueNotes).toHaveLength(0);
    });

    it('should detect duplicate tasks by title and description', () => {
      const existingTasks: Task[] = [
        {
          id: '1',
          userId: 'user1',
          title: 'Existing Task',
          description: 'Existing description',
          priority: 'medium',
          completed: false,
          archived: false,
          tags: [],
          createdAt: new Date(),
        },
      ];

      const importedTasks: Task[] = [
        {
          id: '2',
          userId: 'user1',
          title: 'Existing Task',
          description: 'Existing description',
          priority: 'high',
          completed: false,
          archived: false,
          tags: ['new-tag'],
          createdAt: new Date(),
        },
      ];

      const result = importService.detectDuplicates([], [], importedTasks, existingTasks);

      expect(result.duplicateTasks).toHaveLength(1);
      expect(result.uniqueTasks).toHaveLength(0);
    });

    it('should perform case-insensitive duplicate detection', () => {
      const existingNotes: Note[] = [
        {
          id: '1',
          userId: 'user1',
          title: 'EXISTING NOTE',
          content: 'EXISTING CONTENT',
          markdown: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const importedNotes: Note[] = [
        {
          id: '2',
          userId: 'user1',
          title: 'existing note',
          content: 'existing content',
          markdown: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = importService.detectDuplicates(importedNotes, existingNotes, [], []);

      expect(result.duplicateNotes).toHaveLength(1);
    });

    it('should identify unique items correctly', () => {
      const existingNotes: Note[] = [
        {
          id: '1',
          userId: 'user1',
          title: 'Existing Note',
          content: 'Content',
          markdown: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const importedNotes: Note[] = [
        {
          id: '2',
          userId: 'user1',
          title: 'New Note',
          content: 'New content',
          markdown: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = importService.detectDuplicates(importedNotes, existingNotes, [], []);

      expect(result.uniqueNotes).toHaveLength(1);
      expect(result.uniqueNotes[0].title).toBe('New Note');
      expect(result.duplicateNotes).toHaveLength(0);
    });
  });
});
