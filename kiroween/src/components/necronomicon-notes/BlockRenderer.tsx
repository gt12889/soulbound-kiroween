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
  const blockRef = useRef<HTMLTextAreaElement>(null);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // For textarea, handle Enter to split blocks
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const textarea = e.currentTarget as HTMLTextAreaElement;
        const cursorPos = textarea.selectionStart || 0;
        onSplit(cursorPos);
        return;
      }

      // Backspace at start: Merge with previous or delete empty block
      if (e.key === 'Backspace') {
        const textarea = e.currentTarget as HTMLTextAreaElement;
        const cursorPos = textarea.selectionStart || 0;
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
    },
    [block.content.length, onSplit, onDelete, onMerge]
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

      {/* Use textarea instead of contentEditable to test */}
      <textarea
        ref={blockRef as any}
        className={styles.blockContent}
        value={block.content}
        onChange={(e) => {
          onUpdate({
            ...block,
            content: e.target.value,
          });
        }}
        onKeyDown={handleKeyDown as any}
        onFocus={onFocus}
        onBlur={onBlur}
        dir="ltr"
        lang="en"
        placeholder={block.content.length === 0 ? 'Type / for commands' : ''}
        style={{
          direction: 'ltr',
          unicodeBidi: 'normal',
          writingMode: 'horizontal-tb',
          textAlign: 'left',
          fontFamily: 'inherit',
          resize: 'none',
          border: 'none',
          background: 'transparent',
          outline: 'none',
          width: '100%',
          minHeight: '1.5em',
        }}
      />
    </div>
  );
};

export default BlockRenderer;
