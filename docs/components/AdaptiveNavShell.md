# AdaptiveNavShell

**Web:** `multi-repo-nextjs/app/components/Adaptive/AdaptiveNavShell.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Adaptive/AdaptiveNavShell.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/adaptive/AdaptiveNavShell.kt`

---

## Overview

Root navigation shell that adapts between a bottom tab bar on compact screens and a collapsible sidebar icon rail on regular screens. Every screen in the app is rendered inside this wrapper, making it the single entry point for primary navigation.

---

## Breakpoint Behavior

| Viewport | Compact (< 768px) | Regular (>= 768px) |
|----------|-------------------|---------------------|
| Web | Fixed bottom nav bar (56px) with icon + label tabs | Collapsible sidebar: 60px collapsed (icon only) / 240px expanded (icon + label) with toggle button at bottom |
| iOS | `TabView` with system tab bar (SF Symbol icons, badge support) | `HStack` sidebar: 60pt collapsed / 240pt expanded, spring-animated, toggle button at bottom |
| Android | Material 3 `NavigationBar` bottom tabs with `NavigationBarItem` | Collapsible sidebar `Column`: 60dp collapsed / 240dp expanded, `animateContentSize` spring animation, toggle button at bottom |

---

## Props

### Web (`AdaptiveNavShellProps`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `NavTab[]` | required | Tab definitions (id, label, icon, optional iconFill, optional badge count) |
| `selectedTab` | `number` | required | Currently selected tab id (0-based) |
| `onTabChange` | `(tabId: number) => void` | required | Callback when user taps a tab |
| `children` | `ReactNode` | required | Page content conditionally rendered based on selectedTab |

**`NavTab` shape:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | `number` | required | Unique tab identifier (0-based) |
| `label` | `string` | required | Display label |
| `icon` | `IconProps["name"]` | required | Phosphor icon name (PascalCase) |
| `iconFill` | `IconProps["name"]` | `undefined` | Filled icon variant for active state |
| `badge` | `number` | `undefined` | Numeric badge count; 0 or undefined hides badge |

### iOS (`AdaptiveNavShell`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedTab` | `Binding<Int>` | required | Two-way binding for the active tab index |
| `tabs` | `[AppNavTab]` | required | Array of tab metadata |
| `content` | `@ViewBuilder () -> Content` | required | ViewBuilder with one child view per tab |

**`AppNavTab` shape:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | `Int` | required | Unique tab identifier |
| `label` | `String` | required | Display label |
| `icon` | `String` | required | SF Symbol name for unselected state |
| `iconFill` | `String` | `icon + ".fill"` | SF Symbol name for selected state |
| `badge` | `Int` | `0` | Numeric badge; 0 hides the badge |

### Android (`AdaptiveNavShell`)
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `selectedTab` | `Int` | required | Zero-based index of the active tab |
| `onTabSelect` | `(Int) -> Unit` | required | Callback with the new tab index |
| `tabs` | `List<NavTab>` | required | List of NavTab metadata |
| `widthSizeClass` | `WindowWidthSizeClass` | required | Current window width class from `calculateWindowSizeClass(activity)` |
| `modifier` | `Modifier` | `Modifier` | Modifier applied to the shell container |
| `content` | `@Composable (selectedTab: Int) -> Unit` | required | Composable slot receiving the selectedTab index |

**`NavTab` shape:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | `String` | required | Display label |
| `icon` | `ImageVector` | required | Icon for unselected state |
| `selectedIcon` | `ImageVector?` | `null` | Icon for selected state; falls back to `icon` |
| `badge` | `String?` | `null` | Badge text; null hides badge |

---

## Usage Examples

### Web
```tsx
const tabs = [
  { id: 0, label: "Home",     icon: "House" },
  { id: 1, label: "Search",   icon: "MagnifyingGlass" },
  { id: 2, label: "Settings", icon: "Gear" },
];

<AdaptiveNavShell tabs={tabs} selectedTab={0} onTabChange={setTab}>
  {tab === 0 && <HomePage />}
  {tab === 1 && <SearchPage />}
  {tab === 2 && <SettingsPage />}
</AdaptiveNavShell>
```

### iOS
```swift
@State private var tab = 0

AdaptiveNavShell(
    selectedTab: $tab,
    tabs: [
        AppNavTab(id: 0, label: "Home",     icon: "house"),
        AppNavTab(id: 1, label: "Search",   icon: "magnifyingglass"),
        AppNavTab(id: 2, label: "Settings", icon: "gearshape"),
    ]
) {
    HomeView()
    SearchView()
    SettingsView()
}
```

### Android
```kotlin
AdaptiveNavShell(
    selectedTab = selectedTab,
    onTabSelect = { selectedTab = it },
    tabs = listOf(
        NavTab(label = "Home", icon = Icons.Outlined.Home, selectedIcon = Icons.Filled.Home),
        NavTab(label = "Search", icon = Icons.Outlined.Search),
        NavTab(label = "Settings", icon = Icons.Outlined.Settings),
    ),
    widthSizeClass = widthSizeClass,
) { tab ->
    when (tab) {
        0 -> HomeScreen()
        1 -> SearchScreen()
        2 -> SettingsScreen()
    }
}
```

---

## Rules

- Never use raw `NavigationStack`/`TabView`/`.sheet()`/`<Drawer>` in screen files -- always use Adaptive wrappers
- iPad portrait = compact, landscape = regular
- Screens with no responsive pattern must be marked `// responsive: N/A`
- Active tab uses a filled icon variant and brand color highlight on all platforms
- Sidebar starts expanded (`true`) by default on all platforms; collapse state is local

---

## Accessibility

- **Web:** `role="navigation"` with `aria-label="Main"` on both sidebar and bottom nav; `aria-current="page"` on active tab; `aria-label` on collapse/expand toggle
- **iOS:** `.accessibilityLabel` on each sidebar item; `.accessibilityAddTraits(.isSelected)` on active tab; collapse button has `accessibilityLabel("Collapse sidebar")` / `accessibilityLabel("Expand sidebar")`
- **Android:** `semantics { role = Role.Tab; selected = isActive; contentDescription = tab.label }` on each sidebar item; `contentDescription` on collapse/expand toggle
