/**
 * Spirit Companion Type Definitions
 * 
 * Defines the three companion types available for selection and their evolution paths.
 * Each companion has a unique theme, personality, and visual progression.
 */

/**
 * Available companion types
 */
export type CompanionType = 'shadow' | 'forest' | 'ember';

/**
 * Represents a single stage in a companion's evolution
 */
export interface EvolutionStage {
  /** Display name of this evolution stage */
  name: string;
  /** Emoji representing this stage */
  emoji: string;
  /** Brief description of this stage */
  description: string;
  /** Experience points required to reach this stage */
  requiredPoints: number;
}

/**
 * Complete definition of a companion type including all evolution stages
 */
export interface CompanionDefinition {
  /** Unique identifier for this companion type */
  type: CompanionType;
  /** Display name of the companion */
  name: string;
  /** Personality description shown during selection */
  personality: string;
  /** Thematic description of the companion's evolution path */
  theme: string;
  /** Primary color for UI theming (hex) */
  colorPrimary: string;
  /** Secondary/darker color for UI theming (hex) */
  colorSecondary: string;
  /** Array of evolution stages from egg to final form */
  stages: EvolutionStage[];
}

/**
 * Complete companion type definitions
 * 
 * Three distinct Halloween-themed companions with unique evolution paths:
 * - Shadow Spirit: Ghostly, mysterious, ethereal
 * - Zombie Companion: Undead, loyal, persistent
 * - Ember Phoenix: Fire-based, passionate, resilient
 */
export const COMPANION_TYPES: Record<CompanionType, CompanionDefinition> = {
  shadow: {
    type: 'shadow',
    name: 'Shadow Spirit',
    personality: 'Mysterious and wise, dwelling in the spaces between light and dark',
    theme: 'Ethereal Shadows',
    colorPrimary: '#9d4edd',
    colorSecondary: '#240046',
    stages: [
      {
        name: 'Mysterious Egg',
        emoji: '🥚',
        description: 'Dormant potential',
        requiredPoints: 0,
      },
      {
        name: 'Spirit Wisp',
        emoji: '✨',
        description: 'First awakening',
        requiredPoints: 5,
      },
      {
        name: 'Shadow Sprite',
        emoji: '👻',
        description: 'Growing power',
        requiredPoints: 20,
      },
      {
        name: 'Phantom Guardian',
        emoji: '🦇',
        description: 'Protective force',
        requiredPoints: 50,
      },
      {
        name: 'Ancient Wraith',
        emoji: '🌙',
        description: 'Timeless wisdom',
        requiredPoints: 100,
      },
      {
        name: 'Celestial Entity',
        emoji: '⭐',
        description: 'Transcendent being',
        requiredPoints: 200,
      },
    ],
  },
  forest: {
    type: 'forest',
    name: 'Forest Spirit',
    personality: 'Loyal and persistent, never giving up no matter the challenge',
    theme: 'Natural Resilience',
    colorPrimary: '#22c55e',
    colorSecondary: '#14532d',
    stages: [
      {
        name: 'Buried Corpse',
        emoji: '⚰️',
        description: 'Resting in darkness',
        requiredPoints: 0,
      },
      {
        name: 'Rising Dead',
        emoji: '🧟',
        description: 'First awakening',
        requiredPoints: 5,
      },
      {
        name: 'Shambling Walker',
        emoji: '🧟‍♂️',
        description: 'Finding purpose',
        requiredPoints: 20,
      },
      {
        name: 'Undead Guardian',
        emoji: '💀',
        description: 'Loyal protector',
        requiredPoints: 50,
      },
      {
        name: 'Lich Companion',
        emoji: '👑',
        description: 'Eternal wisdom',
        requiredPoints: 100,
      },
      {
        name: 'Death Lord',
        emoji: '☠️',
        description: 'Master of undeath',
        requiredPoints: 200,
      },
    ],
  },
  ember: {
    type: 'ember',
    name: 'Ember Phoenix',
    personality: 'Passionate and resilient, rising from challenges with renewed strength',
    theme: 'Eternal Flame',
    colorPrimary: '#f97316',
    colorSecondary: '#7c2d12',
    stages: [
      {
        name: 'Dormant Ash',
        emoji: '🪨',
        description: 'Potential for rebirth',
        requiredPoints: 0,
      },
      {
        name: 'First Spark',
        emoji: '🔥',
        description: 'Ignition of will',
        requiredPoints: 5,
      },
      {
        name: 'Dancing Flame',
        emoji: '🕯️',
        description: 'Growing intensity',
        requiredPoints: 20,
      },
      {
        name: 'Phoenix Rising',
        emoji: '🦅',
        description: 'Reborn in glory',
        requiredPoints: 50,
      },
      {
        name: 'Inferno Spirit',
        emoji: '🌋',
        description: 'Unstoppable force',
        requiredPoints: 100,
      },
      {
        name: 'Solar Deity',
        emoji: '☀️',
        description: 'Radiant perfection',
        requiredPoints: 200,
      },
    ],
  },
};
