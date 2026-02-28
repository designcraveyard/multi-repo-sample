# IconButton

**Figma:** bubbles-kit › `76:208`
**Android:** `multi-repo-android/.../ui/components/AppIconButton.kt`
**Axes:** Type(Primary/Secondary/Tertiary/Quarternary/Success/Danger) × State(Default/Hover/Pressed/Disabled) × Size(Small/Medium/Large) = 72

A square/circle icon-only button. Requires an `icon` element and an accessibility `label` (never rendered visually — screen-reader only).

---

## Props

### Web (`IconButtonProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ReactNode` | — | Icon element (required) |
| `label` | `string` | — | Screen-reader label (required, never shown) |
| `variant` | `IconButtonVariant` | `"secondary"` | Color/fill style |
| `size` | `IconButtonSize` | `"md"` | Button size |
| `isLoading` | `boolean` | `false` | Shows spinner; disables interaction |
| `disabled` | `boolean` | `false` | Disables interaction; applies 0.5 opacity |
| `onClick` | `() => void` | — | Click handler |
| `className` | `string` | `""` | Extra Tailwind classes |

### iOS (`AppIconButton`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `AnyView` | — | Icon view (required) |
| `label` | `String` | — | Accessibility label (required) |
| `variant` | `AppIconButtonVariant` | `.secondary` | Color/fill style |
| `size` | `AppIconButtonSize` | `.md` | Button size |
| `isLoading` | `Bool` | `false` | Shows spinner |
| `isDisabled` | `Bool` | `false` | Disabled state |
| `action` | `() -> Void` | — | Tap handler |

### Android (`AppIconButton`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ImageVector` | — | Icon vector (required) |
| `contentDescription` | `String` | — | Accessibility label (required) |
| `onClick` | `() -> Unit` | — | Click handler (required) |
| `modifier` | `Modifier` | `Modifier` | Compose modifier |
| `variant` | `IconButtonVariant` | `IconButtonVariant.Primary` | Color/fill style (`Primary`/`Secondary`/`Tertiary`/`Quaternary`/`Success`/`Danger`) |
| `size` | `IconButtonSize` | `IconButtonSize.Lg` | Button size (`Sm`/`Md`/`Lg`) |
| `enabled` | `Boolean` | `true` | Enabled state; `false` applies 0.5 opacity |
| `isLoading` | `Boolean` | `false` | Shows spinner; disables interaction |

---

## Variants

### `IconButtonVariant` / `AppIconButtonVariant`

| Variant | Background | Icon color | Use case |
|---------|-----------|-----------|----------|
| `primary` | `--surfaces-brand-interactive` | `--icons-on-brand` | Primary CTA |
| `secondary` | `--surfaces-base-primary` + border | `--icons-default` | Default action |
| `tertiary` | `--surfaces-base-low-contrast` | `--icons-default` | Softer action |
| `quarternary` | Transparent | `--icons-default` | Ghost / inline action |
| `success` | `--surfaces-success-solid` | `--icons-on-brand` | Positive action |
| `danger` | `--surfaces-danger-solid` | `--icons-on-brand` | Destructive action |

---

## Sizes

| Size | Button | Icon | iOS token |
|------|--------|------|----------|
| `sm` | 24 × 24 px | 16 × 16 px | `.sm` |
| `md` | 36 × 36 px | 20 × 20 px | `.md` |
| `lg` | 48 × 48 px | 24 × 24 px | `.lg` |

---

## States

| State | Appearance |
|-------|-----------|
| Default | Per variant |
| Hover | `--surfaces-base-low-contrast-pressed` overlay |
| Pressed | Darker overlay |
| Disabled | 0.5 opacity on container; `pointer-events: none` |
| Loading | Spinner replaces icon; button dimensions preserved |

---

## Token Usage

| Property | Token |
|----------|-------|
| Primary bg | `--surfaces-brand-interactive` / `Color.surfacesBrandInteractive` |
| Secondary bg | `--surfaces-base-primary` / `Color.surfacesBasePrimary` |
| Secondary border | `--border-default` / `Color.borderDefault` |
| Tertiary bg | `--surfaces-base-low-contrast` / `Color.surfacesBaseLowContrast` |
| Default icon | `--icons-default` / `Color.iconsDefault` |
| On-brand icon | `--icons-on-brand` / `Color.iconsOnBrand` |

---

## Accessibility

- `label` is **required** — rendered as `aria-label` on the `<button>` (web) / `.accessibilityLabel()` (iOS)
- Web: `aria-busy="true"` when `isLoading`, `aria-disabled="true"` when `disabled`
- Minimum touch target: 44 × 44 pt (enforced by hit-area padding on `sm` size)
- Android: `contentDescription` is required and used by TalkBack; Material 3 `IconButton` provides built-in semantics for disabled and loading states

---

## Usage Examples

### Web

```tsx
import { IconButton } from "@/app/components/IconButton";
import { Icon } from "@/app/components/icons";

// Default secondary
<IconButton
  icon={<Icon name="Pencil" />}
  label="Edit item"
  onClick={handleEdit}
/>

// Primary large
<IconButton
  icon={<Icon name="Plus" />}
  label="Add new"
  variant="primary"
  size="lg"
  onClick={handleAdd}
/>

// Quarternary (ghost) — common in list rows
<IconButton
  icon={<Icon name="DotsThree" />}
  label="More options"
  variant="quarternary"
  onClick={handleMenu}
/>

// Loading state
<IconButton
  icon={<Icon name="FloppyDisk" />}
  label="Save"
  variant="primary"
  isLoading={isSaving}
/>
```

### iOS

```swift
import PhosphorSwift
import SwiftUI

// Default secondary
AppIconButton(
    icon: AnyView(Ph.pencil.regular.iconSize(.md)),
    label: "Edit item"
) {
    handleEdit()
}

// Primary large
AppIconButton(
    icon: AnyView(Ph.plus.regular.iconSize(.lg)),
    label: "Add new",
    variant: .primary,
    size: .lg
) {
    handleAdd()
}

// Quarternary (ghost)
AppIconButton(
    icon: AnyView(Ph.dotsThree.regular.iconSize(.md)),
    label: "More options",
    variant: .quarternary
) {
    handleMenu()
}
```

### Android

```kotlin
// Default primary
AppIconButton(
    icon = Icons.Default.Favorite,
    contentDescription = "Like",
    onClick = { toggleLike() }
)

// Secondary medium
AppIconButton(
    icon = Icons.Default.Edit,
    contentDescription = "Edit item",
    variant = IconButtonVariant.Secondary,
    size = IconButtonSize.Md,
    onClick = { handleEdit() }
)

// Quaternary (ghost) — common in list rows
AppIconButton(
    icon = Icons.Default.MoreVert,
    contentDescription = "More options",
    variant = IconButtonVariant.Quaternary,
    onClick = { handleMenu() }
)

// Loading state
AppIconButton(
    icon = Icons.Default.Save,
    contentDescription = "Save",
    isLoading = isSaving,
    onClick = { handleSave() }
)
```

---

## When to Use vs Button

| Use `IconButton` when… | Use `Button` when… |
|------------------------|-------------------|
| Space is very limited (toolbars, list rows) | There is room for a text label |
| The icon alone communicates intent clearly | The action needs text for clarity |
| Part of a dense control group | Standalone CTA |
