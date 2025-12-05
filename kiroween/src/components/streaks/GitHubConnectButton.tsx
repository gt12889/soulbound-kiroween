import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getGitHubConnection, saveGitHubConnection, getGitHubUsername } from '../../services/githubService';
import { auth } from '../../services/firebaseService';
import { GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import styles from './GitHubConnectButton.module.css';

interface GitHubConnectButtonProps {
  onConnectionChange?: (connected: boolean) => void;
}

/**
 * GitHubConnectButton Component
 * 
 * Allows users to connect/disconnect their GitHub account
 * to show commit activity in the streaks page
 */
export const GitHubConnectButton: React.FC<GitHubConnectButtonProps> = ({
  onConnectionChange,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualUsername, setManualUsername] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [manualToken, setManualToken] = useState('');

  useEffect(() => {
    if (user) {
      loadConnectionStatus();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadConnectionStatus = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const connection = await getGitHubConnection(user.id);
      
      if (connection?.connected) {
        setIsConnected(true);
        setUsername(connection.username || null);
        onConnectionChange?.(true);
      } else {
        setIsConnected(false);
        setUsername(null);
        onConnectionChange?.(false);
      }
    } catch (error) {
      console.error('Error loading GitHub connection:', error);
      showToast({
        message: 'Failed to load GitHub connection status',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!user) {
      showToast({
        message: 'Please sign in to connect GitHub',
        type: 'error',
      });
      return;
    }

    try {
      setIsConnecting(true);
      
      // Sign in with GitHub using Firebase auth and get the credential
      // Add scopes to access GitHub API (read user data and public repos)
      const provider = new GithubAuthProvider();
      provider.addScope('read:user');
      provider.addScope('public_repo');
      provider.addScope('repo'); // For private repos if user grants access
      if (!auth) {
        throw new Error('Firebase Auth is not initialized');
      }
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      
      if (!firebaseUser) {
        throw new Error('Failed to get user after GitHub sign-in');
      }
      
      // Get the OAuth credential to access the GitHub access token
      const credential = GithubAuthProvider.credentialFromResult(userCredential);
      const accessToken = credential?.accessToken;
      
      console.log('[GitHubConnectButton] OAuth credential:', {
        hasCredential: !!credential,
        hasAccessToken: !!accessToken,
        providerId: credential?.providerId,
      });
      
      // PRIMARY METHOD: Fetch username directly from GitHub API with access token
      // This is the most reliable way - get it directly from GitHub after authentication
      let githubUsername: string | null = null;
      
      console.log('[GitHubConnectButton] Fetching GitHub username from API (primary method)...');
      if (accessToken) {
        try {
          // Fetch current user from GitHub API with authentication
          const userResponse = await fetch('https://api.github.com/user', {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'Authorization': `token ${accessToken}`,
            },
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            githubUsername = userData.login; // This is the canonical username (e.g., gt12889)
            console.log('[GitHubConnectButton] ✅ Successfully got username from GitHub API:', githubUsername);
          } else {
            console.warn('[GitHubConnectButton] Could not get user from GitHub API:', userResponse.status, userResponse.statusText);
          }
        } catch (error) {
          console.warn('[GitHubConnectButton] Error fetching from GitHub API:', error);
        }
      } else {
        console.warn('[GitHubConnectButton] No access token available from OAuth credential');
      }
      
      // FALLBACK: Try displayName from Firebase user (GitHub sometimes provides this)
      if (!githubUsername && firebaseUser.displayName) {
        // GitHub displayName might be the username, but verify it
        console.log('[GitHubConnectButton] Trying displayName as username:', firebaseUser.displayName);
        try {
          const { verifyGitHubUsername } = await import('../../services/githubService');
          const verifiedUsername = await verifyGitHubUsername(firebaseUser.displayName);
          if (verifiedUsername) {
            githubUsername = verifiedUsername;
            console.log('[GitHubConnectButton] Verified username from displayName:', githubUsername);
          }
        } catch (error) {
          console.warn('[GitHubConnectButton] Could not verify username from displayName:', error);
        }
      }
      
      // If still not found, show manual input
      if (!githubUsername) {
        console.warn('[GitHubConnectButton] Could not automatically retrieve GitHub username');
        setShowManualInput(true);
        throw new Error('Could not retrieve GitHub username automatically. Please enter your GitHub username (e.g., gt12889) manually.');
      }
      
      // Final verification: make sure the username exists on GitHub
      if (githubUsername) {
        try {
          const { verifyGitHubUsername } = await import('../../services/githubService');
          const verifiedUsername = await verifyGitHubUsername(githubUsername);
          if (verifiedUsername && verifiedUsername !== githubUsername) {
            console.log(`[GitHubConnectButton] Corrected username from ${githubUsername} to ${verifiedUsername}`);
            githubUsername = verifiedUsername;
          } else if (!verifiedUsername) {
            console.warn(`[GitHubConnectButton] Username ${githubUsername} could not be verified - it may not exist`);
            // Show manual input option
            setShowManualInput(true);
            setManualUsername(githubUsername);
            throw new Error(`GitHub username '${githubUsername}' not found. Please enter your correct GitHub username (e.g., gt12889).`);
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw error;
          }
          console.warn('[GitHubConnectButton] Error verifying username:', error);
        }
      }
      
      // Save access token for future API calls
      // Note: Firebase's GitHub OAuth may not always expose accessToken
      // If it's not available, we'll need to reconnect or use manual username entry
      const accessTokenToSave = accessToken || undefined;

      // Save connection status with username and access token
      try {
        console.log('[GitHubConnectButton] Attempting to save GitHub connection:', {
          userId: user.id,
          username: githubUsername,
          hasAccessToken: !!accessTokenToSave,
          accessTokenLength: accessTokenToSave?.length || 0,
        });
        
        if (!accessTokenToSave) {
          console.warn('[GitHubConnectButton] ⚠️ No access token available from Firebase OAuth. Commits may be rate-limited.');
        }
        
        await saveGitHubConnection(user.id, {
          connected: true,
          username: githubUsername,
          accessToken: accessTokenToSave,
          connectedAt: new Date(),
        });
        
        console.log('[GitHubConnectButton] Successfully saved GitHub connection with username:', githubUsername);
        
        // Verify it was saved by reading it back
        const verifyConnection = await getGitHubConnection(user.id);
        console.log('[GitHubConnectButton] Verified saved connection:', verifyConnection);
        
        if (!verifyConnection?.connected) {
          console.warn('[GitHubConnectButton] Connection was not saved correctly');
          showToast({
            message: 'Connection saved but could not be verified. Please refresh the page.',
            type: 'warning',
          });
        }
      } catch (saveError) {
        console.error('[GitHubConnectButton] Error saving GitHub connection:', saveError);
        throw new Error(`Failed to save GitHub connection: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`);
      }

      setIsConnected(true);
      setUsername(githubUsername);
      onConnectionChange?.(true);
      
      showToast({
        message: `GitHub connected! Welcome ${githubUsername}`,
        type: 'success',
      });
      
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('github-connection-changed', {
        detail: { connected: true, username: githubUsername }
      }));
    } catch (error) {
      console.error('Error connecting GitHub:', error);
      showToast({
        message: error instanceof Error ? error.message : 'Failed to connect GitHub',
        type: 'error',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;

    try {
      setIsConnecting(true);
      
      await saveGitHubConnection(user.id, {
        connected: false,
      });

      setIsConnected(false);
      setUsername(null);
      onConnectionChange?.(false);
      
      showToast({
        message: 'GitHub disconnected',
        type: 'info',
      });
    } catch (error) {
      console.error('Error disconnecting GitHub:', error);
      showToast({
        message: 'Failed to disconnect GitHub',
        type: 'error',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  const handleUpdateUsername = async () => {
    if (!user || !manualUsername.trim()) {
      showToast({
        message: 'Please enter a GitHub username',
        type: 'error',
      });
      return;
    }

    try {
      setIsConnecting(true);
      
      // Verify the username exists
      const { verifyGitHubUsername } = await import('../../services/githubService');
      const verifiedUsername = await verifyGitHubUsername(manualUsername.trim());
      
      if (!verifiedUsername) {
        showToast({
          message: `GitHub username '${manualUsername}' not found. Please check your username and try again.`,
          type: 'error',
        });
        return;
      }

      // Get existing connection to preserve connectedAt date and access token
      const existingConnection = await getGitHubConnection(user.id);
      
      // Update connection with verified username, preserving original connectedAt and access token
      await saveGitHubConnection(user.id, {
        connected: true,
        username: verifiedUsername,
        accessToken: existingConnection?.accessToken, // Preserve access token if it exists
        connectedAt: existingConnection?.connectedAt || new Date(),
      });

      // Reload connection status to verify it was saved
      await loadConnectionStatus();
      
      setShowManualInput(false);
      setManualUsername('');
      
      showToast({
        message: `GitHub username updated to ${verifiedUsername}`,
        type: 'success',
      });
      
      // Trigger refresh event
      window.dispatchEvent(new CustomEvent('github-connection-changed', {
        detail: { connected: true, username: verifiedUsername }
      }));
    } catch (error) {
      console.error('[GitHubConnectButton] Error updating username:', error);
      showToast({
        message: error instanceof Error ? error.message : 'Failed to update GitHub username',
        type: 'error',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleManualUsernameSubmit = async () => {
    if (!user || !manualUsername.trim()) {
      showToast({
        message: 'Please enter a GitHub username',
        type: 'error',
      });
      return;
    }

    try {
      setIsConnecting(true);
      
      // Get existing connection to check for access token
      const existingConnection = await getGitHubConnection(user.id);
      
      // Verify the username exists (use access token if available to avoid rate limits)
      const { verifyGitHubUsername } = await import('../../services/githubService');
      const verifiedUsername = await verifyGitHubUsername(
        manualUsername.trim(),
        existingConnection?.accessToken
      );
      
      if (!verifiedUsername) {
        showToast({
          message: `GitHub username '${manualUsername}' not found. Please check your username and try again.`,
          type: 'error',
        });
        return;
      }

      // Save connection with verified username, preserving access token if it exists
      await saveGitHubConnection(user.id, {
        connected: true,
        username: verifiedUsername,
        accessToken: existingConnection?.accessToken, // Preserve access token if it exists
        connectedAt: new Date(),
      });

      // Reload connection status
      await loadConnectionStatus();
      
      setShowManualInput(false);
      setManualUsername('');
      
      showToast({
        message: `GitHub connected! Welcome ${verifiedUsername}`,
        type: 'success',
      });
      
      // Trigger refresh event
      window.dispatchEvent(new CustomEvent('github-connection-changed', {
        detail: { connected: true, username: verifiedUsername }
      }));
    } catch (error) {
      console.error('[GitHubConnectButton] Error connecting with manual username:', error);
      showToast({
        message: error instanceof Error ? error.message : 'Failed to connect GitHub',
        type: 'error',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTokenSubmit = async () => {
    if (!user || !manualToken.trim()) {
      showToast({
        message: 'Please enter a GitHub Personal Access Token',
        type: 'error',
      });
      return;
    }

    try {
      setIsConnecting(true);
      
      // Validate token format (GitHub tokens start with ghp_ or gho_ or are classic tokens)
      const token = manualToken.trim();
      // Remove mask if present (starts with ••••)
      const actualToken = token.startsWith('••••') ? '' : token;
      
      if (actualToken && !actualToken.startsWith('ghp_') && !actualToken.startsWith('gho_') && actualToken.length < 20) {
        showToast({
          message: 'Invalid token format. GitHub tokens should start with "ghp_" or "gho_" or be a classic token.',
          type: 'error',
        });
        return;
      }

      if (!actualToken) {
        showToast({
          message: 'Please enter a new token (masked tokens cannot be updated)',
          type: 'error',
        });
        return;
      }

      // Test the token by fetching user info
      const testResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${actualToken}`,
        },
      });

      if (!testResponse.ok) {
        if (testResponse.status === 401) {
          throw new Error('Invalid token. Please check your GitHub Personal Access Token.');
        }
        throw new Error(`Token validation failed: ${testResponse.status} ${testResponse.statusText}`);
      }

      const userData = await testResponse.json();
      const githubUsername = userData.login;

      // Get existing connection
      const existingConnection = await getGitHubConnection(user.id);
      
      // Save connection with token and username
      await saveGitHubConnection(user.id, {
        connected: true,
        username: existingConnection?.username || githubUsername,
        accessToken: actualToken,
        connectedAt: existingConnection?.connectedAt || new Date(),
      });

      // Reload connection status
      await loadConnectionStatus();
      
      setShowTokenInput(false);
      setManualToken('');
      
      showToast({
        message: 'GitHub access token saved successfully! Rate limits should no longer be an issue.',
        type: 'success',
      });
      
      // Trigger refresh event
      window.dispatchEvent(new CustomEvent('github-connection-changed', {
        detail: { connected: true, username: githubUsername }
      }));
    } catch (error) {
      console.error('[GitHubConnectButton] Error saving token:', error);
      showToast({
        message: error instanceof Error ? error.message : 'Failed to save access token',
        type: 'error',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className={styles.container}>
      {isConnected ? (
        <div className={styles.connected}>
          <div className={styles.status}>
            <span className={styles.icon}>✓</span>
            <span className={styles.text}>
              Connected as <strong>{username}</strong>
            </span>
          </div>
          <div className={styles.connectedActions}>
            <button
              className={styles.updateButton}
              onClick={() => {
                setShowManualInput(true);
                setManualUsername(username || '');
              }}
              disabled={isConnecting}
              aria-label="Update GitHub username"
              title="Update username if incorrect"
            >
              Update Username
            </button>
            <button
              className={styles.updateButton}
              onClick={async () => {
                setShowTokenInput(true);
                // Load existing token (masked) if available
                const connection = await getGitHubConnection(user?.id || '');
                if (connection?.accessToken) {
                  // Show last 4 chars only for security
                  const token = connection.accessToken;
                  setManualToken(token.length > 4 ? '••••' + token.slice(-4) : '••••');
                } else {
                  setManualToken('');
                }
              }}
              disabled={isConnecting}
              aria-label="Add or update access token"
              title="Add GitHub Personal Access Token to avoid rate limits"
            >
              Add Token
            </button>
            <button
              className={styles.disconnectButton}
              onClick={handleDisconnect}
              disabled={isConnecting}
              aria-label="Disconnect GitHub account"
            >
              {isConnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
        </div>
      ) : showManualInput ? (
        <div className={styles.manualInput}>
          <p className={styles.manualInputLabel}>Enter your GitHub username:</p>
          <div className={styles.manualInputGroup}>
            <input
              type="text"
              value={manualUsername}
              onChange={(e) => setManualUsername(e.target.value)}
              placeholder="e.g., octocat"
              className={styles.manualInputField}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleManualUsernameSubmit();
                }
              }}
            />
            <button
              className={styles.manualInputButton}
              onClick={handleManualUsernameSubmit}
              disabled={isConnecting || !manualUsername.trim()}
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
            <button
              className={styles.manualInputCancel}
              onClick={() => {
                setShowManualInput(false);
                setManualUsername('');
              }}
              disabled={isConnecting}
            >
              Cancel
            </button>
          </div>
          <p className={styles.manualInputHint}>
            Or <button 
              type="button"
              className={styles.linkButton}
              onClick={handleConnect}
            >try automatic connection</button>
          </p>
        </div>
      ) : (
        <button
          className={styles.connectButton}
          onClick={handleConnect}
          disabled={isConnecting || !user}
          aria-label="Connect GitHub account"
        >
          <span className={styles.githubIcon}>🐙</span>
          <span>{isConnecting ? 'Connecting...' : 'Connect GitHub'}</span>
        </button>
      )}
      
      {/* Show manual input for connected users if username is invalid */}
      {isConnected && showManualInput && (
        <div className={styles.manualInput}>
          <p className={styles.manualInputLabel}>Update GitHub username:</p>
          <div className={styles.manualInputGroup}>
            <input
              type="text"
              value={manualUsername}
              onChange={(e) => setManualUsername(e.target.value)}
              placeholder="e.g., octocat"
              className={styles.manualInputField}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateUsername();
                }
              }}
            />
            <button
              className={styles.manualInputButton}
              onClick={handleUpdateUsername}
              disabled={isConnecting || !manualUsername.trim()}
            >
              {isConnecting ? 'Updating...' : 'Update'}
            </button>
            <button
              className={styles.manualInputCancel}
              onClick={() => {
                setShowManualInput(false);
                setManualUsername('');
              }}
              disabled={isConnecting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Token input for adding/updating access token */}
      {isConnected && showTokenInput && (
        <div className={styles.manualInput}>
          <p className={styles.manualInputLabel}>
            Add GitHub Personal Access Token (to avoid rate limits):
          </p>
          <p className={styles.manualInputHint} style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            Create a token at{' '}
            <a 
              href="https://github.com/settings/tokens" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.linkButton}
            >
              github.com/settings/tokens
            </a>
            {' '}with <code>public_repo</code> scope
          </p>
          <div className={styles.manualInputGroup}>
            <input
              type="password"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className={styles.manualInputField}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTokenSubmit();
                }
              }}
            />
            <button
              className={styles.manualInputButton}
              onClick={handleTokenSubmit}
              disabled={isConnecting || !manualToken.trim()}
            >
              {isConnecting ? 'Saving...' : 'Save Token'}
            </button>
            <button
              className={styles.manualInputCancel}
              onClick={() => {
                setShowTokenInput(false);
                setManualToken('');
              }}
              disabled={isConnecting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHubConnectButton;

