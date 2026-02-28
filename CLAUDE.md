# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a **multi-repo workspace** containing three independent projects, each with its own git repository:

- `multi-repo-nextjs/` — Next.js web application
- `multi-repo-ios/` — SwiftUI iOS application
- `multi-repo-android/` — Jetpack Compose Android application

There is no root-level git repo, package manager, or shared build system. Each project is developed independently.

<!-- PLATFORM:WEB:START -->
## multi-repo-nextjs

**Stack:** Next.js 16.1.6, React 19, TypeScript 5, Tailwind CSS v4, ESLint v9 (flat config)

### Commands

```bash
cd multi-repo-nextjs
npm run dev      # Dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint (runs `eslint` directly, flat config)
```

### Architecture

- **App Router** (`app/` directory) — no Pages Router
- `app/layout.tsx` — Root layout with Geist font family (Sans + Mono via CSS variables)
- `app/(auth)/login/page.tsx` — Login screen (public)
- `app/(authenticated)/page.tsx` — Home page (requires auth)
- `app/globals.css` — Tailwind v4 via `@import "tailwindcss"` with CSS custom properties for theming
- `middleware.ts` — Session refresh + auth gate (redirects to `/login` if unauthenticated)
- `lib/auth/` — Auth context, server actions, profile helper
- `lib/supabase/` — Browser and server Supabase clients
- Path alias: `@/*` maps to project root
- Dark mode via `prefers-color-scheme` media query and CSS variables

### Key Config Details

- Tailwind v4 uses `@tailwindcss/postcss` plugin (not the older `tailwindcss` PostCSS plugin)
- ESLint uses flat config (`eslint.config.mjs`) with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- TypeScript strict mode is enabled
- `next.config.ts` is currently empty (default config)
<!-- PLATFORM:WEB:END -->

<!-- PLATFORM:IOS:START -->
## multi-repo-ios

**Stack:** SwiftUI, Swift 5.0, iOS 26.2 deployment target

### Building and Running

Open `multi-repo-ios/multi-repo-ios.xcodeproj` in Xcode. No external dependencies (no CocoaPods, no SPM packages).

```bash
cd multi-repo-ios
xcodebuild -project multi-repo-ios.xcodeproj -scheme multi-repo-ios -destination 'platform=iOS Simulator,name=iPhone 17' build
```

### Architecture

- Single-window SwiftUI app (`@main` entry point in `multi_repo_iosApp.swift`)
- `ContentView.swift` — Main view
- Bundle ID: `com.abhishekverma.multi-repo-ios`
- Automatic code signing (Team: L6KKWH5M53)
- Modern Swift concurrency enabled (`SWIFT_APPROACHABLE_CONCURRENCY`, `MainActor` default isolation)
- No tests, networking, or state management configured yet
<!-- PLATFORM:IOS:END -->

<!-- PLATFORM:ANDROID:START -->
## multi-repo-android

**Stack:** Kotlin 2.1, Jetpack Compose, Material Design 3, Hilt 2.53.1, supabase-kt 3.2.5

### Commands

```bash
cd multi-repo-android
./gradlew assembleDebug   # Debug build
./gradlew assembleRelease  # Release build
./gradlew clean            # Clean build outputs
```

### Architecture

- Kotlin 2.1, compileSdk 36, minSdk 26, targetSdk 35
- Gradle version catalog (`gradle/libs.versions.toml`) for all dependency versions
- Compose BOM 2025.01.01 for Compose dependency management
- Hilt DI with KSP annotation processing
- Type-safe navigation via `@Serializable sealed interface Screen`
- 4-state screen pattern: `sealed interface State { Loading, Empty, Error, Populated }`
- `@HiltViewModel` with `StateFlow<State>` for reactive UI
- Two-layer design token system matching iOS/web (`PrimitiveColors` internal, `SemanticColors` public)
- `WindowWidthSizeClass` for adaptive layouts (Compact vs Medium/Expanded)

See `multi-repo-android/CLAUDE.md` for full platform details.
<!-- PLATFORM:ANDROID:END -->

