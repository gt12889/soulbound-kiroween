# 🎃 New Features Documentation

## Overview

This document describes the major new features and enhancements added to the Kiroween application, with a focus on the advanced AI multi-agent system and related capabilities.

---

## 🤖 Multi-Agent AI System (Ghost Archive)

### Overview

The **Ghost Archive** is a sophisticated multi-agent AI system that enables users to interact with historical personalities and specialized AI agents. Each agent has unique capabilities, reasoning modes, and voice personalities, creating an immersive and intelligent interaction experience.

### Architecture

The system uses a **hybrid AI approach** with intelligent routing:

1. **Primary AI Providers:**
   - **Hugging Face API** (for Albert Einstein)
   - **AWS SageMaker** (for specialized personality models)
   - **Gemini API** (fallback orchestrator)

2. **Agent Orchestration:**
   - Intelligent routing based on agent capabilities
   - Conversation history management
   - Context-aware responses
   - Multi-agent collaboration support

### Available Agents

#### 1. Albert Einstein 🧠
- **Era:** Early 20th Century (1879-1955)
- **Capabilities:** Physics, Mathematics, Philosophy, Science, Theory
- **Reasoning Type:** Tree-of-Thought
- **AI Model:** Hugging Face (Flask backend on Render.com)
- **Voice ID:** `onwK4e9ZLuTAKqWW03F9` (ElevenLabs)
- **Theme:** Warm amber/orange terminal aesthetic
- **Special Features:**
  - Deep theoretical thinking
  - Thought experiments
  - Philosophical approach to science

#### 2. Cleopatra 👑
- **Era:** Ancient Egypt (69-30 BCE)
- **Capabilities:** History, Politics, Leadership, Culture, Diplomacy
- **Reasoning Type:** Collaborative
- **Voice ID:** `EXAVITQu4vr4xnSDxMaL` (ElevenLabs)
- **Theme:** Regal purple/pink terminal aesthetic
- **Special Features:**
  - Strategic thinking
  - Political acumen
  - Multilingual capabilities

#### 3. Dr. Victor Frankenstein 🔬
- **Era:** Gothic Era (Early 19th Century)
- **Capabilities:** Biology, Anatomy, Ethics, Creation, Science, Debugging, Troubleshooting
- **Reasoning Type:** Chain-of-Thought
- **Voice ID:** `VR6AewLTigWG4xSOukaG` (ElevenLabs)
- **Theme:** Dark green terminal aesthetic
- **Special Features:**
  - Scientific experimentation focus
  - Ethical considerations
  - Problem-solving expertise

### Key Features

#### 1. Intelligent Agent Routing
```typescript
// Automatic routing based on agent type
if (agentId === 'einstein') {
  // Routes to Hugging Face Flask API
  return await huggingFaceEinsteinService.generateResponse(question, history);
} else if (hasSageMakerEndpoint(agentId)) {
  // Routes to AWS SageMaker
  return await sagemakerService.invokePersonality(agentId, question, history);
} else {
  // Falls back to Gemini orchestrator
  return await agentOrchestrator.routeAndExecute(request);
}
```

#### 2. Conversation History Management
- Maintains context across sessions
- Per-agent conversation history
- Automatic history pruning (keeps last 10 exchanges)
- Context-aware responses

#### 3. Multi-Agent Collaboration
- **Single Mode:** One agent responds
- **Multi Mode:** Multiple agents respond independently
- **Collaborative Mode:** Agents work together on complex tasks

#### 4. Reasoning Modes
- **Chain-of-Thought:** Step-by-step logical reasoning
- **Tree-of-Thought:** Explores multiple solution paths
- **Self-Consistency:** Validates responses through multiple attempts
- **Collaborative:** Multiple agents contribute to a unified response

### Technical Implementation

#### Service Architecture
```
ghostArchiveService
├── initialize()
│   ├── sagemakerService.initialize()
│   ├── huggingFaceEinsteinService.initialize()
│   └── agentOrchestrator.registerAgent()
├── ask(question, preferredAgents, reasoningMode)
│   ├── Check for specialized services (Hugging Face, SageMaker)
│   ├── Route to appropriate AI provider
│   ├── Update conversation history
│   └── Return response
└── getPersonalities() / getPersonality(id)
```

