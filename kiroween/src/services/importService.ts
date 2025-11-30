/**
 * Import service for parsing and validating imported data
 * Handles JSON import, plain text conversion, and duplicate detection
 * Requirements: 11.1, 11.2, 11.5
 */

import type { Note, Task, TarotReading } from '../types';

export interface ImportData {
  notes?: Note[];
  tasks?: Task[];
  tarotReadings?: TarotReading[];
  version?: string;
  exportDate?: string;
}

export interface ImportResult {
  success: boolean;
  data?: ImportData;
  errors: string[];
  warnings: string[];
  stats: {
    notesImported: number;
    tasksImported: number;
    tarotReadingsImported: number;
    duplicatesSkipped: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  item?: any;
}

class ImportService {
  /**
   * Parse JSON file content
   * Requirements: 11.1
   */
  parseJSON(content: string): ImportResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const parsed = JSON.parse(content);
      
      // Validate structure
      const validationErrors = this.validateImportData(parsed);
      if (validationErrors.length > 0) {
        validationErrors.forEach(err => {
          errors.push(`${err.field}: ${err.message}`);
        });
      }

      // Extract data
      const data: ImportData = {
        notes: parsed.notes || [],
        tasks: parsed.tasks || [],
        tarotReadings: parsed.tarotReadings || [],
        version: parsed.version,
        exportDate: parsed.exportDate,
      };

      // Validate individual items
      const { validNotes, invalidNotes } = this.validateNotes(data.notes || []);
      const { validTasks, invalidTasks } = this.validateTasks(data.tasks || []);
      const { validReadings, invalidReadings } = this.validateTarotReadings(data.tarotReadings || []);

      // Add warnings for invalid items
      if (invalidNotes.length > 0) {
        warnings.push(`${invalidNotes.length} invalid note(s) will be skipped`);
      }
      if (invalidTasks.length > 0) {
        warnings.push(`${invalidTasks.length} invalid task(s) will be skipped`);
      }
      if (invalidReadings.length > 0) {
        warnings.push(`${invalidReadings.length} invalid tarot reading(s) will be skipped`);
      }

      return {
        success: errors.length === 0,
        data: {
          notes: validNotes,
          tasks: validTasks,
          tarotReadings: validReadings,
          version: data.version,
          exportDate: data.exportDate,
        },
        errors,
        warnings,
        stats: {
          notesImported: validNotes.length,
          tasksImported: validTasks.length,
          tarotReadingsImported: validReadings.length,
          duplicatesSkipped: 0, // Will be calculated during merge
        },
      };
    } catch (error) {
      errors.push(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Invalid JSON format'}`);
      return {
        success: false,
        errors,
        warnings,
        stats: {
          notesImported: 0,
          tasksImported: 0,
          tarotReadingsImported: 0,
          duplicatesSkipped: 0,
        },
      };
    }
  }

