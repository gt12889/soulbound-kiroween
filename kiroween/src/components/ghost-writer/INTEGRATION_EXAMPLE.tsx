/**
 * Integration Example - How to add performance monitoring to Ghost Writer
 * 
 * This file shows how to integrate the performance monitoring tools
 * into the existing GhostWriter component.
 */

import React, { useEffect, useState } from 'react';
import {
  detectLowEndDevice,
  applyLowEndOptimizations,
  AnimationPerformanceMonitor,
  logPerformanceMetrics,
} from '../../utils/performanceMonitor';

// Import the low-end optimizations CSS
import './low-end-optimizations.css';

// Example: Enhanced GhostWriter with performance monitoring
export const GhostWriterWithPerformance: React.FC = () => {
  const [performanceMonitor] = useState(() => new AnimationPerformanceMonitor());
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  // Initialize device detection on mount
  useEffect(() => {
    const capabilities = detectLowEndDevice();
    setIsLowEndDevice(capabilities.isLowEnd);

    if (capabilities.isLowEnd) {
      applyLowEndOptimizations(capabilities);
      console.info('[GhostWriter] Low-end device detected, optimizations applied', {
        memory: capabilities.memory,
        cores: capabilities.cores,
        connection: capabilities.connection,
      });
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Monitor accept animation performance
  const handleAcceptWithMonitoring = async () => {
    // Start monitoring
    performanceMonitor.startMonitoring();

    try {
      // Trigger the accept animation
      await handleAccept();

      // Stop monitoring and get metrics
      const metrics = performanceMonitor.stopMonitoring();

      // Log metrics in development
      if (process.env.NODE_ENV === 'development') {
        logPerformanceMetrics(metrics, 'Accept Animation');
      }

      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        // analytics.track('animation_performance', {
        //   animation: 'accept',
        //   fps: metrics.fps,
        //   droppedFrames: metrics.droppedFrames,
        //   isLowEndDevice,
        // });
      }

      // Warn if performance is poor
      if (metrics.fps < 30) {
        console.warn('[GhostWriter] Poor animation performance detected', {
          fps: metrics.fps,
          droppedFrames: metrics.droppedFrames,
          isLowEndDevice,
        });
      }
    } catch (error) {
      performanceMonitor.stopMonitoring();
      console.error('[GhostWriter] Accept animation failed', error);
    }
  };

  // Original accept handler (placeholder)
  const handleAccept = async () => {
    // Your existing accept logic
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <div className="ghost-writer">
      {/* Your existing Ghost Writer UI */}
      
      {/* Show performance indicator in development */}
      {process.env.NODE_ENV === 'development' && isLowEndDevice && (
        <div
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            padding: '4px 8px',
            background: 'rgba(245, 158, 11, 0.9)',
            color: 'white',
            fontSize: '12px',
            borderRadius: '4px',
            zIndex: 9999,
          }}
        >
          🐌 Low-End Mode
        </div>
      )}
    </div>
  );
};

