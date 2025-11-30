import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isHapticSupported,
  triggerHaptic,
  cancelHaptic,
  hapticSuccess,
  hapticError,
  hapticLight,
} from './haptics';
import { settingsService } from '../services/settingsService';

describe('Haptics Utility', () => {
  let originalNavigator: Navigator;
  let vibrateMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Store original navigator
    originalNavigator = global.navigator;
    
    // Create mock vibrate function
    vibrateMock = vi.fn();
    
    // Mock navigator with vibrate support
    Object.defineProperty(global, 'navigator', {
      value: {
        ...originalNavigator,
        vibrate: vibrateMock,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore original navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
    vi.clearAllMocks();
  });

  describe('isHapticSupported', () => {
    it('should return true when vibrate API is available', () => {
      expect(isHapticSupported()).toBe(true);
    });

    it('should return false when vibrate API is not available', () => {
      // Remove vibrate from navigator
      const navigatorWithoutVibrate = { ...originalNavigator };
      delete (navigatorWithoutVibrate as any).vibrate;
      
      Object.defineProperty(global, 'navigator', {
        value: navigatorWithoutVibrate,
        writable: true,
        configurable: true,
      });

      expect(isHapticSupported()).toBe(false);
    });
  });

  describe('triggerHaptic', () => {
    it('should trigger light haptic pattern', () => {
      const result = triggerHaptic('light');
      expect(result).toBe(true);
      expect(vibrateMock).toHaveBeenCalledWith(10);
    });

    it('should trigger medium haptic pattern', () => {
      const result = triggerHaptic('medium');
      expect(result).toBe(true);
      expect(vibrateMock).toHaveBeenCalledWith(25);
    });

    it('should trigger heavy haptic pattern', () => {
      const result = triggerHaptic('heavy');
      expect(result).toBe(true);
      expect(vibrateMock).toHaveBeenCalledWith(50);
    });

    it('should trigger success haptic pattern', () => {
      const result = triggerHaptic('success');
      expect(result).toBe(true);
      expect(vibrateMock).toHaveBeenCalledWith([50, 50, 50]);
    });

    it('should trigger error haptic pattern', () => {
      const result = triggerHaptic('error');
      expect(result).toBe(true);
      expect(vibrateMock).toHaveBeenCalledWith([30, 30, 30, 30, 30]);
    });

    it('should default to light pattern when no pattern specified', () => {
      const result = triggerHaptic();
      expect(result).toBe(true);
      expect(vibrateMock).toHaveBeenCalledWith(10);
    });

    it('should return false when vibrate API is not supported', () => {
      // Remove vibrate from navigator
      const navigatorWithoutVibrate = { ...originalNavigator };
      delete (navigatorWithoutVibrate as any).vibrate;
      
      Object.defineProperty(global, 'navigator', {
        value: navigatorWithoutVibrate,
        writable: true,
        configurable: true,
      });

      const result = triggerHaptic('light');
      expect(result).toBe(false);
    });

    it('should handle vibrate API errors gracefully', () => {
      // Mock vibrate to throw an error
      vibrateMock.mockImplementation(() => {
        throw new Error('Vibrate failed');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const result = triggerHaptic('light');
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Haptic feedback failed:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('cancelHaptic', () => {
    it('should cancel ongoing vibration', () => {
      cancelHaptic();
      expect(vibrateMock).toHaveBeenCalledWith(0);
    });

    it('should not throw when vibrate API is not supported', () => {
      // Remove vibrate from navigator
      const navigatorWithoutVibrate = { ...originalNavigator };
      delete (navigatorWithoutVibrate as any).vibrate;
      
      Object.defineProperty(global, 'navigator', {
        value: navigatorWithoutVibrate,
        writable: true,
        configurable: true,
      });

      expect(() => cancelHaptic()).not.toThrow();
    });
  });

  describe('Convenience functions', () => {
    it('hapticSuccess should trigger success pattern', () => {
      const result = hapticSuccess();
      expect(result).toBe(true);
      expect(vibrateMock).toHaveBeenCalledWith([50, 50, 50]);
    });

    it('hapticError should trigger error pattern', () => {
      const result = hapticError();
      expect(result).toBe(true);
      expect(vibrateMock).toHaveBeenCalledWith([30, 30, 30, 30, 30]);
    });

    it('hapticLight should trigger light pattern', () => {
      const result = hapticLight();
      expect(result).toBe(true);
      expect(vibrateMock).toHaveBeenCalledWith(10);
    });
  });

  describe('Settings integration', () => {
    it('should not trigger haptic when disabled in settings', async () => {
      // Disable haptics in settings
      await settingsService.updateSettings({ hapticsEnabled: false });
      
      const result = triggerHaptic('light');
      expect(result).toBe(false);
      expect(vibrateMock).not.toHaveBeenCalled();
    });

    it('should trigger haptic when enabled in settings', async () => {
      // Enable haptics in settings
      await settingsService.updateSettings({ hapticsEnabled: true });
      
      const result = triggerHaptic('light');
      expect(result).toBe(true);
      expect(vibrateMock).toHaveBeenCalledWith(10);
    });

    it('should default to enabled when setting is not set', async () => {
      // Clear the setting
      await settingsService.updateSettings({ hapticsEnabled: undefined });
      
      const result = triggerHaptic('light');
      expect(result).toBe(true);
      expect(vibrateMock).toHaveBeenCalledWith(10);
    });
  });
});
