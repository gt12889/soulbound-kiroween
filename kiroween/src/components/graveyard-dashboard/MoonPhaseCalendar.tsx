import { useState, useMemo } from 'react';
import { useTasks } from '../../contexts/TasksContext';
import { calculateMoonPhase, getMonthMoonPhases } from '../../services/moonPhaseService';
import { MoonIcon } from './MoonIcon';
import styles from './MoonPhaseCalendar.module.css';

interface MoonPhaseCalendarProps {
  compact?: boolean;
}

/**
 * MoonPhaseCalendar component - displays month view with moon icons for each day
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
export function MoonPhaseCalendar({ compact = false }: MoonPhaseCalendarProps) {
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

  // Calculate moon phases for the current month - Requirement 5.3
  const monthPhases = useMemo(() => {
    return getMonthMoonPhases(year, month);
  }, [year, month]);

  // Get the first day of the month and number of days
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  // Create array of dates for the calendar grid
  const calendarDates: (Date | null)[] = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDates.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDates.push(new Date(year, month - 1, day));
  }

  // Get tasks for each date - Requirement 5.6
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return (
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
      );
    });
  };

  // Navigate to previous month - Requirement 5.5
  const handlePreviousMonth = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
    
    setTimeout(() => setIsAnimating(false), 600);
  };

  // Navigate to next month - Requirement 5.5
  const handleNextMonth = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
    
    setTimeout(() => setIsAnimating(false), 600);
  };

  // Handle date selection - Requirement 5.2
  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const calendarClasses = [
    styles.calendar,
    isAnimating ? styles.animating : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`${styles.moonCalendar} ${compact ? styles.compact : ''}`}>
      <div className={styles.header}>
        <button
          className={styles.navButton}
          onClick={handlePreviousMonth}
          disabled={isAnimating}
          aria-label="Previous month"
        >
          ◀
        </button>
        
        <h2 className={styles.monthTitle}>{monthName}</h2>
        
        <button
          className={styles.navButton}
          onClick={handleNextMonth}
          disabled={isAnimating}
          aria-label="Next month"
        >
          ▶
        </button>
      </div>

      {/* Day of week headers */}
      <div className={styles.weekdays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className={styles.weekday}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid with moon icons - Requirements 5.1, 5.2 */}
      <div className={calendarClasses}>
        {calendarDates.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className={styles.emptyCell}></div>;
          }

          const dayIndex = date.getDate() - 1;
          const moonPhase = monthPhases[dayIndex];
          const tasksForDate = getTasksForDate(date);
          const hasEvents = tasksForDate.length > 0;
          const isSelected = selectedDate?.toDateString() === date.toDateString();

          return (
            <MoonIcon
              key={date.toISOString()}
              date={date}
              moonPhase={moonPhase}
              isSelected={isSelected}
              hasEvents={hasEvents}
              events={tasksForDate}
              onSelect={handleSelectDate}
            />
          );
        })}
      </div>

      {/* Selected date details */}
      {selectedDate && (
        <div className={styles.selectedDateInfo}>
          <h3 className={styles.selectedDateTitle}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </h3>
          
          <div className={styles.selectedDatePhase}>
            {calculateMoonPhase(selectedDate).emoji} {calculateMoonPhase(selectedDate).name.replace('-', ' ')}
          </div>

          {getTasksForDate(selectedDate).length > 0 ? (
            <div className={styles.selectedDateTasks}>
              <h4>Tasks for this day:</h4>
              <ul>
                {getTasksForDate(selectedDate).map(task => (
                  <li key={task.id} className={task.completed ? styles.completedTask : ''}>
                    {task.title}
                    {task.completed && ' ✓'}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className={styles.noTasks}>No tasks for this day</p>
          )}
        </div>
      )}
    </div>
  );
}
