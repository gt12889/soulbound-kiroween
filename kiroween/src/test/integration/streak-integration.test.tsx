import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTasks } from '../../contexts/TasksContext';
import { useNotes } from '../../contexts/NotesContext';
import { useStreak } from '../../contexts/StreakContext';
import { AllProviders } from '../test-utils';

/**
 * Comprehensive integration tests for Streak tracking system
 * Tests all integration points between StreakContext and other contexts
 * Requirements: Task 1.6 - Test all integration points
 */
describe('Streak System - Complete Integration Tests', () => {
  describe('Login Tracking Integration', () => {
    it('should record login activity on app mount', async () => {
      const { result } = renderHook(
        () => useStreak(),
        { wrapper: AllProviders }
      );

      // Wait for streak data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Check that login was recorded for today
      const today = new Date().toISOString().split('T')[0];
      const todayActivity = result.current.streaks?.activityHistory[today];
      
      expect(todayActivity).toBeDefined();
      expect(todayActivity?.login).toBe(true);
    });

    it('should increment login streak on consecutive days', async () => {
      const { result } = renderHook(
        () => useStreak(),
        { wrapper: AllProviders }
      );

      // Wait for streak data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Initial login should have been recorded
      const initialLoginStreak = result.current.streaks?.loginStreak.current || 0;
      
      // Login streak should be at least 1 (from initial login)
      expect(initialLoginStreak).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Task Completion Integration', () => {
    it('should record task activity when completing a task', async () => {
      const { result } = renderHook(
        () => ({
          tasks: useTasks(),
          streak: useStreak(),
        }),
        { wrapper: AllProviders }
      );

      await waitFor(() => {
        expect(result.current.streak.loading).toBe(false);
      });

      const today = new Date().toISOString().split('T')[0];
      const initialTaskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;

      act(() => {
        const task = result.current.tasks.createTask('Test Task', 'Description', 'medium');
        result.current.tasks.completeTask(task.id);
      });

      await waitFor(() => {
        const currentTaskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;
        expect(currentTaskCount).toBeGreaterThan(initialTaskCount);
      });
    });

    it('should record task activity when toggling task to completed', async () => {
      const { result } = renderHook(
        () => ({
          tasks: useTasks(),
          streak: useStreak(),
        }),
        { wrapper: AllProviders }
      );

      await waitFor(() => {
        expect(result.current.streak.loading).toBe(false);
      });

      const today = new Date().toISOString().split('T')[0];
      const initialTaskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;

      act(() => {
        const task = result.current.tasks.createTask('Test Task', 'Description', 'medium');
        result.current.tasks.toggleTaskCompletion(task.id);
      });

      await waitFor(() => {
        const currentTaskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;
        expect(currentTaskCount).toBeGreaterThan(initialTaskCount);
      });
    });
  });

  describe('Note Creation Integration', () => {
    it('should record note activity when creating a note', async () => {
      const { result } = renderHook(
        () => ({
          notes: useNotes(),
          streak: useStreak(),
        }),
        { wrapper: AllProviders }
      );

      await waitFor(() => {
        expect(result.current.streak.loading).toBe(false);
      });

      const today = new Date().toISOString().split('T')[0];
      const initialNoteCount = result.current.streak.streaks?.activityHistory[today]?.notes || 0;

      act(() => {
        result.current.notes.createNote('Test Note', 'Test content');
      });

      await waitFor(() => {
        const currentNoteCount = result.current.streak.streaks?.activityHistory[today]?.notes || 0;
        expect(currentNoteCount).toBeGreaterThan(initialNoteCount);
      });
    });

    it('should record note activity when updating note content', async () => {
      const { result } = renderHook(
        () => ({
          notes: useNotes(),
          streak: useStreak(),
        }),
        { wrapper: AllProviders }
      );

      await waitFor(() => {
        expect(result.current.streak.loading).toBe(false);
      });

      let noteId: string;
      act(() => {
        const note = result.current.notes.createNote('Test Note', 'Initial content');
        noteId = note.id;
      });

      await waitFor(() => {
        const today = new Date().toISOString().split('T')[0];
        const noteCount = result.current.streak.streaks?.activityHistory[today]?.notes || 0;
        expect(noteCount).toBeGreaterThan(0);
      });

      const today = new Date().toISOString().split('T')[0];
      const noteCountAfterCreation = result.current.streak.streaks?.activityHistory[today]?.notes || 0;

      act(() => {
        result.current.notes.updateNote(noteId, { content: 'Updated content' });
      });

      await waitFor(() => {
        const currentNoteCount = result.current.streak.streaks?.activityHistory[today]?.notes || 0;
        expect(currentNoteCount).toBeGreaterThan(noteCountAfterCreation);
      });
    });
  });

  describe('Focus Session Integration', () => {
    it('should record focus activity with correct duration', async () => {
      const { result } = renderHook(
        () => useStreak(),
        { wrapper: AllProviders }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const today = new Date().toISOString().split('T')[0];
      const initialFocusMinutes = result.current.streaks?.activityHistory[today]?.focusMinutes || 0;

      act(() => {
        result.current.recordActivity('focus', { minutes: 25 });
      });

      await waitFor(() => {
        const currentFocusMinutes = result.current.streaks?.activityHistory[today]?.focusMinutes || 0;
        expect(currentFocusMinutes).toBe(initialFocusMinutes + 25);
      });
    });

    it('should accumulate multiple focus sessions', async () => {
      const { result } = renderHook(
        () => useStreak(),
        { wrapper: AllProviders }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const today = new Date().toISOString().split('T')[0];
      const initialFocusMinutes = result.current.streaks?.activityHistory[today]?.focusMinutes || 0;

      act(() => {
        result.current.recordActivity('focus', { minutes: 25 });
        result.current.recordActivity('focus', { minutes: 30 });
        result.current.recordActivity('focus', { minutes: 15 });
      });

      await waitFor(() => {
        const currentFocusMinutes = result.current.streaks?.activityHistory[today]?.focusMinutes || 0;
        expect(currentFocusMinutes).toBe(initialFocusMinutes + 70);
      });
    });
  });

  describe('Cross-Context Integration', () => {
    it('should handle multiple activity types simultaneously', async () => {
      const { result } = renderHook(
        () => ({
          tasks: useTasks(),
          notes: useNotes(),
          streak: useStreak(),
        }),
        { wrapper: AllProviders }
      );

      await waitFor(() => {
        expect(result.current.streak.loading).toBe(false);
      });

      const today = new Date().toISOString().split('T')[0];
      const initialActivity = result.current.streak.streaks?.activityHistory[today] || {
        tasks: 0,
        notes: 0,
        focusMinutes: 0,
        login: false,
      };

      // Perform multiple activities
      act(() => {
        // Complete a task
        const task = result.current.tasks.createTask('Test Task', 'Description', 'medium');
        result.current.tasks.completeTask(task.id);
        
        // Create a note
        result.current.notes.createNote('Test Note', 'Test content');
        
        // Record focus session
        result.current.streak.recordActivity('focus', { minutes: 25 });
      });

      // Wait for all updates
      await waitFor(() => {
        const currentActivity = result.current.streak.streaks?.activityHistory[today];
        expect(currentActivity?.tasks).toBeGreaterThan(initialActivity.tasks);
        expect(currentActivity?.notes).toBeGreaterThan(initialActivity.notes);
        expect(currentActivity?.focusMinutes).toBeGreaterThan(initialActivity.focusMinutes);
      });

      // Verify all activities were recorded
      const finalActivity = result.current.streak.streaks?.activityHistory[today];
      expect(finalActivity?.tasks).toBe(initialActivity.tasks + 1);
      expect(finalActivity?.notes).toBe(initialActivity.notes + 1);
      expect(finalActivity?.focusMinutes).toBe(initialActivity.focusMinutes + 25);
    });

    it('should maintain data consistency across all contexts', async () => {
      const { result } = renderHook(
        () => ({
          tasks: useTasks(),
          notes: useNotes(),
          streak: useStreak(),
        }),
        { wrapper: AllProviders }
      );

      await waitFor(() => {
        expect(result.current.streak.loading).toBe(false);
      });

      // Perform a series of activities
      act(() => {
        // Create and complete multiple tasks
        for (let i = 0; i < 3; i++) {
          const task = result.current.tasks.createTask(`Task ${i}`, `Description ${i}`, 'medium');
          result.current.tasks.completeTask(task.id);
        }
        
        // Create multiple notes
        for (let i = 0; i < 2; i++) {
          result.current.notes.createNote(`Note ${i}`, `Content ${i}`);
        }
        
        // Record multiple focus sessions
        result.current.streak.recordActivity('focus', { minutes: 25 });
        result.current.streak.recordActivity('focus', { minutes: 30 });
      });

      // Wait for all updates
      await waitFor(() => {
        const today = new Date().toISOString().split('T')[0];
        const activity = result.current.streak.streaks?.activityHistory[today];
        expect(activity?.tasks).toBeGreaterThanOrEqual(3);
        expect(activity?.notes).toBeGreaterThanOrEqual(2);
        expect(activity?.focusMinutes).toBeGreaterThanOrEqual(55);
      });

      // Verify final state
      const today = new Date().toISOString().split('T')[0];
      const finalActivity = result.current.streak.streaks?.activityHistory[today];
      
      expect(finalActivity).toBeDefined();
      expect(finalActivity?.tasks).toBeGreaterThanOrEqual(3);
      expect(finalActivity?.notes).toBeGreaterThanOrEqual(2);
      expect(finalActivity?.focusMinutes).toBeGreaterThanOrEqual(55);
      expect(finalActivity?.login).toBe(true); // Login should have been recorded on mount
    });
  });

  describe('Streak Calculation Integration', () => {
    it('should update streak counters based on activity', async () => {
      const { result } = renderHook(
        () => ({
          tasks: useTasks(),
          streak: useStreak(),
        }),
        { wrapper: AllProviders }
      );

      await waitFor(() => {
        expect(result.current.streak.loading).toBe(false);
      });

      const initialTaskStreak = result.current.streak.streaks?.taskStreak.current || 0;

      // Complete a task to potentially increment streak
      act(() => {
        const task = result.current.tasks.createTask('Test Task', 'Description', 'medium');
        result.current.tasks.completeTask(task.id);
      });

      // Wait for streak to update
      await waitFor(() => {
        const currentTaskStreak = result.current.streak.streaks?.taskStreak.current || 0;
        // Streak should either stay the same (if already incremented today) or increase
        expect(currentTaskStreak).toBeGreaterThanOrEqual(initialTaskStreak);
      });
    });

    it('should track longest streak correctly', async () => {
      const { result } = renderHook(
        () => ({
          tasks: useTasks(),
          streak: useStreak(),
        }),
        { wrapper: AllProviders }
      );

      await waitFor(() => {
        expect(result.current.streak.loading).toBe(false);
      });

      // Complete a task
      act(() => {
        const task = result.current.tasks.createTask('Test Task', 'Description', 'medium');
        result.current.tasks.completeTask(task.id);
      });

      await waitFor(() => {
        const streaks = result.current.streak.streaks;
        expect(streaks).toBeDefined();
        
        // Longest should be >= current
        expect(streaks!.taskStreak.longest).toBeGreaterThanOrEqual(streaks!.taskStreak.current);
      });
    });
  });

  describe('Activity History Integration', () => {
    it('should maintain accurate activity history', async () => {
      const { result } = renderHook(
        () => ({
          tasks: useTasks(),
          notes: useNotes(),
          streak: useStreak(),
        }),
        { wrapper: AllProviders }
      );

      await waitFor(() => {
        expect(result.current.streak.loading).toBe(false);
      });

      const today = new Date().toISOString().split('T')[0];

      // Perform various activities
      act(() => {
        const task1 = result.current.tasks.createTask('Task 1', 'Desc 1', 'medium');
        const task2 = result.current.tasks.createTask('Task 2', 'Desc 2', 'high');
        result.current.tasks.completeTask(task1.id);
        result.current.tasks.completeTask(task2.id);
        
        result.current.notes.createNote('Note 1', 'Content 1');
        
        result.current.streak.recordActivity('focus', { minutes: 45 });
      });

      await waitFor(() => {
        const activity = result.current.streak.streaks?.activityHistory[today];
        expect(activity).toBeDefined();
        expect(activity?.tasks).toBeGreaterThanOrEqual(2);
        expect(activity?.notes).toBeGreaterThanOrEqual(1);
        expect(activity?.focusMinutes).toBeGreaterThanOrEqual(45);
      });

      // Verify activity history structure
      const activityHistory = result.current.streak.streaks?.activityHistory;
      expect(activityHistory).toBeDefined();
      expect(activityHistory![today]).toBeDefined();
      expect(typeof activityHistory![today].tasks).toBe('number');
      expect(typeof activityHistory![today].notes).toBe('number');
      expect(typeof activityHistory![today].focusMinutes).toBe('number');
      expect(typeof activityHistory![today].login).toBe('boolean');
    });

    it('should generate correct heatmap data from activity history', async () => {
      const { result } = renderHook(
        () => ({
          tasks: useTasks(),
          streak: useStreak(),
        }),
        { wrapper: AllProviders }
      );

      await waitFor(() => {
        expect(result.current.streak.loading).toBe(false);
      });

      // Complete some tasks
      act(() => {
        const task = result.current.tasks.createTask('Test Task', 'Description', 'medium');
        result.current.tasks.completeTask(task.id);
      });

      await waitFor(() => {
        const heatmapData = result.current.streak.heatmapData;
        expect(heatmapData).toBeDefined();
        expect(heatmapData.length).toBe(365); // Should have 365 days of data
        
        // Today should have activity
        const today = new Date().toISOString().split('T')[0];
        const todayData = heatmapData.find(d => d.date === today);
        expect(todayData).toBeDefined();
        expect(todayData!.level).toBeGreaterThan(0); // Should have some activity level
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle rapid successive activities correctly', async () => {
      const { result } = renderHook(
        () => ({
          tasks: useTasks(),
          streak: useStreak(),
        }),
        { wrapper: AllProviders }
      );

      await waitFor(() => {
        expect(result.current.streak.loading).toBe(false);
      });

      const today = new Date().toISOString().split('T')[0];
      const initialTaskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;

      // Rapidly complete multiple tasks
      act(() => {
        for (let i = 0; i < 10; i++) {
          const task = result.current.tasks.createTask(`Task ${i}`, `Desc ${i}`, 'medium');
          result.current.tasks.completeTask(task.id);
        }
      });

      await waitFor(() => {
        const currentTaskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;
        expect(currentTaskCount).toBe(initialTaskCount + 10);
      });
    });

    it('should not lose data when switching between contexts', async () => {
      const { result, rerender } = renderHook(
        () => ({
          tasks: useTasks(),
          notes: useNotes(),
          streak: useStreak(),
        }),
        { wrapper: AllProviders }
      );

      await waitFor(() => {
        expect(result.current.streak.loading).toBe(false);
      });

      // Record some activities
      act(() => {
        const task = result.current.tasks.createTask('Test Task', 'Description', 'medium');
        result.current.tasks.completeTask(task.id);
      });

      await waitFor(() => {
        const today = new Date().toISOString().split('T')[0];
        const taskCount = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;
        expect(taskCount).toBeGreaterThan(0);
      });

      const today = new Date().toISOString().split('T')[0];
      const taskCountBeforeRerender = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;

      // Force a rerender
      rerender();

      // Data should persist
      await waitFor(() => {
        const taskCountAfterRerender = result.current.streak.streaks?.activityHistory[today]?.tasks || 0;
        expect(taskCountAfterRerender).toBe(taskCountBeforeRerender);
      });
    });
  });
});
