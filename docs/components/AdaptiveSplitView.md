# AdaptiveSplitView

**Web:** Not yet implemented
**iOS:** Not yet implemented
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/adaptive/AdaptiveSplitView.kt`

---

## Overview

Adaptive list-detail layout that switches between single-pane push navigation on compact screens and a side-by-side split panel on regular screens. Use this for any master-detail flow (e.g., list of items with a detail view) to get automatic responsive behavior without manual breakpoint handling.

---

## Breakpoint Behavior

| Viewport | Compact (< 768px) | Regular (>= 768px) |
|----------|-------------------|---------------------|
| Web | N/A (not yet implemented) | N/A (not yet implemented) |
| iOS | N/A (not yet implemented) | N/A (not yet implemented) |
| Android | Single pane -- list only; detail replaces list with animated horizontal slide transition | Side-by-side: fixed 320dp list pane, 1dp divider, detail fills remainder; optional placeholder when no detail selected |

---

## Props

### Web
Not yet implemented.

### iOS
Not yet implemented.

### Android (`AdaptiveSplitView`)
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `widthSizeClass` | `WindowWidthSizeClass` | required | Current window width class to determine layout mode |
| `showDetail` | `Boolean` | required | Whether the detail pane should be visible |
| `onBackToList` | `() -> Unit` | required | Callback to navigate back from detail to list (compact mode only) |
| `listContent` | `@Composable () -> Unit` | required | Composable slot rendering the list/master pane |
| `detailContent` | `@Composable () -> Unit` | required | Composable slot rendering the detail pane |
| `modifier` | `Modifier` | `Modifier` | Modifier applied to the outer container |
| `detailPlaceholder` | `(@Composable () -> Unit)?` | `null` | Optional placeholder shown in the detail area when `showDetail` is false (regular layout only) |

---

## Usage Examples

### Web
```tsx
// Not yet implemented -- see Android for reference API
```

### iOS
```swift
// Not yet implemented -- see Android for reference API
```

### Android
```kotlin
AdaptiveSplitView(
    widthSizeClass = widthSizeClass,
    showDetail = selectedItem != null,
    onBackToList = { selectedItem = null },
    listContent = { ItemList(onSelect = { selectedItem = it }) },
    detailContent = { selectedItem?.let { ItemDetail(it) } },
)

// With a placeholder for the empty detail pane on regular layouts:
AdaptiveSplitView(
    widthSizeClass = widthSizeClass,
    showDetail = selectedItem != null,
    onBackToList = { selectedItem = null },
    listContent = { ItemList(onSelect = { selectedItem = it }) },
    detailContent = { selectedItem?.let { ItemDetail(it) } },
    detailPlaceholder = { EmptyStatePlaceholder("Select an item") },
)
```

---

## Rules

- Never use raw `NavigationStack`/`TabView`/`.sheet()`/`<Drawer>` in screen files -- always use Adaptive wrappers
- iPad portrait = compact, landscape = regular
- Screens with no responsive pattern must be marked `// responsive: N/A`
- The `onBackToList` callback is only invoked in compact mode; on regular layouts both panes are always visible
- List pane width is fixed at 320dp on regular layouts; detail fills the remaining space
- Compact mode uses `AnimatedContent` with horizontal slide transitions for navigation feel

---

## Accessibility

- **Android:** Compact transitions use `AnimatedContent` with `slideInHorizontally`/`slideOutHorizontally`, providing visual continuity for the navigation context. The list and detail panes inherit accessibility semantics from their content composables. The divider in the regular layout is a decorative `Box` and does not receive focus.
- **Web/iOS:** Not yet implemented -- when built, should follow the same patterns as `AdaptiveNavShell` and `AdaptiveSheet` for focus management and screen reader support.
---

## Cross-Platform Audit

_Last refreshed: 2026-06-29_

| Platform | Source | Status | API snapshot |
|----------|--------|--------|--------------|
| Web | — | Missing / not applicable | No implementation file found. |
| iOS | — | Missing / not applicable | No implementation file found. |
| Android | `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/adaptive/AdaptiveSplitView.kt` | Present | See source file for the public API. |

**Parity status:** Partial implementation (1/3 platforms).

**Token contract:** component code must use semantic tokens only: CSS `--surfaces-*`, `--typography-*`, `--icons-*`, and `--border-*`; Swift `Color.surfaces*`, `Color.typography*`, `Color.icons*`, and `Color.border*`; Kotlin `SemanticColors.*`, `Spacing.*`, `Radius.*`, `IconSize.*`, and `AppTypography.*`. Disabled state remains opacity 0.5 across platforms.

**Accessibility contract:** preserve semantic roles/labels, visible keyboard focus on web, VoiceOver labels/traits on iOS, and TalkBack semantics on Android when changing the component.
