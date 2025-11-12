---
inclusion: always
---

# Project Structure

## Root Directory

```
BMAD-METHOD/
├── src/                    # Source code
├── tools/                  # CLI tools and utilities
├── test/                   # Test suites
├── docs/                   # Documentation
├── web-bundles/            # Generated web bundles (output)
├── .github/                # GitHub workflows and templates
├── .husky/                 # Git hooks
└── package.json            # Project manifest
```

## Source Structure (`src/`)

```
src/
├── core/                   # Core framework (always installed)
│   ├── agents/            # BMad Master orchestrator agent
│   ├── workflows/         # Core workflows (party-mode, etc.)
│   ├── tools/             # Shared tools
│   ├── tasks/             # Legacy tasks
│   └── _module-installer/ # Core installation config
├── modules/               # Domain-specific modules
│   ├── bmm/              # BMad Method (12 agents, 34 workflows)
│   ├── bmb/              # BMad Builder (1 agent, 7 workflows)
│   ├── bmgd/             # BMad Game Dev (specialized game dev)
│   └── cis/              # Creative Intelligence Suite (5 agents, 5 workflows)
└── utility/              # Shared utilities
    ├── models/           # Agent models and fragments
    └── templates/        # Reusable templates
```

## Module Structure

Each module follows this pattern:

```
{module}/
├── agents/                # Agent definitions (YAML source)
│   ├── {agent}.yaml      # Agent configuration
│   └── agent-manifest.csv # Agent metadata catalog
├── workflows/             # Workflow definitions
│   ├── {workflow}/
│   │   ├── workflow.yaml # Workflow configuration
│   │   └── README.md     # Workflow documentation
│   └── workflow-manifest.csv # Workflow catalog
├── tools/                 # Module-specific tools
├── data/                  # Static data files
├── templates/             # Module templates
├── _module-installer/     # Installation configuration
│   ├── install-config.yaml # Interactive config menu
│   └── platform-specifics/ # IDE-specific hooks
├── config.yaml            # Module configuration
└── README.md              # Module documentation
```

## Tools Structure (`tools/`)

```
tools/
├── cli/                   # Main CLI system
│   ├── bmad-cli.js       # CLI entry point
│   ├── commands/         # CLI commands (install, status, etc.)
│   ├── installers/       # Installation system
│   │   └── lib/
│   │       ├── core/     # Core installer logic
│   │       ├── modules/  # Module processing
│   │       └── ide/      # IDE integrations (15 handlers)
│   ├── bundlers/         # Web bundling system
│   └── lib/              # Shared compilation (YAML→XML)
├── flattener/            # Document flattening utility
└── validate-*.js         # Validation scripts
```

## Installation Output Structure

When installed to a project:

```
{project}/
├── bmad/                  # BMad installation
│   ├── core/             # Core framework
│   ├── bmm/              # Installed modules
│   ├── bmb/
│   ├── cis/
│   └── _cfg/             # Configuration & manifests
│       ├── agents/       # Agent customizations
│       ├── manifest.yaml # Installation metadata
│       ├── workflow-manifest.csv
│       ├── agent-manifest.csv
│       ├── task-manifest.csv
│       └── files-manifest.csv
└── .{ide}/               # IDE-specific artifacts
    └── ...               # Format varies by IDE
```

## Key File Types

- **Agent Definitions**: `agents/{name}.yaml` (source) → `agents/{name}.md` (compiled)
- **Workflows**: `workflows/{name}/workflow.yaml`
- **Configuration**: `config.yaml` (module config), `install-config.yaml` (installer config)
- **Manifests**: CSV files for catalogs, YAML for installation metadata
- **Fragments**: XML fragments in `src/utility/models/fragments/`
- **Customization**: `customize.yaml` files for agent overrides

## Architecture Patterns

- **Modular**: Core + pluggable modules
- **Two-Phase Compilation**: YAML source → compiled output (IDE or web)
- **Fragment System**: Reusable XML fragments for agent activation
- **Manifest-Driven**: CSV manifests drive IDE integrations
- **Update-Safe**: User customizations in `_cfg/` survive updates
- **Natural Language**: Everything is markdown/YAML (no code in core framework)
