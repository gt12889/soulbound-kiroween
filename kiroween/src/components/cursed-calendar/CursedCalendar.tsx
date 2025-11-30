import { useState, useMemo } from 'react';
import { useTasks } from '../../contexts/TasksContext';
import { MoonPhaseCalendar } from '../graveyard-dashboard/MoonPhaseCalendar';
import styles from './CursedCalendar.module.css';

export function CursedCalendar() {
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay();

  const calendarDates: (Date | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDates.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDates.push(new Date(year, month, day));
  }

  const tasksByDate = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = new Date(task.dueDate).toDateString();
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)?.push(task);
      }
    });
    return map;
  }, [tasks]);

  const handlePreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.header}>
        <button onClick={handlePreviousMonth} className="button-secondary">◀</button>
        <h1 className={styles.title}>Cursed Calendar</h1>
        <button onClick={handleNextMonth} className="button-secondary">▶</button>
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
                  <div key={task.id} className={styles.taskItem}>
                    {task.title}
                  </div>
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