---
name: wireframe
description: >
  Rapidly explore layout patterns, navigation structures, and information
  architecture through low-fidelity, grayscale wireframes. Generates 3
  variations per screen as a clickable HTML prototype and/or Figma frames.
  Use after /design-discovery has produced an IA and PRD docs, before
  committing to a screen implementation.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# /wireframe — Rapid Wireframe Exploration

## Purpose

Wireframes are **design hypotheses, not implementations.** Each variation
answers a different question: Does search belong inline or in a dedicated
screen? Is this a bottom sheet or a core nav tab? Does a list or a card grid
serve this content better? The goal is to iterate cheaply and lock in
patterns *before* writing production code.

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
```

`$ARGUMENTS` contains the raw invocation string. Parse it before Phase 1.

---

## Phase 0: Parse Arguments

Extract from `$ARGUMENTS`:
- `screen_name` — PascalCase name, or empty if `--all`
- `mode` — `single` | `all` | `iterate`
- `format_flag` — `html` | `figma` | `both` | empty (ask)
- `variation_count` — number from `--variations=N`, default `3`

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

### 2a. Single screen (`/wireframe <Name>`)

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

1. Read `docs/wireframes/<kebab>.html` (the existing HTML wireframe).
2. Read associated screen spec `docs/design/screens/<kebab>.md` if present.
3. Skip to **Phase 4b: Iterate Loop**.

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

**Show the variation plan to the user and ask for a go-ahead before generating.**

Example output:
```
## Wireframe Plan: Note Editor

V1: "Focused Canvas"
  Layout:      Full-screen text area, minimal chrome
  Nav pattern: Toolbar at bottom (formatting), header for title + back
  Hypothesis:  Works if writing speed > feature discovery
  Tradeoff:    Hides formatting power; great for speed typists

V2: "Structured Editor"
  Layout:      Sticky title field, scrollable body, side rail for metadata
  Nav pattern: Top bar (save/share), collapsible formatting panel
  Hypothesis:  Works if users care about metadata (tags, date, linked notes)
  Tradeoff:    More chrome; harder on small screens

V3: "Card Canvas"
  Layout:      Block-based editor (note = stack of content cards)
  Nav pattern: Floating add-block button, swipe-to-reorder
  Hypothesis:  Works if notes are structured (todo + text + image blocks)
  Tradeoff:    Highest cognitive load; most powerful

Proceed with generation? (yes / adjust plan)
```

Wait for user confirmation before Phase 4.

---

## Phase 4a: Generate — HTML Prototype

### Setup

Check if `docs/wireframes/` exists. If not, create it and generate the shared stylesheet:

**`docs/wireframes/_wireframe.css`**

```css
/* ── Wireframe Design System ────────────────────────────────────── */
/* Mid-fi grayscale: clean shapes, real labels, no color            */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --wf-bg:          #F2F2F2;   /* page background */
  --wf-surface:     #FFFFFF;   /* cards, inputs, nav */
  --wf-surface-2:   #E8E8E8;   /* secondary surfaces, placeholder fills */
  --wf-border:      #D4D4D4;   /* all borders */
  --wf-border-strong: #AAAAAA; /* emphasized borders */
  --wf-text:        #1A1A1A;   /* primary text */
  --wf-text-muted:  #888888;   /* secondary / hint text */
  --wf-btn-bg:      #2A2A2A;   /* primary button */
  --wf-btn-text:    #FFFFFF;
  --r-sm:    6px;
  --r-md:    10px;
  --r-lg:    16px;
  --r-pill:  999px;
  --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

body {
  font-family: var(--font);
  background: var(--wf-bg);
  color: var(--wf-text);
  font-size: 14px;
  line-height: 1.5;
}

/* ── Phone Frame ────────────────────────────────────────────────── */
.wf-device {
  width: 375px;
  min-height: 812px;
  margin: 0 auto;
  background: var(--wf-surface);
  border-radius: 40px;
  border: 2px solid var(--wf-border-strong);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 40px rgba(0,0,0,0.12);
}
.wf-status-bar {
  height: 44px;
  background: var(--wf-surface);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}
