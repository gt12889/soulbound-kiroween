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
 * Generates AI-powered funny commentary using Gemini
 * @param commits - Array of git commits
 * @param stats - Commit statistics
 * @param cards - Selected tarot cards
 * @returns AI-generated funny commentary
 */
async function generateAICommentary(commits: GitCommit[], stats: CommitStats, cards: TarotCard[]): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[Tarot] No Gemini API key found - skipping AI commentary');
      return ''; // Silently fail if no API key
    }
    
    console.log('[Tarot] Generating AI commentary with Gemini...');

    // Prepare commit data for AI
    const recentMessages = commits.slice(0, 10).map(c => c.message).join('\n');
    const cardNames = cards.map(c => c.name).join(', ');

    const prompt = `You are a sassy, hilarious mystical tarot reader with a sharp wit and perfect comedic timing. You're analyzing a developer's GitHub repository and you're about to ROAST them (lovingly) based on their commit history.

📊 THE EVIDENCE:
- Total commits: ${stats.totalCommits}
- Commits per day: ${stats.averageCommitsPerDay}
- Most active hour: ${stats.mostActiveHour}:00 ${stats.mostActiveHour >= 22 || stats.mostActiveHour <= 5 ? '(NIGHT OWL ALERT 🦉)' : ''}
- Sentiment: ${stats.sentimentScore > 0 ? 'Positive (suspiciously optimistic)' : stats.sentimentScore < 0 ? 'Negative (we see those bug fixes)' : 'Neutral (playing it safe, eh?)'}
- Top keywords: ${stats.topKeywords.join(', ')}

🔍 THEIR ACTUAL COMMIT MESSAGES (oh boy):
${recentMessages}

🔮 TAROT CARDS DRAWN: ${cardNames}

YOUR MISSION:
Write a HILARIOUS 4-5 sentence roast that:
1. Makes SPECIFIC jokes about their actual commit messages (quote them!)
2. Roasts their coding schedule (especially if they code at weird hours)
3. Makes witty observations about patterns (lots of "fix" commits? "update" spam? vague messages?)
4. References the tarot cards in clever, unexpected ways
5. Includes at least 2-3 emojis for comedic effect
6. Makes pop culture references or programming jokes
7. Calls out funny things like:
   - Commit message quality ("fix bug" x10? Really?)
   - Timing patterns (3 AM commits? Weekend warrior?)
   - Keyword obsessions (why so many "updates"?)
   - Any suspicious patterns

TONE: Sarcastic friend who's roasting you at a party. Sharp, funny, but ultimately loving. Think stand-up comedy meets fortune telling.

EXAMPLES OF THE VIBE:
- "The Tower card appears, which tracks because your commit history looks like a controlled demolition. 'fix fix fix fix' - bestie, maybe test BEFORE pushing? 😅"
- "I see you're a 2 AM coder. The Moon card makes perfect sense - you're literally nocturnal. Your sleep schedule is more broken than your code (and that's saying something) 🌙💀"
- "The Fool card emerges... *looks at 'updated stuff' commit message*... yeah, that checks out. The spirits are asking: what stuff? WHAT. STUFF. 🤡"

Now generate YOUR roast:`;

    // Use model from environment or default to gemini-2.0-flash-exp
    const model = import.meta.env.VITE_AI_MODEL || 'gemini-2.0-flash-exp';
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'x-goog-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 300,
            topP: 0.95,
            topK: 40,
            // Disable thinking for faster, more predictable responses
            thinkingConfig: {
              thinkingBudget: 0
            }
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Tarot] Gemini API error:', response.status, errorText);
      return '';
    }

    const data = await response.json();
    console.log('[Tarot] Gemini response:', data);
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!aiText) {
      console.warn('[Tarot] No AI text generated from Gemini');
      return '';
    }
    
    console.log('[Tarot] AI commentary generated successfully:', aiText.substring(0, 100) + '...');
    return aiText.trim();
  } catch (error) {
    console.error('[Tarot] Error generating AI commentary:', error);
    return '';
  }
}

