import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { streakStorageService } from '../services/streakStorageService';
import {
  calculateStreak,
  checkMissedDays,
  shouldIncrementStreak,
  getStreakInfo,
  validateTokenUsage,
  isStreakAtRisk,
  getNextMilestone,
  toISODateString,
  getDayDifference,
  checkMilestone,
  createEmptyActivityRecord,
  detectMilestoneReached,
  awardTokensForMilestone,
} from '../services/streakService';
import type {
  StreakData,
  StreakType,
  ActivityType,
  HeatmapData,
  StreakGoals,
  MilestoneDay,
} from '../types/streak';

/**
 * Streak Context Type
 * Provides all streak tracking functionality to the application
 * Requirements: Task 1.4 - Streak Context
 */
interface StreakContextType {
  // State
  streaks: StreakData | null;
  loading: boolean;
  
  // Actions
  checkStreaks: () => Promise<void>;
  recordActivity: (type: ActivityType, metadata?: { minutes?: number }) => void;
  useRecoveryToken: (streakType: StreakType) => Promise<boolean>;
  
  // Computed
  isStreakAtRisk: (streakType: StreakType) => boolean;
  nextMilestone: (streakType: StreakType) => MilestoneDay | null;
  heatmapData: HeatmapData[];
  
  // Settings
  updateStreakGoals: (goals: Partial<StreakGoals>) => void;
  toggleNotifications: (enabled: boolean) => void;
  streakGoals: StreakGoals;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

interface StreakProviderProps {
  children: ReactNode;
}

/**
 * Default streak data structure
 */
function createDefaultStreakData(): StreakData {
  const today = toISODateString(new Date());
  
  return {
    loginStreak: {
      current: 0,
      longest: 0,
      lastActivityDate: '',
      startDate: today,
    },
    taskStreak: {
      current: 0,
      longest: 0,
      lastActivityDate: '',
      startDate: today,
      customGoal: 1, // Default: 1 task per day
    },
    noteStreak: {
      current: 0,
      longest: 0,
      lastActivityDate: '',
      startDate: today,
    },
    focusStreak: {
      current: 0,
      longest: 0,
      lastActivityDate: '',
      startDate: today,
      minimumMinutes: 25, // Default: 25 minutes (one Pomodoro)
    },
    tokens: {
      available: 0,
      earned: 0,
      used: 0,
    },
    milestones: {},
    activityHistory: {},
  };
}

/**
 * Default streak goals
 */
function createDefaultStreakGoals(): StreakGoals {
  return {
    taskGoal: 1,
    focusGoal: 25,
    notificationsEnabled: true,
    notificationTime: '20:00',
  };
}

/**
 * StreakProvider component for managing streak state
 * Implements streak tracking, activity recording, and token management
 * Requirements: Task 1.4 - Streak Context
 */
export function StreakProvider({ children }: StreakProviderProps) {
  const { user, isAuthenticated } = useAuth();
  
  // Core streak state
  const [streaks, setStreaks] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheckDate, setLastCheckDate] = useState<Date>(new Date());
  
  // Streak goals/settings
  const [streakGoals, setStreakGoals] = useState<StreakGoals>(createDefaultStreakGoals());
  
  // Track if we've recorded initial login
  const hasRecordedInitialLogin = useRef(false);
  
  /**
   * Load streak data on mount
   * Requirements: Task 1.4 - Integrate with storage service
   */
  useEffect(() => {
    const loadStreakData = async () => {
      try {
        setLoading(true);
        const userId = isAuthenticated && user ? user.id : undefined;
        const data = await streakStorageService.loadStreakData(userId);
        
        if (data) {
          setStreaks(data);
        } else {
          // Initialize new streak data
          const newData = createDefaultStreakData();
          setStreaks(newData);
          
          // Save initial data
          if (userId) {
            streakStorageService.saveStreakData(newData, userId);
          }
        }
      } catch (error) {
        // Initialize with default data on error
        setStreaks(createDefaultStreakData());
      } finally {
        setLoading(false);
        // Mark that we should record login on next render
        hasRecordedInitialLogin.current = false;
      }
    };
    
    loadStreakData();
  }, [isAuthenticated, user]);
  
  /**
   * Save streak data whenever it changes
   * Requirements: Task 1.4 - Integrate with storage service
   */
  useEffect(() => {
    if (!streaks || loading) return;
    
    const userId = isAuthenticated && user ? user.id : undefined;
    streakStorageService.saveStreakData(streaks, userId);
  }, [streaks, isAuthenticated, user, loading]);
  