#### Backend Services

**Hugging Face Einstein API (Flask)**
- **Location:** `backend/einstein_api/`
- **Deployment:** Render.com
- **Model:** Hugging Face Transformers
- **Endpoint:** `/generate`
- **Features:**
  - Lazy model loading
  - CORS support
  - Conversation history support
  - Error handling and fallbacks

---

## 🎙️ ElevenLabs Voice Integration

### Overview

High-quality text-to-speech integration using ElevenLabs AI, providing natural, personality-matched voice synthesis for all agent responses.

### Features

#### 1. Personality-Based Voice Selection
Each agent automatically uses their designated ElevenLabs voice:
- **Einstein:** `onwK4e9ZLuTAKqWW03F9`
- **Cleopatra:** `EXAVITQu4vr4xnSDxMaL`
- **Frankenstein:** `VR6AewLTigWG4xSOukaG`

#### 2. Auto-Speak Functionality
- Automatically speaks new agent responses
- Configurable delay (300ms default)
- Respects user preferences

#### 3. Voice Settings
- **Provider Selection:** ElevenLabs AI or Browser TTS (fallback)
- **Voice Customization:**
  - Stability (0-1)
  - Similarity Boost (0-1)
  - Style (0-1)
  - Speaker Boost (optional)
- **API Key Management:**
  - Environment variable support (`VITE_ELEVENLABS_API_KEY`)
  - Firebase settings sync
  - LocalStorage fallback

#### 4. Text Cleaning
- Removes markdown formatting
- Strips code blocks
- Cleans special characters
- Preserves natural speech flow

### Implementation

```typescript
// Auto-set voice based on connected agent
useEffect(() => {
  if (connectedAgent && provider === 'elevenlabs') {
    const personality = getPersonality(connectedAgent);
    if (personality?.elevenLabsVoiceId) {
      setElevenLabsVoice(matchingVoice);
    }
  }
}, [connectedAgent, provider]);

// Auto-speak new responses
useEffect(() => {
  const latestAgentOutput = outputs
    .filter(output => output.type === 'agent')
    .slice(-1)[0];
  
  if (latestAgentOutput && isEnabled) {
    speak(latestAgentOutput.content, {
      elevenLabsVoiceId: personality?.elevenLabsVoiceId
    });
  }
}, [outputs, isEnabled]);
```

---

## 🔍 Deep Repository Analysis (Mystic Oracle)

### Overview

Enhanced GitHub repository analysis that provides comprehensive insights into code quality, architecture, and project health through AI-powered deep analysis.

### Features

#### 1. Repository Deep Dive
- **Project Overview:** AI-generated summary of repository purpose
- **Code Quality Metrics:**
  - Lines of code analysis
  - File complexity scoring
  - Code organization assessment
- **Architecture Analysis:**
  - Project structure evaluation
  - Design pattern detection
  - Dependency analysis
- **Tech Stack Detection:**
  - Framework identification
  - Library usage analysis
  - Technology trends

#### 2. Detailed Grading System
Seven comprehensive metrics:

1. **🔥 Activity Score (45/100)**
   - Commit frequency analysis
   - Daily average calculations
   - Work pattern recognition

2. **📅 Consistency Score (80/100)**
   - Regularity of contributions
   - Streak analysis
   - Commitment level assessment

3. **🚀 Productivity Score (63/100)**
   - Combined activity and consistency
   - Overall work output evaluation

4. **💎 Code Health (67/100)**
   - Code quality + sentiment analysis
   - Quality grade assignment

5. **📋 Communication Score (80/100)**
   - Commit message quality
   - Keyword diversity
   - Message discipline

6. **🛠️ Maintenance Score (95/100)**
   - Bug fix ratio
   - Update frequency
   - Maintenance hygiene

7. **🚀 Innovation Score (80/100)**
   - Feature development ratio
   - New additions tracking
   - Feature velocity

