# App Template Factory — Scaffolding Guide

This document explains how the app template factory system works and how to use it.

## Overview

The `multi-repo-sample` workspace is a **living app template** that can spawn new cross-platform projects. The factory includes:

- **Scripts** that copy and transform the template into a new project
- **Skills** that guide interactive discovery phases (product, design, schema)
- **Agents** that perform autonomous reviews
- **A tracker** that keeps everything organized

## Quick Start

```bash
# From the template repo root:
./scripts/scaffold.sh --name "CoolApp" --developer "john" --platforms all
```

Or use the interactive skill in Claude Code:
```
/new-project
```

## Architecture

```
Template Repo                    Child Project
┌─────────────┐                  ┌──────────────┐
│ scaffold.sh  │ ──── copies ──→ │ cool-app/    │
│ skills/      │                  │ ├── cool-app-web/
│ agents/      │                  │ ├── cool-app-ios/
│ scripts/     │                  │ ├── cool-app-android/
│ templates/   │                  │ ├── CLAUDE.md
└─────────────┘                  │ ├── tracker.md
                                 │ └── docs/
                                 └──────────────┘
```

## Scaffold Script

### Usage

```bash
./scripts/scaffold.sh \
  --name "AppName"           # PascalCase (required)
  --developer "devname"      # Developer name (required)
  --platforms "web,ios,android"  # or "all" (default: all)
  --brand "indigo"           # Tailwind palette (default: zinc)
  --neutral "slate"          # Neutral palette (default: neutral)
  --radius "lg"              # Corner radius preset (default: md)
  --selection "brand"        # Selection style (default: brand)
  --github-org "myorg"       # GitHub org (default: designcraveyard)
  --team-id "XXXXXXXXXX"     # Apple Team ID
  --supabase-ref "abcdef"    # Supabase project ref
  --supabase-key "eyJ..."    # Supabase anon key
  --output-dir "~/Projects"  # Output parent dir (default: ~/Documents/GitHub)
```

### What It Does

1. **Copies** the template via rsync (excluding .git, node_modules, build artifacts)
2. **Replaces** all template-specific strings (ordered longest-first to avoid partial matches)
3. **Renames** Android package directory structure
4. **Removes** excluded platforms
5. **Strips** demo/showcase content
6. **Generates** config files (.env.local, Secrets.swift, local.properties)
7. **Applies** theme (if non-default palette selected)
8. **Installs** web dependencies
9. **Validates** no leftover template strings remain

### Parameterization

All replaceable values are defined in `scaffold.config.json`. The key insight is **replacement ordering** — longer strings are replaced first to prevent partial matches:

```
com.abhishekverma.multi-repo-ios  → replaced before
com.abhishekverma.multirepo       → replaced before
multi-repo-ios                    → replaced before
abhishekverma                     → replaced last
```

## Discovery Skills

After scaffolding, these skills guide you through defining what to build:

### /product-discovery
Interactive Q&A that produces:
- `docs/app-brief.md` — elevator pitch
- `docs/personas/*.md` — user personas
- `docs/mvp-matrix.md` — prioritized features
- `docs/PRDs/*.md` — brief PRDs per feature

### /deep-dive \<feature\>
Expands a brief PRD into a full behavioral spec with screen flows, data requirements, and edge cases.

### /design-discovery
Multi-phase design workflow:
1. **Information Architecture** — navigation structure, screen inventory
2. **Theme** — palette selection (or import from Figma)
3. **Component Audit** — map screens to existing components, identify gaps
4. **Screen Design** — HTML wireframes → Playwright screenshots → user approval

### /schema-discovery
Database design workflow:
1. Auto-proposes schema from PRDs + screen specs
2. Review by schema-reviewer agent
3. Interactive refinement with user
4. Apply via Supabase MCP
5. Generate cross-platform model files

### /build-feature \<name\>
Reads all specs and generates implementation code across platforms.

## Agents

| Agent | Purpose |
|-------|---------|
| `automation-architect` | Generates CLAUDE.md, hooks, skills for new project |
| `tracker-agent` | Scans artifacts, updates tracker.md completion status |
| `schema-reviewer` | Reviews SQL quality before applying |
| `screen-reviewer` | Audits screen completeness |
| `design-consistency-checker` | Checks token compliance |

## Theme Generator

Swap the color palette across all three platforms:

```bash
node scripts/theme-generator.js \
  --brand indigo \
  --neutral slate \
  --radius lg \
  --selection brand \
  --web path/to/globals.css \
  --ios path/to/DesignTokens.swift \
  --android path/to/DesignTokens.kt
```

Available palettes: slate, gray, zinc, neutral, stone, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose

## Project Tracker

Every scaffolded project gets a `tracker.md` that tracks:
- Phase completion (Product → Design → Schema → Automation → Development)
- Per-feature task checklists (PRD, design, schema, web, iOS, Android, review)
- Decision log

Use `/tracker-status` to view and `/tracker-update` to modify.

## Upstream Flow

To send improvements back to the template:

```
/upstream-to-template
```

This runs a governance checklist:
- Reusable across 3+ projects?
- Uses semantic tokens only?
- Cross-platform parity?
- Well-documented?
- Battle-tested for 2+ weeks?

## MCP Server

