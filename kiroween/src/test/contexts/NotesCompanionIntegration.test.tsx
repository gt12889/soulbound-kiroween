import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { NotesProvider, useNotes } from '../../contexts/NotesContext';
import { CompanionProvider, useCompanion } from '../../contexts/CompanionContext';
import { ToastProvider } from '../../contexts/ToastContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AppProvider } from '../../contexts/AppContext';
import type { ReactNode } from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => Math.random().toString(36).substring(2, 15),
  },
});

// Wrapper component with all required providers
function AllProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppProvider>
          <ToastProvider>
            <CompanionProvider>
              <NotesProvider>{children}</NotesProvider>
            </CompanionProvider>
          </ToastProvider>
        </AppProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

describe('NotesContext - Companion Integration', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should start note-taking activity when creating a note', async () => {
    const { result } = renderHook(
      () => ({
        notes: useNotes(),
        companion: useCompanion(),
      }),
      { wrapper: AllProviders }
    );

    // Initially should be idle
    expect(result.current.companion.currentContext.currentActivity).toBe('idle');

    // Create a note
    act(() => {
      result.current.notes.createNote('Test Note', 'Test content');
    });

    // Should now be in note-taking activity
    await waitFor(() => {
      expect(result.current.companion.currentContext.currentActivity).toBe('note-taking');
    });
  });

  it('should track note activity when updating note content', async () => {
    const { result } = renderHook(
      () => ({
        notes: useNotes(),
        companion: useCompanion(),
      }),
      { wrapper: AllProviders }
    );

    // Create a note
    let noteId: string;
    act(() => {
      const note = result.current.notes.createNote('Test Note', 'Short');
      noteId = note.id;
    });

    const initialExperience = result.current.companion.experience;

    // Update note with longer content (>100 chars to trigger XP)
    act(() => {
      result.current.notes.updateNote(noteId, {
        content: 'This is a longer note with more than one hundred characters to test the companion tracking functionality.',
      });
    });

    // Should have gained experience
    await waitFor(() => {
      expect(result.current.companion.experience).toBeGreaterThan(initialExperience);
    });
  });

  it('should award XP for notes longer than 100 characters', async () => {
    const { result } = renderHook(
      () => ({
        notes: useNotes(),
        companion: useCompanion(),
      }),
      { wrapper: AllProviders }
    );

    // Create a note
    let noteId: string;
    act(() => {
      const note = result.current.notes.createNote('Test Note', '');
      noteId = note.id;
    });

    const initialExperience = result.current.companion.experience;

    // Update with short content (should not award XP)
    act(() => {
      result.current.notes.updateNote(noteId, {
        content: 'Short',
      });
    });

    // Experience should not change
    expect(result.current.companion.experience).toBe(initialExperience);

    // Update with long content (should award XP)
    act(() => {
      result.current.notes.updateNote(noteId, {
        content: 'This is a much longer note with more than one hundred characters to test the companion tracking functionality and XP rewards.',
      });
    });

    // Should have gained experience
    await waitFor(() => {
      expect(result.current.companion.experience).toBeGreaterThan(initialExperience);
    });
  });

  it('should end note-taking activity when closing a note', async () => {
    const { result } = renderHook(
      () => ({
        notes: useNotes(),
        companion: useCompanion(),
      }),
      { wrapper: AllProviders }
    );

    // Create and open a note
    act(() => {
      const note = result.current.notes.createNote('Test Note', 'Test content');
      result.current.notes.setCurrentNoteId(note.id);
    });

    // Should be in note-taking activity
    await waitFor(() => {
      expect(result.current.companion.currentContext.currentActivity).toBe('note-taking');
    });

    // Close the note
    act(() => {
      result.current.notes.setCurrentNoteId(null);
    });

    // Should return to idle
    await waitFor(() => {
      expect(result.current.companion.currentContext.currentActivity).toBe('idle');
    });
  });

  it('should track note-taking when switching between notes', async () => {
    const { result } = renderHook(
      () => ({
        notes: useNotes(),
        companion: useCompanion(),
      }),
      { wrapper: AllProviders }
    );

    // Create two notes
    let note1Id: string;
    let note2Id: string;
    act(() => {
      const note1 = result.current.notes.createNote('Note 1', 'Content 1');
      const note2 = result.current.notes.createNote('Note 2', 'Content 2');
      note1Id = note1.id;
      note2Id = note2.id;
    });

    // Open first note
    act(() => {
      result.current.notes.setCurrentNoteId(note1Id);
    });

    await waitFor(() => {
      expect(result.current.companion.currentContext.currentActivity).toBe('note-taking');
    });

    // Switch to second note
    act(() => {
      result.current.notes.setCurrentNoteId(note2Id);
    });

    // Should still be in note-taking activity
    await waitFor(() => {
      expect(result.current.companion.currentContext.currentActivity).toBe('note-taking');
    });

    // Close all notes
    act(() => {
      result.current.notes.setCurrentNoteId(null);
    });

    // Should return to idle
    await waitFor(() => {
      expect(result.current.companion.currentContext.currentActivity).toBe('idle');
    });
  });

  it('should not award XP when updating note title only', async () => {
    const { result } = renderHook(
      () => ({
        notes: useNotes(),
        companion: useCompanion(),
      }),
      { wrapper: AllProviders }
    );

    // Create a note
    let noteId: string;
    act(() => {
      const note = result.current.notes.createNote('Test Note', 'Some content');
      noteId = note.id;
    });

    const initialExperience = result.current.companion.experience;

    // Update only the title
    act(() => {
      result.current.notes.updateNote(noteId, {
        title: 'Updated Title',
      });
    });

    // Experience should not change
    expect(result.current.companion.experience).toBe(initialExperience);
  });

  it('should handle deleting a note while it is open', async () => {
    const { result } = renderHook(
      () => ({
        notes: useNotes(),
        companion: useCompanion(),
      }),
      { wrapper: AllProviders }
    );

    // Create and open a note
    let noteId: string;
    act(() => {
      const note = result.current.notes.createNote('Test Note', 'Test content');
      noteId = note.id;
      result.current.notes.setCurrentNoteId(note.id);
    });

    // Should be in note-taking activity
    await waitFor(() => {
      expect(result.current.companion.currentContext.currentActivity).toBe('note-taking');
    });

    // Delete the note
    act(() => {
      result.current.notes.deleteNote(noteId);
    });

    // Should return to idle and current note should be null
    await waitFor(() => {
      expect(result.current.companion.currentContext.currentActivity).toBe('idle');
      expect(result.current.notes.currentNoteId).toBeNull();
    });
  });
});
