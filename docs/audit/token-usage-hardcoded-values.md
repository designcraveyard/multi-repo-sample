# Token Usage and Hardcoded Value Audit

Scope: `multi-repo-nextjs/app/components/**/*.tsx` and `multi-repo-ios/multi-repo-ios/Components/**/*.swift`. Source tokens are from `multi-repo-nextjs/app/globals.css`; iOS mirror is `DesignTokens.swift`.

Note: Tailwind utilities such as `p-4`, `gap-2`, and `rounded-md` are counted as token-backed because `globals.css` maps them to `--space-*` and `--radius-*`. Token-backed arbitrary syntax like `text-[var(--typography-primary)]` is not counted as hardcoded.

## Token Family Summary

| Family | Defined | Used in components | Refs | Web components | iOS components | Example web components | Example iOS components |
|---|---:|---:|---:|---:|---:|---|---|
| Primitive color | 99 | 0 | 0 | 0 | 0 | - | - |
| Semantic color | 89 | 54 | 851 | 45 | 32 | AdaptiveNavShell, AdaptiveSheet, AppActionSheet, AppAlertPopup, AppBottomSheet, AppCarousel +39 more | AdaptiveNavShell, AdaptiveSheet, AppContextMenu, AppNativePicker, AppTooltip, Badge +26 more |
| Typography metric | 87 | 42 | 143 | 25 | 0 | AdaptiveSheet, AppActionSheet, AppAlertPopup, AppBottomSheet, AppColorPicker, AppContextMenu +19 more | - |
| Spacing | 12 | 7 | 315 | 43 | 0 | AdaptiveNavShell, AdaptiveSheet, AppActionSheet, AppAlertPopup, AppBottomSheet, AppCarousel +37 more | - |
| Radius | 10 | 8 | 86 | 39 | 0 | AdaptiveNavShell, AdaptiveSheet, AppActionSheet, AppAlertPopup, AppBottomSheet, AppCarousel +33 more | - |
| Legacy aliases | 69 | 1 | 1 | 1 | 0 | Icon | - |

## Primitive Tokens

