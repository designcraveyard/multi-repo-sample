# Design Token Specification

Canonical reference for all shared design tokens.
Sourced from **Figma "bubbles-kit" › Semantic collection** (NeutralLight = light mode | NeutralDark = dark mode).

**Source of truth:** `multi-repo-nextjs/app/globals.css` (CSS custom properties)
**iOS output:** `multi-repo-ios/multi-repo-ios/DesignTokens.swift`
**Android output:** `multi-repo-android/app/src/main/java/.../ui/theme/DesignTokens.kt`
**Figma file:** `bubbles-kit` (key: `ZtcCQT96M2dJZjU35X8uMQ`) › Semantic collection

_Run `/design-token-sync` after any change to `globals.css` to regenerate the Swift file and update this table._

---

## Surfaces

| CSS Variable | Swift Name | Kotlin Name | Light Value | Dark Value | Semantic Meaning |
|-------------|-----------|-------------|-------------|------------|------------------|
| `--surface-base-primary` | `Color.appSurfaceBasePrimary` | `SemanticColors.surfacesBasePrimary` | `#FFFFFF` | `#000000` | Primary background |
| `--surface-base-low-contrast` | `Color.appSurfaceBaseLowContrast` | `SemanticColors.surfacesBaseLowContrast` | `#F5F5F5` | `#171717` | Subtle background (slightly different from primary) |
| `--surface-base-high-contrast` | `Color.appSurfaceBaseHighContrast` | `SemanticColors.surfacesBaseHighContrast` | `#E5E5E5` | `#262626` | **DEPRECATED: Use border tokens instead.** Higher contrast surface (see note below) |
| `--surface-inverse-primary` | `Color.appSurfaceInversePrimary` | `SemanticColors.surfacesInversePrimary` | `#000000` | `#FFFFFF` |
| `--surface-inverse-low-contrast` | `Color.appSurfaceInverseLowContrast` | `SemanticColors.surfacesInverseLowContrast` | `#171717` | `#F5F5F5` |
| `--surface-inverse-high-contrast` | `Color.appSurfaceInverseHighContrast` | `SemanticColors.surfacesInverseHighContrast` | `#262626` | `#E5E5E5` |
| `--surface-brand` | `Color.appSurfaceBrand` | `SemanticColors.surfacesBrand` | `#09090B` | `#FAFAFA` |
| `--surface-brand-low-contrast` | `Color.appSurfaceBrandLowContrast` | `SemanticColors.surfacesBrandLowContrast` | `#E4E4E7` | `#27272A` |
| `--surface-brand-high-contrast` | `Color.appSurfaceBrandHighContrast` | `SemanticColors.surfacesBrandHighContrast` | `#D4D4D8` | `#3F3F46` |
| `--surface-brand-hover` | `Color.appSurfaceBrandHover` | `SemanticColors.surfacesBrandHover` | `#27272A` | `#E4E4E7` |
| `--surface-brand-pressed` | `Color.appSurfaceBrandPressed` | `SemanticColors.surfacesBrandPressed` | `#3F3F46` | `#A1A1AA` |
| `--surface-accent-primary` | `Color.appSurfaceAccentPrimary` | `SemanticColors.surfacesAccentPrimary` | `#4F46E5` | `#818CF8` |
| `--surface-accent-low-contrast` | `Color.appSurfaceAccentLowContrast` | `SemanticColors.surfacesAccentLowContrast` | `#C7D2FE` | `#3730A3` |
| `--surface-accent-high-contrast` | `Color.appSurfaceAccentHighContrast` | `SemanticColors.surfacesAccentHighContrast` | `#A5B4FC` | `#4338CA` |
| `--surface-success-solid` | `Color.appSurfaceSuccessSolid` | `SemanticColors.surfacesSuccessSolid` | `#16A34A` | `#86EFAC` |
| `--surface-success-subtle` | `Color.appSurfaceSuccessSubtle` | `SemanticColors.surfacesSuccessSubtle` | `#DCFCE7` | `#052E16` |
| `--surface-warning-solid` | `Color.appSurfaceWarningSolid` | `SemanticColors.surfacesWarningSolid` | `#D97706` | `#FCD34D` |
| `--surface-warning-subtle` | `Color.appSurfaceWarningSubtle` | `SemanticColors.surfacesWarningSubtle` | `#FEF3C7` | `#431407` |
| `--surface-error-solid` | `Color.appSurfaceErrorSolid` | `SemanticColors.surfacesErrorSolid` | `#DC2626` | `#FCA5A5` |
| `--surface-error-subtle` | `Color.appSurfaceErrorSubtle` | `SemanticColors.surfacesErrorSubtle` | `#FEE2E2` | `#450A0A` |

