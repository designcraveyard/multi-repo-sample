# AppProgressLoader

**Web:** `multi-repo-nextjs/app/components/Native/AppProgressLoader.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Native/AppProgressLoader.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppProgressLoader.kt`

---

## Overview

A loading indicator with two variants: an indefinite spinning circular ring for unknown progress, and a definite linear progress bar with a fill percentage for measurable progress. All platforms support an optional descriptive label below the indicator.

---

## Props

### Web (`AppProgressLoaderProps`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"indefinite" \| "definite"` | required | Discriminated union field selecting the variant |
| `value` | `number` | required (definite only) | Current progress value |
| `total` | `number` | `100` (definite only) | The value at which progress is 100% |
| `label` | `string` | `undefined` | Optional descriptive label below the loader |
| `className` | `string` | `""` | Additional CSS class for the wrapper |

### iOS (`AppProgressLoader`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `AppProgressLoaderVariant` | `.indefinite` | `.indefinite` or `.definite(value: Double, total: Double)` |
| `label` | `String?` | `nil` | Optional descriptive label below the indicator |

### Android (`AppProgressLoader`)
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `modifier` | `Modifier` | `Modifier` | Modifier applied to the outer Column |
| `variant` | `ProgressVariant` | `ProgressVariant.Indefinite` | `Indefinite` or `Definite(value: Float, total: Float)` |
| `label` | `String?` | `null` | Optional descriptive label below the indicator |

---

## Platform Notes

| Platform | Native API Wrapped |
|----------|-------------------|
| Web | Pure CSS spinning border (indefinite) / shadcn `Progress` component (definite) |
| iOS | SwiftUI `ProgressView(.circular)` (indefinite) / custom `Capsule` + `GeometryReader` bar (definite) |
| Android | Material 3 `CircularProgressIndicator` (indefinite) / `LinearProgressIndicator` (definite) |

---

## Usage Examples

### Web
```tsx
// Indefinite spinner
<AppProgressLoader variant="indefinite" />

// Indefinite with label
<AppProgressLoader variant="indefinite" label="Loading..." />

// Definite linear bar
<AppProgressLoader variant="definite" value={65} total={100} />

// Definite with label
<AppProgressLoader variant="definite" value={3} total={10} label="Step 3 of 10" />
```

### iOS
```swift
// Indefinite spinner
AppProgressLoader()

// Indefinite with label
AppProgressLoader(label: "Uploading...")

// Definite linear bar
AppProgressLoader(variant: .definite(value: 0.4, total: 1.0), label: "40%")

// Definite with raw values
AppProgressLoader(variant: .definite(value: 7, total: 10), label: "Step 7 of 10")
```

### Android
```kotlin
// Indefinite spinner
AppProgressLoader()

// Indefinite with label
AppProgressLoader(label = "Loading...")

// Definite linear bar
AppProgressLoader(variant = ProgressVariant.Definite(value = 0.65f, total = 1f))

// Definite with label
AppProgressLoader(
    variant = ProgressVariant.Definite(value = 3f, total = 10f),
    label = "Step 3 of 10"
)
```

---

## Accessibility

- **Web:** Indefinite spinner has `role="status"` and `aria-label` (defaults to "Loading"); definite bar has `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`.
- **iOS:** SwiftUI `ProgressView` provides VoiceOver announcements natively for both circular and linear styles.
- **Android:** Material 3 `CircularProgressIndicator` and `LinearProgressIndicator` include built-in semantics for TalkBack.
