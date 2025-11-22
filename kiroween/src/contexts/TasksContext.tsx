import { createContext, useContext, useCallback, useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Task } from '../types';
import { useToast } from './ToastContext';
import { useScreenReaderAnnouncement } from '../hooks/useScreenReaderAnnouncement';
import { useUndoRedo } from '../hooks/useUndoRedo';

interface TasksContextType {
  // Tasks data
  tasks: Task[];
  filteredTasks: Task[];
  activeTasks: Task[];
  archivedTasks: Task[];
  
  // CRUD operations
  createTask: (title: string, description: string, priority?: Task['priority'], tags?: string[], dueDate?: Date) => Task;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  getTask: (id: string) => Task | undefined;
  
  // Task completion
  toggleTaskCompletion: (id: string) => void;
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;
  
  // Archive operations
  archiveTask: (id: string) => void;
  unarchiveTask: (id: string) => void;
  getArchiveSuggestions: () => Task[];
  
  // Task reordering
  reorderTasks: (startIndex: number, endIndex: number) => void;
  moveTask: (taskId: string, newIndex: number) => void;
  
  // Tag filtering
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  tagFilterMode: 'AND' | 'OR';
  setTagFilterMode: (mode: 'AND' | 'OR') => void;
  allTags: string[];
  
  // Import functionality
  importTasks: (importedTasks: Task[], strategy: 'replace' | 'merge') => void;
  
