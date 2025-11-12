import React, { useRef, useEffect, useCallback } from 'react';
import styles from './WritingEditor.module.css';

interface WritingEditorProps {
  onTextChange?: (text: string, context: string, cursorPosition: number) => void;
}

const WritingEditor: React.FC<WritingEditorProps> = ({ onTextChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className={styles.editorContainer}>
      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
        data-placeholder="Begin writing your dark tales..."
      />
    </div>
  );
};

export default WritingEditor;
