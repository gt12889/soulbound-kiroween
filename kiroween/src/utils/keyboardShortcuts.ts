/**
 * Keyboard shortcuts utility
 * Defines default shortcuts, key combination parsing, and conflict detection
 * Requirements: 9.1, 9.2, 9.3, 9.6
 */

/**
 * Modifier key constants
 */
export const MODIFIER_KEYS = {
  CONTROL: 'Control',
  SHIFT: 'Shift',
  ALT: 'Alt',
  META: 'Meta',
} as const;

/**
 * Valid modifier keys for shortcuts
 */
export const VALID_MODIFIERS = [
  MODIFIER_KEYS.CONTROL,
  MODIFIER_KEYS.SHIFT,
  MODIFIER_KEYS.ALT,
] as const;

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
  {
    id: 'action-undo',
    action: 'undo',
    keys: ['Control', 'z'],
    description: 'Undo last action',
    category: 'actions',
    customizable: true,
  },
  {
    id: 'action-redo',
    action: 'redo',
    keys: ['Control', 'y'],
    description: 'Redo last undone action',
    category: 'actions',
    customizable: true,
  },
  // Search shortcut
  {
    id: 'nav-search',
    action: 'navigate-search',
    keys: ['Control', 'Shift', 'f'],
    description: 'Open global search',
    category: 'navigation',
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
 * Check if a key is a modifier key
 * @param key - Key to check
 * @returns True if key is a modifier
 */
function isModifierKey(key: string): boolean {
  return [
    MODIFIER_KEYS.CONTROL,
    MODIFIER_KEYS.SHIFT,
    MODIFIER_KEYS.ALT,
    MODIFIER_KEYS.META,
  ].includes(key as any);
}

/**
 * Parse a keyboard event into a key combination string
 * @param event - Keyboard event
 * @returns Array of pressed keys (e.g., ['Control', 'k'])
 */
export function parseKeyEvent(event: KeyboardEvent): string[] {
  const keys: string[] = [];
  
  // Add modifier keys
  if (event.ctrlKey || event.metaKey) keys.push(MODIFIER_KEYS.CONTROL);
  if (event.shiftKey) keys.push(MODIFIER_KEYS.SHIFT);
  if (event.altKey) keys.push(MODIFIER_KEYS.ALT);
  
  // Add the main key (normalize to lowercase for letters)
  const key = event.key;
  if (key && !isModifierKey(key)) {
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
    .filter(key => key && typeof key === 'string') // Filter invalid keys
    .map(key => {
      // Map to display-friendly names
      switch (key) {
        case MODIFIER_KEYS.CONTROL:
          return 'Ctrl';
        case MODIFIER_KEYS.SHIFT:
          return 'Shift';
        case MODIFIER_KEYS.ALT:
          return 'Alt';
        default:
          return key.toUpperCase();
      }
    })
    .join('+');
}

/**
 * Normalize key combination for comparison
 * @param keys - Array of keys
 * @returns Normalized, sorted key string
 */
function normalizeKeys(keys: string[]): string {
  return keys.map(k => k.toLowerCase()).sort().join('+');
}

/**
 * Check if two key combinations match
 * @param keys1 - First key combination
 * @param keys2 - Second key combination
 * @returns True if combinations match
 */
export function keysMatch(keys1: string[], keys2: string[]): boolean {
  return normalizeKeys(keys1) === normalizeKeys(keys2);
}

/**
 * Detect conflicts in keyboard shortcuts
 * Uses a Map for O(n) complexity instead of O(n²)
 * @param shortcuts - Array of shortcuts to check
 * @returns Array of conflicting shortcut pairs
 */
export function detectConflicts(
  shortcuts: KeyboardShortcut[]
): Array<{ shortcut1: KeyboardShortcut; shortcut2: KeyboardShortcut }> {
  const conflicts: Array<{ shortcut1: KeyboardShortcut; shortcut2: KeyboardShortcut }> = [];
  const keyMap = new Map<string, KeyboardShortcut>();
  
  for (const shortcut of shortcuts) {
    const keyString = normalizeKeys(shortcut.keys);
    
    const existing = keyMap.get(keyString);
    if (existing) {
      conflicts.push({ shortcut1: existing, shortcut2: shortcut });
    } else {
      keyMap.set(keyString, shortcut);
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
  // Validate input type
  if (!Array.isArray(keys)) {
    return { valid: false, error: 'Keys must be an array' };
  }
  
  if (keys.length === 0) {
    return { valid: false, error: 'Key combination cannot be empty' };
  }
  
  // Check for invalid key values
  if (keys.some(k => typeof k !== 'string' || k.length === 0)) {
    return { valid: false, error: 'All keys must be non-empty strings' };
  }
  
  // Check for modifier-only shortcuts
  if (keys.length === 1 && VALID_MODIFIERS.includes(keys[0] as any)) {
    return { valid: false, error: 'Modifier-only shortcuts are not allowed' };
  }
  
  // Check for at least one modifier key
  const hasModifier = keys.some(key => VALID_MODIFIERS.includes(key as any));
  
  if (!hasModifier) {
    return { valid: false, error: 'Shortcuts must include at least one modifier key (Ctrl, Shift, or Alt)' };
  }
  
  return { valid: true };
}
