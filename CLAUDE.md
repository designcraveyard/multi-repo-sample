# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a **multi-repo workspace** containing three independent projects, each with its own git repository:

- `multi-repo-nextjs/` — Next.js web application
- `multi-repo-ios/` — SwiftUI iOS application
- `multi-repo-android/` — Jetpack Compose Android application

There is no root-level git repo, package manager, or shared build system. Each project is developed independently.

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

---

## Claude Skills (Workspace Automation)

Invoke these in any Claude session opened at the workspace root:

| Skill | Invocation | Purpose |
|-------|-----------|---------|
| Cross-Platform Feature | `/cross-platform-feature <name>` | Scaffold a feature on both platforms + Supabase migration stub + PRD |
| Design Token Sync | `/design-token-sync` | Push CSS custom properties from `globals.css` → `DesignTokens.swift` |
| Figma Component Sync | `/figma-component-sync [component]` | Sync Figma design system → `docs/components.md` registry; generate implementation brief for an **atomic** component |
| Complex Component | `/complex-component <name>` | Build a complex component (2+ atoms): runs clarification phase, designs props/state/tree, then implements on both platforms |
| Component Audit | `/component-audit <name>` | Audit a component for token compliance, comment quality, cross-platform parity, and accessibility — run before marking Done |
| Token Validation | `/validate-tokens [name\|--all]` | Audit components for semantic token misuse (BaseHighContrast/BaseLowContrastPressed in wrong contexts, primitive leakage, hardcoded values) |
| Supabase Setup | `/supabase-setup [project-ref]` | Wire Supabase client to both Next.js and iOS |
| Supabase Auth Setup | `/supabase-auth-setup` | Interactive wizard: configure Google/Apple/Email auth providers, dashboard setup, env files |
| Supabase Onboard | `/supabase-onboard` | New team member setup: link project, fill .env, verify MCP connection |
| Schema Design | `/schema-design` | Full guided entity design wizard with cross-platform model generation |
| Add Migration | `/add-migration [description]` | Quick single-table or ALTER migration with model sync |
| New Screen | `/new-screen <description>` | UI-only screen scaffold on both platforms |
| PRD Update | `/prd-update [feature\|all]` | Update PRDs and all CLAUDE.md files to match current codebase |
| Git Push | `/git-push` | Commit and push all repos from the workspace root |
| New AI Agent | `/new-ai-agent <description>` | Scaffold a new AI agent config + tool handlers + UI on all platforms using the OpenAI Transform/Transcribe layer |
| Post-Session Review | `/post-session-review` | Guided checklist to update docs, skills, agents, and CLAUDE.md after a session |

## Subagents

These run automatically when Claude needs them, or invoke explicitly:

| Agent | Purpose |
|-------|---------|
| `cross-platform-reviewer` | Side-by-side parity report: what's missing on web vs iOS |
| `design-consistency-checker` | Flags hardcoded values, token mismatches, and two-layer architecture violations |
| `design-system-sync` | Fetches Figma components/tokens via MCP, validates code parity, generates implementation briefs (atomic components only — for complex components Figma is visual reference only) |
| `complex-component-reviewer` | Reviews complex components for composition correctness, comment quality, interaction completeness, and cross-platform parity |
| `supabase-schema-validator` | Validates Swift models and TS types match the live Supabase schema |
| `schema-reviewer` | Reviews schema for normalization, indexes, RLS gaps, naming conventions (pre-apply quality check) |
| `screen-reviewer` | Reviews a full screen for state handling, navigation wiring, component library usage, responsive layout, accessibility, and cross-platform parity |

## OpenAI Agent Builder Plugin

Plugin at `.claude/plugins/openai-agent-builder/` scaffolds OpenAI agent projects (Python & TypeScript).

| Skill | Invocation | Purpose |
|-------|-----------|---------|
| Agent Help | `/agent-help` | Show all available agent builder skills and templates |
| New Text Agent | `/new-text-agent` | Standard chat agent (Python or TypeScript) |
| New Voice Agent | `/new-voice-agent` | Voice agent with VoicePipeline (Python) or RealtimeAgent (TS) |
| New Multi-Agent | `/new-multi-agent` | Multi-agent orchestrator with triage handoffs |
| New ChatKit Agent | `/new-chatkit-agent` | ChatKit embedded UI agent (basic/custom/full tiers) |

**Hooks** (automatic): blocks hardcoded API keys, blocks Zod v3 in TS agent files, warns on missing error handling/tracing/guardrails.

**Subagents**: `agent-code-reviewer` (SDK pattern review), `agent-security-checker` (credential & auth audit).

**Reference docs** in `references/`: Python SDK, TypeScript SDK, voice patterns, ChatKit patterns, guardrails patterns.

