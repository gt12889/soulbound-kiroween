/**
 * CompanionStats Demo
 * 
 * This file demonstrates how to use the CompanionStats modal component
 * with the name input functionality.
 */

import React, { useState } from 'react';
import { CompanionStats } from './CompanionStats';
import { CompanionProvider } from '../../contexts/CompanionContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AppProvider } from '../../contexts/AppContext';

/**
 * Demo component showing CompanionStats usage
 */
export function CompanionStatsDemo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AuthProvider>
      <ThemeProvider>
        <AppProvider>
          <CompanionProvider>
            <div style={{ padding: '2rem' }}>
              <h1>Companion Stats Modal Demo</h1>
              
              <p>Click the button below to open the stats modal and try the name input feature:</p>
              
              <button
                onClick={() => setIsOpen(true)}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  background: '#9d4edd',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginTop: '1rem',
                }}
              >
                Open Companion Stats
              </button>

              <div style={{ marginTop: '2rem', padding: '1rem', background: '#1a1a2e', borderRadius: '8px' }}>
                <h2>Features to Try:</h2>
                <ul>
                  <li>Click "Edit Name" button to enter edit mode</li>
                  <li>Type a custom name (1-20 characters)</li>
                  <li>See real-time character count</li>
                  <li>Try typing more than 20 characters to see validation</li>
                  <li>Clear the input to see empty validation</li>
                  <li>Press Enter to save or Escape to cancel</li>
                  <li>Use Save/Cancel buttons</li>
                  <li>Close and reopen to see name persistence</li>
                </ul>
              </div>

              <div style={{ marginTop: '2rem', padding: '1rem', background: '#1a1a2e', borderRadius: '8px' }}>
                <h2>Keyboard Shortcuts:</h2>
                <ul>
                  <li><kbd>Enter</kbd> - Save name (when editing)</li>
                  <li><kbd>Escape</kbd> - Cancel editing or close modal</li>
                  <li><kbd>Tab</kbd> - Navigate between elements</li>
                </ul>
              </div>

              <CompanionStats 
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
              />
            </div>
          </CompanionProvider>
        </AppProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

/**
 * Integration Example
 * 
 * Here's how to integrate the CompanionStats modal into an existing component:
 */
export function IntegrationExample() {
  const [showStats, setShowStats] = useState(false);

  return (
    <div>
      {/* Your existing companion display */}
      <div className="companion-display">
        <img src="/companion.png" alt="Spirit Companion" />
        
        {/* Add a stats button */}
        <button 
          onClick={() => setShowStats(true)}
          aria-label="View companion stats"
        >
          📊 Stats
        </button>
      </div>

      {/* Add the stats modal */}
      <CompanionStats 
        isOpen={showStats}
        onClose={() => setShowStats(false)}
      />
    </div>
  );
}

/**
 * With Keyboard Shortcut
 * 
 * Example of adding a keyboard shortcut to open stats:
 */
export function WithKeyboardShortcut() {
  const [showStats, setShowStats] = useState(false);

  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Press 'S' to open stats (when not in an input)
      if (e.key === 's' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        setShowStats(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div>
      <p>Press 'S' to open companion stats</p>
      
      <CompanionStats 
        isOpen={showStats}
        onClose={() => setShowStats(false)}
      />
    </div>
  );
}

export default CompanionStatsDemo;
