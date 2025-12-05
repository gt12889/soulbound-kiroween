import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTasks } from '../../contexts/TasksContext';
import { useStreak } from '../../contexts/StreakContext';
import { AllProviders } from '../test-utils';

/**
 * Simple integration test to verify TasksContext calls recordActivity
 * Requirements: Task 1.6 - Integration with Existing Contexts
 */
describe('TasksContext - StreakContext Integration (Simple)', () => {
  it('should call recordActivity when completing a task', () => {
    // Spy on the recordActivity function
    const recordActivitySpy = vi.fn();
    
    // Mock the useStreak hook to return our spy
    vi.mock('../../contexts/StreakContext', async () => {
      const actual = await vi.importActual('../../contexts/StreakContext');
      return {
        ...actual,
        useStreak: () => ({
          recordActivity: recordActivitySpy,
          loading: false,
          streaks: null,
          checkStreaks: vi.fn(),
          useRecoveryToken: vi.fn(),
          isStreakAtRisk: vi.fn(),
          nextMilestone: vi.fn(),
          heatmapData: [],
          updateStreakGoals: vi.fn(),
          toggleNotifications: vi.fn(),
          streakGoals: {
            taskGoal: 1,
            focusGoal: 25,
            notificationsEnabled: true,
            notificationTime: '20:00',
          },
        }),
      };
    });

    const { result } = renderHook(() => useTasks(), { wrapper: AllProviders });

    // Create and complete a task
    act(() => {
      const task = result.current.createTask('Test Task', 'Description', 'medium');
      result.current.completeTask(task.id);
    });

    // Verify recordActivity was called with 'task'
    expect(recordActivitySpy).toHaveBeenCalledWith('task');
  });
});