## Supabase Schema Builder Plugin

Plugin at `.claude/plugins/supabase-schema-builder/` provides interactive schema design and migration management via Supabase MCP.

| Skill | Invocation | Purpose |
|-------|-----------|---------|
| Supabase Onboard | `/supabase-onboard` | New team member setup: verify MCP, fill .env files, check schema |
| Schema Design | `/schema-design` | Full guided wizard: entities → attributes → relationships → RLS → triggers → indexes → apply → generate models |
| Add Migration | `/add-migration [description]` | Quick single-table or ALTER migration with cross-platform model sync |

**Agent**: `schema-reviewer` — reviews proposed schema SQL for quality before applying (normalization, indexes, RLS, naming conventions).

**Hooks** (automatic):
- `migration-model-sync-reminder` (PreToolUse): reminds to generate cross-platform models when writing migration files
- `model-schema-sync-reminder` (PostToolUse): reminds to check schema sync when model files are edited

**Reference docs** in `references/`: type-mapping, RLS patterns, trigger patterns, index patterns, model templates.

**MCP integration**: All schema operations use the Supabase MCP server (`supabase-bubbleskit`) — no local CLI needed at runtime. Tools used: `list_tables`, `execute_sql`, `apply_migration`, `generate_typescript_types`, `get_advisors`.

## Shared Documentation

| File | Purpose |
|------|---------|
| `docs/components.md` | Component registry: Figma ↔ code mapping, variant specs, implementation status |
| `docs/design-tokens.md` | Canonical token reference (CSS var name ↔ Swift name, light/dark values) |
| `docs/api-contracts.md` | Supabase table shapes, type mapping rules, RLS conventions |
| `docs/PRDs/` | Per-feature product requirement documents |

## Supabase

Migrations live at workspace root in `supabase/migrations/` (shared infrastructure, not inside either sub-repo).

```bash
# From workspace root:
supabase start                    # Start local stack (requires Docker)
supabase db push                  # Apply pending migrations to linked project
supabase gen types typescript --linked > multi-repo-nextjs/lib/database.types.ts
supabase migration new <name>     # Create a new migration file
```

## Authentication

All three platforms use Supabase Auth with an **auth gate** pattern — unauthenticated users see only the login screen.

**Providers:** Google (native SDK on mobile, OAuth redirect on web), Apple (native on iOS, OAuth on web), Email/Password

**Auth gate entry points:**
- Web: `middleware.ts` redirects unauthenticated requests to `/login`
- iOS: `multi_repo_iosApp.swift` shows `LoginView` or `ContentView` based on `AuthManager.currentUser`
- Android: `MainActivity.kt` switches on `SessionStatus` (LoadingFromStorage / Authenticated / else → LoginScreen)

**Key auth files per platform:**

| File | Platform | Purpose |
|------|----------|---------|
| `lib/auth/actions.ts` | Web | Server actions for all auth methods |
| `lib/auth/auth-context.tsx` | Web | `AuthProvider` + `useAuth()` hook |
| `middleware.ts` | Web | Session refresh + route protection |
| `app/auth/callback/route.ts` | Web | OAuth code → session exchange |
| `Auth/AuthManager.swift` | iOS | `@Observable` auth state, sign-in methods |
| `Views/Auth/LoginView.swift` | iOS | Login screen |
| `data/auth/AuthRepository.kt` | Android | Session Flow, sign-in/out, profile fetch |
| `feature/auth/LoginScreen.kt` | Android | Login screen |

**Profile:** Auto-created via DB trigger on signup. Model files: `lib/auth/profile.ts` (web), `Models/ProfileModel.swift` (iOS), `data/model/ProfileModel.kt` (Android).

**Credential storage:**
- Web: `.env.local` (gitignored)
- iOS: Xcode scheme environment variables
- Android: `local.properties` → `BuildConfig` fields (gitignored)

Run `/supabase-auth-setup` to configure providers in Supabase Dashboard, Google Cloud Console, and Apple Developer Portal.

## ChatKit Integration (AI Assistant)

All three platforms expose an AI assistant tab powered by OpenAI ChatKit:

- **Web**: Native ChatKit React component at `/assistant` (cookie auth) and `/assistant-embed` (token auth for WebView)
- **iOS/Android**: `AppWebView` wrapper loading the deployed ChatKit page

**Config:** `chatkit.config.json` at workspace root — stores workflow ID, theme, and deployment URL.

**Key files:**

