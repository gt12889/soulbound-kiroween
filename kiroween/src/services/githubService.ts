/**
 * GitHub service for fetching user commit activity
 */
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseService';
import type { HeatmapData } from '../types/streak';

export interface GitHubConnection {
  connected: boolean;
  username?: string;
  accessToken?: string;
  connectedAt?: Date;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  date: string;
  author: {
    name: string;
    email: string;
  };
}

/**
 * Get GitHub connection status from Firestore
 */
export async function getGitHubConnection(userId: string): Promise<GitHubConnection | null> {
  if (!db) {
    console.warn('[GitHubService] Firestore not initialized');
    return null;
  }
  
  try {
    const connectionRef = doc(db, 'users', userId, 'settings', 'github');
    console.log('[GitHubService] Fetching connection from:', `users/${userId}/settings/github`);
    
    const connectionSnap = await getDoc(connectionRef);
    
    if (connectionSnap.exists()) {
      const data = connectionSnap.data();
      console.log('[GitHubService] Found connection data:', {
        connected: data.connected,
        username: data.username,
        hasAccessToken: !!data.accessToken,
        connectedAt: data.connectedAt,
      });
      
      return {
        connected: data.connected || false,
        username: data.username || null,
        accessToken: data.accessToken || undefined,
        connectedAt: data.connectedAt?.toDate(),
      };
    }
    
    console.log('[GitHubService] No connection data found in Firestore');
    return null;
  } catch (error) {
    console.error('[GitHubService] Error fetching GitHub connection:', error);
    if (error instanceof Error) {
      // Check if it's a permission error
      if (error.message.includes('permission') || error.message.includes('Permission')) {
        console.error('[GitHubService] Permission denied. Check Firestore security rules for users/{userId}/settings/github');
      }
    }
    return null;
  }
}

/**
 * Save GitHub connection status to Firestore
 */
export async function saveGitHubConnection(
  userId: string,
  connection: GitHubConnection
): Promise<void> {
  if (!db) throw new Error('Firebase is not initialized');
  
  try {
    const connectionRef = doc(db, 'users', userId, 'settings', 'github');
    
    // Get existing connection to preserve connectedAt if updating username
    const existingConnection = await getGitHubConnection(userId);
    
    // Build data to save - only include fields that are being updated
    const dataToSave: any = {
      connected: connection.connected,
      updatedAt: serverTimestamp(),
    };
    
    // Only update username if provided
    if (connection.username !== undefined) {
      dataToSave.username = connection.username || null;
    }
    
    // Only update accessToken if provided
    if (connection.accessToken !== undefined) {
      dataToSave.accessToken = connection.accessToken || null;
    }
    
    // Only set connectedAt if this is a new connection (not updating existing)
    if (connection.connectedAt && !existingConnection?.connectedAt) {
      dataToSave.connectedAt = serverTimestamp();
    }
    // If updating existing connection, preserve the original connectedAt by not including it
    
    console.log('[GitHubService] Saving connection data:', {
      userId,
      path: `users/${userId}/settings/github`,
      data: { ...dataToSave, accessToken: dataToSave.accessToken ? '[REDACTED]' : null },
    });
    
    await setDoc(connectionRef, dataToSave, { merge: true });
    
    console.log('[GitHubService] Successfully saved GitHub connection');
    
    // Verify it was saved
    const verifySnap = await getDoc(connectionRef);
    if (verifySnap.exists()) {
      const verifiedData = verifySnap.data();
      console.log('[GitHubService] Verified connection saved:', {
        connected: verifiedData.connected,
        username: verifiedData.username,
        hasAccessToken: !!verifiedData.accessToken,
      });
    } else {
      console.warn('[GitHubService] Connection was not saved - document does not exist');
      throw new Error('Failed to save GitHub connection - Firestore write succeeded but document not found');
    }
  } catch (error) {
    console.error('[GitHubService] Error saving GitHub connection:', error);
    if (error instanceof Error) {
      // Check if it's a permission error
      if (error.message.includes('permission') || error.message.includes('Permission')) {
        throw new Error('Firestore permission denied. Please check your Firestore security rules and ensure they allow writing to users/{userId}/settings/github');
      }
    }
    throw error;
  }
}


