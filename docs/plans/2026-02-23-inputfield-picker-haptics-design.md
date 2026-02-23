# InputField Picker API + Haptics Design

**Date:** 2026-02-23
**Scope:** Both platforms (Next.js + SwiftUI iOS)

## Changes

### 1. First-class `leadingPicker` / `trailingPicker` on InputField
- New `InputPickerConfig` type (minimal: label, value/selection, onChange/binding, options)
- Both InputField (web) and AppInputField (iOS) accept these props
- Internally renders `AppNativePicker(embedded: true)` — caller never wraps in AnyView
- Existing `leadingLabel`/`trailingLabel` slots unchanged

### 2. Icon color follows focus + filled state
- Default state only: icon color is muted when empty + unfocused, primary when focused OR non-empty
- Success/warning/error states keep their semantic icon color unchanged
- Tokens: `--icons-primary` / `Color.iconsPrimary` (focused/filled), `--icons-muted` / `.iconsMuted` (empty unfocused)

### 3. Remove focus ring from picker chip trigger (web)
- `embedded` mode: no `focus:ring-*` on SelectTrigger (InputField border already signals focus)
- Standalone mode: keeps ring for keyboard accessibility

### 4. AppNativePicker standalone: size + variant props
- `size: AppChipSize` (sm/md/lg, default sm)
- `variant: AppChipVariant` restricted to chipTabs/filters (no segmentControl)
- Chip trigger renders matching AppChip appearance for that size/variant

### 5. iOS Haptics (inline, no shared utility)
| Component | Event | Generator |
|-----------|-------|-----------|
| AppInputField | field gains focus | UIImpactFeedbackGenerator(.light) |
| AppNativePicker | option selected | UIImpactFeedbackGenerator(.light) |
| AppColorPicker | color binding changes | UIImpactFeedbackGenerator(.light) |
| AppDateTimePicker | date binding changes | UIImpactFeedbackGenerator(.light) |
| AppBottomSheet | detent changes | UIImpactFeedbackGenerator(.medium) |
| AppCarousel | page changes | UIImpactFeedbackGenerator(.light) |
| AppRangeSlider | step mode: each step; continuous mode: each 1%-of-range tick | UISelectionFeedbackGenerator |

## Files Changed
- `multi-repo-ios/.../AppInputField.swift`
- `multi-repo-ios/.../AppNativePicker.swift`
- `multi-repo-ios/.../AppColorPicker.swift`
- `multi-repo-ios/.../AppDateTimePicker.swift`
- `multi-repo-ios/.../AppBottomSheet.swift`
- `multi-repo-ios/.../AppCarousel.swift`
- `multi-repo-ios/.../AppRangeSlider.swift`
- `multi-repo-nextjs/.../InputField.tsx`
- `multi-repo-nextjs/.../AppNativePicker.tsx`
