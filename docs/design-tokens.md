# Design Token Specification

Canonical reference for all shared design tokens.
Sourced from **Figma "bubbles-kit" › Semantic collection** (NeutralLight = light mode | NeutralDark = dark mode).

**Source of truth:** `multi-repo-nextjs/app/globals.css` (CSS custom properties)
**iOS output:** `multi-repo-ios/multi-repo-ios/DesignTokens.swift`
**Figma file:** `bubbles-kit` (key: `ZtcCQT96M2dJZjU35X8uMQ`) › Semantic collection

_Run `/design-token-sync` after any change to `globals.css` to regenerate the Swift file and update this table._

---

## Surfaces

| CSS Variable | Swift Name | Light Value | Dark Value |
|-------------|-----------|-------------|------------|
| `--surface-base-primary` | `Color.appSurfaceBasePrimary` | `#FFFFFF` | `#000000` |
| `--surface-base-low-contrast` | `Color.appSurfaceBaseLowContrast` | `#F5F5F5` | `#171717` |
| `--surface-base-high-contrast` | `Color.appSurfaceBaseHighContrast` | `#E5E5E5` | `#262626` |
| `--surface-inverse-primary` | `Color.appSurfaceInversePrimary` | `#000000` | `#FFFFFF` |
| `--surface-inverse-low-contrast` | `Color.appSurfaceInverseLowContrast` | `#171717` | `#F5F5F5` |
| `--surface-inverse-high-contrast` | `Color.appSurfaceInverseHighContrast` | `#262626` | `#E5E5E5` |
| `--surface-brand` | `Color.appSurfaceBrand` | `#09090B` | `#FAFAFA` |
| `--surface-brand-low-contrast` | `Color.appSurfaceBrandLowContrast` | `#E4E4E7` | `#27272A` |
| `--surface-brand-high-contrast` | `Color.appSurfaceBrandHighContrast` | `#D4D4D8` | `#3F3F46` |
| `--surface-brand-hover` | `Color.appSurfaceBrandHover` | `#27272A` | `#E4E4E7` |
| `--surface-brand-pressed` | `Color.appSurfaceBrandPressed` | `#09090B` | `#A1A1AA` |
| `--surface-accent-primary` | `Color.appSurfaceAccentPrimary` | `#4F46E5` | `#818CF8` |
| `--surface-accent-low-contrast` | `Color.appSurfaceAccentLowContrast` | `#C7D2FE` | `#3730A3` |
| `--surface-accent-high-contrast` | `Color.appSurfaceAccentHighContrast` | `#A5B4FC` | `#4338CA` |
| `--surface-success-solid` | `Color.appSurfaceSuccessSolid` | `#16A34A` | `#86EFAC` |
| `--surface-success-subtle` | `Color.appSurfaceSuccessSubtle` | `#DCFCE7` | `#052E16` |
| `--surface-warning-solid` | `Color.appSurfaceWarningSolid` | `#D97706` | `#FCD34D` |
| `--surface-warning-subtle` | `Color.appSurfaceWarningSubtle` | `#FEF3C7` | `#431407` |
| `--surface-error-solid` | `Color.appSurfaceErrorSolid` | `#DC2626` | `#FCA5A5` |
| `--surface-error-subtle` | `Color.appSurfaceErrorSubtle` | `#FEE2E2` | `#450A0A` |

---

## Typography Colors

| CSS Variable | Swift Name | Light Value | Dark Value |
|-------------|-----------|-------------|------------|
| `--text-primary` | `Color.appTextPrimary` | `#0F172A` | `#F8FAFC` |
| `--text-secondary` | `Color.appTextSecondary` | `#334155` | `#CBD5E1` |
| `--text-muted` | `Color.appTextMuted` | `#64748B` | `#94A3B8` |
| `--text-inverse-primary` | `Color.appTextInversePrimary` | `#F8FAFC` | `#020617` |
| `--text-inverse-secondary` | `Color.appTextInverseSecondary` | `#CBD5E1` | `#334155` |
| `--text-inverse-muted` | `Color.appTextInverseMuted` | `#64748B` | `#64748B` |
| `--text-brand` | `Color.appTextBrand` | `#09090B` | `#FAFAFA` |
| `--text-on-brand-primary` | `Color.appTextOnBrandPrimary` | `#FFFFFF` | `#000000` |
| `--text-accent` | `Color.appTextAccent` | `#4F46E5` | `#818CF8` |
| `--text-success` | `Color.appTextSuccess` | `#15803D` | `#4ADE80` |
| `--text-warning` | `Color.appTextWarning` | `#B45309` | `#FBBF24` |
| `--text-error` | `Color.appTextError` | `#B91C1C` | `#F87171` |

