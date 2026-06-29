---
name: android-native-components
description: Reference for Android native Jetpack Compose component wrappers — use when writing any Android screen or feature that needs pickers, sheets, alerts, navigation, carousels, tooltips, or progress indicators
user-invocable: false
---

# Android Native Component Wrappers

When building Android screens and features, **always use these wrappers** instead of raw Material 3 / Compose APIs. They apply consistent styling from `NativeComponentStyling.kt`.

All files live in `ui/native/` within the Android module.

## Quick Reference

### AppNativePicker (wraps `ExposedDropdownMenuBox`)
```kotlin
AppNativePicker(
    value = selected,
    options = options,
    onSelect = { selected = it },
    label = "Category"
)
// options: List<PickerOption> where PickerOption has id, label, icon (optional)
// showError: Boolean — no border by default; red error border only when showError = true
```

### AppDateTimePicker (wraps `DatePickerDialog` / `TimePickerDialog`)
```kotlin
AppDateTimePicker(
    selectedDateMillis = selectedMillis,
    onDateSelected = { selectedMillis = it },
    mode = DateTimeMode.DateAndTime
)
// Modes: DateTimeMode.Date, DateTimeMode.Time, DateTimeMode.DateAndTime
// Shows DatePickerDialog for date modes, TimePickerDialog for time mode
// Combines both dialogs sequentially for DateAndTime mode
```

### AppProgressLoader (wraps `CircularProgressIndicator` / `LinearProgressIndicator`)
```kotlin
// Indeterminate spinner:
AppProgressLoader(variant = ProgressVariant.Indefinite)

// Determinate linear bar:
AppProgressLoader(
    variant = ProgressVariant.Definite(value = 0.6f, total = 1.0f),
    label = "Uploading..."
)
// ProgressVariant.Indefinite — circular spinner (no value/total)
// ProgressVariant.Definite(value, total) — linear bar with progress fraction
```

### AppColorPicker (custom swatch grid)
```kotlin
AppColorPicker(
    selectedColor = currentColor,
    onColorSelected = { currentColor = it },
    label = "Theme Color"
)
// Renders a grid of predefined swatches; selected swatch shows a checkmark indicator
// selectedColor: Color, onColorSelected: (Color) -> Unit
```

### AppBottomSheet (wraps `ModalBottomSheet`)
```kotlin
AppBottomSheet(
    isPresented = showSheet,
    onDismiss = { showSheet = false }
) {
    SheetContent()
}
// isPresented: Boolean, onDismiss: () -> Unit, content: @Composable () -> Unit
// Optional: title, description — rendered above content when provided
// Drag handle shown by default
```

### AppActionSheet (wraps `AlertDialog` + action list)
```kotlin
AppActionSheet(
    isPresented = showActions,
    onDismiss = { showActions = false },
    title = "Options",
    actions = listOf(
        ActionSheetAction(label = "Delete", role = ActionRole.Destructive) { /* ... */ },
        ActionSheetAction(label = "Cancel", role = ActionRole.Cancel) { }
    )
)
// actions: List<ActionSheetAction>; each has label, role, and onClick
// ActionRole: Default, Destructive, Cancel
```

### AppAlertPopup (wraps `AlertDialog`)
```kotlin
AppAlertPopup(
    isPresented = showAlert,
    onDismiss = { showAlert = false },
    title = "Confirm",
    message = "Are you sure?",
    buttons = listOf(
        AlertButton(label = "OK") { /* ... */ },
        AlertButton(label = "Cancel", role = AlertButtonRole.Cancel) { }
    )
)
// buttons: List<AlertButton>; each has label, role (Default/Cancel/Destructive), onClick
```

### AppPageHeader (wraps `TopAppBar`)
```kotlin
AppPageHeader(
    title = "Settings",
    navigationIcon = {
        IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, null) }
    },
    actions = listOf(
        HeaderAction(icon = Icons.Default.Save, contentDescription = "Save") { /* ... */ }
    )
)
// actions: List<HeaderAction>; each has icon, contentDescription, onClick
// Uses CenterAlignedTopAppBar variant by default; large title variant available
```

