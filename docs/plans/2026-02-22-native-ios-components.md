# Native iOS Components — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wrap 13 native SwiftUI components with design-token-driven styling, all configured from a single `NativeComponentStyling.swift` file, with exhaustive inline comments on every property.

**Architecture:** One caseless enum per component in `NativeComponentStyling.swift` holds `Colors`, `Layout`, and `Typography` nested structs. All values reference semantic tokens from `DesignTokens.swift` — no primitive tokens, no hex literals. Wrapper views live in `Components/Native/` and consume these structs. `UITabBar.appearance()` for the bottom nav bar is applied once at app startup.

**Tech Stack:** SwiftUI, iOS 26.2, `DesignTokens.swift` (existing), no external packages added.

---

## Build Verification Command

Run this after every task to confirm the build is clean. Run from the workspace root:

```bash
xcodebuild -project multi-repo-ios/multi-repo-ios.xcodeproj \
  -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  build 2>&1 | grep -E "error:|Build succeeded|BUILD FAILED"
```

Expected output: `** BUILD SUCCEEDED **`

---

## Task 1: Create the Native directory

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/Native/.gitkeep`

**Step 1: Create the directory**

```bash
mkdir -p multi-repo-ios/multi-repo-ios/Components/Native
touch multi-repo-ios/multi-repo-ios/Components/Native/.gitkeep
```

**Step 2: Verify**

```bash
ls multi-repo-ios/multi-repo-ios/Components/Native/
```
Expected: `.gitkeep`

**Step 3: Commit**

```bash
git add multi-repo-ios/multi-repo-ios/Components/Native/.gitkeep
git commit -m "chore(ios): scaffold Components/Native/ directory for native SwiftUI wrappers"
```

---

## Task 2: NativeComponentStyling.swift — Centralized style config

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/NativeComponentStyling.swift`

This is the only file users need to touch to restyle any native component. Every property has a detailed comment explaining what it controls and how to change it.

**Step 1: Create the file**

