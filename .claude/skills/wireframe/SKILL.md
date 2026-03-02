---
name: wireframe
description: >
  Rapidly explore layout patterns, navigation structures, and information
  architecture through component-matched wireframes. Generates 3 variations
  per screen as separate standalone HTML files — one per variation. Each file
  shows a phone artboard (393x852) with optional iPad (1024x1366) and desktop
  (1440x900) frames. Component primitives mirror the production design system.
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

Check if `docs/wireframes/` exists. If not, create it and generate the shared stylesheet:

**`docs/wireframes/_wireframe.css`**

```css
/* ═══════════════════════════════════════════════════════════════════
   Wireframe Design System v2
   Component-matched grayscale: mirrors production token architecture
   Same spacing, radius, typography — neutral palette for layout focus
   ═══════════════════════════════════════════════════════════════════ */

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

/* ─── TOKEN VARIABLES ──────────────────────────────────────────── */
:root {
  /* Fonts — system stack matching production Geist/SF Pro */
  --font-display: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
  --font-body:    -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;

  /* Font weights (matching production) */
  --weight-regular:  400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     700;

  /* Font sizes — iOS point scale matching production typography tokens */
  --text-badge:    8px;
  --text-overline: 10px;
  --text-caption:  10px;
  --text-xs:       11px;
  --text-sm:       12px;
  --text-body-sm:  12px;
  --text-body-md:  14px;
  --text-base:     15px;
  --text-body-lg:  16px;
  --text-cta-sm:   12px;
  --text-cta-md:   14px;
  --text-cta-lg:   16px;
  --text-md:       17px;
  --text-title-sm: 20px;
  --text-title-md: 24px;
  --text-title-lg: 28px;
  --text-heading:  34px;

  /* Line heights */
  --leading-tight:   1.2;
  --leading-snug:    1.3;
  --leading-normal:  1.5;
  --leading-relaxed: 1.65;

  /* Letter spacing */
  --tracking-tight:  -0.02em;
  --tracking-normal:  0;
  --tracking-wide:    0.03em;
  --tracking-wider:   0.06em;
  --tracking-widest:  0.12em;

  /* Spacing — 4px grid matching production space-1 through space-24 */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* Border radius — matching production radius-xs through radius-full */
  --radius-none: 0px;
  --radius-xs:   4px;
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   22px;
  --radius-2xl:  28px;
  --radius-full: 9999px;

  /* ── Surfaces (matching production semantic token names) ────── */
  --surfaces-base-primary:       #F5F5F5;
  --surfaces-base-low-contrast:  #EBEBEB;
  --surfaces-base-high-contrast: #DEDEDE;
  --surface-elevated:            #FFFFFF;
  --surfaces-inverse-primary:    #1A1A1A;
  --surfaces-brand-interactive:  #1A1A1A;
  --surfaces-brand-interactive-low-contrast: #EBEBEB;
  --surfaces-accent-primary:     #6366F1;
  --surfaces-accent-low-contrast:#EEF2FF;
  --surfaces-success-solid:      #22C55E;
  --surfaces-success-subtle:     #DCFCE7;
  --surfaces-warning-solid:      #EAB308;
  --surfaces-warning-subtle:     #FEF9C3;
  --surfaces-error-solid:        #EF4444;
  --surfaces-error-subtle:       #FEE2E2;
  --surface-overlay:             rgba(0, 0, 0, 0.4);
  --surface-tabbar:              rgba(255, 255, 255, 0.92);
  --surface-navbar:              rgba(255, 255, 255, 0.96);
  --surface-input:               #EBEBEB;

  /* ── Typography (matching production semantic token names) ──── */
  --typography-primary:         #171717;
  --typography-secondary:       #525252;
  --typography-muted:           #A3A3A3;
  --typography-placeholder:     #C4C4C4;
  --typography-brand:           #1A1A1A;
  --typography-on-brand-primary:#FFFFFF;
  --typography-accent:          #4F46E5;
  --typography-success:         #16A34A;
  --typography-warning:         #CA8A04;
  --typography-error:           #DC2626;

  /* ── Icons (matching production semantic token names) ────────── */
  --icons-primary:          #171717;
  --icons-secondary:        #737373;
  --icons-muted:            #B3B3B3;
  --icons-brand:            #1A1A1A;
  --icons-on-brand-primary: #FFFFFF;
  --icons-accent:           #4F46E5;

  /* ── Borders (matching production semantic token names) ──────── */
  --border-default:  #E5E5E5;
  --border-muted:    #F0F0F0;
  --border-active:   #171717;
  --border-brand:    #1A1A1A;
  --border-strong:   #ABABAB;

  /* ── Shadows (warm neutral) ─────────────────────────────────── */
  --shadow-xs:  0 1px 2px rgba(0,0,0,0.05);
  --shadow-sm:  0 2px 6px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:  0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg:  0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.05);
  --shadow-xl:  0 16px 40px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06);
  --shadow-brand: 0 4px 16px rgba(0,0,0,0.20);

  /* ── Transitions ────────────────────────────────────────────── */
  --ease-out:    cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in:     cubic-bezier(0.64, 0, 0.78, 0);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast:   150ms;
  --duration-normal: 250ms;
  --duration-slow:   380ms;
}

body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-regular);
  color: var(--typography-primary);
  background: #1A1A1A;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

/* ─── VIEWER ENVIRONMENT ────────────────────────────────────────── */
.wf-viewer {
  background: #1A1A1A;
  background-image:
    radial-gradient(ellipse 60% 40% at 20% 30%, rgba(99,102,241,0.04) 0%, transparent 60%),
    radial-gradient(ellipse 50% 60% at 80% 70%, rgba(0,0,0,0.06) 0%, transparent 60%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 60px;
}

/* ─── PROTOTYPE NAVIGATION BAR ──────────────────────────────────── */
.wf-prototype-nav {
  width: 100%;
  background: rgba(20, 20, 20, 0.96);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
}
.wf-prototype-nav-label {
  font-size: 10px;
  font-weight: var(--weight-semibold);
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-right: 4px;
  white-space: nowrap;
}
.wf-prototype-nav a {
  font-size: 11px;
  font-weight: var(--weight-medium);
  color: rgba(255,255,255,0.45);
  text-decoration: none;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(255,255,255,0.08);
  transition: all var(--duration-fast) var(--ease-out);
  white-space: nowrap;
}
.wf-prototype-nav a:hover,
.wf-prototype-nav a.active {
  background: var(--surfaces-brand-interactive);
  color: var(--typography-on-brand-primary);
  border-color: var(--surfaces-brand-interactive);
}

/* ─── DEVICE FRAMES ─────────────────────────────────────────────── */
.wf-stage {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 32px 20px 0;
  flex-wrap: wrap;
}

/* iPhone (393 x 852) */
.wf-phone {
  width: 393px;
  height: 852px;
  background: var(--surfaces-base-primary);
  border-radius: 54px;
  overflow: hidden;
  position: relative;
  box-shadow:
    0 0 0 1.5px rgba(255,255,255,0.10),
    0 0 0 8px rgba(0,0,0,0.6),
    0 0 0 9.5px rgba(255,255,255,0.06),
    0 30px 80px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

/* iPad (1024 x 1366 scaled to 60% for display) */
.wf-tablet {
  width: 614px;   /* 1024 * 0.6 */
  height: 820px;  /* 1366 * 0.6 */
  background: var(--surfaces-base-primary);
  border-radius: 28px;
  overflow: hidden;
  position: relative;
  box-shadow:
    0 0 0 1.5px rgba(255,255,255,0.10),
    0 0 0 6px rgba(0,0,0,0.5),
    0 20px 60px rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

/* Desktop browser (1440 x 900 scaled to 60%) */
.wf-desktop {
  width: 864px;   /* 1440 * 0.6 */
  height: 540px;  /* 900 * 0.6 */
  background: var(--surfaces-base-primary);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.08),
    0 20px 60px rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

/* Desktop browser chrome bar */
.wf-browser-bar {
  height: 36px;
  background: #2A2A2A;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
  flex-shrink: 0;
}
.wf-browser-dots {
  display: flex;
  gap: 6px;
}
.wf-browser-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
}
.wf-browser-url {
  flex: 1;
  height: 22px;
  background: rgba(255,255,255,0.06);
  border-radius: var(--radius-sm);
  margin: 0 40px;
}

/* Device label (shown under each frame) */
.wf-device-label {
  text-align: center;
  font-size: var(--text-xs);
  color: rgba(255,255,255,0.35);
  margin-top: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-wide);
}

/* ─── STATUS BAR (iPhone) ───────────────────────────────────────── */
.wf-status-bar {
  height: 59px;
  padding: 16px 24px 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
  background: transparent;
  flex-shrink: 0;
  z-index: 10;
}
.wf-status-time {
  font-size: 15px;
  font-weight: var(--weight-semibold);
  color: var(--typography-primary);
  letter-spacing: var(--tracking-tight);
}
.wf-status-icons {
  display: flex;
  align-items: center;
  gap: 5px;
  padding-top: 1px;
}
.wf-status-icons svg { color: var(--typography-primary); }

/* ─── DYNAMIC ISLAND ────────────────────────────────────────────── */
.wf-dynamic-island {
  position: absolute;
  top: 13px;
  left: 50%;
  transform: translateX(-50%);
  width: 126px;
  height: 37px;
  background: #0A0A0A;
  border-radius: var(--radius-full);
  z-index: 20;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.5);
}

/* ─── SCREEN WRAPPER ────────────────────────────────────────────── */
.wf-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* ─── NAVIGATION BAR ────────────────────────────────────────────── */
.wf-nav-bar {
  background: var(--surface-navbar);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-muted);
  padding: 0 20px 12px;
  flex-shrink: 0;
  position: relative;
  z-index: 5;
}
.wf-nav-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding-top: 4px;
}
.wf-nav-large-title {
  font-family: var(--font-display);
  font-size: var(--text-heading);
  font-weight: var(--weight-bold);
  color: var(--typography-primary);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  margin-top: 4px;
  padding-bottom: 2px;
}
.wf-nav-title {
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  color: var(--typography-primary);
  letter-spacing: -0.01em;
}
.wf-nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--typography-secondary);
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  padding: 6px 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: var(--radius-sm);
}
.wf-nav-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--icons-secondary);
  transition: background var(--duration-fast);
}
.wf-nav-icon-btn:hover {
  background: var(--surfaces-base-low-contrast);
}

/* ─── TAB BAR (83px matching production) ────────────────────────── */
.wf-tab-bar {
  height: 83px;
  background: var(--surface-tabbar);
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  border-top: 1px solid var(--border-muted);
  display: flex;
  align-items: flex-start;
  padding: 10px 0 0;
  flex-shrink: 0;
  position: relative;
  z-index: 5;
}
.wf-tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  text-decoration: none;
  padding: 2px 0;
  transition: all var(--duration-fast) var(--ease-out);
  color: var(--icons-muted);
}
.wf-tab-icon-wrap {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-out);
}
.wf-tab-item.active .wf-tab-icon-wrap {
  background: var(--surfaces-base-low-contrast);
}
.wf-tab-item.active {
  color: var(--icons-primary);
}
.wf-tab-label {
  font-size: 10px;
  font-weight: var(--weight-medium);
  color: var(--typography-muted);
  letter-spacing: 0.01em;
}
.wf-tab-item.active .wf-tab-label {
  color: var(--typography-primary);
  font-weight: var(--weight-semibold);
}

/* ─── SCREEN CONTENT ────────────────────────────────────────────── */
.wf-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--surfaces-base-primary);
  scrollbar-width: none;
}
.wf-content::-webkit-scrollbar { display: none; }

/* Standard content padding */
.wf-padded {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* ─── SEARCH BAR (matching production SearchBar component) ──────── */
.wf-search-wrap {
  padding: var(--space-2) var(--space-4) var(--space-3);
}
.wf-search-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--surface-input);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-muted);
}
.wf-search-bar input {
  flex: 1;
  border: none;
  background: none;
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--typography-primary);
  outline: none;
}
.wf-search-bar input::placeholder { color: var(--typography-placeholder); }
.wf-search-bar svg { color: var(--icons-secondary); flex-shrink: 0; }

/* ─── CHIP ROW (matching production Chip component) ─────────────── */
.wf-chip-row {
  display: flex;
  gap: var(--space-2);
  padding: 0 var(--space-4) var(--space-3);
  overflow-x: auto;
  scrollbar-width: none;
}
.wf-chip-row::-webkit-scrollbar { display: none; }

.wf-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  border: 1px solid var(--border-default);
  background: var(--surface-elevated);
  color: var(--typography-secondary);
}
.wf-chip.active {
  background: var(--surfaces-brand-interactive);
  border-color: var(--surfaces-brand-interactive);
  color: var(--typography-on-brand-primary);
  box-shadow: var(--shadow-brand);
}
.wf-chip:hover:not(.active) {
  background: var(--surfaces-base-low-contrast);
}

/* ─── SECTION HEADER ────────────────────────────────────────────── */
.wf-section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: var(--space-4) var(--space-4) var(--space-2);
}
.wf-section-title {
  font-size: var(--text-title-sm);
  font-weight: var(--weight-semibold);
  color: var(--typography-primary);
  letter-spacing: var(--tracking-tight);
}
.wf-section-action {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--typography-secondary);
  text-decoration: none;
  cursor: pointer;
}
.wf-section-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--typography-muted);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  padding: var(--space-4) var(--space-4) var(--space-2);
}

/* ─── CARD (matching production Card component) ─────────────────── */
.wf-card {
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  margin: 0 var(--space-4) 10px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-muted);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.wf-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
.wf-card.row {
  flex-direction: row;
  align-items: center;
  gap: var(--space-3);
}
.wf-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 5px;
}
.wf-card-title {
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  color: var(--typography-primary);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-snug);
  flex: 1;
  margin-right: var(--space-2);
}
.wf-card-subtitle {
  font-size: var(--text-sm);
  color: var(--typography-secondary);
  line-height: var(--leading-normal);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.wf-card-meta {
  font-size: var(--text-xs);
  color: var(--typography-muted);
  letter-spacing: var(--tracking-wide);
}
.wf-card-footer {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ─── LIST ROWS (matching production ListItem component) ─────────── */
.wf-list-section {
  margin: 0 var(--space-4) var(--space-5);
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-muted);
  overflow: hidden;
  box-shadow: var(--shadow-xs);
}
.wf-list-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 13px var(--space-4);
  border-bottom: 1px solid var(--border-muted);
  cursor: pointer;
  transition: background var(--duration-fast);
}
.wf-list-item:last-child { border-bottom: none; }
.wf-list-item:hover { background: var(--surfaces-base-low-contrast); }

.wf-list-icon {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--surfaces-base-low-contrast);
  color: var(--icons-secondary);
}
.wf-list-label {
  flex: 1;
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--typography-primary);
}
.wf-list-sublabel {
  font-size: var(--text-sm);
  color: var(--typography-muted);
  margin-top: 1px;
}
.wf-list-value {
  font-size: var(--text-base);
  color: var(--typography-muted);
}
.wf-list-chevron {
  color: var(--icons-muted);
  flex-shrink: 0;
}

/* ─── BUTTON (matching production Button — pill shape) ──────────── */
.wf-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: var(--radius-full);
  font-family: var(--font-body);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  border: none;
  transition: all var(--duration-fast) var(--ease-out);
  letter-spacing: -0.01em;
}
/* Size: sm */
.wf-btn.sm {
  height: 32px;
  padding: 0 12px;
  font-size: var(--text-cta-sm);
}
/* Size: md (default) */
.wf-btn.md, .wf-btn:not(.sm):not(.lg) {
  height: 40px;
  padding: 0 var(--space-4);
  font-size: var(--text-cta-md);
}
/* Size: lg */
.wf-btn.lg {
  height: 48px;
  padding: 0 var(--space-5);
  font-size: var(--text-cta-lg);
}
/* Variant: primary */
.wf-btn.primary {
  background: var(--surfaces-brand-interactive);
  color: var(--typography-on-brand-primary);
  box-shadow: var(--shadow-brand);
}
.wf-btn.primary:hover { opacity: 0.9; }
/* Variant: secondary */
.wf-btn.secondary {
  background: var(--surfaces-base-low-contrast);
  color: var(--typography-primary);
}
.wf-btn.secondary:hover { background: var(--surfaces-base-high-contrast); }
/* Variant: tertiary */
.wf-btn.tertiary {
  background: transparent;
  color: var(--typography-primary);
  border: 1.5px solid var(--border-brand);
}
/* Variant: ghost */
.wf-btn.ghost {
  background: transparent;
  color: var(--typography-secondary);
}
/* Full width */
.wf-btn.full { width: 100%; }
/* Disabled */
.wf-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ─── INPUT FIELD (matching production InputField) ──────────────── */
.wf-input {
  height: 44px;
  background: var(--surface-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 0 var(--space-3);
  font-size: var(--text-body-md);
  color: var(--typography-placeholder);
  display: flex;
  align-items: center;
  width: 100%;
}
.wf-input-label {
  font-size: var(--text-body-sm);
  font-weight: var(--weight-medium);
  color: var(--typography-secondary);
  margin-bottom: var(--space-1);
}
.wf-input-hint {
  font-size: var(--text-caption);
  color: var(--typography-muted);
  margin-top: var(--space-1);
}
.wf-input.search {
  padding-left: 36px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 256 256'%3E%3Cpath fill='%23A3A3A3' d='M229.66 218.34l-50.07-50.06a88.11 88.11 0 1 0-11.31 11.31l50.06 50.07a8 8 0 0 0 11.32-11.32ZM40 112a72 72 0 1 1 72 72A72.08 72.08 0 0 1 40 112Z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 10px center;
}
.wf-textarea {
  background: var(--surface-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  font-size: var(--text-body-md);
  color: var(--typography-placeholder);
  min-height: 120px;
  resize: none;
  font-family: var(--font-body);
  width: 100%;
}

/* ─── AVATAR ────────────────────────────────────────────────────── */
.wf-avatar {
  width: 40px;
  height: 40px;
  background: var(--surfaces-base-high-contrast);
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--icons-muted);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
}
.wf-avatar.sm { width: 28px; height: 28px; font-size: var(--text-xs); }
.wf-avatar.lg { width: 56px; height: 56px; font-size: var(--text-base); }

/* ─── BADGE (matching production Badge component) ───────────────── */
.wf-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: var(--radius-full);
  background: var(--surfaces-brand-interactive);
  color: var(--typography-on-brand-primary);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
}

/* ─── TAG PILL (matching production Label component) ────────────── */
.wf-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  background: var(--surfaces-brand-interactive-low-contrast);
  color: var(--typography-secondary);
  letter-spacing: var(--tracking-wide);
}

/* ─── FAB (matching production — bottom-right, 56px) ────────────── */
.wf-fab {
  position: absolute;
  bottom: 96px;
  right: var(--space-4);
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--surfaces-brand-interactive);
  color: var(--typography-on-brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-brand);
  border: none;
  transition: all var(--duration-normal) var(--ease-spring);
  z-index: 10;
}
.wf-fab:hover { transform: scale(1.05); }

/* ─── BOTTOM SHEET ──────────────────────────────────────────────── */
.wf-bottom-sheet {
  background: var(--surface-elevated);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  border-top: 1px solid var(--border-muted);
  padding: 0 var(--space-4) var(--space-6);
  box-shadow: 0 -8px 32px rgba(0,0,0,0.10);
}
.wf-sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--border-strong);
  margin: var(--space-2) auto var(--space-4);
}

/* ─── TOGGLE SWITCH (matching production Switch) ────────────────── */
.wf-toggle {
  width: 51px;
  height: 31px;
  border-radius: var(--radius-full);
  background: var(--surfaces-base-high-contrast);
  position: relative;
  cursor: pointer;
  transition: background var(--duration-normal) var(--ease-out);
  flex-shrink: 0;
}
.wf-toggle.on { background: var(--surfaces-brand-interactive); }
.wf-toggle::after {
  content: '';
  position: absolute;
  width: 27px;
  height: 27px;
  border-radius: var(--radius-full);
  background: white;
  top: 2px;
  left: 2px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  transition: transform var(--duration-normal) var(--ease-out);
}
.wf-toggle.on::after { transform: translateX(20px); }

/* ─── RADIO BUTTON (matching production RadioButton) ────────────── */
.wf-radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--border-default);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wf-radio.checked {
  border-color: var(--surfaces-brand-interactive);
}
.wf-radio.checked::after {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--surfaces-brand-interactive);
}

/* ─── CHECKBOX (matching production Checkbox) ───────────────────── */
.wf-checkbox {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-xs);
  border: 2px solid var(--border-default);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wf-checkbox.checked {
  background: var(--surfaces-brand-interactive);
  border-color: var(--surfaces-brand-interactive);
  color: var(--typography-on-brand-primary);
}

/* ─── DIVIDER ───────────────────────────────────────────────────── */
.wf-divider {
  height: 1px;
  background: var(--border-muted);
  margin: 0 var(--space-4);
}
.wf-divider.full { margin: 0; }

/* ─── EMPTY STATE (matching production EmptyState pattern) ──────── */
.wf-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-16) var(--space-8);
  text-align: center;
}
.wf-empty-icon {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-2xl);
  background: var(--surfaces-base-low-contrast);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--icons-muted);
  margin-bottom: var(--space-1);
}
.wf-empty-title {
  font-size: var(--text-title-sm);
  font-weight: var(--weight-semibold);
  color: var(--typography-primary);
}
.wf-empty-body {
  font-size: var(--text-base);
  color: var(--typography-muted);
  line-height: var(--leading-relaxed);
  max-width: 240px;
}

/* ─── PLACEHOLDER (for images/media) ────────────────────────────── */
.wf-placeholder {
  background: var(--surfaces-base-low-contrast);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--typography-muted);
  font-size: var(--text-sm);
}
.wf-placeholder::before { content: attr(data-label); }
.wf-placeholder.img {
  position: relative;
}
.wf-placeholder.img::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    -45deg, transparent, transparent 8px,
    rgba(0,0,0,0.04) 8px, rgba(0,0,0,0.04) 9px
  );
  border-radius: inherit;
}

/* ─── IMAGE THUMB (for card thumbnails) ─────────────────────────── */
.wf-thumb {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-sm);
  background: var(--surfaces-base-high-contrast);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--icons-muted);
}

/* ─── ORNAMENTAL DIVIDER ────────────────────────────────────────── */
.wf-ornament {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-4);
  color: var(--typography-muted);
  opacity: 0.5;
}
.wf-ornament::before,
.wf-ornament::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-default);
}
.wf-ornament-text {
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  white-space: nowrap;
}

/* ─── DESKTOP: SIDEBAR (AdaptiveNavShell) ───────────────────────── */
.wf-sidebar {
  width: 240px;
  background: var(--surface-elevated);
  border-right: 1px solid var(--border-muted);
  display: flex;
  flex-direction: column;
  padding: var(--space-4) 0;
  flex-shrink: 0;
}
.wf-sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-body-md);
  font-weight: var(--weight-medium);
  color: var(--typography-secondary);
  cursor: pointer;
  transition: background var(--duration-fast);
}
.wf-sidebar-item.active {
  background: var(--surfaces-base-low-contrast);
  color: var(--typography-primary);
  font-weight: var(--weight-semibold);
}
.wf-sidebar-item:hover:not(.active) {
  background: var(--surfaces-base-low-contrast);
}

/* ─── DESKTOP/TABLET: SPLIT VIEW (AdaptiveSplitView) ────────────── */
.wf-split-view {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.wf-split-list {
  width: 320px;
  border-right: 1px solid var(--border-muted);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
}
.wf-split-detail {
  flex: 1;
  overflow-y: auto;
}

/* ─── ANNOTATION (variation label) ──────────────────────────────── */
.wf-annotation {
  font-size: var(--text-xs);
  color: var(--typography-muted);
  border-left: 2px solid var(--border-strong);
  padding-left: var(--space-2);
  margin-top: var(--space-1);
  font-style: italic;
}

/* ─── VARIATION NAVIGATION ──────────────────────────────────────── */
.wf-variation-strip {
  display: flex;
  gap: 4px;
  padding: var(--space-4) var(--space-4) 0;
  justify-content: center;
}
.wf-variation-tab {
  padding: 6px 18px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: var(--weight-medium);
  cursor: pointer;
  border: 1.5px solid rgba(255,255,255,0.15);
  background: transparent;
  color: rgba(255,255,255,0.45);
  font-family: var(--font-body);
  transition: all var(--duration-fast);
  text-decoration: none;
}
.wf-variation-tab.active {
  background: white;
  color: #1A1A1A;
  border-color: white;
}

/* ─── INDEX GRID ────────────────────────────────────────────────── */
.wf-index-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: var(--space-6);
}
.wf-index-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  text-decoration: none;
  color: rgba(255,255,255,0.85);
  transition: transform var(--duration-normal) var(--ease-out),
              box-shadow var(--duration-normal) var(--ease-out);
}
.wf-index-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 48px rgba(0,0,0,0.3);
}
.wf-index-thumb {
  height: 140px;
  background: rgba(255,255,255,0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  color: rgba(255,255,255,0.3);
}
.wf-index-label {
  padding: 12px 14px 2px;
  font-size: 14px;
  font-weight: var(--weight-semibold);
}
.wf-index-sub {
  padding: 0 14px 12px;
  font-size: var(--text-xs);
  color: rgba(255,255,255,0.4);
}

/* ─── UTILITY CLASSES ───────────────────────────────────────────── */
.wf-spacer { flex: 1; }
.wf-flex { display: flex; }
.wf-items-center { align-items: center; }
.wf-justify-between { justify-content: space-between; }
.wf-gap-1 { gap: var(--space-1); }
.wf-gap-2 { gap: var(--space-2); }
.wf-gap-3 { gap: var(--space-3); }
.wf-gap-4 { gap: var(--space-4); }
.wf-flex-1 { flex: 1; }
.wf-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

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

### Open in browser:
open docs/wireframes/<kebab>-v1.html

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

---

## Relationship to Other Skills

| Skill | Relationship |
|-------|-------------|
| `/design-discovery` | Prerequisite: produces the IA and PRDs this skill reads. Sub-flow D of design-discovery generates an initial wireframe per screen — `/wireframe` is the standalone, iterative version for deeper exploration. |
| `/send-to-figma` | Downstream: after generating wireframes, run `/send-to-figma docs/wireframes` to capture all variation files as editable Figma layers. Each variation file = one Figma artboard. |
| `/new-screen` | Downstream: once a wireframe variation is approved, use `/new-screen` to scaffold the production screen based on it. |
| `/complex-component` | Downstream: if a wireframe reveals a complex UI pattern, use `/complex-component` to design and build it. |
| `/figma-cli` | Used for Figma output mode. Refer to its SKILL.md for render JSX syntax. |
