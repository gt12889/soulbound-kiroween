import React from 'react';
import type { StreakType, StreakInfo, TaskStreakInfo, FocusStreakInfo } from '../../types/streak';
import { MILESTONE_DAYS } from '../../types/streak';
import styles from './StreakCard.module.css';

/**
 * Props for StreakCard component
 */
interface StreakCardProps {
  /** Type of streak to display */
  streakType: StreakType;
  /** Streak information */
  streakInfo: StreakInfo | TaskStreakInfo | FocusStreakInfo;
  /** Whether the streak is currently active (activity today) */
  isActive?: boolean;
  /** Optional click handler */
  onClick?: () => void;
}

/**
 * Get icon for streak type
 * Requirements: Task 1.5 - Show streak type icon
 */
function getStreakIcon(type: StreakType): string {
  switch (type) {
    case 'login':
      return '🔥';
    case 'task':
      return '⚡';
    case 'note':
      return '📝';
    case 'focus':
      return '⏱️';
    default:
      return '🔥';
  }
}

/**
 * Get display name for streak type
 */
function getStreakName(type: StreakType): string {
  switch (type) {
    case 'login':
      return 'Login Streak';
    case 'task':
      return 'Task Streak';
    case 'note':
      return 'Note Streak';
    case 'focus':
      return 'Focus Streak';
    default:
      return 'Streak';
  }
}

/**
 * Calculate next milestone for a streak
 */
function getNextMilestone(currentStreak: number): number {
  for (const milestone of MILESTONE_DAYS) {
    if (currentStreak < milestone) {
      return milestone;
    }
  }
  return MILESTONE_DAYS[MILESTONE_DAYS.length - 1];
}

/**
 * StreakCard Component
 * Displays individual streak information with current count, longest streak, and progress
 * Requirements: Task 1.5 - Basic Streak Display
 */
export const StreakCard: React.FC<StreakCardProps> = ({
  streakType,
  streakInfo,
  isActive = false,
  onClick,
}) => {
  const icon = getStreakIcon(streakType);
  const name = getStreakName(streakType);
  const nextMilestone = getNextMilestone(streakInfo.current);
  const progressToMilestone = (streakInfo.current / nextMilestone) * 100;
  
  // Determine if streak is broken (current is 0 but longest is not)
  const isBroken = streakInfo.current === 0 && streakInfo.longest > 0;
  
  return (
    <div
      className={`${styles.card} ${isActive ? styles.active : ''} ${isBroken ? styles.broken : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      aria-label={`${name}: ${streakInfo.current} days. Longest: ${streakInfo.longest} days`}
    >
      {/* Icon and Current Streak */}
      <div className={styles.header}>
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
        <div className={styles.streakCount}>
          <div className={styles.currentStreak}>
            {streakInfo.current}
          </div>
          <div className={styles.streakLabel}>
            days
          </div>
        </div>
      </div>
      
      {/* Streak Name */}
      <div className={styles.name}>
        {name}
      </div>
      
      {/* Longest Streak Subtitle */}
      <div className={styles.subtitle}>
        Best: {streakInfo.longest} {streakInfo.longest === 1 ? 'day' : 'days'}
      </div>
      
      {/* Progress to Next Milestone */}
      {streakInfo.current > 0 && (
        <div className={styles.progressSection}>
          <div className={styles.progressLabel}>
            <span>Next: {nextMilestone} days</span>
            <span>{streakInfo.current}/{nextMilestone}</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min(progressToMilestone, 100)}%` }}
              role="progressbar"
              aria-valuenow={streakInfo.current}
              aria-valuemin={0}
              aria-valuemax={nextMilestone}
              aria-label={`Progress to ${nextMilestone} day milestone`}
            />
          </div>
        </div>
      )}
      
      {/* Broken Streak Message */}
      {isBroken && (
        <div className={styles.brokenMessage}>
          Streak broken. Start again!
        </div>
      )}
    </div>
  );
};

export default StreakCard;
