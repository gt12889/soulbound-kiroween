import { useState, useCallback } from 'react';

/**
 * Undo/Redo Hook
 * Requirements: 8.1, 8.5
 * 
 * Manages undo/redo history stack with configurable max history.
 * Supports undo for task/note deletions and updates.
 */

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface UseUndoRedoReturn<T> {
  state: T;
  setState: (newState: T, skipHistory?: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

/**
 * Custom hook for managing undo/redo functionality
 * 
 * @param initialState - Initial state value
 * @param maxHistory - Maximum number of history items to keep (default: 10)
 * @returns Object with state, setState, undo, redo, and utility functions
 */
export function useUndoRedo<T>(
  initialState: T,
  maxHistory: number = 10
): UseUndoRedoReturn<T> {
  const [history, setHistory] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  /**
   * Set new state and add current state to history
   * Requirement: 8.1 - Track deletions, completions, and updates
   * 
   * @param newState - New state to set
   * @param skipHistory - If true, update state without adding to history
   */
  const setState = useCallback((newState: T, skipHistory: boolean = false) => {
    if (skipHistory) {
      // Update state without affecting history
      setHistory(prev => ({
        ...prev,
        present: newState,
      }));
      return;
    }

    setHistory(prev => {
      const newPast = [...prev.past, prev.present];
      
      // Requirement: 8.5 - Maintain history of at least 10 actions
      // Limit history size to maxHistory
      if (newPast.length > maxHistory) {
        newPast.shift(); // Remove oldest item
      }

      return {
        past: newPast,
        present: newState,
        future: [], // Clear future when new action is performed
      };
    });
  }, [maxHistory]);

  /**
   * Undo the last action
   * Requirement: 8.1 - Implement undo functionality
   */
  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) {
        return prev; // Nothing to undo
      }

      const newPast = [...prev.past];
      const newPresent = newPast.pop()!;
      const newFuture = [prev.present, ...prev.future];

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  /**
   * Redo the last undone action
   * Requirement: 8.1 - Implement redo functionality
   */
  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) {
        return prev; // Nothing to redo
      }

      const newFuture = [...prev.future];
      const newPresent = newFuture.shift()!;
      const newPast = [...prev.past, prev.present];

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  /**
   * Clear all history
   * Requirement: 8.6 - Clear undo history on explicit save/close
   */
  const clear = useCallback(() => {
    setHistory(prev => ({
      past: [],
      present: prev.present,
      future: [],
    }));
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
  };
}
