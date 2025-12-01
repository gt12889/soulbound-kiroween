import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStreak } from '../../contexts/StreakContext';
import { useAudio } from '../../hooks/useAudio';
import type { StreakType } from '../../types/streak';
import styles from './StreakIndicator.module.css';

/**
 * StreakIndicator Component
 * 
 * Mini streak display for the navigation bar showing current streak status
 * Requirements: Task 4.2 - Streak Indicator in Nav
 * 
 * Features:
 * - Shows mini fire icon with highest streak number
 * - Tooltip displays all active streaks
 * - Pulse animation when any streak is at risk
 * - Clicking navigates to streak dashboard
 * - Accessible with keyboard navigation and screen readers
 */
export function StreakIndicator() {
  const { streaks, loading, isStreakAtRisk } = useStreak();
  const navigate = useNavigate();
  const { playUIClick, playUIHover } = useAudio();
  const [showTooltip, setShowTooltip] = useState(false);

  /**
   * Calculate the highest current streak across all types
   */
  const highestStreak = useMemo(() => {
    if (!streaks) return 0;
    
    return Math.max(
      streaks.loginStreak.current,
      streaks.taskStreak.current,
      streaks.noteStreak.current,
      streaks.focusStreak.current
    );
  }, [streaks]);

  /**
   * Check if any streak is at risk
   */
  const anyStreakAtRisk = useMemo(() => {
    if (!streaks) return false;
    
    const streakTypes: StreakType[] = ['login', 'task', 'note', 'focus'];
    return streakTypes.some(type => isStreakAtRisk(type));
  }, [streaks, isStreakAtRisk]);

  /**
   * Generate tooltip data showing all streaks
   */
  const tooltipData = useMemo(() => {
    if (!streaks) return [];
    
    const streakInfo: Array<{ type: StreakType; icon: string; label: string }> = [
      { type: 'login', icon: '🌲', label: 'Login' },
      { type: 'task', icon: '⚰️', label: 'Tasks' },
      { type: 'note', icon: '📖', label: 'Notes' },
      { type: 'focus', icon: '⏱️', label: 'Focus' },
    ];
    
    return streakInfo.map(({ type, icon, label }) => {
      let current = 0;
      
      // Map StreakType to StreakData key
      switch (type) {
        case 'login':
          current = streaks.loginStreak.current;
          break;
        case 'task':
          current = streaks.taskStreak.current;
          break;
        case 'note':
          current = streaks.noteStreak.current;
          break;
        case 'focus':
          current = streaks.focusStreak.current;
          break;
      }
      
      const atRisk = isStreakAtRisk(type);
      
      return {
        icon,
        label,
        current,
        atRisk,
      };
    });
  }, [streaks, isStreakAtRisk]);

  /**
   * Handle click to navigate to streak dashboard
   */
  const handleClick = () => {
    playUIClick();
    navigate('/streaks');
  };

  /**
   * Handle hover for audio feedback and tooltip
   */
  const handleMouseEnter = () => {
    playUIHover();
    setShowTooltip(true);
  };

  /**
   * Handle mouse leave to hide tooltip
   */
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  /**
   * Handle focus for keyboard users
   */
  const handleFocus = () => {
    setShowTooltip(true);
  };

  /**
   * Handle blur to hide tooltip
   */
  const handleBlur = () => {
    setShowTooltip(false);
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // Don't render if loading or no streaks
  if (loading || !streaks || highestStreak === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div
        className={`${styles.indicator} ${anyStreakAtRisk ? styles.atRisk : ''}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Current streak: ${highestStreak} days. ${anyStreakAtRisk ? 'Warning: streak at risk!' : ''} Click to view streak dashboard.`}
      >
        <div className={styles.iconContainer}>
          <span className={styles.fireIcon} aria-hidden="true">🔥</span>
          <span className={styles.streakNumber}>{highestStreak}</span>
        </div>
        
        {anyStreakAtRisk && (
          <div className={styles.warningBadge} aria-hidden="true">
            ⚠️
          </div>
        )}
      </div>

      {/* Custom Tooltip */}
      {showTooltip && tooltipData.length > 0 && (
        <div 
          className={styles.tooltip}
          role="tooltip"
          aria-hidden="true"
        >
          <div className={styles.tooltipHeader}>Your Streaks</div>
          <div className={styles.tooltipContent}>
            {tooltipData.map((streak, index) => (
              <div 
                key={index}
                className={`${styles.tooltipRow} ${streak.atRisk ? styles.tooltipRowAtRisk : ''}`}
              >
                <span className={styles.tooltipIcon}>{streak.icon}</span>
                <span className={styles.tooltipLabel}>{streak.label}</span>
                <span className={styles.tooltipValue}>
                  {streak.current} {streak.current === 1 ? 'day' : 'days'}
                  {streak.atRisk && <span className={styles.tooltipWarning}> ⚠️</span>}
                </span>
              </div>
            ))}
          </div>
          <div className={styles.tooltipFooter}>Click to view details</div>
        </div>
      )}
    </div>
  );
}
