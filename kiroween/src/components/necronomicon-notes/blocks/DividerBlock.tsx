import React from 'react';
import type { ContentBlock } from '../../../types';
import styles from './blocks.module.css';

interface DividerBlockProps {
  block: ContentBlock;
}

/**
 * DividerBlock - Horizontal divider line
 */
const DividerBlock: React.FC<DividerBlockProps> = ({ block }) => {
  return (
    <div className={styles.dividerBlock} data-block-type="divider" data-block-id={block.id}>
      <hr className={styles.divider} />
    </div>
  );
};

export default DividerBlock;
