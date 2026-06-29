# Design Token Specification

Canonical cross-platform reference for the shared design system. Last refreshed: **2026-06-29**.

**Source of truth:** `multi-repo-nextjs/app/globals.css`  
**iOS mirror:** `multi-repo-ios/multi-repo-ios/DesignTokens.swift`  
**Android mirror:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/theme/DesignTokens.kt`  
**Figma file:** `bubbles-kit` (`ZtcCQT96M2dJZjU35X8uMQ`)

## Architecture

The system uses a two-layer model across all platforms. Primitive tokens are raw palette values and belong only in token definition files. Semantic tokens describe product intent and are the only color tokens allowed in component and screen code.

| Layer | Web | iOS | Android | Use |
|------|-----|-----|---------|-----|
| Primitive | `--color-*` | `Color.color*` | `PrimitiveColors.*` | Token files only |
| Semantic color | `--surfaces-*`, `--typography-*`, `--icons-*`, `--border-*` | `Color.surfaces*`, `Color.typography*`, `Color.icons*`, `Color.border*` | `SemanticColors.*` | Components and screens |
| Dimensions | `--space-*`, `--radius-*` | `CGFloat.space*`, `CGFloat.radius*` | `Spacing.*`, `Radius.*` | Layout, sizing, shape |
| Typography | `--typography-*-size/leading/weight` | `Font.app*` | `AppTypography.*` | Text styles |

## Semantic Color Tokens

Resolved values show the effective primitive hex in light and dark modes.

| CSS Variable | Swift Name | Kotlin Name | Light | Dark |
|--------------|------------|-------------|-------|------|
| `--border-active` | `Color.borderActive` | `SemanticColors.borderActive` | `#0A0A0A` | `#FAFAFA` |
| `--border-brand` | `Color.borderBrand` | `SemanticColors.borderBrand` | `#09090B` | `#FAFAFA` |
| `--border-default` | `Color.borderDefault` | `SemanticColors.borderDefault` | `#E5E5E5` | `#262626` |
| `--border-error` | `Color.borderError` | `SemanticColors.borderError` | `#DC2626` | `#FCA5A5` |
| `--border-muted` | `Color.borderMuted` | `SemanticColors.borderMuted` | `#F5F5F5` | `#171717` |
| `--border-success` | `Color.borderSuccess` | `SemanticColors.borderSuccess` | `#16A34A` | `#86EFAC` |
| `--border-warning` | `Color.borderWarning` | `SemanticColors.borderWarning` | `#D97706` | `#FCD34D` |
| `--icons-accent` | `Color.iconsAccent` | `SemanticColors.iconsAccent` | `#4338CA` | `#A5B4FC` |
| `--icons-black` | `Color.iconsBlack` | `SemanticColors.iconsBlack` | `#000000` | `#000000` |
| `--icons-brand` | `Color.iconsBrand` | `SemanticColors.iconsBrand` | `#09090B` | `#FAFAFA` |
| `--icons-error` | `Color.iconsError` | `SemanticColors.iconsError` | `#EF4444` | `#F87171` |
| `--icons-inverse-muted` | `Color.iconsInverseMuted` | `SemanticColors.iconsInverseMuted` | `#262626` | `#A3A3A3` |
| `--icons-inverse-primary` | `Color.iconsInversePrimary` | `SemanticColors.iconsInversePrimary` | `#FAFAFA` | `#0A0A0A` |
| `--icons-inverse-secondary` | `Color.iconsInverseSecondary` | `SemanticColors.iconsInverseSecondary` | `#A3A3A3` | `#525252` |
| `--icons-muted` | `Color.iconsMuted` | `SemanticColors.iconsMuted` | `#A3A3A3` | `#404040` |
| `--icons-on-brand-primary` | `Color.iconsOnBrandPrimary` | `SemanticColors.iconsOnBrandPrimary` | `#FAFAFA` | `#0A0A0A` |
| `--icons-primary` | `Color.iconsPrimary` | `SemanticColors.iconsPrimary` | `#0A0A0A` | `#FAFAFA` |
| `--icons-secondary` | `Color.iconsSecondary` | `SemanticColors.iconsSecondary` | `#525252` | `#A3A3A3` |
| `--icons-success` | `Color.iconsSuccess` | `SemanticColors.iconsSuccess` | `#16A34A` | `#4ADE80` |
| `--icons-warning` | `Color.iconsWarning` | `SemanticColors.iconsWarning` | `#F59E0B` | `#FBBF24` |
| `--icons-white` | `Color.iconsWhite` | `SemanticColors.iconsWhite` | `#FFFFFF` | `#FFFFFF` |
| `--surfaces-accent-high-contrast` | `Color.surfacesAccentHighContrast` | `SemanticColors.surfacesAccentHighContrast` | `#A5B4FC` | `#4338CA` |
| `--surfaces-accent-high-contrast-hover` | `Color.surfacesAccentHighContrastHover` | `SemanticColors.surfacesAccentHighContrastHover` | `#818CF8` | `#4F46E5` |
| `--surfaces-accent-high-contrast-pressed` | `Color.surfacesAccentHighContrastPressed` | `SemanticColors.surfacesAccentHighContrastPressed` | `#6366F1` | `#6366F1` |
| `--surfaces-accent-low-contrast` | `Color.surfacesAccentLowContrast` | `SemanticColors.surfacesAccentLowContrast` | `#C7D2FE` | `#3730A3` |
| `--surfaces-accent-low-contrast-hover` | `Color.surfacesAccentLowContrastHover` | `SemanticColors.surfacesAccentLowContrastHover` | `#A5B4FC` | `#4338CA` |
| `--surfaces-accent-low-contrast-pressed` | `Color.surfacesAccentLowContrastPressed` | `SemanticColors.surfacesAccentLowContrastPressed` | `#818CF8` | `#4F46E5` |
| `--surfaces-accent-primary` | `Color.surfacesAccentPrimary` | `SemanticColors.surfacesAccentPrimary` | `#4F46E5` | `#818CF8` |
| `--surfaces-accent-primary-hover` | `Color.surfacesAccentPrimaryHover` | `SemanticColors.surfacesAccentPrimaryHover` | `#4338CA` | `#A5B4FC` |
| `--surfaces-accent-primary-pressed` | `Color.surfacesAccentPrimaryPressed` | `SemanticColors.surfacesAccentPrimaryPressed` | `#3730A3` | `#C7D2FE` |
| `--surfaces-base-high-contrast` | `Color.surfacesBaseHighContrast` | `SemanticColors.surfacesBaseHighContrast` | `#E5E5E5` | `#262626` |
| `--surfaces-base-high-contrast-hover` | `Color.surfacesBaseHighContrastHover` | `SemanticColors.surfacesBaseHighContrastHover` | `#D4D4D4` | `#525252` |
| `--surfaces-base-high-contrast-pressed` | `Color.surfacesBaseHighContrastPressed` | `SemanticColors.surfacesBaseHighContrastPressed` | `#A3A3A3` | `#737373` |
| `--surfaces-base-low-contrast` | `Color.surfacesBaseLowContrast` | `SemanticColors.surfacesBaseLowContrast` | `#F5F5F5` | `#171717` |
| `--surfaces-base-low-contrast-hover` | `Color.surfacesBaseLowContrastHover` | `SemanticColors.surfacesBaseLowContrastHover` | `#E5E5E5` | `#262626` |
| `--surfaces-base-low-contrast-pressed` | `Color.surfacesBaseLowContrastPressed` | `SemanticColors.surfacesBaseLowContrastPressed` | `#D4D4D4` | `#525252` |
| `--surfaces-base-primary` | `Color.surfacesBasePrimary` | `SemanticColors.surfacesBasePrimary` | `#FFFFFF` | `#000000` |
| `--surfaces-base-primary-hover` | `Color.surfacesBasePrimaryHover` | `SemanticColors.surfacesBasePrimaryHover` | `#F5F5F5` | `#262626` |
| `--surfaces-base-primary-pressed` | `Color.surfacesBasePrimaryPressed` | `SemanticColors.surfacesBasePrimaryPressed` | `#E5E5E5` | `#404040` |
| `--surfaces-brand-interactive` | `Color.surfacesBrandInteractive` | `SemanticColors.surfacesBrandInteractive` | `#09090B` | `#FAFAFA` |
| `--surfaces-brand-interactive-high-contrast` | `Color.surfacesBrandInteractiveHighContrast` | `SemanticColors.surfacesBrandInteractiveHighContrast` | `#D4D4D8` | `#3F3F46` |
| `--surfaces-brand-interactive-high-contrast-hover` | `Color.surfacesBrandInteractiveHighContrastHover` | `SemanticColors.surfacesBrandInteractiveHighContrastHover` | `#A1A1AA` | `#52525B` |
| `--surfaces-brand-interactive-high-contrast-pressed` | `Color.surfacesBrandInteractiveHighContrastPressed` | `SemanticColors.surfacesBrandInteractiveHighContrastPressed` | `#71717A` | `#71717A` |
| `--surfaces-brand-interactive-hover` | `Color.surfacesBrandInteractiveHover` | `SemanticColors.surfacesBrandInteractiveHover` | `#27272A` | `#E4E4E7` |
| `--surfaces-brand-interactive-low-contrast` | `Color.surfacesBrandInteractiveLowContrast` | `SemanticColors.surfacesBrandInteractiveLowContrast` | `#E4E4E7` | `#27272A` |
| `--surfaces-brand-interactive-low-contrast-hover` | `Color.surfacesBrandInteractiveLowContrastHover` | `SemanticColors.surfacesBrandInteractiveLowContrastHover` | `#D4D4D8` | `#3F3F46` |
| `--surfaces-brand-interactive-low-contrast-pressed` | `Color.surfacesBrandInteractiveLowContrastPressed` | `SemanticColors.surfacesBrandInteractiveLowContrastPressed` | `#A1A1AA` | `#52525B` |
| `--surfaces-brand-interactive-pressed` | `Color.surfacesBrandInteractivePressed` | `SemanticColors.surfacesBrandInteractivePressed` | `#3F3F46` | `#A1A1AA` |
| `--surfaces-elevated-overlay` | `Color.surfacesElevatedOverlay` | `SemanticColors.surfacesElevatedOverlay` | `#FFFFFF` | `#262626` |
| `--surfaces-error-solid` | `Color.surfacesErrorSolid` | `SemanticColors.surfacesErrorSolid` | `#DC2626` | `#FCA5A5` |
| `--surfaces-error-solid-hover` | `Color.surfacesErrorSolidHover` | `SemanticColors.surfacesErrorSolidHover` | `#B91C1C` | `#FECACA` |
| `--surfaces-error-solid-pressed` | `Color.surfacesErrorSolidPressed` | `SemanticColors.surfacesErrorSolidPressed` | `#991B1B` | `#FEE2E2` |
| `--surfaces-error-subtle` | `Color.surfacesErrorSubtle` | `SemanticColors.surfacesErrorSubtle` | `#FEE2E2` | `#450A0A` |
| `--surfaces-error-subtle-hover` | `Color.surfacesErrorSubtleHover` | `SemanticColors.surfacesErrorSubtleHover` | `#FECACA` | `#7F1D1D` |
| `--surfaces-error-subtle-pressed` | `Color.surfacesErrorSubtlePressed` | `SemanticColors.surfacesErrorSubtlePressed` | `#FCA5A5` | `#991B1B` |
| `--surfaces-inverse-high-contrast` | `Color.surfacesInverseHighContrast` | `SemanticColors.surfacesInverseHighContrast` | `#262626` | `#E5E5E5` |
| `--surfaces-inverse-high-contrast-hover` | `Color.surfacesInverseHighContrastHover` | `SemanticColors.surfacesInverseHighContrastHover` | `#404040` | `#D4D4D4` |
| `--surfaces-inverse-high-contrast-pressed` | `Color.surfacesInverseHighContrastPressed` | `SemanticColors.surfacesInverseHighContrastPressed` | `#525252` | `#E5E5E5` |
| `--surfaces-inverse-low-contrast` | `Color.surfacesInverseLowContrast` | `SemanticColors.surfacesInverseLowContrast` | `#171717` | `#F5F5F5` |
| `--surfaces-inverse-low-contrast-hover` | `Color.surfacesInverseLowContrastHover` | `SemanticColors.surfacesInverseLowContrastHover` | `#262626` | `#E5E5E5` |
| `--surfaces-inverse-low-contrast-pressed` | `Color.surfacesInverseLowContrastPressed` | `SemanticColors.surfacesInverseLowContrastPressed` | `#404040` | `#D4D4D4` |
| `--surfaces-inverse-primary` | `Color.surfacesInversePrimary` | `SemanticColors.surfacesInversePrimary` | `#000000` | `#FFFFFF` |
| `--surfaces-inverse-primary-hover` | `Color.surfacesInversePrimaryHover` | `SemanticColors.surfacesInversePrimaryHover` | `#27272A` | `#E4E4E7` |
| `--surfaces-inverse-primary-pressed` | `Color.surfacesInversePrimaryPressed` | `SemanticColors.surfacesInversePrimaryPressed` | `#52525B` | `#A1A1AA` |
| `--surfaces-raised-selected` | `Color.surfacesRaisedSelected` | `SemanticColors.surfacesRaisedSelected` | `#FFFFFF` | `#404040` |
| `--surfaces-success-solid` | `Color.surfacesSuccessSolid` | `SemanticColors.surfacesSuccessSolid` | `#16A34A` | `#86EFAC` |
| `--surfaces-success-solid-hover` | `Color.surfacesSuccessSolidHover` | `SemanticColors.surfacesSuccessSolidHover` | `#15803D` | `#BBF7D0` |
| `--surfaces-success-solid-pressed` | `Color.surfacesSuccessSolidPressed` | `SemanticColors.surfacesSuccessSolidPressed` | `#166534` | `#DCFCE7` |
| `--surfaces-success-subtle` | `Color.surfacesSuccessSubtle` | `SemanticColors.surfacesSuccessSubtle` | `#DCFCE7` | `#052E16` |
| `--surfaces-success-subtle-hover` | `Color.surfacesSuccessSubtleHover` | `SemanticColors.surfacesSuccessSubtleHover` | `#BBF7D0` | `#14532D` |
| `--surfaces-success-subtle-pressed` | `Color.surfacesSuccessSubtlePressed` | `SemanticColors.surfacesSuccessSubtlePressed` | `#86EFAC` | `#166534` |
| `--surfaces-warning-solid` | `Color.surfacesWarningSolid` | `SemanticColors.surfacesWarningSolid` | `#D97706` | `#FCD34D` |
| `--surfaces-warning-solid-hover` | `Color.surfacesWarningSolidHover` | `SemanticColors.surfacesWarningSolidHover` | `#B45309` | `#FDE68A` |
| `--surfaces-warning-solid-pressed` | `Color.surfacesWarningSolidPressed` | `SemanticColors.surfacesWarningSolidPressed` | `#92400E` | `#FEF3C7` |
| `--surfaces-warning-subtle` | `Color.surfacesWarningSubtle` | `SemanticColors.surfacesWarningSubtle` | `#FEF3C7` | `#431407` |
| `--surfaces-warning-subtle-hover` | `Color.surfacesWarningSubtleHover` | `SemanticColors.surfacesWarningSubtleHover` | `#FDE68A` | `#78350F` |
| `--surfaces-warning-subtle-pressed` | `Color.surfacesWarningSubtlePressed` | `SemanticColors.surfacesWarningSubtlePressed` | `#FCD34D` | `#92400E` |
| `--typography-accent` | `Color.typographyAccent` | `SemanticColors.typographyAccent` | `#4338CA` | `#A5B4FC` |
| `--typography-black` | `Color.typographyBlack` | `SemanticColors.typographyBlack` | `#000000` | `#000000` |
| `--typography-brand` | `Color.typographyBrand` | `SemanticColors.typographyBrand` | `#09090B` | `#FAFAFA` |
| `--typography-error` | `Color.typographyError` | `SemanticColors.typographyError` | `#B91C1C` | `#F87171` |
| `--typography-inverse-muted` | `Color.typographyInverseMuted` | `SemanticColors.typographyInverseMuted` | `#737373` | `#737373` |
| `--typography-inverse-primary` | `Color.typographyInversePrimary` | `SemanticColors.typographyInversePrimary` | `#FAFAFA` | `#0A0A0A` |
| `--typography-inverse-secondary` | `Color.typographyInverseSecondary` | `SemanticColors.typographyInverseSecondary` | `#D4D4D4` | `#404040` |
| `--typography-muted` | `Color.typographyMuted` | `SemanticColors.typographyMuted` | `#737373` | `#A3A3A3` |
| `--typography-on-brand-primary` | `Color.typographyOnBrandPrimary` | `SemanticColors.typographyOnBrandPrimary` | `#FFFFFF` | `#000000` |
| `--typography-primary` | `Color.typographyPrimary` | `SemanticColors.typographyPrimary` | `#171717` | `#FAFAFA` |
| `--typography-secondary` | `Color.typographySecondary` | `SemanticColors.typographySecondary` | `#404040` | `#D4D4D4` |
| `--typography-success` | `Color.typographySuccess` | `SemanticColors.typographySuccess` | `#15803D` | `#4ADE80` |
| `--typography-warning` | `Color.typographyWarning` | `SemanticColors.typographyWarning` | `#B45309` | `#FBBF24` |
| `--typography-white` | `Color.typographyWhite` | `SemanticColors.typographyWhite` | `#FFFFFF` | `#FFFFFF` |

