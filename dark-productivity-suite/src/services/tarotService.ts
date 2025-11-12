/**
 * Tarot service for generating readings based on commit patterns
 */
import type { TarotCard, TarotReading, CommitStats } from '../types';
import type { GitCommit } from './gitService';

/**
 * Tarot card database with ASCII art and meanings
 */
const TAROT_DECK: Omit<TarotCard, 'position'>[] = [
  {
    name: 'The Fool',
    asciiArt: `
    ╔═══════════╗
    ║           ║
    ║    🎭    ║
    ║   /|\\    ║
    ║   / \\    ║
    ║           ║
    ║ THE FOOL  ║
    ╚═══════════╝`,
    meaning: 'New beginnings, spontaneity, taking risks in your code',
  },
  {
    name: 'The Magician',
    asciiArt: `
    ╔═══════════╗
    ║     ∞     ║
    ║    🎩    ║
    ║   /|\\    ║
    ║    |     ║
    ║   / \\    ║
    ║ MAGICIAN  ║
    ╚═══════════╝`,
    meaning: 'Skill, resourcefulness, manifesting ideas into reality',
  },
  {
    name: 'The High Priestess',
    asciiArt: `
    ╔═══════════╗
    ║    ☽☾    ║
    ║    👑    ║
    ║   /|\\    ║
    ║    |     ║
    ║   / \\    ║
    ║ PRIESTESS ║
    ╚═══════════╝`,
    meaning: 'Intuition, hidden knowledge, trusting your instincts',
  },
  {
    name: 'The Emperor',
    asciiArt: `
    ╔═══════════╗
    ║    ♔     ║
    ║   👑     ║
    ║   /|\\    ║
    ║    |     ║
    ║   / \\    ║
    ║  EMPEROR  ║
    ╚═══════════╝`,
    meaning: 'Structure, authority, establishing order in chaos',
  },
  {
    name: 'The Hierophant',
    asciiArt: `
    ╔═══════════╗
    ║    ✟     ║
    ║   📿     ║
    ║   /|\\    ║
    ║    |     ║
    ║   / \\    ║
    ║HIEROPHANT ║
    ╚═══════════╝`,
    meaning: 'Tradition, conformity, following established patterns',
  },
  {
    name: 'The Lovers',
    asciiArt: `
    ╔═══════════╗
    ║    ♥     ║
    ║   💑     ║
    ║   /|\\ /|\\ ║
    ║    | |   ║
    ║   / \\ / \\║
    ║  LOVERS   ║
    ╚═══════════╝`,
    meaning: 'Harmony, collaboration, choosing the right path',
  },
  {
    name: 'The Chariot',
    asciiArt: `
    ╔═══════════╗
    ║    ★     ║
    ║   🏇     ║
    ║   /|\\    ║
    ║  ═╬═╬═   ║
    ║   ║ ║    ║
    ║  CHARIOT  ║
    ╚═══════════╝`,
    meaning: 'Determination, willpower, driving forward with purpose',
  },
  {
    name: 'Strength',
    asciiArt: `
    ╔═══════════╗
    ║    ∞     ║
    ║   🦁     ║
    ║   /|\\    ║
    ║    |     ║
    ║   / \\    ║
    ║ STRENGTH  ║
    ╚═══════════╝`,
    meaning: 'Inner strength, courage, overcoming challenges',
  },
  {
    name: 'The Hermit',
    asciiArt: `
    ╔═══════════╗
    ║    🕯️    ║
    ║   🧙     ║
    ║   /|\\    ║
    ║    |     ║
    ║   / \\    ║
    ║  HERMIT   ║
    ╚═══════════╝`,
    meaning: 'Introspection, solitude, seeking deeper understanding',
  },
  {
    name: 'Wheel of Fortune',
    asciiArt: `
    ╔═══════════╗
    ║    ☸     ║
    ║   ⚙️     ║
    ║  ╱─┼─╲   ║
    ║ │  ⊕  │  ║
    ║  ╲─┼─╱   ║
    ║  FORTUNE  ║
    ╚═══════════╝`,
    meaning: 'Change, cycles, turning points in your journey',
  },
  {
    name: 'Justice',
    asciiArt: `
    ╔═══════════╗
    ║    ⚖️    ║
    ║   👩‍⚖️    ║
    ║   /|\\    ║
    ║    |     ║
    ║   / \\    ║
    ║  JUSTICE  ║
    ╚═══════════╝`,
    meaning: 'Balance, fairness, cause and effect',
  },
  {
    name: 'The Hanged Man',
    asciiArt: `
    ╔═══════════╗
    ║  ┬─────┬  ║
    ║  │  🙃 │  ║
    ║  │ /|\\ │  ║
    ║  │  |  │  ║
    ║  │ / \\ │  ║
    ║ HANGED MAN║
    ╚═══════════╝`,
    meaning: 'Pause, new perspective, letting go of control',
  },
  {
    name: 'Death',
    asciiArt: `
    ╔═══════════╗
    ║    ☠️    ║
    ║   💀     ║
    ║   /|\\    ║
    ║    |     ║
    ║   / \\    ║
    ║   DEATH   ║
    ╚═══════════╝`,
    meaning: 'Transformation, endings leading to new beginnings',
  },
  {
    name: 'Temperance',
    asciiArt: `
    ╔═══════════╗
    ║    ☯️    ║
    ║   👼     ║
    ║   /|\\    ║
    ║    |     ║
    ║   / \\    ║
    ║TEMPERANCE ║
    ╚═══════════╝`,
    meaning: 'Balance, moderation, finding the middle path',
  },
  {
    name: 'The Devil',
    asciiArt: `
    ╔═══════════╗
    ║    👿    ║
    ║   😈     ║
    ║   /|\\    ║
    ║  ⛓️|⛓️   ║
    ║   / \\    ║
    ║  THE DEVIL║
    ╚═══════════╝`,
    meaning: 'Bondage, materialism, breaking free from limitations',
  },
  {
    name: 'The Tower',
    asciiArt: `
    ╔═══════════╗
    ║    ⚡    ║
    ║   🏰     ║
    ║   ║║║    ║
    ║   ║║║    ║
    ║  ═════   ║
    ║  THE TOWER║
    ╚═══════════╝`,
    meaning: 'Sudden change, upheaval, breaking down old structures',
  },
  {
    name: 'The Star',
    asciiArt: `
    ╔═══════════╗
    ║    ✨    ║
    ║   ⭐     ║
    ║  ★ ★ ★   ║
    ║   /|\\    ║
    ║   / \\    ║
    ║  THE STAR ║
    ╚═══════════╝`,
    meaning: 'Hope, inspiration, renewed faith in your path',
  },
  {
    name: 'The Moon',
    asciiArt: `
    ╔═══════════╗
    ║    🌙    ║
    ║   ☾☽     ║
    ║   /|\\    ║
    ║  ≈≈≈≈≈   ║
    ║  🐺  🐺  ║
    ║  THE MOON ║
    ╚═══════════╝`,
    meaning: 'Illusion, intuition, navigating uncertainty',
  },
  {
    name: 'The Sun',
    asciiArt: `
    ╔═══════════╗
    ║    ☀️    ║
    ║   🌞     ║
    ║  ╲ | ╱   ║
    ║  ─ ⊙ ─   ║
    ║  ╱ | ╲   ║
    ║  THE SUN  ║
    ╚═══════════╝`,
    meaning: 'Success, vitality, clarity and enlightenment',
  },
  {
    name: 'Judgement',
    asciiArt: `
    ╔═══════════╗
    ║    📯    ║
    ║   👼     ║
    ║  /|\\ /|\\ ║
    ║   |   |  ║
    ║  / \\ / \\ ║
    ║ JUDGEMENT ║
    ╚═══════════╝`,
    meaning: 'Reflection, reckoning, awakening to higher purpose',
  },
  {
    name: 'The World',
    asciiArt: `
    ╔═══════════╗
    ║    🌍    ║
    ║   /|\\    ║
    ║  ( ⊕ )   ║
    ║   \\|/    ║
    ║   / \\    ║
    ║  THE WORLD║
    ╚═══════════╝`,
    meaning: 'Completion, achievement, reaching your goals',
  },
];

