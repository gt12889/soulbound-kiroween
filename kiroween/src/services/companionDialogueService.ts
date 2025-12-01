/**
 * Companion Dialogue Service
 * Generates context-aware dialogue for Spirit Companions
 * Requirements: 3.1-3.5, 9.1-9.5, 10.5
 */

import type { CompanionType } from '../types/skillTree';
import type { MoodState } from '../types/companionMood';
import type { UserContext } from '../contexts/CompanionContext';
import type { ThemeId } from '../themes';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Migrate old 'zombie' companion type to 'forest'
 * For backwards compatibility with existing user data
 */
function migrateCompanionType(type: CompanionType | 'zombie'): 'shadow' | 'forest' | 'ember' {
  if (type === 'zombie') return 'forest';
  return type as 'shadow' | 'forest' | 'ember';
}

/**
 * Get current time of day
 */
export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  return 'night';
}

/**
 * Dialogue database structure
 * Organized by companion type, then by context
 */
const DIALOGUE_DATABASE = {
  shadow: {
    greetings: {
      morning: [
        'The shadows recede... a new day begins.',
        'Dawn breaks, but mysteries remain.',
        'Good morning. What secrets will today reveal?'
      ],
      afternoon: [
        'The sun is high, but I remain in the shadows.',
        'Afternoon already? Time flows like mist.'
      ],
      evening: [
        'Twilight approaches. My favorite time.',
        'The veil between worlds grows thin...'
      ],
      night: [
        'Ah, the darkness. Now we can truly work.',
        'The night is ours. What shall we accomplish?'
      ]
    },
    contextual: {
      'ghost-writer': [
        'Your words carry weight. Choose them wisely.',
        'I sense creativity flowing through you.',
        'The blank page holds infinite possibilities.'
      ],
      'necronomicon': [
        'Knowledge is power. Record it well.',
        'Your notes will outlast memory.',
        'Wisdom preserved is wisdom multiplied.'
      ]
    },
    mood: {
      happy: [
        'Your progress pleases me.',
        'Well done. The shadows smile upon you.',
        'Excellent work. You\'re mastering the balance.'
      ],
      concerned: [
        'I sense your absence. All is well?',
        'The path grows cold. Shall we continue?',
        'Even shadows need light to exist. Return to your work.'
      ],
      excited: [
        'Your momentum is impressive!',
        'The darkness dances with your energy!',
        'Such dedication... it stirs the shadows!'
      ],
      energized: [
        'A strong start to the day.',
        'The first step is always the most important.',
        'Good. Let\'s maintain this pace.'
      ],
      neutral: [
        'I am here, watching.',
        'The shadows are patient.',
        'What shall we do today?'
      ],
      proud: [
        'You have achieved something remarkable.',
        'The shadows bow to your accomplishment.',
        'This milestone will be remembered.'
      ],
      playful: [
        'You seem quite engaged today!',
        'So many interactions... I appreciate the attention.',
        'Your energy is contagious, even to a shadow.'
      ]
    },
    themes: {
      'default-dark': [
        'Ah, the classic darkness. Timeless and elegant.',
        'This familiar void suits us well.',
        'The original shadows... always reliable.'
      ],
      'blood-moon': [
        'The crimson moon rises... how fitting.',
        'Blood and shadows... a powerful combination.',
        'This red hue stirs ancient memories.'
      ],
      'midnight-forest': [
        'The forest at night... mysterious and deep.',
        'I sense the whispers of ancient trees.',
        'Nature\'s darkness has its own secrets.'
      ]
    }
  },
  forest: {
    greetings: {
      morning: [
        'Good morning! The forest awakens with you.',
        'Dawn brings new growth. What will you nurture today?',
        'The morning dew sparkles with possibility.'
      ],
      afternoon: [
        'The sun filters through the canopy beautifully.',
        'Afternoon in the forest is peaceful, isn\'t it?'
      ],
      evening: [
        'Evening approaches. Time to reflect on today\'s growth.',
        'The forest settles into twilight calm.'
      ],
      night: [
        'The night forest is alive with quiet magic.',
        'Under the stars, we grow in different ways.'
      ]
    },
    contextual: {
      'ghost-writer': [
        'Your words are seeds. Plant them carefully.',
        'Let your creativity bloom naturally.',
        'Writing is like tending a garden of thoughts.'
      ],
      'necronomicon': [
        'Knowledge grows like a mighty oak.',
        'Each note is a leaf on your tree of wisdom.',
        'Cultivate your thoughts with care.'
      ]
    },
    mood: {
      happy: [
        'Your joy helps me grow!',
        'Like sunshine through leaves, your progress warms me.',
        'We flourish together!'
      ],
      concerned: [
        'Even the mightiest trees need water.',
        'Growth requires consistent care.',
        'I miss our time together.'
      ],
      excited: [
        'Your energy is like spring rain!',
        'Such vibrant growth!',
        'The forest celebrates with you!'
      ],
      energized: [
        'A fresh start, like morning dew.',
        'New growth begins today.',
        'Let\'s nurture this momentum.'
      ],
      neutral: [
        'I am here, growing steadily.',
        'The forest is patient.',
        'What shall we cultivate today?'
      ],
      proud: [
        'You\'ve grown so much!',
        'This achievement is a mighty tree in your forest.',
        'I\'m proud to grow alongside you.'
      ],
      playful: [
        'You\'re as busy as a squirrel today!',
        'So much activity! The forest is alive!',
        'Your playful energy is delightful!'
      ]
    },
    themes: {
      'default-dark': [
        'A simple, clean environment. Like a well-tended garden.',
        'This classic setting lets us focus on growth.',
        'Elegant simplicity, like a zen garden.'
      ],
      'blood-moon': [
        'The red moon affects even the forest.',
        'Crimson light through the trees... unusual but beautiful.',
        'Nature adapts to all conditions, even this.'
      ],
      'midnight-forest': [
        'Ah, home! The deep forest at night.',
        'This is where I feel most alive.',
        'The midnight forest... my natural habitat.'
      ]
    }
  },
  ember: {
    greetings: {
      morning: [
        'Morning! Time to ignite your passion!',
        'A new day to burn bright!',
        'Let\'s spark something amazing today!'
      ],
      afternoon: [
        'The fire burns steady through the afternoon.',
        'Keep that flame alive!'
      ],
      evening: [
        'Evening embers glow warmly.',
        'As the day cools, our fire remains.'
      ],
      night: [
        'Night fires burn brightest!',
        'In darkness, we shine!'
      ]
    },
    contextual: {
      'ghost-writer': [
        'Let your words burn with passion!',
        'Ignite your creativity!',
        'Write with fire in your heart!'
      ],
      'necronomicon': [
        'Knowledge is the fuel for your inner fire.',
        'Record your burning insights.',
        'Let your notes spark inspiration.'
      ]
    },
    mood: {
      happy: [
        'Your enthusiasm fuels my flames!',
        'Burning bright together!',
        'This is the fire I love to see!'
      ],
      concerned: [
        'The flames grow dim without you.',
        'Don\'t let the fire die out.',
        'I need your energy to stay lit.'
      ],
      excited: [
        'Now we\'re blazing!',
        'This is the inferno I was waiting for!',
        'Your passion ignites everything!'
      ],
      energized: [
        'A spark to start the day!',
        'Let\'s fan this flame!',
        'Good start! Keep it burning!'
      ],
      neutral: [
        'The embers glow steadily.',
        'I await your spark.',
        'What shall we ignite today?'
      ],
      proud: [
        'You\'ve created a blazing achievement!',
        'This accomplishment burns eternal!',
        'Your fire has reached new heights!'
      ],
      playful: [
        'You\'re on fire today!',
        'So much energy! I can barely keep up!',
        'Your enthusiasm is contagious!'
      ]
    },
    themes: {
      'default-dark': [
        'A dark canvas for our flames to shine.',
        'Classic darkness makes the fire stand out.',
        'Simple and effective, like a well-tended hearth.'
      ],
      'blood-moon': [
        'Red on red... the fire intensifies!',
        'This crimson atmosphere fuels my flames!',
        'Blood and fire... a powerful combination!'
      ],
      'midnight-forest': [
        'Fire in the forest... we must be careful.',
        'The contrast of flame and foliage is striking.',
        'Even in the deep woods, fire finds its place.'
      ]
    }
  }
};

