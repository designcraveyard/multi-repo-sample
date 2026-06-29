# Waveform

**Figma:** bubbles-kit
**Web:** _Not yet implemented_
**iOS:** _Not yet implemented_
**Android:** _Not yet implemented_

---

## Overview

An audio waveform visualization component for playback UI. Renders a series of vertical bars representing audio amplitude over time, typically used alongside play/pause controls for audio messages or voice recordings. Not yet implemented on any platform.

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
