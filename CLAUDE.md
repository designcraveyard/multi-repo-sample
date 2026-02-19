# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a **multi-repo workspace** containing two independent projects, each with its own git repository:

- `multi-repo-nextjs/` — Next.js web application
- `multi-repo-ios/` — SwiftUI iOS application

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
- `app/page.tsx` — Home page
- `app/globals.css` — Tailwind v4 via `@import "tailwindcss"` with CSS custom properties for theming
- Path alias: `@/*` maps to project root
- Dark mode via `prefers-color-scheme` media query and CSS variables
- No API routes, middleware, auth, or database integration currently exists

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

---

## Claude Skills (Workspace Automation)

Invoke these in any Claude session opened at the workspace root:

| Skill | Invocation | Purpose |
|-------|-----------|---------|
| Cross-Platform Feature | `/cross-platform-feature <name>` | Scaffold a feature on both platforms + Supabase migration stub + PRD |
| Design Token Sync | `/design-token-sync` | Push CSS custom properties from `globals.css` → `DesignTokens.swift` |
| Figma Component Sync | `/figma-component-sync [component]` | Sync Figma design system → `docs/components.md` registry; generate implementation brief for a component |
| Supabase Setup | `/supabase-setup [project-ref]` | Wire Supabase client to both Next.js and iOS |
| New Screen | `/new-screen <description>` | UI-only screen scaffold on both platforms |
| PRD Update | `/prd-update [feature\|all]` | Update PRDs and all CLAUDE.md files to match current codebase |

## Subagents

These run automatically when Claude needs them, or invoke explicitly:

| Agent | Purpose |
|-------|---------|
| `cross-platform-reviewer` | Side-by-side parity report: what's missing on web vs iOS |
| `design-consistency-checker` | Flags hardcoded values, token mismatches, and two-layer architecture violations |
| `design-system-sync` | Fetches Figma components/tokens via MCP, validates code parity, generates implementation briefs |
| `supabase-schema-validator` | Validates Swift models and TS types match the live Supabase schema |

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

## Cross-Platform Conventions

- **Feature naming**: use the same **PascalCase** name on both platforms (e.g. `UserProfile`)
- **Routes**: kebab-case on web (`/user-profile`) maps to PascalCase on iOS (`UserProfileView.swift`)
- **All screens exist on both platforms** unless explicitly marked web-only or iOS-only in the feature's PRD
- After completing a feature, run `/prd-update` to keep docs current

## Design Token Architecture (Two-Layer)

Tokens follow a **Primitive → Semantic** architecture matching the Figma variable collections:

| Layer | Web (CSS) | iOS (Swift) | Used In |
|-------|-----------|-------------|---------|
| **Primitive** | `--color-zinc-950` | `Color.colorZinc950` | `globals.css` and `DesignTokens.swift` ONLY |
| **Semantic** | `--surfaces-brand-interactive` | `Color.surfacesBrandInteractive` | All component files |

**Rules:**
- **Never use Primitive tokens in component files** — the `design-token-guard` hook blocks this
- **Never hardcode hex values** in `.tsx`/`.ts`/`.swift` component files
- Semantic tokens reference Primitives via `var(--color-*)` (CSS) or `colorZinc*` (Swift)
- Legacy aliases (`--surface-brand` / `Color.appSurfaceBrand`) still work but new code must use Semantic names

**Naming convention:** Figma `Surfaces/BrandInteractive` → CSS `--surfaces-brand-interactive` → Swift `Color.surfacesBrandInteractive`

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
```

- iOS components are prefixed `App` to avoid SwiftUI naming conflicts
- Figma variant axes map to component props (`Type` → `variant`, `Size` → `size`, `State` → built-in hover/active/disabled)
- Disabled state = **0.5 opacity** on container (no separate tokens)
- Run `/figma-component-sync <name>` before implementing a component to get the Figma spec

### Implemented Components

| Component | Web | iOS |
|-----------|-----|-----|
| Button | `app/components/Button/Button.tsx` | `Components/Button/AppButton.swift` |

See `docs/components.md` for the full list with Figma node IDs and variant details.

## Icon System (Phosphor Icons)

**Library:** [Phosphor Icons](https://phosphoricons.com/) — same set in Figma, web, and iOS.

| Rule | Web | iOS |
|------|-----|-----|
| Package | `@phosphor-icons/react` | PhosphorSwift (SPM) |
| Usage | `<Icon name="House" />` | `Ph.house.regular.iconSize(.md)` |
| Import | `from "@/app/components/icons"` | `import PhosphorSwift` |
| Default weight | `regular` | `.regular` |
| Default size | `md` (20px) | `.md` (20pt) via `.iconSize(.md)` |
| Color | `var(--icon-primary)` | `.iconColor(.appIconPrimary)` |
| Never do | Import from `@phosphor-icons/react` directly | Hardcode `.frame(width:height:)` without token |

**iOS pattern:** `Ph.<name>.<weight>.iconSize(.<token>)` — icons are static members of `Ph`, not instantiated. Size/color/accessibility helpers are in `PhosphorIconHelper.swift`.

**Size mapping** (identical on both platforms):
`xs`=12 · `sm`=16 · `md`=20 · `lg`=24 · `xl`=32

**Weights:** `thin` · `light` · `regular` _(default)_ · `bold` · `fill` · `duotone`

**From Figma:** icon name (PascalCase in sidebar) → `name` prop on web, `Ph.<camelCase>` on iOS. Weight layer → `weight` prop / weight member. Size from Dimensions → nearest token.

See `docs/design-tokens.md#icon-system` for full reference.

## Hook Reminders

`.claude/settings.json` hooks fire automatically in every session:
- **design-token-guard** (PreToolUse): **BLOCKS** writes that use Primitive tokens (`var(--color-*)` or `Color.colorZinc*`) in component files — enforces Semantic-only usage
- Editing `package-lock.json` directly is **blocked** — use `npm install` instead
- After editing a `.swift` file → reminded to check the web counterpart
- After editing `.tsx`/`.ts` files → reminded to check the iOS counterpart
- After editing `globals.css` or Swift Color files → prompted to run `/design-token-sync`
- After each successful session → evaluate if `docs/`, `.claude/agents/`, or `.claude/skills/` need updating
