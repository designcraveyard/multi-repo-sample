# AppBottomNavBar

**Web:** _N/A -- mobile only_
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Native/AppBottomNavBar.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppBottomNavBar.kt`

---

## Overview

A bottom tab bar for root-level navigation. iOS wraps SwiftUI `TabView` with two presentation styles (icon+label and icon-only), automatic filled/outline icon switching for active/inactive states, and badge support. Android wraps Material 3 `NavigationBar` with `NavigationBarItem` entries supporting selected/unselected icon variants and badge overlays. No web equivalent -- web uses `AdaptiveNavShell` which handles its own responsive navigation.

---

## Props

### iOS (`AppBottomNavBar<Content>`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedTab` | `Binding<Int>` | required | Zero-based index of the active tab |
| `style` | `AppBottomNavStyle` | `.iconLabel` | `.iconLabel` (icon + text) or `.iconOnly` (icon only) |
| `tabs` | `[AppNavTab]` | required | Tab metadata array |
| `content` | `@ViewBuilder () -> Content` | required | One content view per tab in order |

**`AppNavTab`:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | `Int` | required | Zero-based position matching the content view order |
| `label` | `String` | required | Tab label text |
| `icon` | `String` | required | SF Symbol name for unselected (outline) state |
| `iconFill` | `String` | `icon + ".fill"` | SF Symbol name for selected (filled) state |
| `badge` | `Int` | `0` | Numeric badge (0 hides badge) |

### Android (`AppBottomNavBar`)
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `selectedTab` | `Int` | required | Zero-based index of the active tab |
| `onTabSelect` | `(Int) -> Unit` | required | Called with new tab index on tap |
| `tabs` | `List<NavTab>` | required | Tab metadata list |

**`NavTab`:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | `String` | required | Tab label text |
| `icon` | `ImageVector` | required | Material icon for inactive state |
| `selectedIcon` | `ImageVector?` | `null` | Icon for active state (falls back to `icon`) |
| `badge` | `String?` | `null` | Badge count text (null hides badge) |

---

## Platform Notes

| Platform | Native API Wrapped |
|----------|-------------------|
| Web | _N/A_ |
| iOS | SwiftUI `TabView` with `.tabItem` and `.badge` modifiers; UIKit appearance overrides via `NativeBottomNavStyling.applyAppearance()` |
| Android | Material 3 `NavigationBar` + `NavigationBarItem` with `BadgedBox` for badges |

---

## Usage Examples

### iOS
```swift
@State private var tab = 0

// Icon + Label (default)
AppBottomNavBar(
    selectedTab: $tab,
    style: .iconLabel,
    tabs: [
        AppNavTab(id: 0, label: "Home",    icon: "house"),
        AppNavTab(id: 1, label: "Search",  icon: "magnifyingglass"),
        AppNavTab(id: 2, label: "Alerts",  icon: "bell", badge: 5),
        AppNavTab(id: 3, label: "Profile", icon: "person"),
    ]
) {
    HomeView()
    SearchView()
    AlertsView()
    ProfileView()
}

// Icon only
AppBottomNavBar(selectedTab: $tab, style: .iconOnly, tabs: tabs) {
    HomeView()
    SearchView()
}
```

### Android
```kotlin
val tabs = listOf(
    NavTab("Home", Icons.Outlined.Home, selectedIcon = Icons.Filled.Home),
    NavTab("Search", Icons.Outlined.Search),
    NavTab("Alerts", Icons.Outlined.Notifications, badge = "3"),
    NavTab("Profile", Icons.Outlined.Person, selectedIcon = Icons.Filled.Person),
)

var selectedTab by remember { mutableIntStateOf(0) }

AppBottomNavBar(
    selectedTab = selectedTab,
    onTabSelect = { selectedTab = it },
    tabs = tabs,
)
```

---

## Accessibility

- **iOS:** `TabView` provides full VoiceOver tab navigation; `.badge()` count is announced; in `.iconOnly` mode, `accessibilityLabel` is set from the tab label for VoiceOver.
- **Android:** `NavigationBarItem` provides TalkBack support with label text and icon content descriptions; `Badge` text is announced when present.
