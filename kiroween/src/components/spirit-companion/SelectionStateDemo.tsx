import React, { useState } from 'react';
import { CompanionOption } from './CompanionOption';
import { COMPANION_TYPES, CompanionType } from '../../types/companion';

/**
 * Demo component to showcase the selection state visual
 * This demonstrates how the CompanionOption component displays
 * selection state with checkmark, border, and glow effects
 */
export const SelectionStateDemo: React.FC = () => {
  const [selectedType, setSelectedType] = useState<CompanionType | null>(null);

  return (
    <div style={{ 
      padding: '2rem', 
      background: '#1a1a2e',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      <div>
        <h1 style={{ color: 'white', textAlign: 'center' }}>
          Selection State Visual Demo
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
          Click on a companion to see the selection visual state
        </p>
        {selectedType && (
          <p style={{ color: '#10b981', textAlign: 'center', fontWeight: 'bold' }}>
            Selected: {COMPANION_TYPES[selectedType].name}
          </p>
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: '2rem',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {Object.values(COMPANION_TYPES).map((companion) => (
          <CompanionOption
            key={companion.type}
            companion={companion}
            isSelected={selectedType === companion.type}
            onSelect={() => setSelectedType(companion.type)}
          />
        ))}
      </div>

      <div style={{ 
        color: 'white', 
        maxWidth: '800px', 
        margin: '0 auto',
        padding: '1.5rem',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '8px'
      }}>
        <h2 style={{ marginTop: 0 }}>Selection Visual Features:</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li>✅ <strong>Checkmark Indicator</strong>: A circular badge with checkmark appears in the top-right corner</li>
          <li>✅ <strong>Thicker Border</strong>: Border width increases from 3px to 5px</li>
          <li>✅ <strong>Pulsing Glow</strong>: Animated glow effect using the companion's primary color</li>
          <li>✅ <strong>Enhanced Background</strong>: Slightly brighter background gradient</li>
          <li>✅ <strong>Increased Shadow</strong>: More prominent shadow for depth</li>
          <li>✅ <strong>Smooth Animation</strong>: Checkmark appears with rotation animation</li>
        </ul>
      </div>
    </div>
  );
};
