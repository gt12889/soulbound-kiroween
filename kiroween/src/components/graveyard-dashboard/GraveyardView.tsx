import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useTasks } from '../../contexts/TasksContext';
import { useAudio } from '../../hooks/useAudio';
import { useBulkSelection } from '../../hooks/useBulkSelection';
import { Tombstone } from './Tombstone';
import { TagFilter } from '../common/TagFilter';
import { TagManager } from '../common/TagManager';
import { TagCloud } from '../common/TagCloud';
import { ArchiveSuggestions } from './ArchiveSuggestions';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { MoonLighting } from './MoonLighting';
import { DiggingModal } from './DiggingModal';
import SkeletonLoader from '../common/SkeletonLoader';
import EmptyState from '../common/EmptyState';
import type { Task } from '../../types';
import styles from './GraveyardView.module.css';

/**
 * GraveyardView component - displays tasks as tombstones in a graveyard layout
 * Requirements: 4.1, 4.6, 8.4, 1.3, 2.1, 6.4, 9.1, 9.2, 9.3
 */
export function GraveyardView() {
  const { 
    filteredTasks,
    tasks,
    createTask, 
    toggleTaskCompletion, 
    deleteTask, 
    reorderTasks,
    archiveTask,
    allTags,
    selectedTags,
    setSelectedTags,
    tagFilterMode,
    setTagFilterMode,
    bulkDelete,
    bulkArchive,
    bulkTag
  } = useTasks();
  const { playUIClick, playUIHover } = useAudio();
  
  // Bulk selection - Requirement 9.1
  const {
    selectedIds,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    hasSelection,
    selectionCount,
  } = useBulkSelection();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [newTaskTags, setNewTaskTags] = useState<string[]>([]);
  const [newDueDate, setNewDueDate] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTagCloud, setShowTagCloud] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bulkSelectionMode, setBulkSelectionMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [bulkTagInput, setBulkTagInput] = useState<string[]>([]);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [dugUpTask, setDugUpTask] = useState<Task | null>(null);
  const [hoveredTombstoneId, setHoveredTombstoneId] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const dragCounter = useRef(0);

  // Simulate initial data loading
  // Requirements: 2.1
  useEffect(() => {
    // Simulate loading delay for skeleton display
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Sort tasks by priority (high -> medium -> low) and completion status
  // Optimized with useMemo to prevent unnecessary recalculations
  // Requirements: 1.3
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      // Completed tasks go to the end
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // Sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [filteredTasks]);

  // Memoized event handlers to prevent unnecessary re-renders
  // Requirements: 1.3
  const handleCreateTask = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (newTaskTitle.trim()) {
      playUIClick();
      const dueDate = newDueDate ? new Date(newDueDate) : undefined;
      createTask(newTaskTitle.trim(), newTaskDescription.trim(), newTaskPriority, newTaskTags, dueDate);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('medium');
      setNewTaskTags([]);
      setNewDueDate('');
      setShowCreateForm(false);
    }
  }, [newTaskTitle, newTaskDescription, newTaskPriority, newTaskTags, newDueDate, playUIClick, createTask]);

  const handleToggleForm = useCallback(() => {
    playUIClick();
    setShowCreateForm(prev => !prev);
  }, [playUIClick]);

  const handleTagClick = useCallback((tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  }, [selectedTags, setSelectedTags]);

  // Drag and drop handlers - Requirement 4.6
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    dragCounter.current = 0;
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderTasks(draggedIndex, dropIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, reorderTasks]);

  const handleDelete = useCallback((id: string) => {
    setDeletingTaskId(id);
    setTimeout(() => {
      deleteTask(id);
      setDeletingTaskId(null);
    }, 500); // Corresponds to animation duration
  }, [deleteTask]);

  // Bulk selection handlers - Requirement 9.1
  const handleToggleBulkMode = useCallback(() => {
    playUIClick();
    setBulkSelectionMode(prev => !prev);
    if (bulkSelectionMode) {
      clearSelection();
    }
  }, [bulkSelectionMode, clearSelection, playUIClick]);

  const handleSelectAll = useCallback(() => {
    playUIClick();
    const allTaskIds = sortedTasks.map(task => task.id);
    selectAll(allTaskIds);
  }, [sortedTasks, selectAll, playUIClick]);

  const handleSelectNone = useCallback(() => {
    playUIClick();
    clearSelection();
  }, [clearSelection, playUIClick]);

  // Bulk action handlers - Requirement 9.2, 9.6
  const handleBulkDeleteClick = useCallback(() => {
    playUIClick();
    setShowDeleteConfirm(true);
  }, [playUIClick]);

  const handleBulkDeleteConfirm = useCallback(() => {
    const ids = Array.from(selectedIds);
    bulkDelete(ids);
    clearSelection();
    setShowDeleteConfirm(false);
    setBulkSelectionMode(false);
  }, [selectedIds, bulkDelete, clearSelection]);

  const handleBulkArchiveClick = useCallback(() => {
    playUIClick();
    setShowArchiveConfirm(true);
  }, [playUIClick]);

  const handleBulkArchiveConfirm = useCallback(() => {
    const ids = Array.from(selectedIds);
    bulkArchive(ids);
    clearSelection();
    setShowArchiveConfirm(false);
    setBulkSelectionMode(false);
  }, [selectedIds, bulkArchive, clearSelection]);

  const handleBulkTagClick = useCallback(() => {
    playUIClick();
    setShowTagDialog(true);
  }, [playUIClick]);

  const handleBulkTagConfirm = useCallback(() => {
    if (bulkTagInput.length > 0) {
      const ids = Array.from(selectedIds);
      bulkTag(ids, bulkTagInput);
      clearSelection();
      setBulkTagInput([]);
      setShowTagDialog(false);
      setBulkSelectionMode(false);
    }
  }, [selectedIds, bulkTagInput, bulkTag, clearSelection]);

  return (
    <MoonLighting>
      <article className={styles.graveyard}>
      {/* Fog Overlay */}
      <div 
        className={styles.fogOverlay}
        style={
          hoverPosition
            ? ({
                '--fog-x': `${hoverPosition.x}%`,
                '--fog-y': `${hoverPosition.y}%`,
              } as React.CSSProperties)
            : undefined
        }
      >
        <div 
          className={`${styles.fogLayer} ${styles.fogLayer1} ${hoveredTombstoneId ? styles.fogParting : ''}`}
        ></div>
        <div 
          className={`${styles.fogLayer} ${styles.fogLayer2} ${hoveredTombstoneId ? styles.fogParting : ''}`}
        ></div>
        <div 
          className={`${styles.fogLayer} ${styles.fogLayer3} ${hoveredTombstoneId ? styles.fogParting : ''}`}
        ></div>
      </div>
      
      {/* Archive Suggestions Modal */}
      <ArchiveSuggestions />

      <header className={styles.header}>
        <h1 className={styles.title}>Graveyard Dashboard</h1>
        <p className={styles.subtitle}>Where tasks come to rest</p>
        
        <div className={styles.headerActions}>
          <button
            className={`${styles.createButton} button-primary`}
            onClick={handleToggleForm}
            onMouseEnter={playUIHover}
            aria-label={showCreateForm ? 'Cancel task creation' : 'Raise new task'}
          >
            {showCreateForm ? 'Cancel' : '+ Raise New Task'}
          </button>
          
          {/* Bulk selection toggle - Requirement 9.1 */}
          <button
            className={`${styles.bulkModeButton} ${bulkSelectionMode ? styles.active : ''} button-primary`}
            onClick={handleToggleBulkMode}
            onMouseEnter={playUIHover}
            aria-label={bulkSelectionMode ? 'Exit bulk selection mode' : 'Enter bulk selection mode'}
          >
            {bulkSelectionMode ? '✓ Bulk Mode' : '☐ Bulk Select'}
          </button>
        </div>
      </header>

      {/* Bulk action toolbar - Requirement 9.1, 9.2, 9.3 */}
      {bulkSelectionMode && (
        <div className={styles.bulkToolbar}>
          <div className={styles.bulkToolbarLeft}>
            <button
              className={`${styles.bulkButton} button-secondary`}
              onClick={handleSelectAll}
              onMouseEnter={playUIHover}
              aria-label="Select all tasks"
            >
              Select All
            </button>
            <button
              className={`${styles.bulkButton} button-secondary`}
              onClick={handleSelectNone}
              onMouseEnter={playUIHover}
              aria-label="Clear selection"
              disabled={!hasSelection}
            >
              Select None
            </button>
            {hasSelection && (
              <span className={styles.selectionCount}>
                {selectionCount} selected
              </span>
            )}
          </div>
          
          {hasSelection && (
            <div className={styles.bulkToolbarRight}>
              <span className={styles.bulkActionsLabel}>Bulk Actions:</span>
              <button
                className={`${styles.bulkActionButton} button-secondary`}
                onClick={handleBulkTagClick}
                onMouseEnter={playUIHover}
                aria-label="Add tags to selected tasks"
              >
                🏷️ Tag
              </button>
              <button
                className={`${styles.bulkActionButton} button-secondary`}
                onClick={handleBulkArchiveClick}
                onMouseEnter={playUIHover}
                aria-label="Archive selected tasks"
              >
                📦 Archive
              </button>
              <button
                className={`${styles.bulkActionButton} button-danger`}
                onClick={handleBulkDeleteClick}
                onMouseEnter={playUIHover}
                aria-label="Delete selected tasks"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      )}

      {showCreateForm && (
        <form className={styles.createForm} onSubmit={handleCreateTask}>
          <div className={styles.formGroup}>
            <label htmlFor="taskTitle">Task Title</label>
            <input
              id="taskTitle"
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title..."
              autoFocus
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="taskDescription">Description</label>
            <textarea
              id="taskDescription"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Enter task description..."
              rows={3}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="taskPriority">Priority</label>
            <select
              id="taskPriority"
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="taskDueDate">Due Date</label>
            <input
              id="taskDueDate"
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Tags</label>
            <TagManager
              tags={newTaskTags}
              allTags={allTags}
              onTagsChange={setNewTaskTags}
              placeholder="Add tags..."
            />
          </div>
          
          <button 
            type="submit" 
            className={`${styles.submitButton} button-primary`}
            onMouseEnter={playUIHover}
          >
            Create Task
          </button>
        </form>
      )}

      {/* Tag Cloud Toggle */}
      <button
        className={`${styles.tagCloudToggle} button-secondary`}
        onClick={() => setShowTagCloud(!showTagCloud)}
        onMouseEnter={playUIHover}
        aria-label={showTagCloud ? 'Hide tag cloud' : 'Show tag cloud'}
        aria-expanded={showTagCloud}
      >
        <span aria-hidden="true">{showTagCloud ? '▼' : '▶'}</span> Tag Cloud
      </button>

      {/* Tag Cloud */}
      {showTagCloud && (
        <TagCloud
          tags={allTags}
          items={tasks}
          onTagClick={handleTagClick}
          selectedTags={selectedTags}
        />
      )}

      {/* Tag Filter */}
      <div className={styles.filterSection}>
        <TagFilter
          availableTags={allTags}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          filterMode={tagFilterMode}
          onFilterModeChange={setTagFilterMode}
        />
      </div>

      {/* Grid layout for tombstones - Requirement 4.1 */}
      <div className={styles.tombstoneGrid}>
        {isLoading ? (
          <SkeletonLoader type="task" count={6} />
        ) : sortedTasks.length === 0 ? (
          <EmptyState
            icon="🪦"
            title="The Graveyard Awaits"
            message="No tasks have been raised yet. Create your first task to begin your journey into the darkness."
            actionLabel="+ Raise Your First Task"
            onAction={handleToggleForm}
          />
        ) : (
          sortedTasks.map((task, index) => (
            <div
              key={task.id}
              className={`${styles.tombstoneWrapper} ${dragOverIndex === index ? styles.dragOver : ''} ${deletingTaskId === task.id ? styles.crumbling : ''}`}
              draggable={!task.completed && !bulkSelectionMode}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const containerRect = e.currentTarget.closest(`.${styles.graveyard}`)?.getBoundingClientRect();
                if (containerRect) {
                  const x = ((rect.left + rect.width / 2 - containerRect.left) / containerRect.width) * 100;
                  const y = ((rect.top + rect.height / 2 - containerRect.top) / containerRect.height) * 100;
                  setHoveredTombstoneId(task.id);
                  setHoverPosition({ x, y });
                }
              }}
              onMouseLeave={() => {
                setHoveredTombstoneId(null);
                setHoverPosition(null);
              }}
            >
              <Tombstone
                task={task}
                onToggleComplete={toggleTaskCompletion}
                onDelete={handleDelete}
                onArchive={archiveTask}
                onDigUp={setDugUpTask}
                isDragging={draggedIndex === index}
                showCheckbox={bulkSelectionMode}
                isSelected={isSelected(task.id)}
                onToggleSelection={toggleSelection}
              />
            </div>
          ))
        )}
      </div>

      {/* Confirmation Dialogs - Requirement 9.6 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Tasks"
        message={`Are you sure you want to delete ${selectionCount} task${selectionCount > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        destructive={true}
      />

      <ConfirmDialog
        isOpen={showArchiveConfirm}
        title="Archive Tasks"
        message={`Are you sure you want to archive ${selectionCount} task${selectionCount > 1 ? 's' : ''}?`}
        confirmLabel="Archive"
        cancelLabel="Cancel"
        onConfirm={handleBulkArchiveConfirm}
        onCancel={() => setShowArchiveConfirm(false)}
      />

      {/* Tag Dialog - Simple confirmation with tag input */}
      {showTagDialog && (
        <ConfirmDialog
          isOpen={showTagDialog}
          title="Add Tags"
          message={`Add tags to ${selectionCount} task${selectionCount > 1 ? 's' : ''}:`}
          confirmLabel="Add Tags"
          cancelLabel="Cancel"
          onConfirm={handleBulkTagConfirm}
          onCancel={() => {
            setShowTagDialog(false);
            setBulkTagInput([]);
          }}
        >
          <div style={{ marginTop: '1rem' }}>
            <TagManager
              tags={bulkTagInput}
              allTags={allTags}
              onTagsChange={setBulkTagInput}
              placeholder="Add tags..."
            />
          </div>
        </ConfirmDialog>
      )}

      {/* Digging Modal */}
      <DiggingModal
        task={dugUpTask}
        isOpen={dugUpTask !== null}
        onClose={() => setDugUpTask(null)}
      />
      </article>
    </MoonLighting>
  );
}