### Important: Semantic Token Guidelines

**DO NOT** use `Surfaces/BaseHighContrast` and `Surfaces/BaseLowContrastPressed` interchangeably, even if they share the same hex value. They have distinct semantic meanings:

| Token | Semantic Meaning | Use Cases | Do NOT Use For |
|-------|-----------------|-----------|----------------|
| `BaseLowContrastPressed` | State after user interaction; indicates a "pressed" or activated state | Chip active state, button press feedback | Borders, dividers, structural lines |
| `BaseHighContrast` | Higher visual prominence / more distinguishable from primary surface | ~~Borders~~ (use `Border/*` tokens instead) | Structural elements — use `Border/Default` or `Border/Muted` |

**Rule:** For dividers, borders, and separators → always use `Border/Default` or `Border/Muted`, never `BaseHighContrast` or `BaseLowContrastPressed`.

---

## Typography Colors

| CSS Variable | Swift Name | Kotlin Name | Light Value | Dark Value |
|-------------|-----------|-------------|-------------|------------|
| `--text-primary` | `Color.appTextPrimary` | `SemanticColors.typographyPrimary` | `#0F172A` | `#F8FAFC` |
| `--text-secondary` | `Color.appTextSecondary` | `SemanticColors.typographySecondary` | `#334155` | `#CBD5E1` |
| `--text-muted` | `Color.appTextMuted` | `SemanticColors.typographyMuted` | `#64748B` | `#94A3B8` |
| `--text-inverse-primary` | `Color.appTextInversePrimary` | `SemanticColors.typographyInversePrimary` | `#F8FAFC` | `#020617` |
| `--text-inverse-secondary` | `Color.appTextInverseSecondary` | `SemanticColors.typographyInverseSecondary` | `#CBD5E1` | `#334155` |
| `--text-inverse-muted` | `Color.appTextInverseMuted` | `SemanticColors.typographyInverseMuted` | `#64748B` | `#64748B` |
| `--text-brand` | `Color.appTextBrand` | `SemanticColors.typographyBrand` | `#09090B` | `#FAFAFA` |
| `--text-on-brand-primary` | `Color.appTextOnBrandPrimary` | `SemanticColors.typographyOnBrandPrimary` | `#FFFFFF` | `#000000` |
| `--text-accent` | `Color.appTextAccent` | `SemanticColors.typographyAccent` | `#4F46E5` | `#818CF8` |
| `--text-success` | `Color.appTextSuccess` | `SemanticColors.typographySuccess` | `#15803D` | `#4ADE80` |
| `--text-warning` | `Color.appTextWarning` | `SemanticColors.typographyWarning` | `#B45309` | `#FBBF24` |
| `--text-error` | `Color.appTextError` | `SemanticColors.typographyError` | `#B91C1C` | `#F87171` |

---

## Icon Colors

