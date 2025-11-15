import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Note } from '../types';

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
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

interface NotesProviderProps {
  children: ReactNode;
}

/**
 * NotesProvider component for note management
 * Implements CRUD operations, search functionality, and storage integration
 * Requirements: 3.1, 3.2, 3.6, 7.2
 */
export function NotesProvider({ children }: NotesProviderProps) {
  // Persist notes to LocalStorage
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  
  // Current note state
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tag filtering state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagFilterMode, setTagFilterMode] = useState<'AND' | 'OR'>('OR');

  /**
   * Create a new note
   * Requirements: 3.1, 7.2
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
    
    setNotes(prev => [...prev, newNote]);
    setCurrentNoteId(newNote.id);
    
    return newNote;
  }, [setNotes]);

  /**
   * Update an existing note
   * Requirements: 3.1, 7.2
   */
  const updateNote = useCallback((id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setNotes(prev => prev.map(note => {
      if (note.id === id) {
        return {
          ...note,
          ...updates,
          updatedAt: new Date(),
        };
      }
      return note;
    }));
  }, [setNotes]);

  /**
   * Delete a note
   * Requirements: 3.1, 7.2
   */
  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    
    // Clear current note if it was deleted
    if (currentNoteId === id) {
      setCurrentNoteId(null);
    }
  }, [setNotes, currentNoteId]);

  /**
   * Get a specific note by ID
   */
  const getNote = useCallback((id: string): Note | undefined => {
    return notes.find(note => note.id === id);
  }, [notes]);

  /**
   * Get all unique tags from all notes
   */
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(note => {
      note.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  /**
   * Import notes with merge or replace strategy
   * Requirements: 11.3
   */
  const importNotes = useCallback((importedNotes: Note[], strategy: 'replace' | 'merge') => {
    if (strategy === 'replace') {
      // Replace all existing notes
      setNotes(importedNotes);
      setCurrentNoteId(null);
    } else {
      // Merge: add only unique notes (skip duplicates)
      setNotes(prev => {
        const merged = [...prev];
        
        importedNotes.forEach(importedNote => {
          // Check if note already exists (by title and content)
          const isDuplicate = prev.some(existing => 
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
        
        return merged;
      });
    }
  }, [setNotes]);

  /**
   * Filter notes based on search query and tags
   * Requirements: 3.6, 14.4, 14.6
   */
  const filteredNotes = useMemo(() => {
    let result = notes;
    
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
    
    return result;
  }, [notes, searchQuery, selectedTags, tagFilterMode]);

  const value: NotesContextType = {
    notes,
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
