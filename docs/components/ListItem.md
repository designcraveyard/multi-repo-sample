# ListItem (Pattern)

**Figma:** bubbles-kit › "ListItem" (composed pattern)
**Web:** `multi-repo-nextjs/app/components/patterns/ListItem/ListItem.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Patterns/AppListItem.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/patterns/AppListItem.kt`
**Type:** Complex Component — composes `TextBlock` + `Thumbnail` + `Button` / `IconButton` / `Badge` + `Divider`

---

## Overview

A horizontal row with an optional leading thumbnail, required title (+ optional subtitle/body/metadata), and an optional trailing action. Used to represent records in a list — tasks, transactions, contacts, messages, etc.

```
[ Thumbnail? ] [ Title          ] [ Button? ]
               [ Subtitle       ] [ IconBtn? ]
               [ Body           ] [ Badge?  ]
               [ Metadata       ]
               ─────────────────── (divider?)
```

---

## Props

### Web (`ListItemProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | **Required.** Primary text |
| `subtitle` | `string` | — | Secondary line |
| `body` | `string` | — | Body copy |
| `metadata` | `string` | — | Footnote / timestamp |
| `thumbnail` | `{ src: string; alt?: string }` | — | Leading image |
| `trailing` | `ListItemTrailing` | — | Trailing action (see below) |
| `divider` | `boolean` | `false` | Row divider below item |
| `className` | `string` | `""` | Extra classes |

### iOS (`AppListItem`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `String` | — | **Required.** Primary text |
| `subtitle` | `String?` | `nil` | Secondary line |
| `body` | `String?` | `nil` | Body copy |
| `metadata` | `String?` | `nil` | Footnote |
| `thumbnail` | `AppThumbnailConfig?` | `nil` | Leading thumbnail config |
| `trailing` | `AppListItemTrailing?` | `nil` | Trailing action (see below) |
| `divider` | `Bool` | `false` | Row divider below item |

### Android (`AppListItem`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `String` | — | **Required.** Primary text |
| `modifier` | `Modifier` | `Modifier` | Compose modifier |
| `subtitle` | `String?` | `null` | Secondary line |
| `body` | `String?` | `null` | Body copy |
| `metadata` | `String?` | `null` | Footnote / timestamp |
| `thumbnail` | `AppThumbnailConfig?` | `null` | Leading thumbnail config |
| `trailing` | `AppListItemTrailing?` | `null` | Trailing action (see below) |
| `divider` | `Boolean` | `false` | Row divider below item |

---

## Trailing Slot

### Web — `ListItemTrailing` (discriminated union)

```ts
type ListItemTrailing =
  | { type: "button";     label: string;  variant?: ButtonVariant;  onPress: () => void }
  | { type: "iconButton"; icon: string;   accessibilityLabel: string; onPress: () => void }
  | { type: "badge";      label: string;  badgeVariant?: BadgeType }
  | { type: "none" }
```

| `type` | Rendered as | Notes |
|--------|-------------|-------|
| `"button"` | `<Button size="sm" />` | Default `variant="secondary"` |
| `"iconButton"` | `<IconButton size="sm" variant="secondary" />` | Pass Phosphor icon name as `icon` string |
| `"badge"` | `<Badge size="sm" />` | Default `badgeVariant="brand"` |
| `"none"` | Nothing | Explicit empty |

### iOS — `AppListItemTrailing` (enum)

```swift
public enum AppListItemTrailing {
    case button(label: String, variant: AppButtonVariant = .secondary, size: AppButtonSize = .sm, action: () -> Void)
    case iconButton(icon: AnyView, accessibilityLabel: String, variant: AppIconButtonVariant = .quarternary, action: () -> Void)
    case badge(label: String, type: AppBadgeType = .brand, subtle: Bool = false)
}
```

### Android — `AppListItemTrailing` (sealed interface)

```kotlin
sealed interface AppListItemTrailing {
    data class Button(...)
    data class IconButton(...)
    data class Badge(label: String, type: BadgeType = BadgeType.Brand)
    data class Radio(...)
    data class Checkbox(...)
    data class Toggle(...)
}
```

