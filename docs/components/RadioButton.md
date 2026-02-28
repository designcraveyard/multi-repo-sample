# RadioButton

**Figma:** bubbles-kit
**Web:** `multi-repo-nextjs/app/components/RadioButton/RadioButton.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/RadioButton/AppRadioButton.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppRadioButton.kt`

---

## Overview

A circular radio button for single-selection within a group. Supports standalone usage or group context via RadioGroup/AppRadioGroup.

---

## Props

### Web (`RadioButtonProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | — | **Required.** Whether selected |
| `onChange` | `(checked: boolean) => void` | — | **Required.** Change handler |
| `label` | `string?` | — | Optional text label |
| `value` | `string?` | — | Value for RadioGroup context |
| `disabled` | `boolean` | `false` | Disables interaction, 0.5 opacity |
| `name` | `string?` | — | HTML name attribute for grouping |
| `className` | `string` | `""` | Additional CSS classes |
| `id` | `string` | auto | HTML id attribute |

### Web (`RadioGroupProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | **Required.** Currently selected value |
| `onChange` | `(value: string) => void` | — | **Required.** Selection change handler |
| `name` | `string` | auto | HTML name for the radio group |
| `disabled` | `boolean` | `false` | Disables all children |
| `children` | `ReactNode` | — | RadioButton children |
| `className` | `string` | `""` | Additional CSS classes |

### iOS (`AppRadioButton`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `Bool` | `false` | Whether selected |
| `label` | `String?` | `nil` | Optional text label |
| `value` | `String?` | `nil` | Value for group context |
| `disabled` | `Bool` | `false` | Disables interaction, 0.5 opacity |
| `onChange` | `((Bool) -> Void)?` | `nil` | Change handler |

### iOS (`AppRadioGroup`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Binding<String>` | — | **Required.** Currently selected value |
| `disabled` | `Bool` | `false` | Disables all children |
| `content` | `@ViewBuilder () -> Content` | — | **Required.** Radio button children |

### Android (`AppRadioButton`)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `selected` | `Boolean` | — | **Required.** Whether selected |
| `onClick` | `() -> Unit` | — | **Required.** Tap handler |
| `modifier` | `Modifier` | `Modifier` | Compose modifier |
| `label` | `String?` | `null` | Optional text label |
| `enabled` | `Boolean` | `true` | Interactive; false = 0.5 opacity |

> **Note:** Android has no built-in RadioGroup wrapper -- the caller manages selection state directly.

---

## States

| State | Visual |
|-------|--------|
| Unselected | Border-only circle, empty interior |
| Selected | Brand fill + white 8px inner dot |
| Disabled | 0.5 opacity, non-interactive |

---

## Token Usage

| Property | Token |
|----------|-------|
| Unselected border | `--border-default` |
| Selected fill | `--surfaces-brand-interactive` |
| Inner dot | white |
| Shape | 20px circle |
| Disabled | `opacity-50` |

---

## Usage Examples

### Web

```tsx
import { RadioButton, RadioGroup } from "@/app/components/RadioButton";

// Group usage
<RadioGroup value={selected} onChange={setSelected}>
  <RadioButton value="a" label="Option A" />
  <RadioButton value="b" label="Option B" />
  <RadioButton value="c" label="Option C" />
</RadioGroup>

// Standalone
<RadioButton checked={isSelected} onChange={setIsSelected} label="Agree" />

// Disabled option
<RadioGroup value={selected} onChange={setSelected}>
  <RadioButton value="a" label="Available" />
  <RadioButton value="b" label="Unavailable" disabled />
</RadioGroup>
```

### iOS

```swift
// Group usage
AppRadioGroup(value: $selected) {
    AppRadioButton(label: "Option A", value: "a")
    AppRadioButton(label: "Option B", value: "b")
    AppRadioButton(label: "Option C", value: "c")
}

// Standalone
AppRadioButton(checked: isSelected, label: "Agree") { isSelected = $0 }

// Disabled
AppRadioButton(label: "Unavailable", value: "b", disabled: true)
```

### Android

```kotlin
import com.abhishekverma.multirepo.ui.components.AppRadioButton

// Manual group management
val options = listOf("Option A", "Option B", "Option C")
options.forEachIndexed { i, option ->
    AppRadioButton(
        selected = selectedIndex == i,
        onClick = { selectedIndex = i },
        label = option,
    )
}

// Disabled
AppRadioButton(
    selected = false,
    onClick = {},
    label = "Unavailable",
    enabled = false,
)
```

---

## Accessibility

- **Web:** Hidden native `<input type="radio">`; RadioGroup has `role="radiogroup"`; keyboard navigation with arrow keys within group
- **iOS:** Button with `.accessibilityValue("Selected"/"Not selected")`; haptic feedback on tap; group uses environment keys for coordination
- **Android:** Material 3 RadioButton with built-in TalkBack support; role and selection state announced automatically
