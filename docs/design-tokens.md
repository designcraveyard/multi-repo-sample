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

## Spacing Tokens

| Token Name | Tailwind Equivalent | Swift Name | Value |
|-----------|-------------------|-----------|-------|
| XS | `gap-1` / `p-1` | `CGFloat.spaceXS` | 4pt |
| SM | `gap-2` / `p-2` | `CGFloat.spaceSM` | 8pt |
| MD | `gap-4` / `p-4` | `CGFloat.spaceMD` | 16pt |
| LG | `gap-6` / `p-6` | `CGFloat.spaceLG` | 24pt |
| XL | `gap-8` / `p-8` | `CGFloat.spaceXL` | 32pt |
| 2XL | `gap-12` / `p-12` | `CGFloat.space2XL` | 48pt |

---

## Typography Tokens

| Role | Web Class | iOS (Swift) | Specs |
|------|-----------|-------------|-------|
| Display / Heading | `text-3xl font-semibold` | `Font.appTitle` | 28pt semibold |
| Body | `text-base` | `Font.appBody` | 16pt regular |
| Caption | `text-sm` | `Font.appCaption` | 12pt regular |

_Web uses Geist Sans (loaded via `next/font`). iOS uses system default — closest visual match._

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