| CSS Variable | Swift Name | Kotlin Name | Light Value | Dark Value |
|-------------|-----------|-------------|-------------|------------|
| `--icon-primary` | `Color.appIconPrimary` | `SemanticColors.iconsPrimary` | `#020617` | `#F8FAFC` |
| `--icon-secondary` | `Color.appIconSecondary` | `SemanticColors.iconsSecondary` | `#475569` | `#94A3B8` |
| `--icon-muted` | `Color.appIconMuted` | `SemanticColors.iconsMuted` | `#94A3B8` | `#334155` |
| `--icon-inverse-primary` | `Color.appIconInversePrimary` | `SemanticColors.iconsInversePrimary` | `#F8FAFC` | `#020617` |
| `--icon-inverse-secondary` | `Color.appIconInverseSecondary` | `SemanticColors.iconsInverseSecondary` | `#94A3B8` | `#475569` |
| `--icon-inverse-muted` | `Color.appIconInverseMuted` | `SemanticColors.iconsInverseMuted` | `#1E293B` | `#94A3B8` |
| `--icon-brand` | `Color.appIconBrand` | `SemanticColors.iconsBrand` | `#09090B` | `#FAFAFA` |
| `--icon-on-brand-primary` | `Color.appIconOnBrandPrimary` | `SemanticColors.iconsOnBrandPrimary` | `#F8FAFC` | `#020617` |
| `--icon-success` | `Color.appIconSuccess` | `SemanticColors.iconsSuccess` | `#16A34A` | `#4ADE80` |
| `--icon-warning` | `Color.appIconWarning` | `SemanticColors.iconsWarning` | `#F59E0B` | `#FBBF24` |
| `--icon-error` | `Color.appIconError` | `SemanticColors.iconsError` | `#EF4444` | `#F87171` |

---

## Border Colors

| CSS Variable | Swift Name | Kotlin Name | Light Value | Dark Value |
|-------------|-----------|-------------|-------------|------------|
| `--border-default` | `Color.appBorderDefault` | `SemanticColors.borderDefault` | `#E5E5E5` | `#1E293B` |
| `--border-muted` | `Color.appBorderMuted` | `SemanticColors.borderMuted` | `#F5F5F5` | `#0F172A` |
| `--border-active` | `Color.appBorderActive` | `SemanticColors.borderActive` | `#020617` | `#F8FAFC` |
| `--border-brand` | `Color.appBorderBrand` | `SemanticColors.borderBrand` | `#09090B` | `#FAFAFA` |
| `--border-success` | `Color.appBorderSuccess` | `SemanticColors.borderSuccess` | `#16A34A` | `#86EFAC` |
| `--border-warning` | `Color.appBorderWarning` | `SemanticColors.borderWarning` | `#D97706` | `#FCD34D` |
| `--border-error` | `Color.appBorderError` | `SemanticColors.borderError` | `#DC2626` | `#FCA5A5` |

---

## Legacy Aliases

These CSS variables are kept for backwards compatibility. They resolve to the semantic tokens above.

| CSS Variable | Resolves To | Swift Alias |
|-------------|------------|------------|
| `--background` | `--surface-base-primary` | `Color.appBackground` |
| `--foreground` | `--text-primary` | `Color.appForeground` |

---

## Radius Tokens

Sourced from Figma **Simantic-Dimensions** collection. Mobile values are the CSS default; Desktop values apply at `min-width: 768px`. iOS always uses the Mobile tier.

| CSS Variable | Swift Name | Kotlin Name | Mobile | Desktop |
|-------------|-----------|-------------|--------|---------|
| `--radius-none` | `CGFloat.radiusNone` | `Radius.none` | `0px`    | `0px`    |
| `--radius-xs`   | `CGFloat.radiusXS`   | `Radius.xs`   | `4px`    | `8px`    |
| `--radius-sm`   | `CGFloat.radiusSM`   | `Radius.sm`   | `8px`    | `12px`   |
| `--radius-md`   | `CGFloat.radiusMD`   | `Radius.md`   | `12px`   | `16px`   |
| `--radius-lg`   | `CGFloat.radiusLG`   | `Radius.lg`   | `16px`   | `24px`   |
| `--radius-xl`   | `CGFloat.radiusXL`   | `Radius.xl`   | `24px`   | `32px`   |
| `--radius-2xl`  | `CGFloat.radius2XL`  | `Radius.xl2`  | `32px`   | `48px`   |
| `--radius-full` | `.clipShape(Capsule())` | `Radius.full` | `9999px` | `9999px` |