```swift
// NativeComponentStyling.swift
// Centralized style configuration for all native SwiftUI component wrappers.
//
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  HOW TO USE THIS FILE                                                       ║
// ║                                                                             ║
// ║  Each section below corresponds to one component in Components/Native/.     ║
// ║  To restyle any component:                                                  ║
// ║    1. Find the section (e.g., "MARK: - 6. Progress Loader")                ║
// ║    2. Change the token references in Colors / Layout / Typography           ║
// ║    3. Build — every usage of that component updates automatically           ║
// ║                                                                             ║
// ║  TOKEN QUICK REFERENCE                                                      ║
// ║  Colors  : Color.appSurface*, Color.appText*, Color.appBorder*             ║
// ║  Spacing : CGFloat.space1(4px) … space12(48px)  — 4px grid                ║
// ║  Radius  : CGFloat.radiusXS(4) radiusSM(8) radiusMD(12)                   ║
// ║            radiusLG(16) radiusXL(24) radius2XL(32)                        ║
// ║  Fonts   : Font.appBodyMedium, .appTitleSmall, .appCTAMedium …            ║
// ║                                                                             ║
// ║  RULE: Never hardcode a hex color or a raw point size in this file.        ║
// ║        Every value MUST be a token from DesignTokens.swift.                ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import SwiftUI

// MARK: - 1. Picker / Dropdown / Select
// Native SwiftUI view : Picker with .pickerStyle(.menu) or .pickerStyle(.wheel)
// Wrapper             : Components/Native/AppNativePicker.swift

enum NativePickerStyling {

    struct Colors {
        // Tint color applied by iOS to:
        //   • the checkmark next to the selected row in .menu style
        //   • the chevron/caret indicator on the trigger button
        //   • the selection highlight ring in .wheel style
        // Change to Color.appSurfaceBrand for an all-black/white brand-colored picker.
        static let tint = Color.appSurfaceAccentPrimary

        // Foreground color of the label text shown on the closed picker trigger.
        // This is the text the user reads before opening the menu.
        static let label = Color.appTextPrimary

        // Foreground color of the currently selected option's row text inside
        // the open dropdown. Making this distinct from optionText helps users
        // quickly spot their current selection.
        static let selectedText = Color.appTextAccent

        // Foreground color of all unselected options in the open dropdown list.
        static let optionText = Color.appTextPrimary

        // Background of the floating menu card that appears when the picker opens.
        // Use appSurfaceBasePrimary for a plain white / pure-black card.
        // Use appSurfaceBaseLowContrast (current) for a slightly elevated look.
        static let menuBackground = Color.appSurfaceBaseLowContrast

        // Text/icon color rendered when isDisabled == true is passed to AppNativePicker.
        // The container is also rendered at 0.5 opacity (design system disabled convention).
        static let disabled = Color.appTextMuted

        // 1.5pt border drawn around the trigger container when showError == true.
        // Pair this with the errorText color for a consistent validation pattern.
        static let errorBorder = Color.appBorderError

        // Color of the helper / validation error message shown below the picker.
        static let errorText = Color.appTextError
    }

    struct Layout {
        // Corner radius of the trigger container box that wraps the Picker.
        static let cornerRadius = CGFloat.radiusMD    // 12px

        // Vertical padding inside the trigger container.
        static let paddingV = CGFloat.space2           // 8px

        // Horizontal padding inside the trigger container.
        static let paddingH = CGFloat.space4           // 16px

        // Width of the error-state border stroke in points.
        static let errorBorderWidth: CGFloat = 1.5

        // Width of the default (non-error) border stroke in points.
        static let defaultBorderWidth: CGFloat = 1.0
    }

    struct Typography {
        // Font for the picker trigger label and option rows.
        static let label = Font.appBodyMedium

        // Font for the helper / error text displayed below the picker.
        static let helper = Font.appCaptionMedium
    }
}

// MARK: - 2. Date / Time / DateTime Picker
// Native SwiftUI view : DatePicker with .graphical / .compact / .wheel style
// Wrapper             : Components/Native/AppDateTimePicker.swift

enum NativeDatePickerStyling {

    struct Colors {
        // Accent color applied to:
        //   • Selected day circle in .graphical calendar grid
        //   • The "today" ring indicator
        //   • The spinner drum highlight band in .wheel style
        //   • The disclosure button in .compact style
        // Change to Color.appSurfaceBrand for a monochrome-brand calendar.
        static let tint = Color.appSurfaceAccentPrimary

        // Foreground color for the picker label text (the text passed as `label:`).
        // In .compact style this appears to the left of the date button.
        // In .graphical style this is the month/year header.
        static let label = Color.appTextPrimary

        // Background of the entire DatePicker component area.
        // .graphical renders a card; this fills its background.
        // Use appSurfaceBasePrimary for a clean white / pure-black card.
        static let background = Color.appSurfaceBaseLowContrast

        // Color of the selected date numeral text inside the calendar grid.
        // iOS renders this on top of the `tint` circle — should contrast well.
        static let selectedDayText = Color.appTextOnBrandPrimary  // white on indigo

        // Color of day numerals for dates that are NOT selected.
        static let dayText = Color.appTextPrimary

        // Color rendered for day numerals that fall outside the allowed date range
        // (i.e. dates before minimumDate or after maximumDate).
        static let disabledDayText = Color.appTextMuted

        // Foreground color for the weekday column headers (Mo, Tu, We …).
        static let weekdayHeader = Color.appTextSecondary
    }

    struct Layout {
        // Corner radius of the background card rendered in .graphical style.
        static let graphicalCornerRadius = CGFloat.radiusLG    // 16px

        // Vertical spacing between the label and the picker control.
        static let labelSpacing = CGFloat.space2               // 8px
    }

    struct Typography {
        // Font used for the label passed to DatePicker.
        static let label = Font.appBodyMedium

        // Font used for month/year navigation in .graphical style.
        // Note: iOS controls this internally; this token is used for any
        // supplementary Text views you add around the DatePicker.
        static let monthYear = Font.appBodyLargeEm

        // Font for the compact trigger button text (the formatted date string).
        // Note: iOS controls internal rendering; this applies to surrounding labels.
        static let compactDate = Font.appBodyMedium
    }
}

// MARK: - 3. Page Header (Large + Inline)
// Native SwiftUI view : NavigationStack + .toolbar {} modifiers
// Wrapper             : Components/Native/AppPageHeader.swift (ViewModifier)
//
// Apply as:  .modifier(AppPageHeaderModifier(title: "Screen", displayMode: .large))
// Or via:    .appPageHeader(title: "Screen", displayMode: .inline, trailingActions: [...])

enum NativePageHeaderStyling {

    struct Colors {
        // Background fill of the navigation bar area.
        // This is applied via .toolbarBackground(_:for:) on the NavigationStack.
        // Use appSurfaceBasePrimary for a standard white/black nav bar.
        // Use appSurfaceBrand for a bold brand-colored nav bar.
        static let background = Color.appSurfaceBasePrimary

        // Tint color applied to:
        //   • The back button chevron and "Back" text
        //   • All ToolbarItem buttons in the leading and trailing positions
        // Change to Color.appSurfaceAccentPrimary for an accent-colored nav bar.
        static let tint = Color.appTextBrand

        // Color of the large title text (when displayMode == .large).
        // iOS renders the large title using the UINavigationBar appearance;
        // setting foreground on the NavigationStack controls this in SwiftUI.
        static let largeTitle = Color.appTextPrimary

        // Color of the inline (small) title text (when displayMode == .inline).
        static let inlineTitle = Color.appTextPrimary

        // Color of the thin 1px separator line drawn below the nav bar.
        // Set to Color.clear to remove the separator line entirely.
        static let separator = Color.appBorderDefault
    }

    struct Typography {
        // Font used for the large title. iOS scales this automatically;
        // this token is used if you add a custom title view.
        static let largeTitle = Font.appTitleLarge

        // Font used for the inline (collapsed) title.
        static let inlineTitle = Font.appTitleSmall

        // Font applied to ToolbarItem button labels in the trailing slot.
        static let trailingAction = Font.appCTAMedium
    }
}

// MARK: - 4. Bottom Sheet
// Native SwiftUI view : .sheet() + .presentationDetents() + presentation modifiers
// Wrapper             : Components/Native/AppBottomSheet.swift (ViewModifier)
//
// Apply as:
//   .appBottomSheet(isPresented: $showSheet, detents: [.medium, .large]) {
//       MySheetContent()
//   }

enum NativeBottomSheetStyling {

    struct Colors {
        // Fill color of the sheet's background surface.
        // Use appSurfaceBasePrimary for a standard white/black sheet.
        // Use appSurfaceBaseLowContrast for a slightly elevated off-white sheet.
        static let sheetBackground = Color.appSurfaceBasePrimary

        // Color of the drag indicator (the small rounded pill at the top of the sheet).
        // iOS tints this automatically; this value is used for any custom indicator
        // you render yourself inside the sheet content.
        // To control iOS's native indicator color you must use UISheetPresentationController.
        static let dragIndicator = Color.appBorderDefault
    }

    struct Layout {
        // Corner radius of the sheet's top-left and top-right corners.
        // Applied via .presentationCornerRadius(_:).
        static let cornerRadius = CGFloat.radiusXL    // 24px

        // Controls visibility of the native drag indicator pill.
        //   .visible  → always shows the grabber
        //   .hidden   → hides the grabber (use if your sheet has a custom header)
        //   .automatic → system decides based on sheet height
        static let dragIndicatorVisibility: Visibility = .visible

        // Default set of detents offered when none are specified by the caller.
        // .medium = ~50% screen height, .large = ~90% screen height.
        // To add a custom size: Set<PresentationDetent> = [.fraction(0.3), .large]
        static let defaultDetents: Set<PresentationDetent> = [.medium, .large]

        // Inner horizontal padding added around the sheet content area.
        static let contentPaddingH = CGFloat.space4    // 16px

        // Inner vertical padding at the top of the sheet content area.
        static let contentPaddingTop = CGFloat.space3  // 12px
    }
}

// MARK: - 5. Bottom Navigation Bar
// Native SwiftUI view : TabView
// Wrapper             : Components/Native/AppBottomNavBar.swift
//
// IMPORTANT: Call NativeBottomNavStyling.applyAppearance() once in
//            multi_repo_iosApp.swift's init() before any view renders.
//            UITabBar.appearance() must be applied before the first TabView appears.

enum NativeBottomNavStyling {

    struct Colors {
        // Background fill of the tab bar area.
        // This is set via UITabBarAppearance.backgroundColor.
        // Use appSurfaceBasePrimary for the standard white/black system bar.
        static let background = Color.appSurfaceBasePrimary

        // Icon tint for the currently selected (active) tab.
        // This colors the SF Symbol or custom icon in the selected tab item.
        static let activeIcon = Color.appTextBrand

        // Text color of the label beneath the currently selected tab icon.
        static let activeLabel = Color.appTextBrand

        // Icon tint for all unselected (inactive) tab items.
        static let inactiveIcon = Color.appTextMuted

        // Text color of the labels beneath all unselected tab items.
        static let inactiveLabel = Color.appTextMuted

        // Background color of the numeric badge bubble shown on tab icons.
        // Change to Color.appSurfaceErrorSolid for a standard red notification badge.
        static let badge = Color.appSurfaceErrorSolid

        // Text color of the badge numeral (the count shown in the badge bubble).
        static let badgeText = Color.appTextOnBrandPrimary // white on red
    }

    struct Typography {
        // Point size of the tab item label text.
        // UITabBarAppearance requires a raw CGFloat, not a Font token.
        // Equivalent to appCaptionSmall (10pt).
        static let labelSize: CGFloat = 10

        // Font weight for the active tab label (selected state).
        static let activeLabelWeight: UIFont.Weight = .semibold

        // Font weight for inactive tab labels.
        static let inactiveLabelWeight: UIFont.Weight = .regular
    }

    struct Layout {
        // Vertical offset of the tab icon within its cell.
        // Positive values push the icon down; negative values push it up.
        // Leave at 0 for standard system positioning.
        static let iconVerticalOffset: CGFloat = 0
    }

    // Applies UIKit appearance settings to UITabBar.
    // Call ONCE in multi_repo_iosApp.init() before any scene renders.
    static func applyAppearance() {
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(Colors.background)

        // Active (selected) tab item styling
        appearance.stackedLayoutAppearance.selected.iconColor =
            UIColor(Colors.activeIcon)
        appearance.stackedLayoutAppearance.selected.titleTextAttributes = [
            .foregroundColor: UIColor(Colors.activeLabel),
            .font: UIFont.systemFont(ofSize: Typography.labelSize,
                                     weight: Typography.activeLabelWeight)
        ]
        appearance.stackedLayoutAppearance.selected.badgeBackgroundColor =
            UIColor(Colors.badge)
        appearance.stackedLayoutAppearance.selected.badgeTextAttributes = [
            .foregroundColor: UIColor(Colors.badgeText)
        ]

        // Inactive tab item styling
        appearance.stackedLayoutAppearance.normal.iconColor =
            UIColor(Colors.inactiveIcon)
        appearance.stackedLayoutAppearance.normal.titleTextAttributes = [
            .foregroundColor: UIColor(Colors.inactiveLabel),
            .font: UIFont.systemFont(ofSize: Typography.labelSize,
                                     weight: Typography.inactiveLabelWeight)
        ]
        appearance.stackedLayoutAppearance.normal.badgeBackgroundColor =
            UIColor(Colors.badge)
        appearance.stackedLayoutAppearance.normal.badgeTextAttributes = [
            .foregroundColor: UIColor(Colors.badgeText)
        ]

        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
    }
}

// MARK: - 6. Progress Loader (Indefinite + Definite)
// Native SwiftUI view : ProgressView (circular) / ProgressView(value:total:) (linear)
// Wrapper             : Components/Native/AppProgressLoader.swift

enum NativeProgressLoaderStyling {

    struct Colors {
        // The accent color applied to the spinning indicator (indefinite)
        // or the filled portion of the linear progress bar (definite).
        // Change to Color.appSurfaceBrand for a monochrome loader.
        static let tint = Color.appSurfaceAccentPrimary

        // Background (unfilled) track color for the linear determinate bar.
        // Note: SwiftUI does not directly expose the track color via .tint().
        // AppProgressLoader draws a custom track underneath the native Slider.
        static let track = Color.appSurfaceBaseLowContrast

        // Color of the optional descriptive label rendered below the loader.
        static let label = Color.appTextSecondary
    }

    struct Layout {
        // Scale factor for the circular indefinite spinner.
        // 1.0 = native default size (~20pt diameter).
        // 1.5 = medium prominent loader; 2.0 = large full-screen loader.
        static let scale: CGFloat = 1.0

        // Height of the linear determinate progress bar track.
        static let linearTrackHeight: CGFloat = 6

        // Corner radius of the linear progress bar ends.
        static let linearTrackRadius: CGFloat = 3

        // Vertical gap between the spinner/bar and the optional label text.
        static let labelSpacing = CGFloat.space2    // 8px
    }

    struct Typography {
        // Font for the optional label text displayed below the loader.
        static let label = Font.appBodyMedium
    }
}

// MARK: - 7. Carousel + Carousel Dots
// Native SwiftUI view : TabView with .tabViewStyle(.page) or
//                       ScrollView with .scrollTargetBehavior(.paging)
// Wrapper             : Components/Native/AppCarousel.swift

enum NativeCarouselStyling {

    struct Colors {
        // Fill color of the dot representing the currently visible page.
        // A wider capsule is used for the active dot (see Layout.dotActiveWidth).
        static let dotActive = Color.appSurfaceBrand

        // Fill color of all dots representing pages that are NOT currently visible.
        static let dotInactive = Color.appSurfaceBaseLowContrast

        // Background of the page indicator row (the row containing all dots).
        // Set to Color.clear (default) to render dots directly on the carousel content.
        static let dotRowBackground = Color.clear
    }

    struct Layout {
        // Height of the fixed-height frame applied to the paged TabView carousel.
        // Change this to match the card or image height your content needs.
        static let pagedHeight: CGFloat = 240

        // Horizontal gap between adjacent cards in the scroll-snap (.scrollSnap) style.
        static let cardSpacing = CGFloat.space3    // 12px

        // Diameter of the inactive dot indicator circles.
        static let dotInactiveWidth: CGFloat = 6
        static let dotHeight: CGFloat = 6

        // Width of the active dot — a wider capsule visually marks the current page.
        static let dotActiveWidth: CGFloat = 18

        // Horizontal gap between adjacent dot indicators.
        static let dotGap = CGFloat.space1         // 4px

        // Vertical gap between the carousel content and the dots row below it.
        static let dotsSpacing = CGFloat.space3    // 12px
    }
}

// MARK: - 8. Context Menu + Popover Menu
// Native SwiftUI views : .contextMenu {} (long-press menu)
//                        .popover(isPresented:) (tap-triggered popover)
// Wrapper              : Components/Native/AppContextMenu.swift

enum NativeContextMenuStyling {

    struct Colors {
        // Text/icon color for standard (non-destructive) menu items.
        // Note: iOS tints .contextMenu items automatically using system colors.
        // This color is used for AppPopoverMenu which renders a custom popover card.
        static let itemText = Color.appTextPrimary

        // Text/icon color for items marked with role: .destructive.
        // iOS renders .contextMenu destructive items in red automatically.
        // AppPopoverMenu uses this explicitly to color its destructive rows.
        static let destructiveText = Color.appTextError

        // Background fill of the AppPopoverMenu card.
        static let background = Color.appSurfaceBasePrimary

        // Color of the 1px divider lines drawn between menu rows in AppPopoverMenu.
        static let rowDivider = Color.appBorderMuted
    }

    struct Layout {
        // Minimum width of the AppPopoverMenu card in points.
        // Prevents the popover from being too narrow for long labels.
        static let minWidth: CGFloat = 180

        // Horizontal padding inside each menu row.
        static let itemPaddingH = CGFloat.space4    // 16px

        // Vertical padding inside each menu row.
        static let itemPaddingV = CGFloat.space3    // 12px

        // Horizontal gap between the icon and the label text within a row.
        static let itemIconSpacing = CGFloat.space2  // 8px

        // Corner radius of the AppPopoverMenu card.
        static let cornerRadius = CGFloat.radiusMD   // 12px
    }

    struct Typography {
        // Font used for menu item labels in AppPopoverMenu.
        static let item = Font.appBodyMedium
    }
}

// MARK: - 9. Action Sheet
// Native SwiftUI view : .confirmationDialog(_:isPresented:titleVisibility:actions:message:)
// Wrapper             : Components/Native/AppActionSheet.swift (ViewModifier)
//
// iOS applies system styling to confirmationDialog — color overrides are limited.
// The primary customization points are:
//   • Marking actions as .destructive (system renders them in red automatically)
//   • Marking the cancel action with .cancel (system styles and positions it)
// No Colors/Layout structs are needed; the design tokens apply only to any
// supplementary views you add around the sheet trigger.

enum NativeActionSheetStyling {

    // Currently a namespace only — confirmationDialog styling is handled by iOS.
    //
    // If you need to match a non-standard brand color scheme:
    //   → Replace .confirmationDialog with a custom sheet containing AppButton rows
    //     styled with NativePickerStyling or your own token set.
    //
    // The AppActionSheetAction type supports three roles:
    //   .default(label)     → standard blue action
    //   .destructive(label) → iOS renders in red
    //   .cancel(label)      → iOS positions at bottom, bold weight

    struct Typography {
        // Font used for any Text views you place in the message: slot.
        // iOS controls the title font; this applies only to supplementary content.
        static let message = Font.appBodyMedium
    }
}

// MARK: - 10. Alert Popup
// Native SwiftUI view : .alert(_:isPresented:actions:message:)
// Wrapper             : Components/Native/AppAlertPopup.swift (ViewModifier)
//
// iOS applies system styling to .alert — background, blur, and title style are fixed.
// Customization is limited to:
//   • Button roles (.destructive renders red, .cancel renders bold)
//   • The message: Text content
// No further token overrides are available for .alert without private API.

enum NativeAlertStyling {

    // Currently a namespace only — alert styling is fully managed by iOS.
    //
    // Design guideline: alerts should have at most two actions.
    //   • One primary action (nil role)
    //   • One cancel action (.cancel role)
    // For multi-action scenarios, use AppActionSheet instead.

    struct Typography {
        // Font for the message Text passed in the message: slot.
        static let message = Font.appBodyMedium
    }
}

// MARK: - 11. Tooltip
// Native SwiftUI view : .popover(isPresented:arrowEdge:content:)
// Wrapper             : Components/Native/AppTooltip.swift
//
// SwiftUI has no dedicated tooltip API on iOS. The .popover modifier is used
// and configured with .presentationCompactAdaptation(.popover) to prevent it
// from expanding to a full sheet on compact size classes.

enum NativeTooltipStyling {

    struct Colors {
        // Background fill of the tooltip bubble.
        // Use a high-contrast color so the tooltip reads clearly against content.
        static let background = Color.appSurfaceInversePrimary  // dark in light mode

        // Text color inside the tooltip. Should contrast with `background`.
        static let text = Color.appTextInversePrimary           // light in light mode
    }

    struct Layout {
        // Corner radius of the tooltip bubble.
        static let cornerRadius = CGFloat.radiusSM    // 8px

        // Horizontal padding inside the tooltip bubble.
        static let paddingH = CGFloat.space3           // 12px

        // Vertical padding inside the tooltip bubble.
        static let paddingV = CGFloat.space2           // 8px

        // Maximum width of the tooltip bubble before text wraps.
        static let maxWidth: CGFloat = 240

        // Default edge from which the tooltip arrow points toward the anchor view.
        // .top → arrow at the top, bubble appears below the anchor.
        // .bottom → arrow at the bottom, bubble appears above the anchor.
        static let defaultArrowEdge: Edge = .top
    }

    struct Typography {
        // Font for the tooltip body text.
        static let content = Font.appBodySmall
    }
}

// MARK: - 12. Color Picker
// Native SwiftUI view : ColorPicker
// Wrapper             : Components/Native/AppColorPicker.swift
//
// SwiftUI's ColorPicker presents the system color wheel sheet.
// Styling options are limited: only the label font/color and the tint
// of the trigger button swatch are configurable through the public API.

enum NativeColorPickerStyling {

    struct Colors {
        // Foreground color of the label text shown next to the color swatch.
        static let label = Color.appTextPrimary

        // Tint applied to interactive elements around the picker trigger.
        // The actual color swatch always shows the currently selected color.
        static let tint = Color.appSurfaceAccentPrimary
    }

    struct Typography {
        // Font for the label shown next to the color swatch trigger.
        static let label = Font.appBodyMedium
    }
}

// MARK: - 13. Range Slider
// Native SwiftUI view : Two overlapping Slider views + custom track overlay
// Wrapper             : Components/Native/AppRangeSlider.swift
//
// SwiftUI has no built-in range slider. This implementation uses two standard
// Slider views stacked in a ZStack:
//   • The lower Slider controls the minimum bound
//   • The upper Slider controls the maximum bound
// Both sliders' tracks are hidden via .tint(.clear); a custom active-track
// Rectangle is drawn between the two thumb positions.

enum NativeRangeSliderStyling {

    struct Colors {
        // Fill color of the active track segment (the portion between the two thumbs).
        static let trackActive = Color.appSurfaceAccentPrimary

        // Fill color of the inactive track segments (left of lower thumb and
        // right of upper thumb).
        static let trackBackground = Color.appSurfaceBaseLowContrast

        // Fill color of the thumb circles for both the lower and upper handles.
        // Note: SwiftUI's Slider uses a system white thumb that cannot be recolored
        // without a custom gesture approach. This token is reserved for future use
        // if the implementation is upgraded to a fully custom drag gesture slider.
        static let thumb = Color.appSurfaceBasePrimary

        // Shadow/border around each thumb to make it pop against the track.
        static let thumbShadow = Color.appBorderDefault

        // Optional label text color for min/max bound labels rendered below the slider.
        static let label = Color.appTextMuted
    }

    struct Layout {
        // Height of the slider track bar.
        static let trackHeight: CGFloat = 4

        // Corner radius applied to the track bar ends (creates pill shape).
        static let trackCornerRadius: CGFloat = 2

        // Total height of the slider component including thumb hit area.
        // Must be at least 44pt to satisfy accessibility minimum touch target.
        static let totalHeight: CGFloat = 44

        // Diameter of the thumb circles (informational — set by system on native Slider).
        static let thumbDiameter: CGFloat = 24

        // Vertical gap between the track and optional min/max label text.
        static let labelSpacing = CGFloat.space1  // 4px
    }

    struct Typography {
        // Font for optional min / max bound labels rendered below the slider.
        static let boundLabel = Font.appCaptionSmall
    }
}
```

