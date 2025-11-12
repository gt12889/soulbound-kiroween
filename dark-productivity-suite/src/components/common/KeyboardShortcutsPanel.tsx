import { useState, useEffect } from 'react';
import { useKeyboard } from '../../contexts/KeyboardContext';
import { keysToString, parseKeyEvent, validateKeys } from '../../utils/keyboardShortcuts';
import type { KeyboardShortcut } from '../../utils/keyboardShortcuts';
import styles from './KeyboardShortcutsPanel.module.css';

/**
 * KeyboardShortcutsPanel component
 * Modal displaying all keyboard shortcuts with customization interface
 * Requirements: 9.4, 9.5
 */
export function KeyboardShortcutsPanel() {
  const {
    shortcuts,
    showShortcutsPanel,
    setShowShortcutsPanel,
    updateShortcut,
    resetShortcut,
    resetAllShortcuts,
    conflicts,
  } = useKeyboard();

  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  // Category display names
  const categoryNames: Record<string, string> = {
    navigation: 'Navigation',
    actions: 'Actions',
    search: 'Search',
    help: 'Help',
  };

  // Handle key recording for customization
  useEffect(() => {
    if (!editingShortcut) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      const keys = parseKeyEvent(event);
      setRecordedKeys(keys);

      // Validate keys
      const validation = validateKeys(keys);
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid key combination');
      } else {
        setValidationError(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingShortcut]);

  const handleStartEdit = (shortcutId: string) => {
    setEditingShortcut(shortcutId);
    setRecordedKeys([]);
    setValidationError(null);
  };

  const handleSaveEdit = () => {
    if (editingShortcut && recordedKeys.length > 0 && !validationError) {
      updateShortcut(editingShortcut, recordedKeys);
      setEditingShortcut(null);
      setRecordedKeys([]);
    }
  };

  const handleCancelEdit = () => {
    setEditingShortcut(null);
    setRecordedKeys([]);
    setValidationError(null);
  };

  const handleReset = (shortcutId: string) => {
    resetShortcut(shortcutId);
  };

  const handleResetAll = () => {
    if (confirm('Reset all shortcuts to defaults?')) {
      resetAllShortcuts();
    }
  };

  const handleClose = () => {
    setShowShortcutsPanel(false);
    setEditingShortcut(null);
    setRecordedKeys([]);
    setValidationError(null);
  };

  // Check if a shortcut has conflicts
  const hasConflict = (shortcutId: string) => {
    return conflicts.some(
      c => c.shortcut1.id === shortcutId || c.shortcut2.id === shortcutId
    );
  };

  if (!showShortcutsPanel) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Keyboard Shortcuts</h2>
          <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {conflicts.length > 0 && (
            <div className={styles.conflictWarning}>
              ⚠️ {conflicts.length} shortcut conflict{conflicts.length > 1 ? 's' : ''} detected
            </div>
          )}

          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category} className={styles.category}>
              <h3 className={styles.categoryTitle}>{categoryNames[category] || category}</h3>
              <div className={styles.shortcutsList}>
                {categoryShortcuts.map(shortcut => (
                  <div
                    key={shortcut.id}
                    className={`${styles.shortcutRow} ${
                      hasConflict(shortcut.id) ? styles.conflict : ''
                    }`}
                  >
                    <div className={styles.shortcutInfo}>
                      <span className={styles.description}>{shortcut.description}</span>
                      {hasConflict(shortcut.id) && (
                        <span className={styles.conflictBadge}>Conflict</span>
                      )}
                    </div>

                    <div className={styles.shortcutKeys}>
                      {editingShortcut === shortcut.id ? (
                        <div className={styles.editMode}>
                          <div className={styles.recordedKeys}>
                            {recordedKeys.length > 0 ? (
                              <span className={styles.keyCombo}>
                                {keysToString(recordedKeys)}
                              </span>
                            ) : (
                              <span className={styles.placeholder}>Press keys...</span>
                            )}
                          </div>
                          {validationError && (
                            <div className={styles.error}>{validationError}</div>
                          )}
                          <div className={styles.editActions}>
                            <button
                              className={styles.saveButton}
                              onClick={handleSaveEdit}
                              disabled={recordedKeys.length === 0 || !!validationError}
                            >
                              Save
                            </button>
                            <button className={styles.cancelButton} onClick={handleCancelEdit}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className={styles.keyCombo}>{keysToString(shortcut.keys)}</span>
                          {shortcut.customizable && (
                            <div className={styles.actions}>
                              <button
                                className={styles.editButton}
                                onClick={() => handleStartEdit(shortcut.id)}
                                title="Customize shortcut"
                              >
                                Edit
                              </button>
                              <button
                                className={styles.resetButton}
                                onClick={() => handleReset(shortcut.id)}
                                title="Reset to default"
                              >
                                Reset
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button className={styles.resetAllButton} onClick={handleResetAll}>
            Reset All to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
