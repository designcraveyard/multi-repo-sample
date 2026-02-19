---
name: figma-component-sync
description: Sync the Figma design system with the codebase. Fetches all components from Figma via figma-console MCP, updates docs/components.md registry, validates token coverage, and generates implementation briefs for unbuilt components. Use when starting a component build, after Figma design changes, or to audit design system parity.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Figma Component Sync

Synchronize the Figma design system with the codebase component registry and validate implementation parity.

## Workspace Paths

- Component registry: `docs/components.md`
- Design tokens: `docs/design-tokens.md`
- Web components: `multi-repo-nextjs/app/components/`
- iOS components: `multi-repo-ios/multi-repo-ios/Components/`
- Web tokens: `multi-repo-nextjs/app/globals.css`
- iOS tokens: `multi-repo-ios/multi-repo-ios/DesignTokens.swift`

## Arguments

`$ARGUMENTS` — Optional: a specific component name to focus on (e.g. "IconButton", "Badge"). If omitted, syncs the full registry.

## Workflow

### Phase 1: Read Current State

```bash
cat docs/components.md
```

List existing web and iOS component directories:

```bash
ls -d multi-repo-nextjs/app/components/*/ 2>/dev/null
ls -d multi-repo-ios/multi-repo-ios/Components/*/ 2>/dev/null
```

### Phase 2: Fetch Figma Components

Use the figma-console MCP server to get the current design system:

1. `figma_get_design_system_summary()` — get all component categories
2. For each UI component category (skip Phosphor icon categories — those with 5 variants and descriptions mentioning "weather & nature", "communication", etc.):
   - `figma_search_components(category: "<CategoryName>")` — get component keys and node IDs
   - `figma_get_component_details(componentKey: "<key>")` — get full variant axes

**How to identify UI components vs icons:** UI components are in these categories from the design system summary: Button, IconButton, Badge, Label, Chips, _Tabs, Tabs, SegmentControlBar, Thumbnail, Input Field, Date Component, StreakChecks, Divider, StepIndicator, Waveform, _Chip, _Button. Everything else is likely a Phosphor icon set.

### Phase 3: Compare & Update Registry

For each Figma UI component found:

1. Check if it exists in `docs/components.md`
2. If **new component found in Figma** — add it to the registry with Status "Not started"
3. If **component removed from Figma** — mark it as "Deprecated" in the registry
4. If **variant count changed** — update the variant count
5. Verify listed implementation files actually exist on disk

Update `docs/components.md` with any changes found.

### Phase 4: Validate Implementations

For each component marked "Done":

1. Verify the web file exists and exports the expected component
2. Verify the iOS file exists and declares the expected type
3. Grep for any hardcoded hex values or primitive tokens in the component files
4. Check that variant axes from Figma are represented as props/enums

### Phase 5: Generate Implementation Brief (if $ARGUMENTS specifies a component)

If a specific component name was provided:

1. Fetch `figma_get_component_for_development(nodeId: "<nodeId>")` for the rendered spec
2. Identify which semantic tokens the component uses by examining its fills, text colors, borders
3. Verify those tokens exist in `globals.css` and `DesignTokens.swift`
4. Output a structured implementation brief:

```
## Implementation Brief: <ComponentName>

### Figma Reference
- Node ID: <nodeId>
- Component Key: <key>
- Category: <category>

### Variants
| Axis | Values |
|------|--------|
| Type | Primary, Secondary, ... |
| State | Default, Hover, Pressed, Disabled |
| Size | Small, Medium, Large |

### Required Semantic Tokens
| Property | Token | CSS Var | Swift | In Code? |
|----------|-------|---------|-------|----------|

### Files to Create
- `multi-repo-nextjs/app/components/<Name>/<Name>.tsx`
- `multi-repo-nextjs/app/components/<Name>/index.ts`
- `multi-repo-ios/multi-repo-ios/Components/<Name>/App<Name>.swift`

### Implementation Notes
- Disabled state: opacity 0.5 (no separate tokens)
- iOS: prefix with `App` to avoid SwiftUI conflicts
- iOS: add haptic feedback via UIImpactFeedbackGenerator
- All colors via Semantic tokens (design-token-guard enforces this)
```

### Phase 6: Output Sync Report

```
## Figma Component Sync Report

### Registry Changes
| Action | Component | Details |
|--------|-----------|---------|
| Added  | ...       | New in Figma |
| Updated| ...       | Variant count changed |
| Verified| ...      | Implementation confirmed |

### Implementation Status
| Component | Figma Variants | Web | iOS | Status |
|-----------|---------------|-----|-----|--------|
| Button    | 20            | ✓   | ✓   | Done   |
| IconButton| 72            | ✗   | ✗   | Not started |

### Token Gaps
(Tokens needed by unimplemented components that don't exist in code yet)

### Next Steps
- Priority component to implement: <Name> (reason)
- Missing tokens to add: <list>
- Run `/design-token-sync` if tokens were added
```

## Rules

- **Never modify component code** — this skill only syncs the registry and generates briefs
- **Use figma-console MCP** for all Figma data — never hardcode Figma values
- **Phosphor icon component sets** (5 variants with weight axes like thin/light/regular/bold/fill/duotone) are NOT UI components — skip them
- **Internal components** (prefixed `_`) are documented but don't need standalone implementations
- **Always update `docs/components.md`** when changes are detected
- **Token validation** uses Semantic layer names only (e.g. `--surfaces-*`, `Color.surfaces*`)
