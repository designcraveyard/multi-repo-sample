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
xcodebuild -project multi-repo-ios.xcodeproj -scheme multi-repo-ios -destination 'platform=iOS Simulator,name=iPhone 16' build
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
| Supabase Setup | `/supabase-setup [project-ref]` | Wire Supabase client to both Next.js and iOS |
| New Screen | `/new-screen <description>` | UI-only screen scaffold on both platforms |
| PRD Update | `/prd-update [feature\|all]` | Update PRDs and all CLAUDE.md files to match current codebase |

## Subagents

These run automatically when Claude needs them, or invoke explicitly:

| Agent | Purpose |
|-------|---------|
| `cross-platform-reviewer` | Side-by-side parity report: what's missing on web vs iOS |
| `design-consistency-checker` | Flags hardcoded values and token mismatches across both codebases |
| `supabase-schema-validator` | Validates Swift models and TS types match the live Supabase schema |

## Shared Documentation

| File | Purpose |
|------|---------|
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
- **Design tokens**: CSS `--token-name` → Swift `Color.appTokenName` (camelCase, `app` prefix)
- **All screens exist on both platforms** unless explicitly marked web-only or iOS-only in the feature's PRD
- After completing a feature, run `/prd-update` to keep docs current

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
- After editing a `.swift` file → reminded to check the web counterpart
- After editing `.tsx`/`.ts` files → reminded to check the iOS counterpart
- After editing `globals.css` or Swift Color files → prompted to run `/design-token-sync`
- Editing `package-lock.json` directly is **blocked** — use `npm install` instead
- After each successful session → evaluate if `docs/`, `.claude/agents/`, or `.claude/skills/` need updating