**Step 2: Verify it builds**

```bash
xcodebuild -project multi-repo-ios/multi-repo-ios.xcodeproj \
  -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  build 2>&1 | grep -E "error:|Build succeeded|BUILD FAILED"
```

Expected: `** BUILD SUCCEEDED **`

**Step 3: Commit**

```bash
git add multi-repo-ios/multi-repo-ios/NativeComponentStyling.swift
git commit -m "feat(ios): add NativeComponentStyling.swift — centralized native component style config"
```

---

## Task 3: AppNativePicker.swift

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/Native/AppNativePicker.swift`

**Step 1: Create the file**

```swift
// AppNativePicker.swift
// Style source: NativeComponentStyling.swift › NativePickerStyling
//
// Usage:
//   AppNativePicker(label: "Country", selection: $country, options: [
//       (label: "Australia", value: "AU"),
//       (label: "India",     value: "IN"),
//   ])
//
//   // With validation error:
//   AppNativePicker(label: "Size", selection: $size, options: sizes,
//                  showError: true, errorMessage: "Please select a size")
//
//   // Disabled:
//   AppNativePicker(label: "Region", selection: $region, options: regions,
//                  isDisabled: true)

import SwiftUI

// MARK: - AppNativePicker

/// A styled wrapper around SwiftUI's `Picker` using `.menu` style.
/// All visual tokens come from `NativePickerStyling` in `NativeComponentStyling.swift`.
public struct AppNativePicker<T: Hashable>: View {

    // MARK: - Properties

    /// Text label displayed on the picker trigger button.
    let label: String

    /// The currently selected value. Bind to a `@State` or `@Published` variable.
    @Binding var selection: T

    /// The list of options to display. Each option is a `(label: String, value: T)` tuple.
    let options: [(label: String, value: T)]

    /// When true, the picker is rendered at 0.5 opacity and interaction is blocked.
    var isDisabled: Bool = false

    /// When true, a red error border is drawn and `errorMessage` is displayed below.
    var showError: Bool = false

    /// The validation message shown below the picker when `showError` is true.
    var errorMessage: String = ""

    // MARK: - Body

    public var body: some View {
        VStack(alignment: .leading, spacing: NativePickerStyling.Layout.paddingV) {
            Picker(label, selection: $selection) {
                ForEach(options, id: \.value) { option in
                    Text(option.label)
                        .foregroundStyle(
                            option.value == selection
                                ? NativePickerStyling.Colors.selectedText
                                : NativePickerStyling.Colors.optionText
                        )
                        .tag(option.value)
                }
            }
            .pickerStyle(.menu)
            .tint(NativePickerStyling.Colors.tint)
            .font(NativePickerStyling.Typography.label)
            .foregroundStyle(NativePickerStyling.Colors.label)
            .disabled(isDisabled)
            .opacity(isDisabled ? 0.5 : 1.0)
            .padding(.vertical, NativePickerStyling.Layout.paddingV)
            .padding(.horizontal, NativePickerStyling.Layout.paddingH)
            .background(
                RoundedRectangle(cornerRadius: NativePickerStyling.Layout.cornerRadius)
                    .stroke(
                        showError
                            ? NativePickerStyling.Colors.errorBorder
                            : Color.appBorderDefault,
                        lineWidth: showError
                            ? NativePickerStyling.Layout.errorBorderWidth
                            : NativePickerStyling.Layout.defaultBorderWidth
                    )
            )

            if showError && !errorMessage.isEmpty {
                Text(errorMessage)
                    .font(NativePickerStyling.Typography.helper)
                    .foregroundStyle(NativePickerStyling.Colors.errorText)
            }
        }
    }
}

// MARK: - Preview

#Preview {
    @Previewable @State var selected = "AU"
    @Previewable @State var errSelected = "AU"

    VStack(spacing: 24) {
        AppNativePicker(
            label: "Country",
            selection: $selected,
            options: [("Australia", "AU"), ("India", "IN"), ("USA", "US")]
        )

        AppNativePicker(
            label: "Size",
            selection: $errSelected,
            options: [("Small", "S"), ("Medium", "M"), ("Large", "L")],
            showError: true,
            errorMessage: "Please select a size"
        )

        AppNativePicker(
            label: "Region (disabled)",
            selection: $selected,
            options: [("North", "N"), ("South", "S")],
            isDisabled: true
        )
    }
    .padding()
}
```

**Step 2: Build and verify**

```bash
xcodebuild -project multi-repo-ios/multi-repo-ios.xcodeproj \
  -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  build 2>&1 | grep -E "error:|Build succeeded|BUILD FAILED"
```

**Step 3: Commit**

```bash
git add multi-repo-ios/multi-repo-ios/Components/Native/AppNativePicker.swift
git commit -m "feat(ios/native): add AppNativePicker — styled Picker wrapper with error state"
```

---

## Task 4: AppDateTimePicker.swift

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/Native/AppDateTimePicker.swift`

**Step 1: Create the file**

