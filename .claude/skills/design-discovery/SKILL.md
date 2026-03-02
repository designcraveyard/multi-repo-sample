# /design-discovery — (Deprecated: use /pipeline)

## Description

This skill has been decomposed into individual pipeline phases for better flow control, checkpoint validation, and resumability.

## Recommended Alternative

Run `/pipeline` to execute the full guided flow with automatic transitions and state tracking.

## Standalone Alternatives

If you need to run individual phases independently:

| Phase | Skill | What it does |
|-------|-------|-------------|
| Information Architecture | Inlined in `/pipeline` phase 4 | Nav structure, screen inventory |
| Theme & Visual Identity | `/define-theme` | Brand personality, palette, typography |
| Theme Application | `/generate-theme` | Apply palette to code + Figma |
| Component Audit | Inlined in `/pipeline` phase 7 | Map screens to components, find gaps |
| Wireframes | `/wireframe --all` | 3-variation HTML prototypes per screen |
| Screen Specs | Written during `/wireframe` | Per-screen layout and component docs |

## Migration Note

The IA generation and component audit logic that were Sub-flows A and C of this skill are now inline phases in `/pipeline`. They produce the same output files (`docs/design/information-architecture.md` and `docs/design/component-map.md`).
