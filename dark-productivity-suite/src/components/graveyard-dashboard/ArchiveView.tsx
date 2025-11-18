import { useState, useMemo, useEffect } from 'react';
import { useTasks } from '../../contexts/TasksContext';
import { useAudio } from '../../hooks/useAudio';
import { Tombstone } from './Tombstone';
import { TagFilter } from '../common/TagFilter';
import { ConfirmDialog } from '../common/ConfirmDialog';
import SkeletonLoader from '../common/SkeletonLoader';
import EmptyState from '../common/EmptyState';
import styles from './ArchiveView.module.css';

/**
 * ArchiveView component - displays archived tasks with weathered tombstones
 * Requirements: 15.4, 15.5, 2.1, 2.4
 */
export function ArchiveView() {
  const { 
    archivedTasks,
    unarchiveTask,
    deleteTask,
    allTags
  } = useTasks();
  const { playUIClick, playUIHover } = useAudio();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagFilterMode, setTagFilterMode] = useState<'AND' | 'OR'>('OR');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial data loading
  // Requirements: 2.1, 2.4
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Filter archived tasks by search and tags
  const filteredArchivedTasks = useMemo(() => {
    let filtered = archivedTasks;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(task => {
        const taskTags = task.tags || [];
        if (tagFilterMode === 'AND') {
          return selectedTags.every(tag => taskTags.includes(tag));
        } else {
          return selectedTags.some(tag => taskTags.includes(tag));
        }
      });
    }

    return filtered;
  }, [archivedTasks, searchQuery, selectedTags, tagFilterMode]);

  // Sort by archived date (most recent first)
  const sortedTasks = [...filteredArchivedTasks].sort((a, b) => {
    if (!a.archivedAt || !b.archivedAt) return 0;
    return new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime();
  });

  const handleRestore = (taskId: string) => {
    playUIClick();
    unarchiveTask(taskId);
  };

  const handleDeleteClick = (taskId: string) => {
    playUIClick();
    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setTaskToDelete(null);
    setShowDeleteConfirm(false);
  };

  return (
    <div className={styles.archive}>
      <div className={styles.header}>
        <h1 className={styles.title}>The Deep Archive</h1>
        <p className={styles.subtitle}>Where completed tasks rest eternally</p>
      </div>

      {/* Search and Filter Section */}
      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search archived tasks..."
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterSection}>
          <TagFilter
            availableTags={allTags}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            filterMode={tagFilterMode}
            onFilterModeChange={setTagFilterMode}
          />
        </div>
      </div>

      {/* Archive Stats */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{archivedTasks.length}</span>
          <span className={styles.statLabel}>Total Archived</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{filteredArchivedTasks.length}</span>
          <span className={styles.statLabel}>Showing</span>
        </div>
      </div>

      {/* Archived Tombstones Grid */}
      <div className={styles.tombstoneGrid}>
        {isLoading ? (
          <SkeletonLoader type="task" count={6} />
        ) : sortedTasks.length === 0 ? (
          <EmptyState
            icon="📦"
            title="The Archive Rests Empty"
            message="No tasks have been archived yet. Complete and archive tasks from the Graveyard to preserve them here for eternity."
          />
        ) : (
          sortedTasks.map((task) => (
            <div key={task.id} className={styles.tombstoneWrapper}>
              <Tombstone
                task={task}
                onToggleComplete={() => {}} // No toggle in archive
                onDelete={() => {}} // Custom delete handling
                isDragging={false}
                isArchived={true}
              />
              
              <div className={styles.actions}>
                <button
                  className={styles.restoreButton}
                  onClick={() => handleRestore(task.id)}
                  onMouseEnter={playUIHover}
                  title="Restore task"
                >
                  ↑ Restore
                </button>
                
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteClick(task.id)}
                  onMouseEnter={playUIHover}
                  title="Delete permanently"
                >
                  ✕ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Dialog - Requirement 11.1, 11.4 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Archived Task"
        message="Are you sure you want to permanently delete this archived task? This action cannot be undone."
        confirmLabel="Delete Forever"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        destructive={true}
        showDontAskAgain={true}
        dontAskAgainKey="archive-delete"
      />
    </div>
  );
}