/**
 * Convert GitHub user ID to username using GitHub API
 * Exported for use in components
 */
export async function getGitHubUsernameFromId(userId: string, accessToken?: string): Promise<string | null> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    if (accessToken) {
      headers['Authorization'] = `token ${accessToken}`;
    }
    
    // GitHub API doesn't have a direct endpoint to get user by numeric ID without auth
    // If we have an access token, use the /user endpoint to get current user info
    if (accessToken) {
      const userUrl = 'https://api.github.com/user';
      const userResponse = await fetch(userUrl, { headers });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        // Check if the ID matches
        if (userData.id && userData.id.toString() === userId) {
          return userData.login || null;
        }
      }
    }
    
    // Without access token, we can't directly convert numeric ID to username
    // The GitHub API requires either username or authenticated access
    // Return null and let the caller handle it
    return null;
  } catch (error) {
    console.error('[GitHubService] Error fetching GitHub username from ID:', error);
    return null;
  }
}

/**
 * Fetch user's GitHub commit activity
 * Uses GitHub API to get commits from all repositories
 * Accepts either username or numeric user ID
 */
export async function fetchGitHubCommits(
  usernameOrId: string,
  accessToken?: string,
  years: number = 1
): Promise<GitHubCommit[]> {
  try {
    // Build headers object
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    // Track if we have a valid token
    let hasValidToken = false;
    
    // Add authorization header if token is provided
    if (accessToken) {
      headers['Authorization'] = `token ${accessToken}`;
      hasValidToken = true;
      console.log('[GitHubService] Using access token for API calls');
    } else {
      console.warn('[GitHubService] No access token provided - will use unauthenticated requests (rate limited)');
    }
    
    // Check if usernameOrId is a numeric ID (Firebase stores GitHub user ID)
    let username = usernameOrId;
    const isNumericId = /^\d+$/.test(usernameOrId);
    
    // If it's a numeric ID, we need to convert it to username
    // However, GitHub API requires auth token to get user by ID
    // So if we have accessToken, try to get username from /user endpoint
    if (isNumericId) {
      if (accessToken) {
        // Use the /user endpoint to get current user's login
        const userResponse = await fetch('https://api.github.com/user', { headers });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          // Verify it's the same user
          if (userData.id && userData.id.toString() === usernameOrId) {
            username = userData.login;
          } else {
            throw new Error(`GitHub user ID mismatch. Expected ${usernameOrId}, got ${userData.id}`);
          }
        } else {
          throw new Error(`Could not authenticate with GitHub API: ${userResponse.status}`);
        }
      } else {
        throw new Error(`Cannot fetch commits for GitHub user ID ${usernameOrId} without access token. Please reconnect your GitHub account.`);
      }
    }
    
    // If we have an access token, verify it works and get the current user
    // This is more reliable than checking /users/{username} which can return 403
    if (hasValidToken) {
      console.log('[GitHubService] Verifying access token and getting current user...');
      const currentUserResponse = await fetch('https://api.github.com/user', { headers });
      
      if (currentUserResponse.ok) {
        const currentUserData = await currentUserResponse.json();
        console.log(`[GitHubService] Authenticated as: ${currentUserData.login} (ID: ${currentUserData.id})`);
        // Use the authenticated user's username (most reliable)
        username = currentUserData.login;
        // Skip user verification since we're authenticated
      } else {
        // Check rate limit headers
        const remaining = currentUserResponse.headers.get('x-ratelimit-remaining');
        const resetTime = currentUserResponse.headers.get('x-ratelimit-reset');
        
        if (currentUserResponse.status === 403) {
          if (remaining === '0') {
            // Rate limit exceeded
            const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : null;
            const resetTimeStr = resetDate ? resetDate.toLocaleTimeString() : 'soon';
            throw new Error(`GitHub API rate limit exceeded. Limit resets at ${resetTimeStr}. Please try again later.`);
          } else {
            // Permission issue
            throw new Error(`GitHub API access denied. Your access token may not have the required permissions. Please disconnect and reconnect your GitHub account.`);
          }
        } else if (currentUserResponse.status === 401) {
          throw new Error(`GitHub access token is invalid or expired. Please disconnect and reconnect your GitHub account.`);
        } else {
          throw new Error(`GitHub API error: ${currentUserResponse.status} ${currentUserResponse.statusText}`);
        }
      }
    } else {
      // No token - verify username exists (this will hit rate limits quickly)
      console.log(`[GitHubService] No access token - verifying GitHub user exists: ${username}`);
      const userInfoUrl = `https://api.github.com/users/${username}`;
      const userInfoResponse = await fetch(userInfoUrl, { headers });
      
      if (!userInfoResponse.ok) {
        if (userInfoResponse.status === 404) {
          throw new Error(`GitHub user '${username}' not found. Please verify your GitHub username is correct.`);
        } else if (userInfoResponse.status === 403) {
          // Rate limiting - provide helpful error
          const remaining = userInfoResponse.headers.get('x-ratelimit-remaining');
          const resetTime = userInfoResponse.headers.get('x-ratelimit-reset');
          if (remaining === '0') {
            const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : null;
            const resetTimeStr = resetDate ? resetDate.toLocaleTimeString() : 'soon';
            throw new Error(`GitHub API rate limit exceeded (unauthenticated). Limit resets at ${resetTimeStr}. Please reconnect your GitHub account with an access token to avoid rate limits.`);
          } else {
            throw new Error(`GitHub API access denied. Please reconnect your GitHub account with an access token.`);
          }
        } else {
          throw new Error(`GitHub API error: ${userInfoResponse.status} ${userInfoResponse.statusText}`);
        }
      } else {
        const userInfo = await userInfoResponse.json();
        console.log(`[GitHubService] Verified GitHub user: ${userInfo.login} (ID: ${userInfo.id})`);
        // Use the canonical username from GitHub (in case of case differences)
        username = userInfo.login;
      }
    }
    
    // Fetch user's repositories
    // Use authenticated endpoint if we have a valid token (includes private repos)
    const reposUrl = hasValidToken
      ? `https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator`
      : `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;
    
    console.log(`[GitHubService] Fetching repos from: ${hasValidToken ? 'authenticated endpoint' : 'public endpoint'}`);
    const reposResponse = await fetch(reposUrl, { headers });
    
    if (!reposResponse.ok) {
      // Check rate limit headers
      const remaining = reposResponse.headers.get('x-ratelimit-remaining');
      const resetTime = reposResponse.headers.get('x-ratelimit-reset');
      
      if (reposResponse.status === 404) {
        throw new Error(`GitHub user '${username}' not found`);
      } else if (reposResponse.status === 403) {
        if (remaining === '0') {
          // Rate limit exceeded
          const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : null;
          const resetTimeStr = resetDate ? resetDate.toLocaleTimeString() : 'soon';
          if (hasValidToken) {
            throw new Error(`GitHub API rate limit exceeded (authenticated). Limit resets at ${resetTimeStr}. Please try again later.`);
          } else {
            throw new Error(`GitHub API rate limit exceeded (unauthenticated). Limit resets at ${resetTimeStr}. Please reconnect your GitHub account with an access token to avoid rate limits.`);
          }
        } else {
          // Permission issue
          if (hasValidToken) {
            throw new Error(`GitHub API access denied. Your access token may not have the required permissions. Please disconnect and reconnect your GitHub account.`);
          } else {
            throw new Error(`GitHub API access denied. Please reconnect your GitHub account with an access token.`);
          }
        }
      }
      throw new Error(`GitHub API error: ${reposResponse.status} ${reposResponse.statusText}`);
    }
    
    const repos = await reposResponse.json();
    console.log(`[GitHubService] Found ${repos.length} repositories`);
    
    // Calculate date N years ago (default 1 year, max 5 years)
    const yearsToFetch = Math.min(Math.max(years, 1), 5);
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - yearsToFetch);
    const since = startDate.toISOString();
    console.log(`[GitHubService] Fetching commits from ${yearsToFetch} year(s) ago: ${since}`);
    
    // Fetch commits from all repositories
    const allCommits: GitHubCommit[] = [];
    
    // Limit to first 20 repos for performance
    const reposToCheck = repos.slice(0, 20);
    console.log(`[GitHubService] Checking ${reposToCheck.length} repositories for commits`);
    
    for (const repo of reposToCheck) {
      try {
        // Fetch commits from repository (without author filter - we'll filter client-side)
        const commitsUrl = `https://api.github.com/repos/${repo.full_name}/commits?since=${since}&per_page=100`;
        const commitsResponse = await fetch(commitsUrl, { headers });
        
        if (commitsResponse.ok) {
          const commits = await commitsResponse.json();
          
          // Filter commits by author username (case-insensitive)
          if (Array.isArray(commits) && commits.length > 0) {
            const userCommits = commits.filter((commit: any) => {
              const authorLogin = commit.author?.login?.toLowerCase();
              const committerLogin = commit.committer?.login?.toLowerCase();
              const usernameLower = username.toLowerCase();
              return authorLogin === usernameLower || committerLogin === usernameLower;
            });
            
            userCommits.forEach((commit: any) => {
              allCommits.push({
                sha: commit.sha,
                message: commit.commit.message,
                date: commit.commit.author.date,
                author: {
                  name: commit.commit.author.name,
                  email: commit.commit.author.email,
                },
              });
            });
            
            console.log(`[GitHubService] Found ${userCommits.length} user commits out of ${commits.length} total in ${repo.full_name}`);
          } else {
            console.log(`[GitHubService] No commits found in ${repo.full_name} for the past year`);
          }
        } else if (commitsResponse.status === 404) {
          // Repo might be private or deleted - skip it
          console.log(`[GitHubService] Repo ${repo.full_name} not accessible (404)`);
        } else if (commitsResponse.status === 403) {
          // Rate limit or permission issue
          console.warn(`[GitHubService] Access denied for ${repo.full_name} (403) - may need different permissions`);
        } else {
          console.warn(`[GitHubService] Failed to fetch commits from ${repo.full_name}: ${commitsResponse.status} ${commitsResponse.statusText}`);
        }
      } catch (error) {
        // Continue with other repos if one fails
        console.warn(`[GitHubService] Error fetching commits from ${repo.full_name}:`, error);
      }
    }
    
    console.log(`[GitHubService] Total commits found across all repos: ${allCommits.length}`);
    
    // Remove duplicates (same SHA)
    const uniqueCommits = Array.from(
      new Map(allCommits.map(commit => [commit.sha, commit])).values()
    );
    
    // Sort by date
    uniqueCommits.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return uniqueCommits;
  } catch (error) {
    console.error('Error fetching GitHub commits:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch GitHub commits');
  }
}

