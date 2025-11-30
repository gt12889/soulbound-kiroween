import { useTasks } from '../../contexts/TasksContext';
import { useNotes } from '../../contexts/NotesContext';
import { achievements } from '../../utils/achievements';
import { InteractiveCompanion } from '../spirit-companion/InteractiveCompanion';
import { useSpiritCompanion } from '../../hooks/useSpiritCompanion';
import { useToast } from '../../contexts/ToastContext';
import styles from './AchievementsPage.module.css';

export function AchievementsPage() {
  const { tasks } = useTasks();
  const { notes } = useNotes();
  const companionStats = useSpiritCompanion();
  const { showToast } = useToast();

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalNotes = notes.length;
  const totalWords = notes.reduce((acc, note) => acc + note.content.split(/\s+/).length, 0);

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

  return (
    <div className={styles.achievementsContainer}>
      <h1 className={styles.title}>Deeds & Decrees</h1>
      <p className={styles.subtitle}>Your legend echoes through the forest...</p>

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

      {/* Achievements Section */}
      <h2 className={styles.sectionTitle}>Achievements</h2>
      <div className={styles.achievementsGrid}>
        {achievements.map(achievement => {
          const isUnlocked = achievement.isUnlocked({ tasks, notes });
          return (
            <div key={achievement.id} className={`${styles.achievementCard} ${isUnlocked ? styles.unlocked : styles.locked}`}>
              <div className={styles.achievementIcon}>{isUnlocked ? achievement.icon : '❓'}</div>
              <h3 className={styles.achievementTitle}>{achievement.title}</h3>
              <p className={styles.achievementDescription}>{achievement.description}</p>
              {isUnlocked && <div className={styles.unlockedBadge}>Unlocked</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}