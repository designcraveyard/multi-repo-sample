# Design Token Naming Convention

## CSS → Swift Mapping Rules

| CSS Variable Pattern | Swift Name Pattern | Example |
|---------------------|-------------------|---------|
| `--background` | `Color.appBackground` | background surface |
| `--foreground` | `Color.appForeground` | primary text |
| `--color-primary` | `Color.appPrimary` | brand primary action |
| `--color-primary-hover` | `Color.appPrimaryHover` | primary on hover |
| `--color-secondary` | `Color.appSecondary` | secondary action |
| `--color-surface` | `Color.appSurface` | card / sheet background |
| `--color-border` | `Color.appBorder` | dividers, input borders |
| `--color-error` | `Color.appError` | error / destructive |
| `--color-success` | `Color.appSuccess` | success / confirmation |
| `--color-warning` | `Color.appWarning` | warning state |
| `--color-muted` | `Color.appMuted` | secondary text / placeholders |

## Spacing Scale (fixed, not from CSS)

| Swift Name | Value | Tailwind Equivalent |
|-----------|-------|-------------------|
| `CGFloat.spaceXS` | 4 | `p-1`, `gap-1` |
| `CGFloat.spaceSM` | 8 | `p-2`, `gap-2` |
| `CGFloat.spaceMD` | 16 | `p-4`, `gap-4` |
| `CGFloat.spaceLG` | 24 | `p-6`, `gap-6` |
| `CGFloat.spaceXL` | 32 | `p-8`, `gap-8` |
| `CGFloat.space2XL` | 48 | `p-12`, `gap-12` |

## Typography Notes

Geist Sans (web) → iOS uses `.default` system design for body, `.rounded` for display headings.
Do not attempt to load Geist on iOS — the system sans-serif is the correct platform-native choice.

## Rules

1. Web CSS variables are always the **source of truth**
2. Swift names always have the `app` prefix to avoid collisions with system colors
3. If a CSS token has no dark mode value, use the same hex for both light and dark in Swift
4. Spacing is **not** driven by CSS — the scale above is fixed and shared by convention
