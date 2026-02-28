# Badge

**Figma:** bubbles-kit › node `87:1071`
**Web:** `multi-repo-nextjs/app/components/Badge/Badge.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Badge/AppBadge.swift`
**Android:** `multi-repo-android/.../ui/components/AppBadge.kt`

---

## Overview

A small pill-shaped indicator used to convey status, counts, or category. Comes in four semantic types, four sizes, and two contrast modes (solid/subtle). The `tiny` size renders as a dot indicator with no text.

---

## Props

### Web (`BadgeProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string \| number` | — | Text or numeric value displayed |
| `size` | `BadgeSize` | `"md"` | Size token (see Sizes) |
| `type` | `BadgeType` | `"brand"` | Semantic color (see Types) |
| `subtle` | `boolean` | `false` | `true` = tinted/subtle; `false` = solid |
| `className` | `string` | `""` | Extra CSS classes |

### iOS (`AppBadge`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `String?` | `nil` | Text displayed inside badge |
| `size` | `AppBadgeSize` | `.md` | Size token |
| `type` | `AppBadgeType` | `.brand` | Semantic color |
| `subtle` | `Bool` | `false` | Subtle/tinted mode |

### Android (`AppBadge`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `String?` | `null` | Text displayed inside badge |
| `modifier` | `Modifier` | `Modifier` | Compose modifier |
| `size` | `BadgeSize` | `BadgeSize.Md` | Size token (`Tiny`/`Sm`/`Number`/`Md`) |
| `type` | `BadgeType` | `BadgeType.Brand` | Semantic color (`Brand`/`Success`/`Error`/`Accent`) |
| `subtle` | `Boolean` | `false` | Subtle/tinted mode |

Int overload:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `Int` | — | Numeric count value |
| `size` | `BadgeSize` | `BadgeSize.Number` | Size token |

---

## Sizes

| Value | Height | Min-width | Font token | Notes |
|-------|--------|-----------|------------|-------|
| `tiny` | 6px | 6px | — | Dot only, no text |
| `sm` | 14px | 14px | `--typography-badge-sm` | Text / short label |
| `number` | 14px | 14px | `--typography-badge-sm` | Numeric count (same as sm) |
| `md` | 16px | 16px | `--typography-badge-md` | Default |

---

## Types × Subtle

### Solid (`subtle=false`)

| Type | Background | Text |
|------|-----------|------|
| `brand` | `--surfaces-brand-interactive` | `--typography-on-brand-primary` |
| `success` | `--surfaces-success-solid` | `--typography-on-brand-primary` |
| `error` | `--surfaces-error-solid` | `--typography-on-brand-primary` |
| `accent` | `--surfaces-accent-primary` | `--typography-on-brand-primary` |

### Subtle (`subtle=true`)

| Type | Background | Text |
|------|-----------|------|
| `brand` | `--surfaces-brand-interactive-low-contrast` | `--typography-brand` |
| `success` | `--surfaces-success-subtle` | `--typography-success` |
| `error` | `--surfaces-error-subtle` | `--typography-error` |
| `accent` | `--surfaces-accent-low-contrast` | `--typography-accent` |

---

## Usage Examples

### Web

```tsx
import { Badge } from "@/app/components/Badge";

// Default brand badge
<Badge label="New" />

// Numeric count
<Badge size="number" label={42} type="error" />

// Success subtle
<Badge label="Verified" type="success" subtle />

// Dot indicator (no label needed)
<Badge size="tiny" type="error" />
```

### iOS

```swift
// Default
AppBadge(label: "New")

// Numeric
AppBadge(label: "42", size: .number, type: .error)

// Subtle success
AppBadge(label: "Verified", type: .success, subtle: true)

// Dot
AppBadge(size: .tiny, type: .error)
```

### Android

```kotlin
// Default brand badge
AppBadge(label = "New", type = BadgeType.Brand)

// Numeric count (Int overload)
AppBadge(count = 12, type = BadgeType.Error)

// Dot indicator (tiny)
AppBadge(size = BadgeSize.Tiny, type = BadgeType.Success)
```

---

## Token Usage

| Property | Token |
|----------|-------|
| Shape | `rounded-full` / `.clipShape(Capsule())` |
| Background | `--surfaces-*` (variant × subtle) |
| Text | `--typography-*` (variant × subtle) |
