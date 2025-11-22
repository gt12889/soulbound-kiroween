import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTasks } from '../../contexts/TasksContext';
import { useCompanion } from '../../contexts/CompanionContext';
import { AllProviders } from '../test-utils';

/**
 * Simple test to debug the integration
 */
describe('Simple TasksContext - CompanionContext Integration Test', () => {
  it('should call trackTaskCompletion when a task is completed', async () => {
    const { result } = renderHook(
      () => ({
        tasks: useTasks(),
        companion: useCompanion(),
      }),
      { wrapper: AllProviders }
    );

    console.log('Initial state:', {
      experience: result.current.companion.experience,
      totalTasks: result.current.companion.stats.totalTasks,
    });

    // Create a task
    let taskId: string;
    act(() => {
      const task = result.current.tasks.createTask('Test Task', 'Description', 'medium');
      taskId = task.id;
      console.log('Created task:', task);
    });

    console.log('After create:', {
      tasks: result.current.tasks.tasks.length,
      experience: result.current.companion.experience,
    });

    // Complete the task
    act(() => {
      console.log('Completing task:', taskId);
      result.current.tasks.completeTask(taskId);
    });

    // Wait for state updates
    await waitFor(() => {
      console.log('After complete:', {
        experience: result.current.companion.experience,
        totalTasks: result.current.companion.stats.totalTasks,
        recentTasks: result.current.companion.currentContext.recentTasks.length,
      });
    });

    // Check if experience was awarded
    expect(result.current.companion.experience).toBeGreaterThan(0);
  });
});
