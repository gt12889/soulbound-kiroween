import React, { useState, useEffect, useRef } from 'react';
import { aiService } from '../../services/aiService';
import { useAudio } from '../../hooks/useAudio';
import styles from './GhostWriterModal.module.css';

interface GhostWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentText: string;
  onInsertText: (text: string) => void;
}

const GhostWriterModal: React.FC<GhostWriterModalProps> = ({
  isOpen,
  onClose,
  currentText,
  onInsertText,
}) => {
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);
  const { playGhostAppear, playGhostDisappear, playSuggestionAccept } = useAudio();

  // Generate suggestion when modal opens
  useEffect(() => {
    if (isOpen && currentText.trim().length > 0) {
      generateSuggestion();
      playGhostAppear();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [isOpen]);

  const generateSuggestion = async () => {
    setIsLoading(true);
    setError('');
    setSuggestion('');

    try {
      // Ensure AI service is configured before making request
      const provider = (import.meta.env.VITE_AI_PROVIDER || 'openrouter') as 'openai' | 'openrouter' | 'gemini';
      
      let apiKey = '';
      if (provider === 'gemini') {
        apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      } else {
        apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
      }
      
      let model = import.meta.env.VITE_AI_MODEL || '';
      if (!model) {
        if (provider === 'gemini') {
          model = 'gemini-1.5-flash';
        } else {
          model = 'nvidia/llama-3.1-nemotron-70b-instruct';
        }
      }

      aiService.configure({
        apiKey,
        provider,
        model,
      });

      const result = await aiService.getSuggestion(currentText, 1, true); // isManual=true for user-initiated generation
      setSuggestion(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate suggestion');
      console.error('Ghost Writer error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (suggestion) {
      playSuggestionAccept();
      onInsertText(suggestion);
      handleClose();
    }
  };

  const handleRegenerate = () => {
    generateSuggestion();
  };

  const handleClose = () => {
    playGhostDisappear();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={handleClose} />

      {/* Modal */}
      <div className={styles.modal} ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="ghost-writer-title">
        <div className={styles.header}>
          <h2 id="ghost-writer-title" className={styles.title}>
            👻 Ghost Writer Assistant
          </h2>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {/* Current text preview */}
          <div className={styles.contextSection} role="region" aria-label="Current text context">
            <h3 className={styles.sectionTitle}>Your Text:</h3>
            <div className={styles.contextPreview} aria-label="Text preview">
              {currentText.slice(-200)}
              {currentText.length > 200 && '...'}
            </div>
          </div>

          {/* Suggestion */}
          <div className={styles.suggestionSection} role="region" aria-label="AI suggestion">
            <h3 className={styles.sectionTitle}>Suggested Continuation:</h3>
            
            {isLoading && (
              <div className={styles.loading} role="status" aria-live="polite" aria-label="Generating suggestion">
                <div className={styles.ghostAnimation} aria-hidden="true">👻</div>
                <p>Summoning spectral inspiration...</p>
              </div>
            )}

            {error && (
              <div className={styles.error} role="alert" aria-live="assertive">
                <p>⚠️ {error}</p>
                <button 
                  className={`${styles.retryButton} button-danger`} 
                  onClick={handleRegenerate}
                  aria-label="Retry generating suggestion"
                >
                  Try Again
                </button>
              </div>
            )}

            {!isLoading && !error && suggestion && (
              <div className={styles.suggestion} role="article" aria-label="Generated suggestion text">
                <p className={styles.suggestionText}>{suggestion}</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer} role="group" aria-label="Suggestion actions">
          <button
            className={`${styles.secondaryButton} button-secondary`}
            onClick={handleRegenerate}
            disabled={isLoading}
            aria-label="Regenerate suggestion"
            aria-disabled={isLoading}
          >
            🔄 Regenerate
          </button>
          <button
            className={`${styles.primaryButton} button-primary`}
            onClick={handleAccept}
            disabled={isLoading || !suggestion}
            aria-label="Accept and insert suggestion into text"
            aria-disabled={isLoading || !suggestion}
          >
            ✓ Accept & Insert
          </button>
        </div>
      </div>
    </>
  );
};

export default GhostWriterModal;