| `type` | Rendered as | Notes |
|--------|-------------|-------|
| `Button` | `AppButton(size = Sm)` | Default secondary variant |
| `IconButton` | `AppIconButton(size = Sm)` | Pass `ImageVector` as icon |
| `Badge` | `AppBadge(size = Sm)` | Default brand type |
| `Radio` | Radio button | Selection indicator |
| `Checkbox` | Checkbox | Toggle indicator |
| `Toggle` | Switch | Toggle indicator |

---

## Thumbnail Config (iOS)

```swift
AppThumbnailConfig(
    url: URL?,                    // nil = silhouette placeholder
    accessibilityLabel: String?,
    size: AppThumbnailSize = .sm,
    rounded: Bool = false
)
```

---

## Layout

- **Row:** `flex items-start gap-3` / `HStack(alignment: .top, spacing: .space3)`
- **Thumbnail:** fixed-size, top-aligned
- **TextBlock:** `flex-1` / `.frame(maxWidth: .infinity)` — grows to fill space
- **Trailing:** `flex-shrink-0 self-center` / center-aligned
- **Divider:** rendered below the row when `divider=true` (uses `Divider type="row"`)
- Row vertical padding: `py-3` / `.padding(.vertical, .space3)`

---

## Usage Examples

### Web

```tsx
import { ListItem } from "@/app/components/patterns/ListItem";

// Title only
<ListItem title="Plain row" divider />

// With subtitle
<ListItem
  title="Ayurveda Books"
  subtitle="bought for Anjali at airport"
  divider
/>

// Thumbnail + badge
<ListItem
  title="Pack luggage"
  subtitle="Ready for the trip"
  thumbnail={{ src: "/placeholder.jpg", alt: "Luggage" }}
  trailing={{ type: "badge", label: "New", badgeVariant: "brand" }}
  divider
/>

// Button trailing
<ListItem
  title="Depart"
  subtitle="Flight at 08:00"
  trailing={{ type: "button", label: "Edit", onPress: handleEdit }}
/>

// Icon button trailing
<ListItem
  title="Trip to Bali"
  body="Remember to pack sunscreen."
  trailing={{ type: "iconButton", icon: "DotsThree", accessibilityLabel: "More options", onPress: openMenu }}
/>

// Badge count (error type)
<ListItem
  title="Inbox"
  trailing={{ type: "badge", label: "3", badgeVariant: "error" }}
/>
```

### iOS

```swift
// Title only
AppListItem(title: "Plain row", divider: true)

// With subtitle
AppListItem(
    title: "Ayurveda Books",
    subtitle: "bought for Anjali at airport",
    divider: true
)

// Thumbnail + badge
AppListItem(
    title: "Pack luggage",
    subtitle: "Ready for the trip",
    thumbnail: AppThumbnailConfig(size: .sm),
    trailing: .badge(label: "New", type: .brand),
    divider: true
)

// Button trailing
AppListItem(
    title: "Depart",
    subtitle: "Flight at 08:00",
    trailing: .button(label: "Edit", action: { })
)

// Icon button trailing
AppListItem(
    title: "Trip to Bali",
    body: "Remember to pack sunscreen.",
    trailing: .iconButton(
        icon: AnyView(Ph.dotsThree.regular.iconSize(.md)),
        accessibilityLabel: "More options",
        action: { openMenu() }
    )
)
```

### Android

```kotlin
// Title + subtitle
AppListItem(
    title = "Ayurveda Books",
    subtitle = "bought for Anjali"
)

// Badge trailing with divider
AppListItem(
    title = "Inbox",
    trailing = AppListItemTrailing.Badge(label = "3", type = BadgeType.Error),
    divider = true
)

// Thumbnail + badge
AppListItem(
    title = "Pack luggage",
    subtitle = "Ready for the trip",
    thumbnail = AppThumbnailConfig(size = AppThumbnailSize.Sm),
    trailing = AppListItemTrailing.Badge(label = "New", type = BadgeType.Brand),
    divider = true
)
```

---

## Accessibility

- `title` is always rendered — forms the accessible label for the row
- Thumbnail has its own `alt` / `accessibilityLabel`
- Trailing button/iconButton have their own accessible labels
- Badge is decorative but readable by screen reader via its text content
- Consider wrapping a list of `ListItem`s in a `<ul>`/`<li>` structure on web for proper list semantics
- Android: TalkBack reads title + subtitle as a combined row; trailing actions have independent semantics via Material 3 built-in support
