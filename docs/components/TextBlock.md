# TextBlock (Pattern)

**Figma:** bubbles-kit › node `84:789`
**Web:** `multi-repo-nextjs/app/components/patterns/TextBlock/TextBlock.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Patterns/AppTextBlock.swift`
**Type:** Complex Component (typography-only pattern)

---

## Overview

A vertical typography stack with up to 5 optional text slots arranged from top to bottom:

```
overline   (small uppercase, muted)
title      (large emphasized, primary)
subtext    (small, muted)
body       (medium, secondary)
metadata   (caption, muted)
```

All slots are optional — only non-nil slots are rendered. The component expands to fill available width with leading alignment.

---

## Props

### Web (`TextBlockProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `overline` | `string` | — | Uppercase category/tag line |
| `title` | `string` | — | Primary title text |
| `subtext` | `string` | — | Secondary subtitle |
| `body` | `string` | — | Main body copy |
| `metadata` | `string` | — | Footnote / timestamp |
| `className` | `string` | `""` | Extra classes |

### iOS (`AppTextBlock`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `overline` | `String?` | `nil` | Uppercase category line |
| `title` | `String?` | `nil` | Primary title |
| `subtext` | `String?` | `nil` | Subtitle |
| `body` | `String?` | `nil` | Body copy (init parameter; stored as `bodyText`) |
| `metadata` | `String?` | `nil` | Footnote |

---

## Slot Typography Tokens

| Slot | Font token | Color token |
|------|-----------|-------------|
| `overline` | `--typography-overline-sm` / `.appOverlineSmall` + `tracking(1)` | `--typography-muted` |
| `title` | `--typography-body-lg-em` / `.appBodyLargeEm` | `--typography-primary` |
| `subtext` | `--typography-body-sm` / `.appBodySmall` | `--typography-muted` |
| `body` | `--typography-body-md` / `.appBodyMedium` | `--typography-secondary` |
| `metadata` | `--typography-caption-sm` / `.appCaptionSmall` | `--typography-muted` |

---

## Layout

- **Outer:** `flex-col gap-2` / `VStack(spacing: .space2)` with full-width leading alignment
- **Header group** (`overline` + `title` + `subtext`): `flex-col gap-0.5` / `VStack(spacing: .space1)` — only rendered when at least one header slot is present
- **Body** and **metadata** are siblings of the header group with `gap-2`

---

## Usage Examples

### Web

```tsx
import { TextBlock } from "@/app/components/patterns/TextBlock";

// Title + subtext
<TextBlock title="Ayurveda Books" subtext="bought for Anjali at airport" />

// All slots
<TextBlock
  overline="recent"
  title="Trip to Bali"
  subtext="Summer vacation"
  body="Some description can come here regarding the task."
  metadata="Posted 2d ago"
/>

// Title only
<TextBlock title="Inbox" />

// Body + metadata (no header)
<TextBlock body="Some description text here." metadata="3 days ago" />
```

### iOS

```swift
// Title + subtext
AppTextBlock(title: "Ayurveda Books", subtext: "bought for Anjali at airport")

// All slots
AppTextBlock(
    overline: "RECENT",
    title: "Trip to Bali",
    subtext: "Summer vacation",
    body: "Some description can come here regarding the task.",
    metadata: "Posted 2d ago"
)

// Title only
AppTextBlock(title: "Inbox")
```

---

## Composition

`TextBlock` is used as a building block inside:
- `Stepper` — right column content per step
- `ListItem` — central content area

It has no interactions, no state, and no child component dependencies.