---

## Claude Skills (Workspace Automation)

Invoke these in any Claude session opened at the workspace root:

| Skill | Invocation | Purpose |
|-------|-----------|---------|
| Cross-Platform Feature | `/cross-platform-feature <name>` | Scaffold a feature on all platforms + Supabase migration stub + PRD |
| Design Token Sync | `/design-token-sync` | Sync `globals.css` → `DesignTokens.swift` → `DesignTokens.kt` (+ optional Figma push) |
| Figma Component Sync | `/figma-component-sync [component]` | Sync Figma → `docs/components.md` registry; generate implementation brief for **atomic** components |
| Complex Component | `/complex-component <name>` | Build a complex component (2+ atoms): clarification → design → implement |
| Component Audit | `/component-audit <name>` | Audit for token compliance, comments, parity, accessibility |
| Token Validation | `/validate-tokens [name\|--all]` | Audit for semantic token misuse, primitive leakage, hardcoded values |
| Supabase Setup | `/supabase-setup [project-ref]` | Wire Supabase client to all platforms |
| Supabase Auth Setup | `/supabase-auth-setup` | Configure Google/Apple/Email auth providers |
| Schema Design | `/schema-design` | Full guided entity design wizard with cross-platform model generation |
| Add Migration | `/add-migration [description]` | Quick migration with model sync |
| New Screen | `/new-screen <description>` | UI-only screen scaffold on all platforms |
| PRD Update | `/prd-update [feature\|all]` | Update PRDs and CLAUDE.md files |
| Git Push | `/git-push` | Commit and push all repos from workspace root |
| New AI Agent | `/new-ai-agent <description>` | Scaffold AI agent config + tool handlers + UI |
| Post-Session Review | `/post-session-review` | Guided checklist to update docs, skills, agents |
| **MCP Server Builder** | | |
| New MCP Server | `/new-mcp-server` | Scaffold a new MCP server from Supabase tables with auth |
| **App Template Factory** | | |
| New Project | `/new-project` | Interactive scaffold wizard — create a new app from this template |
| Product Discovery | `/product-discovery` | Define personas, features, MVP scope → PRDs |
| Deep Dive | `/deep-dive <feature>` | Expand a brief PRD into full behavioral spec |
| Design Discovery | `/design-discovery` | IA, theme, component audit, wireframes → screen specs |
| Generate Theme | `/generate-theme` | Swap Tailwind color palette across all platforms + push to Figma |
| Schema Discovery | `/schema-discovery` | Auto-propose schema, refine, apply via Supabase MCP |
| Build Feature | `/build-feature <name>` | Implement a feature across all platforms from specs |
| Tracker Status | `/tracker-status` | Show project progress summary |
| Tracker Update | `/tracker-update <feature> <task>` | Mark a task complete in tracker |
| Sync from Template | `/sync-from-template` | Pull template improvements into a scaffolded child project |
| Upstream to Template | `/upstream-to-template` | Send improvements back to the template repo |

## Subagents

| Agent | Purpose |
|-------|---------|
| `cross-platform-reviewer` | Side-by-side parity report: what's missing on web vs iOS vs Android |
| `design-consistency-checker` | Flags hardcoded values, token mismatches, two-layer architecture violations |
| `design-system-sync` | Fetches Figma components/tokens via MCP, validates code parity |
| `complex-component-reviewer` | Reviews complex components for composition, comments, interactions, parity |
| `supabase-schema-validator` | Validates Swift/Kotlin models and TS types match live Supabase schema |
| `schema-reviewer` | Reviews schema for normalization, indexes, RLS gaps, naming conventions |
| `screen-reviewer` | Reviews screens for state handling, navigation, accessibility, parity |
| `automation-architect` | Generates CLAUDE.md, hooks, skills, agents for scaffolded projects |
| `tracker-agent` | Scans project artifacts and updates tracker.md completion status |
| `mcp-server-reviewer` | Reviews MCP server directories for SDK patterns, auth, Supabase safety, logging |

