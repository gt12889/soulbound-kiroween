import React, { useEffect, useState } from 'react';
import { useCompanion } from '../../contexts/CompanionContext';
import styles from './MilestoneCelebration.module.css';

/** Streak property names from StreakData */
export type StreakPropertyType = 'loginStreak' | 'taskStreak' | 'noteStreak' | 'focusStreak';

interface MilestoneCelebrationProps {
  /** The type of streak that reached a milestone */
  streakType: StreakPropertyType;
  /** The milestone day count (e.g., 7, 30, 100) */
  milestoneDay: number;
  /** Whether to show the celebration */
  show: boolean;
  /** Callback when celebration completes */
  onComplete?: () => void;
  /** Duration of the celebration in milliseconds */
  duration?: number;
}

/**
 * Calculate XP reward based on milestone significance
 * Requirements: Task 4.3 - XP awarded correctly
 */
function calculateMilestoneXP(milestoneDay: number): number {
  if (milestoneDay >= 365) return 500; // Legendary
  if (milestoneDay >= 100) return 200; // Century
  if (milestoneDay >= 60) return 100;  // Two months
  if (milestoneDay >= 30) return 50;   // One month
  if (milestoneDay >= 14) return 25;   // Two weeks
  if (milestoneDay >= 7) return 15;    // One week
  if (milestoneDay >= 3) return 10;    // Three days
  return 5; // Default
}

/**
 * MilestoneCelebration Component
 * 
 * Displays a celebratory animation when a streak milestone is reached.
 * Integrates with companion particles and shows special dialogue.
 * 
 * Requirements:
 * - Task 4.3: Create celebration animation component
 * - Task 4.3: Integrate with companion particles
 * - Celebration feels rewarding
 * - Companion reacts appropriately
 * - XP awarded correctly
 * - Achievement recorded
 */
