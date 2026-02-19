# Component Registry

This is the single source of truth mapping Figma design system components to their code implementations on both platforms.

> **Auto-maintained** — run `/figma-component-sync` after adding or modifying components to keep this file current.

## Figma File

**bubbles-kit** — `ZtcCQT96M2dJZjU35X8uMQ`

---

## UI Components

| # | Figma Component | Figma Node | Variants | Web Implementation | iOS Implementation | Status |
|---|----------------|-----------|----------|-------------------|-------------------|--------|
| 1 | **Button** | `66:1818` | Type(Primary/Secondary/Tertiary/Success/Danger) × State(Default/Hover/Pressed/Disabled) = 20 | `app/components/Button/Button.tsx` | `Components/Button/AppButton.swift` | Done |
| 2 | **IconButton** | `76:208` | Type(Primary/Secondary/Tertiary/Quarternary/Success/Danger) × State(Default/Hover/Pressed/Disabled) × Size(Small/Medium/Large) = 72 | — | — | Not started |
| 3 | **Badge** | `87:1071` | Size(Small/Number/Tiny/Medium) × Subtle(Off/On) × Type(Brand/Success/Error/Accent) = 32 | — | — | Not started |
| 4 | **Label** | `82:1401` | Size(Small/Medium/Large) × Type(SecondaryAction/Information/PrimaryAction/BrandInteractive) = 12 | — | — | Not started |
| 5 | **Chips** | `76:460` | Type(ChipTabs/Filters/SegmentControl) × State(Default/Hover/Pressed/Disabled) × Active(Off/On) = 24 | — | — | Not started |
| 6 | **_Tabs** (tab item) | `76:660` | Size(Small/Medium/Large) × Active(Off/On) = 6 | — | — | Not started |
| 7 | **SegmentControlBar** | `81:637` | Size(Small/Medium/Large) × Type(SegmentControl/Chips/Filters) = 9 | — | — | Not started |
| 8 | **Thumbnail** | `82:1235` | Sizes(xs/sm/md/lg/xl/xxl) × Rounded(Off/On) = 12 | — | — | Not started |
| 9 | **Input Field** | `90:3753` | State(Default/Disabled/Focus/Filled/Success/Warning/Error) × Type(Default/TextField) = 11 | — | — | Not started |
| 10 | **Date Component** | `93:4399` | Toggle(Off/On) = 2 | — | — | Not started |
| 11 | **StreakChecks** | `94:1795` | Property1(CheckCircle/Circle/CircleNotch/ArrowCircleRight/XCircle) = 5 | — | — | Not started |
| 12 | **Divider** | `95:2092` | Type(SectionDivider/RowDivider) = 2 | — | — | Not started |
| 13 | **StepIndicator** | `108:9891` | Completed(Off/On) = 2 | — | — | Not started |
| 14 | **Waveform** | (see Figma) | 1 component set | — | — | Not started |

### Internal / Prefixed Components

Components prefixed with `_` are internal building blocks used by higher-level components. They generally don't need standalone code implementations — they're composed into their parent components.

| Figma Component | Figma Node | Used By |
|----------------|-----------|---------|
| _Button | `53:321` | Button (3 variants — likely internal base) |
| _Chip | (see Figma) | Chips, SegmentControlBar |
| _Tabs | `76:660` | SegmentControlBar (tab item building block) |

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

---

## Implementation Conventions

### File Structure

```
# Web (Next.js)
multi-repo-nextjs/app/components/<ComponentName>/
  ├── <ComponentName>.tsx     # Main component
  └── index.ts                # Public export

# iOS (SwiftUI)
multi-repo-ios/multi-repo-ios/Components/<ComponentName>/
  └── App<ComponentName>.swift    # Main component (prefixed App to avoid SwiftUI conflicts)
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

---

## How to Implement a New Component

1. **Look up the Figma component** in the table above — note its node ID and variant axes
2. **Fetch Figma spec** via `figma_get_component(nodeId: "<nodeId>", format: "metadata")` or `figma_get_component_for_development(nodeId: "<nodeId>")`
3. **Create web component** at `app/components/<Name>/<Name>.tsx` following the variant → prop mapping
4. **Create iOS component** at `Components/<Name>/App<Name>.swift` following the same pattern
5. **Use only Semantic tokens** — the design-token-guard hook will block primitive tokens in component files
6. **Update this registry** — set Status to "Done" and fill in the implementation paths
7. **Run `/figma-component-sync`** to validate everything is connected

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
