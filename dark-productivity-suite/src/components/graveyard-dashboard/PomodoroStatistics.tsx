import { useState } from 'react';
import { usePomodoro } from '../../hooks/usePomodoro';
import type { PomodoroSession } from '../../types';
import styles from './PomodoroStatistics.module.css';

/**
 * PomodoroStatistics component
 * Tracks and displays completed sessions, session history, and productivity statistics
 * Requirements: 12.6
 */
export function PomodoroStatistics() {
  const { getCompletedSessions, getTodaySessions, getStatistics } = usePomodoro();
  const [showHistory, setShowHistory] = useState(false);

  const completedSessions = getCompletedSessions();
  const todaySessions = getTodaySessions();
  const stats = getStatistics();

  // Format duration in minutes
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  // Format date
  const formatDate = (date: Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get sessions grouped by date
  const getSessionsByDate = (): Map<string, PomodoroSession[]> => {
    const grouped = new Map<string, PomodoroSession[]>();
    
    completedSessions.forEach(session => {
      const date = new Date(session.startTime);
      const dateKey = date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(session);
    });

    return grouped;
  };

  const sessionsByDate = getSessionsByDate();
  const sortedDates = Array.from(sessionsByDate.keys()).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>📊 Statistics</h3>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{todaySessions.length}</div>
          <div className={styles.statLabel}>Today's Sessions</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.totalSessions}</div>
          <div className={styles.statLabel}>Total Sessions</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue}>{formatDuration(stats.totalWorkTime)}</div>
          <div className={styles.statLabel}>Total Work Time</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue}>{formatDuration(stats.totalBreakTime)}</div>
          <div className={styles.statLabel}>Total Break Time</div>
        </div>
      </div>

      <button
        className={styles.historyToggle}
        onClick={() => setShowHistory(!showHistory)}
      >
        {showHistory ? '▼' : '▶'} Session History
      </button>

      {showHistory && (
        <div className={styles.historyContainer}>
          {sortedDates.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No completed sessions yet.</p>
              <p className={styles.emptyHint}>Start a pomodoro session to track your productivity!</p>
            </div>
          ) : (
            <div className={styles.historyList}>
              {sortedDates.map(dateKey => {
                const dateSessions = sessionsByDate.get(dateKey)!;
                const workSessions = dateSessions.filter(s => s.type === 'work').length;
                const breakSessions = dateSessions.filter(s => s.type === 'break').length;

                return (
                  <div key={dateKey} className={styles.dateGroup}>
                    <div className={styles.dateHeader}>
                      <span className={styles.date}>{dateKey}</span>
                      <span className={styles.dateStats}>
                        💀 {workSessions} work · 👻 {breakSessions} break
                      </span>
                    </div>
                    <div className={styles.sessionsList}>
                      {dateSessions.map(session => (
                        <div key={session.id} className={styles.sessionItem}>
                          <span className={styles.sessionIcon}>
                            {session.type === 'work' ? '💀' : '👻'}
                          </span>
                          <span className={styles.sessionType}>
                            {session.type === 'work' ? 'Work' : 'Break'}
                          </span>
                          <span className={styles.sessionDuration}>
                            {formatDuration(session.duration)}
                          </span>
                          <span className={styles.sessionTime}>
                            {formatDate(session.startTime)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
