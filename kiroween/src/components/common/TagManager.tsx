import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import styles from './TagManager.module.css';

interface TagManagerProps {
  tags: string[];
  allTags: string[]; // All available tags for autocomplete
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

/**
 * TagManager component for managing tags with autocomplete
 * Requirements: 14.1, 14.2, 14.3
 */
export function TagManager({ tags, allTags, onTagsChange, placeholder = 'Add tag...' }: TagManagerProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input
  const suggestions = inputValue.trim()
    ? allTags
        .filter(tag => 
          tag.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(tag)
        )
        .slice(0, 5) // Limit to 5 suggestions
    : [];

  // Show suggestions when there are matches
  useEffect(() => {
    setShowSuggestions(suggestions.length > 0 && inputValue.trim().length > 0);
    setSelectedSuggestionIndex(0);
  }, [suggestions.length, inputValue]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showSuggestions && suggestions[selectedSuggestionIndex]) {
        addTag(suggestions[selectedSuggestionIndex]);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setInputValue('');
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : prev);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className={styles.tagManager}>
      <div className={styles.tagsContainer}>
        {tags.map(tag => (
          <div key={tag} className={styles.tag}>
            <span className={styles.tagSymbol}>✦</span>
            <span className={styles.tagLabel}>{tag}</span>
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => removeTag(tag)}
              aria-label={`Remove tag ${tag}`}
            >
              ×
            </button>
          </div>
        ))}
        <div className={styles.inputWrapper}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.trim() && setShowSuggestions(suggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={tags.length === 0 ? placeholder : ''}
          />
          {showSuggestions && (
            <div className={styles.suggestions}>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  className={`${styles.suggestion} ${index === selectedSuggestionIndex ? styles.selected : ''}`}
                  onClick={() => addTag(suggestion)}
                >
                  <span className={styles.tagSymbol}>✦</span>
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
