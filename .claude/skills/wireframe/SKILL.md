---
name: wireframe
description: >
  Rapidly explore layout patterns, navigation structures, and information
  architecture through component-matched wireframes. Generates 3 variations
  per screen as standalone HTML files. In --all mode, also produces a single
  zoomable Figma-like canvas (canvas.html) with all artboards on a flat grid
  with zoom+pan interaction. Each artboard shows a phone frame (393x852) with
  optional iPad and desktop frames. Component primitives mirror the production
  design system. Use after /design-discovery has produced an IA and PRD docs,
  before committing to a screen implementation.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# /wireframe — Rapid Wireframe Exploration

### CSS Design System

The wireframe CSS lives as a bundled skill resource at `.claude/skills/wireframe/wireframe.css`.

On first run, copy it to `docs/wireframes/_wireframe.css` if not already present:
```bash
cp .claude/skills/wireframe/wireframe.css docs/wireframes/_wireframe.css 2>/dev/null || true
```

All wireframe HTML files reference this shared CSS via `<link rel="stylesheet" href="_wireframe.css">`.
Never regenerate the CSS inline — always reference the existing file.

## Purpose

Wireframes are **design hypotheses, not implementations.** Each variation
answers a different question: Does search belong inline or in a dedicated
screen? Is this a bottom sheet or a core nav tab? Does a list or a card grid
serve this content better? The goal is to iterate cheaply and lock in
patterns *before* writing production code.

The wireframe CSS mirrors the production design system: same semantic token
names, same spacing scale, same radius values, same component proportions —
but rendered in neutral grayscale so the focus stays on layout and hierarchy.

---

## Usage

```
/wireframe <ScreenName>          # single screen, 3 variations
/wireframe --all                 # all screens from PRDs, batch
/wireframe --iterate <ScreenName> # refine existing wireframes

Flags (override the format prompt):
  --html       Force HTML prototype output
  --figma      Force Figma CLI output
  --both       Both outputs
  --variations=N  Override default of 3 (max 5)
  --responsive  Show phone + iPad + desktop side-by-side
```

`$ARGUMENTS` contains the raw invocation string. Parse it before Phase 1.

---

## Phase 0: Parse Arguments

Extract from `$ARGUMENTS`:
- `screen_name` — PascalCase name, or empty if `--all`
- `mode` — `single` | `all` | `iterate`
- `format_flag` — `html` | `figma` | `both` | empty (ask)
- `variation_count` — number from `--variations=N`, default `3`
- `responsive` — boolean, true if `--responsive` flag present

Convert `screen_name` to:
- **kebab-case** for file names (e.g. `NoteEditor` → `note-editor`)
- **Human title** for display (e.g. `NoteEditor` → "Note Editor")

---

## Phase 1: Format Selection

If no format flag was provided, ask:

> "Where should I output the wireframes?"
> - **HTML prototype** — interconnected files in `docs/wireframes/`, open in a browser
> - **Figma CLI** — push frames directly into Figma Desktop ("Wireframes" page)
> - **Both** — HTML first, then push to Figma

Store the selection as `output_format` (html | figma | both).

---

## Phase 2: Doc Intake

### 2a. Read Design Guidelines

Read `docs/design/design-guidelines.md` for layout and spacing standards. Apply these to wireframe layouts:
- 24px content padding on phone artboard, 32–40px on desktop
- 32–40px between major sections, 16–20px between form groups, 12px between fields
- Max 1400px content width on desktop frames
- 3–4 type sizes per screen, one primary CTA per view
- 44pt minimum touch targets (prefer lg component variants on phone)

### 2a-bis: Read Component Registry

Read `docs/components.md` to get the full list of available production components. When generating wireframe HTML in Phase 4a, **annotate every interactive/content element** with a `data-component` attribute mapping to the production component name:

| Wireframe CSS Class | `data-component` | `data-variant` | Production Component |
|---------------------|------------------|----------------|---------------------|
| `.wf-btn` | `AppButton` | `primary` / `secondary` / `tertiary` / `ghost` | Button |
| `.wf-input` | `AppInputField` | — | InputField |
| `.wf-chip` | `AppChip` | `filter` / `tag` | Chip |
| `.wf-tab-bar` | `AppTabs` | — | Tabs |
| `.wf-list-item` | `AppListItem` | — | ListItem (pattern) |
| `.wf-card` | `AppListItem` | `card` | ListItem or Card pattern |
| `.wf-toggle` | `AppSwitch` | — | Switch |
| `.wf-checkbox` | `AppCheckbox` | — | Checkbox |
| `.wf-radio` | `AppRadioButton` | — | RadioButton |
| `.wf-badge` | `AppBadge` | — | Badge |
| `.wf-avatar` | `AppThumbnail` | `sm` / `md` / `lg` | Thumbnail |
| `.wf-divider` | `AppDivider` | — | Divider |
| `.wf-search-bar` | `AppInputField` | `search` | InputField (search) |
| `.wf-bottom-sheet` | `AdaptiveSheet` | — | Native wrapper |
| `.wf-fab` | `AppIconButton` | `primary` / `lg` | IconButton |
| `.wf-empty-state` | `EmptyState` | — | Pattern (TextBlock + Button) |

**Example annotated HTML:**
```html
<button class="wf-btn primary lg" data-component="AppButton" data-variant="primary" data-size="lg">
  Save Changes
</button>
<div class="wf-list-item" data-component="AppListItem">
  <div class="wf-list-label">Notifications</div>
  <div class="wf-toggle" data-component="AppSwitch"></div>
</div>
```

**At the end of each wireframe file**, append a hidden component manifest comment:
```html
<!-- COMPONENT-MANIFEST
AppButton: primary(2), secondary(1)
AppInputField: search(1)
AppChip: filter(4)
AppListItem: default(6)
AppDivider: default(3)
AppSwitch: default(2)
-->
```

This manifest enables downstream skills (`/build-feature`, `/new-screen`) to parse wireframes and auto-import the right components.

### 2b. Single screen (`/wireframe <Name>`)

1. Search for the screen's PRD:
   ```
   Glob: docs/PRDs/**/*.md
   Grep: pattern=<ScreenName>, path=docs/
   ```
2. Read the matching PRD section(s).
3. Read `docs/design/information-architecture.md` (if it exists) to get:
   - Where this screen sits in the nav hierarchy
   - How it's reached and where it leads

### 2b. All screens (`/wireframe --all`)

1. Read all files in `docs/PRDs/` and `docs/design/`.
2. Extract every screen in the IA inventory.
3. Sort by flow (onboarding → home → sub-screens) for generation order.

### 2c. Iterate (`/wireframe --iterate <Name>`)

1. Glob `docs/wireframes/<kebab>-v*.html` to find all existing variation files.
2. Read each variation file.
3. Read associated screen spec `docs/design/screens/<kebab>.md` if present.
4. Skip to **Phase 4b: Iterate Loop**.

### Key info to extract per screen:
- **Purpose** — what job does the user do here?
- **Primary content** — what is displayed? (list, form, detail, feed, etc.)
- **Key actions** — what can the user do?
- **Navigation context** — top-level tab, modal, pushed screen, bottom sheet?
- **Content density** — sparse (1-3 items) or dense (many items)?
- **Decision points** — anything explicitly marked as "TBD" or "explore"

---

## Phase 3: Variation Planning

For each screen, generate **`variation_count` variation plans** before writing any files.

Each variation plan must specify:

```
V1: <Short title>
  Layout:      [list | cards | feed | split | form | etc.]
  Nav pattern: [bottom-tab | top-bar | sheet | inline | pushed]
  Device:      [phone | phone+tablet | phone+tablet+desktop]
  Hypothesis:  "This works if users primarily [browse / search / compare / complete a task]"
  Key tradeoff: What this gives up vs. what it wins
```

**Variation strategies to explore:**
- **Navigation depth:** flat (everything on one screen) vs. deep (drill into detail)
- **Primary action placement:** floating button vs. inline vs. header action
- **Content hierarchy:** list-first vs. card-first vs. feed
- **Progressive disclosure:** show everything vs. summary + expand
- **Sheet vs. screen:** modal bottom sheet vs. navigating to a new screen
- **Search placement:** sticky top bar vs. inline vs. dedicated search screen
- **Responsive layout:** phone-only vs. split-view on tablet vs. sidebar on desktop

**Show the variation plan to the user and ask for a go-ahead before generating.**