// Example: App-level integration
export const AppWithPerformanceMonitoring: React.FC = () => {
  const [showPerfPanel, setShowPerfPanel] = useState(false);

  useEffect(() => {
    // Initialize device detection at app level
    const capabilities = detectLowEndDevice();

    if (capabilities.isLowEnd) {
      applyLowEndOptimizations(capabilities);
    }

    // Add keyboard shortcut for performance panel (development only)
    if (process.env.NODE_ENV === 'development') {
      const handleKeyPress = (e: KeyboardEvent) => {
        // Ctrl+Shift+P to toggle performance panel
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
          setShowPerfPanel((prev) => !prev);
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, []);

  return (
    <div className="app">
      {/* Your app content */}
      
      {/* Performance test panel (development only) */}
      {process.env.NODE_ENV === 'development' && showPerfPanel && (
        <PerformanceTestPanel onClose={() => setShowPerfPanel(false)} />
      )}
    </div>
  );
};

// Example: Custom hook for performance monitoring
export const useAnimationPerformance = (animationName: string) => {
  const [monitor] = useState(() => new AnimationPerformanceMonitor());
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  useEffect(() => {
    const capabilities = detectLowEndDevice();
    setIsLowEndDevice(capabilities.isLowEnd);
  }, []);

  const monitorAnimation = async (animationFn: () => Promise<void>) => {
    monitor.startMonitoring();

    try {
      await animationFn();
      const metrics = monitor.stopMonitoring();

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        logPerformanceMetrics(metrics, animationName);
      }

      // Warn if poor performance
      if (metrics.fps < 30) {
        console.warn(`[${animationName}] Poor performance:`, {
          fps: metrics.fps,
          droppedFrames: metrics.droppedFrames,
          isLowEndDevice,
        });
      }

      return metrics;
    } catch (error) {
      monitor.stopMonitoring();
      throw error;
    }
  };

  return {
    monitorAnimation,
    isLowEndDevice,
  };
};

// Example: Usage of custom hook
export const GhostWriterWithHook: React.FC = () => {
  const { monitorAnimation, isLowEndDevice } = useAnimationPerformance('GhostWriter');

  const handleAccept = async () => {
    await monitorAnimation(async () => {
      // Your accept animation logic
      await performAcceptAnimation();
    });
  };

  const performAcceptAnimation = async () => {
    // Placeholder for actual animation
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <div className="ghost-writer">
      {/* Your UI */}
      <button onClick={handleAccept}>Accept</button>
      
      {isLowEndDevice && (
        <span style={{ fontSize: '12px', color: 'orange' }}>
          ⚡ Performance mode active
        </span>
      )}
    </div>
  );
};

// Example: Conditional rendering based on device capabilities
export const AdaptiveGhostWriter: React.FC = () => {
  const [capabilities, setCapabilities] = useState(detectLowEndDevice());

  useEffect(() => {
    const caps = detectLowEndDevice();
    setCapabilities(caps);

    if (caps.isLowEnd) {
      applyLowEndOptimizations(caps);
    }
  }, []);

  return (
    <div className="ghost-writer">
      {/* Render different components based on device */}
      {capabilities.isLowEnd ? (
        // Simplified version for low-end devices
        <SimplifiedGhostWriter />
      ) : (
        // Full-featured version for capable devices
        <FullFeaturedGhostWriter />
      )}
    </div>
  );
};

// Placeholder components
const SimplifiedGhostWriter: React.FC = () => <div>Simplified Ghost Writer</div>;
const FullFeaturedGhostWriter: React.FC = () => <div>Full Ghost Writer</div>;
const PerformanceTestPanel: React.FC<{ onClose: () => void }> = () => <div>Performance Panel</div>;

// Example: Testing utilities
export const performanceTestHelpers = {
  // Test a specific animation
  testAnimation: async (name: string, animationFn: () => Promise<void>) => {
    const monitor = new AnimationPerformanceMonitor();
    monitor.startMonitoring();

    try {
      await animationFn();
      const metrics = monitor.stopMonitoring();
      
      console.group(`[Performance Test] ${name}`);
      console.log(`FPS: ${metrics.fps}`);
      console.log(`Dropped Frames: ${metrics.droppedFrames}`);
      console.log(`Frame Time: ${metrics.frameTime.toFixed(2)}ms`);
      console.groupEnd();

      return metrics;
    } catch (error) {
      monitor.stopMonitoring();
      throw error;
    }
  },

  // Simulate low-end device
  simulateLowEndDevice: () => {
    document.documentElement.classList.add('low-end-device');
    console.info('[Test] Low-end device simulation enabled');
  },

  // Restore normal mode
  restoreNormalMode: () => {
    document.documentElement.classList.remove('low-end-device');
    document.documentElement.classList.remove('ultra-low-end-device');
    console.info('[Test] Normal mode restored');
  },

  // Simulate ultra-low-end device
  simulateUltraLowEndDevice: () => {
    document.documentElement.classList.add('ultra-low-end-device');
    console.info('[Test] Ultra-low-end device simulation enabled');
  },
};

// Example: Usage in tests
/*
import { performanceTestHelpers } from './INTEGRATION_EXAMPLE';

describe('Ghost Writer Performance', () => {
  beforeEach(() => {
    performanceTestHelpers.simulateLowEndDevice();
  });

  afterEach(() => {
    performanceTestHelpers.restoreNormalMode();
  });

  it('should maintain acceptable FPS on low-end devices', async () => {
    const metrics = await performanceTestHelpers.testAnimation(
      'Accept Animation',
      async () => {
        // Trigger animation
        await triggerAcceptAnimation();
      }
    );

    expect(metrics.fps).toBeGreaterThanOrEqual(30);
  });
});
*/
