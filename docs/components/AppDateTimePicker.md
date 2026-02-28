# AppDateTimePicker

**Web:** `multi-repo-nextjs/app/components/Native/AppDateTimePicker.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Native/AppDateTimePicker.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppDateTimePicker.kt`

---

## Overview

A date and/or time picker supporting multiple modes (date-only, time-only, date-and-time). Web uses shadcn Calendar (react-day-picker) with a Popover trigger and native `<input type="time">`; iOS wraps SwiftUI `DatePicker` with compact, graphical, and wheel display styles; Android uses Material 3 `DatePickerDialog` and `TimePicker` with a trigger button.

---

## Props

### Web (`AppDateTimePickerProps`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| undefined` | `undefined` | The currently selected Date value |
| `onChange` | `(date: Date) => void` | required | Called when the user selects a date/time |
| `label` | `string` | `undefined` | Text label shown above the trigger |
| `mode` | `"date" \| "time" \| "dateAndTime"` | `"date"` | Which components to select |
| `displayStyle` | `"compact" \| "inline"` | `"compact"` | Compact trigger+popover or inline embedded calendar |
| `range` | `{ min?: Date; max?: Date }` | `undefined` | Restrict selectable date range |
| `disabled` | `boolean` | `false` | Renders at 0.5 opacity, blocks interaction |
| `className` | `string` | `""` | Additional CSS class for the wrapper |

### iOS (`AppDateTimePicker`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `String` | required | Descriptive label shown next to or above the picker |
| `selection` | `Binding<Date>` | required | The currently selected Date (two-way binding) |
| `mode` | `AppDatePickerMode` | `.date` | `.date`, `.time`, or `.dateAndTime` |
| `displayStyle` | `AppDatePickerDisplayStyle` | `.compact` | `.compact`, `.graphical`, or `.wheel` |
| `minimumDate` | `Date?` | `nil` | Optional earliest selectable date |
| `maximumDate` | `Date?` | `nil` | Optional latest selectable date |

### Android (`AppDateTimePicker`)
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `value` | `Long?` | required | Currently selected epoch milliseconds, or null |
| `onValueChange` | `(Long) -> Unit` | required | Called with new epoch millis on confirmation |
| `modifier` | `Modifier` | `Modifier` | Modifier applied to the outer Column |
| `mode` | `DateTimeMode` | `DateTimeMode.Date` | `.Date`, `.Time`, or `.DateTime` |
| `label` | `String?` | `null` | Optional label text above the trigger button |

---

## Platform Notes

| Platform | Native API Wrapped |
|----------|-------------------|
| Web | shadcn Calendar (react-day-picker) + Radix Popover + native `<input type="time">` |
| iOS | SwiftUI `DatePicker` with `.compact`, `.graphical`, and `.wheel` styles |
| Android | Material 3 `DatePickerDialog` + `TimePicker` (two-step dialog flow for DateTime mode) |

---

## Usage Examples

### Web
```tsx
<AppDateTimePicker
  label="Birthday"
  value={date}
  onChange={setDate}
/>

<AppDateTimePicker
  label="Appointment"
  value={dateTime}
  onChange={setDateTime}
  mode="dateAndTime"
  displayStyle="inline"
/>
```

### iOS
```swift
AppDateTimePicker(label: "Birthday", selection: $date)

AppDateTimePicker(
    label: "Appointment",
    selection: $appt,
    mode: .dateAndTime,
    displayStyle: .graphical
)

AppDateTimePicker(
    label: "Alarm",
    selection: $time,
    mode: .time,
    displayStyle: .wheel
)
```

### Android
```kotlin
AppDateTimePicker(
    value = selectedMillis,
    onValueChange = { selectedMillis = it },
    label = "Birthday"
)

AppDateTimePicker(
    value = selectedMillis,
    onValueChange = { selectedMillis = it },
    mode = DateTimeMode.DateTime,
    label = "Appointment"
)
```

---

## Accessibility

- **Web:** Trigger button includes a CalendarBlank Phosphor icon with `aria-hidden`; calendar grid from react-day-picker has built-in keyboard navigation and ARIA roles.
- **iOS:** SwiftUI `DatePicker` provides full VoiceOver support natively; haptic feedback on value changes.
- **Android:** Material 3 `DatePickerDialog` and `TimePicker` have built-in TalkBack support with labeled confirm/cancel actions.
