/**
 * Moon Phase Calculation Service
 * Uses astronomical formulas to calculate accurate lunar phases
 * Requirement: 5.3
 */

export type MoonPhaseName = 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent';

export interface MoonPhase {
  /** Phase as a percentage (0-1, where 0 is new moon, 0.5 is full moon) */
  phase: number;
  /** Illumination percentage (0-100) */
  illumination: number;
  /** Human-readable phase name */
  name: MoonPhaseName;
  /** Age of moon in days since new moon */
  age: number;
  /** Visual representation character */
  emoji: string;
}

/**
 * Calculate the moon phase for a given date using astronomical formulas
 * Based on the algorithm from "Astronomical Algorithms" by Jean Meeus
 * 
 * @param date - The date to calculate the moon phase for
 * @returns MoonPhase object with phase details
 */
export function calculateMoonPhase(date: Date): MoonPhase {
  // Convert date to Julian Day Number
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const day = date.getDate();
  
  // Calculate Julian Day Number
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  
  // Calculate days since known new moon (January 6, 2000)
  const knownNewMoon = 2451550.1; // Julian Day Number of new moon on Jan 6, 2000
  const daysSinceNewMoon = jdn - knownNewMoon;
  
  // Lunar cycle is approximately 29.53058867 days
  const lunarCycle = 29.53058867;
  
  // Calculate the number of new moons since the known new moon
  const newMoons = daysSinceNewMoon / lunarCycle;
  
  // Get the phase (0-1, where 0 and 1 are new moons)
  const phase = newMoons - Math.floor(newMoons);
  
  // Calculate age of moon in days
  const age = phase * lunarCycle;
  
  // Calculate illumination percentage
  // Illumination is 0% at new moon (phase 0), 100% at full moon (phase 0.5)
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100;
  
  // Determine phase name and emoji
  const { name, emoji } = getMoonPhaseName(phase);
  
  return {
    phase,
    illumination,
    name,
    age,
    emoji,
  };
}

/**
 * Get the moon phase name and emoji based on the phase value
 * 
 * @param phase - Phase value (0-1)
 * @returns Object with phase name and emoji
 */
function getMoonPhaseName(phase: number): { name: MoonPhaseName; emoji: string } {
  // Normalize phase to 0-1 range
  const normalizedPhase = phase % 1;
  
  if (normalizedPhase < 0.033 || normalizedPhase >= 0.967) {
    return { name: 'new', emoji: '🌑' };
  } else if (normalizedPhase < 0.216) {
    return { name: 'waxing-crescent', emoji: '🌒' };
  } else if (normalizedPhase < 0.283) {
    return { name: 'first-quarter', emoji: '🌓' };
  } else if (normalizedPhase < 0.466) {
    return { name: 'waxing-gibbous', emoji: '🌔' };
  } else if (normalizedPhase < 0.533) {
    return { name: 'full', emoji: '🌕' };
  } else if (normalizedPhase < 0.716) {
    return { name: 'waning-gibbous', emoji: '🌖' };
  } else if (normalizedPhase < 0.783) {
    return { name: 'last-quarter', emoji: '🌗' };
  } else {
    return { name: 'waning-crescent', emoji: '🌘' };
  }
}

/**
 * Get the next occurrence of a specific moon phase
 * 
 * @param phaseName - The phase name to find
 * @param startDate - The date to start searching from (defaults to today)
 * @returns Date of the next occurrence of the specified phase
 */
export function getNextPhaseDate(phaseName: MoonPhaseName, startDate: Date = new Date()): Date {
  const lunarCycle = 29.53058867;
  let currentDate = new Date(startDate);
  
  // Search up to 2 lunar cycles ahead
  for (let i = 0; i < lunarCycle * 2; i++) {
    const phase = calculateMoonPhase(currentDate);
    if (phase.name === phaseName) {
      return currentDate;
    }
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // Add one day
  }
  
  return currentDate;
}

/**
 * Get moon phases for an entire month
 * 
 * @param year - Year
 * @param month - Month (1-12)
 * @returns Array of moon phases for each day of the month
 */
export function getMonthMoonPhases(year: number, month: number): MoonPhase[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const phases: MoonPhase[] = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    phases.push(calculateMoonPhase(date));
  }
  
  return phases;
}

/**
 * Check if a date is a full moon (within 1 day)
 * 
 * @param date - Date to check
 * @returns True if the date is a full moon
 */
export function isFullMoon(date: Date): boolean {
  const phase = calculateMoonPhase(date);
  // Full moon is around phase 0.5, with some tolerance
  return Math.abs(phase.phase - 0.5) < 0.033;
}

/**
 * Check if a date is a new moon (within 1 day)
 * 
 * @param date - Date to check
 * @returns True if the date is a new moon
 */
export function isNewMoon(date: Date): boolean {
  const phase = calculateMoonPhase(date);
  // New moon is around phase 0 or 1, with some tolerance
  return phase.phase < 0.033 || phase.phase > 0.967;
}
