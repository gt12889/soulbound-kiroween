import { useState, useMemo } from 'react';
import { useTasks } from '../../contexts/TasksContext';
import { useAudio } from '../../hooks/useAudio';
import { Tombstone } from './Tombstone';
import { TagFilter } from '../common/TagFilter';
import styles from './ArchiveView.module.css';

/**
 * ArchiveView component - displays archived tasks with weathered tombstones
 * Requirements: 15.4, 15.5
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

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
    setShowDeleteConfirm(taskId);
  };

  const handleConfirmDelete = (taskId: string) => {
    playUIClick();
    deleteTask(taskId);
    setShowDeleteConfirm(null);
  };

  const handleCancelDelete = () => {
    playUIClick();
    setShowDeleteConfirm(null);
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
        {sortedTasks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>The archive is empty...</p>
            <p>Completed tasks will rest here</p>
          </div>
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
                
                {showDeleteConfirm === task.id ? (
                  <div className={styles.deleteConfirm}>
                    <span className={styles.confirmText}>Delete forever?</span>
                    <button
                      className={styles.confirmButton}
                      onClick={() => handleConfirmDelete(task.id)}
                      onMouseEnter={playUIHover}
                    >
                      Yes
                    </button>
                    <button
                      className={styles.cancelButton}
                      onClick={handleCancelDelete}
                      onMouseEnter={playUIHover}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteClick(task.id)}
                    onMouseEnter={playUIHover}
                    title="Delete permanently"
                  >
                    ✕ Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
