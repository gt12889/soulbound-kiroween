import React, { useState, useEffect, useCallback } from 'react';
import { useNotes } from '../../contexts/NotesContext';
import { useAudio } from '../../hooks/useAudio';
import { useBulkSelection } from '../../hooks/useBulkSelection';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { TagManager } from '../common/TagManager';
import SkeletonLoader from '../common/SkeletonLoader';
import EmptyState from '../common/EmptyState';
import styles from './NotesList.module.css';

interface NotesListProps {
  onNoteSelect: (noteId: string) => void;
  selectedNoteId: string | null;
}

/**
 * NotesList component - Displays sidebar with all note titles
 * Requirements: 3.2, 8.4, 2.1, 9.1, 9.2, 9.3
 */
const NotesList: React.FC<NotesListProps> = ({ onNoteSelect, selectedNoteId }) => {
  const { filteredNotes, createNote, deleteNote, bulkDelete, bulkTag, allTags } = useNotes();
  const { playUIClick, playUIHover } = useAudio();
  const [isLoading, setIsLoading] = useState(true);
  const [bulkSelectionMode, setBulkSelectionMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSingleDeleteConfirm, setShowSingleDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [bulkTagInput, setBulkTagInput] = useState<string[]>([]);
  
  // Bulk selection - Requirement 9.1
  const {
    selectedIds,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    hasSelection,
    selectionCount,
  } = useBulkSelection();

  // Simulate initial data loading
  // Requirements: 2.1
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleCreateNote = () => {
    playUIClick();
    const newNote = createNote('Untitled Note', '');
    onNoteSelect(newNote.id);
  };

  const handleDeleteNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    playUIClick();
    setNoteToDelete(noteId);
    setShowSingleDeleteConfirm(true);
  };

  const handleSingleDeleteConfirm = useCallback(() => {
    if (noteToDelete) {
      deleteNote(noteToDelete);
      setNoteToDelete(null);
      setShowSingleDeleteConfirm(false);
    }
  }, [noteToDelete, deleteNote]);

  const handleNoteClick = (noteId: string) => {
    if (!bulkSelectionMode) {
      playUIClick();
      onNoteSelect(noteId);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Bulk selection handlers - Requirement 9.1
  const handleToggleBulkMode = useCallback(() => {
    playUIClick();
    setBulkSelectionMode(prev => !prev);
    if (bulkSelectionMode) {
      clearSelection();
    }
  }, [bulkSelectionMode, clearSelection, playUIClick]);

  const handleSelectAll = useCallback(() => {
    playUIClick();
    const allNoteIds = filteredNotes.map(note => note.id);
    selectAll(allNoteIds);
  }, [filteredNotes, selectAll, playUIClick]);

  const handleSelectNone = useCallback(() => {
    playUIClick();
    clearSelection();
  }, [clearSelection, playUIClick]);

  // Bulk action handlers - Requirement 9.2, 9.6
  const handleBulkDeleteClick = useCallback(() => {
    playUIClick();
    setShowDeleteConfirm(true);
  }, [playUIClick]);

  const handleBulkDeleteConfirm = useCallback(() => {
    const ids = Array.from(selectedIds);
    bulkDelete(ids);
    clearSelection();
    setShowDeleteConfirm(false);
    setBulkSelectionMode(false);
  }, [selectedIds, bulkDelete, clearSelection]);

  const handleBulkTagClick = useCallback(() => {
    playUIClick();
    setShowTagDialog(true);
  }, [playUIClick]);

  const handleBulkTagConfirm = useCallback(() => {
    if (bulkTagInput.length > 0) {
      const ids = Array.from(selectedIds);
      bulkTag(ids, bulkTagInput);
      clearSelection();
      setBulkTagInput([]);
      setShowTagDialog(false);
      setBulkSelectionMode(false);
    }
  }, [selectedIds, bulkTagInput, bulkTag, clearSelection]);

  return (
    <div className={styles.notesList}>
      <div className={styles.header}>
        <h3 className={styles.title}>Inscriptions</h3>
        <div className={styles.headerButtons}>
          <button className={`${styles.createButton} button-primary`} onClick={handleCreateNote} title="Create new note">
            <span className={styles.createIcon}>+</span>
          </button>
          <button 
            className={`${styles.bulkModeButton} ${bulkSelectionMode ? styles.active : ''} button-primary`}
            onClick={handleToggleBulkMode}
            title={bulkSelectionMode ? 'Exit bulk selection mode' : 'Enter bulk selection mode'}
          >
            {bulkSelectionMode ? '✓' : '☐'}
          </button>
        </div>
      </div>

      {/* Bulk action toolbar - Requirement 9.1, 9.2, 9.3 */}
      {bulkSelectionMode && (
        <div className={styles.bulkToolbar}>
          <div className={styles.bulkToolbarTop}>
            <button
              className={`${styles.bulkButton} button-secondary`}
              onClick={handleSelectAll}
              aria-label="Select all notes"
            >
              Select All
            </button>
            <button
              className={`${styles.bulkButton} button-secondary`}
              onClick={handleSelectNone}
              aria-label="Clear selection"
              disabled={!hasSelection}
            >
              Select None
            </button>
          </div>
          
          {hasSelection && (
            <>
              <div className={styles.selectionCount}>
                {selectionCount} selected
              </div>
              <div className={styles.bulkActions}>
                <button
                  className={`${styles.bulkActionButton} button-secondary`}
                  onClick={handleBulkTagClick}
                  aria-label="Add tags to selected notes"
                >
                  🏷️ Tag
                </button>
                <button
                  className={`${styles.bulkActionButton} button-danger`}
                  onClick={handleBulkDeleteClick}
                  aria-label="Delete selected notes"
                >
                  🗑️ Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className={styles.notesContainer}>
        {isLoading ? (
          <SkeletonLoader type="note" count={4} />
        ) : filteredNotes.length === 0 ? (
          <EmptyState
            icon="📜"
            title="No Inscriptions"
            message="The pages are blank. Begin your chronicle by creating your first note."
            actionLabel="+ Create Your First Note"
            onAction={handleCreateNote}
          />
        ) : (
          <ul className={styles.noteItems}>
            {filteredNotes.map((note) => (
              <li
                key={note.id}
                className={`${styles.noteItem} ${selectedNoteId === note.id ? styles.selected : ''} ${isSelected(note.id) ? styles.bulkSelected : ''}`}
                onClick={() => handleNoteClick(note.id)}
                onMouseEnter={playUIHover}
              >
                {bulkSelectionMode && (
                  <input
                    type="checkbox"
                    checked={isSelected(note.id)}
                    onChange={() => toggleSelection(note.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select ${note.title || 'Untitled'}`}
                  />
                )}
                <div className={styles.noteItemContent}>
                  <h4 className={styles.noteItemTitle}>{note.title || 'Untitled'}</h4>
                  <p className={styles.noteItemDate}>{formatDate(note.createdAt)}</p>
                </div>
                {!bulkSelectionMode && (
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => handleDeleteNote(e, note.id)}
                    onMouseEnter={playUIHover}
                    title="Delete note"
                    aria-label="Delete note"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirmation Dialogs - Requirement 9.6, 11.1, 11.4 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Notes"
        message={`Are you sure you want to delete ${selectionCount} note${selectionCount > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        destructive={true}
      />

      <ConfirmDialog
        isOpen={showSingleDeleteConfirm}
        title="Delete Note"
        message={`Are you sure you want to delete this note? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleSingleDeleteConfirm}
        onCancel={() => {
          setShowSingleDeleteConfirm(false);
          setNoteToDelete(null);
        }}
        destructive={true}
        showDontAskAgain={true}
        dontAskAgainKey="note-delete"
      />

      {/* Tag Dialog */}
      {showTagDialog && (
        <ConfirmDialog
          isOpen={showTagDialog}
          title="Add Tags"
          message={`Add tags to ${selectionCount} note${selectionCount > 1 ? 's' : ''}:`}
          confirmLabel="Add Tags"
          cancelLabel="Cancel"
          onConfirm={handleBulkTagConfirm}
          onCancel={() => {
            setShowTagDialog(false);
            setBulkTagInput([]);
          }}
        >
          <div style={{ marginTop: '1rem' }}>
            <TagManager
              tags={bulkTagInput}
              allTags={allTags}
              onTagsChange={setBulkTagInput}
              placeholder="Add tags..."
            />
          </div>
        </ConfirmDialog>
      )}
    </div>
  );
};

export default NotesList;
