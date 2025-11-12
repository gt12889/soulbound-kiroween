/**
 * Keyboard shortcuts utility
 * Defines default shortcuts, key combination parsing, and conflict detection
 * Requirements: 9.1, 9.2, 9.3, 9.6
 */

export interface KeyboardShortcut {
  id: string;
  action: string;
  keys: string[];
  description: string;
  category: 'navigation' | 'actions' | 'search' | 'help';
  customizable: boolean;
}

/**
 * Default keyboard shortcuts for the application
 */
export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  // Navigation shortcuts (Ctrl+1-4 for modules)
  {
    id: 'nav-terminal-tarot',
    action: 'navigate-terminal-tarot',
    keys: ['Control', '1'],
    description: 'Navigate to Terminal Tarot',
    category: 'navigation',
    customizable: true,
  },
  {
    id: 'nav-ghost-writer',
    action: 'navigate-ghost-writer',
    keys: ['Control', '2'],
    description: 'Navigate to Ghost Writer',
    category: 'navigation',
    customizable: true,
  },
  {
    id: 'nav-necronomicon-notes',
    action: 'navigate-necronomicon-notes',
    keys: ['Control', '3'],
    description: 'Navigate to Necronomicon Notes',
    category: 'navigation',
    customizable: true,
  },
  {
    id: 'nav-graveyard-dashboard',
    action: 'navigate-graveyard-dashboard',
    keys: ['Control', '4'],
    description: 'Navigate to Graveyard Dashboard',
    category: 'navigation',
    customizable: true,
  },
  // Action shortcuts
  {
    id: 'action-new-note',
    action: 'create-note',
    keys: ['Control', 'n'],
    description: 'Create new note',
    category: 'actions',
    customizable: true,
  },
  {
    id: 'action-new-task',
    action: 'create-task',
    keys: ['Control', 't'],
    description: 'Create new task',
    category: 'actions',
    customizable: true,
  },
  {
    id: 'action-quick-capture',
    action: 'quick-capture',
    keys: ['Control', 'k'],
    description: 'Open quick capture',
    category: 'actions',
    customizable: true,
  },
  // Search shortcut
  {
    id: 'search',
    action: 'search',
    keys: ['Control', 'f'],
    description: 'Search in current module',
    category: 'search',
    customizable: true,
  },
  // Help shortcut
  {
    id: 'help',
    action: 'show-shortcuts',
    keys: ['Control', '/'],
    description: 'Show keyboard shortcuts',
    category: 'help',
    customizable: false,
  },
];

/**
 * Parse a keyboard event into a key combination string
 * @param event - Keyboard event
 * @returns Array of pressed keys (e.g., ['Control', 'k'])
 */
export function parseKeyEvent(event: KeyboardEvent): string[] {
  const keys: string[] = [];
  
  // Add modifier keys
  if (event.ctrlKey || event.metaKey) keys.push('Control');
  if (event.shiftKey) keys.push('Shift');
  if (event.altKey) keys.push('Alt');
  
  // Add the main key (normalize to lowercase for letters)
  const key = event.key;
  if (key && key !== 'Control' && key !== 'Shift' && key !== 'Alt' && key !== 'Meta') {
    // Normalize letter keys to lowercase
    keys.push(key.length === 1 ? key.toLowerCase() : key);
  }
  
  return keys;
}

/**
 * Convert key combination array to display string
 * @param keys - Array of keys
 * @returns Display string (e.g., "Ctrl+K")
 */
export function keysToString(keys: string[]): string {
  return keys
    .map(key => {
      // Map to display-friendly names
      if (key === 'Control') return 'Ctrl';
      if (key === 'Shift') return 'Shift';
      if (key === 'Alt') return 'Alt';
      return key.toUpperCase();
    })
    .join('+');
}

/**
 * Check if two key combinations match
 * @param keys1 - First key combination
 * @param keys2 - Second key combination
 * @returns True if combinations match
 */
export function keysMatch(keys1: string[], keys2: string[]): boolean {
  if (keys1.length !== keys2.length) return false;
  
  // Normalize and sort for comparison
  const normalize = (keys: string[]) => 
    keys.map(k => k.toLowerCase()).sort();
  
  const normalized1 = normalize(keys1);
  const normalized2 = normalize(keys2);
  
  return normalized1.every((key, index) => key === normalized2[index]);
}

/**
 * Detect conflicts in keyboard shortcuts
 * @param shortcuts - Array of shortcuts to check
 * @returns Array of conflicting shortcut pairs
 */
export function detectConflicts(
  shortcuts: KeyboardShortcut[]
): Array<{ shortcut1: KeyboardShortcut; shortcut2: KeyboardShortcut }> {
  const conflicts: Array<{ shortcut1: KeyboardShortcut; shortcut2: KeyboardShortcut }> = [];
  
  for (let i = 0; i < shortcuts.length; i++) {
    for (let j = i + 1; j < shortcuts.length; j++) {
      if (keysMatch(shortcuts[i].keys, shortcuts[j].keys)) {
        conflicts.push({
          shortcut1: shortcuts[i],
          shortcut2: shortcuts[j],
        });
      }
    }
  }
  
  return conflicts;
}

/**
 * Validate a key combination
 * @param keys - Key combination to validate
 * @returns True if valid, error message if invalid
 */
export function validateKeys(keys: string[]): { valid: boolean; error?: string } {
  if (keys.length === 0) {
    return { valid: false, error: 'Key combination cannot be empty' };
  }
  
  if (keys.length === 1 && ['Control', 'Shift', 'Alt'].includes(keys[0])) {
    return { valid: false, error: 'Modifier-only shortcuts are not allowed' };
  }
  
  // Check for valid key names
  const validModifiers = ['Control', 'Shift', 'Alt'];
  const hasModifier = keys.some(key => validModifiers.includes(key));
  
  if (!hasModifier) {
    return { valid: false, error: 'Shortcuts must include at least one modifier key (Ctrl, Shift, or Alt)' };
  }
  
  return { valid: true };
}
