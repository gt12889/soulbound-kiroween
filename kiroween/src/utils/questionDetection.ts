/**
 * Question Detection Utility
 * Detects if user input is a natural language question, greeting, or casual conversation
 */

const QUESTION_WORDS = [
  'what', 'how', 'why', 'when', 'where', 'who', 'which', 'whose', 'whom',
  'can', 'could', 'should', 'would', 'will', 'may', 'might', 'must',
  'is', 'are', 'was', 'were', 'do', 'does', 'did', 'has', 'have', 'had'
];

const QUESTION_PATTERNS = [
  /\?$/, // Ends with question mark
  /^(what|how|why|when|where|who|which|whose|whom|can|could|should|would|will|may|might|must)\s+/i, // Starts with question word
  /^(is|are|was|were|do|does|did|has|have|had)\s+/i, // Starts with auxiliary verb
  /\s+(what|how|why|when|where|who|which|whose|whom)\s+/i, // Contains question word
];

// Greeting patterns
const GREETING_PATTERNS = [
  /^(hello|hi|hey|greetings|salutations|hola|bonjour|good morning|good afternoon|good evening|howdy|sup|yo)$/i,
  /^(hi there|hey there|hello there)$/i,
];

// Farewell patterns
const FAREWELL_PATTERNS = [
  /^(bye|goodbye|farewell|see you|exit|quit|later|adios|au revoir|ciao|cheers)$/i,
  /^(good night|good bye|see ya|catch you later|take care|peace out)$/i,
];

// Exploration patterns
const EXPLORATION_PATTERNS = [
  /^(show me|tell me about|what (can|do) (you|i)|i want to|help me|guide me|teach me)/i,
  /^(how to|how do i|can you show|what's available|what are)/i,
];

// Casual conversation patterns
const CASUAL_PATTERNS = [
  /^(thanks?|thank you|thx|ty|cool|awesome|interesting|nice|ok|okay|yes|yeah|yep|no|nah|nope)$/i,
  /^(got it|i see|makes sense|understood|perfect|great|excellent|sounds good)$/i,
];

/**
 * Check if input is likely a question
 */
export function isQuestion(input: string): boolean {
  const trimmed = input.trim().toLowerCase();
  
  // Empty input is not a question
  if (!trimmed) return false;
  
  // Check if it ends with question mark
  if (trimmed.endsWith('?')) {
    return true;
  }
  
  // Check question patterns
  for (const pattern of QUESTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }
  
  // Check if it starts with a question word
  const firstWord = trimmed.split(/\s+/)[0];
  if (QUESTION_WORDS.includes(firstWord)) {
    return true;
  }
  
  return false;
}

/**
 * Detect the type of question/intent
 */
export function detectQuestionIntent(input: string): 'question' | 'reasoning' | 'collaboration' | 'command' {
  const trimmed = input.trim().toLowerCase();
  
  // Check for explicit reasoning keywords
  if (/\b(analyze|analysis|reason|reasoning|think|explain|break down|step by step)\b/i.test(trimmed)) {
    return 'reasoning';
  }
  
  // Check for collaboration keywords
  if (/\b(collaborate|team|multiple|together|discuss|debate|compare|different perspectives)\b/i.test(trimmed)) {
    return 'collaboration';
  }
  
  // If it's a question, default to question
  if (isQuestion(trimmed)) {
    return 'question';
  }
  
  return 'command';
}

/**
 * Check if input is a number (for option selection)
 */
export function isNumber(input: string): boolean {
  const trimmed = input.trim();
  return /^\d+$/.test(trimmed);
}

/**
 * Check if input looks like a command (starts with known command prefix)
 */
export function isCommand(input: string): boolean {
  const trimmed = input.trim().toLowerCase();
  
  // Numbers are not commands - they're for option selection
  if (isNumber(trimmed)) {
    return false;
  }
  
  const firstWord = trimmed.split(/\s+/)[0];
  
  const knownCommands = [
    'connect', 'disconnect', 'list', 'help', 'ask', 'reason', 'collaborate',
    'workflow', 'workflows', 'restore', 'generate-tests', 'review-codebase',
    'review', 'agents', 'clear', 'history'
  ];
  
  return knownCommands.includes(firstWord);
}

/**
 * Detect the overall type of user input for conversational routing
 */
export function detectInputType(input: string): 
  'greeting' | 'farewell' | 'exploration' | 'question' | 'command' | 'casual' | 'number' {
  const trimmed = input.trim().toLowerCase();
  
  // Check for numbers first - these are for option selection
  if (isNumber(trimmed)) {
    return 'number';
  }
  
  // Check for commands
  if (isCommand(trimmed)) {
    return 'command';
  }
  
  // Check for greetings
  for (const pattern of GREETING_PATTERNS) {
    if (pattern.test(trimmed)) {
      return 'greeting';
    }
  }
  
  // Check for farewells
  for (const pattern of FAREWELL_PATTERNS) {
    if (pattern.test(trimmed)) {
      return 'farewell';
    }
  }
  
  // Check for exploration phrases
  for (const pattern of EXPLORATION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return 'exploration';
    }
  }
  
  // Check for casual conversation
  for (const pattern of CASUAL_PATTERNS) {
    if (pattern.test(trimmed)) {
      return 'casual';
    }
  }
  
  // Check if it's a question
  if (isQuestion(trimmed)) {
    return 'question';
  }
  
  // Default to casual for anything else
  return 'casual';
}
