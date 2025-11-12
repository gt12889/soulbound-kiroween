import React from 'react';
import { useNotes } from '../../contexts/NotesContext';
import { useAudio } from '../../hooks/useAudio';
import styles from './NotesList.module.css';

interface NotesListProps {
  onNoteSelect: (noteId: string) => void;
  selectedNoteId: string | null;
}

/**
 * NotesList component - Displays sidebar with all note titles
 * Requirements: 3.2, 8.4
 */
const NotesList: React.FC<NotesListProps> = ({ onNoteSelect, selectedNoteId }) => {
  const { filteredNotes, createNote, deleteNote } = useNotes();
  const { playUIClick, playUIHover } = useAudio();

  const handleCreateNote = () => {
    playUIClick();
    const newNote = createNote('Untitled Note', '');
    onNoteSelect(newNote.id);
  };

  const handleDeleteNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      playUIClick();
      deleteNote(noteId);
    }
  };

  const handleNoteClick = (noteId: string) => {
    playUIClick();
    onNoteSelect(noteId);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={styles.notesList}>
      <div className={styles.header}>
        <h3 className={styles.title}>Inscriptions</h3>
        <button className={styles.createButton} onClick={handleCreateNote} title="Create new note">
          <span className={styles.createIcon}>+</span>
        </button>
      </div>

      <div className={styles.notesContainer}>
        {filteredNotes.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No inscriptions found</p>
            <p className={styles.emptyHint}>Create your first note</p>
          </div>
        ) : (
          <ul className={styles.noteItems}>
            {filteredNotes.map((note) => (
              <li
                key={note.id}
                className={`${styles.noteItem} ${selectedNoteId === note.id ? styles.selected : ''}`}
                onClick={() => handleNoteClick(note.id)}
                onMouseEnter={playUIHover}
              >
                <div className={styles.noteItemContent}>
                  <h4 className={styles.noteItemTitle}>{note.title || 'Untitled'}</h4>
                  <p className={styles.noteItemDate}>{formatDate(note.createdAt)}</p>
                </div>
                <button
                  className={styles.deleteButton}
                  onClick={(e) => handleDeleteNote(e, note.id)}
                  onMouseEnter={playUIHover}
                  title="Delete note"
                  aria-label="Delete note"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotesList;
