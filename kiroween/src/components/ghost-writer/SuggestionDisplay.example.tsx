import React from 'react';
import SuggestionDisplay from './SuggestionDisplay';
import type { GhostSuggestion } from '../../types';

/**
 * Example usage of SuggestionDisplay component
 * 
 * This demonstrates the various states and configurations
 * of the SuggestionDisplay component.
 */

// Example 1: Basic suggestion
const basicSuggestion: GhostSuggestion = {
  id: 'suggestion-1',
  text: 'The spirits whisper ancient wisdom through the veil of time...',
  position: 42,
  confidence: 0.85,
};

// Example 2: Long suggestion (tests scrolling)
const longSuggestion: GhostSuggestion = {
  id: 'suggestion-2',
  text: `In the depths of the haunted forest, where moonlight barely penetrates the thick canopy, 
ancient spirits dance among the twisted branches. Their ethereal forms shimmer with an otherworldly 
glow, casting eerie shadows that seem to move of their own accord. The air is thick with mystery 
and magic, as whispers of forgotten tales echo through the darkness. Each step deeper into the 
woods reveals new wonders and terrors, as the boundary between the living and the dead grows ever 
thinner. The spirits beckon, calling out to those brave enough to venture into their realm, 
promising secrets and knowledge beyond mortal comprehension.`,
  position: 100,
  confidence: 0.92,
};

// Example 3: Short suggestion
const shortSuggestion: GhostSuggestion = {
  id: 'suggestion-3',
  text: 'The ghost appeared suddenly.',
  position: 10,
  confidence: 0.75,
};

export const BasicExample = () => (
  <div style={{ padding: '2rem', background: '#1a1a2e', minHeight: '100vh' }}>
    <h2 style={{ color: '#e0e0e0', marginBottom: '2rem' }}>Basic Suggestion</h2>
    <SuggestionDisplay suggestion={basicSuggestion} />
  </div>
);

export const WithCursorPosition = () => (
  <div style={{ padding: '2rem', background: '#1a1a2e', minHeight: '100vh' }}>
    <h2 style={{ color: '#e0e0e0', marginBottom: '2rem' }}>Positioned Suggestion</h2>
    <SuggestionDisplay 
      suggestion={basicSuggestion} 
      cursorPosition={{ x: 100, y: 200 }}
    />
  </div>
);

export const LongSuggestionExample = () => (
  <div style={{ padding: '2rem', background: '#1a1a2e', minHeight: '100vh' }}>
    <h2 style={{ color: '#e0e0e0', marginBottom: '2rem' }}>Long Suggestion (Scrollable)</h2>
    <SuggestionDisplay suggestion={longSuggestion} />
  </div>
);

export const AcceptingStateExample = () => (
  <div style={{ padding: '2rem', background: '#1a1a2e', minHeight: '100vh' }}>
    <h2 style={{ color: '#e0e0e0', marginBottom: '2rem' }}>Accepting State (Green Glow)</h2>
    <SuggestionDisplay 
      suggestion={basicSuggestion} 
      isAccepting={true}
    />
  </div>
);

export const ShortSuggestionExample = () => (
  <div style={{ padding: '2rem', background: '#1a1a2e', minHeight: '100vh' }}>
    <h2 style={{ color: '#e0e0e0', marginBottom: '2rem' }}>Short Suggestion</h2>
    <SuggestionDisplay suggestion={shortSuggestion} />
  </div>
);

// Combined example showing multiple suggestions
export const MultipleExamples = () => (
  <div style={{ padding: '2rem', background: '#1a1a2e', minHeight: '100vh' }}>
    <h1 style={{ color: '#e0e0e0', marginBottom: '3rem' }}>
      SuggestionDisplay Component Examples
    </h1>
    
    <div style={{ marginBottom: '3rem' }}>
      <h2 style={{ color: '#e0e0e0', marginBottom: '1rem' }}>1. Basic Suggestion</h2>
      <SuggestionDisplay suggestion={basicSuggestion} />
    </div>
    
    <div style={{ marginBottom: '3rem' }}>
      <h2 style={{ color: '#e0e0e0', marginBottom: '1rem' }}>2. Long Suggestion (Scrollable)</h2>
      <SuggestionDisplay suggestion={longSuggestion} />
    </div>
    
    <div style={{ marginBottom: '3rem' }}>
      <h2 style={{ color: '#e0e0e0', marginBottom: '1rem' }}>3. Accepting State</h2>
      <SuggestionDisplay suggestion={basicSuggestion} isAccepting={true} />
    </div>
    
    <div style={{ marginBottom: '3rem' }}>
      <h2 style={{ color: '#e0e0e0', marginBottom: '1rem' }}>4. Short Suggestion</h2>
      <SuggestionDisplay suggestion={shortSuggestion} />
    </div>
  </div>
);

export default MultipleExamples;