## Primitive Color Tokens

Primitive tokens are documented for implementation parity only. Do not use them directly in UI code.

| CSS Variable | Swift Name | Kotlin Name | Value | Dark Value |
|--------------|------------|-------------|-------|------------|
| `--color-amber-100` | `Color.colorAmber100` | `PrimitiveColors.colorAmber100` | `#FEF3C7` | `#FEF3C7` |
| `--color-amber-200` | `Color.colorAmber200` | `PrimitiveColors.colorAmber200` | `#FDE68A` | `#FDE68A` |
| `--color-amber-300` | `Color.colorAmber300` | `PrimitiveColors.colorAmber300` | `#FCD34D` | `#FCD34D` |
| `--color-amber-400` | `Color.colorAmber400` | `PrimitiveColors.colorAmber400` | `#FBBF24` | `#FBBF24` |
| `--color-amber-50` | `Color.colorAmber50` | `PrimitiveColors.colorAmber50` | `#FFFBEB` | `#FFFBEB` |
| `--color-amber-500` | `Color.colorAmber500` | `PrimitiveColors.colorAmber500` | `#F59E0B` | `#F59E0B` |
| `--color-amber-600` | `Color.colorAmber600` | `PrimitiveColors.colorAmber600` | `#D97706` | `#D97706` |
| `--color-amber-700` | `Color.colorAmber700` | `PrimitiveColors.colorAmber700` | `#B45309` | `#B45309` |
| `--color-amber-800` | `Color.colorAmber800` | `PrimitiveColors.colorAmber800` | `#92400E` | `#92400E` |
| `--color-amber-900` | `Color.colorAmber900` | `PrimitiveColors.colorAmber900` | `#78350F` | `#78350F` |
| `--color-amber-950` | `Color.colorAmber950` | `PrimitiveColors.colorAmber950` | `#431407` | `#431407` |
| `--color-base-black` | `Color.colorBaseBlack` | `PrimitiveColors.colorBaseBlack` | `#000000` | `#000000` |
| `--color-base-white` | `Color.colorBaseWhite` | `PrimitiveColors.colorBaseWhite` | `#FFFFFF` | `#FFFFFF` |
| `--color-green-100` | `Color.colorGreen100` | `PrimitiveColors.colorGreen100` | `#DCFCE7` | `#DCFCE7` |
| `--color-green-200` | `Color.colorGreen200` | `PrimitiveColors.colorGreen200` | `#BBF7D0` | `#BBF7D0` |
| `--color-green-300` | `Color.colorGreen300` | `PrimitiveColors.colorGreen300` | `#86EFAC` | `#86EFAC` |
| `--color-green-400` | `Color.colorGreen400` | `PrimitiveColors.colorGreen400` | `#4ADE80` | `#4ADE80` |
| `--color-green-50` | `Color.colorGreen50` | `PrimitiveColors.colorGreen50` | `#F0FDF4` | `#F0FDF4` |
| `--color-green-500` | `Color.colorGreen500` | `PrimitiveColors.colorGreen500` | `#22C55E` | `#22C55E` |
| `--color-green-600` | `Color.colorGreen600` | `PrimitiveColors.colorGreen600` | `#16A34A` | `#16A34A` |
| `--color-green-700` | `Color.colorGreen700` | `PrimitiveColors.colorGreen700` | `#15803D` | `#15803D` |
| `--color-green-800` | `Color.colorGreen800` | `PrimitiveColors.colorGreen800` | `#166534` | `#166534` |
| `--color-green-900` | `Color.colorGreen900` | `PrimitiveColors.colorGreen900` | `#14532D` | `#14532D` |
| `--color-green-950` | `Color.colorGreen950` | `PrimitiveColors.colorGreen950` | `#052E16` | `#052E16` |
| `--color-indigo-100` | `Color.colorIndigo100` | `PrimitiveColors.colorIndigo100` | `#E0E7FF` | `#E0E7FF` |
| `--color-indigo-200` | `Color.colorIndigo200` | `PrimitiveColors.colorIndigo200` | `#C7D2FE` | `#C7D2FE` |
| `--color-indigo-300` | `Color.colorIndigo300` | `PrimitiveColors.colorIndigo300` | `#A5B4FC` | `#A5B4FC` |
| `--color-indigo-400` | `Color.colorIndigo400` | `PrimitiveColors.colorIndigo400` | `#818CF8` | `#818CF8` |
| `--color-indigo-50` | `Color.colorIndigo50` | `PrimitiveColors.colorIndigo50` | `#EEF2FF` | `#EEF2FF` |
| `--color-indigo-500` | `Color.colorIndigo500` | `PrimitiveColors.colorIndigo500` | `#6366F1` | `#6366F1` |
| `--color-indigo-600` | `Color.colorIndigo600` | `PrimitiveColors.colorIndigo600` | `#4F46E5` | `#4F46E5` |
| `--color-indigo-700` | `Color.colorIndigo700` | `PrimitiveColors.colorIndigo700` | `#4338CA` | `#4338CA` |
| `--color-indigo-800` | `Color.colorIndigo800` | `PrimitiveColors.colorIndigo800` | `#3730A3` | `#3730A3` |
| `--color-indigo-900` | `Color.colorIndigo900` | `PrimitiveColors.colorIndigo900` | `#312E81` | `#312E81` |
| `--color-indigo-950` | `Color.colorIndigo950` | `PrimitiveColors.colorIndigo950` | `#1E1B4B` | `#1E1B4B` |
| `--color-neutral-100` | `Color.colorNeutral100` | `PrimitiveColors.colorNeutral100` | `#F5F5F5` | `#F5F5F5` |
| `--color-neutral-200` | `Color.colorNeutral200` | `PrimitiveColors.colorNeutral200` | `#E5E5E5` | `#E5E5E5` |
| `--color-neutral-300` | `Color.colorNeutral300` | `PrimitiveColors.colorNeutral300` | `#D4D4D4` | `#D4D4D4` |
| `--color-neutral-400` | `Color.colorNeutral400` | `PrimitiveColors.colorNeutral400` | `#A3A3A3` | `#A3A3A3` |
| `--color-neutral-50` | `Color.colorNeutral50` | `PrimitiveColors.colorNeutral50` | `#FAFAFA` | `#FAFAFA` |
| `--color-neutral-500` | `Color.colorNeutral500` | `PrimitiveColors.colorNeutral500` | `#737373` | `#737373` |
| `--color-neutral-600` | `Color.colorNeutral600` | `PrimitiveColors.colorNeutral600` | `#525252` | `#525252` |
| `--color-neutral-700` | `Color.colorNeutral700` | `PrimitiveColors.colorNeutral700` | `#404040` | `#404040` |
| `--color-neutral-800` | `Color.colorNeutral800` | `PrimitiveColors.colorNeutral800` | `#262626` | `#262626` |
| `--color-neutral-900` | `Color.colorNeutral900` | `PrimitiveColors.colorNeutral900` | `#171717` | `#171717` |
| `--color-neutral-950` | `Color.colorNeutral950` | `PrimitiveColors.colorNeutral950` | `#0A0A0A` | `#0A0A0A` |
| `--color-red-100` | `Color.colorRed100` | `PrimitiveColors.colorRed100` | `#FEE2E2` | `#FEE2E2` |
| `--color-red-200` | `Color.colorRed200` | `PrimitiveColors.colorRed200` | `#FECACA` | `#FECACA` |
| `--color-red-300` | `Color.colorRed300` | `PrimitiveColors.colorRed300` | `#FCA5A5` | `#FCA5A5` |
| `--color-red-400` | `Color.colorRed400` | `PrimitiveColors.colorRed400` | `#F87171` | `#F87171` |
| `--color-red-50` | `Color.colorRed50` | `PrimitiveColors.colorRed50` | `#FEF2F2` | `#FEF2F2` |
| `--color-red-500` | `Color.colorRed500` | `PrimitiveColors.colorRed500` | `#EF4444` | `#EF4444` |
| `--color-red-600` | `Color.colorRed600` | `PrimitiveColors.colorRed600` | `#DC2626` | `#DC2626` |
| `--color-red-700` | `Color.colorRed700` | `PrimitiveColors.colorRed700` | `#B91C1C` | `#B91C1C` |
| `--color-red-800` | `Color.colorRed800` | `PrimitiveColors.colorRed800` | `#991B1B` | `#991B1B` |
| `--color-red-900` | `Color.colorRed900` | `PrimitiveColors.colorRed900` | `#7F1D1D` | `#7F1D1D` |
| `--color-red-950` | `Color.colorRed950` | `PrimitiveColors.colorRed950` | `#450A0A` | `#450A0A` |
| `--color-zinc-100` | `Color.colorZinc100` | `PrimitiveColors.colorZinc100` | `#F4F4F5` | `#F4F4F5` |
| `--color-zinc-200` | `Color.colorZinc200` | `PrimitiveColors.colorZinc200` | `#E4E4E7` | `#E4E4E7` |
| `--color-zinc-300` | `Color.colorZinc300` | `PrimitiveColors.colorZinc300` | `#D4D4D8` | `#D4D4D8` |
| `--color-zinc-400` | `Color.colorZinc400` | `PrimitiveColors.colorZinc400` | `#A1A1AA` | `#A1A1AA` |
| `--color-zinc-50` | `Color.colorZinc50` | `PrimitiveColors.colorZinc50` | `#FAFAFA` | `#FAFAFA` |
| `--color-zinc-500` | `Color.colorZinc500` | `PrimitiveColors.colorZinc500` | `#71717A` | `#71717A` |
| `--color-zinc-600` | `Color.colorZinc600` | `PrimitiveColors.colorZinc600` | `#52525B` | `#52525B` |
| `--color-zinc-700` | `Color.colorZinc700` | `PrimitiveColors.colorZinc700` | `#3F3F46` | `#3F3F46` |
| `--color-zinc-800` | `Color.colorZinc800` | `PrimitiveColors.colorZinc800` | `#27272A` | `#27272A` |
| `--color-zinc-900` | `Color.colorZinc900` | `PrimitiveColors.colorZinc900` | `#18181B` | `#18181B` |
| `--color-zinc-950` | `Color.colorZinc950` | `PrimitiveColors.colorZinc950` | `#09090B` | `#09090B` |

