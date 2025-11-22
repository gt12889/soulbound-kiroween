import React, { useRef, useEffect, useState } from 'react';
import MarkdownPreview from './MarkdownPreview';
import { useAudio } from '../../hooks/useAudio';
import styles from './MarkdownEditor.module.css';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  viewMode: 'edit' | 'preview' | 'split';
  onViewModeChange?: (mode: 'edit' | 'preview' | 'split') => void;
}

/**
 * MarkdownEditor component - Split-view editor with toolbar
 * Requirements: 16.2, 16.4, 16.5
 */
const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  content,
  onChange,
  viewMode,
  onViewModeChange,
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewScrollRef = useRef<number>(0);
  const editorScrollRef = useRef<number>(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const { playUIClick } = useAudio();

  // Focus editor on mount
  useEffect(() => {
    if (viewMode !== 'preview' && editorRef.current) {
      editorRef.current.focus();
    }
  }, [viewMode]);

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Scroll sync between editor and preview
  const handleEditorScroll = () => {
    if (!editorRef.current || viewMode !== 'split' || isScrolling) return;
    
    setIsScrolling(true);
    const scrollPercentage = editorRef.current.scrollTop / 
      (editorRef.current.scrollHeight - editorRef.current.clientHeight);
    editorScrollRef.current = scrollPercentage;
    
    setTimeout(() => setIsScrolling(false), 100);
  };

  const handlePreviewScroll = (scrollTop: number, scrollHeight: number) => {
    if (viewMode !== 'split' || isScrolling) return;
    
    setIsScrolling(true);
    const scrollPercentage = scrollTop / scrollHeight;
    previewScrollRef.current = scrollPercentage;
    
    setTimeout(() => setIsScrolling(false), 100);
  };

  // Insert markdown formatting at cursor
  const insertMarkdown = (before: string, after: string = '', placeholder: string = 'text') => {
    playUIClick();
    
    if (!editorRef.current) return;

    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newContent = 
      content.substring(0, start) +
      before + textToInsert + after +
      content.substring(end);
    
    onChange(newContent);

    // Set cursor position after insertion
    setTimeout(() => {
      if (textarea) {
        const newCursorPos = start + before.length + textToInsert.length;
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Keyboard shortcuts for formatting
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          insertMarkdown('**', '**', 'bold text');
          break;
        case 'i':
          e.preventDefault();
          insertMarkdown('*', '*', 'italic text');
          break;
        case 'k':
          e.preventDefault();
          insertMarkdown('[', '](url)', 'link text');
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className={styles.markdownEditor}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        {/* View mode toggles */}
        <div className={styles.viewModeGroup}>
          <button
            className={`${styles.toolbarButton} ${viewMode === 'edit' ? styles.active : ''}`}
            onClick={() => {
              playUIClick();
              onViewModeChange?.('edit');
            }}
            title="Edit mode"
          >
            ✍️ Edit
          </button>
          <button
            className={`${styles.toolbarButton} ${viewMode === 'split' ? styles.active : ''}`}
            onClick={() => {
              playUIClick();
              onViewModeChange?.('split');
            }}
            title="Split view"
          >
            ⚡ Split
          </button>
          <button
            className={`${styles.toolbarButton} ${viewMode === 'preview' ? styles.active : ''}`}
            onClick={() => {
              playUIClick();
              onViewModeChange?.('preview');
            }}
            title="Preview mode"
          >
            👁️ Preview
          </button>
        </div>

        {/* Formatting buttons */}
        {viewMode !== 'preview' && (
          <div className={styles.formattingGroup}>
            <button
              className={styles.toolbarButton}
              onClick={() => insertMarkdown('# ', '', 'Heading 1')}
              title="Heading 1 (H1)"
            >
              H1
            </button>
            <button
              className={styles.toolbarButton}
              onClick={() => insertMarkdown('## ', '', 'Heading 2')}
              title="Heading 2 (H2)"
            >
              H2
            </button>
            <button
              className={styles.toolbarButton}
              onClick={() => insertMarkdown('### ', '', 'Heading 3')}
              title="Heading 3 (H3)"
            >
              H3
            </button>
            <div className={styles.separator} />
            <button
              className={styles.toolbarButton}
              onClick={() => insertMarkdown('**', '**', 'bold')}
              title="Bold (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            <button
              className={styles.toolbarButton}
              onClick={() => insertMarkdown('*', '*', 'italic')}
              title="Italic (Ctrl+I)"
            >
              <em>I</em>
            </button>
            <button
              className={styles.toolbarButton}
              onClick={() => insertMarkdown('~~', '~~', 'strikethrough')}
              title="Strikethrough"
            >
              <s>S</s>
            </button>
            <div className={styles.separator} />
            <button
              className={styles.toolbarButton}
              onClick={() => insertMarkdown('[', '](url)', 'link')}
              title="Link (Ctrl+K)"
            >
              🔗
            </button>
            <button
              className={styles.toolbarButton}
              onClick={() => insertMarkdown('`', '`', 'code')}
              title="Inline code"
            >
              {'</>'}
            </button>
            <button
              className={styles.toolbarButton}
              onClick={() => insertMarkdown('```\n', '\n```', 'code block')}
              title="Code block"
            >
              📝
            </button>
            <div className={styles.separator} />
            <button
              className={styles.toolbarButton}
              onClick={() => insertMarkdown('- ', '', 'list item')}
              title="Bullet list"
            >
              •
            </button>
            <button
              className={styles.toolbarButton}
              onClick={() => insertMarkdown('1. ', '', 'list item')}
              title="Numbered list"
            >
              1.
            </button>
            <button
              className={styles.toolbarButton}
              onClick={() => insertMarkdown('> ', '', 'quote')}
              title="Blockquote"
            >
              "
            </button>
          </div>
        )}
      </div>

      {/* Editor and preview area */}
      <div className={styles.editorContainer}>
        {/* Editor */}
        {viewMode !== 'preview' && (
          <div className={`${styles.editorPane} ${viewMode === 'split' ? styles.split : ''}`}>
            <textarea
              ref={editorRef}
              className={styles.textarea}
              value={content}
              onChange={handleEditorChange}
              onScroll={handleEditorScroll}
              onKeyDown={handleKeyDown}
              placeholder="Write your markdown here..."
              spellCheck={true}
            />
          </div>
        )}

        {/* Preview */}
        {viewMode !== 'edit' && (
          <div className={`${styles.previewPane} ${viewMode === 'split' ? styles.split : ''}`}>
            <MarkdownPreview
              content={content}
              scrollSync={viewMode === 'split'}
              onScroll={handlePreviewScroll}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