  /**
   * Check and update streaks
   * Called on app mount and when date changes
   * Requirements: Task 1.4 - Add checkStreaks() function
   */
  const checkStreaks = useCallback(async () => {
    if (!streaks) return;
    
    const currentDate = new Date();
    const daysSinceLastCheck = getDayDifference(lastCheckDate, currentDate);
    
    // Same day, no update needed
    if (daysSinceLastCheck === 0) {
      return;
    }
    
    // Check for missed days
    const missedStreaks = checkMissedDays(streaks, currentDate);
    
    // Update streaks based on missed days
    const updatedStreaks = { ...streaks };
    let hasChanges = false;
    
    for (const [streakType, missedInfo] of Object.entries(missedStreaks)) {
      const type = streakType as StreakType;
      
      // Break the streak if missed and can't recover
      if (!missedInfo.canRecover) {
        const info = getStreakInfo(updatedStreaks, type);
        
        // Update longest if current was longer
        if (info.current > info.longest) {
          info.longest = info.current;
        }
        
        // Reset current streak
        info.current = 0;
        info.startDate = toISODateString(currentDate);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      setStreaks(updatedStreaks);
    }
    
    setLastCheckDate(currentDate);
  }, [streaks, lastCheckDate]);
  
  /**
   * Record activity for a specific type
   * Requirements: Task 1.4 - Add recordActivity() function
   */
  const recordActivity = useCallback((
    type: ActivityType,
    metadata?: { minutes?: number }
  ) => {
    if (!streaks) return;
    
    const currentDate = new Date();
    const dateString = toISODateString(currentDate);
    
    // Get or create today's activity record
    const todayActivity = streaks.activityHistory[dateString] || createEmptyActivityRecord();
    
    // Update activity based on type
    switch (type) {
      case 'login':
        todayActivity.login = true;
        break;
      case 'task':
        todayActivity.tasks += 1;
        break;
      case 'note':
        todayActivity.notes += 1;
        break;
      case 'focus':
        todayActivity.focusMinutes += metadata?.minutes || 0;
        break;
    }
    
    // Update activity history
    const updatedStreaks = {
      ...streaks,
      activityHistory: {
        ...streaks.activityHistory,
        [dateString]: todayActivity,
      },
    };
    
    // Check if streak should increment
    const streakType = type as StreakType;
    const streakInfo = getStreakInfo(updatedStreaks, streakType);
    
    if (shouldIncrementStreak(streakInfo, currentDate, updatedStreaks.activityHistory, streakType, updatedStreaks)) {
      // Store previous streak count for milestone detection
      const previousStreak = streakInfo.current;
      
      // Increment streak
      streakInfo.current += 1;
      streakInfo.lastActivityDate = dateString;
      
      // Update longest if current is now longer
      if (streakInfo.current > streakInfo.longest) {
        streakInfo.longest = streakInfo.current;
      }
      
      // Detect if a milestone was reached
      const milestone = detectMilestoneReached(previousStreak, streakInfo.current);
      if (milestone) {
        // Mark milestone as achieved
        if (!updatedStreaks.milestones[milestone]) {
          updatedStreaks.milestones[milestone] = {
            achieved: true,
            date: dateString,
            rewardClaimed: false,
          };
          
          // Award tokens using the token economy system
          updatedStreaks.tokens = awardTokensForMilestone(updatedStreaks, milestone);
        }
      }
    }
    
    setStreaks(updatedStreaks);
  }, [streaks]);
  
  /**
   * Use a recovery token to restore a broken streak
   * Requirements: Task 1.4 - Add useRecoveryToken() function
   */
  const useRecoveryToken = useCallback(async (streakType: StreakType): Promise<boolean> => {
    if (!streaks) return false;
    
    const streakInfo = getStreakInfo(streaks, streakType);
    
    // Validate token usage
    const validation = validateTokenUsage(streaks, streakType, streakInfo.lastActivityDate);
    
    if (!validation.allowed) {
      console.warn(`Cannot use recovery token: ${validation.reason}`);
      return false;
    }
    
    // Use the token
    const updatedStreaks = { ...streaks };
    updatedStreaks.tokens.available -= 1;
    updatedStreaks.tokens.used += 1;
    
    // Restore the streak
    const info = getStreakInfo(updatedStreaks, streakType);
    
    // Recalculate streak from activity history
    const recalculated = calculateStreak(streakType, updatedStreaks.activityHistory, updatedStreaks);
    info.current = recalculated;
    
    // Update last activity date to today
    info.lastActivityDate = toISODateString(new Date());
    
    setStreaks(updatedStreaks);
    
    // Force immediate sync for critical update
    const userId = isAuthenticated && user ? user.id : undefined;
    if (userId) {
      await streakStorageService.forceSync(updatedStreaks, userId);
    }
    
    return true;
  }, [streaks, isAuthenticated, user]);
  
  /**
   * Check if a streak is at risk
   * Requirements: Task 1.4 - Computed properties
   */
  const checkStreakAtRisk = useCallback((streakType: StreakType): boolean => {
    if (!streaks) return false;
    
    const streakInfo = getStreakInfo(streaks, streakType);
    return isStreakAtRisk(streakInfo, streaks.activityHistory);
  }, [streaks]);
  
  /**
   * Get next milestone for a streak
   * Requirements: Task 1.4 - Computed properties
   */
  const getNextStreakMilestone = useCallback((streakType: StreakType): MilestoneDay | null => {
    if (!streaks) return null;
    
    const streakInfo = getStreakInfo(streaks, streakType);
    return getNextMilestone(streakInfo.current);
  }, [streaks]);
  
  /**
   * Generate heatmap data for the last 365 days
   * Requirements: Task 1.4 - Computed properties
   */
  const heatmapData = useMemo((): HeatmapData[] => {
    if (!streaks) return [];
    
    const data: HeatmapData[] = [];
    const today = new Date();
    
    // Generate data for last 365 days
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = toISODateString(date);
      
      const activity = streaks.activityHistory[dateString] || createEmptyActivityRecord();
      
      // Calculate activity level (0-4)
      const score = 
        activity.tasks * 2 +
        activity.notes * 1 +
        Math.floor(activity.focusMinutes / 15);
      
      let level: HeatmapData['level'];
      if (score === 0) level = 0;
      else if (score <= 2) level = 1;
      else if (score <= 5) level = 2;
      else if (score <= 10) level = 3;
      else level = 4;
      
      data.push({
        date: dateString,
        level,
        activities: {
          tasks: activity.tasks,
          notes: activity.notes,
          focusMinutes: activity.focusMinutes,
        },
      });
    }
    
    return data;
  }, [streaks]);
  
