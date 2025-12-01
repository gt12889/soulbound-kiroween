/**
 * useEditorState Hook
 * Manages editor state including blocks, selection, and history
 */

import { useState, useCallback, useRef } from 'react';
import type { ContentBlock } from '../types';
import { splitBlock, mergeBlocks, createEmptyBlock } from '../utils/blockUtils';

interface EditorState {
  blocks: ContentBlock[];
  activeBlockId: string | null;
}

interface UseEditorStateReturn {
  blocks: ContentBlock[];
  activeBlockId: string | null;
  setActiveBlock: (blockId: string | null) => void;
  updateBlock: (blockId: string, updates: Partial<ContentBlock>) => void;
  addBlock: (block: ContentBlock, afterBlockId?: string) => void;
  deleteBlock: (blockId: string) => void;
  splitBlockAt: (blockId: string, position: number) => void;
  mergeWithPrevious: (blockId: string) => void;
  reorderBlocks: (newBlocks: ContentBlock[]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const MAX_HISTORY = 50;

export const useEditorState = (initialBlocks: ContentBlock[]): UseEditorStateReturn => {
  const [state, setState] = useState<EditorState>({
    blocks: initialBlocks.length > 0 ? initialBlocks : [createEmptyBlock()],
    activeBlockId: null,
  });

  // History management
  const historyRef = useRef<{
    past: ContentBlock[][];
    future: ContentBlock[][];
  }>({
    past: [],
    future: [],
  });

  // Save current state to history
  const saveToHistory = useCallback((blocks: ContentBlock[]) => {
    historyRef.current.past.push(blocks);
    if (historyRef.current.past.length > MAX_HISTORY) {
      historyRef.current.past.shift();
    }
    historyRef.current.future = []; // Clear redo stack
  }, []);

  // Set active block
  const setActiveBlock = useCallback((blockId: string | null) => {
    setState((prev) => ({ ...prev, activeBlockId: blockId }));
  }, []);

  // Update a specific block
  const updateBlock = useCallback(
    (blockId: string, updates: Partial<ContentBlock>) => {
      setState((prev) => {
        const newBlocks = prev.blocks.map((block) =>
          block.id === blockId ? { ...block, ...updates } : block
        );
        saveToHistory(prev.blocks);
        return { ...prev, blocks: newBlocks };
      });
    },
    [saveToHistory]
  );

  // Add a new block
  const addBlock = useCallback(
    (block: ContentBlock, afterBlockId?: string) => {
      setState((prev) => {
        saveToHistory(prev.blocks);
        
        if (!afterBlockId) {
          return {
            ...prev,
            blocks: [...prev.blocks, block],
            activeBlockId: block.id,
          };
        }

        const index = prev.blocks.findIndex((b) => b.id === afterBlockId);
        const newBlocks = [...prev.blocks];
        newBlocks.splice(index + 1, 0, block);

        return {
          ...prev,
          blocks: newBlocks,
          activeBlockId: block.id,
        };
      });
    },
    [saveToHistory]
  );

  // Delete a block
  const deleteBlock = useCallback(
    (blockId: string) => {
      setState((prev) => {
        // Don't delete if it's the only block
        if (prev.blocks.length === 1) {
          return prev;
        }

        saveToHistory(prev.blocks);
        
        const index = prev.blocks.findIndex((b) => b.id === blockId);
        const newBlocks = prev.blocks.filter((b) => b.id !== blockId);

        // Focus previous block if available, otherwise next
        const newActiveId =
          index > 0 ? newBlocks[index - 1].id : newBlocks[0]?.id || null;

        return {
          ...prev,
          blocks: newBlocks,
          activeBlockId: newActiveId,
        };
      });
    },
    [saveToHistory]
  );

  // Split block at cursor position
  const splitBlockAt = useCallback(
    (blockId: string, position: number) => {
      setState((prev) => {
        saveToHistory(prev.blocks);
        
        const index = prev.blocks.findIndex((b) => b.id === blockId);
        if (index === -1) return prev;

        const block = prev.blocks[index];
        const [beforeBlock, afterBlock] = splitBlock(block, position);

        const newBlocks = [...prev.blocks];
        newBlocks[index] = beforeBlock;
        newBlocks.splice(index + 1, 0, afterBlock);

        return {
          ...prev,
          blocks: newBlocks,
          activeBlockId: afterBlock.id,
        };
      });
    },
    [saveToHistory]
  );

  // Merge with previous block
  const mergeWithPrevious = useCallback(
    (blockId: string) => {
      setState((prev) => {
        const index = prev.blocks.findIndex((b) => b.id === blockId);
        if (index <= 0) return prev; // Can't merge first block

        saveToHistory(prev.blocks);
        
        const currentBlock = prev.blocks[index];
        const previousBlock = prev.blocks[index - 1];
        const mergedBlock = mergeBlocks(previousBlock, currentBlock);

        const newBlocks = [...prev.blocks];
        newBlocks[index - 1] = mergedBlock;
        newBlocks.splice(index, 1);

        return {
          ...prev,
          blocks: newBlocks,
          activeBlockId: mergedBlock.id,
        };
      });
    },
    [saveToHistory]
  );

  // Reorder blocks (for drag and drop)
  const reorderBlocks = useCallback(
    (newBlocks: ContentBlock[]) => {
      setState((prev) => {
        saveToHistory(prev.blocks);
        return { ...prev, blocks: newBlocks };
      });
    },
    [saveToHistory]
  );

  // Undo
  const undo = useCallback(() => {
    const past = historyRef.current.past;
    if (past.length === 0) return;

    const previous = past.pop()!;
    historyRef.current.future.push(state.blocks);

    setState((prev) => ({ ...prev, blocks: previous }));
  }, [state.blocks]);

  // Redo
  const redo = useCallback(() => {
    const future = historyRef.current.future;
    if (future.length === 0) return;

    const next = future.pop()!;
    historyRef.current.past.push(state.blocks);

    setState((prev) => ({ ...prev, blocks: next }));
  }, [state.blocks]);

  return {
    blocks: state.blocks,
    activeBlockId: state.activeBlockId,
    setActiveBlock,
    updateBlock,
    addBlock,
    deleteBlock,
    splitBlockAt,
    mergeWithPrevious,
    reorderBlocks,
    undo,
    redo,
    canUndo: historyRef.current.past.length > 0,
    canRedo: historyRef.current.future.length > 0,
  };
};
