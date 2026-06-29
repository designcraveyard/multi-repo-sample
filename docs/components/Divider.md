# Divider

**Figma:** bubbles-kit › `95:2092`
**Android:** `multi-repo-android/.../ui/components/AppDivider.kt`
**Axes:** Type(SectionDivider/RowDivider) = 2

A horizontal (or vertical) separator line. Two weights: `section` for between page sections, `row` for between list/table rows.

---

## Props

### Web (`DividerProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `DividerType` | `"row"` | Visual weight |
| `orientation` | `DividerOrientation` | `"horizontal"` | Line direction |
| `label` | `string` | — | Optional centered label (horizontal + section only) |
| `className` | `string` | `""` | Extra Tailwind classes |

### iOS (`AppDivider`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `AppDividerType` | `.row` | Visual weight |
| `orientation` | `AppDividerOrientation` | `.horizontal` | Line direction |
| `label` | `String?` | `nil` | Optional centered label |

### Android (`AppDivider`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modifier` | `Modifier` | `Modifier` | Compose modifier |
| `type` | `AppDividerType` | `AppDividerType.Row` | Visual weight (`Section`/`Row`) |
| `orientation` | `AppDividerOrientation` | `AppDividerOrientation.Horizontal` | Line direction |
| `label` | `String?` | `null` | Optional centered label |

---

## Types

| Type | Height (web) | Fill token | Use case |
|------|-------------|-----------|----------|
| `row` | 1 px | `--border-muted` | Between list rows, table rows |
| `section` | 8 px (solid block) | `--border-default` | Between page sections / content groups |

The `section` divider is a **filled block** (not a line), giving it heavier visual weight.

---

## Orientation

| Orientation | Element | Notes |
|-------------|---------|-------|
| `horizontal` | `<hr>` or labeled `<div>` | Default; stretches full width |
| `vertical` | Inline `<span>` | 2 px wide, `self-stretch` height; use inside `flex` rows |

---

## Label Variant

When `label` is set (horizontal + section only), the divider renders two lines flanking centered text:

```
──────────  OR TODAY  ──────────
```

- Label text uses `caption-sm` typography + `--typography-muted` color
- Line fill uses `--border-default` (section) or `--border-muted` (row)

---

## Token Usage

| Property | Token |
|----------|-------|
| Row line | `--border-muted` / `Color.borderMuted` / `SemanticColors.borderMuted` |
| Section block | `--border-default` / `Color.borderDefault` / `SemanticColors.borderDefault` |
| Vertical line | `--border-default` / `Color.borderDefault` / `SemanticColors.borderDefault` |
| Label text | `--typography-muted` / `Color.typographyMuted` / `SemanticColors.typographyMuted` |

---

## Accessibility

- Renders with `role="separator"` and `aria-orientation` on both web and iOS
- Labels are wrapped in `<span>` (not included in the `aria-label`) — the label is decorative
- Android: Uses Material 3 `HorizontalDivider`/`VerticalDivider` semantics; TalkBack treats as separator; label is decorative

---

## Usage Examples

### Web

```tsx
import { Divider } from "@/app/components/Divider";

// Row divider (between list items)
<AppListItem title="Pack luggage" divider />
{/* or standalone: */}
<Divider />

// Section divider (between page sections)
<Divider type="section" />

// Labeled section divider
<Divider type="section" label="OR TODAY" />

// Vertical divider (2 px, border-default)
<div className="flex items-center gap-2">
  <span>Home</span>
  <Divider orientation="vertical" />
  <span>Profile</span>
</div>
```

### iOS

```swift
// Row divider (default)
AppDivider()

// Section divider
AppDivider(type: .section)

// Labeled divider
AppDivider(type: .section, label: "OR TODAY")

// Vertical divider (2 pt, border-default)
AppDivider(orientation: .vertical)
```

### Android

```kotlin
// Row divider (default)
AppDivider()

// Section divider
AppDivider(type = AppDividerType.Section)

// Labeled section divider
AppDivider(type = AppDividerType.Section, label = "or")

// Vertical divider (2 dp, border-default)
AppDivider(orientation = AppDividerOrientation.Vertical)
```

---

## Usage in ListItem

`AppListItem` and `ListItem` both accept a `divider: Bool` / `divider` prop that renders an `AppDivider()` / `<Divider />` below the row automatically — prefer that over inserting a standalone `Divider` between list items.
---

## Cross-Platform Audit

_Last refreshed: 2026-06-29_

| Platform | Source | Status | API snapshot |
|----------|--------|--------|--------------|
| Web | `multi-repo-nextjs/app/components/Divider/Divider.tsx` | Present | `type?: DividerType`, `orientation?: DividerOrientation`, `label?: string`, `className?: string` |
| iOS | `multi-repo-ios/multi-repo-ios/Components/Divider/AppDivider.swift` | Present | `type: AppDividerType = .row`, `orientation: AppDividerOrientation = .horizontal`, `label: String? = nil` |
| Android | `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppDivider.kt` | Present | `modifier: Modifier = Modifier`, `type: AppDividerType = AppDividerType.Row`, `orientation: AppDividerOrientation = AppDividerOrientation.Horizontal`, `label: String? = null` |

**Parity status:** Implemented on all three platforms.

**Token contract:** component code must use semantic tokens only: CSS `--surfaces-*`, `--typography-*`, `--icons-*`, and `--border-*`; Swift `Color.surfaces*`, `Color.typography*`, `Color.icons*`, and `Color.border*`; Kotlin `SemanticColors.*`, `Spacing.*`, `Radius.*`, `IconSize.*`, and `AppTypography.*`. Disabled state remains opacity 0.5 across platforms.

**Accessibility contract:** preserve semantic roles/labels, visible keyboard focus on web, VoiceOver labels/traits on iOS, and TalkBack semantics on Android when changing the component.
