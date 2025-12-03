/**
 * Terminal Guide Service
 * Provides contextual suggestions and guidance for Ghost Archive Terminal
 */

import type { TerminalOption } from '../contexts/GhostArchiveContext';

export interface GuideState {
  stage: 'new' | 'exploring' | 'connected' | 'experienced';
  featuresDiscovered: string[];
  interactionCount: number;
  lastInteraction: number;
}

interface GuideContext {
  connectedAgent?: string;
  justConnected?: boolean;
  hasActiveAgents?: boolean;
  availablePersonalities?: string[];
  recentCommand?: string;
}

class TerminalGuideService {
  /**
   * Generate contextual suggestions based on user state and context
   */
  generateSuggestions(state: GuideState, context: GuideContext): TerminalOption[] {
    const suggestions: TerminalOption[] = [];
    
    // New users - focus on discovery
    if (state.stage === 'new') {
      return [
        { number: 1, command: 'list', description: 'Browse available personalities' },
        { number: 2, command: 'connect shakespeare', description: 'Chat with Shakespeare' },
        { number: 3, command: 'help', description: 'See all commands' },
      ];
    }
    
    // Just connected to an agent
    if (context.justConnected && context.connectedAgent) {
      const agentName = context.connectedAgent;
      
      // Personality-specific conversation starters
      const personalityQuestions: Record<string, string[]> = {
        shakespeare: [
          'What is love?',
          'Tell me about writing great characters',
          'How do you create memorable stories?',
        ],
        einstein: [
          'Explain relativity in simple terms',
          'What is the nature of time?',
          'How do you approach problem solving?',
        ],
        tesla: [
          'Tell me about your inventions',
          'What is the future of energy?',
          'How do you innovate?',
        ],
        cleopatra: [
          'What makes a great leader?',
          'Tell me about ancient Egypt',
          'How did you navigate politics?',
        ],
        curie: [
          'Tell me about radioactivity',
          'What drives scientific discovery?',
          'How did you overcome challenges?',
        ],
      };
      
      const questions = personalityQuestions[agentName] || [
        'What can you help me with?',
        'Tell me about yourself',
        'What are your greatest achievements?',
      ];
      
      return [
        { number: 1, command: questions[0], description: `Ask: "${questions[0]}"` },
        { number: 2, command: questions[1], description: `Ask: "${questions[1]}"` },
        { number: 3, command: questions[2], description: `Ask: "${questions[2]}"` },
        { number: 4, command: 'What inspired you?', description: 'Ask about their inspiration' },
        { number: 5, command: 'disconnect', description: 'Try a different personality' },
      ];
    }
    
    // Exploring - connected to an agent
    if (state.stage === 'exploring' && context.connectedAgent) {
      const agentName = context.connectedAgent;
      
      // More conversation questions based on personality
      const conversationTopics: Record<string, string[]> = {
        shakespeare: [
          'What is the essence of tragedy?',
          'How do you view human nature?',
          'Tell me about the power of language',
        ],
        einstein: [
          'What is the relationship between energy and matter?',
          'How does time work?',
          'What is the nature of light?',
        ],
        tesla: [
          'What is alternating current?',
          'How will wireless energy work?',
          'What inventions are you most proud of?',
        ],
        cleopatra: [
          'How did you lead Egypt?',
          'What is the role of diplomacy?',
          'Tell me about your alliance with Rome',
        ],
        curie: [
          'What is radioactivity?',
          'How do you conduct research?',
          'What advice do you have for scientists?',
        ],
      };
      
      const topics = conversationTopics[agentName] || [
        'What are your main ideas?',
        'Tell me about your work',
        'What drives you?',
      ];
      
      suggestions.push({
        number: 1,
        command: topics[0],
        description: `Ask: "${topics[0]}"`,
      });
      
      suggestions.push({
        number: 2,
        command: topics[1],
        description: `Ask: "${topics[1]}"`,
      });
      
      if (!state.featuresDiscovered.includes('reasoning')) {
        suggestions.push({
          number: 3,
          command: `reason ${topics[2]}`,
          description: 'Try multi-step reasoning mode',
        });
      } else {
        suggestions.push({
          number: 3,
          command: topics[2],
          description: `Ask: "${topics[2]}"`,
        });
      }
      
      if (!state.featuresDiscovered.includes('workflows')) {
        suggestions.push({
          number: 4,
          command: 'workflows',
          description: 'Explore collaborative workflows',
        });
      } else {
        suggestions.push({
          number: 4,
          command: 'What can we explore together?',
          description: 'Ask for collaboration ideas',
        });
      }
      
      suggestions.push({
        number: 5,
        command: 'disconnect',
        description: 'Try a different personality',
      });
      
      return suggestions;
    }
    
    // Connected - show advanced features
    if (state.stage === 'connected') {
      return [
        { number: 1, command: 'collaborate What are your thoughts on creativity?', description: 'Get multiple perspectives' },
        { number: 2, command: 'workflows', description: 'Run a collaborative workflow' },
        { number: 3, command: 'agents', description: 'See all active agents' },
        { number: 4, command: 'list', description: 'Browse other personalities' },
      ];
    }
    
    // Experienced - show power features
    if (state.stage === 'experienced') {
      return [
        { number: 1, command: 'workflow fragment-restoration', description: 'Restore ancient fragments' },
        { number: 2, command: 'collaborate', description: 'Multi-agent collaboration' },
        { number: 3, command: 'generate-tests', description: 'AI test generation' },
      ];
    }
    
    // Default fallback
    return [
      { number: 1, command: 'list', description: 'Browse personalities' },
      { number: 2, command: 'help', description: 'View all commands' },
    ];
  }

