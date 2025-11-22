import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTasks } from '../../contexts/TasksContext';
import { useCompanion } from '../../contexts/CompanionContext';
import { AllProviders } from '../test-utils';

/**
 * Integration tests for TasksContext and CompanionContext
 * Verifies that task completion tracking integrates with companion experience system
 */
describe('TasksContext - CompanionContext Integration', () => {
  it('should award companion experience when a task is completed', () => {
    const { result } = renderHook(
      () => ({
        tasks: useTasks(),
        companion: useCompanion(),
      }),
      { wrapper: AllProviders }
    );

    // Get initial experience
    const initialExperience = result.current.companion.experience;

    // Create and complete a regular task
    act(() => {
      const task = result.current.tasks.createTask('Test Task', 'Description', 'medium');
      result.current.tasks.completeTask(task.id);
    });

    // Companion should have gained experience (10 XP for regular task)
    expect(result.current.companion.experience).toBeGreaterThan(initialExperience);
    expect(result.current.companion.experience).toBe(initialExperience + 10);
  });

  it('should award more experience for tombstone tasks', () => {
    const { result } = renderHook(
      () => ({
        tasks: useTasks(),
        companion: useCompanion(),
      }),
      { wrapper: AllProviders }
    );

    // Get initial experience
    const initialExperience = result.current.companion.experience;

    // Create and complete a high-priority task (treated as tombstone)
    act(() => {
      const task = result.current.tasks.createTask('Important Task', 'Description', 'high');
      result.current.tasks.completeTask(task.id);
    });

    // Companion should have gained more experience (20 XP for tombstone task)
    expect(result.current.companion.experience).toBe(initialExperience + 20);
  });

  it('should increment companion task stats when tasks are completed', () => {
    const { result } = renderHook(
      () => ({
        tasks: useTasks(),
        companion: useCompanion(),
      }),
      { wrapper: AllProviders }
    );

    // Get initial stats
    const initialTotalTasks = result.current.companion.stats.totalTasks;

    // Create and complete a task
    act(() => {
      const task = result.current.tasks.createTask('Test Task', 'Description', 'medium');
      result.current.tasks.completeTask(task.id);
    });

    // Companion stats should be updated
    expect(result.current.companion.stats.totalTasks).toBe(initialTotalTasks + 1);
  });

  it('should track task completion when toggling task status', () => {
    const { result } = renderHook(
      () => ({
        tasks: useTasks(),
        companion: useCompanion(),
      }),
      { wrapper: AllProviders }
    );

    // Get initial experience
    const initialExperience = result.current.companion.experience;

    // Create a task and toggle it to completed
    act(() => {
      const task = result.current.tasks.createTask('Test Task', 'Description', 'medium');
      result.current.tasks.toggleTaskCompletion(task.id);
    });

    // Companion should have gained experience
    expect(result.current.companion.experience).toBe(initialExperience + 10);
  });

  it('should not award experience when uncompleting a task', () => {
    const { result } = renderHook(
      () => ({
        tasks: useTasks(),
        companion: useCompanion(),
      }),
      { wrapper: AllProviders }
    );

    // Create and complete a task
    let taskId: string;
    act(() => {
      const task = result.current.tasks.createTask('Test Task', 'Description', 'medium');
      taskId = task.id;
      result.current.tasks.completeTask(taskId);
    });

    // Get experience after completion
    const experienceAfterCompletion = result.current.companion.experience;

    // Toggle task back to incomplete
    act(() => {
      result.current.tasks.toggleTaskCompletion(taskId);
    });

    // Experience should remain the same (no penalty for uncompleting)
    expect(result.current.companion.experience).toBe(experienceAfterCompletion);
  });

  it('should add completed task to companion recent tasks', () => {
    const { result } = renderHook(
      () => ({
        tasks: useTasks(),
        companion: useCompanion(),
      }),
      { wrapper: AllProviders }
    );

    // Get initial recent tasks count
    const initialRecentTasksCount = result.current.companion.currentContext.recentTasks.length;

    // Create and complete a task
    let taskId: string;
    act(() => {
      const task = result.current.tasks.createTask('Test Task', 'Description', 'medium');
      taskId = task.id;
      result.current.tasks.completeTask(taskId);
    });

    // Recent tasks should include the new task
    expect(result.current.companion.currentContext.recentTasks.length).toBe(initialRecentTasksCount + 1);
    expect(result.current.companion.currentContext.recentTasks[initialRecentTasksCount].id).toBe(taskId);
    expect(result.current.companion.currentContext.recentTasks[initialRecentTasksCount].type).toBe('regular');
  });

  it('should track tombstone tasks correctly in recent tasks', () => {
    const { result } = renderHook(
      () => ({
        tasks: useTasks(),
        companion: useCompanion(),
      }),
      { wrapper: AllProviders }
    );

    // Create and complete a high-priority task
    let taskId: string;
    act(() => {
      const task = result.current.tasks.createTask('Important Task', 'Description', 'high');
      taskId = task.id;
      result.current.tasks.completeTask(taskId);
    });

    // Recent tasks should mark it as tombstone
    const recentTask = result.current.companion.currentContext.recentTasks.find(t => t.id === taskId);
    expect(recentTask).toBeDefined();
    expect(recentTask?.type).toBe('tombstone');
  });
});
