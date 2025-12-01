import React, { useState, useRef, useCallback } from 'react';
import type { HeatmapData } from '../../types/streak';
import styles from './HeatmapDay.module.css';

/**
 * Props for HeatmapDay component
 */
interface HeatmapDayProps {
  /** Day data */
  data: HeatmapData;
  /** Click handler */
  onClick?: (day: HeatmapData) => void;
  /** Hover handler */
  onHover?: (day: HeatmapData | null) => void;
  /** Whether this is an empty cell (padding) */
  isEmpty?: boolean;
  /** Whether this cell is currently focused via keyboard navigation */
  isFocused?: boolean;
}

/**
 * HeatmapDay Component
 * 
 * Individual day cell in the activity heatmap.
 * Displays activity level with color intensity and provides hover/click interactions.
 * 
 * Requirements: Task 2.2 - Create HeatmapDay.tsx cell component
 * Requirements: Task 2.3 - Optimize touch interactions
 * - Displays activity level with appropriate color
 * - Handles hover and click interactions
 * - Accessible with keyboard navigation
 * - Shows tooltip on hover
 * - Optimized touch interactions with proper feedback
 */
export const HeatmapDay: React.FC<HeatmapDayProps> = ({
  data,
  onClick,
  onHover,
  isEmpty = false,
  isFocused = false,
}) => {
  const [isTouching, setIsTouching] = useState(false);
  const touchStartTimeRef = useRef<number>(0);
  const touchMoveThresholdRef = useRef<{ x: number; y: number } | null>(null);
  const cellRef = useRef<HTMLDivElement>(null);
  
  // Don't render empty cells
  if (isEmpty || !data.date) {
    return <div className={styles.empty} role="gridcell" aria-hidden="true" />;
  }
  
  const handleClick = () => {
    if (onClick) {
      onClick(data);
    }
  };
  
  const handleMouseEnter = () => {
    // Only trigger hover on non-touch devices
    if (!isTouching && onHover) {
      onHover(data);
    }
  };
  
  const handleMouseLeave = () => {
    if (onHover) {
      onHover(null);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };
  
  // Touch event handlers for optimized mobile interaction
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsTouching(true);
    touchStartTimeRef.current = Date.now();
    
    // Record initial touch position to detect swipes
    const touch = e.touches[0];
    touchMoveThresholdRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
    
    // Show hover state on touch start
    if (onHover) {
      onHover(data);
    }
    
    // Trigger haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // Light haptic feedback
    }
  }, [data, onHover]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Detect if user is scrolling vs tapping
    if (touchMoveThresholdRef.current) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchMoveThresholdRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchMoveThresholdRef.current.y);
      
      // If moved more than 10px, consider it a scroll/swipe
      if (deltaX > 10 || deltaY > 10) {
        // Hide hover state during scroll
        if (onHover) {
          onHover(null);
        }
        setIsTouching(false);
      }
    }
  }, [onHover]);
  
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchDuration = Date.now() - touchStartTimeRef.current;
    
    // Only trigger click if:
    // 1. Touch was brief (< 500ms) - not a long press
    // 2. User didn't scroll (isTouching is still true)
    if (touchDuration < 500 && isTouching) {
      // Prevent the subsequent mouse events
      e.preventDefault();
      handleClick();
    }
    
    // Hide hover state
    if (onHover) {
      onHover(null);
    }
    
    setIsTouching(false);
    touchMoveThresholdRef.current = null;
  }, [isTouching, handleClick, onHover]);
  
  const handleTouchCancel = useCallback(() => {
    // Clean up if touch is cancelled
    setIsTouching(false);
    touchMoveThresholdRef.current = null;
    if (onHover) {
      onHover(null);
    }
  }, [onHover]);
  
  // Focus the cell when isFocused changes
  React.useEffect(() => {
    if (isFocused && cellRef.current) {
      cellRef.current.focus();
    }
  }, [isFocused]);
  
  // Format date for accessibility
  const date = new Date(data.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  
  // Create activity summary for screen readers
  const activitySummary = data.level === 0
    ? 'No activity'
    : `${data.activities.tasks} tasks, ${data.activities.notes} notes, ${data.activities.focusMinutes} minutes of focus`;
  
  // Create activity level description
  const levelDescription = data.level === 0
    ? 'no activity'
    : data.level === 1
    ? 'low activity'
    : data.level === 2
    ? 'medium activity'
    : data.level === 3
    ? 'high activity'
    : 'very high activity';
  
  // Combine all information for comprehensive screen reader description
  const ariaLabel = `${formattedDate}, ${levelDescription}. ${activitySummary}. Press Enter or Space to view details.`;
  
  return (
    <div
      ref={cellRef}
      className={`${styles.day} ${isTouching ? styles.touching : ''} ${isFocused ? styles.focused : ''}`}
      data-level={data.level}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      role="gridcell"
      tabIndex={-1}
      aria-label={ariaLabel}
      aria-describedby={isFocused ? 'heatmap-instructions' : undefined}
      title={`${formattedDate}: ${activitySummary}`}
    />
  );
};

export default HeatmapDay;
