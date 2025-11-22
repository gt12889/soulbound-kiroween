/**
 * Skill Tree System
 * 
 * Defines the skill progression system for Spirit Companions.
 * Each companion type has unique skills across three branches:
 * - Power: Productivity enhancements
 * - Wisdom: Insight and guidance
 * - Charm: Visual and audio enhancements
 */

/**
 * Types of effects that skills can provide
 */
export type SkillEffect =
  | { type: 'ghost_writer_hints'; value: number }    // Enhanced suggestions (value = enhancement level)
  | { type: 'task_prediction'; value: number }       // Better task recommendations (value = accuracy %)
  | { type: 'animation_unlock'; value: string }      // New animation ID
  | { type: 'idle_behavior'; value: string }         // New idle animation
  | { type: 'dialogue_unlock'; value: string[] }     // New dialogue options
  | { type: 'xp_boost'; value: number };             // Faster leveling (value = % boost)

/**
 * Individual skill definition
 */
export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;                    // Skill points required to unlock
  prerequisite?: string;           // ID of required skill (optional)
  effect: SkillEffect;
}

/**
 * Companion type identifier
 */
export type CompanionType = 'shadow' | 'forest' | 'ember';

/**
 * Complete skill tree for a companion
 */
export interface SkillTree {
  companionType: CompanionType;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  availablePoints: number;
  unlockedSkills: string[];
  branches: {
    power: Skill[];
    wisdom: Skill[];
    charm: Skill[];
  };
}

/**
 * Skill tree branches definition
 */
export interface SkillBranches {
  power: Skill[];
  wisdom: Skill[];
  charm: Skill[];
}

// ============================================================================
// SHADOW SPIRIT SKILLS
// ============================================================================

export const SHADOW_SKILLS: SkillBranches = {
  power: [
    {
      id: 'shadow_whisper',
      name: 'Shadow Whisper',
      description: 'Provides subtle hints in Ghost Writer',
      icon: '🌑',
      cost: 1,
      effect: { type: 'ghost_writer_hints', value: 1 }
    },
    {
      id: 'dark_insight',
      name: 'Dark Insight',
      description: 'Predicts your next task with 80% accuracy',
      icon: '🔮',
      cost: 2,
      prerequisite: 'shadow_whisper',
      effect: { type: 'task_prediction', value: 80 }
    },
    {
      id: 'void_mastery',
      name: 'Void Mastery',
      description: 'Enhances Ghost Writer hints to advanced level',
      icon: '⚫',
      cost: 3,
      prerequisite: 'dark_insight',
      effect: { type: 'ghost_writer_hints', value: 2 }
    }
  ],
  wisdom: [
    {
      id: 'ethereal_guidance',
      name: 'Ethereal Guidance',
      description: 'Unlocks philosophical dialogue options',
      icon: '💭',
      cost: 1,
      effect: { type: 'dialogue_unlock', value: ['philosophical'] }
    },
    {
      id: 'twilight_wisdom',
      name: 'Twilight Wisdom',
      description: 'Unlocks deep introspective dialogue',
      icon: '🌙',
      cost: 2,
      prerequisite: 'ethereal_guidance',
      effect: { type: 'dialogue_unlock', value: ['introspective', 'mysterious'] }
    },
    {
      id: 'shadow_sage',
      name: 'Shadow Sage',
      description: 'Gain 25% bonus experience from all activities',
      icon: '📚',
      cost: 3,
      prerequisite: 'twilight_wisdom',
      effect: { type: 'xp_boost', value: 25 }
    }
  ],
  charm: [
    {
      id: 'phantom_dance',
      name: 'Phantom Dance',
      description: 'Unlocks graceful floating animation',
      icon: '👻',
      cost: 1,
      effect: { type: 'animation_unlock', value: 'phantom_dance' }
    },
    {
      id: 'mist_form',
      name: 'Mist Form',
      description: 'Unlocks ethereal dissolve idle behavior',
      icon: '🌫️',
      cost: 2,
      prerequisite: 'phantom_dance',
      effect: { type: 'idle_behavior', value: 'mist_dissolve' }
    },
    {
      id: 'shadow_weaver',
      name: 'Shadow Weaver',
      description: 'Unlocks shadow manipulation animation',
      icon: '🕸️',
      cost: 3,
      prerequisite: 'mist_form',
      effect: { type: 'animation_unlock', value: 'shadow_weave' }
    }
  ]
};

