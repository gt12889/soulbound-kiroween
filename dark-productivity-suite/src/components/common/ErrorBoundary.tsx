import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - Catches JavaScript errors in child components
 * Requirements: 3.2, 3.5, 3.6
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console for debugging (Requirement: 3.5)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Store error info in state
    this.setState({
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    // Reset error state to try again (Requirement: 3.6)
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  getErrorMessage(): string {
    const { error } = this.state;
    
    if (!error) {
      return 'An unknown error occurred';
    }

    // Provide actionable error suggestions (Requirement: 3.3)
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('failed to fetch')) {
      return 'Check your connection and try again';
    }
    
    if (errorMessage.includes('auth') || errorMessage.includes('unauthorized') || errorMessage.includes('permission')) {
      return 'Please log in again';
    }
    
    // Generic error message
    return 'Something went wrong. Please refresh the page';
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with gothic styling (Requirement: 3.2)
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>💀</div>
            <h1 className={styles.errorTitle}>The Spirits Are Restless</h1>
            <p className={styles.errorMessage}>{this.getErrorMessage()}</p>
            
            {import.meta.env.DEV && this.state.error && (
              <details className={styles.errorDetails}>
                <summary className={styles.errorDetailsSummary}>
                  Technical Details (Development Only)
                </summary>
                <pre className={styles.errorStack}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <button 
              className="button-primary"
              onClick={this.handleReset}
            >
              <span className={styles.buttonIcon}>🔄</span>
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