### AppContextMenu (wraps `DropdownMenu`)
```kotlin
AppContextMenu(
    isExpanded = menuExpanded,
    onDismiss = { menuExpanded = false },
    items = listOf(
        ContextMenuItem(label = "Copy", icon = Icons.Default.ContentCopy) { /* ... */ },
        ContextMenuItem(label = "Delete", icon = Icons.Default.Delete, destructive = true) { /* ... */ }
    )
)
// items: List<ContextMenuItem>; each has label, icon (optional), destructive, onClick
// isExpanded: Boolean drives DropdownMenu visibility
```

### AppBottomNavBar (wraps `NavigationBar`)
```kotlin
AppBottomNavBar(
    selectedTab = selectedTab,
    onTabSelect = { selectedTab = it },
    tabs = listOf(
        NavTab(label = "Home", icon = Icons.Default.Home),
        NavTab(label = "Profile", icon = Icons.Default.Person)
    )
)
// tabs: List<NavTab>; each has label, icon, selectedIcon (optional)
// selectedTab: Int index, onTabSelect: (Int) -> Unit
// Active tab uses filled icon variant when selectedIcon provided
```

### AppCarousel (wraps `HorizontalPager`)
```kotlin
// Full-width paged:
AppCarousel(
    items = cards,
    style = CarouselStyle.Paged,
    showDots = true
) { card ->
    CardItem(card = card)
}

// Card-width scroll-snap:
AppCarousel(
    items = cards,
    style = CarouselStyle.ScrollSnap,
    showDots = false
) { card ->
    CardItem(card = card, modifier = Modifier.width(280.dp))
}
// CarouselStyle.Paged (default): full-width pages with dot indicators
// CarouselStyle.ScrollSnap: peek adjacent items, snaps to nearest item
```

### AppTooltip (wraps `PlainTooltip`)
```kotlin
AppTooltip(
    isVisible = showTip,
    text = "Tap to like"
) {
    Icon(Icons.Default.FavoriteBorder, contentDescription = "Like")
}
// isVisible: Boolean, text: String
// Wraps anchor content as trailing lambda
// Uses PlainTooltip with TooltipBox; positioned automatically above/below anchor
```

### AppRangeSlider (wraps `RangeSlider`)
```kotlin
var range by remember { mutableStateOf(20f..80f) }

AppRangeSlider(
    lowerValue = range.start,
    upperValue = range.endInclusive,
    range = 0f..100f,
    step = 5,
    showLabels = true,
    onValueChange = { lower, upper -> range = lower..upper }
)
// step: 0 = continuous (default), >0 = discrete snapping with selection haptic tick
// showLabels: renders formatted min/max values below slider ends
// Haptics: HapticFeedbackType.LongPress on thumb grab;
//          HapticFeedbackType.TextHandleMove tick on each step change (step mode only)
```

## Styling

All visual tokens are centralized in `NativeComponentStyling.kt` with namespaced objects:
- `NativePickerStyling`, `NativeDatePickerStyling`, `NativeProgressStyling`
- `NativeColorPickerStyling`, `NativeSheetStyling`, `NativeActionSheetStyling`
- `NativeAlertStyling`, `NativePageHeaderStyling`, `NativeContextMenuStyling`
- `NativeBottomNavStyling`, `NativeCarouselStyling`, `NativeTooltipStyling`
- `NativeRangeSliderStyling`

Each has `Colors`, `Typography`, and `Layout` sub-objects. Never hardcode colors, spacing, or font sizes in wrapper files — always reference tokens via `MaterialTheme.colorScheme` or the local `AppTheme` extension properties.

## Key Patterns

- **Composable wrappers** (Picker, DateTimePicker, ProgressLoader, ColorPicker, BottomNavBar, Carousel, Tooltip, RangeSlider): used directly in composition
- **Dialog composables** (BottomSheet, ActionSheet, AlertPopup): rendered inline in the composition tree, visibility driven by `isPresented: Boolean`
- **Slot-based wrappers** (BottomSheet, Carousel, PageHeader): accept `content: @Composable () -> Unit` trailing lambdas
- **Data list wrappers** (ActionSheet, AlertPopup, ContextMenu, BottomNavBar): accept typed action/tab lists instead of raw composable slots for consistent styling
- All wrappers read tokens from `NativeComponentStyling.kt` — never pass hardcoded `Color`, `Dp`, or `TextStyle` values from screen files
