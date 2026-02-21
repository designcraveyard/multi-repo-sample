# Thumbnail

**Figma:** bubbles-kit › node `82:1235`
**Web:** `multi-repo-nextjs/app/components/Thumbnail/Thumbnail.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Thumbnail/AppThumbnail.swift`

---

## Overview

A fixed-size image container that displays a photo, avatar, or any visual asset. When no `src` is provided (or the image fails to load), it falls back to either custom children (e.g. initials) or a generic silhouette icon.

Two shape modes: square with small corner radius (`rounded=false`, default) or circle (`rounded=true`).

---

## Props

### Web (`ThumbnailProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `alt` | `string` | — | **Required.** Alt text for accessibility |
| `src` | `string` | — | Image URL |
| `size` | `ThumbnailSize` | `"md"` | Size token |
| `rounded` | `boolean` | `false` | `true` = circle; `false` = rounded square |
| `children` | `ReactNode` | — | Fallback content (e.g. initials) |
| `className` | `string` | `""` | Extra classes |

### iOS (`AppThumbnail`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `alt` | `String` | — | Accessibility label |
| `src` | `String?` | `nil` | Image URL |
| `size` | `AppThumbnailSize` | `.md` | Size token |
| `rounded` | `Bool` | `false` | Circle shape |
| `initials` | `String?` | `nil` | Text shown when no src |

iOS uses `AppThumbnailConfig` as a convenience wrapper when passing to `AppListItem`:
```swift
AppThumbnailConfig(size: .sm)                       // placeholder
AppThumbnailConfig(src: "https://…", size: .md)     // remote image
```

---

## Sizes

| Value | Dimensions |
|-------|-----------|
| `xs` | 32 × 32 |
| `sm` | 40 × 40 |
| `md` | 48 × 48 |
| `lg` | 64 × 64 |
| `xl` | 80 × 80 |
| `xxl` | 96 × 96 |

---

## Token Usage

| Property | Token |
|----------|-------|
| Background (fallback) | `--surfaces-base-low-contrast` |
| Shape (square) | `--radius-sm` |
| Shape (circle) | `rounded-full` / `Circle()` |
| Fallback text | `--typography-secondary` |
| Fallback icon | `--typography-muted` |

---

## Usage Examples

### Web

```tsx
import { Thumbnail } from "@/app/components/Thumbnail";

// Remote image
<Thumbnail src="/avatar.png" alt="User avatar" size="md" />

// Circle crop
<Thumbnail src="/photo.jpg" alt="Profile photo" size="lg" rounded />

// Initials fallback
<Thumbnail alt="Initials" size="md" rounded>AB</Thumbnail>

// Generic silhouette (no src, no children)
<Thumbnail alt="Unknown user" size="sm" rounded />
```

### iOS

```swift
// Remote image
AppThumbnail(src: "https://example.com/avatar.png", alt: "Avatar", size: .md)

// Circle
AppThumbnail(src: "/photo.jpg", alt: "Photo", size: .lg, rounded: true)

// Initials
AppThumbnail(alt: "AB", size: .md, rounded: true, initials: "AB")

// In ListItem
AppListItem(
    title: "Trip to Bali",
    thumbnail: AppThumbnailConfig(src: "https://…", size: .sm)
)
```
