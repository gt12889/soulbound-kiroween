import React, { useState } from 'react';
import type { TarotReading } from '../../types';
import { getRecentCommits, analyzeCommits, isGitRepository, generateDemoCommits } from '../../services/gitService';
import { generateTarotReading } from '../../services/tarotService';
import { useAudio } from '../../hooks/useAudio';
import TarotCard from './TarotCard';
import styles from './TarotReader.module.css';

const TarotReader: React.FC = () => {
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { playUIClick, playUIHover } = useAudio();

  const generateReading = async (useDemoData: boolean = false) => {
    setLoading(true);
    setError(null);
    setReading(null);
    setIsDemoMode(useDemoData);

    try {
      let commits;
      
      if (useDemoData) {
        // Use demo data
        commits = generateDemoCommits();
      } else {
        // Check if git repository exists
        const hasGit = await isGitRepository();
        
        if (!hasGit) {
          setError('No git repository found. Would you like to see a demo reading?');
          setLoading(false);
          return;
        }

        // Get real commits
        commits = await getRecentCommits();
        
        if (commits.length === 0) {
          setError('No commits found in the past 30 days. Try making some commits first!');
          setLoading(false);
          return;
        }
      }

      // Analyze commits
      const stats = analyzeCommits(commits);

      // Generate tarot reading
      const newReading = generateTarotReading(commits, stats);
      
      // Simulate a brief delay for dramatic effect
      setTimeout(() => {
        setReading(newReading);
        setLoading(false);
      }, 1000);

    } catch (err) {
      console.error('Error generating tarot reading:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate reading');
      setLoading(false);
    }
  };

  const handleGenerateReading = () => {
    playUIClick();
    generateReading(false);
  };

  const handleDemoReading = () => {
    playUIClick();
    generateReading(true);
  };

  return (
    <div className={styles.tarotReader}>
      <div className={styles.header}>
        <h1 className={styles.title}>Terminal Tarot</h1>
        <p className={styles.subtitle}>
          Mystical insights from your git commit history
        </p>
      </div>

      {!reading && !loading && (
        <div className={styles.controls}>
          <button 
            className={styles.generateButton}
            onClick={handleGenerateReading}
            onMouseEnter={playUIHover}
          >
            <span className={styles.buttonIcon}>🔮</span>
            Generate Reading
          </button>
          
          {error && (
            <button 
              className={styles.demoButton}
              onClick={handleDemoReading}
              onMouseEnter={playUIHover}
            >
              <span className={styles.buttonIcon}>✨</span>
              Try Demo Reading
            </button>
          )}
        </div>
      )}

      {error && !loading && (
        <div className={styles.error}>
          <div className={styles.errorIcon}>⚠️</div>
          <div className={styles.errorMessage}>{error}</div>
        </div>
      )}

      {loading && (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>
            <div className={styles.crystal}>🔮</div>
          </div>
          <p className={styles.loadingText}>
            Consulting the spirits of your commits...
          </p>
        </div>
      )}

      {reading && (
        <div className={styles.readingContainer}>
          {isDemoMode && (
            <div className={styles.demoNotice}>
              ✨ Demo Mode - Using sample commit data
            </div>
          )}

          <div className={styles.cardsSpread}>
            {reading.cards.map((card, index) => (
              <TarotCard 
                key={`${card.name}-${index}`}
                card={card}
                delay={index * 800}
              />
            ))}
          </div>

          <div className={styles.interpretation}>
            <h2 className={styles.interpretationTitle}>Your Reading</h2>
            <pre className={styles.interpretationText}>
              {reading.interpretation}
            </pre>
          </div>

          <div className={styles.actions}>
            <button 
              className={styles.newReadingButton}
              onClick={handleGenerateReading}
            >
              Generate New Reading
            </button>
          </div>
        </div>
      )}

      {!reading && !loading && !error && (
        <div className={styles.instructions}>
          <div className={styles.instructionCard}>
            <h3>How It Works</h3>
            <ol>
              <li>The Terminal Tarot analyzes your git commit history from the past 30 days</li>
              <li>It examines patterns in your commits: frequency, timing, and message sentiment</li>
              <li>Based on these patterns, it selects three tarot cards representing your past, present, and future</li>
              <li>Each reading provides mystical insights into your coding journey</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default TarotReader;