## Radius Tokens

Desktop web overrides apply at `min-width: 768px`; iOS and Android use the base tier unless a component intentionally adapts shape.

| CSS Variable | Swift Name | Kotlin Name | Base Value |
|--------------|------------|-------------|------------|
| `--radius-2xl` | `CGFloat.radius2XL` | `Radius.xl2` | `48px` |
| `--radius-full` | `CGFloat.radiusFull` | `Radius.full` | `9999px` |
| `--radius-lg` | `CGFloat.radiusLG` | `Radius.lg` | `24px` |
| `--radius-md` | `CGFloat.radiusMD` | `Radius.md` | `16px` |
| `--radius-none` | `CGFloat.radiusNone` | `Radius.none` | `0px` |
| `--radius-sm` | `CGFloat.radiusSM` | `Radius.sm` | `12px` |
| `--radius-xl` | `CGFloat.radiusXL` | `Radius.xl` | `32px` |
| `--radius-xs` | `CGFloat.radiusXS` | `Radius.xs` | `8px` |

## Spacing Tokens

Spacing follows a 4px grid. Use platform helpers instead of raw dimensions in component code.

| CSS Variable | Swift Name | Kotlin Name | Value |
|--------------|------------|-------------|-------|
| `--space-1` | `CGFloat.space1` | `Spacing.space1` | `4px` |
| `--space-2` | `CGFloat.space2` | `Spacing.space2` | `8px` |
| `--space-3` | `CGFloat.space3` | `Spacing.space3` | `12px` |
| `--space-4` | `CGFloat.space4` | `Spacing.space4` | `16px` |
| `--space-5` | `CGFloat.space5` | `Spacing.space5` | `20px` |
| `--space-6` | `CGFloat.space6` | `Spacing.space6` | `24px` |
| `--space-8` | `CGFloat.space8` | `Spacing.space8` | `32px` |
| `--space-10` | `CGFloat.space10` | `Spacing.space10` | `40px` |
| `--space-12` | `CGFloat.space12` | `Spacing.space12` | `48px` |
| `--space-16` | `CGFloat.space16` | `Spacing.space16` | `64px` |
| `--space-20` | `CGFloat.space20` | `Spacing.space20` | `80px` |
| `--space-24` | `CGFloat.space24` | `Spacing.space24` | `96px` |

