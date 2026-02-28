# AppTooltip

**Web:** `multi-repo-nextjs/app/components/Native/AppTooltip.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Native/AppTooltip.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppTooltip.kt`

---

## Overview

A tooltip bubble that appears near an anchor element. Web wraps shadcn Tooltip (Radix) with a hover/focus trigger and 400ms delay; iOS builds on SwiftUI `.popover()` with `.presentationCompactAdaptation(.popover)` to keep it as a bubble on iPhone; Android wraps Material 3 `TooltipBox` with `PlainTooltip`.

---

## Props

### Web (`AppTooltipProps`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | The element that triggers the tooltip on hover/focus |
| `tipText` | `string` | `undefined` | Plain text shown inside the tooltip bubble |
| `tipContent` | `ReactNode` | `undefined` | Custom content for the bubble (overrides tipText) |
| `side` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Which side the bubble appears relative to the trigger |
| `open` | `boolean` | `undefined` | Controlled open state (omit for uncontrolled) |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Called when open state changes (controlled mode) |
| `className` | `string` | `""` | Additional CSS class for the trigger wrapper |

### iOS (`AppTooltip<Label, TipContent>`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isPresented` | `Binding<Bool>` | required | Controls tooltip visibility |
| `arrowEdge` | `Edge` | `.top` | The edge from which the popover arrow points toward the anchor |
| `label` | `@ViewBuilder () -> Label` | required | The anchor view |
| `tipContent` | `@ViewBuilder () -> TipContent` | required | Content shown inside the bubble |

**Convenience init (plain text):**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isPresented` | `Binding<Bool>` | required | Controls visibility |
| `tipText` | `String` | required | Plain text tooltip content |
| `arrowEdge` | `Edge` | `.top` | Arrow edge |
| `label` | `@ViewBuilder () -> Label` | required | Anchor view |

### Android (`AppTooltip`)
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `text` | `String` | required | Tooltip text displayed inside the bubble |
| `modifier` | `Modifier` | `Modifier` | Modifier applied to the TooltipBox |
| `isVisible` | `Boolean?` | `null` | When non-null, controls visibility programmatically |
| `onDismiss` | `(() -> Unit)?` | `null` | Called when the programmatic tooltip is dismissed |
| `content` | `@Composable () -> Unit` | required | The anchor composable |

---

## Platform Notes

| Platform | Native API Wrapped |
|----------|-------------------|
| Web | shadcn Tooltip (Radix Tooltip) with `TooltipProvider` (400ms delay) |
| iOS | SwiftUI `.popover()` + `.presentationCompactAdaptation(.popover)` |
| Android | Material 3 `TooltipBox` + `PlainTooltip` (long-press or programmatic) |

---

## Usage Examples

### Web
```tsx
<AppTooltip tipText="Tap to like this post">
  <button>Like</button>
</AppTooltip>

// Custom side:
<AppTooltip tipText="Settings" side="bottom">
  <Icon name="Gear" />
</AppTooltip>

// Controlled:
<AppTooltip tipText="Info" open={showTip} onOpenChange={setShowTip}>
  <span>Hover me</span>
</AppTooltip>
```

### iOS
```swift
// Plain text tooltip
AppTooltip(isPresented: $showTip, tipText: "Tap to like this post") {
    Image(systemName: "heart")
        .onTapGesture { showTip.toggle() }
}

// Custom arrow edge
AppTooltip(isPresented: $showTip, tipText: "Bold text", arrowEdge: .bottom) {
    Button("B") { showTip.toggle() }
}

// Rich content
AppTooltip(isPresented: $showTip) {
    someAnchorView
} tipContent: {
    VStack { Text("Title").bold(); Text("Detail") }
}
```

### Android
```kotlin
// Long-press tooltip (default M3 behavior)
AppTooltip(text = "Tap to like this post") {
    Icon(Icons.Default.Favorite, contentDescription = null)
}

// Programmatic tooltip
AppTooltip(
    text = "Bold text",
    isVisible = showTip,
    onDismiss = { showTip = false }
) {
    Button(onClick = { showTip = !showTip }) { Text("B") }
}
```

---

## Accessibility

- **Web:** Radix Tooltip provides keyboard focus trigger and ARIA tooltip role; `TooltipProvider` with delay prevents accidental triggers; content announced by screen readers.
- **iOS:** `.popover()` content is announced by VoiceOver; `.presentationCompactAdaptation(.popover)` ensures the bubble stays compact on iPhone rather than expanding to a sheet.
- **Android:** `PlainTooltip` is announced by TalkBack on long-press; programmatic mode uses `LaunchedEffect` to sync visibility with `TooltipState`.
