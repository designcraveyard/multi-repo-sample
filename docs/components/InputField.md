# InputField / TextField

**Figma:** bubbles-kit › node `90:3753` (InputField), `90:3525` (_InputField base)
**Web:** `multi-repo-nextjs/app/components/InputField/InputField.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/InputField/AppInputField.swift`
**Android:** `multi-repo-android/.../ui/components/AppInputField.kt`

---

## Overview

A styled form input with a floating label, hint text, validation states, and a flexible slot system. `InputField` is single-line; `TextField` is a multiline variant (web) / same component with `multiline: true` (iOS).

The slot layout (left→right):
```
[leadingLabel?/leadingSlot?] [leadingSeparator?] [leadingIcon?] | text input | [trailingIcon?] [trailingSeparator?] [trailingLabel?/trailingSlot?]
```

Validation state icons are auto-injected into the trailing position when a non-default `state` is set and no explicit trailing slot is occupied.

---

## Props

### Web — `InputField`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Floating label above input |
| `placeholder` | `string` | — | Placeholder text |
| `state` | `InputFieldState` | `"default"` | Validation state |
| `hint` | `string` | — | Helper / error text below |
| `leadingLabel` | `ReactNode` | — | Left slot (e.g. `<Label label="USD" />`) |
| `trailingLabel` | `ReactNode` | — | Right slot |
| `leadingIcon` | `ReactNode` | — | Simple icon left of input |
| `trailingIcon` | `ReactNode` | — | Simple icon right of input |
| `leadingSeparator` | `boolean` | `false` | 1px divider after leadingLabel |
| `trailingSeparator` | `boolean` | `false` | 1px divider before trailingLabel |
| `disabled` | `boolean` | `false` | 0.5 opacity, no interaction |
| `...rest` | `InputHTMLAttributes` | — | Forwarded to `<input>` |

### Web — `TextField` (multiline)

