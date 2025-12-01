## Inspiration
Kiroween came from wanting to make productivity tools more engaging. We asked: what if task management felt like tending a graveyard, notes felt like writing in an ancient tome, and AI assistance felt like summoning spirits?

We drew from:
* **Gothic aesthetics:** dark themes, mystical elements, atmospheric design
* **Classic productivity apps:** Notion, Todoist, Obsidian
* **Halloween culture:** spooky themes, supernatural elements
* **Game design:** visual feedback, particle effects, physics-based interactions

The goal was to build something functional and memorable—a productivity suite that users remember.

## What it does
Kiroween is a Halloween-themed productivity web app with four modules:

* **⚰️ Graveyard Dashboard** — Task management where tasks appear as tombstones:
    * Physics-based animations (wind sway, moon phase lighting)
    * Interactive "digging" to reveal task details
    * Particle effects (life energy, spirits, urgency indicators)
    * Moon phase calendar with astronomical accuracy
    * Pomodoro timer integrated with task tracking
* **✍️ Ghost Writer** — AI-powered writing assistant:
    * Context-aware suggestions powered by NVIDIA AI models
    * Cursed typewriter effect with letter-by-letter animation
    * Random cursed character transformations (1-2% probability)
    * Aged paper texture with ink splotches
    * Ghostly hand cursor that follows mouse movement
* **📖 Necronomicon Notes** — Ancient book-styled note-taking:
    * Markdown support with live preview
    * Full-text search with highlighted results
    * Tag-based organization
    * Split-view editor
    * Cursed typewriter effects
* **🔮 Terminal Tarot** — Git commit history analysis:
    * Analyzes 30 days of commit history
    * Generates three-card tarot spreads (Past, Present, Future)
    * Terminal-styled ASCII art cards
    * Personalized readings based on coding patterns

Additional features: cloud sync (Firebase), keyboard shortcuts, theme system (3 themes), import/export, ambient soundscapes, and offline support.

## How we built it
**Tech Stack**
* **Frontend:** React 19.2 + TypeScript 5.9
* **Build:** Vite 6.0
* **Styling:** CSS Modules with custom animations
* **Backend:** Firebase (Auth, Firestore, Cloud Storage)
* **AI:** NVIDIA models via OpenRouter API
* **State:** React Context API
* **Testing:** Vitest

## Kiro AI Integration
**1. Vibe Coding (Exploration Phase)**
Used natural conversation to explore ideas:
* "Make tombstones sway in wind based on priority" → Generated CSS animations with priority-based keyframes
* "Add moon phase lighting" → Implemented astronomical calculations and dynamic CSS variables
* "Create particle effects" → Built particle system with spawn logic and cleanup

**2. Spec-Driven Development (Structured Phase)**
Created specifications in `.kiro/specs/`:
* `interactive-graveyard-physics/` — Requirements, design, and implementation tasks
* `cursed-typewriter/` — Feature breakdown with user stories and technical design
* `ghost-writer-ux/` — AI assistant interface specifications

**3. Agent Hooks (Automation)**
Custom hooks in `.kiro/hooks/`:
* `auto-test-coverage.kiro.hook` — Ensures test coverage for new components
* `code-quality-analyzer.kiro.hook` — Runs ESLint and TypeScript checks
* `ghost-writer-hooks/` — Creative writing prompts and sentence completion

**4. Steering Documents (Consistency)**
Steering docs in `.kiro/steering/`:
* `product.md` — Design philosophy and UX principles
* `tech.md` — Technology stack and code style
* `structure.md` — File organization and naming conventions

## Development Process
* **Planning:** Created specs for each feature
* **Implementation:** Used vibe coding for rapid prototyping, specs for structured development
* **Quality:** Hooks automated testing and code quality checks
* **Refinement:** Iterated based on feedback and testing
* **Optimization:** Code splitting, lazy loading, performance tuning

## Key Implementation Highlights
**Physics System:**
* CSS animations with transform and opacity for GPU acceleration
* Priority-based wind sway calculations
* Moon phase lighting with CSS custom properties
* Particle system with spawn/cleanup logic
* Ghostly cursor with smooth following animation

**AI Integration:**
* Context extraction from writing
* API integration with OpenRouter
* Fallback patterns for offline mode
* Caching for performance

## Challenges we ran into
**Performance with particle effects**
* **Challenge:** Too many particles caused frame drops
* **Solution:** Particle pooling, cleanup timers, reduced particle counts, GPU-accelerated animations

**Moon phase calculations**
* **Challenge:** Accurate astronomical calculations
* **Solution:** Implemented algorithms from "Astronomical Algorithms" by Jean Meeus, validated against online calculators

**Typewriter animation timing**
* **Challenge:** Matching user typing speed while maintaining smooth animation
* **Solution:** Dynamic delay calculation based on character type, configurable speed settings

**Cursed character transformations**
* **Challenge:** Ensuring transformations don't break text flow or accessibility
* **Solution:** Brief display duration (200-500ms), proper ARIA labels, reduced motion support

**State management complexity**

## Feature enhancements
* **Integration ecosystem:** Connect with other productivity tools
* **AI model fine-tuning:** Custom model trained on writing patterns
* **Performance:** Further optimization, Web Workers for heavy computations
* **Testing:** Increase coverage, add E2E tests
* **Documentation:** Video tutorials, interactive guides
* **Internationalization:** Multi-language support

## Built with 🖤 and Kiro
