# Label

**Figma:** bubbles-kit › node `82:1401`
**Web:** `multi-repo-nextjs/app/components/Label/Label.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Label/AppLabel.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppLabel.kt`

---

## Overview

A pill-shaped inline label with optional leading and trailing icon slots. Has no background — it's a text+icon grouping that gets its visual weight purely from type and color. Commonly used standalone and as a slot inside `InputField` (currency prefix, unit suffix, etc.).

---

## Props

### Web (`LabelProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `"Label"` | Display text |
| `size` | `LabelSize` | `"md"` | Size token |
| `type` | `LabelType` | `"secondaryAction"` | Color/weight style |
| `leadingIcon` | `ReactNode` | — | Icon before text |
| `trailingIcon` | `ReactNode` | — | Icon after text |
| `showLeadingIcon` | `boolean` | `true` | Toggle leading icon slot |
| `showTrailingIcon` | `boolean` | `true` | Toggle trailing icon slot |
| `className` | `string` | `""` | Extra classes |

### iOS (`AppLabel`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `String` | `"Label"` | Display text |
| `size` | `AppLabelSize` | `.md` | Size token |
| `type` | `AppLabelType` | `.secondaryAction` | Color/weight style |
| `leadingIcon` | `AnyView?` | `nil` | Leading icon |
| `trailingIcon` | `AnyView?` | `nil` | Trailing icon |
| `showLeadingIcon` | `Bool` | `true` | Toggle leading slot |
| `showTrailingIcon` | `Bool` | `true` | Toggle trailing slot |

### Android (`AppLabel`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `String` | — | Display text (required) |
| `modifier` | `Modifier` | `Modifier` | Compose modifier |
| `size` | `LabelSize` | `LabelSize.Md` | Size token (`Sm`/`Md`/`Lg`) |
| `type` | `LabelType` | `LabelType.SecondaryAction` | Color/weight style (`SecondaryAction`/`PrimaryAction`/`BrandInteractive`/`Information`) |
| `leadingIcon` | `ImageVector?` | `null` | Leading icon |
| `trailingIcon` | `ImageVector?` | `null` | Trailing icon |
| `showLeadingIcon` | `Boolean` | `true` | Toggle leading icon slot |
| `showTrailingIcon` | `Boolean` | `true` | Toggle trailing icon slot |

---

## Sizes

| Value | Font token | Icon size | Gap |
|-------|-----------|-----------|-----|
| `sm` | `--typography-body-sm-em` | 16px | 2px |
| `md` | `--typography-body-md-em` | 24px | 8px |
| `lg` | `--typography-body-lg-em` | 24px | 12px |

---

## Types

| Value | Color token | Description |
|-------|------------|-------------|
| `secondaryAction` | `--typography-secondary` | Muted inline action (default) |
| `primaryAction` | `--typography-primary` | High contrast |
| `brandInteractive` | `--typography-brand` | Brand-colored, interactive hint |
| `information` | `--typography-muted` | Subdued label / metadata |

---

## Usage Examples

### Web

```tsx
import { Label } from "@/app/components/Label";
import { Icon } from "@/app/components/icons";

// Basic
<Label label="Tag" />

// With leading icon
<Label
  size="lg"
  type="primaryAction"
  label="Verified"
  leadingIcon={<Icon name="CheckCircle" size="lg" />}
/>

// Currency prefix (used as InputField slot)
<Label label="USD" size="md" type="secondaryAction" />

// Dropdown trigger (trailing caret)
<Label
  label="Filter"
  type="brandInteractive"
  trailingIcon={<Icon name="CaretDown" size="md" />}
/>
```

### iOS

```swift
// Basic
AppLabel(label: "Tag")

// With leading icon
AppLabel(
    label: "Verified",
    size: .lg,
    type: .primaryAction,
    leadingIcon: AnyView(Ph.checkCircle.regular.iconSize(.lg))
)

// Currency prefix in InputField
AppLabel(label: "USD", size: .md, type: .secondaryAction)
```

### Android

```kotlin
// Basic
AppLabel(label = "Tag")

// With leading icon
AppLabel(
    label = "Verified",
    size = LabelSize.Lg,
    type = LabelType.PrimaryAction,
    leadingIcon = Icons.Default.CheckCircle
)

// Currency prefix in InputField
AppLabel(label = "USD", size = LabelSize.Md, type = LabelType.SecondaryAction)
```

---

## Using as an InputField Slot

The Label is designed to slot into `InputField`'s `leadingLabel` / `trailingLabel` props:

```tsx
// Web — currency prefix with separator
<InputField
  label="Amount"
  placeholder="0.00"
  leadingLabel={<Label label="USD" size="md" type="secondaryAction" />}
  leadingSeparator
/>
```

```swift
// iOS — unit suffix with separator
AppInputField(
    text: $amount,
    label: "Weight",
    trailingLabel: AnyView(AppLabel(label: "kg", size: .md, type: .information)),
    trailingSeparator: true
)
```
