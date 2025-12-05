/**
 * Example component demonstrating mood transition usage
 * 
 * This file shows how to integrate mood transitions into a Spirit Companion component.
 * It can be used as a reference when implementing the full InteractiveCompanion component.
 */

import React, { useState } from 'react';
import type { MoodState } from '../../types/companionMood';
import { useMoodTransition, getCombinedMoodClasses } from '../../hooks/useMoodTransition';
import './moodTransitions.css';

interface MoodTransitionExampleProps {
  /**
   * Initial mood state
   */
  initialMood?: MoodState;
  
  /**
   * Companion type (affects visual appearance)
   */
  companionType?: 'shadow' | 'forest' | 'ember';
}

/**
 * Example component showing mood transition integration
 */
export const MoodTransitionExample: React.FC<MoodTransitionExampleProps> = ({
  initialMood = 'neutral',
  companionType = 'shadow'
}) => {
  const [currentMood, setCurrentMood] = useState<MoodState>(initialMood);
  
  // Use the mood transition hook
  const { transitionClass, isTransitioning } = useMoodTransition(currentMood, {
    transitionDuration: 2000,
    onTransitionStart: (from, to) => {
      console.log(`Mood transitioning from ${from} to ${to}`);
    },
    onTransitionEnd: (mood) => {
      console.log(`Mood transition to ${mood} complete`);
    }
  });
  
  // Combine mood state class with transition class
  const companionClasses = getCombinedMoodClasses(currentMood, transitionClass);
  
  // All available moods for testing
  const allMoods: MoodState[] = [
    'neutral',
    'happy',
    'excited',
    'energized',
    'concerned',
    'proud',
    'playful'
  ];
  
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Mood Transition Demo</h2>
      
      {/* Companion visual */}
      <div
        className={`companion companion-${companionType} ${companionClasses}`}
        style={{
          width: '100px',
          height: '100px',
          margin: '2rem auto',
          borderRadius: '50%',
          backgroundColor: getCompanionColor(companionType),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          transition: 'background-color 0.3s ease'
        }}
      >
        {getCompanionEmoji(companionType)}
      </div>
      
      {/* Current state display */}
      <div style={{ marginBottom: '1rem' }}>
        <strong>Current Mood:</strong> {currentMood}
        {isTransitioning && <span> (transitioning...)</span>}
      </div>
      
      {/* Mood selector buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {allMoods.map(mood => (
          <button
            key={mood}
            onClick={() => setCurrentMood(mood)}
            disabled={currentMood === mood}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: currentMood === mood ? '#4a5568' : '#2d3748',
              color: 'white',
              cursor: currentMood === mood ? 'not-allowed' : 'pointer',
              opacity: currentMood === mood ? 0.5 : 1
            }}
          >
            {mood}
          </button>
        ))}
      </div>
      
      {/* Transition info */}
      <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#a0aec0' }}>
        <p>Click different moods to see transition animations</p>
        <p>Try: concerned → happy (relief-celebration)</p>
        <p>Try: neutral → excited (energize)</p>
      </div>
    </div>
  );
};

/**
 * Helper to get companion color based on type
 */
function getCompanionColor(type: 'shadow' | 'forest' | 'ember'): string {
  switch (type) {
    case 'shadow':
      return '#4a5568';
    case 'forest':
      return '#48bb78';
    case 'ember':
      return '#f56565';
    default:
      return '#4a5568';
  }
}

/**
 * Helper to get companion emoji based on type
 */
function getCompanionEmoji(type: 'shadow' | 'forest' | 'ember'): string {
  switch (type) {
    case 'shadow':
      return '👻';
    case 'forest':
      return '🌿';
    case 'ember':
      return '🔥';
    default:
      return '👻';
  }
}

export default MoodTransitionExample;