**Web:** `rounded-md` (Tailwind `@theme`) or `rounded-[var(--radius-md)]`
**iOS:** `.cornerRadius(CGFloat.radiusMD)` or `.clipShape(RoundedRectangle(cornerRadius: .radiusLG))`

---

## Spacing Tokens

Sourced from Figma **Primitives/Dimensions** 4px grid. Naming mirrors Tailwind's numeric scale: `--space-N = N × 4px`.

| CSS Variable | Tailwind Utility | iOS `CGFloat` | Android Kotlin | Value |
|-------------|-----------------|--------------|----------------|-------|
| `--space-1`  | `p-1`, `gap-1`   | `CGFloat.space1`  | `Spacing.space1`  | 4px  |
| `--space-2`  | `p-2`, `gap-2`   | `CGFloat.space2`  | `Spacing.space2`  | 8px  |
| `--space-3`  | `p-3`, `gap-3`   | `CGFloat.space3`  | `Spacing.space3`  | 12px |
| `--space-4`  | `p-4`, `gap-4`   | `CGFloat.space4`  | `Spacing.space4`  | 16px |
| `--space-5`  | `p-5`, `gap-5`   | `CGFloat.space5`  | `Spacing.space5`  | 20px |
| `--space-6`  | `p-6`, `gap-6`   | `CGFloat.space6`  | `Spacing.space6`  | 24px |
| `--space-8`  | `p-8`, `gap-8`   | `CGFloat.space8`  | `Spacing.space8`  | 32px |
| `--space-10` | `p-10`, `gap-10` | `CGFloat.space10` | `Spacing.space10` | 40px |
| `--space-12` | `p-12`, `gap-12` | `CGFloat.space12` | `Spacing.space12` | 48px |
| `--space-16` | `p-16`, `gap-16` | `CGFloat.space16` | `Spacing.space16` | 64px |
| `--space-20` | `p-20`, `gap-20` | `CGFloat.space20` | `Spacing.space20` | 80px |
| `--space-24` | `p-24`, `gap-24` | `CGFloat.space24` | `Spacing.space24` | 96px |

**Legacy aliases** (still valid): `spaceXS`=4 · `spaceSM`=8 · `spaceMD`=16 · `spaceLG`=24 · `spaceXL`=32 · `space2XL`=48

**Web:** Prefer Tailwind utilities (`p-4`, `gap-6`). Use `var(--space-4)` in custom CSS when explicit token reference is needed.
**iOS:** `.padding(CGFloat.space4)`, `VStack(spacing: CGFloat.space3)`, `.frame(width: CGFloat.space16)`

---

## Typography Tokens

Sourced from Figma **"🎨 Tokens & Styles"** page (node `18:577`). Font family: **Inter** (Figma) → **Geist Sans** on web → **System font** on iOS.

Each role exposes three CSS vars: `--typography-{role}-size`, `--typography-{role}-leading`, `--typography-{role}-weight`. Overline roles also expose `--typography-{role}-tracking`.

**Web:** Use Tailwind size utilities via `@theme` (e.g. `text-title-lg`) or compose from individual vars.
**iOS:** `.font(.appTitleLarge)`. Overline needs `.tracking(1)` or `.tracking(2)` modifier.

### Display

| Role | Size | Line-height | Weight | CSS Var Suffix | Swift Name | Kotlin Name |
|------|------|-------------|--------|---------------|-----------|-------------|
| DisplayText/Large  | 96px | 128px | 400 | `display-lg` | `Font.appDisplayLarge` | `AppTypography.displayLarge` |
| DisplayText/Medium | 80px | 96px  | 400 | `display-md` | `Font.appDisplayMedium` | `AppTypography.displayMedium` |
| DisplayText/Small  | 64px | 96px  | 400 | `display-sm` | `Font.appDisplaySmall` | `AppTypography.displaySmall` |

### Heading

