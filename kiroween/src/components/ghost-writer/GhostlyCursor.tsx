import React, { useState, useEffect, useRef } from 'react';
import styles from './GhostlyCursor.module.css';

interface GhostlyCursorProps {
  isTyping?: boolean;
  enabled?: boolean;
}

/**
 * GhostlyCursor - Custom ghostly hand cursor that follows mouse
 */
export const GhostlyCursor: React.FC<GhostlyCursorProps> = ({
  isTyping = false,
  enabled = true,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState<'default' | 'hover' | 'typing'>('default');
  const cursorRef = useRef<HTMLDivElement>(null);
  const targetPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      targetPosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseEnter = () => {
      setCursorState('hover');
    };

    const handleMouseLeave = () => {
      setCursorState('default');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Smooth cursor animation
    const animate = () => {
      if (cursorRef.current) {
        const dx = targetPosition.current.x - position.x;
        const dy = targetPosition.current.y - position.y;

        setPosition((prev) => ({
          x: prev.x + dx * 0.1,
          y: prev.y + dy * 0.1,
        }));
      }
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, [enabled, position]);

  useEffect(() => {
    if (isTyping) {
      setCursorState('typing');
    } else {
      setCursorState('hover');
    }
  }, [isTyping]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      className={`${styles.ghostlyCursor} ${styles[cursorState]}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      aria-hidden="true"
    />
  );
};



