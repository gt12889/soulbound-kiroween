/**
 * Block Utilities
 * Helper functions for working with block-based content
 */

import type { ContentBlock, BlockType, Note } from '../types';

/**
 * Generate a unique ID for blocks
 */
export const generateBlockId = (): string => {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Convert legacy content string to blocks
 * Handles backward compatibility for existing notes
 */
export const contentToBlocks = (content: string): ContentBlock[] => {
  if (!content || content.trim().length === 0) {
    return [
      {
        id: generateBlockId(),
        type: 'paragraph',
        content: '',
        properties: {},
      },
    ];
  }

  // Split by double newlines (paragraphs)
  const paragraphs = content.split('\n\n').filter((p) => p.trim().length > 0);

  return paragraphs.map((para) => {
    const trimmed = para.trim();

    // Detect heading
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      return {
        id: generateBlockId(),
        type: `heading-${level}` as BlockType,
        content: headingMatch[2],
        properties: { level },
      };
    }

    // Detect bullet list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return {
        id: generateBlockId(),
        type: 'bullet-list',
        content: trimmed.substring(2),
        properties: {},
      };
    }

    // Detect numbered list
    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      return {
        id: generateBlockId(),
        type: 'numbered-list',
        content: numberedMatch[1],
        properties: {},
      };
    }

    // Detect quote
    if (trimmed.startsWith('> ')) {
      return {
        id: generateBlockId(),
        type: 'quote',
        content: trimmed.substring(2),
        properties: {},
      };
    }

    // Detect code block
    if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
      const lines = trimmed.split('\n');
      const language = lines[0].substring(3).trim() || 'plaintext';
      const code = lines.slice(1, -1).join('\n');
      return {
        id: generateBlockId(),
        type: 'code',
        content: code,
        properties: { language },
      };
    }

    // Default to paragraph
    return {
      id: generateBlockId(),
      type: 'paragraph',
      content: trimmed,
      properties: {},
    };
  });
};

/**
 * Convert blocks to legacy content string
 * Ensures backward compatibility
 */
export const blocksToContent = (blocks: ContentBlock[]): string => {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'heading-1':
        case 'heading-2':
        case 'heading-3':
        case 'heading-4':
        case 'heading-5':
        case 'heading-6': {
          const level = parseInt(block.type.split('-')[1]);
          return '#'.repeat(level) + ' ' + block.content;
        }
        case 'bullet-list':
          return '- ' + block.content;
        case 'numbered-list':
          return '1. ' + block.content;
        case 'quote':
          return '> ' + block.content;
        case 'code': {
          const language = block.properties.language || '';
          return '```' + language + '\n' + block.content + '\n```';
        }
        case 'divider':
          return '---';
        case 'callout':
        case 'paragraph':
        default:
          return block.content;
      }
    })
    .join('\n\n');
};

/**
 * Split a block at a given position
 */
export const splitBlock = (
  block: ContentBlock,
  position: number
): [ContentBlock, ContentBlock] => {
  const beforeContent = block.content.substring(0, position);
  const afterContent = block.content.substring(position);

  const beforeBlock: ContentBlock = {
    ...block,
    id: block.id, // Keep original ID
    content: beforeContent,
  };

  const afterBlock: ContentBlock = {
    ...block,
    id: generateBlockId(), // New ID for new block
    content: afterContent,
    type: 'paragraph', // New block defaults to paragraph
    properties: {},
  };

  return [beforeBlock, afterBlock];
};

/**
 * Merge two blocks
 */
export const mergeBlocks = (block1: ContentBlock, block2: ContentBlock): ContentBlock => {
  return {
    ...block1,
    content: block1.content + block2.content,
  };
};

/**
 * Create a new empty block
 */
export const createEmptyBlock = (type: BlockType = 'paragraph'): ContentBlock => {
  return {
    id: generateBlockId(),
    type,
    content: '',
    properties: {},
  };
};

/**
 * Migrate a note to use blocks if it doesn't have them
 */
export const migrateNoteToBlocks = (note: Note): Note => {
  if (note.blocks && note.blocks.length > 0) {
    return note; // Already has blocks
  }

  return {
    ...note,
    blocks: contentToBlocks(note.content),
  };
};

/**
 * Check if a block is empty
 */
export const isBlockEmpty = (block: ContentBlock): boolean => {
  return block.content.trim().length === 0;
};

/**
 * Get block type display name
 */
export const getBlockTypeName = (type: BlockType): string => {
  const names: Record<BlockType, string> = {
    paragraph: 'Paragraph',
    'heading-1': 'Heading 1',
    'heading-2': 'Heading 2',
    'heading-3': 'Heading 3',
    'heading-4': 'Heading 4',
    'heading-5': 'Heading 5',
    'heading-6': 'Heading 6',
    'bullet-list': 'Bullet List',
    'numbered-list': 'Numbered List',
    checklist: 'Checklist',
    code: 'Code Block',
    quote: 'Quote',
    callout: 'Callout',
    divider: 'Divider',
    table: 'Table',
  };
  return names[type] || 'Unknown';
};
