import { createContext, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Task } from '../types';

interface TasksContextType {
  // Tasks data
  tasks: Task[];
  
  // CRUD operations
  createTask: (title: string, description: string, priority?: Task['priority']) => Task;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  getTask: (id: string) => Task | undefined;
  
  // Task completion
  toggleTaskCompletion: (id: string) => void;
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;
  
  // Task reordering
  reorderTasks: (startIndex: number, endIndex: number) => void;
  moveTask: (taskId: string, newIndex: number) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

interface TasksProviderProps {
  children: ReactNode;
}

/**
 * TasksProvider component for task management
 * Implements CRUD operations, completion tracking, reordering, and storage integration
 * Requirements: 4.1, 4.2, 4.3, 4.6, 7.3
 */
export function TasksProvider({ children }: TasksProviderProps) {
  // Persist tasks to LocalStorage
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);

  /**
   * Create a new task
   * Requirements: 4.1, 7.3
   */
  const createTask = useCallback((
    title: string,
    description: string,
    priority: Task['priority'] = 'medium'
  ): Task => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      priority,
      completed: false,
      createdAt: new Date(),
    };
    
    setTasks(prev => [...prev, newTask]);
    
    return newTask;
  }, [setTasks]);

  /**
   * Update an existing task
   * Requirements: 4.1, 7.3
   */
  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        return {
          ...task,
          ...updates,
        };
      }
      return task;
    }));
  }, [setTasks]);

  /**
   * Delete a task
   * Requirements: 4.1, 7.3
   */
  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, [setTasks]);

  /**
   * Get a specific task by ID
   */
  const getTask = useCallback((id: string): Task | undefined => {
    return tasks.find(task => task.id === id);
  }, [tasks]);

  /**
   * Toggle task completion status
   * Requirements: 4.2, 4.3, 7.3
   */
  const toggleTaskCompletion = useCallback((id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const completed = !task.completed;
        return {
          ...task,
          completed,
          completedAt: completed ? new Date() : undefined,
        };
      }
      return task;
    }));
  }, [setTasks]);

  /**
   * Mark task as complete
   * Requirements: 4.2, 4.3, 7.3
   */
  const completeTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id && !task.completed) {
        return {
          ...task,
          completed: true,
          completedAt: new Date(),
        };
      }
      return task;
    }));
  }, [setTasks]);

  /**
   * Mark task as incomplete
   * Requirements: 4.2, 7.3
   */
  const uncompleteTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id && task.completed) {
        return {
          ...task,
          completed: false,
          completedAt: undefined,
        };
      }
      return task;
    }));
  }, [setTasks]);

  /**
   * Reorder tasks by moving from startIndex to endIndex
   * Requirements: 4.6, 7.3
   */
  const reorderTasks = useCallback((startIndex: number, endIndex: number) => {
    setTasks(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, [setTasks]);

  /**
   * Move a specific task to a new index
   * Requirements: 4.6, 7.3
   */
  const moveTask = useCallback((taskId: string, newIndex: number) => {
    setTasks(prev => {
      const currentIndex = prev.findIndex(task => task.id === taskId);
      if (currentIndex === -1) return prev;
      
      const result = Array.from(prev);
      const [removed] = result.splice(currentIndex, 1);
      result.splice(newIndex, 0, removed);
      return result;
    });
  }, [setTasks]);

  const value: TasksContextType = {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    getTask,
    toggleTaskCompletion,
    completeTask,
    uncompleteTask,
    reorderTasks,
    moveTask,
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
