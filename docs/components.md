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

## Native iOS Component Wrappers

Thin wrappers around SwiftUI system controls (iOS) and shadcn/ui primitives (web), each with an inline `const styling` config block using only semantic design tokens. **Always use these instead of raw SwiftUI APIs / raw shadcn primitives** in screen/feature files.

The `native-wrapper-guard` hook will warn if raw SwiftUI APIs (`Picker(`, `DatePicker(`, `.sheet(`, etc.) are used in screen files instead of these wrappers.

### Standalone Views

| # | Wrapper | Wraps | File | Key Props | Status |
|---|---------|-------|------|-----------|--------|
| 1 | **AppNativePicker** | `Picker` | `Components/Native/AppNativePicker.swift` | `selection`, `options: [PickerOption]`, `style: .menu/.segmented/.wheel`, `isDisabled`, `showError` | Done |
| 2 | **AppDateTimePicker** | `DatePicker` | `Components/Native/AppDateTimePicker.swift` | `selection: Date`, `mode: .date/.time/.dateAndTime`, `displayStyle: .compact/.graphical/.wheel`, `range` | Done |
| 3 | **AppProgressLoader** | `ProgressView` | `Components/Native/AppProgressLoader.swift` | `variant: .indefinite/.definite(value:total:)`, `label` | Done |
| 4 | **AppColorPicker** | `ColorPicker` | `Components/Native/AppColorPicker.swift` | `label`, `selection: Color`, `supportsOpacity` | Done |
| 5 | **AppBottomNavBar** | `TabView` | `Components/Native/AppBottomNavBar.swift` | `selectedTab: Binding<Int>`, `@ViewBuilder content` | Done |
| 6 | **AppCarousel** | `TabView(.page)` / `ScrollView` | `Components/Native/AppCarousel.swift` | `items`, `style: .paged/.scrollSnap`, `showDots`, `@ViewBuilder content` | Done |
| 7 | **AppTooltip** | `.popover` | `Components/Native/AppTooltip.swift` | `isPresented`, `tipText` or custom `tipContent`, `arrowEdge` | Done |
| 8 | **AppRangeSlider** | dual `Slider` | `Components/Native/AppRangeSlider.swift` | `lowerValue`, `upperValue`, `range`, `step`, `showLabels` | Done |

### ViewModifier Wrappers

Applied via dot-syntax on any `View` inside a `NavigationStack` or at the screen level.

| # | Wrapper | Wraps | File | Usage | Status |
|---|---------|-------|------|-------|--------|
| 9 | **AppBottomSheet** | `.sheet` | `Components/Native/AppBottomSheet.swift` | `.appBottomSheet(isPresented:detents:content:)` | Done |
| 10 | **AppActionSheet** | `.confirmationDialog` | `Components/Native/AppActionSheet.swift` | `.appActionSheet(isPresented:title:message:actions:)` | Done |
| 11 | **AppAlertPopup** | `.alert` | `Components/Native/AppAlertPopup.swift` | `.appAlert(isPresented:title:message:buttons:)` | Done |
| 12 | **AppPageHeader** | `.navigationTitle` + `.toolbar` | `Components/Native/AppPageHeader.swift` | `.appPageHeader(title:displayMode:trailingActions:)` | Done |
| 13 | **AppContextMenu** | `.contextMenu` | `Components/Native/AppContextMenu.swift` | `.appContextMenu(items:)` + `AppPopoverMenu(isPresented:items:label:)` | Done |

### Web Equivalents (Next.js)

Barrel import: `import { AppNativePicker, AppTooltip } from "@/app/components/Native";`