| File | Platform | Purpose |
|------|----------|---------|
| `app/api/chatkit/session/route.ts` | Web | API route — creates ChatKit sessions via `openai.beta.chatkit.sessions.create()` |
| `app/(authenticated)/assistant/page.tsx` | Web | ChatKit page (cookie auth, inside nav shell) |
| `app/assistant-embed/page.tsx` | Web | Embed ChatKit page (no auth chrome, for WebView) |
| `Components/Native/AppWebView.swift` | iOS | Reusable WKWebView wrapper |
| `Views/AssistantView.swift` | iOS | Assistant screen — loads WebView |
| `ui/native/AppWebView.kt` | Android | Reusable Compose WebView wrapper |
| `feature/assistant/AssistantScreen.kt` | Android | Assistant screen — loads WebView |
| `chatkit.config.json` | Root | Shared config (workflow ID, theme, URLs) |

**Middleware exclusions:** `/assistant-embed` and `/api/chatkit` are excluded from auth redirect in `middleware.ts`.

**WebView URL:** Currently points to `https://lifegraph-agent.vercel.app/`. Update in `AssistantView.swift` (iOS) and `AssistantScreen.kt` (Android).

**Dependencies:** `@openai/chatkit-react` (web), `WebKit` (iOS), `android.webkit.WebView` (Android)

Run `/chatkit-setup` to configure workflow ID, theme, and deployment URL interactively.

## Cross-Platform Conventions

- **Feature naming**: use the same **PascalCase** name on all three platforms (e.g. `UserProfile`)
- **Routes**: kebab-case on web (`/user-profile`) maps to PascalCase on iOS (`UserProfileView.swift`) and Android (`UserProfileScreen.kt`)
- **All screens exist on all three platforms** unless explicitly marked platform-specific in the feature's PRD
- After completing a feature, run `/prd-update` to keep docs current

## Screen Conventions

Screens are full pages/views built from components. Every screen must follow these patterns:

### File Structure

```
# Web — App Router pages
app/<kebab-route>/page.tsx         # Page component (required)
app/<kebab-route>/loading.tsx      # Suspense loading UI (when data-fetching)
app/<kebab-route>/error.tsx        # Error boundary UI (when data-fetching)
app/<kebab-route>/layout.tsx       # Nested layout (if sub-navigation needed)

# iOS — Views + ViewModels
Views/<PascalName>View.swift               # View (UI layer)
ViewModels/<PascalName>ViewModel.swift      # ViewModel (when data-fetching)

# Android — Screens + ViewModels
feature/<name>/<PascalName>Screen.kt       # Screen composable (UI layer)
feature/<name>/<PascalName>ViewModel.kt    # HiltViewModel (when data-fetching)
feature/<name>/<PascalName>ScreenState.kt  # Sealed state interface
```

### Required States

Every screen with data must handle all four states:

| State | Web | iOS | Android |
|-------|-----|-----|---------|
| **Loading** | `loading.tsx` or inline `AppProgressLoader` | `AppProgressLoader` with `isLoading` | `AppProgressLoader` in `Loading` state branch |
| **Empty** | Empty state illustration + message | Empty state text + optional action | Empty state text + optional `AppButton` |
| **Error** | `error.tsx` or inline error + retry | `.appAlert` or inline error + retry | Error text + `AppButton` retry in `Error` state branch |
| **Populated** | Normal content render | Normal content render | Normal content render in `Populated` state branch |

UI-only screens (no data fetching) are exempt from loading/error states.

### Data Fetching Patterns

**Web (Next.js):** Use React Server Components by default. Fetch data in `page.tsx` as an `async` component. Use `use client` only when interactivity is needed. Type data with `database.types.ts`.

**iOS (SwiftUI):** Use `@Observable` ViewModels. Fetch data in the ViewModel's `load()` method called from `.task {}`. Type data with Swift model structs in `Models/`.

**Android (Compose):** Use `@HiltViewModel` with `StateFlow<ScreenState>`. Collect state via `collectAsStateWithLifecycle()`. The sealed `ScreenState` interface enforces Loading/Empty/Error/Populated branches.

### Navigation Wiring

- **Web:** Ensure the route is linked from `AdaptiveNavShell` sidebar/bottom-nav or from another page
- **iOS:** The screen is reachable through `AdaptiveNavShell` tabs or `AdaptiveSplitView` navigation
- **Android:** Add a `@Serializable data object` to `Screen` sealed interface and wire into `AdaptiveNavShell` in `MainActivity`
- After creating a screen, verify navigation with the `screen-reviewer` agent

### Responsive Layout Requirements

Every screen must handle both compact and regular layouts:

