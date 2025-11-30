/**
 * GhostLoadingIndicator Usage Examples
 * 
 * This file demonstrates various ways to use the GhostLoadingIndicator component.
 * These examples can be used for testing, documentation, or as a reference.
 */

import React, { useState } from 'react';
import GhostLoadingIndicator from './GhostLoadingIndicator';

/**
 * Example 1: Basic usage with default settings
 */
export const BasicExample: React.FC = () => {
  return (
    <div style={{ position: 'relative', height: '400px', background: '#0a0a0a' }}>
      <GhostLoadingIndicator />
    </div>
  );
};

/**
 * Example 2: Custom message
 */
export const CustomMessageExample: React.FC = () => {
  return (
    <div style={{ position: 'relative', height: '400px', background: '#0a0a0a' }}>
      <GhostLoadingIndicator message="Channeling ethereal wisdom..." />
    </div>
  );
};

/**
 * Example 3: With progress indicator
 */
export const WithProgressExample: React.FC = () => {
  const [progress, setProgress] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'relative', height: '400px', background: '#0a0a0a' }}>
      <GhostLoadingIndicator 
        message="Summoning spirits..." 
        progress={progress}
      />
    </div>
  );
};

/**
 * Example 4: With cancel button
 */
export const WithCancelExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleCancel = () => {
    console.log('Loading cancelled');
    setIsLoading(false);
  };

  return (
    <div style={{ position: 'relative', height: '400px', background: '#0a0a0a' }}>
      {isLoading && (
        <GhostLoadingIndicator 
          message="Summoning spirits..." 
          onCancel={handleCancel}
          showCancel={true}
        />
      )}
      {!isLoading && (
        <div style={{ 
          color: '#e0e0e0', 
          textAlign: 'center', 
          paddingTop: '150px',
          fontFamily: 'Lora, serif'
        }}>
          Loading cancelled
        </div>
      )}
    </div>
  );
};

/**
 * Example 5: Without cancel button
 */
export const WithoutCancelExample: React.FC = () => {
  return (
    <div style={{ position: 'relative', height: '400px', background: '#0a0a0a' }}>
      <GhostLoadingIndicator 
        message="Summoning spirits..." 
        showCancel={false}
      />
    </div>
  );
};

/**
 * Example 6: Full featured with all options
 */
export const FullFeaturedExample: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          return 100;
        }
        return prev + 5;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const handleCancel = () => {
    console.log('Loading cancelled');
    setIsLoading(false);
  };

  return (
    <div style={{ position: 'relative', height: '400px', background: '#0a0a0a' }}>
      {isLoading ? (
        <GhostLoadingIndicator 
          message="Channeling ethereal wisdom from beyond..." 
          progress={progress}
          onCancel={handleCancel}
          showCancel={true}
        />
      ) : (
        <div style={{ 
          color: '#e0e0e0', 
          textAlign: 'center', 
          paddingTop: '150px',
          fontFamily: 'Lora, serif',
          fontStyle: 'italic'
        }}>
          {progress >= 100 ? 'Spirits have spoken! ✨' : 'Ritual interrupted...'}
        </div>
      )}
    </div>
  );
};

/**
 * Example 7: Integration with Ghost Writer
 * This shows how it would be used in the actual Ghost Writer component
 */
export const GhostWriterIntegrationExample: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setSuggestion(null);

    // Simulate API call
    setTimeout(() => {
      setSuggestion('The moonlight cast eerie shadows across the ancient manuscript...');
      setIsGenerating(false);
    }, 3000);
  };

  const handleCancel = () => {
    setIsGenerating(false);
    console.log('Generation cancelled');
  };

  return (
    <div style={{ 
      position: 'relative', 
      height: '400px', 
      background: '#0a0a0a',
      padding: '20px'
    }}>
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        style={{
          padding: '10px 20px',
          background: 'rgba(139, 92, 246, 0.3)',
          border: '1px solid rgba(139, 92, 246, 0.6)',
          color: '#e0e0e0',
          borderRadius: '6px',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          fontFamily: 'Lora, serif',
          marginBottom: '20px'
        }}
      >
        {isGenerating ? 'Generating...' : 'Generate Suggestion'}
      </button>

      {isGenerating && (
        <GhostLoadingIndicator 
          message="Summoning spirits..." 
          onCancel={handleCancel}
          showCancel={true}
        />
      )}

      {suggestion && !isGenerating && (
        <div style={{
          padding: '20px',
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          borderRadius: '8px',
          color: '#e0e0e0',
          fontFamily: 'Lora, serif',
          fontStyle: 'italic'
        }}>
          {suggestion}
        </div>
      )}
    </div>
  );
};