```swift
// AppDateTimePicker.swift
// Style source: NativeComponentStyling.swift › NativeDatePickerStyling
//
// Usage:
//   AppDateTimePicker(label: "Birthday", selection: $date)
//
//   AppDateTimePicker(label: "Appointment", selection: $appt, mode: .dateAndTime,
//                    displayStyle: .graphical)
//
//   AppDateTimePicker(label: "Time", selection: $time, mode: .time,
//                    displayStyle: .wheel)
//
//   // With date range:
//   AppDateTimePicker(label: "Check-in", selection: $date,
//                    minimumDate: Date(), maximumDate: nextYear)

import SwiftUI

// MARK: - Supporting Enums

/// The date components the picker selects.
public enum AppDatePickerMode {
    case date           // calendar date only (month / day / year)
    case time           // hour and minute only
    case dateAndTime    // both date and time
}

/// The visual rendering style of the date picker control.
public enum AppDatePickerDisplayStyle {
    case compact        // Compact inline button that expands a popover
    case graphical      // Full month-calendar grid with navigation arrows
    case wheel          // Spinning drum columns (classic iOS drum picker)
}

// MARK: - AppDateTimePicker

/// A styled wrapper around SwiftUI's `DatePicker`.
/// All visual tokens come from `NativeDatePickerStyling` in `NativeComponentStyling.swift`.
public struct AppDateTimePicker: View {

    // MARK: - Properties

    /// Descriptive label shown next to or above the picker control.
    let label: String

    /// The currently selected `Date`. Bind to a `@State` or `@Published` variable.
    @Binding var selection: Date

    /// Controls whether date, time, or both components are selectable.
    var mode: AppDatePickerMode = .date

    /// Controls the visual rendering style (.compact / .graphical / .wheel).
    var displayStyle: AppDatePickerDisplayStyle = .compact

    /// Optional earliest selectable date. Dates before this are greyed out.
    var minimumDate: Date? = nil

    /// Optional latest selectable date. Dates after this are greyed out.
    var maximumDate: Date? = nil

    // MARK: - Body

    public var body: some View {
        VStack(alignment: .leading, spacing: NativeDatePickerStyling.Layout.labelSpacing) {
            switch displayStyle {
            case .compact:
                DatePicker(
                    label,
                    selection: $selection,
                    in: dateRange,
                    displayedComponents: displayedComponents
                )
                .datePickerStyle(.compact)
                .tint(NativeDatePickerStyling.Colors.tint)
                .foregroundStyle(NativeDatePickerStyling.Colors.label)
                .font(NativeDatePickerStyling.Typography.label)

            case .graphical:
                DatePicker(
                    label,
                    selection: $selection,
                    in: dateRange,
                    displayedComponents: displayedComponents
                )
                .datePickerStyle(.graphical)
                .tint(NativeDatePickerStyling.Colors.tint)
                .foregroundStyle(NativeDatePickerStyling.Colors.label)
                .background(
                    NativeDatePickerStyling.Colors.background,
                    in: RoundedRectangle(cornerRadius: NativeDatePickerStyling.Layout.graphicalCornerRadius)
                )

            case .wheel:
                DatePicker(
                    label,
                    selection: $selection,
                    in: dateRange,
                    displayedComponents: displayedComponents
                )
                .datePickerStyle(.wheel)
                .tint(NativeDatePickerStyling.Colors.tint)
                .foregroundStyle(NativeDatePickerStyling.Colors.label)
            }
        }
    }

    // MARK: - Helpers

    private var displayedComponents: DatePickerComponents {
        switch mode {
        case .date:        return .date
        case .time:        return .hourAndMinute
        case .dateAndTime: return [.date, .hourAndMinute]
        }
    }

    private var dateRange: ClosedRange<Date> {
        let min = minimumDate ?? .distantPast
        let max = maximumDate ?? .distantFuture
        return min...max
    }
}

// MARK: - Preview

#Preview {
    @Previewable @State var date = Date()
    @Previewable @State var time = Date()
    @Previewable @State var dateTime = Date()

    ScrollView {
        VStack(alignment: .leading, spacing: 32) {
            Text("Compact (date)").font(.appBodyMediumEm)
            AppDateTimePicker(label: "Birthday", selection: $date)

            Text("Graphical (date)").font(.appBodyMediumEm)
            AppDateTimePicker(label: "Appointment", selection: $dateTime,
                              displayStyle: .graphical)

            Text("Wheel (time)").font(.appBodyMediumEm)
            AppDateTimePicker(label: "Alarm", selection: $time,
                              mode: .time, displayStyle: .wheel)
        }
        .padding()
    }
}
```

**Step 2: Build and verify**

```bash
xcodebuild -project multi-repo-ios/multi-repo-ios.xcodeproj \
  -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  build 2>&1 | grep -E "error:|Build succeeded|BUILD FAILED"
```

**Step 3: Commit**

```bash
git add multi-repo-ios/multi-repo-ios/Components/Native/AppDateTimePicker.swift
git commit -m "feat(ios/native): add AppDateTimePicker — date/time/dateAndTime with compact, graphical, wheel styles"
```

---

## Task 5: AppProgressLoader.swift

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/Native/AppProgressLoader.swift`

**Step 1: Create the file**

```swift
// AppProgressLoader.swift
// Style source: NativeComponentStyling.swift › NativeProgressLoaderStyling
//
// Usage:
//   // Indefinite spinner:
//   AppProgressLoader()
//
//   // Indefinite with label:
//   AppProgressLoader(label: "Loading…")
//
//   // Definite linear bar (0.0 – 1.0):
//   AppProgressLoader(variant: .definite(value: 0.65, total: 1.0))
//
//   // Definite with raw values (e.g. 3 of 10 steps):
//   AppProgressLoader(variant: .definite(value: 3, total: 10), label: "Step 3 of 10")

import SwiftUI

// MARK: - Variant

/// Controls whether the loader is indefinite (spinning) or definite (filled bar).
public enum AppProgressLoaderVariant {
    /// Spinning circular indicator — use when progress is unknown.
    case indefinite

    /// Linear filled bar — use when progress is measurable.
    /// - Parameters:
    ///   - value: Current progress value (must be ≥ 0 and ≤ total).
    ///   - total: The value at which progress is 100%.
    case definite(value: Double, total: Double)
}

// MARK: - AppProgressLoader

/// A styled wrapper around SwiftUI's `ProgressView`.
/// All visual tokens come from `NativeProgressLoaderStyling` in `NativeComponentStyling.swift`.
public struct AppProgressLoader: View {

    // MARK: - Properties

    /// The loader variant — indefinite spinner or definite linear bar.
    var variant: AppProgressLoaderVariant = .indefinite

    /// Optional descriptive label rendered below the spinner or bar.
    var label: String? = nil

    // MARK: - Body

    public var body: some View {
        VStack(spacing: NativeProgressLoaderStyling.Layout.labelSpacing) {
            switch variant {
            case .indefinite:
                ProgressView()
                    .progressViewStyle(.circular)
                    .tint(NativeProgressLoaderStyling.Colors.tint)
                    .scaleEffect(NativeProgressLoaderStyling.Layout.scale)

            case let .definite(value, total):
                ZStack(alignment: .leading) {
                    // Background (inactive) track
                    Capsule()
                        .fill(NativeProgressLoaderStyling.Colors.track)
                        .frame(height: NativeProgressLoaderStyling.Layout.linearTrackHeight)

                    // Active filled track — width proportional to progress
                    GeometryReader { geo in
                        Capsule()
                            .fill(NativeProgressLoaderStyling.Colors.tint)
                            .frame(
                                width: geo.size.width * CGFloat(min(value / total, 1.0)),
                                height: NativeProgressLoaderStyling.Layout.linearTrackHeight
                            )
                    }
                    .frame(height: NativeProgressLoaderStyling.Layout.linearTrackHeight)
                }
            }

            if let label {
                Text(label)
                    .font(NativeProgressLoaderStyling.Typography.label)
                    .foregroundStyle(NativeProgressLoaderStyling.Colors.label)
            }
        }
    }
}

// MARK: - Preview

#Preview {
    VStack(spacing: 40) {
        AppProgressLoader()
        AppProgressLoader(label: "Uploading…")
        AppProgressLoader(variant: .definite(value: 0.4, total: 1.0), label: "40%")
        AppProgressLoader(variant: .definite(value: 7, total: 10), label: "Step 7 of 10")
    }
    .padding()
}
```

**Step 2: Build and verify**

```bash
xcodebuild -project multi-repo-ios/multi-repo-ios.xcodeproj \
  -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  build 2>&1 | grep -E "error:|Build succeeded|BUILD FAILED"
```

**Step 3: Commit**

```bash
git add multi-repo-ios/multi-repo-ios/Components/Native/AppProgressLoader.swift
git commit -m "feat(ios/native): add AppProgressLoader — indefinite spinner and definite linear bar"
```

---

## Task 6: AppColorPicker.swift

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/Native/AppColorPicker.swift`

**Step 1: Create the file**

```swift
// AppColorPicker.swift
// Style source: NativeComponentStyling.swift › NativeColorPickerStyling
//
// Usage:
//   AppColorPicker(label: "Accent Color", selection: $accentColor)
//
//   // With opacity slider:
//   AppColorPicker(label: "Background", selection: $bgColor, supportsOpacity: true)

import SwiftUI

// MARK: - AppColorPicker

/// A styled wrapper around SwiftUI's `ColorPicker`.
/// All visual tokens come from `NativeColorPickerStyling` in `NativeComponentStyling.swift`.
///
/// Note: The color swatch and system color wheel sheet are fully managed by iOS.
/// Only the label font/color and surrounding tint are configurable via public API.
public struct AppColorPicker: View {

    // MARK: - Properties

    /// Label text displayed next to the color swatch trigger button.
    let label: String

    /// The currently selected color. Bind to a `@State` or `@Published` variable.
    @Binding var selection: Color

    /// When true, the system color wheel includes an opacity/alpha slider.
    var supportsOpacity: Bool = false

    // MARK: - Body

    public var body: some View {
        ColorPicker(label, selection: $selection, supportsOpacity: supportsOpacity)
            .font(NativeColorPickerStyling.Typography.label)
            .foregroundStyle(NativeColorPickerStyling.Colors.label)
            .tint(NativeColorPickerStyling.Colors.tint)
    }
}

// MARK: - Preview

#Preview {
    @Previewable @State var color1 = Color.appSurfaceAccentPrimary
    @Previewable @State var color2 = Color.appSurfaceSuccessSolid

    VStack(spacing: 24) {
        AppColorPicker(label: "Accent Color", selection: $color1)
        AppColorPicker(label: "Background (with opacity)", selection: $color2,
                       supportsOpacity: true)
    }
    .padding()
}
```

**Step 2: Build and verify**

```bash
xcodebuild -project multi-repo-ios/multi-repo-ios.xcodeproj \
  -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  build 2>&1 | grep -E "error:|Build succeeded|BUILD FAILED"
```

**Step 3: Commit**

```bash
git add multi-repo-ios/multi-repo-ios/Components/Native/AppColorPicker.swift
git commit -m "feat(ios/native): add AppColorPicker — styled ColorPicker with opacity toggle"
```

---

## Task 7: AppBottomSheet.swift

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/Native/AppBottomSheet.swift`

**Step 1: Create the file**

```swift
// AppBottomSheet.swift
// Style source: NativeComponentStyling.swift › NativeBottomSheetStyling
//
// Usage:
//   // Default detents (.medium, .large):
//   Button("Open Sheet") { showSheet = true }
//       .appBottomSheet(isPresented: $showSheet) {
//           MySheetContent()
//       }
//
//   // Custom detents:
//   someView
//       .appBottomSheet(isPresented: $showSheet, detents: [.fraction(0.4), .large]) {
//           MySheetContent()
//       }

import SwiftUI

// MARK: - AppBottomSheetModifier

/// ViewModifier that presents a bottom sheet with design-token styling.
/// All visual tokens come from `NativeBottomSheetStyling` in `NativeComponentStyling.swift`.
private struct AppBottomSheetModifier<SheetContent: View>: ViewModifier {

    @Binding var isPresented: Bool
    let detents: Set<PresentationDetent>
    @ViewBuilder let sheetContent: () -> SheetContent

