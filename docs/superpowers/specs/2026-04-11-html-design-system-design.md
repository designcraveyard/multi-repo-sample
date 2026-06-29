# HTML Design System — Design Spec

**Date:** 2026-04-11
**Status:** Phase 1 — Build the design system. Plugin migration and new plugins are future phases.

---

## Goal

Create a standalone HTML/CSS design system in `multi-repo-html/` that:

1. **Mirrors the existing app design system** — same tokens, same components, same variants, rendered in plain HTML/CSS with no framework dependency.
2. **Adds a design-tools superset** — wireframe placeholders, device frames, annotations, slide layouts, and other elements only needed in design contexts.
3. **Carries semantic data attributes** — every component instance has `data-component`, `data-variant`, etc. so Claude can map HTML mockups back to the correct platform component and variant.
4. **Serves as both reference and toolkit** — reference pages showcase every token and component variant; component snippets are copy-paste-ready HTML blocks for use in wireframes, UI designs, stylescapes, and presentations.
5. **Is heavily commented** — inline comments throughout all CSS, HTML snippets, and the manifest explaining tokens, variant mappings, usage notes, and design decisions.

---

## Scope — Phase 1

Phase 1 delivers the `multi-repo-html/` directory with all files. It does NOT include:

- Migrating existing skills (`/wireframe`, `/stylescape`, `/ios-design`) to consume this DS
- Creating new plugins (UI design, presentations, style guide)
- Extending `/design-token-sync` to auto-update HTML tokens
- Build scripts or automation

These are future phases.

---

## Folder Structure

```
multi-repo-html/
│
├── design-system.css             /* Barrel — imports all files in dependency order */
├── manifest.json                 /* Component → platform mapping, variants, data attributes */
│
├── tokens/                       /* Layer 1: Design tokens */
│   ├── primitives.css            /* Raw palette: zinc, neutral, red, amber, indigo, etc. */
│   ├── semantic.css              /* Surfaces, typography, icons, borders (light + dark) */
│   ├── typography.css            /* 28 type roles as utility classes */
│   ├── spacing.css               /* 4px grid: --space-1 through --space-24 + utility classes */
│   ├── radius.css                /* Border radius tokens */
│   └── design-tools.css          /* Wireframe grays, annotations, device dims, slide tokens */
│
├── components/                   /* Layer 2: Atomic UI components */
│   ├── button/
│   │   ├── button.css            /* All variant classes with inline comments */
│   │   └── button.html           /* Snippet: every variant rendered with data-* attributes */
│   ├── icon-button/
│   ├── badge/
│   ├── label/
│   ├── chip/
│   ├── tabs/
│   ├── segment-control-bar/
│   ├── thumbnail/
│   ├── input-field/
│   ├── toast/
│   ├── date-grid/
│   ├── divider/
│   ├── checkbox/
│   ├── switch/
│   └── radio-button/
│
├── patterns/                     /* Layer 3: Multi-component compositions */
│   ├── text-block/
│   ├── list-item/
│   ├── stepper/
│   └── step-indicator/
│
├── design-tools/                 /* Layer 4: Design-context-only elements */
│   ├── device-frames/            /* iPhone, iPad, browser chrome */
│   ├── annotations/              /* Callouts, redlines, arrows */
│   ├── slide-layouts/            /* Presentation grids */
│   └── wireframe/                /* Placeholder blocks, skeleton UI */
│
├── reference/                    /* Layer 5: Documentation / showcase pages */
│   ├── index.html                /* Full component sheet: all components, all variants */
│   ├── tokens.html               /* Token reference: colors, spacing, typography swatches */
│   └── design-tools.html         /* Design tool elements showcase */
│
└── CLAUDE.md                     /* Usage guide: how Claude should consume this DS */
```

---

## Design Decisions

### Approach: Single-Layer CSS + JSON Manifest (Approach A)

- No build step. All files are hand-authored.
- `manifest.json` is manually maintained and validated against `docs/components.md`.
- Reference pages are static HTML files, not generated.

### Consumption: Hybrid linked + inlined (Approach D)

- **During development:** plugins link to `design-system.css` or cherry-pick individual component CSS files.
- **For standalone export:** plugins read the needed CSS files and inline them into a `<style>` block, producing a self-contained HTML file.

---

## Token Architecture

### Primitives (`tokens/primitives.css`)

