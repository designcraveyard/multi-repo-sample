# Toast / Toast Message

**Figma:** bubbles-kit › node `108:4229`
**Web:** `multi-repo-nextjs/app/components/Toast/Toast.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Toast/AppToast.swift`

---

## Overview

An ephemeral notification banner shown at the edge of the screen. The `default` variant is a pill-shaped dark/light banner; other variants are card-shaped with a coloured border and icon.

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

---

## Variants

| Value | Background | Border | Icon |
|-------|-----------|--------|------|
| `default` | `--surfaces-inverse-primary` | transparent | `Info` |
| `success` | `--surfaces-success-subtle` | `--border-success` | `CheckCircle` |
| `warning` | `--surfaces-warning-subtle` | `--border-warning` | `Warning` |
| `error` | `--surfaces-error-subtle` | `--border-error` | `XCircle` |
| `info` | `--surfaces-accent-low-contrast` | `--surfaces-accent-primary` | `Info` |

### Shape

- **`default`** — pill shape (`rounded-full`), no shadow
- **All other variants** — card shape (`--radius-md`), `shadow-md`, `max-w-sm`

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

---

## Accessibility

- `role="alert"` + `aria-live="polite"` + `aria-atomic="true"` on web
- iOS uses `.accessibilityAddTraits(.isStaticText)` and announces via VoiceOver
- Dismiss button has `aria-label="Dismiss notification"`
