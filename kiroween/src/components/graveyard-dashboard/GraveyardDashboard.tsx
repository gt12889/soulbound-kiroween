import { useState } from 'react';
import { GraveyardView } from './GraveyardView';
import { ArchiveView } from './ArchiveView';
import { PomodoroTimer } from './PomodoroTimer';
import { PomodoroStatistics } from './PomodoroStatistics';
import { RecentNotesPanel } from './RecentNotesPanel';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { DEFAULT_SHORTCUTS } from '../../utils/keyboardShortcuts';
import { useMousePosition } from '../../hooks/useMousePosition';
import { useTasks } from '../../contexts/TasksContext';
import { AmbientBackground } from '../common/AmbientBackground';
import styles from './GraveyardDashboard.module.css';

type PanelType = 'tasks' | 'moon' | 'pomodoro' | 'archive';

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
  const [selectedPanel, setSelectedPanel] = useState<PanelType | null>(null);
  const { createTask } = useTasks();
  const { x, y } = useMousePosition();

  // Calculate parallax offsets
  const parallaxX = (x / window.innerWidth - 0.5) * 30;
  const parallaxY = (y / window.innerHeight - 0.5) * 30;
  
  const taskShortcuts = DEFAULT_SHORTCUTS.filter(s => s.action === 'create-task');
  useKeyboardShortcuts(taskShortcuts, {
    'create-task': () => {
      createTask('New Task', '', 'medium');
    },
  });

  const panels: Panel[] = [
    { id: 'tasks', title: 'Task Graveyard', icon: '🪦', component: <GraveyardView /> },
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
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.graveyardScene}>
        <AmbientBackground showFog showGlow />
        <div 
          className={styles.moon}
          style={{ transform: `translate(${parallaxX * 0.5}px, ${parallaxY * 0.5}px)` }}
        ></div>
        <div 
          className={styles.trees}
          style={{ transform: `translate(${-parallaxX}px, ${-parallaxY}px)` }}
        >
          <div className={styles.tree}></div>
          <div className={styles.tree}></div>
          <div className={styles.tree}></div>
        </div>
      </div>

      {/* Floating Recent Notes Widget */}
      <div className={styles.floatingWidget}>
        <RecentNotesPanel />
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