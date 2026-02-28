# Stepper / TimelineStepper (Pattern)

**Figma:** bubbles-kit › node `108:4357` ("TimelineStepper")
**Web:** `multi-repo-nextjs/app/components/patterns/Stepper/Stepper.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Patterns/AppStepper.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/patterns/AppStepper.kt`
**Type:** Complex Component — composes `StepIndicator` + `TextBlock`

---

## Overview

A vertical timeline of steps. Each step shows a `StepIndicator` dot on the left, a connecting line to the next step, and `TextBlock` content on the right. Display-only — no tap interaction.

```
● ─── Title
│      Subtitle
│
● ─── Title  (completed = green checkmark dot)
│
○ ─── Title  (incomplete = outlined dot)
```

---

## Data Types

### Web

```ts
interface Step {
  title: string;        // required
  subtitle?: string;    // secondary line
  body?: string;        // body copy
  completed?: boolean;  // default false
}

interface StepperProps {
  steps: Step[];
}
```

### iOS

```swift
public struct AppStepperStep {
    public let title: String          // required
    public let subtitle: String?
    public let body: String?
    public let completed: Bool        // default false
}
```

---

## Props

### Web (`StepperProps`)

| Prop | Type | Description |
|------|------|-------------|
| `steps` | `Step[]` | Array of step data. Must have ≥ 1 step. |
| `className` | `string` | Extra classes on the wrapper |

### iOS (`AppStepper`)

| Prop | Type | Description |
|------|------|-------------|
| `steps` | `[AppStepperStep]` | Array of step data. Must have ≥ 1 step. |

### Android (`AppStepper`)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `steps` | `List<AppStepperStep>` | — | **Required.** List of step data (title, subtitle, body, completed) |
| `modifier` | `Modifier` | `Modifier` | Compose modifier |

### Android `AppStepperStep`

```kotlin
data class AppStepperStep(
    val title: String,
    val subtitle: String? = null,
    val body: String? = null,
    val completed: Boolean = false,
)
```

---

## Layout

- **Outer:** `flex-col gap-0` / `VStack(spacing: 0)` — no gap between rows (the connector line handles spacing)
- **Per row:** `flex-row gap-6` / `HStack(alignment: .top, spacing: .space6)` — left track + right content
- **Left track (12px wide):** `StepIndicator` + vertical `Rectangle` connector line (2px wide, `--surfaces-base-high-contrast`). Connector hidden on last step.
- **Right content:** `TextBlock`. Bottom padding `space6` on all but last step to align with connector height.

---

## Token Usage

| Property | Token |
|----------|-------|
| Connector line color | `--surfaces-base-high-contrast` / `Color.surfacesBaseHighContrast` |
| Connector line width | 2px |
| Left track width | 12px |
| Row gap | `--space-6` |

Step indicator tokens are defined in the `StepIndicator` component.

---

## Usage Examples

### Web

```tsx
import { Stepper } from "@/app/components/patterns/Stepper";

// All completed
<Stepper
  steps={[
    { title: "Ordered",   subtitle: "Mar 1", completed: true },
    { title: "Shipped",   subtitle: "Mar 2", completed: true },
    { title: "Delivered", subtitle: "Mar 4", completed: true },
  ]}
/>

// Mixed state
<Stepper
  steps={[
    { title: "Ayurveda Books", subtitle: "Bought at airport", completed: true },
    { title: "Pack luggage" },
    { title: "Depart", subtitle: "Flight at 08:00" },
  ]}
/>

// Single step with body
<Stepper
  steps={[
    { title: "Submit application", body: "Fill in all required fields before submitting." }
  ]}
/>
```

### iOS

```swift
// All completed
AppStepper(steps: [
    AppStepperStep(title: "Ordered",   subtitle: "Mar 1", completed: true),
    AppStepperStep(title: "Shipped",   subtitle: "Mar 2", completed: true),
    AppStepperStep(title: "Delivered", subtitle: "Mar 4", completed: true),
])

// Mixed state
AppStepper(steps: [
    AppStepperStep(title: "Ayurveda Books", subtitle: "Bought at airport", completed: true),
    AppStepperStep(title: "Pack luggage"),
    AppStepperStep(title: "Depart", subtitle: "Flight at 08:00"),
])
```

### Android

```kotlin
// All completed
AppStepper(
    steps = listOf(
        AppStepperStep(title = "Ordered", completed = true),
        AppStepperStep(title = "Shipped", completed = true)
    )
)

// Mixed state
AppStepper(
    steps = listOf(
        AppStepperStep(title = "Ordered", subtitle = "Mar 1", completed = true),
        AppStepperStep(title = "Shipped"),
        AppStepperStep(title = "Delivered", subtitle = "Mar 4")
    )
)
```

---

## Accessibility

- Each `StepIndicator` has an accessibility label: `"Step completed"` / `"Step incomplete"`
- `.isStaticText` trait on iOS
- The connecting line is decorative — `aria-hidden` on web
- Consider wrapping in a `<section aria-label="Order status">` or similar on web for screen reader context
- Android: Each `AppStepIndicator` has a `contentDescription` for TalkBack; connector lines are decorative with no semantics
