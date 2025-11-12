import React, { useState, useEffect } from 'react';
import type { TarotCard as TarotCardType } from '../../types';
import styles from './TarotCard.module.css';

interface TarotCardProps {
  card: TarotCardType;
  delay?: number;
}

const TarotCard: React.FC<TarotCardProps> = ({ card, delay = 0 }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={styles.cardContainer}>
      <div className={`${styles.card} ${isRevealed ? styles.revealed : ''}`}>
        {/* Card Back */}
        <div className={styles.cardBack}>
          <div className={styles.cardBackPattern}>
            <pre>
{`╔═══════════╗
║ ✦ ✦ ✦ ✦ ✦ ║
║ ✦       ✦ ║
║ ✦   ?   ✦ ║
║ ✦       ✦ ║
║ ✦ ✦ ✦ ✦ ✦ ║
╚═══════════╝`}
            </pre>
          </div>
        </div>

        {/* Card Front */}
        <div className={styles.cardFront}>
          <div className={styles.cardArt}>
            <pre>{card.asciiArt}</pre>
          </div>
          <div className={styles.cardInfo}>
            <div className={styles.cardPosition}>
              {card.position.toUpperCase()}
            </div>
            <div className={styles.cardMeaning}>
              {card.meaning}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarotCard;
