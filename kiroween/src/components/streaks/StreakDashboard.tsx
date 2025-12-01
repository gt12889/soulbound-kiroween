import React from 'react';
import { useStreak } from '../../contexts/StreakContext';
import { StreakCard } from './StreakCard';
import { ActivityHeatmap } from './ActivityHeatmap';
import { StreakTokens } from './StreakTokens';
import { MILESTONE_DAYS } from '../../types/streak';
import styles from './StreakDashboard.module.css';

/**
 * Get next token milestone based on current streak
 */
function getNextTokenMilestone(currentStreak: number): number | null {
  const tokenMilestones = [30, 100];
  
  for (const milestone of tokenMilestones) {
    if (currentStreak < milestone) {
      return milestone;
    }
  }
  
  return null;
}

/**
 * Get the highest current streak across all streak types
 */
function getHighestStreak(streaks: ReturnType<typeof useStreak>['streaks']): number {
  if (!streaks) return 0;
  
  return Math.max(
    streaks.loginStreak.current,
    streaks.taskStreak.current,
    streaks.noteStreak.current,
    streaks.focusStreak.current
  );
}

/**
 * StreakDashboard Component
 * 
 * Main dashboard page displaying all streak information:
 * - Individual streak cards for each streak type
 * - Activity heatmap showing 365 days of activity
 * - Token display showing available recovery tokens
 * - Milestone progress indicators
 * 
 * Requirements: Task 4.1 - Streak Dashboard Page
 * - Layout all streak cards
 * - Add activity heatmap
 * - Show token display
 * - Add milestone progress
 * - Create navigation route
 */
export const StreakDashboard: React.FC = () => {
  const {
    streaks,
    loading,
    heatmapData,
    isStreakAtRisk,
    nextMilestone,
  } = useStreak();
  
  if (loading || !streaks) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} aria-label="Loading streaks..." />
          <p>Loading your streaks...</p>
        </div>
      </div>
    );
  }
  
  // Calculate token information
  const highestStreak = getHighestStreak(streaks);
  const nextTokenMilestone = getNextTokenMilestone(highestStreak);
  const daysUntilNextToken = nextTokenMilestone ? nextTokenMilestone - highestStreak : undefined;
  
  // Get next milestone for overall progress
  const overallNextMilestone = nextMilestone('login');
  const overallProgress = overallNextMilestone 
    ? Math.round((streaks.loginStreak.current / overallNextMilestone) * 100)
    : 100;
  
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon} aria-hidden="true">🔥</span>
          Your Streaks
        </h1>
        <p className={styles.subtitle}>
          Track your daily habits and build consistency
        </p>
      </header>
      
      {/* Token Display */}
      <section className={styles.tokenSection} aria-labelledby="token-heading">
        <h2 id="token-heading" className={styles.srOnly}>Recovery Tokens</h2>
        <StreakTokens
          availableTokens={streaks.tokens.available}
          nextTokenMilestone={nextTokenMilestone ?? undefined}
          daysUntilNextToken={daysUntilNextToken}
        />
      </section>
      
      {/* Streak Cards Grid */}
      <section className={styles.streaksSection} aria-labelledby="streaks-heading">
        <h2 id="streaks-heading" className={styles.sectionTitle}>
          Active Streaks
        </h2>
        <div className={styles.streaksGrid}>
          <StreakCard
            streakType="login"
            streakInfo={streaks.loginStreak}
            isActive={!isStreakAtRisk('login')}
          />
          <StreakCard
            streakType="task"
            streakInfo={streaks.taskStreak}
            isActive={!isStreakAtRisk('task')}
          />
          <StreakCard
            streakType="note"
            streakInfo={streaks.noteStreak}
            isActive={!isStreakAtRisk('note')}
          />
          <StreakCard
            streakType="focus"
            streakInfo={streaks.focusStreak}
            isActive={!isStreakAtRisk('focus')}
          />
        </div>
      </section>
      
      {/* Milestone Progress */}
      {overallNextMilestone && (
        <section className={styles.milestoneSection} aria-labelledby="milestone-heading">
          <h2 id="milestone-heading" className={styles.sectionTitle}>
            Next Milestone
          </h2>
          <div className={styles.milestoneCard}>
            <div className={styles.milestoneHeader}>
              <span className={styles.milestoneIcon} aria-hidden="true">🏆</span>
              <div className={styles.milestoneInfo}>
                <h3 className={styles.milestoneTitle}>
                  {overallNextMilestone}-Day Streak
                </h3>
                <p className={styles.milestoneSubtitle}>
                  {overallNextMilestone - streaks.loginStreak.current} days to go
                </p>
              </div>
            </div>
            <div className={styles.milestoneProgress}>
              <div className={styles.milestoneProgressBar}>
                <div
                  className={styles.milestoneProgressFill}
                  style={{ width: `${overallProgress}%` }}
                  role="progressbar"
                  aria-valuenow={streaks.loginStreak.current}
                  aria-valuemin={0}
                  aria-valuemax={overallNextMilestone}
                  aria-label={`${overallProgress}% progress to ${overallNextMilestone}-day milestone`}
                />
              </div>
              <div className={styles.milestoneProgressLabel}>
                {streaks.loginStreak.current} / {overallNextMilestone} days
              </div>
            </div>
            
            {/* Show all milestones */}
            <div className={styles.allMilestones}>
              <h4 className={styles.allMilestonesTitle}>All Milestones</h4>
              <div className={styles.milestonesList}>
                {MILESTONE_DAYS.map((milestone) => {
                  const isAchieved = streaks.milestones[milestone]?.achieved || false;
                  const isCurrent = milestone === overallNextMilestone;
                  
                  return (
                    <div
                      key={milestone}
                      className={`${styles.milestoneItem} ${isAchieved ? styles.achieved : ''} ${isCurrent ? styles.current : ''}`}
                      aria-label={`${milestone} days ${isAchieved ? 'achieved' : isCurrent ? 'in progress' : 'locked'}`}
                    >
                      <span className={styles.milestoneItemIcon} aria-hidden="true">
                        {isAchieved ? '✓' : isCurrent ? '→' : '○'}
                      </span>
                      <span className={styles.milestoneItemLabel}>
                        {milestone} days
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Activity Heatmap */}
      <section className={styles.heatmapSection} aria-labelledby="heatmap-heading">
        <h2 id="heatmap-heading" className={styles.sectionTitle}>
          Activity History
        </h2>
        <ActivityHeatmap data={heatmapData} />
      </section>
    </div>
  );
};

export default StreakDashboard;
