import React, { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import styles from './SpiritCompanion.module.css';

export type EvolutionStage = 'egg' | 'hatchling' | 'juvenile' | 'adult' | 'elder' | 'ascended';

interface SpiritCompanionProps {
  achievementCount: number;
  taskCompletionCount: number;
  onInteract?: () => void;
}

export const SpiritCompanion: React.FC<SpiritCompanionProps> = ({
  achievementCount,
  taskCompletionCount,
  onInteract,
}) => {
  const [stage, setStage] = useState<EvolutionStage>('egg');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showEvolutionEffect, setShowEvolutionEffect] = useState(false);

  // Calculate evolution stage based on achievements and tasks
  useEffect(() => {
    const totalProgress = achievementCount * 10 + taskCompletionCount;
    let newStage: EvolutionStage = 'egg';

    if (totalProgress >= 200) {
      newStage = 'ascended';
    } else if (totalProgress >= 100) {
      newStage = 'elder';
    } else if (totalProgress >= 50) {
      newStage = 'adult';
    } else if (totalProgress >= 20) {
      newStage = 'juvenile';
    } else if (totalProgress >= 5) {
      newStage = 'hatchling';
    }

    if (newStage !== stage) {
      setShowEvolutionEffect(true);
      setTimeout(() => {
        setStage(newStage);
        setTimeout(() => setShowEvolutionEffect(false), 2000);
      }, 500);
    }
  }, [achievementCount, taskCompletionCount, stage]);

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
    onInteract?.();
  };

  const getStageInfo = () => {
    switch (stage) {
      case 'egg':
        return {
          name: 'Mysterious Egg',
          description: 'A dormant spirit awaits awakening',
          emoji: '🥚',
          color: '#9d4edd',
        };
      case 'hatchling':
        return {
          name: 'Spirit Wisp',
          description: 'A tiny spark of ethereal energy',
          emoji: '✨',
          color: '#c77dff',
        };
      case 'juvenile':
        return {
          name: 'Shadow Sprite',
          description: 'Growing stronger with each deed',
          emoji: '👻',
          color: '#e0aaff',
        };
      case 'adult':
        return {
          name: 'Phantom Guardian',
          description: 'A powerful protector of your realm',
          emoji: '🦇',
          color: '#7b2cbf',
        };
      case 'elder':
        return {
          name: 'Ancient Wraith',
          description: 'Wisdom incarnate, master of shadows',
          emoji: '🌙',
          color: '#5a189a',
        };
      case 'ascended':
        return {
          name: 'Celestial Entity',
          description: 'Transcended beyond mortal comprehension',
          emoji: '⭐',
          color: '#240046',
        };
    }
  };

  const stageInfo = getStageInfo();
  const progress = Math.min(100, ((achievementCount * 10 + taskCompletionCount) / 200) * 100);

  return (
    <div className={styles.companionContainer}>
      {showEvolutionEffect && (
        <div className={styles.evolutionEffect}>
          <div className={styles.evolutionBurst}></div>
          <div className={styles.evolutionText}>Evolution!</div>
        </div>
      )}

      <div
        className={`${styles.companion} ${styles[stage]} ${isAnimating ? styles.animating : ''}`}
        onClick={handleClick}
        style={{ '--stage-color': stageInfo.color } as React.CSSProperties}
      >
        <div className={styles.companionBody}>
          <div className={styles.companionEmoji}>{stageInfo.emoji}</div>
          <div className={styles.companionGlow}></div>
          <div className={styles.companionParticles}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={styles.particle} style={{ '--particle-delay': `${i * 0.2}s` } as React.CSSProperties}></div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.companionInfo}>
        <h3 className={styles.companionName}>{stageInfo.name}</h3>
        <p className={styles.companionDescription}>{stageInfo.description}</p>
        
        <div className={styles.statsContainer}>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Achievements:</span>
            <span className={styles.statValue}>{achievementCount}</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Tasks Completed:</span>
            <span className={styles.statValue}>{taskCompletionCount}</span>
          </div>
        </div>

        <div className={styles.progressContainer}>
          <div className={styles.progressLabel}>
            <span>Evolution Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progress}%`, backgroundColor: stageInfo.color }}
            ></div>
          </div>
        </div>

        <div className={styles.milestones}>
          <div className={`${styles.milestone} ${stage !== 'egg' ? styles.unlocked : ''}`}>
            <span className={styles.milestoneIcon}>✨</span>
            <span className={styles.milestoneText}>Hatchling (5 pts)</span>
          </div>
          <div className={`${styles.milestone} ${['juvenile', 'adult', 'elder', 'ascended'].includes(stage) ? styles.unlocked : ''}`}>
            <span className={styles.milestoneIcon}>👻</span>
            <span className={styles.milestoneText}>Juvenile (20 pts)</span>
          </div>
          <div className={`${styles.milestone} ${['adult', 'elder', 'ascended'].includes(stage) ? styles.unlocked : ''}`}>
            <span className={styles.milestoneIcon}>🦇</span>
            <span className={styles.milestoneText}>Adult (50 pts)</span>
          </div>
          <div className={`${styles.milestone} ${['elder', 'ascended'].includes(stage) ? styles.unlocked : ''}`}>
            <span className={styles.milestoneIcon}>🌙</span>
            <span className={styles.milestoneText}>Elder (100 pts)</span>
          </div>
          <div className={`${styles.milestone} ${stage === 'ascended' ? styles.unlocked : ''}`}>
            <span className={styles.milestoneIcon}>⭐</span>
            <span className={styles.milestoneText}>Ascended (200 pts)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpiritCompanion;
