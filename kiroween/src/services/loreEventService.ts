/**
 * Lore Event Service for GhostArchive
 * Generates random spooky events and personality-specific occurrences
 */

import type { LoreEvent } from '../types/ghostArchive';

interface LoreEventTemplate {
  type: LoreEvent['type'];
  messages: string[];
  visualEffect?: LoreEvent['visualEffect'];
  weight: number;
}

class LoreEventService {
  private eventHistory: LoreEvent[] = [];
  private lastEventTime: number = 0;
  private cooldownMs: number = 120000; // 2 minutes between events (increased from 30 seconds)

  private globalEvents: LoreEventTemplate[] = [
    {
      type: 'text',
      messages: [
        'A faint whisper echoes through the terminal...',
        'The screen flickers momentarily...',
        'Strange symbols appear and disappear...',
        'A chill runs down your spine...',
        'The terminal seems to breathe...',
      ],
      weight: 5,
    },
    {
      type: 'glitch',
      messages: [
        'SYSTEM ERROR... CORRUPTION DETECTED...',
        'REALITY.GLITCH.EXE',
        'The boundaries between worlds grow thin...',
      ],
      visualEffect: 'glitch',
      weight: 2,
    },
    {
      type: 'discovery',
      messages: [
        'A new fragment has been discovered in the archives...',
        'Ancient text emerges from the digital void...',
        'A lost document materializes...',
      ],
      weight: 3,
    },
  ];

  private personalityEvents: Record<string, LoreEventTemplate[]> = {
    shakespeare: [
      {
        type: 'interruption',
        messages: [
          'Hark! What light through yonder terminal breaks?',
          'To be, or not to be... that is the question echoing through the void.',
          'All the world\'s a terminal, and all the spirits merely players...',
        ],
        weight: 3,
      },
    ],
    einstein: [
      {
        type: 'interruption',
        messages: [
          'Imagination is more important than knowledge... even in the digital realm.',
          'The distinction between past, present, and future is but a stubborn illusion.',
          'I have no special talent. I am only passionately curious about this new medium.',
        ],
        weight: 3,
      },
    ],
    cleopatra: [
      {
        type: 'interruption',
        messages: [
          'The sands of time flow differently in this realm...',
          'Even a queen must adapt to new technologies.',
          'Wisdom transcends the boundaries of time and space.',
        ],
        weight: 3,
      },
    ],
    tesla: [
      {
        type: 'interruption',
        messages: [
          'The present is theirs; the future, for which I really worked, is mine.',
          'If you want to find the secrets of the universe, think in terms of energy, frequency, and vibration.',
          'The day science begins to study non-physical phenomena, it will make more progress in one decade than in all the previous centuries.',
        ],
        weight: 3,
      },
    ],
    'marie-curie': [
      {
        type: 'interruption',
        messages: [
          'Nothing in life is to be feared, it is only to be understood... even digital existence.',
          'Be less curious about people and more curious about ideas.',
          'In science, we must be interested in things, not in persons.',
        ],
        weight: 3,
      },
    ],
  };

  /**
   * Generate a random lore event
   */
  generateEvent(activeAgents?: string[]): LoreEvent | null {
    const now = Date.now();
    
    // Check cooldown
    if (now - this.lastEventTime < this.cooldownMs) {
      return null;
    }

    // Determine event pool
    let eventPool: LoreEventTemplate[] = [...this.globalEvents];

    // Add personality-specific events if agents are active
    if (activeAgents && activeAgents.length > 0) {
      activeAgents.forEach(agentId => {
        const personalityEvents = this.personalityEvents[agentId];
        if (personalityEvents) {
          eventPool = eventPool.concat(personalityEvents);
        }
      });
    }

    // Weighted random selection
    const totalWeight = eventPool.reduce((sum, event) => sum + event.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedEvent: LoreEventTemplate | null = null;
    for (const event of eventPool) {
      random -= event.weight;
      if (random <= 0) {
        selectedEvent = event;
        break;
      }
    }

    if (!selectedEvent) {
      selectedEvent = eventPool[0];
    }

    // Select random message
    const message = selectedEvent.messages[
      Math.floor(Math.random() * selectedEvent.messages.length)
    ];

    const loreEvent: LoreEvent = {
      id: `lore-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: selectedEvent.type,
      message,
      timestamp: now,
      visualEffect: selectedEvent.visualEffect,
      agentId: activeAgents && activeAgents.length > 0 
        ? activeAgents[Math.floor(Math.random() * activeAgents.length)]
        : undefined,
    };

    this.eventHistory.push(loreEvent);
    this.lastEventTime = now;

    // Keep only last 50 events
    if (this.eventHistory.length > 50) {
      this.eventHistory.shift();
    }

    return loreEvent;
  }

  /**
   * Get event history
   */
  getEventHistory(): LoreEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
    this.lastEventTime = 0;
  }

  /**
   * Set cooldown period
   */
  setCooldown(ms: number): void {
    this.cooldownMs = ms;
  }
}

export const loreEventService = new LoreEventService();

