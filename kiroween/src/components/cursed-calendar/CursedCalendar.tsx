import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useTasks } from '../../contexts/TasksContext';
import { MoonPhaseCalendar } from '../graveyard-dashboard/MoonPhaseCalendar';
import type { Task } from '../../types';
import { createScopedLogger } from '../../utils/logger';
import styles from './CursedCalendar.module.css';

const logger = createScopedLogger('[CursedCalendar]');

export function CursedCalendar() {
  const { 
    tasks, 
    toggleTaskCompletion, 
    createTask, 
    updateTask,
    allTags 
  } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  // Form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<Task['priority']>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskTags, setTaskTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  const formRef = useRef<HTMLFormElement>(null);

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

  // Reset form when closing
  useEffect(() => {
    if (!showTaskForm) {
      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority('medium');
      setTaskDueDate('');
      setTaskTags([]);
      setNewTag('');
      setEditingTask(null);
      setSelectedDate(null);
    }
  }, [showTaskForm]);

  // Initialize form when editing
  useEffect(() => {
    if (editingTask && showTaskForm) {
      setTaskTitle(editingTask.title);
      setTaskDescription(editingTask.description);
      setTaskPriority(editingTask.priority);
      setTaskDueDate(editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : '');
      setTaskTags([...editingTask.tags]);
    } else if (selectedDate && showTaskForm && !editingTask) {
      // Pre-fill date when adding new task
      setTaskDueDate(selectedDate.toISOString().split('T')[0]);
    }
  }, [editingTask, selectedDate, showTaskForm]);

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setEditingTask(null);
    setShowTaskForm(true);
  }, []);

  const handleTaskClick = useCallback((taskId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    // Single click toggles completion
    toggleTaskCompletion(taskId);
  }, [toggleTaskCompletion]);

  const handleTaskDoubleClick = useCallback((task: Task, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingTask(task);
    setSelectedDate(task.dueDate ? new Date(task.dueDate) : null);
    setShowTaskForm(true);
  }, []);

  const handleAddTag = useCallback(() => {
    if (newTag.trim() && !taskTags.includes(newTag.trim())) {
      setTaskTags([...taskTags, newTag.trim()]);
      setNewTag('');
    }
  }, [newTag, taskTags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTaskTags(taskTags.filter(tag => tag !== tagToRemove));
  }, [taskTags]);

  const handleSubmitTask = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskTitle.trim()) {
      return;
    }

    const dueDate = taskDueDate ? new Date(taskDueDate) : undefined;

    if (editingTask) {
      // Update existing task
      updateTask(editingTask.id, {
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        priority: taskPriority,
        dueDate,
        tags: taskTags,
      });
    } else {
      // Create new task
      createTask(
        taskTitle.trim(),
        taskDescription.trim(),
        taskPriority,
        taskTags,
        dueDate
      );
    }

    setShowTaskForm(false);
  }, [taskTitle, taskDescription, taskPriority, taskDueDate, taskTags, editingTask, createTask, updateTask]);

  const handleCloseForm = useCallback(() => {
    setShowTaskForm(false);
  }, []);
  
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
          const isToday = date.toDateString() === new Date().toDateString();
          return (
            <div 
              key={date.toISOString()} 
              className={`${styles.dayCell} ${isToday ? styles.today : ''}`}
              onClick={() => handleDayClick(date)}
              title="Click to add task for this date"
            >
              <div className={styles.dayNumber}>{date.getDate()}</div>
              <div className={styles.tasksForDay}>
                {tasksForDay.map(task => (
                  <button
                    key={task.id}
                    className={`${styles.taskItem} ${task.completed ? styles.taskCompleted : ''}`}
                    onClick={(e) => handleTaskClick(task.id, e)}
                    onDoubleClick={(e) => handleTaskDoubleClick(task, e)}
                    title={`${task.completed ? 'Click to mark incomplete' : 'Click to mark complete'}. Double-click to edit.`}
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

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className={styles.modalOverlay} onClick={handleCloseForm}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingTask ? 'Edit Task' : 'Add Task'}</h2>
              <button 
                className={styles.closeButton}
                onClick={handleCloseForm}
                aria-label="Close form"
              >
                ×
              </button>
            </div>
            
            <form ref={formRef} onSubmit={handleSubmitTask} className={styles.taskForm}>
              <div className={styles.formGroup}>
                <label htmlFor="taskTitle">Task Title *</label>
                <input
                  id="taskTitle"
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Enter task title..."
                  autoFocus
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="taskDescription">Description</label>
                <textarea
                  id="taskDescription"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Enter task description..."
                  rows={3}
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="taskPriority">Priority</label>
                  <select
                    id="taskPriority"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Task['priority'])}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="taskDueDate">Due Date</label>
                  <input
                    id="taskDueDate"
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Tags</label>
                <div className={styles.tagsInput}>
                  <div className={styles.tagsList}>
                    {taskTags.map(tag => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className={styles.removeTag}
                          aria-label={`Remove tag ${tag}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className={styles.addTagInput}>
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Add tag..."
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className={styles.addTagButton}
                      disabled={!newTag.trim()}
                    >
                      Add
                    </button>
                  </div>
                  {allTags.length > 0 && (
                    <div className={styles.suggestedTags}>
                      <span className={styles.suggestedLabel}>Suggested: </span>
                      {allTags
                        .filter(tag => !taskTags.includes(tag))
                        .slice(0, 5)
                        .map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              if (!taskTags.includes(tag)) {
                                setTaskTags([...taskTags, tag]);
                              }
                            }}
                            className={styles.suggestedTag}
                          >
                            {tag}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className={styles.formActions}>
                <button 
                  type="button"
                  onClick={handleCloseForm}
                  className={`${styles.cancelButton} button-secondary`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`${styles.submitButton} button-primary`}
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CursedCalendar;