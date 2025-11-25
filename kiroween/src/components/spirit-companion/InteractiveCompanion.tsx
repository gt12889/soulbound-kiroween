import React, { useEffect, useState, useRef } from 'react';
import { useCompanion } from '../../contexts/CompanionContext';
import { useTheme } from '../../contexts/ThemeContext';
import { CompanionDialogue } from './CompanionDialogue';
import { COMPANION_TYPES } from '../../types/companion';
import styles from './InteractiveCompanion.module.css';

export type EvolutionStage = 'egg' | 'hatchling' | 'juvenile' | 'adult' | 'elder' | 'ascended';

interface InteractiveCompanionProps {
  achievementCount: number;
  taskCompletionCount: number;
  onInteract?: () => void;
}

export const InteractiveCompanion: React.FC<InteractiveCompanionProps> = ({
  achievementCount,
  taskCompletionCount,
  onInteract,
}) => {
  const { interact, mood, activeCompanion, customNames, themeChangeDialogue } = useCompanion();
  const { currentTheme } = useTheme();
  const [stage, setStage] = useState<EvolutionStage>('egg');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showEvolutionEffect, setShowEvolutionEffect] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [lastTaskCount, setLastTaskCount] = useState(taskCompletionCount);
  const [showClickParticles, setShowClickParticles] = useState(false);
  const [showEvolutionParticles, setShowEvolutionParticles] = useState(false);
  const [isEncouraging, setIsEncouraging] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const ghostVideoRef = useRef<HTMLVideoElement>(null);

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
      setShowEvolutionParticles(true);
      setTimeout(() => {
        setStage(newStage);
        setTimeout(() => {
          setShowEvolutionEffect(false);
          setShowEvolutionParticles(false);
        }, 2000);
      }, 500);
    }
  }, [achievementCount, taskCompletionCount, stage]);

  /**
   * Trigger celebration animation when task is completed
   * Requirements: 1.3 - React with celebratory animation on task completion
   */
  useEffect(() => {
    if (taskCompletionCount > lastTaskCount) {
      // Task was completed, trigger celebration
      setIsCelebrating(true);
      setTimeout(() => setIsCelebrating(false), 2000);
      
      // Reset activity time on task completion
      setLastActivityTime(Date.now());
    }
    setLastTaskCount(taskCompletionCount);
  }, [taskCompletionCount, lastTaskCount]);

  /**
   * Track inactivity and show encouragement animation after 30 minutes
   * Requirements: 1.4 - Display encouraging animation after 30 minutes of inactivity
   */
  useEffect(() => {
    const checkInactivity = () => {
      const inactiveTime = Date.now() - lastActivityTime;
      const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
      
      if (inactiveTime >= thirtyMinutes && !isEncouraging) {
        setIsEncouraging(true);
        setTimeout(() => setIsEncouraging(false), 3000);
        // Reset the timer so we don't spam encouragement
        setLastActivityTime(Date.now());
      }
    };
    
    // Check every minute
    const interval = setInterval(checkInactivity, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [lastActivityTime, isEncouraging]);

  /**
   * Reset activity time on user interaction
   */
  useEffect(() => {
    const resetActivity = () => {
      setLastActivityTime(Date.now());
    };
    
    // Listen for various user activity events
    window.addEventListener('mousedown', resetActivity);
    window.addEventListener('keydown', resetActivity);
    window.addEventListener('scroll', resetActivity);
    window.addEventListener('touchstart', resetActivity);
    
    return () => {
      window.removeEventListener('mousedown', resetActivity);
      window.removeEventListener('keydown', resetActivity);
      window.removeEventListener('scroll', resetActivity);
      window.removeEventListener('touchstart', resetActivity);
    };
  }, []);

  /**
   * Handle click interaction
   * Requirements: 1.1 - Play unique interaction animation
   * Requirements: 2.1 - Update mood state based on interaction
   */
  const handleClick = () => {
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
    
    // Trigger click particles
    setShowClickParticles(true);
    setTimeout(() => setShowClickParticles(false), 1000);
    
    // Call CompanionContext interact method to track interaction
    interact();
    
    // Call optional callback prop for backward compatibility
    onInteract?.();
    
    // TODO: Play companion-specific sound effect (Task 1.5)
    // TODO: Display contextual dialogue message (Task 1.6)
  };

  /**
   * Handle hover to show tooltip with mood
   * Requirements: 1.2 - Display tooltip with companion's current mood
   */
  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const getStageInfo = () => {
    // Get the companion definition based on active companion
    const companionDef = COMPANION_TYPES[activeCompanion];
    
    // Use theme colors for companion stages
    // Progression: lighter -> darker as companion evolves
    const stageColors = {
      egg: currentTheme.colors.accentPurpleLight,
      hatchling: currentTheme.colors.highlightBlueLight,
      juvenile: currentTheme.colors.accentPurple,
      adult: currentTheme.colors.highlightBlue,
      elder: currentTheme.colors.accentPurpleDark,
      ascended: currentTheme.colors.borderPrimary,
    };

    // Map stage index to stage name
    const stageIndex = ['egg', 'hatchling', 'juvenile', 'adult', 'elder', 'ascended'].indexOf(stage);
    const stageData = companionDef.stages[stageIndex];

    return {
      name: stageData.name,
      description: stageData.description,
      emoji: stageData.emoji,
      color: stageColors[stage],
    };
  };

  const stageInfo = getStageInfo();
  const progress = Math.min(100, ((achievementCount * 10 + taskCompletionCount) / 200) * 100);

  // Apply ghost video positioning with !important to override CSS modules
  useEffect(() => {
    if (ghostVideoRef.current && activeCompanion === 'shadow') {
      const video = ghostVideoRef.current;
      video.style.setProperty('left', '-23%', 'important');
      video.style.setProperty('top', '-10%', 'important');
      video.style.setProperty('width', '150%', 'important');
      video.style.setProperty('height', '152%', 'important');
      video.style.setProperty('opacity', '1', 'important');
    }
  }, [activeCompanion]);

  return (
    <div className={styles.companionContainer}>
      {/* Theme change dialogue */}
      {themeChangeDialogue && (
        <CompanionDialogue
          message={themeChangeDialogue}
          companionType={activeCompanion}
          position="top"
          duration={5000}
          showTail={true}
        />
      )}
      
      {showEvolutionEffect && (
        <div className={styles.evolutionEffect}>
          <div className={styles.evolutionBurst}></div>
          <div className={styles.evolutionText}>Evolution!</div>
        </div>
      )}

      {showEvolutionParticles && (
        <div className={styles.evolutionParticles}>
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className={styles.evolutionParticle} 
              style={{ 
                '--particle-delay': `${i * 0.05}s`,
                '--particle-angle': `${(i * 18)}deg`,
                '--particle-distance': `${100 + Math.random() * 100}px`,
                '--particle-size': `${4 + Math.random() * 8}px`
              } as React.CSSProperties}
            ></div>
          ))}
        </div>
      )}

      {isCelebrating && (
        <div className={styles.celebrationEffect}>
          <div className={styles.celebrationBurst}></div>
          <div className={styles.celebrationText}>Great Job!</div>
          <div className={styles.celebrationConfetti}>
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className={styles.confetti} 
                style={{ 
                  '--confetti-delay': `${i * 0.08}s`,
                  '--confetti-x': `${Math.random() * 300 - 150}px`,
                  '--confetti-y': `${Math.random() * 200 + 100}px`,
                  '--confetti-rotation': `${Math.random() * 720}deg`,
                  '--confetti-color': `hsl(${Math.random() * 60 + 180}, 80%, ${50 + Math.random() * 30}%)`
                } as React.CSSProperties}
              ></div>
            ))}
          </div>
          <div className={styles.celebrationStars}>
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className={styles.celebrationStar} 
                style={{ 
                  '--star-delay': `${i * 0.15}s`,
                  '--star-angle': `${(i * 45)}deg`,
                  '--star-distance': `${80 + Math.random() * 60}px`
                } as React.CSSProperties}
              >⭐</div>
            ))}
          </div>
        </div>
      )}

      {isEncouraging && (
        <div className={styles.encouragementEffect}>
          <div className={styles.encouragementGlow}></div>
          <div className={styles.encouragementText}>Come back! 💫</div>
          <div className={styles.encouragementWaves}>
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className={styles.encouragementWave} 
                style={{ 
                  '--wave-delay': `${i * 0.5}s`
                } as React.CSSProperties}
              ></div>
            ))}
          </div>
          <div className={styles.encouragementHearts}>
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className={styles.encouragementHeart} 
                style={{ 
                  '--heart-delay': `${i * 0.3}s`,
                  '--heart-angle': `${(i * 60)}deg`,
                  '--heart-distance': `${60 + Math.random() * 40}px`
                } as React.CSSProperties}
              >💜</div>
            ))}
          </div>
        </div>
      )}

      {showClickParticles && (
        <div className={styles.clickParticles}>
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className={styles.clickParticle} 
              style={{ 
                '--particle-delay': `${i * 0.05}s`,
                '--particle-angle': `${(i * 30)}deg`,
                '--particle-distance': `${60 + Math.random() * 40}px`
              } as React.CSSProperties}
            ></div>
          ))}
        </div>
      )}

      <div
        className={`${styles.companion} ${styles[stage]} ${isAnimating ? styles.animating : ''} ${isCelebrating ? styles.celebrating : ''} ${isEncouraging ? styles.encouraging : ''}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        aria-label={`${customNames[activeCompanion] || stageInfo.name} companion, ${mood} mood. Click to interact.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        style={{ '--stage-color': stageInfo.color } as React.CSSProperties}
      >
        <div className={styles.companionBody}>
          {/* Ghost animation video for Shadow Spirit companion */}
          {activeCompanion === 'shadow' && (
            <video
              ref={ghostVideoRef}
              className={styles.ghostVideo}
              src="/ghost_)idle.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
          )}
          {/* Zombie animation video for Zombie companion */}
          {activeCompanion === 'zombie' && (
            <video
              ref={ghostVideoRef}
              className={styles.zombieVideo}
              src="/zombie_idle.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
          )}
          {/* Hide emoji for Shadow Spirit and Zombie, show for others */}
          {activeCompanion !== 'shadow' && activeCompanion !== 'zombie' && (
            <div className={styles.companionEmoji}>{stageInfo.emoji}</div>
          )}
          <div className={styles.companionGlow}></div>
          <div className={styles.companionParticles}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={styles.particle} style={{ '--particle-delay': `${i * 0.2}s` } as React.CSSProperties}></div>
            ))}
          </div>
        </div>
        
        {/* Tooltip showing mood and name */}
        {showTooltip && (
          <div className={styles.tooltip} role="tooltip">
            <div className={styles.tooltipName}>
              {customNames[activeCompanion] || stageInfo.name}
            </div>
            <div className={styles.tooltipMood}>
              Mood: {mood.charAt(0).toUpperCase() + mood.slice(1)}
            </div>
          </div>
        )}
      </div>

      <div className={styles.companionInfo}>
        <h3 className={styles.companionName}>
          {customNames[activeCompanion] || stageInfo.name}
        </h3>
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

export default InteractiveCompanion;
