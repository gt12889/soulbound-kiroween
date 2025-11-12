import { useState } from 'react';
import { GraveyardView } from './GraveyardView';
import { MoonPhaseCalendar } from './MoonPhaseCalendar';
import styles from './GraveyardDashboard.module.css';

type ViewMode = 'graveyard' | 'calendar';

/**
 * GraveyardDashboard - Main component combining task management and moon phase calendar
 * Requirements: 4.1, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
export function GraveyardDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('graveyard');

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
      </div>

      <div className={styles.content}>
        {viewMode === 'graveyard' ? <GraveyardView /> : <MoonPhaseCalendar />}
      </div>
    </div>
  );
}
