---
inclusion: always
---

# Technology Stack & Build System

## Requirements

- **Node.js**: v20+ minimum (v22 for development - see `.nvmrc`)
- **Package Manager**: npm

## Tech Stack

- **Language**: JavaScript (ES modules and CommonJS)
- **Configuration**: YAML for agents/workflows, JSON for package config
- **CLI Framework**: Commander.js
- **Build Tools**: Custom CLI tooling in `tools/cli/`
- **Testing**: Jest, custom schema validation
- **Linting**: ESLint 9+ (flat config)
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged

## Key Libraries

- `js-yaml`: YAML parsing
- `fs-extra`: Enhanced filesystem operations
- `inquirer`: Interactive CLI prompts
- `chalk`, `boxen`, `ora`: CLI UI/UX
- `glob`: File pattern matching
- `semver`: Version management
- `zod`: Schema validation

## Common Commands

### Installation & Setup
```bash
# Install dependencies
npm install

# Install BMad to a project (v6 alpha)
npx bmad-method@alpha install

# Install BMad locally for testing
npm run install:bmad
```

### Development
```bash
# Use correct Node version
nvm use

# Run all quality checks (comprehensive - use before pushing)
npm test

# Individual test suites
npm run test:schemas        # Agent schema validation
npm run test:install        # Installation component tests
npm run validate:schemas    # YAML schema validation
npm run validate:bundles    # Web bundle integrity
```

### Code Quality
```bash
# Lint check
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format check
npm run format:check

# Auto-format all files
npm run format:fix
```

### Build & Bundle
```bash
# Bundle for web deployment
npm run bundle

# Rebundle existing bundles
npm run rebundle

# Check installation status
npm run bmad:status
```

## Code Style

- **Print Width**: 140 characters
- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Single quotes for JS, double quotes for YAML/JSON
- **Semicolons**: Required
- **Trailing Commas**: Always
- **Line Endings**: LF (Unix-style)
- **Console**: Allowed (CLI tools)
- **File Extensions**: `.yaml` (not `.yml`)

## Pre-commit Hooks

Husky automatically runs on commit:
- Auto-fixes changed files (lint-staged)
- Runs full test suite (npm test)

## CI/CD

GitHub Actions runs all quality checks in parallel on every PR.
