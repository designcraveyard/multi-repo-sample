# Complete Claude Code Automation Guide

**Last Updated:** February 27, 2026

This document provides an exhaustive explanation of all Claude Code automations, plugins, skills, agents, hooks, and configuration across the multi-repo workspace.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Configuration Files](#core-configuration-files)
3. [Hook System (Automatic Validations)](#hook-system-automatic-validations)
4. [Plugins](#plugins)
5. [Workspace Skills (User-Invocable)](#workspace-skills-user-invocable)
6. [Workspace Agents (Subagents)](#workspace-agents-subagents)
7. [MCP (Model Context Protocol) Servers](#mcp-servers)
8. [Launch Configurations](#launch-configurations)
9. [Permission Settings](#permission-settings)
10. [Workflow Examples](#workflow-examples)

---

## Overview

The Claude Code automation system is built on **four layers**:

```
┌─────────────────────────────────────────┐
│   User-Invokable Skills (/command)      │  ← Interface for humans (e.g., /new-screen)
├─────────────────────────────────────────┤
│   Autonomous Agents (Task tool)          │  ← Run for complex research/validation
├─────────────────────────────────────────┤
│   Hooks (PreToolUse/PostToolUse)         │  ← Intercept & validate every edit
├─────────────────────────────────────────┤
│   Plugins + MCP Servers                  │  ← External tools (Figma, Supabase, etc.)
└─────────────────────────────────────────┘
```

**Key Numbers:**
- **2 Plugins** (OpenAI Agent Builder, Supabase Schema Builder)
- **7 Workspace Agents** (design-system-sync, screen-reviewer, schema-reviewer, etc.)
- **18 Workspace Skills** (new-screen, cross-platform-feature, figma-component-sync, etc.)
- **12+ Hook Points** (PreToolUse, PostToolUse, Stop, Notification)
- **2 MCP Servers** (playwright, context7)

---

## Core Configuration Files

### `.claude/settings.json`

**Purpose:** The **master configuration** for all hooks, validations, and safety guardrails.

**Structure:**
```json
{
  "hooks": {
    "PreToolUse": [...],     // Fire BEFORE any file write (blocking validations)
    "PostToolUse": [...],    // Fire AFTER file edit (warnings/reminders)
    "Stop": [...],           // Fire when session ends (cleanup/summary)
    "Notification": [...]    // Fire on idle state (user notifications)
  }
}
```

**12+ Hooks Implemented:**

#### PreToolUse (Blocking Validations)

1. **credential-guard** — Blocks hardcoded Supabase URLs and JWT keys
   - Pattern: `[a-z]{20}\.supabase\.co` and `eyJhbGciOi...` strings
   - Impact: **BLOCKS write** if detected
   - Message: "Use environment variables or BuildConfig instead"

2. **design-token-guard** — Blocks Primitive tokens in component files
   - Blocks: `var(--color-*)`, `Color.color*`, `PrimitiveColors.*`
   - Files affected: `.tsx`, `.swift`, `.kt` component files (not DesignTokens.swift/kt)
   - Impact: **BLOCKS write** if detected
   - Enforces: Semantic-only usage in components

3. **design-token-semantics-guard** — Blocks misuse of semantic surface tokens
   - Blocks: `BaseHighContrast` for borders, `BaseLowContrastPressed` in wrong contexts
   - Impact: **BLOCKS write** if detected
   - Rules:
     - `BaseLowContrastPressed` → **only** in Chip (active) and Button (pressed)
     - `BaseHighContrast` → **only** for higher-prominence surfaces
     - All borders/dividers → must use `Border/Default` or `Border/Muted`

4. **complex-component-clarifier** — Reminds when a file composes 2+ atomic components
   - Triggers: On new file with 2+ known atomics (Button, Badge, InputField, etc.)
   - Impact: **Non-blocking reminder**
   - Prompts: Confirm state ownership, keyboard interactions, Figma reference scope

5. **openai-agent-builder hook: api-key-guard** — Blocks API keys in OpenAI agent files
6. **openai-agent-builder hook: agent-error-handling** — Reminds on error handling patterns
7. **openai-agent-builder hook: zod-v4-check** — Blocks Zod v3 (requires v4+) in TypeScript agents
8. **supabase-schema-builder hook: migration-model-sync-reminder** — Reminds to generate models after migrations

#### PostToolUse (Non-Blocking Reminders & Auto-Fixes)

9. **auto-demo-updater** — Reminds to add component showcases to demo pages
   - Triggers: On new Web/iOS component
   - Files: `multi-repo-nextjs/app/page.tsx`, iOS ContentView counterpart

10. **auto-lint** — Auto-runs `npx eslint --fix` on `.tsx`/`.ts` after write
    - Fixes: Formatting, import sorting, unused vars (auto-corrected)
    - **Non-blocking** — runs in background, shows errors only if ESLint fails

11. **type-check** — Auto-runs `tsc --noEmit --skipLibCheck` on web TypeScript
    - **Non-blocking** — prints errors only if check fails
    - Helps catch type safety issues immediately

12. **native-wrapper-guard** — Warns when raw SwiftUI/shadcn primitives used in screens
    - Raw APIs detected:
      - **iOS:** `Picker(`, `DatePicker(`, `ProgressView(`, `.sheet(`, `.alert(`, `NavigationStack`
      - **Web:** `<Select`, `<Drawer`, `<AlertDialog`, `<Carousel`, `<Slider`
      - **Android:** `ExposedDropdownMenuBox`, `ModalBottomSheet`, `NavigationBar(`
    - Suggests: Use `App*` or `Adaptive*` wrappers instead

13. **screen-structure-guard** — Warns on new screen files missing component imports
    - Checks:
      - No `App*` component imports → "use design system components"
      - Missing metadata export (web) → "add export const metadata"
      - No navigation wiring reminder

14. **adaptive-layout-guard** — Warns when screen has no responsive layout
    - Checks:
      - **Web:** No `md:` Tailwind classes (unless marked `// responsive: N/A`)
      - **iOS:** No `horizontalSizeClass` checks (unless marked `// responsive: N/A`)
      - **Android:** No `WindowWidthSizeClass` (unless marked `// responsive: N/A`)

15. **comment-enforcer** — Reminds when component file >80 lines has <3 comment lines
    - Suggests: Add `// --- Props`, `// --- State`, `// --- Render` headers
    - Or iOS: `// MARK: - Properties`, `// MARK: - Body`, `// MARK: - Subviews`

16. **cross-platform-reminder** — Reminds to check counterparts after edit
    - Triggers: After editing `.swift`, `.tsx`, or `.kt`
    - Message: "Check counterparts in [other platforms]"

17. **design-token-sync-reminder** — Reminds to sync tokens after CSS/Swift changes
    - Triggers: After editing `globals.css` or `DesignTokens.swift`
    - Suggests: Run `/design-token-sync`

18. **markdown-editor-guard** — Warns when raw TipTap APIs used in page files
    - Raw APIs: `useEditor`, `EditorContent`
    - Suggests: Use `<MarkdownEditor>` wrapper component

#### Stop Hook (Session End)

19. **unpushed-changes-summary** — Lists repos with unpushed commits
    - Displays: A formatted box showing which repos have changes
    - Suggests: Run `/git-push` to commit/push all repos

20. **post-session-checklist** — Reminds to update docs and skills
    - Checks:
      - `docs/design-tokens.md` (new tokens?)
      - `docs/api-contracts.md` (schema changes?)
      - `CLAUDE.md` files (new conventions?)
      - `.claude/skills/` (new repeatable workflows?)
      - `.claude/agents/` (new validation needed?)

#### Notification Hook (Idle State)

21. **idle-prompt-notification** — MacOS notification when Claude is waiting for input
    - System: "Claude Code" with Ping sound

---

### `.claude/launch.json`

**Purpose:** Defines how to launch dev servers from Claude Code.

**Current Config:**
```json
{
  "configurations": [
    {
      "name": "nextjs",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 3001,
      "cwd": "multi-repo-nextjs"
    }
  ]
}
```

**Usage:**
- Click launch button in Claude Code IDE → starts `npm run dev` in `multi-repo-nextjs/`
- Auto-opens browser at `http://localhost:3001`
- Stops when session ends

---

### `.claude/settings.local.json`

**Purpose:** Local environment overrides (gitignored, not committed).

**Current Config:**
```json
{
  "permissions": {
    "allow": [
      "Bash(git pull:*)",
      "Bash(python3:*)",
      "Bash(./gradlew assembleDebug:*)",
      "Bash(cat:*)"
    ]
  },
  "enabledMcpjsonServers": ["playwright", "context7"]
}
```

**What It Does:**
- **Permissions**: Pre-approve specific Bash patterns (git pull, python3, gradlew, cat)
  - User won't be prompted for permission on these commands
- **MCP Servers**: Enables two servers:
  - `playwright` — Browser automation (screenshots, clicks, navigation)
  - `context7` — Live documentation lookup for libraries

---

## Hook System (Automatic Validations)

### How Hooks Work

**PreToolUse Hooks** (BLOCKING):
```
User calls Write/Edit
    ↓
[Hook validation runs]
    ↓
If validation fails → BLOCK write, show error message
If validation passes → Allow write to proceed
```

**PostToolUse Hooks** (NON-BLOCKING):
```
User's Write/Edit completes
    ↓
[Hook reminder runs]
    ↓
Print reminder/suggestion (doesn't block)
```

### Hook Execution Model

1. **Matcher** — Determines which tool triggers the hook
   - Examples: `"Write|Edit"` (both), `"Write"` (write only)

2. **Type** — Hook execution type
   - `"command"` — Run Python script or Bash
   - `"prompt-based"` — Ask user a question (future)

3. **Command** — Python script (inline) or `${CLAUDE_PLUGIN_ROOT}/hooks/script.py`
   - Scripts receive stdin: JSON with `tool_name`, `tool_input`, etc.
   - Exit code `0` = pass, exit code `1` = fail (PreToolUse blocks)

4. **Timeout** — Max seconds before hook times out (default 10s)

### Hook Execution Chain

When you edit a file, this happens **sequentially**:

```
File: app/components/Button/Button.tsx

1. PreToolUse: credential-guard
   ✓ No Supabase URLs? Pass

2. PreToolUse: design-token-guard
   ✓ No var(--color-*)? Pass

3. PreToolUse: design-token-semantics-guard
   ✓ No BaseHighContrast in borders? Pass

4. PreToolUse: complex-component-clarifier
   ✓ Fewer than 2 atomics? No reminder

5. Write completes ✓

6. PostToolUse: auto-demo-updater
   → "Remember to add to demo page"

7. PostToolUse: auto-lint
   → Runs ESLint --fix (fixes issues silently)

8. PostToolUse: type-check
   → Runs tsc --noEmit (shows errors if any)

9. PostToolUse: native-wrapper-guard
   ✓ Uses AppButton? No warning

10. PostToolUse: screen-structure-guard
    ✓ Is a component? Skip

... more hooks
```

**Total Time:** ~5-15 seconds (most time in linting + type-check)

---

## Plugins

Plugins are **modular packages** that bundle skills, agents, hooks, and reference docs together. They appear as a submenu in the skills list.

### 1. OpenAI Agent Builder Plugin

**Location:** `.claude/plugins/openai-agent-builder/`

**What It Does:**
- Scaffolds OpenAI Agent SDK projects (Python & TypeScript)
- Provides templates for text, voice, multi-agent, and ChatKit agents
- Guard hooks for API key safety and error handling
- Reference documentation for SDK patterns

**Structure:**
```
openai-agent-builder/
  ├── plugin.json                    # Manifest (name, version, skills/agents/hooks)
  ├── skills/
  │   ├── agent-help/
  │   │   └── SKILL.md               # Show available agent skills
  │   ├── new-text-agent/
  │   │   └── SKILL.md               # Scaffold Python/TS chat agent
  │   ├── new-voice-agent/
  │   │   └── SKILL.md               # Scaffold voice agent (Python RealtimeAgent)
  │   ├── new-multi-agent/
  │   │   └── SKILL.md               # Multi-agent orchestrator with handoffs
  │   └── new-chatkit-agent/
  │       └── SKILL.md               # ChatKit embedded UI agent
  ├── agents/
  │   ├── agent-code-reviewer.md     # Reviews agent code for SDK patterns
  │   └── agent-security-checker.md  # Audits credentials & auth
  ├── hooks/
  │   ├── api-key-guard.py           # Blocks hardcoded API keys
  │   ├── agent-error-handling.py    # Reminds on error handling
  │   ├── zod-v4-check.py            # Enforces Zod v4+ in TS agents
  │   ├── tracing-reminder.py        # Reminds on tracing/observability
  │   └── guardrails-reminder.py     # Reminds on LLM guardrails
  └── references/                    # SDK docs, patterns, templates
      ├── python-agents-sdk.md
      ├── typescript-agents-sdk.md
      ├── chatkit-patterns.md
      ├── guardrails-patterns.md
      ├── voice-patterns.md
      └── project-templates/         # 6 templates (text, voice, multi, ChatKit × 2)
```

**4 User-Invokable Skills:**
1. `/agent-help` — List all agent builder capabilities
2. `/new-text-agent` — Python or TypeScript chat agent
3. `/new-voice-agent` — Voice agent with RealtimeAgent/VoicePipeline
4. `/new-multi-agent` — Multi-agent system with triage handoffs
5. `/new-chatkit-agent` — ChatKit UI agent (basic/custom/full)

**3 Plugin Hooks:**
- **PreToolUse: api-key-guard** — Blocks hardcoded OpenAI API keys
- **PreToolUse: agent-error-handling** — Reminds on error handling patterns
- **PreToolUse: zod-v4-check** — Blocks Zod v3 (requires v4+)

**2 Plugin Agents:**
- **agent-code-reviewer** — Reviews generated agent code for SDK best practices
- **agent-security-checker** — Audits for exposed credentials/auth issues

---

### 2. Supabase Schema Builder Plugin

**Location:** `.claude/plugins/supabase-schema-builder/`

**What It Does:**
- Interactive schema design wizard for Supabase
- Onboards new team members (verify MCP, fill .env, check schema)
- Generates cross-platform models (SQL ↔ TypeScript ↔ Swift ↔ Kotlin)
- Manages migrations with MCP Supabase server

**Structure:**
```
supabase-schema-builder/
  ├── plugin.json                    # Manifest
  ├── skills/
  │   ├── supabase-onboard/
  │   │   └── SKILL.md               # New team member setup
  │   ├── schema-design/
  │   │   └── SKILL.md               # Full guided entity design wizard
  │   └── add-migration/
  │       └── SKILL.md               # Quick single-table migration
  ├── agents/
  │   └── schema-reviewer.md         # Audits schema for quality before applying
  ├── hooks/
  │   ├── migration-model-sync-reminder.py  # Reminds to generate models after migration
  │   └── model-schema-sync-reminder.py     # Reminds to check schema match after model edit
  └── references/
      ├── type-mapping.md            # SQL type → TS/Swift/Kotlin mapping
      ├── rls-patterns.md            # Row-level security patterns
      ├── trigger-patterns.md        # Trigger examples
      └── index-patterns.md          # Index recommendations
```

**3 User-Invokable Skills:**
1. `/supabase-onboard` — New team member setup (verify MCP, .env, schema)
2. `/schema-design` — Full guided wizard (entities → attributes → relationships → RLS → apply → generate models)
3. `/add-migration [description]` — Quick single-table ALTER migration with model sync

**1 Plugin Agent:**
- **schema-reviewer** — Reviews proposed schema SQL for normalization, indexes, RLS gaps, naming conventions

**2 Plugin Hooks:**
- **PreToolUse: migration-model-sync-reminder** — Fire when writing migrations (reminds to generate models)
- **PostToolUse: model-schema-sync-reminder** — Fire after editing model files (reminds to check schema)

**MCP Integration:**
- Uses `supabase-bubbleskit` MCP server
- Tools: `list_tables`, `execute_sql`, `apply_migration`, `generate_typescript_types`, `get_advisors`
- No local Supabase CLI needed at runtime

---

## Workspace Skills (User-Invocable)

Workspace skills are stored at `.claude/skills/` and appear in the skills menu. Invoke with `/skill-name` or through the skill selector.

**18 Total Workspace Skills:**

### 1. **Component System Skills**

#### `/figma-component-sync [component-name]`
- **File:** `.claude/skills/figma-component-sync/SKILL.md`
- **Purpose:** Fetch Figma component spec → generate implementation brief
- **Workflow:**
  1. Queries Figma via figma-console MCP for component details
  2. Extracts variant axes, props, token usage
  3. Generates `docs/components.md` registry entry
  4. Creates implementation brief for development
- **Use Case:** Before building an atomic component
- **Output:** Figma ↔ code mapping, variant specs, tokens needed

#### `/new-screen <description>`
- **File:** `.claude/skills/new-screen/SKILL.md`
- **Purpose:** UI-only screen scaffold on **all 3 platforms**
- **Workflow:**
  1. Takes plain-English description (e.g., "user profile screen")
  2. Creates `page.tsx` (Web), `View.swift` (iOS), `Screen.kt` (Android)
  3. Uses design system components (AppButton, AppInputField, etc.)
  4. No data layer — UI-only templates
- **Use Case:** Starting a new screen quickly
- **Output:** 3 files with responsive layout scaffolds

#### `/complex-component <name> [--pattern]`
- **File:** `.claude/skills/complex-component/SKILL.md`
- **Purpose:** Build complex UI component (2+ atomic components)
- **Workflow:**
  1. **Clarification phase:** Confirm state ownership, interactions, keyboard nav, Figma reference scope
  2. Design props/state tree with user input
  3. Implement on both platforms with full comments
- **Flags:**
  - `--pattern` — Simpler display-only pattern (skips state ownership clarification)
- **Use Case:** Building components like ListItem, StepIndicator, or complex interactive controls
- **Output:** Fully implemented component with comments on all platforms

#### `/component-audit <name>`
- **File:** `.claude/skills/component-audit/SKILL.md`
- **Purpose:** Audit a component for design token compliance, comment quality, cross-platform parity
- **Workflow:**
  1. Validates all component files exist (Web, iOS, Android)
  2. Checks token usage (no primitives in components)
  3. Verifies comment coverage (80+ line files)
  4. Checks cross-platform naming/props consistency
  5. Flags accessibility issues
- **Use Case:** Before marking a component "Done" in `docs/components.md`
- **Output:** Pass/fail report with fixes applied

#### `/validate-tokens [ComponentName | --all]`
- **File:** `.claude/skills/validate-tokens/SKILL.md`
- **Purpose:** Audit components for semantic token misuse
- **Checks:**
  - `BaseHighContrast` not used for borders/dividers
  - `BaseLowContrastPressed` only in Chip/Button pressed states
  - No primitive token leakage into component files
  - No hardcoded hex values
- **Use Case:** After editing component files
- **Output:** Token compliance report, auto-fixes violations

---

### 2. **Design System Skills**

#### `/design-token-sync`
- **File:** `.claude/skills/design-token-sync/SKILL.md`
- **Purpose:** Push CSS custom properties from `globals.css` → `DesignTokens.swift` and `DesignTokens.kt`
- **Workflow:**
  1. Reads `globals.css` (Tailwind v4 + custom properties)
  2. Parses Primitive and Semantic token names
  3. Generates Swift Color extensions in `DesignTokens.swift`
  4. Generates Kotlin SemanticColors in `DesignTokens.kt`
  5. Verifies light/dark values are defined
- **Use Case:** After adding new design tokens or colors
- **Output:** Synced token definitions across all platforms

#### `/adaptive-split-view`
- **File:** `.claude/skills/adaptive-split-view/SKILL.md`
- **Purpose:** Reference documentation for list → detail navigation
- **Content:** How to use `AdaptiveSplitView` on all 3 platforms
- **Use Case:** When building list screens with detail views
- **Output:** Best practices + code examples

---

### 3. **Cross-Platform Feature Skills**

#### `/cross-platform-feature <name>`
- **File:** `.claude/skills/cross-platform-feature/SKILL.md`
- **Purpose:** Scaffold a **complete feature on both platforms** + Supabase migration + PRD
- **Workflow:**
  1. Takes feature name (e.g., "UserProfile")
  2. Creates Supabase migration stub
  3. Generates screen pair: `page.tsx` (Web) + `View.swift` (iOS) + `Screen.kt` (Android)
  4. Adds PRD entry to `docs/PRDs/`
  5. Updates `CLAUDE.md` with feature documentation
- **Use Case:** Adding a new user-facing feature
- **Output:** Full scaffold + documentation

#### `/new-ai-agent <description>`
- **File:** `.claude/skills/new-ai-agent/SKILL.md`
- **Purpose:** Scaffold AI agent powered by OpenAI Transform/Transcribe service
- **Workflow:**
  1. Takes agent description (e.g., "voice transcription assistant")
  2. Creates TransformConfig in Supabase
  3. Generates tool handlers (serverless functions)
  4. Scaffolds UI on Web, iOS, Android
  5. Wires agent into AppWebView (iOS/Android) and ChatKit (Web)
- **Use Case:** Adding OpenAI Transform/Transcribe features
- **Output:** Agent config + handlers + 3-platform UI

---

### 4. **Authentication & Database Skills**

#### `/supabase-setup [project-ref]`
- **File:** `.claude/skills/supabase-setup/SKILL.md`
- **Purpose:** Wire Supabase client to Next.js and iOS
- **Workflow:**
  1. Takes project ref (e.g., `abcdefgh12345678`)
  2. Creates `lib/supabase/` with browser and server clients
  3. Configures Auth + RLS
  4. Sets up environment variables (.env.local)
  5. Scaffolds auth context
- **Use Case:** Initial Supabase integration
- **Output:** Supabase client layer + auth context

#### `/supabase-auth-setup`
- **File:** `.claude/skills/supabase-auth-setup/SKILL.md`
- **Purpose:** Interactive wizard for Google, Apple, Email providers
- **Workflow:**
  1. Step 1: Google Cloud Console setup (OAuth 2.0 credentials)
  2. Step 2: Apple Developer Portal (Sign in with Apple)
  3. Step 3: Supabase Dashboard (add providers, configure redirects)
  4. Step 4: Update `.env.local`, `Info.plist`, `BuildConfig`
  5. Step 5: Verify auth flow end-to-end
- **Use Case:** After initial Supabase setup
- **Output:** Fully configured auth providers

---

### 5. **Documentation & Maintenance Skills**

#### `/prd-update [feature | all]`
- **File:** `.claude/skills/prd-update/SKILL.md`
- **Purpose:** Update PRD documents and CLAUDE.md files when features change
- **Workflow:**
  1. Scans codebase for recent changes
  2. Updates `docs/PRDs/<feature>.md` with current implementation
  3. Updates root `CLAUDE.md` with new conventions/patterns
  4. Updates sub-repo `CLAUDE.md` files (multi-repo-ios, multi-repo-android)
- **Use Case:** After completing a feature
- **Output:** Updated documentation across workspace

#### `/post-session-review`
- **File:** `.claude/skills/post-session-review/SKILL.md`
- **Purpose:** Guided checklist to update docs after a session
- **Workflow:**
  1. Review what changed (modified files)
  2. Prompt: "Did you add/modify components?" → run `/component-audit`
  3. Prompt: "Did you change tokens?" → run `/design-token-sync`
  4. Prompt: "Did you add a feature?" → run `/prd-update`
  5. Summarize all changes
- **Use Case:** End of each session (or automatically run via Stop hook)
- **Output:** Updated docs + summary of changes

---

### 6. **Git & Deployment Skills**

#### `/git-push`
- **File:** `.claude/skills/git-push/SKILL.md`
- **Purpose:** Commit and push **all 4 repos** from workspace root
- **Workflow:**
  1. Check git status in each repo (workspace, nextjs, ios, android)
  2. Stage changes intelligently (skip .env, lock files, artifacts)
  3. Commit with conventional commit message
  4. Push to remote
  5. Show summary (repos pushed, commits made)
- **Use Case:** When you want to push all changes at once
- **Output:** All repos synced to remote

#### `/chatkit-setup`
- **File:** `.claude/skills/chatkit-setup/SKILL.md`
- **Purpose:** Configure OpenAI ChatKit integration interactively
- **Workflow:**
  1. Update workflow ID in `chatkit.config.json`
  2. Set theme (light/dark)
  3. Configure deployment URL (for WebView)
  4. Update iOS `AssistantView.swift` with URL
  5. Update Android `AssistantScreen.kt` with URL
- **Use Case:** When deploying ChatKit or changing configuration
- **Output:** `chatkit.config.json` updated across platforms

---

### 7. **Reference Skills (Documentation Only)**

#### `/ios-native-components`
- **File:** `.claude/skills/ios-native-components/SKILL.md`
- **Purpose:** Reference for iOS native component wrappers (AppNativePicker, AppDateTimePicker, etc.)
- **Use Case:** When writing iOS screens/features that need native pickers/sheets/alerts
- **Content:** Wrapper list, props, usage examples, styling rules

#### `/android-native-components`
- **File:** `.claude/skills/android-native-components/SKILL.md`
- **Purpose:** Reference for Android native component wrappers
- **Use Case:** When writing Android screens/features
- **Content:** Wrapper list, props, usage examples, Material 3 patterns

---

## Workspace Agents (Subagents)

Workspace agents are **autonomous specialists** that run via the `Task` tool. They don't have skills UI — Claude uses them automatically when needed.

**7 Total Workspace Agents:**

### 1. **design-system-sync**
- **File:** `.claude/agents/design-system-sync.md`
- **Purpose:** Fetch Figma design system → validate code parity
- **Workflow:**
  1. Query Figma via `figma-console` MCP server
  2. Extract all components, tokens, variables
  3. Compare with code implementations (Web, iOS, Android)
  4. Generate structured parity report
  5. Create implementation briefs for unbuilt components
- **Use Case:** When starting component builds, after Figma design changes
- **Output:** Side-by-side Figma ↔ code comparison

### 2. **cross-platform-reviewer**
- **File:** `.claude/agents/cross-platform-reviewer.md`
- **Purpose:** Compare feature parity between iOS and Next.js
- **Workflow:**
  1. Read both feature implementations
  2. Check: Same screens? Same routes? Same state? Same UI?
  3. Generate side-by-side report
  4. Flag missing screens/components on either platform
- **Use Case:** After building a feature on one platform (to check iOS/Web parity)
- **Output:** Parity report with missing items

### 3. **design-consistency-checker**
- **File:** `.claude/agents/design-consistency-checker.md`
- **Purpose:** Validate design token compliance and two-layer architecture
- **Workflow:**
  1. Scan component files for hardcoded colors, spacing, font sizes
  2. Check for token misuse (primitives in components)
  3. Verify surface tokens not used as borders
  4. Cross-platform color/spacing consistency
  5. Report violations + suggest fixes
- **Use Case:** Before component audit or design review
- **Output:** Token compliance report with fix suggestions

### 4. **complex-component-reviewer**
- **File:** `.claude/agents/complex-component-reviewer.md`
- **Purpose:** Audit complex components (2+ atoms) for quality
- **Workflow:**
  1. Verify composition correctness (state ownership)
  2. Check comment quality and section headers
  3. Validate interaction completeness (keyboard nav, accessibility)
  4. Ensure token compliance (no hardcodes)
  5. Check cross-platform parity (iOS vs Web vs Android)
  6. Cite file paths and line numbers for every issue
- **Use Case:** Before marking complex component Done in `docs/components.md`
- **Output:** Detailed code review with file:line citations

### 5. **screen-reviewer**
- **File:** `.claude/agents/screen-reviewer.md`
- **Purpose:** Review full screen/page implementation for completeness
- **Workflow:**
  1. Check state handling (loading, empty, error, populated states)
  2. Validate responsive layout (md: on web, sizeClass on iOS/Android)
  3. Verify navigation wiring (AdaptiveNavShell, AdaptiveSplitView)
  4. Audit accessibility (labels, contrast, keyboard nav)
  5. Check cross-platform parity
  6. Verify component library usage (no raw HTML/SwiftUI)
- **Use Case:** After building a screen on all platforms
- **Output:** Completeness checklist with fixes

### 6. **supabase-schema-validator**
- **File:** `.claude/agents/supabase-schema-validator.md`
- **Purpose:** Validate Swift/TypeScript models match Supabase schema
- **Workflow:**
  1. Fetch live Supabase schema (via MCP)
  2. Read model files (Swift, TypeScript, Kotlin)
  3. Compare types, nullable fields, relationships
  4. Report mismatches
  5. Suggest type corrections
- **Use Case:** After running migrations, when debugging data sync issues
- **Output:** Model ↔ schema validation report

### 7. **schema-reviewer**
- **File:** `.claude/agents/schema-reviewer.md` (also in plugin)
- **Purpose:** Audit proposed schema SQL before applying
- **Workflow:**
  1. Check normalization (no denormalization without reason)
  2. Verify indexes on FK and frequently-queried columns
  3. Audit RLS policies (public, authenticated, user-scoped)
  4. Check naming conventions (snake_case, singular table names)
  5. Flag anti-patterns (UUIDs as PK, null abuse)
  6. Suggest improvements
- **Use Case:** Before `/add-migration` or `/schema-design` applies schema
- **Output:** SQL quality report with recommendations

---

## MCP Servers

Model Context Protocol servers provide **external integrations** — tools that Claude can invoke.

### Configured MCP Servers

#### 1. **playwright** (Browser Automation)
- **Provides:** Browser control, screenshots, clicks, form filling, navigation
- **Tools:**
  - `browser_navigate` — Go to URL
  - `browser_click` — Click element
  - `browser_take_screenshot` — Screenshot viewport/element
  - `browser_fill_form` — Fill multiple form fields at once
  - `browser_type` — Type text into input
  - `browser_snapshot` — Accessibility tree snapshot
  - Many more...
- **Use Case:** When you need to show Claude a rendered website or test interactive behavior
- **Location:** `.claude/settings.local.json` enables it

#### 2. **context7** (Live Documentation Lookup)
- **Provides:** Up-to-date library documentation and code examples
- **Tools:**
  - `resolve-library-id` — Search for a library (e.g., "Next.js", "SwiftUI")
  - `query-docs` — Get documentation for a library with a specific question
- **Use Case:** When implementing with unfamiliar library APIs
- **Examples:**
  - "How do I set up authentication with JWT in Express.js?"
  - "React useEffect cleanup function examples"
- **Location:** `.claude/settings.local.json` enables it

#### 3. **supabase-bubbleskit** (Supabase Schema Interaction)
- **Provides:** Direct Supabase schema access via Supabase API
- **Tools:**
  - `list_tables` — List all tables in schema
  - `execute_sql` — Run SQL queries
  - `apply_migration` — Apply a migration file
  - `generate_typescript_types` — Generate TypeScript types from schema
  - `get_advisors` — Get PostgreSQL advisor recommendations
- **Use Case:** Used by `/schema-design`, `/add-migration` skills
- **Env Vars Needed:** `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID`

#### 4. **figma-console** (Figma Design System Integration)
- **Provides:** Fetch Figma components, tokens, and variables
- **Tools:**
  - `get_components` — List all components in file
  - `get_component_details` — Fetch variant specs, props
  - `get_tokens` — List design token collections
- **Use Case:** Used by `/figma-component-sync`, `design-system-sync` agent
- **Env Vars Needed:** `FIGMA_ACCESS_TOKEN`, `FIGMA_FILE_KEY` (bubbles-kit: `ZtcCQT96M2dJZjU35X8uMQ`)

---

## Launch Configurations

### `.claude/launch.json`

**Current Configuration:**
```json
{
  "configurations": [
    {
      "name": "nextjs",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 3001,
      "cwd": "multi-repo-nextjs"
    }
  ]
}
```

**What It Does:**
1. Click **Run** in Claude Code IDE → Launches Next.js dev server
2. Runs: `cd multi-repo-nextjs && npm run dev`
3. Auto-opens: `http://localhost:3001`
4. Stops when: Session ends or user clicks Stop

**To Add iOS Launch Config:**
```json
{
  "name": "ios",
  "runtimeExecutable": "xcodebuild",
  "runtimeArgs": ["-project", "multi-repo-ios/multi-repo-ios.xcodeproj", "-scheme", "multi-repo-ios", "-destination", "platform=iOS Simulator,name=iPhone 17"],
  "cwd": "."
}
```

**To Add Android Launch Config:**
```json
{
  "name": "android",
  "runtimeExecutable": "./gradlew",
  "runtimeArgs": ["assembleDebug"],
  "cwd": "multi-repo-android"
}
```

---

## Permission Settings

### How Permissions Work

When Claude tries to run a Bash command, three things happen:

1. **Check `.claude/settings.local.json`** → Is this in the `allow` list?
   - If yes → Auto-allow (no prompt)
   - If no → Check global settings

2. **Check global allow rules** → Is this a "safe" command category?
   - Examples: `git status`, `ls`, `npm install`
   - If yes → Auto-allow
   - If no → Prompt user

3. **If not auto-allowed, prompt user** → "This command will X. Allow? Yes/No"
   - User approves → Run command
   - User denies → Command blocked

### Current Pre-Approved Commands

From `.claude/settings.local.json`:
```
✓ Bash(git pull:*)          — All git pull commands
✓ Bash(python3:*)           — All python3 commands
✓ Bash(./gradlew:*)         — All Android gradlew commands
✓ Bash(cat:*)               — All cat commands
```

### Global Safety Rules (Built-In)

**Auto-Allowed:**
- `git status`, `git log`, `npm list`, `ls`, `cat`, `grep`
- `npx eslint --fix` (linting)
- `tsc --noEmit` (type-check)

**Blocked (Always Prompt):**
- `rm -rf`, `git reset --hard`, `git push --force`
- Deleting files, destructive operations
- Network requests (curl, wget)
- Installing global tools

**Recommended Pre-Approval:**
- If you frequently run `npm run dev`, add: `"Bash(npm run dev:*)"`
- If you frequently rebuild iOS, add: `"Bash(xcodebuild:*)"`
- If you frequently build Android, add: `"Bash(./gradlew:*)"`

---

## Workflow Examples

### Workflow 1: Building a New Atomic Component

1. **Run `/figma-component-sync Button`**
   - Fetches Figma component spec
   - Shows variants, props, token usage
   - Generates implementation brief

2. **Review output** → Understand what needs to be built

3. **Write Web component** at `app/components/Button/Button.tsx`
   - Hooks fire:
     - ✓ `credential-guard` passes
     - ✓ `design-token-guard` passes
     - ✓ `design-token-semantics-guard` passes
     - Auto-lint runs, fixes formatting
     - Type-check runs, reports errors (if any)
   - No blocking → File written

4. **Write iOS component** at `Components/Button/AppButton.swift`
   - Similar hook flow
   - `cross-platform-reminder` fires: "Check Web counterpart"

5. **Write Android component** at `ui/components/AppButton.kt`
   - Similar hook flow
   - `cross-platform-reminder` fires

6. **Run `/component-audit Button`**
   - Validates all 3 implementations
   - Checks tokens, comments, parity
   - Reports Pass/Fail

7. **Mark Done in `docs/components.md`**
   - Update Status → Done
   - Update completion date

---

### Workflow 2: Adding a Cross-Platform Feature

1. **Run `/cross-platform-feature UserProfile`**
   - Creates `app/(authenticated)/user-profile/page.tsx`
   - Creates `Views/UserProfileView.swift`
   - Creates `feature/userprofile/UserProfileScreen.kt`
   - Creates Supabase migration stub
   - Creates `docs/PRDs/UserProfile.md`

2. **Implement Web page** at `page.tsx`
   - Design 2-tier responsive layout (mobile, desktop)
   - Use design system components (AppButton, AppInputField, etc.)
   - Add data-fetching with React Server Components
   - Add `loading.tsx` and `error.tsx` for state handling
   - Hooks validate token usage, component imports

3. **Implement iOS view** at `UserProfileView.swift`
   - Design 2-tier layout (compact iPhone, regular iPad)
   - Read `@Environment(\.horizontalSizeClass)` for responsiveness
   - Use `AppButton`, `AppInputField` wrappers
   - @Observable ViewModel with async/await data fetch
   - Hooks validate native wrappers, token usage

4. **Implement Android screen** at `UserProfileScreen.kt`
   - Use `WindowWidthSizeClass` for responsive layout
   - @HiltViewModel with StateFlow<ScreenState>
   - Loading/Empty/Error/Populated state branches
   - Use AppButton, AppInputField, AppSegmentControlBar
   - Hooks validate Material 3 compliance

5. **Run `/screen-reviewer`**
   - Checks all 3 screens for state handling, nav wiring, parity
   - Reports completeness checklist

6. **Run `/prd-update UserProfile`**
   - Updates `docs/PRDs/UserProfile.md` with implementation details
   - Updates `CLAUDE.md` with new screen conventions

7. **Run `/git-push`**
   - Commits all 4 repos with feature message
   - Pushes to remote

---

### Workflow 3: Fixing a Design Token Issue

1. **User reports:** "Button colors look wrong on dark mode"

2. **Check `globals.css`** for token definition:
   ```css
   --surfaces-brand-interactive: light(#0066FF) dark(#3399FF);
   ```

3. **Edit token** in `globals.css`:
   ```css
   --surfaces-brand-interactive: light(#0066FF) dark(#4DA6FF);
   ```

4. **Hook fires:** `design-token-sync-reminder`
   - Suggests running `/design-token-sync`

5. **Run `/design-token-sync`**
   - Pushes CSS var → `DesignTokens.swift` Color extensions
   - Pushes CSS var → `DesignTokens.kt` SemanticColors
   - Generates Swift: `var appSurfacesBrandInteractive = Color(lightTheme: #0066FF, darkTheme: #4DA6FF)`
   - Generates Kotlin: `val surfacesBrandInteractive = Color(light = 0xFF0066FF, dark = 0xFF4DA6FF)`

6. **Verify** → All 3 platforms now have matching token values

---

### Workflow 4: Onboarding a New Team Member

1. **New member clones workspace** → Opens in Claude Code

2. **Run `/supabase-onboard`**
   - Verify MCP server connection works
   - Prompt: "Enter your Supabase project ref"
   - Prompt: "Enter your Supabase access token"
   - Generate `.env.local` files in each repo
   - Verify schema can be fetched
   - List all tables (sanity check)

3. **Run `/schema-design`** (optional)
   - Show current schema entities
   - Walk through adding a new table
   - Auto-generate Swift/TS/Kotlin models

4. **Run `/new-screen "Member Dashboard"`** (optional)
   - Scaffold a screen to get familiar with patterns
   - Check Web dev server works
   - Check iOS builds

---

### Workflow 5: Reviewing a Complex Component

1. **User builds `StepIndicator`** component (composes Button, Badge, Divider)

2. **Before marking Done, run `/complex-component-reviewer StepIndicator`**
   - Agent reads all 3 implementations
   - Checks:
     - State ownership clarified? (parent controls steps)
     - Keyboard nav complete? (arrow keys, Enter)
     - Comments sufficient? (// MARK: sections)
     - Tokens only semantic? (no var(--color-*))
     - Cross-platform parity? (iOS/Web/Android consistent)
   - Reports file:line citations for any issues
   - Suggests fixes

3. **Review report** → Make suggested fixes

4. **Run `/component-audit StepIndicator`** again
   - Final validation before marking Done

5. **Update `docs/components.md`**
   - Status: Done
   - Completion date

---

## Summary Table

### All Automation Components at a Glance

| Component | Type | Count | Location | Trigger |
|-----------|------|-------|----------|---------|
| **Hooks** | PreToolUse (blocking) | 8 | `.claude/settings.json` | Before every Write/Edit |
| | PostToolUse (reminders) | 9 | `.claude/settings.json` | After Write/Edit |
| | Stop (session end) | 2 | `.claude/settings.json` | On session end |
| | Notification | 1 | `.claude/settings.json` | On idle |
| **Plugins** | Supabase Schema Builder | 1 | `.claude/plugins/supabase-schema-builder/` | Manual invoke |
| | OpenAI Agent Builder | 1 | `.claude/plugins/openai-agent-builder/` | Manual invoke |
| **Skills** | Workspace Skills | 18 | `.claude/skills/` | `/command` invoke |
| | Plugin Skills | 8 | `.claude/plugins/*/skills/` | `/plugin-skill` invoke |
| **Agents** | Workspace Agents | 7 | `.claude/agents/` | Automatic via Task tool |
| | Plugin Agents | 3 | `.claude/plugins/*/agents/` | Automatic via Task tool |
| **MCP Servers** | - | 4 | Enabled in `.local.json` | Automatic |

---

## Troubleshooting

### "Hook blocked my write with credential-guard"
**Solution:** Use environment variables instead of hardcoding URLs/keys
- Web: Store in `.env.local` (gitignored)
- iOS: Store in Xcode scheme environment variables
- Android: Store in `local.properties` → `BuildConfig` fields

### "design-token-guard blocked my primitive token usage"
**Solution:** Use semantic tokens instead
- Bad: `var(--color-zinc-950)` or `Color.colorZinc950`
- Good: `var(--surfaces-brand-primary)` or `Color.surfacesBrandPrimary`
- See `docs/design-tokens.md` for mapping table

### "ESLint auto-fix is slow"
**Solution:** It's running in the background; check `.claude/settings.json` for timeout
- Default timeout: 20 seconds
- Increase timeout if you have slow machine: `"timeout": 30`

### "native-wrapper-guard keeps warning about Picker"
**Solution:** Use `AppNativePicker` wrapper instead
- iOS: `AppNativePicker(selection:options:)`
- Web: `AppNativePicker(value:options:onChange:)`
- Android: `AppNativePicker(...)`
- Wrappers apply consistent styling automatically

### "My screen has no responsive layout warning"
**Solution:** Add responsive patterns or mark as exempt
- Web: Add `md:` Tailwind classes for desktop
- iOS: Read `horizontalSizeClass` for iPad landscape
- Android: Use `WindowWidthSizeClass` for tablet layout
- Or add comment: `// responsive: N/A` if screen is intentionally single-layout

---

## Best Practices

1. **Use Skills for Repeatable Tasks**
   - Don't manually scaffold components → use `/figma-component-sync` + `/complex-component`
   - Don't manually write migrations → use `/schema-design` + `/add-migration`

2. **Let Hooks Validate Code**
   - Hooks catch 80% of issues automatically
   - Trust hook errors → they're there for a reason

3. **Run Agents for Major Reviews**
   - Before marking a component Done → run `/component-audit`
   - After building a screen → run `/screen-reviewer`
   - Before applying schema → `schema-reviewer` runs automatically

4. **Keep Docs Updated**
   - At end of session → run `/post-session-review`
   - When you add a feature → run `/prd-update`

5. **Use MCP Servers Effectively**
   - `context7` for library docs when learning new APIs
   - `playwright` for testing interactive behavior
   - `supabase-bubbleskit` for schema operations (automatic)

6. **Pre-Approve Safe Commands**
   - Add `"Bash(npm run dev:*)"` to `.local.json` to skip prompts
   - Only pre-approve commands you trust

---

## Quick Reference: Invoking Skills & Agents

### Skills (User-Invokable)

```bash
# Components
/figma-component-sync Button
/new-screen "User Profile"
/complex-component StepIndicator --pattern
/component-audit Button
/validate-tokens --all

# Design
/design-token-sync
/adaptive-split-view

# Cross-Platform
/cross-platform-feature UserProfile
/new-ai-agent "Voice Transcription Assistant"

# Auth & Database
/supabase-setup abcdef123456
/supabase-auth-setup

# Docs & Maintenance
/prd-update UserProfile
/post-session-review
/git-push
/chatkit-setup

# Reference
/ios-native-components
/android-native-components

# Plugin Skills
/agent-help
/new-text-agent
/new-voice-agent
/new-multi-agent
/new-chatkit-agent
/supabase-onboard
/schema-design
/add-migration "users table"
```

### Agents (Automatic)

Agents are invoked automatically by skills when needed, or you can call them via Task tool:

```bash
# Automatic invocation happens in:
# - /figma-component-sync → uses design-system-sync agent
# - /component-audit → uses complex-component-reviewer agent
# - /screen-reviewer invokes screen-reviewer agent
# - /schema-design → uses schema-reviewer agent

# Manual invocation (advanced):
# Use Task tool with subagent_type to explicitly run an agent
```

---

**End of Claude Automation Guide**

This workspace is now fully self-documenting. Every hook, skill, and agent is explained with examples and best practices.
