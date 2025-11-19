import React from 'react';
import { useNotes } from '../../contexts/NotesContext';
import styles from './RecentNotesPanel.module.css'; // Will create this CSS module

/**
 * RecentNotesPanel component - Displays a list of recently created or updated notes.
 */
export const RecentNotesPanel: React.FC = () => {
  const { notes } = useNotes();
  const recentNotes = notes.slice(0, 5); // Display top 5 recent notes

  return (
    <div className={styles.recentNotesContainer}>
      {recentNotes.length > 0 ? (
        <ul className={styles.recentNotesList}>
          {recentNotes.map(note => (
            <li key={note.id} className={styles.recentNoteItem}>
              <h4 className={styles.recentNoteTitle}>{note.title}</h4>
              <p className={styles.recentNoteTimestamp}>{new Date(note.updatedAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.emptyStateText}>No recent notes yet. Create one!</p>
      )}
    </div>
  );
};
