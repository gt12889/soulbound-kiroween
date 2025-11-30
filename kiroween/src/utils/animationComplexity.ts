/**
 * Animation Complexity Manager
 * Dynamically adjusts animation complexity based on performance metrics
 */

import {
  AnimationPerformanceMonitor,
  detectLowEndDevice,
  applyLowEndOptimizations,
  removeLowEndOptimizations,
  type PerformanceMetrics,
  type DeviceCapabilities,
} from './performanceMonitor';

export type ComplexityLevel = 'full' | 'reduced' | 'minimal';

export interface ComplexitySettings {
  level: ComplexityLevel;
  disableParticles: boolean;
  disableGlowEffects: boolean;
  disableShimmer: boolean;
  simplifyAnimations: boolean;
  reduceShadows: boolean;
  disableBackdropFilter: boolean;
}

const COMPLEXITY_THRESHOLDS = {
  // FPS thresholds for complexity reduction
  MINIMAL_FPS: 20, // Below this, use minimal animations
  REDUCED_FPS: 40, // Below this, use reduced animations
  TARGET_FPS: 55, // Target for full animations

  // Dropped frames threshold
  MAX_DROPPED_FRAMES: 30, // More than this triggers reduction

  // Frame time threshold (ms)
  MAX_FRAME_TIME: 1500, // Longer animations trigger reduction
};

/**
 * Get complexity settings for a given level
 */
export const getComplexitySettings = (level: ComplexityLevel): ComplexitySettings => {
  switch (level) {
    case 'minimal':
      return {
        level: 'minimal',
        disableParticles: true,
        disableGlowEffects: true,
        disableShimmer: true,
        simplifyAnimations: true,
        reduceShadows: true,
        disableBackdropFilter: true,
      };

    case 'reduced':
      return {
        level: 'reduced',
        disableParticles: true,
        disableGlowEffects: false,
        disableShimmer: true,
        simplifyAnimations: true,
        reduceShadows: true,
        disableBackdropFilter: false,
      };

    case 'full':
    default:
      return {
        level: 'full',
        disableParticles: false,
        disableGlowEffects: false,
        disableShimmer: false,
        simplifyAnimations: false,
        reduceShadows: false,
        disableBackdropFilter: false,
      };
  }
};

/**
 * Determine complexity level based on performance metrics
 */
export const determineComplexityLevel = (
  metrics: PerformanceMetrics,
  capabilities: DeviceCapabilities
): ComplexityLevel => {
  // Always use minimal for detected low-end devices
  if (capabilities.isLowEnd) {
    return 'minimal';
  }

  // Check FPS
  if (metrics.fps < COMPLEXITY_THRESHOLDS.MINIMAL_FPS) {
    return 'minimal';
  }

  if (metrics.fps < COMPLEXITY_THRESHOLDS.REDUCED_FPS) {
    return 'reduced';
  }

  // Check dropped frames
  if (metrics.droppedFrames > COMPLEXITY_THRESHOLDS.MAX_DROPPED_FRAMES) {
    return 'reduced';
  }

  // Check frame time
  if (metrics.frameTime > COMPLEXITY_THRESHOLDS.MAX_FRAME_TIME) {
    return 'reduced';
  }

  return 'full';
};

/**
 * Apply complexity settings to the DOM
 */
export const applyComplexitySettings = (settings: ComplexitySettings): void => {
  const root = document.documentElement;

  // Remove all complexity classes first
  root.classList.remove('complexity-full', 'complexity-reduced', 'complexity-minimal');
  root.classList.remove('low-end-device', 'ultra-low-end-device');

  // Apply appropriate class
  root.classList.add(`complexity-${settings.level}`);

  // Apply low-end optimizations if needed
  if (settings.level === 'minimal') {
    root.classList.add('low-end-device');
  }

  // Log for debugging
  if (import.meta.env.DEV) {
    console.info('[Animation Complexity] Applied settings:', settings);
  }
};

/**
 * Animation Complexity Manager
 * Monitors performance and adjusts complexity automatically
 */
export class AnimationComplexityManager {
  private monitor: AnimationPerformanceMonitor;
  private capabilities: DeviceCapabilities;
  private currentLevel: ComplexityLevel = 'full';
  private isMonitoring: boolean = false;
  private checkInterval: number | null = null;
  private onLevelChange?: (level: ComplexityLevel) => void;

  constructor(onLevelChange?: (level: ComplexityLevel) => void) {
    this.monitor = new AnimationPerformanceMonitor();
    this.capabilities = detectLowEndDevice();
    this.onLevelChange = onLevelChange;

    // Apply initial settings based on device capabilities
    this.initialize();
  }