    func body(content: Content) -> some View {
        content
            .sheet(isPresented: $isPresented) {
                sheetContent()
                    // Controls which heights the sheet can snap to.
                    // .medium ≈ 50% of screen, .large ≈ 90% of screen.
                    .presentationDetents(detents)
                    // Shows or hides the drag indicator pill at the top.
                    .presentationDragIndicator(NativeBottomSheetStyling.Layout.dragIndicatorVisibility)
                    // Rounds the top corners of the sheet.
                    .presentationCornerRadius(NativeBottomSheetStyling.Layout.cornerRadius)
                    // Background fill of the sheet surface.
                    .presentationBackground(NativeBottomSheetStyling.Colors.sheetBackground)
                    // Padding around sheet content.
                    .padding(.horizontal, NativeBottomSheetStyling.Layout.contentPaddingH)
                    .padding(.top, NativeBottomSheetStyling.Layout.contentPaddingTop)
            }
    }
}

// MARK: - View Extension

extension View {
    /// Presents a styled bottom sheet over the current view.
    ///
    /// - Parameters:
    ///   - isPresented: Binding that controls sheet visibility.
    ///   - detents: The heights the sheet can snap to. Defaults to `[.medium, .large]`.
    ///   - content: The view to render inside the sheet.
    public func appBottomSheet<SheetContent: View>(
        isPresented: Binding<Bool>,
        detents: Set<PresentationDetent> = NativeBottomSheetStyling.Layout.defaultDetents,
        @ViewBuilder content: @escaping () -> SheetContent
    ) -> some View {
        modifier(AppBottomSheetModifier(
            isPresented: isPresented,
            detents: detents,
            sheetContent: content
        ))
    }
}

// MARK: - Preview

#Preview {
    @Previewable @State var show = false

    VStack {
        Button("Open Sheet") { show = true }
            .appBottomSheet(isPresented: $show) {
                VStack(alignment: .leading, spacing: .space4) {
                    Text("Sheet Title").font(.appTitleSmall)
                    Text("Sheet content goes here.")
                        .font(.appBodyMedium)
                        .foregroundStyle(Color.appTextSecondary)
                    Spacer()
                }
            }
    }
}
```

**Step 2: Build and verify**

```bash
xcodebuild -project multi-repo-ios/multi-repo-ios.xcodeproj \
  -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  build 2>&1 | grep -E "error:|Build succeeded|BUILD FAILED"
```

**Step 3: Commit**

```bash
git add multi-repo-ios/multi-repo-ios/Components/Native/AppBottomSheet.swift
git commit -m "feat(ios/native): add AppBottomSheet — sheet ViewModifier with detents and token styling"
```

---

## Task 8: AppActionSheet.swift

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/Native/AppActionSheet.swift`

**Step 1: Create the file**

```swift
// AppActionSheet.swift
// Style source: NativeComponentStyling.swift › NativeActionSheetStyling
//
// Usage:
//   someView.appActionSheet(
//       isPresented: $showActions,
//       title: "Post Options",
//       message: "What would you like to do?",
//       actions: [
//           .default("Edit Post") { editPost() },
//           .destructive("Delete Post") { deletePost() },
//           .cancel()
//       ]
//   )

import SwiftUI

// MARK: - AppActionSheetAction

/// Represents a single button in an action sheet.
public struct AppActionSheetAction {
    let label: String
    let role: ButtonRole?
    let handler: () -> Void

    /// A standard action button (appears in the default system blue color).
    public static func `default`(_ label: String,
                                  handler: @escaping () -> Void) -> AppActionSheetAction {
        AppActionSheetAction(label: label, role: nil, handler: handler)
    }

    /// A destructive action button (iOS renders it in red automatically).
    public static func destructive(_ label: String,
                                    handler: @escaping () -> Void) -> AppActionSheetAction {
        AppActionSheetAction(label: label, role: .destructive, handler: handler)
    }

    /// A cancel button (iOS positions it at the bottom with bold weight).
    public static func cancel(_ label: String = "Cancel",
                               handler: @escaping () -> Void = {}) -> AppActionSheetAction {
        AppActionSheetAction(label: label, role: .cancel, handler: handler)
    }
}

// MARK: - AppActionSheetModifier

/// ViewModifier that presents a confirmationDialog with the provided actions.
private struct AppActionSheetModifier: ViewModifier {

    @Binding var isPresented: Bool
    let title: String
    let message: String?
    let actions: [AppActionSheetAction]

    func body(content: Content) -> some View {
        content
            .confirmationDialog(title, isPresented: $isPresented, titleVisibility: .visible) {
                ForEach(Array(actions.enumerated()), id: \.offset) { _, action in
                    Button(role: action.role, action: action.handler) {
                        Text(action.label)
                    }
                }
            } message: {
                if let message {
                    Text(message)
                        .font(NativeActionSheetStyling.Typography.message)
                }
            }
    }
}

// MARK: - View Extension

extension View {
    /// Presents a styled action sheet (confirmationDialog) over the current view.
    ///
    /// - Parameters:
    ///   - isPresented: Binding that controls visibility.
    ///   - title:       The bold title shown at the top of the action sheet.
    ///   - message:     Optional secondary message shown below the title.
    ///   - actions:     The array of actions to show. Always include a `.cancel()` action.
    public func appActionSheet(
        isPresented: Binding<Bool>,
        title: String,
        message: String? = nil,
        actions: [AppActionSheetAction]
    ) -> some View {
        modifier(AppActionSheetModifier(
            isPresented: isPresented,
            title: title,
            message: message,
            actions: actions
        ))
    }
}

// MARK: - Preview

#Preview {
    @Previewable @State var show = false

    Button("Show Action Sheet") { show = true }
        .appActionSheet(
            isPresented: $show,
            title: "Post Options",
            message: "Choose an action for this post.",
            actions: [
                .default("Edit")    { },
                .destructive("Delete") { },
                .cancel()
            ]
        )
}
```

**Step 2: Build and verify**

```bash
xcodebuild -project multi-repo-ios/multi-repo-ios.xcodeproj \
  -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  build 2>&1 | grep -E "error:|Build succeeded|BUILD FAILED"
```

**Step 3: Commit**

```bash
git add multi-repo-ios/multi-repo-ios/Components/Native/AppActionSheet.swift
git commit -m "feat(ios/native): add AppActionSheet — confirmationDialog wrapper with destructive/cancel roles"
```

---

## Task 9: AppAlertPopup.swift

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/Native/AppAlertPopup.swift`

**Step 1: Create the file**

```swift
// AppAlertPopup.swift
// Style source: NativeComponentStyling.swift › NativeAlertStyling
//
// Usage:
//   someView.appAlert(
//       isPresented: $showAlert,
//       title: "Delete Item?",
//       message: "This action cannot be undone.",
//       buttons: [
//           .destructive("Delete") { deleteItem() },
//           .cancel()
//       ]
//   )
//
//   // Simple confirmation:
//   someView.appAlert(isPresented: $showConfirm, title: "Saved!",
//                     buttons: [.default("OK")])

import SwiftUI

// MARK: - AppAlertButton

/// Represents a single button in an alert popup.
public struct AppAlertButton {
    let label: String
    let role: ButtonRole?
    let handler: () -> Void

    /// Standard alert button (appears in system blue).
    public static func `default`(_ label: String,
                                  handler: @escaping () -> Void = {}) -> AppAlertButton {
        AppAlertButton(label: label, role: nil, handler: handler)
    }

    /// Destructive alert button (iOS renders it in red automatically).
    public static func destructive(_ label: String,
                                    handler: @escaping () -> Void) -> AppAlertButton {
        AppAlertButton(label: label, role: .destructive, handler: handler)
    }

    /// Cancel button (iOS renders it bold and positions it at the bottom).
    public static func cancel(_ label: String = "Cancel",
                               handler: @escaping () -> Void = {}) -> AppAlertButton {
        AppAlertButton(label: label, role: .cancel, handler: handler)
    }
}

// MARK: - AppAlertModifier

/// ViewModifier that presents a system alert with the provided buttons.
private struct AppAlertModifier: ViewModifier {

    @Binding var isPresented: Bool
    let title: String
    let message: String?
    let buttons: [AppAlertButton]

    func body(content: Content) -> some View {
        content
            .alert(title, isPresented: $isPresented) {
                ForEach(Array(buttons.enumerated()), id: \.offset) { _, button in
                    Button(button.label, role: button.role, action: button.handler)
                }
            } message: {
                if let message {
                    Text(message)
                        .font(NativeAlertStyling.Typography.message)
                }
            }
    }
}

// MARK: - View Extension

extension View {
    /// Presents a styled system alert over the current view.
    ///
    /// - Parameters:
    ///   - isPresented: Binding that controls alert visibility.
    ///   - title:       The bold alert title.
    ///   - message:     Optional descriptive message below the title.
    ///   - buttons:     The alert buttons. Defaults to a single `.cancel()` dismiss button.
    public func appAlert(
        isPresented: Binding<Bool>,
        title: String,
        message: String? = nil,
        buttons: [AppAlertButton] = [.cancel()]
    ) -> some View {
        modifier(AppAlertModifier(
            isPresented: isPresented,
            title: title,
            message: message,
            buttons: buttons
        ))
    }
}

// MARK: - Preview

#Preview {
    @Previewable @State var showDelete = false
    @Previewable @State var showConfirm = false

    VStack(spacing: 20) {
        Button("Delete Alert")  { showDelete = true }
            .appAlert(
                isPresented: $showDelete,
                title: "Delete Item?",
                message: "This action cannot be undone.",
                buttons: [
                    .destructive("Delete") { },
                    .cancel()
                ]
            )

        Button("Confirm Alert") { showConfirm = true }
            .appAlert(
                isPresented: $showConfirm,
                title: "Changes Saved",
                buttons: [.default("OK")]
            )
    }
}
```

**Step 2: Build and verify**

```bash
xcodebuild -project multi-repo-ios/multi-repo-ios.xcodeproj \
  -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  build 2>&1 | grep -E "error:|Build succeeded|BUILD FAILED"
```

**Step 3: Commit**

```bash
git add multi-repo-ios/multi-repo-ios/Components/Native/AppAlertPopup.swift
git commit -m "feat(ios/native): add AppAlertPopup — .alert wrapper with typed button roles"
```

---

## Task 10: AppContextMenu.swift

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/Native/AppContextMenu.swift`

**Step 1: Create the file**