- **Web:** Use `md:` Tailwind prefix for desktop overrides. Default (no prefix) = mobile layout.
- **iOS:** Read `@Environment(\.horizontalSizeClass)` when layout differs between phone and iPad.
- **Android:** Use `WindowWidthSizeClass` from `calculateWindowSizeClass()` — `Compact` for phones, `Medium`/`Expanded` for tablets.
- Screens that don't need responsive branching (e.g. simple forms) must be marked `// mobile-only` or `// responsive: N/A` with justification.
- The `adaptive-layout-guard` hook warns when a screen file has no responsive pattern.
- Use `AdaptiveSplitView` for screens with list → detail navigation (opt-in, not default).
- Use `AdaptiveSheet` instead of raw bottom sheets or modals.

### Screen Component Usage Rules

- **Always** use design system components (`Button`, `InputField`, `Badge`, etc.) — never raw `<button>`, `<input>`, or SwiftUI `TextField`/`Button`
- **Always** use `App*` native wrappers for platform controls — never raw shadcn or SwiftUI APIs
- **Always** use `Adaptive*` wrappers for navigation and presentation — never raw `NavigationStack`, `TabView`, `.sheet()`, or `<Drawer>`
- **All styling** via semantic tokens — no hardcoded hex colors, pixel spacing, or font sizes
- The `screen-structure-guard` hook warns if a new page file has zero component library imports

## Adaptive Layout Architecture

This project targets **5 form factors** with a mobile-first design approach:

| Form Factor | iOS | Web | Layout Class |
|-------------|-----|-----|-------------|
| iPhone (portrait) | Primary target | — | Compact |
| Mobile web (< 768px) | — | Primary target | Compact |
| iPad (portrait) | Orientation-aware: compact layout | — | Compact |
| iPad (landscape) | Orientation-aware: regular layout | — | Regular |
| Desktop web (>= 768px) | — | `md:` breakpoint | Regular |
| macOS | Designed for iPad (automatic) | — | Regular |

### Breakpoint Strategy

**2-tier** — mobile (< 768px) / desktop (>= 768px):

| Platform | Detection | Compact | Regular |
|----------|-----------|---------|---------|
| Web | Tailwind `md:` prefix (CSS media queries) | Default styles | `md:` prefixed overrides |
| iOS | `@Environment(\.horizontalSizeClass)` | `.compact` (iPhone, iPad portrait) | `.regular` (iPad landscape) |
| Android | `WindowWidthSizeClass` from `calculateWindowSizeClass()` | `Compact` (phones) | `Medium` / `Expanded` (tablets, foldables) |

### Adaptive Wrappers

Every screen-level layout decision goes through an **adaptive wrapper** — never use raw navigation or presentation primitives in screen files.

| Wrapper | Compact (phone / mobile web) | Regular (iPad landscape / desktop) | When to Use |
|---------|-----|--------|------|
| `AdaptiveNavShell` | Bottom tab bar | Collapsible icon-rail sidebar | Root layout — wraps the entire app |
| `AdaptiveSplitView` | Push navigation (list → detail) | Side-by-side split panels | Opt-in per screen with list → detail pattern |
| `AdaptiveSheet` | Bottom sheet (drawer) | Centered modal dialog | Any overlay content (forms, confirmations) |

**File locations:**
```
# iOS
Components/Adaptive/AdaptiveNavShell.swift
Components/Adaptive/AdaptiveSplitView.swift
Components/Adaptive/AdaptiveSheet.swift

# Web
app/components/Adaptive/AdaptiveNavShell.tsx
app/components/Adaptive/AdaptiveSplitView.tsx
app/components/Adaptive/AdaptiveSheet.tsx

# Android
ui/adaptive/AdaptiveNavShell.kt
ui/adaptive/AdaptiveSplitView.kt
ui/adaptive/AdaptiveSheet.kt
```

### Adaptive Rules

- **Never** use raw `NavigationStack`, `TabView`, or `NavigationSplitView` in screen files — use `AdaptiveNavShell` or `AdaptiveSplitView`
- **Never** use raw `.sheet()` or `<Drawer>` in screen files — use `AdaptiveSheet`
- **Always** read `@Environment(\.horizontalSizeClass)` in iOS views that need layout branching
- **Always** use `md:` Tailwind prefix for desktop-specific web layout
- The `adaptive-layout-guard` hook warns when a screen file uses no adaptive pattern
- Split-view is **opt-in per screen** — not every list screen needs it
- iPad portrait uses compact layout; iPad landscape uses regular layout (orientation-aware)

### Sidebar Spec (Regular Layout)

The sidebar on desktop/iPad uses a **collapsible icon rail** pattern:

| State | Width | Content |
|-------|-------|---------|
| Collapsed (default) | 60px / 60pt | Icon only, tooltip on hover |
| Expanded | 240px / 240pt | Icon + label text |
| Toggle | Click rail toggle button / swipe edge | Animated expand/collapse |