| # | Web Wrapper | Primitive | File | Key Props |
|---|-------------|-----------|------|-----------|
| 1 | **AppNativePicker** | shadcn `Select` | `app/components/Native/AppNativePicker.tsx` | `value`, `options: PickerOption[]`, `onChange`, `label`, `showError`, `disabled` |
| 2 | **AppDateTimePicker** | shadcn `Calendar` + `Popover` | `app/components/Native/AppDateTimePicker.tsx` | `value`, `onChange`, `mode`, `displayStyle`, `range`, `label`, `disabled` |
| 3 | **AppProgressLoader** | shadcn `Progress` | `app/components/Native/AppProgressLoader.tsx` | `variant: "indefinite"\|"definite"`, `value`, `total`, `label` |
| 4 | **AppColorPicker** | `<input type="color">` | `app/components/Native/AppColorPicker.tsx` | `value`, `onChange`, `label`, `showOpacity`, `disabled` |
| 5 | **AppBottomSheet** | vaul `Drawer` | `app/components/Native/AppBottomSheet.tsx` | `isPresented`, `onClose`, `children`, `title`, `description`, `snapPoints` |
| 6 | **AppCarousel** | shadcn `Carousel` (Embla) | `app/components/Native/AppCarousel.tsx` | `items: ReactNode[]`, `style: "paged"\|"scrollSnap"`, `showDots` |
| 7 | **AppTooltip** | shadcn `Tooltip` | `app/components/Native/AppTooltip.tsx` | `children`, `content`, `side`, `disabled` |
| 8 | **AppRangeSlider** | shadcn `Slider` | `app/components/Native/AppRangeSlider.tsx` | `lowerValue`, `upperValue`, `onChange`, `range`, `step`, `showLabels` |
| 9 | **AppActionSheet** | shadcn `AlertDialog` | `app/components/Native/AppActionSheet.tsx` | `isPresented`, `onClose`, `actions: AppActionSheetAction[]`, `title`, `message` |
| 10 | **AppAlertPopup** | shadcn `AlertDialog` | `app/components/Native/AppAlertPopup.tsx` | `isPresented`, `onClose`, `title`, `message`, `buttons: AlertButton[]` |
| 11 | **AppContextMenu** | shadcn `ContextMenu`/`DropdownMenu` | `app/components/Native/AppContextMenu.tsx` | `items: AppContextMenuItem[]`, `mode: "context"\|"dropdown"`, `children` |

> **AppBottomNavBar** and **AppPageHeader** have no web equivalents — web navigation is handled by Next.js App Router layouts.

### iOS Architecture Notes

- **Centralized styling:** All tokens live in `NativeComponentStyling.swift` — namespaced structs per component (e.g. `NativePickerStyling`, `NativeCarouselStyling`)
- **No hardcoded values:** Wrappers reference `NativeComponentStyling` structs for colors, spacing, typography, and layout constants
- **AppBottomNavBar** requires `NativeBottomNavStyling.applyAppearance()` in `multi_repo_iosApp.init()` (already wired)
- **AppBottomSheet** supports detent combinations: `[.medium, .large]` (default), `[.fraction(0.3)]` (compact), or any `Set<PresentationDetent>`
- **AppContextMenu** provides both a long-press context menu (`.appContextMenu(items:)`) and a tappable popover variant (`AppPopoverMenu`)
- **AppCarousel** has companion `AppCarouselDots` for animated pill-style page indicators
- **AppRangeSlider** fires haptics automatically: `UIImpactFeedbackGenerator(.light)` on thumb grab, `UISelectionFeedbackGenerator` on each discrete step change (step mode only — no haptics in continuous mode)
- **AppNativePicker** has no default border; the error border (red stroke) only appears when `showError: true`
- **AppDateTimePicker** `.wheel` style renders the label as a `Text` above the drum columns (`.labelsHidden()` on the `DatePicker`) so the full width is available to the wheel and the label never wraps

### Web Architecture Notes

- **Per-file styling block:** Each wrapper owns `const styling = { colors, layout, typography }` at the top — change tokens there to restyle globally
- **No hardcoded values:** All colors/spacing must reference semantic CSS custom properties (`var(--surfaces-*)`, `var(--typography-*)`, etc.)
- **AppCarousel** dot indicators use `CarouselApi` via `setApi` prop — no secondary `useEmblaCarousel` instance
- **AppContextMenu** `mode="context"` = right-click/long-press; `mode="dropdown"` = click-triggered popover
- **AppBottomSheet** snap points are fractions of screen height (e.g. `[0.5, 1]` = half + full)

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

| Platform | Route / Entry | File | What it covers |
|----------|--------------|------|---------------|
| Web | `/input-demo` | `app/input-demo/page.tsx` | Label (all sizes/types/icon combos) + InputField (all states, all slot combos) + TextField (all states) |
| Web | `/patterns-demo` | `app/patterns-demo/page.tsx` | TextBlock (all slots) + StepIndicator (on/off) + Stepper (all/mixed/single) + ListItem (all trailing variants) |
| iOS | Main tab (ContentView) | `multi-repo-ios/multi-repo-ios/ContentView.swift` | **All** atomic components (Button, IconButton, Badge, Chip, Tabs, SegmentControlBar, Thumbnail, InputField, Toast, Divider) + **All** complex patterns (TextBlock, StepIndicator, Stepper, ListItem) + **All 13 native wrappers** (Picker, DateTimePicker, ProgressLoader, ColorPicker, BottomSheet ×4 variants, ActionSheet, AlertPopup, ContextMenu ×2 variants, Carousel ×2 styles, Tooltip, RangeSlider ×2 modes, BottomNavBar live, PageHeader live) |

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
