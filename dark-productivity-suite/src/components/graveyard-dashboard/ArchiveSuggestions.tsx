import { useState, useEffect } from 'react';
import { useTasks } from '../../contexts/TasksContext';
import { useAudio } from '../../hooks/useAudio';
import type { Task } from '../../types';
import styles from './ArchiveSuggestions.module.css';

/**
 * ArchiveSuggestions component - suggests tasks for archiving
 * Requirements: 15.6
 */
export function ArchiveSuggestions() {
  const { getArchiveSuggestions, archiveTask } = useTasks();
  const { playUIClick, playUIHover } = useAudio();
  const [suggestions, setSuggestions] = useState<Task[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for suggestions on mount and periodically
    const checkSuggestions = () => {
      const newSuggestions = getArchiveSuggestions();
      const filteredSuggestions = newSuggestions.filter(
        task => !dismissed.has(task.id)
      );
      setSuggestions(filteredSuggestions);
      setIsVisible(filteredSuggestions.length > 0);
    };

    checkSuggestions();
    
    // Check every hour for new suggestions
    const interval = setInterval(checkSuggestions, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [getArchiveSuggestions, dismissed]);

  const handleArchiveAll = () => {
    playUIClick();
    suggestions.forEach(task => {
      archiveTask(task.id);
    });
    setSuggestions([]);
    setIsVisible(false);
  };

  const handleArchiveOne = (taskId: string) => {
    playUIClick();
    archiveTask(taskId);
    setSuggestions(prev => prev.filter(task => task.id !== taskId));
    if (suggestions.length <= 1) {
      setIsVisible(false);
    }
  };

  const handleDismiss = (taskId: string) => {
    playUIClick();
    setDismissed(prev => new Set(prev).add(taskId));
    setSuggestions(prev => prev.filter(task => task.id !== taskId));
    if (suggestions.length <= 1) {
      setIsVisible(false);
    }
  };

  const handleDismissAll = () => {
    playUIClick();
    suggestions.forEach(task => {
      setDismissed(prev => new Set(prev).add(task.id));
    });
    setSuggestions([]);
    setIsVisible(false);
  };

  const handleClose = () => {
    playUIClick();
    setIsVisible(false);
  };

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button 
          className={styles.closeButton}
          onClick={handleClose}
          onMouseEnter={playUIHover}
          aria-label="Close"
        >
          ✕
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>Archive Suggestions</h2>
          <p className={styles.subtitle}>
            {suggestions.length} {suggestions.length === 1 ? 'task has' : 'tasks have'} been completed for over 30 days
          </p>
        </div>

        <div className={styles.content}>
          <p className={styles.description}>
            These tasks have been resting in the graveyard for a while. 
            Would you like to move them to the deep archive?
          </p>

          <div className={styles.taskList}>
            {suggestions.map(task => (
              <div key={task.id} className={styles.taskItem}>
                <div className={styles.taskInfo}>
                  <h3 className={styles.taskTitle}>{task.title}</h3>
                  <div className={styles.taskMeta}>
                    <span>Completed: {new Date(task.completedAt!).toLocaleDateString()}</span>
                    <span>Priority: {task.priority}</span>
                  </div>
                </div>
                <div className={styles.taskActions}>
                  <button
                    className={styles.archiveButton}
                    onClick={() => handleArchiveOne(task.id)}
                    onMouseEnter={playUIHover}
                  >
                    Archive
                  </button>
                  <button
                    className={styles.dismissButton}
                    onClick={() => handleDismiss(task.id)}
                    onMouseEnter={playUIHover}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.archiveAllButton}
            onClick={handleArchiveAll}
            onMouseEnter={playUIHover}
          >
            Archive All
          </button>
          <button
            className={styles.dismissAllButton}
            onClick={handleDismissAll}
            onMouseEnter={playUIHover}
          >
            Dismiss All
          </button>
        </div>
      </div>
    </div>
  );
}
