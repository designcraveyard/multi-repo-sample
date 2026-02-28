# AppBottomSheet

**Web:** `multi-repo-nextjs/app/components/Native/AppBottomSheet.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Native/AppBottomSheet.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppBottomSheet.kt`

---

## Overview

A bottom-sheet drawer for presenting supplementary content or forms. Web wraps the vaul `Drawer` primitive (via shadcn); iOS uses a SwiftUI `.sheet()` ViewModifier with `presentationDetents`; Android wraps Material 3 `ModalBottomSheet`. For responsive mobile-drawer / desktop-modal behavior, prefer `AdaptiveSheet` which delegates to this component on mobile.

---

## Props

### Web (`AppBottomSheetProps`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isPresented` | `boolean` | required | Controls sheet visibility |
| `onClose` | `() => void` | required | Called when the sheet requests to close (swipe down or backdrop tap) |
| `children` | `ReactNode` | required | Sheet content |
| `title` | `string` | `undefined` | Optional title in the sheet header |
| `description` | `string` | `undefined` | Optional description below the title |
| `snapPoints` | `number[]` | `undefined` | Snap points as fractions of screen height (e.g. `[0.5, 1]`) |
| `className` | `string` | `""` | Additional CSS class for the content panel |

### iOS (`.appBottomSheet` ViewModifier)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isPresented` | `Binding<Bool>` | required | Controls sheet visibility |
| `detents` | `Set<PresentationDetent>` | `[.medium, .large]` | Heights the sheet can snap to |
| `content` | `@ViewBuilder () -> SheetContent` | required | The view rendered inside the sheet |

### Android (`AppBottomSheet`)
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `isPresented` | `Boolean` | required | Controls visibility (renders only when true) |
| `onDismiss` | `() -> Unit` | required | Called on swipe down or scrim tap |
| `content` | `@Composable () -> Unit` | required | Composable slot for the sheet body |

---

## Platform Notes

| Platform | Native API Wrapped |
|----------|-------------------|
| Web | vaul `Drawer` (via shadcn) with built-in drag handle |
| iOS | SwiftUI `.sheet()` + `presentationDetents` + `presentationDragIndicator` |
| Android | Material 3 `ModalBottomSheet` with rounded top corners |

---

## Usage Examples

### Web
```tsx
<AppBottomSheet
  isPresented={showSheet}
  onClose={() => setShowSheet(false)}
  title="Sheet Title"
  description="Optional description"
  snapPoints={[0.5, 1]}
>
  <p>Sheet content here</p>
</AppBottomSheet>
```

### iOS
```swift
Button("Open Sheet") { showSheet = true }
    .appBottomSheet(isPresented: $showSheet) {
        VStack(alignment: .leading, spacing: .space4) {
            Text("Sheet Title").font(.appTitleSmall)
            Text("Sheet content goes here.")
        }
    }

// Custom detents:
someView.appBottomSheet(isPresented: $showSheet, detents: [.fraction(0.4), .large]) {
    MySheetContent()
}
```

### Android
```kotlin
AppBottomSheet(
    isPresented = showSheet,
    onDismiss = { showSheet = false }
) {
    Text("Sheet content goes here")
}
```

---

## Accessibility

- **Web:** vaul Drawer provides focus trapping and Escape key dismissal; drag handle is accessible for screen readers.
- **iOS:** SwiftUI `.sheet()` provides full VoiceOver support, focus trapping, and swipe-to-dismiss; haptic feedback fires on detent changes.
- **Android:** `ModalBottomSheet` provides TalkBack support with scrim dismissal and back-button handling.
