# Design Token Specification

Canonical reference for all shared design tokens. Updated automatically by `/design-token-sync`.

**Source of truth:** `multi-repo-nextjs/app/globals.css` (CSS custom properties)
**iOS output:** `multi-repo-ios/multi-repo-ios/DesignTokens.swift`

_Run `/design-token-sync` after any change to `globals.css` to regenerate the Swift file and update this table._

---

## Color Tokens

| Token Name | CSS Variable | Swift Name | Light Value | Dark Value |
|-----------|-------------|-----------|-------------|------------|
| Background | `--background` | `Color.appBackground` | `#ffffff` | `#0a0a0a` |
| Foreground | `--foreground` | `Color.appForeground` | `#171717` | `#ededed` |

_Add new color tokens to `globals.css` first, then run `/design-token-sync`._

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

| Role | Web | iOS (Swift) | Notes |
|------|-----|-------------|-------|
| Display / Title | `text-3xl font-semibold` | `Font.appTitle` | 28pt semibold |
| Body | `text-base` | `Font.appBody` | 16pt regular |
| Caption | `text-sm` | `Font.appCaption` | 12pt regular |

_Web uses Geist Sans (loaded via `next/font`). iOS uses system default — closest visual match._

---

## Naming Convention

| CSS Variable Pattern | Swift Name Pattern |
|---------------------|-------------------|
| `--background` | `Color.appBackground` |
| `--foreground` | `Color.appForeground` |
| `--color-primary` | `Color.appPrimary` |
| `--color-surface` | `Color.appSurface` |
| `--color-border` | `Color.appBorder` |
| `--color-error` | `Color.appError` |
| `--color-success` | `Color.appSuccess` |
