import React, { useState } from 'react';
import { StreakTokens } from './StreakTokens';

/**
 * Example demonstrating the token earning animation
 * 
 * This example shows:
 * 1. Manual trigger via onTokenEarned prop
 * 2. Automatic detection when token count increases
 * 3. No animation when tokens decrease or stay the same
 */
export const TokenEarningAnimationExample: React.FC = () => {
  const [tokenCount, setTokenCount] = useState(1);
  const [manualTrigger, setManualTrigger] = useState(false);

  const earnToken = () => {
    if (tokenCount < 3) {
      setTokenCount(prev => prev + 1);
    }
  };

  const useToken = () => {
    if (tokenCount > 0) {
      setTokenCount(prev => prev - 1);
    }
  };

  const triggerManualAnimation = () => {
    setManualTrigger(true);
    setTimeout(() => setManualTrigger(false), 100);
  };

  return (
    <div style={{ padding: '2rem', background: '#1a1a1a', minHeight: '100vh' }}>
      <h1 style={{ color: '#fff', marginBottom: '2rem' }}>Token Earning Animation Demo</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>
          Current Tokens: {tokenCount}/3
        </h2>
        
        <StreakTokens 
          availableTokens={tokenCount}
          nextTokenMilestone={30}
          daysUntilNextToken={7}
          onTokenEarned={manualTrigger}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={earnToken}
          disabled={tokenCount >= 3}
          style={{
            padding: '0.75rem 1.5rem',
            background: tokenCount >= 3 ? '#555' : '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: tokenCount >= 3 ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
          }}
        >
          🎉 Earn Token (Auto Animation)
        </button>

        <button
          onClick={useToken}
          disabled={tokenCount <= 0}
          style={{
            padding: '0.75rem 1.5rem',
            background: tokenCount <= 0 ? '#555' : '#f44336',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: tokenCount <= 0 ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
          }}
        >
          ⚡ Use Token (No Animation)
        </button>

        <button
          onClick={triggerManualAnimation}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#2196F3',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
          }}
        >
          ✨ Manual Animation Trigger
        </button>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#2a2a2a', borderRadius: '8px' }}>
        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Animation Features:</h3>
        <ul style={{ color: '#ccc', lineHeight: '1.8' }}>
          <li><strong>Bounce Effect:</strong> Tokens bounce and rotate when earned</li>
          <li><strong>Glow Pulse:</strong> Container glows with accent color</li>
          <li><strong>Shine Effect:</strong> Light sweeps across the component</li>
          <li><strong>Duration:</strong> 2 seconds total animation</li>
          <li><strong>Auto-Detection:</strong> Triggers when token count increases</li>
          <li><strong>Manual Trigger:</strong> Can be triggered via onTokenEarned prop</li>
          <li><strong>Accessibility:</strong> Respects prefers-reduced-motion</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#2a2a2a', borderRadius: '8px' }}>
        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Usage:</h3>
        <pre style={{ 
          color: '#4CAF50', 
          background: '#1a1a1a', 
          padding: '1rem', 
          borderRadius: '4px',
          overflow: 'auto',
        }}>
{`// Auto-detect token increase
<StreakTokens availableTokens={tokenCount} />

// Manual trigger
<StreakTokens 
  availableTokens={tokenCount}
  onTokenEarned={true}
/>

// With milestone info
<StreakTokens 
  availableTokens={tokenCount}
  nextTokenMilestone={30}
  daysUntilNextToken={7}
/>`}
        </pre>
      </div>
    </div>
  );
};

export default TokenEarningAnimationExample;