  /**
   * Convert plain text to notes
   * Requirements: 11.2
   */
  convertPlainTextToNotes(content: string): Note[] {
    const notes: Note[] = [];
    
    // Split by double newlines to separate notes
    const sections = content.split(/\n\s*\n/).filter(s => s.trim().length > 0);
    
    sections.forEach((section, index) => {
      const lines = section.trim().split('\n');
      const title = lines[0].trim() || `Imported Note ${index + 1}`;
      const noteContent = lines.slice(1).join('\n').trim() || lines[0].trim();
      
      const note: Note = {
        id: this.generateId(),
        title: title.substring(0, 100), // Limit title length
        content: noteContent,
        markdown: false,
        tags: ['imported'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      notes.push(note);
    });
    
    // If no sections found, create a single note with all content
    if (notes.length === 0 && content.trim().length > 0) {
      const lines = content.trim().split('\n');
      notes.push({
        id: this.generateId(),
        title: lines[0].substring(0, 100) || 'Imported Note',
        content: content.trim(),
        markdown: false,
        tags: ['imported'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    return notes;
  }

  /**
   * Detect duplicates in imported data
   * Requirements: 11.5
   */
  detectDuplicates(
    importedNotes: Note[],
    existingNotes: Note[],
    importedTasks: Task[],
    existingTasks: Task[]
  ): {
    duplicateNotes: Note[];
    duplicateTasks: Task[];
    uniqueNotes: Note[];
    uniqueTasks: Task[];
  } {
    const duplicateNotes: Note[] = [];
    const uniqueNotes: Note[] = [];
    
    importedNotes.forEach(note => {
      const isDuplicate = existingNotes.some(existing => 
        this.areNotesEqual(note, existing)
      );
      
      if (isDuplicate) {
        duplicateNotes.push(note);
      } else {
        uniqueNotes.push(note);
      }
    });
    
    const duplicateTasks: Task[] = [];
    const uniqueTasks: Task[] = [];
    
    importedTasks.forEach(task => {
      const isDuplicate = existingTasks.some(existing => 
        this.areTasksEqual(task, existing)
      );
      
      if (isDuplicate) {
        duplicateTasks.push(task);
      } else {
        uniqueTasks.push(task);
      }
    });
    
    return {
      duplicateNotes,
      duplicateTasks,
      uniqueNotes,
      uniqueTasks,
    };
  }

  /**
   * Validate import data structure
   * Requirements: 11.1
   */
  private validateImportData(data: any): ValidationError[] {
    const errors: ValidationError[] = [];
    
    if (!data || typeof data !== 'object') {
      errors.push({
        field: 'root',
        message: 'Import data must be a valid object',
      });
      return errors;
    }
    
    // Check for at least one data type
    if (!data.notes && !data.tasks && !data.tarotReadings) {
      errors.push({
        field: 'root',
        message: 'Import data must contain at least notes, tasks, or tarotReadings',
      });
    }
    
    // Validate arrays
    if (data.notes && !Array.isArray(data.notes)) {
      errors.push({
        field: 'notes',
        message: 'Notes must be an array',
      });
    }
    
    if (data.tasks && !Array.isArray(data.tasks)) {
      errors.push({
        field: 'tasks',
        message: 'Tasks must be an array',
      });
    }
    
    if (data.tarotReadings && !Array.isArray(data.tarotReadings)) {
      errors.push({
        field: 'tarotReadings',
        message: 'Tarot readings must be an array',
      });
    }
    
    return errors;
  }

  /**
   * Validate notes array
   */
  private validateNotes(notes: any[]): { validNotes: Note[]; invalidNotes: any[] } {
    const validNotes: Note[] = [];
    const invalidNotes: any[] = [];
    
    notes.forEach(note => {
      if (this.isValidNote(note)) {
        // Ensure dates are Date objects
        validNotes.push({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
          tags: Array.isArray(note.tags) ? note.tags : [],
          markdown: typeof note.markdown === 'boolean' ? note.markdown : false,
        });
      } else {
        invalidNotes.push(note);
      }
    });
    
    return { validNotes, invalidNotes };
  }

  /**
   * Validate tasks array
   */
  private validateTasks(tasks: any[]): { validTasks: Task[]; invalidTasks: any[] } {
    const validTasks: Task[] = [];
    const invalidTasks: any[] = [];
    
    tasks.forEach(task => {
      if (this.isValidTask(task)) {
        // Ensure dates are Date objects
        validTasks.push({
          ...task,
          createdAt: new Date(task.createdAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
          archivedAt: task.archivedAt ? new Date(task.archivedAt) : undefined,
          tags: Array.isArray(task.tags) ? task.tags : [],
          completed: typeof task.completed === 'boolean' ? task.completed : false,
          archived: typeof task.archived === 'boolean' ? task.archived : false,
        });
      } else {
        invalidTasks.push(task);
      }
    });
    
    return { validTasks, invalidTasks };
  }

  /**
   * Validate tarot readings array
   */
  private validateTarotReadings(readings: any[]): { validReadings: TarotReading[]; invalidReadings: any[] } {
    const validReadings: TarotReading[] = [];
    const invalidReadings: any[] = [];
    
    readings.forEach(reading => {
      if (this.isValidTarotReading(reading)) {
        validReadings.push({
          ...reading,
          date: new Date(reading.date),
        });
      } else {
        invalidReadings.push(reading);
      }
    });
    
    return { validReadings, invalidReadings };
  }

  /**
   * Check if note is valid
   */
  private isValidNote(note: any): boolean {
    return (
      note &&
      typeof note === 'object' &&
      typeof note.id === 'string' &&
      typeof note.title === 'string' &&
      typeof note.content === 'string' &&
      note.createdAt &&
      note.updatedAt
    );
  }

  /**
   * Check if task is valid
   */
  private isValidTask(task: any): boolean {
    return (
      task &&
      typeof task === 'object' &&
      typeof task.id === 'string' &&
      typeof task.title === 'string' &&
      typeof task.description === 'string' &&
      ['low', 'medium', 'high'].includes(task.priority) &&
      task.createdAt
    );
  }

  /**
   * Check if tarot reading is valid
   */
  private isValidTarotReading(reading: any): boolean {
    return (
      reading &&
      typeof reading === 'object' &&
      typeof reading.id === 'string' &&
      reading.date &&
      Array.isArray(reading.cards) &&
      typeof reading.interpretation === 'string' &&
      reading.commitStats
    );
  }

  /**
   * Check if two notes are equal (for duplicate detection)
   */
  private areNotesEqual(note1: Note, note2: Note): boolean {
    // Consider notes equal if they have the same title and content
    return (
      note1.title.trim().toLowerCase() === note2.title.trim().toLowerCase() &&
      note1.content.trim().toLowerCase() === note2.content.trim().toLowerCase()
    );
  }

  /**
   * Check if two tasks are equal (for duplicate detection)
   */
  private areTasksEqual(task1: Task, task2: Task): boolean {
    // Consider tasks equal if they have the same title and description
    return (
      task1.title.trim().toLowerCase() === task2.title.trim().toLowerCase() &&
      task1.description.trim().toLowerCase() === task2.description.trim().toLowerCase()
    );
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Parse file based on type
   * Requirements: 11.1, 11.2
   */
  parseFile(file: File): Promise<ImportResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
          if (file.type === 'application/json' || file.name.endsWith('.json')) {
            // Parse as JSON
            const result = this.parseJSON(content);
            resolve(result);
          } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            // Convert plain text to notes
            const notes = this.convertPlainTextToNotes(content);
            resolve({
              success: true,
              data: {
                notes,
                tasks: [],
                tarotReadings: [],
              },
              errors: [],
              warnings: notes.length === 0 ? ['No content found in text file'] : [],
              stats: {
                notesImported: notes.length,
                tasksImported: 0,
                tarotReadingsImported: 0,
                duplicatesSkipped: 0,
              },
            });
          } else {
            resolve({
              success: false,
              errors: [`Unsupported file type: ${file.type || 'unknown'}. Please use JSON or TXT files.`],
              warnings: [],
              stats: {
                notesImported: 0,
                tasksImported: 0,
                tarotReadingsImported: 0,
                duplicatesSkipped: 0,
              },
            });
          }
        } catch (error) {
          reject(new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }
}

// Export singleton instance
export const importService = new ImportService();