| Role | Size | Line-height | Weight | CSS Var Suffix | Swift Name | Kotlin Name |
|------|------|-------------|--------|---------------|-----------|-------------|
| Heading/Large  | 56px | 64px | 700 Bold | `heading-lg` | `Font.appHeadingLarge` | `AppTypography.headingLarge` |
| Heading/Medium | 48px | 56px | 700 Bold | `heading-md` | `Font.appHeadingMedium` | `AppTypography.headingMedium` |
| Heading/Small  | 40px | 44px | 700 Bold | `heading-sm` | `Font.appHeadingSmall` | `AppTypography.headingSmall` |

### Title

| Role | Size | Line-height | Weight | CSS Var Suffix | Swift Name | Kotlin Name |
|------|------|-------------|--------|---------------|-----------|-------------|
| Title/Large  | 28px | 32px | 700 Bold | `title-lg` | `Font.appTitleLarge` | `AppTypography.titleLarge` |
| Title/Medium | 24px | 28px | 700 Bold | `title-md` | `Font.appTitleMedium` | `AppTypography.titleMedium` |
| Title/Small  | 20px | 24px | 700 Bold | `title-sm` | `Font.appTitleSmall` | `AppTypography.titleSmall` |

### Body

| Role | Size | Line-height | Weight | CSS Var Suffix | Swift Name | Kotlin Name |
|------|------|-------------|--------|---------------|-----------|-------------|
| Body/Large            | 16px | 24px | 400 Regular | `body-lg`    | `Font.appBodyLarge` | `AppTypography.bodyLarge` |
| Body/Medium           | 14px | 20px | 400 Regular | `body-md`    | `Font.appBodyMedium` | `AppTypography.bodyMedium` |
| Body/Small            | 12px | 16px | 400 Regular | `body-sm`    | `Font.appBodySmall` | `AppTypography.bodySmall` |
| Body/LargeEmphasized  | 16px | 24px | 500 Medium  | `body-lg-em` | `Font.appBodyLargeEm` | `AppTypography.bodyLargeEm` |
| Body/MediumEmphasized | 14px | 20px | 500 Medium  | `body-md-em` | `Font.appBodyMediumEm` | `AppTypography.bodyMediumEm` |
| Body/SmallEmphasized  | 12px | 16px | 500 Medium  | `body-sm-em` | `Font.appBodySmallEm` | `AppTypography.bodySmallEm` |

### CTA / Link

| Role | Size | Line-height | Weight | CSS Var Suffix | Swift Name | Kotlin Name |
|------|------|-------------|--------|---------------|-----------|-------------|
| CTA/Large   | 16px | 24px | 600 SemiBold | `cta-lg`  | `Font.appCTALarge` | `AppTypography.ctaLarge` |
| CTA/Medium  | 14px | 20px | 600 SemiBold | `cta-md`  | `Font.appCTAMedium` | `AppTypography.ctaMedium` |
| CTA/Small   | 12px | 16px | 600 SemiBold | `cta-sm`  | `Font.appCTASmall` | `AppTypography.ctaSmall` |
| Link/Large  | 16px | 24px | 500 Medium   | `link-lg` | `Font.appLinkLarge` | `AppTypography.linkLarge` |
| Link/Medium | 14px | 20px | 500 Medium   | `link-md` | `Font.appLinkMedium` | `AppTypography.linkMedium` |
| Link/Small  | 12px | 16px | 500 Medium   | `link-sm` | `Font.appLinkSmall` | `AppTypography.linkSmall` |

### Caption / Badge / Overline

| Role | Size | Line-height | Weight | Tracking | CSS Var Suffix | Swift Name | Kotlin Name |
|------|------|-------------|--------|---------|---------------|-----------|-------------|
| Caption/Medium  | 12px | 16px | 400 Regular  | —    | `caption-md`   | `Font.appCaptionMedium` | `AppTypography.captionMedium` |
| Caption/Small   | 10px | 12px | 400 Regular  | —    | `caption-sm`   | `Font.appCaptionSmall` | `AppTypography.captionSmall` |
| Badge/Medium    | 10px | 12px | 600 SemiBold | —    | `badge-md`     | `Font.appBadgeMedium` | `AppTypography.badgeMedium` |
| Badge/Small     |  8px | 10px | 600 SemiBold | —    | `badge-sm`     | `Font.appBadgeSmall` | `AppTypography.badgeSmall` |
| Overline/Small  |  8px | 12px | 700 Bold     | 1px  | `overline-sm`  | `Font.appOverlineSmall` | `AppTypography.overlineSmall` |
| Overline/Medium | 10px | 12px | 700 Bold     | 1px  | `overline-md`  | `Font.appOverlineMedium` | `AppTypography.overlineMedium` |
| Overline/Large  | 12px | 16px | 700 Bold     | 2px  | `overline-lg`  | `Font.appOverlineLarge` | `AppTypography.overlineLarge` |

