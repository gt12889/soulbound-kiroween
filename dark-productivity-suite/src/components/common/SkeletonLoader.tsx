import React from 'react';
import styles from './SkeletonLoader.module.css';

interface SkeletonLoaderProps {
  type: 'task' | 'note' | 'list';
  count?: number;
}

/**
 * SkeletonLoader - Displays loading placeholders with mystical styling
 * Shows the structure of content while data is being fetched
 * Requirements: 2.1
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, count = 3 }) => {
  const renderTaskSkeleton = () => (
    <div className={styles.taskSkeleton}>
      <div className={styles.tombstoneShape}>
        <div className={styles.skeletonCross}></div>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonSubtitle}></div>
      </div>
    </div>
  );

  const renderNoteSkeleton = () => (
    <div className={styles.noteSkeleton}>
      <div className={styles.parchmentShape}>
        <div className={styles.skeletonNoteTitle}></div>
        <div className={styles.skeletonNoteLine}></div>
        <div className={styles.skeletonNoteLine}></div>
        <div className={styles.skeletonNoteLine} style={{ width: '70%' }}></div>
        <div className={styles.skeletonTags}>
          <div className={styles.skeletonTag}></div>
          <div className={styles.skeletonTag}></div>
        </div>
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className={styles.listSkeleton}>
      <div className={styles.skeletonListItem}>
        <div className={styles.skeletonCircle}></div>
        <div className={styles.skeletonText}></div>
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'task':
        return renderTaskSkeleton();
      case 'note':
        return renderNoteSkeleton();
      case 'list':
        return renderListSkeleton();
      default:
        return renderListSkeleton();
    }
  };

  return (
    <div className={styles.skeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonItem}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
