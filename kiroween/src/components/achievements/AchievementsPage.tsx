import { useTasks } from '../../contexts/TasksContext';
import { useNotes } from '../../contexts/NotesContext';
import { achievements } from '../../utils/achievements';
import { InteractiveCompanion } from '../spirit-companion/InteractiveCompanion';
import { useSpiritCompanion } from '../../hooks/useSpiritCompanion';
import { useToast } from '../../contexts/ToastContext';
import { useStreak } from '../../contexts/StreakContext';
import { useCompanion } from '../../contexts/CompanionContext';
import { useApp } from '../../contexts/AppContext';
import { MILESTONE_CONFIGS, MILESTONE_DAYS } from '../../types/streak';
import { EMBER_SKILLS, SHADOW_SKILLS, ZOMBIE_SKILLS } from '../../types/skillTree';
import { StreakCard } from '../streaks/StreakCard';
import { ActivityHeatmap } from '../streaks/ActivityHeatmap';
import { StreakTokens } from '../streaks/StreakTokens';
import { GitHubConnectButton } from '../streaks/GitHubConnectButton';
import { GitHubCommitHeatmap } from '../streaks/GitHubCommitHeatmap';
import { CompanionSelectionModal } from '../spirit-companion/CompanionSelectionModal';
import type { CompanionType } from '../../types/companion';
import { COMPANION_TYPES } from '../../types/companion';
import { useMemo, useState, useEffect } from 'react';
import styles from './AchievementsPage.module.css';
import streakStyles from '../streaks/StreakDashboard.module.css';

