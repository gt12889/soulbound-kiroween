import React, { useCallback, useEffect, useState, useRef } from 'react';
import type { ContentBlock } from '../../types';
import { useEditorState } from '../../hooks/useEditorState';
import { PaperTexture } from '../ghost-writer/PaperTexture';
import { GhostlyCursor } from '../ghost-writer/GhostlyCursor';
import { InkSplotch } from '../ghost-writer/InkSplotch';
import BlockRenderer from './BlockRenderer';
import styles from './EnhancedEditor.module.css';

interface EnhancedEditorProps {
  initialBlocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

/**
 * EnhancedEditor - Modern block-based editor for Necronomicon Notes
 * Features: Block-based content, keyboard shortcuts, drag-and-drop (future)
 */
const EnhancedEditor: React.FC<EnhancedEditorProps> = ({
  initialBlocks,
  onChange,
  autoSave = true,
  autoSaveDelay = 1000,
}) => {
  const {
    blocks,
    activeBlockId,
    setActiveBlock,
    updateBlock,
    deleteBlock,
    splitBlockAt,
    mergeWithPrevious,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorState(initialBlocks);
  
  const [isTyping, setIsTyping] = useState(false);
  const [inkSplotches, setInkSplotches] = useState<Array<{ id: number; x: number; y: number; size: 'small' | 'medium' | 'large' }>>([]);
  const splotchIdCounter = useRef(0);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save with debouncing
  useEffect(() => {
    if (!autoSave) return;

    const timeoutId = setTimeout(() => {
      onChange(blocks);
    }, autoSaveDelay);

    return () => clearTimeout(timeoutId);
  }, [blocks, onChange, autoSave, autoSaveDelay]);

  // Track typing state
  useEffect(() => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 500);

    // Add ink splotch occasionally
    if (Math.random() < 0.01) {
      const size = Math.random() < 0.7 ? 'small' : Math.random() < 0.9 ? 'medium' : 'large';
      setInkSplotches((prev) => [
        ...prev,
        {
          id: splotchIdCounter.current++,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size,
        },
      ]);
    }
  }, [blocks]);

  // Handle block operations
  const handleBlockUpdate = useCallback(
    (block: ContentBlock) => {
      updateBlock(block.id, block);
    },
    [updateBlock]
  );

  const handleBlockDelete = useCallback(
    (blockId: string) => {
      deleteBlock(blockId);
    },
    [deleteBlock]
  );

  const handleBlockSplit = useCallback(
    (blockId: string, position: number) => {
      splitBlockAt(blockId, position);
    },
    [splitBlockAt]
  );

  const handleBlockMerge = useCallback(
    (blockId: string) => {
      mergeWithPrevious(blockId);
    },
    [mergeWithPrevious]
  );

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (isMod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <PaperTexture className={styles.enhancedEditor}>
      <GhostlyCursor isTyping={isTyping} enabled={true} />
      <InkSplotch 
        splotches={inkSplotches} 
        onSplotchComplete={(id) => {
          setInkSplotches((prev) => prev.filter((s) => s.id !== id));
        }} 
      />
      <div role="textbox" aria-label="Note content editor" aria-multiline="true">
      {/* Editor toolbar - placeholder for future enhancements */}
      <div className={styles.editorToolbar}>
        <button
          className={styles.toolbarButton}
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Cmd/Ctrl+Z)"
          aria-label="Undo"
        >
          ↶
        </button>
        <button
          className={styles.toolbarButton}
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Cmd/Ctrl+Y)"
          aria-label="Redo"
        >
          ↷
        </button>
      </div>

      {/* Blocks container */}
      <div className={styles.blocksContainer}>
        {blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            isActive={block.id === activeBlockId}
            onUpdate={handleBlockUpdate}
            onDelete={() => handleBlockDelete(block.id)}
            onMerge={() => handleBlockMerge(block.id)}
            onSplit={(position) => handleBlockSplit(block.id, position)}
            onFocus={() => setActiveBlock(block.id)}
            onBlur={() => setActiveBlock(null)}
          />
        ))}
      </div>

      {/* Status bar - placeholder for future enhancements */}
      <div className={styles.statusBar}>
        <span className={styles.statusText}>
          {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
        </span>
      </div>
      </div>
    </PaperTexture>
  );
};

export default EnhancedEditor;
