# AppActionSheet

**Web:** `multi-repo-nextjs/app/components/Native/AppActionSheet.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Native/AppActionSheet.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppActionSheet.kt`

---

## Overview

An iOS-style action sheet presenting a list of actions with an optional title and message, plus a visually separated cancel button. Web builds the layout on shadcn AlertDialog (Radix) with custom panel styling; iOS wraps SwiftUI `confirmationDialog`; Android wraps Material 3 `AlertDialog` with a vertical action list.

---

## Props

### Web (`AppActionSheetProps`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isPresented` | `boolean` | required | Controls sheet visibility |
| `onClose` | `() => void` | required | Called when the sheet requests to close |
| `title` | `string` | `undefined` | Bold title at the top |
| `message` | `string` | `undefined` | Optional descriptive message below the title |
| `actions` | `AppActionSheetAction[]` | required | List of actions; cancel role is separated at the bottom |

**`AppActionSheetAction`:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | `string` | required | Button text |
| `role` | `"default" \| "destructive" \| "cancel"` | `"default"` | Semantic role controlling color and position |
| `onPress` | `() => void` | `undefined` | Handler called on tap |

### iOS (`.appActionSheet` ViewModifier)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isPresented` | `Binding<Bool>` | required | Controls visibility |
| `title` | `String` | required | Bold title at the top |
| `message` | `String?` | `nil` | Optional secondary message |
| `actions` | `[AppActionSheetAction]` | required | Actions via `.default()`, `.destructive()`, `.cancel()` factory methods |

### Android (`AppActionSheet`)
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `isPresented` | `Boolean` | required | Controls visibility (renders only when true) |
| `onDismiss` | `() -> Unit` | required | Called on outside tap or back press |
| `title` | `String` | required | Header text at the top |
| `message` | `String?` | `null` | Optional explanatory text |
| `actions` | `List<ActionSheetAction>` | required | Items with `ActionRole.Default`, `.Destructive`, or `.Cancel` |

---

## Platform Notes

| Platform | Native API Wrapped |
|----------|-------------------|
| Web | shadcn AlertDialog (Radix) with custom iOS-style panel layout |
| iOS | SwiftUI `confirmationDialog` (maps to `UIAlertController.Style.actionSheet`) |
| Android | Material 3 `AlertDialog` with vertical `TextButton` rows |

---

## Usage Examples

### Web
```tsx
<AppActionSheet
  isPresented={showActions}
  onClose={() => setShowActions(false)}
  title="Post Options"
  message="What would you like to do?"
  actions={[
    { label: "Edit Post", onPress: editPost },
    { label: "Delete Post", role: "destructive", onPress: deletePost },
    { label: "Cancel", role: "cancel" },
  ]}
/>
```

### iOS
```swift
someView.appActionSheet(
    isPresented: $showActions,
    title: "Post Options",
    message: "What would you like to do?",
    actions: [
        .default("Edit Post") { editPost() },
        .destructive("Delete Post") { deletePost() },
        .cancel()
    ]
)
```

### Android
```kotlin
AppActionSheet(
    isPresented = showActions,
    onDismiss = { showActions = false },
    title = "Post Options",
    message = "What would you like to do?",
    actions = listOf(
        ActionSheetAction("Edit Post") { editPost() },
        ActionSheetAction("Delete Post", role = ActionRole.Destructive) { deletePost() },
        ActionSheetAction("Cancel", role = ActionRole.Cancel) { }
    )
)
```

---

## Accessibility

- **Web:** Radix AlertDialog provides focus trapping, Escape dismissal, and ARIA roles; destructive actions are visually distinguished with error color.
- **iOS:** `confirmationDialog` provides full VoiceOver support with automatic button role announcements.
- **Android:** `AlertDialog` provides TalkBack support with dismiss-on-back and labeled buttons; destructive actions use error color.
