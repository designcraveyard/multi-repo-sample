# StepIndicator

**Figma:** bubbles-kit › node `108:9891`
**Web:** `multi-repo-nextjs/app/components/patterns/StepIndicator/StepIndicator.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Patterns/AppStepIndicator.swift`
**Type:** Atomic + used as part of Stepper

---

## Overview

A 12×12 circular dot representing a single step in a timeline. Two states:

| State | Appearance |
|-------|-----------|
| `completed=false` | Hollow circle with `--border-default` stroke |
| `completed=true` | Filled `--surfaces-success-solid` circle with white checkmark (`Ph.check.bold`) |

---

## Props

### Web (`StepIndicatorProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `completed` | `boolean` | `false` | Whether this step is done |
| `className` | `string` | `""` | Extra classes |

### iOS (`AppStepIndicator`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `completed` | `Bool` | `false` | Whether this step is done |

---

## Token Usage

| State | Token | Property |
|-------|-------|----------|
| Incomplete — border | `--border-default` / `Color.borderDefault` | Stroke 1.5px |
| Incomplete — fill | transparent | Background |
| Completed — fill | `--surfaces-success-solid` / `Color.surfacesSuccessSolid` | Fill |
| Completed — icon | `--icons-on-brand-primary` / `Color.iconsOnBrandPrimary` | Checkmark color |
| Size | 12 × 12 | Both axes |

---

## Usage Examples

### Web

```tsx
import { StepIndicator } from "@/app/components/patterns/StepIndicator";

<StepIndicator />                   // incomplete
<StepIndicator completed />         // completed with checkmark
```

### iOS

```swift
AppStepIndicator()                  // incomplete
AppStepIndicator(completed: true)   // completed with checkmark
```

---

## Accessibility

- **Web:** `aria-label` set to `"Step completed"` or `"Step not yet completed"` based on state
- **iOS:** `.accessibilityLabel(completed ? "Step completed" : "Step incomplete")` + `.isStaticText` trait
