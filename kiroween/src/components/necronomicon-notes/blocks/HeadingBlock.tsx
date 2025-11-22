import React from 'react';
import type { ContentBlock } from '../../../types';
import styles from './blocks.module.css';

interface HeadingBlockProps {
  block: ContentBlock;
  onUpdate: (block: ContentBlock) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * HeadingBlock - Heading text block (H1-H6)
 */
const HeadingBlock: React.FC<HeadingBlockProps> = ({ block, onUpdate, onKeyDown }) => {
  const level = parseInt(block.type.split('-')[1]) || 1;
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  const handleInput = (e: React.FormEvent<HTMLHeadingElement>) => {
    onUpdate({
      ...block,
      content: e.currentTarget.textContent || '',
    });
  };

  return (
    <Tag
      className={styles.headingBlock}
      data-level={level}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={onKeyDown}
      data-block-type={`heading-${level}`}
    >
      {block.content}
    </Tag>
  );
};

export default HeadingBlock;
