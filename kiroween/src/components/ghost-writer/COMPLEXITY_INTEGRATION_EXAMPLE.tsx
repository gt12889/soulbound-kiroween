/**
 * Example: Integrating Animation Complexity with Ghost Writer
 * 
 * This example shows how to integrate the dynamic animation complexity
 * system with the Ghost Writer component.
 */

import React, { useEffect, useState } from 'react';
import { useAnimationComplexity, type ComplexityLevel } from '../../utils/animationComplexity';
import GhostWriter from './GhostWriter';

/**
 * Example 1: Basic Integration (Automatic)
 * 
 * The simplest way - just use the hook and let it work automatically.
 * The system will detect device capabilities and adjust complexity as needed.
 */
export const BasicExample: React.FC = () => {
  const { level, settings } = useAnimationComplexity();

  return (
    <div>
      <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.5)' }}>
        <p>Current Complexity: {level}</p>
        <p>Particles: {settings.disableParticles ? 'Disabled' : 'Enabled'}</p>
      </div>
      <GhostWriter />
    </div>
  );
};

/**
 * Example 2: With Callback
 * 
 * Get notified when complexity level changes.
 * Useful for analytics or user notifications.
 */
export const CallbackExample: React.FC = () => {
  const [history, setHistory] = useState<string[]>([]);

  const { level } = useAnimationComplexity((newLevel) => {
    console.log('Complexity changed to:', newLevel);
    setHistory((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${newLevel}`]);

    // Send to analytics
    // analytics.track('complexity_changed', { level: newLevel });
  });

  return (
    <div>
      <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.5)' }}>
        <h3>Complexity History</h3>
        <p>Current Level: {level}</p>
        <ul>
          {history.map((entry, i) => (
            <li key={i}>{entry}</li>
          ))}
        </ul>
      </div>
      <GhostWriter />
    </div>
  );
};

/**
 * Example 3: Manual Control
 * 
 * Allow users to manually override the automatic complexity.
 * Good for settings pages or power users.
 */
export const ManualControlExample: React.FC = () => {
  const { level, settings, manager } = useAnimationComplexity();
  const [isAutomatic, setIsAutomatic] = useState(true);

  const handleLevelChange = (newLevel: ComplexityLevel) => {
    manager.setComplexityLevel(newLevel);
    setIsAutomatic(false);
  };

  const handleReset = () => {
    manager.reset();
    setIsAutomatic(true);
  };

  return (
    <div>
      <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.5)' }}>
        <h3>Animation Quality</h3>
        <p>Current: {level} {isAutomatic && '(Automatic)'}</p>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button onClick={() => handleLevelChange('full')}>Full Quality</button>
          <button onClick={() => handleLevelChange('reduced')}>Reduced Quality</button>
          <button onClick={() => handleLevelChange('minimal')}>Minimal Quality</button>
          <button onClick={handleReset}>Auto</button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <h4>Current Settings:</h4>
          <ul>
            <li>Particles: {settings.disableParticles ? '❌' : '✅'}</li>
            <li>Glow Effects: {settings.disableGlowEffects ? '❌' : '✅'}</li>
            <li>Shimmer: {settings.disableShimmer ? '❌' : '✅'}</li>
            <li>Shadows: {settings.reduceShadows ? '⚠️ Reduced' : '✅'}</li>
          </ul>
        </div>
      </div>
      <GhostWriter />
    </div>
  );
};

/**
 * Example 4: Performance Monitoring
 * 
 * Display real-time performance metrics.
 * Useful for debugging or development.
 */
export const PerformanceMonitoringExample: React.FC = () => {
  const { level, manager } = useAnimationComplexity();
  const [metrics, setMetrics] = useState({ fps: 0, droppedFrames: 0, frameTime: 0 });
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const currentMetrics = manager.getMetrics();
      setMetrics(currentMetrics);
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring, manager]);

  const handleStartMonitoring = () => {
    manager.startMonitoring();
    setIsMonitoring(true);
  };

  const handleStopMonitoring = () => {
    manager.stopMonitoring();
    setIsMonitoring(false);
  };

  return (
    <div>
      <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.5)' }}>
        <h3>Performance Monitor</h3>
        <p>Complexity: {level}</p>

        <div style={{ marginTop: '1rem' }}>
          <button onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}>
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
        </div>

        {isMonitoring && (
          <div style={{ marginTop: '1rem' }}>
            <h4>Metrics:</h4>
            <ul>
              <li>FPS: {metrics.fps}</li>
              <li>Dropped Frames: {metrics.droppedFrames}</li>
              <li>Frame Time: {metrics.frameTime.toFixed(2)}ms</li>
            </ul>
          </div>
        )}
      </div>
      <GhostWriter />
    </div>
  );
};

/**
 * Example 5: Device Capabilities
 * 
 * Display detected device capabilities.
 * Useful for understanding why a certain complexity level was chosen.
 */
export const DeviceCapabilitiesExample: React.FC = () => {
  const { level, manager } = useAnimationComplexity();
  const capabilities = manager.getCapabilities();

  return (
    <div>
      <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.5)' }}>
        <h3>Device Capabilities</h3>
        <p>Complexity: {level}</p>

        <div style={{ marginTop: '1rem' }}>
          <h4>Detected:</h4>
          <ul>
            <li>Low-End Device: {capabilities.isLowEnd ? '⚠️ Yes' : '✅ No'}</li>
            {capabilities.memory && <li>Memory: {capabilities.memory}GB</li>}
            {capabilities.cores && <li>CPU Cores: {capabilities.cores}</li>}
            {capabilities.connection && <li>Connection: {capabilities.connection}</li>}
          </ul>
        </div>

        {capabilities.isLowEnd && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.5rem',
              background: 'rgba(239, 68, 68, 0.2)',
              borderRadius: '4px',
            }}
          >
            <p>⚠️ Low-end device detected. Using minimal animations for best performance.</p>
          </div>
        )}
      </div>
      <GhostWriter />
    </div>
  );
};

/**
 * Example 6: Settings Integration
 * 
 * How to integrate with a settings page.
 * Allows users to override automatic detection.
 */
export const SettingsIntegrationExample: React.FC = () => {
  const { level, manager } = useAnimationComplexity();
  const [savedPreference, setSavedPreference] = useState<ComplexityLevel | 'auto'>('auto');

  // Load preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('animation-complexity') as ComplexityLevel | 'auto' | null;
    if (saved && saved !== 'auto') {
      manager.setComplexityLevel(saved);
      setSavedPreference(saved);
    }
  }, [manager]);

  const handleSave = (preference: ComplexityLevel | 'auto') => {
    if (preference === 'auto') {
      manager.reset();
      localStorage.removeItem('animation-complexity');
    } else {
      manager.setComplexityLevel(preference);
      localStorage.setItem('animation-complexity', preference);
    }
    setSavedPreference(preference);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Settings</h2>

      <div style={{ marginTop: '1rem' }}>
        <h3>Animation Quality</h3>
        <p>Current: {level}</p>

        <div style={{ marginTop: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            <input
              type="radio"
              name="complexity"
              value="auto"
              checked={savedPreference === 'auto'}
              onChange={() => handleSave('auto')}
            />
            {' '}Automatic (Recommended)
          </label>

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            <input
              type="radio"
              name="complexity"
              value="full"
              checked={savedPreference === 'full'}
              onChange={() => handleSave('full')}
            />
            {' '}Full Quality
          </label>

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            <input
              type="radio"
              name="complexity"
              value="reduced"
              checked={savedPreference === 'reduced'}
              onChange={() => handleSave('reduced')}
            />
            {' '}Reduced Quality (Better Performance)
          </label>

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            <input
              type="radio"
              name="complexity"
              value="minimal"
              checked={savedPreference === 'minimal'}
              onChange={() => handleSave('minimal')}
            />
            {' '}Minimal Quality (Best Performance)
          </label>
        </div>

        <p style={{ marginTop: '1rem', fontSize: '0.875rem', opacity: 0.7 }}>
          Automatic mode detects your device capabilities and adjusts animation quality for the
          best experience.
        </p>
      </div>
    </div>
  );
};

/**
 * Example 7: Debug Mode
 * 
 * Enable debug indicator to see current complexity level.
 * Useful during development.
 */
export const DebugModeExample: React.FC = () => {
  const { level } = useAnimationComplexity();
  const [debugEnabled, setDebugEnabled] = useState(false);

  useEffect(() => {
    if (debugEnabled) {
      document.documentElement.classList.add('show-complexity-indicator');
      document.documentElement.setAttribute('data-complexity-level', level);
    } else {
      document.documentElement.classList.remove('show-complexity-indicator');
      document.documentElement.removeAttribute('data-complexity-level');
    }

    return () => {
      document.documentElement.classList.remove('show-complexity-indicator');
      document.documentElement.removeAttribute('data-complexity-level');
    };
  }, [debugEnabled, level]);

  return (
    <div>
      <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.5)' }}>
        <h3>Debug Mode</h3>
        <label>
          <input
            type="checkbox"
            checked={debugEnabled}
            onChange={(e) => setDebugEnabled(e.target.checked)}
          />
          {' '}Show complexity indicator
        </label>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', opacity: 0.7 }}>
          When enabled, shows current complexity level in bottom-right corner.
        </p>
      </div>
      <GhostWriter />
    </div>
  );
};

/**
 * Example 8: Complete Integration
 * 
 * A complete example combining multiple features.
 * This is what a production implementation might look like.
 */
export const CompleteIntegrationExample: React.FC = () => {
  const { level, manager } = useAnimationComplexity((newLevel) => {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[Complexity] Changed to:', newLevel);
    }

    // Send to analytics in production
    if (import.meta.env.PROD) {
      // analytics.track('animation_complexity_changed', { level: newLevel });
    }
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('animation-complexity') as ComplexityLevel | null;
    if (saved) {
      manager.setComplexityLevel(saved);
    }
  }, [manager]);

  const handleLevelChange = (newLevel: ComplexityLevel | 'auto') => {
    if (newLevel === 'auto') {
      manager.reset();
      localStorage.removeItem('animation-complexity');
    } else {
      manager.setComplexityLevel(newLevel);
      localStorage.setItem('animation-complexity', newLevel);
    }
  };

  return (
    <div>
      {/* Settings Panel */}
      {showSettings && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.95)',
            padding: '2rem',
            borderRadius: '8px',
            zIndex: 1000,
          }}
        >
          <h3>Animation Settings</h3>
          <div style={{ marginTop: '1rem' }}>
            <select
              value={level}
              onChange={(e) => handleLevelChange(e.target.value as ComplexityLevel)}
              style={{ width: '100%', padding: '0.5rem' }}
            >
              <option value="auto">Automatic</option>
              <option value="full">Full Quality</option>
              <option value="reduced">Reduced Quality</option>
              <option value="minimal">Minimal Quality</option>
            </select>
          </div>
          <button onClick={() => setShowSettings(false)} style={{ marginTop: '1rem' }}>
            Close
          </button>
        </div>
      )}

      {/* Metrics Panel */}
      {showMetrics && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            background: 'rgba(0,0,0,0.9)',
            padding: '1rem',
            borderRadius: '8px',
            zIndex: 1000,
            minWidth: '200px',
          }}
        >
          <h4>Performance</h4>
          <p>Level: {level}</p>
          <p>FPS: {manager.getMetrics().fps}</p>
          <p>Dropped: {manager.getMetrics().droppedFrames}</p>
          <button onClick={() => setShowMetrics(false)} style={{ marginTop: '0.5rem' }}>
            Close
          </button>
        </div>
      )}

      {/* Control Buttons */}
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 999 }}>
        <button onClick={() => setShowSettings(true)} style={{ marginRight: '0.5rem' }}>
          ⚙️ Settings
        </button>
        <button onClick={() => setShowMetrics(true)}>📊 Metrics</button>
      </div>

      {/* Main Content */}
      <GhostWriter />
    </div>
  );
};

export default CompleteIntegrationExample;
