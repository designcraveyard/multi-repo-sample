# Plan: App Template Factory System (v2 — revised)

## Context

The `multi-repo-sample` workspace contains three cross-platform sub-repos (Next.js, iOS, Android) with 19+ components, design tokens, Supabase auth, ChatKit, and extensive Claude automation. The goal is to turn this into a **living app template** that can spawn new projects via an orchestrated system of scripts, Claude skills, and specialized agents.

This is not a one-time scaffold — it's a factory where:
- New projects are created from the template with full parameterization
- Specialized skills handle interactive phases (product, design, schema)
- Specialized agents handle autonomous review tasks
- A project tracker keeps everything organized
- Improvements flow back upstream to the template

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│  ORCHESTRATOR: /new-project skill                        │
│  Two-phase: Quick scaffold → Deep discovery              │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│  INTERACTIVE SKILLS (run in main conversation)           │
│                                                          │
│  /product-discovery → App brief, personas, PRDs, MVP     │
│  /design-discovery  → IA, theme, wireframes, screen specs│
│  /schema-discovery  → Auto-propose → refine → apply      │
│  /build-feature     → Code gen per feature               │
│  /generate-theme    → Tailwind palette → cross-plat tokens│
└────────────────────────┬─────────────────────────────────┘
                         │ (spawn for autonomous review)