## Plugins

**OpenAI Agent Builder** (`.claude/plugins/openai-agent-builder/`): `/agent-help`, `/new-text-agent`, `/new-voice-agent`, `/new-multi-agent`, `/new-chatkit-agent`. Includes code-reviewer and security-checker subagents.

**Supabase Schema Builder** (`.claude/plugins/supabase-schema-builder/`): `/supabase-onboard`, `/schema-design`, `/add-migration`. Uses Supabase MCP for all schema operations.

**MCP Server Builder** (`.claude/plugins/mcp-server-builder/`): `/new-mcp-server` (8-phase scaffold wizard). Includes `mcp-server-reviewer` agent. Advisory hooks: `console-log-guard`, `auth-middleware-reminder`, `mcp-json-reminder`. Working demo at `mcp-server/`.

## Shared Documentation

| File | Purpose |
|------|---------|
| `docs/components.md` | Component registry: Figma ↔ code mapping, variant specs, implementation status |
| `docs/design-tokens.md` | Canonical token reference (CSS var ↔ Swift ↔ Kotlin, light/dark values) |
| `docs/api-contracts.md` | Supabase table shapes, type mapping rules, RLS conventions |
| `docs/PRDs/` | Per-feature product requirement documents |
| `docs/SCAFFOLDING.md` | Full guide for the app template factory system |

## App Template Factory

This repo doubles as a **living app template**. Run `/new-project` to scaffold a new cross-platform app.

**Discovery flow:** `/new-project` → `/product-discovery` → `/design-discovery` → `/schema-discovery` → `/build-feature`

See `docs/SCAFFOLDING.md` for the complete guide and `scaffold.config.json` for parameter registry.

## Figma CLI (figma-ds-cli)

Local CLI at `figma-cli/` — controls Figma Desktop directly (no API key needed). Complements the Figma MCP server (which **reads** from Figma) by **writing back** to Figma.

```bash
cd figma-cli && npm install   # First time only
node src/index.js connect     # Connect to Figma Desktop (yolo mode)
```

| Task | Command |
|------|---------|
| Push shadcn tokens (primitives + semantic) | `node src/index.js tokens preset shadcn` |
| Push Tailwind palette (primitives only) | `node src/index.js tokens tailwind` |
| Visualize variables on canvas | `node src/index.js var visualize` |
| List variables | `node src/index.js var list` |
| Render frame/component | `node src/index.js render '<Frame ...>'` |
| Batch render | `node src/index.js render-batch '[...]'` |
| Convert to component | `node src/index.js node to-component "ID"` |
| Export as PNG/SVG | `node src/index.js export png` |
| Find nodes by name | `node src/index.js find "Name"` |
| Recreate URL in Figma | `node src/index.js recreate-url "URL"` |

**Key rule:** Use `render` (not `eval`) for frames — it has smart positioning. See `figma-cli/CLAUDE.md` for full JSX syntax and component creation patterns.

**Workflow integration:** After `/design-token-sync` or `/generate-theme`, use `tokens preset shadcn` to push updated tokens back to Figma. After implementing components, use `render` + `node to-component` to create matching Figma components.

## Supabase

Migrations live at workspace root in `supabase/migrations/` (shared infrastructure, not inside either sub-repo).

```bash
supabase start                    # Start local stack (requires Docker)
supabase db push                  # Apply pending migrations to linked project
supabase gen types typescript --linked > multi-repo-nextjs/lib/database.types.ts
supabase migration new <name>     # Create a new migration file
```

## Authentication

All three platforms use Supabase Auth with an **auth gate** pattern — unauthenticated users see only the login screen.

**Providers:** Google (native SDK on mobile, OAuth redirect on web), Apple (native on iOS, OAuth on web), Email/Password

**Auth gate entry points:** Web `middleware.ts` → iOS `multi_repo_iosApp.swift` → Android `MainActivity.kt`

