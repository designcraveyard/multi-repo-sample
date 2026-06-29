# HTML Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `multi-repo-html/` — a standalone HTML/CSS design system that mirrors the app's Figma-sourced tokens and components, adds design-tool-specific extras, and carries semantic data attributes mapping every element back to its platform implementation.

**Architecture:** Modular CSS files organized by concern (tokens → components → patterns → design-tools → reference). A barrel `design-system.css` imports everything in order. A hand-authored `manifest.json` maps each component to its web/iOS/Android files, variant enums, and valid data attributes. No build step — all files are hand-authored plain HTML/CSS.

**Tech Stack:** Plain HTML5, CSS3 custom properties, JSON. No JavaScript dependencies. Font: Geist Sans + Geist Mono via Google Fonts (`<link>` tag), system-ui fallback.

**Spec:** [docs/superpowers/specs/2026-04-11-html-design-system-design.md](../specs/2026-04-11-html-design-system-design.md)

---

## File Map

```
multi-repo-html/
├── design-system.css                          # Barrel import (all files in order)
├── manifest.json                              # Component → platform + variant mapping
├── CLAUDE.md                                  # Usage guide for Claude
├── tokens/
│   ├── primitives.css                         # Raw palette (zinc, neutral, red, amber, green, indigo, base)
│   ├── semantic.css                           # Surfaces, typography, icons, borders (light + dark)
│   ├── typography.css                         # 28 type roles as utility classes
│   ├── spacing.css                            # --space-1..24 + utility classes
│   ├── radius.css                             # --radius-xs..full (mobile + desktop)
│   └── design-tools.css                       # Wireframe, annotation, device, slide tokens
├── components/
│   ├── button/button.css, button.html
│   ├── icon-button/icon-button.css, icon-button.html
│   ├── badge/badge.css, badge.html
│   ├── label/label.css, label.html
│   ├── chip/chip.css, chip.html
│   ├── tabs/tabs.css, tabs.html
│   ├── segment-control-bar/segment-control-bar.css, segment-control-bar.html
│   ├── thumbnail/thumbnail.css, thumbnail.html
│   ├── input-field/input-field.css, input-field.html
│   ├── toast/toast.css, toast.html
│   ├── date-grid/date-grid.css, date-grid.html
│   ├── divider/divider.css, divider.html
│   ├── checkbox/checkbox.css, checkbox.html
│   ├── switch/switch.css, switch.html
│   └── radio-button/radio-button.css, radio-button.html
├── patterns/
│   ├── text-block/text-block.css, text-block.html
│   ├── step-indicator/step-indicator.css, step-indicator.html
│   ├── stepper/stepper.css, stepper.html
│   └── list-item/list-item.css, list-item.html
├── design-tools/
│   ├── device-frames/device-frames.css, device-frames.html
│   ├── annotations/annotations.css, annotations.html
│   ├── slide-layouts/slide-layouts.css, slide-layouts.html
│   └── wireframe/wireframe.css, wireframe.html
└── reference/
    ├── index.html                             # Full component sheet
    ├── tokens.html                            # Token reference swatches
    └── design-tools.html                      # Design tools showcase
```

---

## Task 1: Scaffold Directory Structure + CLAUDE.md

**Files:**
- Create: `multi-repo-html/CLAUDE.md`
- Create: all empty directories listed in the file map

- [ ] **Step 1: Create directory structure**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample
mkdir -p multi-repo-html/{tokens,components/{button,icon-button,badge,label,chip,tabs,segment-control-bar,thumbnail,input-field,toast,date-grid,divider,checkbox,switch,radio-button},patterns/{text-block,step-indicator,stepper,list-item},design-tools/{device-frames,annotations,slide-layouts,wireframe},reference}
```

- [ ] **Step 2: Create CLAUDE.md**

Write `multi-repo-html/CLAUDE.md` with the following content:

```markdown
# CLAUDE.md — multi-repo-html

Standalone HTML/CSS design system mirroring the app's Figma-sourced tokens and components.

## Purpose

This design system serves two roles:
1. **Reference** — `reference/` pages showcase every token and component variant
2. **Toolkit** — component CSS + HTML snippets are consumed by plugins (wireframe, UI design, stylescape, presentations)

## How to Use Components

Every component has a `.css` file (styles) and `.html` file (snippet with all variants).
Components use `ds-` prefix classes and carry semantic `data-*` attributes:

```html
<button class="ds-button primary medium"
  data-component="Button"
  data-variant="primary"
  data-size="medium">
  Label
</button>
```

## Data Attributes

| Attribute | Required | Purpose |
|-----------|----------|---------|
| `data-component` | Yes | Registry name from `docs/components.md` |
| `data-variant` | Yes | Primary variant (e.g., `primary`, `secondary`) |
| `data-size` | When applicable | Size variant (`sm`, `md`, `lg`) |
| `data-state` | When non-default | Visual state (`hover`, `pressed`, `disabled`) |

## Manifest

`manifest.json` maps every component to its platform files and variant enums.
Look up `data-component` value in the manifest to find the correct import path.

## Consuming in a Plugin

**Linked (development):**
```html
<link rel="stylesheet" href="../../multi-repo-html/design-system.css" />
```

**Inlined (standalone export):**
Read the needed token + component CSS files, concatenate into a `<style>` block.

## Token Architecture

1. `tokens/primitives.css` — raw palette (never use directly in components)
2. `tokens/semantic.css` — surfaces, typography, icons, borders (light + dark mode)
3. `tokens/typography.css` — 28 type roles as `.type-*` utility classes
4. `tokens/spacing.css` — `--space-*` properties + `.gap-*`, `.p-*` utilities
5. `tokens/radius.css` — `--radius-*` properties
6. `tokens/design-tools.css` — wireframe, annotation, device, slide tokens (not in main app)

## Adding a New Component

1. Create `components/<name>/<name>.css` and `components/<name>/<name>.html`
2. Add all variant classes in the CSS with inline comments
3. Render every variant in the HTML snippet with `data-*` attributes
4. Add entry to `manifest.json`
5. Add `@import` to `design-system.css`
6. Add section to `reference/index.html`
```

- [ ] **Step 3: Commit**

```bash
git add multi-repo-html/
git commit -m "feat(html-ds): scaffold directory structure and CLAUDE.md"
```

---

## Task 2: Token Files — Primitives + Semantic

**Files:**
- Create: `multi-repo-html/tokens/primitives.css`
- Create: `multi-repo-html/tokens/semantic.css`

**Source:** Read directly from `multi-repo-nextjs/app/globals.css` — copy the exact CSS custom property declarations from the `:root` block (primitives) and semantic layer (light + dark mode overrides).

- [ ] **Step 1: Create primitives.css**

Write `multi-repo-html/tokens/primitives.css`. Copy the exact primitive palette from `globals.css` lines 20-134 (the `:root` block containing `--color-zinc-*`, `--color-neutral-*`, `--color-red-*`, `--color-amber-*`, `--color-green-*`, `--color-indigo-*`, `--color-base-*`). Add a header comment block:

```css
/* =============================================================
   Primitives — Raw Color Palette
   ─────────────────────────────
   Source: Figma "bubbles-kit" › Primitives collection
   Synced from: multi-repo-nextjs/app/globals.css

   These are the base color values. NEVER use these directly in
   components — always reference semantic tokens from semantic.css.

   Palettes: Zinc, Neutral, Red, Amber, Green, Indigo, Base
   Each palette has shades 50–950 (11 stops).
   ============================================================= */

