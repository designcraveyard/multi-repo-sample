# DateGrid

**Figma:** bubbles-kit > node `93:4399` (item) . `95:2791` (grid)
**Web:** `multi-repo-nextjs/app/components/DateGrid/DateGrid.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/DateGrid/AppDateGrid.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppDateGrid.kt`

---

## Overview

A weekly horizontal date selector strip. Shows 7 days with day abbreviation, date number, and today-dot indicator. Supports both controlled and uncontrolled selection. Includes week navigation (buttons on web, swipe on mobile).

Exports two components: **DateItem** / **AppDateItem** (single cell) and **DateGrid** / **AppDateGrid** (full strip).

---

## Props

### Web (`DateGridProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `anchorDate` | `Date?` | today | Center date for the displayed week |
| `selectedDate` | `Date?` | — | Controlled selection; omit for uncontrolled |
| `onSelect` | `(date: Date) => void` | — | Selection change handler |
| `startOfWeek` | `0 \| 1` | `0` | 0 = Sunday, 1 = Monday |
| `className` | `string` | `""` | Additional CSS classes |

### iOS (`AppDateGrid`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `anchorDate` | `Date` | `Date()` | Center date for the displayed week |
| `selectedDate` | `Binding<Date>` | — | Controlled selection (use overload without for uncontrolled) |
| `onSelect` | `((Date) -> Void)?` | `nil` | Selection change handler |
| `startOfWeek` | `Int` | `1` | 1 = Monday (Calendar weekday value) |

### Android (`AppDateGrid`)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `anchorDate` | `Date` | `Date()` | Center date for the displayed week |
| `selectedDate` | `Date?` | `null` | Controlled selection; null = uncontrolled |
| `modifier` | `Modifier` | `Modifier` | Compose modifier |
| `onSelect` | `((Date) -> Unit)?` | `null` | Selection change handler |
| `firstDayOfWeek` | `Int` | `Calendar.SUNDAY` | Calendar constant for first day |

---

## States

| State | Visual |
|-------|--------|
| Default | Muted text, no background |
| Selected / Active | White card with shadow, primary text |
| Today | 4px brand dot below date number |
| Disabled | 0.5 opacity, non-interactive |

---

## Token Usage

| Property | Token |
|----------|-------|
| Active background | `--surfaces-base-primary` with shadow |
| Active text | `--typography-primary` |
| Default text | `--typography-secondary` |
| Today dot | `--surfaces-brand-interactive` |
| Disabled | `opacity-50` |

---

## Usage Examples

### Web

```tsx
import { DateGrid } from "@/app/components/DateGrid";

// Uncontrolled (manages own selection)
<DateGrid />

// Controlled with Monday start
<DateGrid
  selectedDate={selected}
  onSelect={setSelected}
  startOfWeek={1}
/>

// Anchored to a specific week
<DateGrid anchorDate={new Date("2026-03-01")} onSelect={handleSelect} />
```

### iOS

```swift
// Uncontrolled
AppDateGrid()

// Controlled
AppDateGrid(anchorDate: Date(), selectedDate: $selectedDate)

// With selection callback
AppDateGrid(onSelect: { date in
    print("Selected: \(date)")
})
```

### Android

```kotlin
import com.abhishekverma.multirepo.ui.components.AppDateGrid

// Uncontrolled
AppDateGrid()

// Controlled
AppDateGrid(
    selectedDate = selected,
    onSelect = { selected = it },
)

// Monday start
AppDateGrid(
    selectedDate = selected,
    onSelect = { selected = it },
    firstDayOfWeek = Calendar.MONDAY,
)
```

---

## Accessibility

- **Web:** `role="grid"` on container + `role="gridcell"` on each cell; `aria-selected` for active state; `aria-label` includes full day name, date, and selected/today status
- **iOS:** `.accessibilityElement(children: .ignore)` with merged label on each cell; haptic feedback on selection
- **Android:** `semantics { role = Button; selected; contentDescription }` on each cell; TalkBack announces day, date, and selection state
