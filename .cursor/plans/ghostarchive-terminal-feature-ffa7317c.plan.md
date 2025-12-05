<!-- ffa7317c-0cfc-4b6a-83da-34676c1d4aba 3fb45cb9-1c07-4b03-acb8-f7b72869aacb -->
# Ghost Archive Terminal - Generative Guide + AWS SageMaker Integration

## Problem

Users typing natural inputs like "hello" get "Unknown command" errors. The terminal needs conversational AI powered by custom fine-tuned models for authentic historical personality interactions.

## Architecture Overview

### Hybrid AI Approach

- **SageMaker Serverless Endpoints**: Custom fine-tuned models for each historical personality (Shakespeare, Einstein, Cleopatra, Tesla, Marie Curie)
- **Current AI Service**: Fallback for general queries, orchestration, and non-personality features
- **Smart Routing**: Route personality conversations to SageMaker, keep utility functions on current service

## Implementation Plan

### Phase 1: Natural Language & Conversational Interface

#### 1.1 Enhanced Input Detection

**File**: [`kiroween/src/utils/questionDetection.ts`](kiroween/src/utils/questionDetection.ts)

Add new detection functions:

```typescript
export function detectInputType(input: string): 
  'greeting' | 'farewell' | 'exploration' | 'question' | 'command' | 'casual';

// Greeting patterns: hello, hi, hey, greetings, salutations, good morning/afternoon/evening
// Farewell patterns: bye, goodbye, exit, quit, farewell, see you
// Exploration: show me, I want to, tell me about, what can you, help me
// Casual: thank you, thanks, cool, awesome, interesting, ok, yes, no
```

#### 1.2 Terminal Guide Service

**New File**: [`kiroween/src/services/terminalGuideService.ts`](kiroween/src/services/terminalGuideService.ts)

Create guide service:

```typescript
interface GuideState {
  stage: 'new' | 'exploring' | 'connected' | 'experienced';
  featuresDiscovered: string[];
  interactionCount: number;
  lastInteraction: number;
}

class TerminalGuideService {
  // Generate contextual suggestions based on user state
  generateSuggestions(state: GuideState, context: any): TerminalOption[];
  
  // Get conversational response for greetings
  getGreetingResponse(isFirstTime: boolean): string;
  
  // Get helpful response for casual input
  getCasualResponse(input: string, context: any): string;
  
  // Get exploration guidance
  getExplorationGuidance(topic: string): string;
}
```

#### 1.3 Enhanced executeCommand

**File**: [`kiroween/src/contexts/GhostArchiveContext.tsx`](kiroween/src/contexts/GhostArchiveContext.tsx)

Modify `executeCommand` (lines 476-759):

1. **Before command parsing** (after line 495), add:
```typescript
const inputType = detectInputType(trimmed);

// Handle greetings
if (inputType === 'greeting') {
  const isFirstTime = commandHistory.length === 0;
  const greetingResponse = terminalGuideService.getGreetingResponse(isFirstTime);
  const suggestions = terminalGuideService.generateSuggestions(guideState, {});
  
  addOutput({ type: 'output', content: greetingResponse });
  setAvailableOptions(suggestions);
  return;
}

// Handle farewells
if (inputType === 'farewell') {
  addOutput({ 
    type: 'output', 
    content: 'Farewell, traveler. The spirits await your return...\n\n💡 Tip: Type anything to continue, or close the terminal.' 
  });
  return;
}

// Handle exploration phrases
if (inputType === 'exploration') {
  const guidance = terminalGuideService.getExplorationGuidance(trimmed);
  addOutput({ type: 'output', content: guidance });
  return;
}

// Handle casual conversation
if (inputType === 'casual') {
  const response = terminalGuideService.getCasualResponse(trimmed, { connectedAgent });
  const suggestions = terminalGuideService.generateSuggestions(guideState, { connectedAgent });
  
  addOutput({ type: 'output', content: response });
  setAvailableOptions(suggestions);
  return;
}
```

2. **Transform default case** (lines 719-751) to be more helpful

### Phase 2: AWS SageMaker Integration

#### 2.1 SageMaker Service Layer