/**
 * Convert GitHub commits to HeatmapData format for a specific year
 */
export function convertCommitsToHeatmapData(
  commits: GitHubCommit[],
  year: number = new Date().getFullYear()
): HeatmapData[] {
  // Create a map of dates to commit counts
  const dateMap = new Map<string, number>();
  
  // Filter commits for the selected year
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);
  
  commits.forEach(commit => {
    const date = new Date(commit.date);
    // Only include commits from the selected year
    if (date >= yearStart && date <= yearEnd) {
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
    }
  });
  
  // Generate 365 days of data for the selected year
  const yearStartDate = new Date(year, 0, 1);
  
  const heatmapData: HeatmapData[] = [];
  
  // Calculate number of days in the year (handles leap years)
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const daysInYear = isLeapYear ? 366 : 365;
  
  for (let i = 0; i < daysInYear; i++) {
    const date = new Date(yearStartDate);
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    
    const commitCount = dateMap.get(dateKey) || 0;
    
    // Calculate activity level (0-4) based on commit count
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (commitCount > 0) {
      if (commitCount === 1) level = 1;
      else if (commitCount <= 3) level = 2;
      else if (commitCount <= 6) level = 3;
      else level = 4;
    }
    
    heatmapData.push({
      date: date.toISOString(),
      level,
      activities: {
        tasks: 0,
        notes: 0,
        focusMinutes: 0,
        commits: commitCount, // Add commits count
      },
    });
  }
  
  return heatmapData;
}