Example output:
```
## Wireframe Plan: Note Editor

V1: "Focused Canvas"
  Layout:      Full-screen text area, minimal chrome
  Nav pattern: Toolbar at bottom (formatting), header for title + back
  Device:      phone
  Hypothesis:  Works if writing speed > feature discovery
  Tradeoff:    Hides formatting power; great for speed typists

V2: "Structured Editor"
  Layout:      Sticky title field, scrollable body, side rail for metadata
  Nav pattern: Top bar (save/share), collapsible formatting panel
  Device:      phone+tablet (split view on iPad: note list | editor)
  Hypothesis:  Works if users care about metadata (tags, date, linked notes)
  Tradeoff:    More chrome; harder on small screens

V3: "Card Canvas"
  Layout:      Block-based editor (note = stack of content cards)
  Nav pattern: Floating add-block button, swipe-to-reorder
  Device:      phone+desktop (web shows full toolbar)
  Hypothesis:  Works if notes are structured (todo + text + image blocks)
  Tradeoff:    Highest cognitive load; most powerful

Proceed with generation? (yes / adjust plan)
```

Wait for user confirmation before Phase 4.

---

## Phase 4a: Generate — HTML Prototype

### Setup

The shared wireframe stylesheet ships as a static file at `docs/wireframes/_wireframe.css`.
It is included in the repo and copied automatically during `/new-project` scaffolding.

Verify the file exists before generating wireframes:

```
docs/wireframes/_wireframe.css   ← must exist (shipped with repo)
```

If the file is missing (e.g., user deleted it), copy it from the template repo or re-run `/new-project`.
**Do NOT regenerate the CSS inline** — always use the static file.

---

### Generating Each Variation as a Separate HTML File

Each variation is its own standalone file. For a screen named `NoteEditor` with
3 variations, create:

```
docs/wireframes/note-editor-v1.html
docs/wireframes/note-editor-v2.html
docs/wireframes/note-editor-v3.html
```

**File naming:** `<kebab>-v<N>.html` where N is the variation number (1-based).

