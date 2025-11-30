import React from 'react';
import type { ContentBlock } from '../../../types';
import styles from './blocks.module.css';

interface QuoteBlockProps {
  block: ContentBlock;
  onUpdate: (block: ContentBlock) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * QuoteBlock - Blockquote for quotations
 */
const QuoteBlock: React.FC<QuoteBlockProps> = ({ block, onUpdate, onKeyDown }) => {
  const handleInput = (e: React.FormEvent<HTMLQuoteElement>) => {
    onUpdate({
      ...block,
      content: e.currentTarget.textContent || '',
    });
  };

  return (
    <blockquote
      className={styles.quoteBlock}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={onKeyDown}
      data-block-type="quote"
    >
      {block.content}
    </blockquote>
  );
};

export default QuoteBlock;
