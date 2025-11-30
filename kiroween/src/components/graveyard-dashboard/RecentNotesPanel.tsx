import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../../contexts/NotesContext';
import styles from './RecentNotesPanel.module.css';

/**
 * RecentNotesPanel component - Compact collapsible widget showing recent notes
 */
export const RecentNotesPanel: React.FC = () => {
  const { notes } = useNotes();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const recentNotes = notes
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const handleNoteClick = () => {
    navigate('/necronomicon-notes');
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className={`${styles.widget} ${isExpanded ? styles.expanded : ''}`}>
      <button 
        className={styles.widgetHeader}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Collapse recent notes' : 'Expand recent notes'}
      >
        <span className={styles.widgetIcon}>📜</span>
        <span className={styles.widgetTitle}>Recent Notes</span>
        <span className={styles.widgetCount}>{notes.length}</span>
        <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className={styles.widgetContent}>
          {recentNotes.length > 0 ? (
            <ul className={styles.notesList}>
              {recentNotes.map(note => (
                <li 
                  key={note.id} 
                  className={styles.noteItem}
                  onClick={handleNoteClick}
                >
                  <div className={styles.noteTitle}>{note.title}</div>
                  <div className={styles.noteTime}>{formatTimeAgo(note.updatedAt)}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.emptyState}>
              <p>No notes yet</p>
              <button className={styles.createButton} onClick={handleNoteClick}>
                Create Note
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