**Template for each variation file** (`docs/wireframes/<kebab>-v<N>.html`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><HumanTitle> — V<N>: <VN Short Title></title>
  <link rel="stylesheet" href="_wireframe.css" />
  <script src="https://unpkg.com/@phosphor-icons/web"></script>
</head>
<body class="wf-viewer">

  <!-- Prototype navigation (links between all screens) -->
  <nav class="wf-prototype-nav">
    <span class="wf-prototype-nav-label">Wireframes</span>
    <!-- Add a link per screen in the project -->
    <a href="<other-screen>-v1.html">Other Screen</a>
    <a href="<kebab>-v1.html" class="active"><HumanTitle></a>
  </nav>

  <!-- Page header -->
  <div style="text-align:center; padding:24px 24px 4px; color:rgba(255,255,255,0.85);">
    <a href="index.html" style="font-size:12px; color:rgba(255,255,255,0.4); text-decoration:none;">← All screens</a>
    <h1 style="font-size:18px; font-weight:700; margin:8px 0 4px;"><HumanTitle></h1>
    <p style="font-size:12px; color:rgba(255,255,255,0.45); margin-bottom:4px;">
      V<N>: <VN Short Title>
    </p>
    <p style="font-size:11px; color:rgba(255,255,255,0.35); margin-bottom:16px; max-width:400px; margin-left:auto; margin-right:auto;">
      <VN hypothesis text>
    </p>
  </div>

  <!-- Variation navigation -->
  <div class="wf-variation-strip">
    <a href="<kebab>-v1.html" class="wf-variation-tab <'active' if N==1>">V1</a>
    <a href="<kebab>-v2.html" class="wf-variation-tab <'active' if N==2>">V2</a>
    <a href="<kebab>-v3.html" class="wf-variation-tab <'active' if N==3>">V3</a>
  </div>

  <!-- Device artboard(s) -->
  <div class="wf-stage">

    <!-- Phone (always present) -->
    <div>
      <div class="wf-phone">
        <div class="wf-status-bar">
          <span class="wf-status-time">9:41</span>
          <div class="wf-dynamic-island"></div>
          <div class="wf-status-icons">
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none"><rect x="0" y="6" width="3" height="6" rx="1" fill="currentColor"/><rect x="4.5" y="4" width="3" height="8" rx="1" fill="currentColor"/><rect x="9" y="2" width="3" height="10" rx="1" fill="currentColor"/></svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" stroke-opacity="0.35"/><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/><path d="M23 4v4a2 2 0 0 0 0-4z" fill="currentColor" opacity="0.4"/></svg>
          </div>
        </div>
        <div class="wf-screen">
          <!-- SCREEN CONTENT for this variation -->
        </div>
      </div>
      <div class="wf-device-label">iPhone</div>
    </div>

    <!-- iPad (optional — include if --responsive or variation targets tablet) -->
    <!--
    <div>
      <div class="wf-tablet">
        <div class="wf-screen" style="flex-direction:row;">
          TABLET CONTENT — typically split view
        </div>
      </div>
      <div class="wf-device-label">iPad</div>
    </div>
    -->

    <!-- Desktop (optional — include if --responsive or variation targets desktop) -->
    <!--
    <div>
      <div class="wf-desktop">
        <div class="wf-browser-bar">
          <div class="wf-browser-dots"><span></span><span></span><span></span></div>
          <div class="wf-browser-url"></div>
        </div>
        <div class="wf-screen" style="flex-direction:row;">
          DESKTOP CONTENT — sidebar + main
        </div>
      </div>
      <div class="wf-device-label">Desktop</div>
    </div>
    -->

  </div>

</body>
</html>
```

**Rules for generating screen content:**
- Use only classes from `_wireframe.css` — no inline colors or font-sizes (inline `style` only for heights, widths, specific layout)
- Images/media → `<div class="wf-placeholder img" style="height:Npx" data-label="Photo">` with specific height
- All text is real text (not lorem ipsum) — use plausible labels from the PRD
- Use `<i class="ph ph-<name>"></i>` for icons (Phosphor icons — same library as production)
- Links between screens: `<a href="<other-kebab>-v1.html">` on tappable elements
- Mark bottom tab active state with `class="wf-tab-item active"` for the current screen's tab
- Every variation must include navigation chrome appropriate to its nav pattern
- **Nav bar**: Use `wf-nav-large-title` for top-level screens, `wf-nav-title` for pushed screens
- **Tab bar**: Always 83px with the project's actual tab structure
- **Component matching**: Use wireframe components that match the production counterpart (e.g., pill-shaped buttons, rounded cards with shadow, list items with icon/label/chevron)

### Multi-Device Guidelines

When `--responsive` flag is set OR the variation plan specifies tablet/desktop:

**Phone (393×852):**
- Standard single-column layout
- Bottom tab bar for top-level navigation
- FAB for primary action when applicable

**iPad (1024×1366 at 60% scale):**
- Use `wf-split-view` for list→detail screens (AdaptiveSplitView pattern)
- `wf-split-list` (320px) + `wf-split-detail` (remaining)
- No bottom tab bar — use sidebar navigation or top bar
- Content area gets more horizontal breathing room

**Desktop (1440×900 at 60% scale):**
- Use `wf-sidebar` (240px) for AdaptiveNavShell pattern
- `wf-split-view` for list→detail
- Browser chrome via `wf-browser-bar`
- No FAB — use inline or header buttons instead

---

### Generating the Index Page

Create/update `docs/wireframes/index.html` after each generation run. The index
shows **every variation file** as its own card in a grid — not grouped by screen.
This makes each card a distinct artboard for `/send-to-figma` capture.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Wireframes</title>
  <link rel="stylesheet" href="_wireframe.css" />
</head>
<body class="wf-viewer">
  <div style="padding:32px 24px 16px; text-align:center; color:rgba(255,255,255,0.85);">
    <h1 style="font-size:24px; font-weight:700; margin-bottom:4px;">Wireframes</h1>
    <p style="font-size:13px; color:rgba(255,255,255,0.4);">Each card is one artboard — ready for /send-to-figma</p>
  </div>
  <div class="wf-index-grid">
    <!-- one .wf-index-card per variation FILE -->
    <a href="<kebab>-v1.html" class="wf-index-card">
      <div class="wf-index-thumb"><HumanTitle> V1</div>
      <div class="wf-index-label"><HumanTitle></div>
      <div class="wf-index-sub">V1: <V1 Short Title></div>
    </a>
    <a href="<kebab>-v2.html" class="wf-index-card">
      <div class="wf-index-thumb"><HumanTitle> V2</div>
      <div class="wf-index-label"><HumanTitle></div>
      <div class="wf-index-sub">V2: <V2 Short Title></div>
    </a>
    <a href="<kebab>-v3.html" class="wf-index-card">
      <div class="wf-index-thumb"><HumanTitle> V3</div>
      <div class="wf-index-label"><HumanTitle></div>
      <div class="wf-index-sub">V3: <V3 Short Title></div>
    </a>
    <!-- repeat for all screens × variations -->
  </div>
</body>
</html>
```

---

## Phase 4c: Generate — Canvas View (`--all` mode only)

When `mode` is `all`, generate a single-page zoomable canvas after all individual variation files have been written. This phase does **not** run for single-screen or iterate modes.

### File: `docs/wireframes/canvas.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wireframes — Canvas</title>
  <link rel="stylesheet" href="_wireframe.css" />
  <script src="https://unpkg.com/@phosphor-icons/web"></script>
</head>
<body class="wf-canvas">

  <!-- Zoom toolbar — fixed bottom-center -->
  <div class="wf-canvas-toolbar">
    <button data-action="zoom-out" title="Zoom out (−)">−</button>
    <span class="wf-zoom-display">100%</span>
    <button data-action="zoom-in" title="Zoom in (+)">+</button>
    <div class="wf-toolbar-sep"></div>
    <button data-action="fit" title="Fit all (1)">Fit</button>
    <button data-action="reset" title="Reset to 100% (0)">1:1</button>
  </div>

  <!-- Transformable surface -->
  <div class="wf-canvas-surface" id="surface">
    <div class="wf-canvas-grid">

      <!-- Repeat one .wf-artboard-wrapper per variation file -->
      <div class="wf-artboard-wrapper">
        <div class="wf-phone">
          <div class="wf-status-bar">
            <span class="wf-status-time">9:41</span>
            <div class="wf-dynamic-island"></div>
            <div class="wf-status-icons">
              <svg width="17" height="12" viewBox="0 0 17 12" fill="none"><rect x="0" y="6" width="3" height="6" rx="1" fill="currentColor"/><rect x="4.5" y="4" width="3" height="8" rx="1" fill="currentColor"/><rect x="9" y="2" width="3" height="10" rx="1" fill="currentColor"/></svg>
              <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" stroke-opacity="0.35"/><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/><path d="M23 4v4a2 2 0 0 0 0-4z" fill="currentColor" opacity="0.4"/></svg>
            </div>
          </div>
          <div class="wf-screen">
            <!-- SCREEN CONTENT from this variation -->
          </div>
        </div>
        <div class="wf-artboard-label"><HumanTitle></div>
        <div class="wf-artboard-sublabel">V<N>: <VN Short Title></div>
      </div>

      <!-- ... more artboard wrappers ... -->

    </div>
  </div>

  <script>
  (() => {
    const surface = document.getElementById('surface');
    const body = document.body;
    const zoomDisplay = document.querySelector('.wf-zoom-display');
    let zoom = 1, panX = 0, panY = 0;
    let isDragging = false, dragStartX = 0, dragStartY = 0, panStartX = 0, panStartY = 0;
    const ZOOM_MIN = 0.15, ZOOM_MAX = 3;

    function apply() {
      surface.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
      zoomDisplay.textContent = Math.round(zoom * 100) + '%';
    }

    // --- Wheel zoom toward cursor ---
    body.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom * (1 + delta)));
      const rect = body.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      panX = mx - (mx - panX) * (newZoom / zoom);
      panY = my - (my - panY) * (newZoom / zoom);
      zoom = newZoom;
      apply();
    }, { passive: false });

    // --- Mouse drag to pan ---
    body.addEventListener('mousedown', (e) => {
      if (e.target.closest('.wf-canvas-toolbar')) return;
      isDragging = true;
      dragStartX = e.clientX; dragStartY = e.clientY;
      panStartX = panX; panStartY = panY;
      body.classList.add('grabbing');
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      panX = panStartX + (e.clientX - dragStartX);
      panY = panStartY + (e.clientY - dragStartY);
      apply();
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
      body.classList.remove('grabbing');
    });

    // --- Toolbar actions ---
    document.querySelector('.wf-canvas-toolbar').addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'zoom-in') zoom = Math.min(ZOOM_MAX, zoom + 0.25);
      if (action === 'zoom-out') zoom = Math.max(ZOOM_MIN, zoom - 0.25);
      if (action === 'reset') { zoom = 1; panX = 0; panY = 0; }
      if (action === 'fit') fitAll();
      apply();
    });

    // --- Keyboard shortcuts ---
    window.addEventListener('keydown', (e) => {
      if (e.key === '+' || e.key === '=') { zoom = Math.min(ZOOM_MAX, zoom + 0.25); apply(); }
      if (e.key === '-') { zoom = Math.max(ZOOM_MIN, zoom - 0.25); apply(); }
      if (e.key === '0') { zoom = 1; panX = 0; panY = 0; apply(); }
      if (e.key === '1') { fitAll(); apply(); }
    });

    // --- Fit all artboards in viewport ---
    function fitAll() {
      const grid = surface.querySelector('.wf-canvas-grid');
      if (!grid) return;
      const sw = grid.scrollWidth, sh = grid.scrollHeight;
      const vw = window.innerWidth, vh = window.innerHeight;
      zoom = Math.min(vw / sw, vh / sh, 1) * 0.92;
      panX = (vw - sw * zoom) / 2;
      panY = (vh - sh * zoom) / 2;
    }

    // Auto-fit on load
    fitAll();
    apply();
  })();
  </script>

