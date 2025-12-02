import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getGitHubConnection, fetchGitHubCommits, convertCommitsToHeatmapData } from '../../services/githubService';
import { ActivityHeatmap } from './ActivityHeatmap';
import type { HeatmapData } from '../../types/streak';
import styles from './GitHubCommitHeatmap.module.css';

/**
 * GitHubCommitHeatmap Component
 * 
 * Displays GitHub commit activity in a heatmap format
 * Similar to ActivityHeatmap but shows commit history
 */
export const GitHubCommitHeatmap: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [allCommits, setAllCommits] = useState<any[]>([]); // Store all fetched commits
  
  // Get available years from commits
  const availableYears = useMemo(() => {
    if (allCommits.length === 0) return [];
    const years = new Set<number>();
    allCommits.forEach(commit => {
      const year = new Date(commit.date).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a); // Most recent first
  }, [allCommits]);

  useEffect(() => {
    if (user) {
      loadGitHubData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Update heatmap when year changes (if we already have commits)
  useEffect(() => {
    if (allCommits.length > 0 && availableYears.includes(selectedYear)) {
      const data = convertCommitsToHeatmapData(allCommits, selectedYear);
      setHeatmapData(data);
    } else if (allCommits.length > 0 && availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      // If selected year is not available, switch to the most recent year
      setSelectedYear(availableYears[0]);
    }
  }, [selectedYear, allCommits, availableYears]);

  // Listen for GitHub connection changes
  useEffect(() => {
    const handleConnectionChange = (event: CustomEvent) => {
      console.log('[GitHubCommitHeatmap] Connection change event received:', event.detail);
      if (user && event.detail?.connected) {
        // Reload data when connection changes
        setTimeout(() => {
          loadGitHubData();
        }, 1000); // Small delay to ensure Firestore has updated
      }
    };
    
    // Listen for custom GitHub connection change event
    window.addEventListener('github-connection-changed', handleConnectionChange as EventListener);
    
    // Also check periodically if connected but no data (only if we think we should be connected)
    const interval = setInterval(() => {
      if (user && !isLoading) {
        // Re-check connection status periodically
        loadGitHubData();
      }
    }, 10000); // Check every 10 seconds
    
    return () => {
      window.removeEventListener('github-connection-changed', handleConnectionChange as EventListener);
      clearInterval(interval);
    };
  }, [user, isLoading]);

  // Capture error messages - MUST be before any conditional returns
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message && event.message.includes('GitHub user') && event.message.includes('not found')) {
        setLastError(event.message);
      }
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const loadGitHubData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Check connection status
      console.log('[GitHubCommitHeatmap] Loading GitHub connection for user:', user.id);
      const connection = await getGitHubConnection(user.id);
      console.log('[GitHubCommitHeatmap] Connection data:', connection);
      
      if (!connection?.connected) {
        console.log('[GitHubCommitHeatmap] Not connected');
        setIsConnected(false);
        setUsername(null);
        setHeatmapData([]);
        setIsLoading(false);
        return;
      }

      setIsConnected(true);
      const storedUsername = connection.username || null;
      setUsername(storedUsername);
      console.log('[GitHubCommitHeatmap] Connected with username:', storedUsername);
      console.log('[GitHubCommitHeatmap] Has access token:', !!connection.accessToken);

      // Fetch commits
      if (storedUsername) {
        console.log('[GitHubCommitHeatmap] Fetching commits for username:', storedUsername);
        try {
          // Fetch commits for a longer period (up to 5 years) to support year selection
          const commits = await fetchGitHubCommits(
            storedUsername,
            connection.accessToken,
            5 // Fetch commits from past 5 years
          );
          
          console.log('[GitHubCommitHeatmap] Fetched commits:', commits.length);
          
          // Store all commits for year filtering
          setAllCommits(commits);
          
          // Determine the most recent year with commits and set it as selected
          if (commits.length > 0) {
            const years = new Set<number>();
            commits.forEach(commit => {
              const year = new Date(commit.date).getFullYear();
              years.add(year);
            });
            const mostRecentYear = Math.max(...Array.from(years));
            setSelectedYear(mostRecentYear);
            // Convert to heatmap data for the most recent year
            const data = convertCommitsToHeatmapData(commits, mostRecentYear);
            console.log('[GitHubCommitHeatmap] Converted to heatmap data:', data.length, 'days');
            console.log('[GitHubCommitHeatmap] Sample data:', data.slice(0, 5));
            setHeatmapData(data);
          } else {
            setHeatmapData([]);
          }
        } catch (fetchError) {
          console.error('[GitHubCommitHeatmap] Error fetching commits:', fetchError);
          throw fetchError;
        }
      } else {
        console.warn('[GitHubCommitHeatmap] No username stored in connection');
        showToast({
          message: 'GitHub username not found. Please reconnect your GitHub account.',
          type: 'warning',
        });
      }
    } catch (error) {
      console.error('[GitHubCommitHeatmap] Error loading GitHub data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load GitHub commit data';
      console.error('[GitHubCommitHeatmap] Error details:', {
        message: errorMessage,
        error: error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      showToast({
        message: errorMessage,
        type: 'error',
      });
      // Still show the component with error state
      setIsConnected(true); // Keep connected state so component renders
      setHeatmapData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if not connected
  if (!isConnected) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} aria-label="Loading GitHub commits..." />
          <p>Loading commit activity...</p>
        </div>
      </div>
    );
  }

  // Show error state if we have username but no data
  const hasError = username && !isLoading && heatmapData.length === 0;
  const hasCommits = heatmapData.length > 0;
  const hasAnyActivity = heatmapData.some(day => day.level > 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.icon}>🐙</span>
          GitHub Commit Activity
        </h3>
        {username && (
          <p className={styles.subtitle}>
            Showing commits from <strong>{username}</strong>
          </p>
        )}
        {hasCommits && availableYears.length > 0 && (
          <div className={styles.yearSelector}>
            <label htmlFor="year-select" className={styles.yearLabel}>
              Year:
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className={styles.yearSelect}
            >
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}
        {(hasError || lastError) && (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>
              {lastError?.includes('not found') 
                ? `GitHub username '${username}' not found. Please update your username in the connection settings above.`
                : lastError?.includes('API error') || lastError?.includes('Failed to fetch')
                ? `Error fetching commits: ${lastError}. Please check your connection and try again.`
                : 'No commit data found. This could mean:'}
            </p>
            {!lastError?.includes('not found') && !lastError?.includes('API error') && !lastError?.includes('Failed to fetch') && (
              <ul className={styles.errorHint} style={{ textAlign: 'left', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>You don't have any commits in the past year</li>
                <li>Your repositories are private and the access token doesn't have permission</li>
                <li>Your commits are in repositories not owned by you (forks)</li>
                <li>Check the browser console for more details</li>
              </ul>
            )}
            {lastError?.includes('not found') && (
              <p className={styles.errorHint}>
                💡 Tip: Click "Update Username" above to enter your correct GitHub username
              </p>
            )}
          </div>
        )}
      </div>
      {hasCommits && hasAnyActivity ? (
        <ActivityHeatmap data={heatmapData} filterType="all" />
      ) : !isLoading && username && !hasError ? (
        <div className={styles.emptyState}>
          <p>No commit activity found for the past year.</p>
          <p className={styles.emptyHint}>
            Start committing to your repositories to see your activity here!
          </p>
          <p className={styles.emptyHint} style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            💡 Make sure your repositories are public or your GitHub connection has access to private repos.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default GitHubCommitHeatmap;