/**
 * Verify GitHub username exists and return canonical username
 * @param username - GitHub username to verify
 * @param accessToken - Optional access token to avoid rate limits
 */
export async function verifyGitHubUsername(
  username: string,
  accessToken?: string
): Promise<string | null> {
  if (!username || !username.trim()) {
    return null;
  }

  try {
    const trimmedUsername = username.trim();
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    // Add authorization header if token is provided
    if (accessToken) {
      headers['Authorization'] = `token ${accessToken}`;
    }
    
    const userInfoUrl = `https://api.github.com/users/${trimmedUsername}`;
    const userInfoResponse = await fetch(userInfoUrl, { headers });

    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json();
      // Return the canonical username from GitHub (handles case differences)
      return userInfo.login || null;
    } else if (userInfoResponse.status === 404) {
      return null; // User not found
    } else if (userInfoResponse.status === 403) {
      // Rate limit or access denied
      const remaining = userInfoResponse.headers.get('x-ratelimit-remaining');
      if (remaining === '0') {
        console.warn(`[GitHubService] Rate limit exceeded when verifying username. Consider using an access token.`);
        // If we have a token, this shouldn't happen - might be invalid token
        // If we don't have a token, this is expected for unauthenticated requests
        // For now, we'll return null to indicate verification failed
        // But we could also return the username as-is if it looks valid
        if (!accessToken) {
          // Without a token, rate limits are common - accept the username as-is if it looks valid
          // GitHub usernames are alphanumeric with hyphens, max 39 chars
          if (/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(trimmedUsername)) {
            console.warn(`[GitHubService] Rate limited, but username format looks valid. Accepting: ${trimmedUsername}`);
            return trimmedUsername; // Accept it if format is valid
          }
        }
      }
      return null;
    } else {
      console.warn(`[GitHubService] Error verifying username: ${userInfoResponse.status}`);
      return null;
    }
  } catch (error) {
    console.error('[GitHubService] Error verifying GitHub username:', error);
    // If network error but username format looks valid, accept it
    if (error instanceof TypeError && /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username.trim())) {
      console.warn(`[GitHubService] Network error, but username format looks valid. Accepting: ${username.trim()}`);
      return username.trim();
    }
    return null;
  }
}

/**
 * Get GitHub username from Firebase auth provider data
 */
export function getGitHubUsername(user: any): string | null {
  if (!user) return null;
  
  // Check if user has providerData directly
  if (user.providerData) {
    const githubProvider = user.providerData.find(
      (provider: any) => provider.providerId === 'github.com'
    );
    
    if (githubProvider) {
      // For GitHub provider, username is stored in uid field
      return githubProvider.uid || githubProvider.displayName || null;
    }
  }
  
  // Check if user has a provider field indicating GitHub
  if (user.provider === 'github') {
    // Try to extract from email or displayName
    if (user.email) {
      const match = user.email.match(/^([^@]+)@users\.noreply\.github\.com$/);
      if (match) return match[1];
    }
    if (user.displayName) return user.displayName;
  }
  
  return null;
}

