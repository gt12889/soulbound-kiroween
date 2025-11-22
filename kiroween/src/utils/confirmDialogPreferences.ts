/**
 * Utility functions for managing ConfirmDialog preferences
 * Requirement 11.6: Store and retrieve "Don't ask again" preferences
 */

const PREFERENCE_PREFIX = 'confirmDialog.';

/**
 * Check if user has selected "Don't ask again" for a specific dialog
 */
export function shouldSkipConfirmation(key: string): boolean {
  const preference = localStorage.getItem(`${PREFERENCE_PREFIX}${key}`);
  return preference === 'true';
}

/**
 * Store user's "Don't ask again" preference
 */
export function setConfirmationPreference(key: string, skip: boolean): void {
  if (skip) {
    localStorage.setItem(`${PREFERENCE_PREFIX}${key}`, 'true');
  } else {
    localStorage.removeItem(`${PREFERENCE_PREFIX}${key}`);
  }
}

/**
 * Clear a specific confirmation preference
 */
export function clearConfirmationPreference(key: string): void {
  localStorage.removeItem(`${PREFERENCE_PREFIX}${key}`);
}

/**
 * Clear all confirmation preferences
 */
export function clearAllConfirmationPreferences(): void {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(PREFERENCE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Get all confirmation preferences
 */
export function getAllConfirmationPreferences(): Record<string, boolean> {
  const preferences: Record<string, boolean> = {};
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
    if (key.startsWith(PREFERENCE_PREFIX)) {
      const prefKey = key.replace(PREFERENCE_PREFIX, '');
      preferences[prefKey] = localStorage.getItem(key) === 'true';
    }
  });
  
  return preferences;
}
