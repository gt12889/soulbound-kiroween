import React, { useState, useEffect } from 'react';
import styles from './CursedCharacter.module.css';

const CURSED_CHARACTERS = ['☠️', '💀', '👻', '⚰️', '🕷️', '🦇', '🕯️', '🔮', '⚡', '🌙'];

interface CursedCharacterProps {
  index: number;
  originalChar: string;
  duration?: number;
}

/**
 * CursedCharacter - Displays a cursed character that transforms to the original
 */
export const CursedCharacter: React.FC<CursedCharacterProps> = ({
  index,
  originalChar,
  duration = 500,
}) => {
  const [showCursed, setShowCursed] = useState(true);
  const [cursedChar] = useState(
    CURSED_CHARACTERS[Math.floor(Math.random() * CURSED_CHARACTERS.length)]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCursed(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!showCursed) {
    return <span>{originalChar}</span>;
  }

  return (
    <span className={styles.cursedCharacter} aria-label={`Cursed character: ${cursedChar}`}>
      {cursedChar}
    </span>
  );
};




