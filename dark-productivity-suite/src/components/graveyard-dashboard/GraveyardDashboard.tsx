import { useState } from 'react';
import { GraveyardView } from './GraveyardView';
import { MoonPhaseCalendar } from './MoonPhaseCalendar';
import { ArchiveView } from './ArchiveView';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { DEFAULT_SHORTCUTS } from '../../utils/keyboardShortcuts';
import { useTasks } from '../../contexts/TasksContext';
import styles from './GraveyardDashboard.module.css';

type ViewMode = 'graveyard' | 'calendar' | 'archive';

/**
 * GraveyardDashboard - Main component combining task management and moon phase calendar
 * Requirements: 4.1, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 9.2
 */
export function GraveyardDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('graveyard');
  const { createTask } = useTasks();

  // Register keyboard shortcuts for tasks using the hook
  // Requirements: 9.2
  const taskShortcuts = DEFAULT_SHORTCUTS.filter(s => s.action === 'create-task');

  useKeyboardShortcuts(taskShortcuts, {
    'create-task': () => {
      createTask('New Task', '', 'medium');
    },
  });

  return (
    <div className={styles.dashboard}>
      <div className={styles.viewToggle}>
        <button
          className={`${styles.toggleButton} ${viewMode === 'graveyard' ? styles.active : ''}`}
          onClick={() => setViewMode('graveyard')}
        >
          🪦 Graveyard
        </button>
        <button
          className={`${styles.toggleButton} ${viewMode === 'calendar' ? styles.active : ''}`}
          onClick={() => setViewMode('calendar')}
        >
          🌙 Moon Calendar
        </button>
        <button
          className={`${styles.toggleButton} ${viewMode === 'archive' ? styles.active : ''}`}
          onClick={() => setViewMode('archive')}
        >
          📦 Archive
        </button>
      </div>

      <div className={styles.content}>
        {viewMode === 'graveyard' && <GraveyardView />}
        {viewMode === 'calendar' && <MoonPhaseCalendar />}
        {viewMode === 'archive' && <ArchiveView />}
      </div>
    </div>
  );
}