**Key files:** Web: `lib/auth/actions.ts`, `lib/auth/auth-context.tsx`, `middleware.ts`, `app/auth/callback/route.ts`. iOS: `Auth/AuthManager.swift`, `Views/Auth/LoginView.swift`. Android: `data/auth/AuthRepository.kt`, `feature/auth/LoginScreen.kt`.

**Profile:** Auto-created via DB trigger. Models: `lib/auth/profile.ts` (web), `Models/ProfileModel.swift` (iOS), `data/model/ProfileModel.kt` (Android). Credentials: `.env.local` (web), Xcode env vars (iOS), `local.properties` → `BuildConfig` (Android).

Run `/supabase-auth-setup` to configure providers.

## ChatKit Integration (AI Assistant)

All three platforms expose an AI assistant tab powered by OpenAI ChatKit. Web uses native ChatKit React at `/assistant`; iOS/Android use `AppWebView` loading the deployed ChatKit page.

**Config:** `chatkit.config.json` at workspace root. Run `/chatkit-setup` to configure interactively. Middleware excludes `/assistant-embed` and `/api/chatkit` from auth redirect.

## Cross-Platform Conventions

- **Feature naming**: PascalCase on all platforms (e.g. `UserProfile`)
- **Routes**: kebab-case on web (`/user-profile`) → PascalCase on iOS (`UserProfileView.swift`) and Android (`UserProfileScreen.kt`)
- **All screens exist on all three platforms** unless marked platform-specific in PRD
- After completing a feature, run `/prd-update` to keep docs current

## Screen Conventions

### File Structure

```
Web:     app/<kebab-route>/page.tsx  (+loading.tsx, error.tsx for data screens)
iOS:     Views/<PascalName>View.swift  (+ViewModels/<PascalName>ViewModel.swift)
Android: feature/<name>/<PascalName>Screen.kt  (+ViewModel.kt, ScreenState.kt)
```

### Required States (data screens only)

Every screen with data must handle: **Loading** (`AppProgressLoader`), **Empty** (message + action), **Error** (message + retry), **Populated** (content). UI-only screens are exempt.

### Data Fetching

- **Web:** React Server Components by default; `use client` only for interactivity. Type data with `database.types.ts`.
- **iOS:** `@Observable` ViewModels, `.task {}` for loading. Type data with Swift model structs in `Models/`.
- **Android:** `@HiltViewModel` + `StateFlow<ScreenState>` with sealed interface enforcing all state branches.

### Screen Rules

- Use design system components (`Button`, `InputField`, etc.) — never raw HTML or SwiftUI views
- Use `App*` native wrappers — never raw shadcn, SwiftUI, or Material3 APIs (enforced by `native-wrapper-guard`)
- Use `Adaptive*` wrappers for navigation — never raw `NavigationStack`, `TabView`, `.sheet()`, `<Drawer>`
- All styling via semantic tokens — no hardcoded values (enforced by `design-token-guard`)
- Wire screens into `AdaptiveNavShell` navigation; verify with `screen-reviewer` agent

## Adaptive Layout

**2-tier breakpoint:** mobile (<768px) / desktop (>=768px). Web: `md:` Tailwind prefix. iOS: `@Environment(\.horizontalSizeClass)`. Android: `WindowWidthSizeClass`.

| Wrapper | Compact | Regular | When to Use |
|---------|---------|---------|-------------|
| `AdaptiveNavShell` | Bottom tab bar | Collapsible sidebar (60→240px) | Root layout |
| `AdaptiveSplitView` | Push navigation | Side-by-side panels | List → detail (opt-in) |
| `AdaptiveSheet` | Bottom sheet | Centered modal | Overlays |

**Rules:** Never use raw `NavigationStack`/`TabView`/`.sheet()`/`<Drawer>` in screen files. iPad portrait = compact, landscape = regular. Screens with no responsive pattern must be marked `// responsive: N/A`.

## Design Token Architecture

**Primitive → Semantic** two-layer system matching Figma variable collections:

