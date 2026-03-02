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
- `docs/design/design-guidelines.md` — layout, spacing, typography, and component usage standards
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

### Step 3: Check API Keys & Secrets

Before writing implementation code, check whether this feature requires any API keys or third-party credentials. Scan the PRD for mentions of:
- **OpenAI** (voice transcribe, text transform, AI agents) → needs `OPENAI_API_KEY`
- **Supabase** (auth, database, storage) → needs `SUPABASE_URL` + `SUPABASE_ANON_KEY`
- **Google Sign-In** → needs `GOOGLE_IOS_CLIENT_ID` / `GOOGLE_WEB_CLIENT_ID`
- **Apple Sign-In** → needs Apple Developer portal configuration
- **Any other third-party API** → check for required keys

If the feature needs API keys, use `AskUserQuestion` to confirm the user has them configured:

> "This feature uses **[service name]**. Please confirm you've added your API key(s) to:
> - **Web:** `OPENAI_API_KEY=` in `.env.local`
> - **iOS:** `OpenAISecrets.swift` → `apiKey = "your-key"`
> - **Android:** `local.properties` → `OPENAI_API_KEY=your-key`
>
> The feature will build without errors but won't function at runtime without valid keys."

Do NOT proceed until the user confirms. If they say they don't have a key yet, point them to the relevant dashboard (e.g., https://platform.openai.com/api-keys for OpenAI) and offer to continue with the build anyway (features will compile but API calls will fail).

### Step 4: Implement Per Platform

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

### Step 5: Quality Checks

The template's hooks will fire automatically:
- `screen-structure-guard` — checks component library imports
- `native-wrapper-guard` — blocks raw SwiftUI/shadcn APIs
- `design-token-guard` — enforces semantic tokens
- `auto-lint` — runs ESLint on web files
- `comment-enforcer` — checks section headers

**Design guideline checks (manual — verify against `docs/design/design-guidelines.md`):**
- Page padding: 24px mobile / 32–40px desktop
- Section spacing: 32–40px between major sections
- Max content width: 1400px on desktop
- No more than 4 type sizes per screen, 2–3 emphasis levels per section
- One primary CTA per view; destructive actions use danger variant
- Minimum 44pt touch targets on mobile (prefer lg component variants)
- Empty states have headline + CTA

Optionally suggest spawning review agents:
- `screen-reviewer` for completeness audit
- `design-consistency-checker` for token compliance

### Step 6: Update Tracker

Update `tracker.md`:
- Mark platform implementation checkboxes for this feature
- If all platforms done → mark feature as complete
- Log any implementation decisions