| Token | Used in components? | Notes |
|---|---:|---|
| `--color-accent` | No | Primitive color token; should remain source/theme only |
| `--color-accent-foreground` | No | Primitive color token; should remain source/theme only |
| `--color-amber-100` | No | Primitive color token; should remain source/theme only |
| `--color-amber-200` | No | Primitive color token; should remain source/theme only |
| `--color-amber-300` | No | Primitive color token; should remain source/theme only |
| `--color-amber-400` | No | Primitive color token; should remain source/theme only |
| `--color-amber-50` | No | Primitive color token; should remain source/theme only |
| `--color-amber-500` | No | Primitive color token; should remain source/theme only |
| `--color-amber-600` | No | Primitive color token; should remain source/theme only |
| `--color-amber-700` | No | Primitive color token; should remain source/theme only |
| `--color-amber-800` | No | Primitive color token; should remain source/theme only |
| `--color-amber-900` | No | Primitive color token; should remain source/theme only |
| `--color-amber-950` | No | Primitive color token; should remain source/theme only |
| `--color-background` | No | Primitive color token; should remain source/theme only |
| `--color-base-black` | No | Primitive color token; should remain source/theme only |
| `--color-base-white` | No | Primitive color token; should remain source/theme only |
| `--color-border` | No | Primitive color token; should remain source/theme only |
| `--color-card` | No | Primitive color token; should remain source/theme only |
| `--color-card-foreground` | No | Primitive color token; should remain source/theme only |
| `--color-chart-1` | No | Primitive color token; should remain source/theme only |
| `--color-chart-2` | No | Primitive color token; should remain source/theme only |
| `--color-chart-3` | No | Primitive color token; should remain source/theme only |
| `--color-chart-4` | No | Primitive color token; should remain source/theme only |
| `--color-chart-5` | No | Primitive color token; should remain source/theme only |
| `--color-destructive` | No | Primitive color token; should remain source/theme only |
| `--color-foreground` | No | Primitive color token; should remain source/theme only |
| `--color-green-100` | No | Primitive color token; should remain source/theme only |
| `--color-green-200` | No | Primitive color token; should remain source/theme only |
| `--color-green-300` | No | Primitive color token; should remain source/theme only |
| `--color-green-400` | No | Primitive color token; should remain source/theme only |
| `--color-green-50` | No | Primitive color token; should remain source/theme only |
| `--color-green-500` | No | Primitive color token; should remain source/theme only |
| `--color-green-600` | No | Primitive color token; should remain source/theme only |
| `--color-green-700` | No | Primitive color token; should remain source/theme only |
| `--color-green-800` | No | Primitive color token; should remain source/theme only |
| `--color-green-900` | No | Primitive color token; should remain source/theme only |
| `--color-green-950` | No | Primitive color token; should remain source/theme only |
| `--color-indigo-100` | No | Primitive color token; should remain source/theme only |
| `--color-indigo-200` | No | Primitive color token; should remain source/theme only |
| `--color-indigo-300` | No | Primitive color token; should remain source/theme only |
| `--color-indigo-400` | No | Primitive color token; should remain source/theme only |
| `--color-indigo-50` | No | Primitive color token; should remain source/theme only |
| `--color-indigo-500` | No | Primitive color token; should remain source/theme only |
| `--color-indigo-600` | No | Primitive color token; should remain source/theme only |
| `--color-indigo-700` | No | Primitive color token; should remain source/theme only |
| `--color-indigo-800` | No | Primitive color token; should remain source/theme only |
| `--color-indigo-900` | No | Primitive color token; should remain source/theme only |
| `--color-indigo-950` | No | Primitive color token; should remain source/theme only |
| `--color-input` | No | Primitive color token; should remain source/theme only |
| `--color-muted` | No | Primitive color token; should remain source/theme only |
| `--color-muted-foreground` | No | Primitive color token; should remain source/theme only |
| `--color-neutral-100` | No | Primitive color token; should remain source/theme only |
| `--color-neutral-200` | No | Primitive color token; should remain source/theme only |
| `--color-neutral-300` | No | Primitive color token; should remain source/theme only |
| `--color-neutral-400` | No | Primitive color token; should remain source/theme only |
| `--color-neutral-50` | No | Primitive color token; should remain source/theme only |
| `--color-neutral-500` | No | Primitive color token; should remain source/theme only |
| `--color-neutral-600` | No | Primitive color token; should remain source/theme only |
| `--color-neutral-700` | No | Primitive color token; should remain source/theme only |
| `--color-neutral-800` | No | Primitive color token; should remain source/theme only |
| `--color-neutral-900` | No | Primitive color token; should remain source/theme only |
| `--color-neutral-950` | No | Primitive color token; should remain source/theme only |
| `--color-popover` | No | Primitive color token; should remain source/theme only |
| `--color-popover-foreground` | No | Primitive color token; should remain source/theme only |
| `--color-primary` | No | Primitive color token; should remain source/theme only |
| `--color-primary-foreground` | No | Primitive color token; should remain source/theme only |
| `--color-red-100` | No | Primitive color token; should remain source/theme only |
| `--color-red-200` | No | Primitive color token; should remain source/theme only |
| `--color-red-300` | No | Primitive color token; should remain source/theme only |
| `--color-red-400` | No | Primitive color token; should remain source/theme only |
| `--color-red-50` | No | Primitive color token; should remain source/theme only |
| `--color-red-500` | No | Primitive color token; should remain source/theme only |
| `--color-red-600` | No | Primitive color token; should remain source/theme only |
| `--color-red-700` | No | Primitive color token; should remain source/theme only |
| `--color-red-800` | No | Primitive color token; should remain source/theme only |
| `--color-red-900` | No | Primitive color token; should remain source/theme only |
| `--color-red-950` | No | Primitive color token; should remain source/theme only |
| `--color-ring` | No | Primitive color token; should remain source/theme only |
| `--color-secondary` | No | Primitive color token; should remain source/theme only |
| `--color-secondary-foreground` | No | Primitive color token; should remain source/theme only |
| `--color-sidebar` | No | Primitive color token; should remain source/theme only |
| `--color-sidebar-accent` | No | Primitive color token; should remain source/theme only |
| `--color-sidebar-accent-foreground` | No | Primitive color token; should remain source/theme only |
| `--color-sidebar-border` | No | Primitive color token; should remain source/theme only |
| `--color-sidebar-foreground` | No | Primitive color token; should remain source/theme only |
| `--color-sidebar-primary` | No | Primitive color token; should remain source/theme only |
| `--color-sidebar-primary-foreground` | No | Primitive color token; should remain source/theme only |
| `--color-sidebar-ring` | No | Primitive color token; should remain source/theme only |
| `--color-zinc-100` | No | Primitive color token; should remain source/theme only |
| `--color-zinc-200` | No | Primitive color token; should remain source/theme only |
| `--color-zinc-300` | No | Primitive color token; should remain source/theme only |
| `--color-zinc-400` | No | Primitive color token; should remain source/theme only |
| `--color-zinc-50` | No | Primitive color token; should remain source/theme only |
| `--color-zinc-500` | No | Primitive color token; should remain source/theme only |
| `--color-zinc-600` | No | Primitive color token; should remain source/theme only |
| `--color-zinc-700` | No | Primitive color token; should remain source/theme only |
| `--color-zinc-800` | No | Primitive color token; should remain source/theme only |
| `--color-zinc-900` | No | Primitive color token; should remain source/theme only |
| `--color-zinc-950` | No | Primitive color token; should remain source/theme only |

## Semantic Color Tokens

