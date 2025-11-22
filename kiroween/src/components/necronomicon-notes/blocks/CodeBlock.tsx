import React from 'react';
import type { ContentBlock } from '../../../types';
import styles from './blocks.module.css';

interface CodeBlockProps {
  block: ContentBlock;
  onUpdate: (block: ContentBlock) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * CodeBlock - Code block with language selector
 */
const CodeBlock: React.FC<CodeBlockProps> = ({ block, onUpdate, onKeyDown }) => {
  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    onUpdate({
      ...block,
      content: e.currentTarget.textContent || '',
    });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({
      ...block,
      properties: {
        ...block.properties,
        language: e.target.value,
      },
    });
  };

  return (
    <div className={styles.codeBlockWrapper} data-block-type="code">
      <div className={styles.codeBlockHeader}>
        <select
          value={block.properties.language || 'plaintext'}
          onChange={handleLanguageChange}
          className={styles.languageSelect}
          aria-label="Select code language"
        >
          <option value="plaintext">Plain Text</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="css">CSS</option>
          <option value="html">HTML</option>
          <option value="json">JSON</option>
          <option value="markdown">Markdown</option>
          <option value="bash">Bash</option>
          <option value="sql">SQL</option>
        </select>
      </div>
      <pre className={styles.codeBlock}>
        <code
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={onKeyDown}
        >
          {block.content}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