</body>
</html>
```

### Content generation rules

- **For each variation file** (sorted by screen flow order, then variation number):
  extract the phone frame content (everything inside `.wf-screen`) from the already-generated `<kebab>-v<N>.html` file.
- Wrap in `.wf-artboard-wrapper` → `.wf-phone` (with status bar + dynamic island) → `.wf-screen` (content).
- Add `.wf-artboard-label` with the screen's human title and `.wf-artboard-sublabel` with `V<N>: <Short Title>`.
- **No** `.wf-prototype-nav`, `.wf-variation-strip`, or page headers — artboards sit directly on the canvas.
- The canvas grid auto-wraps based on viewport width (via `auto-fill, minmax(440px, 1fr)`).
- Include the same `<!-- COMPONENT-MANIFEST -->` comment at the end of the file,
  merged from all individual variation manifests.

---

## Phase 4b: Generate — Figma CLI

**Skip-Figma check:** If `pipeline.json` exists at the project root and `flags.skip_figma` is `true`, skip this entire phase (treat as `output_format = html`). Also skip if `--html` flag was passed explicitly.

If `output_format` is `figma` or `both`:

1. Verify Figma Desktop is open and connected:
   ```bash
   node figma-cli/src/index.js connect
   ```
   If this fails, report the error and skip Figma output.

2. For each variation, render a frame to a "Wireframes" page using grayscale-only values:
   ```bash
   node figma-cli/src/index.js render '<Frame
     name="<ScreenName> — V1: <V1Title>"
     w={393} h={852}
     bg="#F5F5F5"
     flex="col"
   >
     <!-- Frame content as JSX matching the HTML variation -->
   </Frame>'
   ```

3. Convert each rendered frame to a Figma component:
   ```bash
   node figma-cli/src/index.js node to-component "<ScreenName> — V1"
   ```

4. Use only these Figma color values (matching `_wireframe.css`):
   - `#F5F5F5` — base primary background
   - `#FFFFFF` — elevated surfaces
   - `#EBEBEB` — low contrast / input background
   - `#E5E5E5` — borders
   - `#171717` — primary text / brand fill
   - `#A3A3A3` — muted text
   - `#1A1A1A` — primary buttons

