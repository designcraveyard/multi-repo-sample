# Toast / Toast Message

**Figma:** bubbles-kit › node `108:4229`
**Web:** `multi-repo-nextjs/app/components/Toast/Toast.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Toast/AppToast.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppToast.kt`

---

## Overview

An ephemeral notification banner shown at the edge of the screen. All variants use the same pill-shaped inverse surface treatment, with the semantic variant communicated through the leading status icon color.

Supports an optional action button and a dismiss (×) button. Can auto-dismiss after a configurable duration.

---

## Props

### Web (`ToastProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | — | **Required.** Primary message line |
| `variant` | `ToastVariant` | `"default"` | Visual style (see Variants) |
| `description` | `string` | — | Secondary detail line |
| `actionLabel` | `string` | — | Label for action button |
| `onAction` | `() => void` | — | Action button handler |
| `dismissible` | `boolean` | `false` | Show × dismiss button |
| `onDismiss` | `() => void` | — | Dismiss handler |
| `duration` | `number` | `0` | Auto-dismiss after ms (0 = manual only) |
| `className` | `string` | `""` | Extra classes |

### iOS (`AppToast`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `String` | — | **Required.** Primary text |
| `variant` | `AppToastVariant` | `.default` | Visual style |
| `description` | `String?` | `nil` | Secondary detail |
| `actionLabel` | `String?` | `nil` | Action button label |
| `onAction` | `(() -> Void)?` | `nil` | Action handler |
| `dismissible` | `Bool` | `false` | Show dismiss button |
| `onDismiss` | `(() -> Void)?` | `nil` | Dismiss handler |

### Android (`AppToast`)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `message` | `String` | — | **Required.** Toast message text (up to 2 lines) |
| `modifier` | `Modifier` | `Modifier` | Compose modifier |
| `variant` | `AppToastVariant` | `AppToastVariant.Default` | Visual variant (`Default`/`Success`/`Warning`/`Error`) |
| `description` | `String?` | `null` | Secondary detail line |
| `actionLabel` | `String?` | `null` | Optional action button text (e.g. "Undo", "View") |
| `onAction` | `(() -> Unit)?` | `null` | Callback when action button is tapped |
| `dismissible` | `Boolean` | `false` | Whether to show the dismiss (X) button |
| `onDismiss` | `(() -> Unit)?` | `null` | Callback when dismiss button is tapped |

### Android (`ToastOverlay`) — presentation helper

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `isPresented` | `Boolean` | — | **Required.** Whether the toast is visible |
| `onDismiss` | `() -> Unit` | — | **Required.** Callback to hide the toast |
| `modifier` | `Modifier` | `Modifier` | Compose modifier |
| `durationMs` | `Long` | `3000L` | Auto-dismiss delay in ms (0 = no auto-dismiss) |
| `content` | `@Composable () -> Unit` | — | **Required.** Toast composable to display |

---

## Variants

| Value | Background | Border | Icon |
|-------|-----------|--------|------|
| `default` | `--surfaces-inverse-primary` | transparent | `Info` |
| `success` | `--surfaces-inverse-primary` | transparent | `CheckCircle` in success color |
| `warning` | `--surfaces-inverse-primary` | transparent | `Warning` in warning color |
| `error` | `--surfaces-inverse-primary` | transparent | `X` / `XCircle` in error color |
| `info` | `--surfaces-inverse-primary` | transparent | `Info` |

### Shape

- Pill shape (`rounded-full` / capsule), no shadow, full-width in the showcase container.

---

## Positioning

Use `ToastContainer` on web to position toasts in a viewport corner, or the `toastOverlay` modifier on iOS.

### Web

```tsx
import { ToastContainer } from "@/app/components/Toast";

<ToastContainer position="bottom-right">
  {showToast && <Toast message="Saved!" dismissible onDismiss={() => setShow(false)} />}
</ToastContainer>
```

**`ToastContainer` positions:**
`top-left` · `top-center` · `top-right` · `bottom-left` · `bottom-center` · `bottom-right`

### iOS