┌────────────────────────▼─────────────────────────────────┐
│  REVIEW AGENTS (fire-and-forget, no user interaction)    │
│                                                          │
│  schema-reviewer       → SQL quality before apply        │
│  screen-reviewer       → Screen completeness audit       │
│  design-consistency    → Token compliance check          │
│  automation-architect  → Generate CLAUDE.md, hooks, skills│
│  tracker-agent         → tracker.md auto-updates         │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│  SCRIPTS (Bash + jq + Node.js for theme)                 │
│                                                          │
│  scaffold.sh              → Main orchestrator            │
│  replace-params.sh        → Bulk find-replace (ordered)  │
│  rename-android-package.sh→ Dedicated Android rename     │
│  platform-select.sh       → Include/exclude platforms    │
│  config-writer.sh         → Generate .env, secrets, etc. │
│  git-init.sh              → Init repos + submodule       │
│  clean-demo-content.sh    → Strip showcase/demo screens  │
│  validate-scaffold.sh     → Post-scaffold verification   │
│  theme-generator.js       → Node.js palette → tokens     │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│  TEMPLATE REGISTRY                                       │
│                                                          │
│  scaffold.config.json → Params + replacement order       │
│  scripts/templates/   → Config file templates            │
│  scripts/palettes.json→ All Tailwind color palettes      │
│  CHANGELOG.md         → Changeset-driven versioning      │
└──────────────────────────────────────────────────────────┘
```

### Key Architecture Decision: Skills vs Agents

Claude Code **agents** are spawned as subagents — they cannot interact with the user (no `AskUserQuestion`). **Skills** run in the main conversation and can do interactive Q&A.

| Type | Used For | Can Talk to User? |
|------|----------|-------------------|
| **Skill** | Interactive workflows (product Q&A, schema refinement, design review, feature building) | Yes |
| **Agent** | Autonomous review/analysis (schema review, screen audit, token compliance, automation generation) | No — fire and forget |

This means product-architect, design-architect, schema-architect, and dev-agent are **skills**, not agents.

---

## Decisions Locked In

| Decision | Choice |
|----------|--------|
| Output path | Sibling directory (`~/Documents/GitHub/<app-name>/`) |
| Integration flow | **v2** — deferred. Focus on `/new-project` first |
| Sub-repo naming | Project-prefixed: `<name>-web`, `<name>-ios`, `<name>-android` |
| Script language | Bash + jq (theme generator = Node.js) |
| System location | `scripts/` + `.claude/skills/` in this template repo |
| Tracker format | Structured Markdown (`tracker.md`) |
| Discovery depth | Two-phase (quick scaffold → deep discovery) |
| Handoffs | File-based (skills write markdown outputs, next skill reads them) |
| Upstream flow | Guided skill (`/upstream-to-template`) |
| Figma approach | HTML + Playwright primary for wireframes. Figma MCP for reading designs. Figma CLI optional for writing to Figma (user installs separately). |
| Phase order | Product → **Design → Schema** → Automation → Dev |

---

## Execution Phases

### Phase 1: Foundation — Parameterization Registry + Scripts

**Goal:** Build the scaffolding infrastructure that copies/transforms the template into a new project.

#### 1.1 Create `scaffold.config.json`

The single source of truth for all replaceable values. Lives at repo root.

```json
{
  "version": "1.0.0",
  "parameters": {
    "identity": {
      "APP_NAME": { "description": "App display name (PascalCase)", "example": "CoolApp", "required": true },
      "APP_SLUG": { "description": "Kebab-case slug", "derived_from": "APP_NAME", "example": "cool-app" },
      "APP_DESCRIPTION": { "description": "One-line app description", "required": true },
      "GITHUB_ORG": { "description": "GitHub org/user", "default": "designcraveyard" },
      "DEVELOPER_NAME": { "description": "Developer name for file headers", "required": true }
    },
    "ios": {
      "BUNDLE_ID": { "description": "iOS bundle identifier", "derived_from": "com.<DEVELOPER_NAME>.<APP_SLUG>", "required": true },
      "TEAM_ID": { "description": "Apple Development Team ID", "required": true },
      "GOOGLE_IOS_CLIENT_ID": { "description": "Google Sign-In client ID for iOS", "required": false }
    },
    "android": {
      "PACKAGE_NAME": { "description": "Android package name", "derived_from": "com.<DEVELOPER_NAME>.<APP_SLUG_NO_DASH>", "required": true },
      "GOOGLE_WEB_CLIENT_ID": { "description": "Google Sign-In web client ID", "required": false }
    },
    "supabase": {
      "SUPABASE_PROJECT_REF": { "description": "Supabase project reference", "required": false },
      "SUPABASE_URL": { "description": "Supabase URL", "derived_from": "https://<SUPABASE_PROJECT_REF>.supabase.co" },
      "SUPABASE_ANON_KEY": { "description": "Supabase anonymous key", "required": false }
    },
    "deployment": {
      "VERCEL_URL": { "description": "Vercel deployment URL", "required": false },
      "CHATKIT_WORKFLOW_ID": { "description": "ChatKit workflow ID", "required": false }
    },
    "design": {
      "FIGMA_FILE_KEY": { "description": "Figma design file key", "required": false },
      "BRAND_PALETTE": { "description": "Tailwind palette name for brand color", "default": "zinc", "enum": ["slate","gray","zinc","neutral","stone","red","orange","amber","yellow","lime","green","emerald","teal","cyan","sky","blue","indigo","violet","purple","fuchsia","pink","rose"] },
      "NEUTRAL_PALETTE": { "description": "Tailwind palette name for neutral surfaces", "default": "neutral" },
      "CORNER_RADIUS": { "description": "Global corner radius preset", "default": "md", "enum": ["none","sm","md","lg","xl","full"] },
      "SELECTION_STYLE": { "description": "Selection components (Checkbox, Radio, Switch) use brand or neutral", "default": "brand", "enum": ["brand","neutral"] }
    },
    "platforms": {
      "INCLUDE_WEB": { "type": "boolean", "default": true },
      "INCLUDE_IOS": { "type": "boolean", "default": true },
      "INCLUDE_ANDROID": { "type": "boolean", "default": true }
    }
  },
  "replacement_priority": [
    "com.abhishekverma.multi-repo-ios",
    "com.abhishekverma.multirepo",
    "wf_69157991bfd081909cc0815050b47abf0f93481201224b4b",
    "kqxiugkmkvymoegzxoye",
    "ZtcCQT96M2dJZjU35X8uMQ",
    "225246924892-j8isof6kj43geg9j54651kt2hd5c62al",
    "lifegraph-agent.vercel.app",
    "multi-repo-nextjs",
    "multi-repo-android",
    "multi-repo-ios",
    "multi-repo-sample",
    "multi_repo_ios",
    "L6KKWH5M53",
    "designcraveyard",
    "MultiRepo",
    "abhishekverma"
  ],
  "replacement_map": {
    "com.abhishekverma.multi-repo-ios": "{{BUNDLE_ID}}",
    "com.abhishekverma.multirepo": "{{PACKAGE_NAME}}",
    "wf_69157991bfd081909cc0815050b47abf0f93481201224b4b": "{{CHATKIT_WORKFLOW_ID}}",
    "kqxiugkmkvymoegzxoye": "{{SUPABASE_PROJECT_REF}}",
    "ZtcCQT96M2dJZjU35X8uMQ": "{{FIGMA_FILE_KEY}}",
    "225246924892-j8isof6kj43geg9j54651kt2hd5c62al": "{{GOOGLE_IOS_CLIENT_ID}}",
    "lifegraph-agent.vercel.app": "{{VERCEL_URL}}",
    "multi-repo-nextjs": "{{APP_SLUG}}-web",
    "multi-repo-android": "{{APP_SLUG}}-android",
    "multi-repo-ios": "{{APP_SLUG}}-ios",
    "multi-repo-sample": "{{APP_SLUG}}",
    "multi_repo_ios": "{{APP_SLUG_UNDERSCORE}}_ios",
    "L6KKWH5M53": "{{TEAM_ID}}",
    "designcraveyard": "{{GITHUB_ORG}}",
    "MultiRepo": "{{APP_NAME}}",
    "abhishekverma": "{{DEVELOPER_NAME}}"
  },
  "demo_content_to_remove": [
    "app/components-showcase/",
    "app/editor-demo/",
    "app/input-demo/",
    "Views/ComponentsShowcaseView.swift",
    "Views/AIDemoView.swift",
    "feature/showcase/",
    "feature/editor/"
  ]
}
```

**Key fix: `replacement_priority`** — replacements run in this exact order (longest/most-specific first). This prevents `abhishekverma` from being replaced before `com.abhishekverma.multirepo`, and `multi-repo` from breaking `multi-repo-ios`.

#### 1.2 Create Shell Scripts in `scripts/`

**`scripts/scaffold.sh`** — Main orchestrator
- Reads `scaffold.config.json` via `jq`
- Takes `--name`, `--platforms`, `--output-dir` flags
- Copies template to target via `rsync` (excludes `.git/`, `node_modules/`, `.next/`, `build/`, `.gradle/`, `Pods/`)
- Calls sub-scripts in order:
  1. `replace-params.sh` (bulk text replacement, ordered)
  2. `rename-android-package.sh` (if Android included)
  3. `platform-select.sh` (remove excluded platforms)
  4. `clean-demo-content.sh` (strip showcase screens)
  5. `config-writer.sh` (generate env/secret files)
  6. `git-init.sh` (init repos)
  7. Dependency install: `cd <name>-web && npm install`
  8. `validate-scaffold.sh` (verify no leftover template strings)
- On failure at any step: print error, stop, leave partial output for debugging (no silent failures)

**`scripts/replace-params.sh`** — Ordered bulk replacement
- Reads `replacement_priority` array from config
- Iterates in priority order; for each entry, reads the target from `replacement_map`
- Uses `LC_ALL=C sed -i '' "s|$SEARCH|$REPLACE|g"` on all text files (binary files excluded via `file --mime`)
- Skips `.git/`, `node_modules/`, image files, `.woff`/`.ttf` fonts
- Resolves derived values: `APP_SLUG` from `APP_NAME` (to-lower, replace spaces with hyphens), `APP_SLUG_UNDERSCORE` (replace hyphens with underscores)

**`scripts/rename-android-package.sh`** — Dedicated Android package rename (HIGH complexity)
- Takes old package (`com.abhishekverma.multirepo`) and new package as args
- Converts dot-separated package to path segments
- Creates new directory tree under `app/src/main/java/<new/path>/`
- Moves all `.kt` files from old path to new path
- Rewrites `package` declarations in every `.kt` file
- Rewrites all `import com.abhishekverma.multirepo.*` statements
- Updates `app/build.gradle.kts` (namespace, applicationId)
- Updates `AndroidManifest.xml` (scheme, label)
- Updates `res/values/strings.xml` and `res/values/themes.xml`
- Removes old empty directory tree
- **Test: `grep -r "com.abhishekverma" <android-dir>` should return 0 matches**

**`scripts/platform-select.sh`** — Platform inclusion/exclusion
- Removes excluded platform directories entirely
- Strips platform-specific sections from root CLAUDE.md (uses sed with marker comments)
- Updates `.claude/settings.json` hooks (removes platform-specific path matchers)
- Updates `.mcp.json` if needed

**`scripts/clean-demo-content.sh`** — Strip showcase/demo content
- Reads `demo_content_to_remove` from scaffold.config.json
- Removes listed files/directories from each platform
- Removes demo route imports from navigation files (AdaptiveNavShell, ContentView, MainActivity)
- Removes demo tabs from bottom nav bar configuration

**`scripts/config-writer.sh`** — Generate config files from templates
- Reads `scripts/templates/*.template` files
- Substitutes `{{PLACEHOLDER}}` with actual values
- Writes: `.env.local` (Next.js), `Secrets.swift` (iOS), `local.properties` (Android), `supabase/config.toml`

**`scripts/git-init.sh`** — Initialize git repos
- `git init` for root and each sub-repo
- Add template as git submodule (optional, prompted)
- `git add . && git commit -m "Initial scaffold from app-template"`
- Print remote setup instructions

**`scripts/validate-scaffold.sh`** — Post-scaffold verification
- Grep for any remaining template-specific strings (`multi-repo`, `abhishekverma`, `kqxiugkmkvymoegzxoye`, `L6KKWH5M53`)
- Verify key config files exist and contain expected values
- Try `cd <name>-web && npx next build` (if web included)
- Print pass/fail summary with any remaining issues

**Files to create:**
- `scripts/scaffold.sh`
- `scripts/replace-params.sh`
- `scripts/rename-android-package.sh`
- `scripts/platform-select.sh`
- `scripts/clean-demo-content.sh`
- `scripts/config-writer.sh`
- `scripts/git-init.sh`
- `scripts/validate-scaffold.sh`

#### 1.3 Theme Generator — `scripts/theme-generator.js` (Node.js)

**Why Node.js:** Generating color palettes requires lookup tables and JSON manipulation. Bash with `jq` could work but Node is cleaner for this, and it's already in the stack.

**How it works — no color math needed:**

The current design system uses **Tailwind's predefined palettes** (zinc for brand, neutral for base). Theming = swapping which palette name maps to "brand". All 22 Tailwind palettes have pre-defined hex values at 11 shade stops (50–950). The generator is a **lookup table swap**, not a color computation.

**`scripts/palettes.json`** — contains all 22 Tailwind palettes with their hex values:
```json
{
  "zinc": { "50": "#FAFAFA", "100": "#F4F4F5", ..., "950": "#09090B" },
  "indigo": { "50": "#EEF2FF", "100": "#E0E7FF", ..., "950": "#1E1B4B" },
  "rose": { "50": "#FFF1F2", "100": "#FFE4E6", ..., "950": "#4C0519" },
  ...
}
```

**Inputs (from /new-project or /generate-theme):**
1. **Brand palette** — one of 22 Tailwind names (e.g. `indigo`, `rose`, `emerald`). Default: `zinc`
2. **Neutral palette** — one of 22 Tailwind names. Default: `neutral`
3. **Corner radius** — `none`(0) / `sm`(4px) / `md`(8px) / `lg`(12px) / `xl`(16px) / `full`(9999px). Default: `md`
4. **Selection style** — `brand` or `neutral`. Controls whether Checkbox, Radio, Switch use brand colors or neutral. Default: `brand`

**Outputs (3 files, overwritten in place):**

1. **`globals.css`** — replaces the `--color-zinc-*` primitive tokens with the chosen brand palette's hex values. Replaces `--color-neutral-*` if a different neutral is chosen. Updates `--radius-*` custom properties. Updates selection component token references if style=neutral.

2. **`DesignTokens.swift`** — replaces `Color.colorZinc*` hex literals with brand palette values. Same for neutral. Updates `cornerRadius*` values.

3. **`DesignTokens.kt`** — replaces `PrimitiveColors.colorZinc*` hex literals. Same for neutral. Updates `CornerRadius` object values.

**Also updates semantic token references** — since iOS and Android inline hex in semantic tokens (not variable references), the generator must also update the resolved hex values in:
- Swift: `adaptive(light: "#09090B", dark: "#FAFAFA")` → `adaptive(light: "#1E1B4B", dark: "#EEF2FF")` (for indigo)
- Kotlin: `Color(0xFF09090B)` → `Color(0xFF1E1B4B)` (for indigo)

This is done by maintaining a mapping of which semantic tokens reference which primitive shade, then resolving the new hex from the chosen palette.

**Corner radius presets:**
```
none: 0px / 0pt / 0.dp
sm:   4px / 4pt / 4.dp
md:   8px / 8pt / 8.dp
lg:   12px / 12pt / 12.dp
xl:   16px / 16pt / 16.dp
full: 9999px / .infinity / Int.MAX_VALUE.dp
```

**Files to create:**
- `scripts/theme-generator.js`
- `scripts/palettes.json`

---

### Phase 2: Orchestrator Skill — `/new-project`

**Skill file:** `.claude/skills/new-project/SKILL.md`

**Two-phase flow:**

#### Phase 2A: Quick Start (scaffold immediately)

Interactive Q&A (8-10 questions):
1. What's the app name? (PascalCase)
2. One-line description?
3. Which platforms? (Web / iOS / Android / All)
4. Your developer name?
5. Apple Team ID? (if iOS selected)
6. Do you have a Supabase project? (yes → ref/key, no → create later)
7. **Brand palette?** (Show Tailwind palette names with color previews: zinc, indigo, rose, emerald, etc.)
8. **Neutral palette?** (Default: neutral. Options: slate, gray, zinc, neutral, stone)
9. **Corner radius?** (none / sm / md / lg / xl / full — with visual preview)
10. **Selection component style?** (brand = colored checkboxes/switches, neutral = gray)

Then:
- Run `scripts/scaffold.sh` with all answers
- Run `node scripts/theme-generator.js` with design answers
- Initialize `tracker.md` with project metadata
- Print "Project created at `<path>`" with next steps

#### Phase 2B: Deep Discovery (after scaffold)

Prompt user: "Project scaffolded. Ready for product discovery? This defines what you're building."

If yes → invoke `/product-discovery` skill (runs in main conversation, interactive).

**Files to create:**
- `.claude/skills/new-project/SKILL.md`

---

### Phase 3: Specialist Skills & Agents

#### 3.1 Product Discovery Skill

**File:** `.claude/skills/product-discovery/SKILL.md`
**Type:** Interactive skill (runs in main conversation, can ask user questions)

**Flow:**
1. Read project's `tracker.md` for context (app name, description from scaffold)
2. Interactive Q&A:
   - What problem does this app solve? Who is it for?
   - Describe 2-3 target user types (→ personas)
   - Brainstorm features (free-form, then structure together)
   - Prioritize: Must-Have / Should-Have / Could-Have / Won't
   - Define MVP boundary
   - Any competitive apps to reference?
3. Generate outputs (file-based handoffs):
   - `docs/app-brief.md` — elevator pitch, value prop, differentiators
   - `docs/personas/<name>.md` — one file per persona
   - `docs/mvp-matrix.md` — prioritized feature table with platform columns
   - `docs/PRDs/<feature-slug>.md` — brief PRD per Must-have feature (2-3 sentences + key user stories)
4. Update `tracker.md` → Phase "Product Definition" = Complete

**`/deep-dive <feature>` skill** (invoked later, on demand):
- Reads the brief PRD for the feature
- Expands into full behavioral spec: screen-by-screen flows, data requirements, error handling, edge cases
- Updates the PRD file in place

**Files to create:**
- `.claude/skills/product-discovery/SKILL.md`
- `.claude/skills/deep-dive/SKILL.md`

#### 3.2 Design Discovery Skill

**File:** `.claude/skills/design-discovery/SKILL.md`
**Type:** Interactive skill

**This is the most complex skill. It has multiple sub-workflows, run sequentially with user checkpoints between each.**

**Sub-flow A: Information Architecture**
1. Read PRDs + personas + MVP matrix
2. Propose navigation structure (tabs, screens, flows) — ask user to approve
3. Generate screen inventory with hierarchy
4. Output: `docs/design/information-architecture.md`

**Sub-flow B: Theme & Design System**
Two paths (user picks):
- **Quick theme from palette:** Already done in scaffold (Phase 2A). Can re-run via `/generate-theme` to change.
- **Import from Figma:** Use Figma MCP `get_variable_defs` to read variables from a Figma file → run `theme-generator.js` with extracted values.

**Sub-flow C: Component Audit**
1. Read screen inventory from IA
2. Read `docs/components.md` (existing template components)
3. Map each screen to required components
4. Identify gaps: simple variant gaps → scaffold immediately, complex new components → log for later
5. Output: `docs/design/component-map.md`

**Sub-flow D: Wireframes / Screen Design**

**Primary path — HTML + Playwright:**
1. For each screen in the IA inventory:
   - Generate an HTML wireframe file using Tailwind CSS + template component styles
   - Serve locally, screenshot via Playwright MCP `browser_take_screenshot`
   - Present screenshot to user for feedback
   - Iterate based on feedback
2. Once a screen is approved:
   - Write screen spec to `docs/design/screens/<screen-name>.md`
   - Optionally push to Figma via Figma CLI (if available) or Figma MCP (if write capability becomes available)
3. Figma MCP `get_design_context` is used when reading BACK from Figma (user refined a design in Figma, agent reads it)

**Output per screen:** `docs/design/screens/<screen-name>.md`
- Screenshot or Figma node reference
- Component list with props
- Layout description (responsive: compact + regular)
- State handling: loading, empty, error, populated
- Navigation: where does this screen sit, how is it reached

4. Update `tracker.md` → Phase "Design" = Complete

**Files to create:**
- `.claude/skills/design-discovery/SKILL.md`
- `.claude/skills/generate-theme/SKILL.md`

#### 3.3 Schema Discovery Skill

**File:** `.claude/skills/schema-discovery/SKILL.md`
**Type:** Interactive skill

**Phase order fix:** This now runs AFTER design, so it knows what screens exist and what data they need.

**Flow:**
1. Read all PRDs from `docs/PRDs/`
2. Read screen specs from `docs/design/screens/` — extract data requirements per screen
3. **Auto-propose phase:**
   - Infer entities from features + screen data needs
   - Propose relationships, attributes, types
   - Generate proposed schema as annotated SQL
   - Write to `docs/schema-proposal.md`
   - Spawn `schema-reviewer` agent for quality check
4. **Interactive refinement:**
   - Present proposal with reviewer feedback
   - Walk through each entity with user
   - Adjust types, relationships, constraints, indexes
   - Discuss RLS policies per table
5. **Apply phase** (uses Supabase MCP):
   - `list_tables` — check what already exists
   - `apply_migration` — create tables one by one
   - `generate_typescript_types` — write Next.js types
   - Generate Swift model files (using `references/model-templates/swift-model.template`)
   - Generate Kotlin model files (using `references/model-templates/kotlin-model.template`)
   - `get_advisors` — security check on applied schema
6. Update `tracker.md` → Phase "Schema Design" = Complete

**Leverages existing infrastructure:**
- `supabase-schema-builder` plugin's `schema-reviewer` agent (spawned for autonomous review)
- Plugin's model templates in `references/model-templates/`
- `type-mapping.md`, `rls-patterns.md`, `trigger-patterns.md` reference docs

**Files to create:**
- `.claude/skills/schema-discovery/SKILL.md`

#### 3.4 Automation Architect Agent

**File:** `.claude/agents/automation-architect.md`
**Type:** Agent (autonomous, no user interaction — spawned by `/new-project` or manually)

**Flow:**
1. Read project's PRDs, screen specs, schema, tracker
2. Assess project complexity and feature set
3. Generate full automation suite:

**Always generated:**
- Project `CLAUDE.md` — customized for this specific app (routes, models, screens, conventions)
- `.claude/settings.json` — hooks:
  - Credential guard (from template)
  - Design token guard (from template)
  - Cross-platform reminder (updated sub-repo names)
  - Auto-lint (from template)
  - Screen-structure-guard (updated paths)
  - Project-specific hooks based on features
- `.claude/launch.json` — dev server config

**Feature-driven generation:**
- For each feature in MVP: generate a `/build-<feature>` skill stub
- If auth: auth-specific hooks
- If real-time: Supabase Realtime hooks
- `/deploy` skill for project's deployment target
- `/run-tests` skill if testing is configured

**Agent generation in child project:**
- `screen-reviewer` (with updated paths for this project)
- `feature-reviewer` (if 5+ features)

4. Update `tracker.md` → Phase "Automation Setup" = Complete

**Files to create:**
- `.claude/agents/automation-architect.md`

#### 3.5 Build Feature Skill

**File:** `.claude/skills/build-feature/SKILL.md`
**Type:** Interactive skill

**Flow (per feature):**
1. Read the feature's PRD (full spec from `/deep-dive`)
2. Read the screen spec (from design-discovery)
3. Read the schema (migration files, model files)
4. Read the component map (what components the screens need)
5. Generate implementation:
   - Web: page.tsx, components, API routes
   - iOS: View.swift, ViewModel.swift
   - Android: Screen.kt, ViewModel.kt, ScreenState.kt
6. **Review via existing hooks** — the template's PostToolUse hooks already fire:
   - `screen-structure-guard` checks component imports
   - `native-wrapper-guard` checks for raw APIs
   - `design-token-guard` blocks primitive tokens
   - `auto-lint` runs ESLint
   - `comment-enforcer` checks section headers
7. **Optional agent reviews** — user can spawn:
   - `screen-reviewer` agent for full audit
   - `design-consistency-checker` for token compliance
8. Present results, user approves → update `tracker.md`

**Invocation:** `/build-feature <feature-name>`

**Files to create:**
- `.claude/skills/build-feature/SKILL.md`

#### 3.6 Tracker Agent + Skills

**Agent file:** `.claude/agents/tracker-agent.md`
**Type:** Agent (autonomous — reads files, updates tracker.md)

**Tracker format (`tracker.md`):**

```markdown
---
project: CoolApp
created: 2026-02-27
platforms: [web, ios, android]
current_phase: design
---

# Project Tracker: CoolApp

## Phase Summary

| Phase | Status | Completion |
|-------|--------|------------|
| Product Definition | Done | 100% |
| Design | In Progress | 40% |
| Schema Design | Pending | 0% |
| Automation Setup | Pending | 0% |
| Development | Pending | 0% |

## Features

### Must Have

- [ ] **User Authentication** — Login, signup, profile
  - [x] PRD written
  - [ ] Screens designed
  - [ ] Schema applied
  - [ ] Web implementation
  - [ ] iOS implementation
  - [ ] Android implementation
  - [ ] Review passed

### Should Have

- [ ] **Feed** — Social feed with posts
  - [ ] PRD written
  ...

## Decision Log

| Date | Decision | Context | Skill/Agent |
|------|----------|---------|-------------|
| 2026-02-27 | Use bottom tabs for primary nav | IA review | /design-discovery |
| 2026-02-27 | Profiles table with RLS | Schema review | /schema-discovery |
```

**Skills:**
- `/tracker-status` — print current status summary
- `/tracker-update <feature> <task> <status>` — mark a task done

**Hook integration (in child project's settings.json, generated by automation-architect):**
- Stop hook: show tracker phase summary at session end

**Files to create:**
- `.claude/agents/tracker-agent.md`
- `.claude/skills/tracker-status/SKILL.md`
- `.claude/skills/tracker-update/SKILL.md`
- `scripts/templates/tracker.md.template`

---

### Phase 4: Upstream Flow

**Skill:** `.claude/skills/upstream-to-template/SKILL.md`

**Flow:**
1. User invokes `/upstream-to-template`
2. Ask: "What do you want to upstream?" (component / skill / hook / token update / script)
3. Run governance checklist:
   - Is it reusable across 3+ hypothetical projects?
   - Uses semantic tokens only?
   - Cross-platform parity?
   - Well-documented?
   - Tested in real project for 2+ weeks?
4. Copy files to template directory
5. Create changeset entry
6. Guide user through PR creation

**Also needed:**
- `@changesets/cli` in template repo
- `.changeset/config.json`
- `CHANGELOG.md` at template root

**Files to create:**
- `.claude/skills/upstream-to-template/SKILL.md`
- `.changeset/config.json`

---

### Phase 5: Documentation & Polish

**Files to create/update:**
- Update root `CLAUDE.md` — add scaffolding system documentation
- `docs/SCAFFOLDING.md` — comprehensive guide for the factory system
- Update `docs/ScaffoldingStrategy.md` — align with actual implementation
- `scripts/templates/`:
  - `claude-md.template` — CLAUDE.md for new projects (with `{{PLACEHOLDER}}` tokens)
  - `tracker.md.template` — initial tracker
  - `env-local.template` — Next.js `.env.local`
  - `secrets-swift.template` — iOS `Secrets.swift`
  - `local-properties.template` — Android `local.properties`
  - `mcp-json.template` — `.mcp.json` for new projects
  - `settings-json.template` — `.claude/settings.json` base hooks

---

### Phase 6 (v2 — deferred): Template Integration

**`/integrate-template`** — copy template into an existing project. Deferred because:
- Naming collisions, dependency conflicts, build system differences make this 10x harder than fresh scaffold
- Better to nail `/new-project` first, then design integration as a separate effort
- Documented as a future milestone in `docs/SCAFFOLDING.md`

---

## Pre-requisite: Template Preparation

Before building the scaffold system, prepare the template itself:

1. **Rename Xcode project** — Change `multi-repo-ios.xcodeproj` to `App.xcodeproj` with target name `App`. This eliminates the entire Xcode project renaming problem (bundle ID and team ID are still parameterized via sed, which is straightforward). The Swift module name becomes `App` instead of `multi_repo_ios`.

2. **Add marker comments** to CLAUDE.md for platform-specific sections:
   ```markdown
   <!-- PLATFORM:WEB:START -->
   ## multi-repo-nextjs
   ...
   <!-- PLATFORM:WEB:END -->
   ```
   This allows `platform-select.sh` to cleanly strip sections.

3. **Ensure all demo screens** are in predictable paths (already mostly true) and listed in `scaffold.config.json`'s `demo_content_to_remove`.

---

## File Inventory (what gets created)

### Scripts (9 files)
```
scripts/
├── scaffold.sh
├── replace-params.sh
├── rename-android-package.sh
├── platform-select.sh
├── clean-demo-content.sh
├── config-writer.sh
├── git-init.sh
├── validate-scaffold.sh
├── theme-generator.js
└── palettes.json
```

### Config (2 files)
```
scaffold.config.json
.changeset/config.json
```

### Skills (9 new skills)
```
.claude/skills/
├── new-project/SKILL.md
├── product-discovery/SKILL.md
├── design-discovery/SKILL.md
├── schema-discovery/SKILL.md
├── deep-dive/SKILL.md
├── generate-theme/SKILL.md
├── build-feature/SKILL.md
├── tracker-status/SKILL.md
├── tracker-update/SKILL.md
└── upstream-to-template/SKILL.md
```

### Agents (2 new agents)
```
.claude/agents/
├── automation-architect.md
└── tracker-agent.md
```
(schema-reviewer, screen-reviewer, design-consistency-checker already exist in template)

### Templates (8 files)
```
scripts/templates/
├── claude-md.template
├── tracker.md.template
├── env-local.template
├── secrets-swift.template
├── local-properties.template
├── mcp-json.template
├── settings-json.template
└── supabase-config.template
```

### Docs (2 files)
```
docs/SCAFFOLDING.md
docs/ScaffoldingStrategy.md (updated)
```

**Total: ~32 new files**

---

## Execution Order

| Step | What | Depends On | Complexity |
|------|------|-----------|------------|
| 0 | **Template prep:** rename Xcode project, add CLAUDE.md markers, verify demo paths | Nothing | Medium |
| 1 | `scaffold.config.json` + `palettes.json` | Step 0 | Low |
| 2 | `scripts/replace-params.sh` (with priority ordering) | Step 1 | Medium |
| 3 | `scripts/rename-android-package.sh` | Step 1 | **High** |
| 4 | `scripts/platform-select.sh` + `clean-demo-content.sh` | Step 1 | Medium |
| 5 | `scripts/config-writer.sh` + all templates | Step 1 | Medium |
| 6 | `scripts/git-init.sh` | Step 2 | Low |
| 7 | `scripts/theme-generator.js` | Step 1 | Medium |
| 8 | `scripts/scaffold.sh` (orchestrates 2-7) | Steps 2-7 | Medium |
| 9 | `scripts/validate-scaffold.sh` | Step 8 | Low |
| 10 | **TEST: Scaffold a real project, verify builds** | Step 9 | — |
| 11 | `/new-project` skill | Steps 8-9 | Medium |
| 12 | `/tracker-status` + `/tracker-update` skills + `tracker-agent` | Step 11 | Medium |
| 13 | `/product-discovery` skill | Step 11 | Medium |
| 14 | `/deep-dive` skill | Step 13 | Low |
| 15 | `/design-discovery` skill + `/generate-theme` | Step 13 | **High** |
| 16 | `/schema-discovery` skill | Step 15 | Medium |
| 17 | `automation-architect` agent | Steps 13-16 | Medium |
| 18 | `/build-feature` skill | Steps 13-17 | **High** |
| 19 | `/upstream-to-template` skill + changeset setup | Step 11 | Low |
| 20 | Documentation + CLAUDE.md updates | Steps 11-19 | Low |

**Build order:** 0→1→2→3→4→5→6→7→8→9→10→11→12→13→14→15→16→17→18→19→20

Step 10 is a critical gate — don't build skills/agents until the scaffold scripts produce a working project.

---

## Verification Plan

### Test 1: Scaffold — all platforms
```bash
cd ~/Documents/GitHub/multi-repo-sample
./scripts/scaffold.sh --name "TestApp" --platforms all --developer "testdev"
# Verify:
grep -r "multi-repo" ~/Documents/GitHub/test-app/    # → 0 matches
grep -r "abhishekverma" ~/Documents/GitHub/test-app/  # → 0 matches
grep -r "L6KKWH5M53" ~/Documents/GitHub/test-app/     # → 0 matches
cd ~/Documents/GitHub/test-app/testapp-web && npm run build
cd ~/Documents/GitHub/test-app/testapp-android && ./gradlew assembleDebug
```

### Test 2: Scaffold — iOS only
```bash
./scripts/scaffold.sh --name "MyApp" --platforms ios --developer "john"
ls ~/Documents/GitHub/my-app/  # → only myapp-ios/, no web or android dirs
grep -r "multi-repo-nextjs" ~/Documents/GitHub/my-app/CLAUDE.md  # → 0 matches
```

### Test 3: Theme — indigo brand, rounded corners
```bash
node scripts/theme-generator.js --brand indigo --neutral slate --radius lg --selection brand \
  --web ~/Documents/GitHub/test-app/testapp-web/app/globals.css \
  --ios ~/Documents/GitHub/test-app/testapp-ios/App/DesignTokens.swift \
  --android ~/Documents/GitHub/test-app/testapp-android/app/.../DesignTokens.kt
# Verify: globals.css --color-zinc-950 now has indigo-950 value (#1E1B4B)
# Verify: DesignTokens.swift surfacesBrandInteractive = adaptive(light: "#1E1B4B", dark: "#EEF2FF")
```

### Test 4: Android package rename
```bash
./scripts/rename-android-package.sh ~/Documents/GitHub/test-app/testapp-android \
  com.abhishekverma.multirepo com.testdev.testapp
grep -r "com.abhishekverma" ~/Documents/GitHub/test-app/testapp-android/  # → 0 matches
ls ~/Documents/GitHub/test-app/testapp-android/app/src/main/java/com/testdev/testapp/  # → all .kt files present
./gradlew assembleDebug  # → builds successfully
```

### Test 5: Full skill chain (after skills are built)
```bash
# In a Claude session opened at ~/Documents/GitHub/test-app/:
/product-discovery         # → creates docs/PRDs/, docs/app-brief.md, etc.
/design-discovery          # → creates docs/design/screens/, component-map.md
/schema-discovery          # → creates migrations, model files
/build-feature auth        # → generates auth screens + wiring
/tracker-status            # → shows all phases with completion %
```