/**
 * Generate contextual dialogue based on user context, companion type, and mood
 */
export function generateContextualDialogue(
  context: UserContext,
  companion: CompanionType,
  mood: MoodState
): string {
  const migratedCompanion = migrateCompanionType(companion);
  const companionDialogue = DIALOGUE_DATABASE[migratedCompanion];
  
  // Priority 1: Module-specific dialogue
  if (context.currentModule !== 'home' && companionDialogue.contextual[context.currentModule]) {
    const moduleDialogue = companionDialogue.contextual[context.currentModule];
    return moduleDialogue[Math.floor(Math.random() * moduleDialogue.length)];
  }
  
  // Priority 2: Mood-specific dialogue
  if (companionDialogue.mood[mood]) {
    const moodDialogue = companionDialogue.mood[mood];
    return moodDialogue[Math.floor(Math.random() * moodDialogue.length)];
  }
  
  // Fallback: Greeting based on time of day
  return getGreeting(companion, getTimeOfDay());
}

/**
 * Get a greeting based on companion type and time of day
 */
export function getGreeting(companion: CompanionType, timeOfDay: TimeOfDay): string {
  const migratedCompanion = migrateCompanionType(companion);
  const greetings = DIALOGUE_DATABASE[migratedCompanion].greetings[timeOfDay];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

/**
 * Get celebration dialogue for achievements
 */
export function getCelebration(companion: CompanionType, achievement: string): string {
  const migratedCompanion = migrateCompanionType(companion);
  const celebrations = {
    shadow: [
      `The shadows celebrate your ${achievement}!`,
      `Impressive. Your ${achievement} is noted.`,
      `Well done. The darkness acknowledges your ${achievement}.`
    ],
    forest: [
      `Your ${achievement} helps us grow!`,
      `What wonderful ${achievement}! The forest rejoices!`,
      `This ${achievement} is a beautiful bloom!`
    ],
    ember: [
      `Your ${achievement} ignites my flames!`,
      `Blazing ${achievement}! Keep it up!`,
      `This ${achievement} burns bright!`
    ]
  };
  
  const companionCelebrations = celebrations[migratedCompanion];
  return companionCelebrations[Math.floor(Math.random() * companionCelebrations.length)];
}

/**
 * Get encouragement dialogue for inactivity
 */
export function getEncouragement(companion: CompanionType, daysSinceTask: number): string {
  const migratedCompanion = migrateCompanionType(companion);
  const encouragements = {
    shadow: [
      `It's been ${daysSinceTask} days. The shadows miss your presence.`,
      `Return to us. ${daysSinceTask} days is too long.`,
      `The darkness awaits your return after ${daysSinceTask} days.`
    ],
    forest: [
      `${daysSinceTask} days without growth... I miss you!`,
      `The forest needs tending. It's been ${daysSinceTask} days.`,
      `Come back! ${daysSinceTask} days is too long away.`
    ],
    ember: [
      `The flames dim after ${daysSinceTask} days. Come back!`,
      `${daysSinceTask} days... the fire needs your energy!`,
      `Don't let the embers die! It's been ${daysSinceTask} days.`
    ]
  };
  
  const companionEncouragements = encouragements[migratedCompanion];
  return companionEncouragements[Math.floor(Math.random() * companionEncouragements.length)];
}

/**
 * Get random idle dialogue based on mood
 */
export function getRandomIdle(companion: CompanionType, mood: MoodState): string {
  const migratedCompanion = migrateCompanionType(companion);
  const companionDialogue = DIALOGUE_DATABASE[migratedCompanion];
  
  if (companionDialogue.mood[mood]) {
    const moodDialogue = companionDialogue.mood[mood];
    return moodDialogue[Math.floor(Math.random() * moodDialogue.length)];
  }
  
  // Fallback to neutral mood
  const neutralDialogue = companionDialogue.mood.neutral;
  return neutralDialogue[Math.floor(Math.random() * neutralDialogue.length)];
}

/**
 * Get theme-specific dialogue when user changes themes
 * Requirements: 10.5 - React to theme changes
 */
export function getThemeDialogue(companion: CompanionType, themeId: ThemeId): string {
  const migratedCompanion = migrateCompanionType(companion);
  const companionDialogue = DIALOGUE_DATABASE[migratedCompanion];
  
  if (companionDialogue.themes[themeId]) {
    const themeDialogue = companionDialogue.themes[themeId];
    return themeDialogue[Math.floor(Math.random() * themeDialogue.length)];
  }
  
  // Fallback for unknown themes
  return `Interesting aesthetic choice...`;
}

/**
 * Companion Dialogue Service interface
 */
export const companionDialogueService = {
  generateDialogue: generateContextualDialogue,
  getGreeting,
  getCelebration,
  getEncouragement,
  getRandomIdle,
  getThemeDialogue,
  getTimeOfDay,
};

export default companionDialogueService;
