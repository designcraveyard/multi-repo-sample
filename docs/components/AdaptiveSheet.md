# AdaptiveSheet

**Web:** `multi-repo-nextjs/app/components/Adaptive/AdaptiveSheet.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Adaptive/AdaptiveSheet.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/adaptive/AdaptiveSheet.kt`

---

## Overview

Responsive presentation wrapper that renders as a bottom sheet (swipe-to-dismiss) on compact screens and as a centered modal dialog (overlay scrim with close button) on regular screens. Use this instead of raw `AppBottomSheet` or `Dialog` in screen files to get automatic adaptive behavior.

---

## Breakpoint Behavior

| Viewport | Compact (< 768px) | Regular (>= 768px) |
|----------|-------------------|---------------------|
| Web | Bottom drawer (vaul Drawer) with swipe-to-dismiss and optional snap points | Centered Radix Dialog modal with overlay scrim, max-width 480px, close button top-right |
| iOS | `AppBottomSheet` (native `.sheet` with drag-to-dismiss, configurable detents) | Centered modal card overlay: max 480pt wide, 600pt tall, 40% black scrim, close button top-right, spring animation |
| Android | Material 3 `ModalBottomSheet` with rounded top corners and swipe-to-dismiss | Centered dialog card: max 480dp wide, 600dp tall, 40% black scrim, close button, scrollable content, shadow |

---

## Props

### Web (`AdaptiveSheetProps`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isPresented` | `boolean` | required | Controls visibility |
| `onClose` | `() => void` | required | Called when the sheet/modal requests to close |
| `children` | `ReactNode` | required | Sheet/modal content |
| `title` | `string` | `undefined` | Optional header title |
| `description` | `string` | `undefined` | Optional description below the title |
| `snapPoints` | `number[]` | `undefined` | Snap points as fractions (mobile drawer only -- ignored on desktop) |
| `className` | `string` | `""` | Additional CSS class |

### iOS (`.adaptiveSheet` View modifier)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isPresented` | `Binding<Bool>` | required | Binding that controls visibility |
| `detents` | `Set<PresentationDetent>` | `[.medium, .large]` | Sheet snap heights on compact; ignored on regular |
| `title` | `String?` | `nil` | Optional title shown in the modal header |
| `content` | `@ViewBuilder () -> SheetContent` | required | The view to present |

### Android (`AdaptiveSheet`)
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `isPresented` | `Boolean` | required | Controls visibility -- nothing renders when false |
| `onDismiss` | `() -> Unit` | required | Called when the user dismisses the sheet/dialog |
| `widthSizeClass` | `WindowWidthSizeClass` | required | Current window width class to determine presentation mode |
| `modifier` | `Modifier` | `Modifier` | Modifier applied to the container |
| `title` | `String?` | `null` | Optional header text at the top of the sheet/dialog |
| `content` | `@Composable () -> Unit` | required | Composable slot for the body content |

---

## Usage Examples

### Web
```tsx
<AdaptiveSheet
  isPresented={open}
  onClose={() => setOpen(false)}
  title="Edit Profile"
>
  <EditProfileContent />
</AdaptiveSheet>

// With snap points (mobile only -- ignored on desktop):
<AdaptiveSheet
  isPresented={open}
  onClose={() => setOpen(false)}
  title="Filters"
  snapPoints={[0.4, 1]}
>
  <FilterContent />
</AdaptiveSheet>
```

### iOS
```swift
someView
    .adaptiveSheet(isPresented: $showSheet, title: "Edit Profile") {
        EditProfileContent()
    }

// With custom detents (compact only -- ignored on regular):
someView
    .adaptiveSheet(
        isPresented: $showSheet,
        detents: [.fraction(0.4), .large],
        title: "Filters"
    ) {
        FilterContent()
    }
```

### Android
```kotlin
AdaptiveSheet(
    isPresented = showSheet,
    onDismiss = { showSheet = false },
    title = "Edit Profile",
    widthSizeClass = widthSizeClass,
) {
    EditProfileContent()
}
```

---

## Rules

- Never use raw `NavigationStack`/`TabView`/`.sheet()`/`<Drawer>` in screen files -- always use Adaptive wrappers
- iPad portrait = compact, landscape = regular
- Screens with no responsive pattern must be marked `// responsive: N/A`
- Snap points / detents are only applied on compact; they are ignored on regular/desktop
- All variants use semantic tokens for colors, radii, and spacing -- no hardcoded values

---

## Accessibility

- **Web:** Radix Dialog and vaul Drawer provide built-in focus trapping, keyboard dismissal (Escape), and ARIA roles; `DialogTitle`/`DrawerTitle` are announced by screen readers
- **iOS:** Regular modal has a close button with `.accessibilityLabel("Close")`; scrim overlay is marked as `.isButton` with accessibility label "Close"; compact mode uses native sheet dismiss gesture
- **Android:** Close `IconButton` has `contentDescription = "Close"` on both compact and regular; scrim background has `semantics { contentDescription = "Close" }` for screen reader dismiss