:root {
  /* --- Zinc ---
     Brand-tinted neutral. Used for brand-interactive surfaces. */
  --color-zinc-50:    #FAFAFA;
  --color-zinc-100:   #F4F4F5;
  /* ... exact values from globals.css ... */
}
```

Include ALL palettes. Do NOT include the shadcn/Tailwind variables (`--radius`, `--background`, `--foreground`, `--card`, `--primary`, etc.) — those are Tailwind-specific and not part of the design system tokens.

- [ ] **Step 2: Create semantic.css**

Write `multi-repo-html/tokens/semantic.css`. Copy the semantic token declarations from `globals.css`:
- Light mode (`:root` block, lines 145-253): all `--surfaces-*`, `--typography-*`, `--icons-*`, `--border-*` tokens
- Dark mode (`@media (prefers-color-scheme: dark)` block, lines 401-507): same tokens with dark values

Include a header comment and section comments matching the structure in globals.css. Do NOT include legacy aliases (`--surface-*`, `--text-*`, `--icon-*`) — only the canonical `--surfaces-*`, `--typography-*`, `--icons-*`, `--border-*` names.

```css
/* =============================================================
   Semantic Tokens — Design System Color Layer
   ─────────────────────────────────────────────
   Source: Figma "bubbles-kit" › Semantic collection
   Synced from: multi-repo-nextjs/app/globals.css

   These tokens alias primitive palette values and provide
   semantic meaning. Components ONLY use these tokens.

   Naming convention (matches Figma 1:1, kebab-cased):
     Figma: Surfaces/BrandInteractive  →  --surfaces-brand-interactive
     Figma: Typography/OnBrandPrimary  →  --typography-on-brand-primary
     Figma: Border/Brand               →  --border-brand

   Light mode: :root
   Dark mode:  @media (prefers-color-scheme: dark)
   ============================================================= */

:root {
  /* ── Surfaces/Base ─────────────────────────────────────────── */
  /* BasePrimary — app's main background color */
  --surfaces-base-primary:              var(--color-base-white);
  /* BasePrimaryHover — subtle hover feedback on primary bg */
  --surfaces-base-primary-hover:        var(--color-neutral-100);
  /* ... all surface tokens with inline comments ... */
}

@media (prefers-color-scheme: dark) {
  :root {
    /* ── Surfaces/Base (Dark) ──────────────────────────────── */
    --surfaces-base-primary:              var(--color-base-black);
    /* ... all dark overrides ... */
  }
}
```

- [ ] **Step 3: Verify token count**

Read both files and verify:
- primitives.css has 67 color variables (6 palettes × 11 shades + 2 base)
- semantic.css has:
  - Light: ~27 surface + 14 typography + 14 icon + 7 border = ~62 tokens
  - Dark: same 62 tokens overridden

- [ ] **Step 4: Commit**

```bash
git add multi-repo-html/tokens/primitives.css multi-repo-html/tokens/semantic.css
git commit -m "feat(html-ds): add primitive and semantic token CSS files"
```

---

## Task 3: Token Files — Typography, Spacing, Radius

**Files:**
- Create: `multi-repo-html/tokens/typography.css`
- Create: `multi-repo-html/tokens/spacing.css`
- Create: `multi-repo-html/tokens/radius.css`

- [ ] **Step 1: Create typography.css**

Write `multi-repo-html/tokens/typography.css`. Two sections:

**Section 1:** CSS custom properties for all 28 type roles (copy from `globals.css` lines 340-385). Each role has `-size`, `-leading`, `-weight` (and some have `-tracking`).

**Section 2:** Utility classes for each role. Pattern:

```css
/* =============================================================
   Typography — Type Scale & Utility Classes
   ──────────────────────────────────────────
   Source: Figma "bubbles-kit" › 🎨 Tokens & Styles page
   28 type roles across 10 categories.

   Custom properties define the raw values.
   Utility classes (.type-*) apply all three properties at once.

   Font family: Inter (fallback for Geist which requires next/font).
   Set --font-sans on :root or <body> to override.
   ============================================================= */

:root {
  /* --- Font Family --- */
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* --- Display ---
     Large hero text for landing pages and splash screens. */
  --typography-display-lg-size: 96px;
  --typography-display-lg-leading: 128px;
  --typography-display-lg-weight: 400;
  /* ... all 28 roles ... */
}

/* --- Utility Classes ---
   Apply a complete type style with a single class.
   Usage: <h1 class="type-display-lg">Hero</h1> */

/* Display — large format hero text */
.type-display-lg {
  font-family: var(--font-sans);
  font-size: var(--typography-display-lg-size);
  line-height: var(--typography-display-lg-leading);
  font-weight: var(--typography-display-lg-weight);
}

.type-display-md {
  font-family: var(--font-sans);
  font-size: var(--typography-display-md-size);
  line-height: var(--typography-display-md-leading);
  font-weight: var(--typography-display-md-weight);
}

/* ... all 28 roles as utility classes ... */
```

All 28 roles:
- Display: lg, md, sm
- Heading: lg, md, sm
- Title: lg, md, sm
- Body: lg, md, sm
- Body Emphasized: lg, md, sm (class: `.type-body-lg-em`, `.type-body-md-em`, `.type-body-sm-em`)
- CTA: lg, md, sm
- Link: lg, md, sm
- Caption: md, sm
- Badge: md, sm
- Overline: sm, md, lg (these also have `-tracking`)

For overline classes, add `letter-spacing: var(--typography-overline-*-tracking)`.

- [ ] **Step 2: Create spacing.css**

```css
/* =============================================================
   Spacing — 4px Grid System
   ──────────────────────────
   Source: Figma Primitives/Dimensions
   All values are multiples of 4px.

   Custom properties: --space-1 (4px) through --space-24 (96px)
   Utility classes: .p-*, .px-*, .py-*, .m-*, .mx-*, .my-*, .gap-*
   ============================================================= */

:root {
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
}

/* --- Padding utilities --- */
.p-1  { padding: var(--space-1); }
.p-2  { padding: var(--space-2); }
.p-3  { padding: var(--space-3); }
.p-4  { padding: var(--space-4); }
.p-5  { padding: var(--space-5); }
.p-6  { padding: var(--space-6); }
.p-8  { padding: var(--space-8); }
.p-10 { padding: var(--space-10); }
.p-12 { padding: var(--space-12); }

.px-1  { padding-left: var(--space-1); padding-right: var(--space-1); }
.px-2  { padding-left: var(--space-2); padding-right: var(--space-2); }
.px-3  { padding-left: var(--space-3); padding-right: var(--space-3); }
.px-4  { padding-left: var(--space-4); padding-right: var(--space-4); }
.px-5  { padding-left: var(--space-5); padding-right: var(--space-5); }
.px-6  { padding-left: var(--space-6); padding-right: var(--space-6); }
.px-8  { padding-left: var(--space-8); padding-right: var(--space-8); }
.px-10 { padding-left: var(--space-10); padding-right: var(--space-10); }

.py-1  { padding-top: var(--space-1); padding-bottom: var(--space-1); }
.py-2  { padding-top: var(--space-2); padding-bottom: var(--space-2); }
.py-3  { padding-top: var(--space-3); padding-bottom: var(--space-3); }
.py-4  { padding-top: var(--space-4); padding-bottom: var(--space-4); }
.py-5  { padding-top: var(--space-5); padding-bottom: var(--space-5); }
.py-6  { padding-top: var(--space-6); padding-bottom: var(--space-6); }
.py-8  { padding-top: var(--space-8); padding-bottom: var(--space-8); }