---

## Icon Colors

| CSS Variable | Swift Name | Light Value | Dark Value |
|-------------|-----------|-------------|------------|
| `--icon-primary` | `Color.appIconPrimary` | `#020617` | `#F8FAFC` |
| `--icon-secondary` | `Color.appIconSecondary` | `#475569` | `#94A3B8` |
| `--icon-muted` | `Color.appIconMuted` | `#94A3B8` | `#334155` |
| `--icon-inverse-primary` | `Color.appIconInversePrimary` | `#F8FAFC` | `#020617` |
| `--icon-inverse-secondary` | `Color.appIconInverseSecondary` | `#94A3B8` | `#475569` |
| `--icon-inverse-muted` | `Color.appIconInverseMuted` | `#1E293B` | `#94A3B8` |
| `--icon-brand` | `Color.appIconBrand` | `#09090B` | `#FAFAFA` |
| `--icon-on-brand-primary` | `Color.appIconOnBrandPrimary` | `#F8FAFC` | `#020617` |
| `--icon-success` | `Color.appIconSuccess` | `#16A34A` | `#4ADE80` |
| `--icon-warning` | `Color.appIconWarning` | `#F59E0B` | `#FBBF24` |
| `--icon-error` | `Color.appIconError` | `#EF4444` | `#F87171` |

---

## Border Colors

| CSS Variable | Swift Name | Light Value | Dark Value |
|-------------|-----------|-------------|------------|
| `--border-default` | `Color.appBorderDefault` | `#E5E5E5` | `#1E293B` |
| `--border-muted` | `Color.appBorderMuted` | `#F5F5F5` | `#0F172A` |
| `--border-active` | `Color.appBorderActive` | `#020617` | `#F8FAFC` |
| `--border-brand` | `Color.appBorderBrand` | `#09090B` | `#FAFAFA` |
| `--border-success` | `Color.appBorderSuccess` | `#16A34A` | `#86EFAC` |
| `--border-warning` | `Color.appBorderWarning` | `#D97706` | `#FCD34D` |
| `--border-error` | `Color.appBorderError` | `#DC2626` | `#FCA5A5` |

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

| CSS Variable | Swift Name | Mobile | Desktop |
|-------------|-----------|--------|---------|
| `--radius-none` | `CGFloat.radiusNone` | `0px`    | `0px`    |
| `--radius-xs`   | `CGFloat.radiusXS`   | `4px`    | `8px`    |
| `--radius-sm`   | `CGFloat.radiusSM`   | `8px`    | `12px`   |
| `--radius-md`   | `CGFloat.radiusMD`   | `12px`   | `16px`   |
| `--radius-lg`   | `CGFloat.radiusLG`   | `16px`   | `24px`   |
| `--radius-xl`   | `CGFloat.radiusXL`   | `24px`   | `32px`   |
| `--radius-2xl`  | `CGFloat.radius2XL`  | `32px`   | `48px`   |
| `--radius-full` | `.clipShape(Capsule())` | `9999px` | `9999px` |

**Web:** `rounded-md` (Tailwind `@theme`) or `rounded-[var(--radius-md)]`
**iOS:** `.cornerRadius(CGFloat.radiusMD)` or `.clipShape(RoundedRectangle(cornerRadius: .radiusLG))`

---

## Spacing Tokens

Sourced from Figma **Primitives/Dimensions** 4px grid. Naming mirrors Tailwind's numeric scale: `--space-N = N × 4px`.

