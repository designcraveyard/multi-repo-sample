# /build-feature — Implement a feature across all platforms

## Description

Interactive feature builder. Reads the feature's PRD, screen specs, schema, and component map, then generates implementation code across all included platforms. Works with the template's existing hooks for quality enforcement.

## Trigger

User says "/build-feature <feature-name>" or "build the <feature> feature"

## Arguments

- `feature-name`: The feature slug (matches `docs/PRDs/<feature-name>.md`)

## Instructions

### Step 1: Read Context

Read all specs for this feature:
- `docs/PRDs/<feature-name>.md` — full behavioral spec
- `docs/design/screens/` — screen specs for this feature's screens
- `docs/design/component-map.md` — what components each screen needs
- `docs/design/information-architecture.md` — navigation context
- Supabase migration files — schema for this feature
- Model files — data structures

### Step 2: Plan Implementation

Present the implementation plan to the user:
- List of files to create per platform
- Components to use
- Data flow (API → ViewModel → View)
- Navigation wiring needed

Ask user to confirm or adjust.

### Step 3: Implement Per Platform

**Web (Next.js):**
- `app/<route>/page.tsx` — page component (Server Component by default)
- `app/<route>/loading.tsx` — loading state
- `app/<route>/error.tsx` — error boundary
- Client components as needed for interactivity
- Wire into `AdaptiveNavShell` navigation

**iOS (SwiftUI):**
- `Views/<Feature>View.swift` — View layer
- `ViewModels/<Feature>ViewModel.swift` — @Observable ViewModel
- Wire into `AdaptiveNavShell` tabs or navigation
- Use `App*` native wrappers, `Adaptive*` layout wrappers

**Android (Compose):**
- `feature/<name>/<Feature>Screen.kt` — Screen composable
- `feature/<name>/<Feature>ViewModel.kt` — @HiltViewModel
- `feature/<name>/<Feature>ScreenState.kt` — sealed state interface
- Add `@Serializable data object` to `Screen` sealed interface
- Wire into `AdaptiveNavShell` in `MainActivity`

### Step 4: Quality Checks

The template's hooks will fire automatically:
- `screen-structure-guard` — checks component library imports
- `native-wrapper-guard` — blocks raw SwiftUI/shadcn APIs
- `design-token-guard` — enforces semantic tokens
- `auto-lint` — runs ESLint on web files
- `comment-enforcer` — checks section headers

Optionally suggest spawning review agents:
- `screen-reviewer` for completeness audit
- `design-consistency-checker` for token compliance

### Step 5: Update Tracker

Update `tracker.md`:
- Mark platform implementation checkboxes for this feature
- If all platforms done → mark feature as complete
- Log any implementation decisions