/* --- Margin utilities --- */
.m-1  { margin: var(--space-1); }
.m-2  { margin: var(--space-2); }
.m-3  { margin: var(--space-3); }
.m-4  { margin: var(--space-4); }
.m-6  { margin: var(--space-6); }
.m-8  { margin: var(--space-8); }

.mt-1  { margin-top: var(--space-1); }
.mt-2  { margin-top: var(--space-2); }
.mt-3  { margin-top: var(--space-3); }
.mt-4  { margin-top: var(--space-4); }
.mt-6  { margin-top: var(--space-6); }
.mt-8  { margin-top: var(--space-8); }
.mt-10 { margin-top: var(--space-10); }

.mb-1  { margin-bottom: var(--space-1); }
.mb-2  { margin-bottom: var(--space-2); }
.mb-3  { margin-bottom: var(--space-3); }
.mb-4  { margin-bottom: var(--space-4); }
.mb-6  { margin-bottom: var(--space-6); }
.mb-8  { margin-bottom: var(--space-8); }

/* --- Gap utilities (for flex/grid containers) --- */
.gap-1  { gap: var(--space-1); }
.gap-2  { gap: var(--space-2); }
.gap-3  { gap: var(--space-3); }
.gap-4  { gap: var(--space-4); }
.gap-5  { gap: var(--space-5); }
.gap-6  { gap: var(--space-6); }
.gap-8  { gap: var(--space-8); }
.gap-10 { gap: var(--space-10); }
.gap-12 { gap: var(--space-12); }
```

- [ ] **Step 3: Create radius.css**

```css
/* =============================================================
   Border Radius — Corner Rounding Tokens
   ────────────────────────────────────────
   Source: Figma "Simantic-Dimensions"
   Mobile values at :root, desktop overrides at min-width: 768px.
   ============================================================= */

:root {
  --radius-none: 0px;
  --radius-xs:   4px;    /* Small controls (checkbox, small badge) */
  --radius-sm:   8px;    /* Chips, compact cards */
  --radius-md:   12px;   /* Input fields, standard cards */
  --radius-lg:   16px;   /* Large cards, modals */
  --radius-xl:   24px;   /* Hero cards, sheet handles */
  --radius-2xl:  32px;   /* Extra-large cards */
  --radius-full: 9999px; /* Pills, buttons, badges */
}

