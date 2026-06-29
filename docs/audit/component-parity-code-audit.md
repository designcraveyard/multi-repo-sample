# Component Parity Code Audit

Scope: actual component implementation files in:

- `multi-repo-nextjs/app/components`
- `multi-repo-ios/multi-repo-ios/Components`
- `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui`

This report checks code presence, exported/component entry points, and documentation coverage. It does not rely only on `docs/components.md` status labels.

## Registry Components

| Component | Web Code | iOS Code | Android Code | Docs | Code-Backed Finding |
|---|---:|---:|---:|---:|---|
| Button | Yes | Yes | Yes | Yes | Full parity. Web exports `Button`; iOS defines `AppButton`; Android defines `AppButton`. Variant/size families align, with platform casing differences. |
| IconButton | Yes | Yes | Yes | Yes | Full parity. Web/iOS spell variant `quarternary`; Android uses corrected `Quaternary`, so naming is slightly inconsistent. |
| Badge | Yes | Yes | Yes | Yes | Full parity. Size/type families align across platforms. |
| Label | Yes | Yes | Yes | Yes | Full parity. Size/type families align across platforms. |
| Chip | Yes | Yes | Yes | Yes | Full parity. Variant/size families align across platforms. |
| Tabs | Yes | Yes | Yes | Yes | Full parity. Tab size families align. |
| SegmentControlBar | Yes | Yes | Yes | Yes | Full parity. Single and multi-select variants exist on iOS and Android. |
| Thumbnail | Yes | Yes | Yes | Yes | Full parity. Size scale exists across all three. |
| InputField / TextField | Yes | Yes | Yes | Yes | Full parity. Web exports `InputField` and `TextField`; iOS defines `AppInputField`, `AppTextField`, and `AppTextOnlyField`; Android defines `AppInputField` and `AppTextField`. |
| Toast | Yes | Yes | Yes | Yes | Full parity. iOS and Android also include overlay helpers. |
| DateGrid / DateItem | Yes | Yes | Yes | Yes | Full parity. Date item plus grid exist across all three. |
| Divider | Yes | Yes | Yes | Yes | Full parity. Orientation/type models exist across all three. |
| Checkbox | Yes | Yes | Yes | Yes | Full parity. Checked/indeterminate/disabled support is represented in code. |
| Switch | Yes | Yes | Yes | Yes | Full parity. |
| RadioButton | Yes | Yes | Yes | Yes | Mostly full parity. Web and iOS include group helpers; Android currently exposes standalone `AppRadioButton` only. |
| MarkdownEditor | Yes | Yes | Yes | Yes | Full parity at the parent component level. iOS has extensive helper files; Android is a single Compose component plus `MarkdownEditorStyling`; web uses `MarkdownEditor`, `MarkdownToolbar`, and CSS. |
| TextBlock | Yes | Yes | Yes | Yes | Full parity. |
| StepIndicator | Yes | Yes | Yes | Yes | Full parity. |
| Stepper | Yes | Yes | Yes | Yes | Full parity. |
| ListItem | Yes | Yes | Yes | Yes | Full parity. Trailing configuration shape differs by platform but equivalent roles exist. |
| AdaptiveNavShell | Yes | Yes | Yes | Yes | Full parity. |
| AdaptiveSheet | Yes | Yes | Yes | Yes | Full parity. iOS implementation is modifier-based; web and Android are component functions. |
| AdaptiveSplitView | Missing | Missing | Yes | Yes | Registry row says Done for all platforms, but only Android has actual code. Component doc correctly says web/iOS are not yet implemented. |
| AppNativePicker | Yes | Yes | Yes | Yes | Full parity. |
| AppDateTimePicker | Yes | Yes | Yes | Yes | Full parity. |
| AppProgressLoader | Yes | Yes | Yes | Yes | Full parity. |
| AppColorPicker | Yes | Yes | Yes | Yes | Full parity. |
| AppBottomSheet | Yes | Yes | Yes | Yes | Full parity. iOS implementation is modifier-based. |
| AppCarousel | Yes | Yes | Yes | Yes | Full parity. iOS includes `AppCarouselDots`; Android has `CarouselStyle`; web uses Embla/shadcn carousel wrapper. |
| AppTooltip | Yes | Yes | Yes | Yes | Full parity. |
| AppRangeSlider | Yes | Yes | Yes | Yes | Full parity. |
| AppActionSheet | Yes | Yes | Yes | Yes | Full parity. |
| AppAlertPopup | Yes | Yes | Yes | Yes | Full parity. |
| AppContextMenu | Yes | Yes | Yes | Yes | Full parity. |
| AppBottomNavBar | N/A | Yes | Yes | Yes | Mobile-native parity only. Docs correctly mark web as N/A. |
| AppPageHeader | N/A | Yes | Yes | Yes | Mobile-native parity only. Docs correctly mark web as N/A. |
| AppWebView | N/A | Yes | Missing | Yes | `docs/components.md` incorrectly lists Android `AppWebView.kt` as Done. The component doc correctly says Android is not implemented. |
| StreakChecks | Missing | Missing | Missing | Yes | Docs are placeholder and registry marks Not started. |
| Waveform | Missing | Missing | Missing | Yes | Docs are placeholder and registry marks Not started. |

