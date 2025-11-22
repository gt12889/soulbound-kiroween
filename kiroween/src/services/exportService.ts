/**
 * Export service for serializing and downloading user data
 * Handles data export to multiple formats (JSON, Markdown, CSV)
 * Supports date range filtering, data type selection, and encryption
 * Requirements: 7.5
 */

import type { Note, Task, AppSettings, TarotReading, PomodoroSession } from '../types';

export interface ExportData {
  version: string;
  exportDate: string;
  notes: Note[];
  tasks: Task[];
  settings: AppSettings;
  tarotReadings: TarotReading[];
  pomodoroSessions: PomodoroSession[];
}

export type ExportFormat = 'json' | 'markdown' | 'csv';

export interface ExportOptions {
  format: ExportFormat;
  includeNotes: boolean;
  includeTasks: boolean;
  includeSettings: boolean;
  includeTarotReadings: boolean;
  includePomodoroSessions: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  encrypt?: boolean;
  encryptionPassword?: string;
}

class ExportService {
  private readonly version = '1.0.0';

  /**
   * Filter items by date range
   */
  private filterByDateRange<T extends { createdAt: Date }>(
    items: T[],
    dateRange?: { start: Date; end: Date }
  ): T[] {
    if (!dateRange) return items;
    
    return items.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    });
  }

  /**
   * Simple encryption using base64 and XOR cipher
   * Note: This is basic encryption for demonstration. For production, use proper encryption libraries.
   */
  private encrypt(data: string, password: string): string {
    const key = this.generateKey(password);
    let encrypted = '';
    
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    
    return btoa(encrypted); // Base64 encode
  }

  /**
   * Generate encryption key from password
   */
  private generateKey(password: string): string {
    let key = password;
    while (key.length < 32) {
      key += password;
    }
    return key.substring(0, 32);
  }

  /**
   * Export data with filtering options
   * Requirements: 7.5
   */
  exportData(
    notes: Note[],
    tasks: Task[],
    settings: AppSettings,
    tarotReadings: TarotReading[] = [],
    pomodoroSessions: PomodoroSession[] = [],
    options: Partial<ExportOptions> = {}
  ): ExportData {
    const {
      includeNotes = true,
      includeTasks = true,
      includeSettings = true,
      includeTarotReadings = true,
      includePomodoroSessions = true,
      dateRange,
    } = options;

    return {
      version: this.version,
      exportDate: new Date().toISOString(),
      notes: includeNotes ? this.filterByDateRange(notes, dateRange) : [],
      tasks: includeTasks ? this.filterByDateRange(tasks, dateRange) : [],
      settings: includeSettings ? settings : {} as AppSettings,
      tarotReadings: includeTarotReadings ? tarotReadings.filter(reading => {
        if (!dateRange) return true;
        const readingDate = new Date(reading.date);
        return readingDate >= dateRange.start && readingDate <= dateRange.end;
      }) : [],
      pomodoroSessions: includePomodoroSessions ? pomodoroSessions.filter(session => {
        if (!dateRange) return true;
        const sessionDate = new Date(session.startTime);
        return sessionDate >= dateRange.start && sessionDate <= dateRange.end;
      }) : [],
    };
  }

  /**
   * Convert data to JSON format
   */
  private toJSON(data: ExportData): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Convert data to Markdown format
   */
  private toMarkdown(data: ExportData): string {
    let markdown = `# Dark Productivity Suite Export\n\n`;
    markdown += `**Export Date:** ${new Date(data.exportDate).toLocaleString()}\n`;
    markdown += `**Version:** ${data.version}\n\n`;

    // Notes section
    if (data.notes.length > 0) {
      markdown += `## Notes (${data.notes.length})\n\n`;
      data.notes.forEach(note => {
        markdown += `### ${note.title}\n\n`;
        markdown += `**Created:** ${new Date(note.createdAt).toLocaleString()}\n`;
        markdown += `**Updated:** ${new Date(note.updatedAt).toLocaleString()}\n`;
        if (note.tags.length > 0) {
          markdown += `**Tags:** ${note.tags.join(', ')}\n`;
        }
        markdown += `\n${note.content}\n\n`;
        markdown += `---\n\n`;
      });
    }

    // Tasks section
    if (data.tasks.length > 0) {
      markdown += `## Tasks (${data.tasks.length})\n\n`;
      data.tasks.forEach(task => {
        const checkbox = task.completed ? '[x]' : '[ ]';
        markdown += `${checkbox} **${task.title}** (${task.priority})\n`;
        markdown += `   - ${task.description}\n`;
        markdown += `   - Created: ${new Date(task.createdAt).toLocaleString()}\n`;
        if (task.tags.length > 0) {
          markdown += `   - Tags: ${task.tags.join(', ')}\n`;
        }
        if (task.completed && task.completedAt) {
          markdown += `   - Completed: ${new Date(task.completedAt).toLocaleString()}\n`;
        }
        if (task.archived && task.archivedAt) {
          markdown += `   - Archived: ${new Date(task.archivedAt).toLocaleString()}\n`;
        }
        markdown += `\n`;
      });
    }

    // Tarot Readings section
    if (data.tarotReadings.length > 0) {
      markdown += `## Tarot Readings (${data.tarotReadings.length})\n\n`;
      data.tarotReadings.forEach(reading => {
        markdown += `### Reading - ${new Date(reading.date).toLocaleString()}\n\n`;
        markdown += `**Interpretation:** ${reading.interpretation}\n\n`;
        markdown += `**Cards:**\n`;
        reading.cards.forEach(card => {
          markdown += `- ${card.position}: ${card.name} - ${card.meaning}\n`;
        });
        markdown += `\n**Commit Stats:**\n`;
        markdown += `- Total Commits: ${reading.commitStats.totalCommits}\n`;
        markdown += `- Average Commits/Day: ${reading.commitStats.averageCommitsPerDay.toFixed(2)}\n`;
        markdown += `- Most Active Hour: ${reading.commitStats.mostActiveHour}:00\n`;
        markdown += `\n---\n\n`;
      });
    }

    // Pomodoro Sessions section
    if (data.pomodoroSessions.length > 0) {
      markdown += `## Pomodoro Sessions (${data.pomodoroSessions.length})\n\n`;
      const completedSessions = data.pomodoroSessions.filter(s => s.completed);
      markdown += `**Completed Sessions:** ${completedSessions.length}\n\n`;
      data.pomodoroSessions.forEach(session => {
        markdown += `- ${session.type === 'work' ? '🍅' : '☕'} ${session.type.toUpperCase()}: `;
        markdown += `${session.duration} min - ${new Date(session.startTime).toLocaleString()}`;
        if (session.completed) {
          markdown += ` ✓`;
        }
        markdown += `\n`;
      });
    }

    return markdown;
  }

  /**
   * Convert data to CSV format
   */
  private toCSV(data: ExportData): string {
    let csv = '';

    // Notes CSV
    if (data.notes.length > 0) {
      csv += 'NOTES\n';
      csv += 'Title,Content,Tags,Created,Updated,Markdown\n';
      data.notes.forEach(note => {
        const title = this.escapeCSV(note.title);
        const content = this.escapeCSV(note.content);
        const tags = this.escapeCSV(note.tags.join('; '));
        const created = new Date(note.createdAt).toISOString();
        const updated = new Date(note.updatedAt).toISOString();
        csv += `${title},${content},${tags},${created},${updated},${note.markdown}\n`;
      });
      csv += '\n';
    }

    // Tasks CSV
    if (data.tasks.length > 0) {
      csv += 'TASKS\n';
      csv += 'Title,Description,Priority,Completed,Archived,Tags,Created,Completed At,Archived At\n';
      data.tasks.forEach(task => {
        const title = this.escapeCSV(task.title);
        const description = this.escapeCSV(task.description);
        const tags = this.escapeCSV(task.tags.join('; '));
        const created = new Date(task.createdAt).toISOString();
        const completedAt = task.completedAt ? new Date(task.completedAt).toISOString() : '';
        const archivedAt = task.archivedAt ? new Date(task.archivedAt).toISOString() : '';
        csv += `${title},${description},${task.priority},${task.completed},${task.archived},${tags},${created},${completedAt},${archivedAt}\n`;
      });
      csv += '\n';
    }

    // Pomodoro Sessions CSV
    if (data.pomodoroSessions.length > 0) {
      csv += 'POMODORO SESSIONS\n';
      csv += 'Type,Duration,Start Time,End Time,Completed\n';
      data.pomodoroSessions.forEach(session => {
        const startTime = new Date(session.startTime).toISOString();
        const endTime = session.endTime ? new Date(session.endTime).toISOString() : '';
        csv += `${session.type},${session.duration},${startTime},${endTime},${session.completed}\n`;
      });
    }

    return csv;
  }

  /**
   * Escape CSV special characters
   */
  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Generate downloadable file with specified format
   * Requirements: 7.5
   */
  downloadData(
    data: ExportData,
    options: ExportOptions
  ): void {
    try {
      let content: string;
      let mimeType: string;
      let extension: string;

      // Convert to specified format
      switch (options.format) {
        case 'json':
          content = this.toJSON(data);
          mimeType = 'application/json';
          extension = 'json';
          break;
        case 'markdown':
          content = this.toMarkdown(data);
          mimeType = 'text/markdown';
          extension = 'md';
          break;
        case 'csv':
          content = this.toCSV(data);
          mimeType = 'text/csv';
          extension = 'csv';
          break;
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }

      // Encrypt if requested
      if (options.encrypt && options.encryptionPassword) {
        content = this.encrypt(content, options.encryptionPassword);
        extension += '.encrypted';
        mimeType = 'application/octet-stream';
      }

      // Create blob from content
      const blob = new Blob([content], { type: mimeType });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.download = `dark-productivity-suite-${timestamp}.${extension}`;
      link.href = url;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading data:', error);
      throw new Error(`Failed to download data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export and download data with options
   * Requirements: 7.5
   */
  exportAndDownload(
    notes: Note[],
    tasks: Task[],
    settings: AppSettings,
    tarotReadings: TarotReading[] = [],
    pomodoroSessions: PomodoroSession[] = [],
    options: ExportOptions
  ): void {
    const data = this.exportData(notes, tasks, settings, tarotReadings, pomodoroSessions, options);
    this.downloadData(data, options);
  }
}

// Export singleton instance
export const exportService = new ExportService();
