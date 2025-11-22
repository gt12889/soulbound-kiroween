import { useState, useMemo } from 'react';
import { useTasks } from '../../contexts/TasksContext';
import { useNotes } from '../../contexts/NotesContext';
import styles from './GlobalSearchPage.module.css';

export function GlobalSearchPage() {
  const { tasks } = useTasks();
  const { notes } = useNotes();
  const [query, setQuery] = useState('');

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

  return (
    <div className={styles.searchContainer}>
      <h1 className={styles.title}>Global Search</h1>
      <p className={styles.subtitle}>Search across all your inscriptions and tasks...</p>
      
      <div className={styles.searchBar}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to search..."
          className={styles.searchInput}
        />
      </div>

      <div className={styles.resultsContainer}>
        {query.trim() && (
          <>
            <div className={styles.resultsSection}>
              <h2 className={styles.sectionTitle}>Notes ({searchResults.notes.length})</h2>
              {searchResults.notes.length > 0 ? (
                searchResults.notes.map(note => (
                  <div key={note.id} className={styles.resultItem}>
                    <h3>{note.title}</h3>
                    <p>{note.content.substring(0, 150)}...</p>
                  </div>
                ))
              ) : (
                <p>No notes found.</p>
              )}
            </div>
            
            <div className={styles.resultsSection}>
              <h2 className={styles.sectionTitle}>Tasks ({searchResults.tasks.length})</h2>
              {searchResults.tasks.length > 0 ? (
                searchResults.tasks.map(task => (
                  <div key={task.id} className={styles.resultItem}>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                  </div>
                ))
              ) : (
                <p>No tasks found.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