See `figma-cli/CLAUDE.md` for full JSX render syntax.

---

## Phase 5: Decision Prompt

After generating all files, show:

```
## Wireframes ready: <HumanTitle>

Files:
  docs/wireframes/<kebab>-v1.html
  docs/wireframes/<kebab>-v2.html
  docs/wireframes/<kebab>-v3.html
  docs/wireframes/canvas.html        ← only in --all mode

### Open in browser:
open docs/wireframes/<kebab>-v1.html

### Open canvas view (--all mode):
open docs/wireframes/canvas.html

### Send to Figma:
/send-to-figma docs/wireframes

---
### Variation summary:

| | V1: <Title> | V2: <Title> | V3: <Title> |
|--|--|--|--|
| Nav pattern | bottom tabs | top tabs | floating |
| Content style | list | cards | feed |
| Primary action | FAB | header | inline |
| Devices | phone | phone+tablet | phone+desktop |

### Exploring these questions:
- [ ] Does search belong inline or in its own screen?
- [ ] Bottom sheet or pushed screen for [detail]?
- [ ] How much metadata to surface in list view?

---
Which variation do you want to keep, discard, or mix?
Or run: /wireframe --iterate <ScreenName> to refine based on your notes.
```

The questions listed should be extracted directly from the variation plans —
specifically the `Hypothesis` and `Key tradeoff` fields.

