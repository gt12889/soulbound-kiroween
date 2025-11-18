import React, { useRef, useEffect, useCallback, useState } from 'react';
import GhostWriterModal from './GhostWriterModal';
import styles from './WritingEditor.module.css';

interface WritingEditorProps {
  onTextChange?: (text: string, context: string, cursorPosition: number) => void;
  onAcceptSuggestion?: () => boolean;
  hasSuggestion?: boolean;
}

const WritingEditor: React.FC<WritingEditorProps> = ({ onTextChange, onAcceptSuggestion, hasSuggestion }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const lastTabTime = useRef<number>(0);
  const DOUBLE_TAB_THRESHOLD = 500; // milliseconds

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
  }, [getCursorPosition, extractContext, onTextChange]);

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

  // Expose insertSuggestion method to parent
  useEffect(() => {
    if (editorRef.current) {
      (editorRef.current as any).insertSuggestion = insertSuggestion;
    }
  }, [insertSuggestion]);

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

      // Double-tab to accept suggestion (only when editor is focused)
      if (e.key === 'Tab' && hasSuggestion && editorRef.current?.contains(document.activeElement)) {
        const now = Date.now();
        const timeSinceLastTab = now - lastTabTime.current;

        if (timeSinceLastTab < DOUBLE_TAB_THRESHOLD) {
          // Double-tab detected
          e.preventDefault();
          if (onAcceptSuggestion && onAcceptSuggestion()) {
            console.log('[Writing Editor] Suggestion accepted via double-tab');
          }
          lastTabTime.current = 0; // Reset
        } else {
          // First tab - prevent default and record time
          e.preventDefault();
          lastTabTime.current = now;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentText, hasSuggestion, onAcceptSuggestion]);

  return (
    <div className={styles.editorContainer}>
      <div className={styles.toolbar}>
        <button
          className={styles.ghostButton}
          onClick={handleOpenModal}
          disabled={currentText.trim().length === 0}
          title="Summon Ghost Writer (Ctrl+G)"
        >
          👻 Summon Ghost Writer
        </button>
      </div>
      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
        data-placeholder="Begin writing your dark tales..."
      />
      
      <GhostWriterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentText={currentText}
        onInsertText={insertSuggestion}
      />
    </div>
  );
};

export default WritingEditor;
