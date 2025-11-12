import { useState, useEffect } from 'react';
import type { Task } from '../../types';
import { useAudio } from '../../hooks/useAudio';
import styles from './Tombstone.module.css';

interface TombstoneProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

/**
 * Tombstone component - renders a task as a gravestone
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 8.4
 */
export function Tombstone({ task, onToggleComplete, onDelete, isDragging = false }: TombstoneProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
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
      playTombstoneRise(); // Rising back up when uncompleting
    } else {
      playTombstoneSink(); // Sinking when completing
    }
    
    // Delay the actual completion to allow animation to play
    setTimeout(() => {
      onToggleComplete(task.id);
      setIsAnimating(false);
    }, task.completed ? 0 : 1200); // Sink animation duration
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
    isDragging ? styles.dragging : '',
    isAnimating && !task.completed ? styles.sinking : '',
    !task.completed && !isAnimating ? styles.rising : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={tombstoneClasses}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={handleToggleComplete}
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
            <div className={styles.tooltipMeta}>
              <span>Priority: {task.priority}</span>
              <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
              {task.completedAt && (
                <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
              )}
            </div>
            <button
              className={styles.deleteButton}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
