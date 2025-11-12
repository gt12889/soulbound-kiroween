import React, { useEffect, useRef, useMemo } from 'react';
import { useNotes } from '../../contexts/NotesContext';
import styles from './NotePage.module.css';

interface NotePageProps {
  noteId: string;
}

/**
 * NotePage component - Renders a single note with parchment styling
 * Requirements: 3.1, 3.3, 3.4, 3.6
 */
const NotePage: React.FC<NotePageProps> = ({ noteId }) => {
  const { getNote, updateNote, searchQuery } = useNotes();
  const note = getNote(noteId);
  const contentRef = useRef<HTMLDivElement>(null);

  // Focus on content when note changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.focus();
    }
  }, [noteId]);

  if (!note) {
    return (
      <div className={styles.notePage}>
        <div className={styles.parchment}>
          <p className={styles.emptyMessage}>No note selected</p>
        </div>
      </div>
    );
  }

  const handleTitleChange = (e: React.FormEvent<HTMLHeadingElement>) => {
    const newTitle = e.currentTarget.textContent || '';
    updateNote(noteId, { title: newTitle });
  };

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || '';
    updateNote(noteId, { content: newContent });
  };

  // Highlight search matches in content
  const highlightedContent = useMemo(() => {
    if (!searchQuery.trim() || !note?.content) {
      return note?.content || '';
    }

    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = note.content.split(regex);

    return parts
      .map((part) => {
        if (part.toLowerCase() === searchQuery.toLowerCase()) {
          return `<mark class="${styles.highlight}">${part}</mark>`;
        }
        return part;
      })
      .join('');
  }, [note?.content, searchQuery]);

  return (
    <div className={styles.notePage}>
      <div className={styles.parchment}>
        {/* Dripping ink border animation - Requirement 3.4 */}
        <div className={styles.inkBorder}>
          <div className={styles.inkDrip} />
          <div className={styles.inkDrip} />
          <div className={styles.inkDrip} />
          <div className={styles.inkDrip} />
          <div className={styles.inkDrip} />
          <div className={styles.inkDrip} />
          <div className={styles.inkDrip} />
        </div>

        {/* Note title */}
        <h2
          className={styles.noteTitle}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleTitleChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              contentRef.current?.focus();
            }
          }}
        >
          {note.title}
        </h2>

        {/* Note content */}
        <div
          ref={contentRef}
          className={styles.noteContent}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleContentChange}
          data-placeholder="Begin your inscription..."
          dangerouslySetInnerHTML={searchQuery ? { __html: highlightedContent } : undefined}
        >
          {!searchQuery && note.content}
        </div>

        {/* Torn edges effect */}
        <div className={styles.tornEdgeTop} />
        <div className={styles.tornEdgeBottom} />
      </div>
    </div>
  );
};

export default NotePage;
