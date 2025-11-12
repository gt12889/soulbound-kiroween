import { useState, useRef } from 'react';
import { useTasks } from '../../contexts/TasksContext';
import { useAudio } from '../../hooks/useAudio';
import { Tombstone } from './Tombstone';
import type { Task } from '../../types';
import styles from './GraveyardView.module.css';

/**
 * GraveyardView component - displays tasks as tombstones in a graveyard layout
 * Requirements: 4.1, 4.6, 8.4
 */
export function GraveyardView() {
  const { tasks, createTask, toggleTaskCompletion, deleteTask, reorderTasks } = useTasks();
  const { playUIClick, playUIHover } = useAudio();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  // Sort tasks by priority (high -> medium -> low) and completion status
  const sortedTasks = [...tasks].sort((a, b) => {
    // Completed tasks go to the end
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newTaskTitle.trim()) {
      playUIClick();
      createTask(newTaskTitle.trim(), newTaskDescription.trim(), newTaskPriority);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('medium');
      setShowCreateForm(false);
    }
  };

  const handleToggleForm = () => {
    playUIClick();
    setShowCreateForm(!showCreateForm);
  };

  // Drag and drop handlers - Requirement 4.6
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    dragCounter.current = 0;
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderTasks(draggedIndex, dropIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className={styles.graveyard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Graveyard Dashboard</h1>
        <p className={styles.subtitle}>Where tasks come to rest</p>
        
        <button
          className={styles.createButton}
          onClick={handleToggleForm}
          onMouseEnter={playUIHover}
        >
          {showCreateForm ? 'Cancel' : '+ Raise New Task'}
        </button>
      </div>

      {showCreateForm && (
        <form className={styles.createForm} onSubmit={handleCreateTask}>
          <div className={styles.formGroup}>
            <label htmlFor="taskTitle">Task Title</label>
            <input
              id="taskTitle"
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title..."
              autoFocus
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="taskDescription">Description</label>
            <textarea
              id="taskDescription"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Enter task description..."
              rows={3}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="taskPriority">Priority</label>
            <select
              id="taskPriority"
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            onMouseEnter={playUIHover}
          >
            Create Task
          </button>
        </form>
      )}

      {/* Grid layout for tombstones - Requirement 4.1 */}
      <div className={styles.tombstoneGrid}>
        {sortedTasks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>The graveyard is empty...</p>
            <p>Create a task to raise your first tombstone</p>
          </div>
        ) : (
          sortedTasks.map((task, index) => (
            <div
              key={task.id}
              className={`${styles.tombstoneWrapper} ${dragOverIndex === index ? styles.dragOver : ''}`}
              draggable={!task.completed}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              <Tombstone
                task={task}
                onToggleComplete={toggleTaskCompletion}
                onDelete={deleteTask}
                isDragging={draggedIndex === index}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
