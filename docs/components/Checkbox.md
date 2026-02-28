# Checkbox

**Figma:** bubbles-kit
**Web:** `multi-repo-nextjs/app/components/Checkbox/Checkbox.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Checkbox/AppCheckbox.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppCheckbox.kt`

---

## Overview

A custom-styled checkbox with three states: unchecked, checked (checkmark), and indeterminate (horizontal dash). Supports an optional text label.

---

## Props

### Web (`CheckboxProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | `false` | Whether the checkbox is checked |
| `onChange` | `(checked: boolean) => void` | — | **Required.** Change handler |
| `label` | `string?` | — | Optional text label |
| `indeterminate` | `boolean` | `false` | Shows horizontal dash instead of checkmark |
| `disabled` | `boolean` | `false` | Disables interaction, 0.5 opacity |
| `className` | `string` | `""` | Additional CSS classes |
| `id` | `string` | auto | HTML id attribute |
| `...rest` | `InputHTMLAttributes` | — | Forwarded to hidden `<input>` |

### iOS (`AppCheckbox`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `Bool` | `false` | Whether the checkbox is checked |
| `indeterminate` | `Bool` | `false` | Shows horizontal dash instead of checkmark |
| `label` | `String?` | `nil` | Optional text label |
| `disabled` | `Bool` | `false` | Disables interaction, 0.5 opacity |
| `onChange` | `((Bool) -> Void)?` | `nil` | Change handler |

### Android (`AppCheckbox`)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `checked` | `Boolean` | — | **Required.** Whether the checkbox is checked |
| `onCheckedChange` | `(Boolean) -> Unit` | — | **Required.** Change handler |
| `modifier` | `Modifier` | `Modifier` | Compose modifier |
| `label` | `String?` | `null` | Optional text label |
| `enabled` | `Boolean` | `true` | Interactive; false = 0.5 opacity |

> **Note:** Android does not support the indeterminate state.

---

## States

| State | Visual |
|-------|--------|
| Unchecked | Border only, empty interior |
| Checked | Brand fill + white checkmark icon |
| Indeterminate | Brand fill + white horizontal dash (web/iOS only) |
| Disabled | 0.5 opacity, non-interactive |

---

## Token Usage

| Property | Token |
|----------|-------|
| Unchecked border | `--border-default` |
| Checked fill | `--surfaces-brand-interactive` |
| Checkmark / dash | `--typography-on-brand-primary` (white) |
| Shape | 20px rounded square (4px border-radius) |
| Disabled | `opacity-50` |

---

## Usage Examples

### Web

```tsx
import { Checkbox } from "@/app/components/Checkbox";

// Basic
<Checkbox checked={isChecked} onChange={setIsChecked} label="Accept terms" />

// Indeterminate (e.g., parent of partially-checked group)
<Checkbox
  checked={false}
  indeterminate={isMixed}
  onChange={handleToggleAll}
  label="Select all"
/>

// Disabled
<Checkbox checked={true} onChange={() => {}} label="Locked option" disabled />
```

### iOS

```swift
// Basic
AppCheckbox(checked: isChecked, label: "Accept terms") { isChecked = $0 }

// Indeterminate
AppCheckbox(
    checked: false,
    indeterminate: true,
    label: "Select all"
) { toggleAll($0) }

// Disabled
AppCheckbox(checked: true, label: "Locked option", disabled: true)
```

### Android

```kotlin
import com.abhishekverma.multirepo.ui.components.AppCheckbox

// Basic
AppCheckbox(
    checked = isChecked,
    onCheckedChange = { isChecked = it },
    label = "Accept terms",
)

// Disabled
AppCheckbox(
    checked = true,
    onCheckedChange = {},
    label = "Locked option",
    enabled = false,
)
```

---

## Accessibility

- **Web:** Hidden native `<input type="checkbox">` with `sr-only` class; `aria-checked="mixed"` for indeterminate state; keyboard activation via `Space`
- **iOS:** Button with `.accessibilityValue("Mixed"/"Checked"/"Unchecked")`; haptic feedback on tap
- **Android:** Material 3 Checkbox with built-in TalkBack support; `role = Checkbox` in semantics
