# Native Component Styling System — Design Document

**Date:** 2026-02-22
**Status:** Approved
**Platform:** iOS (SwiftUI)
**Scope:** 13 native SwiftUI component wrappers + centralized styling file

---

## Problem Statement

The existing iOS component library contains fully custom-drawn components (`AppButton`, `AppChip`, etc.) styled entirely via `DesignTokens.swift`. Several common UI patterns — pickers, date pickers, bottom sheets, alerts, sliders, etc. — are not yet covered.

Rather than rebuilding these from scratch, the goal is to **wrap SwiftUI's native components** with design-token-driven styling configured from a single centralized file.

---

## Decisions Made

| Question | Decision |
|----------|----------|
| Native vs custom | Wrap native SwiftUI views (keep native behavior and accessibility) |
| Styling file | Single `NativeComponentStyling.swift`, separate from `DesignTokens.swift` |
| File location | `Components/Native/` subdirectory |
| Dark/light mode | Handled automatically via existing `adaptive()` helper in `DesignTokens.swift` |
| Comment density | Very detailed inline comments on every property, explaining what it controls and how to customize it |

---

## Architecture

### Approach: Single Styling Enum per Component (Option A)

`NativeComponentStyling.swift` contains one top-level `enum` per component. Each enum holds:

- **`Colors`** — static Color properties for every visual state
- **`Layout`** — static CGFloat properties for spacing, radius, sizing
- **`Typography`** — static Font properties where applicable

All values reference semantic tokens from `DesignTokens.swift` — never primitive tokens or hardcoded hex values.

Wrapper views in `Components/Native/` consume these structs and apply them to the native SwiftUI views.

### States Covered

Each `Colors` struct covers (where applicable):
- `active` / `selected` — highlighted/chosen state
- `inactive` / `default` — resting state
- `disabled` — matches existing 0.5 opacity convention
- `pressed` — tap feedback (where native views expose it)
- `error` — validation-aware components
- `background` — container surface behind the control
- `tint` — primary accent color for native controls that use `.tint()`

---

## File Structure

```
multi-repo-ios/multi-repo-ios/
├── NativeComponentStyling.swift          ← NEW: all 13 components' style configs
├── DesignTokens.swift                    ← existing, referenced by NativeComponentStyling
└── Components/
    └── Native/                           ← NEW: wrapper views
        ├── AppNativePicker.swift
        ├── AppDateTimePicker.swift
        ├── AppPageHeader.swift
        ├── AppBottomSheet.swift
        ├── AppBottomNavBar.swift
        ├── AppProgressLoader.swift
        ├── AppCarousel.swift
        ├── AppContextMenu.swift
        ├── AppActionSheet.swift
        ├── AppAlertPopup.swift
        ├── AppTooltip.swift
        ├── AppColorPicker.swift
        └── AppRangeSlider.swift
```

---

## Component Mapping

| # | Component | Native SwiftUI View | Styling Approach |
|---|-----------|-------------------|-----------------|
| 1 | Picker / Dropdown / Select | `Picker` with `.pickerStyle(.menu)` | `.tint()`, `.foregroundStyle()` |
| 2 | Date / Time / DateTime Picker | `DatePicker` (`.graphical` / `.wheel` / `.compact`) | `.tint()`, environment locale |
| 3 | Page Header (large + inline) | `NavigationStack` + `.toolbar {}` | `.navigationBarTitleDisplayMode()`, `.toolbarBackground()`, custom toolbar items |
| 4 | Bottom Sheet | `.sheet()` + `.presentationDetents()` | `.presentationBackground()`, `.presentationCornerRadius()`, `.presentationDragIndicator()` |
| 5 | Bottom Navigation Bar | `TabView` | `UITabBar.appearance()` for bar tint, item colors, font |
| 6 | Progress Loader (indefinite + definite) | `ProgressView` / `ProgressView(value:)` | `.tint()`, `.progressViewStyle()` |
| 7 | Carousel + dots | `TabView` + `.tabViewStyle(.page)` / `ScrollView` + `.scrollTargetBehavior(.paging)` | Page indicator via `.indexViewStyle()`, custom dot overlay |
| 8 | Context Menu / Popover Menu | `.contextMenu()` / `.popover()` | Tint, destructive role for red items, popover background |
| 9 | Action Sheet | `.confirmationDialog()` | Role-based coloring (`.destructive`), message text styling |
| 10 | Alert Popup | `.alert()` | Role-based button coloring, message text |
| 11 | Tooltip | `.popover()` with custom content view | Background, corner radius, text color, arrow presence |
| 12 | Colour Picker | `ColorPicker` | `.labelsHidden()`, tint |
| 13 | Range Slider | Two `Slider` instances for min/max | `.tint()` for active track, thumb styling via overlay |

---

## NativeComponentStyling.swift — Internal Shape

```swift
// MARK: - 1. Picker
enum NativePickerStyling {
    struct Colors {
        static let tint        = Color.appSurfaceAccentPrimary   // selected highlight + chevron
        static let label       = Color.appTextPrimary            // row label text
        static let selected    = Color.appTextAccent             // selected option text
        static let background  = Color.appSurfaceBaseLowContrast // menu background
        static let disabled    = Color.appTextMuted              // disabled label
        static let error       = Color.appSurfaceErrorSolid      // validation error ring
    }
    struct Layout {
        static let cornerRadius = CGFloat.radiusMD
        static let paddingV     = CGFloat.space2
        static let paddingH     = CGFloat.space4
    }
    struct Typography {
        static let label    = Font.appBodyMedium
        static let selected = Font.appBodyMediumEm
    }
}

// ... same pattern for all 13
```

---

## Constraints

- `NativeComponentStyling.swift` contains **no view code** — only style values
- All color values are **semantic tokens** from `DesignTokens.swift` — no primitive tokens, no hex literals
- Bottom Sheet uses `.presentationDetents([.medium, .large])` only (standard detents, no custom fractions)
- Bottom Nav uses `UITabBar.appearance()` for colors since SwiftUI's TabView has limited styling API
- Carousel supports both `.page` (TabView) and `.paging` scroll behavior (ScrollView); style config applies to both
- Tooltip is implemented via `.popover()` since SwiftUI has no native tooltip component on iOS
- Range Slider uses two `Slider` views overlaid — SwiftUI has no native range slider
- `ColorPicker` styling is limited by what UIKit exposes; only tint and label visibility are controllable

---

## Implementation Order

1. `NativeComponentStyling.swift` — style config file (no view code)
2. Simple wrappers first: `AppProgressLoader`, `AppColorPicker`, `AppNativePicker`
3. Picker-family: `AppDateTimePicker`
4. Overlay/modal: `AppBottomSheet`, `AppActionSheet`, `AppAlertPopup`, `AppContextMenu`
5. Navigation: `AppPageHeader`, `AppBottomNavBar`
6. Interactive: `AppRangeSlider`, `AppCarousel`, `AppTooltip`