```swift
// AppContextMenu.swift
// Style source: NativeComponentStyling.swift › NativeContextMenuStyling
//
// Two components in this file:
//
//   1. appContextMenu(items:) — long-press .contextMenu modifier
//      someView.appContextMenu(items: [
//          .item("Edit", systemImage: "pencil") { edit() },
//          .destructive("Delete", systemImage: "trash") { delete() }
//      ])
//
//   2. AppPopoverMenu — tap-triggered popover with custom card
//      AppPopoverMenu(isPresented: $showMenu, items: [...]) {
//          Image(systemName: "ellipsis")
//      }

import SwiftUI

// MARK: - AppContextMenuItem

/// Represents a single item in a context menu or popover menu.
public struct AppContextMenuItem {
    let label: String
    let systemImage: String?    // SF Symbol name, e.g. "pencil", "trash"
    let role: ButtonRole?
    let handler: () -> Void

    /// A standard menu item. Renders in the default text color.
    public static func item(_ label: String,
                             systemImage: String? = nil,
                             handler: @escaping () -> Void) -> AppContextMenuItem {
        AppContextMenuItem(label: label, systemImage: systemImage, role: nil, handler: handler)
    }

    /// A destructive menu item. iOS .contextMenu renders it red automatically.
    /// AppPopoverMenu uses NativeContextMenuStyling.Colors.destructiveText explicitly.
    public static func destructive(_ label: String,
                                    systemImage: String? = nil,
                                    handler: @escaping () -> Void) -> AppContextMenuItem {
        AppContextMenuItem(label: label, systemImage: systemImage, role: .destructive, handler: handler)
    }
}

// MARK: - appContextMenu ViewModifier

/// Attaches a long-press .contextMenu to the view.
private struct AppContextMenuModifier: ViewModifier {
    let items: [AppContextMenuItem]

    func body(content: Content) -> some View {
        content.contextMenu {
            ForEach(Array(items.enumerated()), id: \.offset) { _, item in
                Button(role: item.role, action: item.handler) {
                    if let systemImage = item.systemImage {
                        Label(item.label, systemImage: systemImage)
                    } else {
                        Text(item.label)
                    }
                }
            }
        }
    }
}

extension View {
    /// Attaches a long-press context menu to the view.
    /// iOS styles and positions the menu automatically.
    public func appContextMenu(items: [AppContextMenuItem]) -> some View {
        modifier(AppContextMenuModifier(items: items))
    }
}

// MARK: - AppPopoverMenu

/// A tap-triggered popover menu with a custom-styled card.
/// Use instead of .contextMenu when you need a button-triggered (not long-press) menu.
///
/// - Parameters:
///   - isPresented: Binding that controls popover visibility.
///   - items:       The menu items to display.
///   - label:       The view that acts as the menu trigger (e.g. an ellipsis icon button).
public struct AppPopoverMenu<Label: View>: View {

    @Binding var isPresented: Bool
    let items: [AppContextMenuItem]
    @ViewBuilder let label: () -> Label

    public var body: some View {
        Button { isPresented = true } label: { label() }
            .popover(isPresented: $isPresented) {
                VStack(alignment: .leading, spacing: 0) {
                    ForEach(Array(items.enumerated()), id: \.offset) { index, item in
                        Button(role: item.role) {
                            item.handler()
                            isPresented = false
                        } label: {
                            HStack(spacing: NativeContextMenuStyling.Layout.itemIconSpacing) {
                                if let systemImage = item.systemImage {
                                    Image(systemName: systemImage)
                                        .foregroundStyle(item.role == .destructive
                                            ? NativeContextMenuStyling.Colors.destructiveText
                                            : NativeContextMenuStyling.Colors.itemText)
                                }
                                Text(item.label)
                                    .font(NativeContextMenuStyling.Typography.item)
                                    .foregroundStyle(item.role == .destructive
                                        ? NativeContextMenuStyling.Colors.destructiveText
                                        : NativeContextMenuStyling.Colors.itemText)
                                Spacer()
                            }
                            .padding(.horizontal, NativeContextMenuStyling.Layout.itemPaddingH)
                            .padding(.vertical, NativeContextMenuStyling.Layout.itemPaddingV)
                        }
                        .buttonStyle(.plain)

                        // Divider between rows, but not after the last row
                        if index < items.count - 1 {
                            Divider()
                                .overlay(NativeContextMenuStyling.Colors.rowDivider)
                        }
                    }
                }
                .frame(minWidth: NativeContextMenuStyling.Layout.minWidth)
                .background(NativeContextMenuStyling.Colors.background)
                .clipShape(RoundedRectangle(cornerRadius: NativeContextMenuStyling.Layout.cornerRadius))
                // Prevents the popover expanding to a sheet on compact size classes
                .presentationCompactAdaptation(.popover)
            }
    }
}

// MARK: - Preview

#Preview {
    @Previewable @State var showPopover = false

    VStack(spacing: 32) {
        // Long-press context menu
        Text("Long-press me")
            .padding()
            .background(Color.appSurfaceBaseLowContrast, in: RoundedRectangle(cornerRadius: .radiusMD))
            .appContextMenu(items: [
                .item("Edit", systemImage: "pencil") { },
                .item("Share", systemImage: "square.and.arrow.up") { },
                .destructive("Delete", systemImage: "trash") { }
            ])

        // Tap-triggered popover menu
        AppPopoverMenu(isPresented: $showPopover, items: [
            .item("Edit", systemImage: "pencil") { },
            .destructive("Delete", systemImage: "trash") { }
        ]) {
            Image(systemName: "ellipsis.circle")
                .font(.title2)
                .foregroundStyle(Color.appIconPrimary)
        }
    }
    .padding()
}
```

**Step 2: Build and verify**

```bash
xcodebuild -project multi-repo-ios/multi-repo-ios.xcodeproj \
  -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  build 2>&1 | grep -E "error:|Build succeeded|BUILD FAILED"
```

**Step 3: Commit**

```bash
git add multi-repo-ios/multi-repo-ios/Components/Native/AppContextMenu.swift
git commit -m "feat(ios/native): add AppContextMenu — long-press contextMenu modifier + AppPopoverMenu tap-triggered card"
```

---

## Task 11: AppPageHeader.swift

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/Native/AppPageHeader.swift`

**Step 1: Create the file**

```swift
// AppPageHeader.swift
// Style source: NativeComponentStyling.swift › NativePageHeaderStyling
//
// This is a ViewModifier applied INSIDE a NavigationStack view body.
// The caller owns the NavigationStack — this modifier just configures the bar.
//
// Usage:
//   NavigationStack {
//       MyContentView()
//           .appPageHeader(title: "Home")
//
//       // Inline title with trailing button:
//       MyContentView()
//           .appPageHeader(title: "Settings", displayMode: .inline,
//                          trailingActions: [AnyView(Button("Edit") { })])
//   }

import SwiftUI

// MARK: - Display Mode

/// Controls whether the navigation title is large (collapsing) or inline (fixed).
public enum AppPageHeaderDisplayMode {
    /// Large title shown below the nav bar, collapses to inline on scroll.
    case large
    /// Small title always shown inside the nav bar (no collapsing).
    case inline
}

// MARK: - AppPageHeaderModifier

/// ViewModifier that configures the NavigationStack's toolbar with design-token styling.
/// All visual tokens come from `NativePageHeaderStyling` in `NativeComponentStyling.swift`.
public struct AppPageHeaderModifier: ViewModifier {

    // MARK: - Properties

    /// The navigation title text.
    let title: String

    /// Whether the title is large-collapsing or always-inline.
    var displayMode: AppPageHeaderDisplayMode = .large

    /// Views rendered in the trailing (right) toolbar slot.
    /// Wrap each view in `AnyView(...)` at the call site.
    var trailingActions: [AnyView] = []

    // MARK: - Body

    public func body(content: Content) -> some View {
        content
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(displayMode == .large ? .large : .inline)
            // Fill the navigation bar with the token background color
            .toolbarBackground(NativePageHeaderStyling.Colors.background, for: .navigationBar)
            // Force the background to always be visible (even when content scrolls under)
            .toolbarBackground(.visible, for: .navigationBar)
            // Tints back button chevron + any ToolbarItem buttons with this color
            .tint(NativePageHeaderStyling.Colors.tint)
            .toolbar {
                if !trailingActions.isEmpty {
                    ToolbarItemGroup(placement: .topBarTrailing) {
                        ForEach(Array(trailingActions.enumerated()), id: \.offset) { _, view in
                            view
                        }
                    }
                }
            }
    }
}

// MARK: - View Extension

extension View {
    /// Configures the enclosing NavigationStack's bar with design-token styling.
    ///
    /// Must be applied to a view that is inside a `NavigationStack`.
    ///
    /// - Parameters:
    ///   - title:           The navigation title string.
    ///   - displayMode:     `.large` (collapsing) or `.inline` (fixed). Defaults to `.large`.
    ///   - trailingActions: Views rendered in the trailing toolbar slot.
    ///                      Wrap each in `AnyView(...)`.
    public func appPageHeader(
        title: String,
        displayMode: AppPageHeaderDisplayMode = .large,
        trailingActions: [AnyView] = []
    ) -> some View {
        modifier(AppPageHeaderModifier(
            title: title,
            displayMode: displayMode,
            trailingActions: trailingActions
        ))
    }
}

// MARK: - Preview

#Preview("Large Title") {
    NavigationStack {
        List {
            ForEach(1...20, id: \.self) { i in
                Text("Row \(i)")
            }
        }
        .appPageHeader(
            title: "Home",
            trailingActions: [
                AnyView(Button { } label: { Image(systemName: "bell") }),
                AnyView(Button { } label: { Image(systemName: "person.circle") })
            ]
        )
    }
}

#Preview("Inline Title") {
    NavigationStack {
        List {
            ForEach(1...10, id: \.self) { i in Text("Row \(i)") }
        }
        .appPageHeader(title: "Settings", displayMode: .inline)
    }
}
```

**Step 2: Build and verify**

```bash
xcodebuild -project multi-repo-ios/multi-repo-ios.xcodeproj \
  -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  build 2>&1 | grep -E "error:|Build succeeded|BUILD FAILED"
```

**Step 3: Commit**

```bash
git add multi-repo-ios/multi-repo-ios/Components/Native/AppPageHeader.swift
git commit -m "feat(ios/native): add AppPageHeader — NavigationStack toolbar modifier with large/inline variants"
```

---

## Task 12: AppBottomNavBar.swift + wire appearance at startup

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/Native/AppBottomNavBar.swift`
- Modify: `multi-repo-ios/multi-repo-ios/multi_repo_iosApp.swift`

**Step 1: Create AppBottomNavBar.swift**

