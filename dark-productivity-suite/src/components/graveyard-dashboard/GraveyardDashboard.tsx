import { useState } from 'react';
import { GraveyardView } from './GraveyardView';
import { MoonPhaseCalendar } from './MoonPhaseCalendar';
import { ArchiveView } from './ArchiveView';
import { PomodoroTimer } from './PomodoroTimer';
import { PomodoroStatistics } from './PomodoroStatistics';
import { RecentNotesPanel } from './RecentNotesPanel'; // New import
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { DEFAULT_SHORTCUTS } from '../../utils/keyboardShortcuts';
import { useTasks } from '../../contexts/TasksContext';
// import { useNotes } from '../../contexts/NotesContext'; // Removed useNotes import
import styles from './GraveyardDashboard.module.css';

type PanelType = 'tasks' | 'moon' | 'pomodoro' | 'archive' | 'recent-notes'; // Added 'recent-notes'

interface Panel {
  id: PanelType;
  title: string;
  icon: string;
  component: React.ReactNode;
}

/**
 * GraveyardDashboard - Graveyard-themed panel dashboard
 * Requirements: 4.1, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 9.2
 */
export function GraveyardDashboard() {
  const [selectedPanel, setSelectedPanel] = useState<PanelType>('tasks');
  const { createTask } = useTasks();
  // const { notes } = useNotes(); // Removed notes usage
  
  const taskShortcuts = DEFAULT_SHORTCUTS.filter(s => s.action === 'create-task');
  useKeyboardShortcuts(taskShortcuts, {
    'create-task': () => {
      createTask('New Task', '', 'medium');
    },
  });

  const panels: Panel[] = [
    { id: 'tasks', title: 'Task Graveyard', icon: '🪦', component: <GraveyardView /> },
    { id: 'moon', title: 'Moon Phases', icon: '🌙', component: <MoonPhaseCalendar /> },
    { 
      id: 'pomodoro', 
      title: 'Focus Timer', 
      icon: '⏳', 
      component: (
        <div className={styles.pomodoroContainer}>
          <PomodoroTimer />
          <PomodoroStatistics />
        </div>
      )
    },
    { id: 'archive', title: 'Archive', icon: '📦', component: <ArchiveView /> },
    { id: 'recent-notes', title: 'Recent Notes', icon: '📜', component: <RecentNotesPanel /> }, // New Recent Notes Panel
  ];

  // Logic to get recent notes (e.g., top 5) - removed here, now handled by RecentNotesPanel
  // const recentNotes = notes.slice(0, 5);

  return (
    <div className={styles.dashboard}>
      <div className={styles.graveyardScene}>
        <div className={styles.moon}></div>
        <div className={styles.trees}>
          <div className={styles.tree}></div>
          <div className={styles.tree}></div>
          <div className={styles.tree}></div>
        </div>
      </div>

      <div className={styles.panelGrid}>
        {panels.map((panel) => (
          <div
            key={panel.id}
            className={`${styles.panel} ${selectedPanel === panel.id ? styles.panelActive : ''}`}
            onClick={() => setSelectedPanel(panel.id)}
          >
            <div className={styles.panelHeader}>
              <span className={styles.panelIcon}>{panel.icon}</span>
              <h3 className={styles.panelTitle}>{panel.title}</h3>
            </div>
            {selectedPanel === panel.id && (
              <div className={styles.panelContent}>
                {panel.component}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

