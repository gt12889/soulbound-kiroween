import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  DEFAULT_SHORTCUTS,
  parseKeyEvent,
  keysMatch,
  detectConflicts,
  type KeyboardShortcut,
} from '../utils/keyboardShortcuts';

interface KeyboardContextType {
  // Shortcuts state
  shortcuts: KeyboardShortcut[];
  
  // Shortcut registration
  registerShortcut: (shortcut: KeyboardShortcut, callback: () => void) => void;
  unregisterShortcut: (shortcutId: string) => void;
  
  // Shortcut customization
  updateShortcut: (shortcutId: string, newKeys: string[]) => void;
  resetShortcut: (shortcutId: string) => void;
  resetAllShortcuts: () => void;
  
  // Conflict detection
  conflicts: Array<{ shortcut1: KeyboardShortcut; shortcut2: KeyboardShortcut }>;
  
  // Shortcuts panel visibility
  showShortcutsPanel: boolean;
  setShowShortcutsPanel: (show: boolean) => void;
}

const KeyboardContext = createContext<KeyboardContextType | undefined>(undefined);

interface KeyboardProviderProps {
  children: ReactNode;
}

/**
 * KeyboardProvider component
 * Manages global keyboard shortcuts, registration, and customization
 * Requirements: 9.5
 */
export function KeyboardProvider({ children }: KeyboardProviderProps) {
  // Persist custom shortcuts to LocalStorage
  const [shortcuts, setShortcuts] = useLocalStorage<KeyboardShortcut[]>(
    'keyboard-shortcuts',
    DEFAULT_SHORTCUTS
  );
  
  // Callbacks registry (not persisted)
  const callbacksRef = useRef<Map<string, () => void>>(new Map());
  
  // Shortcuts panel visibility
  const [showShortcutsPanel, setShowShortcutsPanel] = useState(false);
  
  // Detect conflicts
  const conflicts = detectConflicts(shortcuts);

  /**
   * Register a shortcut with its callback
   */
  const registerShortcut = useCallback((shortcut: KeyboardShortcut, callback: () => void) => {
    callbacksRef.current.set(shortcut.id, callback);
  }, []);

  /**
   * Unregister a shortcut
   */
  const unregisterShortcut = useCallback((shortcutId: string) => {
    callbacksRef.current.delete(shortcutId);
  }, []);

  /**
   * Update a shortcut's key combination
   */
  const updateShortcut = useCallback((shortcutId: string, newKeys: string[]) => {
    setShortcuts(prev =>
      prev.map(shortcut =>
        shortcut.id === shortcutId
          ? { ...shortcut, keys: newKeys }
          : shortcut
      )
    );
  }, [setShortcuts]);

  /**
   * Reset a shortcut to its default keys
   */
  const resetShortcut = useCallback((shortcutId: string) => {
    const defaultShortcut = DEFAULT_SHORTCUTS.find(s => s.id === shortcutId);
    if (defaultShortcut) {
      updateShortcut(shortcutId, defaultShortcut.keys);
    }
  }, [updateShortcut]);

  /**
   * Reset all shortcuts to defaults
   */
  const resetAllShortcuts = useCallback(() => {
    setShortcuts(DEFAULT_SHORTCUTS);
  }, [setShortcuts]);

  /**
   * Global keyboard event listener
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Parse the key combination
      const pressedKeys = parseKeyEvent(event);
      
      // Find matching shortcut
      const matchedShortcut = shortcuts.find(shortcut =>
        keysMatch(shortcut.keys, pressedKeys)
      );
      
      if (matchedShortcut) {
        // Special handling for shortcuts panel
        if (matchedShortcut.action === 'show-shortcuts') {
          event.preventDefault();
          setShowShortcutsPanel(prev => !prev);
          return;
        }
        
        // Execute registered callback
        const callback = callbacksRef.current.get(matchedShortcut.id);
        if (callback) {
          event.preventDefault();
          callback();
        }
      }
    };

    // Add global listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);

  const value: KeyboardContextType = {
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    updateShortcut,
    resetShortcut,
    resetAllShortcuts,
    conflicts,
    showShortcutsPanel,
    setShowShortcutsPanel,
  };

  return <KeyboardContext.Provider value={value}>{children}</KeyboardContext.Provider>;
}

/**
 * Hook to access KeyboardContext
 * @throws Error if used outside KeyboardProvider
 */
export function useKeyboard(): KeyboardContextType {
  const context = useContext(KeyboardContext);
  if (context === undefined) {
    throw new Error('useKeyboard must be used within a KeyboardProvider');
  }
  return context;
}
