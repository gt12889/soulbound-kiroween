import React from 'react';
import type { ContentBlock } from '../../../types';
import styles from './blocks.module.css';

interface CalloutBlockProps {
  block: ContentBlock;
  onUpdate: (block: ContentBlock) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * CalloutBlock - Highlighted callout box with color variants
 */
const CalloutBlock: React.FC<CalloutBlockProps> = ({ block, onUpdate, onKeyDown }) => {
  const color = block.properties.color || 'purple';

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onUpdate({
      ...block,
      content: e.currentTarget.textContent || '',
    });
  };

  const getIcon = () => {
    switch (color) {
      case 'green':
        return '✓';
      case 'red':
        return '⚠';
      case 'blue':
        return 'ℹ';
      case 'yellow':
        return '⚡';
      default:
        return '💡';
    }
  };

  return (
    <div
      className={`${styles.calloutBlock} ${styles[`callout-${color}`]}`}
      data-block-type="callout"
      data-color={color}
    >
      <div className={styles.calloutIcon}>{getIcon()}</div>
      <div
        className={styles.calloutContent}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={onKeyDown}
      >
        {block.content}
      </div>
    </div>
  );
};

export default CalloutBlock;