Same as InputField except no slot props. Adds:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rows` | `number` | `4` | Number of visible rows |

### iOS — `AppInputField`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `Binding<String>` | — | **Required.** Two-way text binding |
| `label` | `String?` | `nil` | Floating label |
| `placeholder` | `String?` | `nil` | Placeholder text |
| `state` | `AppInputFieldState` | `.default` | Validation state |
| `hint` | `String?` | `nil` | Helper text below |
| `leadingLabel` | `AnyView?` | `nil` | Left label slot |
| `trailingLabel` | `AnyView?` | `nil` | Right label slot |
| `leadingIcon` | `AnyView?` | `nil` | Left icon |
| `trailingIcon` | `AnyView?` | `nil` | Right icon |
| `leadingSeparator` | `Bool` | `false` | Separator after leadingLabel |
| `trailingSeparator` | `Bool` | `false` | Separator before trailingLabel |
| `isDisabled` | `Bool` | `false` | Disable interaction |
| `multiline` | `Bool` | `false` | Multiline / TextEditor mode |

### Android — `AppInputField`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `String` | — | Current text value (required) |
| `onTextChange` | `(String) -> Unit` | — | Text change callback (required) |
| `modifier` | `Modifier` | `Modifier` | Compose modifier |
| `label` | `String?` | `null` | Floating label above input |
| `placeholder` | `String` | `""` | Placeholder text |
| `state` | `AppInputFieldState` | `AppInputFieldState.Default` | Validation state (`Default`/`Success`/`Warning`/`Error`) |
| `hint` | `String?` | `null` | Helper / error text below |
| `leadingIcon` | `ImageVector?` | `null` | Icon left of input |
| `trailingIcon` | `ImageVector?` | `null` | Icon right of input |
| `leadingSlot` | `@Composable (() -> Unit)?` | `null` | Embedded accessory before the text input, such as `AppNativePicker` or `AppLabel` |
| `trailingSlot` | `@Composable (() -> Unit)?` | `null` | Embedded accessory after the text input |
| `leadingSeparator` | `Boolean` | `false` | 1dp divider after leadingSlot |
| `trailingSeparator` | `Boolean` | `false` | 1dp divider before trailingSlot |
| `keyboardOptions` | `KeyboardOptions` | `KeyboardOptions.Default` | Keyboard/input type configuration |
| `variant` | `AppInputFieldVariant` | `Default` | `Default` or `Bare` divider-only mode |
| `isDisabled` | `Boolean` | `false` | Disable interaction |

### Android — `AppTextField` (multiline)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `String` | — | Current text value (required) |
| `onTextChange` | `(String) -> Unit` | — | Text change callback (required) |
| `modifier` | `Modifier` | `Modifier` | Compose modifier |
| `label` | `String?` | `null` | Floating label |
| `placeholder` | `String` | `""` | Placeholder text |
| `state` | `AppInputFieldState` | `AppInputFieldState.Default` | Validation state |
| `hint` | `String?` | `null` | Helper text below |
| `minLines` | `Int` | `4` | Minimum visible lines |
| `isDisabled` | `Boolean` | `false` | Disable interaction |

---

## Validation States

| State | Border | Hint text color | Auto-icon |
|-------|--------|----------------|-----------|
| `default` | Transparent (active: `--border-active`) | `--typography-muted` | None |
| `success` | `--border-success` | `--typography-success` | `CheckCircle` |
| `warning` | `--border-warning` | `--typography-warning` | `Warning` |
| `error` | `--border-error` | `--typography-error` | `WarningCircle` |

The auto-icon is only shown when no explicit `trailingIcon` or `trailingLabel` is provided.

---

## Token Usage

| Property | Token |
|----------|-------|
| Background | `--surfaces-base-low-contrast` |
| Border (focus) | `--border-active` |
| Border (states) | `--border-success / warning / error` |
| Label text | `--typography-secondary` |
| Input text | `--typography-primary` |
| Placeholder | `--typography-muted` |
| Caret | `--surfaces-brand-interactive` |
| Separator | `--surfaces-base-high-contrast` |
| Radius | `--radius-lg` |
| Disabled | `opacity-50` |

---

## Usage Examples

### Web

```tsx
import { InputField, TextField } from "@/app/components/InputField";
import { Label } from "@/app/components/Label";
import { Icon } from "@/app/components/icons";

// Basic
<InputField label="Email" placeholder="you@example.com" />

// Validation states
<InputField state="success" label="Username" hint="Username is available" />
<InputField state="error" label="Password" hint="Must be 8+ characters" />
<InputField state="warning" label="Email" hint="Email may already exist" />

// Leading icon (search)
<InputField
  label="Search"
  placeholder="Find anything…"
  leadingIcon={<Icon name="MagnifyingGlass" size="md" />}
/>

// Trailing icon (password reveal)
<InputField
  label="Password"
  type="password"
  trailingIcon={<Icon name="Eye" size="md" />}
/>

// Both icons
<InputField
  label="Search"
  leadingIcon={<Icon name="MagnifyingGlass" size="md" />}
  trailingIcon={<Icon name="X" size="md" />}
/>

// Currency prefix with separator
<InputField
  label="Amount"
  placeholder="0.00"
  leadingLabel={<Label label="USD" size="md" type="secondaryAction" />}
  leadingSeparator
/>

// Unit suffix with separator
<InputField
  label="Weight"
  placeholder="Enter value"
  trailingLabel={<Label label="kg" size="md" type="information" />}
  trailingSeparator
/>

// Both label slots
<InputField
  label="Exchange"
  placeholder="0.00"
  leadingLabel={<Label label="From" size="md" type="secondaryAction" />}
  trailingLabel={<Label label="USD" size="md" type="brandInteractive" />}
  leadingSeparator
  trailingSeparator
/>

// Multiline
<TextField
  label="Bio"
  placeholder="Tell us about yourself…"
  rows={5}
/>
```

### iOS

```swift
@State private var text = ""

// Basic
AppInputField(text: $text, label: "Email", placeholder: "you@example.com")

// Validation
AppInputField(text: $text, label: "Username", state: .success, hint: "Available")
AppInputField(text: $text, label: "Password", state: .error, hint: "Too short")