Icons and labels match the bottom tab bar items. Active state uses the same filled icon convention as `AppBottomNavBar`.

## Design Token Architecture (Two-Layer)

Tokens follow a **Primitive → Semantic** architecture matching the Figma variable collections:

| Layer | Web (CSS) | iOS (Swift) | Android (Kotlin) | Used In |
|-------|-----------|-------------|------------------|---------|
| **Primitive** | `--color-zinc-950` | `Color.colorZinc950` | `PrimitiveColors.zinc950` | Token definition files ONLY |
| **Semantic** | `--surfaces-brand-interactive` | `Color.surfacesBrandInteractive` | `SemanticColors.surfacesBrandInteractive` | All component files |

**Rules:**
- **Never use Primitive tokens in component files** — the `design-token-guard` hook blocks this
- **Never hardcode hex values** in `.tsx`/`.ts`/`.swift`/`.kt` component files
- Semantic tokens reference Primitives via `var(--color-*)` (CSS), `colorZinc*` (Swift), or `PrimitiveColors.*` (Kotlin)
- Legacy aliases (`--surface-brand` / `Color.appSurfaceBrand`) still work but new code must use Semantic names

**Naming convention:** Figma `Surfaces/BrandInteractive` → CSS `--surfaces-brand-interactive` → Swift `Color.surfacesBrandInteractive` → Kotlin `SemanticColors.surfacesBrandInteractive`

See `docs/design-tokens.md` for the full mapping table.

## Component System

**Figma file:** bubbles-kit (`ZtcCQT96M2dJZjU35X8uMQ`) — fetched via `figma-console` MCP server.

**Registry:** `docs/components.md` — the single source of truth mapping Figma components to code.

### Component File Structure

```
# Web
app/components/<ComponentName>/<ComponentName>.tsx
app/components/<ComponentName>/index.ts

# iOS
Components/<ComponentName>/App<ComponentName>.swift

# Android
ui/components/App<ComponentName>.kt    # Atomic components
ui/patterns/App<PatternName>.kt        # Pattern components
ui/native/App<WrapperName>.kt          # Native wrappers
ui/adaptive/Adaptive<WrapperName>.kt   # Adaptive wrappers
```

- iOS and Android components are prefixed `App` to avoid platform naming conflicts
- Figma variant axes map to component props (`Type` → `variant`, `Size` → `size`, `State` → built-in hover/active/disabled)
- Disabled state = **0.5 opacity** on container (no separate tokens)

### Atomic vs Complex Components

There are two categories of components with different workflows:

**Atomic** — self-contained, no child component dependencies. Figma is structural truth.
- Use `/figma-component-sync <name>` to get the Figma spec before implementing
- Figma layer structure drives props and variant mapping

**Complex** — compose 2+ atomic components; have non-trivial interactions, state, or layout.
- **Figma = visual reference only** — do not derive component tree or state ownership from Figma layers
- Use `/complex-component <name>` to run the clarification phase before writing any code
- Must clarify: state ownership, interaction model, keyboard nav, and cross-platform differences first
- Run `/component-audit <name>` before marking Done in `docs/components.md`

### Comment Standards (required)

**Atomic components** — one JSDoc/header comment on the exported symbol is sufficient.

**Complex components** (composing 2+ atoms, or >80 lines) — section headers required:

```tsx
// Web: // --- Props  // --- State  // --- Helpers  // --- Render
// iOS: // MARK: - Properties  // MARK: - Body  // MARK: - Subviews  // MARK: - Helpers
```

The `comment-enforcer` hook reminds when a file over 80 lines has fewer than 3 comment lines.

### Implemented Components