8. **🏗️ Technical Debt Management (80/100)**
   - Refactoring ratio
   - Optimization instances
   - Code improvement tracking

#### 3. Work Style Analysis
- **Night Owl Wizard (90/100):** Late-night creative bursts
- **Early Bird:** Morning productivity patterns
- **Consistent Contributor:** Regular work cadence

### Implementation

```typescript
// Repository analysis service
analyzeRepository(repoUrl: string): Promise<ProjectAnalysis> {
  // 1. Fetch repository file tree
  // 2. Analyze file structure
  // 3. Extract code metrics
  // 4. Detect tech stack
  // 5. Generate quality scores
  // 6. Create AI-powered summary
}
```

---

## 📊 GitHub Integration

### Overview

Comprehensive GitHub integration for tracking commit activity, visualizing contributions, and analyzing development patterns.

### Features

#### 1. GitHub OAuth Connection
- Secure Firebase GitHub authentication
- Automatic username detection
- Manual username input fallback
- Connection status persistence

#### 2. Commit Activity Heatmap
- Visual representation of commit activity
- Overlays with existing activity heatmap
- Color-coded intensity levels
- Date-based filtering

#### 3. Commit Statistics
- Total commits count
- Daily average calculations
- Most active hour detection
- Sentiment analysis
- Top keywords extraction

#### 4. Data Synchronization
- Real-time commit fetching
- Periodic refresh (with retry logic)
- Custom event system for updates
- Firestore persistence

### Implementation

```typescript
// GitHub service integration
fetchGitHubCommits(username: string): Promise<Commit[]> {
  // 1. Fetch user repositories
  // 2. Get commits for each repo
  // 3. Aggregate commit data
  // 4. Convert to heatmap format
  // 5. Merge with existing activity data
}
```

---

## 🎯 Terminal Enhancements

### Features

#### 1. Smooth Auto-Scrolling
- **Animation:** Cubic ease-out scroll animation
- **Duration:** Max 500ms, scales with distance
- **Trigger:** Automatic on new messages
- **Implementation:** `requestAnimationFrame` for smooth performance

```typescript
// Smooth scroll implementation
const animateScroll = (currentTime: number) => {
  const progress = (currentTime - startTime) / duration;
  const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
  container.scrollTop = startScroll + distance * easedProgress;
  requestAnimationFrame(animateScroll);
};
```

#### 2. Clickable Quick Options
- Converted static options to interactive buttons
- Click-to-execute functionality
- Hover and active states
- Tooltip support

#### 3. Enhanced Options Display
- Moved outside terminal container
- Improved spacing and alignment
- Better visual hierarchy
- Responsive layout

---

## 🎨 UI/UX Improvements

### Navigation Sidebar
- **Compact Design:** Reduced padding and margins
- **Quick Note:** Renamed from "Quick Capture", more subtle styling
- **Merged Sections:** "Deeds & Flames" combines achievements and streaks
- **Custom Scrollbar:** Thin purple scrollbar, visible on hover
- **Safe Area Support:** Mac notch/menu bar compatibility

### Landing Page
- **Video Background:** Full-screen `landing.mp4` integration
- **Smooth Transitions:** Gradient fades between sections
- **Animated Sections:** Scroll-controlled animations
- **Tabbed Strategy Section:** Smooth bubble animation
- **Editorial Section:** `flower.mp4` with fade effects and glowing border
- **Footer:** Complete footer with navigation and social links

### Mystic Oracle (Terminal Tarot)
- **Modern Stats Display:** Horizontal bar layout for commit statistics
- **Card-Based Reading:** Modern, readable layout
- **Improved Typography:** Better font choices, sizes, and spacing
- **Deep Analysis Toggle:** (Removed - now default)
- **Repository Deep Dive:** Comprehensive code analysis

---

## 🔧 Technical Improvements

### Build & Deployment
- **TypeScript Configuration:** Disabled unused variable warnings for production
- **Firebase Deployment:** Automated hosting deployment
- **Environment Variables:** Support for `VITE_` prefixed variables
- **Error Handling:** Comprehensive error boundaries and fallbacks

