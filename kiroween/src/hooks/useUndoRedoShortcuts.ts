import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useKeyboard } from '../contexts/KeyboardContext';
import { useTasks } from '../contexts/TasksContext';
import { useNotes } from '../contexts/NotesContext';
import { DEFAULT_SHORTCUTS } from '../utils/keyboardShortcuts';

/**
 * Hook to register undo/redo keyboard shortcuts
 * Requirements: 8.2, 8.3, 8.4
 * 
 * Registers Ctrl+Z for undo and Ctrl+Y for redo
 * Connects to the appropriate context based on current route
 */
export function useUndoRedoShortcuts() {
  const location = useLocation();
  const { registerShortcut, unregisterShortcut } = useKeyboard();
  const tasks = useTasks();
  const notes = useNotes();

  useEffect(() => {
    // Determine which context to use based on current route
    const isNotesRoute = location.pathname.includes('necronomicon-notes');
    const isTasksRoute = location.pathname.includes('graveyard-dashboard');

    // Get undo/redo shortcuts
    const undoShortcut = DEFAULT_SHORTCUTS.find(s => s.action === 'undo');
    const redoShortcut = DEFAULT_SHORTCUTS.find(s => s.action === 'redo');

    if (!undoShortcut || !redoShortcut) return;

    // Register shortcuts based on current route
    if (isNotesRoute) {
      // Register for notes context
      registerShortcut(undoShortcut, () => {
        if (notes.canUndo) {
          notes.undo();
        }
      });

      registerShortcut(redoShortcut, () => {
        if (notes.canRedo) {
          notes.redo();
        }
      });
    } else if (isTasksRoute) {
      // Register for tasks context
      registerShortcut(undoShortcut, () => {
        if (tasks.canUndo) {
          tasks.undo();
        }
      });

      registerShortcut(redoShortcut, () => {
        if (tasks.canRedo) {
          tasks.redo();
        }
      });
    }

    // Cleanup on unmount or route change
    return () => {
      unregisterShortcut(undoShortcut.id);
      unregisterShortcut(redoShortcut.id);
    };
  }, [location.pathname, registerShortcut, unregisterShortcut, tasks, notes]);
}
