/**
 * Performance Test Panel - Manual testing tool for Ghost Writer animations
 * This component helps developers test animation performance on various devices
 */

import React, { useState, useEffect } from 'react';
import {
  detectLowEndDevice,
  AnimationPerformanceMonitor,
  applyLowEndOptimizations,
  removeLowEndOptimizations,
  logPerformanceMetrics,
  createPerformanceReport,
  type DeviceCapabilities,
  type PerformanceMetrics,
} from '../../utils/performanceMonitor';
import styles from './PerformanceTestPanel.module.css';

interface PerformanceTestPanelProps {
  onClose?: () => void;
}

export const PerformanceTestPanel: React.FC<PerformanceTestPanelProps> = ({ onClose }) => {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitor] = useState(() => new AnimationPerformanceMonitor());
  const [lowEndMode, setLowEndMode] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Detect device capabilities on mount
    const caps = detectLowEndDevice();
    setCapabilities(caps);

    // Auto-apply optimizations if low-end device detected
    if (caps.isLowEnd) {
      setLowEndMode(true);
      applyLowEndOptimizations(caps);
    }

    return () => {
      if (isMonitoring) {
        monitor.stopMonitoring();
      }
    };
  }, []);

  const startMonitoring = () => {
    setIsMonitoring(true);
    setMetrics(null);
    monitor.startMonitoring();
    addTestResult('Started performance monitoring...');
  };

  const stopMonitoring = () => {
    const finalMetrics = monitor.stopMonitoring();
    setMetrics(finalMetrics);
    setIsMonitoring(false);
    logPerformanceMetrics(finalMetrics, 'Ghost Writer Animation');
    addTestResult(`Monitoring stopped. Average FPS: ${finalMetrics.fps}`);
  };

  const toggleLowEndMode = () => {
    const newMode = !lowEndMode;
    setLowEndMode(newMode);

    if (newMode && capabilities) {
      applyLowEndOptimizations(capabilities);
      addTestResult('Low-end optimizations enabled');
    } else {
      removeLowEndOptimizations();
      addTestResult('Low-end optimizations disabled');
    }
  };

  const generateReport = () => {
    if (!capabilities || !metrics) {
      addTestResult('Error: No data available for report');
      return;
    }

    const report = createPerformanceReport(metrics, capabilities);
    console.log(report);
    addTestResult('Performance report generated (check console)');

    // Copy to clipboard
    navigator.clipboard
      .writeText(report)
      .then(() => addTestResult('Report copied to clipboard'))
      .catch(() => addTestResult('Failed to copy report'));
  };

  const addTestResult = (result: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults((prev) => [`[${timestamp}] ${result}`, ...prev].slice(0, 10));
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getCurrentMetrics = () => {
    if (isMonitoring) {
      const current = monitor.getMetrics();
      setMetrics(current);
    }
  };

  // Update metrics every second while monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(getCurrentMetrics, 1000);
    return () => clearInterval(interval);
  }, [isMonitoring]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>🔬 Performance Test Panel</h3>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose} aria-label="Close panel">
            ✕
          </button>
        )}
      </div>

      <div className={styles.content}>
        {/* Device Info */}
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Device Capabilities</h4>
          {capabilities && (
            <div className={styles.info}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Low-End Device:</span>
                <span
                  className={`${styles.value} ${capabilities.isLowEnd ? styles.warning : styles.success}`}
                >
                  {capabilities.isLowEnd ? 'Yes' : 'No'}
                </span>
              </div>
              {capabilities.memory && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Memory:</span>
                  <span className={styles.value}>{capabilities.memory}GB</span>
                </div>
              )}
              {capabilities.cores && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>CPU Cores:</span>
                  <span className={styles.value}>{capabilities.cores}</span>
                </div>
              )}
              {capabilities.connection && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Connection:</span>
                  <span className={styles.value}>{capabilities.connection}</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Performance Metrics */}
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Performance Metrics</h4>
          {metrics ? (
            <div className={styles.info}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Average FPS:</span>
                <span
                  className={`${styles.value} ${styles.large} ${
                    metrics.fps >= 60
                      ? styles.success
                      : metrics.fps >= 30
                        ? styles.warning
                        : styles.error
                  }`}
                >
                  {metrics.fps}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Frame Time:</span>
                <span className={styles.value}>{metrics.frameTime.toFixed(2)}ms</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Dropped Frames:</span>
                <span
                  className={`${styles.value} ${metrics.droppedFrames > 10 ? styles.warning : styles.success}`}
                >
                  {metrics.droppedFrames}
                </span>
              </div>
            </div>
          ) : (
            <p className={styles.placeholder}>
              {isMonitoring ? 'Monitoring...' : 'Start monitoring to see metrics'}
            </p>
          )}
        </section>

        {/* Controls */}
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Controls</h4>
          <div className={styles.controls}>
            <button
              className={`${styles.button} ${isMonitoring ? styles.buttonDanger : styles.buttonPrimary}`}
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
            >
              {isMonitoring ? '⏹ Stop Monitoring' : '▶ Start Monitoring'}
            </button>

            <button
              className={`${styles.button} ${lowEndMode ? styles.buttonWarning : styles.buttonSecondary}`}
              onClick={toggleLowEndMode}
            >
              {lowEndMode ? '🐌 Low-End Mode: ON' : '🚀 Low-End Mode: OFF'}
            </button>

            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={generateReport}
              disabled={!metrics}
            >
              📊 Generate Report
            </button>
          </div>
        </section>

        {/* Test Results */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.sectionTitle}>Test Results</h4>
            <button className={styles.clearButton} onClick={clearResults} disabled={testResults.length === 0}>
              Clear
            </button>
          </div>
          <div className={styles.results}>
            {testResults.length > 0 ? (
              testResults.map((result, index) => (
                <div key={index} className={styles.resultItem}>
                  {result}
                </div>
              ))
            ) : (
              <p className={styles.placeholder}>No test results yet</p>
            )}
          </div>
        </section>

        {/* Instructions */}
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Testing Instructions</h4>
          <ol className={styles.instructions}>
            <li>Click "Start Monitoring" to begin tracking FPS</li>
            <li>Trigger Ghost Writer animations (loading, suggestions, accept)</li>
            <li>Observe the FPS metrics in real-time</li>
            <li>Click "Stop Monitoring" to see final results</li>
            <li>Toggle "Low-End Mode" to test optimizations</li>
            <li>Generate a report to copy performance data</li>
          </ol>
        </section>
      </div>
    </div>
  );
};