  private initialize(): void {
    if (this.capabilities.isLowEnd) {
      this.setComplexityLevel('minimal');
      applyLowEndOptimizations(this.capabilities);
    } else {
      this.setComplexityLevel('full');
    }
  }

  /**
   * Start monitoring performance during animations
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitor.startMonitoring();

    // Check performance every 2 seconds
    this.checkInterval = window.setInterval(() => {
      this.checkPerformance();
    }, 2000);

    if (import.meta.env.DEV) {
      console.info('[Animation Complexity] Started monitoring');
    }
  }

  /**
   * Stop monitoring performance
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    this.monitor.stopMonitoring();

    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    if (import.meta.env.DEV) {
      console.info('[Animation Complexity] Stopped monitoring');
    }
  }

  /**
   * Check current performance and adjust complexity if needed
   */
  private checkPerformance(): void {
    const metrics = this.monitor.getMetrics();
    const recommendedLevel = determineComplexityLevel(metrics, this.capabilities);

    // Only change if different from current level
    if (recommendedLevel !== this.currentLevel) {
      if (import.meta.env.DEV) {
        console.info('[Animation Complexity] Performance check:', {
          fps: metrics.fps,
          droppedFrames: metrics.droppedFrames,
          currentLevel: this.currentLevel,
          recommendedLevel,
        });
      }

      this.setComplexityLevel(recommendedLevel);
    }
  }

  /**
   * Manually set complexity level
   */
  setComplexityLevel(level: ComplexityLevel): void {
    if (level === this.currentLevel) return;

    const previousLevel = this.currentLevel;
    this.currentLevel = level;

    const settings = getComplexitySettings(level);
    applyComplexitySettings(settings);

    if (this.onLevelChange) {
      this.onLevelChange(level);
    }

    if (import.meta.env.DEV) {
      console.info('[Animation Complexity] Level changed:', {
        from: previousLevel,
        to: level,
        settings,
      });
    }
  }

  /**
   * Get current complexity level
   */
  getCurrentLevel(): ComplexityLevel {
    return this.currentLevel;
  }

  /**
   * Get current complexity settings
   */
  getCurrentSettings(): ComplexitySettings {
    return getComplexitySettings(this.currentLevel);
  }

  /**
   * Get device capabilities
   */
  getCapabilities(): DeviceCapabilities {
    return this.capabilities;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return this.monitor.getMetrics();
  }

  /**
   * Test animation performance and adjust complexity
   */
  async testAndAdjust(
    animationFn: () => Promise<void>,
    duration: number = 2000
  ): Promise<void> {
    this.startMonitoring();

    try {
      await animationFn();
      await new Promise((resolve) => setTimeout(resolve, duration));

      // Check performance after animation
      const metrics = this.monitor.getMetrics();
      const recommendedLevel = determineComplexityLevel(metrics, this.capabilities);

      if (recommendedLevel !== this.currentLevel) {
        this.setComplexityLevel(recommendedLevel);
      }
    } finally {
      this.stopMonitoring();
    }
  }

  /**
   * Reset to default complexity based on device capabilities
   */
  reset(): void {
    this.stopMonitoring();
    this.initialize();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopMonitoring();
    removeLowEndOptimizations();
  }
}

/**
 * Create a singleton instance for global use
 */
let globalManager: AnimationComplexityManager | null = null;

export const getGlobalComplexityManager = (): AnimationComplexityManager => {
  if (!globalManager) {
    globalManager = new AnimationComplexityManager();
  }
  return globalManager;
};

/**
 * Hook for React components to use animation complexity
 */
export const useAnimationComplexity = (
  onLevelChange?: (level: ComplexityLevel) => void
): {
  level: ComplexityLevel;
  settings: ComplexitySettings;
  manager: AnimationComplexityManager;
} => {
  const [level, setLevel] = React.useState<ComplexityLevel>('full');
  const managerRef = React.useRef<AnimationComplexityManager | null>(null);

  React.useEffect(() => {
    // Create manager with callback
    const manager = new AnimationComplexityManager((newLevel) => {
      setLevel(newLevel);
      if (onLevelChange) {
        onLevelChange(newLevel);
      }
    });

    managerRef.current = manager;
    setLevel(manager.getCurrentLevel());

    // Cleanup on unmount
    return () => {
      manager.destroy();
    };
  }, [onLevelChange]);

  return {
    level,
    settings: getComplexitySettings(level),
    manager: managerRef.current || getGlobalComplexityManager(),
  };
};