/**
 * Maps commit patterns to tarot cards
 * @param stats - Commit statistics
 * @param position - Card position (past, present, future)
 * @returns Selected tarot card
 */
function selectCardForPosition(
  stats: CommitStats,
  position: 'past' | 'present' | 'future',
  usedIndices: Set<number>
): TarotCard {
  let cardIndex: number;

  if (position === 'past') {
    // Past: Based on total commits and activity level
    if (stats.totalCommits < 5) {
      cardIndex = 0; // The Fool - new beginnings
    } else if (stats.averageCommitsPerDay > 3) {
      cardIndex = 6; // The Chariot - driving forward
    } else if (stats.sentimentScore < -0.3) {
      cardIndex = 15; // The Tower - upheaval
    } else {
      cardIndex = 9; // Wheel of Fortune - cycles
    }
  } else if (position === 'present') {
    // Present: Based on recent activity and sentiment
    if (stats.sentimentScore > 0.3) {
      cardIndex = 18; // The Sun - success
    } else if (stats.sentimentScore < -0.3) {
      cardIndex = 12; // Death - transformation
    } else if (stats.mostActiveHour >= 22 || stats.mostActiveHour <= 5) {
      cardIndex = 17; // The Moon - working in darkness
    } else if (stats.averageCommitsPerDay > 2) {
      cardIndex = 7; // Strength - perseverance
    } else {
      cardIndex = 13; // Temperance - balance
    }
  } else {
    // Future: Based on patterns and keywords
    const hasFixKeyword = stats.topKeywords.some(k => k.includes('fix') || k.includes('bug'));
    const hasFeatureKeyword = stats.topKeywords.some(k => k.includes('add') || k.includes('feature'));
    
    if (hasFeatureKeyword) {
      cardIndex = 1; // The Magician - manifesting ideas
    } else if (hasFixKeyword) {
      cardIndex = 10; // Justice - balance
    } else if (stats.averageCommitsPerDay > 2.5) {
      cardIndex = 20; // The World - completion
    } else if (stats.totalCommits > 20) {
      cardIndex = 16; // The Star - hope
    } else {
      cardIndex = 8; // The Hermit - introspection
    }
  }

  // Ensure we don't use the same card twice
  while (usedIndices.has(cardIndex)) {
    cardIndex = (cardIndex + 1) % TAROT_DECK.length;
  }
  usedIndices.add(cardIndex);

  const card = TAROT_DECK[cardIndex];
  return {
    ...card,
    position,
  };
}

