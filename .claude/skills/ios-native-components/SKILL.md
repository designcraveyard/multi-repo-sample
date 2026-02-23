---
name: ios-native-components
description: Reference for iOS native SwiftUI component wrappers — use when writing any iOS screen or feature that needs pickers, sheets, alerts, navigation, carousels, tooltips, or progress indicators
user-invocable: false
---

# iOS Native Component Wrappers

When building iOS screens and features, **always use these wrappers** instead of raw SwiftUI APIs. They apply consistent styling from `NativeComponentStyling.swift`.

All files live in `multi-repo-ios/multi-repo-ios/Components/Native/`.

## Quick Reference

### AppNativePicker (wraps `Picker`)
```swift
AppNativePicker(selection: $selected, options: options, style: .menu)
// Styles: .menu (default), .segmented, .wheel
// options: [PickerOption] where PickerOption has id, label, icon (optional)
// No border by default — error border (red stroke) only appears when showError: true
```

### AppDateTimePicker (wraps `DatePicker`)
```swift
AppDateTimePicker(selection: $date, mode: .dateAndTime)
// Modes: .date, .time, .dateAndTime
// displayStyle: .compact (default), .graphical, .wheel
// Optional: range (ClosedRange<Date>), label
// .wheel style: label renders above the drum columns (full-width wheel, no wrapping)
```

### AppProgressLoader (wraps `ProgressView`)
```swift
AppProgressLoader(style: .circular)
AppProgressLoader(style: .linear, value: 0.6, total: 1.0, label: "Uploading...")
// Styles: .circular (indeterminate spinner), .linear (determinate bar)
// value/total make it determinate; omit for indeterminate
```

### AppColorPicker (wraps `ColorPicker`)
```swift
AppColorPicker(selection: $color, label: "Theme Color", supportsOpacity: true)
```

### AppBottomSheet (ViewModifier wrapping `.sheet`)
```swift
someView
    .appBottomSheet(isPresented: $showSheet, detents: [.medium, .large]) {
        SheetContentView()
    }
// Optional: selectedDetent, showDragIndicator (default true)
```

### AppActionSheet (ViewModifier wrapping `.confirmationDialog`)
```swift
someView
    .appActionSheet(isPresented: $showActions, title: "Options") {
        Button("Delete", role: .destructive) { /* ... */ }
        Button("Cancel", role: .cancel) { }
    } message: {
        Text("Choose an action")
    }
```

### AppAlertPopup (ViewModifier wrapping `.alert`)
```swift
someView
    .appAlert(isPresented: $showAlert, title: "Confirm") {
        Button("OK") { /* ... */ }
        Button("Cancel", role: .cancel) { }
    } message: {
        Text("Are you sure?")
    }
```

### AppPageHeader (ViewModifier wrapping NavigationStack + .toolbar)
```swift
someView
    .appPageHeader(title: "Settings") {
        // leading toolbar content
        Button("Back") { }
    } trailing: {
        // trailing toolbar content
        Button("Save") { }
    }
```

### AppContextMenu (ViewModifier wrapping `.contextMenu`)
```swift
someView
    .appContextMenu(items: [
        ContextMenuItem(label: "Copy", icon: "doc.on.doc") { /* ... */ },
        ContextMenuItem(label: "Delete", icon: "trash", role: .destructive) { /* ... */ },
    ])
```

### AppBottomNavBar (wraps `TabView`)
```swift
AppBottomNavBar(selectedTab: $selectedTab) {
    HomeView().tabItem { Label("Home", systemImage: "house") }.tag(0)
    ProfileView().tabItem { Label("Profile", systemImage: "person") }.tag(1)
}
// Requires NativeBottomNavStyling.applyAppearance() in app init (already wired)
```

### AppCarousel (wraps TabView/.page or ScrollView)
```swift
// Full-width paged:
AppCarousel(items: cards) { card in
    RoundedRectangle(cornerRadius: .radiusLG).fill(card.color)
}

// Card-width snap:
AppCarousel(items: cards, style: .scrollSnap, showDots: false) { card in
    CardView(card: card).frame(width: 280)
}
// Styles: .paged (default), .scrollSnap
// AppCarouselDots companion view handles dot indicators
```

### AppTooltip (wraps `.popover`)
```swift
// Plain text:
AppTooltip(isPresented: $showTip, tipText: "Tap to like") {
    Image(systemName: "heart").onTapGesture { showTip.toggle() }
}

// Rich content:
AppTooltip(isPresented: $showTip, arrowEdge: .bottom) {
    anchorView
} tipContent: {
    VStack { Text("Title").bold(); Text("Detail") }
}
```

### AppRangeSlider (dual Slider overlay)
```swift
@State var low = 20.0
@State var high = 80.0

AppRangeSlider(lowerValue: $low, upperValue: $high, range: 0...100,
               step: 5, showLabels: true)
// step: 0 = continuous (default), >0 = discrete snapping
// showLabels: renders formatted min/max values below slider ends
// Haptics: UIImpactFeedbackGenerator(.light) on thumb grab;
//          UISelectionFeedbackGenerator tick on each step change (step mode only)
```

## Styling

All visual tokens are centralized in `NativeComponentStyling.swift` with namespaced structs:
- `NativePickerStyling`, `NativeDatePickerStyling`, `NativeProgressStyling`
- `NativeColorPickerStyling`, `NativeSheetStyling`, `NativeActionSheetStyling`
- `NativeAlertStyling`, `NativePageHeaderStyling`, `NativeContextMenuStyling`
- `NativeBottomNavStyling`, `NativeCarouselStyling`, `NativeTooltipStyling`
- `NativeRangeSliderStyling`

Each has `Colors`, `Typography`, and `Layout` sub-namespaces.

## Key Patterns

- **ViewModifiers** (BottomSheet, ActionSheet, Alert, PageHeader, ContextMenu): applied via dot-syntax on any View
- **Standalone views** (Picker, DatePicker, ProgressLoader, ColorPicker, BottomNavBar, Carousel, Tooltip, RangeSlider): used directly in body
- **Access restriction**: `public init` default parameter values cannot reference `internal` types — use literal values (e.g., `.top` instead of `NativeTooltipStyling.Layout.defaultArrowEdge`)