// ============================================================================
// FOREST SPIRIT SKILLS
// ============================================================================

export const FOREST_SKILLS: SkillBranches = {
  power: [
    {
      id: 'natures_whisper',
      name: "Nature's Whisper",
      description: 'Provides gentle writing suggestions',
      icon: '🌿',
      cost: 1,
      effect: { type: 'ghost_writer_hints', value: 1 }
    },
    {
      id: 'growth_vision',
      name: 'Growth Vision',
      description: 'Predicts task priorities with 75% accuracy',
      icon: '🌱',
      cost: 2,
      prerequisite: 'natures_whisper',
      effect: { type: 'task_prediction', value: 75 }
    },
    {
      id: 'ancient_wisdom',
      name: 'Ancient Wisdom',
      description: 'Enhances writing suggestions to expert level',
      icon: '🌳',
      cost: 3,
      prerequisite: 'growth_vision',
      effect: { type: 'ghost_writer_hints', value: 2 }
    }
  ],
  wisdom: [
    {
      id: 'forest_lore',
      name: 'Forest Lore',
      description: 'Unlocks nature-themed dialogue',
      icon: '🍃',
      cost: 1,
      effect: { type: 'dialogue_unlock', value: ['nature'] }
    },
    {
      id: 'seasons_cycle',
      name: "Season's Cycle",
      description: 'Unlocks growth and patience dialogue',
      icon: '🍂',
      cost: 2,
      prerequisite: 'forest_lore',
      effect: { type: 'dialogue_unlock', value: ['growth', 'patience'] }
    },
    {
      id: 'elder_tree',
      name: 'Elder Tree',
      description: 'Gain 30% bonus experience from all activities',
      icon: '🌲',
      cost: 3,
      prerequisite: 'seasons_cycle',
      effect: { type: 'xp_boost', value: 30 }
    }
  ],
  charm: [
    {
      id: 'leaf_dance',
      name: 'Leaf Dance',
      description: 'Unlocks swirling leaves animation',
      icon: '🍁',
      cost: 1,
      effect: { type: 'animation_unlock', value: 'leaf_swirl' }
    },
    {
      id: 'bloom_cycle',
      name: 'Bloom Cycle',
      description: 'Unlocks flowering idle behavior',
      icon: '🌸',
      cost: 2,
      prerequisite: 'leaf_dance',
      effect: { type: 'idle_behavior', value: 'bloom_pulse' }
    },
    {
      id: 'forest_guardian',
      name: 'Forest Guardian',
      description: 'Unlocks protective aura animation',
      icon: '🛡️',
      cost: 3,
      prerequisite: 'bloom_cycle',
      effect: { type: 'animation_unlock', value: 'guardian_aura' }
    }
  ]
};

// ============================================================================
// EMBER SPIRIT SKILLS
// ============================================================================

