import React, { useEffect } from 'react';
import { useNotes } from '../../contexts/NotesContext';
import NotesList from './NotesList';
import NotesBook from './NotesBook';
import SearchBar from './SearchBar';
import styles from './NecronomiconNotes.module.css';

/**
 * NecronomiconNotes - Main component for the ancient book-styled note-taking module
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
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
