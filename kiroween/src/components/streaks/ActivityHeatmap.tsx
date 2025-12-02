import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { HeatmapData } from '../../types/streak';
import { HeatmapDay } from './HeatmapDay';
import { DayDetailModal } from './DayDetailModal';
import { filterHeatmapByActivity } from '../../hooks/useActivityHeatmap';
import styles from './ActivityHeatmap.module.css';

/**
 * Props for ActivityHeatmap component
 */
interface ActivityHeatmapProps {
  /** Heatmap data for 365 days */
  data: HeatmapData[];
  /** Optional click handler for day cells */
  onDayClick?: (day: HeatmapData) => void;
  /** Optional filter by activity type */
  filterType?: 'all' | 'tasks' | 'notes' | 'focus';
}

/**
 * Hook to detect mobile screen size
 * Returns true if screen width is below 768px
 */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkMobile();

    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

/**
 * Get month labels for the heatmap
 * Returns array of month names with their starting column positions
 */
function getMonthLabels(data: HeatmapData[]): Array<{ month: string; column: number }> {
  const labels: Array<{ month: string; column: number }> = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  let currentMonth = -1;
  let weekIndex = 0;
  
  data.forEach((day, index) => {
    const date = new Date(day.date);
    const month = date.getMonth();
    const dayOfWeek = date.getDay();
    
    // Start new week on Sunday
    if (dayOfWeek === 0 && index > 0) {
      weekIndex++;
    }
    
    // Add label when month changes and we have enough space (at least 2 weeks)
    if (month !== currentMonth && weekIndex >= 2) {
      labels.push({
        month: monthNames[month],
        column: weekIndex,
      });
      currentMonth = month;
    }
  });
  
  return labels;
}

/**
 * ActivityHeatmap Component
 * 
 * Displays a GitHub-style activity heatmap showing 365 days of activity.
 * Uses CSS Grid layout (7 rows × 53 columns) for optimal performance.
 * 
 * Requirements: Task 2.2 - Heatmap Component
 * - Implements CSS Grid layout (7×53)
 * - Displays 365 days correctly
 * - Hover shows accurate data
 * - Colors match theme
 * - Grid layout responsive
 * - Month labels
 */