---

## Phase 4b (Iterate mode): `/wireframe --iterate <Name>`

1. Glob and read all existing `docs/wireframes/<kebab>-v*.html` files.

2. Ask:
   > "What do you want to change? Describe in plain English, e.g.:
   > - 'V2's nav feels better — try building all variations from it'
   > - 'Try a bottom sheet for the detail view instead of a pushed screen'
   > - 'V3 is too complex — simplify the card layout'
   > - 'Add a search screen variation'
   > - 'Show me V1 on iPad with split view'"

3. Parse the feedback and determine:
   - Which variation file(s) to modify
   - Whether to add a new variation (create `<kebab>-v4.html` etc. if `variation_count` allows)
   - Whether to synthesize a new variation that merges picks from multiple
   - Whether to add tablet/desktop frame to an existing phone-only variation

4. Write/update the affected `<kebab>-v<N>.html` file(s). Each file is standalone,
   so just rewrite the file content. Update the sibling navigation links in ALL
   variation files for this screen if a new variation was added.

5. Update `index.html` to include cards for any new variation files.

6. Show the decision prompt again.

---

## Wireframe Component Vocabulary

Use these component classes consistently across all generated wireframes. Each
maps to a production component from the component registry (`docs/components.md`):

| Production Component | Wireframe Class | Pattern |
|---------------------|----------------|---------|
| Page background | `<body class="wf-viewer">` | Dark viewer environment |
| Prototype nav | `.wf-prototype-nav` | Sticky screen navigation bar |
| **Phone artboard** | `.wf-phone` | 393×852, Dynamic Island, rounded |
| **iPad artboard** | `.wf-tablet` | 1024×1366 at 60%, rounded |
| **Desktop artboard** | `.wf-desktop` + `.wf-browser-bar` | 1440×900 at 60%, browser chrome |
| Status bar + Dynamic Island | `.wf-status-bar` + `.wf-dynamic-island` | 59px, time + icons |
| Navigation bar (large title) | `.wf-nav-bar` + `.wf-nav-large-title` | Blur backdrop, large title |
| Navigation bar (compact) | `.wf-nav-bar` + `.wf-nav-title` | Blur backdrop, inline title |
| Back button | `.wf-nav-btn` | Icon + text |
| Icon button (nav) | `.wf-nav-icon-btn` | 36px round |
| Tab bar | `.wf-tab-bar` > `.wf-tab-item` | 83px, frosted glass |
| Scrollable body | `.wf-content` | Flex-1, overflow-y auto |
| Padded content | `.wf-padded` | 16px padding, 16px gap |
| SearchBar | `.wf-search-wrap` > `.wf-search-bar` | Icon + input, rounded |
| Chip | `.wf-chip` / `.wf-chip.active` | Pill, brand fill when active |
| Chip row | `.wf-chip-row` | Horizontal scroll |
| Section header | `.wf-section-header` | Title + action |
| Section label | `.wf-section-label` | Uppercase overline |
| Card | `.wf-card` | Rounded-lg, shadow-sm, border |
| Card (horizontal) | `.wf-card.row` | Row layout |
| ListItem | `.wf-list-item` | Icon + label + value + chevron |
| List section | `.wf-list-section` | Grouped rounded container |
| Button (primary) | `.wf-btn.primary` | Pill, brand fill |
| Button (secondary) | `.wf-btn.secondary` | Pill, subtle fill |
| Button (tertiary) | `.wf-btn.tertiary` | Pill, brand border |
| Button (ghost) | `.wf-btn.ghost` | Pill, no background |
| Button sizes | `.wf-btn.sm` / `.md` / `.lg` | 32/40/48px height |
| InputField | `.wf-input` + `.wf-input-label` | Label + rounded input |
| TextField | `.wf-textarea` | Multi-line input |
| Avatar | `.wf-avatar` (`.sm` / `.lg`) | Circle, 28/40/56px |
| Badge | `.wf-badge` | Brand pill, numeric |
| Tag/Label | `.wf-tag` | Subtle pill, metadata |
| FAB | `.wf-fab` | 56px, bottom-right, brand |
| Bottom sheet | `.wf-bottom-sheet` + `.wf-sheet-handle` | Rounded top, overlay |
| Toggle/Switch | `.wf-toggle` / `.wf-toggle.on` | 51×31px, slide knob |
| Radio button | `.wf-radio` / `.wf-radio.checked` | 20px circle |
| Checkbox | `.wf-checkbox` / `.wf-checkbox.checked` | 20px rounded square |
| Divider | `.wf-divider` / `.wf-divider.full` | 1px border-muted |
| Empty state | `.wf-empty-state` | Icon + title + body |
| Image placeholder | `.wf-placeholder.img` | Hash lines overlay |
| Image thumbnail | `.wf-thumb` | 52×52px rounded |
| Ornamental divider | `.wf-ornament` | Lines + text |
| Annotation | `.wf-annotation` | Italic left-border note |
| **Desktop sidebar** | `.wf-sidebar` > `.wf-sidebar-item` | 240px nav sidebar |
| **Split view** | `.wf-split-view` > `.wf-split-list` + `.wf-split-detail` | List→detail panel |

