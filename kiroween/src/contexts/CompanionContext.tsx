import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { useApp } from './AppContext';
import { cloudSyncService } from '../services/cloudSyncService';
import type { CompanionType, SkillTree } from '../types/skillTree';
import type { MoodState, CompanionMood } from '../types/companionMood';
import type { MoonPhaseName } from '../services/moonPhaseService';
import {
  initializeSkillTree,
  addExperience as addSkillTreeExperience,
  unlockSkill as unlockSkillInTree,
  canUnlockSkill,
  getActiveSkillEffects,
} from '../types/skillTree';
import {
  initializeCompanionMood,
  updateCompanionMood as updateMoodState,
  calculateMood,
} from '../types/companionMood';
import { calculateMoonPhase } from '../services/moonPhaseService';

/**
 * User context for context-aware companion reactions
 */
export interface UserContext {
  currentModule: 'ghost-writer' | 'necronomicon' | 'graveyard' | 'tarot' | 'home';
  currentActivity: 'writing' | 'task-managing' | 'note-taking' | 'idle';
  timeInCurrentActivity: number;
  recentTasks: Array<{
    id: string;
    type: 'tombstone' | 'regular';
    completedAt: number;
  }>;
  currentMoonPhase: MoonPhaseName;
  currentTheme: string;
  writingSessionDuration: number;
}

/**
 * Ritual requirement types
 */
export type RitualRequirement =
  | { type: 'keyword'; value: string; count: number }
  | { type: 'task_sequence'; value: string[]; timeLimit: number }
  | { type: 'note_length'; value: number }
  | { type: 'moon_phase'; value: MoonPhaseName }
  | { type: 'streak'; value: number }
  | { type: 'time_of_day'; value: 'morning' | 'afternoon' | 'evening' | 'night' };

/**
 * Ritual reward types
 */
export interface RitualReward {
  type: 'dialogue' | 'ability' | 'animation' | 'experience';
  value: string | number;
  duration?: number;
}

/**
 * Ritual definition
 */
export interface Ritual {
  id: string;
  name: string;
  description: string;
  companionType: CompanionType | 'all';
  requirements: RitualRequirement[];
  reward: RitualReward;
  isSecret: boolean;
}

/**
 * Ritual progress tracking
 */
export interface RitualProgress {
  ritualId: string;
  progress: number;
  completed: boolean;
  completedAt?: number;
  active: boolean;
}

/**
 * Companion statistics
 */
export interface CompanionStats {
  totalTasks: number;
  currentStreak: number;
  longestStreak: number;
  totalInteractions: number;
  ritualsCompleted: number;
  bondedSince: number;
}

/**
 * Companion Context Type
 */
export interface CompanionContextType {
  // Core state
  activeCompanion: CompanionType;
  unlockedCompanions: CompanionType[];
  customNames: Record<CompanionType, string | undefined>;
  
  // Mood and interaction
  mood: MoodState;
  lastInteraction: number;
  interactionCount: number;
  interactionsToday: number;
  
  // Progression
  level: number;
  experience: number;
  skillTree: SkillTree;
  
  // Rituals
  ritualProgress: RitualProgress[];
  completedRituals: string[];
  
  // Context
  currentContext: UserContext;
  
  // Dialogue
  themeChangeDialogue: string | null;
  
  // Statistics
  stats: CompanionStats;
  
  // Actions
  interact: () => void;
  switchCompanion: (type: CompanionType) => void;
  setCustomName: (type: CompanionType, name: string) => void;
  unlockSkill: (skillId: string) => boolean;
  addExperience: (amount: number) => void;
  updateContext: (context: Partial<UserContext>) => void;
  trackTaskCompletion: (taskId: string, isTombstone: boolean) => void;
  trackNoteActivity: (noteId: string, noteLength: number) => void;
  startNoteTaking: () => void;
  endNoteTaking: () => void;
  
  // Settings
  audioEnabled: boolean;
  audioVolume: number;
  animationIntensity: 'full' | 'reduced' | 'minimal';
  multiSpiritInteractions: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  setAudioVolume: (volume: number) => void;
  setAnimationIntensity: (intensity: 'full' | 'reduced' | 'minimal') => void;
  setMultiSpiritInteractions: (enabled: boolean) => void;
}

const CompanionContext = createContext<CompanionContextType | undefined>(undefined);

