/**
 * Tests for Settings Service
 * Verifies settings persistence to local storage and cloud sync
 * Requirements: 10.3, 17.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { settingsService } from '../../services/settingsService';
import { storageService } from '../../services/storageService';
import { cloudSyncService } from '../../services/cloudSyncService';

// Mock the services
vi.mock('../../services/storageService', () => ({
  storageService: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('../../services/cloudSyncService', () => ({
  cloudSyncService: {
    fetchSettings: vi.fn(),
    syncSettings: vi.fn(),
  },
}));

describe('SettingsService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    settingsService.clearCache();
  });

  describe('getSettings', () => {
    it('should return default settings when no settings exist', () => {
      vi.mocked(storageService.get).mockReturnValue(null);
      
      const settings = settingsService.getSettings();
      
      expect(settings).toBeDefined();
      expect(settings.audioEnabled).toBe(false);
      expect(settings.audioVolume).toBe(50);
      expect(settings.lastModule).toBe('graveyard-dashboard');
    });

    it('should return cached settings on subsequent calls', () => {
      vi.mocked(storageService.get).mockReturnValue({
        audioEnabled: true,
        audioVolume: 75,
        lastModule: 'terminal-tarot',
      });
      
      // First call loads from storage
      const settings1 = settingsService.getSettings();
      expect(storageService.get).toHaveBeenCalledTimes(1);
      
      // Second call uses cache
      const settings2 = settingsService.getSettings();
      expect(storageService.get).toHaveBeenCalledTimes(1);
      expect(settings1).toBe(settings2);
    });
  });

  describe('updateSettings', () => {
    it('should update settings in local storage', async () => {
      vi.mocked(storageService.get).mockReturnValue({
        audioEnabled: false,
        audioVolume: 50,
        lastModule: 'graveyard-dashboard',
      });
      
      await settingsService.updateSettings({
        audioEnabled: true,
        audioVolume: 80,
      });
      
      expect(storageService.set).toHaveBeenCalledWith(
        'settings',
        expect.objectContaining({
          audioEnabled: true,
          audioVolume: 80,
        })
      );
    });

    it('should sync settings to cloud when userId is provided', async () => {
      vi.mocked(storageService.get).mockReturnValue({
        audioEnabled: false,
        audioVolume: 50,
        lastModule: 'graveyard-dashboard',
      });
      
      await settingsService.updateSettings(
        { audioEnabled: true },
        'user123'
      );
      
      expect(cloudSyncService.syncSettings).toHaveBeenCalledWith(
        'user123',
        expect.objectContaining({ audioEnabled: true })
      );
    });

    it('should not throw if cloud sync fails', async () => {
      vi.mocked(storageService.get).mockReturnValue({
        audioEnabled: false,
        audioVolume: 50,
        lastModule: 'graveyard-dashboard',
      });
      vi.mocked(cloudSyncService.syncSettings).mockRejectedValue(
        new Error('Network error')
      );
      
      await expect(
        settingsService.updateSettings({ audioEnabled: true }, 'user123')
      ).resolves.not.toThrow();
      
      // Local storage should still be updated
      expect(storageService.set).toHaveBeenCalled();
    });
  });

  describe('loadFromCloud', () => {
    it('should load and merge settings from cloud', async () => {
      const localSettings = {
        audioEnabled: false,
        audioVolume: 50,
        lastModule: 'graveyard-dashboard',
      };
      
      const cloudSettings = {
        audioEnabled: true,
        audioVolume: 75,
        theme: 'blood-moon',
      };
      
      vi.mocked(storageService.get).mockReturnValue(localSettings);
      vi.mocked(cloudSyncService.fetchSettings).mockResolvedValue(cloudSettings);
      
      const result = await settingsService.loadFromCloud('user123');
      
      expect(result).toEqual(expect.objectContaining({
        audioEnabled: true, // From cloud
        audioVolume: 75, // From cloud
        lastModule: 'graveyard-dashboard', // From local
        theme: 'blood-moon', // From cloud
      }));
      
      expect(storageService.set).toHaveBeenCalledWith(
        'settings',
        expect.objectContaining(cloudSettings)
      );
    });

    it('should return local settings if cloud fetch fails', async () => {
      const localSettings = {
        audioEnabled: false,
        audioVolume: 50,
        lastModule: 'graveyard-dashboard',
      };
      
      vi.mocked(storageService.get).mockReturnValue(localSettings);
      vi.mocked(cloudSyncService.fetchSettings).mockRejectedValue(
        new Error('Network error')
      );
      
      const result = await settingsService.loadFromCloud('user123');
      
      expect(result).toEqual(expect.objectContaining(localSettings));
    });
  });

  describe('resetSettings', () => {
    it('should reset settings to defaults', async () => {
      await settingsService.resetSettings();
      
      expect(storageService.set).toHaveBeenCalledWith(
        'settings',
        expect.objectContaining({
          audioEnabled: false,
          audioVolume: 50,
          lastModule: 'graveyard-dashboard',
        })
      );
    });

    it('should sync default settings to cloud when userId is provided', async () => {
      await settingsService.resetSettings('user123');
      
      expect(cloudSyncService.syncSettings).toHaveBeenCalledWith(
        'user123',
        expect.objectContaining({
          audioEnabled: false,
          audioVolume: 50,
        })
      );
    });
  });

  describe('getSetting', () => {
    it('should get a specific setting value', () => {
      vi.mocked(storageService.get).mockReturnValue({
        audioEnabled: true,
        audioVolume: 75,
        lastModule: 'terminal-tarot',
      });
      
      const audioEnabled = settingsService.getSetting('audioEnabled');
      const audioVolume = settingsService.getSetting('audioVolume');
      
      expect(audioEnabled).toBe(true);
      expect(audioVolume).toBe(75);
    });
  });

  describe('setSetting', () => {
    it('should set a specific setting value', async () => {
      vi.mocked(storageService.get).mockReturnValue({
        audioEnabled: false,
        audioVolume: 50,
        lastModule: 'graveyard-dashboard',
      });
      
      await settingsService.setSetting('audioVolume', 90);
      
      expect(storageService.set).toHaveBeenCalledWith(
        'settings',
        expect.objectContaining({ audioVolume: 90 })
      );
    });
  });

  describe('validateSettings', () => {
    it('should validate audio volume range', () => {
      expect(settingsService.validateSettings({ audioVolume: 50 })).toBe(true);
      expect(settingsService.validateSettings({ audioVolume: 0 })).toBe(true);
      expect(settingsService.validateSettings({ audioVolume: 100 })).toBe(true);
      expect(settingsService.validateSettings({ audioVolume: -1 })).toBe(false);
      expect(settingsService.validateSettings({ audioVolume: 101 })).toBe(false);
    });

    it('should validate pomodoro durations', () => {
      expect(settingsService.validateSettings({ pomodoroWorkDuration: 25 })).toBe(true);
      expect(settingsService.validateSettings({ pomodoroWorkDuration: 0 })).toBe(false);
      expect(settingsService.validateSettings({ pomodoroWorkDuration: 121 })).toBe(false);
      
      expect(settingsService.validateSettings({ pomodoroBreakDuration: 5 })).toBe(true);
      expect(settingsService.validateSettings({ pomodoroBreakDuration: 0 })).toBe(false);
      expect(settingsService.validateSettings({ pomodoroBreakDuration: 61 })).toBe(false);
    });

    it('should validate auto-archive days', () => {
      expect(settingsService.validateSettings({ autoArchiveDays: 30 })).toBe(true);
      expect(settingsService.validateSettings({ autoArchiveDays: 0 })).toBe(false);
      expect(settingsService.validateSettings({ autoArchiveDays: 366 })).toBe(false);
    });
  });

  describe('exportSettings and importSettings', () => {
    it('should export settings as JSON string', () => {
      vi.mocked(storageService.get).mockReturnValue({
        audioEnabled: true,
        audioVolume: 75,
        lastModule: 'terminal-tarot',
      });
      
      const exported = settingsService.exportSettings();
      const parsed = JSON.parse(exported);
      
      expect(parsed.audioEnabled).toBe(true);
      expect(parsed.audioVolume).toBe(75);
    });

    it('should import settings from JSON string', async () => {
      const settingsJson = JSON.stringify({
        audioEnabled: true,
        audioVolume: 90,
        theme: 'midnight-forest',
      });
      
      vi.mocked(storageService.get).mockReturnValue({
        audioEnabled: false,
        audioVolume: 50,
        lastModule: 'graveyard-dashboard',
      });
      
      await settingsService.importSettings(settingsJson);
      
      expect(storageService.set).toHaveBeenCalledWith(
        'settings',
        expect.objectContaining({
          audioEnabled: true,
          audioVolume: 90,
          theme: 'midnight-forest',
        })
      );
    });

    it('should throw error for invalid JSON', async () => {
      await expect(
        settingsService.importSettings('invalid json')
      ).rejects.toThrow('Invalid settings format');
    });
  });

  describe('initialize', () => {
    it('should initialize settings from local storage', async () => {
      const localSettings = {
        audioEnabled: true,
        audioVolume: 75,
        lastModule: 'terminal-tarot',
      };
      
      vi.mocked(storageService.get).mockReturnValue(localSettings);
      
      const result = await settingsService.initialize();
      
      expect(result).toEqual(expect.objectContaining(localSettings));
    });

    it('should load from cloud when userId is provided', async () => {
      const cloudSettings = {
        audioEnabled: true,
        audioVolume: 90,
        theme: 'blood-moon',
      };
      
      vi.mocked(storageService.get).mockReturnValue({});
      vi.mocked(cloudSyncService.fetchSettings).mockResolvedValue(cloudSettings);
      
      const result = await settingsService.initialize('user123');
      
      expect(cloudSyncService.fetchSettings).toHaveBeenCalledWith('user123');
      expect(result).toEqual(expect.objectContaining(cloudSettings));
    });
  });
});
