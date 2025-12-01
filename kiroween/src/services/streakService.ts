/**
 * Streak Service
 * 
 * Core business logic for streak calculation, validation, and management.
 * Handles date calculations, streak increments, and missed day detection.
 * 
 * ## Timezone Edge Case Handling
 * 
 * This service includes comprehensive timezone edge case handling for:
 * 
 * 1. **Daylight Saving Time (DST) Transitions**
 *    - Spring forward: When clocks jump ahead (e.g., 2am → 3am)
 *    - Fall back: When clocks jump back (e.g., 2am → 1am)
 *    - Detects DST status and transitions
 *    - Normalizes dates across DST boundaries
 * 
 * 2. **User Traveling Across Timezones**
 *    - Detects timezone offset changes
 *    - Adjusts streak calculations when user changes timezone
 *    - Ensures consistent day boundaries regardless of location
 * 
 * 3. **Midnight Rollover During Timezone Changes**
 *    - Handles edge case where midnight occurs at different times
 *    - Ensures streaks increment correctly even during timezone shifts
 *    - Prevents double-counting or missing days
 * 
 * 4. **Leap Years**
 *    - Correctly handles February 29th
 *    - Accurate day difference calculations across leap year boundaries
 * 
 * ## Key Functions for Timezone Handling
 * 
 * - `handleTimezoneChange()`: Adjusts dates when timezone offset changes
 * - `hasTimezoneChanged()`: Detects if timezone offset differs between dates
 * - `getTimezoneOffsetChange()`: Calculates offset change in hours
 * - `isDSTTransitionHour()`: Identifies DST transition hours (2am/3am)
 * - `normalizeDateForTimezone()`: Normalizes dates accounting for timezone shifts
 * - `getDayDifferenceWithTimezone()`: Day difference with timezone awareness
 * - `isSameDay()`: Robust same-day check accounting for timezone changes
 * - `isInDST()`: Determines if a date is in DST period
 * - `calculateStreakWithTimezone()`: Streak calculation with full timezone support
 * 
 * ## Usage Example
 * 
 * ```typescript
 * // Check if timezone changed (e.g., user traveled or DST occurred)
 * const lastCheck = new Date('2024-03-10T01:00:00'); // Before DST
 * const current = new Date('2024-03-10T03:00:00');   // After DST
 * 
 * if (hasTimezoneChanged(lastCheck, current)) {
 *   // Adjust calculations for timezone change
 *   const adjusted = handleTimezoneChange(lastCheck, current);
 *   // Use adjusted date for streak calculations
 * }
 * 
 * // Calculate streak with timezone awareness
 * const streak = calculateStreakWithTimezone(
 *   'login',
 *   activityHistory,
 *   streakData,
 *   new Date(),
 *   lastCheckDate // Optional: for timezone comparison
 * );
 * ```
 */

import type {
  StreakData,
  StreakType,
  ActivityRecord,
  StreakInfo,
  TaskStreakInfo,
  FocusStreakInfo,
  TokenValidation,
  MilestoneDay,
  TokenData,
} from '../types/streak';

/**
 * Date utility: Get the difference in days between two dates
 * Handles timezone-aware calculations by normalizing to midnight UTC
 * 
 * @param date1 - First date (earlier)
 * @param date2 - Second date (later)
 * @returns Number of days between dates (always positive)
 */
export function getDayDifference(date1: Date, date2: Date): number {
  // Normalize both dates to midnight UTC to avoid timezone issues
  const normalized1 = new Date(Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate()));
  const normalized2 = new Date(Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate()));
  
  const diffMs = Math.abs(normalized2.getTime() - normalized1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Date utility: Check if a date is today (in local timezone)
 * 
 * @param date - Date to check
 * @returns True if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Date utility: Check if a date is yesterday (in local timezone)
 * 
 * @param date - Date to check
 * @returns True if date is yesterday
 */
export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  );
}

/**
 * Date utility: Convert Date to ISO date string (YYYY-MM-DD)
 * Uses local timezone
 * 
 * @param date - Date to convert
 * @returns ISO date string
 */
export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Date utility: Parse ISO date string to Date object
 * 
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns Date object at midnight local time
 */
export function parseISODateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Date utility: Get date for N days ago
 * 
 * @param daysAgo - Number of days in the past
 * @returns Date object
 */
