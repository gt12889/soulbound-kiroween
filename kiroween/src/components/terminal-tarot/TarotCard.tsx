import React, { useState, useEffect } from 'react';
import type { TarotCard as TarotCardType } from '../../types';
import styles from './TarotCard.module.css';

interface TarotCardProps {
  card: TarotCardType;
  delay?: number;
}

const TarotCard: React.FC<TarotCardProps> = ({ card, delay = 0 }) => {
  const [isDealing, setIsDealing] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const dealTimer = setTimeout(() => {
      setIsDealing(true);
      // After deal animation, trigger flip
      const flipTimer = setTimeout(() => {
        setIsFlipping(true);
      }, 600); // Duration of deal animation
      return () => clearTimeout(flipTimer);
    }, delay);

    return () => clearTimeout(dealTimer);
  }, [delay]);

  const cardClasses = [
    styles.card,
    isDealing ? styles.dealing : '',
    isFlipping ? styles.flipping : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.cardContainer}>
      <div className={cardClasses}>
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