export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  data,
  onDayClick,
  filterType: externalFilterType,
}) => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapData | null>(null);
  const [selectedDay, setSelectedDay] = useState<HeatmapData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [internalFilterType, setInternalFilterType] = useState<'all' | 'tasks' | 'notes' | 'focus'>('all');
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [announcement, setAnnouncement] = useState<string>('');
  const isMobile = useIsMobile();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Use external filter if provided, otherwise use internal state
  const activeFilterType = externalFilterType ?? internalFilterType;
  
  // Apply filter to data
  const filteredData = useMemo(() => {
    return filterHeatmapByActivity(data, activeFilterType);
  }, [data, activeFilterType]);
  
  // Handle day click to show modal
  const handleDayClick = (day: HeatmapData) => {
    setSelectedDay(day);
    setIsModalOpen(true);
    
    // Call optional external click handler
    if (onDayClick) {
      onDayClick(day);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Clear selected day after animation completes
    setTimeout(() => setSelectedDay(null), 300);
  };
  
  // Handle filter change
  const handleFilterChange = (newFilter: 'all' | 'tasks' | 'notes' | 'focus') => {
    // Only update if we're using internal state (no external filter provided)
    if (externalFilterType === undefined) {
      setInternalFilterType(newFilter);
      
      // Announce filter change to screen readers
      const filterLabels = {
        all: 'all activities',
        tasks: 'tasks only',
        notes: 'notes only',
        focus: 'focus sessions only',
      };
      setAnnouncement(`Filter changed to ${filterLabels[newFilter]}`);
      
      // Clear announcement after it's been read
      setTimeout(() => setAnnouncement(''), 1000);
    }
  };

  // On mobile, show only last 90 days for performance
  const displayData = isMobile ? filteredData.slice(-90) : filteredData;
  
  // Get month labels
  const monthLabels = getMonthLabels(displayData);
  
  // Prepare grid data with proper positioning
  // CSS Grid will auto-flow in column direction, filling 7 rows before moving to next column
  const gridData: HeatmapData[] = [];
  
  // Find the first day and pad the beginning if needed
  if (displayData.length > 0) {
    const firstDate = new Date(displayData[0].date);
    const firstDayOfWeek = firstDate.getDay();
    
    // Pad with empty days to align with day of week
    for (let i = 0; i < firstDayOfWeek; i++) {
      gridData.push({
        date: '',
        level: 0,
        activities: { tasks: 0, notes: 0, focusMinutes: 0 },
      });
    }
  }
  
  // Add all data days
  gridData.push(...displayData);
  
  // Pad the end to complete the last week if needed
  const remainder = gridData.length % 7;
  if (remainder > 0) {
    const paddingNeeded = 7 - remainder;
    for (let i = 0; i < paddingNeeded; i++) {
      gridData.push({
        date: '',
        level: 0,
        activities: { tasks: 0, notes: 0, focusMinutes: 0 },
      });
    }
  }
  
  // Auto-scroll to the end (most recent days) on mobile
  useEffect(() => {
    if (isMobile && scrollContainerRef.current) {
      // Scroll to the end after a brief delay to ensure rendering is complete
      const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMobile, displayData.length]);
  
  // Handle scroll events to detect when user is scrolling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !isMobile) return;
    
    const handleScroll = () => {
      // Set scrolling state
      setIsScrolling(true);
      
      // Hide tooltip while scrolling
      setHoveredDay(null);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set timeout to detect when scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };
    
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isMobile]);
  
  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Only handle arrow keys
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(e.key)) {
      return;
    }
    
    // Find all non-empty days
    const validDays = gridData
      .map((day, index) => ({ day, index }))
      .filter(({ day }) => day.date !== '');
    
    if (validDays.length === 0) return;
    
    // Initialize focus to first valid day if not set
    let currentIndex = focusedIndex;
    if (currentIndex === -1 || currentIndex >= gridData.length) {
      currentIndex = validDays[0].index;
      setFocusedIndex(currentIndex);
      setHoveredDay(gridData[currentIndex]);
      
      // Announce initial focus
      const day = gridData[currentIndex];
      if (day?.date) {
        const date = new Date(day.date);
        const formattedDate = date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        });
        setAnnouncement(`Focused on ${formattedDate}`);
      }
      return;
    }
    
    let newIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        // Move up one row (subtract 1 in column-major grid)
        newIndex = currentIndex - 1;
        // Skip empty cells
        while (newIndex >= 0 && !gridData[newIndex]?.date) {
          newIndex--;
        }
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        // Move down one row (add 1 in column-major grid)
        newIndex = currentIndex + 1;
        // Skip empty cells
        while (newIndex < gridData.length && !gridData[newIndex]?.date) {
          newIndex++;
        }
        break;
        
      case 'ArrowLeft':
        e.preventDefault();
        // Move left one column (subtract 7 in column-major grid with 7 rows)
        newIndex = currentIndex - 7;
        // Skip empty cells
        while (newIndex >= 0 && !gridData[newIndex]?.date) {
          newIndex -= 7;
        }
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        // Move right one column (add 7 in column-major grid with 7 rows)
        newIndex = currentIndex + 7;
        // Skip empty cells
        while (newIndex < gridData.length && !gridData[newIndex]?.date) {
          newIndex += 7;
        }
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        // Activate the focused day
        if (gridData[currentIndex]?.date) {
          handleDayClick(gridData[currentIndex]);
          
          // Announce modal opening
          const day = gridData[currentIndex];
          const date = new Date(day.date);
          const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          });
          setAnnouncement(`Opening details for ${formattedDate}`);
        }
        return;
    }
    
    // Validate new index
    if (newIndex >= 0 && newIndex < gridData.length && gridData[newIndex]?.date) {
      setFocusedIndex(newIndex);
      setHoveredDay(gridData[newIndex]);
      
      // Announce navigation to screen readers
      const day = gridData[newIndex];
      if (day?.date) {
        const date = new Date(day.date);
        const formattedDate = date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        });
        const activityLevel = day.level === 0 ? 'No activity' : `Activity level ${day.level}`;
        setAnnouncement(`${formattedDate}, ${activityLevel}`);
      }
      
      // Scroll the focused cell into view
      const gridElement = gridRef.current;
      if (gridElement) {
        const cells = gridElement.children;
        const focusedCell = cells[newIndex] as HTMLElement;
        if (focusedCell) {
          focusedCell.focus();
          // Ensure the cell is visible in the scroll container
          focusedCell.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
          });
        }
      }
    }
  };
  
  // Create descriptive aria-label for the grid
  const getGridAriaLabel = React.useMemo(() => {
    const filterText = activeFilterType === 'all' 
      ? 'all activities' 
      : activeFilterType === 'tasks'
      ? 'task activities'
      : activeFilterType === 'notes'
      ? 'note activities'
      : 'focus session activities';
    
    const daysText = isMobile ? 'last 90 days' : '365 days';
    
    return `Activity heatmap showing ${daysText} of ${filterText}. Use arrow keys to navigate between days, Enter or Space to view details.`;
  }, [activeFilterType, isMobile]);

  return (
    <div className={styles.container}>
      {/* Live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.srOnly}
      >
        {announcement}
      </div>

      {/* Header with title and legend */}
      <div className={styles.header}>
        <h3 className={styles.title} id="heatmap-title">
          Activity Heatmap
          {isMobile && <span className={styles.mobileNote}> (Last 90 days)</span>}
        </h3>
        <div className={styles.legend} role="img" aria-label="Activity level legend: squares range from empty (no activity) to dark purple (high activity)">
          <span className={styles.legendLabel}>Less</span>
          <div className={styles.legendSquare} data-level="0" aria-label="No activity" />
          <div className={styles.legendSquare} data-level="1" aria-label="Low activity" />
          <div className={styles.legendSquare} data-level="2" aria-label="Medium activity" />
          <div className={styles.legendSquare} data-level="3" aria-label="High activity" />
          <div className={styles.legendSquare} data-level="4" aria-label="Very high activity" />
          <span className={styles.legendLabel}>More</span>
        </div>
      </div>
      
      {/* Filter buttons - only show if no external filter is provided */}
      {externalFilterType === undefined && (
        <div className={styles.filterContainer} role="group" aria-label="Activity type filter">
          <button
            className={`${styles.filterButton} ${activeFilterType === 'all' ? styles.active : ''}`}
            onClick={() => handleFilterChange('all')}
            aria-pressed={activeFilterType === 'all'}
            aria-label="Show all activities"
          >
            All
          </button>
          <button
            className={`${styles.filterButton} ${activeFilterType === 'tasks' ? styles.active : ''}`}
            onClick={() => handleFilterChange('tasks')}
            aria-pressed={activeFilterType === 'tasks'}
            aria-label="Show only tasks"
          >
            ⚡ Tasks
          </button>
          <button
            className={`${styles.filterButton} ${activeFilterType === 'notes' ? styles.active : ''}`}
            onClick={() => handleFilterChange('notes')}
            aria-pressed={activeFilterType === 'notes'}
            aria-label="Show only notes"
          >
            📝 Notes
          </button>
          <button
            className={`${styles.filterButton} ${activeFilterType === 'focus' ? styles.active : ''}`}
            onClick={() => handleFilterChange('focus')}
            aria-pressed={activeFilterType === 'focus'}
            aria-label="Show only focus sessions"
          >
            ⏱️ Focus
          </button>
        </div>
      )}
      
      {/* Heatmap grid */}
      <div 
        ref={scrollContainerRef}
        className={`${styles.heatmapWrapper} ${isMobile ? styles.mobileScroll : ''} ${isScrolling ? styles.scrolling : ''}`}
      >
        {/* Month labels */}
        <div className={styles.monthLabels}>
          {monthLabels.map((label, index) => (
            <div
              key={index}
              className={styles.monthLabel}
              style={{ gridColumn: label.column + 1 }}
            >
              {label.month}
            </div>
          ))}
        </div>
        
        {/* Day of week labels */}
        <div className={styles.dayLabels}>
          <div className={styles.dayLabel}>Sun</div>
          <div className={styles.dayLabel}>Mon</div>
          <div className={styles.dayLabel}>Tue</div>
          <div className={styles.dayLabel}>Wed</div>
          <div className={styles.dayLabel}>Thu</div>
          <div className={styles.dayLabel}>Fri</div>
          <div className={styles.dayLabel}>Sat</div>
        </div>
        
        {/* Heatmap grid - CSS Grid (7 rows × variable columns) */}
        <div 
          ref={gridRef}
          className={styles.grid}
          role="grid"
          aria-label={getGridAriaLabel}
          aria-labelledby="heatmap-title"
          aria-describedby="heatmap-instructions"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {gridData.map((day, index) => (
            <HeatmapDay
              key={index}
              data={day}
              onClick={handleDayClick}
              onHover={setHoveredDay}
              isEmpty={!day.date}
              isFocused={index === focusedIndex}
            />
          ))}
        </div>
        
        {/* Hidden instructions for screen readers */}
        <div id="heatmap-instructions" className={styles.srOnly}>
          Navigate the heatmap using arrow keys. Press Enter or Space to view detailed information for a day. 
          Each cell represents one day and shows activity level through color intensity.
        </div>
      </div>
      
      {/* Hover tooltip */}
      {hoveredDay && hoveredDay.date && !isModalOpen && (
        <div className={styles.tooltip} role="tooltip">
          <div className={styles.tooltipDate}>
            {new Date(hoveredDay.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
          <div className={styles.tooltipStats}>
            <div className={styles.tooltipStat}>
              <span className={styles.tooltipIcon}>⚡</span>
              <span>{hoveredDay.activities.tasks} tasks</span>
            </div>
            <div className={styles.tooltipStat}>
              <span className={styles.tooltipIcon}>📝</span>
              <span>{hoveredDay.activities.notes} notes</span>
            </div>
            <div className={styles.tooltipStat}>
              <span className={styles.tooltipIcon}>⏱️</span>
              <span>{hoveredDay.activities.focusMinutes} min focus</span>
            </div>
            {hoveredDay.activities.commits !== undefined && hoveredDay.activities.commits > 0 && (
              <div className={styles.tooltipStat}>
                <span className={styles.tooltipIcon}>🐙</span>
                <span>{hoveredDay.activities.commits} commits</span>
              </div>
            )}
          </div>
          {hoveredDay.level === 0 && (
            <div className={styles.tooltipEmpty}>No activity</div>
          )}
        </div>
      )}

      {/* Day Detail Modal */}
      <DayDetailModal
        isOpen={isModalOpen}
        day={selectedDay}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ActivityHeatmap;