**New File**: [`kiroween/src/services/sagemakerService.ts`](kiroween/src/services/sagemakerService.ts)

Create SageMaker integration:

```typescript
interface SageMakerConfig {
  region: string;
  endpoints: Record<PersonalityId, string>;
  accessKeyId: string; // From environment
  secretAccessKey: string; // From environment
}

class SageMakerService {
  private config: SageMakerConfig;
  private client: SageMakerRuntimeClient;
  
  async invokePersonality(
    personalityId: string,
    prompt: string,
    conversationHistory: Message[]
  ): Promise<string>;
  
  async checkEndpointHealth(personalityId: string): Promise<boolean>;
  
  // Serverless endpoints auto-scale to zero when idle
  private async invokeServerlessEndpoint(
    endpointName: string,
    payload: any
  ): Promise<any>;
}
```

Dependencies needed:

```bash
npm install @aws-sdk/client-sagemaker-runtime
```

#### 2.2 Hybrid AI Service

**File**: [`kiroween/src/services/ghostArchiveService.ts`](kiroween/src/services/ghostArchiveService.ts)

Update to use hybrid approach:

```typescript
class GhostArchiveService {
  private sagemakerService: SageMakerService;
  private fallbackService: AIService; // Current service
  
  async ask(
    question: string,
    agentId?: string,
    reasoningMode?: 'single' | 'multi' | 'collaborative'
  ): Promise<string> {
    // If connected to personality, use SageMaker
    if (agentId && this.isSageMakerPersonality(agentId)) {
      try {
        return await this.sagemakerService.invokePersonality(
          agentId,
          question,
          this.conversationHistory[agentId] || []
        );
      } catch (error) {
        // Fallback to current service
        logger.warn('SageMaker failed, using fallback:', error);
        return await this.fallbackService.chat(question);
      }
    }
    
    // Use current service for general queries
    return await this.fallbackService.chat(question);
  }
}
```

#### 2.3 Environment Configuration

**File**: [`kiroween/.env.example`](kiroween/.env.example)

Add SageMaker configuration:

```
# AWS SageMaker Configuration
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key

# SageMaker Serverless Endpoints
VITE_SAGEMAKER_ENDPOINT_SHAKESPEARE=shakespeare-personality-endpoint
VITE_SAGEMAKER_ENDPOINT_EINSTEIN=einstein-personality-endpoint
VITE_SAGEMAKER_ENDPOINT_CLEOPATRA=cleopatra-personality-endpoint
VITE_SAGEMAKER_ENDPOINT_TESLA=tesla-personality-endpoint
VITE_SAGEMAKER_ENDPOINT_CURIE=curie-personality-endpoint
```

#### 2.4 Personality Model Configuration

**New File**: [`kiroween/src/config/sagemakerPersonalities.ts`](kiroween/src/config/sagemakerPersonalities.ts)

Define personality-specific model configs:

```typescript
export const SAGEMAKER_PERSONALITIES = {
  shakespeare: {
    endpointName: import.meta.env.VITE_SAGEMAKER_ENDPOINT_SHAKESPEARE,
    systemPrompt: 'You are William Shakespeare, responding in Early Modern English...',
    temperature: 0.8,
    maxTokens: 500,
  },
  einstein: {
    endpointName: import.meta.env.VITE_SAGEMAKER_ENDPOINT_EINSTEIN,
    systemPrompt: 'You are Albert Einstein, explaining concepts with scientific clarity...',
    temperature: 0.7,
    maxTokens: 600,
  },
  // ... other personalities
};
```

### Phase 3: Proactive Guidance System

#### 3.1 Guide State Management

**File**: [`kiroween/src/contexts/GhostArchiveContext.tsx`](kiroween/src/contexts/GhostArchiveContext.tsx)

Add guide state tracking:

