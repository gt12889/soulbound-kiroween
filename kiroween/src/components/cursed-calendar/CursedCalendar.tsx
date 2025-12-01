import { useState, useMemo, useCallback } from 'react';
import { useTasks } from '../../contexts/TasksContext';
import { MoonPhaseCalendar } from '../graveyard-dashboard/MoonPhaseCalendar';
import type { Task } from '../../types';
import { createScopedLogger } from '../../utils/logger';
import styles from './CursedCalendar.module.css';

const logger = createScopedLogger('[CursedCalendar]');

export function CursedCalendar() {
  const { tasks, toggleTaskCompletion } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 6 = Saturday

  // Memoize calendar dates generation for performance
  const calendarDates = useMemo(() => {
    const dates: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      dates.push(null);
    }
    
    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, month, day));
    }
    
    return dates;
  }, [year, month, startDayOfWeek, daysInMonth]);

  // Memoize tasks grouped by date
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    
    if (!tasks || !Array.isArray(tasks)) {
      return map;
    }
    
    tasks.forEach(task => {
      if (task.dueDate) {
        try {
          const dateKey = new Date(task.dueDate).toDateString();
          if (!map.has(dateKey)) {
            map.set(dateKey, []);
          }
          map.get(dateKey)!.push(task);
        } catch (error) {
          logger.warn(`Invalid date for task ${task.id}:`, task.dueDate);
        }
      }
    });
    
    return map;
  }, [tasks]);

  // Memoize navigation handlers
  const handlePreviousMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleTaskClick = useCallback((taskId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleTaskCompletion(taskId);
  }, [toggleTaskCompletion]);
  
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.header}>
        <button 
          onClick={handlePreviousMonth} 
          className="button-secondary"
          aria-label="Previous month"
        >
          ◀
        </button>
        <h1 className={styles.title}>Cursed Calendar</h1>
        <button 
          onClick={handleNextMonth} 
          className="button-secondary"
          aria-label="Next month"
        >
          ▶
        </button>
      </div>

      {/* Moon Phase Calendar - integrated into cursed calendar */}
      <div className={styles.moonSection}>
        <MoonPhaseCalendar />
      </div>

      <div className={styles.divider}></div>

      <h2 className={styles.sectionTitle}>{monthName} - Task Schedule</h2>

      <div className={styles.weekdays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className={styles.weekday}>{day}</div>
        ))}
      </div>

      <div className={styles.calendarGrid}>
        {calendarDates.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className={styles.emptyCell}></div>;
          }
          const dateKey = date.toDateString();
          const tasksForDay = tasksByDate.get(dateKey) || [];
          return (
            <div key={date.toISOString()} className={styles.dayCell}>
              <div className={styles.dayNumber}>{date.getDate()}</div>
              <div className={styles.tasksForDay}>
                {tasksForDay.map(task => (
                  <button
                    key={task.id}
                    className={`${styles.taskItem} ${task.completed ? styles.taskCompleted : ''}`}
                    onClick={(e) => handleTaskClick(task.id, e)}
                    title={task.completed ? 'Click to mark incomplete' : 'Click to mark complete'}
                    aria-label={`${task.title} - ${task.completed ? 'completed' : 'incomplete'}`}
                  >
                    <span className={styles.taskCheckbox}>
                      {task.completed ? '✓' : '○'}
                    </span>
                    <span className={styles.taskTitle}>{task.title}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CursedCalendar;