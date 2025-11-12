import { useEffect, useRef } from 'react';
import { useKeyboard } from '../contexts/KeyboardContext';
import type { KeyboardShortcut } from '../utils/keyboardShortcuts';

/**
 * Hook for component-level keyboard shortcut registration
 * Automatically registers shortcuts on mount and cleans up on unmount
 * Requirements: 9.6
 * 
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   {
 *     id: 'my-action',
 *     action: 'my-action',
 *     keys: ['Control', 's'],
 *     description: 'Save document',
 *     category: 'actions',
 *     customizable: true,
 *   }
 * ], {
 *   'my-action': () => handleSave(),
 * });
 * ```
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  callbacks: Record<string, () => void>
): void {
  const { registerShortcut, unregisterShortcut } = useKeyboard();
  
  // Use ref to store callbacks to avoid re-registering on every render
  const callbacksRef = useRef(callbacks);
  
  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    // Register all shortcuts with their callbacks
    shortcuts.forEach(shortcut => {
      const callback = callbacksRef.current[shortcut.action];
      if (callback) {
        registerShortcut(shortcut, callback);
      }
    });

    // Cleanup: unregister all shortcuts on unmount
    return () => {
      shortcuts.forEach(shortcut => {
        unregisterShortcut(shortcut.id);
      });
    };
  }, [shortcuts, registerShortcut, unregisterShortcut]);
}

/**
 * Hook for registering a single keyboard shortcut
 * Convenience wrapper around useKeyboardShortcuts for single shortcuts
 * 
 * @example
 * ```tsx
 * useKeyboardShortcut(
 *   {
 *     id: 'save',
 *     action: 'save',
 *     keys: ['Control', 's'],
 *     description: 'Save',
 *     category: 'actions',
 *     customizable: true,
 *   },
 *   handleSave
 * );
 * ```
 */
export function useKeyboardShortcut(
  shortcut: KeyboardShortcut,
  callback: () => void
): void {
  useKeyboardShortcuts([shortcut], { [shortcut.action]: callback });
}
