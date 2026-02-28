# Switch

**Figma:** bubbles-kit
**Web:** `multi-repo-nextjs/app/components/Switch/Switch.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Switch/AppSwitch.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppSwitch.kt`

---

## Overview

A toggle switch for binary on/off states. Track + thumb with smooth animation. Optional text label.

---

## Props

### Web (`SwitchProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | `false` | Whether the switch is on |
| `onChange` | `(checked: boolean) => void` | — | **Required.** Change handler |
| `label` | `string?` | — | Optional text label |
| `disabled` | `boolean` | `false` | Disables interaction, 0.5 opacity |
| `className` | `string` | `""` | Additional CSS classes |
| `id` | `string` | auto | HTML id attribute |
| `...rest` | `ButtonHTMLAttributes` | — | Forwarded to `<button>` |

### iOS (`AppSwitch`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `Bool` | `false` | Whether the switch is on |
| `label` | `String?` | `nil` | Optional text label |
| `disabled` | `Bool` | `false` | Disables interaction, 0.5 opacity |
| `onChange` | `((Bool) -> Void)?` | `nil` | Change handler |

### Android (`AppSwitch`)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `checked` | `Boolean` | — | **Required.** Whether the switch is on |
| `onCheckedChange` | `(Boolean) -> Unit` | — | **Required.** Change handler |
| `modifier` | `Modifier` | `Modifier` | Compose modifier |
| `label` | `String?` | `null` | Optional text label |
| `enabled` | `Boolean` | `true` | Interactive; false = 0.5 opacity |

---

## States

| State | Visual |
|-------|--------|
| Off | Low-contrast track, neutral thumb (left) |
| On | Brand track, on-brand thumb (right) |
| Disabled | 0.5 opacity, non-interactive |

---

## Token Usage

| Property | Token |
|----------|-------|
| Off track | `--surfaces-base-low-contrast` |
| On track | `--surfaces-brand-interactive` |
| Thumb | white |
| Shape | pill (`rounded-full`) |
| Disabled | `opacity-50` |

---

## Usage Examples

### Web

```tsx
import { Switch } from "@/app/components/Switch";

// Basic
<Switch checked={isDarkMode} onChange={setIsDarkMode} label="Dark mode" />

// Without label
<Switch checked={isEnabled} onChange={setIsEnabled} />

// Disabled
<Switch checked={true} onChange={() => {}} label="Locked" disabled />
```

### iOS

```swift
// Basic
AppSwitch(checked: isDarkMode, label: "Dark mode") { isDarkMode = $0 }

// Without label
AppSwitch(checked: isEnabled) { isEnabled = $0 }

// Disabled
AppSwitch(checked: true, label: "Locked", disabled: true)
```

### Android

```kotlin
import com.abhishekverma.multirepo.ui.components.AppSwitch

// Basic
AppSwitch(
    checked = isDarkMode,
    onCheckedChange = { isDarkMode = it },
    label = "Dark mode",
)

// Without label
AppSwitch(checked = isEnabled, onCheckedChange = { isEnabled = it })

// Disabled
AppSwitch(
    checked = true,
    onCheckedChange = {},
    label = "Locked",
    enabled = false,
)
```

---

## Accessibility

- **Web:** `<button role="switch">` with `aria-checked`; keyboard activation via `Space`/`Enter`
- **iOS:** Wraps native `Toggle`; `.accessibilityValue("On"/"Off")`; haptic feedback on tap
- **Android:** Material 3 Switch with built-in TalkBack support; role and state announced automatically
