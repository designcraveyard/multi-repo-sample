# Divider

**Figma:** bubbles-kit › `95:2092`
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

---

## Types

| Type | Height (web) | Fill token | Use case |
|------|-------------|-----------|----------|
| `row` | 1 px | `--surfaces-base-low-contrast-pressed` | Between list rows, table rows |
| `section` | 8 px (solid block) | `--surfaces-base-low-contrast` | Between page sections / content groups |

The `section` divider is a **filled block** (not a line), giving it heavier visual weight.

---

## Orientation

| Orientation | Element | Notes |
|-------------|---------|-------|
| `horizontal` | `<hr>` or labeled `<div>` | Default; stretches full width |
| `vertical` | Inline `<span>` | 1 px wide, `self-stretch` height; use inside `flex` rows |

---

## Label Variant

When `label` is set (horizontal + section only), the divider renders two lines flanking centered text:

```
──────────  OR TODAY  ──────────
```

- Label text uses `caption-sm` typography + `--typography-muted` color
- Line fill uses `--surfaces-base-low-contrast` (section) or `--surfaces-base-low-contrast-pressed` (row)

---

## Token Usage

| Property | Token |
|----------|-------|
| Row line | `--surfaces-base-low-contrast-pressed` / `Color.surfacesBaseLowContrastPressed` |
| Section block | `--surfaces-base-low-contrast` / `Color.surfacesBaseLowContrast` |
| Vertical (section) | `--border-default` / `Color.borderDefault` |
| Vertical (row) | `--border-muted` / `Color.borderMuted` |
| Label text | `--typography-muted` / `Color.typographyMuted` |

---

## Accessibility

- Renders with `role="separator"` and `aria-orientation` on both web and iOS
- Labels are wrapped in `<span>` (not included in the `aria-label`) — the label is decorative

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

// Vertical divider (inside a flex row)
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

// Vertical divider
AppDivider(orientation: .vertical)
```

---

## Usage in ListItem

`AppListItem` and `ListItem` both accept a `divider: Bool` / `divider` prop that renders an `AppDivider()` / `<Divider />` below the row automatically — prefer that over inserting a standalone `Divider` between list items.