  /**
   * Update streak goals
   * Requirements: Task 1.4 - Settings management
   */
  const updateStreakGoals = useCallback((goals: Partial<StreakGoals>) => {
    setStreakGoals(prev => ({
      ...prev,
      ...goals,
    }));
    
    // Update streak data if task or focus goals changed
    if (streaks && (goals.taskGoal !== undefined || goals.focusGoal !== undefined)) {
      const updatedStreaks = { ...streaks };
      
      if (goals.taskGoal !== undefined) {
        updatedStreaks.taskStreak.customGoal = goals.taskGoal;
      }
      
      if (goals.focusGoal !== undefined) {
        updatedStreaks.focusStreak.minimumMinutes = goals.focusGoal;
      }
      
      setStreaks(updatedStreaks);
    }
  }, [streaks]);
  
  /**
   * Toggle notifications
   * Requirements: Task 1.4 - Settings management
   */
  const toggleNotifications = useCallback((enabled: boolean) => {
    setStreakGoals(prev => ({
      ...prev,
      notificationsEnabled: enabled,
    }));
  }, []);
  
  /**
   * Check streaks on mount and periodically
   */
  useEffect(() => {
    // Check streaks on mount
    checkStreaks();
    
    // Check streaks every hour
    const interval = setInterval(checkStreaks, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkStreaks]);
  
  /**
   * Record login activity on mount
   * Only runs once after initial load to avoid duplicate login records
   */
  useEffect(() => {
    if (streaks && !loading && !hasRecordedInitialLogin.current) {
      hasRecordedInitialLogin.current = true;
      recordActivity('login');
    }
  }, [streaks, loading, recordActivity]); // Run when loading completes and streaks are available
  
  const value: StreakContextType = {
    // State
    streaks,
    loading,
    
    // Actions
    checkStreaks,
    recordActivity,
    useRecoveryToken,
    
    // Computed
    isStreakAtRisk: checkStreakAtRisk,
    nextMilestone: getNextStreakMilestone,
    heatmapData,
    
    // Settings
    updateStreakGoals,
    toggleNotifications,
    streakGoals,
  };
  
  return <StreakContext.Provider value={value}>{children}</StreakContext.Provider>;
}

/**
 * Hook to access StreakContext
 * @throws Error if used outside StreakProvider
 */
export function useStreak(): StreakContextType {
  const context = useContext(StreakContext);
  if (context === undefined) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
}