_Web uses Geist Sans (loaded via `next/font`). iOS uses system default — closest visual match._

**Legacy Font aliases:** `Font.appTitle` → `appTitleLarge` · `Font.appBody` → `appBodyLarge` · `Font.appCaption` → `appCaptionMedium`

---

## Naming Convention

| CSS Variable Pattern | Swift Name Pattern | Kotlin Pattern | Example |
|---------------------|-------------------|----------------|---------|
| `--surface-base-primary` | `Color.appSurfaceBasePrimary` | `SemanticColors.surfacesBasePrimary` | Page background |
| `--surface-brand` | `Color.appSurfaceBrand` | `SemanticColors.surfacesBrand` | Brand-coloured elements |
| `--surface-accent-primary` | `Color.appSurfaceAccentPrimary` | `SemanticColors.surfacesAccentPrimary` | CTA buttons |
| `--text-primary` | `Color.appTextPrimary` | `SemanticColors.typographyPrimary` | Body copy |
| `--text-accent` | `Color.appTextAccent` | `SemanticColors.typographyAccent` | Links, highlights |
| `--icon-primary` | `Color.appIconPrimary` | `SemanticColors.iconsPrimary` | Default icons |
| `--border-default` | `Color.appBorderDefault` | `SemanticColors.borderDefault` | Cards, dividers |
| `--border-error` | `Color.appBorderError` | `SemanticColors.borderError` | Error states |
| `--radius-md` | `CGFloat.radiusMD` | `Radius.md` | Card corner radius |
| `--space-4` | `CGFloat.space4` | `Spacing.space4` | Standard component padding |
| `--typography-title-lg-size` | `Font.appTitleLarge` | `AppTypography.titleLarge` | Page title |

---

## Icon System

