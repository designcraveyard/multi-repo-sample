# Cross-Platform Design System

Last refreshed: **2026-06-29**

This is the operating guide for the shared design system across the three independent apps:

- Web: `multi-repo-nextjs`
- iOS: `multi-repo-ios`
- Android: `multi-repo-android`

The detailed component inventory lives in `docs/components.md`, individual component specs live in `docs/components/`, and the token map lives in `docs/design-tokens.md`.

## Goals

The design system should make the same product behavior feel native on each platform while preserving shared semantics:

- Same component names and intent across web, iOS, and Android.
- Same variant/state model wherever platform conventions allow.
- Same semantic token names for color, spacing, radius, typography, and icon sizing.
- Same accessibility contract: semantic roles, readable labels, disabled affordance, and predictable focus/assistive behavior.
- Same documentation trail for every component, including source paths and platform coverage.

## Source Map

| Area | Web | iOS | Android | Docs |
|------|-----|-----|---------|------|
| Tokens | `app/globals.css` | `DesignTokens.swift` | `ui/theme/DesignTokens.kt` | `docs/design-tokens.md` |
| Atomic components | `app/components/<Name>/` | `Components/<Name>/App<Name>.swift` | `ui/components/App<Name>.kt` | `docs/components/<Name>.md` |
| Complex patterns | `app/components/patterns/<Name>/` | `Components/Patterns/App<Name>.swift` | `ui/patterns/App<Name>.kt` | `docs/components/<Name>.md` |
| Native wrappers | `app/components/Native/` | `Components/Native/` | `ui/native/` | `docs/components/App*.md` |
| Adaptive wrappers | `app/components/Adaptive/` | `Components/Adaptive/` | `ui/adaptive/` | `docs/components/Adaptive*.md` |

## Token Model

Use the two-layer token system everywhere:

| Layer | Purpose | Allowed In UI Code |
|------|---------|--------------------|
| Primitive | Raw palette values such as zinc, neutral, red, amber, green, indigo, black, and white. | No |
| Semantic | Intent names such as `Surfaces/BrandInteractive`, `Typography/Primary`, `Icons/Muted`, and `Border/Default`. | Yes |

Platform mapping:

- Web: `var(--surfaces-*)`, `var(--typography-*)`, `var(--icons-*)`, `var(--border-*)`
- iOS: `Color.surfaces*`, `Color.typography*`, `Color.icons*`, `Color.border*`
- Android: `SemanticColors.*`

Spacing, radius, icon size, and typography must also use platform helpers rather than raw values in component code.

## Component Contract

Every component doc page includes a `Cross-Platform Audit` section with current source paths, implementation coverage, an API snapshot, token rules, and accessibility expectations.

When changing a component:

1. Update the implementation on every supported platform.
2. Keep prop names and state semantics equivalent unless a platform needs a native difference.
3. Preserve disabled behavior as opacity 0.5.
4. Use border tokens for structural lines and separator strokes.
5. Update the component page in `docs/components/`.
6. Update `docs/components.md` if paths, status, or Figma references change.
7. Re-run token validation before marking the component `Done`.

## Audit Artifacts

- Latest full audit: `docs/audit/design-system-audit-2026-06-29.md`
- Component registry: `docs/components.md`
- Token specification: `docs/design-tokens.md`

## Known Intentional Exceptions

- `AppColorPicker` contains raw color swatches because those values are selectable user data, not style tokens.
- Markdown code spans and code blocks may use a high-contrast surface fill because they are content backgrounds, not structural borders.
- Legacy CSS aliases remain documented for compatibility but should not be introduced in new component code.
