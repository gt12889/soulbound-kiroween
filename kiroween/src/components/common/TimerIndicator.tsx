import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../../contexts/TimerContext';
import styles from './TimerIndicator.module.css';

interface TimerIndicatorProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  compact?: boolean;
}

export function TimerIndicator({ position = 'top-right', compact = false }: TimerIndicatorProps) {
  const { timer, pauseTimer, resumeTimer } = useTimer();
  const navigate = useNavigate();

  // Only render when timer is active
  if (!timer.isActive) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = (): number => {
    const totalSeconds = timer.duration * 60;
    const progress = (timer.remainingTime / totalSeconds) * 100;
    return progress;
  };

  const handleClick = () => {
    navigate('/focused-timer');
  };

  const handlePauseResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timer.isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  };

  const progress = calculateProgress();
  const circumference = 2 * Math.PI * 25;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`${styles.indicator} ${styles[position]}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Timer: ${formatTime(timer.remainingTime)} remaining. Click to open timer page.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className={styles.progressRing}>
        <svg width="60" height="60" className={styles.svg}>
          <circle
            cx="30"
            cy="30"
            r="25"
            stroke="var(--border-color, #4a5568)"
            strokeWidth="2"
            fill="none"
            className={styles.backgroundCircle}
          />
          <circle
            cx="30"
            cy="30"
            r="25"
            stroke="var(--primary-color, #8b5cf6)"
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={styles.progressCircle}
            style={{
              transition: 'stroke-dashoffset 1s linear',
            }}
          />
        </svg>
        <div className={styles.timeDisplay}>
          <span className={styles.time}>{formatTime(timer.remainingTime)}</span>
        </div>
      </div>

      {!compact && (
        <button
          className={styles.pauseButton}
          onClick={handlePauseResume}
          aria-label={timer.isPaused ? 'Resume timer' : 'Pause timer'}
          title={timer.isPaused ? 'Resume' : 'Pause'}
        >
          {timer.isPaused ? '▶' : '⏸'}
        </button>
      )}

      <div className={styles.sessionType}>
        {timer.sessionType === 'focus' && '🎯'}
        {timer.sessionType === 'break' && '☕'}
        {timer.sessionType === 'long-break' && '🌙'}
      </div>
    </div>
  );
}
