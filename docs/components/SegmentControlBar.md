# SegmentControlBar

**Figma:** bubbles-kit › `81:637`
**Web:** `multi-repo-nextjs/app/components/SegmentControlBar/SegmentControlBar.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/SegmentControlBar/AppSegmentControlBar.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppSegmentControlBar.kt`
**Axes:** Size(Small/Medium/Large) × Type(SegmentControl/Chips/Filters) = 9

A unified selection bar with three behavioral modes: a pill-shaped segment control (single-select with animated sliding thumb), a row of chip tabs (single-select), or a row of filter chips (multi-select).

---

## Props

### Web (`SegmentControlBarProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `SegmentItem[]` | — | Item definitions (required) |
| `type` | `SegmentBarType` | `"segmentControl"` | Selection mode and visual style |
| `size` | `SegmentBarSize` | `"md"` | Size of all items |
| `value` | `string \| string[]` | — | Controlled value; `string[]` for `filters` |
| `defaultValue` | `string \| string[]` | First item / `[]` | Uncontrolled initial value |
| `onChange` | `(value: string \| string[]) => void` | — | Change handler |
| `className` | `string` | `""` | Extra Tailwind classes |

### `SegmentItem`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `label` | `string` | Display label |

### iOS (`AppSegmentControlBar`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `[AppSegmentItem]` | — | Item definitions (required) |
| `type` | `AppSegmentBarType` | `.segmentControl` | Selection mode |
| `size` | `AppSegmentBarSize` | `.md` | Size |
| `selection` | `Binding<String>` or `Binding<[String]>` | — | Selection binding |
| `onChange` | `((String) -> Void)?` | `nil` | Optional callback |

### Android (`AppSegmentControlBar`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `List<AppSegmentItem>` | — | Item definitions (required) |
| `selected` | `String` | — | Currently selected item id (required) |
| `onSelected` | `(String) -> Unit` | — | Selection callback (required) |
| `modifier` | `Modifier` | `Modifier` | Compose modifier |
| `type` | `AppSegmentBarType` | `AppSegmentBarType.SegmentControl` | Selection mode (`SegmentControl`/`Chips`/`Filters`) |
| `size` | `AppSegmentBarSize` | `AppSegmentBarSize.Md` | Size (`Sm`/`Md`/`Lg`) |

Multi-select variant: `AppSegmentControlBarMulti`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `List<AppSegmentItem>` | — | Item definitions (required) |
| `selected` | `Set<String>` | — | Currently selected item ids (required) |
| `onSelectedChange` | `(Set<String>) -> Unit` | — | Selection change callback (required) |

---

## Types

### `SegmentBarType` / `AppSegmentBarType`

| Type | Selection | Visual | Behavior |
|------|-----------|--------|----------|
| `segmentControl` | Single | Pill container + animated sliding white thumb | Roving thumb animates to active item |
| `chips` | Single | Row of borderless rounded pills | Active item has low-contrast-pressed bg |
| `filters` | **Multi** | Row of bordered rounded pills | Toggle individual items; active = border-active |

---

## Sizes

| Size | Padding | Font |
|------|---------|------|
| `sm` | `px-2 py-1` | `cta-sm` 12px/600 |
| `md` | `px-3 py-1.5` | `cta-md` 14px/600 |
| `lg` | `px-4 py-2` | `cta-lg` 16px/600 |

---

## Token Usage

| Property | Token |
|----------|-------|
| SegmentControl container bg | `--surfaces-base-low-contrast` / `Color.surfacesBaseLowContrast` |
| Thumb (active indicator) | `--surfaces-base-primary` / `Color.surfacesBasePrimary` |
| Chip active bg | `--surfaces-base-low-contrast-pressed` / `Color.surfacesBaseLowContrastPressed` |
| Chip inactive bg | `--surfaces-base-low-contrast` / `Color.surfacesBaseLowContrast` |
| Filter active border | `--border-active` / `Color.borderActive` |
| Filter default border | `--border-default` / `Color.borderDefault` |
| Active text | `--typography-primary` / `Color.typographyPrimary` |
| Inactive text | `--typography-secondary` / `Color.typographySecondary` |

