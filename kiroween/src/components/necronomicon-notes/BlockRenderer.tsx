import React, { useCallback, useRef, useEffect } from 'react';
import type { ContentBlock } from '../../types';
import styles from './BlockRenderer.module.css';

interface BlockRendererProps {
  block: ContentBlock;
  isActive: boolean;
  onUpdate: (block: ContentBlock) => void;
  onDelete: () => void;
  onMerge: () => void;
  onSplit: (position: number) => void;
  onFocus: () => void;
  onBlur: () => void;
}

/**
 * BlockRenderer - Renders a single content block with interaction handling
 * Manages focus, selection, and keyboard events for block manipulation
 */
const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  isActive,
  onUpdate,
  onDelete,
  onMerge,
  onSplit,
  onFocus,
  onBlur,
}) => {
  const blockRef = useRef<HTMLDivElement>(null);

  // Get cursor position within the block
  const getCursorPosition = useCallback((): number => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !blockRef.current) return 0;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(blockRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    return preCaretRange.toString().length;
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Enter: Split block at cursor position
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const cursorPos = getCursorPosition();
        onSplit(cursorPos);
        return;
      }

      // Backspace at start: Merge with previous or delete empty block
      if (e.key === 'Backspace') {
        const cursorPos = getCursorPosition();
        if (cursorPos === 0) {
          e.preventDefault();
          if (block.content.length === 0) {
            onDelete();
          } else {
            onMerge();
          }
          return;
        }
      }

      // Delete at end: Could merge with next block (future enhancement)
      if (e.key === 'Delete') {
        const cursorPos = getCursorPosition();
        if (cursorPos === block.content.length) {
          // Future: merge with next block
        }
      }
    },
    [block.content.length, getCursorPosition, onSplit, onDelete, onMerge]
  );

  // Handle content changes
  const handleInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const newContent = e.currentTarget.textContent || '';
      onUpdate({
        ...block,
        content: newContent,
      });
    },
    [block, onUpdate]
  );

  // Focus management
  useEffect(() => {
    if (isActive && blockRef.current && document.activeElement !== blockRef.current) {
      blockRef.current.focus();
    }
  }, [isActive]);

  return (
    <div
      className={`${styles.blockWrapper} ${isActive ? styles.active : ''}`}
      data-block-id={block.id}
      data-block-type={block.type}
    >
      {/* Drag handle placeholder - will be implemented in Task 4.1 */}
      <div className={styles.dragHandlePlaceholder} />

      {/* Editable content */}
      <div
        ref={blockRef}
        className={styles.blockContent}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        dir="ltr"
        data-placeholder={block.content.length === 0 ? 'Type / for commands' : undefined}
        style={{
          direction: 'ltr',
          unicodeBidi: 'normal',
          transform: 'scaleX(1)',
          WebkitTransform: 'scaleX(1)',
          textAlign: 'left',
        }}
      >
        {block.content}
      </div>
    </div>
  );
};

export default BlockRenderer;