| Component | Web | iOS | Android |
|-----------|-----|-----|---------|
| Button | `app/components/Button/Button.tsx` | `Components/Button/AppButton.swift` | `ui/components/AppButton.kt` |
| IconButton | `app/components/IconButton/IconButton.tsx` | `Components/IconButton/AppIconButton.swift` | `ui/components/AppIconButton.kt` |
| Badge | `app/components/Badge/Badge.tsx` | `Components/Badge/AppBadge.swift` | `ui/components/AppBadge.kt` |
| Label | `app/components/Label/Label.tsx` | `Components/Label/AppLabel.swift` | `ui/components/AppLabel.kt` |
| Chips | `app/components/Chip/Chip.tsx` | `Components/Chip/AppChip.swift` | `ui/components/AppChip.kt` |
| Tabs | `app/components/Tabs/Tabs.tsx` | `Components/Tabs/AppTabs.swift` | `ui/components/AppTabs.kt` |
| SegmentControlBar | `app/components/SegmentControlBar/SegmentControlBar.tsx` | `Components/SegmentControlBar/AppSegmentControlBar.swift` | `ui/components/AppSegmentControlBar.kt` |
| Thumbnail | `app/components/Thumbnail/Thumbnail.tsx` | `Components/Thumbnail/AppThumbnail.swift` | `ui/components/AppThumbnail.kt` |
| InputField | `app/components/InputField/InputField.tsx` | `Components/InputField/AppInputField.swift` | `ui/components/AppInputField.kt` |
| Toast | `app/components/Toast/Toast.tsx` | `Components/Toast/AppToast.swift` | `ui/components/AppToast.kt` |
| Divider | `app/components/Divider/Divider.tsx` | `Components/Divider/AppDivider.swift` | `ui/components/AppDivider.kt` |
| Checkbox | `app/components/Checkbox/Checkbox.tsx` | `Components/Checkbox/AppCheckbox.swift` | `ui/components/AppCheckbox.kt` |
| Switch | `app/components/Switch/Switch.tsx` | `Components/Switch/AppSwitch.swift` | `ui/components/AppSwitch.kt` |
| RadioButton | `app/components/RadioButton/RadioButton.tsx` | `Components/RadioButton/AppRadioButton.swift` | `ui/components/AppRadioButton.kt` |
| MarkdownEditor | `app/components/MarkdownEditor/MarkdownEditor.tsx` | `Components/MarkdownEditor/AppMarkdownEditor.swift` | `ui/components/AppMarkdownEditor.kt` |
| TextBlock _(pattern)_ | `app/components/patterns/TextBlock/TextBlock.tsx` | `Components/Patterns/AppTextBlock.swift` | `ui/patterns/AppTextBlock.kt` |
| StepIndicator _(pattern)_ | `app/components/patterns/StepIndicator/StepIndicator.tsx` | `Components/Patterns/AppStepIndicator.swift` | `ui/patterns/AppStepIndicator.kt` |
| Stepper _(pattern)_ | `app/components/patterns/Stepper/Stepper.tsx` | `Components/Patterns/AppStepper.swift` | `ui/patterns/AppStepper.kt` |
| ListItem _(pattern)_ | `app/components/patterns/ListItem/ListItem.tsx` | `Components/Patterns/AppListItem.swift` | `ui/patterns/AppListItem.kt` |

See `docs/components.md` for the full list with Figma node IDs, variant details, and complex component registry.

### Native iOS Component Wrappers

Thin wrappers around SwiftUI system controls, styled via `NativeComponentStyling.swift`. **Always use these instead of raw SwiftUI APIs** in screen/feature files.

| Wrapper | Raw SwiftUI | File | Key Props |
|---------|-------------|------|-----------|
| `AppNativePicker` | `Picker` | `Components/Native/AppNativePicker.swift` | `selection`, `options: [PickerOption]`, `style: .menu/.segmented/.wheel`; no default border — error border only when `showError: true` |
| `AppDateTimePicker` | `DatePicker` | `Components/Native/AppDateTimePicker.swift` | `selection: Date`, `mode: .date/.time/.dateAndTime`, `displayStyle: .compact/.graphical/.wheel`, `range`; `.wheel` style places label above drums |
| `AppProgressLoader` | `ProgressView` | `Components/Native/AppProgressLoader.swift` | `variant: .indefinite/.definite(value:total:)`, `label` |
| `AppColorPicker` | `ColorPicker` | `Components/Native/AppColorPicker.swift` | `selection: Color`, `supportsOpacity` |
| `AppBottomSheet` | `.sheet` | `Components/Native/AppBottomSheet.swift` | ViewModifier: `.appBottomSheet(isPresented:detents:content:)` |
| `AppActionSheet` | `.confirmationDialog` | `Components/Native/AppActionSheet.swift` | ViewModifier: `.appActionSheet(isPresented:title:actions:message:)` |
| `AppAlertPopup` | `.alert` | `Components/Native/AppAlertPopup.swift` | ViewModifier: `.appAlert(isPresented:title:message:buttons:)` |
| `AppPageHeader` | `NavigationStack` + `.toolbar` | `Components/Native/AppPageHeader.swift` | ViewModifier: `.appPageHeader(title:displayMode:trailingActions:)` |
| `AppContextMenu` | `.contextMenu` | `Components/Native/AppContextMenu.swift` | ViewModifier: `.appContextMenu(items:)` |
| `AppBottomNavBar` | `TabView` | `Components/Native/AppBottomNavBar.swift` | `selectedTab: Binding<Int>`, `@ViewBuilder content` |
| `AppCarousel` | `TabView(.page)` / `ScrollView` | `Components/Native/AppCarousel.swift` | `items`, `style: .paged/.scrollSnap`, `showDots` |
| `AppTooltip` | `.popover` | `Components/Native/AppTooltip.swift` | `isPresented`, `tipText` or custom `tipContent`, `arrowEdge` |
| `AppRangeSlider` | dual `Slider` | `Components/Native/AppRangeSlider.swift` | `lowerValue`, `upperValue`, `range`, `step`, `showLabels`; haptics: impact on grab, selection tick on each step change |

