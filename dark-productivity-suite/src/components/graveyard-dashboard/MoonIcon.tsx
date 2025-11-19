import { useState } from 'react';
import type { MoonPhase } from '../../services/moonPhaseService';
import type { Task } from '../../types';
import styles from './MoonIcon.module.css';

interface MoonIconProps {
  date: Date;
  moonPhase: MoonPhase;
  isSelected: boolean;
  hasEvents: boolean;
  events: Task[];
  onSelect: (date: Date) => void;
}

/**
 * MoonIcon component - renders moon in specific phase with interactive features
 * Requirements: 5.1, 5.2, 5.4, 5.6
 */
export function MoonIcon({ date, moonPhase, isSelected, hasEvents, events, onSelect }: MoonIconProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    onSelect(date);
  };

  const moonClasses = [
    styles.moonIcon,
    styles[moonPhase.name],
    isSelected ? styles.selected : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      className={styles.moonContainer}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={handleClick}
      aria-label={`${date.toDateString()}, ${moonPhase.name} phase, ${moonPhase.illumination}% illuminated. ${hasEvents ? `Contains ${events.length} task(s).` : 'No tasks.'}`}
    >
      {/* Event indicator - Requirement 5.6 */}
      {hasEvents && (
        <div className={styles.eventIndicator}>
          <span className={styles.eventDot}></span>
        </div>
      )}

      {/* Moon icon with phase-specific rendering - Requirements 5.1, 5.2 */}
      <div className={moonClasses}>
        <div className={styles.moonSurface}>
          {/* Shadow overlay for phase representation */}
          <div 
            className={styles.moonShadow}
            style={{
              clipPath: getMoonClipPath(moonPhase.phase),
            }}
          ></div>
        </div>
      </div>

      {/* Day number */}
      <div className={styles.dayNumber}>{date.getDate()}</div>

      {/* Tooltip with date and events - Requirement 5.4 */}
      {showTooltip && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipContent}>
            <div className={styles.tooltipDate}>
              {date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <div className={styles.tooltipPhase}>
              {moonPhase.emoji} {moonPhase.name.replace('-', ' ')}
            </div>
            <div className={styles.tooltipIllumination}>
              {Math.round(moonPhase.illumination)}% illuminated
            </div>
            
            {hasEvents && events.length > 0 && (
              <div className={styles.tooltipEvents}>
                <div className={styles.tooltipEventsTitle}>Tasks:</div>
                {events.map(event => (
                  <div key={event.id} className={styles.tooltipEvent}>
                    • {event.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </button>
  );
}

/**
 * Generate CSS clip-path for moon shadow based on phase
 * 
 * @param phase - Moon phase (0-1)
 * @returns CSS clip-path string
 */
function getMoonClipPath(phase: number): string {
  // phase 0 = new moon (fully dark)
  // phase 0.5 = full moon (no shadow)
  // phase 1 = new moon (fully dark)
  
  const normalizedPhase = phase % 1;
  
  if (normalizedPhase < 0.5) {
    // Waxing (growing) - shadow on left side
    const shadowWidth = (0.5 - normalizedPhase) * 2; // 1 to 0
    return `inset(0 ${shadowWidth * 50}% 0 0)`;
  } else {
    // Waning (shrinking) - shadow on right side
    const shadowWidth = (normalizedPhase - 0.5) * 2; // 0 to 1
    return `inset(0 0 0 ${shadowWidth * 50}%)`;
  }
}