.wf-status-icons { display: flex; gap: 6px; align-items: center; }
.wf-screen { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }

/* ── Navigation Chrome ──────────────────────────────────────────── */
.wf-nav-bar {
  height: 52px;
  background: var(--wf-surface);
  border-bottom: 1px solid var(--wf-border);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  flex-shrink: 0;
}
.wf-nav-bar-title {
  font-size: 17px;
  font-weight: 600;
  flex: 1;
}
.wf-nav-back {
  font-size: 13px;
  color: var(--wf-text-muted);
  cursor: pointer;
}
.wf-nav-action {
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.wf-tab-bar {
  height: 56px;
  background: var(--wf-surface);
  border-top: 1px solid var(--wf-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
  flex-shrink: 0;
}
.wf-tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: var(--wf-text-muted);
  min-width: 52px;
  cursor: pointer;
  padding: 4px;
  border-radius: var(--r-md);
}
.wf-tab-item.active { color: var(--wf-text); }
.wf-tab-item .tab-icon {
  width: 24px; height: 24px;
  background: var(--wf-surface-2);
  border-radius: 4px;
}
.wf-tab-item.active .tab-icon { background: var(--wf-text); }

/* ── Content Layout ─────────────────────────────────────────────── */
.wf-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.wf-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.wf-section-title { font-size: 15px; font-weight: 600; }
.wf-section-action { font-size: 12px; color: var(--wf-text-muted); }

/* ── Atoms ──────────────────────────────────────────────────────── */
.wf-placeholder {
  background: var(--wf-surface-2);
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--wf-text-muted);
  font-size: 12px;
}
.wf-placeholder::before {
  content: attr(data-label);
}
.wf-placeholder.img {
  background: var(--wf-surface-2);
  position: relative;
}
/* Diagonal hash lines for image placeholders */
.wf-placeholder.img::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 8px,
    rgba(0,0,0,0.06) 8px,
    rgba(0,0,0,0.06) 9px
  );
  border-radius: inherit;
}

.wf-input {
  height: 44px;
  background: var(--wf-surface-2);
  border: 1px solid var(--wf-border);
  border-radius: var(--r-md);
  padding: 0 12px;
  font-size: 14px;
  color: var(--wf-text-muted);
  display: flex;
  align-items: center;
}
.wf-input.search {
  padding-left: 36px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 256 256'%3E%3Cpath fill='%23888' d='M229.66 218.34l-50.07-50.06a88.11 88.11 0 1 0-11.31 11.31l50.06 50.07a8 8 0 0 0 11.32-11.32ZM40 112a72 72 0 1 1 72 72A72.08 72.08 0 0 1 40 112Z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 10px center;
}
.wf-textarea {
  background: var(--wf-surface-2);
  border: 1px solid var(--wf-border);
  border-radius: var(--r-md);
  padding: 12px;
  font-size: 14px;
  color: var(--wf-text-muted);
  min-height: 120px;
  resize: none;
  font-family: var(--font);
  width: 100%;
}

.wf-btn {
  height: 48px;
  background: var(--wf-btn-bg);
  color: var(--wf-btn-text);
  border: none;
  border-radius: var(--r-lg);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  font-family: var(--font);
}
.wf-btn.outline {
  background: transparent;
  color: var(--wf-text);
  border: 1.5px solid var(--wf-border-strong);
}
.wf-btn.sm { height: 36px; font-size: 13px; border-radius: var(--r-md); width: auto; padding: 0 16px; }
.wf-btn.pill { border-radius: var(--r-pill); }

.wf-card {
  background: var(--wf-surface);
  border: 1px solid var(--wf-border);
  border-radius: var(--r-lg);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wf-card.row { flex-direction: row; align-items: center; }
.wf-card-title { font-size: 14px; font-weight: 600; }
.wf-card-subtitle { font-size: 12px; color: var(--wf-text-muted); }

.wf-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--wf-border);
}
.wf-list-item:last-child { border-bottom: none; }
.wf-avatar {
  width: 40px; height: 40px;
  background: var(--wf-surface-2);
  border-radius: 50%;
  flex-shrink: 0;
}
.wf-avatar.sm { width: 28px; height: 28px; }
.wf-avatar.lg { width: 56px; height: 56px; }

