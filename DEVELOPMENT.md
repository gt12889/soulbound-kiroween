# Development Setup

## VS Code Configuration

This workspace includes VS Code settings for optimal development experience.

### Kiro Agent Configuration

The workspace has Kiro Agent MCP (Model Context Protocol) configuration enabled:

```json
{
    "kiroAgent.configureMCP": "Enabled",
    "typescript.autoClosingTags": false
}
```

**Settings Explained:**
- `kiroAgent.configureMCP`: Enables MCP tool integration within the Kiro AI assistant, allowing access to additional capabilities and context providers during development
- `typescript.autoClosingTags`: Disabled to prevent automatic closing of JSX/TSX tags, giving developers more control over tag completion in React components

## Project Structure

This workspace contains multiple projects:

- **dark-productivity-suite**: A React-based productivity application with gothic theming
- **BMAD-METHOD**: BMad-CORE collaboration framework for human-AI partnership

See individual project READMEs for specific setup instructions:
- [Dark Productivity Suite](dark-productivity-suite/README.md)
- [BMAD Method](BMAD-METHOD/README.md)

## Getting Started

1. Ensure you have Node.js v20+ installed (v22 recommended for BMAD-METHOD)
2. Navigate to the specific project directory you want to work on
3. Follow the project-specific setup instructions in their respective README files

## IDE Support

This workspace is optimized for VS Code with Kiro Agent integration. The MCP configuration provides enhanced AI assistance during development.
