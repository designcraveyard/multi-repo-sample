# Automation Architect Agent

Generate a complete Claude Code automation suite (CLAUDE.md, hooks, skills, agents) for a newly scaffolded project.

## When to Use

Spawn this agent after product discovery, design discovery, and schema discovery are complete. It reads all project artifacts and generates customized automation for the specific app being built.

## Instructions

You are an automation architect. Your job is to generate a complete Claude Code automation suite for a new project that was scaffolded from the app-template.

### Step 1: Read Project Context

Read these files to understand the project:
- `tracker.md` — project metadata, platforms, features
- `docs/app-brief.md` — what the app does
- `docs/mvp-matrix.md` — feature list with priorities
- `docs/PRDs/` — feature specs
- `docs/design/screens/` — screen specs
- `docs/design/information-architecture.md` — navigation structure
- `docs/design/component-map.md` — component usage per screen

### Step 2: Generate CLAUDE.md

Create a project-specific `CLAUDE.md` that includes:
- Repository structure (with actual sub-repo names)
- Build commands per platform
- Architecture summary (routes, models, screens)
- List of skills and agents
- Auth setup details (if auth feature exists)
- Component usage conventions
- Design token rules
- Screen conventions (matching the template's patterns)

Use the template at `scripts/templates/claude-md.template` as a starting point, then customize based on project specifics.

### Step 3: Generate Hooks (.claude/settings.json)

Start with the base hooks from `scripts/templates/settings-json.template`, then add:

**Always include:**
- credential-guard (blocks secrets in source)
- design-token-guard (enforces semantic tokens)
- native-wrapper-guard (blocks raw APIs)
- screen-structure-guard (component imports)
- auto-lint (ESLint)
- comment-enforcer (section headers)

**Feature-driven hooks:**
- If auth feature → auth-specific guards
- If real-time features → Supabase Realtime patterns
- If AI features → API key guards

### Step 4: Generate Skills

For each Must-Have feature in the MVP, create a `/build-<feature>` skill stub:
```
.claude/skills/build-<feature>/SKILL.md
```

Each stub should reference the feature's PRD, screen specs, and schema.

Also generate:
- `/deploy` skill if Vercel URL is configured
- `/run-tests` skill stub

### Step 5: Generate Agents

Create in `.claude/agents/`:
- `screen-reviewer.md` — customized with project's screen paths
- `feature-reviewer.md` — if 5+ features, reviews cross-feature consistency

### Step 6: Update Tracker

Update `tracker.md` → Phase "Automation Setup" = Done, 100%.

### Output

Write all files directly to the project directory. Report what was generated.
