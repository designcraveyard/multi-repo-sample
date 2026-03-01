# /design-discovery — Design the app's information architecture, screens, and component plan

## Description

The most complex discovery skill. Runs multiple sequential sub-workflows with user checkpoints between each: Information Architecture → Theme → Component Audit → Screen Design.

## Trigger

User says "/design-discovery" or "start design discovery" or "design the app"

## Prerequisites

- `/product-discovery` must be complete (needs PRDs, personas, MVP matrix)
- Project must be scaffolded (needs `tracker.md`, component library)

## Instructions

### Sub-flow A: Information Architecture

1. Read all context:
   - `docs/PRDs/` — all feature specs
   - `docs/personas/` — user types
   - `docs/mvp-matrix.md` — feature priorities
   - `docs/app-brief.md` — app context

2. Propose navigation structure:
   - Tab bar items (bottom nav on mobile, sidebar on desktop)
   - Screen hierarchy under each tab
   - Modal flows (authentication, settings, etc.)
   - Present to user for approval using `AskUserQuestion`

3. Generate screen inventory:
   - List every screen with: name, parent tab, purpose, navigation path
   - Mark which screens are in MVP scope

4. Write `docs/design/information-architecture.md`

5. **Checkpoint:** Ask user to review before proceeding.

### Sub-flow B: Theme & Design System

**Delegate to `/define-theme`.**

After the IA checkpoint is approved, prompt the user:

> "Sub-flow B: Visual Identity. Run `/define-theme` now to define the brand personality,
> color palette, shape language, and typography feel — then generate `docs/design/theme.md`.
> It will offer to apply the palette to all platform files when done."

Then wait. `/define-theme` handles everything in this sub-flow:
- Reads existing state (current palette, any existing theme.md)
- Asks guided questions: personality, mood, color direction, neutral, shape, density, references
- Recommends Tailwind palettes with rationale based on answers
- Writes `docs/design/theme.md`
- Offers to run `/generate-theme` to apply the chosen palette

**Checkpoint:** Once the user confirms `/define-theme` is complete and `docs/design/theme.md` exists, proceed to Sub-flow C.

> **If the user wants to skip theme definition** (e.g. keeping the scaffold default), note it
> in the session log and proceed to Sub-flow C with the existing palette unchanged.

### Sub-flow C: Component Audit

1. Read screen inventory from IA
2. Read `docs/components.md` for existing template components
3. For each screen, list required components with their variants
4. Identify gaps:
   - **Simple gaps** (new variant of existing component) → note for implementation
   - **New components needed** → add to component backlog
5. Write `docs/design/component-map.md`:
   - Table: Screen | Components Used | Gaps

### Sub-flow D: Screen Design (Wireframes)

For each screen in the IA inventory (prioritize MVP screens):

1. **Generate HTML wireframe:**
   - Create a standalone HTML file using Tailwind CDN + design token styles
   - Match the component styles from the template
   - Include all four states (loading, empty, error, populated) as tabs/sections

2. **Screenshot via Playwright:**
   - Use `browser_navigate` to open the HTML file (`file://` protocol or local server)
   - Use `browser_take_screenshot` to capture the wireframe
   - Present to user for feedback

3. **Iterate** based on user feedback until approved

4. **Push to Figma (optional):** If `figma-cli/` exists and Figma Desktop is open, offer to recreate the approved wireframe in Figma:
   ```bash
   node figma-cli/src/index.js connect
   node figma-cli/src/index.js recreate-url "file:///path/to/wireframe.html" --name "<ScreenName>"
   ```
   Alternatively, for more control, use `render` to build the screen layout:
   ```bash
   node figma-cli/src/index.js render '<Frame name="<ScreenName>" w={375} h={812} bg="#09090b" flex="col" p={0}>
     <!-- Header, content, nav sections -->
   </Frame>'
   ```

5. **Write screen spec:** `docs/design/screens/<screen-name>.md`
   - Screenshot reference
   - Figma node ID (if pushed via figma-cli)
   - Component list with props/variants
   - Layout description (compact + regular breakpoints)
   - State handling: loading, empty, error, populated
   - Navigation: where this screen sits, how it's reached, where it goes

6. **Checkpoint** after every 2-3 screens — ask if user wants to continue or adjust direction.

### Final Steps

1. Update `tracker.md` → Phase "Design" = Done, 100%
2. Mark each feature's "Screens designed" checkbox
3. Log design decisions in Decision Log
4. Suggest next step: `/schema-discovery`