```swift
// AppBottomNavBar.swift
// Style source: NativeComponentStyling.swift › NativeBottomNavStyling
//
// IMPORTANT: Call NativeBottomNavStyling.applyAppearance() once in
//            multi_repo_iosApp.init() so UIKit picks up the styles before
//            any TabView renders. This is already done in multi_repo_iosApp.swift.
//
// Usage:
//   @State private var tab = 0
//
//   AppBottomNavBar(selectedTab: $tab) {
//       HomeView()
//           .tabItem { Label("Home", systemImage: "house") }
//           .tag(0)
//       SearchView()
//           .tabItem { Label("Search", systemImage: "magnifyingglass") }
//           .tag(1)
//       ProfileView()
//           .tabItem { Label("Profile", systemImage: "person") }
//           .tag(2)
//   }
//
//   // With badge on a tab item:
//   NotificationsView()
//       .tabItem { Label("Alerts", systemImage: "bell") }
//       .tag(3)
//       .badge(5)   ← standard SwiftUI .badge() modifier

import SwiftUI

// MARK: - AppBottomNavBar

/// A styled wrapper around SwiftUI's `TabView`.
/// Tab bar appearance (colors, fonts) is applied globally via UIKit in
/// `NativeBottomNavStyling.applyAppearance()` — called once at app startup.
///
/// Each tab child view must use SwiftUI's standard `.tabItem { Label(...) }` modifier.
public struct AppBottomNavBar<Content: View>: View {

    // MARK: - Properties

    /// The index of the currently selected tab. Bind to a `@State` variable.
    @Binding var selectedTab: Int

    /// The tab content views, each decorated with `.tabItem {}` and `.tag(N)`.
    let content: Content

    // MARK: - Init

    public init(selectedTab: Binding<Int>, @ViewBuilder content: () -> Content) {
        self._selectedTab = selectedTab
        self.content = content()
    }

    // MARK: - Body

    public var body: some View {
        TabView(selection: $selectedTab) {
            content
        }
        // TabView itself has no additional styling here.
        // All color/font customization is in NativeBottomNavStyling.applyAppearance().
        // To change the bar style, edit NativeBottomNavStyling in NativeComponentStyling.swift.
    }
}

// MARK: - Preview

#Preview {
    @Previewable @State var tab = 0

    AppBottomNavBar(selectedTab: $tab) {
        Text("Home").tabItem { Label("Home", systemImage: "house") }.tag(0)
        Text("Search").tabItem { Label("Search", systemImage: "magnifyingglass") }.tag(1)
        Text("Alerts").tabItem { Label("Alerts", systemImage: "bell") }.tag(2).badge(3)
        Text("Profile").tabItem { Label("Profile", systemImage: "person") }.tag(3)
    }
}
```

**Step 2: Wire appearance into app entry point**

In `multi-repo-ios/multi-repo-ios/multi_repo_iosApp.swift`, add an `init()` that calls `NativeBottomNavStyling.applyAppearance()`:

```swift
// multi_repo_iosApp.swift

import SwiftUI

@main
struct multi_repo_iosApp: App {

    init() {
        // Apply UITabBar appearance tokens before any TabView renders.
        // All color/font values are configured in NativeComponentStyling.swift
        // under NativeBottomNavStyling.
        NativeBottomNavStyling.applyAppearance()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

**Step 3: Build and verify**

```bash
xcodebuild -project multi-repo-ios/multi-repo-ios.xcodeproj \
  -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  build 2>&1 | grep -E "error:|Build succeeded|BUILD FAILED"
```

**Step 4: Commit**

```bash
git add multi-repo-ios/multi-repo-ios/Components/Native/AppBottomNavBar.swift
git add multi-repo-ios/multi-repo-ios/multi_repo_iosApp.swift
git commit -m "feat(ios/native): add AppBottomNavBar — styled TabView with UIKit appearance applied at startup"
```

---

## Task 13: AppCarousel.swift

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/Native/AppCarousel.swift`

**Step 1: Create the file**

```swift
// AppCarousel.swift
// Style source: NativeComponentStyling.swift › NativeCarouselStyling
//
// Two carousel styles supported:
//   .paged     — Full-width pages via TabView + .tabViewStyle(.page)
//   .scrollSnap — Card-width snap via ScrollView + .scrollTargetBehavior(.paging)
//
// Usage:
//   struct Card: Identifiable { let id: Int; let color: Color }
//   let cards = [Card(id: 0, color: .red), Card(id: 1, color: .blue)]
//
//   // Full-width paged:
//   AppCarousel(items: cards) { card in
//       RoundedRectangle(cornerRadius: 12).fill(card.color)
//   }
//
//   // Card-width snap (showDots: false):
//   AppCarousel(items: cards, style: .scrollSnap, showDots: false) { card in
//       RoundedRectangle(cornerRadius: 12).fill(card.color).frame(width: 280)
//   }

import SwiftUI

// MARK: - Carousel Style

/// Controls the layout and interaction mode of the carousel.
public enum AppCarouselStyle {
    /// Full-width swiping pages using TabView with .page style.
    case paged
    /// Card-width snapping using ScrollView with .scrollTargetBehavior(.paging).
    case scrollSnap
}

// MARK: - AppCarousel

/// A styled carousel component with animated dot indicators.
/// All visual tokens come from `NativeCarouselStyling` in `NativeComponentStyling.swift`.
public struct AppCarousel<Item: Identifiable, Content: View>: View {

    // MARK: - Properties

    let items: [Item]
    var style: AppCarouselStyle = .paged
    var showDots: Bool = true
    @ViewBuilder let content: (Item) -> Content

    @State private var currentPage: Int = 0

    // MARK: - Body

    public var body: some View {
        VStack(spacing: NativeCarouselStyling.Layout.dotsSpacing) {
            switch style {
            case .paged:
                TabView(selection: $currentPage) {
                    ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                        content(item)
                            .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .frame(height: NativeCarouselStyling.Layout.pagedHeight)

            case .scrollSnap:
                ScrollView(.horizontal, showsIndicators: false) {
                    LazyHStack(spacing: NativeCarouselStyling.Layout.cardSpacing) {
                        ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                            content(item)
                                .containerRelativeFrame(.horizontal)
                                .id(index)
                        }
                    }
                    .scrollTargetLayout()
                }
                .scrollTargetBehavior(.paging)
                .scrollPosition(id: Binding(
                    get: { currentPage },
                    set: { currentPage = $0 ?? 0 }
                ))
            }

            if showDots && items.count > 1 {
                AppCarouselDots(count: items.count, currentPage: $currentPage)
            }
        }
    }
}

// MARK: - AppCarouselDots

/// Animated pill-style dot indicators for AppCarousel.
/// The active dot expands to a wider capsule; inactive dots are small circles.
public struct AppCarouselDots: View {

    let count: Int
    @Binding var currentPage: Int

    public var body: some View {
        HStack(spacing: NativeCarouselStyling.Layout.dotGap) {
            ForEach(0..<count, id: \.self) { index in
                let isActive = index == currentPage
                Capsule()
                    .fill(isActive
                        ? NativeCarouselStyling.Colors.dotActive
                        : NativeCarouselStyling.Colors.dotInactive)
                    .frame(
                        width: isActive
                            ? NativeCarouselStyling.Layout.dotActiveWidth
                            : NativeCarouselStyling.Layout.dotInactiveWidth,
                        height: NativeCarouselStyling.Layout.dotHeight
                    )
                    .animation(.spring(duration: 0.3), value: currentPage)
                    // Tapping a dot jumps to that page
                    .onTapGesture { currentPage = index }
            }
        }
        .padding(NativeCarouselStyling.Layout.dotGap)
        .background(NativeCarouselStyling.Colors.dotRowBackground)
    }
}

// MARK: - Preview

private struct PreviewCard: Identifiable {
    let id: Int
    let color: Color
}

#Preview {
    let cards = [
        PreviewCard(id: 0, color: Color.appSurfaceAccentPrimary),
        PreviewCard(id: 1, color: Color.appSurfaceSuccessSolid),
        PreviewCard(id: 2, color: Color.appSurfaceErrorSolid),
    ]

    VStack(spacing: 40) {
        Text("Paged").font(.appBodyMediumEm)
        AppCarousel(items: cards) { card in
            RoundedRectangle(cornerRadius: .radiusLG)
                .fill(card.color)
                .padding(.horizontal, .space4)
        }

        Text("Scroll Snap").font(.appBodyMediumEm)
        AppCarousel(items: cards, style: .scrollSnap) { card in
            RoundedRectangle(cornerRadius: .radiusLG)
                .fill(card.color)
                .frame(width: 280, height: 160)
        }
    }
    .padding()
}
```

**Step 2: Build and verify**

```bash
xcodebuild -project multi-repo-ios/multi-repo-ios.xcodeproj \
  -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  build 2>&1 | grep -E "error:|Build succeeded|BUILD FAILED"
```

**Step 3: Commit**

```bash
git add multi-repo-ios/multi-repo-ios/Components/Native/AppCarousel.swift
git commit -m "feat(ios/native): add AppCarousel — paged and scroll-snap variants with animated dot indicators"
```

---

## Task 14: AppTooltip.swift

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/Native/AppTooltip.swift`

**Step 1: Create the file**

```swift
// AppTooltip.swift
// Style source: NativeComponentStyling.swift › NativeTooltipStyling
//
// SwiftUI has no dedicated tooltip API on iOS. This component uses .popover()
// with .presentationCompactAdaptation(.popover) to render a small bubble
// instead of a full sheet on compact size classes (iPhones).
//
// Usage:
//   @State var showTip = false
//
//   AppTooltip(isPresented: $showTip, tipText: "Tap to like this post") {
//       Image(systemName: "heart")
//           .onTapGesture { showTip.toggle() }
//   }
//
//   // Custom arrow edge (default is .top → bubble appears below anchor):
//   AppTooltip(isPresented: $showTip, tipText: "Bold text",
//              arrowEdge: .bottom) {
//       Button("B") { showTip.toggle() }
//   }
//
//   // Rich tip content (pass any View as tipContent):
//   AppTooltip(isPresented: $showTip) {
//       someAnchorView
//   } tipContent: {
//       VStack { Text("Title").bold(); Text("Detail") }
//   }

import SwiftUI

// MARK: - AppTooltip

/// A tooltip component built on `.popover()`.
/// All visual tokens come from `NativeTooltipStyling` in `NativeComponentStyling.swift`.
///
/// On iPhone (compact width), `.presentationCompactAdaptation(.popover)` keeps the
/// tooltip as a small popover instead of expanding to a full sheet.
public struct AppTooltip<Label: View, TipContent: View>: View {

    // MARK: - Properties

    @Binding var isPresented: Bool

    /// The edge from which the popover arrow points toward the anchor view.
    var arrowEdge: Edge = NativeTooltipStyling.Layout.defaultArrowEdge

    /// The anchor view that the tooltip appears near.
    @ViewBuilder let label: () -> Label

    /// The content shown inside the tooltip bubble.
    @ViewBuilder let tipContent: () -> TipContent

    // MARK: - Body

    public var body: some View {
        label()
            .popover(isPresented: $isPresented, arrowEdge: arrowEdge) {
                tipContent()
                    .font(NativeTooltipStyling.Typography.content)
                    .foregroundStyle(NativeTooltipStyling.Colors.text)
                    .padding(.horizontal, NativeTooltipStyling.Layout.paddingH)
                    .padding(.vertical, NativeTooltipStyling.Layout.paddingV)
                    .frame(maxWidth: NativeTooltipStyling.Layout.maxWidth)
                    .background(NativeTooltipStyling.Colors.background,
                                in: RoundedRectangle(cornerRadius: NativeTooltipStyling.Layout.cornerRadius))
                    // Keeps this as a popover bubble on iPhone, not a full sheet
                    .presentationCompactAdaptation(.popover)
            }
    }
}

// MARK: - Convenience Initialiser (plain text tip)