/* Desktop — slightly larger radii for bigger screens */
@media (min-width: 768px) {
  :root {
    --radius-xs:  8px;
    --radius-sm:  12px;
    --radius-md:  16px;
    --radius-lg:  24px;
    --radius-xl:  32px;
    --radius-2xl: 48px;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add multi-repo-html/tokens/typography.css multi-repo-html/tokens/spacing.css multi-repo-html/tokens/radius.css
git commit -m "feat(html-ds): add typography, spacing, and radius token files"
```

---

## Task 4: Token File — Design Tools

**Files:**
- Create: `multi-repo-html/tokens/design-tools.css`

- [ ] **Step 1: Create design-tools.css**

```css
/* =============================================================
   Design Tool Tokens — Superset Layer
   ─────────────────────────────────────
   Tokens used ONLY in design contexts (wireframes, annotations,
   device mockups, presentations). These are NOT synced to the
   app's globals.css — they exist only in the HTML design system.
   ============================================================= */

:root {
  /* --- Wireframe ---
     Muted palette for lo-fi wireframe mockups.
     Intentionally desaturated to avoid implying final design. */
  --wireframe-bg:          #F8F9FA;  /* Page background */
  --wireframe-surface:     #FFFFFF;  /* Card/container surface */
  --wireframe-placeholder: #E2E8F0;  /* Placeholder blocks (images, avatars) */
  --wireframe-border:      #CBD5E1;  /* Container borders */
  --wireframe-text:        #64748B;  /* Placeholder text */
  --wireframe-text-strong: #334155;  /* Headings in wireframes */
  --wireframe-accent:      #94A3B8;  /* Active/selected wireframe elements */

  /* --- Annotations ---
     Bright colors for design review callouts and redlines.
     Must be visually distinct from the design itself. */
  --annotation-red:    #EF4444;  /* Error callouts, critical issues */
  --annotation-blue:   #3B82F6;  /* Measurement lines, dimensions */
  --annotation-green:  #22C55E;  /* Approval markers, positive notes */
  --annotation-yellow: #EAB308;  /* Warnings, questions, suggestions */
  --annotation-purple: #8B5CF6;  /* Component boundaries, spacing guides */
  --annotation-text:   #1E293B;  /* Callout label text */
  --annotation-bg:     #FFFFFF;  /* Callout bubble background */

  /* --- Device Frames ---
     Dimensions for device chrome wrappers.
     Logical pixels matching standard device screen sizes. */
  --device-iphone-width:          393px;   /* iPhone 16 */
  --device-iphone-height:         852px;
  --device-iphone-pro-max-width:  430px;   /* iPhone 16 Pro Max */
  --device-iphone-pro-max-height: 932px;
  --device-ipad-width:            1024px;  /* iPad 13" */
  --device-ipad-height:           1366px;
  --device-browser-width:         1440px;  /* Desktop browser */
  --device-browser-height:        900px;
  --device-chrome-radius:         40px;    /* Corner rounding on device bezels */
  --device-chrome-color:          #1A1A1A; /* Device bezel/chrome color */
  --device-notch-width:           126px;   /* Dynamic Island width */
  --device-notch-height:          37px;    /* Dynamic Island height */

  /* --- Slides / Presentations ---
     Standard 16:9 slide dimensions and spacing. */
  --slide-width:   1920px;
  --slide-height:  1080px;
  --slide-padding: 80px;   /* Safe area inset from slide edges */
  --slide-bg:      #FFFFFF; /* Default slide background */
  --slide-text:    #1A1A1A; /* Default slide text color */

  /* --- Skeleton / Loading Placeholders ---
     Shimmer animation colors for skeleton UI elements. */
  --skeleton-base:    #E2E8F0;  /* Base skeleton color */
  --skeleton-shimmer: #F1F5F9;  /* Shimmer highlight */
}

/* Dark mode overrides for design-tool tokens */
@media (prefers-color-scheme: dark) {
  :root {
    --wireframe-bg:          #0F172A;
    --wireframe-surface:     #1E293B;
    --wireframe-placeholder: #334155;
    --wireframe-border:      #475569;
    --wireframe-text:        #94A3B8;
    --wireframe-text-strong: #CBD5E1;
    --wireframe-accent:      #64748B;

    --annotation-bg:         #1E293B;
    --annotation-text:       #F1F5F9;

    --device-chrome-color:   #2A2A2A;

    --slide-bg:              #0F172A;
    --slide-text:            #F1F5F9;

    --skeleton-base:         #334155;
    --skeleton-shimmer:      #475569;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add multi-repo-html/tokens/design-tools.css
git commit -m "feat(html-ds): add design-tools superset token file"
```

---

## Task 5: Base Styles + Barrel File

**Files:**
- Create: `multi-repo-html/design-system.css`

- [ ] **Step 1: Create design-system.css**

```css
/* =============================================================
   Design System — Barrel Import
   ──────────────────────────────
   Imports all token and component files in dependency order.
   Use this single file to get the complete design system.

   Import order:
     1. Tokens (primitives → semantic → typography → spacing → radius → design-tools)
     2. Base styles (reset, box-sizing, font defaults)
     3. Components (atomic UI components)
     4. Patterns (multi-component compositions)
     5. Design tools (device frames, annotations, wireframe, slides)

   For cherry-picking, import individual files directly instead.
   ============================================================= */

/* === 1. Tokens === */
@import "tokens/primitives.css";
@import "tokens/semantic.css";
@import "tokens/typography.css";
@import "tokens/spacing.css";
@import "tokens/radius.css";
@import "tokens/design-tools.css";

/* === 1b. Base Reset & Defaults ===
   Minimal reset for standalone HTML files. Sets box-sizing,
   font family, and base colors from semantic tokens. */

/* --- Box model reset --- */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* --- Document defaults --- */
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  font-family: var(--font-sans);
  font-size: var(--typography-body-md-size);
  line-height: var(--typography-body-md-leading);
  color: var(--typography-primary);
  background-color: var(--surfaces-base-primary);
}

/* --- Flex/grid utility classes --- */
.flex        { display: flex; }
.flex-col    { flex-direction: column; }
.flex-row    { flex-direction: row; }
.flex-wrap   { flex-wrap: wrap; }
.flex-1      { flex: 1 1 0%; }
.flex-shrink-0 { flex-shrink: 0; }
.items-center { align-items: center; }
.items-start  { align-items: flex-start; }
.items-end    { align-items: flex-end; }
.items-stretch { align-items: stretch; }
.justify-center  { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-start   { justify-content: flex-start; }
.justify-end     { justify-content: flex-end; }
.inline-flex { display: inline-flex; }
.grid        { display: grid; }
.hidden      { display: none; }

/* --- Width/height utilities --- */
.w-full     { width: 100%; }
.h-full     { height: 100%; }
.min-w-0    { min-width: 0; }
.max-w-screen { max-width: 100vw; }

/* --- Text utilities --- */
.text-center { text-align: center; }
.text-left   { text-align: left; }
.text-right  { text-align: right; }
.whitespace-nowrap { white-space: nowrap; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.select-none { user-select: none; }

/* --- Misc utilities --- */
.rounded-full { border-radius: var(--radius-full); }
.rounded-md   { border-radius: var(--radius-md); }
.rounded-sm   { border-radius: var(--radius-sm); }
.rounded-xs   { border-radius: var(--radius-xs); }
.rounded-lg   { border-radius: var(--radius-lg); }
.rounded-xl   { border-radius: var(--radius-xl); }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); }
.opacity-50 { opacity: 0.5; }
.cursor-pointer { cursor: pointer; }
.cursor-not-allowed { cursor: not-allowed; }
.transition-colors { transition-property: color, background-color, border-color; transition-duration: 150ms; transition-timing-function: ease-out; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0; }

/* === 2. Components === */
@import "components/button/button.css";
@import "components/icon-button/icon-button.css";
@import "components/badge/badge.css";
@import "components/label/label.css";
@import "components/chip/chip.css";
@import "components/tabs/tabs.css";
@import "components/segment-control-bar/segment-control-bar.css";
@import "components/thumbnail/thumbnail.css";
@import "components/input-field/input-field.css";
@import "components/toast/toast.css";
@import "components/date-grid/date-grid.css";
@import "components/divider/divider.css";
@import "components/checkbox/checkbox.css";
@import "components/switch/switch.css";
@import "components/radio-button/radio-button.css";

/* === 3. Patterns === */
@import "patterns/text-block/text-block.css";
@import "patterns/step-indicator/step-indicator.css";
@import "patterns/stepper/stepper.css";
@import "patterns/list-item/list-item.css";

/* === 4. Design Tools === */
@import "design-tools/device-frames/device-frames.css";
@import "design-tools/annotations/annotations.css";
@import "design-tools/slide-layouts/slide-layouts.css";
@import "design-tools/wireframe/wireframe.css";
```

- [ ] **Step 2: Commit**

```bash
git add multi-repo-html/design-system.css
git commit -m "feat(html-ds): add barrel design-system.css with base styles and imports"
```

---

## Task 6: Button Component

**Files:**
- Create: `multi-repo-html/components/button/button.css`
- Create: `multi-repo-html/components/button/button.html`

**Reference:** Read `multi-repo-nextjs/app/components/Button/Button.tsx` for exact token references and variant logic.

- [ ] **Step 1: Create button.css**

Translate the Button's Tailwind classes into plain CSS. The Button has:
- 5 types: primary, secondary, tertiary, success, danger
- 4 states: default, hover, pressed (active), disabled
- 3 sizes: sm (24px height), md (36px height), lg (48px height)

```css
/* =============================================================
   Button Component
   ─────────────────
   Primary action trigger with pill shape and semantic color variants.

   Platform mapping:
     Web:     app/components/Button/Button.tsx
     iOS:     Components/Button/AppButton.swift
     Android: ui/components/AppButton.kt

   Class structure:
     .ds-button              — base styles (layout, shape, transitions)
     .ds-button.primary      — solid brand bg, inverse text
     .ds-button.secondary    — low-contrast brand bg, brand text
     .ds-button.tertiary     — outlined with brand border, brand text
     .ds-button.success      — solid green bg, inverse text
     .ds-button.danger       — solid red bg, inverse text
     .ds-button.sm           — 24px height, 8px horizontal padding
     .ds-button.md           — 36px height, 16px horizontal padding
     .ds-button.lg           — 48px height, 20px horizontal padding (default)
     .ds-button.disabled     — 50% opacity, no pointer events
     .ds-button.hover        — forced hover visual (for static mockups)
     .ds-button.pressed      — forced pressed visual (for static mockups)

   Usage:
     <button class="ds-button primary lg">Save</button>
     <button class="ds-button secondary sm disabled">Cancel</button>
   ============================================================= */

/* --- Base ---
   Shared layout: inline-flex, center-aligned, pill-shaped (border-radius: 9999px).
   Transition: 150ms ease-out on color properties.
   All buttons inherit font from the size class. */
.ds-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  text-decoration: none;
  transition: background-color 150ms ease-out, color 150ms ease-out, border-color 150ms ease-out;
  font-family: var(--font-sans);
}

/* --- Size: Small (24px) ---
   Figma: h-24px, px-8px, py-4px, gap-2px, cta-sm font (12px/600) */
.ds-button.sm {
  height: 24px;
  padding: var(--space-1) var(--space-2);
  gap: 2px;
  font-size: var(--typography-cta-sm-size);
  line-height: var(--typography-cta-sm-leading);
  font-weight: var(--typography-cta-sm-weight);
}

/* --- Size: Medium (36px) ---
   Figma: h-36px, px-16px, py-8px, gap-8px, cta-md font (14px/600) */
.ds-button.md {
  height: 36px;
  padding: var(--space-2) var(--space-4);
  gap: var(--space-2);
  font-size: var(--typography-cta-md-size);
  line-height: var(--typography-cta-md-leading);
  font-weight: var(--typography-cta-md-weight);
}

/* --- Size: Large (48px) — DEFAULT ---
   Figma: h-48px, px-20px, py-12px, gap-12px, cta-lg font (16px/600) */
.ds-button.lg {
  height: 48px;
  padding: var(--space-3) var(--space-5);
  gap: var(--space-3);
  font-size: var(--typography-cta-lg-size);
  line-height: var(--typography-cta-lg-leading);
  font-weight: var(--typography-cta-lg-weight);
}

/* --- Type: Primary ---
   Solid brand background, inverse text for maximum contrast.
   Maps to variant="primary" on all platforms. */
.ds-button.primary {
  background-color: var(--surfaces-brand-interactive);
  color: var(--typography-on-brand-primary);
}
.ds-button.primary:hover,
.ds-button.primary.hover {
  background-color: var(--surfaces-brand-interactive-hover);
}
.ds-button.primary:active,
.ds-button.primary.pressed {
  background-color: var(--surfaces-brand-interactive-pressed);
}

/* --- Type: Secondary ---
   Low-contrast brand background with brand text.
   Maps to variant="secondary" on all platforms. */
.ds-button.secondary {
  background-color: var(--surfaces-brand-interactive-low-contrast);
  color: var(--typography-brand);
}
.ds-button.secondary:hover,
.ds-button.secondary.hover {
  background-color: var(--surfaces-brand-interactive-low-contrast-hover);
}
.ds-button.secondary:active,
.ds-button.secondary.pressed {
  background-color: var(--surfaces-brand-interactive-low-contrast-pressed);
}

/* --- Type: Tertiary ---
   Outlined with brand border, transparent-ish bg, brand text.
   Maps to variant="tertiary" on all platforms. */
.ds-button.tertiary {
  background-color: var(--surfaces-base-primary);
  color: var(--typography-brand);
  border: 1px solid var(--border-brand);
}
.ds-button.tertiary:hover,
.ds-button.tertiary.hover {
  background-color: var(--surfaces-base-primary-hover);
}
.ds-button.tertiary:active,
.ds-button.tertiary.pressed {
  background-color: var(--surfaces-base-primary-pressed);
}

/* --- Type: Success ---
   Solid green background, inverse text.
   Maps to variant="success" on all platforms. */
.ds-button.success {
  background-color: var(--surfaces-success-solid);
  color: var(--typography-on-brand-primary);
}
.ds-button.success:hover,
.ds-button.success.hover {
  background-color: var(--surfaces-success-solid-hover);
}
.ds-button.success:active,
.ds-button.success.pressed {
  background-color: var(--surfaces-success-solid-pressed);
}

/* --- Type: Danger ---
   Solid red background, inverse text.
   Maps to variant="danger" on all platforms. */
.ds-button.danger {
  background-color: var(--surfaces-error-solid);
  color: var(--typography-on-brand-primary);
}
.ds-button.danger:hover,
.ds-button.danger.hover {
  background-color: var(--surfaces-error-solid-hover);
}
.ds-button.danger:active,
.ds-button.danger.pressed {
  background-color: var(--surfaces-error-solid-pressed);
}

/* --- State: Disabled ---
   50% opacity, no interaction. Applied via class (not :disabled pseudo)
   since these are often <div> or <span> in static mockups. */
.ds-button.disabled,
.ds-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

- [ ] **Step 2: Create button.html**

Write every type × size combination (5 types × 3 sizes = 15 default) plus hover, pressed, disabled states for each type at medium size (+15 = 30 variants total shown). Each with full `data-*` attributes and inline comments.

```html
<!-- =============================================================
     Button Component — All Variants
     ─────────────────────────────────
     Platform mapping:
       Web:     app/components/Button/Button.tsx
       iOS:     Components/Button/AppButton.swift
       Android: ui/components/AppButton.kt

     Variant axes:
       type:  primary | secondary | tertiary | success | danger
       size:  sm (24px) | md (36px) | lg (48px)
       state: default | hover | pressed | disabled

     Data attributes:
       data-component="Button"     (always)
       data-variant="primary"      (type name)
       data-size="lg"              (size name)
       data-state="hover"          (omit for default state)
     ============================================================= -->

<!-- ─── Type: Primary ─────────────────────────────────────────── -->

<!-- Primary / Large / Default -->
<button class="ds-button primary lg"
  data-component="Button"
  data-variant="primary"
  data-size="lg">
  Primary Large
</button>

<!-- Primary / Medium / Default -->
<button class="ds-button primary md"
  data-component="Button"
  data-variant="primary"
  data-size="md">
  Primary Medium
</button>

<!-- Primary / Small / Default -->
<button class="ds-button primary sm"
  data-component="Button"
  data-variant="primary"
  data-size="sm">
  Primary Small
</button>

<!-- Primary / Medium / Hover -->
<button class="ds-button primary md hover"
  data-component="Button"
  data-variant="primary"
  data-size="md"
  data-state="hover">
  Primary Hover
</button>

<!-- Primary / Medium / Pressed -->
<button class="ds-button primary md pressed"
  data-component="Button"
  data-variant="primary"
  data-size="md"
  data-state="pressed">
  Primary Pressed
</button>

<!-- Primary / Medium / Disabled -->
<button class="ds-button primary md disabled"
  data-component="Button"
  data-variant="primary"
  data-size="md"
  data-state="disabled"
  disabled>
  Primary Disabled
</button>

<!-- ─── Type: Secondary ───────────────────────────────────────── -->

<!-- Secondary / Large / Default -->
<button class="ds-button secondary lg"
  data-component="Button"
  data-variant="secondary"
  data-size="lg">
  Secondary Large
</button>

<!-- Secondary / Medium / Default -->
<button class="ds-button secondary md"
  data-component="Button"
  data-variant="secondary"
  data-size="md">
  Secondary Medium
</button>

<!-- Secondary / Small / Default -->
<button class="ds-button secondary sm"
  data-component="Button"
  data-variant="secondary"
  data-size="sm">
  Secondary Small
</button>

<!-- Secondary / Medium / Hover -->
<button class="ds-button secondary md hover"
  data-component="Button"
  data-variant="secondary"
  data-size="md"
  data-state="hover">
  Secondary Hover
</button>

<!-- Secondary / Medium / Pressed -->
<button class="ds-button secondary md pressed"
  data-component="Button"
  data-variant="secondary"
  data-size="md"
  data-state="pressed">
  Secondary Pressed
</button>

<!-- Secondary / Medium / Disabled -->
<button class="ds-button secondary md disabled"
  data-component="Button"
  data-variant="secondary"
  data-size="md"
  data-state="disabled"
  disabled>
  Secondary Disabled
</button>

<!-- ─── Type: Tertiary ────────────────────────────────────────── -->

<!-- Tertiary / Large / Default -->
<button class="ds-button tertiary lg"
  data-component="Button"
  data-variant="tertiary"
  data-size="lg">
  Tertiary Large
</button>

<!-- Tertiary / Medium / Default -->
<button class="ds-button tertiary md"
  data-component="Button"
  data-variant="tertiary"
  data-size="md">
  Tertiary Medium
</button>

<!-- Tertiary / Small / Default -->
<button class="ds-button tertiary sm"
  data-component="Button"
  data-variant="tertiary"
  data-size="sm">
  Tertiary Small
</button>

<!-- Tertiary / Medium / Hover -->
<button class="ds-button tertiary md hover"
  data-component="Button"
  data-variant="tertiary"
  data-size="md"
  data-state="hover">
  Tertiary Hover
</button>

<!-- Tertiary / Medium / Pressed -->
<button class="ds-button tertiary md pressed"
  data-component="Button"
  data-variant="tertiary"
  data-size="md"
  data-state="pressed">
  Tertiary Pressed
</button>

<!-- Tertiary / Medium / Disabled -->
<button class="ds-button tertiary md disabled"
  data-component="Button"
  data-variant="tertiary"
  data-size="md"
  data-state="disabled"
  disabled>
  Tertiary Disabled
</button>

<!-- ─── Type: Success ─────────────────────────────────────────── -->

<!-- Success / Large / Default -->
<button class="ds-button success lg"
  data-component="Button"
  data-variant="success"
  data-size="lg">
  Success Large
</button>

<!-- Success / Medium / Default -->
<button class="ds-button success md"
  data-component="Button"
  data-variant="success"
  data-size="md">
  Success Medium
</button>

<!-- Success / Small / Default -->
<button class="ds-button success sm"
  data-component="Button"
  data-variant="success"
  data-size="sm">
  Success Small
</button>

<!-- Success / Medium / Hover -->
<button class="ds-button success md hover"
  data-component="Button"
  data-variant="success"
  data-size="md"
  data-state="hover">
  Success Hover
</button>

<!-- Success / Medium / Pressed -->
<button class="ds-button success md pressed"
  data-component="Button"
  data-variant="success"
  data-size="md"
  data-state="pressed">
  Success Pressed
</button>

<!-- Success / Medium / Disabled -->
<button class="ds-button success md disabled"
  data-component="Button"
  data-variant="success"
  data-size="md"
  data-state="disabled"
  disabled>
  Success Disabled
</button>

<!-- ─── Type: Danger ──────────────────────────────────────────── -->

<!-- Danger / Large / Default -->
<button class="ds-button danger lg"
  data-component="Button"
  data-variant="danger"
  data-size="lg">
  Danger Large
</button>

<!-- Danger / Medium / Default -->
<button class="ds-button danger md"
  data-component="Button"
  data-variant="danger"
  data-size="md">
  Danger Medium
</button>

<!-- Danger / Small / Default -->
<button class="ds-button danger sm"
  data-component="Button"
  data-variant="danger"
  data-size="sm">
  Danger Small
</button>

<!-- Danger / Medium / Hover -->
<button class="ds-button danger md hover"
  data-component="Button"
  data-variant="danger"
  data-size="md"
  data-state="hover">
  Danger Hover
</button>

<!-- Danger / Medium / Pressed -->
<button class="ds-button danger md pressed"
  data-component="Button"
  data-variant="danger"
  data-size="md"
  data-state="pressed">
  Danger Pressed
</button>

<!-- Danger / Medium / Disabled -->
<button class="ds-button danger md disabled"
  data-component="Button"
  data-variant="danger"
  data-size="md"
  data-state="disabled"
  disabled>
  Danger Disabled
</button>
```

- [ ] **Step 3: Commit**

```bash
git add multi-repo-html/components/button/
git commit -m "feat(html-ds): add Button component — 5 types × 3 sizes × 4 states"
```

---

## Task 7: Remaining Atomic Components (14 components)

**Files:** Create `.css` + `.html` for each of the remaining 14 atomic components.

For each component, read its `.tsx` source in `multi-repo-nextjs/app/components/` to extract:
- Exact semantic token references
- Variant axes and values
- Size dimensions
- All visual states

Follow the exact same pattern as Task 6 (Button): header comment block with platform paths, variant docs, usage examples → CSS classes with inline comments → HTML snippet with all variants rendered with `data-*` attributes.

- [ ] **Step 1: Create IconButton** — `components/icon-button/`

Read `multi-repo-nextjs/app/components/IconButton/IconButton.tsx`. IconButton has:
- Types: primary, secondary, tertiary, quarternary, success, danger (6)
- States: default, hover, pressed, disabled (4)
- Sizes: sm (32px), md (40px), lg (48px) (3)
- Renders as a square with rounded corners, icon only (no text label)
- Icon is represented as a placeholder square in the HTML snippet

CSS class: `.ds-icon-button`, variants: `.primary`, `.secondary`, etc., sizes: `.sm`, `.md`, `.lg`

- [ ] **Step 2: Create Badge** — `components/badge/`

Read `Badge.tsx`. Badge has:
- Types: brand, success, error, accent (4)
- Sizes: tiny (6px dot), sm (14px), number (14px), md (16px) (4)
- Subtle: on/off (2)
- Solid: brand bg + inverse text; Subtle: tinted bg + colored text

CSS class: `.ds-badge`, modifiers: `.brand`, `.success`, `.error`, `.accent`, `.tiny`, `.sm`, `.number`, `.md`, `.subtle`

- [ ] **Step 3: Create Label** — `components/label/`

Read `multi-repo-nextjs/app/components/Label/Label.tsx`. Label has:
- Types: secondaryAction, information, primaryAction, brandInteractive (4)
- Sizes: sm, md, lg (3)

CSS class: `.ds-label`, modifiers match type and size names.

- [ ] **Step 4: Create Chip** — `components/chip/`

Read `Chip.tsx` (already loaded). Chip has:
- Types: chipTabs, filters, segmentControl (3)
- Sizes: sm, md, lg (3)
- Active: on/off (2)
- States: default, hover, pressed, disabled

CSS class: `.ds-chip`, modifiers: `.chip-tabs`, `.filters`, `.segment-control`, `.sm`, `.md`, `.lg`, `.active`

- [ ] **Step 5: Create Tabs** — `components/tabs/`

Read `multi-repo-nextjs/app/components/Tabs/Tabs.tsx`. Tabs item has:
- Sizes: sm, md, lg (3)
- Active: on/off (2)

CSS class: `.ds-tab`, `.ds-tab-bar` (container), modifiers: `.sm`, `.md`, `.lg`, `.active`

- [ ] **Step 6: Create SegmentControlBar** — `components/segment-control-bar/`

Read `multi-repo-nextjs/app/components/SegmentControlBar/SegmentControlBar.tsx`.
- Types: segmentControl, chips, filters (3)
- Sizes: sm, md, lg (3)
- Container with rounded bg + child segments

CSS class: `.ds-segment-bar`, modifier: `.sm`, `.md`, `.lg`

- [ ] **Step 7: Create Thumbnail** — `components/thumbnail/`

Read `multi-repo-nextjs/app/components/Thumbnail/Thumbnail.tsx`.
- Sizes: xs (24px), sm (32px), md (40px), lg (48px), xl (64px), xxl (80px) (6)
- Rounded: on/off (2)
- Renders an image or placeholder with size + border-radius

CSS class: `.ds-thumbnail`, modifiers: `.xs` through `.xxl`, `.rounded`

- [ ] **Step 8: Create InputField** — `components/input-field/`

Read `InputField.tsx` (already loaded). InputField has:
- States: default, focus, filled, success, warning, error, disabled (7)
- Types: InputField (single-line) and TextField (multiline)
- Slots: leading/trailing labels, icons, separators

CSS class: `.ds-input-field`, `.ds-text-field`, state modifiers: `.focus`, `.filled`, `.success`, `.warning`, `.error`, `.disabled`. Slot elements: `.ds-input-slot`, `.ds-input-separator`.

- [ ] **Step 9: Create Toast** — `components/toast/`

Read `Toast.tsx` (already loaded). Toast has:
- Types: default, info, success, warning, error (5)
- Optional action button, optional dismiss button
- Uses inverse-primary surface (dark bg in light mode)

CSS class: `.ds-toast`, modifiers: `.info`, `.success`, `.warning`, `.error`. Child elements: `.ds-toast-icon`, `.ds-toast-content`, `.ds-toast-action`, `.ds-toast-dismiss`.

- [ ] **Step 10: Create DateGrid** — `components/date-grid/`

Read `multi-repo-nextjs/app/components/DateGrid/DateGrid.tsx`.
- DateItem: toggle on/off (2 states)
- DateGrid: 7-cell week strip

CSS class: `.ds-date-item`, `.ds-date-grid`, modifiers: `.active`

- [ ] **Step 11: Create Divider** — `components/divider/`

Read `Divider.tsx` (already loaded). Divider has:
- Types: section, row (2)
- Orientations: horizontal, vertical

CSS class: `.ds-divider`, modifiers: `.section`, `.row`, `.vertical`. Section type has a `.ds-divider-label` child for centered text.

- [ ] **Step 12: Create Checkbox** — `components/checkbox/`

Read `Checkbox.tsx` (already loaded). Checkbox has:
- States: unchecked, checked, indeterminate (3)
- Disabled: on/off (2)
- Renders a custom square with SVG checkmark/dash

CSS class: `.ds-checkbox`, modifiers: `.checked`, `.indeterminate`, `.disabled`. Contains `.ds-checkbox-box` (custom square) and `.ds-checkbox-label` (optional text).

- [ ] **Step 13: Create Switch** — `components/switch/`

Read `Switch.tsx` (already loaded). Switch has:
- States: off, on (2)
- Disabled: on/off (2)
- Track with sliding thumb

CSS class: `.ds-switch`, modifiers: `.on`, `.disabled`. Contains `.ds-switch-track` and `.ds-switch-thumb`.

- [ ] **Step 14: Create RadioButton** — `components/radio-button/`

Read `multi-repo-nextjs/app/components/RadioButton/RadioButton.tsx`.
- States: unselected, selected (2)
- Disabled: on/off (2)
- Plus RadioGroup container

CSS class: `.ds-radio`, modifiers: `.selected`, `.disabled`. Contains `.ds-radio-circle` and `.ds-radio-label`. Group: `.ds-radio-group`.

- [ ] **Step 15: Commit all components**

```bash
git add multi-repo-html/components/
git commit -m "feat(html-ds): add all 15 atomic components with full variant coverage"
```

---

## Task 8: Pattern Components (4 patterns)

**Files:** Create `.css` + `.html` for TextBlock, StepIndicator, Stepper, ListItem.

- [ ] **Step 1: Create TextBlock** — `patterns/text-block/`

Read `multi-repo-nextjs/app/components/patterns/TextBlock/TextBlock.tsx`. Typography-only pattern.
- Slots: overline, title, subtitle, body
- Each slot uses a specific type role

CSS class: `.ds-text-block`, child classes: `.ds-text-block-overline`, `.ds-text-block-title`, `.ds-text-block-subtitle`, `.ds-text-block-body`.

- [ ] **Step 2: Create StepIndicator** — `patterns/step-indicator/`

Read `multi-repo-nextjs/app/components/patterns/StepIndicator/StepIndicator.tsx`.
- States: incomplete, completed (2)
- Circle with number or checkmark

CSS class: `.ds-step-indicator`, modifiers: `.completed`

- [ ] **Step 3: Create Stepper** — `patterns/stepper/`

Read `multi-repo-nextjs/app/components/patterns/Stepper/Stepper.tsx`. Composes TextBlock + StepIndicator.
- Timeline layout with connector lines between steps

CSS class: `.ds-stepper`, child: `.ds-stepper-step`, `.ds-stepper-connector`

- [ ] **Step 4: Create ListItem** — `patterns/list-item/`

Read `multi-repo-nextjs/app/components/patterns/ListItem/ListItem.tsx`. Composes TextBlock + Thumbnail + action slots.
- Slots: leading (thumbnail/icon), content (text block), trailing (button/badge/icon)
- Optional divider at bottom

CSS class: `.ds-list-item`, child classes: `.ds-list-item-leading`, `.ds-list-item-content`, `.ds-list-item-trailing`

- [ ] **Step 5: Commit**

```bash
git add multi-repo-html/patterns/
git commit -m "feat(html-ds): add 4 pattern components (TextBlock, StepIndicator, Stepper, ListItem)"
```

---

## Task 9: Design Tool Elements

**Files:** Create `.css` + `.html` for device-frames, annotations, slide-layouts, wireframe.

- [ ] **Step 1: Create Device Frames** — `design-tools/device-frames/`

CSS classes for device chrome wrappers:
- `.ds-device-iphone` — iPhone 16 frame with Dynamic Island, rounded corners, bezel
- `.ds-device-iphone-pro-max` — larger variant
- `.ds-device-ipad` — iPad frame
- `.ds-device-browser` — Browser chrome with address bar, traffic lights

Each frame wraps a `.ds-device-screen` child that holds the mockup content. Sizes from `--device-*` tokens.

- [ ] **Step 2: Create Annotations** — `design-tools/annotations/`

CSS classes for design review elements:
- `.ds-callout` — speech-bubble callout with arrow (color variants: red, blue, green, yellow)
- `.ds-redline` — horizontal/vertical measurement line with dimension label
- `.ds-arrow` — directional arrow between elements
- `.ds-dimension` — width/height label with bracket markers

- [ ] **Step 3: Create Slide Layouts** — `design-tools/slide-layouts/`

CSS classes for presentation slides:
- `.ds-slide` — 16:9 container with padding
- `.ds-slide.title` — centered title layout
- `.ds-slide.content` — title + body text
- `.ds-slide.split` — two-column layout
- `.ds-slide.grid` — 2×2 grid layout

- [ ] **Step 4: Create Wireframe Elements** — `design-tools/wireframe/`

CSS classes for wireframe placeholders:
- `.ds-wireframe-nav` — top navigation bar placeholder
- `.ds-wireframe-tab-bar` — bottom tab bar placeholder
- `.ds-wireframe-placeholder` — generic placeholder block (image, avatar, content)
- `.ds-wireframe-text` — text line placeholders (lines of varying width)
- `.ds-wireframe-skeleton` — skeleton shimmer animation blocks

- [ ] **Step 5: Commit**

```bash
git add multi-repo-html/design-tools/
git commit -m "feat(html-ds): add design tool elements (device frames, annotations, slides, wireframe)"
```

---

## Task 10: Manifest JSON

**Files:**
- Create: `multi-repo-html/manifest.json`

- [ ] **Step 1: Create manifest.json**

Write the complete manifest with entries for all 15 atomic components, 4 patterns, and 4 design tool categories. For each component, include:
- `category`: "atomic", "pattern", or "design-tool"
- `description`: one-line description
- `platforms`: `{ web, ios, android }` file paths (relative to their repo roots)
- `html`: `{ css, snippet, tag, classPrefix }` paths relative to `multi-repo-html/`
- `variants`: enum values for each variant axis
- `dataAttributes`: list of valid `data-*` attribute names
- `composes` (patterns only): list of child component names

Read `docs/components.md` to get the exact platform file paths for each component.

The manifest must include entries for ALL components listed in docs/components.md with status "Done":

```json
{
  "version": "1.0",
  "description": "HTML Design System manifest — maps components to platform implementations, variant enums, and data attributes",
  "components": {
    "Button": {
      "category": "atomic",
      "description": "Primary action trigger with pill shape and semantic color variants",
      "platforms": {
        "web": "app/components/Button/Button.tsx",
        "ios": "Components/Button/AppButton.swift",
        "android": "ui/components/AppButton.kt"
      },
      "html": {
        "css": "components/button/button.css",
        "snippet": "components/button/button.html",
        "tag": "button",
        "classPrefix": "ds-button"
      },
      "variants": {
        "type": ["primary", "secondary", "tertiary", "success", "danger"],
        "state": ["default", "hover", "pressed", "disabled"],
        "size": ["sm", "md", "lg"]
      },
      "dataAttributes": ["data-component", "data-variant", "data-size", "data-state"]
    },
    "IconButton": { "..." : "fill in from IconButton.tsx" },
    "Badge": { "..." : "fill in from Badge.tsx" },
    "Label": { "..." : "fill in from Label.tsx" },
    "Chip": { "..." : "fill in from Chip.tsx" },
    "Tabs": { "..." : "fill in from Tabs.tsx" },
    "SegmentControlBar": { "..." : "fill in from SegmentControlBar.tsx" },
    "Thumbnail": { "..." : "fill in from Thumbnail.tsx" },
    "InputField": { "..." : "fill in from InputField.tsx" },
    "Toast": { "..." : "fill in from Toast.tsx" },
    "DateGrid": { "..." : "fill in from DateGrid.tsx" },
    "Divider": { "..." : "fill in from Divider.tsx" },
    "Checkbox": { "..." : "fill in from Checkbox.tsx" },
    "Switch": { "..." : "fill in from Switch.tsx" },
    "RadioButton": { "..." : "fill in from RadioButton.tsx" }
  },
  "patterns": {
    "TextBlock": { "..." : "fill in" },
    "StepIndicator": { "..." : "fill in" },
    "Stepper": { "..." : "fill in" },
    "ListItem": { "..." : "fill in" }
  },
  "designTools": {
    "DeviceFrame": {
      "category": "design-tool",
      "description": "Device chrome wrapper for screen mockups",
      "variants": {
        "device": ["iphone-16", "iphone-16-pro-max", "ipad-13", "browser"]
      },
      "html": {
        "css": "design-tools/device-frames/device-frames.css",
        "snippet": "design-tools/device-frames/device-frames.html",
        "tag": "div",
        "classPrefix": "ds-device"
      }
    },
    "Annotation": { "..." : "fill in" },
    "SlideLayout": { "..." : "fill in" },
    "Wireframe": { "..." : "fill in" }
  }
}
```

Note: The `"..." : "fill in"` placeholders above are instructions for the implementer — each entry MUST be filled with the complete data by reading the corresponding `.tsx` source file and `docs/components.md`. Do NOT leave any placeholder entries.

- [ ] **Step 2: Verify manifest against docs/components.md**

Read `docs/components.md` and verify every "Done" component has a manifest entry with correct platform paths.

- [ ] **Step 3: Commit**

```bash
git add multi-repo-html/manifest.json
git commit -m "feat(html-ds): add manifest.json mapping all components to platform files"
```

---

## Task 11: Reference Pages

**Files:**
- Create: `multi-repo-html/reference/index.html`
- Create: `multi-repo-html/reference/tokens.html`
- Create: `multi-repo-html/reference/design-tools.html`

- [ ] **Step 1: Create reference/index.html — Component Sheet**

A full standalone HTML page that imports `design-system.css` and renders every component with every variant. Structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Design System — Component Sheet</title>
  <link rel="stylesheet" href="../design-system.css">
  <style>
    /* --- Reference page layout (not part of the DS) --- */
    .ref-page { max-width: 1200px; margin: 0 auto; padding: var(--space-8) var(--space-6); }
    .ref-section { margin-bottom: var(--space-12); }
    .ref-section h2 { margin-bottom: var(--space-4); border-bottom: 1px solid var(--border-default); padding-bottom: var(--space-2); }
    .ref-grid { display: flex; flex-wrap: wrap; gap: var(--space-4); align-items: flex-start; }
    .ref-variant-group { margin-bottom: var(--space-6); }
    .ref-variant-group h3 { margin-bottom: var(--space-2); color: var(--typography-secondary); }
    .ref-meta { font-size: var(--typography-caption-md-size); color: var(--typography-muted); margin-top: var(--space-1); }
    /* Dark mode toggle */
    .ref-toggle { position: fixed; top: var(--space-4); right: var(--space-4); z-index: 100; }
  </style>
</head>
<body>
  <div class="ref-page">
    <h1 class="type-heading-sm">Component Sheet</h1>
    <p class="type-body-md" style="color: var(--typography-secondary); margin-bottom: var(--space-8);">
      All components with all variants. Click any component to copy its HTML snippet.
    </p>

    <!-- Table of Contents -->
    <nav class="ref-section">
      <h2 class="type-title-sm">Components</h2>
      <div class="ref-grid">
        <!-- Link to each component section -->
        <a href="#button" class="type-body-md">Button</a>
        <a href="#icon-button" class="type-body-md">IconButton</a>
        <!-- ... all components ... -->
      </div>
    </nav>

    <!-- Per-component sections -->
    <section id="button" class="ref-section">
      <h2 class="type-title-sm">Button</h2>
      <p class="ref-meta">Web: app/components/Button/Button.tsx · iOS: Components/Button/AppButton.swift · Android: ui/components/AppButton.kt</p>

      <div class="ref-variant-group">
        <h3 class="type-body-sm-em">Primary</h3>
        <div class="ref-grid">
          <!-- Include all button primary variants from button.html -->
        </div>
      </div>
      <!-- ... secondary, tertiary, success, danger groups ... -->
    </section>

    <!-- ... repeat for all 15 atomic + 4 pattern components ... -->
  </div>

  <!-- Dark mode toggle script -->
  <script>
    /* Simple dark mode toggle via class on <html> */
    const toggle = document.querySelector('.ref-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
      });
    }
  </script>
