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
| Figma Component Sync | `/figma-component-sync [component]` | Sync Figma design system → `docs/components.md` registry; generate implementation brief for an **atomic** component |
| Complex Component | `/complex-component <name>` | Build a complex component (2+ atoms): runs clarification phase, designs props/state/tree, then implements on both platforms |
| Component Audit | `/component-audit <name>` | Audit a component for token compliance, comment quality, cross-platform parity, and accessibility — run before marking Done |
| Token Validation | `/validate-tokens [name\|--all]` | Audit components for semantic token misuse (BaseHighContrast/BaseLowContrastPressed in wrong contexts, primitive leakage, hardcoded values) |
| Supabase Setup | `/supabase-setup [project-ref]` | Wire Supabase client to both Next.js and iOS |
| New Screen | `/new-screen <description>` | UI-only screen scaffold on both platforms |
| PRD Update | `/prd-update [feature\|all]` | Update PRDs and all CLAUDE.md files to match current codebase |
| Git Push | `/git-push` | Commit and push all repos from the workspace root |
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
```

### Required States

Every screen with data must handle all four states:

| State | Web | iOS |
|-------|-----|-----|
| **Loading** | `loading.tsx` or inline `AppProgressLoader` | `AppProgressLoader` with `isLoading` |
| **Empty** | Empty state illustration + message | Empty state text + optional action |
| **Error** | `error.tsx` or inline error + retry | `.appAlert` or inline error + retry |
| **Populated** | Normal content render | Normal content render |

UI-only screens (no data fetching) are exempt from loading/error states.

### Data Fetching Patterns

**Web (Next.js):** Use React Server Components by default. Fetch data in `page.tsx` as an `async` component. Use `use client` only when interactivity is needed. Type data with `database.types.ts`.

**iOS (SwiftUI):** Use `@Observable` ViewModels. Fetch data in the ViewModel's `load()` method called from `.task {}`. Type data with Swift model structs in `Models/`.

### Navigation Wiring

- **Web:** Ensure the route is linked from `AdaptiveNavShell` sidebar/bottom-nav or from another page
- **iOS:** The screen is reachable through `AdaptiveNavShell` tabs or `AdaptiveSplitView` navigation
- After creating a screen, verify navigation with the `screen-reviewer` agent

### Responsive Layout Requirements

Every screen must handle both compact and regular layouts:

- **Web:** Use `md:` Tailwind prefix for desktop overrides. Default (no prefix) = mobile layout.
- **iOS:** Read `@Environment(\.horizontalSizeClass)` when layout differs between phone and iPad.
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

| Component | Web | iOS |
|-----------|-----|-----|
| Button | `app/components/Button/Button.tsx` | `Components/Button/AppButton.swift` |
| IconButton | `app/components/IconButton/IconButton.tsx` | `Components/IconButton/AppIconButton.swift` |
| Badge | `app/components/Badge/Badge.tsx` | `Components/Badge/AppBadge.swift` |
| Label | `app/components/Label/Label.tsx` | `Components/Label/AppLabel.swift` |
| Chips | `app/components/Chip/Chip.tsx` | `Components/Chip/AppChip.swift` |
| Tabs | `app/components/Tabs/Tabs.tsx` | `Components/Tabs/AppTabs.swift` |
| SegmentControlBar | `app/components/SegmentControlBar/SegmentControlBar.tsx` | `Components/SegmentControlBar/AppSegmentControlBar.swift` |
| Thumbnail | `app/components/Thumbnail/Thumbnail.tsx` | `Components/Thumbnail/AppThumbnail.swift` |
| InputField | `app/components/InputField/InputField.tsx` | `Components/InputField/AppInputField.swift` |
| Toast | `app/components/Toast/Toast.tsx` | `Components/Toast/AppToast.swift` |
| Divider | `app/components/Divider/Divider.tsx` | `Components/Divider/AppDivider.swift` |
| TextBlock _(pattern)_ | `app/components/patterns/TextBlock/TextBlock.tsx` | `Components/Patterns/AppTextBlock.swift` |
| StepIndicator _(pattern)_ | `app/components/patterns/StepIndicator/StepIndicator.tsx` | `Components/Patterns/AppStepIndicator.swift` |
| Stepper _(pattern)_ | `app/components/patterns/Stepper/Stepper.tsx` | `Components/Patterns/AppStepper.swift` |
| ListItem _(pattern)_ | `app/components/patterns/ListItem/ListItem.tsx` | `Components/Patterns/AppListItem.swift` |

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
- After each successful session → evaluate if `docs/`, `.claude/agents/`, or `.claude/skills/` need updating
