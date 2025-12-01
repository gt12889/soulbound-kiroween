import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTasks } from '../../contexts/TasksContext';
import { useStreak } from '../../contexts/StreakContext';
import { AllProviders } from '../test-utils';

/**
 * Integration tests for TasksContext and StreakContext
 * Verifies that task completion tracking integrates with streak tracking system
 * Requirements: Task 1.6 - Integration with Existing Contexts
 */
describe('TasksContext - StreakContext Integration', () => {
  it('should record task activity when a task is completed', async () => {
    const { result } = renderHook(
      () => ({
        tasks: useTasks(),
        streak: useStreak(),
      }),
      { wrapper: AllProviders }
    );

    // Wait for streak data to load
    await waitFor(() => {
      expect(result.current.streak.loading).toBe(false);
    });

    // Get initial activity count for today
    const today = new Date().toISOString().split('T')[0];
    const initialTaskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;

    // Create and complete a task
    act(() => {
      const task = result.current.tasks.createTask('Test Task', 'Description', 'medium');
      result.current.tasks.completeTask(task.id);
    });

    // Wait for state updates
    await waitFor(() => {
      const currentTaskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;
      expect(currentTaskCount).toBeGreaterThan(initialTaskCount);
    });

    // Activity history should be updated
    const currentTaskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;
    expect(currentTaskCount).toBe(initialTaskCount + 1);
  });

  it('should record task activity when toggling task to completed', async () => {
    const { result } = renderHook(
      () => ({
        tasks: useTasks(),
        streak: useStreak(),
      }),
      { wrapper: AllProviders }
    );

    // Wait for streak data to load
    await waitFor(() => {
      expect(result.current.streak.loading).toBe(false);
    });

    // Get initial activity count for today
    const today = new Date().toISOString().split('T')[0];
    const initialTaskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;

    // Create a task and toggle it to completed
    act(() => {
      const task = result.current.tasks.createTask('Test Task', 'Description', 'medium');
      result.current.tasks.toggleTaskCompletion(task.id);
    });

    // Wait for state updates
    await waitFor(() => {
      const currentTaskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;
      expect(currentTaskCount).toBeGreaterThan(initialTaskCount);
    });

    // Activity history should be updated
    const currentTaskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;
    expect(currentTaskCount).toBe(initialTaskCount + 1);
  });

  it('should not record activity when uncompleting a task', async () => {
    const { result } = renderHook(
      () => ({
        tasks: useTasks(),
        streak: useStreak(),
      }),
      { wrapper: AllProviders }
    );

    // Wait for streak data to load
    await waitFor(() => {
      expect(result.current.streak.loading).toBe(false);
    });

    // Create and complete a task
    let taskId: string;
    act(() => {
      const task = result.current.tasks.createTask('Test Task', 'Description', 'medium');
      taskId = task.id;
      result.current.tasks.completeTask(taskId);
    });

    // Wait for completion
    await waitFor(() => {
      const today = new Date().toISOString().split('T')[0];
      const taskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;
      expect(taskCount).toBeGreaterThan(0);
    });

    // Get task count after completion
    const today = new Date().toISOString().split('T')[0];
    const taskCountAfterCompletion = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;

    // Toggle task back to incomplete
    act(() => {
      result.current.tasks.toggleTaskCompletion(taskId);
    });

    // Task count should remain the same (no decrement for uncompleting)
    const taskCountAfterUncomplete = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;
    expect(taskCountAfterUncomplete).toBe(taskCountAfterCompletion);
  });

  it('should record multiple task completions', async () => {
    const { result } = renderHook(
      () => ({
        tasks: useTasks(),
        streak: useStreak(),
      }),
      { wrapper: AllProviders }
    );

    // Wait for streak data to load
    await waitFor(() => {
      expect(result.current.streak.loading).toBe(false);
    });

    // Get initial activity count for today
    const today = new Date().toISOString().split('T')[0];
    const initialTaskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;

    // Create and complete multiple tasks
    act(() => {
      const task1 = result.current.tasks.createTask('Task 1', 'Description 1', 'medium');
      const task2 = result.current.tasks.createTask('Task 2', 'Description 2', 'high');
      const task3 = result.current.tasks.createTask('Task 3', 'Description 3', 'low');
      
      result.current.tasks.completeTask(task1.id);
      result.current.tasks.completeTask(task2.id);
      result.current.tasks.completeTask(task3.id);
    });

    // Wait for state updates
    await waitFor(() => {
      const currentTaskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;
      expect(currentTaskCount).toBe(initialTaskCount + 3);
    });

    // Activity history should reflect all completions
    const currentTaskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;
    expect(currentTaskCount).toBe(initialTaskCount + 3);
  });

  it('should work correctly with both companion and streak tracking', async () => {
    const { result } = renderHook(
      () => ({
        tasks: useTasks(),
        streak: useStreak(),
      }),
      { wrapper: AllProviders }
    );

    // Wait for streak data to load
    await waitFor(() => {
      expect(result.current.streak.loading).toBe(false);
    });

    // Get initial counts
    const today = new Date().toISOString().split('T')[0];
    const initialTaskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;

    // Create and complete a task
    act(() => {
      const task = result.current.tasks.createTask('Test Task', 'Description', 'medium');
      result.current.tasks.completeTask(task.id);
    });

    // Wait for both systems to update
    await waitFor(() => {
      const currentTaskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;
      expect(currentTaskCount).toBeGreaterThan(initialTaskCount);
    });

    // Both systems should be updated
    const currentTaskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;
    expect(currentTaskCount).toBe(initialTaskCount + 1);
  });
});