export const EMBER_SKILLS: SkillBranches = {
  power: [
    {
      id: 'spark_insight',
      name: 'Spark Insight',
      description: 'Provides energetic writing suggestions',
      icon: '✨',
      cost: 1,
      effect: { type: 'ghost_writer_hints', value: 1 }
    },
    {
      id: 'flame_vision',
      name: 'Flame Vision',
      description: 'Predicts urgent tasks with 85% accuracy',
      icon: '🔥',
      cost: 2,
      prerequisite: 'spark_insight',
      effect: { type: 'task_prediction', value: 85 }
    },
    {
      id: 'inferno_mastery',
      name: 'Inferno Mastery',
      description: 'Enhances writing suggestions to master level',
      icon: '🌋',
      cost: 3,
      prerequisite: 'flame_vision',
      effect: { type: 'ghost_writer_hints', value: 2 }
    }
  ],
  wisdom: [
    {
      id: 'burning_passion',
      name: 'Burning Passion',
      description: 'Unlocks motivational dialogue',
      icon: '💥',
      cost: 1,
      effect: { type: 'dialogue_unlock', value: ['motivational'] }
    },
    {
      id: 'eternal_flame',
      name: 'Eternal Flame',
      description: 'Unlocks inspirational and energetic dialogue',
      icon: '🕯️',
      cost: 2,
      prerequisite: 'burning_passion',
      effect: { type: 'dialogue_unlock', value: ['inspirational', 'energetic'] }
    },
    {
      id: 'phoenix_rebirth',
      name: 'Phoenix Rebirth',
      description: 'Gain 35% bonus experience from all activities',
      icon: '🦅',
      cost: 3,
      prerequisite: 'eternal_flame',
      effect: { type: 'xp_boost', value: 35 }
    }
  ],
  charm: [
    {
      id: 'flame_flicker',
      name: 'Flame Flicker',
      description: 'Unlocks dancing flames animation',
      icon: '🔆',
      cost: 1,
      effect: { type: 'animation_unlock', value: 'flame_dance' }
    },
    {
      id: 'ember_glow',
      name: 'Ember Glow',
      description: 'Unlocks pulsing warmth idle behavior',
      icon: '💫',
      cost: 2,
      prerequisite: 'flame_flicker',
      effect: { type: 'idle_behavior', value: 'warm_pulse' }
    },
    {
      id: 'solar_flare',
      name: 'Solar Flare',
      description: 'Unlocks brilliant burst animation',
      icon: '☀️',
      cost: 3,
      prerequisite: 'ember_glow',
      effect: { type: 'animation_unlock', value: 'solar_burst' }
    }
  ]
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get skill branches for a specific companion type
 * 
 * @param companionType - The type of companion
 * @returns The skill branches for that companion
 */
export function getSkillBranches(companionType: CompanionType): SkillBranches {
  switch (companionType) {
    case 'shadow':
      return SHADOW_SKILLS;
    case 'forest':
      return FOREST_SKILLS;
    case 'ember':
      return EMBER_SKILLS;
    default:
      throw new Error(`Unknown companion type: ${companionType}`);
  }
}

/**
 * Calculate experience required for next level
 * Uses exponential scaling: baseXP * (level ^ 1.5)
 * 
 * @param level - Current level
 * @returns Experience required to reach next level
 */
export function calculateExperienceToNextLevel(level: number): number {
  const baseXP = 100;
  return Math.floor(baseXP * Math.pow(level, 1.5));
}

/**
 * Calculate skill points earned at a given level
 * Players earn 1 skill point per level
 * 
 * @param level - Current level
 * @returns Total skill points earned
 */
export function calculateTotalSkillPoints(level: number): number {
  return Math.max(0, level - 1); // No points at level 1
}

/**
 * Initialize a new skill tree for a companion
 * 
 * @param companionType - The type of companion
 * @returns A new SkillTree object
 */
export function initializeSkillTree(companionType: CompanionType): SkillTree {
  return {
    companionType,
    level: 1,
    experience: 0,
    experienceToNextLevel: calculateExperienceToNextLevel(1),
    availablePoints: 0,
    unlockedSkills: [],
    branches: getSkillBranches(companionType)
  };
}

/**
 * Add experience and handle level ups
 * 
 * @param skillTree - Current skill tree
 * @param xpAmount - Amount of experience to add
 * @returns Updated skill tree with new experience and potential level ups
 */
export function addExperience(
  skillTree: SkillTree,
  xpAmount: number
): SkillTree {
  let newExperience = skillTree.experience + xpAmount;
  let newLevel = skillTree.level;
  let newAvailablePoints = skillTree.availablePoints;
  
  // Check for level ups
  let xpNeeded = skillTree.experienceToNextLevel;
  
  while (newExperience >= xpNeeded) {
    newExperience -= xpNeeded;
    newLevel += 1;
    newAvailablePoints += 1;
    xpNeeded = calculateExperienceToNextLevel(newLevel);
  }
  
  return {
    ...skillTree,
    level: newLevel,
    experience: newExperience,
    experienceToNextLevel: xpNeeded,
    availablePoints: newAvailablePoints
  };
}

/**
 * Find a skill by ID across all branches
 * 
 * @param branches - Skill branches to search
 * @param skillId - ID of the skill to find
 * @returns The skill if found, undefined otherwise
 */
export function findSkill(
  branches: SkillBranches,
  skillId: string
): Skill | undefined {
  const allSkills = [
    ...branches.power,
    ...branches.wisdom,
    ...branches.charm
  ];
  
  return allSkills.find(skill => skill.id === skillId);
}

/**
 * Check if a skill can be unlocked
 * 
 * @param skillTree - Current skill tree
 * @param skillId - ID of the skill to check
 * @returns Object with canUnlock boolean and reason if not
 */
export function canUnlockSkill(
  skillTree: SkillTree,
  skillId: string
): { canUnlock: boolean; reason?: string } {
  // Check if already unlocked
  if (skillTree.unlockedSkills.includes(skillId)) {
    return { canUnlock: false, reason: 'Already unlocked' };
  }
  
  // Find the skill
  const skill = findSkill(skillTree.branches, skillId);
  if (!skill) {
    return { canUnlock: false, reason: 'Skill not found' };
  }
  
  // Check if enough skill points
  if (skillTree.availablePoints < skill.cost) {
    return { canUnlock: false, reason: 'Not enough skill points' };
  }
  
  // Check prerequisite
  if (skill.prerequisite && !skillTree.unlockedSkills.includes(skill.prerequisite)) {
    return { canUnlock: false, reason: 'Prerequisite not met' };
  }
  
  return { canUnlock: true };
}

/**
 * Unlock a skill
 * 
 * @param skillTree - Current skill tree
 * @param skillId - ID of the skill to unlock
 * @returns Updated skill tree with unlocked skill, or original if unlock failed
 */
export function unlockSkill(
  skillTree: SkillTree,
  skillId: string
): SkillTree {
  const validation = canUnlockSkill(skillTree, skillId);
  
  if (!validation.canUnlock) {
    console.warn(`Cannot unlock skill ${skillId}: ${validation.reason}`);
    return skillTree;
  }
  
  const skill = findSkill(skillTree.branches, skillId);
  if (!skill) {
    return skillTree;
  }
  
  return {
    ...skillTree,
    availablePoints: skillTree.availablePoints - skill.cost,
    unlockedSkills: [...skillTree.unlockedSkills, skillId]
  };
}

/**
 * Get all skills that are currently available to unlock
 * 
 * @param skillTree - Current skill tree
 * @returns Array of skills that can be unlocked
 */
export function getAvailableSkills(skillTree: SkillTree): Skill[] {
  const allSkills = [
    ...skillTree.branches.power,
    ...skillTree.branches.wisdom,
    ...skillTree.branches.charm
  ];
  
  return allSkills.filter(skill => {
    const validation = canUnlockSkill(skillTree, skill.id);
    return validation.canUnlock;
  });
}

/**
 * Get all active skill effects for a companion
 * 
 * @param skillTree - Current skill tree
 * @returns Array of active skill effects
 */
export function getActiveSkillEffects(skillTree: SkillTree): SkillEffect[] {
  const allSkills = [
    ...skillTree.branches.power,
    ...skillTree.branches.wisdom,
    ...skillTree.branches.charm
  ];
  
  return allSkills
    .filter(skill => skillTree.unlockedSkills.includes(skill.id))
    .map(skill => skill.effect);
}

/**
 * Check if a specific skill effect is active
 * 
 * @param skillTree - Current skill tree
 * @param effectType - Type of effect to check
 * @returns True if any skill with that effect type is unlocked
 */
export function hasSkillEffect(
  skillTree: SkillTree,
  effectType: SkillEffect['type']
): boolean {
  const effects = getActiveSkillEffects(skillTree);
  return effects.some(effect => effect.type === effectType);
}

/**
 * Get the total value of a specific skill effect type
 * For effects that stack (like xp_boost), returns the sum
 * For effects that don't stack, returns the highest value
 * 
 * @param skillTree - Current skill tree
 * @param effectType - Type of effect to sum
 * @returns Total value of that effect type
 */
export function getSkillEffectValue(
  skillTree: SkillTree,
  effectType: SkillEffect['type']
): number {
  const effects = getActiveSkillEffects(skillTree);
  const matchingEffects = effects.filter(effect => effect.type === effectType);
  
  if (matchingEffects.length === 0) {
    return 0;
  }
  
  // For numeric effects, sum them up
  if (effectType === 'xp_boost' || effectType === 'ghost_writer_hints') {
    return matchingEffects.reduce((sum, effect) => {
      return sum + (typeof effect.value === 'number' ? effect.value : 0);
    }, 0);
  }
  
  // For task_prediction, return the highest value
  if (effectType === 'task_prediction') {
    return Math.max(...matchingEffects.map(effect => 
      typeof effect.value === 'number' ? effect.value : 0
    ));
  }
  
  return 0;
}
