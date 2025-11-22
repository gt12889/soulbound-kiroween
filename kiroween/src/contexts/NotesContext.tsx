import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Note } from '../types';
import { useToast } from './ToastContext';
import { useScreenReaderAnnouncement } from '../hooks/useScreenReaderAnnouncement';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { useCompanion } from './CompanionContext';

interface NotesContextType {
  // Notes data
  notes: Note[];
  currentNoteId: string | null;
  
  // CRUD operations
  createNote: (title: string, content?: string) => Note;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
  
  // Navigation
  setCurrentNoteId: (id: string | null) => void;
  
  // Search functionality
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredNotes: Note[];
  
  // Tag filtering
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  tagFilterMode: 'AND' | 'OR';
  setTagFilterMode: (mode: 'AND' | 'OR') => void;
  allTags: string[];
  
  // Import functionality
  importNotes: (importedNotes: Note[], strategy: 'replace' | 'merge') => void;
  
  // Undo/Redo functionality
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // Bulk operations
  bulkDelete: (ids: string[]) => void;
  bulkTag: (ids: string[], tags: string[]) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

interface NotesProviderProps {
  children: ReactNode;
}

/**
 * NotesProvider component for note management
 * Implements CRUD operations, search functionality, and storage integration
 * Requirements: 3.1, 3.2, 3.6, 7.2, 8.1
 */
export function NotesProvider({ children }: NotesProviderProps) {
  // Persist notes to LocalStorage
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  
  // Undo/Redo functionality
  // Requirement: 8.1, 8.5 - Implement undo/redo with max 10 actions
  const {
    state: undoRedoNotes,
    setState: setUndoRedoNotes,
    undo: undoHistory,
    redo: redoHistory,
    canUndo,
    canRedo,
  } = useUndoRedo<Note[]>(notes, 10);
  
  // Current note state
  const [currentNoteId, setCurrentNoteIdState] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tag filtering state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagFilterMode, setTagFilterMode] = useState<'AND' | 'OR'>('OR');
  
  // Toast notifications
  // Requirement: 4.5 - Display success toast within 200ms
  const { showToast } = useToast();
  
  // Screen reader announcements
  // Requirement: 6.2, 6.3 - Announce state changes to screen readers
  const { announce } = useScreenReaderAnnouncement();
  
  // Sync undo/redo state with localStorage
  useEffect(() => {
    setNotes(undoRedoNotes);
  }, [undoRedoNotes, setNotes]);
  
  // Companion integration for note-taking tracking (optional)
  // Requirement: 10.2 - Track note-taking activity
  let trackNoteActivity: ((noteId: string, noteLength: number) => void) | undefined;
  let startNoteTaking: (() => void) | undefined;
  let endNoteTaking: (() => void) | undefined;
  
  try {
    const companion = useCompanion();
    trackNoteActivity = companion.trackNoteActivity;
    startNoteTaking = companion.startNoteTaking;
    endNoteTaking = companion.endNoteTaking;
  } catch (error) {
    // CompanionProvider not available - companion integration is optional
    console.debug('CompanionContext not available - note tracking disabled');
  }
  
  // Wrapper to track note-taking activity when switching notes
  const setCurrentNoteId = useCallback((id: string | null) => {
    if (id !== null) {
      // User is opening a note - start tracking note-taking activity
      startNoteTaking?.();
    } else {
      // User is closing the note - end tracking
      endNoteTaking?.();
    }
    setCurrentNoteIdState(id);
  }, [startNoteTaking, endNoteTaking]);

