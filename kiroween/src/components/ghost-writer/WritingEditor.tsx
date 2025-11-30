import React, { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import GhostWriterModal from './GhostWriterModal';
import styles from './WritingEditor.module.css';

interface WritingEditorProps {
  onTextChange?: (text: string, context: string, cursorPosition: number) => void;
  onAcceptSuggestion?: () => boolean;
  hasSuggestion?: boolean;
}

export interface WritingEditorHandle {
  insertSuggestion: (text: string) => void;
  insertText: (text: string) => void;
  focus: () => void;
  getElement: () => HTMLDivElement | null;
  getText: () => string;
  setText: (text: string) => void;
  getCurrentContext: () => string;
  getCursorPosition: () => number;
}

const STORAGE_KEY = 'ghostwriter_content';
const AUTOSAVE_DELAY = 1000; // Save after 1 second of inactivity

const WritingEditor = forwardRef<WritingEditorHandle, WritingEditorProps>(({ onTextChange, onAcceptSuggestion, hasSuggestion }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const lastTabTime = useRef<number>(0);
  const DOUBLE_TAB_THRESHOLD = 500; // milliseconds
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Extract current sentence or paragraph context
  const extractContext = useCallback((text: string, position: number): string => {
    // Extract current sentence (text between periods or start/end)
    const beforeCursor = text.substring(0, position);
    const afterCursor = text.substring(position);
    
    // Find sentence boundaries
    const sentenceStart = Math.max(
      beforeCursor.lastIndexOf('. ') + 2,
      beforeCursor.lastIndexOf('! ') + 2,
      beforeCursor.lastIndexOf('? ') + 2,
      0
    );
    
    const sentenceEndInAfter = Math.min(
      afterCursor.indexOf('. ') !== -1 ? afterCursor.indexOf('. ') : Infinity,
      afterCursor.indexOf('! ') !== -1 ? afterCursor.indexOf('! ') : Infinity,
      afterCursor.indexOf('? ') !== -1 ? afterCursor.indexOf('? ') : Infinity,
      afterCursor.length
    );
    
    const currentSentence = text.substring(sentenceStart, position + sentenceEndInAfter);
    
    // If sentence is too short, get paragraph context
    if (currentSentence.trim().length < 20) {
      const paragraphStart = Math.max(beforeCursor.lastIndexOf('\n\n') + 2, 0);
      const paragraphEndInAfter = afterCursor.indexOf('\n\n') !== -1 
        ? afterCursor.indexOf('\n\n') 
        : afterCursor.length;
      return text.substring(paragraphStart, position + paragraphEndInAfter).trim();
    }
    
    return currentSentence.trim();
  }, []);

  // Get cursor position in text
  const getCursorPosition = useCallback((): number => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return 0;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    
    return preCaretRange.toString().length;
  }, []);

  // Save to localStorage
  const saveToLocalStorage = useCallback((text: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, text);
      console.log('[WritingEditor] Content saved to localStorage');
    } catch (error) {
      console.error('[WritingEditor] Failed to save to localStorage:', error);
    }
  }, []);

  // Handle text input
  const handleInput = useCallback(() => {
    if (!editorRef.current) return;

    const text = editorRef.current.innerText || '';
    setCurrentText(text);
    const position = getCursorPosition();
    const context = extractContext(text, position);
    
    if (onTextChange) {
      onTextChange(text, context, position);
    }

    // Debounced autosave to localStorage
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(() => {
      saveToLocalStorage(text);
    }, AUTOSAVE_DELAY);
  }, [getCursorPosition, extractContext, onTextChange, saveToLocalStorage]);

  // Insert suggestion at cursor
  const insertSuggestion = useCallback((suggestion: string) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();
    
    const textNode = document.createTextNode(suggestion);
    range.insertNode(textNode);
    
    // Move cursor to end of inserted text
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    // Trigger input event to update state
    handleInput();
  }, [handleInput]);

  // Load saved content from localStorage on mount
  useEffect(() => {
    try {
      const savedContent = localStorage.getItem(STORAGE_KEY);
      if (savedContent && editorRef.current) {
        editorRef.current.innerText = savedContent;
        setCurrentText(savedContent);
        console.log('[WritingEditor] Loaded saved content from localStorage');
      }
    } catch (error) {
      console.error('[WritingEditor] Failed to load from localStorage:', error);
    }
  }, []);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    insertSuggestion,
    insertText: insertSuggestion, // Alias for compatibility
    focus: () => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    },
    getElement: () => editorRef.current,
    getText: () => currentText,
    setText: (text: string) => {
      if (editorRef.current) {
        editorRef.current.innerText = text;
        setCurrentText(text);
        handleInput();
      }
    },
    getCurrentContext: () => {
      const position = getCursorPosition();
      return extractContext(currentText, position);
    },
    getCursorPosition,
  }), [insertSuggestion, currentText, handleInput, getCursorPosition, extractContext]);

  // Save on unmount and cleanup autosave timer
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
      // Save immediately on unmount
      if (currentText) {
        try {
          localStorage.setItem(STORAGE_KEY, currentText);
          console.log('[WritingEditor] Content saved on unmount');
        } catch (error) {
          console.error('[WritingEditor] Failed to save on unmount:', error);
        }
      }
    };
  }, [currentText]);

  // Open Ghost Writer modal
  const handleOpenModal = () => {
    if (currentText.trim().length > 0) {
      setIsModalOpen(true);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + G to open modal
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        handleOpenModal();
        return;
      }

      // Note: Tab key handling for accepting suggestions is now handled by the parent GhostWriter component
      // This allows for a simpler single-Tab shortcut instead of double-tab
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentText]);

  return (
    <div className={styles.editorContainer}>
      <div className={styles.toolbar} role="toolbar" aria-label="Writing tools">
        <button
          className={`${styles.ghostButton} button-primary`}
          onClick={handleOpenModal}
          disabled={currentText.trim().length === 0}
          title="Summon Ghost Writer (Ctrl+G)"
          aria-label="Summon Ghost Writer assistant (Ctrl+G)"
          aria-disabled={currentText.trim().length === 0}
        >
          👻 Summon Ghost Writer
        </button>
      </div>
      <div
        ref={editorRef}
        className={`${styles.editor} parchment-background`}
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
        data-placeholder="Begin writing your dark tales..."
        role="textbox"
        aria-label="Writing editor"
        aria-multiline="true"
        aria-placeholder="Begin writing your dark tales..."
      />
      
      <GhostWriterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentText={currentText}
        onInsertText={insertSuggestion}
      />
    </div>
  );
});

WritingEditor.displayName = 'WritingEditor';

export default WritingEditor;
