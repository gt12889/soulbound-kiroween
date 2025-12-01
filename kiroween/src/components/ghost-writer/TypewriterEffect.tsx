import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CursedCharacter } from './CursedCharacter';
import { InkSplotch } from './InkSplotch';
import styles from './TypewriterEffect.module.css';

interface TypewriterEffectProps {
  text: string;
  typingSpeed?: number; // ms per character
  showCursor?: boolean;
  onTypingComplete?: () => void;
  enableCursedCharacters?: boolean;
  enableInkSplotches?: boolean;
  enablePaperTexture?: boolean;
  enableGhostlyCursor?: boolean;
  className?: string;
}

/**
 * TypewriterEffect - Renders text with typewriter animation
 */
export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  text,
  typingSpeed = 50,
  showCursor = true,
  onTypingComplete,
  enableCursedCharacters = true,
  enableInkSplotches = true,
  enablePaperTexture = true,
  enableGhostlyCursor = true,
  className = '',
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCarriageReturn, setShowCarriageReturn] = useState(false);
  const [cursedIndices, setCursedIndices] = useState<Set<number>>(new Set());
  const [inkSplotches, setInkSplotches] = useState<Array<{ id: number; x: number; y: number; size: 'small' | 'medium' | 'large' }>>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const splotchIdCounter = useRef(0);

  // Determine which characters should be cursed
  useEffect(() => {
    if (!enableCursedCharacters || text.length === 0) {
      setCursedIndices(new Set());
      return;
    }

    const cursed = new Set<number>();
    // 1-2% probability per character
    for (let i = 0; i < text.length; i++) {
      if (Math.random() < 0.015) {
        cursed.add(i);
      }
    }
    setCursedIndices(cursed);
  }, [text, enableCursedCharacters]);

  // Typewriter animation
  useEffect(() => {
    if (text === displayedText) {
      setIsTyping(false);
      if (onTypingComplete) {
        onTypingComplete();
      }
      return;
    }

    setIsTyping(true);
    const targetLength = text.length;
    const currentLength = displayedText.length;

    if (currentLength < targetLength) {
      const nextChar = text[currentLength];
      const isNewLine = nextChar === '\n';

      if (isNewLine && currentLength > 0) {
        // Trigger carriage return animation
        setShowCarriageReturn(true);
        setTimeout(() => {
          setShowCarriageReturn(false);
        }, 400);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setDisplayedText(text.slice(0, currentLength + 1));

        // Add ink splotch occasionally
        if (enableInkSplotches && Math.random() < 0.01) {
          const size = Math.random() < 0.7 ? 'small' : Math.random() < 0.9 ? 'medium' : 'large';
          setInkSplotches((prev) => [
            ...prev,
            {
              id: splotchIdCounter.current++,
              x: Math.random() * 100,
              y: Math.random() * 100,
              size,
            },
          ]);
        }
      }, typingSpeed);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [text, displayedText, typingSpeed, enableInkSplotches]);

  // Render characters
  const renderedText = useMemo(() => {
    return displayedText.split('').map((char, index) => {
      const isCursed = cursedIndices.has(index);
      const isSpace = char === ' ';

      if (isCursed && enableCursedCharacters) {
        return (
          <CursedCharacter key={index} index={index} originalChar={char} />
        );
      }

      return (
        <span
          key={index}
          className={`${styles.typewriterChar} ${isSpace ? styles.space : ''}`}
          style={{ animationDelay: `${index * (typingSpeed / 1000)}s` }}
        >
          {char === '\n' ? <br /> : char}
        </span>
      );
    });
  }, [displayedText, cursedIndices, enableCursedCharacters, typingSpeed]);

  const containerClasses = [
    styles.typewriterContainer,
    showCarriageReturn ? styles.carriageReturn : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {enableInkSplotches && (
        <InkSplotch splotches={inkSplotches} onSplotchComplete={(id) => {
          setInkSplotches((prev) => prev.filter((s) => s.id !== id));
        }} />
      )}
      <div className={styles.typewriterText}>
        {renderedText}
        {showCursor && isTyping && (
          <span className={styles.typewriterCursor} />
        )}
      </div>
      {showCarriageReturn && (
        <div className={styles.carriageBell} aria-hidden="true" />
      )}
    </div>
  );
};

