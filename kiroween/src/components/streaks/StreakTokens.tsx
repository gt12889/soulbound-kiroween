import React, { useEffect, useState } from 'react';
import styles from './StreakTokens.module.css';

/**
 * Props for StreakTokens component
 */
interface StreakTokensProps {
  /** Number of available tokens (0-3) */
  availableTokens: number;
  /** Optional: Next milestone to earn a token */
  nextTokenMilestone?: number;
  /** Optional: Days until next token milestone */
  daysUntilNextToken?: number;
  /** Optional: Custom class name */
  className?: string;
  /** Optional: Trigger celebration animation when token is earned */
  onTokenEarned?: boolean;
}

/**
 * StreakTokens Component
 * 
 * Displays recovery tokens in a visual ●●○ style format.
 * Shows token count, provides tooltip explanation, and displays next milestone.
 * 
 * Requirements: Task 3.3 - Token Display UI
 * - Show token count (●●○ style)
 * - Add tooltip explaining tokens
 * - Show next token milestone
 * - Animate token earning
 */
export const StreakTokens: React.FC<StreakTokensProps> = ({
  availableTokens,
  nextTokenMilestone,
  daysUntilNextToken,
  className = '',
  onTokenEarned = false,
}) => {
  const maxTokens = 3;
  const clampedTokens = Math.max(0, Math.min(maxTokens, availableTokens));
  const [celebrating, setCelebrating] = useState(false);
  const [previousTokens, setPreviousTokens] = useState(clampedTokens);

  // Detect when a new token is earned
  useEffect(() => {
    if (onTokenEarned || (clampedTokens > previousTokens && previousTokens >= 0)) {
      setCelebrating(true);
      const timer = setTimeout(() => {
        setCelebrating(false);
      }, 2000); // Animation duration
      
      return () => clearTimeout(timer);
    }
    setPreviousTokens(clampedTokens);
  }, [clampedTokens, previousTokens, onTokenEarned]);

  return (
    <div className={`${styles.tokenContainer} ${className} ${celebrating ? styles.celebrating : ''}`}>
      {/* Token Display */}
      <div className={styles.tokenDisplay}>
        <span className={styles.tokenLabel} aria-hidden="true">
          🎟️
        </span>
        <div className={styles.tokenIcons} role="img" aria-label={`${clampedTokens} of ${maxTokens} recovery tokens available`}>
          {[...Array(maxTokens)].map((_, i) => (
            <span
              key={i}
              className={`${styles.tokenIcon} ${i < clampedTokens ? styles.tokenAvailable : styles.tokenEmpty}`}
              aria-hidden="true"
            >
              {i < clampedTokens ? '●' : '○'}
            </span>
          ))}
        </div>
        <span className={styles.tokenCount} aria-hidden="true">
          ({clampedTokens}/{maxTokens})
        </span>
      </div>

      {/* Tooltip */}
      <div className={styles.tooltip} role="tooltip">
        <div className={styles.tooltipHeader}>
          <span className={styles.tooltipIcon}>🎟️</span>
          <h4 className={styles.tooltipTitle}>Recovery Tokens</h4>
        </div>
        <div className={styles.tooltipContent}>
          <p className={styles.tooltipText}>
            Recovery tokens allow you to restore a broken streak within 48 hours of missing a day.
          </p>
          <div className={styles.tooltipDivider} />
          <div className={styles.tooltipSection}>
            <h5 className={styles.tooltipSubtitle}>How to Earn Tokens:</h5>
            <ul className={styles.tooltipList}>
              <li>Reach a 30-day streak: <strong>+1 token</strong></li>
              <li>Reach a 100-day streak: <strong>+2 tokens</strong></li>
              <li>Maximum: <strong>3 tokens</strong></li>
            </ul>
          </div>
          {nextTokenMilestone && daysUntilNextToken !== undefined && (
            <>
              <div className={styles.tooltipDivider} />
              <div className={styles.tooltipSection}>
                <h5 className={styles.tooltipSubtitle}>Next Token:</h5>
                <p className={styles.tooltipProgress}>
                  <strong>{daysUntilNextToken} days</strong> until {nextTokenMilestone}-day milestone
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Next Milestone Display (optional) */}
      {nextTokenMilestone && daysUntilNextToken !== undefined && (
        <div className={styles.milestoneInfo}>
          <span className={styles.milestoneText}>
            Next token in <strong>{daysUntilNextToken}</strong> days
          </span>
        </div>
      )}
    </div>
  );
};

export default StreakTokens;
