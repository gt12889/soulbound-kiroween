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

  const handleInput = (e: React.FormEvent<HTMLHeadingElement>) => {
    onUpdate({
      ...block,
      content: e.currentTarget.textContent || '',
    });
  };

  // Use React.createElement to avoid JSX namespace issues with dynamic tags
  const headingProps = {
    className: styles.headingBlock,
    'data-level': level,
    contentEditable: true,
    suppressContentEditableWarning: true,
    onInput: handleInput,
    onKeyDown,
    'data-block-type': `heading-${level}`,
  };

  // Create the appropriate heading element based on level
  return React.createElement(
    `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
    headingProps,
    block.content
  );
};

export default HeadingBlock;