Exact mirror of the primitive palette from `multi-repo-nextjs/app/globals.css`. Same variable names (`--color-zinc-50` through `--color-zinc-950`, etc.). Defined in `:root`. Never used directly in components.

### Semantic (`tokens/semantic.css`)

All semantic tokens from `globals.css`:

- **Surfaces:** `--surface-base-primary`, `--surface-brand`, `--surface-accent-primary`, `--surface-success-solid`, etc.
- **Typography:** `--text-primary`, `--text-secondary`, `--text-muted`, `--text-brand`, `--text-accent`, etc.
- **Icons:** `--icon-primary`, `--icon-secondary`, `--icon-muted`, etc.
- **Borders:** `--border-default`, `--border-muted`, etc.
- **Overlays:** `--overlay-*` tokens.

Light mode in `:root`, dark mode in `@media (prefers-color-scheme: dark)`.

### Typography (`tokens/typography.css`)

28 type roles as utility classes. Each class sets `font-size`, `line-height`, and `font-weight`:

```css
/* --- Title roles --- */
.type-title-lg   { font-size: 28px; line-height: 36px; font-weight: 700; }
.type-title-md   { font-size: 24px; line-height: 32px; font-weight: 700; }
.type-title-sm   { font-size: 20px; line-height: 28px; font-weight: 700; }
/* ... all 28 roles ... */
```

### Spacing (`tokens/spacing.css`)

CSS custom properties `--space-1` (4px) through `--space-24` (96px), plus utility classes for common use:

```css
.gap-1  { gap: var(--space-1); }   /* 4px */
.gap-2  { gap: var(--space-2); }   /* 8px */
.p-6    { padding: var(--space-6); } /* 24px */
/* etc. */
```

### Radius (`tokens/radius.css`)

`--radius-xs` through `--radius-full`, matching `globals.css`.

### Design Tools (`tokens/design-tools.css`)

Superset tokens not in the app:

```css
:root {
  /* --- Wireframe --- */
  --wireframe-bg: #F8F9FA;
  --wireframe-placeholder: #E2E8F0;
  --wireframe-border: #CBD5E1;
  --wireframe-text: #64748B;

  /* --- Annotations --- */
  --annotation-red: #EF4444;
  --annotation-blue: #3B82F6;
  --annotation-green: #22C55E;
  --annotation-yellow: #EAB308;

  /* --- Device frames --- */
  --device-iphone-width: 393px;
  --device-iphone-height: 852px;
  --device-ipad-width: 1024px;
  --device-ipad-height: 1366px;
  --device-browser-width: 1440px;
  --device-browser-height: 900px;

  /* --- Slides --- */
  --slide-width: 1920px;
  --slide-height: 1080px;
  --slide-padding: 80px;
}
```

---

## Component Model

### CSS Class Convention

All components use the `ds-` prefix to avoid collisions:

```
.ds-button
.ds-button.primary
.ds-button.secondary
.ds-button.disabled
.ds-badge
.ds-badge.brand
.ds-badge.small
```

Variants are applied as additional classes. States like hover/pressed use pseudo-classes or modifier classes (`.pressed`, `.disabled`).

### HTML Snippet Format

Each component's `.html` file contains every variant rendered with full data attributes and inline comments:

```html
<!-- =============================================================
     Button Component
     Platform: Web  → app/components/Button/Button.tsx
               iOS  → Components/Button/AppButton.swift
               Android → ui/components/AppButton.kt
     Variants: type (primary|secondary|tertiary|success|danger)
               state (default|hover|pressed|disabled)
               size (small|medium|large)
     ============================================================= -->

<!-- --- Type: Primary --- -->

<!-- Primary / Default / Medium -->
<button class="ds-button primary medium"
  data-component="Button"
  data-variant="primary"
  data-size="medium">
  Button Label
</button>

<!-- Primary / Hover / Medium -->
<button class="ds-button primary medium hover"
  data-component="Button"
  data-variant="primary"
  data-size="medium"
  data-state="hover">
  Button Label
</button>

<!-- Primary / Pressed / Medium -->
<button class="ds-button primary medium pressed"
  data-component="Button"
  data-variant="primary"
  data-size="medium"
  data-state="pressed">
  Button Label
</button>

<!-- Primary / Disabled / Medium -->
<button class="ds-button primary medium disabled"
  data-component="Button"
  data-variant="primary"
  data-size="medium"
  data-state="disabled"
  disabled>
  Button Label
</button>

<!-- ... repeat for all type × state × size combinations ... -->
```