export const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({
  streakType,
  milestoneDay,
  show,
  onComplete,
  duration = 3000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { addExperience, interact } = useCompanion();
  
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      // Award XP based on milestone significance
      const xpReward = calculateMilestoneXP(milestoneDay);
      addExperience(xpReward);
      
      // Trigger companion interaction for celebration
      interact();
      
      // Hide after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete, milestoneDay, addExperience, interact]);
  
  if (!isVisible) return null;
  
  // Get streak-specific emoji and color
  const getStreakInfo = () => {
    switch (streakType) {
      case 'loginStreak':
        return { emoji: '🔥', color: '#ff6b35', name: 'Login' };
      case 'taskStreak':
        return { emoji: '⚡', color: '#4cc9f0', name: 'Task' };
      case 'noteStreak':
        return { emoji: '📝', color: '#9d4edd', name: 'Note' };
      case 'focusStreak':
        return { emoji: '⏱️', color: '#f72585', name: 'Focus' };
      default:
        return { emoji: '✨', color: '#4cc9f0', name: 'Streak' };
    }
  };
  
  const streakInfo = getStreakInfo();
  
  // Get milestone-specific message
  const getMilestoneMessage = () => {
    if (milestoneDay >= 365) return 'Legendary Achievement!';
    if (milestoneDay >= 100) return 'Century Milestone!';
    if (milestoneDay >= 60) return 'Two Month Streak!';
    if (milestoneDay >= 30) return 'One Month Streak!';
    if (milestoneDay >= 14) return 'Two Week Streak!';
    if (milestoneDay >= 7) return 'One Week Streak!';
    if (milestoneDay >= 3) return 'Three Day Streak!';
    return 'Milestone Reached!';
  };
  
  // Get companion-specific celebration message
  const getCompanionMessage = () => {
    if (milestoneDay >= 365) return 'Your dedication is legendary! 🌟';
    if (milestoneDay >= 100) return 'A century of commitment! Amazing! 💫';
    if (milestoneDay >= 60) return 'Two months strong! Keep it up! ✨';
    if (milestoneDay >= 30) return 'One month milestone! Incredible! 🎉';
    if (milestoneDay >= 14) return 'Two weeks of consistency! 🔥';
    if (milestoneDay >= 7) return 'One week streak! You\'re on fire! ⚡';
    if (milestoneDay >= 3) return 'Three days in a row! Great start! 🌟';
    return 'Keep up the great work! 💪';
  };
  
  return (
    <div className={styles.celebrationOverlay}>
      {/* Main celebration burst */}
      <div 
        className={styles.celebrationBurst}
        style={{ '--burst-color': streakInfo.color } as React.CSSProperties}
      />
      
      {/* Milestone text */}
      <div className={styles.celebrationContent}>
        <div className={styles.milestoneEmoji}>{streakInfo.emoji}</div>
        <div className={styles.milestoneTitle}>{getMilestoneMessage()}</div>
        <div className={styles.milestoneSubtitle}>
          {milestoneDay} Day {streakInfo.name} Streak!
        </div>
      </div>
      
      {/* Confetti particles */}
      <div className={styles.confettiContainer}>
        {[...Array(30)].map((_, i) => (
          <div
            key={`confetti-${i}`}
            className={styles.confetti}
            style={{
              '--confetti-delay': `${i * 0.05}s`,
              '--confetti-x': `${Math.random() * 400 - 200}px`,
              '--confetti-y': `${Math.random() * 300 + 150}px`,
              '--confetti-rotation': `${Math.random() * 720}deg`,
              '--confetti-color': `hsl(${Math.random() * 360}, 80%, ${50 + Math.random() * 30}%)`,
            } as React.CSSProperties}
          />
        ))}
      </div>
      
      {/* Star burst */}
      <div className={styles.starBurst}>
        {[...Array(12)].map((_, i) => (
          <div
            key={`star-${i}`}
            className={styles.star}
            style={{
              '--star-delay': `${i * 0.08}s`,
              '--star-angle': `${(i * 30)}deg`,
              '--star-distance': `${120 + Math.random() * 80}px`,
            } as React.CSSProperties}
          >
            ⭐
          </div>
        ))}
      </div>
      
      {/* Radial glow waves */}
      <div className={styles.glowWaves}>
        {[...Array(3)].map((_, i) => (
          <div
            key={`wave-${i}`}
            className={styles.glowWave}
            style={{
              '--wave-delay': `${i * 0.4}s`,
              '--wave-color': streakInfo.color,
            } as React.CSSProperties}
          />
        ))}
      </div>
      
      {/* Sparkle particles */}
      <div className={styles.sparkles}>
        {[...Array(20)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className={styles.sparkle}
            style={{
              '--sparkle-delay': `${i * 0.1}s`,
              '--sparkle-x': `${Math.random() * 100}%`,
              '--sparkle-y': `${Math.random() * 100}%`,
            } as React.CSSProperties}
          >
            ✨
          </div>
        ))}
      </div>
      
      {/* Companion celebration particles - mirrors companion's particle system */}
      <div className={styles.companionCelebration}>
        {/* Companion celebration burst */}
        <div className={styles.companionBurst}>
          {[...Array(16)].map((_, i) => (
            <div
              key={`companion-burst-${i}`}
              className={styles.companionBurstParticle}
              style={{
                '--burst-delay': `${i * 0.05}s`,
                '--burst-angle': `${(i * 22.5)}deg`,
                '--burst-distance': `${150 + Math.random() * 100}px`,
                '--burst-color': streakInfo.color,
              } as React.CSSProperties}
            />
          ))}
        </div>
        
        {/* Companion hearts (similar to companion's encouragement hearts) */}
        <div className={styles.companionHearts}>
          {[...Array(8)].map((_, i) => (
            <div
              key={`companion-heart-${i}`}
              className={styles.companionHeart}
              style={{
                '--heart-delay': `${i * 0.2}s`,
                '--heart-angle': `${(i * 45)}deg`,
                '--heart-distance': `${80 + Math.random() * 60}px`,
              } as React.CSSProperties}
            >
              💜
            </div>
          ))}
        </div>
        
        {/* Companion message */}
        <div className={styles.companionMessage}>
          {getCompanionMessage()}
        </div>
      </div>
    </div>
  );
};

export default MilestoneCelebration;
