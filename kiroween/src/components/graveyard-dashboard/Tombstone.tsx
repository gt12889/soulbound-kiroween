import { useState, useEffect, memo, useRef } from 'react';
import type { Task } from '../../types';
import { useAudio } from '../../hooks/useAudio';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ParticleSystem } from './ParticleSystem';
import styles from './Tombstone.module.css';

interface TombstoneProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onDigUp?: (task: Task) => void;
  isDragging?: boolean;
  isArchived?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
  showCheckbox?: boolean;
}

/**
 * Tombstone component - renders a task as a gravestone
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 8.4, 15.2, 15.4, 15.5, 1.2, 9.1
 * Optimized with React.memo to prevent unnecessary re-renders
 */
function TombstoneComponent({ 
  task, 
  onToggleComplete, 
  onDelete, 
  onArchive,
  onDigUp,
  isDragging = false, 
  isArchived = false,
  isSelected = false,
  onToggleSelection,
  showCheckbox = false
}: TombstoneProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<'sink' | 'deepSink' | 'restore' | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDigging, setIsDigging] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const containerRef = useRef<HTMLButtonElement>(null);
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
      setIsCompleting(false);
    } else {
      setAnimationType('sink');
      setIsCompleting(true); // Trigger soul release
      playTombstoneSink(); // Sinking when completing
    }
    
    // Delay the actual completion to allow animation to play
    setTimeout(() => {
      onToggleComplete(task.id);
      setIsAnimating(false);
      setAnimationType(null);
      setIsCompleting(false);
    }, task.completed ? 0 : 1200); // Sink animation duration
  };

  const handleArchiveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowArchiveConfirm(true);
  };

  const handleArchiveConfirm = () => {
    if (onArchive && task.completed) {
      setIsAnimating(true);
      setAnimationType('deepSink');
      playTombstoneSink();
      setShowArchiveConfirm(false);
      
      // Delay archiving to allow animation to play (1.8s for deep sink)
      setTimeout(() => {
        onArchive(task.id);
        setIsAnimating(false);
        setAnimationType(null);
      }, 1800);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(task.id);
    setShowDeleteConfirm(false);
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
    isDigging ? styles.digging : '',
  ].filter(Boolean).join(' ');

  const handleDigUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDigUp) {
      setIsDigging(true);
      setTimeout(() => {
        onDigUp(task);
        setIsDigging(false);
      }, 300);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isArchived) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggleComplete();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        if (onDigUp) {
          handleDigUp(e as any);
        }
      }
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onToggleSelection) {
      onToggleSelection(task.id);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <button
      ref={containerRef}
      className={tombstoneClasses}
      onMouseEnter={() => {
        setShowTooltip(true);
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setShowTooltip(false);
        setIsHovered(false);
      }}
      onClick={isArchived ? undefined : handleToggleComplete}
      onDoubleClick={(e) => {
        if (!isArchived && onDigUp) {
          handleDigUp(e);
        }
      }}
      onKeyDown={handleKeyDown}
      aria-label={`${task.title} - ${task.completed ? 'Completed' : 'Active'} task. Press Enter or Space to ${task.completed ? 'restore' : 'complete'}. Double-click or press D to dig up details.`}
    >
      {/* Bulk selection checkbox - Requirement 9.1 */}
      {showCheckbox && onToggleSelection && (
        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            className={styles.selectionCheckbox}
            checked={isSelected}
            onChange={handleCheckboxChange}
            onClick={handleCheckboxClick}
            aria-label={`Select ${task.title}`}
          />
        </div>
      )}

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
      
      {/* Ground base */}
      <div className={styles.ground}></div>

      {/* Particle system */}
      <ParticleSystem
        task={task}
        isHovered={isHovered}
        isCompleting={isCompleting}
      />

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
                    className={`${styles.archiveButton} button-primary`}
                    onClick={handleArchiveClick}
                  >
                    Archive
                  </button>
                )}
                <button
                  className={`${styles.deleteButton} button-danger`}
                  onClick={handleDeleteClick}
                >
                  Remove
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialogs - Requirement 11.1, 11.4 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        destructive={true}
        showDontAskAgain={true}
        dontAskAgainKey="task-delete"
      />

      <ConfirmDialog
        isOpen={showArchiveConfirm}
        title="Archive Task"
        message={`Are you sure you want to archive "${task.title}"?`}
        confirmLabel="Archive"
        cancelLabel="Cancel"
        onConfirm={handleArchiveConfirm}
        onCancel={() => setShowArchiveConfirm(false)}
        showDontAskAgain={true}
        dontAskAgainKey="task-archive"
      />
    </button>
  );
}

/**
 * Memoized Tombstone component with custom comparison
 * Only re-renders when task properties that affect display change
 * Requirements: 1.2, 9.1
 */
export const Tombstone = memo(TombstoneComponent, (prevProps, nextProps) => {
  // Re-render if any of these properties change
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.description === nextProps.task.description &&
    prevProps.task.completed === nextProps.task.completed &&
    prevProps.task.priority === nextProps.task.priority &&
    prevProps.task.archived === nextProps.task.archived &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.isArchived === nextProps.isArchived &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.showCheckbox === nextProps.showCheckbox &&
    JSON.stringify(prevProps.task.tags) === JSON.stringify(nextProps.task.tags) &&
    prevProps.task.completedAt === nextProps.task.completedAt &&
    prevProps.task.archivedAt === nextProps.task.archivedAt
  );
});