| Token | Refs | Web usage | iOS usage |
|---|---:|---|---|
| `--border-active` | 16 | Chip, DateGrid, InputField, MarkdownEditor, SegmentControlBar, Tabs | Chip, InputField, MarkdownEditor, SegmentControlBar |
| `--border-brand` | 13 | AppNativePicker, Button, Checkbox, IconButton, RadioButton | Button, IconButton |
| `--border-default` | 51 | AppActionSheet, AppContextMenu, AppNativePicker, AppRangeSlider, ChatHeader, ChatHistorySheet, ChatInput, Checkbox +12 more | AppNativePicker, ChatInputBar, Checkbox, Chip, EvolutionCardView, MarkdownEditor, PokemonCardView, RadioButton +5 more |
| `--border-error` | 8 | AppNativePicker, InputField, MarkdownEditor | AppNativePicker, InputField, MarkdownEditor |
| `--border-muted` | 9 | AdaptiveNavShell, Divider, MarkdownEditor | MarkdownEditor |
| `--border-success` | 6 | InputField, MarkdownEditor | InputField, MarkdownEditor |
| `--border-warning` | 6 | InputField, MarkdownEditor | InputField, MarkdownEditor |
| `--icons-accent` | 0 | - | - |
| `--icons-black` | 0 | - | - |
| `--icons-brand` | 1 | MarkdownEditor | - |
| `--icons-error` | 7 | InputField, MarkdownEditor, Toast | InputField, MarkdownEditor, Toast |
| `--icons-inverse-muted` | 0 | - | - |
| `--icons-inverse-primary` | 2 | Toast | - |
| `--icons-inverse-secondary` | 0 | - | - |
| `--icons-muted` | 4 | InputField | InputField |
| `--icons-on-brand-primary` | 7 | IconButton | IconButton, StepIndicator |
| `--icons-primary` | 9 | IconButton, InputField, MarkdownEditor | IconButton, InputField |
| `--icons-secondary` | 2 | AppDateTimePicker, MarkdownEditor | - |
| `--icons-success` | 5 | InputField, Toast | InputField, Toast |
| `--icons-warning` | 5 | InputField, Toast | InputField, Toast |
| `--icons-white` | 1 | StepIndicator | - |
| `--surfaces-accent-high-contrast` | 0 | - | - |
| `--surfaces-accent-high-contrast-hover` | 0 | - | - |
| `--surfaces-accent-high-contrast-pressed` | 0 | - | - |
| `--surfaces-accent-low-contrast` | 2 | Badge | Badge |
| `--surfaces-accent-low-contrast-hover` | 0 | - | - |
| `--surfaces-accent-low-contrast-pressed` | 0 | - | - |
| `--surfaces-accent-primary` | 2 | Badge | Badge |
| `--surfaces-accent-primary-hover` | 0 | - | - |
| `--surfaces-accent-primary-pressed` | 0 | - | - |
| `--surfaces-base-high-contrast` | 7 | AppCarousel, DateGrid, InputField, Stepper | DateGrid, MarkdownEditor, SegmentControlBar |
| `--surfaces-base-high-contrast-hover` | 0 | - | - |
| `--surfaces-base-high-contrast-pressed` | 0 | - | - |
| `--surfaces-base-low-contrast` | 66 | AppAlertPopup, AppNativePicker, AppProgressLoader, AppRangeSlider, ChatHeader, ChatHistorySheet, ChatInput, ChatMessage +14 more | AppNativePicker, ChatInputBar, Chip, DateGrid, EvolutionCardView, InputField, MarkdownEditor, PokemonCardView +4 more |
| `--surfaces-base-low-contrast-hover` | 6 | AppAlertPopup, AppNativePicker, Chip, DateGrid, Switch | - |
| `--surfaces-base-low-contrast-pressed` | 8 | AppNativePicker, Chip, SegmentControlBar | Chip |
| `--surfaces-base-primary` | 80 | AdaptiveNavShell, AdaptiveSheet, AppActionSheet, AppAlertPopup, AppBottomSheet, AppContextMenu, AppDateTimePicker, AppNativePicker +17 more | AdaptiveNavShell, AdaptiveSheet, AppContextMenu, AppNativePicker, Badge, Button, ChatHistoryView, ChatInputBar +22 more |
| `--surfaces-base-primary-hover` | 19 | AdaptiveNavShell, AppActionSheet, AppContextMenu, AppDateTimePicker, AppNativePicker, Button, Chip, IconButton | Button |
| `--surfaces-base-primary-pressed` | 11 | AppActionSheet, Button, Chip, IconButton | Button, Chip, IconButton |
| `--surfaces-brand-interactive` | 55 | AdaptiveNavShell, AppAlertPopup, AppCarousel, AppProgressLoader, AppRangeSlider, Badge, Button, ChatHeader +9 more | AdaptiveNavShell, Badge, Button, ChatHistoryView, ChatInputBar, Checkbox, DateGrid, IconButton +5 more |
| `--surfaces-brand-interactive-high-contrast` | 0 | - | - |
| `--surfaces-brand-interactive-high-contrast-hover` | 0 | - | - |
| `--surfaces-brand-interactive-high-contrast-pressed` | 0 | - | - |
| `--surfaces-brand-interactive-hover` | 5 | AppAlertPopup, Button, IconButton, Switch | Button |
| `--surfaces-brand-interactive-low-contrast` | 7 | Badge, Button, IconButton, MarkdownEditor | Badge, Button, IconButton |
| `--surfaces-brand-interactive-low-contrast-hover` | 3 | Button, IconButton | Button |
| `--surfaces-brand-interactive-low-contrast-pressed` | 4 | Button, IconButton | Button, IconButton |
| `--surfaces-brand-interactive-pressed` | 4 | Button, IconButton | Button, IconButton |
| `--surfaces-error-solid` | 9 | AppAlertPopup, Badge, Button, IconButton | Badge, Button, IconButton |
| `--surfaces-error-solid-hover` | 4 | AppAlertPopup, Button, IconButton | Button |
| `--surfaces-error-solid-pressed` | 4 | Button, IconButton | Button, IconButton |
| `--surfaces-error-subtle` | 2 | Badge | Badge |
| `--surfaces-error-subtle-hover` | 0 | - | - |
| `--surfaces-error-subtle-pressed` | 0 | - | - |
| `--surfaces-inverse-high-contrast` | 4 | MarkdownEditor | - |
| `--surfaces-inverse-high-contrast-hover` | 0 | - | - |
| `--surfaces-inverse-high-contrast-pressed` | 0 | - | - |
| `--surfaces-inverse-low-contrast` | 0 | - | - |
| `--surfaces-inverse-low-contrast-hover` | 0 | - | - |
| `--surfaces-inverse-low-contrast-pressed` | 0 | - | - |
| `--surfaces-inverse-primary` | 7 | AppTooltip, MarkdownEditor, Toast | Toast |
| `--surfaces-inverse-primary-hover` | 0 | - | - |
| `--surfaces-inverse-primary-pressed` | 0 | - | - |
| `--surfaces-success-solid` | 11 | Badge, Button, IconButton, StepIndicator | Badge, Button, IconButton, StepIndicator |
| `--surfaces-success-solid-hover` | 3 | Button, IconButton | Button |
| `--surfaces-success-solid-pressed` | 4 | Button, IconButton | Button, IconButton |
| `--surfaces-success-subtle` | 2 | Badge | Badge |
| `--surfaces-success-subtle-hover` | 0 | - | - |
| `--surfaces-success-subtle-pressed` | 0 | - | - |
| `--surfaces-warning-solid` | 0 | - | - |
| `--surfaces-warning-solid-hover` | 0 | - | - |
| `--surfaces-warning-solid-pressed` | 0 | - | - |
| `--surfaces-warning-subtle` | 1 | - | MarkdownEditor |
| `--surfaces-warning-subtle-hover` | 0 | - | - |
| `--surfaces-warning-subtle-pressed` | 0 | - | - |
| `--typography-accent` | 4 | Badge | Badge, MarkdownEditor |
| `--typography-black` | 0 | - | - |
| `--typography-brand` | 10 | AppActionSheet, Badge, Button, Label | Badge, Button, Label |
| `--typography-error` | 10 | AppActionSheet, AppContextMenu, AppNativePicker, Badge, InputField, MarkdownEditor | AppNativePicker, Badge, InputField, MarkdownEditor |
| `--typography-inverse-muted` | 0 | - | - |
| `--typography-inverse-primary` | 7 | AppTooltip, Toast | Toast |
| `--typography-inverse-secondary` | 5 | Toast | Toast |
| `--typography-muted` | 116 | AppActionSheet, AppNativePicker, AppRangeSlider, DateGrid, Divider, InputField, Label, MarkdownEditor +2 more | AppNativePicker, AppTooltip, Badge, ChatHistoryView, ChatInputBar, Checkbox, Chip, DateGrid +18 more |
| `--typography-on-brand-primary` | 26 | AdaptiveNavShell, AppAlertPopup, Badge, Button, Checkbox, MarkdownEditor, RadioButton | AdaptiveNavShell, Badge, Button, Checkbox, MarkdownEditor, RadioButton |
| `--typography-primary` | 80 | AdaptiveSheet, AppAlertPopup, AppBottomSheet, AppColorPicker, AppContextMenu, AppDateTimePicker, AppNativePicker, ChatHeader +19 more | AdaptiveSheet, AppNativePicker, ChatHistoryView, ChatInputBar, Checkbox, Chip, DateGrid, InputField +10 more |
| `--typography-secondary` | 101 | AdaptiveNavShell, AdaptiveSheet, AppActionSheet, AppAlertPopup, AppBottomSheet, AppNativePicker, AppProgressLoader, ChatHeader +19 more | AdaptiveNavShell, AdaptiveSheet, AppNativePicker, ChatInputBar, Chip, EvolutionCardView, InputField, Label +9 more |
| `--typography-success` | 6 | Badge, InputField, MarkdownEditor | Badge, InputField, MarkdownEditor |
| `--typography-warning` | 4 | InputField, MarkdownEditor | InputField, MarkdownEditor |
| `--typography-white` | 0 | - | - |

