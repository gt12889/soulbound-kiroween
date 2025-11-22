import React, { useEffect, useRef, useState, lazy, Suspense, memo, useCallback } from 'react';
import { useNotes } from '../../contexts/NotesContext';
// import { aiService } from '../../services/aiService'; // Unused
import { useAudio } from '../../hooks/useAudio';
import { TagManager } from '../common/TagManager';
import LoadingFallback from '../common/LoadingFallback';
import ErrorBoundary from '../common/ErrorBoundary';
import type { GhostSuggestion as GhostSuggestionType, ContentBlock } from '../../types';
import { migrateNoteToBlocks, blocksToContent } from '../../utils/blockUtils';
import EnhancedEditor from './EnhancedEditor';
import styles from './NotePage.module.css';

// Lazy load MarkdownEditor for better performance
// Requirement: 1.6
const MarkdownEditor = lazy(() => import('./MarkdownEditor'));

interface NotePageProps {
  noteId: string;
}

/**
 * NotePage component - Renders a single note with parchment styling
 * Completely rebuilt to prevent text mirroring issues
 * Features: Markdown support, AI suggestions, text formatting, tags, search highlighting
 * Requirements: 1.2 - Optimized with React.memo
 */
const NotePageComponent: React.FC<NotePageProps> = ({ noteId }) => {
  const { getNote, updateNote, allTags } = useNotes(); // Removed searchQuery
  const note = getNote(noteId);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  // State management
  const [aiEnabled, setAiEnabled] = useState(false);
  const [suggestions, setSuggestions] = useState<GhostSuggestionType[]>([]);
  const [fontSize, setFontSize] = useState(18);
  const [textColor, setTextColor] = useState('#4a4a4a');
  const [showFormatting, setShowFormatting] = useState(false);
  const [markdownViewMode, setMarkdownViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [useEnhancedEditor, setUseEnhancedEditor] = useState(true);

  const { playGhostDisappear, playSuggestionAccept, playUIClick } = useAudio();

  // Migrate note to blocks on first load if using enhanced editor
  useEffect(() => {
    if (note && useEnhancedEditor && !note.markdown && !note.blocks) {
      const migratedNote = migrateNoteToBlocks(note);
      if (migratedNote.blocks) {
        updateNote(noteId, { blocks: migratedNote.blocks });
      }
    }
  }, [noteId, note, useEnhancedEditor, updateNote]);

  // Handle enhanced editor changes
  const handleEnhancedEditorChange = useCallback(
    (blocks: ContentBlock[]) => {
      // Convert blocks to content for backward compatibility
      const content = blocksToContent(blocks);
      updateNote(noteId, { content, blocks });
    },
    [noteId, updateNote]
  );

  // Focus on content when note changes
  useEffect(() => {
    if (contentRef.current && !note?.markdown && !useEnhancedEditor) {
      contentRef.current.focus();
    }
  }, [noteId, note?.markdown, useEnhancedEditor]);

  // Empty state
  if (!note) {
    return (
      <div className={styles.notePage} dir="ltr">
        <div className={styles.parchment}>
          <p className={styles.emptyMessage}>No note selected</p>
        </div>
      </div>
    );
  }

  // Event handlers
  const handleTitleChange = (e: React.FormEvent<HTMLHeadingElement>) => {
    const newTitle = e.currentTarget.textContent || '';
    updateNote(noteId, { title: newTitle });
  };

  const handleAcceptSuggestion = (suggestion: GhostSuggestionType) => {
    playSuggestionAccept();
    const newContent = note.content + ' ' + suggestion.text;
    updateNote(noteId, { content: newContent });
    
    if (contentRef.current) {
      contentRef.current.textContent = newContent;
    }
    
    setSuggestions([]);
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    playGhostDisappear();
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
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

  // Highlight search matches
  // const highlightedContent = useMemo(() => {
  //   if (!searchQuery.trim() || !note?.content) {
  //     return note?.content || '';
  //   }

  //   const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  //   const parts = note.content.split(regex);

  //   return parts
  //     .map((part) => {
  //       if (part.toLowerCase() === searchQuery.toLowerCase()) {
  //         return `<mark class="${styles.highlight}">${part}</mark>`;
  //       }
  //       return part;
  //     })
  //     .join('');
  // }, [note?.content, searchQuery]);

  // Color palette for text formatting
  const colorPalette = [
    { color: '#1a1a1a', name: 'Black' },
    { color: '#4a4a4a', name: 'Dark Gray (Default)' },
    { color: '#6B7280', name: 'Gray' },
    { color: '#9CA3AF', name: 'Light Gray' },
    { color: '#D1D5DB', name: 'Very Light Gray', border: true },
    { color: '#F3F4F6', name: 'Off White', border: true },
    { color: '#FFFFFF', name: 'White', border: true },
    { color: '#8B4513', name: 'Saddle Brown' },
    { color: '#D97706', name: 'Amber' },
    { color: '#EA580C', name: 'Orange' },
    { color: '#C53030', name: 'Red' },
    { color: '#DC2626', name: 'Bright Red' },
    { color: '#DB2777', name: 'Pink' },
    { color: '#6B46C1', name: 'Purple' },
    { color: '#7C3AED', name: 'Bright Purple' },
    { color: '#2C5282', name: 'Blue' },
    { color: '#0284C7', name: 'Sky Blue' },
    { color: '#2F855A', name: 'Forest Green' },
    { color: '#059669', name: 'Emerald' },
  ];

  return (
    <div className={styles.notePage} dir="ltr">
      {/* Toolbar */}
      <div className={styles.toolbar}>
        {/* Enhanced Editor Toggle */}
        {!note.markdown && (
          <button
            className={`${styles.toolbarButton} ${useEnhancedEditor ? styles.active : ''}`}
            onClick={() => {
              playUIClick();
              setUseEnhancedEditor(!useEnhancedEditor);
            }}
            title={useEnhancedEditor ? 'Use legacy editor' : 'Use enhanced editor'}
          >
            <span>✨</span>
            <span className={styles.buttonLabel}>Enhanced</span>
          </button>
        )}

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

        {/* AI Toggle - only in non-markdown mode */}
        {!note.markdown && (
          <button
            className={`${styles.toolbarButton} ${aiEnabled ? styles.aiEnabled : ''}`}
            onClick={() => {
              playUIClick();
              setAiEnabled(!aiEnabled);
            }}
            title={aiEnabled ? 'Disable AI suggestions' : 'Enable AI suggestions'}
          >
            <span className={styles.aiIcon}>👻</span>
            <span className={styles.buttonLabel}>AI</span>
          </button>
        )}

        {/* Formatting Toggle - only in non-markdown mode */}
        {!note.markdown && (
          <button
            className={`${styles.toolbarButton} ${showFormatting ? styles.active : ''}`}
            onClick={() => {
              playUIClick();
              setShowFormatting(!showFormatting);
            }}
            title="Text formatting"
          >
            <span>🎨</span>
            <span className={styles.buttonLabel}>Format</span>
          </button>
        )}

        {/* Formatting Panel */}
        {showFormatting && !note.markdown && (
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
                {colorPalette.map(({ color, name, border }) => (
                  <button
                    key={color}
                    className={`${styles.colorButton} ${textColor === color ? styles.activeColor : ''}`}
                    style={{
                      background: color,
                      ...(border && { border: '1px solid #9CA3AF' }),
                    }}
                    onClick={() => handleColorChange(color)}
                    title={name}
                  />
                ))}
              </div>
            </div>

            {/* Text Formatting */}
            <div className={styles.formattingGroup}>
              <label className={styles.formattingLabel}>Style</label>
              <div className={styles.styleButtons}>
                <button className={styles.styleButton} onClick={() => handleFormatCommand('bold')} title="Bold">
                  <strong>B</strong>
                </button>
                <button className={styles.styleButton} onClick={() => handleFormatCommand('italic')} title="Italic">
                  <em>I</em>
                </button>
                <button className={styles.styleButton} onClick={() => handleFormatCommand('underline')} title="Underline">
                  <u>U</u>
                </button>
                <button className={styles.styleButton} onClick={() => handleFormatCommand('strikeThrough')} title="Strikethrough">
                  <s>S</s>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {note.markdown ? (
        <div className={styles.markdownContainer}>
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback message="Preparing ancient scrolls..." />}>
              <MarkdownEditor
                content={note.content}
                onChange={(content) => updateNote(noteId, { content })}
                viewMode={markdownViewMode}
                onViewModeChange={setMarkdownViewMode}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      ) : useEnhancedEditor ? (
        <div className={styles.enhancedEditorContainer}>
          {/* Note Title */}
          <h2
            ref={titleRef}
            className={styles.noteTitle}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTitleChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            dir="ltr"
          >
            {note.title}
          </h2>

          {/* Tags Section */}
          <div className={styles.tagsSection}>
            <TagManager
              tags={note.tags || []}
              allTags={allTags}
              onTagsChange={(tags) => updateNote(noteId, { tags })}
              placeholder="Add tags..."
            />
          </div>

          {/* Enhanced Editor */}
          <ErrorBoundary>
            <EnhancedEditor
              initialBlocks={note.blocks || migrateNoteToBlocks(note).blocks || []}
              onChange={handleEnhancedEditorChange}
              autoSave={true}
              autoSaveDelay={1000}
            />
          </ErrorBoundary>
        </div>
      ) : (
        <div className={styles.parchment} dir="ltr">
          {/* Dripping ink border animation */}
          <div className={styles.inkBorder}>
            {[...Array(7)].map((_, i) => (
              <div key={i} className={styles.inkDrip} />
            ))}
          </div>

          {/* Note Title */}
          <h2
            ref={titleRef}
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
            dir="ltr"
          >
            {note.title}
          </h2>

          {/* Tags Section */}
          <div className={styles.tagsSection}>
            <TagManager
              tags={note.tags || []}
              allTags={allTags}
              onTagsChange={(tags) => updateNote(noteId, { tags })}
              placeholder="Add tags..."
            />
          </div>

          {/* Note Content - Using textarea as fallback */}
          <textarea
            ref={contentRef as any}
            className={styles.noteContent}
            dir="ltr"
            value={note.content}
            onChange={(e) => updateNote(noteId, { content: e.target.value })}
            placeholder="Begin your inscription..."
            style={{
              fontSize: `${fontSize}px`,
              color: textColor,
              transform: 'scaleX(1)',
              WebkitTransform: 'scaleX(1)',
              direction: 'ltr',
              unicodeBidi: 'normal',
              textAlign: 'left',
              resize: 'none',
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontFamily: 'inherit',
            }}
          />
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleAcceptSuggestion(suggestion);
                    }
                  }}
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
        </div>
      )}
    </div>
  );
};

/**
 * Memoized NotePage component
 * Only re-renders when noteId changes
 * Requirements: 1.2
 */
const NotePage = memo(NotePageComponent, (prevProps, nextProps) => {
  return prevProps.noteId === nextProps.noteId;
});

export default NotePage;
