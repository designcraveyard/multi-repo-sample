# AppColorPicker

**Web:** `multi-repo-nextjs/app/components/Native/AppColorPicker.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Native/AppColorPicker.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppColorPicker.kt`

---

## Overview

A color selection component with an optional label. Web uses the native `<input type="color">` browser element; iOS wraps SwiftUI `ColorPicker` which opens the system color wheel; Android provides a custom grid of preset color swatches (since Compose has no built-in color picker) with an optional opacity slider.

---

## Props

### Web (`AppColorPickerProps`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | Hex color string (e.g. `"#FF0000"`) |
| `onChange` | `(value: string) => void` | required | Called when the user picks a new color |
| `label` | `string` | `undefined` | Label shown next to the color swatch |
| `disabled` | `boolean` | `false` | Renders at 0.5 opacity and blocks interaction |
| `className` | `string` | `""` | Additional CSS class for the wrapper |

### iOS (`AppColorPicker`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `String` | required | Label text displayed next to the color swatch |
| `selection` | `Binding<Color>` | required | The currently selected SwiftUI Color (two-way binding) |
| `supportsOpacity` | `Bool` | `false` | When true, the system color wheel includes an alpha slider |

### Android (`AppColorPicker`)
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `value` | `Color` | required | Currently selected Compose Color |
| `onValueChange` | `(Color) -> Unit` | required | Called with the new Color on selection |
| `modifier` | `Modifier` | `Modifier` | Modifier applied to the outer Column |
| `label` | `String?` | `null` | Optional label text above the swatch grid |
| `showOpacity` | `Boolean` | `false` | When true, shows an opacity slider below the grid |

---

## Platform Notes

| Platform | Native API Wrapped |
|----------|-------------------|
| Web | Native `<input type="color">` with `appearance: none` styling |
| iOS | SwiftUI `ColorPicker` (opens system color wheel sheet) |
| Android | Custom `FlowRow` grid of 14 preset color swatches + optional `Slider` for opacity |

---

## Usage Examples

### Web
```tsx
<AppColorPicker
  value={color}
  onChange={setColor}
  label="Accent Color"
/>
```

### iOS
```swift
AppColorPicker(label: "Accent Color", selection: $accentColor)

// With opacity slider:
AppColorPicker(label: "Background", selection: $bgColor, supportsOpacity: true)
```

### Android
```kotlin
AppColorPicker(
    value = selectedColor,
    onValueChange = { selectedColor = it },
    label = "Accent Color"
)

// With opacity slider:
AppColorPicker(
    value = selectedColor,
    onValueChange = { selectedColor = it },
    label = "Background",
    showOpacity = true
)
```

---

## Accessibility

- **Web:** `aria-label` on the color input (defaults to "Color picker" or the label text); `<label>` is linked to the input via `useId()` for click-to-focus.
- **iOS:** SwiftUI `ColorPicker` provides full VoiceOver support for the swatch and the system color wheel; haptic feedback on color changes.
- **Android:** Each swatch circle is clickable with implicit semantics; selected swatch is visually distinguished by a brand-colored border. No dedicated content descriptions on individual swatches.
