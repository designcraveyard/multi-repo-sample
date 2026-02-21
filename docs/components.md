# Component Registry

This is the single source of truth mapping Figma design system components to their code implementations on both platforms.

> **Auto-maintained** — run `/figma-component-sync` after adding or modifying atomic components to keep this file current.
> For complex components (composing 2+ atoms), run `/complex-component <name>` to start and `/component-audit <name>` before marking Done.

## Figma File

**bubbles-kit** — `ZtcCQT96M2dJZjU35X8uMQ`

---

## Atomic UI Components

Self-contained components with no child component dependencies. Figma is **structural truth** for these.

| # | Figma Component | Figma Node | Variants | Web Implementation | iOS Implementation | Status |
|---|----------------|-----------|----------|-------------------|-------------------|--------|
| 1 | **Button** | `66:1818` | Type(Primary/Secondary/Tertiary/Success/Danger) × State(Default/Hover/Pressed/Disabled) = 20 | `app/components/Button/Button.tsx` | `Components/Button/AppButton.swift` | Done |
| 2 | **IconButton** | `76:208` | Type(Primary/Secondary/Tertiary/Quarternary/Success/Danger) × State(Default/Hover/Pressed/Disabled) × Size(Small/Medium/Large) = 72 | `app/components/IconButton/IconButton.tsx` | `Components/IconButton/AppIconButton.swift` | Done |
| 3 | **Badge** | `87:1071` | Size(Small/Number/Tiny/Medium) × Subtle(Off/On) × Type(Brand/Success/Error/Accent) = 32 | `app/components/Badge/Badge.tsx` | `Components/Badge/AppBadge.swift` | Done |
| 4 | **Label** | `82:1401` | Size(Small/Medium/Large) × Type(SecondaryAction/Information/PrimaryAction/BrandInteractive) = 12 | `app/components/Label/Label.tsx` | `Components/Label/AppLabel.swift` | Done |
| 5 | **Chips** | `76:460` | Type(ChipTabs/Filters/SegmentControl) × State(Default/Hover/Pressed/Disabled) × Active(Off/On) = 24 | `app/components/Chip/Chip.tsx` | `Components/Chip/AppChip.swift` | Done |
| 6 | **Tabs** | `78:284` | Size(Small/Medium/Large) × Active(Off/On) = 6 | `app/components/Tabs/Tabs.tsx` | `Components/Tabs/AppTabs.swift` | Done |
| 7 | **SegmentControlBar** | `81:637` | Size(Small/Medium/Large) × Type(SegmentControl/Chips/Filters) = 9 | `app/components/SegmentControlBar/SegmentControlBar.tsx` | `Components/SegmentControlBar/AppSegmentControlBar.swift` | Done |
| 8 | **Thumbnail** | `82:1235` | Sizes(xs/sm/md/lg/xl/xxl) × Rounded(Off/On) = 12 | `app/components/Thumbnail/Thumbnail.tsx` | `Components/Thumbnail/AppThumbnail.swift` | Done |
| 9 | **Input Field** | `90:3753` | State(Default/Disabled/Focus/Filled/Success/Warning/Error) × Type(Default/TextField) = 11; slots: leadingLabel · leadingSeparator · leadingIcon \| input \| trailingIcon · trailingSeparator · trailingLabel | `app/components/InputField/InputField.tsx` | `Components/InputField/AppInputField.swift` | Done |
| 10 | **Toast Message** | `108:4229` | Type(Default/Success/Warning/Error/Info) × has-action × has-dismiss | `app/components/Toast/Toast.tsx` | `Components/Toast/AppToast.swift` | Done |
| 11 | **Date Component** | `93:4399` | Toggle(Off/On) = 2 | — | — | Not started |
| 12 | **StreakChecks** | `94:1795` | Property1(CheckCircle/Circle/CircleNotch/ArrowCircleRight/XCircle) = 5 | — | — | Not started |
| 13 | **Divider** | `95:2092` | Type(SectionDivider/RowDivider) = 2 | `app/components/Divider/Divider.tsx` | `Components/Divider/AppDivider.swift` | Done |
| 14 | **StepIndicator** | `108:9891` | Completed(Off/On) = 2 | `app/components/patterns/StepIndicator/StepIndicator.tsx` | `Components/Patterns/AppStepIndicator.swift` | Done |
| 15 | **Waveform** | (see Figma) | 1 component set | — | — | Not started |

---

## Complex UI Components (Patterns)

Components that compose 2+ atomic components, or are multi-slot typography/layout patterns. Figma provides **visual reference only** — component tree, state ownership, and interaction model are defined in code and clarified with the user before implementation.

