/**
 * Performance Monitor - Detects device capabilities and monitors animation performance
 */

export interface DeviceCapabilities {
  isLowEnd: boolean;
  memory?: number; // GB
  cores?: number;
  connection?: string;
  gpu?: string;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  cpuUsage?: number;
}

/**
 * Detect if device is low-end based on hardware specs
 */
export const detectLowEndDevice = (): DeviceCapabilities => {
  const capabilities: DeviceCapabilities = {
    isLowEnd: false,
  };

  // Check device memory (if available)
  if ('deviceMemory' in navigator) {
    capabilities.memory = (navigator as any).deviceMemory;
    if (capabilities.memory && capabilities.memory < 4) {
      capabilities.isLowEnd = true;
    }
  }

  // Check CPU cores
  if ('hardwareConcurrency' in navigator) {
    capabilities.cores = navigator.hardwareConcurrency;
    if (capabilities.cores && capabilities.cores < 4) {
      capabilities.isLowEnd = true;
    }
  }

  // Check network connection
  if ('connection' in navigator) {
    const conn = (navigator as any).connection;
    capabilities.connection = conn?.effectiveType;
    if (conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g') {
      capabilities.isLowEnd = true;
    }
  }

  // Check for old Android devices
  const ua = navigator.userAgent;
  if (/Android [4-7]/.test(ua)) {
    capabilities.isLowEnd = true;
  }

  // Check for old iOS devices
  if (/iPhone OS [8-9]|iPhone OS 1[0-1]/.test(ua)) {
    capabilities.isLowEnd = true;
  }

  // Check for budget devices by model
  const budgetDevices = [
    'SM-A105', // Galaxy A10
    'Moto E',
    'Redmi 6',
    'Nokia 2',
  ];

  if (budgetDevices.some((device) => ua.includes(device))) {
    capabilities.isLowEnd = true;
  }

  return capabilities;
};

/**
 * FPS Monitor - Tracks frame rate over time
 */
export class FPSMonitor {
  private frames: number[] = [];
  private lastTime: number = performance.now();
  private rafId: number | null = null;
  private callback?: (fps: number) => void;

  start(callback?: (fps: number) => void): void {
    this.callback = callback;
    this.frames = [];
    this.lastTime = performance.now();
    this.measure();
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private measure = (): void => {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    // Calculate FPS
    const fps = 1000 / delta;
    this.frames.push(fps);

    // Keep only last 60 frames (1 second at 60fps)
    if (this.frames.length > 60) {
      this.frames.shift();
    }

    // Calculate average FPS
    const avgFps = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;

    if (this.callback) {
      this.callback(Math.round(avgFps));
    }

    this.rafId = requestAnimationFrame(this.measure);
  };

  getAverageFPS(): number {
    if (this.frames.length === 0) return 0;
    const avg = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    return Math.round(avg);
  }

  getMinFPS(): number {
    if (this.frames.length === 0) return 0;
    return Math.round(Math.min(...this.frames));
  }

  getMaxFPS(): number {
    if (this.frames.length === 0) return 0;
    return Math.round(Math.max(...this.frames));
  }

  getDroppedFrames(targetFPS: number = 60): number {
    return this.frames.filter((fps) => fps < targetFPS * 0.9).length;
  }
}

/**
 * Animation Performance Monitor
 */
export class AnimationPerformanceMonitor {
  private fpsMonitor: FPSMonitor;
  private startTime: number = 0;
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    droppedFrames: 0,
  };

  constructor() {
    this.fpsMonitor = new FPSMonitor();
  }

  startMonitoring(): void {
    this.startTime = performance.now();
    this.fpsMonitor.start((fps) => {
      this.metrics.fps = fps;
    });
  }

  stopMonitoring(): PerformanceMetrics {
    this.fpsMonitor.stop();

    const endTime = performance.now();
    const duration = endTime - this.startTime;

    this.metrics = {
      fps: this.fpsMonitor.getAverageFPS(),
      frameTime: duration,
      droppedFrames: this.fpsMonitor.getDroppedFrames(),
    };

    return this.metrics;
  }

  getMetrics(): PerformanceMetrics {
    return {
      ...this.metrics,
      fps: this.fpsMonitor.getAverageFPS(),
      droppedFrames: this.fpsMonitor.getDroppedFrames(),
    };
  }

