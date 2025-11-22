/**
 * Tests for import service
 * Verifies JSON import, plain text import, validation, and error handling
 * Requirements: 11.1, 11.2, 11.5
 */

import { describe, it, expect } from 'vitest';
import { importService } from '../../services/importService';
import type { Note, Task } from '../../types';

describe('ImportService', () => {
  describe('JSON import with valid data', () => {
    it('should import valid JSON data successfully', () => {
      const validData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        notes: [
          {
            id: '1',
            userId: 'user1',
            title: 'Test Note',
            content: 'Test content',
            markdown: false,
            tags: ['test'],
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString(),
          },
        ],
        tasks: [
          {
            id: '1',
            userId: 'user1',
            title: 'Test Task',
            description: 'Test description',
            priority: 'medium',
            completed: false,
            archived: false,
            tags: ['work'],
            createdAt: new Date('2024-01-01').toISOString(),
          },
        ],
      };

      const result = importService.parseJSON(JSON.stringify(validData));

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.notes).toHaveLength(1);
      expect(result.data!.tasks).toHaveLength(1);
    });

    it('should parse dates correctly from JSON', () => {
      const validData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        notes: [
          {
            id: '1',
            userId: 'user1',
            title: 'Test Note',
            content: 'Test content',
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
      expect(result.data).toBeDefined();
      expect(result.data!.notes[0].createdAt).toBeInstanceOf(Date);
      expect(result.data!.notes[0].updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('JSON import with invalid data', () => {
    it('should reject malformed JSON', () => {
      const invalidJSON = '{ invalid json }';

      const result = importService.parseJSON(invalidJSON);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('parse');
    });

    it('should reject data missing required fields', () => {
      const invalidData = {
        notes: [
          {
            // Missing required fields
            title: 'Incomplete Note',
          },
        ],
      };

      const result = importService.parseJSON(JSON.stringify(invalidData));

      expect(result.success).toBe(true); // Parsing succeeds but invalid items are filtered
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.data!.notes).toHaveLength(0); // Invalid note is skipped
    });

    it('should filter out data with invalid types', () => {
      const invalidData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        notes: [
          {
            id: 123, // Should be string
            title: 'Test',
            content: 'Test',
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
      expect(result.data!.notes).toHaveLength(0); // Invalid note is filtered out
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should handle empty or null data', () => {
      const result1 = importService.parseJSON('');
      const result2 = importService.parseJSON('null');
      const result3 = importService.parseJSON('{}');

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
      expect(result3.success).toBe(false);
      expect(result3.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Plain text import', () => {
    it('should convert plain text to notes', () => {
      const plainText = 'This is a plain text note.\nWith multiple lines.\nAnd more content.';

      const notes = importService.convertPlainTextToNotes(plainText);

      expect(notes).toHaveLength(1);
      expect(notes[0].title).toBeDefined();
      expect(notes[0].content).toBe(plainText);
      expect(notes[0].markdown).toBe(false);
      expect(notes[0].tags).toContain('imported');
      expect(notes[0].id).toBeDefined();
      expect(notes[0].createdAt).toBeInstanceOf(Date);
      expect(notes[0].updatedAt).toBeInstanceOf(Date);
    });

    it('should use first line as title if available', () => {
      const plainText = 'My Important Note\nThis is the content of the note.';

      const notes = importService.convertPlainTextToNotes(plainText);

      expect(notes).toHaveLength(1);
      expect(notes[0].title).toBe('My Important Note');
    });

    it('should handle empty plain text', () => {
      const plainText = '';

      const notes = importService.convertPlainTextToNotes(plainText);

      expect(notes).toHaveLength(0);
    });

    it('should split multiple sections into separate notes', () => {
      const plainText = 'First Note\nContent 1\n\nSecond Note\nContent 2\n\nThird Note\nContent 3';

      const notes = importService.convertPlainTextToNotes(plainText);

      expect(notes).toHaveLength(3);
      expect(notes[0].title).toBe('First Note');
      expect(notes[1].title).toBe('Second Note');
      expect(notes[2].title).toBe('Third Note');
    });
  });

  describe('Duplicate detection', () => {
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

    it('should not flag similar but different notes as duplicates', () => {
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
          content: 'Different content',
          markdown: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = importService.detectDuplicates(importedNotes, existingNotes, [], []);

      expect(result.duplicateNotes).toHaveLength(0);
      expect(result.uniqueNotes).toHaveLength(1);
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

    it('should handle case-insensitive duplicate detection', () => {
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
  });

  describe('Data merging', () => {
    it('should identify unique notes for merging', () => {
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
    });

    it('should skip duplicate notes during merge', () => {
      const existingNotes: Note[] = [
        {
          id: '1',
          userId: 'user1',
          title: 'Duplicate Note',
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
          title: 'Duplicate Note',
          content: 'Content',
          markdown: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = importService.detectDuplicates(importedNotes, existingNotes, [], []);

      expect(result.duplicateNotes).toHaveLength(1);
      expect(result.uniqueNotes).toHaveLength(0);
    });

    it('should handle mixed unique and duplicate items', () => {
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
          title: 'Existing Note',
          content: 'Content',
          markdown: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
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

      expect(result.duplicateNotes).toHaveLength(1);
      expect(result.uniqueNotes).toHaveLength(1);
    });
  });

  describe('Error handling', () => {
    it('should provide detailed error messages for validation failures', () => {
      const invalidData = {
        notes: [{ title: 'Incomplete' }],
      };

      const result = importService.parseJSON(JSON.stringify(invalidData));

      expect(result.success).toBe(true); // Parsing succeeds
      expect(result.warnings.length).toBeGreaterThan(0); // But warnings are generated
      expect(result.data!.notes).toHaveLength(0); // Invalid items are filtered
    });

    it('should handle corrupted data gracefully', () => {
      const corruptedData = {
        version: '1.0.0',
        notes: [
          {
            id: '1',
            title: 'Test',
            content: 'Test',
            markdown: false,
            tags: [],
            createdAt: 'not-a-date',
            updatedAt: 'not-a-date',
          },
        ],
        tasks: [],
      };

      const result = importService.parseJSON(JSON.stringify(corruptedData));

      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.data!.notes).toHaveLength(0); // Invalid note is filtered
    });

    it('should handle large import files', () => {
      const largeData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        notes: Array.from({ length: 1000 }, (_, i) => ({
          id: `note-${i}`,
          userId: 'user1',
          title: `Note ${i}`,
          content: `Content ${i}`,
          markdown: false,
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        tasks: [],
      };

      const result = importService.parseJSON(JSON.stringify(largeData));

      expect(result.success).toBe(true);
      expect(result.data!.notes).toHaveLength(1000);
    });
  });

  describe('Data integrity after import', () => {
    it('should preserve all note properties after import', () => {
      const validData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        notes: [
          {
            id: '1',
            userId: 'user1',
            title: 'Test Note',
            content: 'Test content with **markdown**',
            markdown: true,
            tags: ['tag1', 'tag2'],
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-02').toISOString(),
          },
        ],
        tasks: [],
      };

      const result = importService.parseJSON(JSON.stringify(validData));

      expect(result.success).toBe(true);
      const note = result.data!.notes[0];
      expect(note.title).toBe('Test Note');
      expect(note.content).toBe('Test content with **markdown**');
      expect(note.markdown).toBe(true);
      expect(note.tags).toEqual(['tag1', 'tag2']);
    });

    it('should preserve all task properties after import', () => {
      const validData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        notes: [],
        tasks: [
          {
            id: '1',
            userId: 'user1',
            title: 'Test Task',
            description: 'Test description',
            priority: 'high',
            completed: true,
            archived: false,
            tags: ['work', 'urgent'],
            createdAt: new Date('2024-01-01').toISOString(),
            completedAt: new Date('2024-01-05').toISOString(),
          },
        ],
      };

      const result = importService.parseJSON(JSON.stringify(validData));

      expect(result.success).toBe(true);
      const task = result.data!.tasks[0];
      expect(task.title).toBe('Test Task');
      expect(task.priority).toBe('high');
      expect(task.completed).toBe(true);
      expect(task.completedAt).toBeInstanceOf(Date);
      expect(task.tags).toEqual(['work', 'urgent']);
    });
  });
});