.wf-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--r-pill);
  font-size: 11px;
  font-weight: 500;
  background: var(--wf-surface-2);
  color: var(--wf-text-muted);
  border: 1px solid var(--wf-border);
}
.wf-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: var(--r-pill);
  font-size: 12px;
  background: var(--wf-surface-2);
  border: 1px solid var(--wf-border);
  cursor: pointer;
  white-space: nowrap;
}
.wf-chip.active {
  background: var(--wf-text);
  color: var(--wf-surface);
  border-color: var(--wf-text);
}

.wf-divider { height: 1px; background: var(--wf-border); margin: 4px 0; }
.wf-spacer { flex: 1; }

.wf-fab {
  position: absolute;
  bottom: 76px; right: 16px;
  width: 52px; height: 52px;
  background: var(--wf-btn-bg);
  color: var(--wf-btn-text);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}

.wf-bottom-sheet {
  background: var(--wf-surface);
  border-radius: var(--r-lg) var(--r-lg) 0 0;
  padding: 20px 16px;
  border-top: 1px solid var(--wf-border);
}
.wf-sheet-handle {
  width: 36px; height: 4px;
  background: var(--wf-border-strong);
  border-radius: var(--r-pill);
  margin: 0 auto 16px;
}

/* ── Chip scroll row ─────────────────────────────────────────────── */
.wf-chip-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;
}
.wf-chip-row::-webkit-scrollbar { display: none; }

/* ── Annotation (variation label) ───────────────────────────────── */
.wf-annotation {
  font-size: 11px;
  color: var(--wf-text-muted);
  border-left: 2px solid var(--wf-border-strong);
  padding-left: 8px;
  margin-top: 4px;
  font-style: italic;
}

/* ── Variation Tab Strip (top of page, outside device frame) ─────── */
.wf-variation-strip {
  display: flex;
  gap: 4px;
  padding: 16px 16px 0;
  justify-content: center;
}
.wf-variation-tab {
  padding: 6px 18px;
  border-radius: var(--r-pill);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1.5px solid var(--wf-border-strong);
  background: transparent;
  color: var(--wf-text-muted);
  font-family: var(--font);
  transition: all 0.15s;
}
.wf-variation-tab.active {
  background: var(--wf-text);
  color: var(--wf-surface);
  border-color: var(--wf-text);
}
.wf-variation-panel { display: none; }
.wf-variation-panel.active { display: flex; justify-content: center; padding: 24px 16px; }