## Typography Variables

Font family is Inter on web, iOS, and Android. Each role exposes size, line-height, weight, and optional tracking variables.

| CSS Variable | Value |
|--------------|-------|
| `--typography-badge-md-leading` | `12px` |
| `--typography-badge-md-size` | `10px` |
| `--typography-badge-md-weight` | `600` |
| `--typography-badge-sm-leading` | `10px` |
| `--typography-badge-sm-size` | `8px` |
| `--typography-badge-sm-weight` | `600` |
| `--typography-body-lg-em-leading` | `24px` |
| `--typography-body-lg-em-size` | `16px` |
| `--typography-body-lg-em-weight` | `500` |
| `--typography-body-lg-leading` | `24px` |
| `--typography-body-lg-size` | `16px` |
| `--typography-body-lg-weight` | `400` |
| `--typography-body-md-em-leading` | `20px` |
| `--typography-body-md-em-size` | `14px` |
| `--typography-body-md-em-weight` | `500` |
| `--typography-body-md-leading` | `20px` |
| `--typography-body-md-size` | `14px` |
| `--typography-body-md-weight` | `400` |
| `--typography-body-sm-em-leading` | `16px` |
| `--typography-body-sm-em-size` | `12px` |
| `--typography-body-sm-em-weight` | `500` |
| `--typography-body-sm-leading` | `16px` |
| `--typography-body-sm-size` | `12px` |
| `--typography-body-sm-weight` | `400` |
| `--typography-caption-md-leading` | `16px` |
| `--typography-caption-md-size` | `12px` |
| `--typography-caption-md-weight` | `400` |
| `--typography-caption-sm-leading` | `12px` |
| `--typography-caption-sm-size` | `10px` |
| `--typography-caption-sm-weight` | `400` |
| `--typography-cta-lg-leading` | `24px` |
| `--typography-cta-lg-size` | `16px` |
| `--typography-cta-lg-weight` | `600` |
| `--typography-cta-md-leading` | `20px` |
| `--typography-cta-md-size` | `14px` |
| `--typography-cta-md-weight` | `600` |
| `--typography-cta-sm-leading` | `16px` |
| `--typography-cta-sm-size` | `12px` |
| `--typography-cta-sm-weight` | `600` |
| `--typography-display-lg-leading` | `128px` |
| `--typography-display-lg-size` | `96px` |
| `--typography-display-lg-weight` | `400` |
| `--typography-display-md-leading` | `96px` |
| `--typography-display-md-size` | `80px` |
| `--typography-display-md-weight` | `400` |
| `--typography-display-sm-leading` | `96px` |
| `--typography-display-sm-size` | `64px` |
| `--typography-display-sm-weight` | `400` |
| `--typography-heading-lg-leading` | `64px` |
| `--typography-heading-lg-size` | `56px` |
| `--typography-heading-lg-weight` | `700` |
| `--typography-heading-md-leading` | `56px` |
| `--typography-heading-md-size` | `48px` |
| `--typography-heading-md-weight` | `700` |
| `--typography-heading-sm-leading` | `44px` |
| `--typography-heading-sm-size` | `40px` |
| `--typography-heading-sm-weight` | `700` |
| `--typography-link-lg-leading` | `24px` |
| `--typography-link-lg-size` | `16px` |
| `--typography-link-lg-weight` | `500` |
| `--typography-link-md-leading` | `20px` |
| `--typography-link-md-size` | `14px` |
| `--typography-link-md-weight` | `500` |
| `--typography-link-sm-leading` | `16px` |
| `--typography-link-sm-size` | `12px` |
| `--typography-link-sm-weight` | `500` |
| `--typography-overline-lg-leading` | `16px` |
| `--typography-overline-lg-size` | `12px` |
| `--typography-overline-lg-tracking` | `2px` |
| `--typography-overline-lg-weight` | `700` |
| `--typography-overline-md-leading` | `12px` |
| `--typography-overline-md-size` | `10px` |
| `--typography-overline-md-tracking` | `1px` |
| `--typography-overline-md-weight` | `700` |
| `--typography-overline-sm-leading` | `12px` |
| `--typography-overline-sm-size` | `8px` |
| `--typography-overline-sm-tracking` | `1px` |
| `--typography-overline-sm-weight` | `700` |
| `--typography-title-lg-leading` | `32px` |
| `--typography-title-lg-size` | `28px` |
| `--typography-title-lg-weight` | `700` |
| `--typography-title-md-leading` | `28px` |
| `--typography-title-md-size` | `24px` |
| `--typography-title-md-weight` | `700` |
| `--typography-title-sm-leading` | `24px` |
| `--typography-title-sm-size` | `20px` |
| `--typography-title-sm-weight` | `700` |