## Actual Code Evidence

| Area | Evidence |
|---|---|
| Web registered components | Component exports found in `Button`, `IconButton`, `Badge`, `Label`, `Chip`, `Tabs`, `SegmentControlBar`, `Thumbnail`, `InputField`, `Toast`, `DateGrid`, `Divider`, `Checkbox`, `Switch`, `RadioButton`, `MarkdownEditor`, pattern components, adaptive wrappers, and native wrappers. |
| iOS registered components | Swift view structs/enums found for the same component set, including `AppButton`, `AppIconButton`, `AppBadge`, `AppInputField`, `AppMarkdownEditor`, `AdaptiveNavShell`, native wrappers, and pattern components. |
| Android registered components | Compose functions/enums found for the same component set, including `AppButton`, `AppIconButton`, `AppBadge`, `AppInputField`, `AppMarkdownEditor`, adaptive wrappers, native wrappers, and pattern components. |
| Missing web/iOS AdaptiveSplitView | No `multi-repo-nextjs/app/components/Adaptive/AdaptiveSplitView.tsx`; no `multi-repo-ios/multi-repo-ios/Components/Adaptive/AdaptiveSplitView.swift`. |
| Existing Android AdaptiveSplitView | `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/adaptive/AdaptiveSplitView.kt` defines `fun AdaptiveSplitView`. |
| Missing Android AppWebView | No `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppWebView.kt`. |
| Existing iOS AppWebView | `multi-repo-ios/multi-repo-ios/Components/Native/AppWebView.swift` defines `struct AppWebView`. |

## Undocumented Components Found In Code

| Platform | Undocumented Code Area | Notes |
|---|---|---|
| Web | `app/components/Chat/*` | `ChatPage`, `ChatHeader`, `ChatInput`, `ChatMessage`, `ChatMessageList`, `ChatHistorySheet`, `StreamEventPill`, debug panel, and card renderers are real components but not represented in `docs/components.md`. |
| Web | `app/components/icons/Icon.tsx` | Real icon wrapper. Not represented in component registry. |
| iOS | `Components/Chat/*` | `ChatInputBar`, `ChatHistoryView`, `SSEStreamEventView`, and Pokemon/team/evolution/type matchup cards exist but are not in registry docs. |
| iOS | `Components/MarkdownEditor/*` helper files | Parent `MarkdownEditor` docs mention them, but most helper files are not documented individually. |
| Android | `ui/icons/PhosphorIconHelper.kt` | Real icon helper with `AppIcon`, `IconSize`, and `IconWeight`. Not represented in component registry. |
| Android | `ui/theme/*` | Design-token/theme files exist under `ui`, but they are infrastructure rather than components. |

## Documentation Freshness

| Doc Area | Status | Finding |
|---|---|---|
| `docs/components.md` registered atomics | Mostly current | Paths match actual code for all started atomic components. |
| `docs/components.md` patterns | Mostly current | Paths match actual code for implemented patterns. |
| `docs/components.md` native wrappers | Partially stale | Android `AppWebView.kt` is listed as Done but missing. |
| `docs/components.md` adaptive wrappers | Partially stale | `AdaptiveSplitView` is listed as Done for web/iOS/Android, but only Android exists. |
| Individual `AdaptiveSplitView.md` | Current | Correctly says web/iOS are not implemented and Android exists. |
| Individual `AppWebView.md` | Current | Correctly says Android is not implemented. |
| Chat component docs | Missing | Web and iOS have real chat components; Android has no matching chat component set. |
| Icon helper docs | Missing | Web and Android have code-level icon wrappers/helpers; registry does not document them. |

## Main Follow-Up Items

1. Update `docs/components.md` to correct `AdaptiveSplitView` and `AppWebView` platform status.
2. Add registry/docs entries for icon wrappers: web `Icon.tsx`, Android `PhosphorIconHelper.kt`, and iOS PhosphorSlim helper if desired.
3. Decide whether Chat components are product-specific or part of the design system. If design-system-adjacent, add docs for web/iOS and mark Android missing.
4. Consider adding Android `RadioGroup` parity if grouped radio usage is expected to match web/iOS APIs.
5. Keep MarkdownEditor parent docs, but add a short internal architecture section or subdoc for iOS helper responsibilities.
