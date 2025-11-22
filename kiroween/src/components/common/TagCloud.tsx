import { useMemo, memo } from 'react';
import styles from './TagCloud.module.css';

interface TagCloudProps {
  tags: string[];
  items: Array<{ tags?: string[] }>;
  onTagClick: (tag: string) => void;
  selectedTags?: string[];
}

/**
 * TagCloud component - visualizes all tags with usage counts
 * Requirements: 14.5, 14.6, 1.2
 * Optimized with React.memo to prevent unnecessary re-renders
 */
function TagCloudComponent({ tags, items, onTagClick, selectedTags = [] }: TagCloudProps) {
  // Calculate tag usage counts
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    
    items.forEach(item => {
      item.tags?.forEach(tag => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });
    
    return counts;
  }, [items]);

  // Sort tags by usage count (descending)
  const sortedTags = useMemo(() => {
    return [...tags].sort((a, b) => {
      const countA = tagCounts.get(a) || 0;
      const countB = tagCounts.get(b) || 0;
      return countB - countA;
    });
  }, [tags, tagCounts]);

  // Calculate font size based on usage
  const getFontSize = (tag: string): number => {
    const count = tagCounts.get(tag) || 0;
    const maxCount = Math.max(...Array.from(tagCounts.values()));
    const minSize = 0.875; // 14px
    const maxSize = 1.75; // 28px
    
    if (maxCount === 0) return minSize;
    
    const ratio = count / maxCount;
    return minSize + (ratio * (maxSize - minSize));
  };

  if (tags.length === 0) {
    return (
      <div className={styles.tagCloud}>
        <p className={styles.emptyMessage}>No tags yet. Add tags to your notes and tasks to see them here.</p>
      </div>
    );
  }

  return (
    <div className={styles.tagCloud}>
      <div className={styles.cloudContainer}>
        {sortedTags.map(tag => {
          const count = tagCounts.get(tag) || 0;
          const fontSize = getFontSize(tag);
          const isSelected = selectedTags.includes(tag);
          
          return (
            <button
              key={tag}
              type="button"
              className={`${styles.tagButton} ${isSelected ? styles.selected : ''}`}
              style={{ fontSize: `${fontSize}rem` }}
              onClick={() => onTagClick(tag)}
              title={`${tag} (${count} ${count === 1 ? 'item' : 'items'})`}
            >
              <span className={styles.tagSymbol}>✦</span>
              <span className={styles.tagLabel}>{tag}</span>
              <span className={styles.tagCount}>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Memoized TagCloud component with custom comparison
 * Only re-renders when tags, items count, or selectedTags change
 * Requirements: 1.2
 */
export const TagCloud = memo(TagCloudComponent, (prevProps, nextProps) => {
  return (
    JSON.stringify(prevProps.tags) === JSON.stringify(nextProps.tags) &&
    prevProps.items.length === nextProps.items.length &&
    JSON.stringify(prevProps.selectedTags) === JSON.stringify(nextProps.selectedTags)
  );
});
