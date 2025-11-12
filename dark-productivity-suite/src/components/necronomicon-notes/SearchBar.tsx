import React, { useState, useEffect } from 'react';
import { useNotes } from '../../contexts/NotesContext';
import styles from './SearchBar.module.css';

/**
 * SearchBar component - Gothic-styled search with glow effects
 * Requirements: 3.6
 */
const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useNotes();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounce search query updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
  };

  return (
    <div className={styles.searchBar}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search inscriptions..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          aria-label="Search notes"
        />
        {localQuery && (
          <button
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear search"
          >
            ×
          </button>
        )}
        <div className={styles.searchIcon}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M12.5 12.5L17 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
      {searchQuery && (
        <p className={styles.searchInfo}>
          Searching for: <span className={styles.searchTerm}>{searchQuery}</span>
        </p>
      )}
    </div>
  );
};

export default SearchBar;