| Layer | Web | iOS | Android | Used In |
|-------|-----|-----|---------|---------|
| **Primitive** | `--color-zinc-950` | `Color.colorZinc950` | `PrimitiveColors.zinc950` | Token definition files ONLY |
| **Semantic** | `--surfaces-brand-interactive` | `Color.surfacesBrandInteractive` | `SemanticColors.surfacesBrandInteractive` | All component files |

**Rules:** Never use Primitive tokens in component files (hook-enforced). Never hardcode hex values. Naming: Figma `Surfaces/BrandInteractive` → CSS `--surfaces-brand-interactive` → Swift `.surfacesBrandInteractive` → Kotlin `SemanticColors.surfacesBrandInteractive`. See `docs/design-tokens.md` for full mapping.

## Component System

**Figma file:** bubbles-kit (`ZtcCQT96M2dJZjU35X8uMQ`) — read via Figma MCP server, write via `figma-cli/`.

**Registry:** `docs/components.md` — single source of truth for Figma ↔ code mapping, implementation status, and variant specs.

### File Structure

```
Web:     app/components/<Name>/<Name>.tsx (+index.ts)
iOS:     Components/<Name>/App<Name>.swift
Android: ui/components/App<Name>.kt | ui/patterns/App<Pattern>.kt | ui/native/App<Wrapper>.kt
```

iOS/Android prefixed `App` to avoid naming conflicts. Disabled state = 0.5 opacity.

### Atomic vs Complex

**Atomic** — self-contained, Figma is structural truth. Use `/figma-component-sync` before implementing.

**Complex** — compose 2+ atoms, Figma = visual reference only. Use `/complex-component` for clarification phase. Run `/component-audit` before marking Done.

### Comment Standards

Atomic: one JSDoc/header comment. Complex (>80 lines): section headers required (`// --- Props`, `// --- State`, `// --- Render` on web; `// MARK: -` on iOS). Enforced by `comment-enforcer` hook.

### Native Wrappers

**iOS:** Use `App*` wrappers from `Components/Native/` (styled via `NativeComponentStyling.swift`). Full API: `/ios-native-components` skill.

**Web:** Use `App*` wrappers from `app/components/Native/` (barrel: `@/app/components/Native`). Backed by shadcn/ui.

**Android:** Use `App*` wrappers from `ui/native/`. Full API: `/android-native-components` skill.

## Icon System (Phosphor Icons)

Phosphor Icons across all platforms. Web: `<Icon name="House" />` from `@/app/components/icons`. iOS: `Ph.house.regular.iconSize(.md)`. Android: `AppIcon(Icons.Filled.Home, size = IconSize.Md)`.

Sizes: `xs`=12 `sm`=16 `md`=20 `lg`=24 `xl`=32. Weights: thin, light, regular _(default)_, bold, fill, duotone. See `docs/design-tokens.md#icon-system` for full reference.

## Hooks (Automatic)

All hooks fire automatically via `.claude/settings.json`:

**Blocking (PreToolUse):**
- `credential-guard` — blocks Supabase URLs and JWT keys in source files
- `design-token-guard` — blocks Primitive tokens in component files
- `design-token-semantics-guard` — blocks surface token misuse as borders (enforces `Border/Default` or `Border/Muted` for lines; `BaseLowContrastPressed` only for Chip/Button active states)
- `complex-component-clarifier` — warns when writing a file composing 2+ atomic components
- `package-lock-guard` — blocks direct edits to `package-lock.json`

**Advisory (PostToolUse):**
- `cross-platform` — reminds to check counterparts after platform file edits
- `design-token-sync` — prompts `/design-token-sync` after token file changes
- `comment-enforcer` — warns on component files >80 lines with <3 comments
- `native-wrapper-guard` — warns on raw SwiftUI/shadcn/Material3 APIs in screen files
- `screen-structure-guard` — warns on new screens with no component imports or nav wiring
- `adaptive-layout-guard` — warns on screens with no responsive pattern
- `auto-lint` — runs ESLint fix after web file edits
- `migration-model-sync-reminder` — reminds to generate models after migration writes
- `model-schema-sync-reminder` — reminds to check schema sync after model edits
