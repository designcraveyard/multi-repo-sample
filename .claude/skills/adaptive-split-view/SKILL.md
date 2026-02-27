---
name: adaptive-split-view
description: Reference for AdaptiveSplitView usage — when to use it, how to wire list→detail navigation across iOS, web, and Android. Claude-only background knowledge loaded automatically when implementing list→detail screens.
user-invocable: false
---

# AdaptiveSplitView Reference

`AdaptiveSplitView` is an **opt-in** adaptive wrapper for screens with list → detail navigation.

- **Compact** (phone / mobile web): push navigation — tapping a row pushes the detail view onto a navigation stack
- **Regular** (iPad landscape / desktop web): side-by-side split — list panel on the left, detail panel on the right

## When to Use

Use `AdaptiveSplitView` when:
- A screen has a **persistent list** (messages, items, contacts) where tapping opens a **detail view**
- The detail view makes sense as a persistent side panel on wide layouts
- You want iPad / desktop to feel native, not like a zoomed phone UI

Do NOT use it when:
- The screen is a simple form or single-purpose view (use `AdaptiveSheet` for modals instead)
- The list is a one-off navigation step (use standard push navigation)
- Only one item is ever shown (no list at all)

## File Locations

```
iOS:     Components/Adaptive/AdaptiveSplitView.swift
Web:     app/components/Adaptive/AdaptiveSplitView.tsx
Android: ui/adaptive/AdaptiveSplitView.kt
```

## iOS Usage

```swift
// In the screen View body
@State private var selectedItem: Item? = nil

AdaptiveSplitView(
    list: {
        ItemListView(selectedItem: $selectedItem)
    },
    detail: {
        if let item = selectedItem {
            ItemDetailView(item: item)
        } else {
            EmptySelectionView()  // shown when no row selected on iPad
        }
    }
)
```

**Key behaviours:**
- `.compact` (iPhone, iPad portrait): `list` fills the screen; tapping a row pushes `detail` via `NavigationLink`
- `.regular` (iPad landscape): renders as `NavigationSplitView` with list on left, detail on right
- `selectedItem` binding drives both: setting it updates the detail panel in regular mode or pushes in compact mode
- Always provide an empty-selection view for regular mode — it shows when no row is selected yet

## Web Usage

```tsx
import { AdaptiveSplitView } from "@/app/components/Adaptive";

// In page.tsx
const [selectedId, setSelectedId] = useState<string | null>(null);

<AdaptiveSplitView
  list={
    <ItemList
      selectedId={selectedId}
      onSelect={setSelectedId}
    />
  }
  detail={
    selectedId
      ? <ItemDetail id={selectedId} />
      : <EmptySelectionPlaceholder />
  }
/>
```

**Key behaviours:**
- Mobile (`< 768px`): list fills viewport; selecting an item navigates to the detail route (or renders detail inline with back button)
- Desktop (`≥ 768px`): CSS grid `grid-cols-[320px_1fr]` — list left, detail right
- `useMediaQuery("(min-width: 768px)")` used internally; SSR-safe (defaults to mobile)
- Barrel import: `import { AdaptiveSplitView } from "@/app/components/Adaptive"`

## Android Usage

```kotlin
// In screen composable
var selectedItem by remember { mutableStateOf<Item?>(null) }
val windowSizeClass = calculateWindowSizeClass(activity)

AdaptiveSplitView(
    windowSizeClass = windowSizeClass,
    list = {
        ItemListScreen(
            selectedItem = selectedItem,
            onItemSelect = { selectedItem = it }
        )
    },
    detail = {
        selectedItem?.let { ItemDetailScreen(item = it) }
            ?: EmptySelectionScreen()
    }
)
```

**Key behaviours:**
- `Compact`: list fills screen, selecting navigates via `NavController`
- `Medium` / `Expanded`: side-by-side using `Row` with `weight(0.35f)` list / `weight(0.65f)` detail
- Requires `WindowWidthSizeClass` from `calculateWindowSizeClass()`

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using `NavigationSplitView` directly in an iOS screen | Use `AdaptiveSplitView` — it handles compact/regular switching |
| No empty-selection state in the detail slot | Always provide a placeholder for when no row is selected |
| Using `AdaptiveSplitView` for a modal/form | Use `AdaptiveSheet` instead — split view is for persistent list→detail |
| Hard-coding the list width | Let the wrapper control widths via its internal layout |
| Forgetting to wire `selectedItem` bidirectionally | The same state drives both push-nav (compact) and panel (regular) |

## Related Wrappers

- `AdaptiveNavShell` — root app shell (tabs / sidebar) — always present, not opt-in
- `AdaptiveSheet` — bottom sheet on mobile, centered dialog on desktop — use for overlays/forms
