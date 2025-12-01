import React, { useEffect, useState, useRef } from 'react';
import type { Task } from '../../types';
import styles from './ParticleSystem.module.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  type: 'life' | 'spirit' | 'urgency';
  drift: number;
  index?: number;
}

interface ParticleSystemProps {
  task: Task;
  isHovered: boolean;
  isCompleting?: boolean;
}

/**
 * ParticleSystem - Generates particle effects for tombstones
 */
export const ParticleSystem: React.FC<ParticleSystemProps> = ({ task, isHovered, isCompleting = false }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdCounter = useRef(0);

  useEffect(() => {
    // Release souls when completing
    if (isCompleting && !task.completed) {
      const soulCount = 8;
      const soulParticles = Array.from({ length: soulCount }, () => ({
        id: particleIdCounter.current++,
        x: 50 + (Math.random() - 0.5) * 40,
        y: 50 + (Math.random() - 0.5) * 30,
        type: 'spirit' as const,
        drift: (Math.random() - 0.5) * 4,
      }));
      setParticles(soulParticles);

      // Clear souls after animation
      const timer = setTimeout(() => {
        setParticles([]);
      }, 2000);

      return () => clearTimeout(timer);
    }

    if (!isHovered) {
      // Keep spirit particles for completed tasks
      if (task.completed) {
        const spiritParticles = Array.from({ length: 3 }, () => ({
          id: particleIdCounter.current++,
          x: 50 + (Math.random() - 0.5) * 20,
          y: 100 + Math.random() * 20,
          type: 'spirit' as const,
          drift: (Math.random() - 0.5) * 2,
        }));
        setParticles(spiritParticles);
      } else {
        setParticles([]);
      }
      return;
    }

    // Generate particles on hover
    const particleType: 'life' | 'urgency' = task.priority === 'high' ? 'urgency' : 'life';
    const particleCount = particleType === 'urgency' ? 10 : 8;

    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: particleIdCounter.current++,
      x: 50 + (Math.random() - 0.5) * 30,
      y: 100 + Math.random() * 10,
      type: particleType,
      drift: (Math.random() - 0.5) * 3,
      index: i,
    }));

    setParticles(newParticles);

    // Remove particles after animation
    const timer = setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.type === 'spirit'));
    }, particleType === 'urgency' ? 1000 : 2000);

    return () => clearTimeout(timer);
  }, [isHovered, task.priority, task.completed, isCompleting]);

  if (particles.length === 0 && !task.completed && !isCompleting) return null;

  return (
    <div className={`${styles.particleContainer} ${isCompleting ? styles.releasingSouls : ''}`}>
      {particles.map((particle) => {
        const className =
          particle.type === 'life'
            ? styles.particleLife
            : particle.type === 'spirit'
            ? styles.particleSpirit
            : styles.particleUrgency;

        return (
          <div
            key={particle.id}
            className={className}
            style={{
              left: `${particle.x}%`,
              bottom: `${particle.y}%`,
              '--drift': particle.drift,
              '--index': particle.index || 0,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
};

