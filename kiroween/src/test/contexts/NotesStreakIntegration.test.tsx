import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotes } from '../../contexts/NotesContext';
import { useStreak } from '../../contexts/StreakContext';
import { AllProviders } from '../test-utils';

/**
 * Integration tests for NotesContext and StreakContext
 * Verifies that note creation/editing tracking integrates with streak tracking system
 * Requirements: Task 1.6 - Integration with Existing Contexts
 */
describe('NotesContext - StreakContext Integration', () => {
  it('should record note activity when a note is created', async () => {
    const { result } = renderHook(
      () => ({
        notes: useNotes(),
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
    const initialNoteCount = result.current.streak.streaks?.activityHistory[today]?.notes || 0;

    // Create a note
    act(() => {
      result.current.notes.createNote('Test Note', 'Test content');
    });

    // Wait for state updates
    await waitFor(() => {
      const currentNoteCount = result.current.streak.streaks?.activityHistory[today]?.notes || 0;
      expect(currentNoteCount).toBeGreaterThan(initialNoteCount);
    });

    // Activity history should be updated
    const currentNoteCount = result.current.streak.streaks?.activityHistory[today]?.notes || 0;
    expect(currentNoteCount).toBe(initialNoteCount + 1);
  });

  it('should record note activity when note content is updated', async () => {
    const { result } = renderHook(
      () => ({
        notes: useNotes(),
        streak: useStreak(),
      }),
      { wrapper: AllProviders }
    );

    // Wait for streak data to load
    await waitFor(() => {
      expect(result.current.streak.loading).toBe(false);
    });

    // Create a note first
    let noteId: string;
    act(() => {
      const note = result.current.notes.createNote('Test Note', 'Initial content');
      noteId = note.id;
    });

    // Wait for creation to be recorded
    await waitFor(() => {
      const today = new Date().toISOString().split('T')[0];
      const noteCount = result.current.streak.streaks?.activityHistory[today]?.notes || 0;
      expect(noteCount).toBeGreaterThan(0);
    });

    // Get note count after creation
    const today = new Date().toISOString().split('T')[0];
    const noteCountAfterCreation = result.current.streak.streaks?.activityHistory[today]?.notes || 0;

    // Update note content
    act(() => {
      result.current.notes.updateNote(noteId, { content: 'Updated content' });
    });

    // Wait for update to be recorded
    await waitFor(() => {
      const currentNoteCount = result.current.streak.streaks?.activityHistory[today]?.notes || 0;
      expect(currentNoteCount).toBeGreaterThan(noteCountAfterCreation);
    });

    // Activity history should be updated
    const currentNoteCount = result.current.streak.streaks?.activityHistory[today]?.notes || 0;
    expect(currentNoteCount).toBe(noteCountAfterCreation + 1);
  });

  it('should not record activity when updating note title only', async () => {
    const { result } = renderHook(
      () => ({
        notes: useNotes(),
        streak: useStreak(),
      }),
      { wrapper: AllProviders }
    );

    // Wait for streak data to load
    await waitFor(() => {
      expect(result.current.streak.loading).toBe(false);
    });

    // Create a note first
    let noteId: string;
    act(() => {
      const note = result.current.notes.createNote('Test Note', 'Initial content');
      noteId = note.id;
    });

    // Wait for creation to be recorded
    await waitFor(() => {
      const today = new Date().toISOString().split('T')[0];
      const noteCount = result.current.streak.streaks?.activityHistory[today]?.notes || 0;
      expect(noteCount).toBeGreaterThan(0);
    });

    // Get note count after creation
    const today = new Date().toISOString().split('T')[0];
    const noteCountAfterCreation = result.current.streak.streaks?.activityHistory[today]?.notes || 0;

    // Update note title only (not content)
    act(() => {
      result.current.notes.updateNote(noteId, { title: 'Updated Title' });
    });

    // Note count should remain the same (no activity recorded for title-only updates)
    const noteCountAfterTitleUpdate = result.current.streak.streaks?.activityHistory[today]?.notes || 0;
    expect(noteCountAfterTitleUpdate).toBe(noteCountAfterCreation);
  });

  it('should record multiple note creations', async () => {
    const { result } = renderHook(
      () => ({
        notes: useNotes(),
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
    const initialNoteCount = result.current.streak.streaks?.activityHistory[today]?.notes || 0;

    // Create multiple notes
    act(() => {
      result.current.notes.createNote('Note 1', 'Content 1');
      result.current.notes.createNote('Note 2', 'Content 2');
      result.current.notes.createNote('Note 3', 'Content 3');
    });

    // Wait for state updates
    await waitFor(() => {
      const currentNoteCount = result.current.streak.streaks?.activityHistory[today]?.notes || 0;
      expect(currentNoteCount).toBe(initialNoteCount + 3);
    });

    // Activity history should reflect all creations
    const currentNoteCount = result.current.streak.streaks?.activityHistory[today]?.notes || 0;
    expect(currentNoteCount).toBe(initialNoteCount + 3);
  });

  it('should work correctly with both companion and streak tracking', async () => {
    const { result } = renderHook(
      () => ({
        notes: useNotes(),
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
    const initialNoteCount = result.current.streak.streaks?.activityHistory[today]?.notes || 0;

    // Create a note
    act(() => {
      result.current.notes.createNote('Test Note', 'Test content');
    });

    // Wait for both systems to update
    await waitFor(() => {
      const currentNoteCount = result.current.streak.streaks?.activityHistory[today]?.notes || 0;
      expect(currentNoteCount).toBeGreaterThan(initialNoteCount);
    });

    // Both systems should be updated
    const currentNoteCount = result.current.streak.streaks?.activityHistory[today]?.notes || 0;
    expect(currentNoteCount).toBe(initialNoteCount + 1);
  });
});
