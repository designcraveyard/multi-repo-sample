# Cross-Platform Design System Audit — 2026-06-29

This audit inventories every documented design-system component against the current web, iOS, and Android source trees. It is intended as the handoff document for maintaining parity across the three independent repositories.

## Summary

| Metric | Count |
|--------|------:|
| Component docs checked | 39 |
| Implemented on all three platforms | 35 |
| Partial implementations | 2 |
| Reference-only / not started | 2 |

## Component Coverage

| Component | Web | iOS | Android | Status | Docs |
|-----------|-----|-----|---------|--------|------|
| AdaptiveNavShell | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/AdaptiveNavShell.md) |
| AdaptiveSheet | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/AdaptiveSheet.md) |
| AdaptiveSplitView | No | No | Yes | Partial implementation (1/3 platforms) | [Docs](../components/AdaptiveSplitView.md) |
| AppActionSheet | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/AppActionSheet.md) |
| AppAlertPopup | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/AppAlertPopup.md) |
| AppBottomNavBar | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/AppBottomNavBar.md) |
| AppBottomSheet | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/AppBottomSheet.md) |
| AppCarousel | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/AppCarousel.md) |
| AppColorPicker | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/AppColorPicker.md) |
| AppContextMenu | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/AppContextMenu.md) |
| AppDateTimePicker | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/AppDateTimePicker.md) |
| AppNativePicker | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/AppNativePicker.md) |
| AppPageHeader | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/AppPageHeader.md) |
| AppProgressLoader | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/AppProgressLoader.md) |
| AppRangeSlider | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/AppRangeSlider.md) |
| AppTooltip | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/AppTooltip.md) |
| AppWebView | No | Yes | No | Partial implementation (1/3 platforms) | [Docs](../components/AppWebView.md) |
| Badge | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/Badge.md) |
| Button | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/Button.md) |
| Checkbox | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/Checkbox.md) |
| Chip | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/Chip.md) |
| DateGrid | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/DateGrid.md) |
| Divider | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/Divider.md) |
| IconButton | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/IconButton.md) |
| InputField | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/InputField.md) |
| Label | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/Label.md) |
| ListItem | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/ListItem.md) |
| MarkdownEditor | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/MarkdownEditor.md) |
| RadioButton | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/RadioButton.md) |
| SegmentControlBar | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/SegmentControlBar.md) |
| StepIndicator | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/StepIndicator.md) |
| Stepper | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/Stepper.md) |
| StreakChecks | No | No | No | Figma/reference entry only; no platform implementation | [Docs](../components/StreakChecks.md) |
| Switch | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/Switch.md) |
| Tabs | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/Tabs.md) |
| TextBlock | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/TextBlock.md) |
| Thumbnail | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/Thumbnail.md) |
| Toast | Yes | Yes | Yes | Implemented on all three platforms | [Docs](../components/Toast.md) |
| Waveform | No | No | No | Figma/reference entry only; no platform implementation | [Docs](../components/Waveform.md) |

## Token Audit

- Source of truth: `multi-repo-nextjs/app/globals.css`.
- iOS mirror: `multi-repo-ios/multi-repo-ios/DesignTokens.swift`.
- Android mirror: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/theme/DesignTokens.kt`.
- Component files were scanned for primitive color leakage, hardcoded color values, and known border/separator misuse patterns.
- The web `InputField` separator was moved from `Surfaces/BaseHighContrast` to `Border/Default` during this refresh.
- Raw color literals in `AppColorPicker` are intentional selectable swatches and should remain documented as data values, not design-system styling tokens.
- High-contrast surface usage remains acceptable for elevated fills, inactive carousel dots, segment/date selected surfaces, and Markdown code backgrounds because those are filled content surfaces rather than structural borders.

## Maintenance Rules

1. Update the component doc page in `docs/components/` whenever a public prop, state, variant, or accessibility behavior changes.
2. Update `docs/components.md` when a component moves, changes implementation status, or gains a Figma node.
3. Run the token validation flow before marking a component `Done`.
4. Run the token sync flow after any change to `globals.css`, `DesignTokens.swift`, or `DesignTokens.kt`.
