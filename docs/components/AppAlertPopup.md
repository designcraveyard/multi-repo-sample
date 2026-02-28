# AppAlertPopup

**Web:** `multi-repo-nextjs/app/components/Native/AppAlertPopup.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Native/AppAlertPopup.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppAlertPopup.kt`

---

## Overview

A centered alert dialog for confirmations, informational messages, or destructive-action warnings. Supports role-based buttons (default, destructive, cancel) that control visual styling and dismiss behavior. Web wraps shadcn AlertDialog (Radix); iOS wraps SwiftUI `.alert()` as a ViewModifier; Android wraps Material 3 `AlertDialog`.

---

## Props

### Web (`AppAlertPopupProps`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isPresented` | `boolean` | required | Controls dialog visibility |
| `onClose` | `() => void` | required | Called when the dialog requests to close |
| `title` | `string` | required | Bold title at the top |
| `message` | `string` | `undefined` | Descriptive message below the title |
| `buttons` | `AlertButton[]` | `[{ label: "OK", role: "default" }]` | Up to two buttons with role-based styling |
| `className` | `string` | `""` | Additional CSS class for the content panel |

**`AlertButton`:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | `string` | required | Button text |
| `role` | `"default" \| "destructive" \| "cancel"` | `"default"` | Controls color (brand / error / low-contrast) |
| `onPress` | `() => void` | `undefined` | Handler on tap |

### iOS (`.appAlert` ViewModifier)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isPresented` | `Binding<Bool>` | required | Controls alert visibility |
| `title` | `String` | required | Bold alert title |
| `message` | `String?` | `nil` | Optional descriptive message |
| `buttons` | `[AppAlertButton]` | `[.cancel()]` | Buttons via `.default()`, `.destructive()`, `.cancel()` factory methods |

### Android (`AppAlertPopup`)
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `isPresented` | `Boolean` | required | Controls visibility (renders only when true) |
| `onDismiss` | `() -> Unit` | required | Called on outside tap or back press |
| `title` | `String` | required | Header text |
| `message` | `String?` | `null` | Optional body text |
| `buttons` | `List<AlertButton>` | `[AlertButton("Cancel", Cancel)]` | Items with `AlertButtonRole.Default`, `.Destructive`, `.Cancel` |

---

## Platform Notes

| Platform | Native API Wrapped |
|----------|-------------------|
| Web | shadcn AlertDialog (Radix) with `AlertDialogAction` / `AlertDialogCancel` |
| iOS | SwiftUI `.alert()` with `Button(role:)` for system styling |
| Android | Material 3 `AlertDialog` with confirm/dismiss button slots |

---

## Usage Examples

### Web
```tsx
<AppAlertPopup
  isPresented={showAlert}
  onClose={() => setShowAlert(false)}
  title="Delete Item?"
  message="This action cannot be undone."
  buttons={[
    { label: "Delete", role: "destructive", onPress: deleteItem },
    { label: "Cancel", role: "cancel" },
  ]}
/>
```

### iOS
```swift
someView.appAlert(
    isPresented: $showDelete,
    title: "Delete Item?",
    message: "This action cannot be undone.",
    buttons: [
        .destructive("Delete") { deleteItem() },
        .cancel()
    ]
)

// Simple confirmation:
someView.appAlert(isPresented: $showConfirm, title: "Saved!",
                  buttons: [.default("OK")])
```

### Android
```kotlin
AppAlertPopup(
    isPresented = showAlert,
    onDismiss = { showAlert = false },
    title = "Delete Item?",
    message = "This action cannot be undone.",
    buttons = listOf(
        AlertButton("Delete", role = AlertButtonRole.Destructive) { deleteItem() },
        AlertButton("Cancel", role = AlertButtonRole.Cancel) { }
    )
)
```

---

## Accessibility

- **Web:** Radix AlertDialog provides focus trapping, Escape key dismissal, and ARIA `alertdialog` role; cancel button uses `AlertDialogCancel` for proper semantics.
- **iOS:** SwiftUI `.alert()` provides full VoiceOver support with system-managed button positioning and role announcements.
- **Android:** Material 3 `AlertDialog` provides TalkBack support with labeled confirm/dismiss slots and back-button dismissal.
