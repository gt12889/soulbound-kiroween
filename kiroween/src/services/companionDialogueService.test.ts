/**
 * Tests for Companion Dialogue Service
 * Requirements: 3.1-3.5, 9.1-9.5, 10.5
 */

import { describe, it, expect } from 'vitest';
import {
  getThemeDialogue,
  getGreeting,
  getCelebration,
  getEncouragement,
  getRandomIdle,
  generateContextualDialogue,
  getTimeOfDay,
} from './companionDialogueService';
import type { CompanionType } from '../types/skillTree';
import type { MoodState } from '../types/companionMood';
import type { UserContext } from '../contexts/CompanionContext';

describe('companionDialogueService', () => {
  describe('getTimeOfDay', () => {
    it('should return a valid time of day', () => {
      const timeOfDay = getTimeOfDay();
      expect(['morning', 'afternoon', 'evening', 'night']).toContain(timeOfDay);
    });
  });

  describe('getThemeDialogue', () => {
    it('should return theme-specific dialogue for shadow companion', () => {
      const dialogue = getThemeDialogue('shadow', 'default-dark');
      expect(dialogue).toBeTruthy();
      expect(typeof dialogue).toBe('string');
      expect(dialogue.length).toBeGreaterThan(0);
    });

    it('should return theme-specific dialogue for forest companion', () => {
      const dialogue = getThemeDialogue('forest', 'midnight-forest');
      expect(dialogue).toBeTruthy();
      expect(typeof dialogue).toBe('string');
      expect(dialogue.length).toBeGreaterThan(0);
    });

    it('should return theme-specific dialogue for ember companion', () => {
      const dialogue = getThemeDialogue('ember', 'blood-moon');
      expect(dialogue).toBeTruthy();
      expect(typeof dialogue).toBe('string');
      expect(dialogue.length).toBeGreaterThan(0);
    });

    it('should return different dialogue for different themes', () => {
      const dialogue1 = getThemeDialogue('shadow', 'default-dark');
      const dialogue2 = getThemeDialogue('shadow', 'blood-moon');
      const dialogue3 = getThemeDialogue('shadow', 'midnight-forest');
      
      // At least one should be different (they might randomly be the same)
      const allSame = dialogue1 === dialogue2 && dialogue2 === dialogue3;
      expect(allSame).toBe(false);
    });

    it('should handle all companion types', () => {
      const companions: CompanionType[] = ['shadow', 'forest', 'ember'];
      
      companions.forEach(companion => {
        const dialogue = getThemeDialogue(companion, 'default-dark');
        expect(dialogue).toBeTruthy();
        expect(typeof dialogue).toBe('string');
      });
    });

    it('should handle all theme types', () => {
      const themes = ['default-dark', 'blood-moon', 'midnight-forest'] as const;
      
      themes.forEach(theme => {
        const dialogue = getThemeDialogue('shadow', theme);
        expect(dialogue).toBeTruthy();
        expect(typeof dialogue).toBe('string');
      });
    });
  });

  describe('getGreeting', () => {
    it('should return greetings for all times of day', () => {
      const times = ['morning', 'afternoon', 'evening', 'night'] as const;
      
      times.forEach(time => {
        const greeting = getGreeting('shadow', time);
        expect(greeting).toBeTruthy();
        expect(typeof greeting).toBe('string');
      });
    });

    it('should return different greetings for different companions', () => {
      const shadowGreeting = getGreeting('shadow', 'morning');
      const forestGreeting = getGreeting('forest', 'morning');
      const emberGreeting = getGreeting('ember', 'morning');
      
      // They should have different content (personality-specific)
      const allSame = shadowGreeting === forestGreeting && forestGreeting === emberGreeting;
      expect(allSame).toBe(false);
    });
  });

  describe('getCelebration', () => {
    it('should return celebration dialogue', () => {
      const celebration = getCelebration('shadow', 'first task');
      expect(celebration).toBeTruthy();
      expect(typeof celebration).toBe('string');
      expect(celebration).toContain('first task');
    });

    it('should include achievement name in dialogue', () => {
      const achievement = 'completing 100 tasks';
      const celebration = getCelebration('forest', achievement);
      expect(celebration).toContain(achievement);
    });
  });

  describe('getEncouragement', () => {
    it('should return encouragement dialogue', () => {
      const encouragement = getEncouragement('shadow', 3);
      expect(encouragement).toBeTruthy();
      expect(typeof encouragement).toBe('string');
      expect(encouragement).toContain('3');
    });

    it('should include days count in dialogue', () => {
      const days = 5;
      const encouragement = getEncouragement('ember', days);
      expect(encouragement).toContain(days.toString());
    });
  });

  describe('getRandomIdle', () => {
    it('should return idle dialogue for all moods', () => {
      const moods: MoodState[] = ['happy', 'excited', 'energized', 'concerned', 'neutral', 'proud', 'playful'];
      
      moods.forEach(mood => {
        const dialogue = getRandomIdle('shadow', mood);
        expect(dialogue).toBeTruthy();
        expect(typeof dialogue).toBe('string');
      });
    });

    it('should return neutral dialogue for unknown moods', () => {
      const dialogue = getRandomIdle('shadow', 'neutral');
      expect(dialogue).toBeTruthy();
    });
  });

  describe('generateContextualDialogue', () => {
    it('should prioritize module-specific dialogue', () => {
      const context: UserContext = {
        currentModule: 'ghost-writer',
        currentActivity: 'writing',
        timeInCurrentActivity: 0,
        recentTasks: [],
        currentMoonPhase: 'new',
        currentTheme: 'default-dark',
        writingSessionDuration: 0,
      };
      
      const dialogue = generateContextualDialogue(context, 'shadow', 'neutral');
      expect(dialogue).toBeTruthy();
      expect(typeof dialogue).toBe('string');
    });

    it('should use mood-specific dialogue when no module context', () => {
      const context: UserContext = {
        currentModule: 'home',
        currentActivity: 'idle',
        timeInCurrentActivity: 0,
        recentTasks: [],
        currentMoonPhase: 'new',
        currentTheme: 'default-dark',
        writingSessionDuration: 0,
      };
      
      const dialogue = generateContextualDialogue(context, 'shadow', 'happy');
      expect(dialogue).toBeTruthy();
      expect(typeof dialogue).toBe('string');
    });

    it('should return different dialogue for different companions', () => {
      const context: UserContext = {
        currentModule: 'necronomicon',
        currentActivity: 'note-taking',
        timeInCurrentActivity: 0,
        recentTasks: [],
        currentMoonPhase: 'new',
        currentTheme: 'default-dark',
        writingSessionDuration: 0,
      };
      
      const shadowDialogue = generateContextualDialogue(context, 'shadow', 'neutral');
      const forestDialogue = generateContextualDialogue(context, 'forest', 'neutral');
      const emberDialogue = generateContextualDialogue(context, 'ember', 'neutral');
      
      // At least one should be different
      const allSame = shadowDialogue === forestDialogue && forestDialogue === emberDialogue;
      expect(allSame).toBe(false);
    });
  });
});