## Spacing, Radius, and Typography Tokens

| Token | Family | Refs | Web usage | iOS usage |
|---|---|---:|---|---|
| `--space-1` | Spacing | 99 | AdaptiveNavShell, AppCarousel, AppDateTimePicker, AppNativePicker, AppRangeSlider, Badge, Button, ChatHeader +18 more | - |
| `--space-10` | Spacing | 0 | - | - |
| `--space-12` | Spacing | 0 | - | - |
| `--space-16` | Spacing | 0 | - | - |
| `--space-2` | Spacing | 92 | AdaptiveNavShell, AppActionSheet, AppAlertPopup, AppContextMenu, AppDateTimePicker, AppNativePicker, AppProgressLoader, AppTooltip +25 more | - |
| `--space-20` | Spacing | 0 | - | - |
| `--space-24` | Spacing | 0 | - | - |
| `--space-3` | Spacing | 67 | AdaptiveSheet, AppAlertPopup, AppBottomSheet, AppCarousel, AppColorPicker, AppContextMenu, AppDateTimePicker, AppNativePicker +24 more | - |
| `--space-4` | Spacing | 38 | AdaptiveNavShell, AdaptiveSheet, AppActionSheet, AppAlertPopup, AppBottomSheet, AppContextMenu, AppDateTimePicker, AppNativePicker +16 more | - |
| `--space-5` | Spacing | 8 | AppNativePicker, Button, Chip, Toast | - |
| `--space-6` | Spacing | 9 | AdaptiveNavShell, AdaptiveSheet, AppAlertPopup, AppBottomSheet, DebugPanel, Lightbox, Stepper | - |
| `--space-8` | Spacing | 2 | ChatHistorySheet | - |
| `--radius-2xl` | Radius | 6 | ChatInput, ChatMessage, EvolutionCard, PokemonCard, TeamCard, TypeMatchupCard | - |
| `--radius-3xl` | Radius | 0 | - | - |
| `--radius-4xl` | Radius | 0 | - | - |
| `--radius-full` | Radius | 41 | AppCarousel, AppProgressLoader, AppRangeSlider, Badge, Button, Chip, DateGrid, DebugPanel +14 more | - |
| `--radius-lg` | Radius | 11 | AppAlertPopup, AppDateTimePicker, ChatHeader, ChatHistorySheet, ChatInput, EvolutionCard, TeamCard | - |
| `--radius-md` | Radius | 8 | AdaptiveNavShell, AppAlertPopup, AppContextMenu, AppDateTimePicker, AppNativePicker, MarkdownEditor | - |
| `--radius-none` | Radius | 6 | AppContextMenu, AppNativePicker | - |
| `--radius-sm` | Radius | 8 | AppColorPicker, AppContextMenu, AppTooltip, Chip, MarkdownEditor, Thumbnail | - |
| `--radius-xl` | Radius | 5 | AdaptiveSheet, AppActionSheet, AppBottomSheet | - |
| `--radius-xs` | Radius | 1 | Checkbox | - |
| `--typography-badge-md-leading` | Typography metric | 1 | Badge | - |
| `--typography-badge-md-size` | Typography metric | 1 | Badge | - |
| `--typography-badge-md-weight` | Typography metric | 1 | Badge | - |
| `--typography-badge-sm-leading` | Typography metric | 1 | Badge | - |
| `--typography-badge-sm-size` | Typography metric | 1 | Badge | - |
| `--typography-badge-sm-weight` | Typography metric | 1 | Badge | - |
| `--typography-body-lg-em-leading` | Typography metric | 2 | Label, TextBlock | - |
| `--typography-body-lg-em-size` | Typography metric | 2 | Label, TextBlock | - |
| `--typography-body-lg-em-weight` | Typography metric | 2 | Label, TextBlock | - |
| `--typography-body-lg-leading` | Typography metric | 0 | - | - |
| `--typography-body-lg-size` | Typography metric | 2 | AppActionSheet | - |
| `--typography-body-lg-weight` | Typography metric | 0 | - | - |
| `--typography-body-md-em-leading` | Typography metric | 2 | AppActionSheet, Label | - |
| `--typography-body-md-em-size` | Typography metric | 2 | AppActionSheet, Label | - |
| `--typography-body-md-em-weight` | Typography metric | 2 | AppActionSheet, Label | - |
| `--typography-body-md-leading` | Typography metric | 8 | AppColorPicker, AppProgressLoader, Checkbox, InputField, RadioButton, Switch, TextBlock | - |
| `--typography-body-md-size` | Typography metric | 15 | AdaptiveSheet, AppAlertPopup, AppBottomSheet, AppColorPicker, AppContextMenu, AppDateTimePicker, AppProgressLoader, Checkbox +4 more | - |
| `--typography-body-md-weight` | Typography metric | 4 | AppColorPicker, InputField, TextBlock | - |
| `--typography-body-sm-em-leading` | Typography metric | 5 | AppNativePicker, InputField, Label, MarkdownEditor, Toast | - |
| `--typography-body-sm-em-size` | Typography metric | 5 | AppNativePicker, InputField, Label, MarkdownEditor, Toast | - |
| `--typography-body-sm-em-weight` | Typography metric | 5 | AppNativePicker, InputField, Label, MarkdownEditor, Toast | - |
| `--typography-body-sm-leading` | Typography metric | 3 | AppTooltip, TextBlock, Toast | - |
| `--typography-body-sm-size` | Typography metric | 3 | AppTooltip, TextBlock, Toast | - |
| `--typography-body-sm-weight` | Typography metric | 2 | TextBlock, Toast | - |
| `--typography-caption-md-leading` | Typography metric | 3 | AppActionSheet, InputField, MarkdownEditor | - |
| `--typography-caption-md-size` | Typography metric | 5 | AppActionSheet, AppNativePicker, InputField, MarkdownEditor | - |
| `--typography-caption-md-weight` | Typography metric | 2 | InputField, MarkdownEditor | - |
| `--typography-caption-sm-leading` | Typography metric | 2 | Divider, TextBlock | - |
| `--typography-caption-sm-size` | Typography metric | 3 | AppRangeSlider, Divider, TextBlock | - |
| `--typography-caption-sm-weight` | Typography metric | 2 | Divider, TextBlock | - |
| `--typography-cta-lg-leading` | Typography metric | 3 | Button, SegmentControlBar, Tabs | - |
| `--typography-cta-lg-size` | Typography metric | 3 | Button, SegmentControlBar, Tabs | - |
| `--typography-cta-lg-weight` | Typography metric | 3 | Button, SegmentControlBar, Tabs | - |
| `--typography-cta-md-leading` | Typography metric | 5 | AppNativePicker, Button, Chip, SegmentControlBar, Tabs | - |
| `--typography-cta-md-size` | Typography metric | 6 | AppAlertPopup, AppNativePicker, Button, Chip, SegmentControlBar, Tabs | - |
| `--typography-cta-md-weight` | Typography metric | 5 | AppNativePicker, Button, Chip, SegmentControlBar, Tabs | - |
| `--typography-cta-sm-leading` | Typography metric | 8 | AppNativePicker, Button, Chip, SegmentControlBar, Tabs, Toast | - |
| `--typography-cta-sm-size` | Typography metric | 8 | AppNativePicker, Button, Chip, SegmentControlBar, Tabs, Toast | - |
| `--typography-cta-sm-weight` | Typography metric | 8 | AppNativePicker, Button, Chip, SegmentControlBar, Tabs, Toast | - |
| `--typography-display-lg-leading` | Typography metric | 0 | - | - |
| `--typography-display-lg-size` | Typography metric | 0 | - | - |
| `--typography-display-lg-weight` | Typography metric | 0 | - | - |
| `--typography-display-md-leading` | Typography metric | 0 | - | - |
| `--typography-display-md-size` | Typography metric | 0 | - | - |
| `--typography-display-md-weight` | Typography metric | 0 | - | - |
| `--typography-display-sm-leading` | Typography metric | 0 | - | - |
| `--typography-display-sm-size` | Typography metric | 0 | - | - |
| `--typography-display-sm-weight` | Typography metric | 0 | - | - |
| `--typography-heading-lg-leading` | Typography metric | 0 | - | - |
| `--typography-heading-lg-size` | Typography metric | 0 | - | - |
| `--typography-heading-lg-weight` | Typography metric | 0 | - | - |
| `--typography-heading-md-leading` | Typography metric | 0 | - | - |
| `--typography-heading-md-size` | Typography metric | 0 | - | - |
| `--typography-heading-md-weight` | Typography metric | 0 | - | - |
| `--typography-heading-sm-leading` | Typography metric | 0 | - | - |
| `--typography-heading-sm-size` | Typography metric | 0 | - | - |
| `--typography-heading-sm-weight` | Typography metric | 0 | - | - |
| `--typography-link-lg-leading` | Typography metric | 0 | - | - |
| `--typography-link-lg-size` | Typography metric | 0 | - | - |
| `--typography-link-lg-weight` | Typography metric | 0 | - | - |
| `--typography-link-md-leading` | Typography metric | 0 | - | - |
| `--typography-link-md-size` | Typography metric | 0 | - | - |
| `--typography-link-md-weight` | Typography metric | 0 | - | - |
| `--typography-link-sm-leading` | Typography metric | 0 | - | - |
| `--typography-link-sm-size` | Typography metric | 0 | - | - |
| `--typography-link-sm-weight` | Typography metric | 0 | - | - |
| `--typography-overline-lg-leading` | Typography metric | 0 | - | - |
| `--typography-overline-lg-size` | Typography metric | 0 | - | - |
| `--typography-overline-lg-tracking` | Typography metric | 0 | - | - |
| `--typography-overline-lg-weight` | Typography metric | 0 | - | - |
| `--typography-overline-md-leading` | Typography metric | 0 | - | - |
| `--typography-overline-md-size` | Typography metric | 0 | - | - |
| `--typography-overline-md-tracking` | Typography metric | 0 | - | - |
| `--typography-overline-md-weight` | Typography metric | 0 | - | - |
| `--typography-overline-sm-leading` | Typography metric | 1 | TextBlock | - |
| `--typography-overline-sm-size` | Typography metric | 1 | TextBlock | - |
| `--typography-overline-sm-tracking` | Typography metric | 1 | TextBlock | - |
| `--typography-overline-sm-weight` | Typography metric | 1 | TextBlock | - |
| `--typography-title-lg-leading` | Typography metric | 0 | - | - |
| `--typography-title-lg-size` | Typography metric | 0 | - | - |
| `--typography-title-lg-weight` | Typography metric | 0 | - | - |
| `--typography-title-md-leading` | Typography metric | 0 | - | - |
| `--typography-title-md-size` | Typography metric | 0 | - | - |
| `--typography-title-md-weight` | Typography metric | 0 | - | - |
| `--typography-title-sm-leading` | Typography metric | 0 | - | - |
| `--typography-title-sm-size` | Typography metric | 3 | AdaptiveSheet, AppAlertPopup, AppBottomSheet | - |
| `--typography-title-sm-weight` | Typography metric | 0 | - | - |

