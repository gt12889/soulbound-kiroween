import React, { useState, useCallback, lazy, Suspense } from 'react';
import type { TarotReading } from '../../types';
import { analyzeCommits, generateDemoCommits } from '../../services/gitService';
import { generateTarotReading } from '../../services/tarotService';
import { useAudio } from '../../hooks/useAudio';
import TarotCard from './TarotCard';
import LoadingFallback from '../common/LoadingFallback';
import ErrorBoundary from '../common/ErrorBoundary';
import styles from './TarotReader.module.css';

const GhostArchive = lazy(() => import('./ghost-archive/GhostArchive').then(module => ({ default: module.GhostArchive })));

const TarotReader: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tarot' | 'ghost-archive'>('tarot');
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const { playUIClick, playUIHover } = useAudio();

  // Reset error when user starts typing
  const handleGithubUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setGithubUrl(e.target.value);
    if (error) setError(null);
  }, [error]);

  const generateDemoReading = async () => {
    console.log('🔮 TAROT: Starting demo reading, setting loading=true');
    setLoading(true);
    setError(null);
    setReading(null);
    setIsDemoMode(true);

    try {
      // Use demo data
      const commits = generateDemoCommits();

      // Analyze commits
      const stats = analyzeCommits(commits);

      // Generate tarot reading (now async with AI)
      const newReading = await generateTarotReading(commits, stats);
      
      // Simulate a brief delay for dramatic effect
      setTimeout(() => {
        console.log('🔮 TAROT: Demo reading complete, setting loading=false');
        setReading(newReading);
        setLoading(false);
      }, 1000);

    } catch (err) {
      console.error('🔮 TAROT ERROR:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate reading');
      setLoading(false);
    }
  };

  const handleDemoReading = useCallback(() => {
    playUIClick();
    generateDemoReading();
  }, [playUIClick]);

  const handleGitHubReading = useCallback(async () => {
    playUIClick();
    
    const trimmedUrl = githubUrl.trim();
    if (!trimmedUrl) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    setLoading(true);
    setError(null);
    setReading(null);
    setIsDemoMode(false);

    try {
      // Import the GitHub function dynamically
      const { getGitHubCommits } = await import('../../services/gitService');
      
      // Fetch commits from GitHub
      const commits = await getGitHubCommits(trimmedUrl);
      
      if (commits.length === 0) {
        setError('No commits found in the past 30 days for this repository.');
        setLoading(false);
        return;
      }

      // Analyze commits
      const stats = analyzeCommits(commits);

      // Generate tarot reading (now async with AI)
      const newReading = await generateTarotReading(commits, stats);
      
      // Simulate a brief delay for dramatic effect
      setTimeout(() => {
        setReading(newReading);
        setLoading(false);
      }, 1000);

    } catch (err) {
      console.error('Error generating GitHub tarot reading:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze GitHub repository');
      setLoading(false);
    }
  }, [githubUrl, playUIClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && githubUrl.trim()) {
      handleGitHubReading();
    }
  }, [githubUrl, handleGitHubReading]);

  const handleNewReading = useCallback(() => {
    setReading(null);
    setGithubUrl('');
    setError(null);
  }, []);

  const handleTabChange = useCallback((tab: 'tarot' | 'ghost-archive') => {
    playUIClick();
    setActiveTab(tab);
  }, [playUIClick]);

  return (
    <div className={styles.tarotReader}>
      <div className={styles.header}>
        <h1 className={styles.title}>Terminal Tarot</h1>
        <p className={styles.subtitle}>
          Mystical insights from your git commit history
        </p>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tab} ${activeTab === 'tarot' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('tarot')}
          onMouseEnter={playUIHover}
          aria-selected={activeTab === 'tarot'}
          aria-controls="tarot-panel"
        >
          <span className={styles.tabIcon} aria-hidden="true">🔮</span>
          Tarot Reading
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'ghost-archive' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('ghost-archive')}
          onMouseEnter={playUIHover}
          aria-selected={activeTab === 'ghost-archive'}
          aria-controls="ghost-archive-panel"
        >
          <span className={styles.tabIcon} aria-hidden="true">👻</span>
          Ghost Archive
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'tarot' && (
        <div id="tarot-panel" role="tabpanel" aria-labelledby="tarot-tab">
          {!reading && !loading && (
        <>
          <div className={styles.githubInput}>
            <input
              type="text"
              placeholder="https://github.com/username/repository"
              value={githubUrl}
              onChange={handleGithubUrlChange}
              onKeyDown={handleKeyDown}
              aria-label="GitHub repository URL"
              aria-invalid={!!error}
              aria-describedby={error ? 'github-error' : undefined}
            />
            <button 
              className={`${styles.githubSubmit} button-primary`}
              onClick={handleGitHubReading}
              onMouseEnter={playUIHover}
              disabled={!githubUrl.trim()}
              aria-label="Generate tarot reading from GitHub repository"
            >
              <span className={styles.buttonIcon} aria-hidden="true">🔮</span>
              Generate Reading
            </button>
          </div>
          
          <div className={styles.controls}>
            <button 
              className={`${styles.demoButton} button-secondary`}
              onClick={handleDemoReading}
              onMouseEnter={playUIHover}
              aria-label="Try demo reading with sample data"
            >
              <span className={styles.buttonIcon} aria-hidden="true">✨</span>
              Try Demo Reading
            </button>
          </div>
        </>
      )}

      {error && !loading && (
        <div className={styles.error} id="github-error" role="alert">
          <div className={styles.errorIcon} aria-hidden="true">⚠️</div>
          <div className={styles.errorMessage}>{error}</div>
        </div>
      )}

      {loading && (
        <div className={styles.loading} role="status" aria-live="polite">
          <div className={styles.shufflingCards}>
            {[...Array(5)].map((_, i) => {
              console.log(`🔮 Tarot Card ${i}: delay=${i * 0.25}s, zIndex=${5 - i}`);
              const offsetX = (i - 2) * 15; // Spread cards horizontally
              const offsetY = (i - 2) * 8;  // Spread cards vertically
              const rotation = (i - 2) * 3; // Slight rotation
              return (
                <div 
                  key={i} 
                  className={styles.shufflingCard}
                  style={{ 
                    animationDelay: `${i * 0.25}s`,
                    zIndex: 5 - i,
                    left: `calc(50% + ${offsetX}px)`,
                    top: `calc(50% + ${offsetY}px)`,
                    transform: `translate(-50%, -50%) rotate(${rotation}deg)`
                  }}
                />
              );
            })}
          </div>
          <p className={styles.loadingText}>
            🔮 Consulting the spirits of your commits...
          </p>
        </div>
      )}

      {reading && (
        <div className={styles.readingContainer}>
          {isDemoMode && (
            <div className={styles.demoNotice} role="note">
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
            <div className={styles.interpretationText}>
              {reading.interpretation}
            </div>
          </div>

          <div className={styles.actions}>
            <button 
              className={`${styles.newReadingButton} button-primary`}
              onClick={handleNewReading}
              aria-label="Generate a new tarot reading"
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
      )}

          {activeTab === 'ghost-archive' && (
            <div id="ghost-archive-panel" role="tabpanel" aria-labelledby="ghost-archive-tab">
              <ErrorBoundary
                fallback={
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-primary)' }}>
                    <h2>Terminal Connection Lost</h2>
                    <p>The Ghost Archive terminal encountered an error. Please refresh the page.</p>
                  </div>
                }
              >
                <Suspense fallback={<LoadingFallback message="Initializing Ghost Archive..." />}>
                  <GhostArchive />
                </Suspense>
              </ErrorBoundary>
            </div>
          )}
    </div>
  );
};

export default TarotReader;
