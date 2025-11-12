/**
 * Git service for analyzing commit history using isomorphic-git
 */
import git from 'isomorphic-git';
import type { CommitStats } from '../types';

export interface GitCommit {
  oid: string;
  message: string;
  author: {
    name: string;
    email: string;
    timestamp: number;
  };
}

/**
 * Reads commits from the past 30 days
 * @param repoPath - Path to the git repository (defaults to current directory)
 * @returns Array of commits from the past 30 days
 */
export async function getRecentCommits(repoPath: string = '.'): Promise<GitCommit[]> {
  try {
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffTimestamp = Math.floor(thirtyDaysAgo.getTime() / 1000);

    // Get commit log
    const commits = await git.log({
      fs: (window as any).fs || {},
      dir: repoPath,
      depth: 100, // Limit to last 100 commits for performance
    });

    // Filter commits from past 30 days
    const recentCommits: GitCommit[] = commits
      .filter((commit) => commit.commit.author.timestamp >= cutoffTimestamp)
      .map((commit) => ({
        oid: commit.oid,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          timestamp: commit.commit.author.timestamp,
        },
      }));

    return recentCommits;
  } catch (error) {
    console.error('Error reading git commits:', error);
    throw new Error('Failed to read git repository. Make sure you are in a git repository.');
  }
}

/**
 * Analyzes commits and generates statistics
 * @param commits - Array of git commits
 * @returns Commit statistics
 */
export function analyzeCommits(commits: GitCommit[]): CommitStats {
  if (commits.length === 0) {
    return {
      totalCommits: 0,
      averageCommitsPerDay: 0,
      mostActiveHour: 12,
      sentimentScore: 0,
      topKeywords: [],
    };
  }

  // Calculate total commits
  const totalCommits = commits.length;

  // Calculate average commits per day
  const timestamps = commits.map((c) => c.author.timestamp);
  const oldestTimestamp = Math.min(...timestamps);
  const newestTimestamp = Math.max(...timestamps);
  const daysDiff = Math.max(1, (newestTimestamp - oldestTimestamp) / (24 * 60 * 60));
  const averageCommitsPerDay = parseFloat((totalCommits / daysDiff).toFixed(2));

  // Find most active hour
  const hourCounts: { [hour: number]: number } = {};
  commits.forEach((commit) => {
    const date = new Date(commit.author.timestamp * 1000);
    const hour = date.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const mostActiveHour = parseInt(
    Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '12'
  );

  // Calculate sentiment score based on commit messages
  const sentimentScore = calculateSentiment(commits.map((c) => c.message));

  // Extract top keywords from commit messages
  const topKeywords = extractTopKeywords(commits.map((c) => c.message), 5);

  return {
    totalCommits,
    averageCommitsPerDay,
    mostActiveHour,
    sentimentScore,
    topKeywords,
  };
}

/**
 * Calculates sentiment score from commit messages
 * @param messages - Array of commit messages
 * @returns Sentiment score between -1 (negative) and 1 (positive)
 */
function calculateSentiment(messages: string[]): number {
  const positiveWords = ['fix', 'add', 'improve', 'update', 'enhance', 'optimize', 'complete', 'success'];
  const negativeWords = ['bug', 'error', 'fail', 'broken', 'issue', 'problem', 'revert', 'remove'];

  let positiveCount = 0;
  let negativeCount = 0;

  messages.forEach((message) => {
    const lowerMessage = message.toLowerCase();
    positiveWords.forEach((word) => {
      if (lowerMessage.includes(word)) positiveCount++;
    });
    negativeWords.forEach((word) => {
      if (lowerMessage.includes(word)) negativeCount++;
    });
  });

  const total = positiveCount + negativeCount;
  if (total === 0) return 0;

  return parseFloat(((positiveCount - negativeCount) / total).toFixed(2));
}

/**
 * Extracts top keywords from commit messages
 * @param messages - Array of commit messages
 * @param count - Number of top keywords to return
 * @returns Array of top keywords
 */
function extractTopKeywords(messages: string[], count: number): string[] {
  // Common words to ignore
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  ]);

  const wordCounts: { [word: string]: number } = {};

  messages.forEach((message) => {
    // Extract words (alphanumeric only)
    const words = message.toLowerCase().match(/\b[a-z]+\b/g) || [];
    words.forEach((word) => {
      if (word.length > 2 && !stopWords.has(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
  });

  // Sort by frequency and return top keywords
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

/**
 * Checks if a git repository exists
 * @param repoPath - Path to check
 * @returns True if repository exists
 */
export async function isGitRepository(repoPath: string = '.'): Promise<boolean> {
  try {
    await git.log({
      fs: (window as any).fs || {},
      dir: repoPath,
      depth: 1,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Generates demo commit data for testing when no git repository is available
 * @returns Array of demo commits
 */
export function generateDemoCommits(): GitCommit[] {
  const now = Math.floor(Date.now() / 1000);
  const demoMessages = [
    'Initial commit',
    'Add user authentication',
    'Fix login bug',
    'Update dependencies',
    'Improve performance',
    'Add dark mode',
    'Fix styling issues',
    'Refactor code structure',
    'Add new feature',
    'Update documentation',
    'Fix critical bug',
    'Optimize database queries',
    'Add unit tests',
    'Update README',
    'Improve error handling',
  ];

  return demoMessages.map((message, index) => ({
    oid: `demo${index}`,
    message,
    author: {
      name: 'Demo User',
      email: 'demo@example.com',
      timestamp: now - (index * 2 * 24 * 60 * 60), // Spread over 30 days
    },
  }));
}
