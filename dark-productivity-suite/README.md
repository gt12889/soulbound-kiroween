# 🌙 Dark Productivity Suite

> Where productivity meets the mystical. A hauntingly beautiful web application that transforms mundane tasks into an otherworldly experience.

[![Built with React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Live Demo**: [Deploy to see your demo URL here]

---

## ✨ Features

### 📖 Necronomicon Notes (with AI Ghost Writer)
Ancient wisdom meets modern note-taking with AI-powered writing assistance. Store your thoughts in a mystical tome with spectral suggestions.

- Rich text editing with improved readability
- **AI-powered writing suggestions** - Toggle ghost writer assistance on/off
- Context-aware AI suggestions that match your writing style
- Full-text search across all notes
- Tag-based organization
- Ancient book aesthetic with parchment styling
- Dripping ink animations
- Enhanced typography for comfortable reading

### ⚰️ Graveyard Dashboard
Task management with a dark twist. Watch your completed tasks rest in peace as tombstones.

- Visual task tracking with tombstone markers
- Moon phase calendar integration
- Task prioritization and categorization
- Completion animations
- Data export functionality

### 🔮 Terminal Tarot
Divine insights from your git commit history. The Terminal Tarot reads your development journey and provides mystical guidance based on your coding patterns.

- Real-time git repository analysis
- Tarot card readings based on commit history
- Terminal-style interface with retro aesthetics
- Personalized interpretations

### ⚰️ Graveyard Dashboard
Task management with a dark twist. Watch your completed tasks rest in peace as tombstones.

- Visual task tracking with tombstone markers
- Moon phase calendar integration
- Task prioritization and categorization
- Completion animations
- Data export functionality

### 🎵 Ambient Soundscapes
Immersive audio to enhance your productivity ritual.

- Multiple ambient sound options
- Volume control
- Persistent audio preferences

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 20.19+ or 22.12+
- **npm**: 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/dark-productivity-suite.git
cd dark-productivity-suite

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app in action.

### Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

---

## 🎨 Design Philosophy

The Dark Productivity Suite embraces a **gothic, mystical aesthetic** that transforms productivity tools into an immersive experience:

### Color Palette
- **Backgrounds**: Deep blacks (#0a0a0a, #1a1a1a) for maximum contrast
- **Accents**: Dark purples (#2d1b4e, #4a2d6e) for mystical touches
- **Text**: Off-whites and grays (#e0e0e0, #b0b0b0) for readability
- **Highlights**: Ethereal blues and greens (#3d5a80, #2d4a3e)

### Typography
- **Headers**: "Cinzel" or "Crimson Text" (gothic serif)
- **Body**: "Lora" or "Merriweather" (readable serif)
- **Monospace**: "Fira Code" or "Source Code Pro" (Terminal Tarot)

### Animations
- Smooth page transitions with loading states
- Ghostly hover effects
- Ambient particle effects
- Moon phase transitions

---

## 🏗️ Tech Stack

### Core
- **React 19.2** - UI framework
- **TypeScript 5.9** - Type safety (strict mode)
- **Vite 6.0** - Build tool and dev server
- **React Router 7.9** - Client-side routing

### Styling
- **CSS Modules** - Scoped component styles
- **Custom CSS** - Ambient animations and effects

### Data & Services
- **Firebase** - Authentication and cloud sync (optional)
- **isomorphic-git** - Git operations in the browser
- **LocalStorage API** - Client-side data persistence
- **Context API** - State management

### Development
- **Vitest** - Unit and integration testing
- **ESLint** - Code linting
- **TypeScript** - Static type checking

---

## 📁 Project Structure

```
dark-productivity-suite/
├── src/
│   ├── components/
│   │   ├── common/              # Shared UI components
│   │   │   ├── Navigation       # App navigation
│   │   │   ├── LoadingTransition # Page transitions
│   │   │   └── AudioController  # Ambient sound control
│   │   ├── terminal-tarot/      # Tarot reading module
│   │   ├── ghost-writer/        # Writing assistant module
│   │   ├── necronomicon-notes/  # Note-taking module
│   │   └── graveyard-dashboard/ # Task management module
│   ├── contexts/                # React contexts
│   │   ├── AppContext          # Global app state
│   │   ├── NotesContext        # Notes management
│   │   └── TasksContext        # Tasks management
│   ├── hooks/                   # Custom React hooks
│   │   ├── useLocalStorage     # Persistent state
│   │   └── useAudio            # Audio management
│   ├── services/                # Business logic
│   │   ├── storageService      # Data persistence
│   │   ├── gitService          # Git operations
│   │   ├── tarotService        # Tarot readings
│   │   ├── aiService           # AI suggestions
│   │   ├── moonPhaseService    # Moon calculations
│   │   ├── audioService        # Sound management
│   │   └── exportService       # Data export
│   ├── types/                   # TypeScript definitions
│   ├── styles/                  # Global styles
│   └── App.tsx                  # Root component
├── public/                      # Static assets
├── dist/                        # Production build (generated)
└── test/                        # Test suites
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Test Coverage
- Unit tests for services and utilities
- Integration tests for user workflows
- Component tests for UI interactions
- Browser compatibility tests
- Performance benchmarks

---

## 🔥 Firebase Integration (Optional)

Firebase support is included for cloud sync and authentication. The app works fully offline with LocalStorage - Firebase is only needed for syncing across devices.

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for complete setup instructions.

## 🚢 Deployment

The Dark Productivity Suite can be deployed to multiple platforms. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Deploy Options

**Vercel** (Recommended)
```bash
npm i -g vercel
vercel
```

**Netlify**
```bash
npm i -g netlify-cli
netlify deploy --prod
```

**GitHub Pages**
- Push to main branch
- GitHub Actions will auto-deploy

All deployment configurations are included in the repository.

---

## 🎯 Features Roadmap

- [x] Core navigation and routing
- [x] Graveyard Dashboard with task management
- [x] Necronomicon Notes with search
- [x] Ghost Writer with AI suggestions
- [x] Terminal Tarot with git integration
- [x] Moon phase calendar
- [x] Ambient audio system
- [x] Data export functionality
- [x] Production build optimization
- [x] Firebase integration (ready for cloud sync)
- [ ] Cloud sync implementation
- [ ] User authentication
- [ ] Mobile app version
- [ ] Additional tarot spreads
- [ ] Custom themes

---

## 🤝 Contributing

This project was built as part of the Kiro AI Hackathon. Contributions are welcome!

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Follow TypeScript strict mode
- Use CSS Modules for component styles
- Write tests for new features
- Maintain the gothic aesthetic

---

## 🤖 Built with Kiro AI

This project was developed using **Kiro AI**, an AI-powered development assistant that helped with:

- **Architecture Design**: Structured the modular component system
- **Code Generation**: Implemented React components and TypeScript services
- **Testing**: Created comprehensive test suites
- **Optimization**: Configured build optimization and deployment
- **Documentation**: Generated detailed documentation

Kiro AI accelerated development while maintaining code quality and best practices. The AI assistant helped transform requirements into a fully functional application with a cohesive design system.

### Kiro's Contributions
- Component scaffolding and implementation
- Service layer architecture
- State management with React Context
- CSS Modules styling system
- Integration testing setup
- Build configuration and optimization
- Deployment configuration for multiple platforms

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

### MIT License Summary

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.

---

## 🙏 Acknowledgments

- **Kiro AI** - Development assistance and code generation
- **React Team** - Amazing UI framework
- **Vite Team** - Lightning-fast build tool
- **isomorphic-git** - Git operations in the browser
- **Tarot Community** - Inspiration for the Terminal Tarot feature

---

## 📧 Contact

For questions, suggestions, or mystical inquiries:

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/dark-productivity-suite/issues)
- **Discussions**: [Join the conversation](https://github.com/yourusername/dark-productivity-suite/discussions)

---

## 🌙 May your productivity be ever mystical

*Built with 🖤 and a touch of darkness*