---

## Output Checklist

Before marking generation complete, verify:
- [ ] `_wireframe.css` exists in `docs/wireframes/`
- [ ] `index.html` updated with a card for each variation file
- [ ] Each variation is its own standalone `<kebab>-v<N>.html` file
- [ ] Each file has `.wf-phone` (393×852) with `.wf-status-bar` + `.wf-dynamic-island`
- [ ] Tab bar is 83px (`.wf-tab-bar`) for top-level screens
- [ ] Nav bar uses large title for top-level, compact title for pushed screens
- [ ] Sibling variation links (`.wf-variation-strip`) are correct in all files for a screen
- [ ] Prototype navigation bar (`.wf-prototype-nav`) links to all screens
- [ ] Hypothesis text is shown inline in each file's header
- [ ] At least one navigation link between screens exists
- [ ] No hardcoded hex colors in screen content (use only CSS vars from `_wireframe.css`)
- [ ] All images are `.wf-placeholder.img` — no `<img>` tags with real src
- [ ] All buttons are pill-shaped (`.wf-btn` uses `border-radius: var(--radius-full)`)
- [ ] Spacing uses semantic tokens (`--space-*`) not arbitrary pixel values
- [ ] If `--responsive`, iPad/desktop frames are present with appropriate layout patterns
- [ ] If `--all`, `canvas.html` generated with all artboards on a flat grid
- [ ] Canvas: every variation file has a corresponding `.wf-artboard-wrapper` on the canvas
- [ ] Canvas: zoom+pan JS works (scroll to zoom, drag to pan, toolbar buttons)
- [ ] Canvas: artboard labels show screen name + variation title below each frame
- [ ] Canvas: auto-fits all artboards in viewport on initial load

---

## Relationship to Other Skills

| Skill | Relationship |
|-------|-------------|
| `/design-discovery` | Prerequisite: produces the IA and PRDs this skill reads. Sub-flow D of design-discovery generates an initial wireframe per screen — `/wireframe` is the standalone, iterative version for deeper exploration. |
| `/send-to-figma` | Downstream: after generating wireframes, run `/send-to-figma docs/wireframes` to capture all variation files as editable Figma layers. Each variation file = one Figma artboard. |
| `/new-screen` | Downstream: once a wireframe variation is approved, use `/new-screen` to scaffold the production screen based on it. |
| `/complex-component` | Downstream: if a wireframe reveals a complex UI pattern, use `/complex-component` to design and build it. |
| `/figma-cli` | Used for Figma output mode. Refer to its SKILL.md for render JSX syntax. |
