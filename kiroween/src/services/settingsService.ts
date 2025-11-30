/**
 * Settings Service
 * Centralized service for managing all application settings
 * Handles persistence to local storage and cloud sync
 * Requirements: 10.3, 17.3
 */

import { storageService } from './storageService';
import { cloudSyncService } from './cloudSyncService';
import type { AppSettings, KeyboardShortcut } from '../types';
import type { ThemeId } from '../themes';

export interface ComprehensiveSettings extends AppSettings {
  theme?: ThemeId;
  keyboardShortcuts?: KeyboardShortcut[];
  pomodoroWorkDuration?: number;
  pomodoroBreakDuration?: number;
  autoArchiveDays?: number;
  enableNotifications?: boolean;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
  hapticsEnabled?: boolean;
}

const DEFAULT_COMPREHENSIVE_SETTINGS: ComprehensiveSettings = {
  audioEnabled: false,
  audioVolume: 50,
  lastModule: 'graveyard-dashboard',
  theme: 'default-dark',
  pomodoroWorkDuration: 25,
  pomodoroBreakDuration: 5,
  autoArchiveDays: 30,
  enableNotifications: true,
  enableAutoSave: true,
  autoSaveInterval: 1000,
  hapticsEnabled: true,
};

class SettingsService {
  private readonly SETTINGS_KEY = 'settings';
  private settingsCache: ComprehensiveSettings | null = null;

  /**
   * Get all settings from local storage
   * Returns cached settings if available
   */
  getSettings(): ComprehensiveSettings {
    if (this.settingsCache) {
      return this.settingsCache;
    }

    const settings = storageService.get<ComprehensiveSettings>(this.SETTINGS_KEY);
    this.settingsCache = settings || DEFAULT_COMPREHENSIVE_SETTINGS;
    return this.settingsCache;
  }

  /**
   * Update settings (partial update)
   * Saves to local storage and syncs to cloud if authenticated
   */
  async updateSettings(
    updates: Partial<ComprehensiveSettings>,
    userId?: string
  ): Promise<void> {
    const currentSettings = this.getSettings();
    const newSettings = { ...currentSettings, ...updates };

    // Update cache
    this.settingsCache = newSettings;

    // Save to local storage
    storageService.set(this.SETTINGS_KEY, newSettings);
    console.log('Settings updated in local storage:', updates);

    // Sync to cloud if user is authenticated
    if (userId) {
      try {
        await cloudSyncService.syncSettings(userId, newSettings);
        console.log('Settings synced to cloud');
      } catch (error) {
        console.error('Failed to sync settings to cloud:', error);
        // Don't throw - local save succeeded
      }
    }
  }

  /**
   * Load settings from cloud and merge with local settings
   * Prefers cloud settings for conflicts
   */
  async loadFromCloud(userId: string): Promise<ComprehensiveSettings> {
    try {
      console.log('Loading settings from cloud...');
      const cloudSettings = await cloudSyncService.fetchSettings(userId);

      if (cloudSettings) {
        const localSettings = this.getSettings();
        
        // Merge settings, preferring cloud data
        const mergedSettings: ComprehensiveSettings = {
          ...localSettings,
          ...cloudSettings,
        };

        // Update cache and local storage
        this.settingsCache = mergedSettings;
        storageService.set(this.SETTINGS_KEY, mergedSettings);
        
        console.log('Settings loaded and merged from cloud');
        return mergedSettings;
      }

      return this.getSettings();
    } catch (error) {
      console.error('Failed to load settings from cloud:', error);
      return this.getSettings();
    }
  }

