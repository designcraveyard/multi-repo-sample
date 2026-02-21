# Button

**Figma:** bubbles-kit › node `66:1818`
**Web:** `multi-repo-nextjs/app/components/Button/Button.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Button/AppButton.swift`

---

## Overview

A pill-shaped action trigger with five semantic variants and three sizes. Supports leading/trailing icons and a loading state that replaces the leading icon with a spinner.

---

## Props

### Web (`ButtonProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | **Required.** Button text |
| `variant` | `ButtonVariant` | `"primary"` | Visual style (see Variants) |
| `size` | `ButtonSize` | `"lg"` | Size token |
| `leadingIcon` | `ReactNode` | — | Icon rendered before label |
| `trailingIcon` | `ReactNode` | — | Icon rendered after label |
| `isLoading` | `boolean` | `false` | Shows spinner, disables interaction |
| `disabled` | `boolean` | `false` | Disables interaction, 0.5 opacity |
| `...rest` | `ButtonHTMLAttributes` | — | Forwarded to `<button>` |

### iOS (`AppButton`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `String` | — | **Required.** Button text |
| `variant` | `AppButtonVariant` | `.primary` | Visual style |
| `size` | `AppButtonSize` | `.lg` | Size token |
| `leadingIcon` | `AnyView?` | `nil` | Leading icon view |
| `trailingIcon` | `AnyView?` | `nil` | Trailing icon view |
| `isLoading` | `Bool` | `false` | Shows spinner |
| `action` | `() -> Void` | — | Tap handler |

---

## Variants

| Value | Background | Text | Description |
|-------|-----------|------|-------------|
| `primary` | `--surfaces-brand-interactive` | `--typography-on-brand-primary` | Default high-emphasis |
| `secondary` | `--surfaces-brand-interactive-low-contrast` | `--typography-brand` | Medium-emphasis fill |
| `tertiary` | `--surfaces-base-primary` + border | `--typography-brand` | Outlined low-emphasis |
| `success` | `--surfaces-success-solid` | `--typography-on-brand-primary` | Confirm / complete |
| `danger` | `--surfaces-error-solid` | `--typography-on-brand-primary` | Destructive action |

---

## Sizes

| Value | Height | Padding H | Gap | Icon | Font token |
|-------|--------|-----------|-----|------|------------|
| `sm` | 24px | 8px | 2px | 16px | `--typography-cta-sm` |
| `md` | 36px | 16px | 8px | 20px | `--typography-cta-md` |
| `lg` | 48px | 20px | 12px | 24px | `--typography-cta-lg` |

---

## States

| State | Visual |
|-------|--------|
| Default | Normal |
| Hover | `*-hover` bg token |
| Pressed | `*-pressed` bg token |
| Disabled | 0.5 opacity, `cursor-not-allowed` |
| Loading | Spinner replaces leading icon, disabled |

---

## Token Usage

| Property | Token |
|----------|-------|
| Background | `--surfaces-brand-interactive` (variant-dependent) |
| Text | `--typography-on-brand-primary` or `--typography-brand` |
| Shape | `rounded-full` (cornerRadius=2000 in Figma) |
| Disabled | `opacity-50` |

---

## Usage Examples

### Web

```tsx
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/icons";

// Basic
<Button label="Save" />

// Secondary with trailing icon
<Button
  variant="secondary"
  size="md"
  label="Export"
  trailingIcon={<Icon name="ArrowSquareOut" size="md" />}
/>

// Danger confirmation
<Button variant="danger" label="Delete account" />

// Loading state
<Button label="Saving…" isLoading />

// Disabled
<Button label="Continue" disabled />
```

### iOS

```swift
// Basic
AppButton(label: "Save", action: {})

// Secondary with icon
AppButton(
    label: "Export",
    variant: .secondary,
    size: .md,
    trailingIcon: AnyView(Ph.arrowSquareOut.regular.iconSize(.md)),
    action: { }
)

// Danger
AppButton(label: "Delete account", variant: .danger, action: {})

// Loading
AppButton(label: "Saving…", isLoading: true, action: {})
```

---

## Accessibility

- Uses semantic `<button>` / `Button` element
- `aria-disabled` + `aria-busy` on web for loading/disabled states
- `disabled` modifier on iOS prevents interaction; `.allowsHitTesting(false)` when disabled
- Keyboard: `Enter`/`Space` activate on web
- Focus ring: 2px ring using variant's semantic color token
