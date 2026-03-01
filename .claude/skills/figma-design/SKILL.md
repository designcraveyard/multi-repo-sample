---
name: figma-design
description: >
  Generate Figma screen designs from PRD specs, IA, and HTML wireframes.
  Interactive skill — asks which feature/screens, fidelity, and placement before rendering
  frames via figma-cli using the project's Figma components and design tokens.
  Produces a design brief after each run.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---

# figma-design

Generate Figma screen layouts by synthesising PRDs, the IA doc, component-map,
and HTML wireframes, then rendering frames into Figma Desktop using figma-cli.

## Workspace Paths

| Resource | Path |
|----------|------|
| PRDs | `docs/PRDs/` |
| IA doc | `docs/design/information-architecture.md` |
| Component map | `docs/design/component-map.md` |
| HTML wireframes | `docs/wireframes/` or `docs/design/ui-screens/` |
| Component registry | `docs/components.md` |
| Component ID cache | `.claude/figma-component-map.json` |
| Theme doc | `docs/design/theme.md` |
| Design tokens | `docs/design-tokens.md` |
| Figma CLI (from workspace root) | `node figma-cli/src/index.js` |

## Arguments

`$ARGUMENTS` — optional:
- `--refresh-map` — force re-discover all Figma component node IDs and overwrite the cache
- `--all` — generate all screens from the IA; skip feature selection question
- Feature slug (e.g. `voice-memos`) — skip feature selection question
- Screen name (e.g. `HomeScreen`) — skip to single-screen generation

---

## Phase 0: Component Map Bootstrap

**Trigger:** Run this phase if `.claude/figma-component-map.json` does NOT exist OR `--refresh-map` was passed.

1. Read `docs/components.md` to get the current full list of component names.
2. Start the speed daemon: `node figma-cli/src/index.js daemon`
3. For each component in the registry, run:
   ```bash
   node figma-cli/src/index.js find "<ComponentName>"
   ```
   Extract the node ID from each result.
4. Write `.claude/figma-component-map.json`:
   ```json
   {
     "AppButton": "375:100",
     "AppListItem": "375:102",
     "_notFound": ["AppWaveform"]
   }
   ```
   Components not found → add to the `_notFound` array.
5. Report: "Component map created: X components found, Y not found (listed in _notFound)."

**If Figma Desktop is unreachable** (connect fails): skip Phase 0, set `useComponentMap=false`,
proceed with JSX approximations only.

---

## Phase 0.5: Discover Project Context

Read the following to build rendering context dynamically:

1. **Figma file key:** Check for Figma MCP server in `.mcp.json` or ask user: "What's your Figma file key? (from the URL: figma.com/design/**{fileKey}**/...)"

2. **Feature → Screen mapping:** Read `docs/design/information-architecture.md` to extract:
   - Tab structure and screen inventory
   - Which screens belong to which features
   - Navigation flows between screens

3. **Token hex values:** Read `docs/design-tokens.md` or parse `globals.css` / `DesignTokens.swift` to build a token→hex lookup table for both light and dark mode. These hex values will be used in render JSX.

4. **Spacing + radius scale:** Read from `docs/design-tokens.md` or `DesignTokens.swift`:
   - Spacing: `space1=4, space2=8, space3=12, space4=16, space5=20, space6=24, space8=32, space12=48`
   - Radius values from the current theme

5. **Theme direction:** Read `docs/design/theme.md` for style descriptors, atmosphere, shape language — these inform rendering decisions (e.g., flat vs shadows, pill vs rounded).

---

## Phase 1: Interactive Questions

Ask 3 questions using `AskUserQuestion`.

> Skip Question 1 if `$ARGUMENTS` contains a feature slug, screen name, or `--all`.

**Question 1 — Feature/Screen (header: "What to design")**

Build options dynamically from the IA doc. Each option = feature name + its screens list.
Include an "All screens" option at the end.

**Question 2 — Style (header: "Style")**