### Performance
- **Lazy Loading:** Dynamic imports for heavy modules
- **Code Splitting:** Optimized bundle sizes
- **Caching:** Voice and conversation history caching
- **Optimized Renders:** Memoization and React optimization

### Security
- **API Key Management:** Secure storage in Firebase settings
- **Environment Variables:** Production-safe configuration
- **Firestore Rules:** Updated for GitHub connection data
- **OAuth Security:** Secure GitHub authentication flow

---

## 📝 Configuration Files

### Environment Variables
```env
# ElevenLabs API Key (optional, can be set in UI)
VITE_ELEVENLABS_API_KEY=your_api_key_here

# Hugging Face API Key (for Einstein model)
HUGGINGFACE_API_KEY=your_api_key_here

# Firebase Configuration (already configured)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

### Personality Configuration
Location: `src/data/personalities.json`

Each personality includes:
- Unique ID and name
- Era and capabilities
- Reasoning type
- System prompt
- Theme configuration
- ElevenLabs voice ID
- Fragment types

---

## 🚀 Deployment

### Frontend (Firebase Hosting)
```bash
npm run build
firebase deploy --only hosting
```

### Backend (Render.com)
- **Service:** Einstein Flask API
- **Root Directory:** `kiroween/backend/einstein_api`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn app:app`

### Firestore Rules
```bash
firebase deploy --only firestore:rules
```

---

## 📚 API Endpoints

### Hugging Face Einstein API
- **Base URL:** `https://your-render-app.onrender.com`
- **Endpoint:** `POST /generate`
- **Request Body:**
  ```json
  {
    "prompt": "user question",
    "history": [
      {"role": "user", "content": "..."},
      {"role": "assistant", "content": "..."}
    ]
  }
  ```
- **Response:**
  ```json
  {
    "response": "AI generated response"
  }
  ```

### ElevenLabs API
- **Base URL:** `https://api.elevenlabs.io/v1`
- **Endpoints:**
  - `GET /voices` - List available voices
  - `POST /text-to-speech/{voice_id}` - Synthesize speech

---

## 🎯 Future Enhancements

### Planned Features
1. **Additional AI Models:** More personality-specific models
2. **Advanced Collaboration:** Real-time multi-agent discussions
3. **Voice Cloning:** Custom voice creation
4. **Enhanced Analytics:** More detailed repository insights
5. **Workflow Automation:** Agent-based task automation
6. **Context Memory:** Long-term conversation memory
7. **Agent Marketplace:** User-created personalities

---

## 📖 Additional Resources

### Documentation
- `backend/einstein_api/README.md` - Einstein API setup
- `backend/einstein_api/DEPLOYMENT_GUIDE.md` - Deployment instructions
- `backend/einstein_api/TESTING_GUIDE.md` - Testing procedures

### Code Locations
- **Ghost Archive Service:** `src/services/ghostArchiveService.ts`
- **Voice Module:** `src/hooks/useTextToSpeech.ts`
- **ElevenLabs Service:** `src/services/elevenLabsService.ts`
- **Repository Analysis:** `src/services/repositoryAnalysisService.ts`
- **GitHub Service:** `src/services/githubService.ts`
- **Terminal Display:** `src/components/terminal-tarot/ghost-archive/TerminalDisplay.tsx`

---

## 🐛 Known Issues & Limitations

1. **ElevenLabs API Key:** Must be configured for voice synthesis
2. **Hugging Face API:** Requires Render.com deployment for Einstein
3. **GitHub Rate Limits:** May affect commit fetching for large repositories
4. **Voice Quality:** Browser TTS fallback is lower quality than ElevenLabs

---

## 🤝 Contributing

When adding new features:
1. Follow the existing architecture patterns
2. Add appropriate error handling
3. Include TypeScript types
4. Update this documentation
5. Test with multiple agents
6. Ensure voice integration works

---

**Last Updated:** December 2024  
**Version:** 2.0.0  
**Status:** Production Ready ✅

