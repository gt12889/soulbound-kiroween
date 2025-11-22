import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTasks } from '../../contexts/TasksContext';
import { AllProviders } from '../test-utils';

// Use AllProviders wrapper which includes all necessary contexts
const wrapper = AllProviders;

describe('TasksContext - Tags and Archiving', () => {
  describe('Tag Filtering', () => {
    it('should filter tasks by tags with OR mode', () => {
      const { result } = renderHook(() => useTasks(), { wrapper });

      // Create tasks with different tags
      act(() => {
        const task1 = result.current.createTask('Task 1', 'Description 1', 'medium');
        const task2 = result.current.createTask('Task 2', 'Description 2', 'high');
        const task3 = result.current.createTask('Task 3', 'Description 3', 'low');
        
        result.current.updateTask(task1.id, { tags: ['work', 'urgent'] });
        result.current.updateTask(task2.id, { tags: ['personal'] });
        result.current.updateTask(task3.id, { tags: ['work'] });
      });

      // Initially, all tasks should be in filteredTasks
      expect(result.current.filteredTasks).toHaveLength(3);

      // Filter by 'work' tag
      act(() => {
        result.current.setSelectedTags(['work']);
      });

      // Should show 2 tasks with 'work' tag
      expect(result.current.filteredTasks).toHaveLength(2);
      expect(result.current.filteredTasks.every(t => t.tags.includes('work'))).toBe(true);
    });

    it('should filter tasks by tags with AND mode', () => {
      const { result } = renderHook(() => useTasks(), { wrapper });

      // Create tasks with different tags
      act(() => {
        const task1 = result.current.createTask('Task 1', 'Description 1', 'medium');
        const task2 = result.current.createTask('Task 2', 'Description 2', 'high');
        const task3 = result.current.createTask('Task 3', 'Description 3', 'low');
        
        result.current.updateTask(task1.id, { tags: ['work', 'urgent'] });
        result.current.updateTask(task2.id, { tags: ['work'] });
        result.current.updateTask(task3.id, { tags: ['urgent'] });
      });

      // Set AND mode and filter by both tags
      act(() => {
        result.current.setTagFilterMode('AND');
        result.current.setSelectedTags(['work', 'urgent']);
      });

      // Should show only 1 task with both tags
      expect(result.current.filteredTasks).toHaveLength(1);
      expect(result.current.filteredTasks[0].tags).toContain('work');
      expect(result.current.filteredTasks[0].tags).toContain('urgent');
    });

    it('should collect all unique tags from tasks', () => {
      const { result } = renderHook(() => useTasks(), { wrapper });

      act(() => {
        const task1 = result.current.createTask('Task 1', 'Description 1', 'medium');
        const task2 = result.current.createTask('Task 2', 'Description 2', 'high');
        
        result.current.updateTask(task1.id, { tags: ['work', 'urgent'] });
        result.current.updateTask(task2.id, { tags: ['personal', 'work'] });
      });

      // Should have 3 unique tags
      expect(result.current.allTags).toHaveLength(3);
      expect(result.current.allTags).toContain('work');
      expect(result.current.allTags).toContain('urgent');
      expect(result.current.allTags).toContain('personal');
    });
  });

  describe('Archive Management', () => {
    it('should archive a task', () => {
      const { result } = renderHook(() => useTasks(), { wrapper });

      let taskId: string;
      act(() => {
        const task = result.current.createTask('Task 1', 'Description 1', 'medium');
        taskId = task.id;
      });

      // Initially not archived
      expect(result.current.activeTasks).toHaveLength(1);
      expect(result.current.archivedTasks).toHaveLength(0);

      // Archive the task
      act(() => {
        result.current.archiveTask(taskId);
      });

      // Should be in archived tasks
      expect(result.current.activeTasks).toHaveLength(0);
      expect(result.current.archivedTasks).toHaveLength(1);
      expect(result.current.archivedTasks[0].archived).toBe(true);
      expect(result.current.archivedTasks[0].archivedAt).toBeDefined();
    });

    it('should unarchive a task', () => {
      const { result } = renderHook(() => useTasks(), { wrapper });

      let taskId: string;
      act(() => {
        const task = result.current.createTask('Task 1', 'Description 1', 'medium');
        taskId = task.id;
        result.current.archiveTask(taskId);
      });

      // Should be archived
      expect(result.current.archivedTasks).toHaveLength(1);

      // Unarchive the task
      act(() => {
        result.current.unarchiveTask(taskId);
      });

      // Should be back in active tasks
      expect(result.current.activeTasks).toHaveLength(1);
      expect(result.current.archivedTasks).toHaveLength(0);
      expect(result.current.activeTasks[0].archived).toBe(false);
      expect(result.current.activeTasks[0].archivedAt).toBeUndefined();
    });

    it('should suggest tasks for archiving after 30 days', () => {
      const { result } = renderHook(() => useTasks(), { wrapper });

      act(() => {
        // Create a task completed 31 days ago
        const task1 = result.current.createTask('Old Task', 'Description', 'medium');
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 31);
        result.current.updateTask(task1.id, { 
          completed: true, 
          completedAt: oldDate 
        });

        // Create a task completed 10 days ago
        const task2 = result.current.createTask('Recent Task', 'Description', 'medium');
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 10);
        result.current.updateTask(task2.id, { 
          completed: true, 
          completedAt: recentDate 
        });
      });

      // Should suggest only the old task
      const suggestions = result.current.getArchiveSuggestions();
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].title).toBe('Old Task');
    });

    it('should not include archived tasks in filtered tasks', () => {
      const { result } = renderHook(() => useTasks(), { wrapper });

      act(() => {
        const task1 = result.current.createTask('Task 1', 'Description 1', 'medium');
        const task2 = result.current.createTask('Task 2', 'Description 2', 'high');
        
        result.current.updateTask(task1.id, { tags: ['work'] });
        result.current.updateTask(task2.id, { tags: ['work'] });
        
        // Archive task1
        result.current.archiveTask(task1.id);
      });

      // Filter by 'work' tag
      act(() => {
        result.current.setSelectedTags(['work']);
      });

      // Should only show the non-archived task
      expect(result.current.filteredTasks).toHaveLength(1);
      expect(result.current.filteredTasks[0].title).toBe('Task 2');
    });
  });

  describe('CRUD Operations with Tags', () => {
    it('should create task with tags', () => {
      const { result } = renderHook(() => useTasks(), { wrapper });

      act(() => {
        const task = result.current.createTask('Task 1', 'Description 1', 'medium');
        result.current.updateTask(task.id, { tags: ['work', 'urgent'] });
      });

      expect(result.current.tasks[0].tags).toEqual(['work', 'urgent']);
    });

    it('should update task tags', () => {
      const { result } = renderHook(() => useTasks(), { wrapper });

      let taskId: string;
      act(() => {
        const task = result.current.createTask('Task 1', 'Description 1', 'medium');
        taskId = task.id;
        result.current.updateTask(taskId, { tags: ['work'] });
      });

      expect(result.current.tasks[0].tags).toEqual(['work']);

      // Update tags
      act(() => {
        result.current.updateTask(taskId, { tags: ['work', 'urgent', 'personal'] });
      });

      expect(result.current.tasks[0].tags).toEqual(['work', 'urgent', 'personal']);
    });
  });
});