---

## Controlled vs Uncontrolled

```tsx
// Uncontrolled (segmentControl)
<SegmentControlBar
  items={[{ id: "day", label: "Day" }, { id: "week", label: "Week" }, { id: "month", label: "Month" }]}
  defaultValue="week"
/>

// Controlled (filters — multi-select returns string[])
const [filters, setFilters] = useState<string[]>([]);
<SegmentControlBar
  type="filters"
  items={filterItems}
  value={filters}
  onChange={(v) => setFilters(v as string[])}
/>
```

---

## Accessibility

- `segmentControl` / `chips`: container `role="radiogroup"`; each item `role="radio"` + `aria-checked`
- `filters`: container `role="group"`; each item `role="checkbox"` + `aria-checked`
- Focus ring: `--border-active` ring on each item
- iOS: `.accessibilityElement` on container; each item `.accessibilityAddTraits`
- Android: TalkBack announces selected state via Material 3 built-in semantics; each segment item is focusable and announces its label and selection state

---

## Usage Examples

### Web

```tsx
import { SegmentControlBar } from "@/app/components/SegmentControlBar";

// Segment control (single-select with thumb animation)
<SegmentControlBar
  items={[
    { id: "overview", label: "Overview" },
    { id: "details", label: "Details" },
    { id: "history", label: "History" },
  ]}
  defaultValue="overview"
  onChange={(v) => console.log(v)}
/>

// Chips row (single-select)
<SegmentControlBar
  type="chips"
  size="sm"
  items={[{ id: "all", label: "All" }, { id: "photos", label: "Photos" }, { id: "videos", label: "Videos" }]}
  defaultValue="all"
/>

// Filters row (multi-select)
const [active, setActive] = useState<string[]>([]);
<SegmentControlBar
  type="filters"
  items={[{ id: "recent", label: "Recent" }, { id: "starred", label: "Starred" }, { id: "shared", label: "Shared" }]}
  value={active}
  onChange={(v) => setActive(v as string[])}
/>
```

### iOS

```swift
@State private var period = "week"
@State private var activeFilters: [String] = []

// Segment control
AppSegmentControlBar(
    items: [
        AppSegmentItem(id: "day", label: "Day"),
        AppSegmentItem(id: "week", label: "Week"),
        AppSegmentItem(id: "month", label: "Month"),
    ],
    selection: $period
)

// Filters (multi)
AppSegmentControlBar(
    type: .filters,
    items: [
        AppSegmentItem(id: "recent", label: "Recent"),
        AppSegmentItem(id: "starred", label: "Starred"),
    ],
    multiSelection: $activeFilters
)
```

### Android

```kotlin
var selected by remember { mutableStateOf("week") }

// Segment control (single-select)
AppSegmentControlBar(
    items = listOf(
        AppSegmentItem("week", "Week"),
        AppSegmentItem("month", "Month")
    ),
    selected = selected,
    onSelected = { selected = it }
)

// Chips row
AppSegmentControlBar(
    items = listOf(
        AppSegmentItem("all", "All"),
        AppSegmentItem("photos", "Photos"),
        AppSegmentItem("videos", "Videos")
    ),
    selected = selected,
    onSelected = { selected = it },
    type = AppSegmentBarType.Chips,
    size = AppSegmentBarSize.Sm
)

// Filters (multi-select)
var activeFilters by remember { mutableStateOf(setOf<String>()) }
AppSegmentControlBarMulti(
    items = listOf(
        AppSegmentItem("recent", "Recent"),
        AppSegmentItem("starred", "Starred")
    ),
    selected = activeFilters,
    onSelectedChange = { activeFilters = it }
)
```

---

## Choosing the Right Type

| Scenario | Use |
|----------|-----|
| Toggle between views (e.g. Day/Week/Month) | `segmentControl` |
| Content category selection (e.g. All/Photos/Videos) | `chips` |
| Additive content filters (e.g. Recent + Starred) | `filters` |