Build custom MCP (Model Context Protocol) servers that expose Supabase data to Claude Code and other MCP clients, with Google OAuth authentication.

### Overview

The workspace includes an MCP Server Builder plugin (`.claude/plugins/mcp-server-builder/`) and a working demo server (`mcp-server/`). The builder scaffolds a fully-wired Express + TypeScript MCP server from your Supabase tables.

### Quick Start

```
/new-mcp-server
```

This runs an 8-phase wizard:

| Phase | What Happens |
|-------|-------------|
| 1. Gather Information | Choose server name, tables, auth method (Google OAuth or API key), port |
| 2. Scaffold Project | Create directory structure with package.json, tsconfig.json, src/ |
| 3. Generate Tools | CRUD tools for each selected table (get, list, search, create, update) |
| 4. Generate Resources | Schema resource + template resource per table |
| 5. Generate Auth | Google OAuth or API key middleware |
| 6. Generate README | Setup instructions, .mcp.json snippet, tool/resource tables |
| 7. Wire .mcp.json | Add entry to workspace `.mcp.json` |
| 8. Install & Test | npm install, start server, run reviewer agent |

### Demo Server (mcp-server/)

The `mcp-server/` directory is a working reference implementation exposing the `profiles` table. Use it as a reference when building new servers or debugging issues.

Key files:
- `src/index.ts` — Express server with session management
- `src/auth.ts` — Google OAuth middleware
- `src/tools/profiles.ts` — Tool implementations
- `src/resources/profiles.ts` — Resource implementations
- `scripts/get-token.mjs` — Browser-based OAuth token acquisition

### Google OAuth Setup

MCP servers authenticate via Google ID tokens. Setup steps:

1. **Create a Google Cloud Console credential:**
   - Go to [Credentials](https://console.cloud.google.com/apis/credentials) → Create Credentials → OAuth client ID
   - Application type: **Web application** (not Android or iOS)
   - Add `http://localhost:3002/callback` to Authorized redirect URIs
   - Copy the Client ID and Client secret

2. **Configure .env:**
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

3. **Get a token for testing:**
   ```bash
   cd mcp-server
   node scripts/get-token.mjs
   # Opens browser → Google sign-in → prints ID token
   export GOOGLE_ID_TOKEN="eyJhbG..."
   ```

4. **Configure .mcp.json:**
   ```json
   {
     "mcpServers": {
       "mcp-server-profiles": {
         "type": "http",
         "url": "http://localhost:3001/mcp",
         "headers": {
           "Authorization": "Bearer ${GOOGLE_ID_TOKEN}"
         }
       }
     }
   }
   ```

**Important notes:**
- The token `audience` must match `GOOGLE_CLIENT_ID` exactly
- ID tokens expire after approximately 1 hour; re-run `get-token.mjs` to refresh
- Use the **Web application** credential type, not Android or iOS
- The SDK package is `@modelcontextprotocol/sdk` (single package, not split packages)
- When testing with curl, include `Accept: application/json, text/event-stream` header
- Use `console.error()` for all server logging (stdout is reserved for JSON-RPC framing)

### Plugin Structure

```
.claude/plugins/mcp-server-builder/
├── PLUGIN.md                    # Plugin manifest
├── skills/
│   └── new-mcp-server/SKILL.md  # 8-phase scaffold wizard
├── agents/
│   └── mcp-server-reviewer.md   # Code quality reviewer
├── hooks/
│   ├── console-log-guard.md     # Blocks console.log in MCP code
│   ├── auth-middleware-reminder.md # Checks auth on /mcp routes
│   └── mcp-json-reminder.md     # Reminds to update .mcp.json
└── references/
    ├── mcp-patterns.md          # SDK patterns, imports, tool/resource templates
    └── auth-patterns.md         # Google OAuth + API key middleware patterns
```

## File Inventory

```
scripts/
├── scaffold.sh              # Main orchestrator
├── replace-params.sh        # Ordered text replacement
├── rename-android-package.sh # Android package rename
├── platform-select.sh       # Platform include/exclude
├── clean-demo-content.sh    # Strip demo content
├── config-writer.sh         # Generate config files
├── git-init.sh              # Initialize git repos
├── validate-scaffold.sh     # Post-scaffold verification
├── theme-generator.js       # Node.js palette swapper
├── palettes.json            # All 22 Tailwind palettes
└── templates/
    ├── claude-md.template
    ├── tracker.md.template
    ├── env-local.template
    ├── secrets-swift.template
    ├── local-properties.template
    ├── mcp-json.template
    ├── settings-json.template
    └── supabase-config.template

scaffold.config.json          # Parameter registry
.changeset/config.json        # Changeset versioning

.claude/skills/
├── new-project/              # Scaffold wizard
├── product-discovery/        # Product definition
├── deep-dive/                # Feature spec expansion
├── design-discovery/         # Design workflow
├── generate-theme/           # Theme swapping
├── schema-discovery/         # Database design
├── build-feature/            # Feature implementation
├── tracker-status/           # View tracker
├── tracker-update/           # Update tracker
└── upstream-to-template/     # Send improvements back

.claude/agents/
├── automation-architect.md   # Generate automation suite
└── tracker-agent.md          # Auto-update tracker
```