| CSS Variable | Tailwind Utility | iOS `CGFloat` | Value |
|-------------|-----------------|--------------|-------|
| `--space-1`  | `p-1`, `gap-1`   | `CGFloat.space1`  | 4px  |
| `--space-2`  | `p-2`, `gap-2`   | `CGFloat.space2`  | 8px  |
| `--space-3`  | `p-3`, `gap-3`   | `CGFloat.space3`  | 12px |
| `--space-4`  | `p-4`, `gap-4`   | `CGFloat.space4`  | 16px |
| `--space-5`  | `p-5`, `gap-5`   | `CGFloat.space5`  | 20px |
| `--space-6`  | `p-6`, `gap-6`   | `CGFloat.space6`  | 24px |
| `--space-8`  | `p-8`, `gap-8`   | `CGFloat.space8`  | 32px |
| `--space-10` | `p-10`, `gap-10` | `CGFloat.space10` | 40px |
| `--space-12` | `p-12`, `gap-12` | `CGFloat.space12` | 48px |
| `--space-16` | `p-16`, `gap-16` | `CGFloat.space16` | 64px |
| `--space-20` | `p-20`, `gap-20` | `CGFloat.space20` | 80px |
| `--space-24` | `p-24`, `gap-24` | `CGFloat.space24` | 96px |

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

| Role | Size | Line-height | Weight | CSS Var Suffix | Swift Name |
|------|------|-------------|--------|---------------|-----------|
| DisplayText/Large  | 96px | 128px | 400 | `display-lg` | `Font.appDisplayLarge` |
| DisplayText/Medium | 80px | 96px  | 400 | `display-md` | `Font.appDisplayMedium` |
| DisplayText/Small  | 64px | 96px  | 400 | `display-sm` | `Font.appDisplaySmall` |

### Heading

| Role | Size | Line-height | Weight | CSS Var Suffix | Swift Name |
|------|------|-------------|--------|---------------|-----------|
| Heading/Large  | 56px | 64px | 700 Bold | `heading-lg` | `Font.appHeadingLarge` |
| Heading/Medium | 48px | 56px | 700 Bold | `heading-md` | `Font.appHeadingMedium` |
| Heading/Small  | 40px | 44px | 700 Bold | `heading-sm` | `Font.appHeadingSmall` |

### Title

| Role | Size | Line-height | Weight | CSS Var Suffix | Swift Name |
|------|------|-------------|--------|---------------|-----------|
| Title/Large  | 28px | 32px | 700 Bold | `title-lg` | `Font.appTitleLarge` |
| Title/Medium | 24px | 28px | 700 Bold | `title-md` | `Font.appTitleMedium` |
| Title/Small  | 20px | 24px | 700 Bold | `title-sm` | `Font.appTitleSmall` |

### Body

| Role | Size | Line-height | Weight | CSS Var Suffix | Swift Name |
|------|------|-------------|--------|---------------|-----------|
| Body/Large            | 16px | 24px | 400 Regular | `body-lg`    | `Font.appBodyLarge` |
| Body/Medium           | 14px | 20px | 400 Regular | `body-md`    | `Font.appBodyMedium` |
| Body/Small            | 12px | 16px | 400 Regular | `body-sm`    | `Font.appBodySmall` |
| Body/LargeEmphasized  | 16px | 24px | 500 Medium  | `body-lg-em` | `Font.appBodyLargeEm` |
| Body/MediumEmphasized | 14px | 20px | 500 Medium  | `body-md-em` | `Font.appBodyMediumEm` |
| Body/SmallEmphasized  | 12px | 16px | 500 Medium  | `body-sm-em` | `Font.appBodySmallEm` |

### CTA / Link

| Role | Size | Line-height | Weight | CSS Var Suffix | Swift Name |
|------|------|-------------|--------|---------------|-----------|
| CTA/Large   | 16px | 24px | 600 SemiBold | `cta-lg`  | `Font.appCTALarge` |
| CTA/Medium  | 14px | 20px | 600 SemiBold | `cta-md`  | `Font.appCTAMedium` |
| CTA/Small   | 12px | 16px | 600 SemiBold | `cta-sm`  | `Font.appCTASmall` |
| Link/Large  | 16px | 24px | 500 Medium   | `link-lg` | `Font.appLinkLarge` |
| Link/Medium | 14px | 20px | 500 Medium   | `link-md` | `Font.appLinkMedium` |
| Link/Small  | 12px | 16px | 500 Medium   | `link-sm` | `Font.appLinkSmall` |

### Caption / Badge / Overline

