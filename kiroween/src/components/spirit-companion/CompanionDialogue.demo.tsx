/**
 * CompanionDialogue Demo
 * 
 * This file demonstrates the companion-colored styling feature.
 * Each companion type (shadow, forest, ember) has unique color schemes.
 */

import React, { useState } from 'react';
import { CompanionDialogue } from './CompanionDialogue';
import type { CompanionType } from '../../types/skillTree';

export const CompanionDialogueDemo: React.FC = () => {
  const [activeCompanion, setActiveCompanion] = useState<CompanionType>('shadow');
  const [showDialogue, setShowDialogue] = useState(true);

  const messages = {
    shadow: 'The shadows whisper secrets of productivity...',
    forest: 'Nature grows with patience and persistence.',
    ember: 'Rise from the ashes, stronger than before!',
  };

  return (
    <div style={{ padding: '2rem', background: '#1a1a1a', minHeight: '100vh' }}>
      <h1 style={{ color: '#e0e0e0', marginBottom: '2rem' }}>
        Companion Dialogue - Colored Styling Demo
      </h1>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#e0e0e0', marginBottom: '1rem' }}>Select Companion:</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setActiveCompanion('shadow')}
            style={{
              padding: '0.5rem 1rem',
              background: activeCompanion === 'shadow' ? '#9d4edd' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Shadow Spirit (Purple)
          </button>
          <button
            onClick={() => setActiveCompanion('forest')}
            style={{
              padding: '0.5rem 1rem',
              background: activeCompanion === 'forest' ? '#10b981' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Forest Familiar (Green)
          </button>
          <button
            onClick={() => setActiveCompanion('ember')}
            style={{
              padding: '0.5rem 1rem',
              background: activeCompanion === 'ember' ? '#f97316' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Ember Phoenix (Orange)
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => setShowDialogue(!showDialogue)}
          style={{
            padding: '0.5rem 1rem',
            background: '#555',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {showDialogue ? 'Hide' : 'Show'} Dialogue
        </button>
      </div>

      <div style={{ position: 'relative', padding: '4rem', background: '#2a2a2a', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center', color: '#e0e0e0', marginBottom: '2rem' }}>
          <p>Companion dialogue appears here with companion-specific colors:</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>🌑 Shadow: Purple border and glow (#9d4edd)</li>
            <li>🌲 Forest: Green border and glow (#10b981)</li>
            <li>🔥 Ember: Orange border and glow (#f97316)</li>
          </ul>
        </div>

        {showDialogue && (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <CompanionDialogue
              message={messages[activeCompanion]}
              companionType={activeCompanion}
              position="top"
              duration={0}
              onDismiss={() => setShowDialogue(false)}
              showTail={true}
            />
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', color: '#a0a0a0' }}>
        <h3 style={{ color: '#e0e0e0' }}>Features Demonstrated:</h3>
        <ul>
          <li>✅ Companion-specific colored borders</li>
          <li>✅ Companion-specific colored glows</li>
          <li>✅ Animated glow effects</li>
          <li>✅ Speech bubble tail with matching colors</li>
          <li>✅ Typewriter text effect</li>
          <li>✅ Dismiss button</li>
          <li>✅ Responsive positioning</li>
        </ul>
      </div>
    </div>
  );
};

export default CompanionDialogueDemo;
