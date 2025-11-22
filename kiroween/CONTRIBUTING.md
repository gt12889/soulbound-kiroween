# Contributing to Dark Productivity Suite

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm 10+
- Git
- A code editor (VS Code recommended)

### Setup Development Environment

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/dark-productivity-suite.git
   cd dark-productivity-suite
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Run tests to ensure everything works:
   ```bash
   npm test
   ```

## Development Workflow

### Branch Naming

- `feature/` - New features (e.g., `feature/tarot-spreads`)
- `fix/` - Bug fixes (e.g., `fix/navigation-bug`)
- `docs/` - Documentation updates (e.g., `docs/api-reference`)
- `refactor/` - Code refactoring (e.g., `refactor/storage-service`)
- `test/` - Test additions/updates (e.g., `test/integration-tests`)

### Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the code style guidelines

3. Write or update tests for your changes

4. Run tests to ensure nothing breaks:
   ```bash
   npm test
   ```

5. Run linting:
   ```bash
   npm run lint
   ```

6. Commit your changes with a descriptive message:
   ```bash
   git commit -m "feat: add new tarot spread layout"
   ```

### Commit Message Format

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions or updates
- `chore:` - Build process or auxiliary tool changes

Examples:
```
feat: add moon phase tooltip
fix: resolve navigation state bug
docs: update deployment instructions
refactor: simplify storage service
test: add integration tests for notes
```

### Pull Request Process

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request on GitHub

3. Fill out the PR template with:
   - Description of changes
   - Related issue numbers
   - Screenshots (if UI changes)
   - Testing performed

4. Wait for review and address any feedback

5. Once approved, your PR will be merged

## Feature Areas

The Dark Productivity Suite is organized into several feature areas:

### Core Features
- **Authentication System** - Email/password and social auth (Google, GitHub)
- **Cloud Sync** - Real-time synchronization with Firebase
- **Keyboard Shortcuts** - Customizable keyboard controls
- **Theme System** - Multiple dark themes with smooth transitions
- **Quick Capture** - Rapid note/task creation with `Ctrl+K`

### Modules
- **Necronomicon Notes** - Note-taking with markdown and AI assistance
- **Graveyard Dashboard** - Task management with visual tombstones
- **Terminal Tarot** - Git-based tarot readings
- **Ghost Writer** - AI-powered writing suggestions

### Supporting Features
- **Tag Management** - Organize notes and tasks with tags
- **Archive System** - Store completed tasks
- **Pomodoro Timer** - Focus timer with session tracking
- **Import/Export** - Data portability in multiple formats
- **Markdown Support** - Full markdown editing with live preview

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Define explicit types for function parameters and return values
- Use interfaces for object shapes
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

```typescript
// Good
interface Task {
  id: string;
  title: string;
  completed: boolean;
}

function createTask(title: string): Task {
  return {
    id: crypto.randomUUID(),
    title,
    completed: false,
  };
}

// Avoid
function doStuff(data: any): any {
  // ...
}
```

### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use CSS Modules for styling
- Follow the existing component structure

```typescript
// Good
interface Props {
  title: string;
  onComplete: () => void;
}

export function TaskItem({ title, onComplete }: Props) {
  return (
    <div className={styles.taskItem}>
      <h3>{title}</h3>
      <button onClick={onComplete}>Complete</button>
    </div>
  );
}
```

### CSS Modules

- Use CSS Modules for component styles
- Follow BEM-like naming within modules
- Maintain the gothic aesthetic
- Use CSS custom properties for theme values

```css
/* TaskItem.module.css */
.taskItem {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 1rem;
}

.taskItem__title {
  color: var(--text-primary);
  font-family: var(--font-serif);
}
```

### File Organization

- Place components in appropriate module folders
- Keep related files together (component, styles, tests)
- Use index files for clean imports
- Follow the existing structure

```
components/
└── feature-name/
    ├── FeatureName.tsx
    ├── FeatureName.module.css
    ├── FeatureName.test.tsx
    └── index.ts
```

## Testing Guidelines

### Writing Tests

- Write tests for new features
- Update tests when modifying existing features
- Aim for meaningful test coverage, not 100%
- Test user interactions, not implementation details

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem } from './TaskItem';

describe('TaskItem', () => {
  it('calls onComplete when button is clicked', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    
    render(<TaskItem title="Test Task" onComplete={onComplete} />);
    
    await user.click(screen.getByRole('button', { name: /complete/i }));
    
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## Design Guidelines

### Aesthetic Principles

- Maintain the gothic, mystical theme
- Use dark colors with high contrast
- Add subtle animations for engagement
- Ensure readability despite dark theme
- Keep the interface intuitive

### Accessibility

- Ensure sufficient color contrast
- Provide keyboard navigation
- Use semantic HTML
- Add ARIA labels where needed
- Test with screen readers

### Responsive Design

- Design mobile-first
- Test on multiple screen sizes
- Use relative units (rem, em, %)
- Ensure touch targets are adequate

## Documentation

### Code Comments

- Comment complex logic
- Explain "why" not "what"
- Keep comments up to date
- Use JSDoc for public APIs

```typescript
/**
 * Calculates the current moon phase based on date
 * Uses astronomical algorithms for accuracy
 * 
 * @param date - The date to calculate for
 * @returns Moon phase name and illumination percentage
 */
export function calculateMoonPhase(date: Date): MoonPhase {
  // Implementation...
}
```

### README Updates

- Update README for new features
- Add screenshots for UI changes
- Update installation steps if needed
- Keep examples current

## Feature-Specific Guidelines

### Authentication & Security

When working on authentication features:
- Never log passwords or tokens
- Use Firebase Auth SDK methods
- Test with multiple auth providers
- Handle session expiration gracefully
- Follow security best practices

### Cloud Sync

When working on sync features:
- Test offline functionality
- Handle conflict resolution
- Implement proper error handling
- Use optimistic updates
- Test with slow connections

### Keyboard Shortcuts

When adding shortcuts:
- Check for conflicts with existing shortcuts
- Use consistent modifier keys (Ctrl/Cmd)
- Document in KEYBOARD_SHORTCUTS.md
- Test on multiple platforms
- Provide customization option

### Themes

When modifying themes:
- Use CSS custom properties
- Test all three themes
- Ensure sufficient contrast
- Maintain gothic aesthetic
- Test in light and dark environments

### Import/Export

When working on data portability:
- Validate data structure
- Handle errors gracefully
- Support multiple formats
- Test with large datasets
- Preserve data integrity

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Check existing issues before creating new ones
- Review documentation before asking
- Include reproduction steps for bugs

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Project documentation

Thank you for contributing to the Dark Productivity Suite! 🌙
