import { useState, useEffect } from 'react';
import styles from './BootupAnimation.module.css';

interface BootupAnimationProps {
  onComplete: () => void;
}

const lines = [
  { text: 'Connecting to the aether...', delay: 100 },
  { text: 'Synchronizing with lunar cycles...', delay: 1200 },
  { text: 'Consulting ancient scripts...', delay: 2300 },
  { text: 'Awakening resident spirits...', delay: 3500 },
  { text: 'Welcome, Traveler.', delay: 5000 },
];

export function BootupAnimation({ onComplete }: BootupAnimationProps) {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timers = lines.map((line, index) =>
      setTimeout(() => {
        setVisibleLines(prev => [...prev, index]);
        if (index === lines.length - 1) {
          // Last line, trigger completion
          setTimeout(() => {
            setIsComplete(true);
            setTimeout(onComplete, 800); // Wait for fade-out animation
          }, 1000);
        }
      }, line.delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`${styles.bootupOverlay} ${isComplete ? styles.fadingOut : ''}`}>
      <div className={styles.terminal}>
        {lines.map((line, index) =>
          visibleLines.includes(index) ? (
            <p key={index} className={styles.line}>
              <span className={styles.prompt}>&gt; </span>
              <span className={styles.lineText}>{line.text}</span>
              {index === visibleLines.length - 1 && !isComplete && <span className={styles.cursor}>_</span>}
            </p>
          ) : null
        )}
      </div>
    </div>
  );
}
