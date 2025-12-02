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
      
      // Check if hovering over an interactive element
      const target = e.target as HTMLElement;
      if (target) {
        const isInteractive = 
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.closest('button') !== null ||
          target.closest('a') !== null ||
          target.closest('[role="button"]') !== null ||
          target.closest('[onclick]') !== null ||
          target.style.cursor === 'pointer' ||
          window.getComputedStyle(target).cursor === 'pointer';
        
        setCursorState(isInteractive ? 'hover' : 'default');
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

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



