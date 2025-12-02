import { useEffect, useState, useRef } from 'react';
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
  const [showVideoConfig, setShowVideoConfig] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(Math.floor(workDuration / 60));
  const [breakMinutes, setBreakMinutes] = useState(Math.floor(breakDuration / 60));
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Video styling controls
  const [cropPosition, setCropPosition] = useState({ x: 67, y: 50 }); // x and y percentages
  const [opacity, setOpacity] = useState(1);
  const [fadeSize, setFadeSize] = useState(20); // pixels for fade-out edges
  const [zoom, setZoom] = useState(1); // zoom scale (1 = 100%)

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

  // Calculate total duration
  const totalDuration = currentType === 'work' ? workDuration : breakDuration;

  // Control video playback based on timer state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isRunning && !isPaused) {
      video.play().catch((err) => {
        console.error('Error playing video:', err);
      });
    } else {
      video.pause();
    }
  }, [isRunning, isPaused]);

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
          <button
            className={styles.configButton}
            onClick={() => setShowVideoConfig(!showVideoConfig)}
            title="Configure video settings"
          >
            🎬
          </button>
        </div>
      </div>

      {showConfig && (
        <div className={styles.configPanel}>
          <div className={`${styles.configRow} ${styles.configRowInline}`}>
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
          <div className={`${styles.configRow} ${styles.configRowInline}`}>
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

      {showVideoConfig && (
        <div className={styles.configPanel}>
          <h3 className={styles.configTitle}>Video Settings</h3>
          <div className={styles.configRow}>
            <label>Crop Position X: {cropPosition.x}%</label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={cropPosition.x}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setCropPosition(prev => ({ ...prev, x: value }));
              }}
              className={styles.configSlider}
            />
          </div>
          <div className={styles.configRow}>
            <label>Crop Position Y: {cropPosition.y}%</label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={cropPosition.y}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setCropPosition(prev => ({ ...prev, y: value }));
              }}
              className={styles.configSlider}
            />
          </div>
          <div className={styles.configRow}>
            <label>Opacity: {Math.round(opacity * 100)}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity * 100}
              onChange={(e) => setOpacity(parseInt(e.target.value) / 100)}
              className={styles.configSlider}
            />
          </div>
          <div className={styles.configRow}>
            <label>Fade Size: {fadeSize}px</label>
            <input
              type="range"
              min="0"
              max="100"
              value={fadeSize}
              onChange={(e) => setFadeSize(parseInt(e.target.value))}
              className={styles.configSlider}
            />
          </div>
          <div className={styles.configRow}>
            <label>Zoom: {Math.round(zoom * 100)}%</label>
            <input
              type="range"
              min="50"
              max="200"
              value={zoom * 100}
              onChange={(e) => setZoom(parseInt(e.target.value) / 100)}
              className={styles.configSlider}
            />
          </div>
          <div className={styles.configRow}>
            <button 
              onClick={() => {
                setCropPosition({ x: 67, y: 50 });
                setOpacity(1);
                setFadeSize(20);
                setZoom(1);
              }} 
              className={`${styles.resetButton} button-secondary`}
            >
              Reset to Defaults
            </button>
          </div>
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

      <div className={styles.videoContainer}>
        <div className={styles.videoWrapper}>
          <div 
            className={styles.videoInnerWrapper}
            style={{
              transform: `translateY(${(cropPosition.y - 50) * 4}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            <video
              ref={videoRef}
              className={styles.timerVideo}
              loop
              muted
              playsInline
              src="/task_01kand73e7fpzvbdaatfgj93jy_task_01kand73e7fpzvbdaatfgj93jy_genid_cedc65c8-a05f-492a-9ea2-27784f22fc58_25_11_22_09_10_221005_videos_00000_446747823_source.mp4"
              style={{
                opacity: opacity,
                objectPosition: `${cropPosition.x}% ${cropPosition.y}%`,
                objectFit: 'cover',
                width: '120%',
                height: '120%',
                marginLeft: '-10%',
                marginTop: '-10%',
                maskImage: `radial-gradient(ellipse at center, black calc(100% - ${fadeSize}px), transparent 100%)`,
                WebkitMaskImage: `radial-gradient(ellipse at center, black calc(100% - ${fadeSize}px), transparent 100%)`,
              } as React.CSSProperties}
            />
          </div>
          <div 
            className={styles.videoFadeOverlay}
            style={{
              background: `radial-gradient(ellipse at center, transparent calc(100% - ${fadeSize}px), var(--bg-primary) 100%)`,
            }}
          />
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
