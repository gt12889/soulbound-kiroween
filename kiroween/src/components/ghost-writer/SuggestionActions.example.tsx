import React from 'react';
import SuggestionActions from './SuggestionActions';

/**
 * Example usage of SuggestionActions component
 * 
 * This demonstrates how to integrate the action buttons
 * with your suggestion display logic.
 */
const SuggestionActionsExample: React.FC = () => {
  const handleAccept = () => {
    console.log('Suggestion accepted!');
    // Insert suggestion text into editor
    // Clear suggestions
    // Reset state
  };

  const handleReject = () => {
    console.log('Suggestion rejected!');
    // Clear suggestions
    // Reset state
  };

  const handleRegenerate = () => {
    console.log('Regenerating suggestion...');
    // Cancel current request if any
    // Generate new suggestion
    // Show loading state
  };

  return (
    <div style={{ padding: '2rem', background: '#1a1a1a', minHeight: '100vh' }}>
      <h2 style={{ color: '#e0e0e0', marginBottom: '2rem' }}>
        SuggestionActions Component Examples
      </h2>

      {/* Default state with shortcuts */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#8b5cf6', marginBottom: '1rem' }}>
          Default (with shortcuts)
        </h3>
        <SuggestionActions
          onAccept={handleAccept}
          onReject={handleReject}
          onRegenerate={handleRegenerate}
          showShortcuts={true}
        />
      </div>

      {/* Without shortcuts */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#8b5cf6', marginBottom: '1rem' }}>
          Without shortcuts
        </h3>
        <SuggestionActions
          onAccept={handleAccept}
          onReject={handleReject}
          onRegenerate={handleRegenerate}
          showShortcuts={false}
        />
      </div>

      {/* Disabled state */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#8b5cf6', marginBottom: '1rem' }}>
          Disabled state
        </h3>
        <SuggestionActions
          onAccept={handleAccept}
          onReject={handleReject}
          onRegenerate={handleRegenerate}
          disabled={true}
        />
      </div>

      {/* Usage with SuggestionDisplay */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#8b5cf6', marginBottom: '1rem' }}>
          Typical usage with suggestion
        </h3>
        <div style={{
          position: 'relative',
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
        }}>
          <p style={{ 
            color: '#e0e0e0', 
            fontStyle: 'italic',
            margin: 0,
          }}>
            This is an example AI-generated suggestion that appears below your text.
            It provides contextual continuation based on what you've written so far.
          </p>
        </div>
        <SuggestionActions
          onAccept={handleAccept}
          onReject={handleReject}
          onRegenerate={handleRegenerate}
        />
      </div>
    </div>
  );
};

export default SuggestionActionsExample;