interface CompanionProviderProps {
  children: ReactNode;
}

/**
 * CompanionProvider component for managing Spirit Companion state
 * Implements mood tracking, skill progression, ritual detection, and context awareness
 * Requirements: All requirements from spirit-companion-interactions spec
 */
export function CompanionProvider({ children }: CompanionProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const { themeId } = useTheme();
  const { currentModule } = useApp();
  
  // Core companion state
  const [activeCompanion, setActiveCompanion] = useLocalStorage<CompanionType>('activeCompanion', 'shadow');
  const [unlockedCompanions, setUnlockedCompanions] = useLocalStorage<CompanionType[]>('unlockedCompanions', ['shadow']);
  const [customNames, setCustomNames] = useLocalStorage<Record<CompanionType, string | undefined>>(
    'companionCustomNames',
    { shadow: undefined, zombie: undefined, ember: undefined }
  );
  
  // Mood and interaction state
  const [mood, setMood] = useLocalStorage<CompanionMood>(
    'companionMood',
    initializeCompanionMood()
  );
  const [lastInteraction, setLastInteraction] = useLocalStorage<number>('companionLastInteraction', Date.now());
  const [interactionCount, setInteractionCount] = useLocalStorage<number>('companionInteractionCount', 0);
  const [dailyInteractions, setDailyInteractions] = useLocalStorage<{ date: string; count: number }>(
    'companionDailyInteractions',
    { date: new Date().toDateString(), count: 0 }
  );
  
  // Skill tree state (one per companion type)
  const [skillTrees, setSkillTrees] = useLocalStorage<Record<CompanionType, SkillTree>>(
    'companionSkillTrees',
    {
      shadow: initializeSkillTree('shadow'),
      zombie: initializeSkillTree('zombie'),
      ember: initializeSkillTree('ember'),
    }
  );
  
  // Ritual state
  const [ritualProgress, setRitualProgress] = useLocalStorage<RitualProgress[]>('companionRitualProgress', []);
  const [completedRituals, setCompletedRituals] = useLocalStorage<string[]>('companionCompletedRituals', []);
  
  // Statistics
  const [stats, setStats] = useLocalStorage<CompanionStats>('companionStats', {
    totalTasks: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalInteractions: 0,
    ritualsCompleted: 0,
    bondedSince: Date.now(),
  });
  
  // Context awareness state
  const [userContext, setUserContext] = useState<UserContext>({
    currentModule: 'home',
    currentActivity: 'idle',
    timeInCurrentActivity: 0,
    recentTasks: [],
    currentMoonPhase: calculateMoonPhase(new Date()).name,
    currentTheme: themeId,
    writingSessionDuration: 0,
  });
  
  // Settings
  const [audioEnabled, setAudioEnabled] = useLocalStorage<boolean>('companionAudioEnabled', true);
  const [audioVolume, setAudioVolume] = useLocalStorage<number>('companionAudioVolume', 70);
  const [animationIntensity, setAnimationIntensity] = useLocalStorage<'full' | 'reduced' | 'minimal'>(
    'companionAnimationIntensity',
    'full'
  );
  const [multiSpiritInteractions, setMultiSpiritInteractions] = useLocalStorage<boolean>(
    'companionMultiSpiritInteractions',
    true
  );
  
  // Get current skill tree for active companion
  const currentSkillTree = useMemo(() => skillTrees[activeCompanion], [skillTrees, activeCompanion]);
  
  // Calculate interactions today
  const interactionsToday = useMemo(() => {
    const today = new Date().toDateString();
    if (dailyInteractions.date === today) {
      return dailyInteractions.count;
    }
    return 0;
  }, [dailyInteractions]);
  
  // Update daily interactions counter
  useEffect(() => {
    const today = new Date().toDateString();
    if (dailyInteractions.date !== today) {
      setDailyInteractions({ date: today, count: 0 });
    }
  }, [dailyInteractions, setDailyInteractions]);
  
  // Update context when module changes
  useEffect(() => {
    setUserContext(prev => ({
      ...prev,
      currentModule: currentModule as UserContext['currentModule'],
    }));
  }, [currentModule]);
  
  // Track previous theme for change detection
  const [previousTheme, setPreviousTheme] = useState<string>(themeId);
  const [themeChangeDialogue, setThemeChangeDialogue] = useState<string | null>(null);
  
  // Update context when theme changes and trigger dialogue
  useEffect(() => {
    setUserContext(prev => ({
      ...prev,
      currentTheme: themeId,
    }));
    
    // Trigger theme change dialogue if theme actually changed
    if (previousTheme !== themeId && previousTheme !== '') {
      // Import dialogue service dynamically to avoid circular dependencies
      import('../services/companionDialogueService').then(({ getThemeDialogue }) => {
        const dialogue = getThemeDialogue(activeCompanion, themeId as any);
        setThemeChangeDialogue(dialogue);
        
        // Clear dialogue after 5 seconds
        setTimeout(() => setThemeChangeDialogue(null), 5000);
      });
    }
    
    setPreviousTheme(themeId);
  }, [themeId, previousTheme, activeCompanion]);
  
  // Update moon phase periodically
  useEffect(() => {
    const updateMoonPhase = () => {
      const phase = calculateMoonPhase(new Date());
      setUserContext(prev => ({
        ...prev,
        currentMoonPhase: phase.name,
      }));
    };
    
    // Update immediately
    updateMoonPhase();
    
    // Update every hour
    const interval = setInterval(updateMoonPhase, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Track tasks completed today for mood calculation
  const [tasksCompletedToday, setTasksCompletedToday] = useLocalStorage<number>('companionTasksCompletedToday', 0);
  const [lastTaskDate, setLastTaskDate] = useLocalStorage<string>('companionLastTaskDate', new Date().toDateString());
  
  // Reset daily task counter at midnight
  useEffect(() => {
    const today = new Date().toDateString();
    if (lastTaskDate !== today) {
      setTasksCompletedToday(0);
      setLastTaskDate(today);
    }
  }, [lastTaskDate, setTasksCompletedToday, setLastTaskDate]);
  
  // Calculate mood based on activity
  useEffect(() => {
    const today = new Date().toDateString();
    const daysSinceLastTask = lastTaskDate === today ? 0 : 
      Math.floor((Date.now() - new Date(lastTaskDate).getTime()) / (1000 * 60 * 60 * 24));
    
    const newMood = calculateMood(
      tasksCompletedToday,
      stats.currentStreak,
      daysSinceLastTask,
      interactionsToday
    );
    
    if (newMood !== mood.current) {
      const updatedMood = updateMoodState(mood, newMood, 'Activity-based mood update');
      setMood(updatedMood);
    }
  }, [tasksCompletedToday, stats.currentStreak, interactionsToday, lastTaskDate, mood, setMood]);
  
  // Load companion data from Firebase on mount for authenticated users
  useEffect(() => {
    const loadFromFirebase = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        const cloudData = await cloudSyncService.fetchCompanionData(user.id);
        
        if (cloudData) {
          // Merge cloud data with local data, preferring cloud data if it's newer
          if (cloudData.activeCompanion) setActiveCompanion(cloudData.activeCompanion);
          if (cloudData.unlockedCompanions) setUnlockedCompanions(cloudData.unlockedCompanions);
          if (cloudData.customNames) setCustomNames(cloudData.customNames);
          if (cloudData.skillTrees) setSkillTrees(cloudData.skillTrees);
          if (cloudData.stats) setStats(cloudData.stats);
          if (cloudData.mood) setMood(cloudData.mood);
          if (cloudData.completedRituals) setCompletedRituals(cloudData.completedRituals);
          if (cloudData.ritualProgress) setRitualProgress(cloudData.ritualProgress);
          
          console.log('Companion data loaded from Firebase');
        }
      } catch (error) {
        console.error('Failed to load companion data from Firebase:', error);
      }
    };
    
    loadFromFirebase();
  }, [isAuthenticated, user, setActiveCompanion, setUnlockedCompanions, setCustomNames, setSkillTrees, setStats, setMood, setCompletedRituals, setRitualProgress]); // Only run when auth state changes
  
  // Subscribe to real-time companion data updates
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const unsubscribe = cloudSyncService.subscribeToCompanionData(
      user.id,
      (cloudData) => {
        // Update local state with cloud changes
        if (cloudData.activeCompanion) setActiveCompanion(cloudData.activeCompanion);
        if (cloudData.unlockedCompanions) setUnlockedCompanions(cloudData.unlockedCompanions);
        if (cloudData.customNames) setCustomNames(cloudData.customNames);
        if (cloudData.skillTrees) setSkillTrees(cloudData.skillTrees);
        if (cloudData.stats) setStats(cloudData.stats);
        if (cloudData.mood) setMood(cloudData.mood);
        if (cloudData.completedRituals) setCompletedRituals(cloudData.completedRituals);
        if (cloudData.ritualProgress) setRitualProgress(cloudData.ritualProgress);
      },
      (error) => {
        console.error('Error in companion data subscription:', error);
      }
    );
    
    return () => unsubscribe();
  }, [isAuthenticated, user, setActiveCompanion, setUnlockedCompanions, setCustomNames, setSkillTrees, setStats, setMood, setCompletedRituals, setRitualProgress]);
  
  // Sync to cloud for authenticated users
  useEffect(() => {
    const syncToCloud = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        await cloudSyncService.syncCompanionData(user.id, {
          activeCompanion,
          unlockedCompanions,
          customNames,
          skillTrees,
          stats,
          mood,
          completedRituals,
          ritualProgress,
        });
      } catch (error) {
        console.error('Failed to sync companion data to cloud:', error);
      }
    };
    
    const timeoutId = setTimeout(syncToCloud, 2000);
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user, activeCompanion, unlockedCompanions, customNames, skillTrees, stats, mood, completedRituals, ritualProgress]);
  
  /**
   * Handle companion interaction
   * Requirements: 1.1, 2.1
   */
  const interact = useCallback(() => {
    setLastInteraction(Date.now());
    setInteractionCount(prev => prev + 1);
    
    const today = new Date().toDateString();
    setDailyInteractions(prev => {
      if (prev.date === today) {
        return { date: today, count: prev.count + 1 };
      }
      return { date: today, count: 1 };
    });
    
    setStats(prev => ({
      ...prev,
      totalInteractions: prev.totalInteractions + 1,
    }));
  }, [setLastInteraction, setInteractionCount, setDailyInteractions, setStats]);
  
  /**
   * Switch active companion
   * Requirements: 14.5
   */
  const switchCompanion = useCallback((type: CompanionType) => {
    console.log('🔍 switchCompanion called:', {
      requestedType: type,
      unlockedCompanions,
      isUnlocked: unlockedCompanions.includes(type),
      currentActive: activeCompanion
    });
    
    // Auto-unlock companion if not already unlocked (for first-time selection)
    if (!unlockedCompanions.includes(type)) {
      console.log(`🔓 Auto-unlocking companion: ${type}`);
      setUnlockedCompanions(prev => [...prev, type]);
    }
    
    // Initialize skill tree if it doesn't exist for this companion
    if (!skillTrees[type]) {
      console.log(`🌳 Initializing skill tree for: ${type}`);
      setSkillTrees(prev => ({
        ...prev,
        [type]: initializeSkillTree(type)
      }));
    }
    
    console.log('🔍 Switching to:', type);
    setActiveCompanion(type);
  }, [unlockedCompanions, setActiveCompanion, setUnlockedCompanions, activeCompanion, skillTrees, setSkillTrees]);
  
  /**
   * Set custom name for a companion
   * Requirements: 6.1, 6.2, 6.3
   */
  const setCustomName = useCallback((type: CompanionType, name: string) => {
    // Validate name length
    if (name.length < 1 || name.length > 20) {
      console.warn('Custom name must be between 1-20 characters');
      return;
    }
    
    setCustomNames(prev => ({
      ...prev,
      [type]: name,
    }));
  }, [setCustomNames]);
  
  /**
   * Unlock a skill in the skill tree
   * Requirements: 11.2, 11.5
   */
  const unlockSkill = useCallback((skillId: string): boolean => {
    const validation = canUnlockSkill(currentSkillTree, skillId);
    
    if (!validation.canUnlock) {
      console.warn(`Cannot unlock skill: ${validation.reason}`);
      return false;
    }
    
    const updatedTree = unlockSkillInTree(currentSkillTree, skillId);
    
    setSkillTrees(prev => ({
      ...prev,
      [activeCompanion]: updatedTree,
    }));
    
    return true;
  }, [currentSkillTree, activeCompanion, setSkillTrees]);
  
  /**
   * Add experience to the active companion
   * Requirements: 11.1, 11.2
   */
  const addExperience = useCallback((amount: number) => {
    // Apply XP boost from skills
    const activeEffects = getActiveSkillEffects(currentSkillTree);
    const xpBoost = activeEffects
      .filter(effect => effect.type === 'xp_boost')
      .reduce((total, effect) => total + (typeof effect.value === 'number' ? effect.value : 0), 0);
    
    const boostedAmount = Math.floor(amount * (1 + xpBoost / 100));
    
    const updatedTree = addSkillTreeExperience(currentSkillTree, boostedAmount);
    
    setSkillTrees(prev => ({
      ...prev,
      [activeCompanion]: updatedTree,
    }));
  }, [currentSkillTree, activeCompanion, setSkillTrees]);
  
  /**
   * Update user context
   * Requirements: 10.1-10.7
   */
  const updateContext = useCallback((context: Partial<UserContext>) => {
    setUserContext(prev => ({
      ...prev,
      ...context,
    }));
  }, []);
  
  /**
   * Track task completion for experience and stats
   * Requirements: 10.3, 11.1
   */
  const trackTaskCompletion = useCallback((taskId: string, isTombstone: boolean) => {
    // Award experience
    const xpAmount = isTombstone ? 20 : 10;
    addExperience(xpAmount);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalTasks: prev.totalTasks + 1,
    }));
    
    // Update daily task counter
    const today = new Date().toDateString();
    if (lastTaskDate === today) {
      setTasksCompletedToday(prev => prev + 1);
    } else {
      setTasksCompletedToday(1);
      setLastTaskDate(today);
    }
    
    // Add to recent tasks
    setUserContext(prev => ({
      ...prev,
      recentTasks: [
        ...prev.recentTasks.slice(-9), // Keep last 9
        {
          id: taskId,
          type: isTombstone ? 'tombstone' : 'regular',
          completedAt: Date.now(),
        },
      ],
    }));
  }, [addExperience, setStats, lastTaskDate, setTasksCompletedToday, setLastTaskDate]);
  
  /**
   * Track note-taking activity for rituals and context awareness
   * Requirements: 10.2
   */
  const trackNoteActivity = useCallback((_noteId: string, noteLength: number) => {
    // Award small XP for note-taking activity
    if (noteLength > 100) {
      addExperience(5);
    }
    
    // Check for long note encouragement (500+ characters)
    if (noteLength >= 500) {
      // This could trigger companion dialogue in the UI
      console.log('Long note detected - companion should show encouragement');
    }
  }, [addExperience]);
  
  /**
   * Start note-taking activity tracking
   * Requirements: 10.2
   */
  const startNoteTaking = useCallback(() => {
    setUserContext(prev => ({
      ...prev,
      currentActivity: 'note-taking',
      timeInCurrentActivity: 0,
    }));
  }, []);
  
  /**
   * End note-taking activity tracking
   * Requirements: 10.2
   */
  const endNoteTaking = useCallback(() => {
    setUserContext(prev => ({
      ...prev,
      currentActivity: 'idle',
      timeInCurrentActivity: 0,
    }));
  }, []);
  
  const value: CompanionContextType = {
    // Core state
    activeCompanion,
    unlockedCompanions,
    customNames,
    
    // Mood and interaction
    mood: mood.current,
    lastInteraction,
    interactionCount,
    interactionsToday,
    
    // Progression
    level: currentSkillTree.level,
    experience: currentSkillTree.experience,
    skillTree: currentSkillTree,
    
    // Rituals
    ritualProgress,
    completedRituals,
    
    // Context
    currentContext: userContext,
    
    // Dialogue
    themeChangeDialogue,
    
    // Statistics
    stats,
    
    // Actions
    interact,
    switchCompanion,
    setCustomName,
    unlockSkill,
    addExperience,
    updateContext,
    trackTaskCompletion,
    trackNoteActivity,
    startNoteTaking,
    endNoteTaking,
    
    // Settings
    audioEnabled,
    audioVolume,
    animationIntensity,
    multiSpiritInteractions,
    setAudioEnabled,
    setAudioVolume,
    setAnimationIntensity,
    setMultiSpiritInteractions,
  };
  
  return <CompanionContext.Provider value={value}>{children}</CompanionContext.Provider>;
}

/**
 * Hook to access CompanionContext
 * @throws Error if used outside CompanionProvider
 */
export function useCompanion(): CompanionContextType {
  const context = useContext(CompanionContext);
  if (context === undefined) {
    throw new Error('useCompanion must be used within a CompanionProvider');
  }
  return context;
}