extension AppTooltip where TipContent == Text {
    /// Convenience init for plain-text tooltips — no need to build a content closure.
    public init(isPresented: Binding<Bool>,
                tipText: String,
                arrowEdge: Edge = NativeTooltipStyling.Layout.defaultArrowEdge,
                @ViewBuilder label: @escaping () -> Label) {
        self._isPresented = isPresented
        self.arrowEdge = arrowEdge
        self.label = label
        self.tipContent = { Text(tipText) }
    }
}

// MARK: - Preview

#Preview {
    @Previewable @State var show1 = false
    @Previewable @State var show2 = false

    VStack(spacing: 40) {
        AppTooltip(isPresented: $show1, tipText: "Tap the heart to like this post") {
            Image(systemName: "heart")
                .font(.title)
                .foregroundStyle(Color.appIconPrimary)
                .onTapGesture { show1.toggle() }
        }

        AppTooltip(isPresented: $show2, arrowEdge: .bottom) {
            Button("Hover me") { show2.toggle() }
        } tipContent: {
            VStack(alignment: .leading, spacing: 4) {
                Text("Pro Tip").bold()
                Text("Hold to see more options.")
            }
        }
    }
    .padding()
}
```

**Step 2: Build and verify**

```bash
xcodebuild -project multi-repo-ios/multi-repo-ios.xcodeproj \
  -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  build 2>&1 | grep -E "error:|Build succeeded|BUILD FAILED"
```

**Step 3: Commit**

```bash
git add multi-repo-ios/multi-repo-ios/Components/Native/AppTooltip.swift
git commit -m "feat(ios/native): add AppTooltip — popover-based tooltip with plain text and rich content support"
```

---

## Task 15: AppRangeSlider.swift

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/Native/AppRangeSlider.swift`

**Step 1: Create the file**

```swift
// AppRangeSlider.swift
// Style source: NativeComponentStyling.swift › NativeRangeSliderStyling
//
// SwiftUI has no native range slider. This implementation stacks two invisible
// Slider views in a ZStack and draws a custom active track rectangle between
// the lower and upper thumb positions using GeometryReader.
//
// How it works:
//   • Lower Slider: range from [range.lowerBound ... upperValue - minDistance]
//   • Upper Slider: range from [lowerValue + minDistance ... range.upperBound]
//   • Both Sliders have .tint(.clear) to hide their native filled track
//   • A custom Rectangle is positioned between lowerValue and upperValue thumbs
//
// Usage:
//   @State var low  = 20.0
//   @State var high = 80.0
//
//   AppRangeSlider(lowerValue: $low, upperValue: $high, range: 0...100)
//
//   // With step and labels:
//   AppRangeSlider(lowerValue: $low, upperValue: $high, range: 0...100,
//                  step: 5, showLabels: true)

import SwiftUI

// MARK: - AppRangeSlider

/// A range slider with lower and upper bound thumb handles.
/// All visual tokens come from `NativeRangeSliderStyling` in `NativeComponentStyling.swift`.
public struct AppRangeSlider: View {

    // MARK: - Properties

    /// The current minimum (left thumb) value. Bind to a `@State` variable.
    @Binding var lowerValue: Double

    /// The current maximum (right thumb) value. Bind to a `@State` variable.
    @Binding var upperValue: Double

    /// The full selectable range (e.g. 0...100).
    let range: ClosedRange<Double>

    /// Discrete step interval. Pass 0 for continuous (no snapping).
    var step: Double = 0

    /// When true, renders formatted min/max values below the slider ends.
    var showLabels: Bool = false

    /// Minimum distance between lowerValue and upperValue.
    /// Prevents the two thumbs from occupying the same position.
    private var minDistance: Double { step > 0 ? step : 0.001 }

    // MARK: - Body

    public var body: some View {
        VStack(spacing: NativeRangeSliderStyling.Layout.labelSpacing) {
            GeometryReader { geometry in
                let width = geometry.size.width

                ZStack(alignment: .leading) {
                    // ── Background (inactive) track
                    Capsule()
                        .fill(NativeRangeSliderStyling.Colors.trackBackground)
                        .frame(height: NativeRangeSliderStyling.Layout.trackHeight)

                    // ── Active track segment between lower and upper thumbs
                    Capsule()
                        .fill(NativeRangeSliderStyling.Colors.trackActive)
                        .frame(
                            width: activeWidth(in: width),
                            height: NativeRangeSliderStyling.Layout.trackHeight
                        )
                        .offset(x: lowerOffset(in: width))

                    // ── Lower thumb Slider (invisible track, visible thumb)
                    //    Range clamped so lower cannot exceed upper - minDistance
                    Slider(
                        value: $lowerValue,
                        in: range.lowerBound...(upperValue - minDistance),
                        step: step > 0 ? step : 0.001
                    )
                    // Clear tint hides the native filled track; only the white thumb remains
                    .tint(.clear)
                    .onChange(of: lowerValue) { _, new in
                        // Safety clamp — prevents floating point edge cases
                        if new > upperValue - minDistance {
                            lowerValue = upperValue - minDistance
                        }
                    }

                    // ── Upper thumb Slider (invisible track, visible thumb)
                    //    Range clamped so upper cannot go below lower + minDistance
                    Slider(
                        value: $upperValue,
                        in: (lowerValue + minDistance)...range.upperBound,
                        step: step > 0 ? step : 0.001
                    )
                    .tint(.clear)
                    .onChange(of: upperValue) { _, new in
                        if new < lowerValue + minDistance {
                            upperValue = lowerValue + minDistance
                        }
                    }
                }
                // Total height must be ≥ 44pt for accessibility minimum touch target
                .frame(height: NativeRangeSliderStyling.Layout.totalHeight)
            }
            .frame(height: NativeRangeSliderStyling.Layout.totalHeight)

            // ── Optional min/max labels
            if showLabels {
                HStack {
                    Text(formatted(lowerValue))
                        .font(NativeRangeSliderStyling.Typography.boundLabel)
                        .foregroundStyle(NativeRangeSliderStyling.Colors.label)
                    Spacer()
                    Text(formatted(upperValue))
                        .font(NativeRangeSliderStyling.Typography.boundLabel)
                        .foregroundStyle(NativeRangeSliderStyling.Colors.label)
                }
            }
        }
    }

    // MARK: - Helpers

    /// X offset of the active track's left edge (where the lower thumb sits).
    private func lowerOffset(in width: CGFloat) -> CGFloat {
        let ratio = (lowerValue - range.lowerBound) / (range.upperBound - range.lowerBound)
        return CGFloat(ratio) * width
    }

    /// Width of the active track segment between lower and upper thumbs.
    private func activeWidth(in width: CGFloat) -> CGFloat {
        let lowerRatio = (lowerValue - range.lowerBound) / (range.upperBound - range.lowerBound)
        let upperRatio = (upperValue - range.lowerBound) / (range.upperBound - range.lowerBound)
        return CGFloat(upperRatio - lowerRatio) * width
    }

    /// Formats a Double value for the min/max label — integers show without decimal.
    private func formatted(_ value: Double) -> String {
        value.truncatingRemainder(dividingBy: 1) == 0
            ? String(Int(value))
            : String(format: "%.1f", value)
    }
}

// MARK: - Preview

#Preview {
    @Previewable @State var low  = 20.0
    @Previewable @State var high = 80.0
    @Previewable @State var low2 = 0.0
    @Previewable @State var high2 = 50.0

    VStack(spacing: 40) {
        VStack(alignment: .leading, spacing: 8) {
            Text("Continuous").font(.appBodyMediumEm)
            AppRangeSlider(lowerValue: $low, upperValue: $high, range: 0...100,
                           showLabels: true)
        }

        VStack(alignment: .leading, spacing: 8) {
            Text("Step 10").font(.appBodyMediumEm)
            AppRangeSlider(lowerValue: $low2, upperValue: $high2, range: 0...100,
                           step: 10, showLabels: true)
        }
    }
    .padding()
}
```

**Step 2: Build and verify**

```bash
xcodebuild -project multi-repo-ios/multi-repo-ios.xcodeproj \
  -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  build 2>&1 | grep -E "error:|Build succeeded|BUILD FAILED"
```

**Step 3: Commit**

```bash
git add multi-repo-ios/multi-repo-ios/Components/Native/AppRangeSlider.swift
git commit -m "feat(ios/native): add AppRangeSlider — dual-thumb range slider with custom active track"
```

---

## Task 16: Clean up .gitkeep + final verification

**Step 1: Remove .gitkeep now that real files exist**

```bash
rm multi-repo-ios/multi-repo-ios/Components/Native/.gitkeep
```

**Step 2: Confirm all 14 files exist**

```bash
ls multi-repo-ios/multi-repo-ios/Components/Native/
```

Expected output (13 files):
```
AppActionSheet.swift
AppAlertPopup.swift
AppBottomNavBar.swift
AppBottomSheet.swift
AppCarousel.swift
AppColorPicker.swift
AppContextMenu.swift
AppDateTimePicker.swift
AppNativePicker.swift
AppPageHeader.swift
AppProgressLoader.swift
AppRangeSlider.swift
AppTooltip.swift
```

Also confirm the styling file:
```bash
ls multi-repo-ios/multi-repo-ios/NativeComponentStyling.swift
```

**Step 3: Final clean build**

```bash
xcodebuild -project multi-repo-ios/multi-repo-ios.xcodeproj \
  -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  build 2>&1 | grep -E "error:|Build succeeded|BUILD FAILED"
```

Expected: `** BUILD SUCCEEDED **` with zero errors.

**Step 4: Final commit**

```bash
git rm multi-repo-ios/multi-repo-ios/Components/Native/.gitkeep
git commit -m "chore(ios): remove .gitkeep from Components/Native/ — directory now populated"
```

---

## Summary

| # | File | Purpose |
|---|------|---------|
| 1 | `NativeComponentStyling.swift` | All 13 component style configs, one enum each, heavily commented |
| 2 | `AppNativePicker.swift` | Picker with error state + disabled state |
| 3 | `AppDateTimePicker.swift` | Date/time/dateAndTime in compact, graphical, wheel styles |
| 4 | `AppProgressLoader.swift` | Indefinite spinner + definite linear bar with custom track |
| 5 | `AppColorPicker.swift` | System color wheel with label |
| 6 | `AppBottomSheet.swift` | .sheet ViewModifier with detents and token background |
| 7 | `AppActionSheet.swift` | .confirmationDialog with typed default/destructive/cancel roles |
| 8 | `AppAlertPopup.swift` | .alert with typed button roles |
| 9 | `AppContextMenu.swift` | Long-press contextMenu + tap-triggered AppPopoverMenu |
| 10 | `AppPageHeader.swift` | NavigationStack toolbar modifier, large + inline variants |
| 11 | `AppBottomNavBar.swift` | TabView wrapper + UIKit appearance wired at app startup |
| 12 | `AppCarousel.swift` | Paged TabView + scroll-snap ScrollView + animated dots |
| 13 | `AppTooltip.swift` | Popover-based tooltip, plain text + rich content |
| 14 | `AppRangeSlider.swift` | Dual-thumb range slider with custom active track overlay |

**To customize any component:** edit the matching enum in `NativeComponentStyling.swift` only — no wrapper file needs touching.
