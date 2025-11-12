import React, { useEffect } from 'react';
import { useNotes } from '../../contexts/NotesContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { DEFAULT_SHORTCUTS } from '../../utils/keyboardShortcuts';
import NotesList from './NotesList';
import NotesBook from './NotesBook';
import SearchBar from './SearchBar';
import styles from './NecronomiconNotes.module.css';

/**
 * NecronomiconNotes - Main component for the ancient book-styled note-taking module
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 9.2, 9.3
 */
const NecronomiconNotes: React.FC = () => {
  const { notes, currentNoteId, setCurrentNoteId, createNote } = useNotes();

  // Create initial note if none exist
  useEffect(() => {
    if (notes.length === 0) {
      const firstNote = createNote('Welcome to the Necronomicon', 'Begin your dark inscriptions here...');
      setCurrentNoteId(firstNote.id);
    } else if (!currentNoteId && notes.length > 0) {
      setCurrentNoteId(notes[0].id);
    }
  }, [notes, currentNoteId, setCurrentNoteId, createNote]);

  // Register keyboard shortcuts for notes using the hook
  // Requirements: 9.2, 9.3
  const noteShortcuts = DEFAULT_SHORTCUTS.filter(
    s => s.action === 'create-note' || s.action === 'search'
  );

  useKeyboardShortcuts(noteShortcuts, {
    'create-note': () => {
      const newNote = createNote('Untitled Note', '');
      setCurrentNoteId(newNote.id);
    },
    'search': () => {
      // Focus search bar if available
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    },
  });

  const handleNoteSelect = (noteId: string) => {
    setCurrentNoteId(noteId);
  };

  return (
    <div className={styles.necronomiconNotes}>
      <aside className={styles.sidebar}>
        <SearchBar />
        <NotesList onNoteSelect={handleNoteSelect} selectedNoteId={currentNoteId} />
      </aside>
      <main className={styles.bookArea}>
        <NotesBook />
      </main>
    </div>
  );
};

export default NecronomiconNotes;
