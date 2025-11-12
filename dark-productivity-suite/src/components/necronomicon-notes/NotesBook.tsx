import React, { useState, useEffect } from 'react';
import { useNotes } from '../../contexts/NotesContext';
import { useAudio } from '../../hooks/useAudio';
import NotePage from './NotePage';
import styles from './NotesBook.module.css';

/**
 * NotesBook component - Book-like container with page-turn animations
 * Requirements: 3.2, 3.5
 */
const NotesBook: React.FC = () => {
  const { currentNoteId } = useNotes();
  const { playPageTurn } = useAudio();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedNoteId, setDisplayedNoteId] = useState<string | null>(currentNoteId);

  useEffect(() => {
    if (currentNoteId !== displayedNoteId) {
      // Start page turn animation
      setIsTransitioning(true);
      playPageTurn();

      // Wait for animation to complete (1 second midpoint)
      const timer = setTimeout(() => {
        setDisplayedNoteId(currentNoteId);
        setIsTransitioning(false);
      }, 500); // Half of the animation duration

      return () => clearTimeout(timer);
    }
  }, [currentNoteId, displayedNoteId, playPageTurn]);

  return (
    <div className={styles.notesBook}>
      <div className={`${styles.bookContainer} ${isTransitioning ? styles.turning : ''}`}>
        {/* Left page (for visual effect) */}
        <div className={styles.leftPage}>
          <div className={styles.pageContent}>
            {displayedNoteId && <NotePage noteId={displayedNoteId} />}
          </div>
        </div>

        {/* Right page (turning page) */}
        <div className={styles.rightPage}>
          <div className={styles.pageContent}>
            {currentNoteId && <NotePage noteId={currentNoteId} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesBook;