  isPerformanceAcceptable(minFPS: number = 30): boolean {
    return this.fpsMonitor.getAverageFPS() >= minFPS;
  }
}

/**
 * Apply low-end device optimizations
 */
export const applyLowEndOptimizations = (capabilities: DeviceCapabilities): void => {
  if (!capabilities.isLowEnd) return;

  // Add class to document root
  document.documentElement.classList.add('low-end-device');

  // Log for debugging
  console.info('[Performance] Low-end device detected, applying optimizations:', {
    memory: capabilities.memory,
    cores: capabilities.cores,
    connection: capabilities.connection,
  });
};

/**
 * Remove low-end device optimizations
 */
export const removeLowEndOptimizations = (): void => {
  document.documentElement.classList.remove('low-end-device');
};

/**
 * Get performance recommendations based on metrics
 */
export const getPerformanceRecommendations = (
  metrics: PerformanceMetrics
): string[] => {
  const recommendations: string[] = [];

  if (metrics.fps < 30) {
    recommendations.push('Critical: FPS below 30. Consider disabling complex animations.');
  } else if (metrics.fps < 45) {
    recommendations.push('Warning: FPS below 45. Consider simplifying animations.');
  }

  if (metrics.droppedFrames > 30) {
    recommendations.push(
      `High frame drop rate (${metrics.droppedFrames} frames). Reduce animation complexity.`
    );
  }

  if (metrics.frameTime > 1000) {
    recommendations.push('Long animation duration detected. Consider shorter animations.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Performance is acceptable. No optimizations needed.');
  }

  return recommendations;
};

/**
 * Test animation performance
 */
export const testAnimationPerformance = async (
  animationFn: () => Promise<void>,
  duration: number = 2000
): Promise<PerformanceMetrics> => {
  const monitor = new AnimationPerformanceMonitor();

  monitor.startMonitoring();

  try {
    await animationFn();
    await new Promise((resolve) => setTimeout(resolve, duration));
  } finally {
    return monitor.stopMonitoring();
  }
};

/**
 * Log performance metrics to console
 */
export const logPerformanceMetrics = (
  metrics: PerformanceMetrics,
  label: string = 'Animation'
): void => {
  console.group(`[Performance] ${label}`);
  console.log(`Average FPS: ${metrics.fps}`);
  console.log(`Frame Time: ${metrics.frameTime.toFixed(2)}ms`);
  console.log(`Dropped Frames: ${metrics.droppedFrames}`);
  if (metrics.cpuUsage) {
    console.log(`CPU Usage: ${metrics.cpuUsage.toFixed(1)}%`);
  }
  console.groupEnd();

  const recommendations = getPerformanceRecommendations(metrics);
  if (recommendations.length > 0) {
    console.group('[Performance] Recommendations');
    recommendations.forEach((rec) => console.log(`• ${rec}`));
    console.groupEnd();
  }
};

/**
 * Create performance report
 */
export const createPerformanceReport = (
  metrics: PerformanceMetrics,
  capabilities: DeviceCapabilities
): string => {
  const lines: string[] = [];

  lines.push('=== Performance Report ===');
  lines.push('');
  lines.push('Device Capabilities:');
  lines.push(`  Low-End Device: ${capabilities.isLowEnd ? 'Yes' : 'No'}`);
  if (capabilities.memory) lines.push(`  Memory: ${capabilities.memory}GB`);
  if (capabilities.cores) lines.push(`  CPU Cores: ${capabilities.cores}`);
  if (capabilities.connection) lines.push(`  Connection: ${capabilities.connection}`);
  lines.push('');
  lines.push('Performance Metrics:');
  lines.push(`  Average FPS: ${metrics.fps}`);
  lines.push(`  Frame Time: ${metrics.frameTime.toFixed(2)}ms`);
  lines.push(`  Dropped Frames: ${metrics.droppedFrames}`);
  if (metrics.cpuUsage) lines.push(`  CPU Usage: ${metrics.cpuUsage.toFixed(1)}%`);
  lines.push('');
  lines.push('Recommendations:');
  const recommendations = getPerformanceRecommendations(metrics);
  recommendations.forEach((rec) => lines.push(`  • ${rec}`));
  lines.push('');
  lines.push('=========================');

  return lines.join('\n');
};