Options:
- Skeleton · Light — layout structure + placeholder content, light mode only
- Skeleton · Both — light + dark skeleton frames side-by-side
- Full Mock · Light — realistic content + all states (populated, empty, error variants)
- Full Mock · Both — full mock in light and dark side-by-side

**Question 3 — Frame placement (header: "Placement")**

Options:
- Existing design page — add frames to the current page (ask for page node ID if not known)
- New page — create a dedicated page in Figma; user navigates there first

---

## Phase 2: Source Gathering

For each selected screen:

1. **PRD** — read `docs/PRDs/<feature-slug>.md`, focus on the "Screens & Flows" section.
   Note user stories that affect visible UI elements or states.

2. **IA doc** — read `docs/design/information-architecture.md`, find the heading for this screen.
   Copy all bullet points (components, behaviors, edge cases).

3. **Component map** — read `docs/design/component-map.md`, find the row for this screen.
   Note all components listed and any items marked as not yet implemented.

4. **HTML wireframe** — read the matching file from `docs/wireframes/` or `docs/design/ui-screens/`.
   Parse the HTML structure to understand element order, groupings, and relative sizing.
   **This is the primary layout reference** for positioning in the render JSX.

5. **Component ID cache** — read `.claude/figma-component-map.json` (if it exists).

---

## Phase 3: Generate Render JSX

For each screen, compose render JSX following the rules below.

### Frame Shell (iPhone, no status bar on sheet screens)

```jsx
<Frame name="[ScreenName]" w={393} h={852} bg="[surfacesBasePrimary hex]" flex="col">
  {/* Status bar — surfacesBasePrimary */}
  <Frame w="fill" h={59} bg="[surfacesBasePrimary hex]" />

  {/* Navigation bar — surfacesBasePrimary, borderDefault bottom */}
  <Frame w="fill" h={56} bg="[surfacesBasePrimary hex]" flex="row" align="center" px={20} gap={12}>
    {/* back arrow / title / action icons */}
  </Frame>

  {/* Scrollable content — flex="col", fill remaining height */}
  <Frame w="fill" flex="col" gap={0}>
    {/* screen-specific content */}
  </Frame>

  {/* Tab bar — surfacesBasePrimary, borderDefault top stroke */}
  <Frame w="fill" h={83} bg="[surfacesBasePrimary hex]" flex="row" align="center" justify="around" px={20}>
    {/* tab icons: active = iconsBrand, inactive = iconsMuted */}
  </Frame>
</Frame>
```

**Sheet screens** (modals, pickers, detail panels): omit tab bar.
Add sheet handle at top: `<Frame w={36} h={5} rounded={9999} bg="[borderDefault hex]" align-self="center" mt={8} />`

### iOS Frame Dimensions (iPhone 15 Pro / iPhone 16)

| Zone | y offset | height |
|------|----------|--------|
| Full frame | 0 | w=393 h=852 |
| Status bar | 0 | 59 |
| Navigation bar | 59 | 56 |
| Content area (with nav bar) | 115 | 654 |
| Tab bar | 769 | 83 |

### Layout Rules

- `flex="col"` = VStack, `flex="row"` = HStack
- `gap` values must come from the spacing scale (4, 8, 12, 16, 20, 24, 32, 48)
- `p={16}` or `px={20} py={16}` for horizontal content padding
- Cards and row items: use the project's card radius from design tokens
- Buttons, pills, search bars, chips: `rounded={9999}` (pill)
- Dividers: `<Frame w="fill" h={1} bg="[borderDefault hex]" />`
- Icon placeholders: `<Circle w={20} h={20} bg="[iconsMuted hex]" />`
- **Hex in JSX, token names in comments** — never reference primitive tokens or hardcode arbitrary values

### Component Resolution

For each component used by a screen:
- **Found in cache** → add an inline comment: `{/* AppListItem — nodeId 375:102 */}` and render a
  realistic JSX approximation of what that component looks like.
- **Not in cache / in `_notFound`** → render JSX approximation and add:
  `{/* ⚠️ AppWaveform — not found in map, JSX approximation */}`

### Screen-Specific Content