**iOS Rules:**
- All styling tokens live in `NativeComponentStyling.swift` — never hardcode colors/spacing in wrappers
- ViewModifier wrappers (BottomSheet, ActionSheet, Alert, PageHeader, ContextMenu) are applied via dot-syntax on any View
- `AppBottomNavBar` requires `NativeBottomNavStyling.applyAppearance()` in `multi_repo_iosApp.init()` (already wired)
- Centralized styling file: `multi-repo-ios/multi-repo-ios/Components/Native/NativeComponentStyling.swift`

### Native Web Component Wrappers (Next.js)

Thin wrappers backed by shadcn/ui primitives. Each file has a `const styling = { colors, layout, typography }` block at the top. **Always use these instead of raw shadcn primitives** in page/feature files.

Barrel import: `import { AppNativePicker, AppTooltip } from "@/app/components/Native";`

| Wrapper | Primitive | File | Key Props |
|---------|-----------|------|-----------|
| `AppNativePicker` | shadcn `Select` | `app/components/Native/AppNativePicker.tsx` | `value`, `options: PickerOption[]`, `onChange`, `label`, `showError`, `disabled` |
| `AppDateTimePicker` | shadcn `Calendar` + `Popover` | `app/components/Native/AppDateTimePicker.tsx` | `value`, `onChange`, `mode: "date"\|"time"\|"dateAndTime"`, `displayStyle: "compact"\|"inline"`, `range`, `label` |
| `AppProgressLoader` | shadcn `Progress` | `app/components/Native/AppProgressLoader.tsx` | `variant: "indefinite"\|"definite"`, `value`, `total`, `label` |
| `AppColorPicker` | `<input type="color">` | `app/components/Native/AppColorPicker.tsx` | `value`, `onChange`, `label`, `showOpacity`, `disabled` |
| `AppBottomSheet` | vaul `Drawer` | `app/components/Native/AppBottomSheet.tsx` | `isPresented`, `onClose`, `children`, `title`, `description`, `snapPoints` |
| `AppCarousel` | shadcn `Carousel` (Embla) | `app/components/Native/AppCarousel.tsx` | `items: ReactNode[]`, `style: "paged"\|"scrollSnap"`, `showDots` |
| `AppTooltip` | shadcn `Tooltip` | `app/components/Native/AppTooltip.tsx` | `children`, `content`, `side`, `disabled` |
| `AppRangeSlider` | shadcn `Slider` | `app/components/Native/AppRangeSlider.tsx` | `lowerValue`, `upperValue`, `onChange`, `range`, `step`, `showLabels` |
| `AppActionSheet` | shadcn `AlertDialog` | `app/components/Native/AppActionSheet.tsx` | `isPresented`, `onClose`, `actions: AppActionSheetAction[]`, `title`, `message` |
| `AppAlertPopup` | shadcn `AlertDialog` | `app/components/Native/AppAlertPopup.tsx` | `isPresented`, `onClose`, `title`, `message`, `buttons: AlertButton[]` |
| `AppContextMenu` | shadcn `ContextMenu`/`DropdownMenu` | `app/components/Native/AppContextMenu.tsx` | `items: AppContextMenuItem[]`, `mode: "context"\|"dropdown"`, `children` |

**Web Rules:**
- All styling tokens live in the `const styling` block at the top of each file — never hardcode colors/spacing
- All values must reference semantic CSS custom properties (`var(--surfaces-*)`, `var(--typography-*)`, `var(--border-*)`, `var(--space-*)`)
- `AppBottomNavBar` and `AppPageHeader` have no web equivalents — use Next.js App Router layouts instead
- The **native-wrapper-guard** hook warns when raw shadcn primitives are used directly in Next.js page/screen files

## Icon System (Phosphor Icons)

