import React, { useEffect, useState } from 'react';
import { useNotes } from '../../contexts/NotesContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { DEFAULT_SHORTCUTS } from '../../utils/keyboardShortcuts';
import NotesList from './NotesList';
import NotesBook from './NotesBook';
import SearchBar from './SearchBar';
import { TagFilter } from '../common/TagFilter';
import { TagCloud } from '../common/TagCloud';
import styles from './NecronomiconNotes.module.css';

/**
 * NecronomiconNotes - Main component for the ancient book-styled note-taking module
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 9.2, 9.3
 */
const NecronomiconNotes: React.FC = () => {
  const { 
    notes, 
    currentNoteId, 
    setCurrentNoteId, 
    createNote,
    allTags,
    selectedTags,
    setSelectedTags,
    tagFilterMode,
    setTagFilterMode
  } = useNotes();
  
  const [showTagCloud, setShowTagCloud] = useState(false);

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

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className={styles.necronomiconNotes}>
      <aside className={styles.sidebar}>
        <SearchBar />
        
        <button
          className={styles.tagCloudToggle}
          onClick={() => setShowTagCloud(!showTagCloud)}
          aria-label={showTagCloud ? 'Hide tag cloud' : 'Show tag cloud'}
          aria-expanded={showTagCloud}
        >
          <span aria-hidden="true">{showTagCloud ? '▼' : '▶'}</span> Tag Cloud
        </button>
        
        {showTagCloud && (
          <TagCloud
            tags={allTags}
            items={notes}
            onTagClick={handleTagClick}
            selectedTags={selectedTags}
          />
        )}
        
        <TagFilter
          availableTags={allTags}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          filterMode={tagFilterMode}
          onFilterModeChange={setTagFilterMode}
        />
        <NotesList onNoteSelect={handleNoteSelect} selectedNoteId={currentNoteId} />
      </aside>
      <main className={styles.bookArea}>
        <NotesBook />
      </main>
    </div>
  );
};

export default NecronomiconNotes;