**Do NOT use hardcoded screen layouts.** Instead, derive the layout from:
1. The HTML wireframe (primary layout reference)
2. The PRD screen description (content and actions)
3. The IA doc (navigation context, components, behaviors)
4. The theme doc (style descriptors, atmosphere, shape language)

For each screen, synthesize these sources into render JSX that follows the theme direction.

### Fidelity Rules

**Skeleton:** Use 2–3 representative list rows. Text content = realistic labels for titles
but generic for body preview. Generate the populated state only.

**Full Mock:** Generate three separate frames per screen:
1. `[ScreenName]` — populated with realistic data
2. `[ScreenName] — Empty` — centered icon placeholder + heading + description + optional button
3. `[ScreenName] — Error` — error toast at top or inline (only for screens with async data)

For dark variants: duplicate the frame JSX, swap hex values to dark mode table, name
`[ScreenName] — Dark`. Position dark frames 32px to the right of the light variant.

---

## Phase 4: Execute Renders

1. **If user chose new page placement:** Output this message and wait for user confirmation:
   > Action required in Figma Desktop: Create a new page named "[FeatureName]" and navigate to it. Then reply here to continue.

2. Start speed daemon (idempotent — safe to run even if already running):
   ```bash
   node figma-cli/src/index.js daemon
   ```

3. **For 1–2 screens:** use individual `render` calls:
   ```bash
   node figma-cli/src/index.js render '<Frame name="ScreenName" ...>...</Frame>'
   ```

4. **For 3+ screens:** use `render-batch` (faster):
   ```bash
   node figma-cli/src/index.js render-batch '[{"jsx":"<Frame name=...>...</Frame>"},{"jsx":"..."}]'
   ```
   - Escape all double quotes inside JSX strings (`\"`)
   - Position dark variants: `"x": <lightX + 393 + 32>`

5. Collect the returned node IDs for each frame. Use them in the design brief.

---

## Phase 5: Design Brief

After all renders complete, output a markdown summary:

```markdown
## [Feature] — Design Brief
Generated: [date]
Figma: [file key] · Page: [page name]

### Frames Created
| Screen | Mode | Node ID | Open in Figma |
|--------|------|---------|---------------|
| ScreenName | Light | XXX:YYY | https://figma.com/design/[fileKey]?node-id=XXX:YYY |

### Component Coverage
| Component | Status | Context |
|-----------|--------|---------|
| AppListItem | ✅ nodeId 375:102 | List rows |
| AppButton | ✅ nodeId 375:100 | Actions |
| MissingComponent | ⚠️ JSX approximation | ScreenName — not yet built |

### Gaps
- ⚠️ **[Component] not built** — [which screens] use visual stubs
  → Fix: `/figma-component-sync [Component]` then implement

### Suggested Next Steps
1. Review frames in Figma and iterate visually
2. [if gaps] Build missing components before finalising these designs
3. When designs are approved → `/build-feature <feature>`
4. After build → `/component-audit <NewComponent>` for each new component
```

---

## Flags

| Flag | Behaviour |
|------|-----------|
| `--refresh-map` | Re-run Phase 0, overwrite `.claude/figma-component-map.json` |
| `--all` | Generate all screens from IA, skip Question 1 |
| `<feature-slug>` | Pre-select feature, skip Question 1 |
| `<ScreenName>` | Single-screen mode, skip Question 1 |

---

## Rules

- **Always read the HTML wireframe** before generating render JSX — it is the layout source of truth
- **Hex in JSX, token names in comments** — never reference primitive tokens or hardcode arbitrary values
- **Component map is a cache** — if Figma Desktop is unreachable, fall back to JSX approximations gracefully
- **figma-cli writes to the active page** — ensure user navigates to the target page before Phase 4
- **render-batch is preferred** for 3+ screens; `render` for 1–2 screens
- **Never generate code for production** — this skill only creates Figma design frames
- **figma-cli commands run from workspace root** (not from inside figma-cli/)
- **Token hex values are read dynamically** — never hardcode them in this skill; always resolve from project token files
