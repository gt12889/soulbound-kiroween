import React, { useCallback, useEffect } from 'react';
import type { ContentBlock, BlockType } from '../../types';
import { useEditorState } from '../../hooks/useEditorState';
import BlockRenderer from './BlockRenderer';
import {
  ParagraphBlock,
  HeadingBlock,
  ListBlock,
  CodeBlock,
  QuoteBlock,
  CalloutBlock,
  DividerBlock,
} from './blocks';
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
    addBlock,
    deleteBlock,
    splitBlockAt,
    mergeWithPrevious,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorState(initialBlocks);

  // Auto-save with debouncing
  useEffect(() => {
    if (!autoSave) return;

    const timeoutId = setTimeout(() => {
      onChange(blocks);
    }, autoSaveDelay);

    return () => clearTimeout(timeoutId);
  }, [blocks, onChange, autoSave, autoSaveDelay]);

  // Get the appropriate block component
  const getBlockComponent = useCallback((block: ContentBlock) => {
    const commonProps = {
      block,
      onUpdate: (updatedBlock: ContentBlock) => updateBlock(block.id, updatedBlock),
      onKeyDown: () => {}, // Placeholder - will be handled by BlockRenderer
    };

    switch (block.type) {
      case 'heading-1':
      case 'heading-2':
      case 'heading-3':
      case 'heading-4':
      case 'heading-5':
      case 'heading-6':
        return <HeadingBlock {...commonProps} />;
      case 'bullet-list':
      case 'numbered-list':
      case 'checklist':
        return <ListBlock {...commonProps} />;
      case 'code':
        return <CodeBlock {...commonProps} />;
      case 'quote':
        return <QuoteBlock {...commonProps} />;
      case 'callout':
        return <CalloutBlock {...commonProps} />;
      case 'divider':
        return <DividerBlock block={block} />;
      case 'paragraph':
      default:
        return <ParagraphBlock {...commonProps} />;
    }
  }, [updateBlock]);

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
    <div className={styles.enhancedEditor} role="textbox" aria-label="Note content editor" aria-multiline="true">
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
  );
};

export default EnhancedEditor;