  /**
   * Sync current settings to cloud
   */
  async syncToCloud(userId: string): Promise<void> {
    const settings = this.getSettings();
    await cloudSyncService.syncSettings(userId, settings);
    console.log('Settings synced to cloud');
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(userId?: string): Promise<void> {
    this.settingsCache = DEFAULT_COMPREHENSIVE_SETTINGS;
    storageService.set(this.SETTINGS_KEY, DEFAULT_COMPREHENSIVE_SETTINGS);
    console.log('Settings reset to defaults');

    if (userId) {
      try {
        await cloudSyncService.syncSettings(userId, DEFAULT_COMPREHENSIVE_SETTINGS);
        console.log('Default settings synced to cloud');
      } catch (error) {
        console.error('Failed to sync default settings to cloud:', error);
      }
    }
  }

  /**
   * Get a specific setting value
   */
  getSetting<K extends keyof ComprehensiveSettings>(
    key: K
  ): ComprehensiveSettings[K] {
    const settings = this.getSettings();
    return settings[key];
  }

  /**
   * Set a specific setting value
   */
  async setSetting<K extends keyof ComprehensiveSettings>(
    key: K,
    value: ComprehensiveSettings[K],
    userId?: string
  ): Promise<void> {
    await this.updateSettings({ [key]: value } as Partial<ComprehensiveSettings>, userId);
  }

  /**
   * Export settings as JSON
   */
  exportSettings(): string {
    const settings = this.getSettings();
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import settings from JSON
   */
  async importSettings(
    jsonString: string,
    userId?: string,
    merge: boolean = true
  ): Promise<void> {
    try {
      const importedSettings = JSON.parse(jsonString) as Partial<ComprehensiveSettings>;
      
      if (merge) {
        await this.updateSettings(importedSettings, userId);
      } else {
        this.settingsCache = { ...DEFAULT_COMPREHENSIVE_SETTINGS, ...importedSettings };
        storageService.set(this.SETTINGS_KEY, this.settingsCache);
        
        if (userId) {
          await cloudSyncService.syncSettings(userId, this.settingsCache);
        }
      }
      
      console.log('Settings imported successfully');
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw new Error('Invalid settings format');
    }
  }

  /**
   * Clear settings cache (useful for testing or logout)
   */
  clearCache(): void {
    this.settingsCache = null;
  }

  /**
   * Get settings initialization status
   */
  isInitialized(): boolean {
    return this.settingsCache !== null;
  }

  /**
   * Initialize settings on app startup
   * Loads from local storage and optionally syncs with cloud
   */
  async initialize(userId?: string): Promise<ComprehensiveSettings> {
    console.log('Initializing settings service...');
    
    // Load from local storage first
    const localSettings = this.getSettings();
    
    // If authenticated, load and merge with cloud
    if (userId) {
      return await this.loadFromCloud(userId);
    }
    
    return localSettings;
  }

  /**
   * Subscribe to settings changes across tabs
   */
  subscribeToChanges(callback: (settings: ComprehensiveSettings) => void): () => void {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === `darkprod_${this.SETTINGS_KEY}`) {
        // Clear cache to force reload
        this.clearCache();
        const newSettings = this.getSettings();
        callback(newSettings);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }

  /**
   * Validate settings object
   */
  validateSettings(settings: Partial<ComprehensiveSettings>): boolean {
    // Basic validation
    if (settings.audioVolume !== undefined) {
      if (settings.audioVolume < 0 || settings.audioVolume > 100) {
        return false;
      }
    }

    if (settings.pomodoroWorkDuration !== undefined) {
      if (settings.pomodoroWorkDuration < 1 || settings.pomodoroWorkDuration > 120) {
        return false;
      }
    }

    if (settings.pomodoroBreakDuration !== undefined) {
      if (settings.pomodoroBreakDuration < 1 || settings.pomodoroBreakDuration > 60) {
        return false;
      }
    }

    if (settings.autoArchiveDays !== undefined) {
      if (settings.autoArchiveDays < 1 || settings.autoArchiveDays > 365) {
        return false;
      }
    }

    if (settings.autoSaveInterval !== undefined) {
      if (settings.autoSaveInterval < 100 || settings.autoSaveInterval > 10000) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get settings summary for display
   */
  getSettingsSummary(): {
    totalSettings: number;
    customizedSettings: number;
    lastModified: Date | null;
  } {
    const settings = this.getSettings();
    const defaults = DEFAULT_COMPREHENSIVE_SETTINGS;
    
    let customizedCount = 0;
    for (const key in settings) {
      if (settings[key as keyof ComprehensiveSettings] !== defaults[key as keyof ComprehensiveSettings]) {
        customizedCount++;
      }
    }

    return {
      totalSettings: Object.keys(settings).length,
      customizedSettings: customizedCount,
      lastModified: null, // Could be tracked separately
    };
  }
}

// Export singleton instance
export const settingsService = new SettingsService();