export function getDaysAgo(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

/**
 * Date utility: Get midnight of a given date (local timezone)
 * 
 * @param date - Date to normalize
 * @returns Date at midnight
 */
export function getMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Check if an activity record meets the criteria for a specific streak type
 * 
 * @param activity - Activity record for a day
 * @param streakType - Type of streak to check
 * @param streakData - Current streak data (for custom goals)
 * @returns True if activity meets streak criteria
 */
export function meetsStreakCriteria(
  activity: ActivityRecord,
  streakType: StreakType,
  streakData: StreakData
): boolean {
  switch (streakType) {
    case 'login':
      return activity.login;
    
    case 'task':
      return activity.tasks >= streakData.taskStreak.customGoal;
    
    case 'note':
      return activity.notes >= 1;
    
    case 'focus':
      return activity.focusMinutes >= streakData.focusStreak.minimumMinutes;
    
    default:
      return false;
  }
}

/**
 * Determine if a streak should increment based on current state and activity
 * 
 * @param streakInfo - Current streak information
 * @param currentDate - Current date
 * @param activityHistory - Historical activity data
 * @param streakType - Type of streak
 * @param streakData - Full streak data (for custom goals)
 * @returns True if streak should increment
 */
export function shouldIncrementStreak(
  streakInfo: StreakInfo | TaskStreakInfo | FocusStreakInfo,
  currentDate: Date,
  activityHistory: { [date: string]: ActivityRecord },
  streakType: StreakType,
  streakData: StreakData
): boolean {
  const todayString = toISODateString(currentDate);
  const todayActivity = activityHistory[todayString];
  
  // No activity today, can't increment
  if (!todayActivity) {
    return false;
  }
  
  // Check if today's activity meets the criteria
  if (!meetsStreakCriteria(todayActivity, streakType, streakData)) {
    return false;
  }
  
  // If no last activity date, this is the first day
  if (!streakInfo.lastActivityDate) {
    return true;
  }
  
  const lastActivityDate = parseISODateString(streakInfo.lastActivityDate);
  const daysSinceLastActivity = getDayDifference(lastActivityDate, currentDate);
  
  // Same day - already counted
  if (daysSinceLastActivity === 0) {
    return false;
  }
  
  // Consecutive day - increment
  if (daysSinceLastActivity === 1) {
    return true;
  }
  
  // Gap in activity - don't increment (streak should be reset elsewhere)
  return false;
}

/**
 * Check for missed days and determine if streaks should be broken
 * 
 * @param streakData - Current streak data
 * @param currentDate - Current date to check against
 * @returns Object with streak types that have missed days
 */
export function checkMissedDays(
  streakData: StreakData,
  currentDate: Date
): {
  [K in StreakType]?: {
    daysMissed: number;
    lastActivityDate: string;
    canRecover: boolean;
  };
} {
  const missedStreaks: {
    [K in StreakType]?: {
      daysMissed: number;
      lastActivityDate: string;
      canRecover: boolean;
    };
  } = {};
  
  const streakTypes: StreakType[] = ['login', 'task', 'note', 'focus'];
  
  for (const streakType of streakTypes) {
    const streakInfo = getStreakInfo(streakData, streakType);
    
    // Skip if no streak exists yet
    if (!streakInfo.lastActivityDate || streakInfo.current === 0) {
      continue;
    }
    
    const lastActivityDate = parseISODateString(streakInfo.lastActivityDate);
    const daysSinceLastActivity = getDayDifference(lastActivityDate, currentDate);
    
    // If more than 1 day has passed, streak is at risk or broken
    if (daysSinceLastActivity > 1) {
      const canRecover = canUseRecoveryToken(streakData, streakType, lastActivityDate, currentDate);
      
      missedStreaks[streakType] = {
        daysMissed: daysSinceLastActivity - 1, // -1 because 1 day gap is allowed
        lastActivityDate: streakInfo.lastActivityDate,
        canRecover,
      };
    }
  }
  
  return missedStreaks;
}

/**
 * Calculate the current streak for a specific type
 * Walks backward through activity history to count consecutive days
 * 
 * @param streakType - Type of streak to calculate
 * @param activityHistory - Historical activity data
 * @param streakData - Full streak data (for custom goals)
 * @param startDate - Date to start calculating from (defaults to today)
 * @returns Calculated streak count
 */
export function calculateStreak(
  streakType: StreakType,
  activityHistory: { [date: string]: ActivityRecord },
  streakData: StreakData,
  startDate: Date = new Date()
): number {
  let streakCount = 0;
  let currentDate = getMidnight(startDate);
  
  // Walk backward through days
  while (true) {
    const dateString = toISODateString(currentDate);
    const activity = activityHistory[dateString];
    
    // No activity for this day, streak ends
    if (!activity) {
      break;
    }
    
    // Check if activity meets criteria
    if (!meetsStreakCriteria(activity, streakType, streakData)) {
      break;
    }
    
    // Activity meets criteria, increment streak
    streakCount++;
    
    // Move to previous day
    currentDate.setDate(currentDate.getDate() - 1);
    
    // Safety check: don't go back more than 2 years
    if (streakCount > 730) {
      break;
    }
  }
  
  return streakCount;
}

/**
 * Get streak info for a specific streak type
 * Helper to access the correct streak object
 * 
 * @param streakData - Full streak data
 * @param streakType - Type of streak
 * @returns Streak info object
 */
export function getStreakInfo(
  streakData: StreakData,
  streakType: StreakType
): StreakInfo | TaskStreakInfo | FocusStreakInfo {
  switch (streakType) {
    case 'login':
      return streakData.loginStreak;
    case 'task':
      return streakData.taskStreak;
    case 'note':
      return streakData.noteStreak;
    case 'focus':
      return streakData.focusStreak;
  }
}

/**
 * Check if a recovery token can be used for a broken streak
 * 
 * @param streakData - Current streak data
 * @param streakType - Type of streak to recover
 * @param missedDate - Date that was missed
 * @param currentDate - Current date
 * @returns True if token can be used
 */
export function canUseRecoveryToken(
  streakData: StreakData,
  streakType: StreakType,
  missedDate: Date,
  currentDate: Date
): boolean {
  // No tokens available
  if (streakData.tokens.available <= 0) {
    return false;
  }
  
  // Check if within 48-hour recovery window
  const hoursSinceMissed = (currentDate.getTime() - missedDate.getTime()) / (1000 * 60 * 60);
  const RECOVERY_WINDOW_HOURS = 48;
  
  if (hoursSinceMissed > RECOVERY_WINDOW_HOURS) {
    return false;
  }
  
  // Check if streak is actually broken
  const streakInfo = getStreakInfo(streakData, streakType);
  if (streakInfo.current > 0) {
    // Streak is still active, no need to recover
    return false;
  }
  
  return true;
}

/**
 * Validate if a token can be used for streak recovery
 * 
 * @param streakData - Current streak data
 * @param streakType - Type of streak to recover
 * @param missedDate - Date that was missed (ISO string)
 * @returns Validation result with reason if not allowed
 */
export function validateTokenUsage(
  streakData: StreakData,
  streakType: StreakType,
  missedDate: string
): TokenValidation {
  // Check if tokens available
  if (streakData.tokens.available <= 0) {
    return {
      allowed: false,
      reason: 'no_tokens',
    };
  }
  
  // Check if streak is broken
  const streakInfo = getStreakInfo(streakData, streakType);
  if (streakInfo.current > 0) {
    return {
      allowed: false,
      reason: 'already_active',
    };
  }
  
  // Check if within recovery window
  const missedDateObj = parseISODateString(missedDate);
  const currentDate = new Date();
  const canRecover = canUseRecoveryToken(streakData, streakType, missedDateObj, currentDate);
  
  if (!canRecover) {
    return {
      allowed: false,
      reason: 'too_late',
    };
  }
  
  return {
    allowed: true,
  };
}

/**
 * Check if a streak is at risk (no activity today and it's late in the day)
 * 
 * @param streakInfo - Streak information
 * @param activityHistory - Historical activity data
 * @param currentDate - Current date
 * @param warningHour - Hour of day to start warning (default 20 = 8pm)
 * @returns True if streak is at risk
 */
export function isStreakAtRisk(
  streakInfo: StreakInfo | TaskStreakInfo | FocusStreakInfo,
  activityHistory: { [date: string]: ActivityRecord },
  currentDate: Date = new Date(),
  warningHour: number = 20
): boolean {
  // No active streak, not at risk
  if (streakInfo.current === 0) {
    return false;
  }
  
  // Check if it's past the warning hour
  if (currentDate.getHours() < warningHour) {
    return false;
  }
  
  // Check if there's activity today
  const todayString = toISODateString(currentDate);
  const todayActivity = activityHistory[todayString];
  
  // No activity today, streak is at risk
  return !todayActivity;
}

/**
 * Get the next milestone for a given streak count
 * 
 * @param currentStreak - Current streak count
 * @returns Next milestone day count, or null if at max
 */
export function getNextMilestone(currentStreak: number): MilestoneDay | null {
  const milestones: readonly MilestoneDay[] = [3, 7, 14, 30, 60, 100, 365];
  
  for (const milestone of milestones) {
    if (currentStreak < milestone) {
      return milestone;
    }
  }
  
  return null; // Already at or past the highest milestone
}

/**
 * Check if a streak count has reached a milestone
 * 
 * @param streakCount - Current streak count
 * @returns Milestone day if reached, null otherwise
 */
export function checkMilestone(streakCount: number): MilestoneDay | null {
  const milestones: readonly MilestoneDay[] = [3, 7, 14, 30, 60, 100, 365];
  
  for (const milestone of milestones) {
    if (streakCount === milestone) {
      return milestone;
    }
  }
  
  return null;
}

/**
 * Calculate days remaining until next milestone
 * 
 * @param currentStreak - Current streak count
 * @returns Days remaining, or 0 if at max milestone
 */
export function daysUntilNextMilestone(currentStreak: number): number {
  const nextMilestone = getNextMilestone(currentStreak);
  
  if (!nextMilestone) {
    return 0;
  }
  
  return nextMilestone - currentStreak;
}

/**
 * Handle timezone changes by detecting if the user's timezone has shifted
 * Returns adjusted date if timezone change detected
 * 
 * This handles:
 * - DST (Daylight Saving Time) transitions
 * - User traveling across timezones
 * - System timezone changes
 * 
 * @param lastCheckDate - Last date the app was checked
 * @param currentDate - Current date
 * @returns Adjusted date accounting for timezone changes
 */
export function handleTimezoneChange(lastCheckDate: Date, currentDate: Date): Date {
  // Get timezone offset difference (in minutes)
  const lastOffset = lastCheckDate.getTimezoneOffset();
  const currentOffset = currentDate.getTimezoneOffset();
  const offsetDiff = currentOffset - lastOffset;
  
  // If timezone changed, adjust the current date
  if (offsetDiff !== 0) {
    const adjusted = new Date(currentDate);
    adjusted.setMinutes(adjusted.getMinutes() + offsetDiff);
    return adjusted;
  }
  
  return currentDate;
}

/**
 * Detect if a timezone change occurred between two dates
 * This can happen due to DST or user traveling
 * 
 * @param date1 - Earlier date
 * @param date2 - Later date
 * @returns True if timezone offset changed
 */
export function hasTimezoneChanged(date1: Date, date2: Date): boolean {
  return date1.getTimezoneOffset() !== date2.getTimezoneOffset();
}

/**
 * Get the timezone offset change in hours between two dates
 * Positive means timezone moved forward (e.g., DST spring forward)
 * Negative means timezone moved backward (e.g., DST fall back)
 * 
 * @param date1 - Earlier date
 * @param date2 - Later date
 * @returns Offset change in hours
 */
export function getTimezoneOffsetChange(date1: Date, date2: Date): number {
  const offsetDiff = date2.getTimezoneOffset() - date1.getTimezoneOffset();
  return -offsetDiff / 60; // Convert to hours and invert (offset is negative for ahead of UTC)
}

/**
 * Check if a date falls during a DST transition
 * DST transitions typically happen at 2am or 3am
 * 
 * @param date - Date to check
 * @returns True if date is during DST transition hour
 */
export function isDSTTransitionHour(date: Date): boolean {
  const hour = date.getHours();
  // DST transitions typically happen at 2am or 3am
  return hour === 2 || hour === 3;
}

/**
 * Normalize a date to account for DST and timezone changes
 * This ensures consistent day boundaries regardless of timezone shifts
 * 
 * @param date - Date to normalize
 * @param referenceDate - Reference date to compare timezone against (optional)
 * @returns Normalized date
 */
export function normalizeDateForTimezone(date: Date, referenceDate?: Date): Date {
  if (!referenceDate) {
    return getMidnight(date);
  }
  
  // Check if timezone changed between reference and current date
  if (hasTimezoneChanged(referenceDate, date)) {
    // Adjust for timezone change
    const adjusted = handleTimezoneChange(referenceDate, date);
    return getMidnight(adjusted);
  }
  
  return getMidnight(date);
}

/**
 * Calculate day difference accounting for timezone changes
 * This is more robust than getDayDifference for timezone edge cases
 * 
 * @param date1 - First date (earlier)
 * @param date2 - Second date (later)
 * @returns Number of calendar days between dates
 */
export function getDayDifferenceWithTimezone(date1: Date, date2: Date): number {
  // First check if there was a timezone change
  const adjusted2 = hasTimezoneChanged(date1, date2) 
    ? handleTimezoneChange(date1, date2)
    : date2;
  
  // Use the standard day difference calculation
  return getDayDifference(date1, adjusted2);
}

/**
 * Check if two dates are the same calendar day, accounting for timezone
 * This is more robust than simple date comparison
 * 
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if same calendar day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  // Normalize both dates to midnight
  const midnight1 = getMidnight(date1);
  
  // Account for timezone changes
  const adjusted2 = hasTimezoneChanged(date1, date2)
    ? handleTimezoneChange(date1, date2)
    : date2;
  const adjustedMidnight2 = getMidnight(adjusted2);
  
  return midnight1.getTime() === adjustedMidnight2.getTime();
}

/**
 * Get the user's current timezone offset in hours
 * Negative values mean ahead of UTC (e.g., -5 for EST)
 * 
 * @param date - Date to get offset for (defaults to now)
 * @returns Timezone offset in hours
 */
export function getTimezoneOffsetHours(date: Date = new Date()): number {
  return -date.getTimezoneOffset() / 60;
}

/**
 * Check if a date is affected by DST
 * This compares the date's offset to a known non-DST date
 * 
 * @param date - Date to check
 * @returns True if date is in DST period
 */
export function isInDST(date: Date): boolean {
  // Get offset for January (typically not DST in northern hemisphere)
  const jan = new Date(date.getFullYear(), 0, 1);
  const janOffset = jan.getTimezoneOffset();
  
  // Get offset for July (typically DST in northern hemisphere)
  const jul = new Date(date.getFullYear(), 6, 1);
  const julOffset = jul.getTimezoneOffset();
  
  // Current date's offset
  const currentOffset = date.getTimezoneOffset();
  
  // If current offset is less than the max offset, we're in DST
  return currentOffset < Math.max(janOffset, julOffset);
}

/**
 * Safely calculate streak considering timezone edge cases
 * This wraps calculateStreak with timezone-aware logic
 * 
 * @param streakType - Type of streak to calculate
 * @param activityHistory - Historical activity data
 * @param streakData - Full streak data
 * @param startDate - Date to start calculating from
 * @param lastCheckDate - Last time streaks were checked (for timezone comparison)
 * @returns Calculated streak count
 */
export function calculateStreakWithTimezone(
  streakType: StreakType,
  activityHistory: { [date: string]: ActivityRecord },
  streakData: StreakData,
  startDate: Date = new Date(),
  lastCheckDate?: Date
): number {
  // If we have a last check date and timezone changed, adjust start date
  let adjustedStartDate = startDate;
  if (lastCheckDate && hasTimezoneChanged(lastCheckDate, startDate)) {
    adjustedStartDate = handleTimezoneChange(lastCheckDate, startDate);
  }
  
  return calculateStreak(streakType, activityHistory, streakData, adjustedStartDate);
}

/**
 * Check if it's a new day since last check
 * Handles midnight rollover detection
 * 
 * @param lastCheckDate - Last date the app was checked
 * @param currentDate - Current date (defaults to now)
 * @returns True if it's a new day
 */
export function isNewDay(lastCheckDate: Date, currentDate: Date = new Date()): boolean {
  const lastMidnight = getMidnight(lastCheckDate);
  const currentMidnight = getMidnight(currentDate);
  
  return currentMidnight.getTime() > lastMidnight.getTime();
}

/**
 * Initialize empty activity record for a date
 * 
 * @returns Empty activity record
 */
export function createEmptyActivityRecord(): ActivityRecord {
  return {
    tasks: 0,
    notes: 0,
    focusMinutes: 0,
    login: false,
  };
}

/**
 * Merge two activity records (for conflict resolution)
 * Takes the maximum value for each field
 * 
 * @param record1 - First activity record
 * @param record2 - Second activity record
 * @returns Merged activity record
 */
export function mergeActivityRecords(
  record1: ActivityRecord,
  record2: ActivityRecord
): ActivityRecord {
  return {
    tasks: Math.max(record1.tasks, record2.tasks),
    notes: Math.max(record1.notes, record2.notes),
    focusMinutes: Math.max(record1.focusMinutes, record2.focusMinutes),
    login: record1.login || record2.login,
  };
}

// ============================================================================
// Token Economy System
// ============================================================================

/**
 * Calculate how many tokens should be earned for reaching a milestone
 * 
 * Token earning rules:
 * - 30 days: 1 token
 * - 100 days: 2 tokens
 * - 365 days: 3 tokens
 * - Other milestones: 0 tokens
 * 
 * @param milestoneDay - The milestone day count reached
 * @returns Number of tokens to award
 */
export function calculateTokensForMilestone(milestoneDay: MilestoneDay): number {
  switch (milestoneDay) {
    case 30:
      return 1;
    case 100:
      return 2;
    case 365:
      return 3;
    default:
      return 0;
  }
}

/**
 * Award tokens for reaching a milestone
 * Enforces the 3-token maximum limit
 * 
 * @param streakData - Current streak data
 * @param milestoneDay - The milestone day count reached
 * @returns Updated token data
 */
export function awardTokensForMilestone(
  streakData: StreakData,
  milestoneDay: MilestoneDay
): TokenData {
  const tokensToAward = calculateTokensForMilestone(milestoneDay);
  
  if (tokensToAward === 0) {
    return streakData.tokens;
  }
  
  const newAvailable = Math.min(
    streakData.tokens.available + tokensToAward,
    3 // Maximum 3 tokens
  );
  
  const actualTokensAwarded = newAvailable - streakData.tokens.available;
  
  return {
    available: newAvailable,
    earned: streakData.tokens.earned + actualTokensAwarded,
    used: streakData.tokens.used,
  };
}

/**
 * Check if a streak has reached a new milestone
 * Returns the milestone if reached, null otherwise
 * 
 * @param previousStreak - Previous streak count
 * @param currentStreak - Current streak count
 * @returns Milestone day if a new milestone was reached
 */
export function detectMilestoneReached(
  previousStreak: number,
  currentStreak: number
): MilestoneDay | null {
  const milestones: readonly MilestoneDay[] = [3, 7, 14, 30, 60, 100, 365];
  
  // Check if we crossed any milestone threshold
  for (const milestone of milestones) {
    if (previousStreak < milestone && currentStreak >= milestone) {
      return milestone;
    }
  }
  
  return null;
}

/**
 * Validate if a token can be used for streak recovery
 * Checks all token usage rules:
 * 1. User has tokens available
 * 2. Streak is actually broken
 * 3. Within 48-hour recovery window
 * 
 * @param streakData - Current streak data
 * @param streakType - Type of streak to recover
 * @param missedDate - Date that was missed (ISO string)
 * @param currentDate - Current date (defaults to now)
 * @returns Validation result with detailed reason if not allowed
 */
export function validateTokenUsageDetailed(
  streakData: StreakData,
  streakType: StreakType,
  missedDate: string,
  currentDate: Date = new Date()
): TokenValidation {
  // Rule 1: Check if tokens available
  if (streakData.tokens.available <= 0) {
    return {
      allowed: false,
      reason: 'no_tokens',
    };
  }
  
  // Rule 2: Check if streak is broken
  const streakInfo = getStreakInfo(streakData, streakType);
  if (streakInfo.current > 0) {
    return {
      allowed: false,
      reason: 'already_active',
    };
  }
  
  // Rule 3: Check if within 48-hour recovery window
  const missedDateObj = parseISODateString(missedDate);
  const hoursSinceMissed = (currentDate.getTime() - missedDateObj.getTime()) / (1000 * 60 * 60);
  const RECOVERY_WINDOW_HOURS = 48;
  
  if (hoursSinceMissed > RECOVERY_WINDOW_HOURS) {
    return {
      allowed: false,
      reason: 'too_late',
    };
  }
  
  // All checks passed
  return {
    allowed: true,
  };
}

/**
 * Use a recovery token to restore a broken streak
 * Decrements available tokens and marks the streak as recovered
 * 
 * @param streakData - Current streak data
 * @param streakType - Type of streak to recover
 * @param missedDate - Date that was missed (ISO string)
 * @param currentDate - Current date (defaults to now)
 * @returns Updated streak data with token used, or null if validation failed
 */
export function useRecoveryToken(
  streakData: StreakData,
  streakType: StreakType,
  missedDate: string,
  currentDate: Date = new Date()
): StreakData | null {
  // Validate token usage
  const validation = validateTokenUsageDetailed(streakData, streakType, missedDate, currentDate);
  
  if (!validation.allowed) {
    return null;
  }
  
  // Create updated streak data
  const updatedData: StreakData = {
    ...streakData,
    tokens: {
      ...streakData.tokens,
      available: streakData.tokens.available - 1,
      used: streakData.tokens.used + 1,
    },
  };
  
  // Mark the missed date as having activity (recovery)
  const missedDateStr = missedDate;
  updatedData.activityHistory = {
    ...updatedData.activityHistory,
    [missedDateStr]: {
      ...updatedData.activityHistory[missedDateStr],
      // Mark as recovered by ensuring minimum activity
      tasks: Math.max(updatedData.activityHistory[missedDateStr]?.tasks || 0, 1),
      login: true,
    },
  };
  
  return updatedData;
}

/**
 * Check if the 48-hour recovery window is still open for a missed date
 * 
 * @param missedDate - Date that was missed
 * @param currentDate - Current date (defaults to now)
 * @returns True if within 48-hour window
 */
export function isWithinRecoveryWindow(
  missedDate: Date,
  currentDate: Date = new Date()
): boolean {
  const hoursSinceMissed = (currentDate.getTime() - missedDate.getTime()) / (1000 * 60 * 60);
  const RECOVERY_WINDOW_HOURS = 48;
  
  return hoursSinceMissed <= RECOVERY_WINDOW_HOURS;
}

/**
 * Get hours remaining in the recovery window
 * 
 * @param missedDate - Date that was missed
 * @param currentDate - Current date (defaults to now)
 * @returns Hours remaining, or 0 if window expired
 */
export function getRecoveryWindowHoursRemaining(
  missedDate: Date,
  currentDate: Date = new Date()
): number {
  const hoursSinceMissed = (currentDate.getTime() - missedDate.getTime()) / (1000 * 60 * 60);
  const RECOVERY_WINDOW_HOURS = 48;
  
  const remaining = RECOVERY_WINDOW_HOURS - hoursSinceMissed;
  return Math.max(0, remaining);
}

/**
 * Enforce the 3-token maximum limit
 * Caps available tokens at 3
 * 
 * @param tokenData - Current token data
 * @returns Token data with enforced maximum
 */
export function enforceTokenMaximum(tokenData: TokenData): TokenData {
  const MAX_TOKENS = 3;
  
  if (tokenData.available > MAX_TOKENS) {
    return {
      ...tokenData,
      available: MAX_TOKENS,
    };
  }
  
  return tokenData;
}

/**
 * Check if user can earn more tokens (not at maximum)
 * 
 * @param streakData - Current streak data
 * @returns True if user can earn more tokens
 */
export function canEarnMoreTokens(streakData: StreakData): boolean {
  const MAX_TOKENS = 3;
  return streakData.tokens.available < MAX_TOKENS;
}

/**
 * Get the next milestone that awards tokens
 * 
 * @param currentStreak - Current streak count
 * @returns Next token-awarding milestone, or null if none remaining
 */
export function getNextTokenMilestone(currentStreak: number): MilestoneDay | null {
  const tokenMilestones: readonly MilestoneDay[] = [30, 100, 365];
  
  for (const milestone of tokenMilestones) {
    if (currentStreak < milestone) {
      return milestone;
    }
  }
  
  return null;
}

/**
 * Calculate days until next token-earning milestone
 * 
 * @param currentStreak - Current streak count
 * @returns Days remaining, or 0 if no more token milestones
 */
export function daysUntilNextToken(currentStreak: number): number {
  const nextMilestone = getNextTokenMilestone(currentStreak);
  
  if (!nextMilestone) {
    return 0;
  }
  
  return nextMilestone - currentStreak;
}
