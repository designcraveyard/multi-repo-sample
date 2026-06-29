# StreakChecks

**Figma:** bubbles-kit > node `94:1795`
**Web:** _Not yet implemented_
**iOS:** _Not yet implemented_
**Android:** _Not yet implemented_

---

## Overview

A visual streak/habit tracker component showing consecutive completion days. Displays a row of circular icons representing daily check states. Each day can be in one of five states: CheckCircle (completed), Circle (upcoming/empty), CircleNotch (in-progress), ArrowCircleRight (current day), or XCircle (missed). Not yet implemented on any platform.

---

## Figma Variants

| Property1 | Icon | Description |
|-----------|------|-------------|
| `CheckCircle` | Filled check circle | Day completed |
| `Circle` | Empty circle | Upcoming / not yet reached |
| `CircleNotch` | Notched circle | In-progress |
| `ArrowCircleRight` | Arrow circle | Current day indicator |
| `XCircle` | X circle | Missed day |

---

## Status

| Platform | Status |
|----------|--------|
| Web | Planned |
| iOS | Planned |
| Android | Planned |
---

## Cross-Platform Audit

_Last refreshed: 2026-06-29_

| Platform | Source | Status | API snapshot |
|----------|--------|--------|--------------|
| Web | — | Missing / not applicable | No implementation file found. |
| iOS | — | Missing / not applicable | No implementation file found. |
| Android | — | Missing / not applicable | No implementation file found. |

**Parity status:** Figma/reference entry only; no platform implementation.

**Token contract:** component code must use semantic tokens only: CSS `--surfaces-*`, `--typography-*`, `--icons-*`, and `--border-*`; Swift `Color.surfaces*`, `Color.typography*`, `Color.icons*`, and `Color.border*`; Kotlin `SemanticColors.*`, `Spacing.*`, `Radius.*`, `IconSize.*`, and `AppTypography.*`. Disabled state remains opacity 0.5 across platforms.

**Accessibility contract:** preserve semantic roles/labels, visible keyboard focus on web, VoiceOver labels/traits on iOS, and TalkBack semantics on Android when changing the component.
