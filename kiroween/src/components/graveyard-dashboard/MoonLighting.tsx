import React, { useMemo } from 'react';
import { calculateMoonPhase } from '../../services/moonPhaseService';
import type { MoonPhaseName } from '../../services/moonPhaseService';
import styles from './MoonLighting.module.css';

interface MoonLightingProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * MoonLighting - Wrapper component that applies moon phase lighting
 */
export const MoonLighting: React.FC<MoonLightingProps> = ({ children, className = '' }) => {
  const moonPhase = useMemo(() => {
    return calculateMoonPhase(new Date());
  }, []);

  // Calculate moon position (simplified - could be more sophisticated)
  const moonPosition = useMemo(() => {
    const hour = new Date().getHours();
    // Moon moves across sky (simplified)
    const x = 20 + (hour / 24) * 60; // 20% to 80% across
    const y = 10 + Math.sin((hour / 24) * Math.PI * 2) * 30; // Arc movement
    return { x, y };
  }, []);

  const containerClasses = `${styles.graveyardContainer} ${className}`.trim();

  return (
    <div
      className={containerClasses}
      data-moon-phase={moonPhase.name}
      style={{
        '--moon-x': `${moonPosition.x}%`,
        '--moon-y': `${moonPosition.y}%`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};




