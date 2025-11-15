import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useNotes } from '../../contexts/NotesContext';
import { aiService } from '../../services/aiService';
import { useAudio } from '../../hooks/useAudio';
import { TagManager } from '../common/TagManager';
import MarkdownEditor from './MarkdownEditor';
import type { GhostSuggestion as GhostSuggestionType } from '../../types';
import styles from './NotePage.module.css';

interface NotePageProps {
  noteId: string;
}

/**
 * NotePage component - Renders a single note with parchment styling
 * Requirements: 3.1, 3.3, 3.4, 3.6
 */
const NotePage: React.FC<NotePageProps> = ({ noteId }) => {
  const { getNote, updateNote, searchQuery, allTags } = useNotes();
  const note = getNote(noteId);
  const contentRef = useRef<HTMLDivElement>(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [suggestions, setSuggestions] = useState<GhostSuggestionType[]>([]);
  const [fontSize, setFontSize] = useState(18);
  const [textColor, setTextColor] = useState('#4a4a4a');
  const [showFormatting, setShowFormatting] = useState(false);
  const [markdownViewMode, setMarkdownViewMode] = useState<'edit' | 'preview' | 'split'>('split');

  const suggestionTimerRef = useRef<number | null>(null);
  const { playGhostAppear, playGhostDisappear, playSuggestionAccept, playUIClick } = useAudio();

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

    // Generate AI suggestions if enabled
    if (aiEnabled && newContent.length > 10) {
      if (suggestionTimerRef.current) {
        clearTimeout(suggestionTimerRef.current);
      }

      suggestionTimerRef.current = setTimeout(async () => {
        try {
          const suggestionText = await aiService.getSuggestion(newContent);
          const newSuggestion: GhostSuggestionType = {
            id: crypto.randomUUID(),
            text: suggestionText,
            position: newContent.length,
            confidence: 0.8,
          };
          playGhostAppear();
          setSuggestions([newSuggestion]);
        } catch (error) {
          console.error('Failed to get AI suggestion:', error);
        }
      }, 1500);
    }
  };

  const handleAcceptSuggestion = (suggestion: GhostSuggestionType) => {
    if (!note) return;
    
    playSuggestionAccept();
    const newContent = note.content + ' ' + suggestion.text;
    updateNote(noteId, { content: newContent });
    
    // Update the contentEditable div
    if (contentRef.current) {
      contentRef.current.textContent = newContent;
    }
    
    setSuggestions([]);
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    playGhostDisappear();
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const handleFormatCommand = (command: string, value?: string) => {
    playUIClick();
    document.execCommand(command, false, value);
    contentRef.current?.focus();
  };

  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize);
    playUIClick();
  };

  const handleColorChange = (newColor: string) => {
    setTextColor(newColor);
    playUIClick();
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
      {/* Toolbar */}
      <div className={styles.toolbar}>
        {/* Markdown Toggle */}
        <button
          className={`${styles.toolbarButton} ${note.markdown ? styles.active : ''}`}
          onClick={() => {
            playUIClick();
            updateNote(noteId, { markdown: !note.markdown });
          }}
          title={note.markdown ? 'Disable markdown' : 'Enable markdown'}
        >
          <span>📝</span>
          <span className={styles.buttonLabel}>Markdown</span>
        </button>

        {/* AI Toggle - only show in non-markdown mode */}
        {!note.markdown && (
          <button
            className={`${styles.toolbarButton} ${aiEnabled ? styles.aiEnabled : ''}`}
            onClick={() => setAiEnabled(!aiEnabled)}
            title={aiEnabled ? 'Disable AI suggestions' : 'Enable AI suggestions'}
          >
            <span className={styles.aiIcon}>👻</span>
            <span className={styles.buttonLabel}>AI</span>
          </button>
        )}

        {/* Formatting Toggle - only show in non-markdown mode */}
        {!note.markdown && (
          <button
            className={`${styles.toolbarButton} ${showFormatting ? styles.active : ''}`}
            onClick={() => setShowFormatting(!showFormatting)}
            title="Text formatting"
          >
            <span>🎨</span>
            <span className={styles.buttonLabel}>Format</span>
          </button>
        )}

        {/* Formatting Options */}
        {showFormatting && (
          <div className={styles.formattingPanel}>
            {/* Font Size */}
            <div className={styles.formattingGroup}>
              <label className={styles.formattingLabel}>Size</label>
              <div className={styles.sizeButtons}>
                <button
                  className={styles.sizeButton}
                  onClick={() => handleFontSizeChange(Math.max(12, fontSize - 2))}
                  title="Decrease font size"
                >
                  A-
                </button>
                <span className={styles.sizeValue}>{fontSize}px</span>
                <button
                  className={styles.sizeButton}
                  onClick={() => handleFontSizeChange(Math.min(32, fontSize + 2))}
                  title="Increase font size"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Text Color */}
            <div className={styles.formattingGroup}>
              <label className={styles.formattingLabel}>Color</label>
              <div className={styles.colorButtons}>
                <button
                  className={`${styles.colorButton} ${textColor === '#1a1a1a' ? styles.activeColor : ''}`}
                  style={{ background: '#1a1a1a' }}
                  onClick={() => handleColorChange('#1a1a1a')}
                  title="Black"
                />
                <button
                  className={`${styles.colorButton} ${textColor === '#4a4a4a' ? styles.activeColor : ''}`}
                  style={{ background: '#4a4a4a' }}
                  onClick={() => handleColorChange('#4a4a4a')}
                  title="Dark Gray (Default)"
                />
                <button
                  className={`${styles.colorButton} ${textColor === '#6B7280' ? styles.activeColor : ''}`}
                  style={{ background: '#6B7280' }}
                  onClick={() => handleColorChange('#6B7280')}
                  title="Gray"
                />
                <button
                  className={`${styles.colorButton} ${textColor === '#9CA3AF' ? styles.activeColor : ''}`}
                  style={{ background: '#9CA3AF' }}
                  onClick={() => handleColorChange('#9CA3AF')}
                  title="Light Gray"
                />
                <button
                  className={`${styles.colorButton} ${textColor === '#D1D5DB' ? styles.activeColor : ''}`}
                  style={{ background: '#D1D5DB', border: '1px solid #9CA3AF' }}
                  onClick={() => handleColorChange('#D1D5DB')}
                  title="Very Light Gray"
                />
                <button
                  className={`${styles.colorButton} ${textColor === '#F3F4F6' ? styles.activeColor : ''}`}
                  style={{ background: '#F3F4F6', border: '1px solid #9CA3AF' }}
                  onClick={() => handleColorChange('#F3F4F6')}
                  title="Off White"
                />
                <button
                  className={`${styles.colorButton} ${textColor === '#FFFFFF' ? styles.activeColor : ''}`}
                  style={{ background: '#FFFFFF', border: '1px solid #9CA3AF' }}
                  onClick={() => handleColorChange('#FFFFFF')}
                  title="White"
                />
                <button
                  className={`${styles.colorButton} ${textColor === '#8B4513' ? styles.activeColor : ''}`}
                  style={{ background: '#8B4513' }}
                  onClick={() => handleColorChange('#8B4513')}
                  title="Saddle Brown"
                />
                <button
                  className={`${styles.colorButton} ${textColor === '#D97706' ? styles.activeColor : ''}`}
                  style={{ background: '#D97706' }}
                  onClick={() => handleColorChange('#D97706')}
                  title="Amber"
                />
                <button
                  className={`${styles.colorButton} ${textColor === '#EA580C' ? styles.activeColor : ''}`}
                  style={{ background: '#EA580C' }}
                  onClick={() => handleColorChange('#EA580C')}
                  title="Orange"
                />
                <button
                  className={`${styles.colorButton} ${textColor === '#C53030' ? styles.activeColor : ''}`}
                  style={{ background: '#C53030' }}
                  onClick={() => handleColorChange('#C53030')}
                  title="Red"
                />
                <button
                  className={`${styles.colorButton} ${textColor === '#DC2626' ? styles.activeColor : ''}`}
                  style={{ background: '#DC2626' }}
                  onClick={() => handleColorChange('#DC2626')}
                  title="Bright Red"
                />
                <button
                  className={`${styles.colorButton} ${textColor === '#DB2777' ? styles.activeColor : ''}`}
                  style={{ background: '#DB2777' }}
                  onClick={() => handleColorChange('#DB2777')}
                  title="Pink"
                />
                <button
                  className={`${styles.colorButton} ${textColor === '#6B46C1' ? styles.activeColor : ''}`}
                  style={{ background: '#6B46C1' }}
                  onClick={() => handleColorChange('#6B46C1')}
                  title="Purple"
                />
                <button
                  className={`${styles.colorButton} ${textColor === '#7C3AED' ? styles.activeColor : ''}`}
                  style={{ background: '#7C3AED' }}
                  onClick={() => handleColorChange('#7C3AED')}
                  title="Bright Purple"
                />
                <button
                  className={`${styles.colorButton} ${textColor === '#2C5282' ? styles.activeColor : ''}`}
                  style={{ background: '#2C5282' }}
                  onClick={() => handleColorChange('#2C5282')}
                  title="Blue"
                />
                <button
                  className={`${styles.colorButton} ${textColor === '#0284C7' ? styles.activeColor : ''}`}
                  style={{ background: '#0284C7' }}
                  onClick={() => handleColorChange('#0284C7')}
                  title="Sky Blue"
                />
                <button
                  className={`${styles.colorButton} ${textColor === '#2F855A' ? styles.activeColor : ''}`}
                  style={{ background: '#2F855A' }}
                  onClick={() => handleColorChange('#2F855A')}
                  title="Forest Green"
                />
                <button
                  className={`${styles.colorButton} ${textColor === '#059669' ? styles.activeColor : ''}`}
                  style={{ background: '#059669' }}
                  onClick={() => handleColorChange('#059669')}
                  title="Emerald"
                />
              </div>
            </div>

            {/* Text Formatting */}
            <div className={styles.formattingGroup}>
              <label className={styles.formattingLabel}>Style</label>
              <div className={styles.styleButtons}>
                <button
                  className={styles.styleButton}
                  onClick={() => handleFormatCommand('bold')}
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  className={styles.styleButton}
                  onClick={() => handleFormatCommand('italic')}
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  className={styles.styleButton}
                  onClick={() => handleFormatCommand('underline')}
                  title="Underline"
                >
                  <u>U</u>
                </button>
                <button
                  className={styles.styleButton}
                  onClick={() => handleFormatCommand('strikeThrough')}
                  title="Strikethrough"
                >
                  <s>S</s>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Render markdown editor or regular editor based on markdown flag */}
      {note.markdown ? (
        <div className={styles.markdownContainer}>
          <MarkdownEditor
            content={note.content}
            onChange={(content) => updateNote(noteId, { content })}
            viewMode={markdownViewMode}
            onViewModeChange={setMarkdownViewMode}
          />
        </div>
      ) : (
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

          {/* Tags */}
          <div className={styles.tagsSection}>
            <TagManager
              tags={note.tags || []}
              allTags={allTags}
              onTagsChange={(tags) => updateNote(noteId, { tags })}
              placeholder="Add tags..."
            />
          </div>

          {/* Note content */}
          <div
            ref={contentRef}
            className={styles.noteContent}
            contentEditable
            suppressContentEditableWarning
            onInput={handleContentChange}
            data-placeholder="Begin your inscription..."
            style={{ fontSize: `${fontSize}px`, color: textColor }}
            dangerouslySetInnerHTML={searchQuery ? { __html: highlightedContent } : undefined}
          >
            {!searchQuery && note.content}
          </div>

          {/* AI Suggestions */}
          {aiEnabled && suggestions.length > 0 && (
            <div className={styles.suggestionsContainer}>
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={styles.suggestion}
                  onClick={() => handleAcceptSuggestion(suggestion)}
                  role="button"
                  tabIndex={0}
                >
                  <span className={styles.suggestionIcon}>👻</span>
                  <span className={styles.suggestionText}>{suggestion.text}</span>
                  <button
                    className={styles.dismissButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismissSuggestion(suggestion.id);
                    }}
                    aria-label="Dismiss suggestion"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Torn edges effect */}
          <div className={styles.tornEdgeTop} />
          <div className={styles.tornEdgeBottom} />
        </div>
      )}
    </div>
  );
};

export default NotePage;
