# AppRangeSlider

**Web:** `multi-repo-nextjs/app/components/Native/AppRangeSlider.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Native/AppRangeSlider.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppRangeSlider.kt`

---

## Overview

A dual-thumb range slider for selecting a numeric interval. Web wraps shadcn Slider (Radix) with `value={[lower, upper]}` for native dual-thumb behavior; iOS uses a custom `DragGesture`-based implementation with proximity-based thumb selection; Android wraps Material 3 `RangeSlider`. All platforms include haptic feedback on thumb grabs and step changes.

---

## Props

### Web (`AppRangeSliderProps`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lowerValue` | `number` | required | Lower bound of the selected range |
| `upperValue` | `number` | required | Upper bound of the selected range |
| `onChange` | `(values: [number, number]) => void` | required | Called with [lower, upper] on thumb move |
| `range` | `[number, number]` | `[0, 100]` | Absolute min and max of the track |
| `step` | `number` | `1` | Step increment |
| `showLabels` | `boolean` | `false` | Renders min/max labels below the track |
| `className` | `string` | `""` | Additional CSS class for the wrapper |

### iOS (`AppRangeSlider`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lowerValue` | `Binding<Double>` | required | Current minimum (left thumb) value |
| `upperValue` | `Binding<Double>` | required | Current maximum (right thumb) value |
| `range` | `ClosedRange<Double>` | required | Full selectable range (e.g. `0...100`) |
| `step` | `Double` | `0` | Discrete step interval (0 for continuous) |
| `showLabels` | `Bool` | `false` | Renders formatted lower/upper values below |

### Android (`AppRangeSlider`)
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `lowerValue` | `Float` | required | Current minimum (left thumb) value |
| `upperValue` | `Float` | required | Current maximum (right thumb) value |
| `onValueChange` | `(lower: Float, upper: Float) -> Unit` | required | Called on each drag with new values |
| `range` | `ClosedFloatingPointRange<Float>` | required | Full selectable range (e.g. `0f..100f`) |
| `modifier` | `Modifier` | `Modifier` | Modifier applied to the outer Column |
| `step` | `Float` | `0f` | Discrete step interval (0f for continuous) |
| `showLabels` | `Boolean` | `false` | Renders formatted lower/upper values below |

---

## Platform Notes

| Platform | Native API Wrapped |
|----------|-------------------|
| Web | shadcn Slider (Radix Slider) with dual-thumb `value` array |
| iOS | Custom `DragGesture` + `GeometryReader` (dual overlapping `Slider` approach caused conflicts) |
| Android | Material 3 `RangeSlider` with `RangeSliderState` |

---

## Usage Examples

### Web
```tsx
<AppRangeSlider
  lowerValue={low}
  upperValue={high}
  onChange={([l, h]) => { setLow(l); setHigh(h); }}
  range={[0, 100]}
  step={5}
  showLabels
/>
```

### iOS
```swift
@State var low = 20.0
@State var high = 80.0

AppRangeSlider(lowerValue: $low, upperValue: $high, range: 0...100)

// With step and labels:
AppRangeSlider(lowerValue: $low, upperValue: $high, range: 0...100,
               step: 10, showLabels: true)
```

### Android
```kotlin
var low by remember { mutableFloatStateOf(20f) }
var high by remember { mutableFloatStateOf(80f) }

AppRangeSlider(
    lowerValue = low,
    upperValue = high,
    onValueChange = { l, h -> low = l; high = h },
    range = 0f..100f,
    step = 10f,
    showLabels = true
)
```

---

## Accessibility

- **Web:** Radix Slider provides keyboard support (arrow keys to adjust) and ARIA slider role for both thumbs; `pointerdown` handler sets grab cursor during drag.
- **iOS:** Custom `DragGesture` implementation with `UIImpactFeedbackGenerator` on grab and `UISelectionFeedbackGenerator` on step changes; minimum distance between thumbs prevents overlap.
- **Android:** Material 3 `RangeSlider` provides TalkBack support with value announcements; haptic feedback on grab (LongPress) and step changes (TextHandleMove).