## Components With Hardcoded or Non-Preferred Values

| Platform | Component | Total | Issue types | Example locations |
|---|---|---:|---|---|
| Web | AdaptiveNavShell | 2 | literal arbitrary value: 2 | `multi-repo-nextjs/app/components/Adaptive/AdaptiveNavShell.tsx:332` literal arbitrary value |
| Web | AppColorPicker | 1 | raw hex: 1 | `multi-repo-nextjs/app/components/Native/AppColorPicker.tsx:32` raw hex |
| Web | AppNativePicker | 1 | literal arbitrary value: 1 | `multi-repo-nextjs/app/components/Native/AppNativePicker.tsx:228` literal arbitrary value |
| Web | Badge | 2 | literal arbitrary value: 2 | `multi-repo-nextjs/app/components/Badge/Badge.tsx:110` literal arbitrary value |
| Web | Button | 21 | raw hex: 21 | `multi-repo-nextjs/app/components/Button/Button.tsx:86` raw hex |
| Web | ChatHistorySheet | 2 | literal arbitrary value: 2 | `multi-repo-nextjs/app/components/Chat/ChatHistorySheet.tsx:149` literal arbitrary value |
| Web | ChatInput | 1 | literal arbitrary value: 1 | `multi-repo-nextjs/app/components/Chat/ChatInput.tsx:74` literal arbitrary value |
| Web | ChatMessage | 2 | literal arbitrary value: 2 | `multi-repo-nextjs/app/components/Chat/ChatMessage.tsx:38` literal arbitrary value |
| Web | DateGrid | 6 | literal arbitrary value: 6 | `multi-repo-nextjs/app/components/DateGrid/DateGrid.tsx:131` literal arbitrary value |
| Web | DebugEventRow | 17 | raw color fn, raw hex: 14; literal arbitrary value: 3 | `multi-repo-nextjs/app/components/Chat/debug/DebugEventRow.tsx:9` raw color fn, raw hex<br>`multi-repo-nextjs/app/components/Chat/debug/DebugEventRow.tsx:57` literal arbitrary value |
| Web | DebugPanel | 37 | literal arbitrary value: 22; raw color fn, raw hex: 14; literal arbitrary value, raw hex: 1 | `multi-repo-nextjs/app/components/Chat/debug/DebugPanel.tsx:29` raw color fn, raw hex<br>`multi-repo-nextjs/app/components/Chat/debug/DebugPanel.tsx:161` literal arbitrary value<br>`multi-repo-nextjs/app/components/Chat/debug/DebugPanel.tsx:368` literal arbitrary value, raw hex |
| Web | EvolutionCard | 1 | literal arbitrary value: 1 | `multi-repo-nextjs/app/components/Chat/cards/EvolutionCard.tsx:42` literal arbitrary value |
| Web | Icon | 1 | legacy alias: 1 | `multi-repo-nextjs/app/components/icons/Icon.tsx:12` legacy alias |
| Web | InputField | 2 | literal arbitrary value: 2 | `multi-repo-nextjs/app/components/InputField/InputField.tsx:127` literal arbitrary value |
| Web | Lightbox | 2 | raw color fn: 2 | `multi-repo-nextjs/app/components/Chat/cards/Lightbox.tsx:30` raw color fn |
| Web | PokemonCard | 9 | raw hex: 7; literal arbitrary value: 2 | `multi-repo-nextjs/app/components/Chat/cards/PokemonCard.tsx:10` raw hex<br>`multi-repo-nextjs/app/components/Chat/cards/PokemonCard.tsx:51` literal arbitrary value |
| Web | StreamEventPill | 1 | literal arbitrary value: 1 | `multi-repo-nextjs/app/components/Chat/StreamEventPill.tsx:22` literal arbitrary value |
| Web | Tabs | 1 | literal arbitrary value: 1 | `multi-repo-nextjs/app/components/Tabs/Tabs.tsx:74` literal arbitrary value |
| Web | TeamCard | 21 | raw hex: 19; literal arbitrary value: 2 | `multi-repo-nextjs/app/components/Chat/cards/TeamCard.tsx:9` raw hex<br>`multi-repo-nextjs/app/components/Chat/cards/TeamCard.tsx:77` literal arbitrary value |
| Web | Thumbnail | 7 | literal arbitrary value: 7 | `multi-repo-nextjs/app/components/Thumbnail/Thumbnail.tsx:51` literal arbitrary value |
| Web | TypeMatchupCard | 21 | raw hex: 21 | `multi-repo-nextjs/app/components/Chat/cards/TypeMatchupCard.tsx:8` raw hex |
| iOS | AdaptiveNavShell | 6 | raw layout number: 5; raw clear: 1 | `multi-repo-ios/multi-repo-ios/Components/Adaptive/AdaptiveNavShell.swift:143` raw layout number<br>`multi-repo-ios/multi-repo-ios/Components/Adaptive/AdaptiveNavShell.swift:202` raw clear |
| iOS | AdaptiveSheet | 3 | raw layout number: 2; raw system color: 1 | `multi-repo-ios/multi-repo-ios/Components/Adaptive/AdaptiveSheet.swift:76` raw system color<br>`multi-repo-ios/multi-repo-ios/Components/Adaptive/AdaptiveSheet.swift:98` raw layout number |
| iOS | AppAlertPopup | 1 | raw layout number: 1 | `multi-repo-ios/multi-repo-ios/Components/Native/AppAlertPopup.swift:104` raw layout number |
| iOS | AppCarousel | 3 | raw layout number: 3 | `multi-repo-ios/multi-repo-ios/Components/Native/AppCarousel.swift:19` raw layout number |
| iOS | AppColorPicker | 1 | raw layout number: 1 | `multi-repo-ios/multi-repo-ios/Components/Native/AppColorPicker.swift:54` raw layout number |
| iOS | AppContextMenu | 3 | raw layout number: 3 | `multi-repo-ios/multi-repo-ios/Components/Native/AppContextMenu.swift:104` raw layout number |
| iOS | AppDateTimePicker | 1 | raw layout number: 1 | `multi-repo-ios/multi-repo-ios/Components/Native/AppDateTimePicker.swift:144` raw layout number |
| iOS | AppNativePicker | 3 | raw clear: 2; raw layout number: 1 | `multi-repo-ios/multi-repo-ios/Components/Native/AppNativePicker.swift:125` raw clear<br>`multi-repo-ios/multi-repo-ios/Components/Native/AppNativePicker.swift:222` raw layout number |
| iOS | AppProgressLoader | 1 | raw layout number: 1 | `multi-repo-ios/multi-repo-ios/Components/Native/AppProgressLoader.swift:90` raw layout number |
| iOS | AppRangeSlider | 5 | raw layout number: 5 | `multi-repo-ios/multi-repo-ios/Components/Native/AppRangeSlider.swift:191` raw layout number |
| iOS | AppTooltip | 2 | raw layout number: 2 | `multi-repo-ios/multi-repo-ios/Components/Native/AppTooltip.swift:96` raw layout number |
| iOS | Badge | 3 | raw layout number: 3 | `multi-repo-ios/multi-repo-ios/Components/Badge/AppBadge.swift:118` raw layout number |
| iOS | ChatHistoryView | 1 | raw clear: 1 | `multi-repo-ios/multi-repo-ios/Components/Chat/ChatHistoryView.swift:24` raw clear |
| iOS | ChatInputBar | 4 | raw layout number: 2; raw system color: 2 | `multi-repo-ios/multi-repo-ios/Components/Chat/ChatInputBar.swift:32` raw layout number<br>`multi-repo-ios/multi-repo-ios/Components/Chat/ChatInputBar.swift:36` raw system color |
| iOS | Checkbox | 6 | raw layout number: 5; raw clear: 1 | `multi-repo-ios/multi-repo-ios/Components/Checkbox/AppCheckbox.swift:86` raw layout number<br>`multi-repo-ios/multi-repo-ios/Components/Checkbox/AppCheckbox.swift:89` raw clear |
| iOS | Chip | 2 | raw system color: 1; raw layout number: 1 | `multi-repo-ios/multi-repo-ios/Components/Chip/AppChip.swift:186` raw system color<br>`multi-repo-ios/multi-repo-ios/Components/Chip/AppChip.swift:259` raw layout number |
| iOS | DateGrid | 8 | raw layout number: 7; raw clear: 1 | `multi-repo-ios/multi-repo-ios/Components/DateGrid/AppDateGrid.swift:77` raw layout number<br>`multi-repo-ios/multi-repo-ios/Components/DateGrid/AppDateGrid.swift:131` raw clear |
| iOS | Divider | 1 | raw layout number: 1 | `multi-repo-ios/multi-repo-ios/Components/Divider/AppDivider.swift:132` raw layout number |
| iOS | EvolutionCardView | 6 | raw layout number: 5; raw system color: 1 | `multi-repo-ios/multi-repo-ios/Components/Chat/Cards/EvolutionCardView.swift:21` raw layout number<br>`multi-repo-ios/multi-repo-ios/Components/Chat/Cards/EvolutionCardView.swift:64` raw system color |
| iOS | InputField | 2 | raw layout number: 2 | `multi-repo-ios/multi-repo-ios/Components/InputField/AppInputField.swift:367` raw layout number |
| iOS | MarkdownEditor | 40 | raw layout number: 23; raw clear: 11; raw system color: 6 | `multi-repo-ios/multi-repo-ios/Components/MarkdownEditor/MarkdownTextStorage.swift:61` raw clear<br>`multi-repo-ios/multi-repo-ios/Components/MarkdownEditor/AppMarkdownEditor.swift:450` raw system color<br>`multi-repo-ios/multi-repo-ios/Components/MarkdownEditor/MarkdownImageCropView.swift:100` raw layout number |
| iOS | PokemonCardView | 12 | raw layout number: 11; raw system color: 1 | `multi-repo-ios/multi-repo-ios/Components/Chat/Cards/PokemonCardView.swift:23` raw layout number<br>`multi-repo-ios/multi-repo-ios/Components/Chat/Cards/PokemonCardView.swift:121` raw system color |
| iOS | RadioButton | 3 | raw layout number: 2; raw clear: 1 | `multi-repo-ios/multi-repo-ios/Components/RadioButton/AppRadioButton.swift:121` raw layout number<br>`multi-repo-ios/multi-repo-ios/Components/RadioButton/AppRadioButton.swift:123` raw clear |
| iOS | SSEStreamEventView | 1 | raw layout number: 1 | `multi-repo-ios/multi-repo-ios/Components/Chat/SSEStreamEventView.swift:39` raw layout number |
| iOS | SegmentControlBar | 4 | raw layout number: 2; raw system color: 1; raw clear: 1 | `multi-repo-ios/multi-repo-ios/Components/SegmentControlBar/AppSegmentControlBar.swift:121` raw layout number<br>`multi-repo-ios/multi-repo-ios/Components/SegmentControlBar/AppSegmentControlBar.swift:152` raw system color<br>`multi-repo-ios/multi-repo-ios/Components/SegmentControlBar/AppSegmentControlBar.swift:198` raw clear |
| iOS | StepIndicator | 2 | raw clear: 1; raw layout number: 1 | `multi-repo-ios/multi-repo-ios/Components/Patterns/AppStepIndicator.swift:42` raw clear<br>`multi-repo-ios/multi-repo-ios/Components/Patterns/AppStepIndicator.swift:57` raw layout number |
| iOS | Stepper | 2 | raw layout number: 2 | `multi-repo-ios/multi-repo-ios/Components/Patterns/AppStepper.swift:99` raw layout number |
| iOS | Tabs | 1 | raw clear: 1 | `multi-repo-ios/multi-repo-ios/Components/Tabs/AppTabs.swift:138` raw clear |
| iOS | TeamCardView | 13 | raw layout number: 12; raw system color: 1 | `multi-repo-ios/multi-repo-ios/Components/Chat/Cards/TeamCardView.swift:39` raw system color<br>`multi-repo-ios/multi-repo-ios/Components/Chat/Cards/TeamCardView.swift:45` raw layout number |
| iOS | Toast | 2 | raw layout number: 2 | `multi-repo-ios/multi-repo-ios/Components/Toast/AppToast.swift:167` raw layout number |
| iOS | TypeMatchupCardView | 5 | raw layout number: 4; raw system color: 1 | `multi-repo-ios/multi-repo-ios/Components/Chat/Cards/TypeMatchupCardView.swift:61` raw layout number<br>`multi-repo-ios/multi-repo-ios/Components/Chat/Cards/TypeMatchupCardView.swift:71` raw system color |

## Notable Findings

- No component files directly use primitive `--color-*` CSS variables.
- One web component uses a legacy alias: `app/components/icons/Icon.tsx` references `var(--icon-primary)` instead of `var(--icons-primary)`.
- The largest raw color clusters are in chat/debug/card UI: `DebugPanel`, `DebugEventRow`, `PokemonCard`, `TeamCard`, and `TypeMatchupCard`.
- iOS has many raw layout numbers, especially inside MarkdownEditor internals and chat/card views; some may be acceptable geometry, but they are not tokenized.
- `Color.clear` / `UIColor.clear` is counted separately as a raw clear value; it is often benign but still bypasses semantic tokens.
