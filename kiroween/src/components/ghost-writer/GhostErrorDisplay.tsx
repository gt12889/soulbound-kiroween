import React from 'react';
import styles from './GhostErrorDisplay.module.css';
import type { GhostWriterErrorType } from '../../hooks/useGhostWriterState';

interface GhostErrorDisplayProps {
  error: string | Error;
  errorType?: GhostWriterErrorType;
  onRetry?: () => void;
  onDismiss?: () => void;
  showRetry?: boolean;
  showDismiss?: boolean;
  retryDelaySeconds?: number;
  retryCount?: number;
}

/**
 * Error type to friendly message mapping
 * Maps technical error types to user-friendly, thematic messages
 */
const ERROR_MESSAGES: Record<GhostWriterErrorType, string> = {
  NETWORK_ERROR: 'Connection to the ethereal realm lost',
  API_ERROR: 'The spirits are silent... Try again?',
  TIMEOUT_ERROR: 'The spirits are taking too long to respond...',
  RATE_LIMIT_ERROR: 'The ghost writer needs rest (rate limited)',
  INVALID_KEY_ERROR: 'API key missing - check your settings',
  UNKNOWN_ERROR: 'Something mysterious went wrong',
};

/**
 * Additional context messages for each error type
 * Provides helpful guidance to users on how to resolve the issue
 */
const ERROR_CONTEXT: Record<GhostWriterErrorType, string> = {
  NETWORK_ERROR: 'Check your internet connection and try again',
  API_ERROR: 'The AI service encountered an issue',
  TIMEOUT_ERROR: 'The request took too long to complete',
  RATE_LIMIT_ERROR: 'You\'ve made too many requests. Please wait a moment',
  INVALID_KEY_ERROR: 'Configure your API key in settings to use Ghost Writer',
  UNKNOWN_ERROR: 'An unexpected error occurred',
};

/**
 * GhostErrorDisplay - Error state component for Ghost Writer
 * 
 * Displays friendly error messages with mystical theming when AI generation fails.
 * 
 * Features:
 * - Skull/warning icon with red tint
 * - Friendly, thematic error messages
 * - Contextual help text
 * - Retry button for failed requests
 * - Dismiss button to close error
 * - Shake animation for emphasis
 * - Fully responsive design
 * - Accessible with ARIA labels
 */
const GhostErrorDisplay: React.FC<GhostErrorDisplayProps> = ({
  error,
  errorType,
  onRetry,
  onDismiss,
  showRetry = true,
  showDismiss = true,
  retryDelaySeconds = 0,
  retryCount = 0,
}) => {
  // Convert error to string if it's an Error object
  const errorMessage = error instanceof Error ? error.message : error;

  /**
   * Get friendly message based on error type or by analyzing error message
   */
  const getFriendlyMessage = (): string => {
    // If we have an explicit error type, use it
    if (errorType) {
      return ERROR_MESSAGES[errorType];
    }
    
    // Otherwise, try to infer from error message
    const lowerMessage = errorMessage.toLowerCase();
    
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (lowerMessage.includes('timeout') || lowerMessage.includes('took too long')) {
      return ERROR_MESSAGES.TIMEOUT_ERROR;
    }
    if (lowerMessage.includes('rate limit') || lowerMessage.includes('429') || lowerMessage.includes('too many')) {
      return ERROR_MESSAGES.RATE_LIMIT_ERROR;
    }
    if (lowerMessage.includes('api key') || lowerMessage.includes('unauthorized') || lowerMessage.includes('401') || lowerMessage.includes('authentication')) {
      return ERROR_MESSAGES.INVALID_KEY_ERROR;
    }
    if (lowerMessage.includes('offline')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    
    // Default to API error
    return ERROR_MESSAGES.API_ERROR;
  };

  /**
   * Get contextual help message
   */
  const getContextMessage = (): string => {
    // If we have an explicit error type, use it
    if (errorType) {
      return ERROR_CONTEXT[errorType];
    }
    
    // Otherwise, try to infer from error message
    const lowerMessage = errorMessage.toLowerCase();
    
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection') || lowerMessage.includes('offline')) {
      return ERROR_CONTEXT.NETWORK_ERROR;
    }
    if (lowerMessage.includes('timeout') || lowerMessage.includes('took too long')) {
      return ERROR_CONTEXT.TIMEOUT_ERROR;
    }
    if (lowerMessage.includes('rate limit') || lowerMessage.includes('429') || lowerMessage.includes('too many')) {
      return ERROR_CONTEXT.RATE_LIMIT_ERROR;
    }
    if (lowerMessage.includes('api key') || lowerMessage.includes('unauthorized') || lowerMessage.includes('401') || lowerMessage.includes('authentication')) {
      return ERROR_CONTEXT.INVALID_KEY_ERROR;
    }
    
    // Default to API error context
    return ERROR_CONTEXT.API_ERROR;
  };

  const friendlyMessage = getFriendlyMessage();
  const contextMessage = getContextMessage();
  
  // Determine if we should show a settings link
  const showSettingsLink = errorType === 'INVALID_KEY_ERROR' || retryCount >= 2;
  
  // Determine retry button text
  const getRetryButtonText = (): string => {
    if (retryDelaySeconds > 0) {
      return `Retry in ${retryDelaySeconds}s`;
    }
    if (retryCount === 0) {
      return 'Retry';
    }
    if (retryCount === 1) {
      return 'Retry Again';
    }
    return 'Try Once More';
  };

  return (
    <div 
      className={styles.overlay}
      role="alert"
      aria-live="assertive"
      aria-label="Error generating suggestion"
    >
      <div className={styles.container}>
        {/* Error icon with shake animation */}
        <div className={styles.iconContainer} aria-hidden="true">
          <div className={styles.errorIcon}>
            💀
          </div>
          <div className={styles.warningIcon}>
            ⚠️
          </div>
        </div>

        {/* Friendly error message */}
        <div className={styles.message}>
          {friendlyMessage}
        </div>

        {/* Context/help message */}
        <div className={styles.contextMessage}>
          {contextMessage}
        </div>

        {/* Technical details (collapsed by default) */}
        {errorMessage !== friendlyMessage && (
          <details className={styles.technicalDetails}>
            <summary className={styles.detailsSummary}>
              Technical details
            </summary>
            <div className={styles.detailsContent}>
              {errorMessage}
            </div>
          </details>
        )}

        {/* Settings link for API key errors or multiple failures */}
        {showSettingsLink && (
          <div className={styles.settingsLink}>
            <a 
              href="#/settings" 
              className={styles.link}
              onClick={(e) => {
                e.preventDefault();
                // Navigate to settings (you may need to adjust this based on your routing)
                window.location.hash = '/settings';
              }}
            >
              ⚙️ Open Settings
            </a>
          </div>
        )}

        {/* Action buttons */}
        <div className={styles.actions}>
          {showRetry && onRetry && (
            <button
              className={`${styles.button} ${styles.retryButton}`}
              onClick={onRetry}
              disabled={retryDelaySeconds > 0}
              aria-label={retryDelaySeconds > 0 ? `Retry in ${retryDelaySeconds} seconds` : 'Retry suggestion generation'}
            >
              <span className={styles.buttonIcon}>↻</span>
              {getRetryButtonText()}
            </button>
          )}
          
          {showDismiss && onDismiss && (
            <button
              className={`${styles.button} ${styles.dismissButton}`}
              onClick={onDismiss}
              aria-label="Dismiss error message"
            >
              <span className={styles.buttonIcon}>✕</span>
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GhostErrorDisplay;