export function AchievementsPage() {
  const { tasks } = useTasks();
  const { notes } = useNotes();
  const companionStats = useSpiritCompanion();
  const { showToast } = useToast();
  const { streaks } = useStreak();
  const { activeCompanion, skillTree } = useCompanion();
  const { hasSelectedCompanion, setCompanionType } = useApp();

  const [activeTab, setActiveTab] = useState<'achievements' | 'streaks'>('achievements');
  const [activeFilter, setActiveFilter] = useState<'all' | 'milestone' | 'skill' | 'achievement'>('all');
  const [showCompanionModal, setShowCompanionModal] = useState(false);

  // Show companion selection modal if user hasn't selected a companion
  useEffect(() => {
    if (!hasSelectedCompanion) {
      setShowCompanionModal(true);
    }
  }, [hasSelectedCompanion]);

  // Handle companion selection
  const handleCompanionSelect = async (type: CompanionType) => {
    try {
      await setCompanionType(type);
      setShowCompanionModal(false);
      showToast({
        message: `Your ${COMPANION_TYPES[type].name} has bonded with you!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to save companion selection:', error);
      showToast({
        message: 'Failed to save your companion choice. Please try again.',
        type: 'error'
      });
    }
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalNotes = notes.length;
  const totalWords = notes.reduce((acc, note) => acc + note.content.split(/\s+/).length, 0);

  // Get unlocked milestones from streak data
  const unlockedMilestones = useMemo(() => {
    if (!streaks) return [];
    
    return Object.values(MILESTONE_CONFIGS).filter(milestone => {
      const milestoneData = streaks.milestones[milestone.days as keyof typeof streaks.milestones];
      return milestoneData?.achieved || false;
    });
  }, [streaks]);

  // Get unlocked companion skills (including Eternal Flame)
  const unlockedSkills = useMemo(() => {
    const allSkills: Array<{ id: string; name: string; description: string; icon: string; type: 'skill'; effect?: any }> = [];
    
    // Get skills for active companion
    const companionSkills = activeCompanion === 'ember' ? EMBER_SKILLS :
                           activeCompanion === 'shadow' ? SHADOW_SKILLS :
                           ZOMBIE_SKILLS;
    
    Object.values(companionSkills).flat().forEach(skill => {
      if (skillTree.unlockedSkills.includes(skill.id)) {
        allSkills.push({
          ...skill,
          type: 'skill' as const,
          effect: skill.effect,
        });
      }
    });
    
    return allSkills;
  }, [activeCompanion, skillTree.unlockedSkills]);

  // Combine achievements, milestones, and skills into unified list
  const allDeeds = useMemo(() => {
    const deeds: Array<{
      id: string;
      title: string;
      description: string;
      icon: string;
      type: 'achievement' | 'milestone' | 'skill';
      unlocked: boolean;
      rewards?: Array<{ type: string; value: any; name: string }>;
    }> = [];

    // Add regular achievements
    achievements.forEach(achievement => {
      const isUnlocked = achievement.isUnlocked({ tasks, notes });
      deeds.push({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        type: 'achievement',
        unlocked: isUnlocked,
      });
    });

    // Add unlocked milestones
    unlockedMilestones.forEach(milestone => {
      deeds.push({
        id: `milestone-${milestone.days}`,
        title: milestone.name,
        description: milestone.description,
        icon: milestone.icon,
        type: 'milestone',
        unlocked: true,
        rewards: milestone.rewards,
      });
    });

    // Add unlocked skills (including Eternal Flame)
    unlockedSkills.forEach(skill => {
      const effectDescription = skill.effect?.type === 'dialogue_unlock' 
        ? `Unlocks ${skill.effect.value.join(' and ')} dialogue`
        : skill.description;
      
      deeds.push({
        id: `skill-${skill.id}`,
        title: skill.name,
        description: effectDescription,
        icon: skill.icon,
        type: 'skill',
        unlocked: true,
        rewards: skill.effect ? [{ type: skill.effect.type, value: skill.effect.value, name: skill.name }] : undefined,
      });
    });

    return deeds.sort((a, b) => {
      // Sort: unlocked first, then by type (milestone > skill > achievement)
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      const typeOrder = { milestone: 0, skill: 1, achievement: 2 };
      return typeOrder[a.type] - typeOrder[b.type];
    });
  }, [tasks, notes, unlockedMilestones, unlockedSkills]);

  // Filter deeds based on active filter
  const filteredDeeds = useMemo(() => {
    if (activeFilter === 'all') return allDeeds;
    return allDeeds.filter(deed => deed.type === activeFilter);
  }, [allDeeds, activeFilter]);

  const handleCompanionInteract = () => {
    const messages = [
      "Your spirit companion acknowledges you...",
      "The ethereal being seems pleased with your progress.",
      "A mystical bond strengthens between you.",
      "The companion's energy resonates with your dedication.",
      "Ancient wisdom flows through your connection.",
    ];
    showToast({
      message: messages[Math.floor(Math.random() * messages.length)],
      type: 'info'
    });
  };

  // Streak dashboard helper functions
  const getHighestStreak = (streakData: typeof streaks) => {
    if (!streakData) return 0;
    return Math.max(
      streakData.loginStreak.current,
      streakData.taskStreak.current,
      streakData.noteStreak.current,
      streakData.focusStreak.current
    );
  };

  const getNextTokenMilestone = (currentStreak: number): number | null => {
    const tokenMilestones = [30, 100];
    for (const milestone of tokenMilestones) {
      if (currentStreak < milestone) {
        return milestone;
      }
    }
    return null;
  };

  const { loading, heatmapData, isStreakAtRisk, nextMilestone } = useStreak();

  // Calculate streak dashboard data
  const highestStreak = streaks ? getHighestStreak(streaks) : 0;
  const nextTokenMilestone = getNextTokenMilestone(highestStreak);
  const daysUntilNextToken = nextTokenMilestone ? nextTokenMilestone - highestStreak : undefined;
  const overallNextMilestone = streaks ? nextMilestone('login') : null;
  const overallProgress = overallNextMilestone && streaks
    ? Math.round((streaks.loginStreak.current / overallNextMilestone) * 100)
    : 100;

  return (
    <div className={styles.achievementsContainer}>
      {/* Companion Selection Modal */}
      <CompanionSelectionModal
        isOpen={showCompanionModal}
        onSelect={handleCompanionSelect}
      />

      <h1 className={styles.title}>Deeds & Flames</h1>
      <p className={styles.subtitle}>Your legend echoes through the forest...</p>

      {/* Main Tabs */}
      <div className={styles.mainTabs}>
        <button 
          className={`${styles.mainTab} ${activeTab === 'achievements' ? styles.active : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <span className={styles.tabIcon}>🏆</span>
          <span className={styles.tabLabel}>Deeds & Decrees</span>
        </button>
        <button 
          className={`${styles.mainTab} ${activeTab === 'streaks' ? styles.active : ''}`}
          onClick={() => setActiveTab('streaks')}
        >
          <span className={styles.tabIcon}>🔥</span>
          <span className={styles.tabLabel}>Eternal Flames</span>
        </button>
      </div>

      {/* Achievements Tab Content */}
      {activeTab === 'achievements' && (
        <>
          {/* Spirit Companion Section */}
          <div className={styles.companionSection}>
            <InteractiveCompanion
              achievementCount={companionStats.achievementCount}
              taskCompletionCount={companionStats.taskCompletionCount}
              onInteract={handleCompanionInteract}
            />
          </div>

          {/* Stats Section */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{completedTasks}</div>
              <div className={styles.statLabel}>Tasks Completed</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{totalNotes}</div>
              <div className={styles.statLabel}>Notes Written</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{totalWords}</div>
              <div className={styles.statLabel}>Words Inscribed</div>
            </div>
          </div>

          {/* Unified Deeds & Decrees Section */}
          <div className={styles.deedsHeader}>
            <h2 className={styles.sectionTitle}>Deeds & Decrees</h2>
            <div className={styles.deedsStats}>
              <span className={styles.deedStat}>
                <strong>{allDeeds.filter(d => d.unlocked).length}</strong> Unlocked
              </span>
              <span className={styles.deedStat}>
                <strong>{unlockedMilestones.length}</strong> Milestones
              </span>
              <span className={styles.deedStat}>
                <strong>{unlockedSkills.length}</strong> Skills
              </span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className={styles.filterTabs}>
            <button 
              className={`${styles.filterTab} ${activeFilter === 'all' ? styles.active : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Deeds
            </button>
            <button 
              className={`${styles.filterTab} ${activeFilter === 'milestone' ? styles.active : ''}`}
              onClick={() => setActiveFilter('milestone')}
            >
              Milestones ({unlockedMilestones.length})
            </button>
            <button 
              className={`${styles.filterTab} ${activeFilter === 'skill' ? styles.active : ''}`}
              onClick={() => setActiveFilter('skill')}
            >
              Skills ({unlockedSkills.length})
            </button>
            <button 
              className={`${styles.filterTab} ${activeFilter === 'achievement' ? styles.active : ''}`}
              onClick={() => setActiveFilter('achievement')}
            >
              Achievements ({achievements.filter(a => a.isUnlocked({ tasks, notes })).length})
            </button>
          </div>

          {/* Unified Grid */}
          <div className={styles.deedsGrid}>
            {filteredDeeds.map(deed => (
              <div 
                key={deed.id} 
                className={`${styles.deedCard} ${deed.unlocked ? styles.unlocked : styles.locked} ${styles[deed.type]}`}
                data-type={deed.type}
              >
                <div className={styles.deedIcon}>{deed.unlocked ? deed.icon : '❓'}</div>
                <div className={styles.deedTypeBadge}>{deed.type}</div>
                <h3 className={styles.deedTitle}>{deed.title}</h3>
                <p className={styles.deedDescription}>{deed.description}</p>
                
                {/* Show rewards for milestones and skills */}
                {deed.unlocked && deed.rewards && deed.rewards.length > 0 && (
                  <div className={styles.deedRewards}>
                    {deed.rewards.map((reward, idx) => {
                      if (reward.type === 'dialogue') {
                        return (
                          <span key={idx} className={styles.rewardBadge} title={`Unlocks ${reward.name} dialogue`}>
                            💬 {reward.name}
                          </span>
                        );
                      }
                      if (reward.type === 'dialogue_unlock') {
                        const dialogues = Array.isArray(reward.value) ? reward.value : [reward.value];
                        return (
                          <span key={idx} className={styles.rewardBadge} title={`Unlocks ${dialogues.join(', ')} dialogue`}>
                            🕯️ {dialogues.join(', ')}
                          </span>
                        );
                      }
                      if (reward.type === 'xp') {
                        return (
                          <span key={idx} className={styles.rewardBadge}>
                            ⭐ +{reward.value} XP
                          </span>
                        );
                      }
                      if (reward.type === 'token') {
                        return (
                          <span key={idx} className={styles.rewardBadge}>
                            🪙 {reward.value} Token{reward.value > 1 ? 's' : ''}
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
                
                {deed.unlocked && <div className={styles.unlockedBadge}>Unlocked</div>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Streaks Tab Content */}
      {activeTab === 'streaks' && (
        <>
          {loading || !streaks ? (
            <div className={streakStyles.loading}>
              <div className={streakStyles.loadingSpinner} aria-label="Loading streaks..." />
              <p>Loading your streaks...</p>
            </div>
          ) : (
            <>
              {/* Token Display */}
              <section className={streakStyles.tokenSection} aria-labelledby="token-heading">
                <h2 id="token-heading" className={streakStyles.srOnly}>Recovery Tokens</h2>
                <StreakTokens
                  availableTokens={streaks.tokens.available}
                  nextTokenMilestone={nextTokenMilestone ?? undefined}
                  daysUntilNextToken={daysUntilNextToken}
                />
              </section>
              
              {/* Streak Cards Grid */}
              <section className={streakStyles.streaksSection} aria-labelledby="streaks-heading">
                <h2 id="streaks-heading" className={streakStyles.sectionTitle}>
                  Active Streaks
                </h2>
                <div className={streakStyles.streaksGrid}>
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
                <section className={streakStyles.milestoneSection} aria-labelledby="milestone-heading">
                  <h2 id="milestone-heading" className={streakStyles.sectionTitle}>
                    Next Milestone
                  </h2>
                  <div className={streakStyles.milestoneCard}>
                    <div className={streakStyles.milestoneHeader}>
                      <span className={streakStyles.milestoneIcon} aria-hidden="true">🏆</span>
                      <div className={streakStyles.milestoneInfo}>
                        <h3 className={streakStyles.milestoneTitle}>
                          {overallNextMilestone}-Day Streak
                        </h3>
                        <p className={streakStyles.milestoneSubtitle}>
                          {overallNextMilestone - streaks.loginStreak.current} days to go
                        </p>
                      </div>
                    </div>
                    <div className={streakStyles.milestoneProgress}>
                      <div className={streakStyles.milestoneProgressBar}>
                        <div
                          className={streakStyles.milestoneProgressFill}
                          style={{ width: `${overallProgress}%` }}
                          role="progressbar"
                          aria-valuenow={streaks.loginStreak.current}
                          aria-valuemin={0}
                          aria-valuemax={overallNextMilestone}
                          aria-label={`${overallProgress}% progress to ${overallNextMilestone}-day milestone`}
                        />
                      </div>
                      <div className={streakStyles.milestoneProgressLabel}>
                        {streaks.loginStreak.current} / {overallNextMilestone} days
                      </div>
                    </div>
                    
                    {/* Show all milestones */}
                    <div className={streakStyles.allMilestones}>
                      <h4 className={streakStyles.allMilestonesTitle}>All Milestones</h4>
                      <div className={streakStyles.milestonesList}>
                        {MILESTONE_DAYS.map((milestone) => {
                          const isAchieved = streaks.milestones[milestone]?.achieved || false;
                          const isCurrent = milestone === overallNextMilestone;
                          
                          return (
                            <div
                              key={milestone}
                              className={`${streakStyles.milestoneItem} ${isAchieved ? streakStyles.achieved : ''} ${isCurrent ? streakStyles.current : ''}`}
                              aria-label={`${milestone} days ${isAchieved ? 'achieved' : isCurrent ? 'in progress' : 'locked'}`}
                            >
                              <span className={streakStyles.milestoneItemIcon} aria-hidden="true">
                                {isAchieved ? '✓' : isCurrent ? '→' : '○'}
                              </span>
                              <span className={streakStyles.milestoneItemLabel}>
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
              
              {/* GitHub Connection */}
              <section className={streakStyles.heatmapSection} aria-labelledby="github-heading">
                <h2 id="github-heading" className={streakStyles.sectionTitle}>
                  GitHub Integration
                </h2>
                <GitHubConnectButton />
                <GitHubCommitHeatmap />
              </section>
              
              {/* Activity Heatmap */}
              <section className={streakStyles.heatmapSection} aria-labelledby="heatmap-heading">
                <h2 id="heatmap-heading" className={streakStyles.sectionTitle}>
                  Activity History
                </h2>
                <ActivityHeatmap data={heatmapData} />
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}