| Role | Size | Line-height | Weight | Tracking | CSS Var Suffix | Swift Name |
|------|------|-------------|--------|---------|---------------|-----------|
| Caption/Medium  | 12px | 16px | 400 Regular  | —    | `caption-md`   | `Font.appCaptionMedium` |
| Caption/Small   | 10px | 12px | 400 Regular  | —    | `caption-sm`   | `Font.appCaptionSmall` |
| Badge/Medium    | 10px | 12px | 600 SemiBold | —    | `badge-md`     | `Font.appBadgeMedium` |
| Badge/Small     |  8px | 10px | 600 SemiBold | —    | `badge-sm`     | `Font.appBadgeSmall` |
| Overline/Small  |  8px | 12px | 700 Bold     | 1px  | `overline-sm`  | `Font.appOverlineSmall` |
| Overline/Medium | 10px | 12px | 700 Bold     | 1px  | `overline-md`  | `Font.appOverlineMedium` |
| Overline/Large  | 12px | 16px | 700 Bold     | 2px  | `overline-lg`  | `Font.appOverlineLarge` |

_Web uses Geist Sans (loaded via `next/font`). iOS uses system default — closest visual match._

**Legacy Font aliases:** `Font.appTitle` → `appTitleLarge` · `Font.appBody` → `appBodyLarge` · `Font.appCaption` → `appCaptionMedium`

---

## Naming Convention

| CSS Variable Pattern | Swift Name Pattern | Example |
|---------------------|-------------------|---------|
| `--surface-base-primary` | `Color.appSurfaceBasePrimary` | Page background |
| `--surface-brand` | `Color.appSurfaceBrand` | Brand-coloured elements |
| `--surface-accent-primary` | `Color.appSurfaceAccentPrimary` | CTA buttons |
| `--text-primary` | `Color.appTextPrimary` | Body copy |
| `--text-accent` | `Color.appTextAccent` | Links, highlights |
| `--icon-primary` | `Color.appIconPrimary` | Default icons |
| `--border-default` | `Color.appBorderDefault` | Cards, dividers |
| `--border-error` | `Color.appBorderError` | Error states |
| `--radius-md` | `CGFloat.radiusMD` | Card corner radius |
| `--space-4` | `CGFloat.space4` | Standard component padding |
| `--typography-title-lg-size` | `Font.appTitleLarge` | Page title |

---

## Icon System

**Library:** [Phosphor Icons](https://phosphoricons.com/) — open-source, 6 weights, 1000+ icons. Same icon set used in Figma, web, and iOS.

### Icon Size Tokens

Both platforms use the same 5 named sizes:

| Token | px / pt | Web (`IconSize`) | iOS (`PhosphorIconSize`) |
|-------|---------|-----------------|--------------------------|
| `xs`  | 12      | `"xs"`          | `.xs`                    |
| `sm`  | 16      | `"sm"`          | `.sm`                    |
| `md`  | 20 _(default)_ | `"md"` | `.md`              |
| `lg`  | 24      | `"lg"`          | `.lg`                    |
| `xl`  | 32      | `"xl"`          | `.xl`                    |

### Icon Weight Tokens

| Weight     | Web (`IconWeight`)  | iOS (`Ph.IconWeight`) | Notes              |
|------------|--------------------|-----------------------|--------------------|
| `thin`     | `"thin"`           | `.thin`               | Lightest stroke    |
| `light`    | `"light"`          | `.light`              |                    |
| `regular`  | `"regular"` _(default)_ | `.regular` _(default)_ | Use for most UI |
| `bold`     | `"bold"`           | `.bold`               | Emphasis           |
| `fill`     | `"fill"`           | `.fill`               | Active/selected state |
| `duotone`  | `"duotone"`        | `.duotone`            | Two-tone (accent + base) |

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

Use icon color tokens from `DesignTokens.swift` / `globals.css`:

| Semantic role | Web CSS var | iOS Swift |
|---------------|------------|-----------|
| Default icon  | `var(--icon-primary)` | `Color.appIconPrimary` |
| Secondary     | `var(--icon-secondary)` | `Color.appIconSecondary` |
| Disabled      | `var(--icon-disabled)` | `Color.appIconDisabled` |
| Error         | `var(--icon-error)` | `Color.appIconError` (or `.appError`) |
| On-brand      | `var(--icon-on-primary)` | `Color.appIconOnPrimary` |

### Figma → Code Mapping

When implementing icons from Figma:
1. Note the **icon name** (PascalCase in Figma sidebar, e.g. `House`, `ArrowRight`)
2. Note the **weight** layer in Figma (Regular / Fill / Bold etc.)
3. Note the **size** from Figma Dimensions — map to nearest token (`xs`/`sm`/`md`/`lg`/`xl`)
4. Use the color variable from the Figma token, not a hardcoded hex