/**
 * Generates a three-card tarot spread
 * @param stats - Commit statistics
 * @returns Array of three tarot cards
 */
export function generateThreeCardSpread(stats: CommitStats): TarotCard[] {
  const usedIndices = new Set<number>();
  
  return [
    selectCardForPosition(stats, 'past', usedIndices),
    selectCardForPosition(stats, 'present', usedIndices),
    selectCardForPosition(stats, 'future', usedIndices),
  ];
}

/**
 * Creates interpretation text based on commit statistics
 * @param stats - Commit statistics
 * @param cards - Selected tarot cards
 * @returns Interpretation text
 */
export function generateInterpretation(stats: CommitStats, cards: TarotCard[]): string {
  const lines: string[] = [];

  // Opening
  lines.push('The cards reveal the story of your coding journey...\n');

  // Past interpretation
  lines.push(`In the PAST, ${cards[0].name} appears.`);
  if (stats.totalCommits < 5) {
    lines.push('Your journey was just beginning, full of potential and uncertainty.');
  } else if (stats.averageCommitsPerDay > 3) {
    lines.push('You charged forward with determination, making steady progress.');
  } else {
    lines.push('Your path has been one of cycles and changes.');
  }
  lines.push('');

  // Present interpretation
  lines.push(`In the PRESENT, ${cards[1].name} stands before you.`);
  if (stats.sentimentScore > 0.3) {
    lines.push('Your current work shines with success and positive energy.');
  } else if (stats.sentimentScore < -0.3) {
    lines.push('You face challenges that demand transformation and growth.');
  } else if (stats.mostActiveHour >= 22 || stats.mostActiveHour <= 5) {
    lines.push('You work in the quiet hours, guided by intuition and focus.');
  } else {
    lines.push('You maintain balance and steady progress in your craft.');
  }
  lines.push('');

  // Future interpretation
  lines.push(`Looking to the FUTURE, ${cards[2].name} emerges.`);
  const hasFixKeyword = stats.topKeywords.some(k => k.includes('fix') || k.includes('bug'));
  const hasFeatureKeyword = stats.topKeywords.some(k => k.includes('add') || k.includes('feature'));
  
  if (hasFeatureKeyword) {
    lines.push('New creations await, ready to be manifested into reality.');
  } else if (hasFixKeyword) {
    lines.push('Balance will be restored as you resolve what needs attention.');
  } else if (stats.averageCommitsPerDay > 2.5) {
    lines.push('Completion and achievement are within your reach.');
  } else {
    lines.push('Continued growth and wisdom await on your path ahead.');
  }
  lines.push('');

  // Closing with stats
  lines.push('═══════════════════════════════════════');
  lines.push(`Total Commits: ${stats.totalCommits}`);
  lines.push(`Daily Average: ${stats.averageCommitsPerDay}`);
  lines.push(`Most Active Hour: ${stats.mostActiveHour}:00`);
  lines.push(`Sentiment: ${stats.sentimentScore > 0 ? 'Positive' : stats.sentimentScore < 0 ? 'Negative' : 'Neutral'} (${stats.sentimentScore})`);
  if (stats.topKeywords.length > 0) {
    lines.push(`Top Keywords: ${stats.topKeywords.join(', ')}`);
  }

  return lines.join('\n');
}

/**
 * Generates a complete tarot reading
 * @param _commits - Array of git commits (unused but kept for API consistency)
 * @param stats - Commit statistics
 * @returns Complete tarot reading
 */
export function generateTarotReading(_commits: GitCommit[], stats: CommitStats): TarotReading {
  const cards = generateThreeCardSpread(stats);
  const interpretation = generateInterpretation(stats, cards);

  return {
    id: `reading-${Date.now()}`,
    date: new Date(),
    cards,
    interpretation,
    commitStats: stats,
  };
}