</body>
</html>
```

Include EVERY variant from EVERY component's `.html` snippet file, organized by component → variant group.

- [ ] **Step 2: Create reference/tokens.html — Token Reference**

Visual swatches page showing:
- All primitive color palettes (6 palettes × 11 shades each) as colored blocks with hex labels
- All semantic tokens grouped by category (surfaces, typography, icons, borders) with light/dark values
- Typography scale: each of the 28 roles rendered at actual size with role name
- Spacing scale: visual blocks at each size
- Radius: rounded corner previews

- [ ] **Step 3: Create reference/design-tools.html — Design Tools Showcase**

Page showing all design tool elements:
- Device frames (empty and with sample content)
- Annotation styles
- Wireframe elements
- Slide layouts

- [ ] **Step 4: Commit**

```bash
git add multi-repo-html/reference/
git commit -m "feat(html-ds): add reference pages (component sheet, tokens, design tools)"
```

---

## Task 12: Final Verification + Root Commit

- [ ] **Step 1: Open reference/index.html in browser**

```bash
open /Users/abhishekverma/Documents/GitHub/multi-repo-sample/multi-repo-html/reference/index.html
```

Visually verify:
- All components render correctly
- Colors match the app's design system
- Dark mode toggle works (if implemented via class toggle)
- All variant states display correctly

- [ ] **Step 2: Verify manifest completeness**

Read `multi-repo-html/manifest.json` and `docs/components.md`. Verify every "Done" component has:
- A manifest entry with correct platform paths
- A CSS file with all variant classes
- An HTML snippet with all variants rendered with data attributes

- [ ] **Step 3: Verify design-system.css imports**

Read `multi-repo-html/design-system.css` and verify every component/pattern/design-tool CSS file is imported.

- [ ] **Step 4: Verify file count**

```bash
find multi-repo-html -type f | wc -l
```

Expected: approximately 50+ files (6 token files + 15×2 component files + 4×2 pattern files + 4×2 design-tool files + 3 reference pages + manifest + CLAUDE.md + barrel CSS).

- [ ] **Step 5: Final commit**

```bash
git add multi-repo-html/
git commit -m "feat(html-ds): complete HTML design system — 15 components, 4 patterns, 4 design tool categories, full token coverage"
```