/* ── Index grid ─────────────────────────────────────────────────── */
.wf-index-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  padding: 24px;
}
.wf-index-card {
  background: var(--wf-surface);
  border: 1px solid var(--wf-border);
  border-radius: var(--r-lg);
  overflow: hidden;
  cursor: pointer;
  text-decoration: none;
  color: var(--wf-text);
}
.wf-index-thumb {
  height: 160px;
  background: var(--wf-surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--wf-text-muted);
}
.wf-index-label {
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  border-top: 1px solid var(--wf-border);
}
.wf-index-sub {
  padding: 0 12px 10px;
  font-size: 11px;
  color: var(--wf-text-muted);
}
```

---

### Generating Each Screen's HTML File

Create `docs/wireframes/<kebab>.html` using this template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><HumanTitle> — Wireframes</title>
  <link rel="stylesheet" href="_wireframe.css" />
  <!-- Phosphor Icons -->
  <script src="https://unpkg.com/@phosphor-icons/web"></script>
</head>
<body style="background: var(--wf-bg); padding: 24px 0; min-height: 100vh;">

  <!-- Page header -->
  <div style="text-align:center; margin-bottom:8px;">
    <a href="index.html" style="font-size:12px; color:var(--wf-text-muted); text-decoration:none;">← All screens</a>
  </div>
  <h1 style="text-align:center; font-size:18px; font-weight:700; margin-bottom:4px;"><HumanTitle></h1>
  <p style="text-align:center; font-size:12px; color:var(--wf-text-muted); margin-bottom:16px;">
    <HumanTitle> · 3 variations
  </p>

  <!-- Variation selector -->
  <div class="wf-variation-strip">
    <button class="wf-variation-tab active" onclick="showVariation('v1', this)">V1: <V1 Short Title></button>
    <button class="wf-variation-tab"        onclick="showVariation('v2', this)">V2: <V2 Short Title></button>
    <button class="wf-variation-tab"        onclick="showVariation('v3', this)">V3: <V3 Short Title></button>
  </div>

  <!-- Hypothesis strip -->
  <div id="hypothesis" style="text-align:center; padding:8px 24px; font-size:12px; color:var(--wf-text-muted); min-height:36px;"></div>

  <!-- ── V1 ── -->
  <div class="wf-variation-panel active" id="panel-v1">
    <div class="wf-device">
      <div class="wf-status-bar">
        <span>9:41</span>
        <div class="wf-status-icons">
          <i class="ph ph-wifi-high"></i>
          <i class="ph ph-battery-full"></i>
        </div>
      </div>
      <!-- V1 SCREEN CONTENT -->
      <div class="wf-screen">
        <!-- ... generated per screen ... -->
      </div>
    </div>
  </div>

  <!-- ── V2 ── -->
  <div class="wf-variation-panel" id="panel-v2">
    <div class="wf-device">
      <!-- V2 SCREEN CONTENT -->
    </div>
  </div>

  <!-- ── V3 ── -->
  <div class="wf-variation-panel" id="panel-v3">
    <div class="wf-device">
      <!-- V3 SCREEN CONTENT -->
    </div>
  </div>

  <script>
    const hypotheses = {
      v1: '<V1 hypothesis text>',
      v2: '<V2 hypothesis text>',
      v3: '<V3 hypothesis text>',
    };
    function showVariation(id, btn) {
      document.querySelectorAll('.wf-variation-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.wf-variation-tab').forEach(b => b.classList.remove('active'));
      document.getElementById('panel-' + id).classList.add('active');
      btn.classList.add('active');
      document.getElementById('hypothesis').textContent = '💡 ' + hypotheses[id];
    }
    document.getElementById('hypothesis').textContent = '💡 ' + hypotheses.v1;
  </script>
</body>
</html>
```

**Rules for generating screen content:**
- Use only classes from `_wireframe.css` — no inline colors or font-sizes
- Images/media → `<div class="wf-placeholder img" style="height:Npx" data-label="Photo">` with specific height
- All text is real text (not lorem ipsum) — use plausible labels from the PRD
- Use `<i class="ph ph-<name>"></i>` for icons (Phosphor icons)
- Links between screens: `<a href="<other-kebab>.html">` on tappable elements
- Mark bottom tab active state with `class="wf-tab-item active"` for the current screen's tab
- Every variation must include navigation chrome appropriate to its nav pattern

---

### Generating the Index Page

Create/update `docs/wireframes/index.html` after each generation run:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Wireframes</title>
  <link rel="stylesheet" href="_wireframe.css" />
</head>
<body style="background:var(--wf-bg); min-height:100vh;">
  <div style="padding:32px 24px 16px; text-align:center;">
    <h1 style="font-size:24px; font-weight:700; margin-bottom:4px;">Wireframes</h1>
    <p style="font-size:13px; color:var(--wf-text-muted);">Click any screen to explore variations</p>
  </div>
  <div class="wf-index-grid">
    <!-- one .wf-index-card per screen -->
    <a href="<kebab>.html" class="wf-index-card">
      <div class="wf-index-thumb"><HumanTitle></div>
      <div class="wf-index-label"><HumanTitle></div>
      <div class="wf-index-sub">3 variations</div>
    </a>
  </div>
</body>
</html>
```

---

## Phase 4b: Generate — Figma CLI

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
     w={375} h={812}
     bg="#F2F2F2"
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
   - `#F2F2F2` — page background
   - `#FFFFFF` — surfaces
   - `#E8E8E8` — secondary fills / placeholders
   - `#D4D4D4` — borders
   - `#1A1A1A` — primary text
   - `#888888` — muted text
   - `#2A2A2A` — primary button

