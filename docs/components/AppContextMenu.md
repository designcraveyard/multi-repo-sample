# AppContextMenu

**Web:** `multi-repo-nextjs/app/components/Native/AppContextMenu.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Native/AppContextMenu.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppContextMenu.kt`

---

## Overview

A menu overlay for presenting a list of actions with optional icons and destructive styling. Web supports two trigger modes -- right-click/long-press (Radix ContextMenu) and click-triggered popover (Radix DropdownMenu). iOS provides both a long-press `.contextMenu` ViewModifier and a tap-triggered `AppPopoverMenu` component. Android wraps Material 3 `DropdownMenu`.

---

## Props

### Web (`AppContextMenuProps`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `"context" \| "dropdown"` | `"context"` | Right-click/long-press menu vs click-triggered popover |
| `children` | `ReactNode` | required | The element that triggers the menu |
| `items` | `AppContextMenuItem[]` | required | Menu items to display |
| `className` | `string` | `""` | Additional CSS class for the trigger wrapper |

**`AppContextMenuItem`:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | `string` | required | Menu item text |
| `icon` | `ReactNode` | `undefined` | Optional Phosphor icon node rendered to the left |
| `destructive` | `boolean` | `false` | Red text styling |
| `separatorAbove` | `boolean` | `false` | Visual separator above this item |
| `onPress` | `() => void` | `undefined` | Handler on tap |

### iOS (`appContextMenu` + `AppPopoverMenu`)

**`.appContextMenu` ViewModifier:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `[AppContextMenuItem]` | required | Menu items via `.item()` and `.destructive()` factory methods |

**`AppPopoverMenu<Label>`:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isPresented` | `Binding<Bool>` | required | Controls popover visibility |
| `items` | `[AppContextMenuItem]` | required | Menu items |
| `label` | `@ViewBuilder () -> Label` | required | Trigger view (e.g. ellipsis icon) |

**`AppContextMenuItem`:**
| Field | Type | Description |
|-------|------|-------------|
| `label` | `String` | Item text |
| `icon` | `AnyView?` | Optional icon view |
| `role` | `ButtonRole?` | `nil` for default, `.destructive` for red styling |

### Android (`AppContextMenu`)
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `expanded` | `Boolean` | required | Controls whether the menu is visible |
| `onDismiss` | `() -> Unit` | required | Called when dismissed |
| `items` | `List<ContextMenuItem>` | required | Menu entries |

**`ContextMenuItem`:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | `String` | required | Item text |
| `icon` | `ImageVector?` | `null` | Optional Material icon |
| `isDestructive` | `Boolean` | `false` | Error color styling |
| `onClick` | `() -> Unit` | required | Handler on tap |

---

## Platform Notes

| Platform | Native API Wrapped |
|----------|-------------------|
| Web | Radix ContextMenu (right-click) / Radix DropdownMenu (click) via shadcn |
| iOS | SwiftUI `.contextMenu` (long-press) + `.popover()` (tap-triggered `AppPopoverMenu`) |
| Android | Material 3 `DropdownMenu` with `DropdownMenuItem` rows |

---

## Usage Examples

### Web
```tsx
// Right-click / long-press context menu
<AppContextMenu
  items={[
    { label: "Edit", icon: <Icon name="PencilSimple" size="sm" />, onPress: edit },
    { label: "Delete", destructive: true, separatorAbove: true, onPress: remove },
  ]}
>
  <div>Right-click me</div>
</AppContextMenu>

// Click-triggered dropdown
<AppContextMenu mode="dropdown" items={menuItems}>
  <button>Options</button>
</AppContextMenu>
```

### iOS
```swift
// Long-press context menu
Text("Long-press me")
    .appContextMenu(items: [
        .item("Edit", icon: AnyView(Ph.pencilSimple.regular)) { edit() },
        .destructive("Delete", icon: AnyView(Ph.trash.regular)) { delete() }
    ])

// Tap-triggered popover menu
AppPopoverMenu(isPresented: $showMenu, items: [
    .item("Edit", icon: AnyView(Ph.pencilSimple.regular)) { edit() },
    .destructive("Delete", icon: AnyView(Ph.trash.regular)) { delete() }
]) {
    Ph.dotsThreeCircle.regular.iconSize(.lg)
}
```

### Android
```kotlin
Box {
    IconButton(onClick = { expanded = true }) {
        Icon(Icons.Default.MoreVert, contentDescription = "More options")
    }
    AppContextMenu(
        expanded = expanded,
        onDismiss = { expanded = false },
        items = listOf(
            ContextMenuItem("Edit", icon = Icons.Outlined.Edit) { editItem() },
            ContextMenuItem("Delete", icon = Icons.Outlined.Delete, isDestructive = true) { deleteItem() }
        )
    )
}
```

---

## Accessibility

- **Web:** Radix ContextMenu/DropdownMenu provides keyboard navigation (arrow keys, Enter, Escape), focus management, and ARIA menu roles.
- **iOS:** `.contextMenu` provides VoiceOver support and haptic preview; `AppPopoverMenu` uses `.popover()` with automatic focus management.
- **Android:** Material 3 `DropdownMenu` provides TalkBack navigation and dismiss-on-back; icon `contentDescription` is set to null (label text provides the semantics).
