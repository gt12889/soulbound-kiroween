import { useState, useEffect } from 'react';
import type { Task } from '../../types';
import { useAudio } from '../../hooks/useAudio';
import styles from './Tombstone.module.css';

interface TombstoneProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  isDragging?: boolean;
  isArchived?: boolean;
}

/**
 * Tombstone component - renders a task as a gravestone
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 8.4, 15.2, 15.4, 15.5
 */
export function Tombstone({ task, onToggleComplete, onDelete, onArchive, isDragging = false, isArchived = false }: TombstoneProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<'sink' | 'deepSink' | 'restore' | null>(null);
  const { playTombstoneRise, playTombstoneSink } = useAudio();

  // Play rise sound when tombstone is first created (not completed)
  useEffect(() => {
    if (!task.completed) {
      playTombstoneRise();
    }
  }, []); // Only on mount

  const handleToggleComplete = () => {
    setIsAnimating(true);
    
    // Play appropriate sound
    if (task.completed) {
      setAnimationType('restore');
      playTombstoneRise(); // Rising back up when uncompleting
    } else {
      setAnimationType('sink');
      playTombstoneSink(); // Sinking when completing
    }
    
    // Delay the actual completion to allow animation to play
    setTimeout(() => {
      onToggleComplete(task.id);
      setIsAnimating(false);
      setAnimationType(null);
    }, task.completed ? 0 : 1200); // Sink animation duration
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onArchive && task.completed) {
      setIsAnimating(true);
      setAnimationType('deepSink');
      playTombstoneSink();
      
      // Delay archiving to allow animation to play (1.8s for deep sink)
      setTimeout(() => {
        onArchive(task.id);
        setIsAnimating(false);
        setAnimationType(null);
      }, 1800);
    }
  };

  const priorityClass = {
    low: styles.priorityLow,
    medium: styles.priorityMedium,
    high: styles.priorityHigh,
  }[task.priority];

  const tombstoneClasses = [
    styles.tombstone,
    priorityClass,
    task.completed ? styles.completed : styles.active,
    isArchived ? styles.archived : '',
    isDragging ? styles.dragging : '',
    isAnimating && animationType === 'sink' ? styles.sinking : '',
    isAnimating && animationType === 'deepSink' ? styles.deepSinking : '',
    isAnimating && animationType === 'restore' ? styles.restoring : '',
    !task.completed && !isAnimating ? styles.rising : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={tombstoneClasses}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={isArchived ? undefined : handleToggleComplete}
    >
      {/* Tombstone shape */}
      <div className={styles.stone}>
        {/* Cross at top */}
        <div className={styles.cross}>
          <div className={styles.crossVertical}></div>
          <div className={styles.crossHorizontal}></div>
        </div>
        
        {/* Engraved title */}
        <div className={styles.title}>{task.title}</div>
        
        {/* RIP text for completed tasks */}
        {task.completed && <div className={styles.rip}>R.I.P.</div>}
      </div>

      {/* Ghostly tooltip on hover */}
      {showTooltip && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipContent}>
            <h4>{task.title}</h4>
            <p>{task.description}</p>
            {task.tags && task.tags.length > 0 && (
              <div className={styles.tooltipTags}>
                {task.tags.map(tag => (
                  <span key={tag} className={styles.tooltipTag}>
                    ✦ {tag}
                  </span>
                ))}
              </div>
            )}
            <div className={styles.tooltipMeta}>
              <span>Priority: {task.priority}</span>
              <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
              {task.completedAt && (
                <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
              )}
              {task.archivedAt && (
                <span>Archived: {new Date(task.archivedAt).toLocaleDateString()}</span>
              )}
            </div>
            {!isArchived && (
              <>
                {task.completed && onArchive && (
                  <button
                    className={styles.archiveButton}
                    onClick={handleArchive}
                  >
                    Archive
                  </button>
                )}
                <button
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                >
                  Remove
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
