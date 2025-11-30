import React from 'react';
import type { ContentBlock } from '../../../types';
import styles from './blocks.module.css';

interface ListBlockProps {
  block: ContentBlock;
  onUpdate: (block: ContentBlock) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * ListBlock - Bullet list, numbered list, or checklist item
 */
const ListBlock: React.FC<ListBlockProps> = ({ block, onUpdate, onKeyDown }) => {
  const isNumbered = block.type === 'numbered-list';
  const isChecklist = block.type === 'checklist';

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onUpdate({
      ...block,
      content: e.currentTarget.textContent || '',
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...block,
      properties: {
        ...block.properties,
        checked: e.target.checked,
      },
    });
  };

  return (
    <div className={styles.listBlock} data-block-type={block.type}>
      {isChecklist && (
        <input
          type="checkbox"
          checked={block.properties.checked || false}
          onChange={handleCheckboxChange}
          className={styles.checkbox}
          aria-label="Toggle checklist item"
        />
      )}
      {isNumbered && <span className={styles.listNumber}>1.</span>}
      {!isNumbered && !isChecklist && <span className={styles.bullet}>•</span>}
      <div
        className={styles.listContent}
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

export default ListBlock;
