/**
 * Export service for serializing and downloading user data
 * Handles data export to JSON format
 * Requirements: 7.5
 */

import type { Note, Task, AppSettings, TarotReading } from '../types';

export interface ExportData {
  version: string;
  exportDate: string;
  notes: Note[];
  tasks: Task[];
  settings: AppSettings;
  tarotReadings: TarotReading[];
}

class ExportService {
  private readonly version = '1.0.0';

  /**
   * Export all user data to JSON
   * Requirements: 7.5
   */
  exportData(
    notes: Note[],
    tasks: Task[],
    settings: AppSettings,
    tarotReadings: TarotReading[] = []
  ): ExportData {
    return {
      version: this.version,
      exportDate: new Date().toISOString(),
      notes,
      tasks,
      settings,
      tarotReadings,
    };
  }

  /**
   * Generate downloadable JSON file
   * Requirements: 7.5
   */
  downloadData(data: ExportData): void {
    try {
      // Serialize data to JSON with pretty formatting
      const jsonString = JSON.stringify(data, null, 2);
      
      // Create blob from JSON string
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.download = `dark-productivity-suite-${timestamp}.json`;
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
   * Export and download all user data
   * Requirements: 7.5
   */
  exportAndDownload(
    notes: Note[],
    tasks: Task[],
    settings: AppSettings,
    tarotReadings: TarotReading[] = []
  ): void {
    const data = this.exportData(notes, tasks, settings, tarotReadings);
    this.downloadData(data);
  }
}

// Export singleton instance
export const exportService = new ExportService();