  /**
   * Create a new note
   * Requirements: 3.1, 7.2, 8.1, 10.2
   */
  const createNote = useCallback((title: string, content: string = ''): Note => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      markdown: false,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const newNotes = [...undoRedoNotes, newNote];
    setUndoRedoNotes(newNotes);
    setCurrentNoteId(newNote.id);
    
    // Requirement: 4.5 - Success toast for note creation
    showToast({
      type: 'success',
      message: `Note "${title}" created`,
    });
    
    // Track note creation with companion (if available)
    startNoteTaking?.();
    
    return newNote;
  }, [undoRedoNotes, setUndoRedoNotes, showToast, startNoteTaking]);

  /**
   * Update an existing note
   * Requirements: 3.1, 7.2, 6.2, 6.3, 8.1, 10.2
   */
  const updateNote = useCallback((id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    const newNotes = undoRedoNotes.map(note => {
      if (note.id === id) {
        const updatedNote = {
          ...note,
          ...updates,
          updatedAt: new Date(),
        };
        
        // Track note activity with companion if content was updated (if available)
        if (updates.content !== undefined && trackNoteActivity) {
          const noteLength = updatedNote.content.length;
          trackNoteActivity(id, noteLength);
        }
        
        return updatedNote;
      }
      return note;
    });
    
    setUndoRedoNotes(newNotes);
    
    // Note: Removed intrusive "Note saved" toast that spammed on every keystroke
    // Auto-save happens silently in the background for better UX
  }, [undoRedoNotes, setUndoRedoNotes, trackNoteActivity]);

  /**
   * Delete a note
   * Requirements: 3.1, 7.2, 8.1
   */
  const deleteNote = useCallback((id: string) => {
    const note = undoRedoNotes.find(n => n.id === id);
    const newNotes = undoRedoNotes.filter(note => note.id !== id);
    setUndoRedoNotes(newNotes);
    
    // Clear current note if it was deleted
    if (currentNoteId === id) {
      setCurrentNoteId(null);
    }
    
    // Requirement: 4.5, 8.4 - Success toast with undo button for note deletion
    if (note) {
      showToast({
        type: 'success',
        message: `Note "${note.title}" deleted`,
        action: {
          label: 'Undo',
          onClick: undoHistory,
        },
      });
    }
  }, [undoRedoNotes, setUndoRedoNotes, currentNoteId, setCurrentNoteId, showToast, undoHistory]);

  /**
   * Get a specific note by ID
   */
  const getNote = useCallback((id: string): Note | undefined => {
    return undoRedoNotes.find(note => note.id === id);
  }, [undoRedoNotes]);

  /**
   * Get all unique tags from all notes
   */
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    undoRedoNotes.forEach(note => {
      note.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [undoRedoNotes]);

  /**
   * Import notes with merge or replace strategy
   * Requirements: 11.3, 8.1
   */
  const importNotes = useCallback((importedNotes: Note[], strategy: 'replace' | 'merge') => {
    if (strategy === 'replace') {
      // Replace all existing notes
      setUndoRedoNotes(importedNotes);
      setCurrentNoteId(null);
    } else {
      // Merge: add only unique notes (skip duplicates)
      const merged = [...undoRedoNotes];
      
      importedNotes.forEach(importedNote => {
        // Check if note already exists (by title and content)
        const isDuplicate = undoRedoNotes.some(existing => 
          existing.title.trim().toLowerCase() === importedNote.title.trim().toLowerCase() &&
          existing.content.trim().toLowerCase() === importedNote.content.trim().toLowerCase()
        );
        
        if (!isDuplicate) {
          // Generate new ID to avoid conflicts
          merged.push({
            ...importedNote,
            id: crypto.randomUUID(),
          });
        }
      });
      
      setUndoRedoNotes(merged);
    }
  }, [undoRedoNotes, setUndoRedoNotes]);

  /**
   * Filter notes based on search query and tags
   * Requirements: 3.6, 14.4, 14.6
   */
  const filteredNotes = useMemo(() => {
    let result = undoRedoNotes;
    
    // Apply tag filtering
    if (selectedTags.length > 0) {
      result = result.filter(note => {
        const noteTags = note.tags || [];
        if (tagFilterMode === 'AND') {
          // Note must have ALL selected tags
          return selectedTags.every(tag => noteTags.includes(tag));
        } else {
          // Note must have ANY selected tag
          return selectedTags.some(tag => noteTags.includes(tag));
        }
      });
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        (note.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort by creation date (newest first)
    return result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [undoRedoNotes, searchQuery, selectedTags, tagFilterMode]);

  /**
   * Undo the last action
   * Requirement: 8.1, 8.2 - Implement undo with Ctrl+Z
   */
  const undo = useCallback(() => {
    undoHistory();
  }, [undoHistory]);

  /**
   * Redo the last undone action
   * Requirement: 8.1, 8.3 - Implement redo with Ctrl+Y
   */
  const redo = useCallback(() => {
    redoHistory();
  }, [redoHistory]);

  /**
   * Bulk delete multiple notes
   * Requirement: 9.5
   */
  const bulkDelete = useCallback((ids: string[]) => {
    const newNotes = undoRedoNotes.filter(note => !ids.includes(note.id));
    setUndoRedoNotes(newNotes);
    
    // Clear current note if it was deleted
    if (currentNoteId && ids.includes(currentNoteId)) {
      setCurrentNoteId(null);
    }
    
    // Requirement: 4.5, 8.4 - Success toast with undo button
    showToast({
      type: 'success',
      message: `${ids.length} note${ids.length > 1 ? 's' : ''} deleted`,
      action: {
        label: 'Undo',
        onClick: undoHistory,
      },
    });
  }, [undoRedoNotes, setUndoRedoNotes, currentNoteId, setCurrentNoteId, showToast, undoHistory]);

  /**
   * Bulk add tags to multiple notes
   * Requirement: 9.5
   */
  const bulkTag = useCallback((ids: string[], tags: string[]) => {
    const newNotes = undoRedoNotes.map(note => {
      if (ids.includes(note.id)) {
        // Merge new tags with existing tags, avoiding duplicates
        const existingTags = note.tags || [];
        const mergedTags = Array.from(new Set([...existingTags, ...tags]));
        return {
          ...note,
          tags: mergedTags,
          updatedAt: new Date(),
        };
      }
      return note;
    });
    
    setUndoRedoNotes(newNotes);
    
    // Requirement: 4.5 - Success toast
    showToast({
      type: 'success',
      message: `Tags added to ${ids.length} note${ids.length > 1 ? 's' : ''}`,
    });
  }, [undoRedoNotes, setUndoRedoNotes, showToast]);

  const value: NotesContextType = {
    notes: undoRedoNotes,
    currentNoteId,
    createNote,
    updateNote,
    deleteNote,
    getNote,
    setCurrentNoteId,
    searchQuery,
    setSearchQuery,
    filteredNotes,
    selectedTags,
    setSelectedTags,
    tagFilterMode,
    setTagFilterMode,
    allTags,
    importNotes,
    undo,
    redo,
    canUndo,
    canRedo,
    bulkDelete,
    bulkTag,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

/**
 * Hook to access NotesContext
 * @throws Error if used outside NotesProvider
 */
export function useNotes(): NotesContextType {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