**Library:** [Phosphor Icons](https://phosphoricons.com/) — same set in Figma, web, iOS, and Android.

| Rule | Web | iOS | Android |
|------|-----|-----|---------|
| Package | `@phosphor-icons/react` | PhosphorSwift (SPM) | Material Icons (placeholder) |
| Usage | `<Icon name="House" />` | `Ph.house.regular.iconSize(.md)` | `AppIcon(Icons.Filled.Home, size = IconSize.Md)` |
| Import | `from "@/app/components/icons"` | `import PhosphorSwift` | `import com.abhishekverma.multirepo.ui.icons.*` |
| Default weight | `regular` | `.regular` | Material `Filled` |
| Default size | `md` (20px) | `.md` (20pt) via `.iconSize(.md)` | `IconSize.Md` (20dp) |
| Color | `var(--icon-primary)` | `.iconColor(.appIconPrimary)` | `SemanticColors.iconsPrimary` |
| Never do | Import from `@phosphor-icons/react` directly | Hardcode `.frame(width:height:)` without token | Hardcode `Modifier.size()` without `IconSize.*` |

**iOS pattern:** `Ph.<name>.<weight>.iconSize(.<token>)` — icons are static members of `Ph`, not instantiated. Size/color/accessibility helpers are in `PhosphorIconHelper.swift`.

**Android pattern:** `AppIcon(imageVector, size, tint, contentDescription)` — wrapper in `PhosphorIconHelper.kt`. Currently uses Material Icons as placeholder; designed for future Phosphor Compose swap.

**Size mapping** (identical on both platforms):
`xs`=12 · `sm`=16 · `md`=20 · `lg`=24 · `xl`=32

**Weights:** `thin` · `light` · `regular` _(default)_ · `bold` · `fill` · `duotone`

**From Figma:** icon name (PascalCase in sidebar) → `name` prop on web, `Ph.<camelCase>` on iOS. Weight layer → `weight` prop / weight member. Size from Dimensions → nearest token.

See `docs/design-tokens.md#icon-system` for full reference.

## Hook Reminders

`.claude/settings.json` hooks fire automatically in every session:
- **credential-guard** (PreToolUse): **BLOCKS** writes containing Supabase project URLs (`*.supabase.co`) or JWT/API keys (`eyJhbGciOi...`) in source files — use env vars or BuildConfig instead
- **design-token-guard** (PreToolUse): **BLOCKS** writes that use Primitive tokens (`var(--color-*)` or `Color.colorZinc*`) in component files — enforces Semantic-only usage
- **design-token-semantics-guard** (PreToolUse): **BLOCKS** writes that misuse semantic surface tokens as borders/dividers. Enforces:
  - `BaseLowContrastPressed` only in Chip (active state) and Button (pressed state)
  - `BaseHighContrast` only as a higher-prominence surface, never for structural lines
  - All dividers, separators, and borders must use `Border/Default` or `Border/Muted`
- **complex-component-clarifier** (PreToolUse): when writing a file that imports 2+ atomic components, prints a reminder to confirm state ownership, keyboard interactions, Figma reference scope, and loading/empty/error states before proceeding
- Editing `package-lock.json` directly is **blocked** — use `npm install` instead
- After editing a `.swift` file → reminded to check the web counterpart
- After editing `.tsx`/`.ts` files → reminded to check the iOS counterpart
- After editing `globals.css` or Swift Color files → prompted to run `/design-token-sync`
- **comment-enforcer** (PostToolUse): reminds when a component file over 80 lines has fewer than 3 comment lines
- **native-wrapper-guard** (PostToolUse): warns when raw SwiftUI APIs (`Picker(`, `DatePicker(`, `ProgressView(`, `ColorPicker(`, `.sheet(`, `.confirmationDialog(`, `.alert(`, `.contextMenu(`) or raw navigation (`NavigationStack {`, `TabView(`, `NavigationSplitView(`) are used in iOS screen/feature files OR when raw shadcn primitives (`<Select`, `<Drawer`, `<AlertDialog`, `<Carousel`, `<Slider`, `<ContextMenu`) are used directly in Next.js page/screen files — use the `App*` or `Adaptive*` wrappers instead
- **screen-structure-guard** (PostToolUse): warns when a new screen file (`page.tsx` or `*View.swift`) has no imports from the component library, and reminds to wire views into `AdaptiveNavShell` navigation
- **adaptive-layout-guard** (PostToolUse): warns when a new screen file has no responsive pattern (`md:` prefix on web, `horizontalSizeClass` on iOS) and is not marked `// responsive: N/A`
- **auto-lint** (PostToolUse): runs `npx eslint --fix` on `.tsx`/`.ts` files after each edit to catch issues early
- **migration-model-sync-reminder** (PreToolUse, plugin): reminds to generate cross-platform models when writing to `supabase/migrations/*.sql`
- **model-schema-sync-reminder** (PostToolUse, plugin): reminds to check schema sync when model files (`*Model.swift`, `*Model.kt`, `database.types.ts`) are edited
- After each successful session → evaluate if `docs/`, `.claude/agents/`, or `.claude/skills/` need updating