Patterns live in a dedicated `patterns/` subdirectory on both platforms:
- Web: `app/components/patterns/<Name>/`
- iOS: `Components/Patterns/App<Name>.swift`

> Start with `/complex-component <name>` · Validate with `/component-audit <name>` · Use `complex-component-reviewer` agent for final check

| # | Component | Figma Reference | Composes | Web Implementation | iOS Implementation | Status |
|---|-----------|----------------|----------|-------------------|-------------------|--------|
| 1 | **TextBlock** | `84:789` | — (typography-only pattern) | `app/components/patterns/TextBlock/TextBlock.tsx` | `Components/Patterns/AppTextBlock.swift` | Done |
| 2 | **StepIndicator** | `108:9891` | — (atomic, also in Atomic table) | `app/components/patterns/StepIndicator/StepIndicator.tsx` | `Components/Patterns/AppStepIndicator.swift` | Done |
| 3 | **Stepper** | `108:4357` (TimelineStepper) | TextBlock + StepIndicator | `app/components/patterns/Stepper/Stepper.tsx` | `Components/Patterns/AppStepper.swift` | Done |
| 4 | **ListItem** | (bubbles-kit ListItem) | TextBlock + Thumbnail + Button + IconButton + Badge + Divider | `app/components/patterns/ListItem/ListItem.tsx` | `Components/Patterns/AppListItem.swift` | Done |

### Complex Component Status Legend

| Status | Meaning |
|--------|---------|
| Designing | Clarification phase in progress — props/state/tree being defined |
| In Progress | Code being written on one or both platforms |
| Needs Audit | Code done, `/component-audit` not yet run |
| Done | Audit passed on both platforms |

### Internal / Prefixed Components

Components prefixed with `_` are internal building blocks used by higher-level components. They generally don't need standalone code implementations — they're composed into their parent components.

| Figma Component | Figma Node | Used By |
|----------------|-----------|---------|
| _Button | `53:321` | Button (3 variants — likely internal base) |
| _Chip | (see Figma) | Chips, SegmentControlBar |
| _Tabs | `76:660` | SegmentControlBar (tab item building block) |
| _InputField | `90:3525` | InputField — base primitive with 6 boolean slot props (leadingLabel, leadingSeparator, leadingCursor, trailingCursor, trailingSeparator, trailingLabel) |

---

## Figma Code Connect Map

Maps each Figma component key to its code location for instant lookup.

```jsonc
{
  // Button
  "fc454630b800dfc4b947682db3eede82a68afaa3": {
    "web": "multi-repo-nextjs/app/components/Button/Button.tsx",
    "ios": "multi-repo-ios/multi-repo-ios/Components/Button/AppButton.swift"
  }
  // IconButton — not yet implemented
  // "75482a7cb1cd41ce95e98329e37b701f26dacf59": { "web": null, "ios": null }
}
```

### Demo Pages

| Route | File | What it covers |
|-------|------|---------------|
| `/input-demo` | `app/input-demo/page.tsx` | Label (all sizes/types/icon combos) + InputField (all states, all slot combos) + TextField (all states) |
| `/patterns-demo` | `app/patterns-demo/page.tsx` | TextBlock (all slots) + StepIndicator (on/off) + Stepper (all/mixed/single) + ListItem (all trailing variants) |

---

## Implementation Conventions

### File Structure

```
# Web (Next.js) — atomic
multi-repo-nextjs/app/components/<ComponentName>/
  ├── <ComponentName>.tsx     # Main component
  └── index.ts                # Public export

# Web (Next.js) — patterns (complex, 2+ atoms)
multi-repo-nextjs/app/components/patterns/<PatternName>/
  ├── <PatternName>.tsx
  └── index.ts

# iOS (SwiftUI) — atomic
multi-repo-ios/multi-repo-ios/Components/<ComponentName>/
  └── App<ComponentName>.swift    # Main component (prefixed App to avoid SwiftUI conflicts)

# iOS (SwiftUI) — patterns (complex, 2+ atoms)
multi-repo-ios/multi-repo-ios/Components/Patterns/
  └── App<PatternName>.swift
```

### Naming Rules

| Figma | Web File | Web Export | iOS File | iOS Type |
|-------|----------|-----------|----------|----------|
| Button | `Button.tsx` | `<Button>` | `AppButton.swift` | `AppButton` |
| IconButton | `IconButton.tsx` | `<IconButton>` | `AppIconButton.swift` | `AppIconButton` |
| Input Field | `InputField.tsx` | `<InputField>` | `AppInputField.swift` | `AppInputField` |
| Badge | `Badge.tsx` | `<Badge>` | `AppBadge.swift` | `AppBadge` |