## Semantic Usage Rules

| Need | Use | Avoid |
|------|-----|-------|
| Page and component fills | `Surfaces/*` | Primitive colors |
| Text | `Typography/*` | Surface or icon tokens |
| Icons | `Icons/*` | Typography tokens unless inheriting text intentionally |
| Borders, dividers, separators, connector lines | `Border/Default`, `Border/Muted`, `Border/Active` | `Surfaces/BaseHighContrast`, `Surfaces/BaseLowContrastPressed` |
| Pressed or active chip/button states | Matching `*-Pressed` semantic surface | Border tokens |
| Disabled state | Opacity 0.5 | Dedicated disabled color tokens |

## Intentional Exceptions

- `AppColorPicker` contains raw selectable swatch values. Those are user-facing color choices, not styling tokens.
- Markdown inline code and code blocks may use a high-contrast surface because they are filled content areas, not dividers.

## Validation Checklist

1. Component files use only semantic colors.
2. Web styling uses `var(--surfaces-*)`, `var(--typography-*)`, `var(--icons-*)`, and `var(--border-*)`.
3. iOS styling uses `Color.surfaces*`, `Color.typography*`, `Color.icons*`, and `Color.border*`.
4. Android styling uses `SemanticColors.*`, `Spacing.*`, `Radius.*`, `IconSize.*`, and `AppTypography.*`.
5. Any token change starts in `globals.css` and is mirrored to Swift, Kotlin, and this document.
