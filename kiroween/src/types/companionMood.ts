/**
 * Companion Mood System
 * 
 * Defines mood states and tracking for Spirit Companions based on user activity.
 * Moods reflect productivity patterns and provide emotional feedback.
 */

export type MoodState =
  | 'happy'       // Multiple tasks completed recently
  | 'excited'     // On a streak
  | 'energized'   // First task of day
  | 'concerned'   // No activity for days
  | 'neutral'     // Default state
  | 'proud'       // Major milestone achieved
  | 'playful';    // User interacting frequently

export interface MoodHistoryEntry {
  mood: MoodState;
  timestamp: number;
  trigger: string;
}

export interface CompanionMood {
  current: MoodState;
  lastUpdated: number;
  history: MoodHistoryEntry[];
}

/**
 * Calculate companion mood based on user activity patterns
 * 
 * @param tasksCompletedToday - Number of tasks completed today
 * @param currentStreak - Current consecutive days with completed tasks
 * @param daysSinceLastTask - Days since last task completion
 * @param interactionsToday - Number of companion interactions today
 * @returns The calculated mood state
 */
export function calculateMood(
  tasksCompletedToday: number,
  currentStreak: number,
  daysSinceLastTask: number,
  interactionsToday: number
): MoodState {
  // Priority order matters - check most specific conditions first
  
  // Concerned if user has been away for multiple days
  if (daysSinceLastTask > 3) {
    return 'concerned';
  }
  
  // Excited if on a significant streak
  if (currentStreak >= 7) {
    return 'excited';
  }
  
  // Happy if multiple tasks completed today
  if (tasksCompletedToday >= 5) {
    return 'happy';
  }
  
  // Energized for first task of the day
  if (tasksCompletedToday === 1) {
    return 'energized';
  }
  
  // Playful if user is interacting frequently
  if (interactionsToday > 10) {
    return 'playful';
  }
  
  // Default to neutral
  return 'neutral';
}

/**
 * Create a new mood history entry
 * 
 * @param mood - The mood state
 * @param trigger - Description of what triggered this mood
 * @returns A new mood history entry
 */
export function createMoodHistoryEntry(
  mood: MoodState,
  trigger: string
): MoodHistoryEntry {
  return {
    mood,
    timestamp: Date.now(),
    trigger
  };
}

/**
 * Initialize a new companion mood state
 * 
 * @param initialMood - Optional initial mood (defaults to 'neutral')
 * @returns A new CompanionMood object
 */
export function initializeCompanionMood(
  initialMood: MoodState = 'neutral'
): CompanionMood {
  return {
    current: initialMood,
    lastUpdated: Date.now(),
    history: [createMoodHistoryEntry(initialMood, 'Initial mood')]
  };
}

/**
 * Update companion mood and add to history
 * 
 * @param currentMood - Current mood state
 * @param newMood - New mood to set
 * @param trigger - Description of what triggered the mood change
 * @param maxHistoryLength - Maximum number of history entries to keep (default: 100)
 * @returns Updated CompanionMood object
 */
export function updateCompanionMood(
  currentMood: CompanionMood,
  newMood: MoodState,
  trigger: string,
  maxHistoryLength: number = 100
): CompanionMood {
  // Only update if mood actually changed
  if (currentMood.current === newMood) {
    return currentMood;
  }
  
  const newEntry = createMoodHistoryEntry(newMood, trigger);
  const updatedHistory = [...currentMood.history, newEntry];
  
  // Trim history if it exceeds max length
  const trimmedHistory = updatedHistory.length > maxHistoryLength
    ? updatedHistory.slice(-maxHistoryLength)
    : updatedHistory;
  
  return {
    current: newMood,
    lastUpdated: Date.now(),
    history: trimmedHistory
  };
}

/**
 * Get the most recent mood changes
 * 
 * @param mood - CompanionMood object
 * @param count - Number of recent entries to retrieve
 * @returns Array of recent mood history entries
 */
export function getRecentMoodHistory(
  mood: CompanionMood,
  count: number = 10
): MoodHistoryEntry[] {
  return mood.history.slice(-count);
}

/**
 * Get mood transition animations based on mood change
 * 
 * @param fromMood - Previous mood state
 * @param toMood - New mood state
 * @returns Animation name for the transition
 */
export function getMoodTransitionAnimation(
  fromMood: MoodState,
  toMood: MoodState
): string {
  // Special transitions for dramatic mood changes
  if (fromMood === 'concerned' && toMood === 'happy') {
    return 'relief-celebration';
  }
  
  if (fromMood === 'neutral' && toMood === 'excited') {
    return 'energize';
  }
  
  if (toMood === 'concerned') {
    return 'fade-worried';
  }
  
  if (toMood === 'excited') {
    return 'bounce-excited';
  }
  
  if (toMood === 'playful') {
    return 'wiggle-playful';
  }
  
  // Default smooth transition
  return 'smooth-transition';
}
