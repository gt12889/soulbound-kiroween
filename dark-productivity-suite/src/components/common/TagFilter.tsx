import { useState } from 'react';
import styles from './TagFilter.module.css';

interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  filterMode: 'AND' | 'OR';
  onFilterModeChange: (mode: 'AND' | 'OR') => void;
}

/**
 * TagFilter component for filtering by tags
 * Requirements: 14.4, 14.6
 */
export function TagFilter({ 
  availableTags, 
  selectedTags, 
  onTagsChange,
  filterMode,
  onFilterModeChange
}: TagFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    onTagsChange([]);
  };

  if (availableTags.length === 0) {
    return null;
  }

  return (
    <div className={styles.tagFilter}>
      <button
        type="button"
        className={`${styles.toggleButton} ${isExpanded ? styles.expanded : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className={styles.icon}>✦</span>
        <span>Filter by Tags</span>
        {selectedTags.length > 0 && (
          <span className={styles.badge}>{selectedTags.length}</span>
        )}
        <span className={styles.arrow}>{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className={styles.filterContent}>
          <div className={styles.filterHeader}>
            <div className={styles.modeSelector}>
              <button
                type="button"
                className={`${styles.modeButton} ${filterMode === 'AND' ? styles.active : ''}`}
                onClick={() => onFilterModeChange('AND')}
                title="Show items with ALL selected tags"
              >
                AND
              </button>
              <button
                type="button"
                className={`${styles.modeButton} ${filterMode === 'OR' ? styles.active : ''}`}
                onClick={() => onFilterModeChange('OR')}
                title="Show items with ANY selected tag"
              >
                OR
              </button>
            </div>
            {selectedTags.length > 0 && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={clearFilters}
              >
                Clear All
              </button>
            )}
          </div>

          <div className={styles.tagList}>
            {availableTags.map(tag => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  className={`${styles.tagButton} ${isSelected ? styles.selected : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  <span className={styles.tagSymbol}>✦</span>
                  <span className={styles.tagLabel}>{tag}</span>
                  {isSelected && <span className={styles.checkmark}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