**Pattern:** Figma PascalCase name → web export name. iOS prefixes `App` to avoid name collisions with SwiftUI built-in types (e.g. `Label`, `Badge`).

### Variant Mapping

Figma variant axes become component props:

| Figma Axis | Web Prop | iOS Prop | Type |
|-----------|----------|----------|------|
| Type | `variant` | `variant` | Enum |
| State | Built-in (hover/active/disabled via CSS + attrs) | Built-in (gesture + `.disabled()`) | N/A |
| Size | `size` | `size` | Enum |
| Subtle | `subtle` | `subtle` | Boolean |
| Active | `isActive` | `isActive` | Boolean |
| Rounded | `rounded` | `rounded` | Boolean |

### Token Usage

All visual properties MUST use **Semantic layer** tokens (never primitives, never hardcoded values):

| Property | Web | iOS |
|----------|-----|-----|
| Background | `bg-[var(--surfaces-*)]` | `Color.surfaces*` |
| Text color | `text-[var(--typography-*)]` | `Color.typography*` |
| Border | `border-[var(--border-*)]` | `Color.border*` |
| Icon color | `text-[var(--icons-*)]` | `Color.icons*` |
| Spacing | Tailwind utilities (`gap-2`, `px-4`) | `CGFloat.space*` tokens |
| Font | Tailwind or `var(--font-*)` | `Font.app*` tokens |
| Corner radius | `rounded-full` for pill, `rounded-*` | `.clipShape(Capsule())` for pill |

### Disabled State

All components use **opacity 0.5** on the container for disabled — no separate disabled color tokens.

- Web: `disabled:opacity-50 disabled:cursor-not-allowed`
- iOS: `.opacity(isDisabled ? 0.5 : 1.0)` + `.allowsHitTesting(!isDisabled)`

### Comment Standards

Required in all component files. The `comment-enforcer` hook will remind you if a file over 80 lines has fewer than 3 comment lines.

**Web (TSX):**
```tsx
/**
 * ComponentName — one-line description of purpose.
 *
 * Key props: variant, size, [any non-obvious ones].
 * State ownership: [who owns what if composing children].
 */

// --- Props
// --- State (if stateful)
// --- Helpers / Derived values
// --- Render
```

**iOS (Swift):**
```swift
// MARK: - ComponentName
// Purpose: one-line description.
// Key props: variant, size, [any non-obvious ones].
// State ownership: [who owns what if composing children].

// MARK: - Properties
// MARK: - Body
// MARK: - Subviews
// MARK: - Helpers
```

For **atomic components** (simple, <80 lines): a single JSDoc / header comment on the exported symbol is sufficient. Section headers are not required.

For **complex components** (composing 2+ atoms, or >80 lines): all section headers are required.

---

## How to Implement a New Component

### Atomic Components (no child component dependencies)

1. **Look up the Figma component** in the Atomic table above — note its node ID and variant axes
2. **Fetch Figma spec** via `/figma-component-sync <name>` or `figma_get_component_for_development(nodeId: "<nodeId>")`
3. **Create web component** at `app/components/<Name>/<Name>.tsx` following the variant → prop mapping
4. **Create iOS component** at `Components/<Name>/App<Name>.swift` following the same pattern
5. **Use only Semantic tokens** — the design-token-guard hook will block primitive tokens in component files
6. **Update this registry** — set Status to "Done" and fill in the implementation paths
7. **Run `/figma-component-sync`** to validate everything is connected

### Complex Components (composing 2+ atomic components)

> **Do not start from Figma layers.** Figma is visual reference only for complex components.

1. **Run `/complex-component <name>`** — this starts an interactive clarification phase covering state ownership, props API, interaction model, keyboard navigation, and accessibility before any code is written
2. **Approve the proposed design** (props interface, state diagram, component tree) before implementation begins
3. **Add section comments** — Web: `// --- Section`, iOS: `// MARK: - Section` headers are required
4. **Add JSDoc / header comment** on the exported component explaining purpose and key props
5. **Update this registry** — add a row in the Complex Components table with Status "In Progress"
6. **Run `/component-audit <name>`** before marking Done — catches token violations, comment gaps, and parity issues
7. **Trigger `complex-component-reviewer`** for a final parallel check if the component is large

---

## Figma MCP Quick Reference

```bash
# Search for a component
figma_search_components(query: "Button")

# Get full variant details
figma_get_component_details(componentKey: "fc454630...")

# Get implementation-ready spec (image + layout + tokens)
figma_get_component_for_development(nodeId: "66:1818")

# Get metadata only
figma_get_component(nodeId: "66:1818", format: "metadata")

# Instantiate a component on canvas
figma_instantiate_component(componentKey: "fc454630...", variant: { Type: "Primary", State: "Default" })
```