**Library:** [Phosphor Icons](https://phosphoricons.com/) — open-source, 6 weights, 1000+ icons. Same icon set used in Figma, web, and iOS.

### Icon Size Tokens

Both platforms use the same 5 named sizes:

| Token | px / pt | Web (`IconSize`) | iOS (`PhosphorIconSize`) | Android |
|-------|---------|-----------------|--------------------------|---------|
| `xs`  | 12      | `"xs"`          | `.xs`                    | `IconSize.xs` |
| `sm`  | 16      | `"sm"`          | `.sm`                    | `IconSize.sm` |
| `md`  | 20 _(default)_ | `"md"` | `.md`              | `IconSize.md` _(default)_ |
| `lg`  | 24      | `"lg"`          | `.lg`                    | `IconSize.lg` |
| `xl`  | 32      | `"xl"`          | `.xl`                    | `IconSize.xl` |

**Android usage:** `AppIcon(name = "House", size = IconSize.Md)` (Phosphor Compose package — placeholder until library is wired)

### Icon Weight Tokens

| Weight     | Web (`IconWeight`)  | iOS (`Ph.IconWeight`) | Android | Notes              |
|------------|--------------------|-----------------------|---------|--------------------|
| `thin`     | `"thin"`           | `.thin`               | `Thin` (Material Icons fallback) | Lightest stroke    |
| `light`    | `"light"`          | `.light`              | `Outlined` (Material Icons fallback) |                    |
| `regular`  | `"regular"` _(default)_ | `.regular` _(default)_ | `Default` _(default)_ | Use for most UI |
| `bold`     | `"bold"`           | `.bold`               | `Rounded` (Material Icons fallback) | Emphasis           |
| `fill`     | `"fill"`           | `.fill`               | `Filled` (Material Icons fallback) | Active/selected state |
| `duotone`  | `"duotone"`        | `.duotone`            | `TwoTone` (Material Icons fallback) | Two-tone (accent + base) |

_Android weight mapping is a placeholder using Material Icons until the Phosphor Compose package is integrated._

### Package Setup

**Web** (`multi-repo-nextjs`):
```bash
npm install @phosphor-icons/react
```
```typescript
// next.config.ts — prevents compiling all ~9000 icons in dev
experimental: { optimizePackageImports: ["@phosphor-icons/react"] }
```

**iOS** (`multi-repo-ios`):
SPM: `https://github.com/phosphor-icons/swift` · upToNextMajorVersion `2.0.0`

### Web Usage

Always use the typed `<Icon />` wrapper — **never** import Phosphor icons directly:

```tsx
import { Icon } from "@/app/components/icons";

// Basic — defaults: weight="regular", size="md" (20px), color="currentColor"
<Icon name="House" />

// With tokens
<Icon name="Heart" weight="fill" size="lg" color="var(--icon-error)" />

// Accessible icon (adds aria-label; icon is visible to screen readers)
<Icon name="Bell" label="Notifications" />

// Raw px size (use sparingly)
<Icon name="ArrowRight" size={18} />
```

Accepted color values: CSS custom properties (`var(--icon-primary)`), hex, or any CSS color string.

### iOS Usage

Icons are accessed as `Ph.<name>.<weight>` — each returns a SwiftUI `View`. Chain the token helpers from `PhosphorIconHelper.swift`:

```swift
import PhosphorSwift

// Basic — regular weight, md size (20pt), inherits foreground color
Ph.house.regular.iconSize(.md)

// With size and color tokens
Ph.heart.fill.iconSize(.lg).iconColor(.appError)

// Bold weight, small size
Ph.arrowRight.bold.iconSize(.sm)

// Accessible (adds VoiceOver label; decorative when nil)
Ph.bell.regular.iconSize(.md).iconAccessibility(label: "Notifications")

// Raw pt size (use sparingly)
Ph.star.regular.iconSize(18)

// Raw Phosphor API (advanced — when token helpers don't fit)
Ph.house.regular.color(.appIconPrimary).frame(width: 24, height: 24)
```

**Overline + icon letter-spacing:** SwiftUI `Font` cannot bake in tracking. Apply `.tracking(1)` or `.tracking(2)` on adjacent `Text` nodes when pairing overline type with icons.

### Color Token Integration

Use icon color tokens from `DesignTokens.swift` / `globals.css` / `DesignTokens.kt`:

| Semantic role | Web CSS var | iOS Swift | Android |
|---------------|------------|-----------|---------|
| Default icon  | `var(--icon-primary)` | `Color.appIconPrimary` | `SemanticColors.iconsPrimary` |
| Secondary     | `var(--icon-secondary)` | `Color.appIconSecondary` | `SemanticColors.iconsSecondary` |
| Muted         | `var(--icon-muted)` | `Color.appIconMuted` | `SemanticColors.iconsMuted` |
| Error         | `var(--icon-error)` | `Color.appIconError` | `SemanticColors.iconsError` |
| Success       | `var(--icon-success)` | `Color.appIconSuccess` | `SemanticColors.iconsSuccess` |
| Warning       | `var(--icon-warning)` | `Color.appIconWarning` | `SemanticColors.iconsWarning` |
| On-brand      | `var(--icon-on-brand-primary)` | `Color.appIconOnBrandPrimary` | `SemanticColors.iconsOnBrandPrimary` |

### Figma → Code Mapping

When implementing icons from Figma:
1. Note the **icon name** (PascalCase in Figma sidebar, e.g. `House`, `ArrowRight`)
2. Note the **weight** layer in Figma (Regular / Fill / Bold etc.)
3. Note the **size** from Figma Dimensions — map to nearest token (`xs`/`sm`/`md`/`lg`/`xl`)
4. Use the color variable from the Figma token, not a hardcoded hex
