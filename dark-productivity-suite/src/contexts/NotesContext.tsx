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

  /**
   * Create a new note
   * Requirements: 3.1, 7.2
   */
  const createNote = useCallback((title: string, content: string = ''): Note => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
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
   * Filter notes based on search query
   * Requirements: 3.6
   */
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) {
      return notes;
    }
    
    const query = searchQuery.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

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
