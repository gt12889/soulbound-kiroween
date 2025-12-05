# Ghost Archive Terminal - User Guide

## Overview

The Ghost Archive Terminal is now a fully conversational, intuitive interface for chatting with historical personalities. No need to memorize commands - just talk naturally!

## Getting Started

### First Time Use

When you open the Ghost Archive Terminal, you'll see a friendly welcome message with numbered suggestions. You can:

1. **Type a number** (1, 2, or 3) to select a suggested action
2. **Type naturally** - "hello", "what can you do?", "tell me about Einstein"
3. **Use commands** - `list`, `help`, `connect shakespeare`

### Natural Conversation

The terminal now understands:

**Greetings**:
- "hello", "hi", "hey", "greetings"
- "good morning", "good afternoon"
- "yo", "sup", "howdy"

**Exploration**:
- "what can you do?"
- "show me available personalities"
- "tell me about Shakespeare"
- "how do I get started?"

**Casual Chat**:
- "thanks", "cool", "awesome"
- "ok", "yes", "no"
- "got it", "interesting"

**Farewells**:
- "bye", "goodbye", "exit"
- "see you later", "farewell"

## Example Interactions

### Scenario 1: Complete Beginner

```
You: hello
Terminal: 👻 Hello there, traveler! Welcome to the Ghost Archive...
         [Shows 3 suggestions]
         
You: 2
Terminal: [Executes suggestion #2 - connects to Shakespeare]
         
You: What inspired you to write Romeo and Juliet?
Terminal: [Shakespeare responds in character]
```

### Scenario 2: Exploring Features

```
You: what can you do?
Terminal: The Ghost Archive offers:
         📚 Historical Personalities - Connect and chat...
         [Shows suggestions]

You: tell me about Einstein
Terminal: 🔬 Albert Einstein - Theoretical Physicist...
         Try: connect einstein
         
You: connect einstein
Terminal: [Connected! Shows conversation starters]
```

### Scenario 3: Advanced User

```
You: collaborate What are different perspectives on creativity?
Terminal: 👥 Engaging multiple agents...
         [Gets responses from Shakespeare, Einstein, Tesla]
```

## Features

### Contextual Suggestions

After every action, you'll get 3-5 relevant suggestions:
- New users see discovery options
- Connected users see conversation starters
- Experienced users see advanced features

### Progressive Learning

The terminal learns as you use it:
- **New**: Focus on connecting and basic exploration
- **Exploring**: Introduces reasoning modes and workflows
- **Connected**: Shows collaboration features
- **Experienced**: Reveals power features

### Feature Discovery

The system tracks what you've tried:
- Reasoning mode
- Collaboration
- Workflows
- Fragment restoration

And suggests features you haven't explored yet!

## Commands Reference

### Quick Commands
- `list` - Browse all personalities
- `help` - View all commands
- `workflows` - See collaborative features
- `agents` - Show active agents
- `clear` - Clear terminal
- `history` - View command history

### Connection Commands
- `connect <name>` - Connect to a personality
  - Example: `connect shakespeare`
- `disconnect` - Disconnect from current personality

### Advanced Commands
- `reason <question>` - Get multi-step reasoning
- `collaborate <task>` - Engage multiple agents
- `workflow <name>` - Execute a workflow
- `generate-tests <id>` - AI test generation
- `review-codebase` - Codebase review

### Number Selection

Whenever you see numbered options, just type the number:
```
1. Browse personalities
2. See workflows  
3. View all commands

You: 1
[Executes option 1]
```

## AWS SageMaker Integration

### What is SageMaker?

The Ghost Archive uses AWS SageMaker to host fine-tuned AI models for each personality, making conversations more authentic and character-specific.

### Benefits

- **Authentic responses**: Each personality has their own fine-tuned model
- **Cost-effective**: Serverless endpoints scale to $0 when idle
- **Fast responses**: Optimized inference (2-5 seconds)
- **Fallback**: Automatically uses backup service if SageMaker unavailable

### Configuration (Optional)

If you want to enable SageMaker:

1. Set up AWS credentials in `.env`:
```env
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret
```

2. Deploy personality models (see `deployment/SAGEMAKER_SETUP.md`)

3. Add endpoint names to `.env`

**Note**: The terminal works perfectly without SageMaker - it will use the fallback AI service automatically.

## Tips

1. **Chat naturally** - The terminal understands natural language
2. **Use numbers** - Quick way to select from suggestions
3. **Ask follow-ups** - Conversation history is maintained per personality
4. **Try different modes** - Use `reason` for deep analysis
5. **Explore workflows** - Multi-agent collaboration features
6. **Type 'help'** - Anytime you need guidance

## Troubleshooting

### "Unknown command" errors

This shouldn't happen anymore! The terminal now:
- Recognizes greetings and casual chat
- Provides helpful suggestions
- Guides you to the right features

If you see this, try:
- Being more specific: "what can you do?"
- Using suggestions: Type a number from the options
- Asking for help: `help`

### SageMaker Not Working

The terminal will automatically fallback to the standard AI service. You'll still get great responses, they just won't be from the fine-tuned personality models.

To debug:
1. Check `.env` has AWS credentials
2. Verify endpoint names are correct
3. Check AWS console for endpoint status
4. Review browser console for errors

## Privacy & Data

- Conversations are stored locally in your browser
- SageMaker requests include recent conversation context (last 5 messages)
- No conversation data is permanently stored on AWS
- Clear history anytime with `clear` command

## Have Fun!

The Ghost Archive is designed to be intuitive and conversational. Don't overthink it - just chat naturally and explore. The terminal will guide you along the way!

Try starting with: "hello" or "what can you do?"

