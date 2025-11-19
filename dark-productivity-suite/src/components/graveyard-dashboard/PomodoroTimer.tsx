import { useEffect, useState } from 'react';
import { usePomodoro } from '../../hooks/usePomodoro';
import { useAudio } from '../../hooks/useAudio';
import styles from './PomodoroTimer.module.css';

/**
 * PomodoroTimer component with hourglass visualization
 * Implements flowing souls/sand animation during work intervals
 * Requirements: 12.1, 12.4, 12.5
 */
export function PomodoroTimer() {
  const {
    isRunning,
    isPaused,
    currentType,
    timeRemaining,
    workDuration,
    breakDuration,
    start,
    pause,
    resume,
    reset,
    switchType,
    setWorkDuration,
    setBreakDuration,
  } = usePomodoro();

  const { playSound } = useAudio();
  const [showConfig, setShowConfig] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(Math.floor(workDuration / 60));
  const [breakMinutes, setBreakMinutes] = useState(Math.floor(breakDuration / 60));
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const totalDuration = currentType === 'work' ? workDuration : breakDuration;
  const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;

  // Detect timer completion and trigger notifications
  // Requirements: 12.4
  useEffect(() => {
    if (timeRemaining === 0 && !isRunning) {
      setTimerCompleted(true);
      
      // Play mystical chime sound
      playSound('pomodoro-complete');
      
      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        const notificationTitle = currentType === 'work' 
          ? '💀 Work Session Complete!' 
          : '👻 Break Time Over!';
        const notificationBody = currentType === 'work'
          ? 'Time for a well-deserved break.'
          : 'Ready to get back to work?';
        
        new Notification(notificationTitle, {
          body: notificationBody,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      }
      
      // Show in-app notification
      setShowNotification(true);
      
      // Reset completion state after 5 seconds
      const timeout = setTimeout(() => {
        setTimerCompleted(false);
        setShowNotification(false);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [timeRemaining, isRunning, currentType, playSound]);

  // Handle configuration save
  const handleSaveConfig = () => {
    setWorkDuration(workMinutes);
    setBreakDuration(breakMinutes);
    setShowConfig(false);
  };

  // Handle start/pause/resume
  const handleToggle = () => {
    if (!isRunning) {
      start();
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>⏳ Pomodoro Timer</h2>
        <div className={styles.headerRight}>
          {isRunning && !isPaused && (
            <div className={styles.statusIndicator} title="Timer running">
              <span className={styles.pulse}>●</span>
            </div>
          )}
          {isPaused && (
            <div className={styles.statusIndicator} title="Timer paused">
              <span className={styles.paused}>⏸</span>
            </div>
          )}
          <button
            className={styles.configButton}
            onClick={() => setShowConfig(!showConfig)}
            title="Configure durations"
          >
            ⚙️
          </button>
        </div>
      </div>

      {showConfig && (
        <div className={styles.configPanel}>
          <div className={styles.configRow}>
            <label>Work Duration (minutes):</label>
            <input
              type="number"
              min="15"
              max="60"
              value={workMinutes}
              onChange={(e) => setWorkMinutes(parseInt(e.target.value) || 25)}
              className={styles.configInput}
            />
          </div>
          <div className={styles.configRow}>
            <label>Break Duration (minutes):</label>
            <input
              type="number"
              min="5"
              max="20"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 5)}
              className={styles.configInput}
            />
          </div>
          <button onClick={handleSaveConfig} className={`${styles.saveButton} button-primary`}>
            Save Configuration
          </button>
        </div>
      )}

      <div className={styles.typeSelector}>
        <button
          className={`${styles.typeButton} ${currentType === 'work' ? styles.active : ''}`}
          onClick={() => !isRunning && switchType('work')}
          disabled={isRunning}
        >
          💀 Work
        </button>
        <button
          className={`${styles.typeButton} ${currentType === 'break' ? styles.active : ''}`}
          onClick={() => !isRunning && switchType('break')}
          disabled={isRunning}
        >
          👻 Break
        </button>
      </div>

      <div className={styles.hourglassContainer}>
        <div className={`${styles.hourglass} ${isRunning && !isPaused ? styles.running : ''}`}>
          {/* Top bulb */}
          <div className={styles.topBulb}>
            <div 
              className={styles.souls}
              style={{ height: `${100 - progress}%` }}
            >
              {isRunning && !isPaused && (
                <>
                  <div className={styles.soul} style={{ animationDelay: '0s' }}>👻</div>
                  <div className={styles.soul} style={{ animationDelay: '0.5s' }}>💀</div>
                  <div className={styles.soul} style={{ animationDelay: '1s' }}>👻</div>
                  <div className={styles.soul} style={{ animationDelay: '1.5s' }}>💀</div>
                </>
              )}
            </div>
          </div>

          {/* Neck */}
          <div className={styles.neck}>
            {isRunning && !isPaused && (
              <div className={styles.flowingSoul}>👻</div>
            )}
          </div>

          {/* Bottom bulb */}
          <div className={styles.bottomBulb}>
            <div 
              className={styles.souls}
              style={{ height: `${progress}%` }}
            />
          </div>
        </div>

        <div className={styles.timeDisplay}>
          <div className={`${styles.time} ${timerCompleted ? styles.completed : ''}`}>
            {formatTime(timeRemaining)}
          </div>
          <div className={styles.typeLabel}>
            {currentType === 'work' ? 'Work Session' : 'Break Time'}
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          className={`${styles.controlButton} ${styles.primary} button-primary`}
          onClick={handleToggle}
        >
          {!isRunning ? '▶️ Start' : isPaused ? '▶️ Resume' : '⏸️ Pause'}
        </button>
        <button
          className={`${styles.controlButton} button-secondary`}
          onClick={reset}
          disabled={!isRunning && timeRemaining === totalDuration}
        >
          🔄 Reset
        </button>
      </div>

      {showNotification && (
        <div className={styles.completionMessage}>
          ✨ {currentType === 'work' ? 'Work session' : 'Break'} complete! ✨
          <div className={styles.notificationSubtext}>
            {currentType === 'work' ? 'Time for a break 👻' : 'Back to work 💀'}
          </div>
        </div>
      )}
    </div>
  );
}
