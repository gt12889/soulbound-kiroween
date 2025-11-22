/**
 * Haptic Feedback Utility
 * Provides vibration feedback for mobile devices with browser support detection
 */

import { settingsService } from '../services/settingsService';

export type HapticPattern = 'success' | 'error' | 'light' | 'medium' | 'heavy';

interface HapticPatterns {
  [key: string]: number | number[];
}

/**
 * Predefined haptic patterns
 * - success: Short double pulse (feels positive)
 * - error: Three short pulses (feels negative)
 * - light: Single short pulse
 * - medium: Single medium pulse
 * - heavy: Single long pulse
 */
const HAPTIC_PATTERNS: HapticPatterns = {
  success: [50, 50, 50], // Short-pause-short
  error: [30, 30, 30, 30, 30], // Three quick pulses
  light: 10,
  medium: 25,
  heavy: 50,
};

/**
 * Check if the Vibration API is supported in the current browser
 */
export const isHapticSupported = (): boolean => {
  return 'vibrate' in navigator;
};

/**
 * Check if haptics are enabled in user settings
 */
const isHapticsEnabled = (): boolean => {
  const settings = settingsService.getSettings();
  return settings.hapticsEnabled !== false; // Default to true if not set
};

/**
 * Trigger haptic feedback with the specified pattern
 * @param pattern - The haptic pattern to use
 * @returns true if vibration was triggered, false if not supported or disabled
 */
export const triggerHaptic = (pattern: HapticPattern = 'light'): boolean => {
  if (!isHapticSupported() || !isHapticsEnabled()) {
    return false;
  }

  try {
    const vibrationPattern = HAPTIC_PATTERNS[pattern];
    navigator.vibrate(vibrationPattern);
    return true;
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
    return false;
  }
};

/**
 * Cancel any ongoing vibration
 */
export const cancelHaptic = (): void => {
  if (isHapticSupported()) {
    navigator.vibrate(0);
  }
};

/**
 * Trigger success haptic feedback (for accepting suggestions)
 */
export const hapticSuccess = (): boolean => {
  return triggerHaptic('success');
};

/**
 * Trigger error haptic feedback (for errors or rejections)
 */
export const hapticError = (): boolean => {
  return triggerHaptic('error');
};

/**
 * Trigger light haptic feedback (for button presses)
 */
export const hapticLight = (): boolean => {
  return triggerHaptic('light');
};
