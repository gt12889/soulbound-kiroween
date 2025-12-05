import React, { useState, useCallback, lazy, Suspense, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { TarotReading } from '../../types';
import { analyzeCommits, generateDemoCommits } from '../../services/gitService';
import { generateTarotReading } from '../../services/tarotService';
import { analyzeRepository, type ProjectStructure } from '../../services/repositoryAnalysisService';
import { useAudio } from '../../hooks/useAudio';
import TarotCard from './TarotCard';
import LoadingFallback from '../common/LoadingFallback';
import ErrorBoundary from '../common/ErrorBoundary';
import styles from './TarotReader.module.css';

const GhostArchive = lazy(() => import('./ghost-archive/GhostArchive').then(module => ({ default: module.GhostArchive })));

const TarotReader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine initial tab from URL path
  const getInitialTab = (): 'tarot' | 'ghost-archive' => {
    if (location.pathname === '/ghost-archive') {
      return 'ghost-archive';
    }
    return 'tarot';
  };
  
  const [activeTab, setActiveTab] = useState<'tarot' | 'ghost-archive'>(getInitialTab());
  
  // Update tab when URL changes
  useEffect(() => {
    const newTab = getInitialTab();
    setActiveTab(newTab);
  }, [location.pathname]);
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
    console.log('🔮 Generating demo tarot reading...');
    setLoading(true);
    setError(null);
    setReading(null);
    setIsDemoMode(true);

    try {
      // Use demo data
      const commits = generateDemoCommits();
      const stats = analyzeCommits(commits);
      
      // Create demo project analysis for PROJECT OVERVIEW section with detailed static data
      const demoProjectAnalysis: ProjectStructure = {
        name: 'Dark Productivity Suite',
        description: 'A mystical productivity application with tarot readings, task management, and spirit companions',
        language: 'TypeScript',
        framework: 'React',
        dependencies: {
          'react': '^18.2.0',
          'react-router-dom': '^6.20.0',
          'three': '^0.160.0',
          'firebase': '^10.7.0',
          '@types/react': '^18.2.0',
          'typescript': '^5.3.0'
        },
        files: [
          {
            path: 'src/components/terminal-tarot/TarotReader.tsx',
            language: 'TypeScript',
            size: 15234,
            analysis: {
              imports: ['react', 'three', 'firebase'],
              functions: 28,
              classes: 3,
              complexity: 12.5,
              comments: 145,
              linesOfCode: 615
            }
          },
          {
            path: 'src/services/tarotService.ts',
            language: 'TypeScript',
            size: 28456,
            analysis: {
              imports: ['types', 'firebase'],
              functions: 42,
              classes: 5,
              complexity: 18.3,
              comments: 312,
              linesOfCode: 882
            }
          },
          {
            path: 'src/contexts/CompanionContext.tsx',
            language: 'TypeScript',
            size: 18923,
            analysis: {
              imports: ['react', 'hooks'],
              functions: 35,
              classes: 2,
              complexity: 15.7,
              comments: 198,
              linesOfCode: 672
            }
          },
          {
            path: 'src/components/graveyard-dashboard/GraveyardView.tsx',
            language: 'TypeScript',
            size: 22341,
            analysis: {
              imports: ['react', 'contexts'],
              functions: 31,
              classes: 4,
              complexity: 14.2,
              comments: 167,
              linesOfCode: 573
            }
          },
          {
            path: 'src/services/storageService.ts',
            language: 'TypeScript',
            size: 15678,
            analysis: {
              imports: ['types'],
              functions: 24,
              classes: 1,
              complexity: 9.8,
              comments: 203,
              linesOfCode: 875
            }
          }
        ],
        structure: {
          hasTests: true,
          hasDocumentation: true,
          hasCI: true,
          folders: ['src', 'public', 'tests', 'docs', 'kiroween']
        }
      };
      
      const newReading = await generateTarotReading(commits, stats, demoProjectAnalysis);
      
      // Set reading immediately
      setReading(newReading);
      setLoading(false);
      console.log('✅ Demo reading generated successfully');

    } catch (err) {
      console.error('❌ Error generating demo reading:', err);
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

      // Perform deep repository analysis by default
      let projectAnalysis;
      try {
        console.log('🔬 Performing deep repository analysis...');
        const urlMatch = trimmedUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
        if (urlMatch) {
          const [, owner, repo] = urlMatch;
          projectAnalysis = await analyzeRepository(owner, repo.replace(/\.git$/, ''));
          console.log('✅ Repository analysis complete:', projectAnalysis);
        }
      } catch (analyzeError) {
        console.warn('⚠️ Deep analysis failed, continuing with commit analysis only:', analyzeError);
        // Continue without deep analysis - don't fail the whole reading
      }

      // Generate tarot reading (now async with AI + deep analysis)
      const newReading = await generateTarotReading(commits, stats, projectAnalysis);
      
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
    // Navigate to the correct URL when tab changes
    if (tab === 'ghost-archive') {
      navigate('/ghost-archive', { replace: true });
    } else {
      navigate('/terminal-tarot', { replace: true });
    }
  }, [playUIClick, navigate]);

  return (
    <div className={styles.tarotReader}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mystic Oracle</h1>
        <p className={styles.subtitle}>
          Divine insights revealed through your creative journey
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
          
          {/* Commit Stats Display - shown when we have reading data */}
          {reading && reading.commitStats && (
            <div className={styles.statsDisplay}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>📊</div>
                  <div className={styles.statValue}>{reading.commitStats.totalCommits}</div>
                  <div className={styles.statLabel}>Total Commits</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>📅</div>
                  <div className={styles.statValue}>{reading.commitStats.averageCommitsPerDay.toFixed(2)}</div>
                  <div className={styles.statLabel}>Daily Average</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>⏰</div>
                  <div className={styles.statValue}>{reading.commitStats.mostActiveHour}:00</div>
                  <div className={styles.statLabel}>Most Active Hour</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    {reading.commitStats.sentimentScore > 0.5 ? '😊' : reading.commitStats.sentimentScore > 0 ? '😐' : '😔'}
                  </div>
                  <div className={styles.statValue}>
                    {reading.commitStats.sentimentScore > 0.5 ? 'Positive' : reading.commitStats.sentimentScore > 0 ? 'Neutral' : 'Negative'}
                    {' '}({reading.commitStats.sentimentScore.toFixed(2)})
                  </div>
                  <div className={styles.statLabel}>Sentiment</div>
                </div>
                <div className={`${styles.statCard} ${styles.statCardWide}`}>
                  <div className={styles.statIcon}>🔑</div>
                  <div className={styles.statValue}>
                    {reading.commitStats.topKeywords.join(', ')}
                  </div>
                  <div className={styles.statLabel}>Top Keywords</div>
                </div>
              </div>
            </div>
          )}

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
            <div className={styles.interpretationHeader}>
              <h2 className={styles.interpretationTitle}>Your Mystical Reading</h2>
              <p className={styles.interpretationSubtitle}>
                The cards have spoken • Analysis complete • {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className={styles.interpretationContent}>
              {(() => {
                // Parse the interpretation into sections
                const text = reading.interpretation;
                console.log('📖 Full interpretation text:', text);
                console.log('📖 Text length:', text.length);
                
                // If parsing fails, show the raw text
                if (!text.includes('═══════════════════════════════════════════════════════')) {
                  console.log('⚠️ No section separators found, showing raw text');
                  return (
                    <div className={styles.readingSection}>
                      <div className={styles.sectionBody}>
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                          {text}
                        </pre>
                      </div>
                    </div>
                  );
                }
                
                const sections = text.split('═══════════════════════════════════════════════════════');
                console.log('📖 Number of sections:', sections.length);
                
                // Pair up titles with their content
                const pairedSections: Array<{ title: string; content: string }> = [];
                for (let i = 0; i < sections.length; i++) {
                  const current = sections[i].trim();
                  if (!current) continue;
                  
                  const lines = current.split('\n');
                  const firstLine = lines[0].trim();
                  const restContent = lines.slice(1).join('\n').trim();
                  
                  // If this section has a title-like first line and no/little content,
                  // pair it with the next section
                  if (restContent.length < 50 && i + 1 < sections.length) {
                    const nextSection = sections[i + 1].trim();
                    pairedSections.push({
                      title: firstLine,
                      content: nextSection
                    });
                    i++; // Skip the next section since we just used it
                  } else {
                    pairedSections.push({
                      title: firstLine,
                      content: restContent
                    });
                  }
                }
                
                console.log('📖 Paired sections:', pairedSections.length);
                pairedSections.forEach((s, i) => 
                  console.log(`📋 Paired ${i} - Title: "${s.title.substring(0, 50)}", Content: ${s.content.length} chars`)
                );
                
                return pairedSections.map((section, idx) => {
                  const sectionTitle = section.title;
                  const sectionContent = section.content;
                  
                  // Summary Section
                  if (sectionTitle.includes('SUMMARY')) {
                    // Split content into paragraphs, handling PROJECT OVERVIEW section
                    const contentLines = sectionContent.split('\n').filter(line => line.trim());
                    const overviewIndex = contentLines.findIndex(line => line.includes('PROJECT OVERVIEW'));
                    
                    // Find where PROJECT OVERVIEW ends (look for next section marker or tarot card reference)
                    let overviewEndIndex = contentLines.length;
                    if (overviewIndex >= 0) {
                      // Look for the next section that starts with a pattern like "(X/100)" or contains "→"
                      const nextSectionIndex = contentLines.findIndex((line, i) => 
                        i > overviewIndex && (line.match(/\(\d+\/100\)/) || line.includes('→'))
                      );
                      if (nextSectionIndex > overviewIndex) {
                        overviewEndIndex = nextSectionIndex;
                      }
                    }
                    
                    return (
                      <div key={idx} className={styles.readingSection}>
                        <div className={styles.sectionHeader}>
                          <h3 className={styles.sectionTitle}>📊 Summary</h3>
                          <span className={styles.sectionBadge}>Overview</span>
                        </div>
                        <div className={styles.sectionBody}>
                          {overviewIndex >= 0 ? (
                            <>
                              {/* Project Overview Section - render as paragraphs */}
                              <div className={styles.projectOverview}>
                                {contentLines.slice(overviewIndex + 1, overviewEndIndex).map((line, i) => {
                                  // Skip empty lines and section headers
                                  if (!line.trim() || line.includes('PROJECT OVERVIEW')) return null;
                                  return (
                                    <p key={i} className={styles.projectSummaryLine}>{line}</p>
                                  );
                                }).filter(Boolean)}
                              </div>
                              {/* Rest of summary */}
                              {overviewEndIndex < contentLines.length && (
                                <div className={styles.summaryRest}>
                                  {contentLines.slice(overviewEndIndex).map((line, i) => {
                                    if (!line.trim()) return null;
                                    return (
                                      <p key={`rest-${i}`} className={styles.summaryLine}>{line}</p>
                                    );
                                  }).filter(Boolean)}
                                </div>
                              )}
                            </>
                          ) : (
                            // No PROJECT OVERVIEW found, render all as paragraphs
                            contentLines.map((line, i) => {
                              if (!line.trim()) return null;
                              return (
                                <p key={i} className={styles.summaryLine}>{line}</p>
                              );
                            }).filter(Boolean)
                          )}
                        </div>
                      </div>
                    );
                  }
                  
                  // Detailed Analysis Section
                  if (sectionTitle.includes('DETAILED ANALYSIS')) {
                    const scoreMatch = sectionTitle.match(/\((\d+)\/100\)/);
                    const score = scoreMatch ? scoreMatch[1] : '0';
                    const emoji = sectionTitle.match(/[👑⭐🔥🌙]/)?.[0] || '⭐';
                    
                    return (
                      <div key={idx} className={styles.readingSection}>
                        <div className={styles.sectionHeader}>
                          <h3 className={styles.sectionTitle}>{emoji} Detailed Analysis</h3>
                          <span className={styles.sectionBadge}>{score}/100</span>
                        </div>
                        <div className={styles.sectionBody}>
                          {sectionContent.split('\n\n').filter(block => block.trim()).map((block, i) => (
                            <div key={i} className={styles.analysisBlock}>
                              {block.split('\n').map((line, j) => {
                                if (line.includes(' = ')) {
                                  const parts = line.split(' = ');
                                  return (
                                    <div key={j} className={styles.formulaLine}>
                                      <span className={styles.formulaPart}>{parts[0]}</span>
                                      <span>=</span>
                                      <span className={styles.formulaResult}>{parts[1]}</span>
                                    </div>
                                  );
                                }
                                return line.trim() ? <p key={j} className={styles.analysisText}>{line}</p> : null;
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  // Mystical Insights Section
                  if (sectionTitle.includes('MYSTICAL INSIGHTS')) {
                    return (
                      <div key={idx} className={styles.readingSection}>
                        <div className={styles.sectionHeader}>
                          <h3 className={styles.sectionTitle}>🔮 Mystical Insights</h3>
                          <span className={styles.sectionBadge}>Oracle Wisdom</span>
                        </div>
                        <div className={styles.sectionBody}>
                          <ul className={styles.insightsList}>
                            {sectionContent.split('\n').filter(line => 
                              line.trim() && !line.includes('═') && !line.includes('spirits have spoken')
                            ).map((line, i) => (
                              <li key={i} className={styles.insightItem}>{line}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  }
                  
                  // Repository Deep Dive Section
                  if (sectionTitle.includes('REPOSITORY DEEP DIVE')) {
                    return (
                      <div key={idx} className={styles.readingSection}>
                        <div className={styles.sectionHeader}>
                          <h3 className={styles.sectionTitle}>🔬 Repository Deep Dive</h3>
                          <span className={styles.sectionBadge}>Code Analysis</span>
                        </div>
                        <div className={styles.sectionBody}>
                          <div className={styles.deepDiveContent}>
                            {sectionContent.split('\n').filter(line => line.trim()).map((line, i) => {
                              // Section headers (all caps followed by colon)
                              if (line.match(/^[A-Z\s]+:$/)) {
                                return <h4 key={i} className={styles.deepDiveHeader}>{line}</h4>;
                              }
                              // Indented items (start with spaces/tab or bullet)
                              if (line.match(/^\s+[•▸📄📦🔧✅⚠️🔄]/)) {
                                return <p key={i} className={styles.deepDiveItem}>{line.trim()}</p>;
                              }
                              // Regular lines
                              return <p key={i} className={styles.deepDiveLine}>{line}</p>;
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return null;
                }).filter(Boolean);
              })()}
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
            <div 
              id="ghost-archive-panel" 
              role="tabpanel" 
              aria-labelledby="ghost-archive-tab"
              style={{
                backgroundImage: 'url(/terminal-bg.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#0a0a0a',
                minHeight: '100vh',
              }}
            >
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
