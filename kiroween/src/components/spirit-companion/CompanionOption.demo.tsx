import React, { useState } from 'react';
import { CompanionOption } from './CompanionOption';
import { COMPANION_TYPES } from '../../types/companion';
import type { CompanionType } from '../../types/companion';

/**
 * Demo component showing CompanionOption in action
 * 
 * This demonstrates:
 * - All three companion types
 * - Selection state
 * - Interactive selection
 */
export const CompanionOptionDemo: React.FC = () => {
  const [selectedType, setSelectedType] = useState<CompanionType | null>(null);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, #1a1a1a, #2d1b4e)',
        minHeight: '100vh',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-header)',
          fontSize: '2.5rem',
          color: 'var(--accent-purple-light)',
          textAlign: 'center',
          marginBottom: '1rem',
        }}
      >
        Choose Your Spirit Companion
      </h1>

      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '1.1rem',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          maxWidth: '600px',
        }}
      >
        This choice is permanent and will shape your journey
      </p>

      <div
        style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: '2rem',
        }}
      >
        {Object.values(COMPANION_TYPES).map((companion) => (
          <CompanionOption
            key={companion.type}
            companion={companion}
            isSelected={selectedType === companion.type}
            onSelect={() => setSelectedType(companion.type)}
          />
        ))}
      </div>

      {selectedType && (
        <div
          style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '12px',
            border: '2px solid var(--accent-purple)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.2rem',
              color: 'var(--text-primary)',
            }}
          >
            You selected:{' '}
            <strong style={{ color: 'var(--accent-purple-light)' }}>
              {COMPANION_TYPES[selectedType].name}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
};
