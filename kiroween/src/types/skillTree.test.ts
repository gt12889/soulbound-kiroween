/**
 * Unit tests for Skill Tree System
 */

import { describe, it, expect } from 'vitest';
import {
  type CompanionType,
  type SkillTree,
  type Skill,
  type SkillEffect,
  SHADOW_SKILLS,
  FOREST_SKILLS,
  EMBER_SKILLS,
  getSkillBranches,
  calculateExperienceToNextLevel,
  calculateTotalSkillPoints,
  initializeSkillTree,
  addExperience,
  findSkill,
  canUnlockSkill,
  unlockSkill,
  getAvailableSkills,
  getActiveSkillEffects,
  hasSkillEffect,
  getSkillEffectValue
} from './skillTree';

describe('Skill Tree System', () => {
  describe('Skill Definitions', () => {
    it('should have complete skill definitions for Shadow companion', () => {
      expect(SHADOW_SKILLS.power).toHaveLength(3);
      expect(SHADOW_SKILLS.wisdom).toHaveLength(3);
      expect(SHADOW_SKILLS.charm).toHaveLength(3);
      
      // Verify first skill in each branch
      expect(SHADOW_SKILLS.power[0].id).toBe('shadow_whisper');
      expect(SHADOW_SKILLS.wisdom[0].id).toBe('ethereal_guidance');
      expect(SHADOW_SKILLS.charm[0].id).toBe('phantom_dance');
    });

    it('should have complete skill definitions for Forest companion', () => {
      expect(FOREST_SKILLS.power).toHaveLength(3);
      expect(FOREST_SKILLS.wisdom).toHaveLength(3);
      expect(FOREST_SKILLS.charm).toHaveLength(3);
      
      expect(FOREST_SKILLS.power[0].id).toBe('natures_whisper');
      expect(FOREST_SKILLS.wisdom[0].id).toBe('forest_lore');
      expect(FOREST_SKILLS.charm[0].id).toBe('leaf_dance');
    });

    it('should have complete skill definitions for Ember companion', () => {
      expect(EMBER_SKILLS.power).toHaveLength(3);
      expect(EMBER_SKILLS.wisdom).toHaveLength(3);
      expect(EMBER_SKILLS.charm).toHaveLength(3);
      
      expect(EMBER_SKILLS.power[0].id).toBe('spark_insight');
      expect(EMBER_SKILLS.wisdom[0].id).toBe('burning_passion');
      expect(EMBER_SKILLS.charm[0].id).toBe('flame_flicker');
    });

    it('should have valid prerequisite chains', () => {
      // Shadow power branch
      expect(SHADOW_SKILLS.power[0].prerequisite).toBeUndefined();
      expect(SHADOW_SKILLS.power[1].prerequisite).toBe('shadow_whisper');
      expect(SHADOW_SKILLS.power[2].prerequisite).toBe('dark_insight');
      
      // Forest wisdom branch
      expect(FOREST_SKILLS.wisdom[0].prerequisite).toBeUndefined();
      expect(FOREST_SKILLS.wisdom[1].prerequisite).toBe('forest_lore');
      expect(FOREST_SKILLS.wisdom[2].prerequisite).toBe('seasons_cycle');
    });

    it('should have increasing costs for advanced skills', () => {
      // Check that costs increase down the tree
      SHADOW_SKILLS.power.forEach((skill, index) => {
        expect(skill.cost).toBe(index + 1);
      });
      
      FOREST_SKILLS.wisdom.forEach((skill, index) => {
        expect(skill.cost).toBe(index + 1);
      });
    });
  });

  describe('getSkillBranches', () => {
    it('should return Shadow skills for shadow companion', () => {
      const branches = getSkillBranches('shadow');
      expect(branches).toBe(SHADOW_SKILLS);
    });

    it('should return Forest skills for forest companion', () => {
      const branches = getSkillBranches('forest');
      expect(branches).toBe(FOREST_SKILLS);
    });

    it('should return Ember skills for ember companion', () => {
      const branches = getSkillBranches('ember');
      expect(branches).toBe(EMBER_SKILLS);
    });

    it('should throw error for unknown companion type', () => {
      expect(() => getSkillBranches('unknown' as CompanionType)).toThrow();
    });
  });

  describe('Experience and Leveling', () => {
    it('should calculate experience to next level with exponential scaling', () => {
      expect(calculateExperienceToNextLevel(1)).toBe(100);
      expect(calculateExperienceToNextLevel(2)).toBe(282); // 100 * 2^1.5
      expect(calculateExperienceToNextLevel(3)).toBe(519); // 100 * 3^1.5
      expect(calculateExperienceToNextLevel(5)).toBe(1118); // 100 * 5^1.5
    });

    it('should calculate total skill points based on level', () => {
      expect(calculateTotalSkillPoints(1)).toBe(0);
      expect(calculateTotalSkillPoints(2)).toBe(1);
      expect(calculateTotalSkillPoints(5)).toBe(4);
      expect(calculateTotalSkillPoints(10)).toBe(9);
    });

    it('should handle negative levels gracefully', () => {
      expect(calculateTotalSkillPoints(0)).toBe(0);
      expect(calculateTotalSkillPoints(-1)).toBe(0);
    });
  });

  describe('initializeSkillTree', () => {
    it('should create a new skill tree for shadow companion', () => {
      const tree = initializeSkillTree('shadow');
      
      expect(tree.companionType).toBe('shadow');
      expect(tree.level).toBe(1);
      expect(tree.experience).toBe(0);
      expect(tree.experienceToNextLevel).toBe(100);
      expect(tree.availablePoints).toBe(0);
      expect(tree.unlockedSkills).toEqual([]);
      expect(tree.branches).toBe(SHADOW_SKILLS);
    });

    it('should create a new skill tree for forest companion', () => {
      const tree = initializeSkillTree('forest');
      
      expect(tree.companionType).toBe('forest');
      expect(tree.branches).toBe(FOREST_SKILLS);
    });

    it('should create a new skill tree for ember companion', () => {
      const tree = initializeSkillTree('ember');
      
      expect(tree.companionType).toBe('ember');
      expect(tree.branches).toBe(EMBER_SKILLS);
    });
  });

  describe('addExperience', () => {
    it('should add experience without leveling up', () => {
      const tree = initializeSkillTree('shadow');
      const updated = addExperience(tree, 50);
      
      expect(updated.experience).toBe(50);
      expect(updated.level).toBe(1);
      expect(updated.availablePoints).toBe(0);
    });

    it('should level up when reaching experience threshold', () => {
      const tree = initializeSkillTree('shadow');
      const updated = addExperience(tree, 100);
      
      expect(updated.level).toBe(2);
      expect(updated.experience).toBe(0);
      expect(updated.availablePoints).toBe(1);
      expect(updated.experienceToNextLevel).toBe(282);
    });

    it('should handle multiple level ups at once', () => {
      const tree = initializeSkillTree('shadow');
      const updated = addExperience(tree, 500); // Should level up multiple times
      
      expect(updated.level).toBeGreaterThan(2);
      expect(updated.availablePoints).toBeGreaterThan(1);
    });

    it('should carry over excess experience', () => {
      const tree = initializeSkillTree('shadow');
      const updated = addExperience(tree, 150); // 100 to level up + 50 extra
      
      expect(updated.level).toBe(2);
      expect(updated.experience).toBe(50);
      expect(updated.availablePoints).toBe(1);
    });
  });

  describe('findSkill', () => {
    it('should find skill in power branch', () => {
      const skill = findSkill(SHADOW_SKILLS, 'shadow_whisper');
      
      expect(skill).toBeDefined();
      expect(skill?.id).toBe('shadow_whisper');
      expect(skill?.name).toBe('Shadow Whisper');
    });

    it('should find skill in wisdom branch', () => {
      const skill = findSkill(FOREST_SKILLS, 'forest_lore');
      
      expect(skill).toBeDefined();
      expect(skill?.id).toBe('forest_lore');
    });

    it('should find skill in charm branch', () => {
      const skill = findSkill(EMBER_SKILLS, 'flame_flicker');
      
      expect(skill).toBeDefined();
      expect(skill?.id).toBe('flame_flicker');
    });

    it('should return undefined for non-existent skill', () => {
      const skill = findSkill(SHADOW_SKILLS, 'non_existent_skill');
      
      expect(skill).toBeUndefined();
    });
  });

  describe('canUnlockSkill', () => {
    it('should allow unlocking first skill with enough points', () => {
      const tree = initializeSkillTree('shadow');
      const updated = addExperience(tree, 100); // Level up to get 1 point
      
      const result = canUnlockSkill(updated, 'shadow_whisper');
      
      expect(result.canUnlock).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should prevent unlocking without enough points', () => {
      const tree = initializeSkillTree('shadow');
      
      const result = canUnlockSkill(tree, 'shadow_whisper');
      
      expect(result.canUnlock).toBe(false);
      expect(result.reason).toBe('Not enough skill points');
    });

    it('should prevent unlocking without prerequisite', () => {
      const tree = initializeSkillTree('shadow');
      const updated = addExperience(tree, 900); // Get enough points for cost 2 skill
      
      const result = canUnlockSkill(updated, 'dark_insight');
      
      expect(result.canUnlock).toBe(false);
      expect(result.reason).toBe('Prerequisite not met');
    });

    it('should allow unlocking with prerequisite met', () => {
      let tree = initializeSkillTree('shadow');
      tree = addExperience(tree, 1500); // Get enough points (need 3 total: 1 for prereq + 2 for skill)
      tree = unlockSkill(tree, 'shadow_whisper'); // Unlock prerequisite
      
      const result = canUnlockSkill(tree, 'dark_insight');
      
      expect(result.canUnlock).toBe(true);
    });

    it('should prevent unlocking already unlocked skill', () => {
      let tree = initializeSkillTree('shadow');
      tree = addExperience(tree, 100);
      tree = unlockSkill(tree, 'shadow_whisper');
      
      const result = canUnlockSkill(tree, 'shadow_whisper');
      
      expect(result.canUnlock).toBe(false);
      expect(result.reason).toBe('Already unlocked');
    });

    it('should prevent unlocking non-existent skill', () => {
      const tree = initializeSkillTree('shadow');
      
      const result = canUnlockSkill(tree, 'fake_skill');
      
      expect(result.canUnlock).toBe(false);
      expect(result.reason).toBe('Skill not found');
    });
  });

  describe('unlockSkill', () => {
    it('should unlock skill and deduct points', () => {
      let tree = initializeSkillTree('shadow');
      tree = addExperience(tree, 100);
      
      const updated = unlockSkill(tree, 'shadow_whisper');
      
      expect(updated.unlockedSkills).toContain('shadow_whisper');
      expect(updated.availablePoints).toBe(0);
    });

    it('should not unlock skill without enough points', () => {
      const tree = initializeSkillTree('shadow');
      
      const updated = unlockSkill(tree, 'shadow_whisper');
      
      expect(updated.unlockedSkills).not.toContain('shadow_whisper');
      expect(updated).toEqual(tree);
    });

    it('should not unlock skill without prerequisite', () => {
      let tree = initializeSkillTree('shadow');
      tree = addExperience(tree, 300);
      
      const updated = unlockSkill(tree, 'dark_insight');
      
      expect(updated.unlockedSkills).not.toContain('dark_insight');
    });

    it('should unlock multiple skills in sequence', () => {
      let tree = initializeSkillTree('shadow');
      tree = addExperience(tree, 1000); // Get enough points for 3 skills (1+1+1=3 points)
      
      tree = unlockSkill(tree, 'shadow_whisper');
      tree = unlockSkill(tree, 'ethereal_guidance');
      tree = unlockSkill(tree, 'phantom_dance');
      
      expect(tree.unlockedSkills).toHaveLength(3);
      expect(tree.unlockedSkills).toContain('shadow_whisper');
      expect(tree.unlockedSkills).toContain('ethereal_guidance');
      expect(tree.unlockedSkills).toContain('phantom_dance');
    });
  });

  describe('getAvailableSkills', () => {
    it('should return no skills when no points available', () => {
      const tree = initializeSkillTree('shadow');
      const available = getAvailableSkills(tree);
      
      expect(available).toHaveLength(0);
    });

    it('should return first-tier skills when points available', () => {
      let tree = initializeSkillTree('shadow');
      tree = addExperience(tree, 100);
      
      const available = getAvailableSkills(tree);
      
      expect(available.length).toBeGreaterThan(0);
      expect(available.every(skill => !skill.prerequisite)).toBe(true);
    });

    it('should return second-tier skills after unlocking prerequisites', () => {
      let tree = initializeSkillTree('shadow');
      tree = addExperience(tree, 1500); // Need 3 points: 1 for prereq + 2 for dark_insight
      tree = unlockSkill(tree, 'shadow_whisper');
      
      const available = getAvailableSkills(tree);
      
      const darkInsight = available.find(s => s.id === 'dark_insight');
      expect(darkInsight).toBeDefined();
    });

    it('should not return already unlocked skills', () => {
      let tree = initializeSkillTree('shadow');
      tree = addExperience(tree, 200);
      tree = unlockSkill(tree, 'shadow_whisper');
      
      const available = getAvailableSkills(tree);
      
      expect(available.find(s => s.id === 'shadow_whisper')).toBeUndefined();
    });
  });

  describe('getActiveSkillEffects', () => {
    it('should return empty array when no skills unlocked', () => {
      const tree = initializeSkillTree('shadow');
      const effects = getActiveSkillEffects(tree);
      
      expect(effects).toEqual([]);
    });

    it('should return effects for unlocked skills', () => {
      let tree = initializeSkillTree('shadow');
      tree = addExperience(tree, 100);
      tree = unlockSkill(tree, 'shadow_whisper');
      
      const effects = getActiveSkillEffects(tree);
      
      expect(effects).toHaveLength(1);
      expect(effects[0].type).toBe('ghost_writer_hints');
    });

    it('should return multiple effects for multiple unlocked skills', () => {
      let tree = initializeSkillTree('shadow');
      tree = addExperience(tree, 900); // Need 2 points for 2 skills (1+1=2)
      tree = unlockSkill(tree, 'shadow_whisper');
      tree = unlockSkill(tree, 'ethereal_guidance');
      
      const effects = getActiveSkillEffects(tree);
      
      expect(effects).toHaveLength(2);
    });
  });

  describe('hasSkillEffect', () => {
    it('should return false when effect not active', () => {
      const tree = initializeSkillTree('shadow');
      
      expect(hasSkillEffect(tree, 'ghost_writer_hints')).toBe(false);
    });

    it('should return true when effect is active', () => {
      let tree = initializeSkillTree('shadow');
      tree = addExperience(tree, 100);
      tree = unlockSkill(tree, 'shadow_whisper');
      
      expect(hasSkillEffect(tree, 'ghost_writer_hints')).toBe(true);
    });

    it('should work for different effect types', () => {
      let tree = initializeSkillTree('shadow');
      tree = addExperience(tree, 100);
      tree = unlockSkill(tree, 'ethereal_guidance');
      
      expect(hasSkillEffect(tree, 'dialogue_unlock')).toBe(true);
      expect(hasSkillEffect(tree, 'ghost_writer_hints')).toBe(false);
    });
  });

  describe('getSkillEffectValue', () => {
    it('should return 0 when no effects active', () => {
      const tree = initializeSkillTree('shadow');
      
      expect(getSkillEffectValue(tree, 'ghost_writer_hints')).toBe(0);
    });

    it('should return effect value for single skill', () => {
      let tree = initializeSkillTree('shadow');
      tree = addExperience(tree, 100);
      tree = unlockSkill(tree, 'shadow_whisper');
      
      expect(getSkillEffectValue(tree, 'ghost_writer_hints')).toBe(1);
    });

    it('should sum stacking effects', () => {
      let tree = initializeSkillTree('shadow');
      tree = addExperience(tree, 5000); // Need 6 points: 1+2+3=6 for the skill chain
      tree = unlockSkill(tree, 'shadow_whisper'); // +1 ghost_writer_hints
      tree = unlockSkill(tree, 'dark_insight');
      tree = unlockSkill(tree, 'void_mastery'); // +2 ghost_writer_hints
      
      expect(getSkillEffectValue(tree, 'ghost_writer_hints')).toBe(3);
    });

    it('should return highest value for task_prediction', () => {
      let tree = initializeSkillTree('shadow');
      tree = addExperience(tree, 1500); // Need 3 points: 1 for prereq + 2 for dark_insight
      tree = unlockSkill(tree, 'shadow_whisper');
      tree = unlockSkill(tree, 'dark_insight'); // 80% accuracy
      
      expect(getSkillEffectValue(tree, 'task_prediction')).toBe(80);
    });

    it('should sum xp_boost effects', () => {
      let tree = initializeSkillTree('forest');
      tree = addExperience(tree, 5000); // Need 6 points: 1+2+3=6 for the skill chain
      tree = unlockSkill(tree, 'forest_lore');
      tree = unlockSkill(tree, 'seasons_cycle');
      tree = unlockSkill(tree, 'elder_tree'); // 30% xp boost
      
      expect(getSkillEffectValue(tree, 'xp_boost')).toBe(30);
    });
  });

  describe('Skill Effect Types', () => {
    it('should have correct effect types for power branch', () => {
      const shadowPower = SHADOW_SKILLS.power;
      
      expect(shadowPower[0].effect.type).toBe('ghost_writer_hints');
      expect(shadowPower[1].effect.type).toBe('task_prediction');
      expect(shadowPower[2].effect.type).toBe('ghost_writer_hints');
    });

    it('should have correct effect types for wisdom branch', () => {
      const forestWisdom = FOREST_SKILLS.wisdom;
      
      expect(forestWisdom[0].effect.type).toBe('dialogue_unlock');
      expect(forestWisdom[1].effect.type).toBe('dialogue_unlock');
      expect(forestWisdom[2].effect.type).toBe('xp_boost');
    });

    it('should have correct effect types for charm branch', () => {
      const emberCharm = EMBER_SKILLS.charm;
      
      expect(emberCharm[0].effect.type).toBe('animation_unlock');
      expect(emberCharm[1].effect.type).toBe('idle_behavior');
      expect(emberCharm[2].effect.type).toBe('animation_unlock');
    });
  });
});