  // Undo/Redo functionality
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // Bulk operations
  bulkDelete: (ids: string[]) => void;
  bulkArchive: (ids: string[]) => void;
  bulkTag: (ids: string[], tags: string[]) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

interface TasksProviderProps {
  children: ReactNode;
}

/**
 * TasksProvider component for task management
 * Implements CRUD operations, completion tracking, reordering, and storage integration
 * Requirements: 4.1, 4.2, 4.3, 4.6, 7.3, 8.1
 */
export function TasksProvider({ children }: TasksProviderProps) {
  // Persist tasks to LocalStorage
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  
  // Undo/Redo functionality
  // Requirement: 8.1, 8.5 - Implement undo/redo with max 10 actions
  const {
    state: undoRedoTasks,
    setState: setUndoRedoTasks,
    undo: undoHistory,
    redo: redoHistory,
    canUndo,
    canRedo,
  } = useUndoRedo<Task[]>(tasks, 10);
  
  // Tag filtering state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagFilterMode, setTagFilterMode] = useState<'AND' | 'OR'>('OR');
  
  // Toast notifications
  // Requirement: 4.5 - Display success toast within 200ms
  const { showToast } = useToast();
  
  // Screen reader announcements
  // Requirement: 6.2, 6.3 - Announce state changes to screen readers
  const { announce } = useScreenReaderAnnouncement();
  
  // Sync undo/redo state with localStorage
  useEffect(() => {
    setTasks(undoRedoTasks);
  }, [undoRedoTasks, setTasks]);

  /**
   * Create a new task
   * Requirements: 4.1, 7.3, 8.1
   */
  const createTask = useCallback((
    title: string,
    description: string,
    priority: Task['priority'] = 'medium',
    tags: string[] = [],
    dueDate?: Date
  ): Task => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      priority,
      completed: false,
      archived: false,
      tags,
      createdAt: new Date(),
      dueDate,
    };
    
    const newTasks = [...undoRedoTasks, newTask];
    setUndoRedoTasks(newTasks);
    
    // Requirement: 4.5 - Success toast for task creation
    showToast({
      type: 'success',
      message: `Task "${title}" created`,
    });
    
    return newTask;
  }, [undoRedoTasks, setUndoRedoTasks, showToast]);

  /**
   * Update an existing task
   * Requirements: 4.1, 7.3, 8.1
   */
  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    const newTasks = undoRedoTasks.map(task => {
      if (task.id === id) {
        return {
          ...task,
          ...updates,
        };
      }
      return task;
    });
    
    setUndoRedoTasks(newTasks);
    
    // Requirement: 4.5 - Success toast for task update
    showToast({
      type: 'success',
      message: 'Task updated',
    });
  }, [undoRedoTasks, setUndoRedoTasks, showToast]);

  /**
   * Delete a task
   * Requirements: 4.1, 7.3, 8.1
   */
  const deleteTask = useCallback((id: string) => {
    const task = undoRedoTasks.find(t => t.id === id);
    const newTasks = undoRedoTasks.filter(task => task.id !== id);
    setUndoRedoTasks(newTasks);
    
    // Requirement: 4.5, 8.4 - Success toast with undo button for task deletion
    if (task) {
      showToast({
        type: 'success',
        message: `Task "${task.title}" deleted`,
        action: {
          label: 'Undo',
          onClick: undoHistory,
        },
      });
    }
  }, [undoRedoTasks, setUndoRedoTasks, showToast, undoHistory]);

  /**
   * Get a specific task by ID
   */
  const getTask = useCallback((id: string): Task | undefined => {
    return undoRedoTasks.find(task => task.id === id);
  }, [undoRedoTasks]);

  /**
   * Toggle task completion status
   * Requirements: 4.2, 4.3, 7.3, 6.2, 6.3, 8.1
   */
  const toggleTaskCompletion = useCallback((id: string) => {
    const task = undoRedoTasks.find(t => t.id === id);
    const newTasks = undoRedoTasks.map(task => {
      if (task.id === id) {
        const completed = !task.completed;
        return {
          ...task,
          completed,
          completedAt: completed ? new Date() : undefined,
        };
      }
      return task;
    });
    
    setUndoRedoTasks(newTasks);
    
    // Announce to screen readers
    if (task) {
      announce(task.completed ? `Task "${task.title}" marked as incomplete` : `Task "${task.title}" completed`);
    }
  }, [undoRedoTasks, setUndoRedoTasks, announce]);

  /**
   * Mark task as complete
   * Requirements: 4.2, 4.3, 7.3, 8.1
   */
  const completeTask = useCallback((id: string) => {
    const newTasks = undoRedoTasks.map(task => {
      if (task.id === id && !task.completed) {
        return {
          ...task,
          completed: true,
          completedAt: new Date(),
        };
      }
      return task;
    });
    
    setUndoRedoTasks(newTasks);
  }, [undoRedoTasks, setUndoRedoTasks]);

  /**
   * Mark task as incomplete
   * Requirements: 4.2, 7.3, 8.1
   */
  const uncompleteTask = useCallback((id: string) => {
    const newTasks = undoRedoTasks.map(task => {
      if (task.id === id && task.completed) {
        return {
          ...task,
          completed: false,
          completedAt: undefined,
        };
      }
      return task;
    });
    
    setUndoRedoTasks(newTasks);
  }, [undoRedoTasks, setUndoRedoTasks]);

  /**
   * Archive a task
   * Requirements: 15.1, 15.3, 8.1
   */
  const archiveTask = useCallback((id: string) => {
    const newTasks = undoRedoTasks.map(task => {
      if (task.id === id && !task.archived) {
        return {
          ...task,
          archived: true,
          archivedAt: new Date(),
        };
      }
      return task;
    });
    
    setUndoRedoTasks(newTasks);
  }, [undoRedoTasks, setUndoRedoTasks]);

  /**
   * Unarchive a task (restore from archive)
   * Requirements: 15.1, 15.3, 8.1
   */
  const unarchiveTask = useCallback((id: string) => {
    const newTasks = undoRedoTasks.map(task => {
      if (task.id === id && task.archived) {
        return {
          ...task,
          archived: false,
          archivedAt: undefined,
        };
      }
      return task;
    });
    
    setUndoRedoTasks(newTasks);
  }, [undoRedoTasks, setUndoRedoTasks]);

  /**
   * Get tasks that should be suggested for archiving
   * (completed for more than 30 days)
   * Requirements: 15.6
   */
  const getArchiveSuggestions = useCallback((): Task[] => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return undoRedoTasks.filter(task => {
      if (!task.completed || task.archived || !task.completedAt) {
        return false;
      }
      
      const completedDate = new Date(task.completedAt);
      return completedDate < thirtyDaysAgo;
    });
  }, [undoRedoTasks]);

  /**
   * Reorder tasks by moving from startIndex to endIndex
   * Requirements: 4.6, 7.3, 8.1
   */
  const reorderTasks = useCallback((startIndex: number, endIndex: number) => {
    const result = Array.from(undoRedoTasks);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setUndoRedoTasks(result);
  }, [undoRedoTasks, setUndoRedoTasks]);

  /**
   * Move a specific task to a new index
   * Requirements: 4.6, 7.3, 8.1
   */
  const moveTask = useCallback((taskId: string, newIndex: number) => {
    const currentIndex = undoRedoTasks.findIndex(task => task.id === taskId);
    if (currentIndex === -1) return;
    
    const result = Array.from(undoRedoTasks);
    const [removed] = result.splice(currentIndex, 1);
    result.splice(newIndex, 0, removed);
    setUndoRedoTasks(result);
  }, [undoRedoTasks, setUndoRedoTasks]);

  /**
   * Get active (non-archived) tasks
   * Requirements: 15.1
   */
  const activeTasks = useMemo(() => {
    return undoRedoTasks.filter(task => !task.archived);
  }, [undoRedoTasks]);

  /**
   * Get archived tasks
   * Requirements: 15.1, 15.4
   */
  const archivedTasks = useMemo(() => {
    return undoRedoTasks.filter(task => task.archived);
  }, [undoRedoTasks]);

  /**
   * Get all unique tags from all tasks
   */
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    undoRedoTasks.forEach(task => {
      task.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [undoRedoTasks]);

  /**
   * Import tasks with merge or replace strategy
   * Requirements: 11.3, 8.1
   */
  const importTasks = useCallback((importedTasks: Task[], strategy: 'replace' | 'merge') => {
    if (strategy === 'replace') {
      // Replace all existing tasks
      setUndoRedoTasks(importedTasks);
    } else {
      // Merge: add only unique tasks (skip duplicates)
      const merged = [...undoRedoTasks];
      
      importedTasks.forEach(importedTask => {
        // Check if task already exists (by title and description)
        const isDuplicate = undoRedoTasks.some(existing => 
          existing.title.trim().toLowerCase() === importedTask.title.trim().toLowerCase() &&
          existing.description.trim().toLowerCase() === importedTask.description.trim().toLowerCase()
        );
        
        if (!isDuplicate) {
          // Generate new ID to avoid conflicts
          merged.push({
            ...importedTask,
            id: crypto.randomUUID(),
          });
        }
      });
      
      setUndoRedoTasks(merged);
    }
  }, [undoRedoTasks, setUndoRedoTasks]);

  /**
   * Filter tasks based on selected tags
   * Requirements: 14.4, 14.6
   */
  const filteredTasks = useMemo(() => {
    // Only filter active tasks by default
    const tasksToFilter = activeTasks;
    
    if (selectedTags.length === 0) {
      return tasksToFilter;
    }
    
    return tasksToFilter.filter(task => {
      const taskTags = task.tags || [];
      if (tagFilterMode === 'AND') {
        // Task must have ALL selected tags
        return selectedTags.every(tag => taskTags.includes(tag));
      } else {
        // Task must have ANY selected tag
        return selectedTags.some(tag => taskTags.includes(tag));
      }
    });
  }, [activeTasks, selectedTags, tagFilterMode]);

  /**
   * Undo the last action
   * Requirement: 8.1, 8.2 - Implement undo with Ctrl+Z
   */
  const undo = useCallback(() => {
    undoHistory();
  }, [undoHistory]);

  /**
   * Redo the last undone action
   * Requirement: 8.1, 8.3 - Implement redo with Ctrl+Y
   */
  const redo = useCallback(() => {
    redoHistory();
  }, [redoHistory]);

  /**
   * Bulk delete multiple tasks
   * Requirement: 9.5
   */
  const bulkDelete = useCallback((ids: string[]) => {
    const newTasks = undoRedoTasks.filter(task => !ids.includes(task.id));
    setUndoRedoTasks(newTasks);
    
    // Requirement: 4.5, 8.4 - Success toast with undo button
    showToast({
      type: 'success',
      message: `${ids.length} task${ids.length > 1 ? 's' : ''} deleted`,
      action: {
        label: 'Undo',
        onClick: undoHistory,
      },
    });
  }, [undoRedoTasks, setUndoRedoTasks, showToast, undoHistory]);

  /**
   * Bulk archive multiple tasks
   * Requirement: 9.5
   */
  const bulkArchive = useCallback((ids: string[]) => {
    const newTasks = undoRedoTasks.map(task => {
      if (ids.includes(task.id) && !task.archived) {
        return {
          ...task,
          archived: true,
          archivedAt: new Date(),
        };
      }
      return task;
    });
    
    setUndoRedoTasks(newTasks);
    
    // Requirement: 4.5 - Success toast
    showToast({
      type: 'success',
      message: `${ids.length} task${ids.length > 1 ? 's' : ''} archived`,
    });
  }, [undoRedoTasks, setUndoRedoTasks, showToast]);

  /**
   * Bulk add tags to multiple tasks
   * Requirement: 9.5
   */
  const bulkTag = useCallback((ids: string[], tags: string[]) => {
    const newTasks = undoRedoTasks.map(task => {
      if (ids.includes(task.id)) {
        // Merge new tags with existing tags, avoiding duplicates
        const existingTags = task.tags || [];
        const mergedTags = Array.from(new Set([...existingTags, ...tags]));
        return {
          ...task,
          tags: mergedTags,
        };
      }
      return task;
    });
    
    setUndoRedoTasks(newTasks);
    
    // Requirement: 4.5 - Success toast
    showToast({
      type: 'success',
      message: `Tags added to ${ids.length} task${ids.length > 1 ? 's' : ''}`,
    });
  }, [undoRedoTasks, setUndoRedoTasks, showToast]);

  const value: TasksContextType = {
    tasks: undoRedoTasks,
    filteredTasks,
    activeTasks,
    archivedTasks,
    createTask,
    updateTask,
    deleteTask,
    getTask,
    toggleTaskCompletion,
    completeTask,
    uncompleteTask,
    archiveTask,
    unarchiveTask,
    getArchiveSuggestions,
    reorderTasks,
    moveTask,
    selectedTags,
    setSelectedTags,
    tagFilterMode,
    setTagFilterMode,
    allTags,
    importTasks,
    undo,
    redo,
    canUndo,
    canRedo,
    bulkDelete,
    bulkArchive,
    bulkTag,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

/**
 * Hook to access TasksContext
 * @throws Error if used outside TasksProvider
 */
export function useTasks(): TasksContextType {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}
