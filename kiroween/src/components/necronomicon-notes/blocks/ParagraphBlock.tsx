import React from 'react';
import type { ContentBlock } from '../../../types';
import styles from './blocks.module.css';

interface ParagraphBlockProps {
  block: ContentBlock;
  onUpdate: (block: ContentBlock) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * ParagraphBlock - Standard paragraph text block
 */
const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ block, onUpdate, onKeyDown }) => {
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onUpdate({
      ...block,
      content: e.currentTarget.textContent || '',
    });
  };

  return (
    <div
      className={styles.paragraphBlock}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={onKeyDown}
      data-block-type="paragraph"
    >
      {block.content}
    </div>
  );
};

export default ParagraphBlock;
