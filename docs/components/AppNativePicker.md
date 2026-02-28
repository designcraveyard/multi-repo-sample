# AppNativePicker

**Web:** `multi-repo-nextjs/app/components/Native/AppNativePicker.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Native/AppNativePicker.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppNativePicker.kt`

---

## Overview

A chip-styled select dropdown for picking a single option from a list. Web wraps shadcn Select (Radix) with chip-shaped trigger styling, iOS wraps SwiftUI `Menu` with a capsule-shaped trigger, and Android wraps Material 3 `ExposedDropdownMenuBox` with an `OutlinedTextField` trigger.

---

## Props

### Web (`AppNativePickerProps<T>`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Label shown above the trigger (standalone) or as aria-label (embedded) |
| `value` | `T extends string` | required | Currently selected value |
| `onChange` | `(value: T) => void` | required | Called when the user selects a new option |
| `options` | `PickerOption<T>[]` | required | List of options (`{ label, value }`) |
| `placeholder` | `string` | `"Select an option"` | Placeholder text when no value is selected |
| `disabled` | `boolean` | `false` | Renders at 0.5 opacity and blocks interaction |
| `showError` | `boolean` | `false` | Draws an error border and shows errorMessage below |
| `errorMessage` | `string` | `""` | Validation message shown when showError is true |
| `embedded` | `boolean` | `false` | Renders only the chip trigger (no label/error text) for embedding inside InputField |
| `size` | `"sm" \| "md" \| "lg"` | `"sm"` | Chip size for standalone mode (ignored when embedded) |
| `variant` | `"chipTabs" \| "filters"` | `"chipTabs"` | Visual variant for standalone mode (ignored when embedded) |
| `className` | `string` | `""` | Additional CSS class for the wrapper |

### iOS (`AppNativePicker<T: Hashable>`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `String` | required | Form label displayed above the chip trigger |
| `selection` | `Binding<T>` | required | The currently selected value (two-way binding) |
| `options` | `[(label: String, value: T)]` | required | List of options as tuples |
| `isDisabled` | `Bool` | `false` | Renders at 0.5 opacity and blocks interaction |
| `showError` | `Bool` | `false` | Draws a red error border and shows errorMessage |
| `errorMessage` | `String` | `""` | Validation message shown below when showError is true |
| `embedded` | `Bool` | `false` | Renders only the chip trigger for InputField slot embedding |
| `chipSize` | `AppChipSize` | `.sm` | Chip size (.sm/.md/.lg), ignored when embedded |
| `chipVariant` | `AppChipVariant` | `.chipTabs` | Visual variant (.chipTabs/.filters), ignored when embedded |

### Android (`AppNativePicker`)
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `value` | `String` | required | The `PickerOption.id` of the currently selected option |
| `options` | `List<PickerOption>` | required | Available options (`PickerOption(id, label)`) |
| `onSelect` | `(PickerOption) -> Unit` | required | Called with the selected option |
| `modifier` | `Modifier` | `Modifier` | Modifier applied to the outer Column |
| `label` | `String?` | `null` | Optional label text above the picker |
| `showError` | `Boolean` | `false` | Error border and errorMessage display |
| `errorMessage` | `String?` | `null` | Helper text below in error state |
| `enabled` | `Boolean` | `true` | When false, dimmed to 50% opacity |

---

## Platform Notes

| Platform | Native API Wrapped |
|----------|-------------------|
| Web | shadcn Select (Radix Select primitive) with chip-styled trigger |
| iOS | SwiftUI `Menu` with capsule-shaped chip trigger |
| Android | Material 3 `ExposedDropdownMenuBox` + read-only `OutlinedTextField` |

---

## Usage Examples

### Web
```tsx
<AppNativePicker
  label="Country"
  value={country}
  onChange={setCountry}
  options={[
    { label: "Australia", value: "AU" },
    { label: "India", value: "IN" },
  ]}
/>

// Embedded inside InputField:
<InputField
  label="Amount"
  leadingPicker={
    <AppNativePicker
      label="Currency"
      value={currency}
      onChange={setCurrency}
      options={currencies}
      embedded
    />
  }
  leadingSeparator
/>
```

### iOS
```swift
AppNativePicker(
    label: "Country",
    selection: $country,
    options: [("Australia", "AU"), ("India", "IN"), ("USA", "US")]
)

// With size and variant:
AppNativePicker(
    label: "Filter",
    selection: $filterSel,
    options: [("All", "All"), ("Active", "Active")],
    chipSize: .lg,
    chipVariant: .filters
)
```

### Android
```kotlin
AppNativePicker(
    value = selected,
    options = listOf(PickerOption("AU", "Australia"), PickerOption("IN", "India")),
    onSelect = { selected = it.id },
    label = "Country"
)
```

---

## Accessibility

- **Web:** `aria-label` on the trigger from the `label` prop; `SelectValue` renders placeholder text for screen readers; focus ring styling in standalone mode.
- **iOS:** SwiftUI `Menu` provides VoiceOver support natively; selected item shown with a checkmark in the menu.
- **Android:** `ExposedDropdownMenuBox` with `menuAnchor` provides TalkBack support; trailing icon indicates expandable state.
