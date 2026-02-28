# Chip

**Figma:** bubbles-kit › `76:460`
**Android:** `multi-repo-android/.../ui/components/AppChip.kt`
**Axes:** Type(ChipTabs/Filters/SegmentControl) × State(Default/Hover/Pressed/Disabled) × Active(Off/On) = 24

A single selection pill used in tab rows, filter rows, or segment controls. Typically composed into `SegmentControlBar` rather than used standalone.

---

## Props

### Web (`ChipProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `ChipVariant` | `"chipTabs"` | Visual and behavioral style |
| `size` | `ChipSize` | `"md"` | Size of the chip |
| `label` | `string` | — | Display label (required) |
| `isActive` | `boolean` | `false` | Selected/active state |
| `leadingIcon` | `ReactNode` | — | Icon before the label |
| `trailingIcon` | `ReactNode` | — | Icon after the label |
| `disabled` | `boolean` | `false` | Disables interaction; applies 0.5 opacity |
| `onClick` | `() => void` | — | Tap/click handler |
| `className` | `string` | `""` | Extra Tailwind classes |

### iOS (`AppChip`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `String` | — | Display label (required) |
| `variant` | `AppChipVariant` | `.chipTabs` | Visual style |
| `size` | `AppChipSize` | `.md` | Size |
| `isActive` | `Bool` | `false` | Selected state |
| `isDisabled` | `Bool` | `false` | Disabled state |
| `leadingIcon` | `AnyView?` | `nil` | Leading icon view |
| `trailingIcon` | `AnyView?` | `nil` | Trailing icon view |
| `action` | `() -> Void` | — | Tap handler |

### Android (`AppChip`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `String` | — | Display label (required) |
| `onClick` | `() -> Unit` | — | Click handler (required) |
| `modifier` | `Modifier` | `Modifier` | Compose modifier |
| `variant` | `ChipVariant` | `ChipVariant.ChipTabs` | Visual style (`ChipTabs`/`Filters`/`SegmentControl`) |
| `size` | `ChipSize` | `ChipSize.Md` | Size (`Sm`/`Md`/`Lg`) |
| `isActive` | `Boolean` | `false` | Selected/active state |
| `leadingIcon` | `ImageVector?` | `null` | Leading icon |
| `trailingIcon` | `ImageVector?` | `null` | Trailing icon |
| `isDisabled` | `Boolean` | `false` | Disabled state; applies 0.5 opacity |

---

## Variants

### `ChipVariant` / `AppChipVariant`

| Variant | Description | Active style |
|---------|-------------|-------------|
| `chipTabs` | Borderless pill; single-select tab style | Filled low-contrast-pressed bg |
| `filters` | Bordered pill; multi-select filter style | Filled with active border |
| `segmentControl` | Used inside `SegmentControlBar`; sliding thumb mechanism | Handled by parent bar |

---

## Sizes

| Size | Padding (Web) | Font | iOS |
|------|--------------|------|-----|
| `sm` | `px-2 py-1` | `cta-sm` (12px/600) | `.sm` |
| `md` | `px-3 py-1.5` | `cta-md` (14px/600) | `.md` |
| `lg` | `px-4 py-2` | `cta-lg` (16px/600) | `.lg` |

---

## States

| State | Appearance |
|-------|-----------|
| Default (inactive) | `--typography-secondary` text, low-contrast bg |
| Active | `--typography-primary` text, low-contrast-pressed bg (chipTabs) / active border (filters) |
| Hover | `--surfaces-base-low-contrast-pressed` bg |
| Disabled | 0.5 opacity on the container |

---

## Token Usage

| Property | Token |
|----------|-------|
| Active bg (chipTabs) | `--surfaces-base-low-contrast-pressed` / `Color.surfacesBaseLowContrastPressed` |
| Inactive bg (chipTabs) | `--surfaces-base-low-contrast` / `Color.surfacesBaseLowContrast` |
| Active border (filters) | `--border-active` / `Color.borderActive` |
| Default border (filters) | `--border-default` / `Color.borderDefault` |
| Active text | `--typography-primary` / `Color.typographyPrimary` |
| Inactive text | `--typography-secondary` / `Color.typographySecondary` |

---

## Accessibility

- Web: `role="tab"` + `aria-selected` for `chipTabs`; `aria-pressed` for `filters`
- Disabled: `aria-disabled="true"` + `pointer-events: none`
- iOS: `.accessibilityAddTraits(.isButton)` + `.accessibilityValue(isActive ? "selected" : "unselected")`
- Android: TalkBack announces active state via Material 3 built-in semantics; `isDisabled` maps to `enabled = false` for proper accessibility

---

## Usage Examples

### Web

```tsx
import { Chip } from "@/app/components/Chip";
import { Icon } from "@/app/components/icons";

// Basic active chip
<Chip variant="chipTabs" label="Trending" isActive />

// Filter chip with icon
<Chip
  variant="filters"
  size="sm"
  label="Photos"
  leadingIcon={<Icon name="Image" />}
  isActive={selectedFilters.includes("photos")}
  onClick={() => toggleFilter("photos")}
/>

// Disabled
<Chip variant="chipTabs" label="Coming soon" disabled />
```

### iOS

```swift
import SwiftUI

// Basic active chip
AppChip(label: "Trending", isActive: true) { }

// Filter chip
AppChip(
    label: "Photos",
    variant: .filters,
    size: .sm,
    isActive: selectedFilters.contains("photos"),
    leadingIcon: AnyView(Ph.image.regular.iconSize(.sm))
) {
    toggleFilter("photos")
}
```

### Android

```kotlin
// Basic active chip
AppChip(
    label = "Design",
    variant = ChipVariant.ChipTabs,
    isActive = true,
    onClick = { selectTab("design") }
)

// Filter chip with icon
AppChip(
    label = "Photos",
    variant = ChipVariant.Filters,
    size = ChipSize.Sm,
    isActive = selectedFilters.contains("photos"),
    leadingIcon = Icons.Default.Image,
    onClick = { toggleFilter("photos") }
)

// Disabled
AppChip(
    label = "Coming soon",
    isDisabled = true,
    onClick = { }
)
```

---

## Composition Note

`Chip` is typically consumed by `SegmentControlBar` rather than used directly. Use `SegmentControlBar` when you need a row of chips with unified selection state. Use standalone `Chip` only for one-off single chips.

See also: [`SegmentControlBar`](./SegmentControlBar.md)