/**
 * Calculate grade from 0-100 based on value and thresholds
 */
function calculateGrade(value: number, excellent: number, good: number): { score: number; emoji: string; label: string } {
  let score: number;
  let emoji: string;
  let label: string;

  if (value >= excellent) {
    score = 95;
    emoji = '🌟';
    label = 'Excellent';
  } else if (value >= good) {
    score = 80;
    emoji = '✨';
    label = 'Good';
  } else if (value >= good * 0.5) {
    score = 65;
    emoji = '🔮';
    label = 'Fair';
  } else {
    score = 45;
    emoji = '💀';
    label = 'Needs Improvement';
  }

  return { score, emoji, label };
}

/**
 * Creates interpretation text based on commit statistics
 * @param stats - Commit statistics
 * @param cards - Selected tarot cards
 * @returns Interpretation text
 */
export function generateInterpretation(stats: CommitStats, cards: TarotCard[]): string {
  const lines: string[] = [];

  // Calculate grades for different aspects
  const activityGrade = calculateGrade(stats.averageCommitsPerDay, 3, 1.5);
  const consistencyGrade = calculateGrade(stats.totalCommits, 20, 10);
  const qualityGrade = calculateGrade(stats.sentimentScore, 0.6, 0.3);

  // Overall score
  const overallScore = Math.round((activityGrade.score + consistencyGrade.score + qualityGrade.score) / 3);
  const overallEmoji = overallScore >= 85 ? '👑' : overallScore >= 70 ? '⭐' : overallScore >= 55 ? '🔥' : '🌙';

  // SUMMARY SECTION
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('                    📊 SUMMARY                          ');
  lines.push('═══════════════════════════════════════════════════════\n');

  // Three-card reading summary
  lines.push(`${cards[0].name} (Past) → ${cards[1].name} (Present) → ${cards[2].name} (Future)`);
  lines.push('');
  
  if (stats.totalCommits < 5) {
    lines.push('🌱 The journey begins with tentative steps into the codebase.');
  } else if (stats.averageCommitsPerDay > 3) {
    lines.push('⚡ A relentless force drives forward, commits flowing like lightning.');
  } else {
    lines.push('🎯 Measured progress marks the path, each commit carefully considered.');
  }

  if (stats.sentimentScore > 0.5) {
    lines.push('✨ Positive energy radiates from your work, bugs vanquished with confidence.');
  } else if (stats.sentimentScore > 0) {
    lines.push('⚖️ Balance maintained through challenges, neither rushed nor stagnant.');
  } else {
    lines.push('🌑 The shadows gather, but even dark commits teach valuable lessons.');
  }

  const mostActiveHour = stats.mostActiveHour;
  if (mostActiveHour >= 22 || mostActiveHour <= 5) {
    lines.push('🦉 Night owl wisdom: your best work emerges when the world sleeps.');
  } else if (mostActiveHour >= 6 && mostActiveHour <= 12) {
    lines.push('🌅 Morning clarity: fresh perspective guides your most active hours.');
  } else {
    lines.push('☀️ Afternoon warrior: steady progress built in daylight hours.');
  }

  // GRADING SYSTEM
  lines.push('\n═══════════════════════════════════════════════════════');
  lines.push(`            ${overallEmoji} DETAILED ANALYSIS (${overallScore}/100)           `);
  lines.push('═══════════════════════════════════════════════════════\n');

  // Activity × Consistency = Productivity
  lines.push(`🔥 ${activityGrade.emoji} Activity (${activityGrade.score}/100) + 📅 ${consistencyGrade.emoji} Consistency (${consistencyGrade.score}/100)`);
  lines.push(`   = 🚀 Productivity Score: ${Math.round((activityGrade.score + consistencyGrade.score) / 2)}/100`);
  lines.push(`   ${stats.averageCommitsPerDay.toFixed(1)} commits/day × ${stats.totalCommits} total commits = ${activityGrade.label} work cadence\n`);

  // Quality × Sentiment = Code Health
  lines.push(`⚡ ${qualityGrade.emoji} Code Quality (${qualityGrade.score}/100) + 😊 Sentiment (${(stats.sentimentScore * 100).toFixed(0)}/100)`);
  lines.push(`   = 💎 Code Health: ${Math.round((qualityGrade.score + stats.sentimentScore * 100) / 2)}/100`);
  lines.push(`   ${qualityGrade.label} quality + ${stats.sentimentScore > 0.5 ? 'Positive' : stats.sentimentScore > 0 ? 'Neutral' : 'Negative'} vibes = ${qualityGrade.label} codebase\n`);

  // Timing × Keywords = Work Style
  const nightOwl = mostActiveHour >= 22 || mostActiveHour <= 5;
  const morningPerson = mostActiveHour >= 6 && mostActiveHour <= 12;
  const timingScore = nightOwl ? 90 : morningPerson ? 85 : 75;
  const timingEmoji = nightOwl ? '🌙' : morningPerson ? '🌅' : '☀️';
  
  lines.push(`${timingEmoji} Peak Hour: ${stats.mostActiveHour}:00 + 🔑 Keywords: ${stats.topKeywords.slice(0, 3).join(', ')}`);
  lines.push(`   = 🎨 Work Style: ${nightOwl ? 'Night Owl Wizard' : morningPerson ? 'Morning Strategist' : 'Steady Warrior'} (${timingScore}/100)`);
  lines.push(`   ${nightOwl ? 'Creative chaos in dark hours' : morningPerson ? 'Structured clarity at dawn' : 'Reliable rhythm through the day'}\n`);

  // MYSTICAL INSIGHTS
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('              🔮 MYSTICAL INSIGHTS                      ');
  lines.push('═══════════════════════════════════════════════════════\n');

  const keywords = stats.topKeywords;
  if (keywords.includes('fix') || keywords.includes('bug')) {
    lines.push('🐛 The Bug Slayer: Your commits whisper of battles won against elusive errors');
  }
  if (keywords.includes('add') || keywords.includes('new') || keywords.includes('feature')) {
    lines.push('✨ The Innovator: New features bloom like flowers in your garden of code');
  }
  if (keywords.includes('update') || keywords.includes('improve')) {
    lines.push('♻️ The Refiner: Continuous improvement is your sacred ritual');
  }
  if (keywords.includes('refactor')) {
    lines.push('🔧 The Architect: You reshape code like clay, seeking perfect form');
  }

  lines.push('\n💀 The spirits have spoken. May your commits be ever in your favor. 💀');

  return lines.join('\n');
}

/**
 * Generates a complete tarot reading
 * @param commits - Array of git commits
 * @param stats - Commit statistics
 * @returns Complete tarot reading
 */
export async function generateTarotReading(commits: GitCommit[], stats: CommitStats): Promise<TarotReading> {
  console.log('[Tarot] Starting tarot reading generation...');
  const cards = generateThreeCardSpread(stats);
  
  // Generate AI commentary
  console.log('[Tarot] Requesting AI commentary...');
  const aiCommentary = await generateAICommentary(commits, stats, cards);
  console.log('[Tarot] AI commentary result:', aiCommentary ? 'SUCCESS' : 'EMPTY');
  
  // Generate base interpretation
  let interpretation = generateInterpretation(stats, cards);
  
  // Prepend AI commentary if available
  if (aiCommentary) {
    console.log('[Tarot] Adding AI commentary to reading');
    interpretation = `🔮 THE SPIRITS SPEAK:\n\n${aiCommentary}\n\n${'═'.repeat(50)}\n\n${interpretation}`;
  } else {
    console.log('[Tarot] No AI commentary - using traditional reading only');
  }

  return {
    id: `reading-${Date.now()}`,
    date: new Date(),
    cards,
    interpretation,
    commitStats: stats,
  };
}
