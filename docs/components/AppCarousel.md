# AppCarousel

**Web:** `multi-repo-nextjs/app/components/Native/AppCarousel.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Native/AppCarousel.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppCarousel.kt`

---

## Overview

A horizontally scrollable carousel with two layout styles and animated dot indicators. "Paged" shows full-width slides one at a time; "scrollSnap" shows partial peek of adjacent cards with snap alignment. Web is powered by shadcn Carousel (Embla); iOS uses `TabView(.page)` for paged and `ScrollView` with `.scrollTargetBehavior(.paging)` for snap; Android uses `HorizontalPager`.

---

## Props

### Web (`AppCarouselProps`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `ReactNode[]` | required | Array of ReactNodes to render as slides |
| `style` | `"paged" \| "scrollSnap"` | `"paged"` | Full-width pages vs partial-peek cards |
| `showDots` | `boolean` | `true` | Renders dot indicators below the carousel |
| `showNavButtons` | `boolean` | `true` | Show prev/next navigation buttons on edges |
| `prevLabel` | `string` | `"Previous slide"` | Accessible label for the previous button |
| `nextLabel` | `string` | `"Next slide"` | Accessible label for the next button |
| `className` | `string` | `""` | Additional CSS class for the outer wrapper |

### iOS (`AppCarousel<Item, Content>`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `[Item]` (where `Item: Identifiable`) | required | Array of identifiable data items |
| `style` | `AppCarouselStyle` | `.paged` | `.paged` or `.scrollSnap` |
| `showDots` | `Bool` | `true` | Renders animated dot indicators below |
| `content` | `@ViewBuilder (Item) -> Content` | required | View builder for each item |

### Android (`AppCarousel`)
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `itemCount` | `Int` | required | Total number of pages |
| `modifier` | `Modifier` | `Modifier` | Modifier applied to the outer Column |
| `style` | `CarouselStyle` | `CarouselStyle.Paged` | `Paged` or `ScrollSnap` |
| `showDots` | `Boolean` | `true` | Whether to show the animated dot indicator |
| `content` | `@Composable (page: Int) -> Unit` | required | Composable content for each page index |

---

## Platform Notes

| Platform | Native API Wrapped |
|----------|-------------------|
| Web | shadcn Carousel (Embla Carousel) with Embla API for scroll state |
| iOS | `TabView(.page)` for paged / `ScrollView` + `.scrollTargetBehavior(.paging)` for scrollSnap |
| Android | `HorizontalPager` with `PaddingValues` and `pageSpacing` for scrollSnap |

---

## Usage Examples

### Web
```tsx
<AppCarousel
  items={[
    <Card key={1}>Slide 1</Card>,
    <Card key={2}>Slide 2</Card>,
    <Card key={3}>Slide 3</Card>,
  ]}
/>

// Card-width snap, no dots:
<AppCarousel items={cards} style="scrollSnap" showDots={false} />
```

### iOS
```swift
// Full-width paged
AppCarousel(items: cards) { card in
    RoundedRectangle(cornerRadius: .radiusLG).fill(card.color)
        .padding(.horizontal, .space4)
}

// Card-width snap
AppCarousel(items: cards, style: .scrollSnap) { card in
    RoundedRectangle(cornerRadius: .radiusLG).fill(card.color)
        .frame(width: 280, height: 160)
}
```

### Android
```kotlin
// Full-width paged
AppCarousel(itemCount = 3) { page ->
    Box(Modifier.fillMaxSize().background(colors[page]))
}

// Card-width snap, no dots
AppCarousel(itemCount = 3, style = CarouselStyle.ScrollSnap, showDots = false) { page ->
    Card { Text("Card $page") }
}
```

---

## Accessibility

- **Web:** Dot indicators have `role="tablist"` and `role="tab"` with `aria-selected` and `aria-label`; prev/next buttons have accessible labels; current slide announced as "Slide X of Y".
- **iOS:** `TabView` provides VoiceOver page navigation; haptic feedback fires on each page change; dot taps jump to the target page.
- **Android:** `HorizontalPager` supports TalkBack swipe navigation; haptic feedback fires on page changes; dots are clickable with no explicit content descriptions (position communicated via visual state).
