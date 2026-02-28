# AppPageHeader

**Web:** _N/A -- mobile only_
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Native/AppPageHeader.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppPageHeader.kt`

---

## Overview

A styled navigation bar / top app bar for page-level header display. iOS applies a ViewModifier to configure the enclosing `NavigationStack`'s toolbar with design-token colors and optional trailing action buttons. Android wraps Material 3 `TopAppBar` with optional leading navigation icon and trailing action buttons. No web equivalent -- web uses its own navigation patterns.

---

## Props

### iOS (`.appPageHeader` ViewModifier)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `String` | required | The navigation title text |
| `displayMode` | `AppPageHeaderDisplayMode` | `.large` | `.large` (collapsing) or `.inline` (fixed) |
| `trailingActions` | `[AnyView]` | `[]` | Views rendered in the trailing toolbar slot |

### Android (`AppPageHeader`)
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `title` | `String` | required | The page title in the app bar |
| `navigationIcon` | `ImageVector?` | `null` | Optional leading icon (e.g. back arrow) |
| `onNavigationClick` | `(() -> Unit)?` | `null` | Callback for the leading icon tap |
| `actions` | `List<HeaderAction>` | `emptyList()` | Trailing icon buttons |

**`HeaderAction`:**
| Field | Type | Description |
|-------|------|-------------|
| `icon` | `ImageVector` | Material icon for the button |
| `contentDescription` | `String` | Accessibility description |
| `onClick` | `() -> Unit` | Tap handler |

---

## Platform Notes

| Platform | Native API Wrapped |
|----------|-------------------|
| Web | _N/A_ |
| iOS | SwiftUI `.navigationTitle()` + `.toolbar()` + `.toolbarBackground()` ViewModifiers |
| Android | Material 3 `TopAppBar` with `TopAppBarDefaults.topAppBarColors()` |

---

## Usage Examples

### iOS
```swift
NavigationStack {
    MyContentView()
        .appPageHeader(title: "Home")

    // Inline title with trailing button:
    MyContentView()
        .appPageHeader(
            title: "Settings",
            displayMode: .inline,
            trailingActions: [AnyView(Button("Edit") { })]
        )
}
```

### Android
```kotlin
AppPageHeader(
    title = "Home",
    actions = listOf(
        HeaderAction(Icons.Outlined.Notifications, "Notifications") { },
        HeaderAction(Icons.Outlined.AccountCircle, "Profile") { }
    )
)

// With back navigation:
AppPageHeader(
    title = "Settings",
    navigationIcon = Icons.AutoMirrored.Filled.ArrowBack,
    onNavigationClick = { navController.popBackStack() }
)
```

---

## Accessibility

- **iOS:** `.navigationTitle` is announced by VoiceOver; trailing toolbar items are reachable via VoiceOver navigation; tint color applied to back chevron and action buttons.
- **Android:** `TopAppBar` provides TalkBack support; navigation icon has "Navigate back" content description; action icons use their `contentDescription` field for TalkBack announcements.