See `figma-cli/CLAUDE.md` for full JSX render syntax.

---

## Phase 5: Decision Prompt

After generating all files, show:

```
## Wireframes ready: <HumanTitle>

Files: docs/wireframes/<kebab>.html

### Open in browser:
open docs/wireframes/<kebab>.html

---
### Variation summary:

| | V1: <Title> | V2: <Title> | V3: <Title> |
|--|--|--|--|
| Nav pattern | bottom tabs | top tabs | floating |
| Content style | list | cards | feed |
| Primary action | FAB | header | inline |

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

1. Read existing `docs/wireframes/<kebab>.html`.

2. Ask:
   > "What do you want to change? Describe in plain English, e.g.:
   > - 'V2's nav feels better — try building all variations from it'
   > - 'Try a bottom sheet for the detail view instead of a pushed screen'
   > - 'V3 is too complex — simplify the card layout'
   > - 'Add a search screen variation'"

3. Parse the feedback and determine:
   - Which variation(s) to modify
   - Whether to add a new variation (append as V4/V5 if `variation_count` allows)
   - Whether to synthesize a new variation that merges picks from multiple

4. Update only the affected `<div id="panel-v*">` sections in the HTML file.
   Add a new tab button to `wf-variation-strip` if adding a variation.
   Update `hypotheses` object in the `<script>` block.

5. Show the decision prompt again.

---

## Wireframe Vocabulary Reference

Use these conventions consistently across all generated wireframes:

| Element | Class / Pattern |
|---------|----------------|
| Full-screen background | `<body>` with `wf-bg` |
| Phone artboard | `.wf-device` |
| Top navigation | `.wf-nav-bar` with `.wf-nav-bar-title` |
| Bottom tab bar | `.wf-tab-bar` > `.wf-tab-item` |
| Scrollable body | `.wf-screen` > `.wf-content` |
| Section with "See all" | `.wf-section-header` |
| Image placeholder | `.wf-placeholder.img` |
| Avatar / profile pic | `.wf-avatar` (sm / md / lg) |
| Text input | `.wf-input` |
| Search input | `.wf-input.search` |
| Text area | `.wf-textarea` |
| Primary button | `.wf-btn` |
| Ghost/outline button | `.wf-btn.outline` |
| Small inline button | `.wf-btn.sm` |
| Floating action button | `.wf-fab` |
| Card (vertical) | `.wf-card` |
| Card (horizontal row) | `.wf-card.row` |
| List item with avatar | `.wf-list-item` > `.wf-avatar` |
| Filter chip | `.wf-chip` / `.wf-chip.active` |
| Bottom sheet | `.wf-bottom-sheet` > `.wf-sheet-handle` |
| Tag / status badge | `.wf-badge` |
| Horizontal chip scroll | `.wf-chip-row` |
| Inline annotation | `.wf-annotation` |

---

## Output Checklist

Before marking generation complete, verify:
- [ ] `_wireframe.css` exists in `docs/wireframes/`
- [ ] `index.html` updated with a card for each new screen
- [ ] Each screen file has all `variation_count` panels with real content
- [ ] Tab strip JS switches panels correctly (verify `panel-v1`/`v2`/`v3` IDs match)
- [ ] At least one navigation link between screens exists
- [ ] Hypotheses populated in the `hypotheses` JS object
- [ ] No hardcoded hex colors (use only CSS vars from `_wireframe.css`)
- [ ] All images are `.wf-placeholder.img` — no `<img>` tags with real src

---

## Relationship to Other Skills

| Skill | Relationship |
|-------|-------------|
| `/design-discovery` | Prerequisite: produces the IA and PRDs this skill reads. Sub-flow D of design-discovery generates an initial wireframe per screen — `/wireframe` is the standalone, iterative version for deeper exploration. |
| `/new-screen` | Downstream: once a wireframe variation is approved, use `/new-screen` to scaffold the production screen based on it. |
| `/complex-component` | Downstream: if a wireframe reveals a complex UI pattern, use `/complex-component` to design and build it. |
| `/figma-cli` | Used for Figma output mode. Refer to its SKILL.md for render JSX syntax. |