### Interactive components rendered as static

Components like InputField, Checkbox, Switch, DateGrid are rendered as static visual representations. They look correct but don't have JS interactivity. CSS handles visual states (checked, focused, filled, error) via modifier classes.

---

## Manifest Schema

`manifest.json` at the root of `multi-repo-html/`:

```json
{
  "version": "1.0",
  "description": "HTML Design System manifest — maps components to platform implementations",
  "components": {
    "Button": {
      "category": "atomic",
      "description": "Primary action trigger with multiple visual types and states",
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
        "size": ["small", "medium", "large"]
      },
      "dataAttributes": ["data-component", "data-variant", "data-size", "data-state"]
    }
  },
  "patterns": {
    "ListItem": {
      "category": "pattern",
      "description": "Multi-slot list row composing TextBlock, Thumbnail, and action elements",
      "composes": ["TextBlock", "Thumbnail", "Button", "IconButton", "Badge", "Divider"],
      "platforms": {
        "web": "app/components/patterns/ListItem/ListItem.tsx",
        "ios": "Components/Patterns/AppListItem.swift",
        "android": "ui/patterns/AppListItem.kt"
      },
      "html": {
        "css": "patterns/list-item/list-item.css",
        "snippet": "patterns/list-item/list-item.html",
        "tag": "div",
        "classPrefix": "ds-list-item"
      }
    }
  },
  "designTools": {
    "DeviceFrame": {
      "category": "design-tool",
      "description": "Device chrome for wrapping screen mockups",
      "variants": {
        "device": ["iphone-16", "iphone-16-pro-max", "ipad-13", "browser"]
      },
      "html": {
        "css": "design-tools/device-frames/device-frames.css",
        "snippet": "design-tools/device-frames/device-frames.html",
        "tag": "div",
        "classPrefix": "ds-device"
      }
    }
  }
}
```

Every component in `docs/components.md` that has status "Done" gets an entry. The manifest includes all variant enums matching the Figma component spec.

---

## Data Attribute Convention

Every HTML element representing a design system component carries these attributes:

| Attribute | Required | Purpose |
|-----------|----------|---------|
| `data-component` | Yes | Registry name from `docs/components.md` (e.g., `"Button"`) |
| `data-variant` | Yes | Primary variant (e.g., `"primary"`, `"secondary"`) |
| `data-size` | When applicable | Size variant (e.g., `"small"`, `"medium"`, `"large"`) |
| `data-state` | When non-default | Visual state (e.g., `"hover"`, `"pressed"`, `"disabled"`) |
| `data-subtle` | Badge/Chip only | Boolean subtle mode |

Claude reads these attributes when consuming wireframes or UI designs to determine which platform component and variant to use. The `data-component` value is the lookup key into `manifest.json`.

---

## Reference Pages

### `reference/index.html` — Component Sheet

A single HTML page that renders every component with every variant. Structure:

1. **Table of contents** — links to each component section
2. **Per-component section:**
   - Component name, description, platform file paths
   - Variant matrix showing all combinations
   - Each variant rendered with its HTML snippet
   - Data attribute documentation
3. **Dark mode toggle** — switches the page to dark mode to preview dark variants

### `reference/tokens.html` — Token Reference

Visual swatches for all tokens:

1. **Color palettes** — primitive swatches with hex values
2. **Semantic tokens** — surface, typography, icon, border tokens with light/dark values
3. **Typography scale** — all 28 roles rendered at actual size
4. **Spacing scale** — visual blocks showing the 4px grid
5. **Radius** — rounded corner previews

### `reference/design-tools.html` — Design Tools

Showcase of design-context elements:

1. **Device frames** — iPhone, iPad, browser chrome (empty and with sample content)
2. **Annotations** — callout styles, redline overlays
3. **Wireframe elements** — placeholder blocks, skeleton UI patterns
4. **Slide layouts** — presentation grid options

---

## `CLAUDE.md` for `multi-repo-html/`

The `CLAUDE.md` file will instruct Claude on how to:

1. **Read the manifest** to discover available components and their variants
2. **Use data attributes** on every component instance in generated HTML
3. **Inline CSS** for standalone files by reading the needed token + component CSS files
4. **Map back to platform code** using the manifest's `platforms` field
5. **Follow the comment conventions** when adding new components