```swift
// Wrap your view with the .toastOverlay modifier
ContentView()
    .toastOverlay(isPresented: $showToast) {
        AppToast(variant: .success, message: "Changes saved", dismissible: true) {
            showToast = false
        }
    }
```

---

## Usage Examples

### Web

```tsx
import { Toast, ToastContainer } from "@/app/components/Toast";

// Simple
<Toast message="Profile updated" variant="success" />

// With description + action
<Toast
  variant="error"
  message="Upload failed"
  description="File exceeds 10 MB limit"
  actionLabel="Try again"
  onAction={retryUpload}
  dismissible
  onDismiss={clearToast}
/>

// Auto-dismiss after 3 seconds
<Toast
  message="Link copied"
  duration={3000}
  onDismiss={() => setShow(false)}
/>
```

### iOS

```swift
// Success
AppToast(variant: .success, message: "Saved successfully")

// Error with dismiss
AppToast(
    variant: .error,
    message: "Upload failed",
    description: "File too large",
    dismissible: true,
    onDismiss: { showToast = false }
)
```

### Android

```kotlin
import com.abhishekverma.multirepo.ui.components.AppToast
import com.abhishekverma.multirepo.ui.components.ToastOverlay

// Simple toast
AppToast(message = "Settings saved")

// With dismiss button
AppToast(
    message = "Settings saved",
    dismissible = true,
    onDismiss = { showToast = false },
)

// With action button
AppToast(
    message = "Upload complete!",
    variant = AppToastVariant.Success,
    description = "Your file is ready to share.",
    actionLabel = "View",
    onAction = { viewDetails() },
)

// Presentation with ToastOverlay (animated + auto-dismiss)
Box {
    ScreenContent()
    ToastOverlay(isPresented = showToast, onDismiss = { showToast = false }) {
        AppToast(message = "Saved!", dismissible = true, onDismiss = { showToast = false })
    }
}
```

---

## Accessibility

- `role="alert"` + `aria-live="polite"` + `aria-atomic="true"` on web
- iOS uses `.accessibilityAddTraits(.isStaticText)` and announces via VoiceOver
- Dismiss button has `aria-label="Dismiss notification"`
- Android: TalkBack announces toast message when it appears; dismiss and action buttons have `contentDescription` for accessibility; `ToastOverlay` manages focus announcement on show
---

## Cross-Platform Audit

_Last refreshed: 2026-06-29_

| Platform | Source | Status | API snapshot |
|----------|--------|--------|--------------|
| Web | `multi-repo-nextjs/app/components/Toast/Toast.tsx` | Present | `message: string`, `variant?: "default" \| "success" \| "warning" \| "error" \| "info"`, `description?: string`, `actionLabel?: string`, `onAction?: () => void`, `dismissible?: boolean`, `onDismiss?: () => void`, `duration?: number`, plus 1 more |
| iOS | `multi-repo-ios/multi-repo-ios/Components/Toast/AppToast.swift` | Present | `icon: AnyView, action: @escaping () -> Void) {`, `let background: Color`, `let borderColor: Color`, `let iconName: String // SF Symbol fallback -- in production swap for Ph icon`, `let iconColor: Color`, `let textColor: Color`, `let descColor: Color`, `let descOpacity: Double`, plus 50 more |
| Android | `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppToast.kt` | Present | `message: String`, `modifier: Modifier = Modifier`, `variant: AppToastVariant = AppToastVariant.Default`, `description: String? = null`, `actionLabel: String? = null`, `onAction: (() -> Unit)? = null`, `dismissible: Boolean = false`, `onDismiss: (() -> Unit)? = null` |

**Parity status:** Implemented on all three platforms.

**Token contract:** component code must use semantic tokens only: CSS `--surfaces-*`, `--typography-*`, `--icons-*`, and `--border-*`; Swift `Color.surfaces*`, `Color.typography*`, `Color.icons*`, and `Color.border*`; Kotlin `SemanticColors.*`, `Spacing.*`, `Radius.*`, `IconSize.*`, and `AppTypography.*`. Disabled state remains opacity 0.5 across platforms.

**Accessibility contract:** preserve semantic roles/labels, visible keyboard focus on web, VoiceOver labels/traits on iOS, and TalkBack semantics on Android when changing the component.