  /**
   * Get greeting response based on user journey
   */
  getGreetingResponse(isFirstTime: boolean, userName?: string): string {
    const greeting = userName ? `Hello, ${userName}` : 'Hello there, traveler';
    
    if (isFirstTime) {
      return `👻 ${greeting}! Welcome to the Ghost Archive Terminal.

I'm your guide to connecting with historical personalities from across time.

Here's what you can do:
  🎭 Chat with Shakespeare for poetic and literary insights
  🔬 Discuss with Einstein about science and philosophy  
  👑 Learn from Cleopatra about leadership and history
  ⚡ Talk to Tesla about innovation and invention
  🧪 Explore with Marie Curie on scientific research

What interests you?`;
    }
    
    return `👻 ${greeting}! Welcome back to the Ghost Archive.

Ready to continue your journey? You can:
  • Connect to a personality (try: "connect shakespeare")
  • Ask me anything about the terminal
  • Type a number to select from suggestions below`;
  }

  /**
   * Get casual conversation response
   */
  getCasualResponse(input: string, context: GuideContext): string {
    const lower = input.toLowerCase().trim();
    
    // Thank you responses
    if (/thanks?|thank you|thx|ty/i.test(lower)) {
      return `You're welcome! 😊\n\n${this.getNextStepHint(context)}`;
    }
    
    // Positive acknowledgments
    if (/cool|awesome|interesting|nice|great|excellent/i.test(lower)) {
      return `Glad you think so! There's much more to discover.\n\n${this.getNextStepHint(context)}`;
    }
    
    // Affirmative responses
    if (/^(ok|okay|yes|yeah|yep|got it|i see|makes sense|understood)$/i.test(lower)) {
      return `Perfect! ${this.getNextStepHint(context)}`;
    }
    
    // Negative responses
    if (/^(no|nah|nope|not now)$/i.test(lower)) {
      return `No problem! Type 'help' anytime you're ready, or just chat naturally.`;
    }
    
    // Generic casual response
    return `I'm here to help! ${this.getNextStepHint(context)}`;
  }

  /**
   * Get exploration guidance
   */
  getExplorationGuidance(input: string): string {
    const lower = input.toLowerCase();
    
    // Asking about personalities
    if (/shakespeare/i.test(lower)) {
      return `🎭 William Shakespeare - The Bard of Avon

Master of poetic language and storytelling. Connect to discuss:
  • Literature and creative writing
  • Poetry and dramatic arts
  • Human nature and philosophy

Try: connect shakespeare`;
    }
    
    if (/einstein/i.test(lower)) {
      return `🔬 Albert Einstein - Theoretical Physicist

Revolutionary thinker who reimagined space and time. Connect to discuss:
  • Physics and relativity
  • Philosophy of science
  • Creative problem solving

Try: connect einstein`;
    }
    
    if (/tesla/i.test(lower)) {
      return `⚡ Nikola Tesla - Visionary Inventor

Pioneer of electrical engineering and wireless technology. Connect to discuss:
  • Innovation and invention
  • Electrical systems
  • Future technology

Try: connect tesla`;
    }
    
    // Generic exploration
    if (/what can|what do|what are/i.test(lower)) {
      return `The Ghost Archive offers:

📚 Historical Personalities - Connect and chat with great minds
🔄 Collaborative Workflows - Multi-agent problem solving
🧩 Fragment Restoration - Restore corrupted historical documents
🧠 Multi-Reasoning - Deep analysis with step-by-step thinking

Type 'list' to see all personalities, or 'workflows' for collaborative features.`;
    }
    
    if (/how to|how do i/i.test(lower)) {
      return `Getting started is easy:

1️⃣ Type 'list' to see available personalities
2️⃣ Type 'connect <name>' to chat (e.g., 'connect einstein')
3️⃣ Ask questions naturally - no special commands needed
4️⃣ Type numbers (1-5) to select from suggestions

Try it now: Type 'list' or just ask "Who can I talk to?"`;
    }
    
    return `I can help you explore the Ghost Archive! 

Try asking:
  • "What can you do?"
  • "Tell me about Einstein"
  • "How do I connect to a personality?"
  
Or just type 'list' to see all available personalities.`;
  }

  /**
   * Get farewell message
   */
  getFarewellMessage(): string {
    return `👋 Farewell, traveler. The spirits will await your return...

💡 Tip: Your conversation history is saved. Come back anytime!`;
  }

  /**
   * Get helpful next step hint based on context
   */
  private getNextStepHint(context: GuideContext): string {
    if (!context.connectedAgent) {
      return `Ready to connect to a personality? Type 'list' to see who's available.`;
    }
    
    if (context.hasActiveAgents) {
      return `Try asking your connected personality a question, or type 'workflows' to see what else you can do.`;
    }
    
    return `What would you like to explore next?`;
  }

  /**
   * Generate helpful error message with suggestions
   */
  generateHelpfulError(unknownInput: string, context: GuideContext): { message: string; suggestions: TerminalOption[] } {
    const message = `I didn't recognize "${unknownInput}" as a command.

But don't worry - you can chat naturally! Try:
  • Asking a question: "What is quantum physics?"
  • Connecting to someone: "connect einstein"
  • Exploring features: "what can you do?"
  
Or choose from these options:`;

    const suggestions: TerminalOption[] = [
      { number: 1, command: 'help', description: 'View all commands' },
      { number: 2, command: 'list', description: 'Browse personalities' },
      { number: 3, command: 'workflows', description: 'See collaborative features' },
    ];

    return { message, suggestions };
  }
}

export const terminalGuideService = new TerminalGuideService();