// Leading icon
AppInputField(
    text: $text,
    label: "Search",
    placeholder: "Find anything…",
    leadingIcon: AnyView(Ph.magnifyingGlass.regular.iconSize(.md))
)

// Currency prefix
AppInputField(
    text: $amount,
    label: "Amount",
    placeholder: "0.00",
    leadingLabel: AnyView(AppLabel(label: "USD", size: .md, type: .secondaryAction)),
    leadingSeparator: true
)

// Multiline
AppInputField(text: $bio, label: "Bio", multiline: true)
```

### Android

```kotlin
var name by remember { mutableStateOf("") }

// Basic
AppInputField(
    text = name,
    onTextChange = { name = it },
    label = "Full Name",
    placeholder = "Enter your name"
)

// Validation states
AppInputField(
    text = username,
    onTextChange = { username = it },
    label = "Username",
    state = AppInputFieldState.Success,
    hint = "Username is available"
)

AppInputField(
    text = password,
    onTextChange = { password = it },
    label = "Password",
    state = AppInputFieldState.Error,
    hint = "Must be 8+ characters"
)

// Leading icon (search)
AppInputField(
    text = query,
    onTextChange = { query = it },
    label = "Search",
    placeholder = "Find anything…",
    leadingIcon = Icons.Default.Search
)

// Multiline (TextField variant)
AppTextField(
    text = bio,
    onTextChange = { bio = it },
    label = "Bio",
    placeholder = "Tell us about yourself…",
    minLines = 5
)
```

---

## Accessibility

- `<label>` with matching `for`/`id` auto-generated via `useId()` on web
- `aria-describedby` links hint text to input
- `aria-invalid="true"` on error state
- State icons are `aria-hidden` (conveyed via `hint` text)
- iOS: label tied to `TextField` via `.accessibilityLabel`
- Android: `label` maps to Material 3 `OutlinedTextField` label with built-in TalkBack support; `hint` is announced as supporting text; error state sets `isError` for proper semantics
---

## Cross-Platform Audit

_Last refreshed: 2026-06-29_

| Platform | Source | Status | API snapshot |
|----------|--------|--------|--------------|
| Web | `multi-repo-nextjs/app/components/InputField/InputField.tsx` | Present | `label?: string`, `hint?: string`, `state?: InputFieldState`, `leadingLabel?: ReactNode`, `trailingLabel?: ReactNode`, `leadingPicker?: ReactNode`, `trailingPicker?: ReactNode`, `leadingIcon?: ReactNode`, plus 5 more |
| iOS | `multi-repo-ios/multi-repo-ios/Components/InputField/AppInputField.swift` | Present | `text: Binding<String>`, `label: String? = nil`, `placeholder: String = ""`, `state: AppInputFieldState = .default`, `hint: String? = nil`, `leadingIcon: AnyView? = nil`, `trailingIcon: AnyView? = nil`, `leadingLabel: AnyView? = nil`, plus 7 more |
| Android | `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppInputField.kt` | Present | `text: String`, `onTextChange: (String) -> Unit`, `modifier: Modifier = Modifier`, `label: String? = null`, `placeholder: String = ""`, `state: AppInputFieldState = AppInputFieldState.Default`, `hint: String? = null`, `leadingIcon: ImageVector? = null`, plus 8 more |

**Parity status:** Implemented on all three platforms.

**Token contract:** component code must use semantic tokens only: CSS `--surfaces-*`, `--typography-*`, `--icons-*`, and `--border-*`; Swift `Color.surfaces*`, `Color.typography*`, `Color.icons*`, and `Color.border*`; Kotlin `SemanticColors.*`, `Spacing.*`, `Radius.*`, `IconSize.*`, and `AppTypography.*`. Disabled state remains opacity 0.5 across platforms.

**Accessibility contract:** preserve semantic roles/labels, visible keyboard focus on web, VoiceOver labels/traits on iOS, and TalkBack semantics on Android when changing the component.