---

## Component Inventory (Phase 1)

All 15 "Done" atomic components + 4 patterns from `docs/components.md`:

### Atomic Components (15)

| # | Component | Variants to implement |
|---|-----------|----------------------|
| 1 | Button | type(5) × state(4) × size(3) = 60 |
| 2 | IconButton | type(6) × state(4) × size(3) = 72 |
| 3 | Badge | type(4) × size(4) × subtle(2) = 32 |
| 4 | Label | type(4) × size(3) = 12 |
| 5 | Chip | type(3) × state(4) × active(2) = 24 |
| 6 | Tabs | size(3) × active(2) = 6 |
| 7 | SegmentControlBar | type(3) × size(3) = 9 |
| 8 | Thumbnail | size(6) × rounded(2) = 12 |
| 9 | InputField | state(7) × type(2) = 14, plus slot combinations |
| 10 | Toast | type(5) × has-action(2) × has-dismiss(2) |
| 11 | DateGrid | DateItem toggle(2) + DateGrid (7-cell strip) |
| 12 | Divider | type(2) = 2 |
| 13 | Checkbox | state(3) × disabled(2) = 6 |
| 14 | Switch | state(2) × disabled(2) = 4 |
| 15 | RadioButton | state(2) × disabled(2) = 4, plus RadioGroup |

### Patterns (4)

| # | Pattern | Composes |
|---|---------|----------|
| 1 | TextBlock | Typography-only (no child components) |
| 2 | StepIndicator | completed(2) = 2 |
| 3 | Stepper | TextBlock + StepIndicator |
| 4 | ListItem | TextBlock + Thumbnail + Button + IconButton + Badge + Divider |

### Design Tools (4 categories)

| # | Category | Elements |
|---|----------|----------|
| 1 | Device Frames | iPhone 16, iPhone 16 Pro Max, iPad 13, Browser |
| 2 | Annotations | Callouts, redlines, arrows, dimension markers |
| 3 | Slide Layouts | Title slide, content slide, split slide, grid slide |
| 4 | Wireframe | Placeholder blocks, skeleton text, skeleton image, nav bar, tab bar |

---

## Comment Standards

All files must be heavily commented:

### CSS files

```css
/* =============================================================
   Button Component
   ─────────────────
   Primary action trigger. Maps to:
     Web:     app/components/Button/Button.tsx
     iOS:     Components/Button/AppButton.swift
     Android: ui/components/AppButton.kt

   Variant classes:
     .primary | .secondary | .tertiary | .success | .danger
     .small | .medium (default) | .large
     .hover | .pressed | .disabled

   Usage:
     <button class="ds-button primary">Label</button>
     <button class="ds-button secondary small disabled">Label</button>
   ============================================================= */

/* --- Type: Primary ---
   Solid brand background, inverse text.
   Maps to variant="primary" on all platforms. */
.ds-button.primary {
  background: var(--surface-brand);           /* Brand solid fill */
  color: var(--text-on-brand-primary);        /* Inverse text for contrast */
  border: none;
}

/* Hover: slightly lighter brand surface */
.ds-button.primary:hover,
.ds-button.primary.hover {
  background: var(--surface-brand-hover);     /* Brand hover state */
}
```

### HTML snippet files

```html
<!-- =============================================================
     Button Component — All Variants
     See button.css for styling details.
     See manifest.json "Button" entry for platform mappings.

     Data attributes:
       data-component="Button"     (always)
       data-variant="primary"      (type variant)
       data-size="medium"          (size variant, default: medium)
       data-state="hover"          (state, omit for default)
     ============================================================= -->
```

### manifest.json

Comments are not valid in JSON, so the `description` field on every entry serves as inline documentation.

---

## Future Phases (Out of Scope)

For reference only — not part of Phase 1:

- **Phase 2:** Extend `/design-token-sync` to update `multi-repo-html/tokens/` automatically
- **Phase 3:** Migrate `/wireframe` skill to consume `multi-repo-html/` instead of bundled CSS
- **Phase 4:** Migrate `/stylescape`, `/ios-design` to consume `multi-repo-html/`
- **Phase 5:** Create new plugins: UI Design, Presentations, Style Guide
- **Phase 6:** Add validation script to check `manifest.json` drift vs `docs/components.md`