```typescript
const [guideState, setGuideState] = useLocalStorage<GuideState>('ghost-archive-guide-state', {
  stage: 'new',
  featuresDiscovered: [],
  interactionCount: 0,
  lastInteraction: Date.now(),
});

// Update stage based on user progress
useEffect(() => {
  if (guideState.interactionCount > 10) {
    setGuideState(prev => ({ ...prev, stage: 'experienced' }));
  } else if (connectedAgent) {
    setGuideState(prev => ({ ...prev, stage: 'connected' }));
  } else if (guideState.interactionCount > 2) {
    setGuideState(prev => ({ ...prev, stage: 'exploring' }));
  }
}, [guideState.interactionCount, connectedAgent]);
```

#### 3.2 Auto-suggestions After Actions

Add after each major action (connect, workflow, etc.):

```typescript
// After connecting to agent
const suggestions = terminalGuideService.generateSuggestions(guideState, {
  connectedAgent,
  justConnected: true,
});
setAvailableOptions(suggestions);
addOutput({
  type: 'output',
  content: '\n💡 What would you like to do next?'
});
```

### Phase 4: AWS SageMaker Deployment Guide

#### Model Training & Deployment

1. **Fine-tune base models** (e.g., GPT-J, FLAN-T5) on historical texts:

   - Shakespeare: Complete works, sonnets, plays
   - Einstein: Papers, letters, quotes
   - Etc.

2. **Deploy to SageMaker Serverless**:
```python
# Example deployment script
import sagemaker
from sagemaker.huggingface import HuggingFaceModel

model = HuggingFaceModel(
    model_data="s3://your-bucket/shakespeare-model.tar.gz",
    role="SageMakerRole",
    transformers_version="4.26",
    pytorch_version="1.13",
    py_version="py39",
)

# Serverless inference config
serverless_config = {
    "MemorySizeInMB": 4096,
    "MaxConcurrency": 5,
}

predictor = model.deploy(
    serverless_inference_config=serverless_config,
    endpoint_name="shakespeare-personality-endpoint"
)
```

3. **Configure auto-scaling**: Scales to 0 when idle (cost-effective)

#### Cost Optimization

- Serverless endpoints: Pay only for inference time
- No charges when idle (scales to zero)
- Memory: 4GB per endpoint (adequate for most models)
- Concurrent requests: 5 max (adjust based on traffic)

## Implementation Order

1. **Phase 1**: Conversational interface (no AWS yet) - works with current AI service
2. **Phase 2**: Test with dummy SageMaker responses
3. **Phase 3**: Deploy one personality to SageMaker (Shakespeare)
4. **Phase 4**: Roll out remaining personalities
5. **Phase 5**: Add monitoring and fallback logic

## Security Considerations

- AWS credentials stored in environment variables (never in code)
- Use AWS IAM roles with minimal permissions (SageMaker invoke only)
- Implement request signing for endpoint security
- Add rate limiting to prevent abuse

## Files Summary

### New Files

- `src/services/sagemakerService.ts` - AWS SageMaker client wrapper
- `src/services/terminalGuideService.ts` - Contextual suggestion engine
- `src/config/sagemakerPersonalities.ts` - Personality model configurations
- `deployment/sagemaker-deploy.py` - Model deployment script (Python)
- `.env.example` - Environment variable template

### Modified Files

- `src/utils/questionDetection.ts` - Add greeting/casual detection
- `src/contexts/GhostArchiveContext.tsx` - Conversational handlers, guide state
- `src/services/ghostArchiveService.ts` - Hybrid SageMaker + fallback routing
- `package.json` - Add AWS SDK dependency

## Next Steps

Once you approve, I'll implement in this order:

1. Conversational interface improvements (works immediately)
2. SageMaker service layer (can test with mock data)
3. Integration and deployment scripts

### To-dos

- [ ] Enhance AchievementsPage to include streak milestones and dialogue unlocks
- [ ] Add Eternal Flame and other skill unlocks to achievements display
- [ ] Create unified UI showing achievements, milestones, and unlocks together
- [ ] Update CSS for seamless, clean design
- [ ] Add greeting, farewell, and casual conversation detection
- [ ] Create terminalGuideService for contextual suggestions
- [ ] Add greeting and casual input handlers to executeCommand
- [ ] Transform error messages into helpful, conversational guidance
- [ ] Make welcome message more conversational and inviting
- [ ] Add contextual hints after user actions