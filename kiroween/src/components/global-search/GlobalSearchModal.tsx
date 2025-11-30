import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../../contexts/TasksContext';
import { useNotes } from '../../contexts/NotesContext';
import styles from './GlobalSearchModal.module.css';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const { tasks } = useTasks();
  const { notes } = useNotes();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return { notes: [], tasks: [] };
    }
    const lowerQuery = query.toLowerCase();
    const filteredNotes = notes.filter(note =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery)
    );
    const filteredTasks = tasks.filter(task =>
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description.toLowerCase().includes(lowerQuery)
    );
    return { notes: filteredNotes, tasks: filteredTasks };
  }, [query, notes, tasks]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleNoteClick = () => {
    navigate('/necronomicon-notes');
    onClose();
  };

  const handleTaskClick = () => {
    navigate('/graveyard-dashboard');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>🔍 Search the Realm</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close search">
            ×
          </button>
        </div>

        <div className={styles.searchBar}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes and tasks..."
            className={styles.searchInput}
          />
        </div>

        <div className={styles.resultsContainer}>
          {query.trim() ? (
            <>
              <div className={styles.resultsSection}>
                <h3 className={styles.sectionTitle}>
                  📖 Notes ({searchResults.notes.length})
                </h3>
                {searchResults.notes.length > 0 ? (
                  <div className={styles.resultsList}>
                    {searchResults.notes.map(note => (
                      <div
                        key={note.id}
                        className={styles.resultItem}
                        onClick={handleNoteClick}
                      >
                        <h4>{note.title}</h4>
                        <p>{note.content.substring(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyMessage}>No notes found.</p>
                )}
              </div>

              <div className={styles.resultsSection}>
                <h3 className={styles.sectionTitle}>
                  ⚰️ Tasks ({searchResults.tasks.length})
                </h3>
                {searchResults.tasks.length > 0 ? (
                  <div className={styles.resultsList}>
                    {searchResults.tasks.map(task => (
                      <div
                        key={task.id}
                        className={styles.resultItem}
                        onClick={handleTaskClick}
                      >
                        <h4>{task.title}</h4>
                        {task.description && <p>{task.description}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyMessage}>No tasks found.</p>
                )}
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <p>Start typing to search across all your notes and tasks...</p>
              <p className={styles.hint}>Press <kbd>Esc</kbd> to close</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
