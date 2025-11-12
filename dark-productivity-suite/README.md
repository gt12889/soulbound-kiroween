# Dark Productivity Suite

A web application that combines productivity tools with a haunting, mystical aesthetic. Built with React, TypeScript, and Vite.

## Features

- **Terminal Tarot**: Fortune telling based on git commit history
- **Ghost Writer**: AI-assisted writing with spectral suggestions
- **Necronomicon Notes**: Ancient book-styled note-taking
- **Graveyard Dashboard**: Task management with tombstones and moon phase calendar

## Tech Stack

- React 18
- TypeScript (strict mode)
- Vite
- React Router
- CSS Modules
- isomorphic-git

## Project Structure

```
src/
├── components/
│   ├── common/              # Shared components (Navigation, LoadingTransition)
│   ├── terminal-tarot/      # Terminal Tarot module
│   ├── ghost-writer/        # Ghost Writer module
│   ├── necronomicon-notes/  # Necronomicon Notes module
│   └── graveyard-dashboard/ # Graveyard Dashboard module
├── contexts/                # React contexts for state management
├── hooks/                   # Custom React hooks
├── services/                # Business logic and API services
├── types/                   # TypeScript type definitions
├── utils/                   # Utility functions
└── App.tsx                  # Main application component
```

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

The application uses:
- **Strict TypeScript** for type safety
- **CSS Modules** for scoped styling
- **React Router** for navigation
- **Gothic aesthetic** with dark color palette

## Color Palette

- Background: Deep blacks (#0a0a0a, #1a1a1a)
- Accents: Dark purples (#2d1b4e, #4a2d6e)
- Text: Off-whites and grays (#e0e0e0, #b0b0b0)
- Highlights: Ethereal blues and greens (#3d5a80, #2d4a3e)

## Typography

- Headers: "Cinzel" or "Crimson Text" (serif, gothic feel)
- Body: "Lora" or "Merriweather" (readable serif)
- Monospace: "Fira Code" or "Source Code Pro" (for Terminal Tarot)

## License

MIT
