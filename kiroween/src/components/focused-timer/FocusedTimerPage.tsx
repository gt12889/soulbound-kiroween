import { useState } from 'react';
import { useTimer } from '../../contexts/TimerContext';
import type { SessionType } from '../../types/timer';
import styles from './FocusedTimerPage.module.css';

export function FocusedTimerPage() {
  const { timer, settings, stats, startTimer, pauseTimer, resumeTimer, stopTimer, resetTimer, updateSettings } = useTimer();
  const [selectedDuration, setSelectedDuration] = useState(settings.focusDuration);
  const [selectedType, setSelectedType] = useState<SessionType>('focus');
  const [showSettings, setShowSettings] = useState(false);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    startTimer(selectedDuration, selectedType);
  };

  const handlePauseResume = () => {
    if (timer.isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  };

  const presetDurations = [
    { label: '25 min', value: 25, type: 'focus' as SessionType },
    { label: '45 min', value: 45, type: 'focus' as SessionType },
    { label: '60 min', value: 60, type: 'focus' as SessionType },
    { label: '5 min', value: 5, type: 'break' as SessionType },
    { label: '15 min', value: 15, type: 'long-break' as SessionType },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Focused Timer</h1>
      <p className={styles.subtitle}>Harness the power of focused work sessions</p>

      {/* Timer Display */}
      <div className={styles.timerDisplay}>
        <div className={styles.timeCircle}>
          <span className={styles.timeText}>
            {timer.isActive ? formatTime(timer.remainingTime) : formatTime(selectedDuration * 60)}
          </span>
          <span className={styles.sessionLabel}>
            {timer.isActive ? timer.sessionType : selectedType}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        {!timer.isActive ? (
          <button className={`${styles.button} ${styles.startButton}`} onClick={handleStart}>
            Start Timer
          </button>
        ) : (
          <>
            <button className={`${styles.button} ${styles.pauseButton}`} onClick={handlePauseResume}>
              {timer.isPaused ? 'Resume' : 'Pause'}
            </button>
            <button className={`${styles.button} ${styles.stopButton}`} onClick={stopTimer}>
              Stop
            </button>
            <button className={`${styles.button} ${styles.resetButton}`} onClick={resetTimer}>
              Reset
            </button>
          </>
        )}
      </div>

      {/* Duration Presets */}
      {!timer.isActive && (
        <div className={styles.presets}>
          <h3 className={styles.presetsTitle}>Quick Start</h3>
          <div className={styles.presetButtons}>
            {presetDurations.map((preset) => (
              <button
                key={`${preset.value}-${preset.type}`}
                className={`${styles.presetButton} ${
                  selectedDuration === preset.value && selectedType === preset.type ? styles.active : ''
                }`}
                onClick={() => {
                  setSelectedDuration(preset.value);
                  setSelectedType(preset.type);
                }}
              >
                {preset.label}
                <span className={styles.presetType}>
                  {preset.type === 'focus' && '🎯'}
                  {preset.type === 'break' && '☕'}
                  {preset.type === 'long-break' && '🌙'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className={styles.stats}>
        <h3 className={styles.statsTitle}>Your Progress</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.todaySessions}</div>
            <div className={styles.statLabel}>Today</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.completedSessions}</div>
            <div className={styles.statLabel}>Total Sessions</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totalFocusTime}</div>
            <div className={styles.statLabel}>Focus Minutes</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.currentStreak}</div>
            <div className={styles.statLabel}>Day Streak</div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className={styles.settingsSection}>
        <button className={styles.settingsToggle} onClick={() => setShowSettings(!showSettings)}>
          {showSettings ? '▼' : '▶'} Settings
        </button>

        {showSettings && (
          <div className={styles.settingsPanel}>
            <div className={styles.settingRow}>
              <label>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                />
                Sound notifications
              </label>
            </div>
            <div className={styles.settingRow}>
              <label>
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
                />
                Browser notifications
              </label>
            </div>
            <div className={styles.settingRow}>
              <label>
                <input
                  type="checkbox"
                  checked={settings.autoStartBreaks}
                  onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })}
                />
                Auto-start breaks
              </label>
            </div>
            <div className={styles.settingRow}>
              <label>
                <input
                  type="checkbox"
                  checked={settings.autoStartFocus}
                  onChange={(e) => updateSettings({ autoStartFocus: e.target.checked })}
                />
                Auto-start focus sessions
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
